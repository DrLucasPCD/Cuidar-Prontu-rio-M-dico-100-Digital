const form = document.getElementById("patient-form");
const imcBox = document.getElementById("imc-box");
const recList = document.getElementById("recommendations");
const extraExamInput = document.getElementById("extra-exam-input");
const addExtraExamBtn = document.getElementById("add-extra-exam-btn");
const extraExamsList = document.getElementById("extra-exams-list");
const copyBtn = document.getElementById("copy-btn");
const printBtn = document.getElementById("print-btn");
const pdfBtn = document.getElementById("pdf-btn");
const classificationInput = document.getElementById("classification");
const classificationOptions = document.getElementById("classification-options");
const classificationMatch = document.getElementById("classification-match");
const reportContent = document.getElementById("report-content");
const verificationQr = document.getElementById("verification-qr");
const verificationCodeEl = document.getElementById("verification-code");
const importDictBtn = document.getElementById("import-dict-btn");
const resetDictBtn = document.getElementById("reset-dict-btn");
const dictFileInput = document.getElementById("dict-file-input");
const dictCount = document.getElementById("dict-count");
const newRecordBtn = document.getElementById("new-record-btn");
const recentBtn = document.getElementById("recent-btn");
const formAnchor = document.getElementById("form-anchor");
const EXTRA_CID11 = Array.isArray(window.CID11_EXTRA) ? window.CID11_EXTRA : [];
const helpBtn = document.getElementById("help-btn");
const saveDraftBtn = document.getElementById("save-draft-btn");
const generateDocumentBtn = document.getElementById("generate-document-btn");
const documentDialog = document.getElementById("document-dialog");
const dialogPrintBtn = document.getElementById("dialog-print-btn");
const dialogPdfBtn = document.getElementById("dialog-pdf-btn");
const dialogCancelBtn = document.getElementById("dialog-cancel-btn");
const stepItems = [...document.querySelectorAll(".step[data-step]")];
const step1Section = document.getElementById("step-1-section");
const step2Section = document.getElementById("step-2-section");
const step3Section = document.getElementById("final-report");
const API_BASE = (window.CUIDAR_API_BASE || "/api").replace(/\/$/, "");
let backendVerification = null;
let backendWarned = false;

