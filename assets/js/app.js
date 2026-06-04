const CONTENT = window.MoshiachContent;

const state = {
  day: 0,
  soulLevel: 3,
  choices: [],
  journalEntries: [],
  sortScore: 0,
  scaleValue: 50,
  lang: localStorage.getItem('moshiach-lang') || 'ru'
};
window.state = state;

const screens = [
  renderHome,
  renderIntro,
  renderDay1,
  renderDay2,
  renderDay3,
  renderDay4,
  renderDay5,
  renderDay6,
  renderShabbat,
  renderFinal
];

function tr() {
  return CONTENT.translations[state.lang];
}

function src() {
  return CONTENT.source;
}

function screenText(key) {
  return tr().screens[key];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function interpolate(text, vars) {
  return text.replace(/\{(\w+)\}/g, (_, key) => vars[key] != null ? vars[key] : '');
}

function setLanguage(lang) {
  if (!CONTENT.translations[lang]) return;
  state.lang = lang;
  localStorage.setItem('moshiach-lang', lang);
  document.documentElement.lang = tr().meta.htmlLang;
  document.title = tr().meta.title;
  renderMenu();
  renderScreen(state.day, { skipMenu: true });
  if (window.AudioQuest && typeof window.AudioQuest.refreshLabels === 'function') {
    window.AudioQuest.refreshLabels();
  }
}
window.setLanguage = setLanguage;

function next() {
  if (state.day < screens.length - 1) renderScreen(state.day + 1);
}
window.next = next;

function renderScreen(index, options = {}) {
  state.day = index;
  const content = document.getElementById('screenContent');
  content.innerHTML = '';
  const card = document.getElementById('mainCard');
  card.style.animation = 'none';
  setTimeout(() => {
    card.style.animation = 'fadeIn 0.6s ease forwards';
  }, 10);
  screens[index](content);
  if (!options.skipMenu) renderMenu();
  if (window.AudioQuest) window.AudioQuest.onScreenChange(index);
}
window.renderScreen = renderScreen;

function init() {
  document.documentElement.lang = tr().meta.htmlLang;
  document.title = tr().meta.title;
  createStars();
  bindMenuEvents();
  renderMenu();
  renderScreen(0, { skipMenu: true });
  if (window.AudioQuest && typeof window.AudioQuest.refreshLabels === 'function') {
    window.AudioQuest.refreshLabels();
  }
}

function createStars() {
  const container = document.getElementById('stars');
  container.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 70}%;
      --duration:${2 + Math.random() * 4}s;
      --delay:${Math.random() * 4}s;
    `;
    container.appendChild(s);
  }
}

function progressBar(current, total) {
  const pct = Math.round((current / total) * 100);
  return `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>`;
}

function dayDots(current) {
  let html = '<div class="day-indicator">';
  for (let i = 1; i <= 6; i++) {
    const cls = i < current ? 'done' : i === current ? 'active' : '';
    html += `<div class="day-dot ${cls}"></div>`;
  }
  html += '</div>';
  return html;
}

function divider() {
  return '<div class="divider"><div class="divider-line"></div><span class="divider-star">✦</span><div class="divider-line"></div></div>';
}

function footerCredit() {
  const common = tr().common;
  const commonSrc = src().common;
  return `<div class="footer-credit">${common.footerLead} <span>${commonSrc.footerHe}</span> · ${common.footerRef}</div>`;
}

function glossaryItem(sourceLabel, item) {
  return {
    term: `${sourceLabel} · ${item.label}`,
    def: item.def,
    ref: item.ref || ''
  };
}

function chapterGlossary(items) {
  const itemsHtml = items.map(item => `
    <div class="glossary-item">
      <div class="glossary-term">${item.term}</div>
      <div class="glossary-def">${item.def}</div>
      ${item.ref ? `<div class="glossary-ref">${item.ref}</div>` : ''}
    </div>`).join('');
  return `
    <div class="chapter-glossary">
      <button class="chapter-glossary-btn" onclick="this.parentElement.classList.toggle('open')">
        ${src().common.glossaryToggleHe} · ${tr().common.glossaryToggle} ▾
      </button>
      <div class="chapter-glossary-panel">${itemsHtml}</div>
    </div>`;
}

function mannaScene(tentPos, label) {
  return `
    <div class="manna-scene" id="mannaScene">
      <div class="scene-sky"></div>
      <div class="scene-ground"></div>
      <div class="tent" style="left:${tentPos}%" id="tentEl">⛺</div>
      <div class="scene-label">${label}</div>
    </div>`;
}

function spawnManna(count, xRange) {
  setTimeout(() => {
    const scene = document.getElementById('mannaScene');
    if (!scene) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = 'manna-particle';
        p.style.cssText = `
          left:${xRange[0] + Math.random() * (xRange[1] - xRange[0])}%;
          top:5%;
          --fall-dist:${50 + Math.random() * 60}px;
          animation-delay:${Math.random() * 0.5}s;
        `;
        scene.appendChild(p);
      }, i * 120);
    }
  }, 500);
}

function renderMenu() {
  const common = tr().common;
  const sections = tr().sections;
  const button = document.getElementById('menuToggleBtn');
  const panel = document.getElementById('topMenuPanel');
  const title = document.getElementById('menuTitle');
  const subtitle = document.getElementById('menuSubtitle');
  const aboutTitle = document.getElementById('menuAboutTitle');
  const aboutText = document.getElementById('menuAboutText');
  const sectionsTitle = document.getElementById('menuSectionsTitle');
  const languageTitle = document.getElementById('menuLanguageTitle');
  const sectionsList = document.getElementById('menuSectionsList');
  const ruBtn = document.getElementById('langRuBtn');
  const deBtn = document.getElementById('langDeBtn');

  button.setAttribute('aria-label', panel.classList.contains('open') ? common.menuClose : common.menuOpen);
  title.textContent = common.menuTitle;
  subtitle.textContent = common.menuSubtitle;
  aboutTitle.textContent = common.menuAboutTitle;
  aboutText.textContent = common.menuAboutText;
  sectionsTitle.textContent = common.menuSectionsTitle;
  languageTitle.textContent = common.languageTitle;
  ruBtn.textContent = common.languageRu;
  deBtn.textContent = common.languageDe;
  ruBtn.classList.toggle('active', state.lang === 'ru');
  deBtn.classList.toggle('active', state.lang === 'de');

  sectionsList.innerHTML = sections.map((label, index) => {
    const target = index === 1 ? 'about' : index > 1 ? index - 1 : 0;
    const active = (index === 0 && state.day === 0) || (index > 1 && state.day === index - 1) ? 'active' : '';
    return `<button class="menu-section-link ${active}" onclick="menuNavigate(${target})">${label}</button>`;
  }).join('');
}

function bindMenuEvents() {
  const button = document.getElementById('menuToggleBtn');
  const panel = document.getElementById('topMenuPanel');
  button.addEventListener('click', () => {
    panel.classList.toggle('open');
    button.classList.toggle('open', panel.classList.contains('open'));
    renderMenu();
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.top-menu')) {
      panel.classList.remove('open');
      button.classList.remove('open');
      renderMenu();
    }
  });
}

function menuNavigate(target) {
  const panel = document.getElementById('topMenuPanel');
  const button = document.getElementById('menuToggleBtn');
  panel.classList.remove('open');
  button.classList.remove('open');
  if (target === 'about') {
    if (state.day !== 0) {
      renderScreen(0);
      setTimeout(() => {
        document.getElementById('projectAbout')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    } else {
      document.getElementById('projectAbout')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  renderScreen(target);
}
window.menuNavigate = menuNavigate;

function termSpan(he, label, def) {
  return `<span class="term" data-tip-heb="${escapeHtml(he)} · ${escapeHtml(label)}" data-tip="${escapeHtml(def)}">${he}</span>`;
}

function quoteBlock(he, localized, sourceText) {
  return `
    <div class="quote-block">
      <div class="quote-hebrew">${he}</div>
      <div class="quote-russian">${localized}</div>
      <div class="quote-source">${sourceText}</div>
    </div>`;
}

function renderHome(el) {
  const s = screenText('home');
  const hs = src().home;
  el.innerHTML = `
    <div class="home-eyebrow">${hs.eyebrowHe} · ${s.eyebrow}</div>
    <div class="hebrew-title">${hs.titleHe}</div>
    <div class="russian-subtitle">${s.subtitle}</div>
    <div class="rebbe-credit">${hs.rebbeHe}</div>
    ${divider()}
    <div class="motto-block">
      <div class="motto-heb">${hs.mottoHe}</div>
      <div class="motto-rus">${s.motto}</div>
    </div>
    ${divider()}
    <div class="project-about" id="projectAbout">
      <div class="project-about-badge">${tr().common.aboutBadge}</div>
      <div class="project-about-text">${tr().common.menuAboutText}</div>
    </div>
    <div class="chapters-label">${s.chaptersLabel} · פָּרָשִׁיּוֹת</div>
    <div class="chapter-list">
      <div class="chapter-card" onclick="renderScreen(1)">
        <div class="chapter-card-heb">${hs.chapterHe}</div>
        <div class="chapter-card-rus">${s.chapterTitle}</div>
        <div class="chapter-card-desc">${s.chapterDescription}</div>
        <div class="chapter-card-footer">
          <span class="chapter-card-meta">${s.chapterMeta}</span>
          <span class="chapter-card-enter">${s.enter}</span>
        </div>
      </div>
    </div>`;
}

function renderIntro(el) {
  const s = screenText('intro');
  const hs = src().intro;
  el.innerHTML = `
    <div class="hebrew-title">${hs.titleHe}</div>
    <div class="russian-subtitle">${s.subtitle}</div>
    <div class="rebbe-credit">${hs.rebbeHe}</div>
    ${divider()}
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">
      ${s.body1}<br><br>
      ${s.body2Lead} ${termSpan('רבי מנחם מנדל שניאורסון', s.body2Lead, s.body2Term)}${s.body2Rest}
    </div>
    ${divider()}
    <table class="souls-table">
      <thead><tr>${s.tableHead.map(head => `<th>${head}</th>`).join('')}</tr></thead>
      <tbody>
        ${s.tableRows.map(row => `<tr><td>${row[0]}</td><td class="heb">${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join('')}
      </tbody>
    </table>
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    <button class="btn-primary" onclick="next()">${s.next}</button>
    ${chapterGlossary([
      glossaryItem('מָן', s.glossary[0]),
      glossaryItem('צַדִּיק', s.glossary[1]),
      glossaryItem('בֵּינוֹנִי', s.glossary[2]),
      glossaryItem('רָשָׁע', s.glossary[3]),
      glossaryItem('גְּאוּלָה', s.glossary[4])
    ])}
    ${footerCredit()}`;
}

function renderDay1(el) {
  const s = screenText('day1');
  const hs = src().day1;
  el.innerHTML = `
    ${progressBar(1, 7)}
    ${dayDots(1)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    ${mannaScene(15, s.sceneLabel)}
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.bodyBefore}${termSpan(hs.termHe, s.termLabel, s.termDef)}${s.bodyAfter}</div>
    <div class="choices" id="choices1">
      ${s.choices.map((choice, idx) => `<button class="choice-btn" onclick="makeChoice1(${idx})">${choice}</button>`).join('')}
    </div>
    <div id="feedback1" class="hidden"></div>
    <div id="btn1" class="hidden"><button class="btn-primary" onclick="next()">${s.next}</button></div>
    ${chapterGlossary([
      glossaryItem('צַדִּיק', s.glossary[0]),
      glossaryItem('בֵּינוֹנִי', s.glossary[1]),
      glossaryItem('רָשָׁע', s.glossary[2])
    ])}
    ${footerCredit()}`;
  spawnManna(5, [0, 20]);
}

function makeChoice1(idx) {
  const s = screenText('day1');
  const hs = src().day1;
  const btns = document.querySelectorAll('#choices1 .choice-btn');
  btns.forEach(b => b.disabled = true);
  btns[idx].classList.add('selected');
  const feedbacks = [
    { heb: 'כָּל נִשְׁמָה הִיא עוֹלָם מָלֵא', ru: s.feedback[0].quote, note: s.feedback[0].note, delta: 1 },
    { heb: 'כָּל יִשְׂרָאֵל עֲרֵבִים זֶה בָּזֶה', ru: s.feedback[1].quote, note: s.feedback[1].note, delta: 0 },
    { heb: 'עֲבוֹד אֶת ה\' אֱלֹקֶיךָ', ru: s.feedback[2].quote, note: s.feedback[2].note, delta: 0 }
  ];
  const f = feedbacks[idx];
  state.soulLevel = Math.min(5, Math.max(1, state.soulLevel + f.delta));
  state.choices.push(idx);
  const box = document.getElementById('feedback1');
  box.innerHTML = `<div class="feedback-box"><div class="hebrew">${f.heb}</div><div class="translation">${f.ru}</div><div class="source">${f.note}</div></div>`;
  box.classList.remove('hidden');
  document.getElementById('btn1').classList.remove('hidden');
  const tent = document.getElementById('tentEl');
  const positions = [65, 45, 25, 15, 8];
  if (tent) tent.style.left = positions[state.soulLevel - 1] + '%';
  spawnManna(3, [10, 30]);
}
window.makeChoice1 = makeChoice1;

function renderDay2(el) {
  const s = screenText('day2');
  const hs = src().day2;
  el.innerHTML = `
    ${progressBar(2, 7)}
    ${dayDots(2)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    <div class="body-text">${s.body}</div>
    <div class="dual-bread-grid">
      <div class="dual-bread-card earth">
        <div class="dual-bread-he">${hs.breadEarthHe}</div>
        <div class="dual-bread-title">${s.breadEarthTitle}</div>
        <div class="dual-bread-mini-he">${hs.niglehHe}</div>
        <div class="dual-bread-body">${s.breadEarthBody}</div>
      </div>
      <div class="dual-bread-card heaven">
        <div class="dual-bread-he">${hs.breadHeavenHe}</div>
        <div class="dual-bread-title">${s.breadHeavenTitle}</div>
        <div class="dual-bread-mini-he">${hs.pnimiutHe}</div>
        <div class="dual-bread-body">${s.breadHeavenBody}</div>
      </div>
    </div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text"><strong>${s.gameLead}</strong> ${s.gameText}</div>
    <div class="sort-cards" id="sortCards">
      ${s.sortData.map((item, i) => `<div class="sort-card" onclick="sortCard(this, '${item.correct}', ${i})" data-index="${i}" data-correct="${item.correct}">${item.text}</div>`).join('')}
    </div>
    <div class="sort-container">
      <div class="sort-zone" id="zone-earth" onclick="dropToZone('earth')">
        <h4>${hs.breadEarthHe} 🌾</h4><p>${s.zoneEarth}</p><div id="earth-results"></div>
      </div>
      <div class="sort-zone" id="zone-heaven" onclick="dropToZone('heaven')">
        <h4>${hs.breadHeavenHe} ✨</h4><p>${s.zoneHeaven}</p><div id="heaven-results"></div>
      </div>
    </div>
    <div id="sortFeedback" class="hidden"></div>
    <div id="sortBtn" class="hidden"><button class="btn-primary" onclick="next()">${s.next}</button></div>
    ${chapterGlossary([
      glossaryItem(hs.niglehHe, s.glossary[0]),
      glossaryItem(hs.pnimiutHe, s.glossary[1]),
      glossaryItem('מָן', s.glossary[2])
    ])}
    ${footerCredit()}`;
  window._sortData = s.sortData;
  window._sortSelected = null;
  window._sortPlaced = 0;
  window._sortCorrect = 0;
}

function sortCard(el, correct, index) {
  document.querySelectorAll('.sort-card').forEach(c => { c.style.outline = 'none'; });
  el.style.outline = '2px solid var(--gold)';
  window._sortSelected = { el, correct, index };
}
window.sortCard = sortCard;

function dropToZone(zone) {
  const s = screenText('day2');
  const hs = src().day2;
  if (!window._sortSelected) return;
  const { el, correct } = window._sortSelected;
  el.classList.add('placed');
  el.style.outline = 'none';
  const isCorrect = correct === zone;
  window._sortPlaced++;
  if (isCorrect) window._sortCorrect++;
  const result = document.createElement('div');
  result.className = `sort-result ${isCorrect ? 'correct' : 'wrong'}`;
  result.textContent = (isCorrect ? '✓ ' : '✗ ') + el.textContent;
  document.getElementById(zone + '-results').appendChild(result);
  window._sortSelected = null;
  state.sortScore = window._sortCorrect;
  if (window._sortPlaced === window._sortData.length) {
    const fb = document.getElementById('sortFeedback');
    fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.feedbackHe}</div><div class="translation">${s.feedback}</div><div class="source">${window._sortCorrect} / ${window._sortData.length} · ${s.feedbackSource}</div></div>`;
    fb.classList.remove('hidden');
    document.getElementById('sortBtn').classList.remove('hidden');
  }
}
window.dropToZone = dropToZone;

function renderDay3(el) {
  const s = screenText('day3');
  const hs = src().day3;
  el.innerHTML = `
    ${progressBar(3, 7)}
    ${dayDots(3)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    ${mannaScene(55, s.sceneLabel)}
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body1}</div>
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    <div class="body-text">${s.body2Before}${termSpan(hs.teshuvaHe, s.termLabel, s.termDef)}${s.body2After}</div>
    ${divider()}
    <div class="body-text"><strong>${s.reflectionLead}</strong></div>
    <div class="reflection-question">${s.reflectionQuestion}</div>
    <textarea class="journal-input" id="journalDay3" placeholder="${s.placeholder}"></textarea>
    <div id="journal3feedback" class="hidden"></div>
    <button class="btn-secondary" onclick="submitJournal3()">${s.submit}</button>
    <button class="btn-primary" onclick="next()">${s.next}</button>
    ${chapterGlossary([
      glossaryItem(hs.teshuvaHe, s.glossary[0]),
      glossaryItem('מָן', s.glossary[1])
    ])}
    ${footerCredit()}`;
  spawnManna(8, [40, 80]);
}

function submitJournal3() {
  const s = screenText('day3');
  const hs = src().day3;
  const val = document.getElementById('journalDay3').value.trim();
  state.journalEntries.push(val || s.emptyJournal);
  const fb = document.getElementById('journal3feedback');
  fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.feedbackHe}</div><div class="translation">${s.feedback}</div><div class="source">${s.feedbackSource}</div></div>`;
  fb.classList.remove('hidden');
}
window.submitJournal3 = submitJournal3;

function renderDay4(el) {
  const s = screenText('day4');
  const hs = src().day4;
  el.innerHTML = `
    ${progressBar(4, 7)}
    ${dayDots(4)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    <div class="body-text">${s.body1Before}${termSpan(hs.torahOrHe, s.termLabel, s.termDef)}${s.body1After}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    <div class="body-text">${s.body2Before}${termSpan(hs.gashmiyutHe, s.gashmiyutLabel, s.gashmiyutDef)}${s.body2Middle}${termSpan(hs.ruhniyutHe, s.ruhniyutLabel, s.ruhniyutDef)}${s.body2After}</div>
    <div class="scale-container">
      <div class="scale-labels">
        <span class="scale-label-gashmiyut">${hs.gashmiyutHe} · ${s.scaleLeft}</span>
        <span class="scale-label-ruhniut">${hs.ruhniyutHe} · ${s.scaleRight}</span>
      </div>
      <div class="scale-track" id="scaleTrack" onclick="moveScale(event)"><div class="scale-thumb" id="scaleThumb" style="left:${state.scaleValue}%"></div></div>
      <div id="scaleLabel" class="scale-label-copy">${s.scalePrompt}</div>
    </div>
    <div id="scaleFeedback" class="hidden"></div>
    <button class="btn-primary" onclick="next()">${s.next}</button>
    ${chapterGlossary([
      glossaryItem(hs.gashmiyutHe, s.glossary[0]),
      glossaryItem(hs.ruhniyutHe, s.glossary[1]),
      glossaryItem('מֹשֶׁה רַבֵּינוּ', s.glossary[2])
    ])}
    ${footerCredit()}`;
}

function moveScale(e) {
  const s = screenText('day4');
  const hs = src().day4;
  const track = document.getElementById('scaleTrack');
  const rect = track.getBoundingClientRect();
  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  state.scaleValue = pct;
  document.getElementById('scaleThumb').style.left = pct + '%';
  const labelIndex = pct < 25 ? 0 : pct < 50 ? 1 : pct < 75 ? 2 : 3;
  const [heb, label] = s.scaleLabels[labelIndex];
  document.getElementById('scaleLabel').innerHTML = `<span style="font-family:'Noto Serif Hebrew',serif;color:var(--gold-deep)">${heb}</span> — ${label}`;
  const fb = document.getElementById('scaleFeedback');
  fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.feedbackHe}</div><div class="translation">${s.feedback}</div><div class="source">${s.feedbackSource}</div></div>`;
  fb.classList.remove('hidden');
}
window.moveScale = moveScale;

function renderDay5(el) {
  const s = screenText('day5');
  const hs = src().day5;
  el.innerHTML = `
    ${progressBar(5, 7)}
    ${dayDots(5)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    <div class="body-text">${s.body1Before}${termSpan(hs.shabbatHe, s.termLabel, s.termDef)}${s.body1After}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body2}</div>
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    <div class="body-text">${s.body3}</div>
    ${quoteBlock(hs.quote3He, s.quote3, s.quote3Source)}
    ${divider()}
    <div class="body-text"><strong>${s.puzzleLead}</strong> ${s.puzzleText}</div>
    <div id="mannaGrid" style="margin:20px 0;"></div>
    <div id="mannaStatus" style="text-align:center;color:var(--text-mid);font-size:0.9rem;margin:8px 0 16px;">${interpolate(s.status, { count: 0 })}</div>
    <div style="text-align:center;margin-bottom:16px;"><button onclick="checkMannaDistribution()" class="btn-inline">${s.check}</button></div>
    <div id="mannaResult" class="hidden"></div>
    <div id="mannaBtn" class="hidden"><button class="btn-primary" onclick="next()">${s.next}</button></div>
    ${chapterGlossary([
      glossaryItem(hs.shabbatHe, s.glossary[0]),
      glossaryItem('מָן', s.glossary[1])
    ])}
    ${footerCredit()}`;
  window._mannaDays = [0, 0, 0, 0, 0, 0, 0];
  _renderMannaGrid();
}

function _renderMannaGrid() {
  const s = screenText('day5');
  const dayNames = [
    { heb: 'יום א\'', ru: s.dayNames[0] },
    { heb: 'יום ב\'', ru: s.dayNames[1] },
    { heb: 'יום ג\'', ru: s.dayNames[2] },
    { heb: 'יום ד\'', ru: s.dayNames[3] },
    { heb: 'יום ה\'', ru: s.dayNames[4] },
    { heb: 'עֶרֶב שַׁבָּת', ru: s.dayNames[5] },
    { heb: 'שַׁבָּת', ru: s.dayNames[6] }
  ];
  const grid = document.getElementById('mannaGrid');
  if (!grid) return;
  const portions = window._mannaDays;
  const total = portions.reduce((a, b) => a + b, 0);
  grid.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;direction:ltr;">${dayNames.map((day, i) => {
    const isShabbat = i === 6;
    const count = portions[i];
    const icons = count === 0 ? (isShabbat ? '<span style="font-size:1.1rem;">✡</span>' : '<span style="color:var(--sand-dark);font-size:1.3rem;">·</span>') : '🌾'.repeat(count);
    return `<div onclick="${isShabbat ? '' : `mannaClickDay(${i})`}" style="width:80px;min-height:100px;background:${isShabbat ? 'rgba(26,37,53,0.07)' : 'rgba(201,146,42,0.06)'};border:1.5px solid ${isShabbat ? 'var(--night-mid)' : 'var(--gold)'};border-radius:4px;padding:10px 4px 8px;text-align:center;cursor:${isShabbat ? 'default' : 'pointer'};transition:background 0.15s;user-select:none;${!isShabbat && count > 0 ? 'background:rgba(201,146,42,0.14);' : ''}">
      <div style="font-family:'Noto Serif Hebrew',serif;font-size:0.72rem;color:${isShabbat ? 'var(--night-mid)' : 'var(--gold-deep)'};margin-bottom:3px;line-height:1.2;">${day.heb}</div>
      <div style="font-size:0.68rem;color:var(--text-mid);margin-bottom:8px;">${day.ru}</div>
      <div style="font-size:1.25rem;min-height:28px;line-height:1.4;">${icons}</div>
      <div style="font-size:0.62rem;color:var(--text-light);margin-top:6px;">${isShabbat ? s.restLabel : (count === 0 ? s.clickLabel : interpolate(s.portionsLabel, { count }))}</div>
    </div>`;
  }).join('')}</div>`;
  const statusEl = document.getElementById('mannaStatus');
  if (statusEl) statusEl.textContent = interpolate(s.status, { count: total });
}
window._renderMannaGrid = _renderMannaGrid;

function mannaClickDay(i) {
  if (i === 6) return;
  window._mannaDays[i] = (window._mannaDays[i] + 1) % 3;
  _renderMannaGrid();
  const resultEl = document.getElementById('mannaResult');
  if (resultEl && !resultEl.classList.contains('hidden')) resultEl.classList.add('hidden');
}
window.mannaClickDay = mannaClickDay;

function checkMannaDistribution() {
  const s = screenText('day5');
  const hs = src().day5;
  const correct = [1, 1, 1, 1, 1, 2, 0];
  const current = window._mannaDays;
  const allCorrect = correct.every((v, i) => v === current[i]);
  const resultEl = document.getElementById('mannaResult');
  if (allCorrect) {
    resultEl.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.successHe}</div><div class="translation">${s.success}</div><div class="source">${s.successSource}</div></div>`;
    resultEl.classList.remove('hidden');
    document.getElementById('mannaBtn').classList.remove('hidden');
  } else {
    const wrong = correct.map((v, i) => v !== current[i] ? s.dayLabels[i] : null).filter(Boolean);
    resultEl.innerHTML = `<div class="feedback-error">${interpolate(s.wrong, { days: wrong.join(', ') })}</div>`;
    resultEl.classList.remove('hidden');
  }
}
window.checkMannaDistribution = checkMannaDistribution;

function renderDay6(el) {
  const s = screenText('day6');
  const hs = src().day6;
  el.innerHTML = `
    ${progressBar(6, 7)}
    ${dayDots(6)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    <div class="body-text">${s.body1}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body2Before}${termSpan(hs.teshuvaHe, s.termLabel, s.termDef)}${s.body2After}</div>
    <div class="body-text">${s.body3Before}${termSpan(hs.rayatzHe, s.rayatzLabel, s.rayatzDef)}${s.body3After}</div>
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    <div class="body-text">${s.body4}</div>
    ${quoteBlock(hs.quote3He, s.quote3, s.quote3Source)}
    ${divider()}
    <div class="body-text"><strong>${s.reflectionLead}</strong></div>
    <div class="reflection-question">${s.reflectionQuestion}</div>
    <textarea class="journal-input" id="journalDay6" placeholder="${s.placeholder}"></textarea>
    <button class="btn-secondary" onclick="submitJournal6()">${s.submit}</button>
    <div id="journal6fb" class="hidden"></div>
    <button class="btn-primary" onclick="next()" style="margin-top:20px">${s.next}</button>
    ${chapterGlossary([
      glossaryItem(hs.teshuvaHe, s.glossary[0]),
      glossaryItem('גְּאוּלָה', s.glossary[1]),
      glossaryItem(hs.rayatzHe, s.glossary[2])
    ])}
    ${footerCredit()}`;
}

function submitJournal6() {
  const s = screenText('day6');
  const hs = src().day6;
  const val = document.getElementById('journalDay6').value.trim();
  state.journalEntries.push(val || s.emptyJournal);
  const fb = document.getElementById('journal6fb');
  fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.feedbackHe}</div><div class="translation">${s.feedback}</div><div class="source">${s.feedbackSource}</div></div>`;
  fb.classList.remove('hidden');
}
window.submitJournal6 = submitJournal6;

function renderShabbat(el) {
  const s = screenText('shabbat');
  const hs = src().shabbat;
  const mannaIcon = state.choices.filter(c => c === 0).length >= 2 ? '🍞' : state.choices.filter(c => c === 0).length >= 1 ? '🫓' : '🌾';
  const soulName = state.soulLevel >= 4 ? hs.soulTzadikHe : state.soulLevel >= 3 ? hs.soulBeinoniHe : hs.soulPathHe;
  el.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-family:'Noto Serif Hebrew',serif;font-size:0.85rem;color:var(--text-light);letter-spacing:0.15em;">${hs.titleHe}</div>
      <div class="day-title" style="margin-bottom:0">${s.title}</div>
    </div>
    <div class="shabbat-candles">
      <div class="candle"><div class="candle-flame"></div><div class="candle-body"></div></div>
      <div class="candle" style="animation-delay:0.3s"><div class="candle-flame" style="animation-delay:0.2s"></div><div class="candle-body"></div></div>
    </div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    ${divider()}
    <div class="body-text" style="text-align:center;">${s.weekLead}</div>
    <div class="week-map">${['א','ב','ג','ד','ה','ו'].map((d, i) => {
      const icons = ['🌅', '📖', '🤝', '⚖️', '🌿', '✨'];
      return `<div class="week-day"><div class="day-num">${s.weekDays[i]}</div><div class="day-icon">${icons[i]}</div><div class="day-heb">${d}'</div></div>`;
    }).join('')}</div>
    <div class="manna-result-text"><div class="big">${interpolate(s.resultLead, { icon: mannaIcon })}</div><div class="small">${interpolate(s.resultMeta, { level: soulName })}</div></div>
    ${quoteBlock(hs.summaryQuoteHe, s.quote3, s.quote3Source)}
    <button class="btn-primary" onclick="next()">${s.next}</button>
    ${chapterGlossary([
      glossaryItem('שַׁבָּת', s.glossary[0]),
      glossaryItem('מָן', s.glossary[1]),
      glossaryItem('גְּאוּלָה', s.glossary[2])
    ])}
    ${footerCredit()}`;
}

function renderFinal(el) {
  const s = screenText('final');
  const hs = src().final;
  el.innerHTML = `
    <div class="rebbe-portrait">✡</div>
    <div class="hebrew-title" style="font-size:2rem;">${hs.titleHe}</div>
    <div class="russian-subtitle">${s.subtitle}</div>
    <div class="rebbe-credit">${hs.rebbeHe}</div>
    ${divider()}
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    ${divider()}
    <div class="body-text final-prompt">${s.prompt}</div>
    <div class="choices" id="finalChoices">
      ${s.choices.map((choice, idx) => `<button class="choice-btn" onclick="finalChoice(this, ${idx})">${choice}</button>`).join('')}
    </div>
    <div id="finalFeedback" class="hidden"></div>
    <div id="restartDiv" class="hidden" style="text-align:center;margin-top:20px;"><button class="btn-secondary" onclick="renderScreen(0)">${s.restart}</button></div>
    ${divider()}
    <div style="text-align:center;direction:ltr;margin-top:16px;"><div style="font-family:'Noto Serif Hebrew',serif;font-size:1.1rem;color:var(--gold-deep);">${hs.chantHe}</div></div>
    ${chapterGlossary([
      glossaryItem('גְּאוּלָה', s.glossary[0]),
      glossaryItem('תְּשׁוּבָה', s.glossary[1]),
      glossaryItem('מָן', s.glossary[2])
    ])}
    ${footerCredit()}`;
}

function finalChoice(btn, idx) {
  const s = screenText('final');
  document.querySelectorAll('#finalChoices .choice-btn').forEach(b => { b.disabled = true; });
  btn.classList.add('selected');
  const hebrew = [
    'תַּלְמוּד תּוֹרָה כְּנֶגֶד כֻּלָּם',
    'וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ',
    'הֱיוֹ מַפִּיצִים מַעְיְנוֹתָיו חוּצָה'
  ];
  const fb = document.getElementById('finalFeedback');
  fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hebrew[idx]}</div><div class="translation">${s.feedback[idx]}</div><div class="source">${s.feedbackSource}</div></div>`;
  fb.classList.remove('hidden');
  document.getElementById('restartDiv').classList.remove('hidden');
}
window.finalChoice = finalChoice;

(function () {
  const bubble = document.getElementById('tooltipBubble');
  let hideTimer;
  function positionAndShow(term) {
    clearTimeout(hideTimer);
    const tip = term.dataset.tip || '';
    const heb = term.dataset.tipHeb || '';
    if (!tip && !heb) return;
    bubble.innerHTML = '<div class="tooltip-arrow"></div>' + (heb ? '<span class="tooltip-heb">' + heb + '</span>' : '') + (tip ? '<span class="tooltip-def">' + tip + '</span>' : '');
    bubble.style.visibility = 'hidden';
    bubble.style.opacity = '0';
    bubble.style.left = '0px';
    bubble.style.top = '-9999px';
    bubble.classList.add('visible');
    const bw = bubble.offsetWidth;
    const bh = bubble.offsetHeight;
    bubble.style.visibility = '';
    const rect = term.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    let x = cx - bw / 2;
    x = Math.max(8, Math.min(window.innerWidth - bw - 8, x));
    const arrX = Math.max(10, Math.min(bw - 16, cx - x));
    const arrowEl = bubble.querySelector('.tooltip-arrow');
    arrowEl.style.left = arrX + 'px';
    let y;
    if (rect.top - bh - 14 >= 8) {
      y = rect.top - bh - 14;
      arrowEl.className = 'tooltip-arrow down';
    } else {
      y = rect.bottom + 10;
      arrowEl.className = 'tooltip-arrow up';
    }
    bubble.style.left = x + 'px';
    bubble.style.top = y + 'px';
  }
  function hideBubble() {
    hideTimer = setTimeout(() => bubble.classList.remove('visible'), 90);
  }
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('.term[data-tip],.term[data-tip-heb]');
    if (t) positionAndShow(t);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('.term')) hideBubble();
  });
  document.addEventListener('touchend', e => {
    const t = e.target.closest('.term[data-tip],.term[data-tip-heb]');
    if (t) {
      e.preventDefault();
      bubble.classList.contains('visible') ? bubble.classList.remove('visible') : positionAndShow(t);
    } else {
      hideBubble();
    }
  }, { passive: false });
})();

init();
