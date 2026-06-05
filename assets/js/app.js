const CONTENT = window.MoshiachContent;

function detectLang() {
  const saved = localStorage.getItem('moshiach-lang');
  if (saved && CONTENT.translations[saved]) return saved;
  const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'ru'];
  for (const l of langs) {
    const code = l.split('-')[0].toLowerCase();
    if (CONTENT.translations[code]) return code;
  }
  return 'ru';
}

const state = {
  day: 0,
  soulLevel: 3,
  choices: [],
  journalEntries: [],
  sortScore: 0,
  scaleValue: 50,
  lang: detectLang()
};
window.state = state;

const screens = [
  renderHome,      // 0
  renderIntro,     // 1
  renderDay1,      // 2
  renderDay2,      // 3
  renderDay3,      // 4
  renderDay4,      // 5
  renderDay5,      // 6
  renderDay6,      // 7
  renderShabbat,   // 8
  renderFinal,     // 9
  renderIntro2,    // 10
  renderC2Q1,      // 11
  renderC2Q2,      // 12
  renderC2Q3,      // 13
  renderC2Q4,      // 14
  renderC2Q5,      // 15
  renderC2Q6,      // 16
  renderC2Final    // 17
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

const _chapterOpen = [false, false];

function renderMenu() {
  const common = tr().common;
  const sections = tr().sections;
  const sections2 = tr().sections2 || [];
  const button = document.getElementById('menuToggleBtn');
  const panel = document.getElementById('topMenuPanel');
  const aboutBtn = document.getElementById('menuAboutBtn');
  const chaptersList = document.getElementById('menuChaptersList');
  const ruBtn = document.getElementById('langRuBtn');
  const deBtn = document.getElementById('langDeBtn');

  button.setAttribute('aria-label', panel.classList.contains('open') ? common.menuClose : common.menuOpen);
  aboutBtn.textContent = common.menuAboutTitle;
  ruBtn.textContent = common.languageRu;
  deBtn.textContent = common.languageDe;
  ruBtn.classList.toggle('active', state.lang === 'ru');
  deBtn.classList.toggle('active', state.lang === 'de');

  const subsections1 = [{ label: sections[0], screen: 0 }].concat(
    sections.slice(2).map((label, i) => ({ label, screen: i + 1 }))
  );

  const subsections2 = sections2.map((label, i) => ({ label, screen: 10 + i }));

  const homeScreenData = tr().screens.home;
  const chapterHe = src().home.chapterHe;
  const chapter2He = src().home.chapter2He;

  chaptersList.innerHTML = `
    <div class="menu-chapter-item">
      <button class="menu-chapter-header${_chapterOpen[0] ? ' open' : ''}" id="chapterHeader0" onclick="toggleChapterMenu(0)" type="button">
        <span class="menu-chapter-he">${chapterHe}</span>
        <span class="menu-chapter-title">${homeScreenData.chapterTitle}</span>
        <span class="menu-chapter-arrow">▾</span>
      </button>
      <div class="menu-chapter-subs${_chapterOpen[0] ? ' open' : ''}" id="chapterSubs0">
        ${subsections1.map(sub => {
          const active = sub.screen === state.day ? ' active' : '';
          return `<button class="menu-sub-link${active}" onclick="menuNavigate(${sub.screen})" type="button">${sub.label}</button>`;
        }).join('')}
      </div>
    </div>
    <div class="menu-chapter-item">
      <button class="menu-chapter-header${_chapterOpen[1] ? ' open' : ''}" id="chapterHeader1" onclick="toggleChapterMenu(1)" type="button">
        <span class="menu-chapter-he">${chapter2He}</span>
        <span class="menu-chapter-title">${homeScreenData.chapter2Title}</span>
        <span class="menu-chapter-arrow">▾</span>
      </button>
      <div class="menu-chapter-subs${_chapterOpen[1] ? ' open' : ''}" id="chapterSubs1">
        ${subsections2.map(sub => {
          const active = sub.screen === state.day ? ' active' : '';
          return `<button class="menu-sub-link${active}" onclick="menuNavigate(${sub.screen})" type="button">${sub.label}</button>`;
        }).join('')}
      </div>
    </div>`;
}

function toggleChapterMenu(idx) {
  _chapterOpen[idx] = !_chapterOpen[idx];
  const subs = document.getElementById(`chapterSubs${idx}`);
  const header = document.getElementById(`chapterHeader${idx}`);
  if (subs && header) {
    subs.classList.toggle('open', _chapterOpen[idx]);
    header.classList.toggle('open', _chapterOpen[idx]);
  }
}
window.toggleChapterMenu = toggleChapterMenu;

function showAboutModal() {
  document.getElementById('aboutModalTitle').textContent = tr().common.menuAboutTitle;
  document.getElementById('aboutModalText').textContent = tr().common.menuAboutText;
  document.getElementById('aboutModal').classList.add('visible');
  document.getElementById('topMenuPanel').classList.remove('open');
  document.getElementById('menuToggleBtn').classList.remove('open');
}
window.showAboutModal = showAboutModal;

function closeAboutModal() {
  document.getElementById('aboutModal').classList.remove('visible');
}
window.closeAboutModal = closeAboutModal;

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
      <div class="chapter-card chapter-card-2" onclick="renderScreen(10)">
        <div class="chapter-card-heb">${hs.chapter2He}</div>
        <div class="chapter-card-rus">${s.chapter2Title}</div>
        <div class="chapter-card-desc">${s.chapter2Description}</div>
        <div class="chapter-card-footer">
          <span class="chapter-card-meta">${s.chapter2Meta}</span>
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

// ─── Chapter 2 helpers ────────────────────────────────────────────────────────

function c2dots(current) {
  let html = '<div class="day-indicator">';
  for (let i = 1; i <= 6; i++) {
    const cls = i < current ? 'done' : i === current ? 'active' : '';
    html += `<div class="day-dot ${cls}" title="${i}"></div>`;
  }
  html += '</div>';
  return html;
}

// ─── renderIntro2 ─────────────────────────────────────────────────────────────

function renderIntro2(el) {
  const s = screenText('intro2');
  const hs = src().intro2;
  el.innerHTML = `
    <div class="hebrew-title" style="font-size:1.6rem;">${hs.titleHe}</div>
    <div class="russian-subtitle">${s.subtitle}</div>
    ${divider()}
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body1}</div>
    ${divider()}
    <table class="souls-table">
      <thead><tr>${s.tableHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
        ${s.tableRows.map(row => `<tr><td>${row[0]}</td><td class="heb">${row[1]}</td><td>${row[2]}</td></tr>`).join('')}
      </tbody>
    </table>
    <button class="btn-primary" onclick="next()">${s.next}</button>
    ${chapterGlossary([
      glossaryItem(src().c2q1.menorahHe, s.glossary[0]),
      glossaryItem(src().c2q2.pesachSheniHe, s.glossary[1]),
      glossaryItem(src().c2q4.chatzotzerotHe, s.glossary[2])
    ])}
    ${footerCredit()}`;
}

// ─── renderC2Q1: Menorah Math ─────────────────────────────────────────────────

function renderC2Q1(el) {
  const s = screenText('c2q1');
  const hs = src().c2q1;
  el.innerHTML = `
    ${progressBar(1, 6)}
    ${c2dots(1)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body1}</div>
    ${quoteBlock(hs.quote2He, s.quote2 || hs.quote2He, '8:4')}
    <div class="body-text"><strong>${s.revealPrompt}</strong></div>
    <div class="c2-reveal-row" id="c2q1reveals">
      ${s.reveals.map((r, i) => `
        <button type="button" class="c2-reveal-box" id="reveal${i}" onclick="c2q1Reveal(${i})">
          <div class="c2-reveal-number">${r.number}</div>
          <div class="c2-reveal-he">${r.he}</div>
          <div class="c2-reveal-hint">нажми ▼</div>
        </button>`).join('')}
    </div>
    <div id="c2q1revealText" class="hidden" style="margin:12px 0;"></div>
    ${divider()}
    <div id="c2q1quiz" class="hidden">
      <div class="reflection-question">${s.quizQuestion}</div>
      <div class="choices" id="c2q1quizChoices">
        ${s.quizOptions.map((opt, i) => `<button class="choice-btn" onclick="c2q1Quiz(${i})">${opt}</button>`).join('')}
      </div>
      <div id="c2q1quizFb" class="hidden"></div>
      <div id="c2q1btn" class="hidden"><button class="btn-primary" onclick="next()">${s.next}</button></div>
    </div>
    ${chapterGlossary([
      glossaryItem(hs.menorahHe, s.glossary[0]),
      glossaryItem('גִּימַטְרִיָּה', s.glossary[1]),
      glossaryItem(hs.gavrielHe, s.glossary[2])
    ])}
    ${footerCredit()}`;
  window._c2q1revealed = 0;
}

function c2q1Reveal(i) {
  const s = screenText('c2q1');
  const box = document.getElementById(`reveal${i}`);
  if (box.classList.contains('opened')) return;
  box.classList.add('opened');
  box.innerHTML = `
    <div class="c2-reveal-number">${s.reveals[i].number}</div>
    <div class="c2-reveal-he">${s.reveals[i].he}</div>
    <div class="c2-reveal-open-title">${s.reveals[i].title}</div>
    <div class="c2-reveal-open-text">${s.reveals[i].text}</div>`;
  window._c2q1revealed++;
  if (window._c2q1revealed >= s.reveals.length) {
    document.getElementById('c2q1quiz').classList.remove('hidden');
  }
}
window.c2q1Reveal = c2q1Reveal;

function c2q1Quiz(idx) {
  const s = screenText('c2q1');
  const hs = src().c2q1;
  document.querySelectorAll('#c2q1quizChoices .choice-btn').forEach(b => { b.disabled = true; });
  document.querySelectorAll('#c2q1quizChoices .choice-btn')[idx].classList.add('selected');
  const fb = document.getElementById('c2q1quizFb');
  if (idx === s.quizAnswer) {
    fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.successHe}</div><div class="translation">${s.quizFeedback}</div></div>`;
  } else {
    fb.innerHTML = `<div class="feedback-box"><div class="translation">${s.quizFeedback}</div></div>`;
  }
  fb.classList.remove('hidden');
  document.getElementById('c2q1btn').classList.remove('hidden');
}
window.c2q1Quiz = c2q1Quiz;

// ─── renderC2Q2: Pesach Sheni ─────────────────────────────────────────────────

function renderC2Q2(el) {
  const s = screenText('c2q2');
  const hs = src().c2q2;
  el.innerHTML = `
    ${progressBar(2, 6)}
    ${c2dots(2)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body1}</div>
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    <div class="body-text">${s.body2}</div>
    ${divider()}
    <div class="reflection-question">${s.choicePrompt}</div>
    <div class="choices" id="c2q2choices">
      ${s.choices.map((c, i) => `<button class="choice-btn" onclick="c2q2Choice(${i})">${c}</button>`).join('')}
    </div>
    <div id="c2q2fb" class="hidden"></div>
    <div id="c2q2insight" class="hidden">
      <div class="body-text" style="background:rgba(201,146,42,0.07);border-left:3px solid var(--gold);padding:12px 16px;border-radius:4px;margin:16px 0;">${s.insight}</div>
    </div>
    <div id="c2q2btn" class="hidden"><button class="btn-primary" onclick="next()">${s.next}</button></div>
    ${chapterGlossary([
      glossaryItem(hs.pesachSheniHe, s.glossary[0]),
      glossaryItem(hs.yosefHe, s.glossary[1]),
      glossaryItem('כָּרֵת', s.glossary[2])
    ])}
    ${footerCredit()}`;
}

function c2q2Choice(idx) {
  const s = screenText('c2q2');
  const hs = src().c2q2;
  document.querySelectorAll('#c2q2choices .choice-btn').forEach(b => { b.disabled = true; });
  document.querySelectorAll('#c2q2choices .choice-btn')[idx].classList.add('selected');
  const f = s.feedback[idx];
  const fb = document.getElementById('c2q2fb');
  fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${f.he}</div><div class="translation">${f.quote}</div><div class="source">${f.note}</div></div>`;
  fb.classList.remove('hidden');
  document.getElementById('c2q2insight').classList.remove('hidden');
  document.getElementById('c2q2btn').classList.remove('hidden');
}
window.c2q2Choice = c2q2Choice;

// ─── renderC2Q3: 70 Elders ────────────────────────────────────────────────────

function renderC2Q3(el) {
  const s = screenText('c2q3');
  const hs = src().c2q3;
  el.innerHTML = `
    ${progressBar(3, 6)}
    ${c2dots(3)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body1}</div>
    <div class="body-text"><strong>${s.connectPrompt}</strong></div>
    <div class="c2-reveal-row" id="c2q3cards">
      ${s.connections.map((c, i) => `
        <button type="button" class="c2-reveal-box" id="conn${i}" onclick="c2q3Reveal(${i})">
          <div class="c2-reveal-number">${c.number}</div>
          <div style="font-size:1.5rem;">${c.icon}</div>
          <div class="c2-reveal-he">${c.he}</div>
          <div class="c2-reveal-hint">${c.label} ▼</div>
        </button>`).join('')}
    </div>
    <div id="c2q3math" class="hidden">
      ${divider()}
      <div class="body-text"><strong>${s.mathQuestion}</strong></div>
      <div class="choices" id="c2q3mathChoices">
        ${s.mathOptions.map((opt, i) => `<button class="choice-btn" onclick="c2q3Math(${i})">${opt}</button>`).join('')}
      </div>
      <div id="c2q3mathFb" class="hidden"></div>
      <div id="c2q3elderInsight" class="hidden">
        <div class="body-text" style="background:rgba(201,146,42,0.07);border-left:3px solid var(--gold);padding:12px 16px;border-radius:4px;margin:12px 0;">
          <div style="font-family:'Noto Serif Hebrew',serif;font-size:0.9rem;color:var(--gold-deep);margin-bottom:6px;">${hs.eldadHe}</div>
          <div>${s.eldadInsight}</div>
          <div style="margin-top:8px;font-style:italic;">${s.spiritNote}</div>
        </div>
      </div>
      <div id="c2q3btn" class="hidden"><button class="btn-primary" onclick="next()">${s.next}</button></div>
    </div>
    ${chapterGlossary([
      glossaryItem(hs.eldadHe, s.glossary[0]),
      glossaryItem('שִׁבְעִים אֻמּוֹת', s.glossary[1]),
      glossaryItem('רוּחַ הַקֹּדֶשׁ', s.glossary[2])
    ])}
    ${footerCredit()}`;
  window._c2q3revealed = 0;
}

function c2q3Reveal(i) {
  const s = screenText('c2q3');
  const box = document.getElementById(`conn${i}`);
  if (box.classList.contains('opened')) return;
  box.classList.add('opened');
  box.innerHTML = `
    <div class="c2-reveal-number">${s.connections[i].number}</div>
    <div style="font-size:1.5rem;">${s.connections[i].icon}</div>
    <div class="c2-reveal-open-title">${s.connections[i].label}</div>
    <div class="c2-reveal-open-text">${s.connections[i].text}</div>`;
  window._c2q3revealed++;
  if (window._c2q3revealed >= s.connections.length) {
    document.getElementById('c2q3math').classList.remove('hidden');
  }
}
window.c2q3Reveal = c2q3Reveal;

function c2q3Math(idx) {
  const s = screenText('c2q3');
  const hs = src().c2q3;
  document.querySelectorAll('#c2q3mathChoices .choice-btn').forEach(b => { b.disabled = true; });
  document.querySelectorAll('#c2q3mathChoices .choice-btn')[idx].classList.add('selected');
  const fb = document.getElementById('c2q3mathFb');
  if (idx === s.mathAnswer) {
    fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.successHe}</div><div class="translation">${s.mathFeedback}</div></div>`;
  } else {
    const correct = s.mathOptions[s.mathAnswer];
    fb.innerHTML = `<div class="feedback-error">Не совсем — ответ ${correct}. ${s.mathFeedback}</div>`;
  }
  fb.classList.remove('hidden');
  document.getElementById('c2q3elderInsight').classList.remove('hidden');
  document.getElementById('c2q3btn').classList.remove('hidden');
}
window.c2q3Math = c2q3Math;

// ─── renderC2Q4: Trumpets ─────────────────────────────────────────────────────

function renderC2Q4(el) {
  const s = screenText('c2q4');
  const hs = src().c2q4;
  el.innerHTML = `
    ${progressBar(4, 6)}
    ${c2dots(4)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body1}</div>
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    <div class="body-text">${s.body2}</div>
    ${divider()}
    <div class="body-text"><strong>${s.gameLead}</strong> ${s.gameText}</div>
    <div class="sort-cards" id="c2q4sortCards">
      ${s.sortData.map((item, i) => `<div class="sort-card" onclick="c2q4SelectCard(this, '${item.correct}', ${i})" data-correct="${item.correct}">${item.text}</div>`).join('')}
    </div>
    <div class="sort-container">
      <div class="sort-zone" id="c2zone-yes" onclick="c2q4DropToZone('yes')">
        <h4>${s.zoneYes}</h4><div id="c2yes-results"></div>
      </div>
      <div class="sort-zone" id="c2zone-no" onclick="c2q4DropToZone('no')">
        <h4>${s.zoneNo}</h4><div id="c2no-results"></div>
      </div>
    </div>
    <div id="c2q4fb" class="hidden"></div>
    <div id="c2q4btn" class="hidden"><button class="btn-primary" onclick="next()">${s.next}</button></div>
    ${chapterGlossary([
      glossaryItem(hs.chatzotzerotHe, s.glossary[0]),
      glossaryItem('גּוֹג וּמָגוֹג', s.glossary[1]),
      glossaryItem('רֹאשׁ חֹדֶשׁ', s.glossary[2])
    ])}
    ${footerCredit()}`;
  window._c2q4selected = null;
  window._c2q4placed = 0;
  window._c2q4total = s.sortData.length;
}

function c2q4SelectCard(el, correct, idx) {
  document.querySelectorAll('#c2q4sortCards .sort-card').forEach(c => { c.style.outline = 'none'; });
  el.style.outline = '2px solid var(--gold)';
  window._c2q4selected = { el, correct };
}
window.c2q4SelectCard = c2q4SelectCard;

function c2q4DropToZone(zone) {
  const s = screenText('c2q4');
  const hs = src().c2q4;
  if (!window._c2q4selected) return;
  const { el, correct } = window._c2q4selected;
  el.classList.add('placed');
  el.style.outline = 'none';
  el.onclick = null;
  const isCorrect = correct === zone;
  window._c2q4placed++;
  const result = document.createElement('div');
  result.className = `sort-result ${isCorrect ? 'correct' : 'wrong'}`;
  result.textContent = (isCorrect ? '✓ ' : '✗ ') + el.textContent;
  document.getElementById('c2' + zone + '-results').appendChild(result);
  window._c2q4selected = null;
  if (window._c2q4placed >= window._c2q4total) {
    const fb = document.getElementById('c2q4fb');
    fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.feedbackHe}</div><div class="translation">${s.feedback}</div><div class="source">${s.feedbackSource}</div></div>`;
    fb.classList.remove('hidden');
    document.getElementById('c2q4btn').classList.remove('hidden');
  }
}
window.c2q4DropToZone = c2q4DropToZone;