const BASE_CATALOG = [
  { system: "CID-11", code: "5A11", name: "Diabetes mellitus tipo 2" },
  { system: "CID-11", code: "5A10", name: "Diabetes mellitus tipo 1" },
  { system: "CID-11", code: "5A14", name: "Pré-diabetes" },
  { system: "CID-11", code: "BA00", name: "Hipertensão essencial (primária)" },
  { system: "CID-11", code: "BA03", name: "Hipertensão secundária" },
  { system: "CID-11", code: "BD11", name: "Dislipidemia" },
  { system: "CID-11", code: "CA40", name: "Obesidade" },
  { system: "CID-11", code: "CA23", name: "Sobrepeso" },
  { system: "CID-11", code: "CA22.0", name: "Baixo peso no adulto" },
  { system: "CID-11", code: "BA80", name: "Doença isquêmica do coração" },
  { system: "CID-11", code: "BA81", name: "Infarto agudo do miocárdio" },
  { system: "CID-11", code: "8B10", name: "Acidente vascular cerebral isquêmico" },
  { system: "CID-11", code: "8B11", name: "Acidente vascular cerebral hemorrágico" },
  { system: "CID-11", code: "CA60", name: "Desnutrição" },
  { system: "CID-11", code: "CB03", name: "Deficiência de vitamina D" },
  { system: "CID-11", code: "CA01", name: "Anemia ferropriva" },
  { system: "CID-11", code: "GE31", name: "Asma" },
  { system: "CID-11", code: "CA23.1", name: "Obesidade abdominal" },
  { system: "CID-11", code: "GB61", name: "Doença pulmonar obstrutiva crônica" },
  { system: "CID-11", code: "GA20", name: "Pneumonia adquirida na comunidade" },
  { system: "CID-11", code: "ME84", name: "Infecção do trato urinário" },
  { system: "CID-11", code: "1A00", name: "Tuberculose pulmonar" },
  { system: "CID-11", code: "1C62", name: "Dengue" },
  { system: "CID-11", code: "1F40", name: "COVID-19" },
  { system: "CID-11", code: "RA01", name: "Dor lombar" },
  { system: "CID-11", code: "FA00", name: "Episódio depressivo" },
  { system: "CID-11", code: "6B00", name: "Transtorno de ansiedade generalizada" },
  { system: "CID-11", code: "6A70", name: "Demência" },
  { system: "CID-11", code: "6C40", name: "Transtorno por uso de álcool" },
  { system: "CID-11", code: "6C4A", name: "Transtorno por uso de tabaco" },
  { system: "CID-11", code: "EA80", name: "Hipotireoidismo" },
  { system: "CID-11", code: "EA00", name: "Hipertireoidismo" },
  { system: "CID-11", code: "EA63", name: "Síndrome metabólica" },
  { system: "CID-11", code: "KC81", name: "Doença renal crônica" },
  { system: "CID-11", code: "QA80", name: "Refluxo gastroesofágico" },
  { system: "CID-11", code: "DA63", name: "Cefaleia tensional" },
  { system: "CID-11", code: "8A80", name: "Enxaqueca" },
  { system: "CID-11", code: "8D20", name: "Paralisia cerebral espástica" },
  { system: "CID-11", code: "8D20.0", name: "Paralisia cerebral espástica unilateral" },
  { system: "CID-11", code: "8D20.1", name: "Paralisia cerebral espástica bilateral" },
  { system: "CID-11", code: "8D20.10", name: "Paralisia cerebral espástica quadriplégica" },
  { system: "CID-11", code: "8D20.11", name: "Paralisia cerebral espástica diplégica" },
  { system: "CID-11", code: "8D20.1Z", name: "Paralisia cerebral espástica bilateral, não especificada" },
  { system: "CID-11", code: "8D20.Y", name: "Outra paralisia cerebral espástica especificada" },
  { system: "CID-11", code: "8D20.Z", name: "Paralisia cerebral espástica, não especificada" },
  { system: "CID-11", code: "8D21", name: "Paralisia cerebral discinética" },
  { system: "CID-11", code: "8D21.Y", name: "Outra paralisia cerebral discinética especificada" },
  { system: "CID-11", code: "8D21.Z", name: "Paralisia cerebral discinética, não especificada" },
  { system: "CID-11", code: "8D22", name: "Paralisia cerebral atáxica" },
  { system: "CID-11", code: "8D22.Y", name: "Outra paralisia cerebral atáxica especificada" },
  { system: "CID-11", code: "8D22.Z", name: "Paralisia cerebral atáxica, não especificada" },
  { system: "CID-11", code: "8D23", name: "Síndrome de Worster-Drought" },
  { system: "CID-11", code: "8D2Y", name: "Outras paralisias cerebrais especificadas" },
  { system: "CID-11", code: "8D2Z", name: "Paralisia cerebral, não especificada" },
  { system: "CID-11", code: "2C81", name: "Neoplasia maligna de mama" },
  { system: "CID-11", code: "2E20", name: "Neoplasia maligna de colo do útero" },
  { system: "CID-11", code: "2C18", name: "Neoplasia maligna de cólon" },
  { system: "CID-11", code: "MA15", name: "Hiperplasia prostática benigna" },
  { system: "CID-11", code: "2C82", name: "Neoplasia maligna de próstata" },
  { system: "CID-11", code: "MC60", name: "Vaginose bacteriana" },
  { system: "CID-11", code: "MC61", name: "Candidíase vulvovaginal" },
  { system: "CID-11", code: "NE61", name: "Doença periodontal" },
  { system: "CID-11", code: "1B11", name: "Hepatite B crônica" },
  { system: "CID-11", code: "1B12", name: "Hepatite C crônica" },
  { system: "CIAP-2", code: "T90", name: "Diabetes não insulinodependente" },
  { system: "CIAP-2", code: "T89", name: "Diabetes insulinodependente" },
  { system: "CIAP-2", code: "T99", name: "Doença endócrina/metabólica, outra" },
  { system: "CIAP-2", code: "K86", name: "Hipertensão sem complicações" },
  { system: "CIAP-2", code: "K87", name: "Hipertensão com complicações" },
  { system: "CIAP-2", code: "K84", name: "Doença cardíaca, outra" },
  { system: "CIAP-2", code: "K74", name: "Doença isquêmica do coração" },
  { system: "CIAP-2", code: "K75", name: "Infarto agudo do miocárdio" },
  { system: "CIAP-2", code: "K90", name: "Acidente vascular cerebral" },
  { system: "CIAP-2", code: "T82", name: "Obesidade" },
  { system: "CIAP-2", code: "T83", name: "Sobrepeso" },
  { system: "CIAP-2", code: "T91", name: "Deficiência de vitamina/nutricional" },
  { system: "CIAP-2", code: "T93", name: "Alteração do metabolismo lipídico" },
  { system: "CIAP-2", code: "R95", name: "Doença pulmonar obstrutiva crônica" },
  { system: "CIAP-2", code: "R96", name: "Asma" },
  { system: "CIAP-2", code: "R74", name: "Infecção aguda do aparelho respiratório superior" },
  { system: "CIAP-2", code: "R81", name: "Pneumonia" },
  { system: "CIAP-2", code: "U71", name: "Cistite/outra infecção urinária" },
  { system: "CIAP-2", code: "A70", name: "Tuberculose" },
  { system: "CIAP-2", code: "A77", name: "Dengue/arbovirose" },
  { system: "CIAP-2", code: "A03", name: "Febre" },
  { system: "CIAP-2", code: "A04", name: "Fraqueza/cansaço geral" },
  { system: "CIAP-2", code: "N01", name: "Cefaleia" },
  { system: "CIAP-2", code: "L03", name: "Sintoma lombar baixo" },
  { system: "CIAP-2", code: "L84", name: "Síndrome lombar sem irradiação" },
  { system: "CIAP-2", code: "P76", name: "Perturbação depressiva" },
  { system: "CIAP-2", code: "P74", name: "Perturbação ansiosa/estado de ansiedade" },
  { system: "CIAP-2", code: "P17", name: "Abuso de tabaco" },
  { system: "CIAP-2", code: "P15", name: "Abuso de álcool agudo" },
  { system: "CIAP-2", code: "D84", name: "Doença do esôfago" },
  { system: "CIAP-2", code: "D87", name: "Dispepsia/indigestão" },
  { system: "CIAP-2", code: "U99", name: "Doença urinária, outra" },
  { system: "CIAP-2", code: "W78", name: "Gravidez" },
  { system: "CIAP-2", code: "W11", name: "Contracepção oral" },
  { system: "CIAP-2", code: "X84", name: "Vaginite/vulvite" },
  { system: "CIAP-2", code: "X76", name: "Neoplasia maligna de mama (feminino)" },
  { system: "CIAP-2", code: "X75", name: "Neoplasia maligna do colo uterino" },
  { system: "CIAP-2", code: "Y85", name: "Hiperplasia benigna da próstata" },
  { system: "CIAP-2", code: "Y77", name: "Neoplasia maligna da próstata" },
  { system: "CIAP-2", code: "A44", name: "Vacinação/medicação preventiva" },
  { system: "CIAP-2", code: "A98", name: "Medicina preventiva/manutenção da saúde" },
  { system: "CIAP-2", code: "A97", name: "Sem doença identificada" }
];

