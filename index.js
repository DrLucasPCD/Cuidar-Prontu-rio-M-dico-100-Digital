const express = require("express");
const crypto = require("crypto");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();
const rtdb = admin.database("https://cuidarmais-7d01d-default-rtdb.firebaseio.com/");

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function buildCode() {
  const d = new Date();
  const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CUIDAR-${datePart}-${rnd}`;
}

function maskCpf(cpf) {
  const digits = String(cpf || "").replace(/\D/g, "");
  if (digits.length !== 11) return "não informado";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

function getOrigin(req) {
  const proto = req.get("x-forwarded-proto") || "https";
  return `${proto}://${req.get("host")}`;
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  return res.status(200).json({ ok: true, ts: nowIso() });
});

app.post("/documents", async (req, res) => {
  try {
    const body = req.body || {};
    const content = String(body.content || "").trim();
    if (!content) return res.status(400).json({ error: "content obrigatório" });

    const issuedAt = nowIso();
    const contentHash = sha256(content);
    const code = buildCode();
    const origin = getOrigin(req);
    const verifyUrl = `${origin}/verify.html?code=${encodeURIComponent(code)}`;

    const doc = {
      code,
      issuedAt,
      contentHash,
      content,
      doctorName: body?.meta?.doctorName || "não informado",
      doctorCrm: body?.meta?.doctorCrm || "não informado",
      patientName: body?.meta?.patientName || "não informado",
      patientCpf: body?.meta?.patientCpf || "não informado",
      patientCpfMasked: maskCpf(body?.meta?.patientCpf || ""),
      lgpdConsent: Boolean(body?.meta?.lgpdConsent),
      lgpdProtocolVersion: body?.meta?.lgpdProtocolVersion || "LGPD-v1",
      source: body?.meta?.source || "web",
      createdAt: issuedAt
    };

    await rtdb.ref(`documents/${code}`).set(doc);

    await rtdb.ref(`auditsByCode/${code}`).push({
      ts: issuedAt,
      action: "ISSUED",
      code,
      contentHash,
      sourceIp: req.ip || "unknown"
    });

    return res.status(201).json({
      code,
      issuedAt,
      contentHash,
      verifyUrl,
      qrPayload: verifyUrl
    });
  } catch (err) {
    return res.status(500).json({ error: "falha ao emitir documento", detail: String(err?.message || err) });
  }
});

app.get("/verify/:code", async (req, res) => {
  const code = decodeURIComponent(String(req.params.code || "")).trim();
  if (!code) return res.status(400).json({ valid: false, message: "Código obrigatório." });

  try {
    const snap = await rtdb.ref(`documents/${code}`).get();
    const found = snap.exists();

    await rtdb.ref(`auditsByCode/${code}`).push({
      ts: nowIso(),
      action: found ? "VERIFY_OK" : "VERIFY_FAIL",
      code,
      sourceIp: req.ip || "unknown"
    });

    if (!found) return res.status(404).json({ valid: false, message: "Código não encontrado." });

    const doc = snap.val();
    return res.status(200).json({
      valid: true,
      code: doc.code,
      issuedAt: doc.issuedAt,
      contentHash: doc.contentHash,
      doctorName: doc.doctorName,
      doctorCrm: doc.doctorCrm,
      patientName: doc.patientName,
      patientCpf: doc.patientCpf || "não informado",
      patientCpfMasked: doc.patientCpfMasked,
      lgpdConsent: Boolean(doc.lgpdConsent),
      lgpdProtocolVersion: doc.lgpdProtocolVersion || "LGPD-v1",
      preview: String(doc.content || "").split("\n").slice(0, 14).join("\n")
    });
  } catch (err) {
    return res.status(500).json({ valid: false, message: "Falha ao verificar", detail: String(err?.message || err) });
  }
});

app.get("/audit/:code", async (req, res) => {
  const code = decodeURIComponent(String(req.params.code || "")).trim();
  if (!code) return res.status(400).json({ code, audits: [] });

  try {
    const snap = await rtdb.ref(`auditsByCode/${code}`).limitToLast(50).get();
    const data = snap.val() || {};
    const audits = Object.values(data)
      .sort((a, b) => String(b.ts || "").localeCompare(String(a.ts || "")))
      .slice(0, 50);
    return res.status(200).json({ code, audits });
  } catch (err) {
    return res.status(500).json({ code, audits: [], detail: String(err?.message || err) });
  }
});

exports.api = onRequest(
  {
    region: "southamerica-east1",
    cors: true
  },
  app
);
