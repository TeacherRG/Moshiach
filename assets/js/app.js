// ===== STATE =====
const state = {
  day: 0,
  soulLevel: 3, // 1=raша, 2=beinoni, 3=tsadik (out of 5 scale)
  choices: [],
  journalEntries: [],
  sortScore: 0,
  scaleValue: 50,
  glossaryOpen: false
};
window.state = state;

// ===== SCREENS =====
const screens = [
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

// ===== INIT =====
function init() {
  createStars();
  renderScreen(0);
}

function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      top:${Math.random()*70}%;
      --duration:${2+Math.random()*4}s;
      --delay:${Math.random()*4}s;
    `;
    container.appendChild(s);
  }
}

function renderScreen(index) {
  state.day = index;
  const content = document.getElementById('screenContent');
  content.innerHTML = '';
  document.getElementById('mainCard').style.animation = 'none';
  setTimeout(() => {
    document.getElementById('mainCard').style.animation = 'fadeIn 0.6s ease forwards';
  }, 10);
  screens[index](content);
  if (window.AudioQuest) AudioQuest.onScreenChange(index);
}

function next() {
  if (state.day < screens.length - 1) {
    renderScreen(state.day + 1);
  }
}

// ===== HELPERS =====
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
  return `<div class="divider"><div class="divider-line"></div><span class="divider-star">✦</span><div class="divider-line"></div></div>`;
}

function footerCredit() {
  return `<div class="footer-credit">По сихе <span>רבי מנחם מנדל שניאורסון זי"ע</span> · Беаалотха, 19 Сивана 5751 · Ликутей Сихот, том 39</div>`;
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
          left:${xRange[0] + Math.random()*(xRange[1]-xRange[0])}%;
          top:5%;
          --fall-dist:${50+Math.random()*60}px;
          animation-delay:${Math.random()*0.5}s;
        `;
        scene.appendChild(p);
      }, i * 120);
    }
  }, 500);
}

// ===== SCREEN 0: INTRO =====
function renderIntro(el) {
  el.innerHTML = `
    <div class="hebrew-title">מָן מִן הַשָּׁמַיִם</div>
    <div class="russian-subtitle">Ман с Небес — интерактивная игра</div>
    <div class="rebbe-credit">על פי שיחת כ"ק אדמו"ר מליובאוויטש זי"ע · בהעלתך, י"ט סיון תשנ"א</div>

    ${divider()}

    <div class="quote-block">
      <div class="quote-hebrew">הַדּוֹר הָאַחֲרוֹן שֶׁל הַגָּלוּת הוּא הַדּוֹר הָרִאשׁוֹן שֶׁל הַגְּאוּלָה</div>
      <div class="quote-russian">«Последнее поколение изгнания — это первое поколение Избавления»</div>
      <div class="quote-source">Любавичский Ребе, Беаалотха 5751</div>
    </div>

    <div class="body-text">
      Три с половиной тысячи лет назад евреи шли через пустыню. Каждое утро с неба спускался ман — небесный хлеб. Но <strong>где</strong> он появлялся и <strong>в каком виде</strong> — зависело от духовного уровня каждого человека.<br><br>
      Любавичский Ребе <span class="term" data-tip-heb="רבי מנחם מנדל שניאורסון" data-tip="Любавичский Ребе — глава движения Хабад-Любавич (1951–1994). Дал тысячи сихот, раскрывших глубины хасидского учения.">רבי מנחם מנדל שניאורסון</span> учит: ман — это не просто история. Это зеркало, которое показывает, кто мы сейчас.
    </div>

    ${divider()}

    <table class="souls-table">
      <thead><tr><th>Тип души</th><th>Иврит</th><th>Где ман</th><th>В каком виде</th></tr></thead>
      <tbody>
        <tr><td>Праведник</td><td class="heb">צַדִּיק</td><td>У входа в шатёр</td><td>Готовый хлеб 🍞</td></tr>
        <tr><td>Средний</td><td class="heb">בֵּינוֹנִי</td><td>За пределами лагеря</td><td>Лепёшки 🫓</td></tr>
        <tr><td>Грешник</td><td class="heb">רָשָׁע</td><td>Далеко в поле</td><td>Зерно для помола 🌾</td></tr>
      </tbody>
    </table>

    <div class="quote-block">
      <div class="quote-hebrew">אֲבָל הַמָּן זִיכֵּךְ אֶת כָּל יִשְׂרָאֵל — לְצַדִּיק וּלְרָשָׁע</div>
      <div class="quote-russian">«Но ман питал и очищал всех евреев — и праведника, и грешника»</div>
      <div class="quote-source">Ребе, на основе Йома 75а</div>
    </div>

    <button class="btn-primary" onclick="next()">Выйти из шатра ←</button>

    ${footerCredit()}
  `;
}

// ===== SCREEN 1: DAY 1 — CHOICE =====
function renderDay1(el) {
  el.innerHTML = `
    ${progressBar(1,7)}
    ${dayDots(1)}
    <div class="scene-title">День первый · יוֹם רִאשׁוֹן</div>
    <div class="day-title">Утреннее испытание</div>

    ${mannaScene(15, 'Рассвет над лагерем')}

    <div class="quote-block">
      <div class="quote-hebrew">וַיְהִי בָעֶרֶב וַתַּעַל הַשְּׂלָו</div>
      <div class="quote-russian">«И было вечером — поднялись перепела» (Шмот 16:13)</div>
      <div class="quote-source">Начало недели мана в пустыне</div>
    </div>

    <div class="body-text">Рассвет. <span class="term" data-tip-heb="תְּפִלַּת שַׁחֲרִית · Тфилат Шахарит" data-tip="Утренняя молитва в иудаизме. Один из трёх ежедневных молитвенных порядков, читается на рассвете.">תְּפִלַּת שַׁחֲרִית</span> (утренняя молитва) вот-вот начнётся. Ты замечаешь: твой сосед по шатру не встаёт...</div>

    <div class="choices" id="choices1">
      <button class="choice-btn" onclick="makeChoice1(0)">🤝 Разбужу его — каждый еврей важен</button>
      <button class="choice-btn" onclick="makeChoice1(1)">🤷 Это его выбор, я не вмешиваюсь</button>
      <button class="choice-btn" onclick="makeChoice1(2)">😴 Мне самому бы встать вовремя</button>
    </div>

    <div id="feedback1" class="hidden"></div>
    <div id="btn1" class="hidden">
      <button class="btn-primary" onclick="next()">Следующий день →</button>
    </div>

    ${footerCredit()}
  `;
  spawnManna(5, [0, 20]);
}

function makeChoice1(idx) {
  const btns = document.querySelectorAll('#choices1 .choice-btn');
  btns.forEach(b => b.disabled = true);
  btns[idx].classList.add('selected');

  const feedbacks = [
    { heb: 'כָּל נִשְׁמָה הִיא עוֹלָם מָלֵא', ru: '«Каждая душа — это целый мир»', note: 'Ребе. Тот, кто помогает другому изучать Тору — как будто даёт ему жизнь.', delta: +1 },
    { heb: 'כָּל יִשְׂרָאֵל עֲרֵבִים זֶה בָּזֶה', ru: '«Весь Израиль ответственен друг за друга» (Швуот 39а)', note: 'Нейтральный выбор. Уважение к свободе воли — тоже ценность.', delta: 0 },
    { heb: 'עֲבוֹד אֶת ה\' אֱלֹקֶיךָ', ru: '«Служи Г-споду, Б-гу твоему» — честность с собой тоже важна.', note: 'Признать свои ограничения — начало пути.', delta: 0 }
  ];

  const f = feedbacks[idx];
  state.soulLevel = Math.min(5, Math.max(1, state.soulLevel + f.delta));
  state.choices.push(idx);

  const box = document.getElementById('feedback1');
  box.innerHTML = `
    <div class="feedback-box">
      <div class="hebrew">${f.heb}</div>
      <div class="translation">${f.ru}</div>
      <div class="source">${f.note}</div>
    </div>`;
  box.classList.remove('hidden');
  document.getElementById('btn1').classList.remove('hidden');

  // Update manna position based on soul level
  const tent = document.getElementById('tentEl');
  const positions = [65, 45, 25, 15, 8];
  if (tent) tent.style.left = positions[state.soulLevel - 1] + '%';
  spawnManna(3, [10, 30]);
}

// ===== SCREEN 2: DAY 2 — TWO BREADS =====
function renderDay2(el) {
  const sortData = [
    { text: 'Вопросы и споры', correct: 'earth' },
    { text: 'Свет без отходов', correct: 'heaven' },
    { text: 'Требует труда', correct: 'earth' },
    { text: 'Для каждой души', correct: 'heaven' },
    { text: 'Хрустящая корка', correct: 'earth' },
    { text: 'Спускается сам', correct: 'heaven' },
  ];

  el.innerHTML = `
    ${progressBar(2,7)}
    ${dayDots(2)}
    <div class="scene-title">День второй · יוֹם שֵׁנִי</div>
    <div class="day-title">Два вида хлеба</div>

    <div class="body-text">Ребе проводит параллель: ман — это не только еда в пустыне. Это образ двух видов Торы, двух видов духовной пищи.</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0;direction:ltr;">
      <div style="background:rgba(139,98,20,0.08);border:1px solid var(--gold);border-radius:4px;padding:16px;text-align:center;">
        <div style="font-family:'Noto Serif Hebrew',serif;font-size:1.3rem;color:var(--gold-deep);margin-bottom:8px;">לֶחֶם מִן הָאָרֶץ</div>
        <div style="font-size:0.85rem;color:var(--text-mid);font-style:italic;">Хлеб с земли</div>
        <div style="font-size:0.85rem;color:var(--text-dark);margin-top:8px;font-family:'Noto Serif Hebrew',serif;">נִגְלֶה</div>
        <div style="font-size:0.8rem;color:var(--text-mid);">Открытая Тора</div>
      </div>
      <div style="background:rgba(107,154,184,0.08);border:1px solid var(--sky);border-radius:4px;padding:16px;text-align:center;">
        <div style="font-family:'Noto Serif Hebrew',serif;font-size:1.3rem;color:#3d6b8a;margin-bottom:8px;">לֶחֶם מִן הַשָּׁמַיִם</div>
        <div style="font-size:0.85rem;color:var(--text-mid);font-style:italic;">Хлеб с Небес</div>
        <div style="font-size:0.85rem;color:var(--text-dark);margin-top:8px;font-family:'Noto Serif Hebrew',serif;">פְּנִימִיּוּת הַתּוֹרָה</div>
        <div style="font-size:0.8rem;color:var(--text-mid);">Внутренняя Тора, Хасидус</div>
      </div>
    </div>

    <div class="quote-block">
      <div class="quote-hebrew">פְּנִימִיּוּת הַתּוֹרָה — לֶחֶם מִן הַשָּׁמַיִם, שֶׁאֵין בָּהּ קֻשְׁיוֹת</div>
      <div class="quote-russian">«Пнимиют аТора — хлеб с Небес, в котором нет неразрешённых вопросов»</div>
      <div class="quote-source">Ребе, Беаалотха 5751</div>
    </div>

    <div class="body-text"><strong>Мини-игра:</strong> распредели карточки по двум категориям</div>

    <div class="sort-cards" id="sortCards">
      ${sortData.map((item, i) => `
        <div class="sort-card" onclick="sortCard(this, '${item.correct}', ${i})" data-index="${i}" data-correct="${item.correct}">${item.text}</div>
      `).join('')}
    </div>

    <div class="sort-container">
      <div class="sort-zone" id="zone-earth" onclick="dropToZone('earth')">
        <h4>לֶחֶם מִן הָאָרֶץ 🌾</h4>
        <p>Хлеб с земли · Нигле</p>
        <div id="earth-results"></div>
      </div>
      <div class="sort-zone" id="zone-heaven" onclick="dropToZone('heaven')">
        <h4>לֶחֶם מִן הַשָּׁמַיִם ✨</h4>
        <p>Хлеб с Небес · Пнимиют</p>
        <div id="heaven-results"></div>
      </div>
    </div>

    <div id="sortFeedback" class="hidden"></div>
    <div id="sortBtn" class="hidden">
      <button class="btn-primary" onclick="next()">Следующий день →</button>
    </div>

    ${footerCredit()}
  `;

  window._sortData = sortData;
  window._sortSelected = null;
  window._sortPlaced = 0;
  window._sortCorrect = 0;
}

function sortCard(el, correct, index) {
  document.querySelectorAll('.sort-card').forEach(c => c.style.outline = 'none');
  el.style.outline = '2px solid var(--gold)';
  window._sortSelected = { el, correct, index };
}

function dropToZone(zone) {
  if (!window._sortSelected) return;
  const { el, correct, index } = window._sortSelected;
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
    fb.innerHTML = `<div class="feedback-box">
      <div class="hebrew">כָּל יִשְׂרָאֵל יֵשׁ לָהֶם חֵלֶק לָעוֹלָם הַבָּא</div>
      <div class="translation">«У каждого еврея есть доля в будущем мире» — и в обеих видах Торы тоже.</div>
      <div class="source">Результат: ${window._sortCorrect} из ${window._sortData.length} верно · Ребе: Пнимиют аТора предназначена для каждого.</div>
    </div>`;
    fb.classList.remove('hidden');
    document.getElementById('sortBtn').classList.remove('hidden');
  }
}

// ===== SCREEN 3: DAY 3 — NOBODY IS LOST =====
function renderDay3(el) {
  el.innerHTML = `
    ${progressBar(3,7)}
    ${dayDots(3)}
    <div class="scene-title">День третий · יוֹם שְׁלִישִׁי</div>
    <div class="day-title">Никто не потерян</div>

    ${mannaScene(55, 'Дальние поля за лагерем')}

    <div class="quote-block">
      <div class="quote-hebrew">אֲפִילוּ מִי שֶׁנָּשָׂא פֶּסֶל מִיכָה — אָכַל אֶת הַמָּן</div>
      <div class="quote-russian">«Даже тот, кто нёс идола Михи — ел ман»</div>
      <div class="quote-source">Санhедрин 103б, цитируется в сихе Ребе</div>
    </div>

    <div class="body-text">
      Некоторые евреи в пустыне несли с собой идола. Казалось бы — они недостойны небесной пищи. Но ман спускался и к ним. И — самое удивительное — <strong>не оставлял в них отходов</strong>.
    </div>

    <div class="quote-block">
      <div class="quote-hebrew">הַמָּן זִיכֵּךְ אֶת כָּל יִשְׂרָאֵל וְעָשָׂה אוֹתָם רְאוּיִים לְקַבָּלַת הַתּוֹרָה</div>
      <div class="quote-russian">«Ман очистил весь Израиль и сделал их достойными получить Тору»</div>
      <div class="quote-source">Мехилта, Шмот 16:4 · цитируется Ребе</div>
    </div>

    <div class="body-text">Ребе объясняет: ман не менял грешника мгновенно. Но процесс шёл. Это как <span class="term" data-tip-heb="תְּשׁוּבָה · Тшува" data-tip="Возвращение к Б-гу. Духовное пробуждение, которое ман постепенно пробуждал даже в тех, кто нёс идола. Ман работает изнутри.">תְּשׁוּבָה</span> — она не всегда происходит сразу. Но духовная пища продолжает работать внутри.</div>

    ${divider()}

    <div class="body-text"><strong>Вопрос для размышления:</strong></div>
    <div style="font-size:1.1rem;font-style:italic;color:var(--text-mid);text-align:center;margin:12px 0;direction:ltr;">
      Если ман питал даже тех, кто нёс идола —<br>значит ли это, что никто не потерян?
    </div>

    <textarea class="journal-input" id="journalDay3" placeholder="Напиши свою мысль здесь... (или просто прочитай и подумай)"></textarea>

    <div id="journal3feedback" class="hidden"></div>

    <button class="btn-secondary" onclick="submitJournal3()">Записать мысль</button>
    <button class="btn-primary" onclick="next()">Следующий день →</button>

    ${footerCredit()}
  `;
  spawnManna(8, [40, 80]);
}

function submitJournal3() {
  const val = document.getElementById('journalDay3').value.trim();
  state.journalEntries.push(val || '(размышление без слов)');
  const fb = document.getElementById('journal3feedback');
  fb.innerHTML = `<div class="feedback-box">
    <div class="hebrew">תִּיכֶף לִתְשׁוּבָה — גְּאוּלָה</div>
    <div class="translation">«Сразу за тшувой — Избавление»</div>
    <div class="source">Знаменитый призыв Ребе Раяца, который Любавичский Ребе цитирует в этой сихе</div>
  </div>`;
  fb.classList.remove('hidden');
}

// ===== SCREEN 4: DAY 4 — MOSHE AND MANNA =====
function renderDay4(el) {
  el.innerHTML = `
    ${progressBar(4,7)}
    ${dayDots(4)}
    <div class="scene-title">День четвёртый · יוֹם רְבִיעִי</div>
    <div class="day-title">Моше и небесный хлеб</div>

    <div class="body-text">Ребе приводит неожиданную мысль из <span class="term" data-tip-heb="תּוֹרָה אוֹר · Тора Ор" data-tip="Сборник хасидских маамаров Алтер Ребе — рабби Шнеура Залмана из Ляд, основателя движения Хабад.">תּוֹרָה אוֹר</span>: Моше-рабейну провёл 40 дней на горе Синай без еды. Но он всё же «питался» — духовным маном, как ангелы.</div>

    <div class="quote-block">
      <div class="quote-hebrew">לֶחֶם אַבִּירִים אָכַל אִישׁ</div>
      <div class="quote-russian">«Хлеб могучих ел человек» (Теhилим 78:25)</div>
      <div class="quote-source">Объясняется в Тора Ор, цитируется в сихе Ребе</div>
    </div>

    <div class="quote-block">
      <div class="quote-hebrew">מֹשֶׁה רַבֵּינוּ לֹא אָכַל מָן בְּגַשְׁמִיּוּת — אֶלָּא כְּמַלְאָכִים, בְּרוּחָנִיּוּת</div>
      <div class="quote-russian">«Моше не ел ман в физическом виде — но вкушал его духовно, как ангелы»</div>
      <div class="quote-source">Тора Ор, Ваякhел; Ликутей Тора, Бамидбар</div>
    </div>

    <div class="body-text">Это учит нас: существует шкала. На одном конце — <span class="term" data-tip-heb="גַּשְׁמִיּוּת · Гашмиют" data-tip="Материальный мир, физическое измерение бытия. В учении Хабада — низшая из сфирот, самое плотное облачение Б-жественного света.">גַּשְׁמִיּוּת</span> (материальное), на другом — <span class="term" data-tip-heb="רוּחָנִיּוּת · Рухниют" data-tip="Духовность, нематериальное измерение. Ман был духовным светом высочайших миров, облачённым в физическую пищу.">רוּחָנִיּוּת</span> (духовное). Ман существовал на обоих уровнях одновременно.</div>

    <div class="scale-container">
      <div class="scale-labels">
        <span class="scale-label-gashmiyut">גַּשְׁמִיּוּת · Материальное</span>
        <span class="scale-label-ruhniut">רוּחָנִיּוּת · Духовное</span>
      </div>
      <div class="scale-track" id="scaleTrack" onclick="moveScale(event)">
        <div class="scale-thumb" id="scaleThumb" style="left:50%"></div>
      </div>
      <div id="scaleLabel" style="text-align:center;font-style:italic;font-size:0.9rem;color:var(--text-mid);margin-top:8px;">
        Двигай шкалу: где сейчас находишься ты?
      </div>
    </div>

    <div id="scaleFeedback" class="hidden"></div>

    <button class="btn-primary" onclick="next()">Следующий день →</button>

    ${footerCredit()}
  `;
}

function moveScale(e) {
  const track = document.getElementById('scaleTrack');
  const rect = track.getBoundingClientRect();
  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  state.scaleValue = pct;
  document.getElementById('scaleThumb').style.left = pct + '%';

  let label, heb;
  if (pct < 25) { label = 'Очень земное — и это тоже честно'; heb = 'גַּשְׁמִיּוּת'; }
  else if (pct < 50) { label = 'Больше земного, но духовность уже чувствуется'; heb = 'בֵּינוֹנִי בְּגַשְׁמִיּוּת'; }
  else if (pct < 75) { label = 'Баланс — как бейнони на пути'; heb = 'בֵּינוֹנִי'; }
  else { label = 'Больше духовного — редкий дар'; heb = 'קְרוֹב לְרוּחָנִיּוּת'; }

  document.getElementById('scaleLabel').innerHTML = `<span style="font-family:'Noto Serif Hebrew',serif;color:var(--gold-deep)">${heb}</span> — ${label}`;

  const fb = document.getElementById('scaleFeedback');
  fb.innerHTML = `<div class="feedback-box">
    <div class="hebrew">גַּם הַמָּן בְּגַשְׁמִיּוּת הָיוּ בּוֹ אוֹרוֹת רוּחָנִיִּים גְּבוֹהִים</div>
    <div class="translation">«Даже в физическом мане были облачены духовные светы высочайших уровней»</div>
    <div class="source">Ребе, Беаалотха 5751 · Тора Ор, Ваякhел</div>
  </div>`;
  fb.classList.remove('hidden');
}

// ===== SCREEN 5: DAY 5 — SHABBAT AND MANNA =====
function renderDay5(el) {
  el.innerHTML = `
    ${progressBar(5,7)}
    ${dayDots(5)}
    <div class="scene-title">День пятый · יוֹם חֲמִישִׁי</div>
    <div class="day-title">Шабос и ман — связь миров</div>

    <div class="body-text">Ман не спускался в <span class="term" data-tip-heb="שַׁבָּת · Шабат" data-tip="Седьмой день недели — день покоя и святости. Зоhар: все шесть дней получают своё благословение именно от Шабата.">שַׁבָּת</span>. Почему? Ребе объясняет через глубокую идею из Зоhара.</div>

    <div class="quote-block">
      <div class="quote-hebrew">בְּשַׁבָּת — עֲלִיַּת הָעוֹלָמוֹת. וּבִזְמַן הָעֲלִיָּה אִי אֶפְשָׁר לְהַמְשִׁיךְ מֵרוּחָנִי לְגַשְׁמִי</div>
      <div class="quote-russian">«В Шабос — подъём миров. А во время подъёма невозможно низвести духовное в материальное»</div>
      <div class="quote-source">Ребе, Беаалотха 5751</div>
    </div>

    <div class="body-text">Но есть удивительный парадокс — весь ман всей недели получал своё благословение именно из Шабоса:</div>

    <div class="quote-block">
      <div class="quote-hebrew">כָּל שֵׁשֶׁת יְמֵי הַשָּׁבוּעַ מְקַבְּלִים בְּרָכָה מִיּוֹם הַשְּׁבִיעִי</div>
      <div class="quote-russian">«Все шесть дней недели получают благословение от седьмого дня»</div>
      <div class="quote-source">Зоhар, Ваякhел (том 2, стр. 63б)</div>
    </div>

    <div class="body-text">А когда человек не знает, какой раздел Торы читать в данный Шабос — Ребе объясняет: читай раздел о мане. Почему?</div>

    <div class="quote-block">
      <div class="quote-hebrew">כָּל הַשְׁפָּעָה שֶׁנִּמְשֶׁכֶת לָעוֹלָם — נִמְשֶׁכֶת עַל יְדֵי הַתּוֹרָה</div>
      <div class="quote-russian">«Каждое влияние, нисходящее в мир — нисходит через Тору»</div>
      <div class="quote-source">Ребе, там же — объяснение связи мана и Шабоса</div>
    </div>

    ${divider()}

    <div class="body-text"><strong>Головоломка:</strong> каждый день в пустыне падал ман. Расставь правильное количество порций по дням недели — нажимай на клетку, чтобы изменить.</div>

    <div id="mannaGrid" style="margin:20px 0;"></div>

    <div id="mannaStatus" style="text-align:center;color:var(--text-mid);font-size:0.9rem;margin:8px 0 16px;">Распределено порций: 0 / 7</div>

    <div style="text-align:center;margin-bottom:16px;">
      <button onclick="checkMannaDistribution()" style="background:var(--gold-deep);color:var(--white);border:none;padding:10px 28px;font-family:'Cormorant Garamond',serif;font-size:1rem;border-radius:3px;cursor:pointer;letter-spacing:0.03em;">Проверить →</button>
    </div>

    <div id="mannaResult" class="hidden"></div>
    <div id="mannaBtn" class="hidden">
      <button class="btn-primary" onclick="next()">К Шабосу →</button>
    </div>

    ${footerCredit()}
  `;

  window._mannaDays = [0, 0, 0, 0, 0, 0, 0];
  _renderMannaGrid();
}

function _renderMannaGrid() {
  const dayNames = [
    { heb: 'יום א\'', ru: 'Воскр.' },
    { heb: 'יום ב\'', ru: 'Понед.' },
    { heb: 'יום ג\'', ru: 'Вторн.' },
    { heb: 'יום ד\'', ru: 'Среда' },
    { heb: 'יום ה\'', ru: 'Четв.' },
    { heb: 'עֶרֶב שַׁבָּת', ru: 'Пятн.' },
    { heb: 'שַׁבָּת', ru: 'Шабос' },
  ];
  const grid = document.getElementById('mannaGrid');
  if (!grid) return;
  const portions = window._mannaDays;
  const total = portions.reduce((a, b) => a + b, 0);
  grid.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;direction:ltr;">
      ${dayNames.map((day, i) => {
        const isShabbat = i === 6;
        const count = portions[i];
        const icons = count === 0
          ? (isShabbat ? '<span style="font-size:1.1rem;">✡</span>' : '<span style="color:var(--sand-dark);font-size:1.3rem;">·</span>')
          : '🌾'.repeat(count);
        return `
          <div onclick="${isShabbat ? '' : `mannaClickDay(${i})`}"
               style="
                 width:80px;min-height:100px;
                 background:${isShabbat ? 'rgba(26,37,53,0.07)' : 'rgba(201,146,42,0.06)'};
                 border:1.5px solid ${isShabbat ? 'var(--night-mid)' : 'var(--gold)'};
                 border-radius:4px;padding:10px 4px 8px;
                 text-align:center;
                 cursor:${isShabbat ? 'default' : 'pointer'};
                 transition:background 0.15s;
                 user-select:none;
                 ${!isShabbat && count > 0 ? 'background:rgba(201,146,42,0.14);' : ''}
               ">
            <div style="font-family:'Noto Serif Hebrew',serif;font-size:0.72rem;color:${isShabbat ? 'var(--night-mid)' : 'var(--gold-deep)'};margin-bottom:3px;line-height:1.2;">${day.heb}</div>
            <div style="font-size:0.68rem;color:var(--text-mid);margin-bottom:8px;">${day.ru}</div>
            <div style="font-size:1.25rem;min-height:28px;line-height:1.4;">${icons}</div>
            <div style="font-size:0.62rem;color:var(--text-light);margin-top:6px;">${isShabbat ? 'покой' : (count === 0 ? 'нажми' : count + ' порц.')}</div>
          </div>`;
      }).join('')}
    </div>`;
  const statusEl = document.getElementById('mannaStatus');
  if (statusEl) statusEl.textContent = `Распределено порций: ${total} / 7`;
}

