(() => {
  const root = document.getElementById('pediatric-content');
  if (!root) return;
  const paths = {
    consult: '<path d="M6 3v6a5 5 0 0 0 10 0V3M4 3h4m6 0h4M11 14v3a4 4 0 0 0 8 0v-3"/><circle cx="19" cy="12" r="2"/>',
    growth: '<path d="M4 20V14h3v6zm6 0V9h3v11zm6 0V4h3v16z"/>',
    document: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
    sections: '<path d="M9 6h11M9 12h11M9 18h11M4 6h1m-1 6h1m-1 6h1"/>',
    book: '<path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-3-1-7-2-10 1z"/>',
    child: '<circle cx="12" cy="5" r="2"/><path d="M4 8l8 5 8-5M12 13v8m0-5-5 5m5-5 5 5"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.document}</svg>`;
  const labels = ['Consulta e antropometria','Crescimento','Desenvolvimento','Denver II','M-CHAT-R/F','Risco e saúde bucal'];
  const icons = ['consult','growth','child','document','child','consult'];
  const cards = [...root.querySelectorAll('#peds-form > section')];
  cards.forEach((card, i) => {
    card.id ||= `peds-design-section-${i}`;
    card.classList.add('peds-assessment-card');
    const heading = card.querySelector('.peds-section-heading');
    const content = document.createElement('div');
    content.className = 'peds-section-body';
    while (heading.nextSibling) content.appendChild(heading.nextSibling);
    card.appendChild(content);
    heading.innerHTML = `<button type="button" class="peds-section-toggle" aria-expanded="${i === 0}" aria-controls="${card.id}-body">${icon(icons[i])}<strong>${labels[i]}</strong>${i ? '<span class="peds-status">Pendente</span>' : ''}<span class="peds-chevron">⌄</span></button>`;
    content.id = `${card.id}-body`;
    content.hidden = i !== 0;
    heading.querySelector('button').addEventListener('click', () => {
      content.hidden = !content.hidden;
      heading.querySelector('button').setAttribute('aria-expanded', String(!content.hidden));
    });
  });
  const measures = document.createElement('details');
  measures.className = 'peds-more-measures';
  measures.innerHTML = '<summary>Mais medidas</summary><p>Idade gestacional, técnica de medida, perímetro cefálico e medidas anteriores.</p>';
  const grid = cards[0].querySelector('.peds-grid');
  const originalLabels = [...grid.children];
  const extraGrid = document.createElement('div'); extraGrid.className = 'peds-grid';
  ['#peds-gest-weeks', '#peds-height-method', '#peds-head'].forEach(id => extraGrid.appendChild(root.querySelector(id).closest('label')));
  measures.appendChild(extraGrid);
  measures.appendChild(cards[0].querySelector('.peds-previous'));
  grid.after(measures);
  const desktop = window.matchMedia('(min-width:761px)');
  const arrangeMeasures = () => {
    if (desktop.matches) { originalLabels.forEach(label => grid.appendChild(label)); measures.open = true; }
    else { ['#peds-gest-weeks', '#peds-height-method', '#peds-head'].forEach(id => extraGrid.appendChild(root.querySelector(id).closest('label'))); measures.open = false; }
  };
  arrangeMeasures(); desktop.addEventListener('change', arrangeMeasures);

  root.querySelector('#peds-form').addEventListener('invalid', event => {
    const body = event.target.closest('.peds-section-body');
    if (body) { body.hidden = false; body.previousElementSibling.querySelector('button').setAttribute('aria-expanded', 'true'); }
    const details = event.target.closest('details'); if (details) details.open = true;
  }, true);
  root.querySelector('.peds-hero-card p').textContent = 'Crescimento, desenvolvimento e cuidado em um só fluxo.';
  root.querySelector('.refs h3').textContent = 'Referências técnicas';
  root.querySelector('.peds-sticky h3').insertAdjacentHTML('afterbegin', icon('document'));
  root.querySelector('.refs h3').insertAdjacentHTML('afterbegin', icon('book'));
  const sectionList = document.createElement('section');
  sectionList.className = 'peds-mobile-sections no-print';
  sectionList.innerHTML = '<h2>Seções da avaliação</h2><p>Preencha as seções conforme o atendimento.</p>';
  root.prepend(sectionList);
  const nav = document.createElement('nav');
  nav.className = 'peds-sidebar-nav no-print';
  nav.setAttribute('aria-label', 'Seções da puericultura');
  const go = (card, button) => {
    setView('sections');
    root.dataset.sectionOpen = 'true';
    card.querySelector('.peds-section-body').hidden = false;
    card.querySelector('.peds-section-toggle').setAttribute('aria-expanded', 'true');
    nav.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === button));
    card.scrollIntoView({behavior:'smooth', block:'start'});
  };
  cards.forEach((card, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `${icon(icons[i])}<span>${i === 0 ? 'Consulta e medidas' : labels[i]}</span>`;
    button.classList.toggle('active', i === 0);
    button.addEventListener('click', () => go(card, button));
    nav.appendChild(button);
    const row = button.cloneNode(true);
    row.innerHTML += `${i ? '<span class="peds-status">Pendente</span>' : ''}<span>›</span>`;
    row.addEventListener('click', () => go(card, button));
    sectionList.appendChild(row);
  });
  const report = root.querySelector('#peds-final-report');
  report.classList.add('peds-report-card');
  const refs = root.querySelector('.refs');
  for (const [label, target] of [['Classificação e conduta', report], ['Referências técnicas', refs]]) {
    const button = document.createElement('button');
    button.type = 'button'; button.innerHTML = `${icon('book')}<span>${label}</span>`;
    button.addEventListener('click', () => { setView('summary'); target.scrollIntoView({behavior:'smooth'}); });
    nav.appendChild(button);
    const row = button.cloneNode(true);
    row.addEventListener('click', () => { setView('summary'); target.scrollIntoView({behavior:'smooth'}); });
    sectionList.appendChild(row);
  }
  document.querySelector('.sidebar .menu')?.after(nav);
  const utilities = document.createElement('div');
  utilities.className = 'peds-utilities no-print';
  for (const [label, id] of [['Novo receituário','new-record-btn'], ['Ajuda','help-btn'], ['Limpar formulário','reset-form-btn'], ['Gerar documento','generate-document-btn']]) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label;
    button.addEventListener('click', () => (document.getElementById(id) || (id === 'new-record-btn' ? document.querySelector('.menu-primary') : null))?.click());
    utilities.appendChild(button);
  }
  root.querySelector('.peds-sticky').appendChild(utilities);
  const tabs = document.createElement('nav');
  tabs.className = 'peds-bottom-tabs no-print';
  tabs.setAttribute('aria-label','Navegação da consulta');
  const setView = view => {
    root.dataset.view = view;
    delete root.dataset.sectionOpen;
    tabs.querySelectorAll('button').forEach(b => { b.classList.toggle('active', b.dataset.view === view); b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'); });
  };
  [['consult','Consulta','document'],['sections','Seções','sections'],['summary','Síntese','growth']].forEach(([view, label, symbol]) => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.view = view;
    button.innerHTML = `${icon(symbol)}<span>${label}</span>`;
    button.addEventListener('click', () => { setView(view); window.scrollTo({top:0,behavior:'smooth'}); });
    tabs.appendChild(button);
  });
  root.appendChild(tabs);
  setView('consult');
  const switcher = document.querySelector('.care-mode-switch');
  const select = document.createElement('select');
  select.className = 'peds-mobile-mode'; select.setAttribute('aria-label', 'Fluxo de atendimento');
  select.innerHTML = '<option value="adult">Preventivo adulto</option><option value="pediatric">Puericultura</option><option value="aga">Avaliação geriátrica ampla</option>';
  select.value = document.querySelector('[name="care-mode"]:checked')?.value || 'adult';
  select.addEventListener('change', () => {
    const radio = document.querySelector(`[name="care-mode"][value="${select.value}"]`);
    radio.checked = true; radio.dispatchEvent(new Event('change',{bubbles:true}));
  });
  document.querySelectorAll('[name="care-mode"]').forEach(r => r.addEventListener('change', () => { select.value = r.value; }));
  switcher?.appendChild(select);
  const header = document.createElement('header'); header.className = 'peds-mobile-header no-print';
  header.innerHTML = '<button type="button" aria-label="Abrir seções">☰</button><strong>Cuidar<span>+</span></strong><button type="button" aria-label="Abrir síntese">⋮</button>';
  header.firstElementChild.addEventListener('click', () => setView('sections'));
  header.lastElementChild.addEventListener('click', () => setView('summary'));
  switcher?.before(header);
})();
