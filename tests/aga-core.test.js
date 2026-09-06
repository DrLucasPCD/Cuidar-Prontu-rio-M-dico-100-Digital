const test = require("node:test");
const assert = require("node:assert/strict");
const AgaCore = require("../aga-core.js");

test("Katz preserva não respondido e não produz escore parcial", () => {
  const result = AgaCore.scoreKatz({ bathing: "independent" });
  assert.equal(result.complete, false);
  assert.equal(result.score, null);
  assert.equal(result.answered, 1);
  assert.ok(result.missing.includes("feeding"));
});

test("Katz conta atividades independentes", () => {
  const result = AgaCore.scoreKatz({ bathing: "assistance", dressing: "independent", toileting: "independent", transferring: "independent", continence: "dependent", feeding: "independent" });
  assert.equal(result.score, 4);
  assert.deepEqual(result.dependentItems, ["bathing", "continence"]);
  assert.equal(result.classification, undefined);
});

test("Lawton aceita oito itens em escala 1 a 3 e exige completude", () => {
  const independent = Object.fromEntries(AgaCore.CRITERIA.lawtonItems.map((key) => [key, 3]));
  assert.equal(AgaCore.scoreLawton(independent).score, 24);
  assert.equal(AgaCore.scoreLawton(independent).classification, undefined);
  delete independent.finances;
  assert.equal(AgaCore.scoreLawton(independent).score, null);
});

test("GDS-15 aplica direção correta sem corte não confirmado", () => {
  const healthy = Object.fromEntries(Array.from({ length: 15 }, (_, i) => [String(i + 1), AgaCore.CRITERIA.gds15DepressiveYes.includes(i + 1) ? "nao" : "sim"]));
  assert.equal(AgaCore.scoreGds15(healthy).score, 0);
  for (const item of [2, 3, 4, 6, 8]) healthy[item] = "sim";
  const positive = AgaCore.scoreGds15(healthy);
  assert.equal(positive.score, 5);
  assert.equal(positive.screenPositive, null);
});

test("TUG preserva ausência e rejeita tempo inválido sem classificar risco", () => {
  assert.equal(AgaCore.assessTimedUpAndGo("").highRisk, null);
  assert.equal(AgaCore.assessTimedUpAndGo(-1).complete, false);
  assert.equal(AgaCore.assessTimedUpAndGo(19.9).highRisk, null);
  assert.equal(AgaCore.assessTimedUpAndGo(20).highRisk, null);
});

test("medicamentos identifica polifarmácia somente a partir de cinco itens", () => {
  assert.equal(AgaCore.assessMedications({ items: ["a", "b", "c", "d"] }).polypharmacy, false);
  assert.equal(AgaCore.assessMedications({ items: ["a", "b", "c", "d", "e"] }).polypharmacy, true);
});

test("avaliação integra domínios sem transformar respostas ausentes em achados", () => {
  const result = AgaCore.evaluate({ social: { supportAvailable: false }, mobility: { fallsLast12Months: 1 }, nutrition: {} });
  assert.equal(result.abvd.score, null);
  assert.equal(result.mood.screenPositive, null);
  assert.ok(result.flags.includes("atenção à rede de apoio"));
  assert.ok(result.flags.includes("risco ou histórico de quedas"));
  assert.equal(result.medications.count, null);
});


test("IVCF-20 informado valida limites e faixas MS 2026", () => {
  for (const [score, expected] of [[0,"baixo risco"],[6,"baixo risco"],[7,"risco moderado"],[14,"risco moderado"],[15,"alto risco"],[40,"alto risco"]]) assert.equal(AgaCore.assessIvcf20(score).classification, expected);
  for (const value of [null, "", undefined, -1, 41, 1.5, "abc"]) assert.equal(AgaCore.assessIvcf20(value).complete, false);
});

test("achados parciais não somem e resumo preserva plano e medidas", () => {
  const result = AgaCore.evaluate({abvd:{bathing:"dependent"}, aivd:{finances:1}, cognition:{meemScore:22}, nutrition:{bmi:24}, medications:{items:["medicamento exemplo"]}, notes:"Reavaliar em 30 dias", ivcf20Score:15});
  assert.ok(result.flags.includes("dependência em ABVD"));
  assert.ok(result.flags.includes("dependência em AIVD"));
  assert.equal(result.abvd.score, null);
  const summary = AgaCore.buildSummary(result);
  for (const text of ["Reavaliar em 30 dias", "MEEM 22", "IMC 24", "medicamento exemplo", "15/40"]) assert.ok(summary.includes(text), text);
  assert.ok(!summary.includes("undefined"));
});