function mannaClickDay(i) {
  if (i === 6) return;
  window._mannaDays[i] = (window._mannaDays[i] + 1) % 3;
  _renderMannaGrid();
  const resultEl = document.getElementById('mannaResult');
  if (resultEl && !resultEl.classList.contains('hidden')) {
    resultEl.classList.add('hidden');
  }
}

function checkMannaDistribution() {
  const correct = [1, 1, 1, 1, 1, 2, 0];
  const current = window._mannaDays;
  const allCorrect = correct.every((v, i) => v === current[i]);
  const resultEl = document.getElementById('mannaResult');

  if (allCorrect) {
    resultEl.innerHTML = `
      <div class="feedback-box">
        <div class="hebrew">הַשַׁבָּת — מְקוֹר הַבְּרָכָה לְכָל יְמֵי הַשָּׁבוּעַ</div>
        <div class="translation">Верно! Шабос — источник благословения для всех дней недели.</div>
        <div class="source">Вот парадокс: Шабос сам не «получает» ман — но именно он даёт жизнь всем остальным дням. Тот, кто поднялся выше получения, становится источником для всех.</div>
      </div>`;
    resultEl.classList.remove('hidden');
    document.getElementById('mannaBtn').classList.remove('hidden');
  } else {
    const dayLabels = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'Шабос'];
    const wrong = correct.map((v, i) => v !== current[i] ? dayLabels[i] : null).filter(Boolean);
    resultEl.innerHTML = `
      <div style="text-align:center;color:var(--red-accent);font-size:0.9rem;padding:12px 16px;background:rgba(139,32,32,0.06);border-radius:4px;border:1px solid rgba(139,32,32,0.15);">
        Не совсем верно. Подсказка: проверь ${wrong.join(', ')}.
      </div>`;
    resultEl.classList.remove('hidden');
  }
}

