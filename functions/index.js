const express = require("express");
const { onRequest } = require("firebase-functions/v2/https");
const { resolveCep } = require("./territory");

function nowIso() {
  return new Date().toISOString();
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  return res.status(200).json({ ok: true, ts: nowIso() });
});

app.get("/territory/cep/:cep", async (req, res) => {
  const result = await resolveCep(req.params.cep);
  return res.status(result.status).json(result.ok ? result.data : { error: result.error });
});

app.post("/documents", async (req, res) => {
  return res.status(410).json({
    error: "Funcionalidade desativada no modo educativo.",
    detail: "Esta aplicação não persiste dados de atendimento."
  });
});

app.get("/verify/:code", async (req, res) => {
  return res.status(410).json({
    valid: false,
    message: "Validação indisponível no modo educativo sem persistência."
  });
});

app.get("/audit/:code", async (req, res) => {
  return res.status(410).json({
    audits: [],
    message: "Auditoria indisponível no modo educativo sem persistência."
  });
});

exports.api = onRequest(
  {
    region: "southamerica-east1",
    cors: true
  },
  app
);