const DEFAULT_CATALOG = [...BASE_CATALOG, ...EXTRA_CID11];

function setActiveStep(stepNumber) {
  stepItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.step === String(stepNumber));
  });
}

let classificationCatalog = [];

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeCatalog(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const system = String(item.system || "LOCAL").trim();
    const code = String(item.code || "").trim();
    const name = String(item.name || "").trim();
    if (!code || !name) continue;
    const key = `${normalize(system)}|${normalize(code)}|${normalize(name)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ system, code, name });
  }
  return out;
}

function loadCatalog() {
  const saved = localStorage.getItem("classificationCatalogV1");
  if (!saved) {
    classificationCatalog = dedupeCatalog(DEFAULT_CATALOG);
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    classificationCatalog = dedupeCatalog([...DEFAULT_CATALOG, ...parsed]);
    if (!classificationCatalog.length) classificationCatalog = dedupeCatalog(DEFAULT_CATALOG);
  } catch {
    classificationCatalog = dedupeCatalog(DEFAULT_CATALOG);
  }
}

function saveCatalog() {
  localStorage.setItem("classificationCatalogV1", JSON.stringify(classificationCatalog));
}

function updateCatalogCount() {
  dictCount.textContent = `${classificationCatalog.length} itens no dicionário local`;
}

function formatClassificationMatch(match) {
  return `${match.system}: ${match.code} - ${match.name}`;
}

function mountClassificationOptions() {
  classificationOptions.innerHTML = "";
  const maxOptions = Math.min(classificationCatalog.length, 1500);
  for (let i = 0; i < maxOptions; i += 1) {
    const item = classificationCatalog[i];
    const option = document.createElement("option");
    option.value = `${item.code} - ${item.name} (${item.system})`;
    classificationOptions.appendChild(option);
  }
}

function findClassificationMatch(rawValue) {
  const query = normalize(rawValue);
  if (!query) return { exact: null, suggestions: [] };

  const exact = classificationCatalog.find((item) => {
    return normalize(item.code) === query || normalize(item.name) === query;
  });
  if (exact) return { exact, suggestions: [] };

  const startsWith = [];
  const includes = [];
  for (const item of classificationCatalog) {
    const code = normalize(item.code);
    const name = normalize(item.name);
    if (code.startsWith(query) || name.startsWith(query)) {
      startsWith.push(item);
    } else if (code.includes(query) || name.includes(query)) {
      includes.push(item);
    }
  }
  const suggestions = [...startsWith, ...includes].slice(0, 6);
  return { exact: null, suggestions };
}

function parseCsvDictionary(text) {
  const rows = text.split(/\r?\n/).map((r) => r.trim()).filter(Boolean);
  const items = [];
  for (const row of rows) {
    if (/^system\s*,/i.test(row)) continue;
    const cols = row.split(",").map((c) => c.trim());
    if (cols.length < 3) continue;
    const [system, code, ...rest] = cols;
    const name = rest.join(",").trim();
    items.push({ system, code, name });
  }
  return items;
}

function formatNowPtBr() {
  const now = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(now);
}

function categorizeSelectedRecommendations(recommendations) {
  const categories = {
    "Exames de sangue": [],
    "Exames de urina": [],
    "Exames de imagem": [],
    "Avaliações clínicas": [],
    "Outros procedimentos": []
  };

  for (const text of recommendations) {
    const t = text.toLowerCase();

    if (t.includes("aferição de pressão arterial")) {
      categories["Avaliações clínicas"].push("Aferição de pressão arterial");
      continue;
    }

    if (t.includes("rastreamento para dm2") || t.includes("glicemia")) {
      categories["Exames de sangue"].push("Glicemia de jejum");
      categories["Exames de sangue"].push("Hemoglobina glicada (HbA1c)");
      continue;
    }

    if (t.includes("perfil lipídico")) {
      categories["Exames de sangue"].push("Perfil lipídico (colesterol total, HDL, LDL, triglicerídeos)");
      continue;
    }

    if (t.includes("função renal") || t.includes("albuminúria")) {
      categories["Exames de sangue"].push("Creatinina sérica (com eTFG)");
      categories["Exames de urina"].push("Relação albumina/creatinina urinária (ou albuminúria)");
      continue;
    }

    if (t.includes("câncer de mama") || t.includes("mamografia")) {
      categories["Exames de imagem"].push("Mamografia bilateral");
      continue;
    }

    if (t.includes("colo do útero") || t.includes("hpv")) {
      categories["Outros procedimentos"].push("Rastreamento de colo uterino (citopatológico e/ou teste de HPV conforme protocolo)");
      continue;
    }

    if (t.includes("situação vacinal") || t.includes("vacinal")) {
      categories["Outros procedimentos"].push("Avaliação e atualização de situação vacinal");
      continue;
    }

    categories["Outros procedimentos"].push(text);
  }

  for (const key of Object.keys(categories)) {
    categories[key] = [...new Set(categories[key])];
  }

  return categories;
}

function buildExamCategoryLines(categories) {
  const lines = [];
  for (const [category, exams] of Object.entries(categories)) {
    if (!exams.length) continue;
    lines.push(`${category}:`);
    exams.forEach((exam, index) => {
      lines.push(`  ${index + 1}. ${exam}`);
    });
    lines.push("");
  }
  return lines;
}

function addExtraExamItem(name, checked = true) {
  const examName = String(name || "").trim();
  if (!examName) return;

  const li = document.createElement("li");
  const label = document.createElement("label");
  label.className = "recommendation-choice";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "extra-check";
  checkbox.checked = checked;
  checkbox.dataset.recommendation = examName;

  const span = document.createElement("span");
  span.textContent = examName;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "extra-remove-btn";
  removeBtn.textContent = "Remover";
  removeBtn.addEventListener("click", () => {
    li.remove();
    updateReportPreview();
  });

  label.appendChild(checkbox);
  label.appendChild(span);
  li.appendChild(label);
  li.appendChild(removeBtn);
  extraExamsList.appendChild(li);
}

function getSelectedExamTexts() {
  const recommended = [...recList.querySelectorAll(".rec-check:checked")]
    .map((input) => input.dataset.recommendation);
  const extra = [...extraExamsList.querySelectorAll(".extra-check:checked")]
    .map((input) => input.dataset.recommendation);
  return [...recommended, ...extra];
}

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

function buildVerificationCode(baseText) {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const digest = hashString(baseText).slice(0, 8);
  return `CUIDAR-${stamp}-${digest}`;
}

function buildFallbackVerifyUrl(code, payload) {
  const canUseCurrentOrigin = window.location.protocol === "http:" || window.location.protocol === "https:";
  if (canUseCurrentOrigin) {
    const url = new URL("/verify.html", window.location.origin);
    url.searchParams.set("code", code);
    url.searchParams.set("fallback", payload);
    return url.toString();
  }

  const url = new URL("https://cuidar.local/verify");
  url.searchParams.set("code", code);
  url.searchParams.set("fallback", payload);
  return url.toString();
}

async function issueVerificationOnBackend(report) {
  if (!window.fetch) return false;
  try {
    const response = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: report.text,
        meta: {
          source: window.location.pathname.includes("app-mobile") ? "app-web" : "web",
          doctorName: document.getElementById("doctor-name")?.value || "",
          doctorCrm: document.getElementById("doctor-crm")?.value || "",
          patientName: document.getElementById("patient-name")?.value || "",
          patientCpf: document.getElementById("patient-cpf")?.value || ""
        }
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const frontendVerifyUrl = new URL("/verify.html", window.location.origin);
    frontendVerifyUrl.searchParams.set("code", data.code);
    backendVerification = {
      contentHash: report.contentHash,
      code: data.code,
      verifyUrl: frontendVerifyUrl.toString(),
      qrPayload: frontendVerifyUrl.toString()
    };
    return true;
  } catch {
    if (!backendWarned) {
      backendWarned = true;
      console.warn(`Backend de validação indisponível em ${API_BASE}.`);
    }
    return false;
  }
}

function buildReport() {
  const doctorName = document.getElementById("doctor-name").value.trim() || "não informado";
  const doctorCrm = document.getElementById("doctor-crm").value.trim() || "não informado";
  const patientName = document.getElementById("patient-name").value.trim() || "não informado";
  const patientCpf = document.getElementById("patient-cpf").value.trim() || "não informado";
  const sex = document.getElementById("sex").value || "não informado";
  const age = document.getElementById("age").value || "não informada";
  const weight = document.getElementById("weight").value || "não informado";
  const height = document.getElementById("height").value || "não informada";
  const notes = document.getElementById("notes").value.trim() || "sem observações adicionais";
  const checked = [...document.querySelectorAll(".comorbidity-input:checked")]
    .map((item) => item.parentElement.textContent.trim());
  const riskList = checked.length ? checked.join(", ") : "nenhuma marcada";

  const currentCls = classificationInput.value.trim();
  const found = findClassificationMatch(currentCls);
  let clsText = currentCls || "não informado";
  if (found.exact) clsText = formatClassificationMatch(found.exact);

  const selectedRecommendations = getSelectedExamTexts();
  const categorized = categorizeSelectedRecommendations(selectedRecommendations);
  const examLines = buildExamCategoryLines(categorized);
  const imcText = imcBox.textContent || "IMC não calculado";
  const generatedAt = formatNowPtBr();

  const baseLines = [
    "CUIDAR+ | PRONTUÁRIO MÉDICO 100% DIGITAL",
    "SOLICITAÇÃO DE EXAME",
    "",
    `Paciente: ${patientName}`,
    `CPF: ${patientCpf}`,
    `Sexo: ${sex}   Idade: ${age}`,
    `Peso: ${weight} kg   Altura: ${height} m`,
    `${imcText}`,
    "",
    `Comorbidades/fatores: ${riskList}`,
    "",
    `Classificação diagnóstica (CID-11/APS): ${clsText}`,
    "",
    "Exames solicitados:",
    ...(examLines.length ? examLines : ["  Nenhum exame selecionado.", ""]),
    "Campo adicional (atestado, medicações, orientações):",
    ...(notes ? [`${notes}`] : ["sem observações adicionais"]),
    "",
    `Data e hora da solicitação: ${generatedAt}`,
    "",
    `Médico solicitante: ${doctorName}`,
    `CRM: ${doctorCrm}`
  ];

  const baseText = baseLines.join("\n");
  const contentHash = hashString(baseText);
  const verificationCode = (backendVerification && backendVerification.contentHash === contentHash)
    ? backendVerification.code
    : buildVerificationCode(baseText);
  const verificationPayload = [
    `app=CUIDAR+`,
    `tipo=solicitacao_exame`,
    `codigo=${verificationCode}`,
    `emitido=${generatedAt}`,
    `hash=${hashString(baseText)}`
  ].join("|");
  const verifyUrl = (backendVerification && backendVerification.contentHash === contentHash)
    ? backendVerification.verifyUrl
    : buildFallbackVerifyUrl(verificationCode, verificationPayload);
  const qrPayload = (backendVerification && backendVerification.contentHash === contentHash)
    ? (backendVerification.qrPayload || backendVerification.verifyUrl || verifyUrl)
    : verifyUrl;

  const text = [
    ...baseLines,
    "",
    `Código de verificação digital: ${verificationCode}`,
    `URL de validação: ${verifyUrl}`,
    "Valide a integridade deste documento pelo QR Code."
  ].join("\n");

  return { text, verificationCode, verificationPayload: qrPayload, contentHash, verifyUrl };
}

function updateReportPreview() {
  const report = buildReport();
  reportContent.textContent = report.text;

  if (verificationCodeEl) {
    verificationCodeEl.textContent = report.verificationCode;
  }

  if (verificationQr) {
    verificationQr.onerror = () => {
      verificationQr.alt = "Não foi possível carregar o QR Code. Use o código de verificação textual.";
    };
    verificationQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&ecc=M&data=${encodeURIComponent(report.verificationPayload)}`;
  }
}

