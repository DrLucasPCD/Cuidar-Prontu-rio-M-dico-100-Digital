const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../cognitive-core.js");

function fullDomains(kind, score = 0) {
  return Object.fromEntries(Core.SCHEMAS[kind].domains.map((domain) => [domain.id, Math.min(score, domain.maxScore)]));
}

test("schemas descrevem todos os 30 pontos sem conteúdo protegido", () => {
  for (const kind of ["meem", "moca"]) {
    const schema = Core.SCHEMAS[kind];
    assert.equal(schema.domains.reduce((sum, domain) => sum + domain.maxScore, 0), 30);
    assert.equal(schema.scoreSlots.length, 30);
    assert.equal(schema.containsProtectedContent, false);
    assert.equal(schema.administration, "externalOfficialForm");
  }
});

test("MEEM exige todos os domínios e nunca converte ausência em zero", () => {
  const partial = Core.assessMeem({ domains: { orientationTime: 4 } });
  assert.equal(partial.status, "partial");
  assert.equal(partial.rawTotal, null);
  assert.equal(partial.domains.orientationPlace, null);
  assert.ok(partial.missingDomains.includes("orientationPlace"));
});

test("MEEM valida domínio, total e soma", () => {
  const domains = fullDomains("meem", 1);
  const expected = Object.values(domains).reduce((a, b) => a + b, 0);
  assert.equal(Core.assessMeem({ domains, total: expected }).rawTotal, expected);
  assert.ok(Core.assessMeem({ domains, total: 30 }).errors.some((error) => error.includes("difere")));
  assert.ok(Core.assessMeem({ domains: { ...domains, drawing: 2 } }).errors.length);
});

test("MoCA distingue total bruto e corrigido e impede dupla correção", () => {
  const domains = Object.fromEntries(Core.SCHEMAS.moca.domains.map((domain) => [domain.id, domain.maxScore]));
  domains.orientation = 5;
  const result = Core.assessMoca({
    domains,
    version: "Full 8.1 — formulário oficial",
    versionConfirmed: true,
    educationYears: 12,
    educationCorrectionRule: Core.MOCA_EDUCATION_RULE
  });
  assert.equal(result.rawTotal, 29);
  assert.equal(result.educationAdjustment, 1);
  assert.equal(result.correctedTotal, 30);
  assert.equal(result.correctionApplied, true);
});

test("MoCA não corrige sem versão e regra explicitamente confirmadas", () => {
  const domains = fullDomains("moca", 1);
  for (const input of [
    { domains, educationYears: 8 },
    { domains, educationYears: 8, version: "Full 8.1", versionConfirmed: true },
    { domains, educationYears: 8, educationCorrectionRule: Core.MOCA_EDUCATION_RULE }
  ]) {
    const result = Core.assessMoca(input);
    assert.equal(result.correctionApplied, false);
    assert.equal(result.correctedTotal, null);
    assert.equal(result.educationAdjustment, null);
  }
});

test("estado não aplicado não aceita pontuação silenciosamente", () => {
  const result = Core.assessMoca({ status: "notApplied", domains: { naming: 2 } });
  assert.equal(result.complete, false);
  assert.equal(result.status, "partial");
  assert.ok(result.errors.some((error) => error.includes("não aplicado")));
});

test("resumo não interpreta nem diagnostica", () => {
  const text = Core.buildCognitiveSummary({});
  assert.match(text, /não aplicado/);
  assert.match(text, /Sem classificação automática/);
});
