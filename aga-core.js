(function (root) {
  "use strict";

  const CRITERIA = root.AGA_CRITERIA || (typeof require === "function" ? require("./data/aga-criteria.js") : null);

  function own(object, key) { return Object.prototype.hasOwnProperty.call(object || {}, key); }
  function missingKeys(object, keys, valid) { return keys.filter((key) => !own(object, key) || !valid(object[key])); }

  function scoreKatz(answers) {
    const valid = (v) => ["independent", "assistance", "dependent"].includes(v);
    const missing = missingKeys(answers, CRITERIA.katzItems, valid);
    const answered = CRITERIA.katzItems.length - missing.length;
    if (missing.length) return { complete: false, answered, missing, score: null, dependentItems: CRITERIA.katzItems.filter((key) => valid(answers[key]) && answers[key] !== "independent") };
    const dependentItems = CRITERIA.katzItems.filter((key) => answers[key] !== "independent");
    const score = CRITERIA.katzItems.filter((key) => answers[key] === "independent").length;
    return { complete: true, answered, missing, score, maxScore: 6, dependentItems };
  }

  function scoreLawton(answers) {
    const valid = (v) => Number.isInteger(v) && v >= 1 && v <= 3;
    const missing = missingKeys(answers, CRITERIA.lawtonItems, valid);
    const answered = CRITERIA.lawtonItems.length - missing.length;
    if (missing.length) return { complete: false, answered, missing, score: null, impairedItems: CRITERIA.lawtonItems.filter((key) => valid(answers[key]) && answers[key] < 3) };
    const score = CRITERIA.lawtonItems.reduce((sum, key) => sum + answers[key], 0);
    const impairedItems = CRITERIA.lawtonItems.filter((key) => answers[key] < 3);
    return { complete: true, answered, missing, score, minScore: 8, maxScore: 24, impairedItems };
  }

  function scoreGds15(answers) {
    const keys = Array.from({ length: 15 }, (_, i) => String(i + 1));
    const valid = (v) => v === "sim" || v === "nao";
    const missing = missingKeys(answers, keys, valid);
    const answered = keys.length - missing.length;
    if (missing.length) return { complete: false, answered, missing, score: null, screenPositive: null };
    const score = keys.reduce((sum, key) => {
      const item = Number(key);
      const risk = CRITERIA.gds15DepressiveYes.includes(item) ? answers[key] === "sim" : answers[key] === "nao";
      return sum + (risk ? 1 : 0);
    }, 0);
    return { complete: true, answered, missing, score, maxScore: 15, screenPositive: null, classification: "escore descritivo; interpretação clínica pendente" };
  }

  function assessTimedUpAndGo(value) {
    if (value === null || value === undefined || value === "") return { complete: false, seconds: null, highRisk: null };
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) return { complete: false, seconds: null, highRisk: null, error: "Tempo inválido." };
    return { complete: true, seconds, highRisk: null, classification: "tempo registrado; avaliação multifatorial de quedas necessária" };
  }

  function finiteOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function assessNutrition(input) {
    input = input || {};
    const bmi = finiteOrNull(input.bmi);
    const weightLossKg = finiteOrNull(input.weightLossKg);
    const weightLossMonths = finiteOrNull(input.weightLossMonths);
    const calfCircumferenceCm = finiteOrNull(input.calfCircumferenceCm);
    const flags = [];
    if (input.reducedIntake === true) flags.push("redução da ingestão alimentar");
    if (weightLossKg !== null && weightLossKg > 0) flags.push("perda de peso referida");
    return { bmi, weightLossKg, weightLossMonths, calfCircumferenceCm, reducedIntake: input.reducedIntake ?? null, flags, needsAssessment: flags.length > 0 };
  }

  function assessMedications(input) {
    input = input || {};
    const items = Array.isArray(input.items) ? input.items.filter((item) => String(item || "").trim()) : [];
    const count = items.length || null;
    const polypharmacy = count === null ? null : count >= CRITERIA.thresholds.polypharmacyCount;
    const flags = [];
    if (polypharmacy) flags.push("polifarmácia (cinco ou mais medicamentos)");
    if (input.adverseEffects === true) flags.push("possíveis efeitos adversos");
    if (input.adherenceDifficulty === true) flags.push("dificuldade de adesão");
    return { items, count, polypharmacy, adverseEffects: input.adverseEffects ?? null, adherenceDifficulty: input.adherenceDifficulty ?? null, flags };
  }

  function evaluate(input) {
    input = input || {};
    const abvd = scoreKatz(input.abvd || {});
    const aivd = scoreLawton(input.aivd || {});
    const mood = scoreGds15(input.mood?.gds15 || {});
    const tug = assessTimedUpAndGo(input.mobility?.tugSeconds);
    const nutrition = assessNutrition(input.nutrition);
    const medications = assessMedications(input.medications);
    const flags = [];
    if (abvd.dependentItems.length) flags.push("dependência em ABVD");
    if (aivd.impairedItems.length) flags.push("dependência em AIVD");
    if (mood.screenPositive) flags.push("rastreio de humor positivo");
    if (tug.highRisk || Number(input.mobility?.fallsLast12Months) > 0) flags.push("risco ou histórico de quedas");
    if (input.cognition?.complaint === true || input.cognition?.informantConcern === true) flags.push("queixa cognitiva");
    if (input.mobility?.walkingDifficulty === true) flags.push("dificuldade para caminhar");
    if (input.cognition?.clockTest === "altered") flags.push("teste do relógio alterado");
    if (input.senses?.visionDifficulty === true) flags.push("dificuldade visual");
    if (input.senses?.hearingDifficulty === true || input.senses?.whisperTestAbnormal === true) flags.push("dificuldade auditiva");
    if (input.social?.supportAvailable === false || input.social?.livesAlone === true) flags.push("atenção à rede de apoio");
    if (input.social?.caregiverOverload === true) flags.push("sobrecarga do cuidador");
    if (input.social?.violenceConcern === true) flags.push("suspeita ou risco de violência");
    flags.push(...nutrition.flags, ...medications.flags);
    return { ivcf20: assessIvcf20(input.ivcf20Score), notes: input.notes || "", recorded: input, abvd, aivd, cognition: input.cognition || {}, mood, mobility: { ...(input.mobility || {}), tug }, nutrition, senses: input.senses || {}, medications, social: input.social || {}, flags: [...new Set(flags)], complete: abvd.complete && aivd.complete && mood.complete, criteriaVersion: CRITERIA.version };
  }

  function assessIvcf20(value) {
    if (value === "" || value === null || value === undefined) return { complete: false, score: null };
    const score = Number(value);
    if (!Number.isInteger(score) || score < 0 || score > 40) return { complete: false, score: null, error: "Escore IVCF-20 inválido (inteiro de 0 a 40)." };
    return { complete: true, score, classification: score <= 6 ? "baixo risco" : score <= 14 ? "risco moderado" : "alto risco", reassessment: score <= 6 ? "anual ou antes diante de evento sentinela" : "semestral ou antes diante de evento sentinela" };
  }

  function buildSummary(result) {
    if (!result) return "AGA não avaliada.";
    const v = (value) => value === null || value === undefined || value === "" ? "não avaliado" : value === true ? "sim" : value === false ? "não" : String(value);
    const labels = { bathing: "banho", dressing: "vestir-se", toileting: "uso do vaso", transferring: "transferência", continence: "continência", feeding: "alimentação", telephone: "telefone", transport: "transporte", shopping: "compras", foodPreparation: "refeições", housekeeping: "tarefas domésticas", laundry: "lavanderia", medications: "medicamentos", finances: "finanças" };
    const answers = { independent: "independente", assistance: "ajuda", dependent: "dependente", 1: "dependente", 2: "ajuda parcial", 3: "independente" };
    const details = (keys, group) => keys.map((key) => `${labels[key]}: ${answers[group?.[key]] || "não avaliado"}`).join("; ");
    const c = result.cognition, m = result.mobility, n = result.nutrition, social = result.social, meds = result.medications;
    const lines = ["AVALIAÇÃO GERIÁTRICA AMPLA — registro educativo local", `Referências: versão ${result.criteriaVersion}.`, ""];
    lines.push(`IVCF-20 (total informado após aplicação externa): ${result.ivcf20.complete ? `${result.ivcf20.score}/40 — ${result.ivcf20.classification}; reavaliação ${result.ivcf20.reassessment}` : "não avaliado ou inválido"}.`);
    lines.push(`ABVD — registro baseado em Katz: ${result.abvd.complete ? `${result.abvd.score}/6 atividades independentes` : `${result.abvd.answered}/6 respondidas; sem escore total`}.`, details(CRITERIA.katzItems, result.recorded.abvd));
    lines.push(`AIVD — registro baseado em Lawton (adaptação de 8 itens): ${result.aivd.complete ? `${result.aivd.score}/24 pontos, sem classificação de dependência` : `${result.aivd.answered}/8 respondidas; sem escore total`}.`, details(CRITERIA.lawtonItems, result.recorded.aivd));
    lines.push(`Cognição: queixa ${v(c.complaint)}; preocupação do informante ${v(c.informantConcern)}; relógio ${({normal:"sem alteração observada",altered:"alterado",notPerformed:"não realizado"})[c.clockTest] || "não avaliado"}; fluência ${v(c.verbalFluency)}${c.meem ? "" : `; MEEM ${v(c.meemScore)}`}; escolaridade ${v(c.education)} anos.`);
    lines.push(`GDS-15: ${result.mood.complete ? `${result.mood.score}/15 (sem classificação automática)` : `${result.mood.answered}/15 respondidas; sem escore`}.`);
    lines.push(`Mobilidade: quedas no último ano ${v(m.fallsLast12Months)}; TUG ${v(m.tug.seconds)} segundos; dificuldade para caminhar ${v(m.walkingDifficulty)}; dispositivo de apoio ${v(m.assistiveDevice)}.`);
    lines.push(`Nutrição: IMC ${v(n.bmi)}; perda involuntária ${v(n.weightLossKg)} kg em ${v(n.weightLossMonths)} meses; panturrilha ${v(n.calfCircumferenceCm)} cm; ingestão reduzida ${v(n.reducedIntake)}.`);
    lines.push(`Sentidos: dificuldade visual ${v(result.senses.visionDifficulty)}; auditiva ${v(result.senses.hearingDifficulty)}; sussurro alterado ${v(result.senses.whisperTestAbnormal)}.`);
    lines.push(`Medicamentos (${v(meds.count)} itens informados; lista não presume conciliação completa): ${meds.items.length ? meds.items.join("; ") : "não informado"}. Efeitos adversos ${v(meds.adverseEffects)}; dificuldade de adesão ${v(meds.adherenceDifficulty)}.`);
    lines.push(`Social: mora sozinho ${v(social.livesAlone)}; apoio disponível ${v(social.supportAvailable)}; sobrecarga do cuidador ${v(social.caregiverOverload)}; preocupação com violência ${v(social.violenceConcern)}.`);
    lines.push(`Achados para revisão: ${result.flags.length ? result.flags.join("; ") : "nenhum entre os itens respondidos; dados ausentes não excluem riscos"}.`);
    lines.push(`Plano, metas, ambiente, preferências e reavaliação: ${result.notes || "não registrado"}.`);
    lines.push("IVCF-20: Caderneta Brasileira da Pessoa Idosa, MS, 2026, p. 71. GDS/TUG sem corte automático: referências didáticas aguardam confirmação MS. Rastreios não estabelecem diagnóstico.");
    return lines.join("\n\n");
  }

  const api = { assessIvcf20, evaluate, scoreKatz, scoreLawton, scoreGds15, assessTimedUpAndGo, assessNutrition, assessMedications, buildSummary, CRITERIA };
  root.AgaCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
