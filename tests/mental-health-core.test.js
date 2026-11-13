const test = require("node:test");
const assert = require("node:assert/strict");
const { scoreAq10, scoreAsrs18, scoreDass21 } = require("../mental-health-core.js");

test("AQ-10 usa o gabarito oficial e inclui 6 no corte", () => {
  const negative = [2, 1, 1, 1, 1, 1, 2, 2, 1, 2];
  assert.equal(scoreAq10(negative).score, 0);
  for (let index = 0; index < negative.length; index++) {
    const answers = [...negative];
    answers[index] = answers[index] < 2 ? 3 : 0;
    assert.equal(scoreAq10(answers).score, 1, `Item ${index + 1}`);
  }
  const six = [0, 2, 2, 2, 2, 1, 0, 2, 1, 2];
  assert.equal(scoreAq10(six).score, 6);
  assert.equal(scoreAq10(six).positive, true);
  six[4] = 1;
  assert.equal(scoreAq10(six).positive, false);
  delete six[4];
  assert.equal(scoreAq10(six).positive, null);
});

test("ASRS-18 usa as faixas sombreadas de cada item e o corte só na parte A", () => {
  const answers = [2, 2, 2, 3, 3, 3, 3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 2];
  assert.equal(scoreAsrs18(answers).partA.score, 6);
  assert.equal(scoreAsrs18(answers).partB.score, 12);
  const below = answers.map((value) => value - 1);
  assert.equal(scoreAsrs18(below).partA.score, 0);
  assert.equal(scoreAsrs18(below).partB.score, 0);

  const four = [2, 2, 2, 3, 2, 2];
  assert.equal(scoreAsrs18(four).positive, true);
  assert.equal(scoreAsrs18(four).partB.score, null);
  four[3] = 2;
  assert.equal(scoreAsrs18([...four, ...answers.slice(6)]).positive, false);
  four[0] = null;
  assert.equal(scoreAsrs18(four).positive, null);
});

test("DASS-21 pontua cada item em um só domínio e usa a soma dobrada", () => {
  const names = ["Depressão", "Ansiedade", "Estresse"];
  const expectedDomains = [2, 1, 0, 1, 0, 2, 1, 2, 1, 0, 2, 2, 0, 2, 1, 0, 0, 2, 1, 1, 0];
  expectedDomains.forEach((expectedDomain, index) => {
    const values = Array(21).fill(0);
    values[index] = 3;
    const result = scoreDass21(values);
    assert.deepEqual(result.domains.map(({ name }) => name), names);
    assert.deepEqual(result.domains.map(({ score }) => score), names.map((_, domain) => domain === expectedDomain ? 6 : 0));
    assert.equal(result.item21, index === 20);
  });
});

test("DASS-21 preserva ausência, zero e os limites de cada faixa", () => {
  const domains = [
    { items: [3, 5, 10, 13, 16, 17, 21], firstScores: [0, 10, 14, 22, 28] },
    { items: [2, 4, 7, 9, 15, 19, 20], firstScores: [0, 8, 10, 16, 20] },
    { items: [1, 6, 8, 11, 12, 14, 18], firstScores: [0, 16, 20, 26, 34] }
  ];
  const severity = ["normal", "leve", "moderada", "grave", "extremamente grave"];

  function answersFor(items, sum) {
    const answers = [];
    for (const [index, item] of items.entries()) {
      answers[item - 1] = Math.max(0, Math.min(3, sum - index * 3));
    }
    return answers;
  }

  domains.forEach(({ items, firstScores }, domain) => {
    firstScores.forEach((score, level) => {
      const result = scoreDass21(answersFor(items, score / 2));
      assert.equal(result.answered, 7);
      assert.equal(result.domains[domain].score, score);
      assert.equal(result.domains[domain].severity, severity[level]);
      assert.equal(result.domains[(domain + 1) % 3].score, null);
      if (level > 0) {
        const below = scoreDass21(answersFor(items, score / 2 - 1));
        assert.equal(below.domains[domain].severity, severity[level - 1]);
      }
    });
  });

  const partial = [];
  partial[20] = 1;
  const result = scoreDass21(partial);
  assert.equal(result.item21, true);
  assert.equal(result.domains[0].score, null);
  assert.deepEqual(scoreDass21(Array(21).fill(3)).domains.map(({ score }) => score), [42, 42, 42]);
});