// ─── renderC2Q5: Inverted Nuns ────────────────────────────────────────────────

function renderC2Q5(el) {
  const s = screenText('c2q5');
  const hs = src().c2q5;
  el.innerHTML = `
    ${progressBar(5, 6)}
    ${c2dots(5)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    <div class="body-text">${s.body1}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    ${divider()}
    <div id="c2q5puzzle1">
      <div class="reflection-question">${s.puzzle1Question}</div>
      <div class="choices" id="c2p1choices">
        ${s.puzzle1Options.map((opt, i) => `<button class="choice-btn" onclick="c2q5P1(${i})">${opt}</button>`).join('')}
      </div>
      <div id="c2p1fb" class="hidden"></div>
    </div>
    <div id="c2q5puzzle2" class="hidden" style="margin-top:20px;">
      <div class="reflection-question">${s.puzzle2Question}</div>
      <div class="choices" id="c2p2choices">
        ${s.puzzle2Options.map((opt, i) => `<button class="choice-btn" onclick="c2q5P2(${i})">${opt}</button>`).join('')}
      </div>
      <div id="c2p2fb" class="hidden"></div>
    </div>
    <div id="c2q5insight" class="hidden">
      <div class="body-text" style="background:rgba(201,146,42,0.07);border-left:3px solid var(--gold);padding:12px 16px;border-radius:4px;margin:16px 0;">
        <div style="font-family:'Noto Serif Hebrew',serif;font-size:0.95rem;color:var(--gold-deep);margin-bottom:6px;">${hs.yakovHe}</div>
        <div>${s.yakovFact}</div>
      </div>
    </div>
    <div id="c2q5btn" class="hidden"><button class="btn-primary" onclick="next()">${s.next}</button></div>
    ${chapterGlossary([
      glossaryItem(hs.nunHe, s.glossary[0]),
      glossaryItem(hs.aronHe, s.glossary[1]),
      glossaryItem(hs.merkavaHe, s.glossary[2])
    ])}
    ${footerCredit()}`;
}

