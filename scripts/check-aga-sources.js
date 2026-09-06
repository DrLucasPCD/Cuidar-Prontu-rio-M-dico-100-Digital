#!/usr/bin/env node

/**
 * Checks official Ministry of Health material used by the AGA study tab.
 * A changed hash is an evidence signal only: it never changes clinical rules.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const STATUS_PATH = path.join(ROOT, "data", "aga-source-status.json");
const TIMEOUT_MS = 30_000;

const SOURCES = [
  { id: "caderneta-landing", title: "Caderneta Brasileira da Pessoa Idosa (página oficial)", url: "https://www.gov.br/saude/pt-br/composicao/saps/publicacoes/cadernetas-e-cartoes/caderneta-brasileira-da-pessoa-idosa/view", type: "html", scope: "edição vigente e futuras publicações" },
  { id: "caderneta-pdf-2026", title: "Caderneta Brasileira da Pessoa Idosa (PDF BVS/MS)", url: "https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_brasileira_pessoa_idosaimp.pdf", type: "pdf", scope: "instrumento/campos da avaliação multidimensional" },
  { id: "caderneta-pdf-govbr", title: "Caderneta Brasileira da Pessoa Idosa (anexo gov.br)", url: "https://www.gov.br/saude/pt-br/composicao/saps/publicacoes/cadernetas-e-cartoes/caderneta-brasileira-da-pessoa-idosa/@@download/file", type: "pdf", scope: "instrumento/campos da avaliação multidimensional; arquivo ligado à landing vigente" },
  { id: "aga-acoes-ms", title: "Ações para a pessoa idosa (MS)", url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/acoes/acoes-para-a-pessoa-idosa", type: "html", scope: "avaliação multidimensional e plano de cuidados" },
  { id: "ivcf20-nota-2025", title: "Nota Informativa nº 2/2025 COPID/DGCI/SAPS/MS", url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/notas-tecnicas-e-informativas/nota-informativa-no-2-2025-copid-dgci-saps-ms", type: "html", scope: "registro do IVCF-20 no PEC e-SUS APS" },
  { id: "ivcf20-esus", title: "e-SUS APS versão 5.3 (IVCF-20)", url: "https://sisaps.saude.gov.br/sistemas/esusaps/docs/versoes/versao_5_3/", type: "html", scope: "documentação operacional do IVCF-20" },
  { id: "notas-idoso-ms", title: "Notas técnicas e informativas de Saúde da Pessoa Idosa (MS)", url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/notas-tecnicas-e-informativas", type: "html", scope: "índice para descobrir novas notas e critérios" },
  { id: "guia-reabilitacao-bvs", title: "Guia de atenção à reabilitação da pessoa idosa (BVS/MS)", url: "https://bvsms.saude.gov.br/bvs/publicacoes/guia_atencao_reabilitacao_pessoa_idosa.pdf", type: "pdf", scope: "instrumentos de avaliação multidimensional" }
];

function hash(body) { return `sha256:${crypto.createHash("sha256").update(body).digest("hex")}`; }

function stableHtml(body) {
  const html = body.toString("utf8");
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html;
  return main
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchSource(source, fetchImpl = globalThis.fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(source.url, { signal: controller.signal, redirect: "follow", headers: { "user-agent": "Cuidar+ AGA source monitor/1.0" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new Error("resposta vazia");
    if (source.type === "pdf" && bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("resposta não é um PDF (assinatura %PDF ausente)");
    const digestInput = source.type === "html" && !(response.headers.get("content-type") || "").includes("pdf") ? Buffer.from(stableHtml(bytes), "utf8") : bytes;
    return { hash: hash(digestInput), fetchedAt: new Date().toISOString(), httpStatus: response.status, contentType: response.headers.get("content-type") || null, bytes: bytes.length, finalUrl: response.url || source.url };
  } finally { clearTimeout(timer); }
}

function nextStatus(previous, observation) {
  if (observation.error) return { status: previous?.clinicalReviewPending ? "revisao_clinica_pendente" : "indisponivel", changeDetected: false, clinicalReviewPending: Boolean(previous?.clinicalReviewPending), error: observation.error };
  if (!previous || !previous.contentHash) return { status: "baseline_registrada", changeDetected: false, clinicalReviewPending: false };
  if (previous.contentHash !== observation.hash) return { status: "revisao_clinica_pendente", changeDetected: true, clinicalReviewPending: true };
  // A previous review remains visible until a human closes it in the status file.
  if (previous.clinicalReviewPending) return { status: "revisao_clinica_pendente", changeDetected: false, clinicalReviewPending: true };
  return { status: "inalterado", changeDetected: false, clinicalReviewPending: false };
}

async function run({ statusPath = STATUS_PATH, fetchImpl = globalThis.fetch, now = () => new Date().toISOString() } = {}) {
  const old = fs.existsSync(statusPath) ? JSON.parse(fs.readFileSync(statusPath, "utf8")) : { schemaVersion: 1, sources: {} };
  const sources = {};
  for (const source of SOURCES) {
    let observation;
    try { observation = await fetchSource(source, fetchImpl); }
    catch (error) { observation = { error: error.name === "AbortError" ? "tempo limite excedido" : error.message }; }
    const previous = old.sources && old.sources[source.id];
    const transition = nextStatus(previous, observation);
    sources[source.id] = {
      id: source.id, title: source.title, url: source.url, type: source.type, scope: source.scope,
      status: transition.status, changeDetected: transition.changeDetected, clinicalReviewPending: transition.clinicalReviewPending,
      contentHash: observation.hash || previous?.contentHash || null, lastCheckedAt: now(), lastChangedAt: transition.changeDetected ? now() : (previous?.lastChangedAt || null),
      httpStatus: observation.httpStatus || null, contentType: observation.contentType || null, bytes: observation.bytes || null, finalUrl: observation.finalUrl || null,
      error: transition.error || null,
      interpretation: "Hash registra mudança no arquivo/resposta; não comprova que critérios clínicos foram atualizados. Revisão humana nas fontes oficiais é obrigatória."
    };
  }
  const output = { schemaVersion: 1, generatedBy: "scripts/check-aga-sources.js", checkedAt: now(), sources };
  fs.mkdirSync(path.dirname(statusPath), { recursive: true });
  fs.writeFileSync(statusPath, `${JSON.stringify(output, null, 2)}\n`);
  return output;
}

if (require.main === module) {
  run().then((result) => {
    const values = Object.values(result.sources);
    console.log(values.map((source) => `${source.id}: ${source.status}`).join("\n"));
    if (values.some((source) => source.status === "revisao_clinica_pendente")) console.log("Alteração detectada: revisão clínica humana pendente; cortes não foram alterados.");
  }).catch((error) => { console.error(error); process.exitCode = 1; });
}

module.exports = { stableHtml, SOURCES, fetchSource, nextStatus, run };