async function ensureBackendVerification() {
  const report = buildReport();
  if (backendVerification && backendVerification.contentHash === report.contentHash) return true;
  const ok = await issueVerificationOnBackend(report);
  if (ok) updateReportPreview();
  return ok;
}

function saveDraft() {
  const payload = {
    doctorName: document.getElementById("doctor-name").value,
    doctorCrm: document.getElementById("doctor-crm").value,
    patientName: document.getElementById("patient-name").value,
    patientCpf: document.getElementById("patient-cpf").value,
    sex: document.getElementById("sex").value,
    age: document.getElementById("age").value,
    weight: document.getElementById("weight").value,
    height: document.getElementById("height").value,
    classification: classificationInput.value,
    notes: document.getElementById("notes").value,
    comorbidity: [...document.querySelectorAll(".comorbidity-input:checked")].map((el) => el.value),
    selectedRecommendations: [...document.querySelectorAll(".rec-check:checked")].map((el) => el.dataset.recommendation),
    extraExams: [...extraExamsList.querySelectorAll(".extra-check")].map((el) => ({
      name: el.dataset.recommendation,
      checked: el.checked
    }))
  };
  localStorage.setItem("prontuarioDraftV1", JSON.stringify(payload));
}

function loadDraft() {
  const raw = localStorage.getItem("prontuarioDraftV1");
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    document.getElementById("doctor-name").value = d.doctorName || "";
    document.getElementById("doctor-crm").value = d.doctorCrm || "";
    document.getElementById("patient-name").value = d.patientName || "";
    document.getElementById("patient-cpf").value = d.patientCpf || "";
    document.getElementById("sex").value = d.sex || "";
    document.getElementById("age").value = d.age || "";
    document.getElementById("weight").value = d.weight || "";
    document.getElementById("height").value = d.height || "";
    classificationInput.value = d.classification || "";
    document.getElementById("notes").value = d.notes || "";

    const selected = new Set(d.comorbidity || []);
    [...document.querySelectorAll(".comorbidity-input")].forEach((el) => {
      el.checked = selected.has(el.value);
    });

    if (document.getElementById("sex").value && document.getElementById("age").value && document.getElementById("weight").value && document.getElementById("height").value) {
      form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      const selectedRec = new Set(d.selectedRecommendations || []);
      [...document.querySelectorAll(".rec-check")].forEach((el) => {
        el.checked = selectedRec.has(el.dataset.recommendation);
      });
    }

    extraExamsList.innerHTML = "";
    (d.extraExams || []).forEach((exam) => {
      addExtraExamItem(exam?.name || "", Boolean(exam?.checked));
    });

    updateReportPreview();
  } catch {
    // ignore malformed draft
  }
}

