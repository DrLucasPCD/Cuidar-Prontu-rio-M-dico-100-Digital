(function (root) {
  "use strict";

  const DAY_MS = 86400000;
  const DAYS_PER_MONTH = 30.4375;
  const cache = new Map();

  function parseDate(value) {
    if (!value) return null;
    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function daysBetween(start, end) {
    const a = parseDate(start);
    const b = parseDate(end);
    if (!a || !b) return null;
    return Math.floor((b.getTime() - a.getTime()) / DAY_MS);
  }

  function ageDetails(dob, visitDate, gestationalWeeks) {
    const chronologicalDays = daysBetween(dob, visitDate);
    if (chronologicalDays === null || chronologicalDays < 0) return null;
    const weeks = Number(gestationalWeeks);
    const correctionDays = Number.isFinite(weeks) && weeks > 0 && weeks < 37 && chronologicalDays <= 730
      ? Math.max(0, (40 - weeks) * 7)
      : 0;
    const correctedDays = Math.max(0, chronologicalDays - correctionDays);
    return {
      chronologicalDays,
      chronologicalMonths: chronologicalDays / DAYS_PER_MONTH,
      correctedDays,
      correctedMonths: correctedDays / DAYS_PER_MONTH,
      correctionDays
    };
  }

  function formatAge(days) {
    if (!Number.isFinite(days) || days < 0) return "idade inválida";
    if (days < 60) return `${days} dia${days === 1 ? "" : "s"}`;
    const months = Math.floor(days / DAYS_PER_MONTH);
    if (months < 24) return `${months} ${months === 1 ? "mês" : "meses"}`;
    const years = Math.floor(months / 12);
    const remaining = months % 12;
    return `${years} ${years === 1 ? "ano" : "anos"}${remaining ? ` e ${remaining} ${remaining === 1 ? "mês" : "meses"}` : ""}`;
  }

  function datasetMap(name) {
    if (cache.has(name)) return cache.get(name);
    const rows = root.WHO_GROWTH_DATA?.[name] || [];
    const map = new Map(rows.map((row) => [`${row[0]}|${row[1]}`, row]));
    cache.set(name, map);
    return map;
  }

  function lmsRow(name, sex, axis) {
    return datasetMap(name).get(`${sex}|${axis}`) || null;
  }

  function interpolatedLms(name, sex, axis) {
    const low = Math.floor(axis);
    const high = Math.ceil(axis);
    const rowLow = lmsRow(name, sex, low);
    const rowHigh = lmsRow(name, sex, high);
    if (!rowLow) return null;
    if (!rowHigh || high === low) return rowLow.slice(2);
    const fraction = axis - low;
    return [2, 3, 4].map((index) => rowLow[index] + fraction * (rowHigh[index] - rowLow[index]));
  }

  function computeZ(value, l, m, s, adjusted) {
    if (![value, l, m, s].every(Number.isFinite) || value <= 0 || m <= 0 || s <= 0) return null;
    let z = l === 0 ? Math.log(value / m) / s : (Math.pow(value / m, l) - 1) / (s * l);
    if (adjusted && Math.abs(z) > 3) {
      const calc = (sd) => l === 0 ? m * Math.exp(s * sd) : m * Math.pow(1 + l * s * sd, 1 / l);
      if (z > 3) z = 3 + (value - calc(3)) / (calc(3) - calc(2));
      if (z < -3) z = -3 + (value - calc(-3)) / (calc(-2) - calc(-3));
    }
    return Math.round(z * 100) / 100;
  }

  function erf(value) {
    const sign = value < 0 ? -1 : 1;
    const x = Math.abs(value);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  }

  function percentile(z) {
    if (!Number.isFinite(z)) return null;
    const p = 50 * (1 + erf(z / Math.sqrt(2)));
    if (p < 0.1) return "<0,1";
    if (p > 99.9) return ">99,9";
    return p.toFixed(p < 1 || p > 99 ? 1 : 0).replace(".", ",");
  }

  function classification(kind, z) {
    if (!Number.isFinite(z)) return "não calculado";
    if (kind === "bmi" || kind === "wlh") {
      if (z < -3) return "magreza acentuada";
      if (z < -2) return "magreza";
      if (z <= 1) return "eutrofia";
      if (z <= 2) return "risco de sobrepeso";
      if (z <= 3) return "sobrepeso";
      return "obesidade";
    }
    if (kind === "height") {
      if (z < -3) return "muito baixa estatura";
      if (z < -2) return "baixa estatura";
      if (z <= 2) return "estatura adequada";
      return "estatura elevada";
    }
    if (kind === "head") {
      if (z < -2) return "abaixo do esperado";
      if (z > 2) return "acima do esperado";
      return "faixa esperada";
    }
    if (z < -3) return "peso muito baixo";
    if (z < -2) return "peso baixo";
    if (z <= 2) return "peso adequado";
    return "peso elevado";
  }

  function result(name, shortName, kind, value, lms, adjusted) {
    if (!lms) return null;
    const z = computeZ(value, lms[0], lms[1], lms[2], adjusted);
    if (!Number.isFinite(z)) return null;
    return { name, shortName, kind, value, z, percentile: percentile(z), classification: classification(kind, z) };
  }

  function evaluateAnthropometry(input) {
    const age = ageDetails(input.dob, input.visitDate, input.gestationalWeeks);
    const sex = input.sex === "masculino" ? 1 : input.sex === "feminino" ? 2 : null;
    if (!age || !sex) return { age, results: [], errors: ["Informe data de nascimento, data da consulta e sexo de referência válidos."] };
    const weight = Number(input.weight);
    const heightRaw = Number(input.height);
    const head = Number(input.head);
    const method = input.heightMethod || (age.correctedDays < 731 ? "comprimento" : "estatura");
    let height = heightRaw;
    let techniqueNote = "";
    if (Number.isFinite(heightRaw) && age.correctedDays < 731 && method === "estatura") {
      height += 0.7;
      techniqueNote = "Estatura em pé convertida para comprimento (+0,7 cm).";
    } else if (Number.isFinite(heightRaw) && age.correctedDays >= 731 && method === "comprimento") {
      height -= 0.7;
      techniqueNote = "Comprimento deitado convertido para estatura (-0,7 cm).";
    }
    const bmi = Number.isFinite(weight) && Number.isFinite(height) && height > 0 ? weight / Math.pow(height / 100, 2) : null;
    const results = [];
    const errors = [];

    if (age.correctedDays < 1857) {
      const day = Math.round(age.correctedDays);
      if (Number.isFinite(weight) && weight > 0) results.push(result("Peso por idade", "P/I", "weight", weight, lmsRow("wfa05", sex, day)?.slice(2), true));
      if (Number.isFinite(height) && height > 0) results.push(result("Comprimento/estatura por idade", "E/I", "height", height, lmsRow("lfa05", sex, day)?.slice(2), false));
      if (Number.isFinite(bmi) && bmi > 0) results.push(result("IMC por idade", "IMC/I", "bmi", bmi, lmsRow("bfa05", sex, day)?.slice(2), true));
      if (Number.isFinite(head) && head > 0 && age.correctedDays <= 730) results.push(result("Perímetro cefálico por idade", "PC/I", "head", head, lmsRow("hca05", sex, day)?.slice(2), false));
      if (Number.isFinite(weight) && weight > 0 && Number.isFinite(height) && height > 0) {
        const axis = Math.round(height * 10) / 10;
        const table = age.correctedDays < 731 ? "wfl05" : "wfh05";
        const label = age.correctedDays < 731 ? "Peso por comprimento" : "Peso por estatura";
        results.push(result(label, "P/E", "wlh", weight, lmsRow(table, sex, axis)?.slice(2), true));
      }
    } else {
      const months = age.chronologicalDays / DAYS_PER_MONTH;
      if (months < 229) {
        if (Number.isFinite(height) && height > 0) results.push(result("Estatura por idade", "E/I", "height", height, interpolatedLms("hfa519", sex, months), false));
        if (Number.isFinite(bmi) && bmi > 0) results.push(result("IMC por idade", "IMC/I", "bmi", bmi, interpolatedLms("bfa519", sex, months), true));
        if (months < 121 && Number.isFinite(weight) && weight > 0) results.push(result("Peso por idade", "P/I", "weight", weight, interpolatedLms("wfa519", sex, months), true));
      } else {
        errors.push("As referências OMS incluídas terminam aos 19 anos.");
      }
    }
    return { age, results: results.filter(Boolean), bmi, adjustedHeight: height, techniqueNote, errors };
  }

  function growthVelocity(currentDate, previousDate, currentValue, previousValue) {
    const days = daysBetween(previousDate, currentDate);
    const current = Number(currentValue);
    const previous = Number(previousValue);
    if (!Number.isFinite(days) || days <= 0 || !Number.isFinite(current) || !Number.isFinite(previous)) return null;
    return { days, perYear: (current - previous) * 365.25 / days, adequateInterval: days >= 90 };
  }

  function mchatScore(answers, followUp) {
    const reverseRisk = new Set([2, 5, 12]);
    const failedItems = [];
    for (let index = 1; index <= 20; index += 1) {
      const answer = answers[index];
      if (answer !== "sim" && answer !== "nao") continue;
      const failed = reverseRisk.has(index) ? answer === "sim" : answer === "nao";
      if (failed) failedItems.push(index);
    }
    const complete = Object.keys(answers).filter((key) => answers[key] === "sim" || answers[key] === "nao").length === 20;
    if (!complete) return { complete, score: null, failedItems, level: "incompleto", action: "Responda aos 20 itens." };
    const score = failedItems.length;
    let level = score <= 2 ? "baixo" : score <= 7 ? "moderado" : "alto";
    let action = score <= 2 ? "Manter vigilância; se menor de 24 meses, repetir aos 24 meses." : score <= 7 ? "Aplicar a Entrevista de Seguimento aos itens com falha." : "Encaminhar para avaliação diagnóstica e avaliação da necessidade de intervenção.";
    const followFailed = failedItems.filter((item) => followUp?.[item] === "falha").length;
    const followComplete = score >= 3 && score <= 7 && failedItems.every((item) => ["passa", "falha"].includes(followUp?.[item]));
    if (followComplete) {
      level = followFailed >= 2 ? "positivo após seguimento" : "negativo após seguimento";
      action = followFailed >= 2
        ? "Encaminhar para avaliação diagnóstica e avaliação da necessidade de intervenção."
        : "Manter vigilância e repetir a triagem em consultas futuras, se indicado.";
    }
    return { complete, score, failedItems, level, action, followFailed, followComplete };
  }

  function nextVisit(ageDays) {
    const scheduleMonths = [0.25, 1, 2, 4, 6, 9, 12, 18, 24, 36];
    const ageMonths = ageDays / DAYS_PER_MONTH;
    const next = scheduleMonths.find((month) => month > ageMonths + 0.05);
    return next ? (next < 1 ? "1ª semana de vida" : `${next} meses`) : "consulta anual, próxima ao mês de aniversário, ou antes conforme necessidade";
  }

  const api = { ageDetails, formatAge, evaluateAnthropometry, growthVelocity, mchatScore, nextVisit, percentile, classification, computeZ };
  root.PediatricCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
