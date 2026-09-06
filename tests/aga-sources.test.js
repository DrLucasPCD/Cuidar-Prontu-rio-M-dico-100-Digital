const test = require("node:test");
const assert = require("node:assert/strict");
const { nextStatus, SOURCES } = require("../scripts/check-aga-sources.js");

test("mantém fontes oficiais e landing pages no catálogo", () => {
  assert.ok(SOURCES.some((source) => source.id === "caderneta-landing" && source.type === "html"));
  assert.ok(SOURCES.some((source) => source.id === "ivcf20-nota-2025"));
  assert.ok(SOURCES.some((source) => source.id === "caderneta-pdf-2026" && source.url.endsWith(".pdf")));
  assert.ok(SOURCES.some((source) => source.id === "caderneta-pdf-govbr" && source.url.includes("@@download/file")));
});

test("primeira consulta registra baseline sem alegar atualização clínica", () => {
  const result = nextStatus(undefined, { hash: "sha256:a" });
  assert.deepEqual(result, { status: "baseline_registrada", changeDetected: false, clinicalReviewPending: false });
});

test("mudança de conteúdo exige revisão clínica e não altera critérios", () => {
  const result = nextStatus({ contentHash: "sha256:a" }, { hash: "sha256:b" });
  assert.equal(result.status, "revisao_clinica_pendente");
  assert.equal(result.changeDetected, true);
  assert.equal(result.clinicalReviewPending, true);
});

test("indisponibilidade fica distinta de alteração", () => {
  const result = nextStatus({ contentHash: "sha256:a" }, { error: "HTTP 503" });
  assert.equal(result.status, "indisponivel");
  assert.equal(result.changeDetected, false);
});

test("indisponibilidade não apaga revisão clínica pendente", () => {
  const result = nextStatus({ contentHash: "sha256:a", clinicalReviewPending: true }, { error: "HTTP 503" });
  assert.equal(result.status, "revisao_clinica_pendente");
  assert.equal(result.clinicalReviewPending, true);
});


test("hash ignora navegação externa ao conteúdo principal", () => {
  const {stableHtml} = require("../scripts/check-aga-sources.js");
  assert.equal(stableHtml(Buffer.from('<nav>A</nav><main>Critério <a href="x">Fonte</a></main>')), stableHtml(Buffer.from('<nav>B</nav><main>Critério <a href="x">Fonte</a></main>')));
  assert.notEqual(stableHtml(Buffer.from('<main>Critério 1</main>')), stableHtml(Buffer.from('<main>Critério 2</main>')));
});

test("PDF que retorna HTML é indisponível, não uma nova baseline", async () => {
  const {fetchSource} = require("../scripts/check-aga-sources.js");
  await assert.rejects(fetchSource({url:"https://example.com/a.pdf", type:"pdf"}, async()=>new Response('<html>Bloqueado</html>', {status:200})), /não é um PDF/);
});

test("revisão permanece após mudança, erro e recuperação", () => {
  const changed = {...nextStatus({contentHash:"a"}, {hash:"b"}), contentHash:"b"};
  const failed = {...nextStatus(changed, {error:"HTTP 503"}), contentHash:"b"};
  assert.equal(nextStatus(failed, {hash:"b"}).clinicalReviewPending, true);
});