function getSelectedComorbidities() {
  const checks = [...document.querySelectorAll(".comorbidity-input:checked")];
  return checks.map((item) => item.value);
}

function calcImc(weight, height) {
  if (!weight || !height) return null;
  return weight / (height * height);
}

function imcClass(imc) {
  if (imc < 18.5) return "baixo peso";
  if (imc < 25) return "eutrofia";
  if (imc < 30) return "sobrepeso";
  if (imc < 35) return "obesidade grau I";
  if (imc < 40) return "obesidade grau II";
  return "obesidade grau III";
}

function recommendationEngine({ sex, age, imc, comorb }) {
  const out = [];
  const hasRiskDM = comorb.includes("has") || comorb.includes("obesidade") || comorb.includes("drf");
  const hasCVRisk = comorb.includes("has") || comorb.includes("dm2") || comorb.includes("tabagismo") || comorb.includes("dcv");
  const overweight = imc >= 25;

  if (age >= 18) {
    out.push("Aferição de pressão arterial em consulta e seguimento periódico na APS.");
  }
  if (age >= 45 || (overweight && hasRiskDM) || comorb.includes("has")) {
    out.push("Rastreamento para DM2: glicemia de jejum (ou HbA1c conforme protocolo local). Se normal, repetir em até 3 anos.");
  }
  if (hasCVRisk || age >= 40) {
    out.push("Perfil lipídico e estratificação de risco cardiovascular global para prevenção primária.");
  }
  if (comorb.includes("dm2") || comorb.includes("has")) {
    out.push("Função renal (creatinina/eTFG) e albuminúria para vigilância de doença renal crônica.");
  }
  if (sex === "feminino" && age >= 50 && age <= 69) {
    out.push("Rastreamento de câncer de mama: mamografia bilateral a cada 2 anos.");
  }
  if (sex === "feminino" && age >= 25 && age <= 64) {
    out.push("Rastreamento de câncer do colo do útero conforme diretriz vigente do MS (modelo organizado com teste de HPV quando disponível na rede).");
  }
  if (age >= 25) {
    out.push("Verificar situação vacinal (hepatite B, dT e outras do calendário do adulto/idoso).");
  }
  if (!out.length) {
    out.push("Sem recomendações automáticas. Avaliar individualmente conforme risco clínico e protocolo local.");
  }
  return out;
}

