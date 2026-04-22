const http = require("http");
const fsp = require("fs/promises");
const path = require("path");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ROOT = process.cwd();

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

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function nowIso() {
  return new Date().toISOString();
}

async function handleApi(req, res, urlObj) {
  if (req.method === "GET" && urlObj.pathname === "/api/health") {
    return json(res, 200, { ok: true, ts: nowIso() });
  }

  if (req.method === "POST" && urlObj.pathname === "/api/documents") {
    return json(res, 410, {
      error: "Funcionalidade desativada no modo educativo.",
      detail: "Esta aplicação não persiste dados de atendimento."
    });
  }

  if (req.method === "GET" && urlObj.pathname.startsWith("/api/verify/")) {
    return json(res, 410, {
      valid: false,
      message: "Validação indisponível no modo educativo sem persistência."
    });
  }

  if (req.method === "GET" && urlObj.pathname.startsWith("/api/audit/")) {
    return json(res, 410, {
      audits: [],
      message: "Auditoria indisponível no modo educativo sem persistência."
    });
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

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cuidar+ rodando em http://localhost:${PORT}`);
});
