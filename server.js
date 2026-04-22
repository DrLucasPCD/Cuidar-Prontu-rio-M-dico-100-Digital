const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "verification-db.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

async function ensureDb() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    await fsp.writeFile(DB_FILE, JSON.stringify({ documents: [], audits: [] }, null, 2), "utf-8");
  }
}

async function loadDb() {
  await ensureDb();
  const raw = await fsp.readFile(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

async function saveDb(db) {
  await fsp.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

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

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) reject(new Error("payload_too_large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

async function handleApi(req, res, urlObj) {
  if (req.method === "GET" && urlObj.pathname === "/api/health") {
    return json(res, 200, { ok: true, ts: nowIso() });
  }

  if (req.method === "POST" && urlObj.pathname === "/api/documents") {
    try {
      const raw = await parseBody(req);
      const body = JSON.parse(raw || "{}");
      const content = String(body.content || "").trim();
      if (!content) return json(res, 400, { error: "content obrigatório" });

      const db = await loadDb();
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
        source: body?.meta?.source || "web"
      };

      db.documents.unshift(doc);
      db.documents = db.documents.slice(0, 3000);
      db.audits.unshift({
        ts: issuedAt,
        action: "ISSUED",
        code,
        contentHash,
        sourceIp: req.socket.remoteAddress || "unknown"
      });
      db.audits = db.audits.slice(0, 10000);
      await saveDb(db);

      return json(res, 201, {
        code,
        issuedAt,
        contentHash,
        verifyUrl,
        qrPayload: verifyUrl
      });
    } catch {
      return json(res, 500, { error: "falha ao emitir documento" });
    }
  }

  if (req.method === "GET" && urlObj.pathname.startsWith("/api/verify/")) {
    const code = decodeURIComponent(urlObj.pathname.replace("/api/verify/", "")).trim();
    const db = await loadDb();
    const doc = db.documents.find((d) => d.code === code);

    db.audits.unshift({
      ts: nowIso(),
      action: doc ? "VERIFY_OK" : "VERIFY_FAIL",
      code,
      sourceIp: req.socket.remoteAddress || "unknown"
    });
    db.audits = db.audits.slice(0, 10000);
    await saveDb(db);

    if (!doc) return json(res, 404, { valid: false, message: "Código não encontrado." });
    return json(res, 200, {
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
      preview: doc.content.split("\n").slice(0, 14).join("\n")
    });
  }

  if (req.method === "GET" && urlObj.pathname.startsWith("/api/audit/")) {
    const code = decodeURIComponent(urlObj.pathname.replace("/api/audit/", "")).trim();
    const db = await loadDb();
    const audits = db.audits.filter((a) => a.code === code).slice(0, 50);
    return json(res, 200, { code, audits });
  }

  return json(res, 404, { error: "rota não encontrada" });
}

function safePathname(pathname) {
  const decoded = decodeURIComponent(pathname);
  const clean = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return clean === "/" ? "/index.html" : clean;
}

async function handleStatic(req, res, urlObj) {
  const pathname = safePathname(urlObj.pathname);
  const fullPath = path.join(ROOT, pathname);
  if (!fullPath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("forbidden");
  }

  try {
    const stat = await fsp.stat(fullPath);
    const filePath = stat.isDirectory() ? path.join(fullPath, "index.html") : fullPath;
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    const data = await fsp.readFile(filePath);
    res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, "http://localhost");
  if (urlObj.pathname.startsWith("/api/")) return handleApi(req, res, urlObj);
  return handleStatic(req, res, urlObj);
});

ensureDb()
  .then(() => {
    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Cuidar+ rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  });