function renderRecommendations(items) {
  recList.innerHTML = "";
  items.forEach((item, index) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    label.className = "recommendation-choice";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "rec-check";
    checkbox.checked = true;
    checkbox.dataset.recommendation = item;
    checkbox.id = `rec-item-${index}`;

    const span = document.createElement("span");
    span.textContent = item;

    label.appendChild(checkbox);
    label.appendChild(span);
    li.appendChild(label);
    recList.appendChild(li);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const sex = document.getElementById("sex").value;
  const age = Number(document.getElementById("age").value);
  const weight = Number(document.getElementById("weight").value);
  const height = Number(document.getElementById("height").value);
  const comorb = getSelectedComorbidities();

  const imc = calcImc(weight, height);
  if (!imc || Number.isNaN(imc)) {
    imcBox.textContent = "Não foi possível calcular IMC.";
    recList.innerHTML = "";
    updateReportPreview();
    return;
  }

  imcBox.textContent = `IMC: ${imc.toFixed(1)} kg/m² (${imcClass(imc)}).`;
  renderRecommendations(recommendationEngine({ sex, age, imc, comorb }));
  updateReportPreview();
});

classificationInput.addEventListener("input", () => {
  const current = classificationInput.value.trim();
  if (!current) {
    classificationMatch.textContent = "";
    updateReportPreview();
    return;
  }

  const found = findClassificationMatch(current);
  if (found.exact) {
    classificationMatch.textContent = `Correspondência: ${formatClassificationMatch(found.exact)}`;
  } else if (!found.suggestions.length) {
    classificationMatch.textContent = "Sem correspondência no dicionário local atual.";
  } else {
    const list = found.suggestions.map((item) => `${item.code} (${item.system})`).join(" | ");
    classificationMatch.textContent = `Sugestões: ${list}`;
  }
  updateReportPreview();
});

