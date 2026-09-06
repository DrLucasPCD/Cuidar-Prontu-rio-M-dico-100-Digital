const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../cognitive-core.js");

function fullDomains(kind, score = 0) {
  return Object.fromEntries(Core.SCHEMAS[kind].domains.map((domain) => [domain.id, Math.min(score, domain.maxScore)]));
}

test("zeros são pontuações válidas e não se confundem com campos ausentes", () => {
  const result = Core.assessMeem({ domains: fullDomains("meem", 0) });
  assert.equal(result.status, "complete");
  assert.equal(result.rawTotal, 0);
  assert.deepEqual(result.missingDomains, []);
});

test("valores booleanos e arrays não são aceitos como pontuações", () => {
  const invalidValues = [true, false, [], [1]];
  for (const value of invalidValues) {
    const result = Core.assessMeem({ domains: { orientationTime: value } });
    assert.ok(result.errors.length > 0, `valor aceito indevidamente: ${JSON.stringify(value)}`);
    assert.equal(result.domains.orientationTime, null);
    assert.ok(result.missingDomains.includes("orientationTime"));
  }
});

test("strings apenas com espaços permanecem ausentes, sem virar zero", () => {
  const domainResult = Core.assessMeem({ domains: { orientationTime: "   " } });
  assert.equal(domainResult.domains.orientationTime, null);
  assert.ok(domainResult.missingDomains.includes("orientationTime"));

  const totalResult = Core.assessMeem({ domains: fullDomains("meem", 0), total: "   " });
  assert.equal(totalResult.suppliedTotal, null);
  assert.equal(totalResult.rawTotal, 0);

  const educationResult = Core.assessMoca({ domains: fullDomains("moca", 0), educationYears: "\\t" });
  assert.equal(educationResult.educationYears, null);
  assert.equal(educationResult.educationAdjustment, null);
});

test("total e escolaridade rejeitam tipos coercíveis que não são números escalares", () => {
  for (const total of [true, [], [1]]) {
    const result = Core.assessMeem({ domains: fullDomains("meem", 0), total });
    assert.ok(result.errors.some((error) => error.includes("Total informado")), `total aceito: ${JSON.stringify(total)}`);
  }
  for (const educationYears of [true, [], [8]]) {
    const result = Core.assessMoca({ domains: fullDomains("moca", 0), educationYears });
    assert.ok(result.errors.some((error) => error.includes("Escolaridade")), `escolaridade aceita: ${JSON.stringify(educationYears)}`);
  }
});

test("escolaridade inválida invalida também o escore bruto do MoCA", () => {
  const result = Core.assessMoca({ domains: fullDomains("moca", 1), educationYears: "abc" });
  assert.equal(result.complete, false);
  assert.equal(result.status, "partial");
  assert.equal(result.rawTotal, null);
  assert.equal(result.correctedTotal, null);
  assert.equal(result.correctionApplied, false);
});

test("regra de correção não é herdada silenciosamente por versões Basic ou Blind", () => {
  for (const version of ["Basic", "Blind"]) {
    const result = Core.assessMoca({
      domains: fullDomains("moca", 1),
      version,
      versionConfirmed: true,
      educationYears: 12,
      educationCorrectionRule: Core.MOCA_EDUCATION_RULE
    });
    assert.equal(result.correctionApplied, false, `correção indevida para ${version}`);
    assert.equal(result.correctedTotal, null);
  }
});