// ===== SCREEN 6: DAY 6 — TESHUVAH =====
function renderDay6(el) {
  el.innerHTML = `
    ${progressBar(6,7)}
    ${dayDots(6)}
    <div class="scene-title">День шестой · יוֹם שִׁשִּׁי</div>
    <div class="day-title">Тшува через ман</div>

    <div class="body-text">Ребе подчёркивает: ман не делал грешников праведниками мгновенно. Некоторые продолжали молоть даже после многократного вкушения мана.</div>

    <div class="quote-block">
      <div class="quote-hebrew">אַף עַל פִּי שֶׁאָכְלוּ מָן פְּעָמִים רַבּוֹת — עֲדַיִן הָיוּ שֶׁצָּרְכוּ לִטְחוֹן</div>
      <div class="quote-russian">«Хотя они ели ман много раз — всё равно были те, кому нужно было молоть»</div>
      <div class="quote-source">Ребе, Беаалотха 5751 · на основе Йома 75а</div>
    </div>

    <div class="body-text">Но духовная работа шла. Каждый кусочек мана действовал изнутри. И в конце концов — приводил к <span class="term" data-tip-heb="תְּשׁוּבָה · Тшува" data-tip="Возвращение к Б-гу. Ребе: сразу за тшувой — Геула. Ман постепенно готовил к этому каждого еврея.">תְּשׁוּבָה</span>.</div>

    <div class="body-text">Ребе связывает это с Геулой. Он цитирует своего тестя — <span class="term" data-tip-heb="הרבי הריי״צ · Ребе Раяц" data-tip="Рабби Йосеф Ицхак Шнеерсон (1880–1950) — шестой Любавичский Ребе. Тесть нынешнего Ребе. Его призыв: тшува — Геула.">הרבי הריי״צ</span>:</div>

    <div class="quote-block">
      <div class="quote-hebrew">תִּיכֶף לִתְשׁוּבָה — גְּאוּלָה</div>
      <div class="quote-russian">«Сразу за тшувой — Избавление»</div>
      <div class="quote-source">Игрот Кодеш Ребе Раяца, том 5, стр. 361 · цитируется в сихе</div>
    </div>

    <div class="body-text">И затем — слова самого Ребе из этой сихи:</div>

    <div class="quote-block">
      <div class="quote-hebrew">כְּבָר גָּמְרוּ אֶת הָ"לִיטוֹשׁ", וְצָרִיךְ רַק לַעֲמוֹד מוּכָן לְקַבָּלַת פְּנֵי מָשִׁיחַ</div>
      <div class="quote-russian">«Уже закончили "полировку кнопок", и нужно только стоять готовыми встретить Мошиаха»</div>
      <div class="quote-source">Ребе, Шабос Беаалотха, 19 Сивана 5751</div>
    </div>

    ${divider()}

    <div class="body-text"><strong>Вопрос дня:</strong></div>
    <div style="font-size:1.05rem;font-style:italic;color:var(--text-mid);text-align:center;margin:12px 0;direction:ltr;">
      Что в твоей жизни сейчас требует «помола» —<br>терпения и постепенного труда?
    </div>

    <textarea class="journal-input" id="journalDay6" placeholder="Запиши честно — этот дневник только для тебя..."></textarea>

    <button class="btn-secondary" onclick="submitJournal6()">Записать</button>
    <div id="journal6fb" class="hidden"></div>
    <button class="btn-primary" onclick="next()" style="margin-top:20px">Шабос наступает →</button>

    ${footerCredit()}
  `;
}

