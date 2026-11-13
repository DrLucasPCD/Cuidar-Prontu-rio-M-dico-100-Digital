(function (root) {
  "use strict";

  const AQ_AGREE = [1, 7, 8, 10];
  // ASRS v1.1 checklist, original order (6 items in A and 12 in B).
  const ASRS_THRESHOLDS = [2, 2, 2, 3, 3, 3, 3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 2];
  const DASS_DOMAINS = [
    { name: "Depressão", items: [3, 5, 10, 13, 16, 17, 21], cutoffs: [10, 14, 21, 28] },
    { name: "Ansiedade", items: [2, 4, 7, 9, 15, 19, 20], cutoffs: [8, 10, 15, 20] },
    { name: "Estresse", items: [1, 6, 8, 11, 12, 14, 18], cutoffs: [15, 19, 26, 34] }
  ];
  const DASS_LEVELS = ["normal", "leve", "moderada", "grave", "extremamente grave"];

  function validAnswer(value, max) {
    return Number.isInteger(value) && value >= 0 && value <= max;
  }

  function scoreGroup(answers, thresholds) {
    const answered = thresholds.filter((_, index) => validAnswer(answers[index], 4)).length;
    const total = thresholds.length;
    const score = answered === total
      ? thresholds.filter((threshold, index) => answers[index] >= threshold).length
      : null;
    return { answered, total, score };
  }

  function scoreAq10(answers = []) {
    const answered = Array.from({ length: 10 }, (_, index) => answers[index])
      .filter((value) => validAnswer(value, 3)).length;
    const score = answered === 10
      ? Array.from({ length: 10 }, (_, index) => (answers[index] < 2) === AQ_AGREE.includes(index + 1))
        .filter(Boolean).length
      : null;
    return { answered, total: 10, score, positive: score === null ? null : score >= 6 };
  }

  function scoreAsrs18(answers = []) {
    const partA = scoreGroup(answers.slice(0, 6), ASRS_THRESHOLDS.slice(0, 6));
    const partB = scoreGroup(answers.slice(6, 18), ASRS_THRESHOLDS.slice(6));
    return { partA, partB, positive: partA.score === null ? null : partA.score >= 4 };
  }

  function scoreDass21(answers = []) {
    const answered = Array.from({ length: 21 }, (_, index) => answers[index])
      .filter((value) => validAnswer(value, 3)).length;
    const domains = DASS_DOMAINS.map(({ name, items, cutoffs }) => {
      const values = items.map((item) => answers[item - 1]);
      const score = values.every((value) => validAnswer(value, 3))
        ? values.reduce((sum, value) => sum + value, 0) * 2
        : null;
      const level = score === null ? null : cutoffs.filter((cutoff) => score >= cutoff).length;
      return { name, score, severity: level === null ? null : DASS_LEVELS[level] };
    });
    const item21 = validAnswer(answers[20], 3) && answers[20] > 0;
    return { answered, total: 21, domains, item21 };
  }

  const api = { scoreAq10, scoreAsrs18, scoreDass21 };
  root.MentalHealthCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