function c2q5P1(idx) {
  const s = screenText('c2q5');
  document.querySelectorAll('#c2p1choices .choice-btn').forEach(b => { b.disabled = true; });
  document.querySelectorAll('#c2p1choices .choice-btn')[idx].classList.add('selected');
  const fb = document.getElementById('c2p1fb');
  if (idx === s.puzzle1Answer) {
    fb.innerHTML = `<div class="feedback-box"><div class="translation">${s.puzzle1Feedback}</div></div>`;
  } else {
    fb.innerHTML = `<div class="feedback-error">Не совсем — ответ ${s.puzzle1Options[s.puzzle1Answer]}. ${s.puzzle1Feedback}</div>`;
  }
  fb.classList.remove('hidden');
  document.getElementById('c2q5puzzle2').classList.remove('hidden');
}
window.c2q5P1 = c2q5P1;

function c2q5P2(idx) {
  const s = screenText('c2q5');
  document.querySelectorAll('#c2p2choices .choice-btn').forEach(b => { b.disabled = true; });
  document.querySelectorAll('#c2p2choices .choice-btn')[idx].classList.add('selected');
  const fb = document.getElementById('c2p2fb');
  if (idx === s.puzzle2Answer) {
    fb.innerHTML = `<div class="feedback-box"><div class="translation">${s.puzzle2Feedback}</div></div>`;
  } else {
    fb.innerHTML = `<div class="feedback-error">Не совсем — ответ ${s.puzzle2Options[s.puzzle2Answer]}. ${s.puzzle2Feedback}</div>`;
  }
  fb.classList.remove('hidden');
  document.getElementById('c2q5insight').classList.remove('hidden');
  document.getElementById('c2q5btn').classList.remove('hidden');
}
window.c2q5P2 = c2q5P2;