function submitJournal6() {
  const val = document.getElementById('journalDay6').value.trim();
  state.journalEntries.push(val || '...');
  const fb = document.getElementById('journal6fb');
  fb.innerHTML = `<div class="feedback-box">
    <div class="hebrew">כָּל יִשְׂרָאֵל יֵשׁ לָהֶם חֵלֶק לָעוֹלָם הַבָּא</div>
    <div class="translation">Признать, что нужна работа — уже первый шаг тшувы.</div>
    <div class="source">Санhедрин 10:1</div>
  </div>`;
  fb.classList.remove('hidden');
}

// ===== SCREEN 7: SHABBAT =====
function renderShabbat(el) {
  const mannaIcon = state.choices.filter(c => c === 0).length >= 2 ? '🍞' :
    state.choices.filter(c => c === 0).length >= 1 ? '🫓' : '🌾';
  const soulName = state.soulLevel >= 4 ? 'צַדִּיק' : state.soulLevel >= 3 ? 'בֵּינוֹנִי' : 'בְּדֶרֶךְ';

  el.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-family:'Noto Serif Hebrew',serif;font-size:0.85rem;color:var(--text-light);letter-spacing:0.15em;">שַׁבָּת קֹדֶשׁ</div>
      <div class="day-title" style="margin-bottom:0">Святой Шабос</div>
    </div>

    <div class="shabbat-candles">
      <div class="candle"><div class="candle-flame"></div><div class="candle-body"></div></div>
      <div class="candle" style="animation-delay:0.3s"><div class="candle-flame" style="animation-delay:0.2s"></div><div class="candle-body"></div></div>
    </div>

    <div class="quote-block">
      <div class="quote-hebrew">וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ וְכָל צְבָאָם</div>
      <div class="quote-russian">«И завершились небо и земля, и всё воинство их» (Берешит 2:1)</div>
      <div class="quote-source">Ребе объясняет: слово וַיְכֻלּוּ от כִּלָּיוֹן — томление, жажда</div>
    </div>

    <div class="quote-block">
      <div class="quote-hebrew">כְּאִילּוּ יָצְאָה נִשְׁמַת הָעוֹלָם מֵאַהֲבַת ה'</div>
      <div class="quote-russian">«Как будто вышла душа мира от любви к Б-гу»</div>
      <div class="quote-source">Ребе, на основе Зоhара · Берешит Раба 10:4</div>
    </div>

    ${divider()}

    <div class="body-text" style="text-align:center;">Твой путь за эту неделю:</div>

    <div class="week-map">
      ${['א','ב','ג','ד','ה','ו'].map((d,i) => {
        const icons = ['🌅','📖','🤝','⚖️','🌿','✨'];
        return `<div class="week-day">
          <div class="day-num">День ${i+1}</div>
          <div class="day-icon">${icons[i]}</div>
          <div class="day-heb">${d}'</div>
        </div>`;
      }).join('')}
    </div>

    <div class="manna-result-text">
      <div class="big">Твой ман этой недели: ${mannaIcon}</div>
      <div class="small">Уровень: <span style="font-family:'Noto Serif Hebrew',serif;color:var(--gold-deep)">${soulName}</span> · Оценок нет — только путь</div>
    </div>

    <div class="quote-block">
      <div class="quote-hebrew">לֹא נָפַל דָּבָר — הַמָּן הָיָה לְכָל יִשְׂרָאֵל</div>
      <div class="quote-russian">«Ни один еврей не был оставлен — ман был для каждого»</div>
      <div class="quote-source">Ребе, Беаалотха 5751</div>
    </div>

    <button class="btn-primary" onclick="next()">К заключению →</button>

    ${footerCredit()}
  `;
}

// ===== SCREEN 8: FINAL =====
function renderFinal(el) {
  el.innerHTML = `
    <div class="rebbe-portrait">✡</div>

    <div class="hebrew-title" style="font-size:2rem;">כ"ק אדמו"ר</div>
    <div class="russian-subtitle">Любавичский Ребе זי"ע</div>
    <div class="rebbe-credit">רבי מנחם מנדל שניאורסון · שיחת בהעלתך תשנ"א</div>

    ${divider()}

    <div class="quote-block">
      <div class="quote-hebrew">הַדּוֹר הָאַחֲרוֹן שֶׁל הַגָּלוּת הוּא הַדּוֹר הָרִאשׁוֹן שֶׁל הַגְּאוּלָה — הַגְּאוּלָה לְכָל יִשְׂרָאֵל בְּכָל הַדּוֹרוֹת</div>
      <div class="quote-russian">«Последнее поколение изгнания — это первое поколение Избавления — Избавления для всего Израиля во всех поколениях»</div>
      <div class="quote-source">Ребе, Шабос Беаалотха, 19 Сивана 5751 · Ликутей Сихот том 39</div>
    </div>

    <div class="quote-block">
      <div class="quote-hebrew">לַעֲמוֹד מוּכָנִים כּוּלְּכֶם לְקַבֵּל פְּנֵי מָשִׁיחַ צִדְקֵנוּ</div>
      <div class="quote-russian">«Стоять готовыми — все вы — встретить нашего праведного Мошиаха»</div>
      <div class="quote-source">Ребе, там же · финальные слова сихи</div>
    </div>

    ${divider()}

    <div class="body-text" style="text-align:center;font-size:1.1rem;">
      Что <strong>ты</strong> можешь сделать сегодня,<br>чтобы приблизить это?
    </div>

    <div class="choices" id="finalChoices">
      <button class="choice-btn" onclick="finalChoice(this, 0)">📖 Выучить урок Торы — даже пять минут</button>
      <button class="choice-btn" onclick="finalChoice(this, 1)">🤝 Сделать доброе дело — <span style="font-family:'Noto Serif Hebrew',serif">גְּמִילוּת חֲסָדִים</span></button>
      <button class="choice-btn" onclick="finalChoice(this, 2)">💬 Рассказать другу о том, что узнал сегодня</button>
    </div>

    <div id="finalFeedback" class="hidden"></div>

    <div id="restartDiv" class="hidden" style="text-align:center;margin-top:20px;">
      <button class="btn-secondary" onclick="renderScreen(0)">Пройти снова ↺</button>
    </div>

    ${divider()}

    <div style="text-align:center;direction:ltr;margin-top:16px;">
      <div style="font-family:'Noto Serif Hebrew',serif;font-size:1.1rem;color:var(--gold-deep);">יְחִי אֲדוֹנֵנוּ מוֹרֵנוּ וְרַבֵּנוּ מֶלֶךְ הַמָּשִׁיחַ לְעוֹלָם וָעֶד</div>
    </div>

    ${footerCredit()}
  `;
}

function finalChoice(btn, idx) {
  document.querySelectorAll('#finalChoices .choice-btn').forEach(b => { b.disabled = true; });
  btn.classList.add('selected');

  const messages = [
    { heb: 'תַּלְמוּד תּוֹרָה כְּנֶגֶד כֻּלָּם', ru: '«Изучение Торы равно всем заповедям» (Пеа 1:1) — каждая минута учёбы приближает Геулу.' },
    { heb: 'וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ', ru: '«Люби ближнего, как самого себя» (Ваикра 19:18) — Ребе говорил: это основа всей Торы.' },
    { heb: 'הֱיוֹ מַפִּיצִים מַעְיְנוֹתָיו חוּצָה', ru: '«Распространяйте Его источники вовне» — Баал Шем Тов о распространении хасидского учения.' }
  ];

  const m = messages[idx];
  const fb = document.getElementById('finalFeedback');
  fb.innerHTML = `<div class="feedback-box">
    <div class="hebrew">${m.heb}</div>
    <div class="translation">${m.ru}</div>
    <div class="source">Благодарим за прохождение игры · По сихе Любавичского Ребе זי"ע, Беаалотха 5751</div>
  </div>`;
  fb.classList.remove('hidden');
  document.getElementById('restartDiv').classList.remove('hidden');
}

function toggleGlossary() {
  state.glossaryOpen = !state.glossaryOpen;
  document.getElementById('glossaryPanel').classList.toggle('open', state.glossaryOpen);
}

// ===== TOOLTIP SYSTEM =====
(function () {
  const bubble = document.getElementById('tooltipBubble');
  let hideTimer, arrowLeft = '50%';

  function positionAndShow(term) {
    clearTimeout(hideTimer);
    const tip = term.dataset.tip || '';
    const heb = term.dataset.tipHeb || '';
    if (!tip && !heb) return;

    bubble.innerHTML =
      '<div class="tooltip-arrow" id="tooltipArrow"></div>' +
      (heb ? '<span class="tooltip-heb">' + heb + '</span>' : '') +
      (tip ? '<span class="tooltip-def">' + tip + '</span>' : '');

    // Layout bubble off-screen first to measure
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

    // Horizontal: center on term, clamp inside viewport
    let x = cx - bw / 2;
    x = Math.max(8, Math.min(window.innerWidth - bw - 8, x));

    // Arrow position relative to bubble
    const arrX = Math.max(10, Math.min(bw - 16, cx - x));

    const arrowEl = bubble.querySelector('.tooltip-arrow');
    arrowEl.style.left = arrX + 'px';

    // Vertical: prefer above, fall back to below
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

  // Mouse
  document.addEventListener('mouseover', function (e) {
    const t = e.target.closest('.term[data-tip],.term[data-tip-heb]');
    if (t) positionAndShow(t);
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest('.term')) hideBubble();
  });

  // Touch: tap to toggle
  document.addEventListener('touchend', function (e) {
    const t = e.target.closest('.term[data-tip],.term[data-tip-heb]');
    if (t) {
      e.preventDefault();
      bubble.classList.contains('visible') ? bubble.classList.remove('visible') : positionAndShow(t);
    } else {
      hideBubble();
    }
  }, { passive: false });
})();

// ===== AUDIO SYSTEM =====
var _audioCtx = null;
var _audioMaster = null;
var _audioPlaying = false;

function toggleAudio() {
  var btn = document.getElementById('audioBtn');
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    _buildAmbient();
    _audioPlaying = true;
  } else {
    _audioPlaying = !_audioPlaying;
  }

  var now = _audioCtx.currentTime;
  _audioMaster.gain.cancelScheduledValues(now);
  _audioMaster.gain.setValueAtTime(_audioMaster.gain.value, now);

  if (_audioPlaying) {
    _audioCtx.resume();
    _audioMaster.gain.linearRampToValueAtTime(1, now + 2.5);
    btn.querySelector('.a-icon').textContent = '🔊';
    btn.classList.add('playing');
  } else {
    _audioMaster.gain.linearRampToValueAtTime(0, now + 1.8);
    btn.querySelector('.a-icon').textContent = '🔇';
    btn.classList.remove('playing');
  }
}

function _buildAmbient() {
  var ctx = _audioCtx;
  _audioMaster = ctx.createGain();
  _audioMaster.gain.setValueAtTime(0, ctx.currentTime);

  var comp = ctx.createDynamicsCompressor();
  comp.threshold.setValueAtTime(-24, ctx.currentTime);
  comp.ratio.setValueAtTime(4, ctx.currentTime);
  comp.connect(_audioMaster);
  _audioMaster.connect(ctx.destination);

  // Drone — A minor chord: A2 E3 A3 E4 with micro-detuning
  [[110, 0.055], [165, 0.038], [220, 0.028], [330, 0.014], [440, 0.008]].forEach(function (pair) {
    var freq = pair[0], amp = pair[1];
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    // Micro-detune each oscillator for natural beating
    osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.003), ctx.currentTime);
    osc.type = 'sine';
    g.gain.setValueAtTime(amp, ctx.currentTime);

    // Slow LFO tremolo
    var lfo = ctx.createOscillator();
    var lfoG = ctx.createGain();
    lfo.frequency.setValueAtTime(0.08 + Math.random() * 0.18, ctx.currentTime);
    lfoG.gain.setValueAtTime(amp * 0.25, ctx.currentTime);
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    lfo.start();

    osc.connect(g);
    g.connect(comp);
    osc.start();
  });

  // Desert wind: filtered white noise
  var bufLen = ctx.sampleRate * 3;
  var noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  var nd = noiseBuf.getChannelData(0);
  for (var i = 0; i < bufLen; i++) nd[i] = Math.random() * 2 - 1;

  var noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = noiseBuf;
  noiseSrc.loop = true;

  var windFilt = ctx.createBiquadFilter();
  windFilt.type = 'bandpass';
  windFilt.frequency.setValueAtTime(380, ctx.currentTime);
  windFilt.Q.setValueAtTime(0.45, ctx.currentTime);

  var windG = ctx.createGain();
  windG.gain.setValueAtTime(0.038, ctx.currentTime);

  // Slow wind swell LFO
  var wLfo = ctx.createOscillator();
  var wLfoG = ctx.createGain();
  wLfo.frequency.setValueAtTime(0.04, ctx.currentTime);
  wLfoG.gain.setValueAtTime(0.022, ctx.currentTime);
  wLfo.connect(wLfoG);
  wLfoG.connect(windG.gain);
  wLfo.start();

  noiseSrc.connect(windFilt);
  windFilt.connect(windG);
  windG.connect(comp);
  noiseSrc.start();

  // Schedule occasional soft bell tones
  _scheduleBell();
}

function _scheduleBell() {
  var delay = 10000 + Math.random() * 22000;
  setTimeout(function () {
    if (!_audioCtx || !_audioMaster) return;
    if (_audioPlaying) {
      var ctx = _audioCtx;
      var bellFreqs = [528, 660, 792, 880, 1056];
      var freq = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];
      var osc = ctx.createOscillator();
      var env = ctx.createGain();
      var now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.06, now + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 4);
      osc.connect(env);
      env.connect(_audioMaster);
      osc.start(now);
      osc.stop(now + 4.5);
    }
    _scheduleBell();
  }, delay);
}

// ===== START =====
init();
