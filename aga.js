(function () {
  "use strict";

  const Core = window.AgaCore;
  if (!Core) return;
  const CognitiveCore = window.CognitiveCore;

  const abvd = [["bathing", "Banho"], ["dressing", "Vestir-se"], ["toileting", "Uso do vaso sanitário"], ["transferring", "Transferências"], ["continence", "Continência"], ["feeding", "Alimentação"]];
  const aivd = [["telephone", "Telefone/comunicação"], ["transport", "Transporte"], ["shopping", "Compras"], ["foodPreparation", "Preparo de refeições"], ["housekeeping", "Tarefas domésticas"], ["laundry", "Lavanderia"], ["medications", "Uso de medicamentos"], ["finances", "Finanças"]];
  const gds = ["Está satisfeito(a) com a vida?", "Diminuiu muitas atividades e interesses?", "Sente que sua vida está vazia?", "Aborrece-se com frequência?", "Sente-se de bom humor na maior parte do tempo?", "Tem medo de que algo ruim aconteça?", "Sente-se feliz na maior parte do tempo?", "Sente-se desamparado(a) com frequência?", "Prefere ficar em casa a sair e fazer coisas novas?", "Acha que tem mais problemas de memória que outras pessoas?", "Acha maravilhoso estar vivo(a)?", "Sente-se inútil?", "Sente-se cheio(a) de energia?", "Sente-se sem esperança?", "Acha que as outras pessoas estão melhores que você?"];
  const select = (id, label, options) => `<label>${label}<select id="${id}"><option value="">Não avaliado</option>${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}</select></label>`;
  const katzOptions = [["independent", "Independente"], ["assistance", "Precisa de ajuda"], ["dependent", "Dependente"]];
  const lawtonOptions = [["3", "Independente"], ["2", "Ajuda parcial"], ["1", "Dependente"]];
  const cognitiveDomains = {
    meem: [["orientationTime", "Orientação temporal", 5], ["orientationPlace", "Orientação espacial", 5], ["registration", "Registro imediato", 3], ["attentionCalculation", "Atenção e cálculo", 5], ["recall", "Evocação tardia", 3], ["naming", "Nomeação", 2], ["repetition", "Repetição", 1], ["comprehension", "Compreensão", 3], ["reading", "Leitura", 1], ["writing", "Escrita", 1], ["drawing", "Cópia de desenho", 1]],
    moca: [["visuospatialExecutive", "Visuoespacial e funções executivas", 5], ["naming", "Nomeação", 3], ["attention", "Atenção", 6], ["language", "Linguagem", 3], ["abstraction", "Abstração", 2], ["delayedRecall", "Evocação tardia", 5], ["orientation", "Orientação", 6]]
  };
  const cognitiveScoreFields = (kind) => cognitiveDomains[kind].map(([id, label, max]) => `<label>${label}<input id="aga-${kind}-${id}" type="number" min="0" max="${max}" step="1" inputmode="numeric" placeholder="0–${max}" /></label>`).join("");
  const cognitiveInstrument = (kind, title, officialUrl, extra = "") => `<details class="aga-cognitive" id="aga-${kind}-details"><summary><span>${title}</span><small>Registrar resultado do formulário autorizado</small></summary><div class="aga-cognitive-body"><p>Este sistema não exibe perguntas, estímulos, instruções nem reproduz o instrumento. Aplique a versão autorizada externamente e registre apenas os escores por domínio abaixo. <a href="${officialUrl}" target="_blank" rel="noreferrer">Acessar fonte oficial</a>.</p>${extra}<div class="aga-grid aga-cognitive-grid">${cognitiveScoreFields(kind)}</div></div></details>`;

  function buildContent() {
    const section = document.createElement("section");
    section.id = "aga-content";
    section.className = "aga-content";
    section.hidden = true;
    section.innerHTML = `
      <div class="aga-layout">
        <main class="aga-main">
          <section class="panel card aga-card aga-hero-card"><span class="aga-eyebrow">SAÚDE DA PESSOA IDOSA</span><h2>Avaliação geriátrica ampla</h2><p>Rastreio multidimensional para organizar a avaliação clínica. Não substitui anamnese, exame físico, diagnóstico ou decisão compartilhada.</p></section>
          <section class="panel card aga-card aga-privacy"><strong>Uso local e sem identificadores.</strong> Não informe nome, CPF, endereço ou dados profissionais. O preenchimento não é salvo.</section>
          <form id="aga-form" novalidate>
            <section class="panel card aga-card"><h2>IVCF-20 — resultado do formulário oficial</h2><p>Após aplicar integralmente o <a href="https://www.gov.br/saude/pt-br/composicao/saps/publicacoes/cadernetas-e-cartoes/caderneta-brasileira-da-pessoa-idosa/@@download/file#page=67" target="_blank" rel="noreferrer">IVCF-20 da Caderneta MS 2026 (p. 66–71)</a>, registre o total. Este campo não aplica nem calcula os 20 itens.</p><label>Escore total do IVCF-20 já aplicado<input id="aga-ivcf" type="number" min="0" max="40" step="1" placeholder="0–40; deixe vazio se não aplicado"></label></section>
            <section class="panel card aga-card"><div class="aga-heading"><span>1</span><div><h2>Funcionalidade</h2><p>Registro descritivo de seis atividades básicas e oito instrumentais. Adaptação educativa; não substitui a aplicação padronizada das escalas.</p></div></div>
              <h3>ABVD — registro baseado em Katz</h3><div class="aga-grid aga-function-grid">${abvd.map(([id, label]) => select(`aga-abvd-${id}`, label, katzOptions)).join("")}</div>
              <h3>AIVD — registro baseado em Lawton</h3><div class="aga-grid aga-function-grid">${aivd.map(([id, label]) => select(`aga-aivd-${id}`, label, lawtonOptions)).join("")}</div>
            </section>
            <section class="panel card aga-card"><div class="aga-heading"><span>2</span><div><h2>Cognição e humor</h2><p>Instrumentos de rastreio; resultados alterados exigem correlação clínica e avaliação de causas reversíveis.</p></div></div>
              <div class="aga-grid">
                ${select("aga-cog-complaint", "Queixa de memória/cognição", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-cog-informant", "Preocupação de familiar/cuidador", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-cog-clock", "Teste do relógio", [["normal", "Sem alteração observada"], ["altered", "Alterado"], ["notPerformed", "Não realizado"]])}
                <label>Fluência verbal (animais em 1 min)<input id="aga-cog-fluency" type="number" min="0" max="80" inputmode="numeric" placeholder="Quantidade" /></label>
                <label>Anos de escolaridade, se usado para interpretação<input id="aga-cog-education" type="number" min="0" max="30" inputmode="numeric" /></label>
              </div>
              <section class="aga-cognitive-section" aria-labelledby="aga-cognitive-title"><h3 id="aga-cognitive-title">Registro de instrumentos cognitivos aplicados externamente</h3><p class="muted">Escores completos e parciais são mantidos como registrados. A plataforma não conclui diagnóstico e não substitui treinamento, autorização ou formulário oficial.</p>
                ${cognitiveInstrument("meem", "MEEM — escore por domínio", "https://saude.rs.gov.br/upload/arquivos/201701/26142752-1330633714-mine-exame-do-estado-mental-meem.pdf", `<p class="aga-test-link-note">O link abre o formulário do MEEM em português publicado pela Secretaria da Saúde do Rio Grande do Sul.</p>`)}
                ${cognitiveInstrument("moca", "MoCA — escore por domínio", "https://mocacognition.com/paper", `<p class="aga-test-link-note">Na página oficial, selecione a versão desejada e o idioma <strong>Portuguese</strong> para baixar o formulário correspondente.</p><div class="aga-grid aga-cognitive-options">${select("aga-moca-family", "Família/forma oficial aplicada", [["full", "MoCA Full (30 pontos)"], ["basic", "MoCA Basic — não suportado neste registro"], ["blind", "MoCA Blind — não suportado neste registro"], ["other", "Outra versão — não suportada neste registro"]])}<label>Anos de escolaridade (para registro)<input id="aga-moca-education-years" type="number" min="0" max="30" step="1" inputmode="numeric" /></label><label>Versão oficial aplicada<input id="aga-moca-version" type="text" maxlength="80" placeholder="Identificador da versão autorizada" /></label>${select("aga-moca-version-confirmed", "Versão confirmada pelo aplicador", [["yes", "Sim"], ["no", "Não"]])}${select("aga-moca-correction-rule", "Correção educacional registrada", [["moca-full-standard-12-or-fewer-plus-1", "MoCA Full: +1 para ≤12 anos, máximo 30"], ["none", "Sem correção registrada"]])}</div>`)}</section><div id="aga-cognitive-errors" class="aga-cognitive-errors" role="alert" hidden></div>
              <h3>GDS-15 — registro educativo</h3><p class="muted">Marque todas as 15 respostas para obter pontuação; em ausência de respostas o resultado fica pendente. Pontos de corte da aula aguardam confirmação em fonte MS; não há classificação automática de depressão.</p><div class="aga-gds">${gds.map((q, i) => `<fieldset><legend>${i + 1}. ${q}</legend><label><input type="radio" name="aga-gds-${i + 1}" value="sim" /> Sim</label><label><input type="radio" name="aga-gds-${i + 1}" value="nao" /> Não</label></fieldset>`).join("")}</div>
            </section>
            <section class="panel card aga-card"><div class="aga-heading"><span>3</span><div><h2>Mobilidade, nutrição e sentidos</h2><p>Registre medida e contexto; não assuma ausência de risco quando não houver informação.</p></div></div>
              <div class="aga-grid">
                ${select("aga-falls", "Quedas nos últimos 12 meses", [["sim", "Sim"], ["nao", "Não"]])}
                <label>Timed Up and Go — segundos (registro; avaliar quedas em conjunto)<input id="aga-tug" type="number" min="0.1" max="180" step="0.1" inputmode="decimal" /></label>
                ${select("aga-walking", "Dificuldade para caminhar", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-device", "Usa dispositivo de apoio", [["sim", "Sim"], ["nao", "Não"]])}
                <label>Perda de peso involuntária — kg<input id="aga-weight-loss" type="number" min="0" max="80" step="0.1" inputmode="decimal" /></label>
                <label>Período da perda — meses<input id="aga-weight-loss-months" type="number" min="0" max="24" step="1" inputmode="numeric" /></label>
                <label>IMC, se disponível<input id="aga-bmi" type="number" min="8" max="80" step="0.1" inputmode="decimal" /></label>
                <label>Perímetro da panturrilha — cm<input id="aga-calf" type="number" min="15" max="70" step="0.1" inputmode="decimal" /></label>
                ${select("aga-intake", "Redução recente da ingestão alimentar", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-vision", "Dificuldade visual", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-hearing", "Dificuldade auditiva", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-whisper", "Teste do sussurro", [["normal", "Sem alteração observada"], ["abnormal", "Alterado"], ["notPerformed", "Não realizado"]])}
              </div>
            </section>
            <section class="panel card aga-card"><div class="aga-heading"><span>4</span><div><h2>Medicamentos e rede de apoio</h2><p>Revisar prescrição, indicação, riscos e capacidade de manejo em cada consulta.</p></div></div>
              <div class="aga-grid">
                <label>Medicamentos em uso (um por linha, sem dados identificáveis)<textarea id="aga-medications" rows="4" placeholder="Ex.: metformina 500 mg"></textarea></label>
                ${select("aga-adverse", "Suspeita de efeito adverso", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-adherence", "Dificuldade para organizar/usar medicamentos", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-alone", "Mora sozinho(a)", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-support", "Rede de apoio disponível", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-caregiver", "Sobrecarga do cuidador", [["sim", "Sim"], ["nao", "Não"]])}
                ${select("aga-violence", "Suspeita/preocupação com violência", [["sim", "Sim"], ["nao", "Não"]])}
              </div>
              <label>Plano de cuidado, metas, ambiente, preferências e reavaliação (sem identificadores)<textarea id="aga-notes" rows="4" placeholder="Descreva prioridades, segurança do ambiente, ações da equipe, preferências da pessoa idosa e prazo para reavaliação."></textarea></label>
            </section>
            <div class="aga-actions"><button type="submit">Atualizar síntese AGA</button><button id="aga-clear" type="button" class="aga-secondary">Limpar AGA</button></div>
          </form>
          <section class="panel card aga-card" id="aga-final-report"><h2>Resumo AGA</h2><pre id="aga-report" class="report-pre">Preencha os domínios para gerar a síntese. Campos incompletos permanecerão como pendentes.</pre></section>
        </main>
        <aside class="aga-side">
          <section class="panel card aga-card aga-sticky"><h3>Síntese de rastreio</h3><div id="aga-status" class="aga-status">Ainda não avaliada.</div><div id="aga-flags" class="aga-flags"></div><div class="quick aga-quick"><button id="aga-copy" type="button">Copiar resumo</button><button id="aga-print" type="button">Imprimir / salvar PDF</button></div></section>
          <section class="panel card aga-card refs"><h3>Critérios e fontes</h3><div id="aga-source-status" class="aga-source-status">Verificando status da fonte...</div><ul><li><a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa" target="_blank" rel="noreferrer">Ministério da Saúde — Saúde da Pessoa Idosa</a></li><li><a href="https://www.gov.br/saude/pt-br/composicao/saps/publicacoes/cadernetas-e-cartoes/caderneta-brasileira-da-pessoa-idosa/view" target="_blank" rel="noreferrer">Caderneta Brasileira da Pessoa Idosa</a></li></ul><p class="muted">Monitor semanal preparado no repositório. A execução depende de publicação e ativação do GitHub Actions. Alterações nas fontes exigem revisão clínica antes de mudar critérios. A data é a última consulta incluída nesta versão.</p></section>
        </aside>
      </div>`;
    return section;
  }

  const adultDesktop = document.querySelector("main.content-grid");
  const mobileHost = document.querySelector(".app-content");
  if (!adultDesktop && !mobileHost) return;
  const content = buildContent();
  if (adultDesktop) adultDesktop.insertAdjacentElement("afterend", content); else mobileHost.appendChild(content);
  const $ = (id) => content.querySelector(id);
  const val = (id) => $(id).value || null;
  const bool = (id) => { const value = val(id); return value === "sim" ? true : value === "nao" ? false : null; };
  const numeric = (id) => { const value = $(id).value; return value === "" ? null : Number(value); };
  let lastResult = null;

  function readCognitiveInstrument(kind) {
    const domains = Object.fromEntries(cognitiveDomains[kind].map(([id]) => [id, numeric(`#aga-${kind}-${id}`)]));
    const entered = Object.values(domains).filter((value) => value !== null);
    const complete = entered.length === cognitiveDomains[kind].length;
    const input = {
      status: entered.length === 0 ? "notApplied" : complete ? "complete" : "partial",
      domains,
      total: entered.length ? entered.reduce((sum, value) => sum + value, 0) : null,
      appliedOnOfficialForm: entered.length > 0
    };
    if (kind === "moca") {
      input.versionFamily = val("#aga-moca-family");
      input.educationYears = numeric("#aga-moca-education-years");
      input.version = val("#aga-moca-version");
      input.versionConfirmed = val("#aga-moca-version-confirmed") === "yes";
      input.educationCorrectionRule = val("#aga-moca-correction-rule") === "none" ? null : val("#aga-moca-correction-rule");
    }
    return input;
  }

  function readInput() {
    const group = (items, prefix, convert) => Object.fromEntries(items.map(([key]) => [key, convert($(`#${prefix}-${key}`).value)]));
    const gds15 = Object.fromEntries(gds.map((_, i) => [i + 1, content.querySelector(`input[name="aga-gds-${i + 1}"]:checked`)?.value || null]));
    return {
      ivcf20Score: numeric("#aga-ivcf"), abvd: group(abvd, "aga-abvd", (value) => value || null), aivd: group(aivd, "aga-aivd", (value) => value ? Number(value) : null),
      cognition: { complaint: bool("#aga-cog-complaint"), informantConcern: bool("#aga-cog-informant"), clockTest: val("#aga-cog-clock"), verbalFluency: numeric("#aga-cog-fluency"), meemScore: null, education: numeric("#aga-cog-education"), meem: readCognitiveInstrument("meem"), moca: readCognitiveInstrument("moca") },
      mood: { gds15 }, mobility: { fallsLast12Months: bool("#aga-falls"), tugSeconds: numeric("#aga-tug"), walkingDifficulty: bool("#aga-walking"), assistiveDevice: bool("#aga-device") },
      nutrition: { weightLossKg: numeric("#aga-weight-loss"), weightLossMonths: numeric("#aga-weight-loss-months"), bmi: numeric("#aga-bmi"), calfCircumferenceCm: numeric("#aga-calf"), reducedIntake: bool("#aga-intake") },
      senses: { visionDifficulty: bool("#aga-vision"), hearingDifficulty: bool("#aga-hearing"), whisperTestAbnormal: val("#aga-whisper") === "abnormal" ? true : val("#aga-whisper") === "normal" ? false : null },
      medications: { items: $("#aga-medications").value.split("\n").map((x) => x.trim()).filter(Boolean), adverseEffects: bool("#aga-adverse"), adherenceDifficulty: bool("#aga-adherence") },
      social: { livesAlone: bool("#aga-alone"), supportAvailable: bool("#aga-support"), caregiverOverload: bool("#aga-caregiver"), violenceConcern: bool("#aga-violence") }, notes: $("#aga-notes").value.trim()
    };
  }

  function flatten(value) { return Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value).flatMap(flatten) : typeof value === "string" ? [value] : []; }
  function cognitiveAssessment(input) {
    if (!CognitiveCore) return null;
    return {
      meem: CognitiveCore.assessMeem(input.cognition.meem),
      moca: CognitiveCore.assessMoca(input.cognition.moca)
    };
  }
  function cognitiveErrors(input, assessment) {
    const errors = [];
    const cognitiveHasData = input.cognition.meem.status !== "notApplied" || input.cognition.moca.status !== "notApplied";
    if (!assessment && cognitiveHasData) errors.push("O módulo de registro cognitivo não foi carregado. Recarregue a página antes de gerar ou exportar a síntese.");
    const mocaHasData = input.cognition.moca.status !== "notApplied";
    if (mocaHasData && input.cognition.moca.versionFamily !== "full") errors.push("Selecione MoCA Full de 30 pontos para registrar escores nesta tela. MoCA Basic, Blind e outras versões exigem o formulário e fluxo autorizados correspondentes.");
    if (assessment) for (const result of Object.values(assessment)) errors.push(...(result.errors || []));
    return [...new Set(errors)];
  }
  function showCognitiveErrors(errors, assessment) {
    const box = $("#aga-cognitive-errors");
    box.hidden = errors.length === 0;
    box.textContent = errors.join(" ");
    if (errors.length) {
      $("#aga-moca-details").open = true;
      if (assessment?.meem?.errors?.length) $("#aga-meem-details").open = true;
    }
  }
  function cognitiveProgress(assessment) {
    if (!assessment) return "Registro de MEEM/MoCA indisponível: módulo de escores não foi carregado.";
    const label = (name, result) => result.status === "notApplied" ? `${name}: não registrado` : result.complete ? `${name}: completo (${result.rawTotal}/${result.maxScore})` : `${name}: parcial (sem total; ${result.missingDomains.length} domínio(s) pendente(s))`;
    return `${label("MEEM", assessment.meem)}. ${label("MoCA", assessment.moca)}.`;
  }
  function render() {
    content.querySelectorAll("input:invalid, select:invalid, textarea:invalid").forEach((field) => { const details = field.closest("details"); if (details) details.open = true; });
    if (!$("#aga-form").reportValidity()) { content.querySelector(":invalid")?.closest("details")?.setAttribute("open", ""); $("#aga-status").textContent = "Corrija os valores inválidos antes de gerar ou exportar a síntese."; return false; }
    const input = readInput();
    const cognitive = cognitiveAssessment(input);
    const cognitiveIssues = cognitiveErrors(input, cognitive);
    showCognitiveErrors(cognitiveIssues, cognitive);
    if (cognitiveIssues.length) { $("#aga-status").textContent = "Corrija o registro cognitivo antes de gerar ou exportar a síntese."; return false; }
    lastResult = Core.evaluate(input);
    const incomplete = [lastResult.abvd, lastResult.aivd, lastResult.mood, lastResult.mobility?.tug].filter((domain) => domain?.complete === false).length;
    const flags = [...new Set((lastResult.flags || []).filter(Boolean))];
    $("#aga-status").textContent = `${incomplete ? `${incomplete} instrumento(s) com dados pendentes; nenhum resultado incompleto é tratado como normal.` : "Instrumentos pontuados preenchidos. Os demais domínios podem ainda estar pendentes."} ${cognitiveProgress(cognitive)}`;
    $("#aga-flags").innerHTML = flags.length ? flags.map((item) => `<p>${item}</p>`).join("") : "<p class=\"muted\">Sem sinalizadores gerados pelos dados preenchidos.</p>";
    const summary = typeof Core.buildSummary === "function" ? Core.buildSummary(lastResult) : JSON.stringify(lastResult, null, 2);
    const cognitiveSummary = cognitive && typeof CognitiveCore.buildCognitiveSummary === "function" ? CognitiveCore.buildCognitiveSummary(cognitive) : "";
    $("#aga-report").textContent = `${typeof summary === "string" ? summary : JSON.stringify(summary, null, 2)}${cognitiveSummary ? `\n\nAvaliação cognitiva registrada\n${cognitiveSummary}` : ""}`;
    return true;
  }
  function reset() { $("#aga-form").reset(); lastResult = null; $("#aga-status").textContent = "Ainda não avaliada."; $("#aga-flags").innerHTML = ""; $("#aga-cognitive-errors").hidden = true; $("#aga-cognitive-errors").textContent = ""; content.querySelectorAll(".aga-cognitive").forEach((details) => { details.open = false; }); $("#aga-report").textContent = "Preencha os domínios para gerar a síntese. Campos incompletos permanecerão como pendentes."; }
  function setMode(mode) {
    const active = mode === "aga";
    content.hidden = !active;
    if (!active) {
      if (mobileHost) { const firstAdult = document.getElementById("clinical-form")?.closest(".card"); for (const card of mobileHost.querySelectorAll(":scope > .card")) { if (card === firstAdult) break; card.hidden = false; } }
      return;
    }
    if (adultDesktop) { adultDesktop.hidden = true; document.querySelector(".steps")?.toggleAttribute("hidden", true); }
    else [...document.querySelectorAll(".app-content > .card")].forEach((card) => { card.hidden = true; });
    document.body.dataset.careMode = "aga";
    content.scrollIntoView({ block: "start" });
  }
  document.querySelectorAll('input[name="care-mode"]').forEach((input) => input.addEventListener("change", () => {
    if (input.checked) setMode(input.value);
  }));
  $("#aga-form").addEventListener("submit", (event) => { event.preventDefault(); render(); });
  $("#aga-clear").addEventListener("click", reset);
  $("#aga-copy").addEventListener("click", async () => { if (!render()) return; try { await navigator.clipboard.writeText($("#aga-report").textContent); $("#aga-copy").textContent = "Resumo copiado"; setTimeout(() => { $("#aga-copy").textContent = "Copiar resumo"; }, 1200); } catch { alert("Não foi possível copiar automaticamente. Verifique as permissões do navegador."); } });
  $("#aga-print").addEventListener("click", () => { if (render()) window.print(); });
  ["copy-btn", "print-btn", "pdf-btn", "generate-document-btn", "reset-form-btn"].forEach((id) => document.getElementById(id)?.addEventListener("click", (event) => {
    if (document.body.dataset.careMode !== "aga") return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (id === "copy-btn") $("#aga-copy").click(); else if (id === "reset-form-btn") reset(); else if (id === "generate-document-btn") { render(); $("#aga-final-report").scrollIntoView({ behavior: "smooth" }); } else $("#aga-print").click();
  }, true));
  fetch("./data/aga-source-status.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject()).then((status) => {
    const checked = status.lastChecked || status.last_checked || status.checkedAt;
    const sources = Object.values(status.sources || {});
    const pending = sources.filter((source) => source.clinicalReviewPending || source.status === "indisponivel").length;
    const date = checked ? new Date(checked) : null;
    const stale = !date || !Number.isFinite(date.getTime()) || Date.now() - date.getTime() > 8 * 86400000;
    $("#aga-source-status").textContent = `Consulta incluída nesta versão: ${date && Number.isFinite(date.getTime()) ? date.toLocaleString("pt-BR") : "indisponível"}. ${stale ? "Verificação desatualizada ou sem data. " : ""}${pending ? `${pending} fonte(s) com pendência ou indisponibilidade.` : "Nenhuma alteração pendente detectada; isso não certifica validade clínica."}`;
    const list = document.createElement("ul");
    sources.forEach((source) => { const li = document.createElement("li"); const link = document.createElement("a"); const url = new URL(source.url); if (url.protocol !== "https:" || !(/(^|\.)saude\.gov\.br$/.test(url.hostname) || url.hostname === "www.gov.br")) return; link.href = url.href; link.target = "_blank"; link.rel = "noreferrer"; link.textContent = source.title; li.append(link, ` — ${source.error ? "indisponível; " : ""}${source.clinicalReviewPending ? "revisão pendente" : ({baseline_registrada:"primeira consulta registrada", inalterado:"sem mudança detectada", indisponivel:"consulta indisponível"})[source.status] || "revisão pendente"}`); list.append(li); });
    const details = document.createElement("details"); const heading = document.createElement("summary"); heading.textContent = "Consultar fontes monitoradas"; details.append(heading, list); $("#aga-source-status").append(details);
  }).catch(() => { $("#aga-source-status").textContent = "Status da fonte indisponível nesta instalação; a checagem periódica permanece pendente."; });
  window.AgaModule = { evaluate: render, reset, setMode, readInput };
})();
