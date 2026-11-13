(() => {
  "use strict";

  const section = document.getElementById("mental-health");
  const core = window.MentalHealthCore;
  if (!section || !core) return;

  const aqItems = [
    "Costumo notar pequenos sons quando outros não percebem.",
    "Eu geralmente me concentro mais no todo de uma imagem, ao invés de pequenos detalhes.",
    "Acho fácil fazer mais de uma coisa de uma só vez.",
    "Se houver uma interrupção, posso voltar para o que eu estava fazendo muito rápido.",
    "Acho fácil “ler nas entrelinhas” quando alguém está falando comigo.",
    "Eu sei dizer se alguém que está me ouvindo está ficando entediado.",
    "Quando estou lendo uma história, acho difícil descobrir as intenções dos personagens.",
    "Gosto de coletar informações sobre categorias de coisas (por exemplo, tipos de carro, tipos de pássaros, tipos de trem, tipos de planta, etc.).",
    "Acho que é fácil descobrir o que alguém está pensando ou sentindo apenas olhando para o rosto da pessoa.",
    "Acho difícil entender as intenções das pessoas."
  ];
  const asrsPartA = [
    "Com que frequência você deixa um projeto pela metade depois de já ter feito as partes mais difíceis?",
    "Com que frequência você tem dificuldade para fazer um trabalho que exige organização?",
    "Com que frequência você tem dificuldade para lembrar de compromissos ou obrigações?",
    "Quando você precisa fazer algo que exige muita concentração, com que frequência você evita ou adia o início?",
    "Com que frequência você fica se mexendo na cadeira ou balançando as mãos ou os pés quando precisa ficar sentado(a) por muito tempo?",
    "Com que frequência você se sente ativo(a) demais e necessitando fazer coisas, como se estivesse “com um motor ligado”?"
  ];
  const asrsPartB = [
    "Com que frequência você comete erros bobos por falta de atenção quando tem de trabalhar num projeto chato ou difícil?",
    "Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho chato ou repetitivo?",
    "Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas estão falando diretamente com você?",
    "Com que frequência você coloca as coisas fora do lugar ou tem dificuldade de encontrar as coisas em casa ou no trabalho?",
    "Com que frequência você se distrai com atividades ou barulho à sua volta?",
    "Com que frequência você se levanta da cadeira em reuniões ou em outras situações onde deveria ficar sentado(a)?",
    "Com que frequência você se sente inquieto(a) ou agitado(a)?",
    "Com que frequência você tem dificuldade para sossegar e relaxar quando tem tempo livre para você?",
    "Com que frequência você se pega falando demais em situações sociais?",
    "Quando você está conversando, com que frequência você se pega terminando as frases das pessoas antes delas?",
    "Com que frequência você tem dificuldade para esperar nas situações onde cada um tem a sua vez?",
    "Com que frequência você interrompe os outros quando eles estão ocupados?"
  ];
  const dassItems = [
    "Achei difícil me acalmar.",
    "Senti minha boca seca.",
    "Não consegui vivenciar nenhum sentimento positivo.",
    "Tive dificuldade em respirar em alguns momentos (ex.: respiração ofegante, falta de ar, sem ter feito nenhum esforço físico).",
    "Achei difícil ter iniciativa para fazer as coisas.",
    "Tive a tendência de reagir de forma exagerada às situações.",
    "Senti tremores (ex.: nas mãos).",
    "Senti que estava sempre nervoso.",
    "Preocupei-me com situações em que eu pudesse entrar em pânico e parecesse ridículo(a).",
    "Senti que não tinha nada a desejar.",
    "Senti-me agitado.",
    "Achei difícil relaxar.",
    "Senti-me depressivo(a) e sem ânimo.",
    "Fui intolerante com as coisas que me impediam de continuar o que eu estava fazendo.",
    "Senti que ia entrar em pânico.",
    "Não consegui me entusiasmar com nada.",
    "Senti que não tinha valor como pessoa.",
    "Senti que estava um pouco emotivo/sensível demais.",
    "Sabia que meu coração estava alterado mesmo não tendo feito nenhum esforço físico (ex.: aumento de frequência cardíaca, disritmia cardíaca).",
    "Senti medo sem ter motivo.",
    "Senti que a vida não tinha sentido."
  ];
  const aqOptions = ["Concordo totalmente", "Concordo em parte", "Discordo em parte", "Discordo totalmente"];
  const asrsOptions = ["Nunca", "Quase nunca", "De vez em quando", "Quase sempre", "Sempre"];
  const dassOptions = [
    "0 · Não se aplicou de maneira alguma",
    "1 · Aplicou-se em algum grau, ou por pouco tempo",
    "2 · Aplicou-se em um grau considerável, ou por uma boa parte do tempo",
    "3 · Aplicou-se muito, ou na maioria do tempo"
  ];
  const aqSource = "https://docs.autismresearchcentre.com/tests/AQ10_Adult_PORTUGU%C3%8AS_BRASIL_TRADU%C3%87%C3%83O.pdf";
  const aqGuideline = "https://www.nice.org.uk/guidance/cg142/chapter/recommendations#identification-and-assessment";
  const asrsSource = "https://license.tov.med.nyu.edu/product/asrs-v11-18-question-symptom-checklist";
  const asrsGuideline = "https://www.nice.org.uk/guidance/ng87/chapter/recommendations#recognition-identification-and-referral";
  const depressionGuideline = "https://linhasdecuidado.saude.gov.br/portal/depressao/unidade-de-atencao-primaria/planejamento-terapeutico/#encaminhamento-para-atencao-especializada";
  const anxietyGuideline = "https://linhasdecuidado.saude.gov.br/portal/ansiedade/unidade-de-atencao-primaria/planejamento-terapeutico/#encaminhamento-para-atencao-psicossocial-especializada";

  const link = (href, label) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  const options = (labels, placeholder = "Selecione") =>
    `<option value="">${placeholder}</option>${labels.map((label, index) => `<option value="${index}">${label}</option>`).join("")}`;
  const items = (questions, labels, offset = 0) => `<ol class="mh-items" start="${offset + 1}">${questions.map((question, index) =>
    `<li><label><span>${question}</span><select data-answer autocomplete="off" aria-label="Item ${offset + index + 1}. ${question}">${options(labels)}</select></label></li>`
  ).join("")}</ol>`;
  const clinical = (id, label, help) =>
    `<div class="mh-clinical"><label for="${id}"><strong>${label}</strong></label><small id="${id}-help">${help}</small><select id="${id}" data-clinical autocomplete="off" aria-describedby="${id}-help">${options(["Não", "Sim"], "Não avaliado")}</select></div>`;
  const scale = (id, title, subtitle, content) => `
    <details class="mh-scale" data-scale="${id}">
      <summary><span><strong>${title}</strong><small>${subtitle}</small></span><span class="mh-progress" data-progress></span></summary>
      <div class="mh-body">
        ${content}
        <div class="imc-box mh-result" role="status" aria-atomic="true" data-result></div>
        <div class="quick mh-actions"><button type="button" data-clear>Limpar ${id.toUpperCase()}</button></div>
      </div>
    </details>`;

  section.insertAdjacentHTML("beforeend", `
    <p>Registre as respostas durante o atendimento. Os escores e as orientações entram no resumo do prontuário.</p>
    ${scale("aq-10", "AQ-10", "Rastreio de autismo · 10 itens", `
      <p>Versão a partir de 16 anos para pessoas com suspeita de autismo. Em caso de deficiência intelectual moderada ou grave, use a avaliação clínica prevista na diretriz.</p>
      <p class="mh-sources">${link(aqSource, "Formulário e gabarito em português")} · ${link(aqGuideline, "Diretriz NICE CG142")}</p>
      ${items(aqItems, aqOptions)}
      ${clinical("mh-aq-suspicion", "Persiste suspeita clínica de autismo?", "Considere a história do desenvolvimento e informações de familiares ou outros informantes.")}
    `)}
    ${scale("asrs-18", "ASRS-18", "Rastreio de TDAH em adultos · 18 itens", `
      <p>Marque a frequência de cada sintoma nos últimos seis meses.</p>
      <p class="mh-sources">${link(asrsSource, "ASRS v1.1 (NYU Langone)")} · ${link(asrsGuideline, "Diretriz NICE NG87")}</p>
      <fieldset><legend>Parte A · Rastreio</legend>${items(asrsPartA, asrsOptions)}</fieldset>
      <fieldset><legend>Parte B · Sintomas complementares</legend>${items(asrsPartB, asrsOptions, asrsPartA.length)}</fieldset>
      ${clinical("mh-asrs-criteria", "A avaliação clínica sustenta encaminhamento por suspeita de TDAH?", "Considere sintomas desde a infância, persistência, prejuízo funcional pelo menos moderado em mais de um contexto e outras explicações possíveis.")}
    `)}
    ${scale("dass-21", "DASS-21", "Depressão, ansiedade e estresse · 21 itens", `
      <p>Para registro pelo profissional. Transcreva as respostas do formulário aplicado, que se referem à última semana.</p>
      <p class="mh-sources">${link("https://dass.psy.unsw.edu.au/Portuguese/DASS%2021%20Brazilian%20Portuguese%20Tucci.pdf", "Formulário brasileiro (Vignola e Tucci)")} · ${link("https://dass.psy.unsw.edu.au/DASSFAQ.htm", "Correção (UNSW)")}</p>
      ${items(dassItems, dassOptions)}
      ${clinical("mh-dass-risk", "Há indicação clínica de atendimento de emergência?", "Avalie diretamente risco agudo de suicídio, auto ou heteroagressão, sintomas psicóticos e outros sinais de gravidade.")}
      ${clinical("mh-dass-criteria", "Há indicação clínica de atenção especializada?", `Consulte os critérios do Ministério da Saúde para ${link(depressionGuideline, "depressão")} e ${link(anxietyGuideline, "ansiedade")}.`)}
    `)}
  `);

  const ageField = document.getElementById("age");

  const scales = [...section.querySelectorAll("[data-scale]")].map((panel) => ({
    panel,
    id: panel.dataset.scale,
    answers: [...panel.querySelectorAll("[data-answer]")],
    clinical: [...panel.querySelectorAll("[data-clinical]")],
    result: panel.querySelector("[data-result]"),
    progress: panel.querySelector("[data-progress]")
  }));
  const readAnswers = (fields) => fields.map((field) => field.value === "" ? null : Number(field.value));
  const formatScore = ({ score, answered, total }) => score === null
    ? `${answered}/${total} respondidos. Escore pendente.`
    : `${score}/${total} pontos.`;

  function evaluate({ id, answers, clinical: fields }) {
    const values = readAnswers(answers);
    const clinicalValues = fields.map((field) => field.value);
    const answered = values.filter((value) => value !== null).length;
    const minAge = id === "aq-10" ? 16 : 18;
    const age = ageField.valueAsNumber;
    const applicable = !Number.isFinite(age) || age >= minAge;
    const lines = [];
    if (!applicable) {
      lines.push(`Versão destinada a pessoas a partir de ${minAge} anos. Use um instrumento apropriado à idade.`);
    } else if (id === "aq-10") {
      const aq = core.scoreAq10(values);
      lines.push(formatScore(aq));
      if (clinicalValues[0] === "1") {
        lines.push("Encaminhar para avaliação diagnóstica abrangente de autismo pela suspeita clínica.");
      } else if (aq.positive === true) {
        lines.push("Encaminhar para avaliação diagnóstica abrangente de autismo. O escore atingiu o corte de 6 pontos.");
      } else if (aq.positive === false) {
        lines.push("Sem indicação de encaminhamento pelo escore. Encaminhe se houver suspeita clínica.");
      }
    } else if (id === "asrs-18") {
      const asrs = core.scoreAsrs18(values);
      lines.push(`Parte A · ${formatScore(asrs.partA)}`);
      lines.push(asrs.partB.score === null
        ? `Parte B · ${asrs.partB.answered}/12 respondidos. Contagem pendente.`
        : `Parte B · ${asrs.partB.score}/12 respostas nas faixas sombreadas. Uso descritivo, sem ponto de corte.`);
      if (asrs.positive !== null) {
        lines.push(asrs.positive
          ? "Rastreio positivo. Investigue TDAH na avaliação clínica."
          : "Rastreio abaixo do corte de 4 pontos na Parte A.");
      }
      if (clinicalValues[0] === "1") {
        lines.push("Encaminhar para avaliação especializada de TDAH pelos achados clínicos.");
      } else if (clinicalValues[0] === "0") {
        lines.push("Sem indicação de encaminhamento pelos achados clínicos registrados.");
      } else if (asrs.positive !== null) {
        lines.push("Encaminhamento depende da avaliação clínica e do prejuízo funcional.");
      }
    } else {
      const dass = core.scoreDass21(values);
      for (const domain of dass.domains) {
        lines.push(domain.score === null
          ? `${domain.name} · escore pendente`
          : `${domain.name} · ${domain.score}/42 (faixa ${domain.severity})`);
      }
      if (clinicalValues[0] === "1") {
        lines.unshift("Encaminhar imediatamente para um serviço de emergência pelos sinais clínicos registrados.");
      } else {
        if (dass.item21) {
          lines.unshift("Resposta acima de zero no item 21. Se ainda não avaliou, investigue diretamente ideação, plano e risco de suicídio.");
        }
        if (clinicalValues[0] === "0" && clinicalValues[1] !== "") {
          lines.push(clinicalValues[1] === "1"
            ? "Encaminhar para atenção especializada conforme os critérios clínicos registrados."
            : "Acompanhamento na APS conforme os achados clínicos registrados.");
        } else if (answered > 0 || clinicalValues.some(Boolean)) {
          lines.push("Avalie urgência e critérios clínicos de encaminhamento. O escore descreve a intensidade dos sintomas.");
        }
      }
    }

    return {
      answered,
      lines,
      started: answered > 0 || clinicalValues.some(Boolean),
      urgent: id === "dass-21" && applicable && clinicalValues[0] === "1"
    };
  }

  function render(scale) {
    const { answered, lines, urgent } = evaluate(scale);
    scale.progress.textContent = `${answered}/${scale.answers.length}`;
    scale.result.classList.toggle("mh-urgent", urgent);
    scale.result.replaceChildren(...lines.map((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      return paragraph;
    }));
  }

  function reset(scale) {
    [...scale.answers, ...scale.clinical].forEach((field) => { field.value = ""; });
    render(scale);
  }

  for (const entry of scales) {
    entry.panel.addEventListener("change", (event) => {
      if (!event.target.matches("[data-answer], [data-clinical]")) return;
      render(entry);
      section.dispatchEvent(new Event("mental-health-change"));
    });
    entry.panel.querySelector("[data-clear]").addEventListener("click", () => {
      reset(entry);
      section.dispatchEvent(new Event("mental-health-change"));
    });
    render(entry);
  }
  ageField.addEventListener("input", () => scales.forEach(render));

  window.MentalHealth = {
    reset() {
      for (const entry of scales) {
        reset(entry);
        entry.panel.open = false;
      }
    },
    reportLines() {
      return scales.flatMap((entry) => {
        const { lines, started } = evaluate(entry);
        return started ? [entry.id.toUpperCase(), ...lines] : [];
      });
    }
  };
})();
