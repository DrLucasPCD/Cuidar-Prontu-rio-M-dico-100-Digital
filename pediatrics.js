(function () {
  "use strict";

  const Core = window.PediatricCore;
  if (!Core) return;

  const milestones = [
    { age: 1, label: "RN–1 mês", items: [
      ["motor", "Predomínio do tônus flexor, membros fletidos e mãos fechadas"],
      ["motor", "Reflexo de Moro presente"], ["comunicação", "Reflexo cócleo-palpebral presente"],
      ["motor", "Reflexo de sucção presente"], ["motor", "Reflexo da marcha presente"],
      ["motor", "Reflexo de Babinski presente"]
    ] },
    { age: 2, label: "2 meses", items: [
      ["social", "Fixa o olhar a cerca de 30 cm"], ["comunicação", "Segue o som"],
      ["social", "Apresenta sorriso social"], ["comunicação", "Vocaliza sons guturais/vogais"],
      ["motor", "Movimenta ativamente os membros e abre as mãos"], ["motor", "Em prona, inicia sustentação da cabeça"]
    ] },
    { age: 4, label: "4 meses", items: [
      ["social", "Sorri espontaneamente e responde ao afeto"], ["comunicação", "Começa a balbuciar"],
      ["cognição", "Leva mãos e pés à boca"], ["motor", "Segura objetos e tenta alcançá-los"],
      ["motor", "Em prona, sustenta a cabeça e apoia-se nos cotovelos"]
    ] },
    { age: 6, label: "6 meses", items: [
      ["comunicação", "Responde aos sons emitindo sons"], ["social", "Responde ao próprio nome"],
      ["cognição", "Observa as coisas ao redor"], ["motor", "Passa objetos de uma mão para outra"],
      ["motor", "Rola em todas as direções"], ["motor", "Senta com apoio"],
      ["motor", "Apoia peso/salta quando colocado em pé"], ["social", "Fecha os lábios para indicar saciedade"]
    ] },
    { age: 9, label: "9 meses", items: [
      ["cognição", "Demonstra preferência por brinquedos"], ["comunicação", "Compreende ‘não’"],
      ["social", "Imita sons e gestos"], ["comunicação", "Aponta para objetos"],
      ["social", "Brinca de esconder-achar"], ["motor", "Senta completamente sem apoio"],
      ["motor", "Engatinha"], ["motor", "Fica em pé com apoio"]
    ] },
    { age: 12, label: "12 meses", items: [
      ["social", "Demonstra medo/timidez diante de estranhos"], ["social", "Reage quando os cuidadores se afastam"],
      ["comunicação", "Responde a pedidos verbais simples"], ["comunicação", "Emite sons semelhantes a palavras"],
      ["comunicação", "Fala ‘mama’/‘papa’"], ["motor", "Pode ficar em pé e/ou dar alguns passos"]
    ] },
    { age: 18, label: "18 meses", items: [
      ["social", "Demonstra medo de estranhos"], ["cognição", "Brinca de faz-de-conta"],
      ["cognição", "Explora o ambiente"], ["comunicação", "Fala diversas palavras simples"],
      ["motor", "Faz rabiscos"], ["cognição", "Reconhece o uso de utensílios simples"],
      ["motor", "Anda sozinho, sobe degraus e pode correr"], ["motor", "Come com colher e bebe em copo"]
    ] }
  ];

  const mchatQuestions = [
    "Se você apontar para qualquer coisa do outro lado do cômodo, sua criança olha para o que você está apontando? (Por exemplo: se você apontar para um brinquedo ou um animal, sua criança olha para o brinquedo ou animal?)",
    "Alguma vez você já se perguntou se sua criança poderia ser surda?",
    "Sua criança brinca de faz-de-conta? (Por exemplo, finge que está bebendo em um copo vazio ou falando ao telefone, ou finge que dá comida a uma boneca ou a um bicho de pelúcia?)",
    "Sua criança gosta de subir nas coisas? (Por exemplo: móveis, brinquedos de parque ou escadas)",
    "Sua criança faz movimentos incomuns com os dedos perto dos olhos? (Por exemplo, abana os dedos perto dos olhos?)",
    "Sua criança aponta com o dedo para pedir algo ou para conseguir ajuda? (Por exemplo, aponta para um alimento ou brinquedo que está fora do seu alcance?)",
    "Sua criança aponta com o dedo para lhe mostrar algo interessante? (Por exemplo, aponta para um avião no céu ou um caminhão grande na estrada?)",
    "Sua criança interessa-se por outras crianças? (Por exemplo, sua criança observa outras crianças, sorri para elas ou aproxima-se delas?)",
    "Sua criança mostra-lhe coisas, trazendo-as ou segurando-as para que você as veja — não para obter ajuda, mas apenas para compartilhar com você? (Por exemplo, mostra uma flor, um bicho de pelúcia ou um caminhão de brinquedo?)",
    "Sua criança responde quando você a chama pelo nome? (Por exemplo, olha, fala ou balbucia ou para o que está fazendo, quando você a chama pelo nome?)",
    "Quando você sorri para sua criança, ela sorri de volta para você?",
    "Sua criança fica incomodada com os ruídos do dia a dia? (Por exemplo, sua criança grita ou chora com barulhos como o do aspirador ou de música alta?)",
    "Sua criança já anda?",
    "Sua criança olha você nos olhos quando você fala com ela, brinca com ela ou veste-a?",
    "Sua criança tenta imitar aquilo que você faz? (Por exemplo, dá tchau, bate palmas ou faz sons engraçados quando você os faz?)",
    "Se você virar a sua cabeça para olhar para alguma coisa, sua criança olha em volta para ver o que é que você está olhando?",
    "Sua criança busca que você preste atenção nela? (Por exemplo, sua criança olha para você para receber um elogio ou lhe diz ‘olha’ ou ‘olha para mim’?)",
    "Sua criança compreende quando você lhe diz para fazer alguma coisa? (Por exemplo, se você não apontar, ela consegue compreender ‘ponha o livro na cadeira’ ou ‘traga o cobertor’?)",
    "Quando alguma coisa nova acontece, sua criança olha para o seu rosto para ver sua reação? (Por exemplo, se ela ouve um barulho estranho ou engraçado, ou vê um brinquedo novo, ela olha para o seu rosto?)",
    "Sua criança gosta de atividades com movimento? (Por exemplo, ser balançada ou pular nos seus joelhos?)"
  ];

  const riskFactors = [
    ["prematuridade", "Prematuridade ou baixo peso ao nascer"], ["parto_domiciliar", "Parto domiciliar"],
    ["mae_adolescente", "Mãe adolescente"], ["drogas", "Uso de drogas pelos responsáveis"],
    ["vulnerabilidade", "Condições familiares/ambientais desfavoráveis"], ["transmissao_vertical", "Doença de transmissão vertical"],
    ["desmame", "Desmame antes dos 6 meses"], ["internacao", "Internação prévia"],
    ["desnutricao", "Desnutrição"], ["evolucao", "Crescimento ou desenvolvimento inadequado"]
  ];

  const today = (() => {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  })();

  function milestoneMarkup() {
    return milestones.map((group) => `
      <details class="peds-age-group" data-milestone-age="${group.age}">
        <summary>${group.label}<span class="peds-age-status">não avaliado</span></summary>
        <div class="peds-milestone-list">
          ${group.items.map((item, index) => `
            <label class="peds-milestone-row">
              <span><small>${item[0]}</small>${item[1]}</span>
              <select class="peds-milestone" data-age="${group.age}" data-label="${item[1]}" data-domain="${item[0]}" aria-label="Situação: ${item[1]}">
                <option value="">Não avaliado</option>
                <option value="atingido">Atingido/presente</option>
                <option value="nao_atingido">Não atingido/ausente</option>
                <option value="nao_observado">Não observado</option>
                <option value="nao_aplicavel">Não aplicável</option>
              </select>
            </label>`).join("")}
        </div>
      </details>`).join("");
  }

  function mchatMarkup() {
    return mchatQuestions.map((question, index) => `
      <fieldset class="peds-mchat-item">
        <legend>${index + 1}. ${question}</legend>
        <label><input type="radio" name="peds-mchat-${index + 1}" value="sim"> Sim</label>
        <label><input type="radio" name="peds-mchat-${index + 1}" value="nao"> Não</label>
      </fieldset>`).join("");
  }

  function buildPediatricContent() {
    const section = document.createElement("section");
    section.id = "pediatric-content";
    section.className = "pediatric-content";
    section.hidden = true;
    section.innerHTML = `
      <div class="pediatric-layout">
        <div class="pediatric-main">
          <section class="panel card peds-card peds-hero-card">
            <div><span class="peds-eyebrow">PUERICULTURA</span><h2>Acompanhamento pediátrico</h2><p>Crescimento, desenvolvimento, M-CHAT-R/F e saúde bucal em um fluxo longitudinal.</p></div>
            <div class="peds-hero-actions">
              <button id="peds-reset" class="peds-secondary" type="button">Limpar formulário</button>
              <button id="peds-generate-document" type="button">Gerar documento</button>
            </div>
          </section>

          <form id="peds-form">
            <section class="panel card peds-card">
              <div class="peds-section-heading"><span>1</span><div><h2>Consulta e antropometria</h2><p>As datas e medidas permanecem somente nesta página.</p></div></div>
              <div class="peds-grid">
                <label>Data de nascimento<input id="peds-dob" type="date" required></label>
                <label>Data da consulta<input id="peds-visit-date" type="date" value="${today}" required></label>
                <label>Sexo para a curva OMS<select id="peds-sex" required><option value="">Selecione</option><option value="feminino">Feminino</option><option value="masculino">Masculino</option></select></label>
                <label>Idade gestacional ao nascer (semanas)<input id="peds-gest-weeks" type="number" min="22" max="42" step="1" placeholder="Ex.: 34"></label>
                <label>Peso atual (kg)<input id="peds-weight" type="number" min="0.3" max="250" step="0.001" required></label>
                <label>Comprimento/estatura (cm)<input id="peds-height" type="number" min="30" max="230" step="0.1" required></label>
                <label>Técnica da medida<select id="peds-height-method"><option value="comprimento">Deitado (comprimento)</option><option value="estatura">Em pé (estatura)</option></select></label>
                <label>Perímetro cefálico (cm)<input id="peds-head" type="number" min="20" max="70" step="0.1"></label>
              </div>
              <details class="peds-previous">
                <summary>Adicionar medida anterior para calcular velocidade</summary>
                <div class="peds-grid">
                  <label>Data anterior<input id="peds-prev-date" type="date"></label>
                  <label>Peso anterior (kg)<input id="peds-prev-weight" type="number" min="0.3" max="250" step="0.001"></label>
                  <label>Comprimento/estatura anterior (cm)<input id="peds-prev-height" type="number" min="30" max="230" step="0.1"></label>
                  <label>PC anterior (cm)<input id="peds-prev-head" type="number" min="20" max="70" step="0.1"></label>
                </div>
              </details>
              <div class="peds-actions"><button type="submit">Calcular e atualizar avaliação</button></div>
            </section>

            <section class="panel card peds-card" id="peds-growth-section">
              <div class="peds-section-heading"><span>2</span><div><h2>Crescimento</h2><p>OMS 2006 (0–5 anos) e referência OMS 2007 (5–19 anos).</p></div></div>
              <div id="peds-age-box" class="peds-callout">Informe as datas para calcular a idade.</div>
              <div id="peds-growth-results" class="peds-result-grid"><p class="muted">Preencha as medidas e clique em calcular.</p></div>
              <div id="peds-z-chart" class="peds-z-chart" aria-label="Painel de escores Z"></div>
              <div id="peds-velocity" class="peds-callout peds-callout-neutral">Medida anterior não informada.</div>
            </section>

            <section class="panel card peds-card">
              <div class="peds-section-heading"><span>3</span><div><h2>Desenvolvimento neuropsicomotor</h2><p>Avalie a trajetória nos quatro domínios; as idades são referências, não cronômetros rígidos.</p></div></div>
              <div class="peds-domain-legend"><span>Social/emocional</span><span>Linguagem/comunicação</span><span>Cognição</span><span>Motricidade</span></div>
              ${milestoneMarkup()}
              <fieldset class="peds-alert-fieldset">
                <legend>Sinais de alerta</legend>
                <div class="peds-check-grid">
                  <label><input id="peds-regression" type="checkbox"> Perda/regressão de habilidade adquirida</label>
                  <label><input id="peds-asymmetry" type="checkbox"> Assimetria motora persistente</label>
                  <label><input id="peds-eye-contact" type="checkbox"> Pouco contato visual/baixa reciprocidade</label>
                  <label><input id="peds-name-response" type="checkbox"> Não responde ao próprio nome</label>
                  <label><input id="peds-stagnation" type="checkbox"> Estagnação ou ausência de progressão</label>
                </div>
              </fieldset>
            </section>

            <section class="panel card peds-card" id="peds-mchat-section">
              <div class="peds-section-heading"><span>4</span><div><h2>M-CHAT-R/F</h2><p>Triagem de indicadores de TEA; não estabelece diagnóstico.</p></div></div>
              <div id="peds-mchat-eligibility" class="peds-callout peds-callout-neutral">Informe a data de nascimento para verificar a faixa de 16–30 meses.</div>
              <div id="peds-mchat-questions" class="peds-mchat-grid">${mchatMarkup()}</div>
              <p class="muted peds-mchat-credit">M-CHAT-R™ © 2009 Robins, Fein &amp; Barton. Tradução: Losapio, Siquara, Lampreia, Lázaro &amp; Pondé.</p>
              <div class="peds-actions"><button id="peds-score-mchat" type="button">Calcular M-CHAT-R</button></div>
              <div id="peds-mchat-result" class="peds-callout peds-callout-neutral">Questionário ainda não calculado.</div>
              <div id="peds-mchat-follow" class="peds-follow" hidden></div>
            </section>

            <section class="panel card peds-card">
              <div class="peds-section-heading"><span>5</span><div><h2>Risco, saúde bucal e orientações</h2><p>Registre fatores que indicam seguimento mais próximo.</p></div></div>
              <fieldset><legend>Fatores para consultas mais frequentes</legend><div class="peds-check-grid">
                ${riskFactors.map(([value, label]) => `<label><input class="peds-risk" type="checkbox" value="${value}"> ${label}</label>`).join("")}
              </div></fieldset>
              <div class="peds-grid peds-oral-grid">
                <label>Dentes presentes?<select id="peds-teeth"><option value="nao_informado">Não informado</option><option value="nao">Não</option><option value="sim">Sim</option></select></label>
                <label>Idade da primeira erupção (meses)<input id="peds-eruption-age" type="number" min="0" max="36" step="1"></label>
                <label>Número aproximado de dentes<input id="peds-tooth-count" type="number" min="0" max="32" step="1"></label>
                <label>Higiene com escova macia e creme fluoretado?<select id="peds-oral-hygiene"><option value="nao_informado">Não informado</option><option value="sim">Sim</option><option value="nao">Não</option></select></label>
                <label>Exposição a telas antes dos 2 anos<select id="peds-screens"><option value="nao_informado">Não informado</option><option value="nao">Não</option><option value="excepcional">Excepcional, breve e acompanhada</option><option value="frequente">Frequente/diária</option></select></label>
                <label>Uso de andador<select id="peds-walker"><option value="nao_informado">Não informado</option><option value="nao">Não</option><option value="sim">Sim</option></select></label>
              </div>
              <fieldset class="peds-dental-symptoms"><legend>Sintomas associados à erupção dentária</legend><div class="peds-check-grid">
                <label><input class="peds-dental-symptom" type="checkbox" value="Salivação aumentada"> Salivação aumentada</label>
                <label><input class="peds-dental-symptom" type="checkbox" value="Irritabilidade"> Irritabilidade</label>
                <label><input class="peds-dental-symptom" type="checkbox" value="Coceira gengival"> Coceira gengival</label>
                <label><input class="peds-dental-symptom" type="checkbox" value="Alteração do sono ou apetite"> Alteração do sono ou apetite</label>
                <label><input class="peds-dental-symptom" type="checkbox" value="Discreto aumento de temperatura"> Discreto aumento de temperatura</label>
              </div></fieldset>
              <div class="peds-callout peds-callout-neutral peds-dental-guide">Referências educativas: erupção geralmente entre 6 e 10 meses (em torno de 8); cerca de 20 dentes aos 3 anos; troca entre 6 e 14 anos. Iniciar a higiene no primeiro dente com escova macia e creme dental fluoretado em quantidade semelhante a um grão de arroz para bebês.</div>
              <label class="full">Observações clínicas, alimentação, contexto e conduta (sem nome/CPF)<textarea id="peds-notes" rows="5" placeholder="Registre apenas o necessário para este resumo local."></textarea></label>
            </section>
          </form>

          <section class="panel card peds-card" id="peds-final-report">
            <h2>Resumo pediátrico</h2>
            <pre id="peds-report" class="report-pre">Preencha os dados para gerar o resumo.</pre>
          </section>
        </div>

        <aside class="pediatric-side">
          <section class="panel card peds-card peds-sticky">
            <h3>Síntese da consulta</h3>
            <div id="peds-summary-age" class="peds-summary-item">Idade não calculada</div>
            <div id="peds-summary-growth" class="peds-summary-item">Crescimento não calculado</div>
            <div id="peds-summary-development" class="peds-summary-item">Desenvolvimento não avaliado</div>
            <div id="peds-summary-mchat" class="peds-summary-item">M-CHAT-R não calculado</div>
            <div id="peds-summary-return" class="peds-summary-item">Próximo retorno não calculado</div>
            <div id="peds-alerts" class="peds-alert-list"></div>
            <div class="quick peds-quick">
              <button id="peds-copy" type="button">Copiar resumo</button>
              <button id="peds-print" type="button">Imprimir / salvar PDF</button>
            </div>
          </section>
          <section class="panel card peds-card refs">
            <h3>Base técnica</h3>
            <ul>
              <li><a href="https://www.who.int/tools/child-growth-standards" target="_blank" rel="noreferrer">OMS – padrões 0–5 anos</a></li>
              <li><a href="https://www.who.int/tools/growth-reference-data-for-5to19-years" target="_blank" rel="noreferrer">OMS – referência 5–19 anos</a></li>
              <li><a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca" target="_blank" rel="noreferrer">Ministério da Saúde – Saúde da Criança</a></li>
              <li><a href="https://www.sbp.com.br/fileadmin/user_upload/24331c-MO_Triagem_Perecoce_para_Autismo.pdf" target="_blank" rel="noreferrer">SBP – M-CHAT-R/F</a></li>
            </ul>
            <p class="muted">Apoio educativo. Resultados devem ser interpretados com história, exame, alimentação, contexto e trajetória.</p>
          </section>
        </aside>
      </div>`;
    return section;
  }

  const adultDesktop = document.querySelector("main.content-grid");
  const mobileHost = document.querySelector(".app-content");
  const host = adultDesktop?.parentElement || mobileHost;
  if (!host) return;
  const pediatricContent = buildPediatricContent();
  if (adultDesktop) adultDesktop.insertAdjacentElement("afterend", pediatricContent);
  else mobileHost.appendChild(pediatricContent);

  const $ = (selector) => pediatricContent.querySelector(selector);
  const form = $("#peds-form");
  const dateFields = [$("#peds-dob"), $("#peds-visit-date"), $("#peds-gest-weeks")];
  let lastAssessment = null;
  let lastMchat = null;
  let mchatWasEligible = false;

  function currentAge() {
    return Core.ageDetails($("#peds-dob").value, $("#peds-visit-date").value, $("#peds-gest-weeks").value);
  }

  function setMchatEnabled(age) {
    const months = age?.chronologicalMonths;
    const eligible = Number.isFinite(months) && months >= 16 && months <= 30;
    if (mchatWasEligible && !eligible) {
      lastMchat = null;
      $("#peds-mchat-result").textContent = "Questionário ainda não calculado.";
      $("#peds-mchat-follow").hidden = true;
      $("#peds-mchat-follow").innerHTML = "";
      $("#peds-summary-mchat").textContent = "M-CHAT-R não calculado";
    }
    mchatWasEligible = eligible;
    $("#peds-mchat-questions").querySelectorAll("input").forEach((input) => { input.disabled = !eligible; });
    $("#peds-score-mchat").disabled = !eligible;
    const message = !Number.isFinite(months)
      ? "Informe a data de nascimento para verificar a faixa de 16–30 meses."
      : eligible
        ? `Elegível: ${Math.floor(months)} meses. A triagem é indicada nas consultas de 18 e 24 meses.`
        : `Fora da faixa de aplicação do M-CHAT-R/F: ${Math.floor(months)} meses (instrumento: 16–30 meses).`;
    $("#peds-mchat-eligibility").textContent = message;
    $("#peds-mchat-eligibility").className = `peds-callout ${eligible ? "peds-callout-ok" : "peds-callout-neutral"}`;
  }

  function updateAgeContext() {
    const age = currentAge();
    if (!age) {
      $("#peds-age-box").textContent = "Informe datas válidas; a consulta não pode anteceder o nascimento.";
      $("#peds-summary-age").textContent = "Idade não calculada";
      setMchatEnabled(null);
      return;
    }
    const corrected = age.correctionDays ? ` | Idade corrigida: ${Core.formatAge(age.correctedDays)} (correção de ${age.correctionDays} dias)` : "";
    $("#peds-age-box").textContent = `Idade cronológica: ${Core.formatAge(age.chronologicalDays)}${corrected}`;
    $("#peds-summary-age").textContent = `Idade: ${Core.formatAge(age.chronologicalDays)}${age.correctionDays ? ` | corrigida: ${Core.formatAge(age.correctedDays)}` : ""}`;
    setMchatEnabled(age);
    pediatricContent.querySelectorAll("[data-milestone-age]").forEach((details) => {
      const groupAge = Number(details.dataset.milestoneAge);
      details.classList.toggle("peds-age-due", age.correctedMonths >= groupAge);
      if (age.correctedMonths >= groupAge && age.correctedMonths < groupAge + 3) details.open = true;
    });
    const defaultMethod = age.correctedDays < 731 ? "comprimento" : "estatura";
    if (!$("#peds-height-method").dataset.userChanged) $("#peds-height-method").value = defaultMethod;
  }

  function collectMilestones() {
    return [...pediatricContent.querySelectorAll(".peds-milestone")].map((select) => ({
      age: Number(select.dataset.age), label: select.dataset.label, domain: select.dataset.domain, status: select.value
    }));
  }

  function updateMilestoneStatus() {
    pediatricContent.querySelectorAll("[data-milestone-age]").forEach((details) => {
      const values = [...details.querySelectorAll(".peds-milestone")].map((select) => select.value);
      const assessed = values.filter(Boolean).length;
      const missing = values.filter((value) => value === "nao_atingido").length;
      const label = details.querySelector(".peds-age-status");
      label.textContent = missing ? `${missing} alerta${missing > 1 ? "s" : ""}` : assessed === values.length ? "completo" : assessed ? `${assessed}/${values.length}` : "não avaliado";
      label.dataset.status = missing ? "alert" : assessed === values.length ? "complete" : "partial";
    });
  }

  function collectAnswers() {
    const answers = {};
    for (let item = 1; item <= 20; item += 1) {
      answers[item] = pediatricContent.querySelector(`input[name="peds-mchat-${item}"]:checked`)?.value || "";
    }
    return answers;
  }

  function collectFollowUp() {
    const follow = {};
    pediatricContent.querySelectorAll(".peds-follow-select").forEach((select) => { follow[select.dataset.item] = select.value; });
    return follow;
  }

  function renderFollowUp(result) {
    const container = $("#peds-mchat-follow");
    if (!result.complete || result.score < 3 || result.score > 7) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }
    const previous = collectFollowUp();
    container.hidden = false;
    container.innerHTML = `<h3>Entrevista de Seguimento</h3><p>Aplique somente aos itens com falha e registre o desfecho do fluxograma oficial.</p>${result.failedItems.map((item) => `
      <label>Item ${item}: ${mchatQuestions[item - 1]}
        <select class="peds-follow-select" data-item="${item}"><option value="">Selecione</option><option value="passa" ${previous[item] === "passa" ? "selected" : ""}>Passa</option><option value="falha" ${previous[item] === "falha" ? "selected" : ""}>Falha</option></select>
      </label>`).join("")}`;
  }

  function calculateMchat() {
    const first = Core.mchatScore(collectAnswers(), collectFollowUp());
    renderFollowUp(first);
    const result = Core.mchatScore(collectAnswers(), collectFollowUp());
    lastMchat = result;
    const box = $("#peds-mchat-result");
    box.textContent = result.complete ? `Escore: ${result.score}/20 | Resultado: ${result.level}. ${result.action}` : `${result.failedItems.length} resposta(s) de risco entre os itens preenchidos. ${result.action}`;
    box.className = `peds-callout ${result.complete && (result.score >= 3 || result.level.includes("positivo")) ? "peds-callout-alert" : result.complete ? "peds-callout-ok" : "peds-callout-neutral"}`;
    $("#peds-summary-mchat").textContent = result.complete ? `M-CHAT-R: ${result.score}/20 (${result.level})` : "M-CHAT-R incompleto";
    updateReportAndAlerts();
  }

  function chartMarkup(results) {
    if (!results.length) return "";
    const width = 720;
    const left = 160;
    const plotWidth = 500;
    const height = 38 + results.length * 42;
    const x = (z) => left + ((Math.max(-3.5, Math.min(3.5, z)) + 3.5) / 7) * plotWidth;
    const grid = [-3, -2, 0, 2, 3].map((z) => `<line x1="${x(z)}" x2="${x(z)}" y1="22" y2="${height - 24}" class="z-grid z-${String(z).replace("-", "n")}"/><text x="${x(z)}" y="${height - 5}" text-anchor="middle">${z > 0 ? "+" : ""}${z}</text>`).join("");
    const dots = results.map((item, index) => {
      const y = 38 + index * 42;
      return `<text x="${left - 12}" y="${y + 5}" text-anchor="end" class="z-label">${item.shortName}</text><line x1="${left}" x2="${left + plotWidth}" y1="${y}" y2="${y}" class="z-row"/><circle cx="${x(item.z)}" cy="${y}" r="8" class="z-dot ${Math.abs(item.z) > 2 ? "z-dot-alert" : ""}"/><text x="${Math.min(width - 26, x(item.z) + 14)}" y="${y + 5}" class="z-value">${item.z > 0 ? "+" : ""}${item.z}</text>`;
    }).join("");
    return `<h3>Posição nas curvas (escore-Z)</h3><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Escores Z dos indicadores antropométricos"><rect x="${x(-2)}" y="22" width="${x(2) - x(-2)}" height="${height - 46}" class="z-normal-zone"/>${grid}${dots}</svg><p class="muted">O gráfico resume a posição atual. A trajetória entre consultas continua sendo parte essencial da interpretação.</p>`;
  }

  function renderGrowth(assessment) {
    const container = $("#peds-growth-results");
    if (!assessment.results.length) {
      container.innerHTML = `<p class="muted">${assessment.errors.join(" ") || "Não foi possível calcular os indicadores."}</p>`;
      return;
    }
    container.innerHTML = assessment.results.map((item) => `
      <article class="peds-result-card ${Math.abs(item.z) > 2 ? "peds-result-alert" : ""}">
        <span>${item.shortName}</span><strong>${item.z > 0 ? "+" : ""}${item.z} Z</strong>
        <small>Percentil ${item.percentile} · ${item.classification}</small>
      </article>`).join("");
    $("#peds-z-chart").innerHTML = chartMarkup(assessment.results);
    const abnormal = assessment.results.filter((item) => Math.abs(item.z) > 2).length;
    $("#peds-summary-growth").textContent = abnormal ? `Crescimento: ${abnormal} indicador(es) fora de Z -2 a +2` : `Crescimento: ${assessment.results.length} indicador(es), sem desvio >2 Z`;
  }

  function renderVelocity() {
    const currentDate = $("#peds-visit-date").value;
    const previousDate = $("#peds-prev-date").value;
    const metrics = [
      ["Peso", "#peds-weight", "#peds-prev-weight", "kg/ano", 2],
      ["Estatura", "#peds-height", "#peds-prev-height", "cm/ano", 1],
      ["Perímetro cefálico", "#peds-head", "#peds-prev-head", "cm/ano", 1]
    ];
    const values = metrics.map(([label, current, previous, unit, decimals]) => {
      const velocity = Core.growthVelocity(currentDate, previousDate, $(current).value, $(previous).value);
      return velocity ? { label, unit, decimals, ...velocity } : null;
    }).filter(Boolean);
    const box = $("#peds-velocity");
    const age = currentAge();
    const months = age?.correctedMonths;
    const reference = !Number.isFinite(months) ? "" : months < 12
      ? " Referência didática: cerca de 25 cm no 1º ano (9 + 7 + 5 + 3 cm por trimestre)."
      : months < 24
        ? " Referência didática: cerca de 11–12 cm no 2º ano e ganho ponderal aproximado de 2,5 kg/ano."
        : months < 72
          ? " Referência didática pré-escolar: 6–8 cm e cerca de 2 kg/ano."
          : " Referência didática escolar: cerca de 6 cm e 2,5–3,5 kg/ano.";
    if (!values.length) {
      box.textContent = `Medida anterior não informada ou intervalo inválido.${reference}`;
      return;
    }
    box.textContent = `${values.map((item) => `${item.label}: ${item.perYear.toFixed(item.decimals).replace(".", ",")} ${item.unit}`).join(" | ")} · Intervalo: ${values[0].days} dias${values[0].adequateInterval ? "" : " (inferior a 3 meses; interpretar com cautela)"}.${reference}`;
  }

  function collectAlerts() {
    const age = currentAge();
    const alerts = [];
    if ($("#peds-regression").checked) alerts.push({ urgent: true, text: "Regressão/perda de habilidades: ampliar avaliação sem aguardar nova consulta de rotina." });
    if ($("#peds-asymmetry").checked) alerts.push({ urgent: true, text: "Assimetria motora persistente." });
    if ($("#peds-eye-contact").checked) alerts.push({ urgent: false, text: "Baixo contato visual/reciprocidade." });
    if ($("#peds-name-response").checked) alerts.push({ urgent: false, text: "Não resposta ao nome." });
    if ($("#peds-stagnation").checked) alerts.push({ urgent: true, text: "Estagnação ou ausência de progressão." });
    if ($("#peds-screens").value === "frequente" && age?.chronologicalMonths < 24) alerts.push({ urgent: false, text: "Exposição frequente a telas antes dos 2 anos; orientar uso excepcional, breve e acompanhado." });
    if ($("#peds-walker").value === "sim") alerts.push({ urgent: false, text: "Uso de andador; orientar que não é recomendado pelo risco de acidentes e interferência na prática motora segura." });
    if (age) {
      collectMilestones().filter((item) => item.status === "nao_atingido" && age.correctedMonths >= item.age).forEach((item) => alerts.push({ urgent: false, text: `${item.age} mês(es): ${item.label}.` }));
    }
    lastAssessment?.results.filter((item) => Math.abs(item.z) > 2).forEach((item) => alerts.push({ urgent: false, text: `${item.name}: ${item.z} Z (${item.classification}).` }));
    return alerts;
  }

  function updateReportAndAlerts() {
    updateMilestoneStatus();
    const alerts = collectAlerts();
    const alertBox = $("#peds-alerts");
    alertBox.innerHTML = alerts.length ? `<h4>Sinais que pedem atenção</h4>${alerts.map((item) => `<p class="${item.urgent ? "urgent" : ""}">${item.text}</p>`).join("")}` : "<p class=\"peds-no-alert\">Nenhum sinal automático marcado.</p>";
    const assessed = collectMilestones().filter((item) => item.status).length;
    const delayed = collectMilestones().filter((item) => item.status === "nao_atingido").length;
    $("#peds-summary-development").textContent = assessed ? `Desenvolvimento: ${assessed} itens avaliados${delayed ? `, ${delayed} não atingido(s)` : ""}` : "Desenvolvimento não avaliado";
    const age = currentAge();
    const hasRiskFactor = pediatricContent.querySelectorAll(".peds-risk:checked").length > 0;
    $("#peds-summary-return").textContent = age ? `Próximo retorno: ${Core.nextVisit(age.chronologicalDays)}${hasRiskFactor ? " · considerar intervalo menor pelos fatores de risco" : ""}` : "Próximo retorno não calculado";
    $("#peds-report").textContent = buildReport(alerts);
  }

  function buildReport(alerts) {
    const age = currentAge();
    const selectedRisks = [...pediatricContent.querySelectorAll(".peds-risk:checked")].map((item) => item.parentElement.textContent.trim());
    const assessedMilestones = collectMilestones().filter((item) => item.status);
    const dentalSymptoms = [...pediatricContent.querySelectorAll(".peds-dental-symptom:checked")].map((item) => item.value);
    const statusLabels = { atingido: "atingido/presente", nao_atingido: "não atingido/ausente", nao_observado: "não observado", nao_aplicavel: "não aplicável" };
    const growthLines = lastAssessment?.results.length ? lastAssessment.results.map((item) => `- ${item.name}: Z ${item.z > 0 ? "+" : ""}${item.z}; percentil ${item.percentile}; ${item.classification}`) : ["- Não calculado."];
    const milestoneLines = assessedMilestones.length ? assessedMilestones.map((item) => `- ${item.age} mês(es) | ${item.domain}: ${item.label} — ${statusLabels[item.status]}`) : ["- Não avaliados."];
    const mchatLine = lastMchat?.complete ? `Escore ${lastMchat.score}/20; ${lastMchat.level}. ${lastMchat.action}` : "Não aplicado ou incompleto.";
    const notes = $("#peds-notes").value.trim() || "Sem observações adicionais.";
    const choiceText = (value) => ({ nao_informado: "não informado", nao: "não", sim: "sim", excepcional: "excepcional, breve e acompanhada", frequente: "frequente/diária" }[value] || value || "não informado");
    return [
      "CUIDAR+ | ACOMPANHAMENTO PEDIÁTRICO EDUCATIVO", "", "CONSULTA", `Data: ${$("#peds-visit-date").value || "não informada"}`,
      `Idade cronológica: ${age ? Core.formatAge(age.chronologicalDays) : "não calculada"}`,
      `Idade corrigida: ${age?.correctionDays ? `${Core.formatAge(age.correctedDays)} (correção de ${age.correctionDays} dias)` : "não aplicável"}`,
      `Sexo usado na referência OMS: ${$("#peds-sex").value || "não informado"}`, `Idade gestacional: ${$("#peds-gest-weeks").value ? `${$("#peds-gest-weeks").value} semanas` : "não informada"}`, "",
      "ANTROPOMETRIA", `Peso: ${$("#peds-weight").value || "não informado"} kg`, `Comprimento/estatura: ${$("#peds-height").value || "não informado"} cm (${$("#peds-height-method").value})`,
      `Perímetro cefálico: ${$("#peds-head").value || "não informado"} cm`, `IMC: ${Number.isFinite(lastAssessment?.bmi) ? `${lastAssessment.bmi.toFixed(1).replace(".", ",")} kg/m²` : "não calculado"}`,
      ...(lastAssessment?.techniqueNote ? [lastAssessment.techniqueNote] : []), ...growthLines, "", "DESENVOLVIMENTO", ...milestoneLines, "",
      "M-CHAT-R/F", mchatLine, "", "FATORES PARA SEGUIMENTO MAIS PRÓXIMO", selectedRisks.length ? selectedRisks.map((item) => `- ${item}`).join("\n") : "- Nenhum marcado.", "",
      "SINAIS DE ALERTA", alerts.length ? alerts.map((item) => `- ${item.text}`).join("\n") : "- Nenhum sinal automático marcado.", "", "SAÚDE BUCAL",
      `Dentes presentes: ${choiceText($("#peds-teeth").value)}; primeira erupção: ${$("#peds-eruption-age").value ? `${$("#peds-eruption-age").value} meses` : "não informada"}; número aproximado: ${$("#peds-tooth-count").value || "não informado"}.`,
      `Higiene com escova macia e creme fluoretado: ${choiceText($("#peds-oral-hygiene").value)}.`,
      `Sintomas de erupção marcados: ${dentalSymptoms.length ? dentalSymptoms.join(", ") : "nenhum"}.`,
      `Telas antes dos 2 anos: ${choiceText($("#peds-screens").value)}; uso de andador: ${choiceText($("#peds-walker").value)}.`, "", "PLANO E OBSERVAÇÕES", notes,
      `Próximo retorno de rotina: ${age ? Core.nextVisit(age.chronologicalDays) : "não calculado"}.`, "",
      "Aviso: instrumento de apoio educativo. Triagem não é diagnóstico; interpretar medidas e marcos em conjunto com história, exame e trajetória. Nenhum dado desta avaliação é salvo pelo app."
    ].join("\n");
  }

  function calculateAssessment(event) {
    event?.preventDefault();
    if (!form.reportValidity()) return;
    lastAssessment = Core.evaluateAnthropometry({
      dob: $("#peds-dob").value, visitDate: $("#peds-visit-date").value, sex: $("#peds-sex").value,
      gestationalWeeks: $("#peds-gest-weeks").value, weight: $("#peds-weight").value,
      height: $("#peds-height").value, heightMethod: $("#peds-height-method").value, head: $("#peds-head").value
    });
    updateAgeContext();
    renderGrowth(lastAssessment);
    renderVelocity();
    updateReportAndAlerts();
  }

  function setMode(mode) {
    const pediatric = mode === "pediatric";
    pediatricContent.hidden = !pediatric;
    if (adultDesktop) {
      adultDesktop.hidden = pediatric;
      document.querySelector(".steps")?.toggleAttribute("hidden", pediatric);
    } else {
      const quickCard = document.getElementById("copy-btn")?.closest(".card");
      const firstAdult = document.getElementById("clinical-form")?.closest(".card");
      const cards = [...document.querySelectorAll(".app-content > .card")];
      const startIndex = cards.indexOf(firstAdult);
      cards.forEach((card, index) => {
        if (card === quickCard || index >= startIndex) card.hidden = pediatric;
      });
    }
    document.getElementById("generate-document-btn")?.toggleAttribute("hidden", pediatric);
    document.getElementById("reset-form-btn")?.toggleAttribute("hidden", pediatric);
    document.body.dataset.careMode = pediatric ? "pediatric" : "adult";
    if (pediatric) updateAgeContext();
  }

  document.querySelectorAll('input[name="care-mode"]').forEach((input) => input.addEventListener("change", () => setMode(input.value)));
  form.addEventListener("submit", calculateAssessment);
  dateFields.forEach((field) => field.addEventListener("input", () => { updateAgeContext(); updateReportAndAlerts(); }));
  $("#peds-height-method").addEventListener("change", (event) => { event.target.dataset.userChanged = "true"; });
  pediatricContent.addEventListener("change", (event) => {
    if (event.target.classList.contains("peds-milestone") || event.target.matches("input[type=checkbox], #peds-teeth, #peds-oral-hygiene, #peds-screens, #peds-walker, #peds-eruption-age, #peds-tooth-count")) updateReportAndAlerts();
    if (event.target.classList.contains("peds-follow-select")) calculateMchat();
  });
  $("#peds-notes").addEventListener("input", updateReportAndAlerts);
  $("#peds-score-mchat").addEventListener("click", calculateMchat);
  $("#peds-copy").addEventListener("click", async (event) => {
    updateReportAndAlerts();
    try {
      await navigator.clipboard.writeText($("#peds-report").textContent);
      const button = event.currentTarget;
      button.textContent = "Resumo copiado";
      setTimeout(() => { button.textContent = "Copiar resumo"; }, 1200);
    } catch { alert("Não foi possível copiar automaticamente. Verifique as permissões do navegador."); }
  });
  $("#peds-print").addEventListener("click", () => { updateReportAndAlerts(); window.print(); });
  $("#peds-generate-document").addEventListener("click", () => {
    if (!form.reportValidity()) return;
    calculateAssessment();
    $("#peds-final-report").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#peds-reset").addEventListener("click", () => {
    form.reset();
    $("#peds-visit-date").value = today;
    lastAssessment = null;
    lastMchat = null;
    $("#peds-growth-results").innerHTML = '<p class="muted">Preencha as medidas e clique em calcular.</p>';
    $("#peds-z-chart").innerHTML = "";
    $("#peds-mchat-result").textContent = "Questionário ainda não calculado.";
    $("#peds-mchat-follow").hidden = true;
    $("#peds-mchat-follow").innerHTML = "";
    updateAgeContext();
    updateReportAndAlerts();
  });

  const newRecord = document.getElementById("new-record-btn");
  if (newRecord) newRecord.addEventListener("click", (event) => {
    if (document.body.dataset.careMode !== "pediatric") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    pediatricContent.scrollIntoView({ behavior: "smooth", block: "start" });
    $("#peds-dob").focus();
  }, true);

  setMode(document.querySelector('input[name="care-mode"]:checked')?.value || "adult");
  updateAgeContext();
  updateReportAndAlerts();
  window.PediatricModule = { calculateAssessment, calculateMchat, setMode, milestones, mchatQuestions };
})();
