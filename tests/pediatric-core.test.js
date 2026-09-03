const test = require("node:test");
const assert = require("node:assert/strict");

require("../data/who-growth-data.js");
const Core = require("../pediatric-core.js");

test("corrige a idade de prematuro até dois anos", () => {
  const age = Core.ageDetails("2026-01-01", "2026-07-01", 32);
  assert.equal(age.chronologicalDays, 181);
  assert.equal(age.correctionDays, 56);
  assert.equal(age.correctedDays, 125);
});

test("não corrige idade após dois anos", () => {
  const age = Core.ageDetails("2023-01-01", "2026-01-02", 32);
  assert.equal(age.correctionDays, 0);
});

test("reproduz o exemplo LMS de peso por idade", () => {
  const z = Core.computeZ(9.7, -0.1600954, 9.476500305, 0.11218624, false);
  assert.equal(z, 0.21);
});

test("calcula os cinco indicadores OMS em lactente", () => {
  const result = Core.evaluateAnthropometry({
    dob: "2025-03-03", visitDate: "2026-09-03", sex: "masculino",
    gestationalWeeks: 39, weight: 11.2, height: 82.5,
    heightMethod: "comprimento", head: 47.5
  });
  assert.equal(result.results.length, 5);
  assert.deepEqual(result.results.map((item) => item.shortName), ["P/I", "E/I", "IMC/I", "PC/I", "P/E"]);
  assert.ok(result.results.every((item) => Number.isFinite(item.z)));
});

test("usa a referência OMS 2007 entre 5 e 19 anos", () => {
  const result = Core.evaluateAnthropometry({
    dob: "2016-09-03", visitDate: "2026-09-03", sex: "feminino",
    gestationalWeeks: 40, weight: 32, height: 138,
    heightMethod: "estatura", head: ""
  });
  assert.deepEqual(result.results.map((item) => item.shortName), ["E/I", "IMC/I", "P/I"]);
  assert.ok(result.results.every((item) => Number.isFinite(item.z)));
});

test("converte estatura em pé para comprimento antes de dois anos", () => {
  const result = Core.evaluateAnthropometry({
    dob: "2026-01-01", visitDate: "2026-07-01", sex: "feminino",
    gestationalWeeks: 40, weight: 7, height: 65, heightMethod: "estatura", head: 42
  });
  assert.equal(result.adjustedHeight, 65.7);
  assert.match(result.techniqueNote, /\+0,7 cm/);
});

test("calcula velocidade e sinaliza intervalo inferior a três meses", () => {
  const annual = Core.growthVelocity("2026-01-01", "2025-01-01", 104, 100);
  assert.ok(Math.abs(annual.perYear - 4) < 0.02);
  assert.equal(annual.adequateInterval, true);
  const short = Core.growthVelocity("2026-03-01", "2026-01-01", 101, 100);
  assert.equal(short.adequateInterval, false);
});

test("pontua M-CHAT-R com itens reversos 2, 5 e 12", () => {
  const healthy = {};
  for (let item = 1; item <= 20; item += 1) healthy[item] = [2, 5, 12].includes(item) ? "nao" : "sim";
  assert.equal(Core.mchatScore(healthy, {}).score, 0);

  healthy[1] = "nao";
  healthy[3] = "nao";
  healthy[5] = "sim";
  const moderate = Core.mchatScore(healthy, {});
  assert.equal(moderate.score, 3);
  assert.equal(moderate.level, "moderado");

  const followed = Core.mchatScore(healthy, { 1: "falha", 3: "falha", 5: "passa" });
  assert.equal(followed.level, "positivo após seguimento");
  assert.equal(followed.followFailed, 2);

  for (let item = 1; item <= 8; item += 1) healthy[item] = [2, 5].includes(item) ? "sim" : "nao";
  assert.equal(Core.mchatScore(healthy, {}).level, "alto");
});

test("agenda o próximo acompanhamento de rotina", () => {
  assert.equal(Core.nextVisit(18 * 30.4375), "24 meses");
  assert.match(Core.nextVisit(48 * 30.4375), /consulta anual/);
});