// ─── renderC2Q6: Moses' Humility ──────────────────────────────────────────────

function renderC2Q6(el) {
  const s = screenText('c2q6');
  const hs = src().c2q6;
  el.innerHTML = `
    ${progressBar(6, 6)}
    ${c2dots(6)}
    <div class="scene-title">${s.sceneTitle} · ${hs.sceneHe}</div>
    <div class="day-title">${s.title}</div>
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    <div class="body-text">${s.body1}</div>
    ${divider()}
    <div class="body-text">
      <strong>${s.insight1Title}</strong><br>${s.insight1}
    </div>
    <div class="body-text" style="margin-top:12px;">
      <strong>${s.insight2Title}</strong><br>${s.insight2}
    </div>
    <div class="body-text" style="margin-top:12px;">
      <strong>${s.insight3Title}</strong><br>${s.insight3}
    </div>
    ${quoteBlock(hs.quote2He, '«' + hs.quote2He + '»', s.quoteSource + ' · 5 букв')}
    ${divider()}
    <div class="body-text"><strong>${s.reflectionLead}</strong></div>
    <div class="reflection-question">${s.reflectionQuestion}</div>
    <textarea class="journal-input" id="journalC2Q6" placeholder="${s.placeholder}"></textarea>
    <button class="btn-secondary" onclick="submitC2Q6()">${s.submit}</button>
    <div id="c2q6fb" class="hidden"></div>
    <button class="btn-primary" onclick="next()" style="margin-top:20px;">${s.next}</button>
    ${chapterGlossary([
      glossaryItem(hs.anavHe, s.glossary[0]),
      glossaryItem('מִרְיָם', s.glossary[1]),
      glossaryItem('רְפוּאָה', s.glossary[2])
    ])}
    ${footerCredit()}`;
}