classificationInput.addEventListener("blur", () => {
  const found = findClassificationMatch(classificationInput.value.trim());
  if (found.exact) {
    classificationInput.value = formatClassificationMatch(found.exact);
    classificationMatch.textContent = `Correspondência: ${formatClassificationMatch(found.exact)}`;
    updateReportPreview();
  }
});

importDictBtn.addEventListener("click", () => {
  dictFileInput.click();
});

dictFileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const text = await file.text();
  let parsed = [];
  try {
    if (file.name.toLowerCase().endsWith(".json")) {
      parsed = JSON.parse(text);
    } else {
      parsed = parseCsvDictionary(text);
    }
  } catch {
    alert("Arquivo inválido. Use JSON ou CSV com colunas: system,code,name.");
    dictFileInput.value = "";
    return;
  }

  const merged = dedupeCatalog([...classificationCatalog, ...parsed]);
  if (!merged.length) {
    alert("Nenhum item válido encontrado. Formato esperado: system, code, name.");
    dictFileInput.value = "";
    return;
  }

  classificationCatalog = merged;
  saveCatalog();
  mountClassificationOptions();
  updateCatalogCount();
  classificationMatch.textContent = "Dicionário local atualizado com sucesso.";
  dictFileInput.value = "";
});

resetDictBtn.addEventListener("click", () => {
  classificationCatalog = dedupeCatalog(DEFAULT_CATALOG);
  saveCatalog();
  mountClassificationOptions();
  updateCatalogCount();
  classificationMatch.textContent = "Dicionário restaurado para o padrão local.";
});

copyBtn.addEventListener("click", async () => {
  await ensureBackendVerification();
  updateReportPreview();
  try {
    await navigator.clipboard.writeText(reportContent.textContent);
    copyBtn.textContent = "Copiado";
    setTimeout(() => {
      copyBtn.textContent = "Copiar texto para prontuário";
    }, 1200);
  } catch {
    alert("Não foi possível copiar automaticamente. Verifique permissões do navegador.");
  }
});

