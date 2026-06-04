(function (global) {
  'use strict';

  var _active = false;
  var _paused = false;
  var _cancelled = false;
  var _voices = [];

  function _translations() {
    var lang = (global.state && global.state.lang) || 'ru';
    return global.MoshiachContent && global.MoshiachContent.translations[lang];
  }

  function _audioTexts() {
    var current = _translations();
    return current ? current.audio : [];
  }

  function _common() {
    var current = _translations();
    return current ? current.common : {
      audioStart: 'Слушать',
      audioPause: 'Пауза',
      audioResume: 'Продолжить',
      audioReplay: 'Слушать снова',
      audioUnavailable: 'Аудио недоступно'
    };
  }

  function _btn() {
    return document.getElementById('audioBtn');
  }

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
    b.querySelector('.a-icon').textContent = icon;
    b.querySelector('.a-label').textContent = label;
    _toggleClasses(add, 'add');
    _toggleClasses(remove, 'remove');
  }

  function _loadVoices() {
    var synth = global.speechSynthesis;
    if (!synth) return;
    var voices = synth.getVoices();
    if (voices.length) _voices = voices;
  }

  _loadVoices();
  if (global.speechSynthesis && global.speechSynthesis.onvoiceschanged !== undefined) {
    global.speechSynthesis.onvoiceschanged = _loadVoices;
  }

  function _voiceFor(lang) {
    var exact = _voices.find(function (voice) { return voice.lang === lang && !voice.localService; }) ||
      _voices.find(function (voice) { return voice.lang === lang; });
    if (exact) return exact;
    if (lang === 'de-DE') {
      return _voices.find(function (voice) { return voice.lang.indexOf('de') === 0; });
    }
    return _voices.find(function (voice) { return voice.lang.indexOf('ru') === 0; });
  }

  function _speak(index) {
    var synth = global.speechSynthesis;
    var current = _translations();
    if (!synth || typeof global.SpeechSynthesisUtterance !== 'function' || !current) {
      _active = false;
      _paused = false;
      _setBtn('×', _common().audioUnavailable, null, ['playing', 'paused']);
      return;
    }

    _paused = false;
    synth.cancel();
    var text = _audioTexts()[index];
    if (!text) return;

    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = current.meta.htmlLang === 'de' ? 'de-DE' : 'ru-RU';
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    _loadVoices();
    var voice = _voiceFor(utter.lang);
    if (voice) utter.voice = voice;

    utter.onend = function () {
      if (_cancelled) return;
      _active = false;
      _paused = false;
      _setBtn('▶', _common().audioReplay, null, ['playing', 'paused']);
    };

    _cancelled = false;
    setTimeout(function () {
      if (_cancelled) return;
      synth.speak(utter);
    }, 50);
  }

  function refreshLabels() {
    var common = _common();
    if (!_active) {
      _setBtn('▶', common.audioStart, null, ['playing', 'paused']);
    } else if (_paused) {
      _setBtn('▶', common.audioResume, 'paused', 'playing');
    } else {
      _setBtn('⏸', common.audioPause, 'playing', 'paused');
    }
  }

  global.AudioQuest = {
    toggle: function () {
      var synth = global.speechSynthesis;
      if (!synth || typeof global.SpeechSynthesisUtterance !== 'function') {
        _active = false;
        _setBtn('×', _common().audioUnavailable, null, ['playing', 'paused']);
        return;
      }
      var currentScreen = (global.state && global.state.day != null) ? global.state.day : 0;
      if (!_active) {
        _active = true;
        _speak(currentScreen);
        _setBtn('⏸', _common().audioPause, 'playing', 'paused');
      } else if (!_paused) {
        synth.pause();
        _paused = true;
        _setBtn('▶', _common().audioResume, 'paused', 'playing');
      } else {
        synth.resume();
        _paused = false;
        _setBtn('⏸', _common().audioPause, 'playing', 'paused');
      }
    },
    onScreenChange: function (index) {
      if (!_active) return;
      _cancelled = true;
      _paused = false;
      global.speechSynthesis.cancel();
      setTimeout(function () {
        _speak(index);
        _setBtn('⏸', _common().audioPause, 'playing', 'paused');
      }, 700);
    },
    refreshLabels: refreshLabels
  };
})(window);
