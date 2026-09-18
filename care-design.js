/* Shared presentation and navigation for all three care flows. */
(() => {
  'use strict';
  const body = document.body;
  const mobile = matchMedia('(max-width:760px)');
  const $ = selector => document.querySelector(selector);
  const icon = name => {
    const paths = {
      consult: '<path d="M6 3v6a5 5 0 0 0 10 0V3M4 3h4m6 0h4M11 14v3a4 4 0 0 0 8 0v-3"/><circle cx="19" cy="12" r="2"/>',
      sections: '<path d="M9 6h11M9 12h11M9 18h11M4 6h1m-1 6h1m-1 6h1"/>',
      summary: '<path d="M4 20V14h3v6zm6 0V9h3v11zm6 0V4h3v16z"/>',
      document: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
      book: '<path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-3-1-7-2-10 1z"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.document}</svg>`;
  };
  const create = (tag, className, html) => {
    const node = document.createElement(tag); node.className = className;
    if (html) node.innerHTML = html;
    return node;
  };
  const adultRoot = $('main.content-grid');
  const adultConsult = $('#clinical-form').closest('section');
  const adultSummary = $('#imc-box').closest('section');
  const adultClassification = $('#classification').closest('section');
  const adultPrivacy = $('#lgpd-panel') || [...document.querySelectorAll('.app-content > .card')].find(c => c.querySelector('.lgpd-list'));
  const adultReport = $('#final-report');
  const adultActions = $('#copy-btn').closest('section');
  const adultSources = $('.side-column .refs');
  const agaRoot = $('#aga-content');
  const agaCards = [...document.querySelectorAll('#aga-form > section')];
  const adultCards = [adultConsult, adultClassification, adultPrivacy, $('#risk-methodology')].filter(Boolean);
  let sequence = 0;
  const accordion = (card, expanded) => {
    card.id ||= `care-section-${++sequence}`;
    const heading = card.querySelector('h2');
    if (!heading) return;
    const headingContainer = heading.closest('.aga-heading,.panel-head') || heading;
    const title = heading.textContent;
    const content = create('div', 'care-section-body'); content.id = `${card.id}-body`;
    const description = headingContainer.querySelector('p');
    if (description) content.appendChild(description);
    while (card.firstChild) {
      const node = card.firstChild;
      if (node === headingContainer) node.remove(); else content.appendChild(node);
    }
    const newHeading = create('h2', 'care-section-heading');
    const toggle = create('button', 'care-section-toggle', `${icon(expanded ? 'consult' : 'sections')}<span>${title}</span><span class="care-chevron">⌄</span>`);
    toggle.type = 'button'; toggle.setAttribute('aria-controls', content.id);
    const expand = value => { content.hidden = !value; toggle.setAttribute('aria-expanded', String(value)); };
    toggle.addEventListener('click', () => expand(content.hidden));
    newHeading.append(toggle); card.append(newHeading, content);
    expand(expanded); card.classList.add('care-assessment');
    return {card, title, expand};
  };
  const adults = adultCards.map((card, i) => accordion(card, i === 0));
  const geriatric = agaCards.map((card, i) => accordion(card, i === 0));
  const adultHero = create('section', 'care-hero care-adult-only', '<h1>Acompanhamento preventivo</h1><p>Prevenção, avaliação de riscos e cuidado em um só fluxo.</p>');
  (adultRoot || adultConsult).before(adultHero);
  const flows = {
    adult: {sections: adults, summary: adultSummary, report: adultReport, sources: adultSources || $('#risk-methodology')},
    aga: {sections: geriatric, summary: $('.aga-sticky'), report: $('#aga-final-report'), sources: $('.aga-side .refs')}
  };
  const mode = () => body.dataset.careMode || 'adult';
  const tabs = create('nav', 'care-bottom-tabs no-print'); tabs.setAttribute('aria-label','Navegação do atendimento');
  const setView = (view, scroll = false) => {
    body.dataset.careView = view;
    delete body.dataset.careSection;
    tabs.querySelectorAll('button').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
      if (button.dataset.view === view) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
    });
    if (mode() === 'pediatric') $(`.peds-bottom-tabs button[data-view="${view}"]`)?.click();
    if (scroll) window.scrollTo({top:0,behavior:'smooth'});
  };
  [['consult','Consulta'],['sections','Seções'],['summary','Síntese']].forEach(([view,label]) => {
    const button = create('button','',`${icon(view)}<span>${label}</span>`); button.type='button'; button.dataset.view=view;
    button.addEventListener('click', () => setView(view,true)); tabs.append(button);
  });
  body.append(tabs);
  const openSection = entry => {
    setView('sections'); body.dataset.careSection=entry.card.id; entry.expand(true);
    document.querySelectorAll('.care-sidebar-nav button').forEach(b => b.classList.toggle('active',b.dataset.target === entry.card.id));
    entry.card.scrollIntoView({behavior:'smooth',block:'start'});
  };
  for (const [flow, config] of Object.entries(flows)) {
    const list = create('section', `care-section-list care-${flow}-only no-print`, '<h1>Seções da avaliação</h1><p>Preencha as seções conforme o atendimento.</p>');
    const sidebar = create('nav', `care-sidebar-nav care-${flow}-only no-print`); sidebar.setAttribute('aria-label', `Seções: ${flow === 'adult' ? 'Preventivo adulto' : 'Avaliação geriátrica ampla'}`);
    config.sections.forEach((entry,i) => {
      for (const parent of [list,sidebar]) {
        const button = create('button','',`${icon(i ? 'sections' : 'consult')}<span>${entry.title}</span><span aria-hidden="true">›</span>`);
        button.type='button'; button.dataset.target=entry.card.id;
        button.addEventListener('click', () => openSection(entry)); parent.append(button);
      }
    });
    for (const [label,target,symbol] of [['Síntese da consulta',config.summary,'summary'],['Documento do atendimento',config.report,'document'],['Referências técnicas',config.sources,'book']]) {
      if (!target) continue;
      for (const parent of [list,sidebar]) {
        const button=create('button','',`${icon(symbol)}<span>${label}</span><span aria-hidden="true">›</span>`);button.type='button';
        button.addEventListener('click',()=> {
          const entry=config.sections.find(e => e.card===target);
          if(entry) openSection(entry); else {setView('summary');target.scrollIntoView({behavior:'smooth',block:'start'});}
        });parent.append(button);
      }
    }
    (flow === 'adult' ? adultHero : agaRoot).before(list);
    $('.sidebar .menu')?.after(sidebar);
  }
  if (!adultRoot) adultSummary.after(adultActions);
  adultConsult.dataset.carePanel='consult';
  for (const card of adultCards.slice(1)) card.dataset.carePanel='section';
  for (const card of [adultSummary,adultReport,adultActions,adultSources].filter(Boolean)) card.dataset.carePanel='summary';
  for (const card of agaCards) card.dataset.carePanel='aga-section';
  const showCurrentSection = () => {
    for (const config of Object.values(flows)) config.sections.forEach(entry => entry.card.classList.toggle('care-selected-section', entry.card.id === body.dataset.careSection));
  };
  new MutationObserver(showCurrentSection).observe(body,{attributes:true,attributeFilter:['data-care-section']});
  // The same header and flow selector serve all care modes.
  const header=$('.peds-mobile-header');
  if(header) {
    const fresh=header.cloneNode(true);header.replaceWith(fresh);
    fresh.firstElementChild.addEventListener('click',()=>setView('sections',true));
    fresh.lastElementChild.addEventListener('click',()=>setView('summary',true));
  }
  const utilities = (target, flow) => {
    const row=create('div',`care-utilities no-print`);
    for (const [label,id] of [['Novo receituário','new-record-btn'],['Ajuda','help-btn'],['Limpar formulário','reset-form-btn'],['Gerar documento','generate-document-btn']]) {
      const button=create('button','',label);button.type='button';
      button.addEventListener('click',()=> {
        if(id==='new-record-btn') {setView('consult',true);flows[flow].sections[0].expand(true);return;}
        if(id==='help-btn' && !$('#help-btn')) {alert('Este sistema funciona como guia educativo de prevenção. Não solicita nem salva dados pessoais identificáveis.');return;}
        document.getElementById(id)?.click();
      });row.append(button);
    }
    target.append(row);
  };
  utilities(adultSummary,'adult');utilities($('.aga-sticky'),'aga');
  if(!adultRoot) {
    // Keep direct mobile cards in place: existing mode controllers use this structure.
    document.querySelectorAll('.app-content > .card').forEach(card => card.classList.add('care-adult-card'));
  }
  const syncMode = () => {
    setView('consult');
    window.scrollTo({top:0});
    $('.peds-sidebar-nav')?.toggleAttribute('hidden', mode()!=='pediatric');
    if(!adultRoot) document.querySelectorAll('.care-adult-card').forEach(card=>card.hidden=mode()!=='adult');
  };
  document.querySelectorAll('[name="care-mode"]').forEach(radio => radio.addEventListener('change',syncMode));
  // Reveal invalid fields before native validation tries to focus them.
  document.addEventListener('invalid', event => {
    if(mode()==='pediatric') {setView('consult');return;}
    const entry=flows[mode()]?.sections.find(e=>e.card.contains(event.target));
    if(entry) openSection(entry);
    let parent=event.target.parentElement;
    while(parent) {if(parent.tagName==='DETAILS') parent.open=true;parent=parent.parentElement;}
  },true);
  document.addEventListener('click',event => {
    const id=event.target.closest('button')?.id;
    if(id==='generate-document-btn') setView('summary');
    if(id==='new-record-btn') {setView('consult'); if(mode()!=='adult') {event.preventDefault();event.stopImmediatePropagation();}}
    if(event.target.closest('.menu-primary')) {
      event.preventDefault();setView('consult',true);
      const target=mode()==='pediatric' ? $('#peds-dob') : flows[mode()]?.sections[0].card;
      target?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },true);
  document.addEventListener('submit',event=> {
    if(event.target.id==='clinical-form' && mobile.matches) setView('summary',true);
    if(event.target.id==='aga-form' && !event.target.querySelector(':invalid') && mobile.matches) setView('summary',true);
  });
  const pediatricRoot = $('#pediatric-content');
  new MutationObserver(() => {
    if (mode() === 'pediatric' && body.dataset.careView !== pediatricRoot.dataset.view) setView(pediatricRoot.dataset.view);
  }).observe(pediatricRoot, {attributes:true, attributeFilter:['data-view']});
  syncMode();
})();
