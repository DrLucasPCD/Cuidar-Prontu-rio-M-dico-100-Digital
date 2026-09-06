(function (root) {
  "use strict";

  const MOCA_EDUCATION_RULE = "moca-full-standard-12-or-fewer-plus-1";

  function schema(id, name, domains, sourceUrl, permissionUrl) {
    const normalized = domains.map(([domainId, label, maxScore]) => ({ id: domainId, label, maxScore }));
    return Object.freeze({
      id,
      name,
      maxScore: 30,
      domains: Object.freeze(normalized),
      // Generic score slots deliberately contain no test prompt, stimulus, answer or instruction.
      scoreSlots: Object.freeze(normalized.flatMap((domain) => Array.from(
        { length: domain.maxScore },
        (_, index) => Object.freeze({ id: `${domain.id}.${index + 1}`, domainId: domain.id, label: `${domain.label} — ponto ${index + 1}`, maxScore: 1 })
      ))),
      sourceUrl,
      permissionUrl,
      administration: "externalOfficialForm",
      containsProtectedContent: false
    });
  }

  const SCHEMAS = Object.freeze({
    meem: schema("meem", "MEEM", [
      ["orientationTime", "Orientação temporal", 5],
      ["orientationPlace", "Orientação espacial", 5],
      ["registration", "Registro", 3],
      ["attentionCalculation", "Atenção e cálculo", 5],
      ["recall", "Evocação", 3],
      ["naming", "Nomeação", 2],
      ["repetition", "Repetição", 1],
      ["comprehension", "Compreensão", 3],
      ["reading", "Leitura", 1],
      ["writing", "Escrita", 1],
      ["drawing", "Desenho", 1]
    ], "https://www.parinc.com/products/MMSE", "https://www.parinc.com/customer-support/product-information"),
    moca: schema("moca", "MoCA", [
      ["visuospatialExecutive", "Visuoespacial/executiva", 5],
      ["naming", "Nomeação", 3],
      ["attention", "Atenção", 6],
      ["language", "Linguagem", 3],
      ["abstraction", "Abstração", 2],
      ["delayedRecall", "Evocação tardia", 5],
      ["orientation", "Orientação", 6]
    ], "https://mocacognition.com/", "https://mocacognition.com/permission")
  });

  function own(object, key) {
    return Object.prototype.hasOwnProperty.call(object || {}, key);
  }

  function integerOrNull(value) {
    if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return null;
    if (typeof value !== "number" && typeof value !== "string") return NaN;
    const number = Number(value);
    return Number.isInteger(number) ? number : NaN;
  }

  function assessInstrument(kind, input) {
    const definition = SCHEMAS[kind];
    if (!definition) throw new TypeError(`Instrumento cognitivo desconhecido: ${kind}`);
    input = input || {};
    const domains = input.domains || {};
    const recordedDomains = {};
    const missingDomains = [];
    const errors = [];

    for (const domain of definition.domains) {
      const value = integerOrNull(domains[domain.id]);
      recordedDomains[domain.id] = Number.isNaN(value) ? null : value;
      if (value === null) missingDomains.push(domain.id);
      else if (Number.isNaN(value) || value < 0 || value > domain.maxScore) {
        errors.push(`${domain.label}: informe um inteiro de 0 a ${domain.maxScore}.`);
        if (!missingDomains.includes(domain.id)) missingDomains.push(domain.id);
      }
    }

    const calculatedTotal = missingDomains.length || errors.length
      ? null
      : definition.domains.reduce((sum, domain) => sum + recordedDomains[domain.id], 0);
    const suppliedTotal = integerOrNull(input.total);
    if (Number.isNaN(suppliedTotal) || (suppliedTotal !== null && (suppliedTotal < 0 || suppliedTotal > 30))) {
      errors.push("Total informado: use um inteiro de 0 a 30.");
    } else if (calculatedTotal !== null && suppliedTotal !== null && suppliedTotal !== calculatedTotal) {
      errors.push(`O total informado (${suppliedTotal}) difere da soma dos domínios (${calculatedTotal}).`);
    }

    const hasAnyDomain = definition.domains.some((domain) => own(domains, domain.id) && integerOrNull(domains[domain.id]) !== null);
    const hasAnyData = hasAnyDomain || suppliedTotal !== null;
    if (input.status === "notApplied" && hasAnyData) errors.push("Há pontuação registrada apesar do estado 'não aplicado'.");
    const complete = calculatedTotal !== null && errors.length === 0 && input.status !== "notApplied";
    const status = complete ? "complete" : hasAnyData ? "partial" : "notApplied";

    return {
      instrument: kind,
      name: definition.name,
      status,
      complete,
      domains: recordedDomains,
      missingDomains,
      rawTotal: complete ? calculatedTotal : null,
      suppliedTotal: Number.isNaN(suppliedTotal) ? null : suppliedTotal,
      maxScore: definition.maxScore,
      errors,
      appliedOnOfficialForm: input.appliedOnOfficialForm === true,
      version: String(input.version || "").trim() || null,
      interpretation: null,
      diagnosticConclusion: null
    };
  }

  function assessMeem(input) {
    return assessInstrument("meem", input);
  }

  function assessMoca(input) {
    input = input || {};
    const result = assessInstrument("moca", input);
    const educationYears = integerOrNull(input.educationYears);
    if (Number.isNaN(educationYears) || (educationYears !== null && (educationYears < 0 || educationYears > 60))) {
      result.errors.push("Escolaridade: informe anos completos entre 0 e 60.");
      result.complete = false;
      result.status = "partial";
    }
    const incompatibleVersion = /basic|blind|cego|cega|básic|basico|básico|telephone|telefone|22\s*(pontos|points|pts)|5.?min/i.test(result.version || "");
    if (incompatibleVersion || (input.variant && input.variant !== "full")) {
      result.errors.push("Este registro de domínios suporta apenas MoCA Full de 30 pontos; use o formulário e regras da versão correspondente.");
      result.complete = false;
      result.status = "partial";
    }
    if (!result.complete) result.rawTotal = null;
    const ruleConfirmed = !incompatibleVersion && input.versionConfirmed === true && Boolean(result.version) && input.educationCorrectionRule === MOCA_EDUCATION_RULE;
    const mayCorrect = result.complete && ruleConfirmed && !Number.isNaN(educationYears) && educationYears !== null;
    const adjustment = mayCorrect && educationYears <= 12 && result.rawTotal < 30 ? 1 : mayCorrect ? 0 : null;
    return {
      ...result,
      educationYears: Number.isNaN(educationYears) ? null : educationYears,
      educationCorrectionRule: ruleConfirmed ? MOCA_EDUCATION_RULE : null,
      versionConfirmed: input.versionConfirmed === true,
      correctionApplied: mayCorrect,
      educationAdjustment: adjustment,
      correctedTotal: mayCorrect ? result.rawTotal + adjustment : null
    };
  }

  function buildCognitiveSummary(value) {
    value = value || {};
    const meem = value.meem && value.meem.instrument ? value.meem : assessMeem(value.meem);
    const moca = value.moca && value.moca.instrument ? value.moca : assessMoca(value.moca);
    const describe = (result) => result.complete ? `${result.rawTotal}/30 (escore bruto)` : result.status === "notApplied" ? "não aplicado" : "incompleto; sem total";
    const mocaCorrection = moca.correctedTotal === null || moca.correctedTotal === undefined
      ? "correção educacional não calculada"
      : `${moca.correctedTotal}/30 (escore corrigido; ajuste +${moca.educationAdjustment})`;
    const domainSummary = (result) => SCHEMAS[result.instrument].domains.map((domain) => `${domain.label}: ${result.domains[domain.id] === null || result.domains[domain.id] === undefined ? "pendente" : `${result.domains[domain.id]}/${domain.maxScore}`}`).join("; ");
    return [
      `MEEM: ${describe(meem)}.`,
      domainSummary(meem),
      `MoCA: ${describe(moca)}; ${mocaCorrection}.`,
      domainSummary(moca),
      `Versão MoCA registrada: ${moca.version || "não informada"}; escolaridade: ${moca.educationYears === null || moca.educationYears === undefined ? "não informada" : `${moca.educationYears} anos`}; versão confirmada: ${moca.versionConfirmed ? "sim" : "não"}.`,
      ...meem.errors, ...moca.errors,
      "Pontuações registradas após aplicação do formulário oficial. Itens ausentes permanecem pendentes. Sem classificação automática ou conclusão diagnóstica."
    ].join("\n");
  }

  const api = { SCHEMAS, MOCA_EDUCATION_RULE, assessInstrument, assessMeem, assessMoca, buildCognitiveSummary };
  root.CognitiveCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