printBtn.addEventListener("click", async () => {
  await ensureBackendVerification();
  updateReportPreview();
  window.print();
});

pdfBtn.addEventListener("click", async () => {
  await ensureBackendVerification();
  updateReportPreview();
  window.print();
});

document.getElementById("notes").addEventListener("input", updateReportPreview);
document.getElementById("doctor-name").addEventListener("input", updateReportPreview);
document.getElementById("doctor-crm").addEventListener("input", updateReportPreview);
document.getElementById("patient-name").addEventListener("input", updateReportPreview);
document.getElementById("patient-cpf").addEventListener("input", updateReportPreview);
document.getElementById("sex").addEventListener("change", updateReportPreview);
document.getElementById("age").addEventListener("input", updateReportPreview);
document.getElementById("weight").addEventListener("input", updateReportPreview);
document.getElementById("height").addEventListener("input", updateReportPreview);
[...document.querySelectorAll(".comorbidity-input")].forEach((cb) => cb.addEventListener("change", updateReportPreview));
recList.addEventListener("change", (event) => {
  if (event.target.classList.contains("rec-check")) updateReportPreview();
});

if (extraExamsList) {
  extraExamsList.addEventListener("change", (event) => {
    if (event.target.classList.contains("extra-check")) updateReportPreview();
  });
}

if (addExtraExamBtn && extraExamInput) {
  addExtraExamBtn.addEventListener("click", () => {
    const name = extraExamInput.value.trim();
    if (!name) return;
    addExtraExamItem(name, true);
    extraExamInput.value = "";
    updateReportPreview();
    extraExamInput.focus();
  });

  extraExamInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addExtraExamBtn.click();
    }
  });
}

if (newRecordBtn && formAnchor) {
  newRecordBtn.addEventListener("click", () => {
    formAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("doctor-name").focus();
  });
}

if (recentBtn) {
  recentBtn.addEventListener("click", () => {
    const hasDraft = Boolean(localStorage.getItem("prontuarioDraftV1"));
    if (!hasDraft) {
      alert("Não há rascunhos recentes salvos.");
      return;
    }
    loadDraft();
    if (formAnchor) formAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
    const doctorInput = document.getElementById("doctor-name");
    if (doctorInput) doctorInput.focus();
  });
}

if (helpBtn) {
  helpBtn.addEventListener("click", () => {
    alert("Preencha os dados do paciente, clique em 'Gerar recomendações', selecione os exames no resumo, preencha CID/conduta e use 'Gerar documento' para imprimir ou salvar em PDF.");
  });
}

if (saveDraftBtn) {
  saveDraftBtn.addEventListener("click", () => {
    saveDraft();
    saveDraftBtn.textContent = "Rascunho salvo";
    setTimeout(() => {
      saveDraftBtn.textContent = "Salvar rascunho";
    }, 1200);
  });
}

if (generateDocumentBtn && documentDialog) {
  generateDocumentBtn.addEventListener("click", async () => {
    await ensureBackendVerification();
    setActiveStep(3);
    updateReportPreview();
    documentDialog.showModal();
  });
}

if (dialogPrintBtn && documentDialog) {
  dialogPrintBtn.addEventListener("click", () => {
    documentDialog.close();
    window.print();
  });
}

if (dialogPdfBtn && documentDialog) {
  dialogPdfBtn.addEventListener("click", () => {
    documentDialog.close();
    window.print();
    setTimeout(() => {
      alert("Na janela de impressão, selecione 'Salvar como PDF'.");
    }, 200);
  });
}

if (dialogCancelBtn && documentDialog) {
  dialogCancelBtn.addEventListener("click", () => {
    documentDialog.close();
  });
}

if (step1Section && step2Section && step3Section) {
  document.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (step1Section.contains(target)) {
      setActiveStep(1);
    } else if (step2Section.contains(target) || recList.contains(target)) {
      setActiveStep(2);
    } else if (step3Section.contains(target)) {
      setActiveStep(3);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      if (visible.target === step1Section) setActiveStep(1);
      if (visible.target === step2Section || visible.target === recList.closest(".panel")) setActiveStep(2);
      if (visible.target === step3Section) setActiveStep(3);
    },
    { threshold: [0.35, 0.6] }
  );

  observer.observe(step1Section);
  observer.observe(step2Section);
  observer.observe(step3Section);
  const summaryPanel = recList.closest(".panel");
  if (summaryPanel) observer.observe(summaryPanel);
}

loadCatalog();
mountClassificationOptions();
updateCatalogCount();
loadDraft();
updateReportPreview();
setActiveStep(1);
