#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "data", "pe-municipal-territory-db.js");
const IBGE_API = "https://servicodados.ibge.gov.br/api/v3/agregados";

const INDICATORS = [
  {
    key: "waterNetwork",
    table: 6803,
    classification: 1821,
    category: 72144,
    label: "domicílios ligados à rede geral e que a utilizam como forma principal"
  },
  {
    key: "adequateSewage",
    table: 6805,
    classification: 11558,
    category: 46290,
    label: "domicílios com rede geral, rede pluvial ou fossa ligada à rede"
  },
  {
    key: "wasteCollection",
    table: 6892,
    classification: 67,
    category: 2520,
    label: "domicílios com lixo coletado"
  }
];

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "CuidarMais-territorial-updater/1.0" }
  });
  if (!response.ok) throw new Error(`IBGE respondeu ${response.status} para ${url}`);
  return response.json();
}

async function getLatestPeriod(table) {
  const metadata = await fetchJson(`${IBGE_API}/${table}/metadados`);
  const latest = Number(metadata?.periodicidade?.fim);
  if (!Number.isInteger(latest)) throw new Error(`Período indisponível para a tabela ${table}`);
  return latest;
}

async function fetchIndicator(indicator, period) {
  const query = new URLSearchParams({
    localidades: "N6[N3[26]]",
    classificacao: `${indicator.classification}[${indicator.category}]`
  });
  const url = `${IBGE_API}/${indicator.table}/periodos/${period}/variaveis/1000381?${query}`;
  const payload = await fetchJson(url);
  const series = payload?.[0]?.resultados?.[0]?.series;
  if (!Array.isArray(series)) throw new Error(`Série inesperada para a tabela ${indicator.table}`);

  return series.map((item) => ({
    ibge: String(item.localidade.id),
    municipality: String(item.localidade.nome).replace(/ - PE$/, ""),
    value: Number(item.serie[String(period)])
  }));
}

function classify(index) {
  if (index >= 85) return { category: "baixa vulnerabilidade territorial", points: 0 };
  if (index >= 70) return { category: "vulnerabilidade territorial moderada-baixa", points: 1 };
  if (index >= 55) return { category: "vulnerabilidade territorial moderada-alta", points: 2 };
  return { category: "alta vulnerabilidade territorial", points: 3 };
}

async function main() {
  const periods = await Promise.all(INDICATORS.map((indicator) => getLatestPeriod(indicator.table)));
  const uniquePeriods = [...new Set(periods)];
  if (uniquePeriods.length !== 1) {
    throw new Error(`As tabelas do IBGE têm períodos incompatíveis: ${periods.join(", ")}`);
  }
  const referenceYear = uniquePeriods[0];
  const datasets = await Promise.all(
    INDICATORS.map((indicator) => fetchIndicator(indicator, referenceYear))
  );

  const municipalities = new Map();
  datasets.forEach((rows, datasetIndex) => {
    const indicator = INDICATORS[datasetIndex];
    rows.forEach((row) => {
      const current = municipalities.get(row.ibge) || {
        ibge: row.ibge,
        municipality: row.municipality,
        uf: "PE",
        indicators: {}
      };
      current.indicators[indicator.key] = row.value;
      municipalities.set(row.ibge, current);
    });
  });

  const entries = [...municipalities.values()]
    .map((entry) => {
      const values = INDICATORS.map((indicator) => entry.indicators[indicator.key]);
      if (values.some((value) => !Number.isFinite(value))) {
        throw new Error(`Indicadores incompletos para ${entry.municipality} (${entry.ibge})`);
      }
      const index = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
      return {
        ...entry,
        indiceSocioeconomico: index,
        privacaoTerritorial: 100 - index,
        ...classify(index)
      };
    })
    .sort((a, b) => a.municipality.localeCompare(b.municipality, "pt-BR"));

  if (entries.length < 180) {
    throw new Error(`Cobertura estadual incompleta: somente ${entries.length} localidades`);
  }

  const sourceFingerprint = crypto
    .createHash("sha256")
    .update(JSON.stringify({ referenceYear, indicators: INDICATORS, entries }))
    .digest("hex");

  try {
    const currentText = await fs.readFile(OUTPUT, "utf8");
    const currentJson = currentText
      .replace(/^window\.PE_MUNICIPAL_TERRITORY_DB\s*=\s*/, "")
      .replace(/;\s*$/, "");
    const current = JSON.parse(currentJson);
    if (current.sourceFingerprint === sourceFingerprint) {
      process.stdout.write(`Base territorial já está atualizada: ${entries.length} localidades, ano ${referenceYear}.\n`);
      return;
    }
  } catch {
    // Primeira geração ou arquivo anterior sem fingerprint: grava a versão atual.
  }

  const generatedAt = new Date().toISOString();
  const db = {
    version: generatedAt.slice(0, 10),
    generatedAt,
    referenceYear,
    sourceFingerprint,
    region: "Pernambuco",
    geographicLevel: "município",
    source: "IBGE SIDRA - Censo Demográfico 2022, Características dos Domicílios",
    sourceUrl: "https://sidra.ibge.gov.br/pesquisa/censo-demografico/demografico-2022/universo-caracteristicas-dos-domicilios",
    method: "Média aritmética das coberturas percentuais de rede geral de água como forma principal, esgotamento por rede/rede pluvial/fossa ligada à rede e coleta de lixo. Indicador ecológico municipal, não clínico e não individual.",
    indicators: INDICATORS.map(({ key, table, category, label }) => ({ key, table, category, label })),
    categories: [
      { min: 85, max: 100, points: 0, label: "baixa vulnerabilidade territorial" },
      { min: 70, max: 84, points: 1, label: "vulnerabilidade territorial moderada-baixa" },
      { min: 55, max: 69, points: 2, label: "vulnerabilidade territorial moderada-alta" },
      { min: 0, max: 54, points: 3, label: "alta vulnerabilidade territorial" }
    ],
    entries
  };

  const output = `window.PE_MUNICIPAL_TERRITORY_DB = ${JSON.stringify(db, null, 2)};\n`;
  await fs.writeFile(OUTPUT, output, "utf8");
  process.stdout.write(`Base territorial atualizada: ${entries.length} localidades, ano ${referenceYear}.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
