/**
 * AudioQuest — narration module
 * Exposes window.AudioQuest with two public methods:
 *   AudioQuest.toggle()          — called by the UI button
 *   AudioQuest.onScreenChange(i) — called by renderScreen()
 */
(function (global) {
  'use strict';

  // ── Narration scripts (one per screen, Russian only) ──────────────────────
  var TEXTS = [
    // 0 — Home
    'Двенадцатый принцип веры. Верю полной верой в приход Мошиаха. Велика заповедь быть в радости всегда. Выберите главу, чтобы начать путь.',

    // 1 — Intro
    'Ман с Небес. Добро пожаловать в аудиоквест. Три с половиной тысячи лет назад евреи шли через пустыню. Каждое утро с неба спускался ман — небесный хлеб. Но где он появлялся, и в каком виде — зависело от духовного уровня каждого человека. Любавичский Ребе учит: ман — это не просто история. Это зеркало, которое показывает, кто мы сейчас. Последнее поколение изгнания — это первое поколение Избавления. Праведник находил готовый хлеб прямо у входа в шатёр. Средний должен был выйти за лагерь и находил там лепёшки. Грешник искал далеко в поле и должен был молоть зерно. Но ман питал и очищал всех евреев — и праведника, и грешника. Нажмите кнопку ниже, чтобы начать путь.',

    // 1 — Day 1
    'День первый. Утреннее испытание. Рассвет над лагерем. Утренняя молитва вот-вот начнётся. Ты замечаешь: твой сосед по шатру не встаёт. Что ты сделаешь? Первый путь — разбудить его. Каждая еврейская душа — это целый мир. Второй путь — не вмешиваться. Уважение к свободе воли тоже является ценностью. Третий путь — честно признать, что тебе самому трудно встать. Признать свои ограничения — начало пути. Сделай свой выбор.',

    // 2 — Day 2
    'День второй. Два вида хлеба. Ребе проводит глубокую параллель: ман — это не только еда в пустыне. Это образ двух видов Торы, двух видов духовной пищи. Хлеб с земли — открытая Тора. В ней есть споры и вопросы. Она требует труда, как хлеб, выращенный из земли. Хлеб с Небес — внутренняя Тора, хасидус. В ней нет неразрешённых вопросов. Она спускается сама, для каждой души, без отходов и без остатков. Попробуй распределить карточки по двум категориям.',

    // 3 — Day 3
    'День третий. Никто не потерян. Некоторые евреи в пустыне несли с собой идола. Казалось бы, они недостойны небесной пищи. Но ман спускался и к ним. И — самое удивительное — не оставлял в них отходов. Ман очистил весь Израиль и сделал их достойными получить Тору. Ребе объясняет: ман не менял грешника мгновенно. Некоторые продолжали молоть даже после многократного вкушения. Но духовная работа шла изнутри. Это как тшува — возвращение к Б-гу. Она не всегда происходит сразу. Но духовная пища продолжает работать внутри человека. Если ман питал даже тех, кто нёс идола — значит ли это, что никто не потерян?',

    // 4 — Day 4
    'День четвёртый. Моше и небесный хлеб. Ребе приводит неожиданную мысль из книги Тора Ор: Моше провёл сорок дней на горе Синай без еды и питья. Но он всё же питался — духовным маном, как ангелы. Псалмы говорят: хлеб могучих ел человек. Это учит нас: существует шкала. На одном конце — материальное. На другом — духовное. Ман существовал на обоих уровнях одновременно. Даже в физическом мане были облачены духовные светы высочайших уровней. Где на этой шкале сейчас находишься ты?',

    // 5 — Day 5
    'День пятый. Шабес и ман — связь миров. Ман не спускался в Шабат. Почему? В Шабат происходит подъём всех миров. А во время подъёма невозможно низвести духовное в материальное. Но вот удивительный парадокс: все шесть дней недели получают своё благословение именно от седьмого дня. Шабат сам не получает ман — но именно он даёт жизнь всем остальным дням. Тот, кто поднялся выше получения, становится источником для всех. Попробуй расставить правильное количество порций по дням недели.',

    // 6 — Day 6
    'День шестой. Тшува через ман. Ман не делал грешников праведниками мгновенно. Хотя они ели ман много раз, всё равно были те, кому нужно было молоть. Но духовная работа шла постепенно. Каждый кусочек мана действовал изнутри, и в конце концов приводил к тшуве. Ребе связывает это с нашим временем. Он цитирует своего тестя: сразу за тшувой — Избавление. И добавляет: уже закончили полировку. Нужно только стоять готовыми встретить Мошиаха. Что в твоей жизни сейчас требует терпения и постепенного труда?',

    // 7 — Shabbat
    'Святой Шабес. Как будто вышла душа мира от любви к Б-гу. Ты прошёл путь целой недели — от рассвета первого дня до покоя седьмого. Твой ман этой недели — это твоё отражение. Не оценка, а путь. Ни один еврей не был оставлен. Ман был для каждого.',

    // 8 — Final
    'Последнее поколение изгнания — это первое поколение Избавления. Избавления для всего Израиля во всех поколениях. Ребе призывает: стоять готовыми — все вы — встретить нашего праведного Мошиаха. Что ты можешь сделать сегодня, чтобы приблизить это? Три пути перед тобой. Первый — выучить урок Торы, даже пять минут. Каждая минута учёбы приближает Избавление. Второй — сделать доброе дело: люби ближнего, как самого себя. Третий — рассказать другу о том, что ты узнал сегодня. Распространяй источники мудрости вовне.'
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  var _active    = false;
  var _paused    = false; // own flag — synth.paused is unreliable in Chrome
  var _cancelled = false; // suppress onend when cancel() is intentional

  // ── Button helpers ────────────────────────────────────────────────────────
  function _btn() { return document.getElementById('audioBtn'); }

  function _toggleClasses(list, method) {
    var b = _btn();
    if (!b || !list) return;
    (Array.isArray(list) ? list : [list]).forEach(function (name) {
      if (name) b.classList[method](name);
    });
  }

  function _setBtn(icon, label, add, remove) {
    var b = _btn();
    if (!b) return;
    b.querySelector('.a-icon').textContent  = icon;
    b.querySelector('.a-label').textContent = label;
    _toggleClasses(add, 'add');
    _toggleClasses(remove, 'remove');
  }

  // ── Voice cache ───────────────────────────────────────────────────────────
  var _voices = [];
  function _loadVoices() {
    var v = global.speechSynthesis.getVoices();
    if (v.length) _voices = v;
  }
  _loadVoices();
  if (global.speechSynthesis && global.speechSynthesis.onvoiceschanged !== undefined) {
    global.speechSynthesis.onvoiceschanged = _loadVoices;
  }

  // ── TTS narration ─────────────────────────────────────────────────────────
  function _speak(index) {
    var synth = global.speechSynthesis;
    if (!synth || typeof global.SpeechSynthesisUtterance !== 'function') {
      _active = false;
      _setBtn('×', 'Аудио недоступно', null, ['playing', 'paused']);
      return;
    }

    _paused = false;
    // Keep _cancelled = true through synth.cancel() so any late onend from the
    // previous utterance sees it and returns early (race-condition fix).
    synth.cancel();

    var text = TEXTS[index];
    if (!text) return;

    var utter    = new SpeechSynthesisUtterance(text);
    utter.lang   = 'ru-RU';
    utter.rate   = 0.88;
    utter.pitch  = 1.0;
    utter.volume = 1.0;

    // Prefer an online Russian voice when available
    _loadVoices();
    var ruVoice = _voices.find(function (v) { return v.lang === 'ru-RU' && !v.localService; }) ||
                  _voices.find(function (v) { return v.lang === 'ru-RU'; })                    ||
                  _voices.find(function (v) { return v.lang.startsWith('ru'); });
    if (ruVoice) utter.voice = ruVoice;

    utter.onend = function () {
      if (_cancelled) return; // screen change triggered cancel — don't reset state
      _active = false;
      _paused = false;
      _setBtn('▶', 'Слушать снова', null, ['playing', 'paused']);
    };

    // Small delay before speak: Chrome sometimes silently drops speak() called
    // immediately after cancel(), especially after long pauses between screens.
    _cancelled = false;
    setTimeout(function () {
      if (_cancelled) return;
      synth.speak(utter);
    }, 50);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  global.AudioQuest = {

    /**
     * Toggle narration on/off; cycles Start → Pause → Resume → Replay.
     * Called by the #audioBtn onclick handler in index.html.
     */
    toggle: function () {
      var synth = global.speechSynthesis;
      if (!synth || typeof global.SpeechSynthesisUtterance !== 'function') {
        _active = false;
        _setBtn('×', 'Аудио недоступно', null, ['playing', 'paused']);
        return;
      }

      // Resolve current narration state and act
      var currentScreen = (global.state && global.state.day != null) ? global.state.day : 0;

      if (!_active) {
        // Start or replay
        _active = true;
        _speak(currentScreen);
        _setBtn('⏸', 'Пауза', 'playing', 'paused');
      } else if (!_paused) {
        // Pause — use own flag, not synth.paused (unreliable in Chrome)
        synth.pause();
        _paused = true;
        _setBtn('▶', 'Продолжить', 'paused', 'playing');
      } else {
        // Resume
        synth.resume();
        _paused = false;
        _setBtn('⏸', 'Пауза', 'playing', 'paused');
      }
    },

    /**
     * Called by renderScreen() when the user navigates to a new screen.
     * If the quest is active, cancels current speech and starts the new one
     * after a short delay so the card fade-in animation completes first.
     */
    onScreenChange: function (index) {
      if (!_active) return;
      _cancelled = true; // prevent onend from resetting _active
      _paused    = false;
      global.speechSynthesis.cancel();
      setTimeout(function () {
        // Note: _cancelled stays true until _speak() resets it just before synth.speak()
        _speak(index);
        _setBtn('⏸', 'Пауза', 'playing', 'paused');
      }, 700);
    }
  };

})(window);
