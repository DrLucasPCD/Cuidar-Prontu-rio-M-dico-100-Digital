(function (root) {
  "use strict";

  const criteria = Object.freeze({
    version: "2026-09-06",
    reviewedAt: "2026-09-06",
    sources: Object.freeze([
      Object.freeze({
        title: "Caderneta Brasileira da Pessoa Idosa (2026)",
        publisher: "Ministério da Saúde",
        url: "https://www.gov.br/saude/pt-br/composicao/saps/publicacoes/cadernetas-e-cartoes/caderneta-brasileira-da-pessoa-idosa/view",
        updated: "2026-06-19"
      }),
      Object.freeze({
        title: "Saúde da Pessoa Idosa",
        publisher: "Ministério da Saúde",
        url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa"
      }),
      Object.freeze({
        title: "Uso Seguro de Medicamentos",
        publisher: "Ministério da Saúde",
        url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/uso-seguro-de-medicamentos"
      })
    ]),
    domains: Object.freeze(["abvd", "aivd", "cognition", "mood", "mobility", "nutrition", "senses", "medications", "social"]),
    katzItems: Object.freeze(["bathing", "dressing", "toileting", "transferring", "continence", "feeding"]),
    lawtonItems: Object.freeze(["telephone", "transport", "shopping", "foodPreparation", "housekeeping", "laundry", "medications", "finances"]),
    gds15DepressiveYes: Object.freeze([2, 3, 4, 6, 8, 9, 10, 12, 14, 15]),
    gds15DepressiveNo: Object.freeze([1, 5, 7, 11, 13]),
    thresholds: Object.freeze({
      gds15ScreenPositive: null,
      timedUpAndGoHighRiskSeconds: null,
      polypharmacyCount: 5
    }),
    thresholdEvidence: Object.freeze({
      gds15ScreenPositive: "Corte didático não ativado: confirmação em fonte MS pendente.",
      timedUpAndGoHighRiskSeconds: "Corte didático não ativado: confirmação em fonte MS pendente. Avaliar quedas de forma multifatorial.",
      polypharmacyCount: "Ministério da Saúde, Uso Seguro de Medicamentos: uso regular de cinco ou mais medicamentos."
    })
  });

  root.AGA_CRITERIA = criteria;
  if (typeof module !== "undefined" && module.exports) module.exports = criteria;
})(typeof globalThis !== "undefined" ? globalThis : window);
