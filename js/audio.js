/**
 * AudioQuest — narration + ambient audio module
 * Exposes window.AudioQuest with two public methods:
 *   AudioQuest.toggle()          — called by the UI button
 *   AudioQuest.onScreenChange(i) — called by renderScreen()
 */
(function (global) {
  'use strict';

  // ── Narration scripts (one per screen, Russian only) ──────────────────────
  var TEXTS = [
    // 0 — Intro
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
    'День пятый. Шабос и ман — связь миров. Ман не спускался в Шабат. Почему? В Шабат происходит подъём всех миров. А во время подъёма невозможно низвести духовное в материальное. Но вот удивительный парадокс: все шесть дней недели получают своё благословение именно от седьмого дня. Шабат сам не получает ман — но именно он даёт жизнь всем остальным дням. Тот, кто поднялся выше получения, становится источником для всех. Попробуй расставить правильное количество порций по дням недели.',

    // 6 — Day 6
    'День шестой. Тшува через ман. Ман не делал грешников праведниками мгновенно. Хотя они ели ман много раз, всё равно были те, кому нужно было молоть. Но духовная работа шла постепенно. Каждый кусочек мана действовал изнутри, и в конце концов приводил к тшуве. Ребе связывает это с нашим временем. Он цитирует своего тестя: сразу за тшувой — Избавление. И добавляет: уже закончили полировку. Нужно только стоять готовыми встретить Мошиаха. Что в твоей жизни сейчас требует терпения и постепенного труда?',

    // 7 — Shabbat
    'Святой Шабос. Как будто вышла душа мира от любви к Б-гу. Ты прошёл путь целой недели — от рассвета первого дня до покоя седьмого. Твой ман этой недели — это твоё отражение. Не оценка, а путь. Ни один еврей не был оставлен. Ман был для каждого.',

    // 8 — Final
    'Последнее поколение изгнания — это первое поколение Избавления. Избавления для всего Израиля во всех поколениях. Ребе призывает: стоять готовыми — все вы — встретить нашего праведного Мошиаха. Что ты можешь сделать сегодня, чтобы приблизить это? Три пути перед тобой. Первый — выучить урок Торы, даже пять минут. Каждая минута учёбы приближает Избавление. Второй — сделать доброе дело: люби ближнего, как самого себя. Третий — рассказать другу о том, что ты узнал сегодня. Распространяй источники мудрости вовне.'
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  var _active  = false;   // narration quest is on
  var _ctx     = null;    // AudioContext
  var _master  = null;    // master GainNode for ambient

  // ── Button helpers ────────────────────────────────────────────────────────
  function _btn() { return document.getElementById('audioBtn'); }

  function _setBtn(icon, label, add, remove) {
    var b = _btn();
    if (!b) return;
    b.querySelector('.a-icon').textContent  = icon;
    b.querySelector('.a-label').textContent = label;
    if (add)    b.classList.add(add);
    if (remove) b.classList.remove(remove);
  }

  // ── Ambient audio ─────────────────────────────────────────────────────────
  function _initAmbient() {
    if (_ctx) { _ctx.resume(); return; }
    _ctx    = new (global.AudioContext || global.webkitAudioContext)();
    _master = _ctx.createGain();
    _master.gain.setValueAtTime(0, _ctx.currentTime);

    var comp = _ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-24, _ctx.currentTime);
    comp.ratio.setValueAtTime(4, _ctx.currentTime);
    comp.connect(_master);
    _master.connect(_ctx.destination);

    // A-minor drone: 5 oscillators with micro-detuning + slow tremolo LFO
    [[110, 0.055], [165, 0.038], [220, 0.028], [330, 0.014], [440, 0.008]]
      .forEach(function (pair) {
        var freq = pair[0], amp = pair[1];
        var osc = _ctx.createOscillator();
        var g   = _ctx.createGain();
        osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.003), _ctx.currentTime);
        osc.type = 'sine';
        g.gain.setValueAtTime(amp, _ctx.currentTime);

        var lfo  = _ctx.createOscillator();
        var lfoG = _ctx.createGain();
        lfo.frequency.setValueAtTime(0.08 + Math.random() * 0.18, _ctx.currentTime);
        lfoG.gain.setValueAtTime(amp * 0.25, _ctx.currentTime);
        lfo.connect(lfoG);
        lfoG.connect(g.gain);
        lfo.start();

        osc.connect(g);
        g.connect(comp);
        osc.start();
      });

    // Desert wind: bandpass-filtered white noise
    var bufLen   = _ctx.sampleRate * 3;
    var noiseBuf = _ctx.createBuffer(1, bufLen, _ctx.sampleRate);
    var nd       = noiseBuf.getChannelData(0);
    for (var i = 0; i < bufLen; i++) nd[i] = Math.random() * 2 - 1;

    var noiseSrc = _ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop   = true;

    var windFilt = _ctx.createBiquadFilter();
    windFilt.type = 'bandpass';
    windFilt.frequency.setValueAtTime(380, _ctx.currentTime);
    windFilt.Q.setValueAtTime(0.45, _ctx.currentTime);

    var windG = _ctx.createGain();
    windG.gain.setValueAtTime(0.036, _ctx.currentTime);

    noiseSrc.connect(windFilt);
    windFilt.connect(windG);
    windG.connect(comp);
    noiseSrc.start();

    _scheduleBell();
  }

  function _setAmbientVol(target, duration) {
    if (!_master || !_ctx) return;
    var now = _ctx.currentTime;
    _master.gain.cancelScheduledValues(now);
    _master.gain.setValueAtTime(_master.gain.value, now);
    _master.gain.linearRampToValueAtTime(target, now + duration);
  }

  // Occasional soft bell tones (528–880 Hz, every 12–38 s)
  function _scheduleBell() {
    setTimeout(function () {
      if (!_ctx || !_master) return;
      var freq = [528, 660, 792, 880][Math.floor(Math.random() * 4)];
      var osc  = _ctx.createOscillator();
      var env  = _ctx.createGain();
      var now  = _ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      env.gain.setValueAtTime(0,     now);
      env.gain.linearRampToValueAtTime(0.05,   now + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 4);
      osc.connect(env);
      env.connect(_master);
      osc.start(now);
      osc.stop(now + 4.5);
      _scheduleBell();
    }, 12000 + Math.random() * 26000);
  }

  // ── TTS narration ─────────────────────────────────────────────────────────
  function _speak(index) {
    var synth = global.speechSynthesis;
    synth.cancel();

    var text = TEXTS[index];
    if (!text) return;

    var utter    = new SpeechSynthesisUtterance(text);
    utter.lang   = 'ru-RU';
    utter.rate   = 0.88;
    utter.pitch  = 1.0;
    utter.volume = 1.0;

    // Prefer an online Russian voice when available
    var voices  = synth.getVoices();
    var ruVoice = voices.find(function (v) { return v.lang === 'ru-RU' && !v.localService; }) ||
                  voices.find(function (v) { return v.lang === 'ru-RU'; })                   ||
                  voices.find(function (v) { return v.lang.startsWith('ru'); });
    if (ruVoice) utter.voice = ruVoice;

    utter.onend = function () {
      _active = false;
      _setAmbientVol(0.7, 2);
      _setBtn('▶', 'Слушать снова', null, 'playing paused'.split(' '));
      // classList.remove accepts a single string or spread; call twice to be safe
      var b = _btn();
      if (b) { b.classList.remove('playing'); b.classList.remove('paused'); }
    };

    synth.speak(utter);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  global.AudioQuest = {

    /**
     * Toggle narration on/off; cycles Start → Pause → Resume → Replay.
     * Called by the #audioBtn onclick handler in index.html.
     */
    toggle: function () {
      _initAmbient();
      var synth = global.speechSynthesis;

      // Resolve current narration state and act
      var currentScreen = (global.state && global.state.day != null) ? global.state.day : 0;

      if (!_active) {
        _active = true;
        _speak(currentScreen);
        _setAmbientVol(0.3, 1.5);
        _setBtn('⏸', 'Пауза', 'playing', 'paused');
      } else if (synth.speaking && !synth.paused) {
        synth.pause();
        _setAmbientVol(0.72, 0.8);
        _setBtn('▶', 'Продолжить', 'paused', 'playing');
      } else if (synth.paused) {
        synth.resume();
        _setAmbientVol(0.3, 0.8);
        _setBtn('⏸', 'Пауза', 'playing', 'paused');
      } else {
        // Narration ended — replay
        _speak(currentScreen);
        _setAmbientVol(0.3, 1);
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
      global.speechSynthesis.cancel();
      setTimeout(function () { _speak(index); }, 700);
    }
  };

})(window);