function submitC2Q6() {
  const s = screenText('c2q6');
  const hs = src().c2q6;
  const val = document.getElementById('journalC2Q6').value.trim();
  state.journalEntries.push(val || s.emptyJournal);
  const fb = document.getElementById('c2q6fb');
  fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hs.feedbackHe}</div><div class="translation">${s.feedback}</div><div class="source">${s.feedbackSource}</div></div>`;
  fb.classList.remove('hidden');
}
window.submitC2Q6 = submitC2Q6;

// ─── renderC2Final ────────────────────────────────────────────────────────────

function renderC2Final(el) {
  const s = screenText('c2final');
  const hs = src().c2final;
  el.innerHTML = `
    <div class="rebbe-portrait">🕎</div>
    <div class="hebrew-title" style="font-size:1.5rem;">${hs.titleHe}</div>
    <div class="russian-subtitle">${s.subtitle}</div>
    ${divider()}
    ${quoteBlock(hs.quoteHe, s.quote, s.quoteSource)}
    ${quoteBlock(hs.quote2He, s.quote2, s.quote2Source)}
    ${divider()}
    <div class="body-text" style="text-align:center;font-weight:600;color:var(--gold-deep);margin-bottom:12px;">${s.summaryTitle}</div>
    <div class="c2-summary-grid">
      ${s.summary.map(item => `
        <div class="c2-summary-item">
          <div class="c2-summary-icon">${item.icon}</div>
          <div class="c2-summary-topic">${item.topic}</div>
          <div class="c2-summary-lesson">${item.lesson}</div>
        </div>`).join('')}
    </div>
    ${divider()}
    <div class="body-text final-prompt">${s.prompt}</div>
    <div class="choices" id="c2finalChoices">
      ${s.choices.map((c, i) => `<button class="choice-btn" onclick="c2FinalChoice(this, ${i})">${c}</button>`).join('')}
    </div>
    <div id="c2finalFb" class="hidden"></div>
    <div id="c2finalNav" class="hidden" style="text-align:center;margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <button class="btn-secondary" onclick="renderScreen(0)">${s.backHome}</button>
      <button class="btn-secondary" onclick="renderScreen(1)">${s.backChapter1}</button>
    </div>
    ${divider()}
    <div style="text-align:center;direction:ltr;margin-top:16px;"><div style="font-family:'Noto Serif Hebrew',serif;font-size:1.1rem;color:var(--gold-deep);">${hs.chantHe}</div></div>
    ${chapterGlossary([
      glossaryItem(src().c2q1.menorahHe, s.glossary[0]),
      glossaryItem(src().c2q2.pesachSheniHe, s.glossary[1]),
      glossaryItem(src().c2q6.anavHe, s.glossary[2])
    ])}
    ${footerCredit()}`;
}

function c2FinalChoice(btn, idx) {
  const s = screenText('c2final');
  const hs = src().c2final;
  document.querySelectorAll('#c2finalChoices .choice-btn').forEach(b => { b.disabled = true; });
  btn.classList.add('selected');
  const hebrewArr = [
    'אוֹר לַגּוֹיִים',
    'פֶּסַח שֵׁנִי — עוֹד לֹא מְאוּחָר',
    'עָנָו = בְּעֵדֶן'
  ];
  const fb = document.getElementById('c2finalFb');
  fb.innerHTML = `<div class="feedback-box"><div class="hebrew">${hebrewArr[idx]}</div><div class="translation">${s.feedback[idx]}</div><div class="source">${s.feedbackSource}</div></div>`;
  fb.classList.remove('hidden');
  document.getElementById('c2finalNav').classList.remove('hidden');
}
window.c2FinalChoice = c2FinalChoice;

(function () {
  const bubble = document.getElementById('tooltipBubble');
  let hideTimer;
  function closestTerm(target) {
    return target instanceof Element ? target.closest('.term[data-tip],.term[data-tip-heb]') : null;
  }
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
    const t = closestTerm(e.target);
    if (t) positionAndShow(t);
  });
  document.addEventListener('mouseout', e => {
    if (e.target instanceof Element && e.target.closest('.term')) hideBubble();
  });
  document.addEventListener('touchend', e => {
    const t = closestTerm(e.target);
    if (t) {
      e.preventDefault();
      bubble.classList.contains('visible') ? bubble.classList.remove('visible') : positionAndShow(t);
    } else {
      hideBubble();
    }
  }, { passive: false });
})();

init();
