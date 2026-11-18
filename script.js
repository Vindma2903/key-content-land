/* ============ Настройки страницы ============ */
// Затухание текста пробной статьи: false — статья показывается целиком; true — после первых абзацев текст гаснет
// и открывается полностью только после отправки заявки (форма внизу блока).
var ARTICLE_FADE = false;
// Номер счётчика Яндекс Метрики для целей демо. null — цели не отправляются. Счётчик подключает владелец сайта.
var METRIKA_ID = null;
// Адрес публичного API демо платформы (тот же домен, куки и CORS не нужны).
var DEMO_API = '/api/v1/public/demo';

(function () {
  'use strict';

  /* ---------- вошедшего пользователя ведём сразу в платформу ---------- */
  if (location.pathname === '/' || location.pathname === '/index.html') {
    fetch('/api/v1/auth/me', { credentials: 'same-origin' })
      .then(function (r) { if (r.ok) location.replace('/projects'); })
      .catch(function () {});
  }

  /* ---------- бегущая строка: дублируем содержимое для бесшовного цикла ---------- */
  var track = document.getElementById('marquee-track');
  if (track) {
    Array.prototype.slice.call(track.children).forEach(function (el) {
      var c = el.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
  }

  /* ---------- мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.textContent = open ? '✕' : '☰';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1080) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) setMenu(false);
  });

  /* ---------- поп-ап «Запись на демо» ---------- */
  var modal = document.getElementById('modal');
  var demoForm = document.getElementById('demo-form');
  var demoDone = document.getElementById('demo-done');

  function openModal() {
    demoForm.hidden = false;
    demoDone.hidden = true;
    demoForm.reset();
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
  }
  function closeModal() {
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-modal]')) {
      setMenu(false);
      openModal();
    } else if (e.target.closest('[data-close-modal]')) {
      closeModal();
    }
  });
  // клик по подложке закрывает окно
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  // Отправка заявок: /lead-api -> Telegram-бот
  function sendLead(form, kind, onOk) {
    var f = form.elements, btn = form.querySelector('button[type="submit"]');
    var body = {
      form: kind,
      name: f.name ? f.name.value : '',
      phone: f.phone ? f.phone.value : '',
      site: f.site ? f.site.value : '',
      message: f.text ? f.text.value : ''
    };
    if (btn) btn.disabled = true;
    fetch('/lead-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      onOk();
    }).catch(function () {
      alert('Не удалось отправить заявку. Позвоните нам: +7 996 924-16-48');
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  }

  demoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sendLead(demoForm, 'Запись на демо', function () {
      demoForm.hidden = true;
      demoDone.hidden = false;
    });
  });

  var fbForm = document.getElementById('fb-form');
  var fbDone = document.getElementById('fb-done');
  if (fbForm) {
    fbForm.addEventListener('submit', function (e) {
      e.preventDefault();
      sendLead(fbForm, 'Обратная связь', function () {
        fbForm.hidden = true;
        fbDone.hidden = false;
      });
    });
  }

  /* ---------- «Для кого»: вкладки ---------- */
  var segments = [
    { emoji: '🏪', name: 'Малый и средний бизнес', text: 'Не нужно собирать команду из разных специалистов: платформа выстраивает работу с поисковым спросом и контентом в одном месте.', bullets: ['Понятно, какие темы стоит закрывать', 'Контент создаётся по стратегии, а не по настроению', 'Одна платформа вместо набора инструментов'] },
    { emoji: '💻', name: 'SaaS и IT-компании', text: 'Системно закрывайте поисковый спрос вокруг продукта и смежных задач вашей аудитории.', bullets: ['Карта спроса по вашей нише', 'Контентная структура сайта растёт по плану', 'Анализ результатов подсказывает следующие темы'] },
    { emoji: '🤝', name: 'B2B-компании', text: 'Аудитория B2B ищет ответы в поиске. Ключевик помогает увидеть эти запросы и закрыть их материалами.', bullets: ['Видно, какие вопросы задаёт аудитория', 'Материалы связаны в единую структуру', 'Новые точки роста находятся по результатам'] },
    { emoji: '🛒', name: 'Интернет-магазины', text: 'Выстраивайте контентную структуру сайта вокруг реального спроса покупателей.', bullets: ['Анализ того, что ищут покупатели', 'Карта тем и запросов', 'Материалы создаются AI-агентами по стратегии'] },
    { emoji: '📣', name: 'Маркетологи и руководители', text: 'Один подход к процессу: от анализа спроса до анализа результатов.', bullets: ['Прозрачная логика: спрос → стратегия → материалы', 'Меньше разрозненных сервисов и исполнителей', 'Результаты анализа превращаются в новые задачи'] },
    { emoji: '🚀', name: 'Рост органического трафика', text: 'Когда нужен рост, который не упирается в ручное производство контента.', bullets: ['Системное производство материалов', 'Развитие структуры сайта', 'Постоянный поиск новых возможностей'] }
  ];

  var tabsEl = document.getElementById('tabs');
  var pEmoji = document.getElementById('p-emoji');
  var pName = document.getElementById('p-name');
  var pText = document.getElementById('p-text');
  var pList = document.getElementById('p-list');
  var tabBtns = [];

  function selectTab(i, focus) {
    var s = segments[i];
    tabBtns.forEach(function (b, j) {
      b.setAttribute('aria-selected', String(j === i));
      b.tabIndex = j === i ? 0 : -1;
    });
    pEmoji.textContent = s.emoji;
    pName.textContent = s.name;
    pText.textContent = s.text;
    pList.innerHTML = '';
    s.bullets.forEach(function (t) {
      var li = document.createElement('li');
      var ok = document.createElement('span');
      ok.setAttribute('aria-hidden', 'true');
      ok.textContent = '✅';
      var tx = document.createElement('span');
      tx.textContent = t;
      li.appendChild(ok);
      li.appendChild(tx);
      pList.appendChild(li);
    });
    if (focus) tabBtns[i].focus();
  }

  if (tabsEl) segments.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.setAttribute('role', 'tab');
    var em = document.createElement('span');
    em.setAttribute('aria-hidden', 'true');
    em.textContent = s.emoji;
    b.appendChild(em);
    b.appendChild(document.createTextNode(s.name));
    b.addEventListener('click', function () { selectTab(i, false); });
    b.addEventListener('keydown', function (e) {
      var n = segments.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); selectTab((i + 1) % n, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); selectTab((i - 1 + n) % n, true); }
    });
    tabsEl.appendChild(b);
    tabBtns.push(b);
  });
  if (tabsEl) selectTab(0, false);

  /* ---------- калькулятор стоимости ---------- */
  // 1 кредит = 85 ₽, минимальный тариф — 100 кредитов (8 500 ₽)
  var CREDIT_PRICE = 85, MIN_CREDITS = 100, STEP = 5, MAX_POSTS = 100;
  var rows = Array.prototype.slice.call(document.querySelectorAll('.crow'));

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function plural(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'кредит';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'кредита';
    return 'кредитов';
  }
  function clamp(v) { return Math.max(0, Math.min(MAX_POSTS, v)); }
  function getN(row) { return parseInt(row.querySelector('input[type=range]').value, 10) || 0; }
  function setN(row, v) { row.querySelector('input[type=range]').value = clamp(v); recalc(); }

  function recalc() {
    var credits = 0, pubs = 0;
    rows.forEach(function (row) {
      var n = getN(row), sum = n * Number(row.dataset.cr);
      credits += sum; pubs += n;
      row.querySelector('[data-count]').textContent = n;
      row.querySelector('[data-sub]').textContent = '= ' + sum + ' ' + plural(sum);
    });
    var total = Math.max(credits, MIN_CREDITS);
    document.getElementById('calc-pubs').textContent = pubs;
    document.getElementById('calc-credits').textContent = total;
    document.getElementById('calc-price').textContent = fmt(total * CREDIT_PRICE);
    document.getElementById('calc-below').hidden = credits >= MIN_CREDITS;
  }

  rows.forEach(function (row) {
    var range = row.querySelector('input[type=range]');
    range.addEventListener('input', recalc);
    row.querySelector('[data-minus]').addEventListener('click', function () { setN(row, getN(row) - STEP); });
    row.querySelector('[data-plus]').addEventListener('click', function () { setN(row, getN(row) + STEP); });
  });
  // «Рекомендуем»: по 30 публикаций на каждую уже выбранную платформу
  if (rows.length) document.getElementById('calc-rec').addEventListener('click', function () {
    rows.forEach(function (row) { row.querySelector('input[type=range]').value = getN(row) > 0 ? 30 : 0; });
    recalc();
  });
  if (rows.length) document.getElementById('calc-reset').addEventListener('click', function () {
    rows.forEach(function (row) { row.querySelector('input[type=range]').value = row.dataset.def; });
    recalc();
  });
  if (rows.length) recalc();

  /* ---------- FAQ: аккордеон ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq');
    btn.addEventListener('click', function () {
      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      faqItems.forEach(function (it) {
        var b = it.querySelector('.faq');
        var a = it.querySelector('.faq__a');
        var open = it === item && willOpen;
        b.setAttribute('aria-expanded', String(open));
        a.hidden = !open;
        b.querySelector('.faq__i').textContent = open ? '−' : '+';
      });
    });
  });
})();

/* ============ Первый экран: живой экспресс-анализ сайта ============
   Работает с публичным API демо платформы (/api/v1/public/demo/*): config, analyses, niche, article, delete.
   Конечный автомат: input → run → result → topic → gen → article, боковые niche / error / off.
   Один источник правды — объект state; панель выбирается по state.screen. Тексты с сервера выводятся только через textContent. */
(function () {
  'use strict';
  var root = document.getElementById('hs');
  if (!root) return;

  var API = DEMO_API;
  var STORE_KEY = 'kw_demo';
  var WAIT_LIMIT_MS = 4 * 60 * 1000;      // общий предел ожидания анализа и статьи
  var FREQ_WAIT_MS = 100 * 1000;          // сервер сам переводит «считаем» в «уточняется» через 90 секунд после результатов
  var FADE_BLOCKS = 5;                    // сколько блоков статьи видно при ARTICLE_FADE = true
  var DEFAULT_PLATFORMS = ['telegram', 'blog'];
  var PLATFORM_LABELS = {
    telegram: ['✈️', 'Телеграм', 'пост для канала'],
    blog: ['🌐', 'Блог', 'статья для сайта'],
    dzen: ['📰', 'Дзен', 'статья'],
    tenchat: ['💬', 'ТенЧат', 'публикация']
  };
  var STEP_ICONS = { read: '🌐', profile: '🏷️', competitors: '🏁', phrases: '🧩', measure: '📈' };
  var GEN_STEPS = [['🧩', 'Подбираем структуру'], ['✍️', 'Пишем текст'], ['🎨', 'Оформляем под площадку']];
  var LEAD_SCREENS = { result: 1, topic: 1, article: 1, error: 1, niche: 1 };

  var state = {
    screen: 'input', cfg: null, id: '', token: '', domain: '', view: null, result: null,
    chosen: { phrase: '', platform: '' }, article: null, leadSent: false, idem: { url: '', key: '' }, busy: false
  };
  var panels = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-hs]'), function (p) { panels[p.getAttribute('data-hs')] = p; });
  var poll = null, inflight = [], copyTimer = null;

  /* ---------- мелочи ---------- */
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }
  function say(msg) { var s = $('hs-status'); if (s) s.textContent = msg; }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }
  function platformLabel(p) {
    var l = PLATFORM_LABELS[p];
    return l ? l[0] + ' ' + l[1] : p;
  }
  function plainPlatform(p) { var l = PLATFORM_LABELS[p]; return l ? l[1] : p; }
  function wordsWord(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'слово';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'слова';
    return 'слов';
  }

  /* ---------- метрика: только цели и код ошибки, без адреса сайта и введённого текста ---------- */
  function goal(name, params) {
    try {
      if (METRIKA_ID && typeof window.ym === 'function') {
        if (params) window.ym(METRIKA_ID, 'params', params);
        window.ym(METRIKA_ID, 'reachGoal', name);
      }
    } catch (e) { /* счётчик не должен ломать страницу */ }
  }

  /* ---------- хранение сессии: токен только в памяти и sessionStorage, в адрес и журналы не попадает ---------- */
  function saveSession() {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({
        id: state.id, token: state.token, domain: state.domain, phrase: state.chosen.phrase, platform: state.chosen.platform
      }));
    } catch (e) { /* без хранилища страница работает так же */ }
  }
  function loadSession() {
    try {
      var d = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
      if (d && typeof d.id === 'string' && typeof d.token === 'string' && d.id && d.token) return d;
    } catch (e) { /* пусто */ }
    return null;
  }
  function dropSession() { try { sessionStorage.removeItem(STORE_KEY); } catch (e) { /* пусто */ } }

  /* ---------- запросы ---------- */
  function abortAll() { inflight.forEach(function (c) { c._user = true; c.abort(); }); inflight = []; }

  // call возвращает {status, body, retryAfter, etag}; сетевой сбой и таймаут — отказ с {net:true}, отмена — {user:true}
  function call(method, path, o) {
    o = o || {};
    var ctl = new AbortController();
    inflight.push(ctl);
    var timer = setTimeout(function () { ctl.abort(); }, 20000);
    var headers = {};
    if (o.token) headers['X-Demo-Token'] = o.token;
    if (o.etag) headers['If-None-Match'] = o.etag;
    if (o.idem) headers['Idempotency-Key'] = o.idem;
    var init = { method: method, headers: headers, signal: ctl.signal, credentials: 'omit' };
    if (o.body !== undefined) { headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(o.body); }
    function done() { clearTimeout(timer); var i = inflight.indexOf(ctl); if (i >= 0) inflight.splice(i, 1); }
    return fetch(API + path, init).then(function (r) {
      var ra = parseInt(r.headers.get('Retry-After') || '', 10);
      var res = { status: r.status, retryAfter: isNaN(ra) ? 0 : ra, etag: r.headers.get('ETag') || '', body: null };
      if (r.status === 304 || r.status === 204) { done(); return res; }
      return r.text().then(function (txt) {
        done();
        try { res.body = txt ? JSON.parse(txt) : null; } catch (e) { res.body = null; }
        return res;
      });
    }, function () {
      var user = !!ctl._user;
      done();
      throw { net: true, user: user };
    });
  }
  function codeOf(r) { return r && r.body && r.body.code ? r.body.code : ''; }

  /* ---------- показ панелей ---------- */
  function show(name, opts) {
    opts = opts || {};
    state.screen = name;
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
    var box = $('hs-lead-box');
    box.hidden = !LEAD_SCREENS[name];
    if (LEAD_SCREENS[name] && !state.leadSent) {
      var f = $('hs-lead-form').elements;
      if (!f.site.value) f.site.value = state.domain || '';
    }
    if (opts.quiet) return;
    var top = root.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: window.pageYOffset + top - 84, behavior: 'smooth' });
    var h = panels[name].querySelector('[data-hs-focus]');
    if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

  /* ---------- ошибки: человеческие тексты и что делать ---------- */
  var ERR = {
    net: ['Связь прервана', 'Не удаётся связаться с сервером. Проверьте интернет и попробуйте ещё раз — или оставьте заявку.'],
    timeout_run: ['Анализ идёт дольше обычного', 'Оставьте заявку — мы пришлём результат. Можно и подождать ещё.'],
    timeout_gen: ['Статья готовится дольше обычного', 'Оставьте заявку — мы пришлём статью. Выбранные фраза и площадка сохранены. Можно и подождать ещё.'],
    analysis_failed: ['Не удалось завершить анализ', 'Попробуйте ещё раз позже, проверьте другой адрес или оставьте заявку.'],
    forbidden: ['Этот сайт нельзя анализировать', 'Введите адрес вашего собственного сайта или оставьте заявку.'],
    limit: ['На сегодня демо закончилось', 'С вашего адреса слишком много попыток. Попробуйте позже или оставьте заявку — покажем анализ вручную.'],
    capacity: ['Демо сейчас занято', 'Дневной лимит демо исчерпан или очередь заполнена. Попробуйте позже или оставьте заявку — покажем анализ вашего сайта вручную.'],
    captcha: ['Проверка не пройдена', 'Обновите страницу и попробуйте ещё раз или оставьте заявку.'],
    expired: ['Демо устарело', 'Срок анализа истёк или он уже удалён. Запустите проверку заново.'],
    article_exists: ['Пробная статья уже создавалась', 'На один анализ — одна пробная статья. Оставьте заявку — покажем больше на вашем проекте.'],
    generic: ['Что-то пошло не так', 'Попробуйте ещё раз позже или оставьте заявку.']
  };
  var RETRY = { net: 'Попробовать ещё раз', timeout_run: 'Подождать ещё', timeout_gen: 'Подождать ещё', expired: 'Запустить заново' };

  function kindFromProblem(r) {
    var c = codeOf(r);
    if (c === 'demo_rate_limited' || r.status === 429) return 'limit';
    if (c === 'demo_capacity') return 'capacity';
    if (c === 'demo_captcha_failed') return 'captcha';
    if (c === 'demo_not_found' || c === 'demo_expired' || r.status === 404 || r.status === 410) return 'expired';
    if (c === 'demo_article_exists') return 'article_exists';
    if (c === 'demo_url_forbidden') return 'forbidden';
    if (c === 'demo_analysis_failed') return 'analysis_failed';
    return 'generic';
  }

  var retryAction = null;
  function showError(kind, extra) {
    stopPoll();
    var m = ERR[kind] || ERR.generic;
    var d = m[1];
    if (kind === 'limit' && extra && extra.retryAfter > 0) {
      var mins = Math.ceil(extra.retryAfter / 60);
      d += ' Повторить можно примерно через ' + (mins >= 60 ? Math.ceil(mins / 60) + ' ч.' : mins + ' мин.');
    }
    $('hs-error-t').textContent = m[0];
    $('hs-error-d').textContent = d;
    var btn = $('hs-error-retry');
    retryAction = (extra && extra.retry) || null;
    btn.hidden = !retryAction;
    if (retryAction) btn.textContent = RETRY[kind] || 'Попробовать ещё раз';
    if (kind === 'expired') dropSession();
    goal('demo_error', { demo_error: kind });
    show('error');
    say(m[0] + '. ' + d);
  }

  /* ---------- состояние 1: ввод ссылки ---------- */
  // мягкая проверка «похоже на адрес»; настоящая — на сервере
  function normalizeUrl(raw) {
    var v = String(raw || '').trim();
    if (!v || /\s/.test(v) || v.indexOf('@') >= 0) return null;
    var withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : 'https://' + v;
    var u;
    try { u = new URL(withScheme); } catch (e) { return null; }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    var host = u.hostname.replace(/\.$/, '');
    if (host.indexOf('.') < 1 || host.length > 253) return null;
    return { url: withScheme, domain: host.replace(/^www\./i, '') };
  }

  function inputError(msg) {
    var e = $('hs-err');
    e.textContent = msg || '';
    e.hidden = !msg;
    $('hs-site').setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function setBusy(btn, on, busyText) {
    state.busy = on;
    btn.disabled = on;
    if (on) { btn._t = btn.textContent; if (busyText) btn.textContent = busyText; }
    else if (btn._t) { btn.textContent = btn._t; }
  }

  function startAnalysis(ev) {
    ev.preventDefault();
    if (state.busy) return;
    var n = normalizeUrl($('hs-site').value);
    if (!n) { inputError('Введите адрес сайта, например example.ru'); $('hs-site').focus(); return; }
    inputError('');
    // один ключ на одну и ту же отправку: двойной клик и повтор после сбоя сети не создают вторую сессию
    if (state.idem.url !== n.url) state.idem = { url: n.url, key: uuid() };
    var btn = $('hs-go');
    setBusy(btn, true, 'Отправляем…');
    goal('demo_url_submitted');
    call('POST', '/analyses', { body: { url: n.url, captchaToken: '' }, idem: state.idem.key }).then(function (r) {
      setBusy(btn, false);
      if (r.status === 202 && r.body && r.body.id && r.body.token) {
        state.id = r.body.id; state.token = r.body.token; state.domain = r.body.domain || n.domain;
        state.view = null; state.result = null; state.article = null; state.chosen = { phrase: '', platform: '' };
        state.idem = { url: '', key: '' };
        saveSession();
        enterRun();
        return;
      }
      var c = codeOf(r);
      if (c === 'demo_url_invalid') { inputError('Не удалось распознать адрес сайта. Введите адрес вида example.ru.'); $('hs-site').focus(); goal('demo_error', { demo_error: c }); return; }
      if (c === 'demo_url_forbidden') { inputError('Этот сайт нельзя анализировать. Введите адрес вашего собственного сайта.'); $('hs-site').focus(); goal('demo_error', { demo_error: c }); return; }
      if (c === 'demo_bad_request' || r.status === 400) { inputError('Не удалось отправить адрес. Проверьте его и попробуйте ещё раз.'); return; }
      if (c === 'demo_disabled') { show('off'); return; }
      showError(kindFromProblem(r), { retryAfter: r.retryAfter });
    }, function (e) {
      setBusy(btn, false);
      if (e && e.user) return;
      inputError('Не удалось связаться с сервером. Проверьте интернет и нажмите кнопку ещё раз.');
    });
  }

  /* ---------- опрос ---------- */
  function stopPoll() { if (poll) { clearTimeout(poll.timer); poll.dead = true; poll = null; } abortAll(); }
  function startPoll(kind, immediate) {
    stopPoll();
    poll = { kind: kind, started: Date.now(), n: 0, fails: 0, etag: '', timer: 0, dead: false };
    schedule(poll, immediate ? 0 : 1100);
  }
  // интервал: не чаще 1,1 с (сервер отвечает 429 чаще раза в секунду), плавно растёт до 3 с; подсказка сервера не короче; скрытая вкладка — 10 с
  function nextDelay(p) {
    if (document.hidden) return 10000;
    var d = Math.min(3000, 1100 + p.n * 250);
    var hint = state.view && state.view.poll && state.view.poll.intervalMs;
    if (hint && hint > d) d = Math.min(3000, hint);
    return d;
  }
  function schedule(p, delay) { p.timer = setTimeout(function () { tick(p); }, delay); }

  function tick(p) {
    if (p.dead) return;
    if (p.kind !== 'freq' && Date.now() - p.started > WAIT_LIMIT_MS) {
      showError(p.kind === 'gen' ? 'timeout_gen' : 'timeout_run', { retry: function () { startPoll(p.kind, true); resumeScreen(p.kind); } });
      return;
    }
    if (p.kind === 'freq' && Date.now() - p.started > FREQ_WAIT_MS) { stopPoll(); return; }
    call('GET', '/analyses/' + encodeURIComponent(state.id), { token: state.token, etag: p.etag }).then(function (r) {
      if (p.dead) return;
      p.n += 1;
      if (r.status === 304) { p.fails = 0; schedule(p, nextDelay(p)); return; }
      if (r.status === 429) { schedule(p, Math.max(2000, (r.retryAfter || 2) * 1000)); return; }
      if (r.status === 200 && r.body) { p.fails = 0; p.etag = r.etag; applyView(r.body, p); return; }
      if (r.status >= 500 && codeOf(r) !== 'demo_disabled') { failNet(p); return; }
      if (codeOf(r) === 'demo_disabled') { stopPoll(); show('off'); return; }
      stopPoll();
      showError(kindFromProblem(r));
    }, function (e) {
      if (p.dead || (e && e.user)) return;
      failNet(p);
    });
  }

  // три сетевые ошибки подряд с нарастающей паузой, затем понятное сообщение с повтором
  function failNet(p) {
    p.fails += 1;
    if (p.fails >= 3) {
      var kind = p.kind;
      showError('net', { retry: function () { startPoll(kind, true); resumeScreen(kind); } });
      return;
    }
    schedule(p, Math.min(8000, 1000 * Math.pow(2, p.fails)));
  }
  function resumeScreen(kind) {
    if (kind === 'gen') show('gen', { quiet: false });
    else if (kind === 'run') show('run');
    else if (kind === 'freq') show(state.result ? 'result' : 'run');
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && poll && !poll.dead) { clearTimeout(poll.timer); schedule(poll, 300); }
  });

  /* ---------- разбор ответа сервера ---------- */
  function hasPending(res) {
    return !!res && res.phrases.some(function (p) { return p.frequencyState === 'pending'; });
  }

  function applyView(v, p) {
    state.view = v;
    if (v.domain) state.domain = v.domain;
    var st = v.status;
    if (v.result) state.result = v.result;

    if (st === 'needs_niche') { stopPoll(); show('niche'); say('Сайт не удалось прочитать. Напишите нишу своими словами.'); return; }
    if (st === 'blocked') { showError('forbidden'); return; }
    if (st === 'failed') {
      if (v.error && v.error.code === 'demo_article_failed' && state.result) { articleFailed(); return; }
      showError('analysis_failed');
      return;
    }
    if (st === 'ready') {
      if (state.screen !== 'result' && state.screen !== 'topic') {
        renderResult(state.result);
        show('result');
        goal('demo_results_shown');
        say('Первые результаты готовы.');
      } else {
        refreshFreqs();
      }
      if (hasPending(state.result)) {
        if (p.kind !== 'freq') { startPoll('freq'); return; }
        schedule(p, nextDelay(p));
      } else { stopPoll(); }
      return;
    }
    if (st === 'article_queued' || st === 'article_writing') {
      if (state.result && !$('hs-dirs').firstChild) renderResult(state.result);
      renderGen(st);
      if (state.screen !== 'gen') {
        if (v.article) state.chosen = { phrase: v.article.phrase, platform: v.article.platform };
        $('hs-sel-gen').textContent = state.chosen.phrase;
        $('hs-sel-gen-p').textContent = plainPlatform(state.chosen.platform);
        show('gen');
      }
      schedule(p, nextDelay(p));
      return;
    }
    if (st === 'article_ready') {
      stopPoll();
      if (state.result && !$('hs-dirs').firstChild) renderResult(state.result);
      state.article = v.article;
      renderArticle(v.article);
      show('article');
      goal('demo_article_ready');
      say('Пробная статья готова.');
      return;
    }
    // идёт анализ: queued, reading, profiling, competitors, phrases, measuring
    if (state.screen !== 'run') { $('hs-domain-run').textContent = state.domain; show('run'); }
    renderRun(v);
    schedule(p, nextDelay(p));
  }

  function articleFailed() {
    stopPoll();
    renderTopics();
    var e = $('hs-topic-err');
    e.textContent = 'Не получилось написать статью. Попробуйте другую фразу или оставьте заявку — покажем статью вручную.';
    e.hidden = false;
    $('hs-start').disabled = false;
    show('topic');
    goal('demo_error', { demo_error: 'demo_article_failed' });
    say('Не получилось написать статью.');
  }

  /* ---------- состояние 2: идёт анализ ---------- */
  function setBar(id, pct) {
    var bar = $(id);
    var cur = parseInt(bar.getAttribute('aria-valuenow'), 10) || 0;
    pct = Math.max(cur, Math.min(100, Math.round(pct) || 0)); // полоса только растёт
    bar.setAttribute('aria-valuenow', String(pct));
    bar.firstElementChild.style.width = pct + '%';
  }

  function renderSteps(list, defs) {
    clear(list);
    defs.forEach(function (d, i) {
      var cls = 'hs-step' + (d.state === 'done' ? ' is-on is-done' : d.state === 'doing' ? ' is-on' : d.state === 'skipped' ? ' is-skip' : '');
      var li = el('li', cls);
      if (d.state === 'doing') li.setAttribute('aria-current', 'step');
      var mark = d.state === 'done' ? '✓' : d.state === 'doing' ? '…' : d.state === 'skipped' ? '–' : String(i + 1);
      li.appendChild(el('span', 'hs-step__dot', mark));
      var t = (d.icon ? d.icon + ' ' : '') + d.label + (d.state === 'skipped' ? ' — пропущено' : '');
      li.appendChild(el('span', 'hs-step__t', t));
      list.appendChild(li);
    });
  }

  var lastDoing = '';
  function renderRun(v) {
    var steps = (v.steps || []).map(function (s) { return { icon: STEP_ICONS[s.key] || '', label: s.label, state: s.state }; });
    renderSteps($('hs-run-steps'), steps);
    setBar('hs-bar-run', v.progress || 0);
    var q = $('hs-queue');
    if (v.queue != null && v.queue > 0) { q.textContent = 'Перед вами в очереди: ' + v.queue; q.hidden = false; } else { q.hidden = true; }
    var doing = steps.filter(function (s) { return s.state === 'doing'; })[0];
    var label = doing ? doing.label : (v.queue > 0 ? q.textContent : '');
    if (label && label !== lastDoing) { lastDoing = label; say(label + '…'); }
  }

  function enterRun() {
    lastDoing = '';
    $('hs-domain-run').textContent = state.domain;
    setBar0('hs-bar-run');
    clear($('hs-run-steps'));
    $('hs-queue').hidden = true;
    show('run');
    say('Анализируем сайт ' + state.domain);
    startPoll('run');
  }
  function setBar0(id) { var b = $(id); b.setAttribute('aria-valuenow', '0'); b.firstElementChild.style.width = '0'; }

  /* ---------- состояние 3: первые результаты ---------- */
  function listItems(ul, items, emptyText) {
    clear(ul);
    if (!items || !items.length) { ul.appendChild(el('li', null, emptyText)); return; }
    items.forEach(function (t) { ul.appendChild(el('li', null, t)); });
  }

  function freqText(p) {
    if (p.frequencyState === 'measured' && typeof p.frequency === 'number' && p.frequency >= 0) return fmt(p.frequency);
    if (p.frequencyState === 'pending') return 'считаем…';
    return 'частота уточняется';
  }
  function freqTip(p) {
    if (p.frequencyState === 'measured' && typeof p.frequency === 'number') {
      return 'по данным Яндекс Вордстата' + (p.measuredAt ? ', замер ' + p.measuredAt : '');
    }
    return '';
  }
  function freqAria(p) {
    if (p.frequencyState === 'measured' && typeof p.frequency === 'number') return fmt(p.frequency) + ' показов в месяц ' + freqTip(p);
    return freqText(p);
  }

  function coveredIcon(p) { return p.covered === true ? '✅' : p.covered === false ? '💡' : ''; }
  function coveredText(p) { return p.covered === true ? 'есть материал на сайте' : p.covered === false ? 'материала нет' : ''; }

  function rowLabel(p) {
    var parts = [p.phrase, freqAria(p)];
    if (p.covered != null) parts.push(coveredText(p) + ' по прочитанным страницам');
    return parts.join(', ');
  }

  // обновление частот на месте, без перерисовки панелей (числа появляются при следующем опросе)
  function refreshFreqs() {
    var res = state.result;
    if (!res) return;
    var max = 0;
    res.phrases.forEach(function (p) { if (p.frequencyState === 'measured' && p.frequency > max) max = p.frequency; });
    Array.prototype.forEach.call(root.querySelectorAll('[data-freq]'), function (n) {
      var p = res.phrases[+n.getAttribute('data-freq')];
      if (!p) return;
      n.textContent = freqText(p);
      var measured = p.frequencyState === 'measured' && typeof p.frequency === 'number';
      n.classList.toggle('is-wait', !measured);
      var tip = freqTip(p);
      if (tip) n.setAttribute('data-tip', tip); else n.removeAttribute('data-tip');
      var btn = n.closest('button');
      if (btn) btn.setAttribute('aria-label', rowLabel(p));
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-bar]'), function (b) {
      var p = res.phrases[+b.getAttribute('data-bar')];
      var measured = p && p.frequencyState === 'measured' && typeof p.frequency === 'number' && max > 0;
      b.style.width = measured ? Math.max(3, Math.round(p.frequency / max * 100)) + '%' : '0';
    });
  }

  function groupPhrases(res) {
    var groups = [], byName = {};
    function group(name) {
      if (!byName[name]) { byName[name] = { name: name, items: [] }; groups.push(byName[name]); }
      return byName[name];
    }
    (res.directions || []).forEach(function (d) { group(d.name); });
    res.phrases.forEach(function (p, i) { group(p.direction || 'Другое').items.push(i); });
    return groups.filter(function (g) { return g.items.length; });
  }

  function badgeFor(res, g) {
    var known = g.items.filter(function (i) { return res.phrases[i].covered != null; });
    if (!known.length) return null;
    var yes = known.filter(function (i) { return res.phrases[i].covered === true; }).length;
    if (yes === known.length) return ['✅ Закрыто', 'hs-badge hs-badge--done'];
    if (yes === 0) return ['💡 Точка роста', 'hs-badge hs-badge--grow'];
    return ['✍️ Частично', 'hs-badge'];
  }

  function renderResult(res) {
    if (!res) return;
    $('hs-domain-res').textContent = state.domain;
    var brand = res.brand || {};
    $('hs-brand').textContent = brand.name || state.domain;
    $('hs-brand-line').textContent = brand.line || '';
    $('hs-niche').textContent = res.niche || 'не определена';
    $('hs-niche-t').textContent = res.niche || 'Ниша';
    listItems($('hs-audience'), res.audience, 'не определена');
    var off = clear($('hs-offers'));
    if (res.offers && res.offers.length) res.offers.forEach(function (o) { off.appendChild(el('span', 'chip', o)); });
    else off.appendChild(el('span', 'hs-card__s', 'не определены'));

    var comp = clear($('hs-comp'));
    (res.competitors || []).forEach(function (c) {
      var li = el('li');
      li.appendChild(el('b', null, c.domain));
      if (c.why) li.appendChild(el('span', null, c.why));
      comp.appendChild(li);
    });
    $('hs-comp-card').hidden = !comp.firstChild;

    var anyCovered = res.phrases.some(function (p) { return p.covered != null; });
    $('hs-legend').hidden = !anyCovered;

    var dirs = clear($('hs-dirs'));
    groupPhrases(res).forEach(function (g) {
      var dir = el('div', 'hs-dir');
      var box = el('div', 'hs-dir__box');
      box.appendChild(el('div', 'hs-dir__n', g.name));
      var cnt = g.items.length;
      box.appendChild(el('div', 'hs-card__s', cnt + ' ' + (cnt % 10 === 1 && cnt % 100 !== 11 ? 'фраза' : (cnt % 10 >= 2 && cnt % 10 <= 4 && (cnt % 100 < 12 || cnt % 100 > 14) ? 'фразы' : 'фраз'))));
      var b = badgeFor(res, g);
      if (b) box.appendChild(el('span', b[1], b[0]));
      dir.appendChild(box);
      var kws = el('div', 'hs-kws');
      g.items.forEach(function (i) {
        var p = res.phrases[i];
        var row = el('button', 'hs-kw');
        row.type = 'button';
        row.setAttribute('data-pick', String(i));
        row.appendChild(el('span', 'hs-kw__i', coveredIcon(p)));
        row.lastChild.setAttribute('aria-hidden', 'true');
        row.appendChild(el('span', 'hs-kw__n', p.phrase));
        var bar = el('span', 'hs-kw__bar'); var bi = el('i'); bi.setAttribute('data-bar', String(i)); bar.appendChild(bi);
        row.appendChild(bar);
        var f = el('span', 'hs-kw__f'); f.setAttribute('data-freq', String(i));
        row.appendChild(f);
        kws.appendChild(row);
      });
      dir.appendChild(kws);
      dirs.appendChild(dir);
    });
    pickDefaultPhrase();
    refreshFreqs();
  }

  /* ---------- состояние 4: выбор фразы и площадки ---------- */
  function pickDefaultPhrase() {
    var res = state.result;
    if (!res || !res.phrases.length) return;
    var has = res.phrases.some(function (p) { return p.phrase === state.chosen.phrase; });
    if (has) return;
    var best = 0, bestF = -1;
    res.phrases.forEach(function (p, i) {
      if (p.frequencyState === 'measured' && typeof p.frequency === 'number' && p.frequency > bestF) { best = i; bestF = p.frequency; }
    });
    state.chosen.phrase = res.phrases[best].phrase;
  }

  function platformList() {
    var l = state.cfg && state.cfg.platforms && state.cfg.platforms.length ? state.cfg.platforms : DEFAULT_PLATFORMS;
    return l;
  }

  function renderTopics() {
    var res = state.result;
    if (!res) return;
    pickDefaultPhrase();
    var list = clear($('hs-topics'));
    var selIdx = 0;
    res.phrases.forEach(function (p, i) { if (p.phrase === state.chosen.phrase) selIdx = i; });
    res.phrases.forEach(function (p, i) {
      var sel = i === selIdx;
      var b = el('button', 'hs-topic' + (sel ? ' is-sel' : ''));
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(sel));
      b.tabIndex = sel ? 0 : -1;
      b.setAttribute('data-topic', String(i));
      var m = el('span', 'hs-topic__m', sel ? '✓' : ''); m.setAttribute('aria-hidden', 'true');
      b.appendChild(m);
      b.appendChild(el('span', 'hs-topic__n', p.phrase));
      if (p.covered != null) { var h = el('span', 'hs-topic__h', coveredIcon(p) + ' ' + coveredText(p)); b.appendChild(h); }
      var f = el('span', 'hs-topic__f'); f.setAttribute('data-freq', String(i));
      b.appendChild(f);
      list.appendChild(b);
    });

    var plats = clear($('hs-plats'));
    var pl = platformList();
    if (pl.indexOf(state.chosen.platform) < 0) state.chosen.platform = pl[0];
    pl.forEach(function (name) {
      var sel = name === state.chosen.platform;
      var b = el('button', 'hs-plat' + (sel ? ' is-sel' : ''));
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(sel));
      b.tabIndex = sel ? 0 : -1;
      b.setAttribute('data-plat', name);
      var l = PLATFORM_LABELS[name];
      var ic = el('span', null, l ? l[0] : '📝'); ic.setAttribute('aria-hidden', 'true');
      b.appendChild(ic);
      var tx = el('span');
      tx.appendChild(document.createTextNode(l ? l[1] : name));
      if (l) tx.appendChild(el('small', null, l[2]));
      b.appendChild(tx);
      plats.appendChild(b);
    });
    var others = Object.keys(PLATFORM_LABELS).filter(function (k) { return pl.indexOf(k) < 0; }).map(plainPlatform);
    var more = $('hs-plat-more');
    more.hidden = !others.length;
    more.textContent = others.length ? 'В платформе также доступны: ' + others.join(', ') + '.' : '';
    $('hs-topic-err').hidden = true;
    refreshFreqs();
  }

  function selectRadio(group, attr, btn) {
    Array.prototype.forEach.call(group.querySelectorAll('[role="radio"]'), function (b) {
      var on = b === btn;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      b.classList.toggle('is-sel', on);
      var m = b.querySelector('.hs-topic__m');
      if (m) m.textContent = on ? '✓' : '';
    });
    var v = btn.getAttribute(attr);
    if (attr === 'data-topic') state.chosen.phrase = state.result.phrases[+v].phrase; else state.chosen.platform = v;
    saveSession();
  }

  function radioKeys(e) {
    var b = e.target.closest('[role="radio"]');
    if (!b) return;
    var group = b.parentNode, items = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
    var i = items.indexOf(b), n = items.length, to = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = (i + 1) % n;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = (i - 1 + n) % n;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = n - 1;
    if (to < 0) return;
    e.preventDefault();
    items[to].focus();
    selectRadio(group, group.id === 'hs-topics' ? 'data-topic' : 'data-plat', items[to]);
  }
  $('hs-topics').addEventListener('keydown', radioKeys);
  $('hs-plats').addEventListener('keydown', radioKeys);
  $('hs-topics').addEventListener('click', function (e) { var b = e.target.closest('[data-topic]'); if (b) selectRadio($('hs-topics'), 'data-topic', b); });
  $('hs-plats').addEventListener('click', function (e) { var b = e.target.closest('[data-plat]'); if (b) selectRadio($('hs-plats'), 'data-plat', b); });

  function startArticle() {
    if (state.busy) return;
    var phrase = state.chosen.phrase, platform = state.chosen.platform;
    if (!phrase || !platform) return;
    var btn = $('hs-start'), err = $('hs-topic-err');
    err.hidden = true;
    setBusy(btn, true, 'Отправляем…');
    goal('demo_phrase_chosen');
    goal('demo_article_requested');
    call('POST', '/analyses/' + encodeURIComponent(state.id) + '/article', {
      token: state.token, body: { phrase: phrase, platform: platform }, idem: 'art-' + state.id.slice(0, 40)
    }).then(function (r) {
      setBusy(btn, false);
      if (r.status === 202) {
        saveSession();
        enterGen();
        return;
      }
      var c = codeOf(r);
      if (c === 'demo_phrase_unknown' || c === 'demo_platform_forbidden' || c === 'demo_bad_request') {
        err.textContent = c === 'demo_platform_forbidden' ? 'Эта площадка недоступна в демо. Выберите другую.' : 'Такой фразы нет в результатах. Выберите фразу из списка.';
        err.hidden = false;
        return;
      }
      if (c === 'demo_conflict') { err.textContent = 'Сейчас это действие недоступно. Дождитесь результатов анализа и попробуйте ещё раз.'; err.hidden = false; return; }
      if (c === 'demo_disabled') { show('off'); return; }
      showError(kindFromProblem(r), { retryAfter: r.retryAfter });
    }, function (e) {
      setBusy(btn, false);
      if (e && e.user) return;
      err.textContent = 'Не удалось связаться с сервером. Проверьте интернет и нажмите кнопку ещё раз.';
      err.hidden = false;
    });
  }

  /* ---------- состояние 5: создаём статью ---------- */
  function renderGen(status) {
    var cur = status === 'article_writing' ? 1 : 0;
    renderSteps($('hs-gen-steps'), GEN_STEPS.map(function (g, i) {
      return { icon: g[0], label: g[1], state: i < cur ? 'done' : i === cur ? 'doing' : 'todo' };
    }));
    setBar('hs-bar-gen', cur === 0 ? 15 : 60);
    var label = GEN_STEPS[cur][1];
    if (label !== lastDoing) { lastDoing = label; say(label + '…'); }
  }
  function enterGen() {
    lastDoing = '';
    $('hs-sel-gen').textContent = state.chosen.phrase;
    $('hs-sel-gen-p').textContent = plainPlatform(state.chosen.platform);
    setBar0('hs-bar-gen');
    renderGen('article_queued');
    show('gen');
    startPoll('gen');
  }

  /* ---------- состояние 6: пробная статья ---------- */
  function articleBlocks(a, limit) {
    var wrap = document.createDocumentFragment(), ul = null, shown = 0;
    (a.blocks || []).forEach(function (b) {
      if (limit && shown >= limit) return;
      shown += 1;
      if (b.type === 'li') {
        if (!ul) { ul = el('ul'); wrap.appendChild(ul); }
        ul.appendChild(el('li', null, b.text));
        return;
      }
      ul = null;
      wrap.appendChild(el(b.type === 'h2' ? 'h4' : b.type === 'h3' ? 'h5' : 'p', null, b.text));
    });
    return wrap;
  }

  function fadeOn() { return ARTICLE_FADE && !state.leadSent; }

  function renderArticle(a) {
    if (!a) return;
    var chips = clear($('hs-art-chips'));
    chips.appendChild(el('span', 'chip', '📍 ' + plainPlatform(a.platform)));
    chips.appendChild(el('span', 'chip', '🔎 Фраза: ' + a.phrase));
    if (a.words) chips.appendChild(el('span', 'chip', '📝 ' + fmt(a.words) + ' ' + wordsWord(a.words)));
    $('hs-art-title').textContent = a.title || '';
    var body = clear($('hs-art-body'));
    body.appendChild(articleBlocks(a, fadeOn() ? FADE_BLOCKS : 0));
    $('hs-art').classList.toggle('is-fade', fadeOn());
    $('hs-art-fade').hidden = !fadeOn();
    $('hs-copy').hidden = fadeOn();
  }

  function articleText(a) {
    var out = [a.title || ''];
    (a.blocks || []).forEach(function (b) {
      out.push(b.type === 'li' ? '— ' + b.text : b.text);
    });
    return out.join('\n\n');
  }

  function copyArticle() {
    var a = state.article;
    if (!a) return;
    var text = articleText(a), btn = $('hs-copy');
    function ok() {
      btn.textContent = '✅ Скопировано';
      say('Текст скопирован');
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () { btn.textContent = '📋 Скопировать текст'; }, 2500);
    }
    function legacy() {
      var ta = el('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { if (document.execCommand('copy')) ok(); } catch (e) { /* нет доступа к буферу */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, legacy); else legacy();
  }

  /* ---------- боковое: нужна ниша ---------- */
  function submitNiche(ev) {
    ev.preventDefault();
    if (state.busy) return;
    var inp = $('hs-niche-inp'), err = $('hs-niche-err');
    var n = inp.value.replace(/\s+/g, ' ').trim();
    if (n.length < 3 || n.length > 200) {
      err.textContent = 'Опишите нишу от 3 до 200 знаков, например «клининг квартир».';
      err.hidden = false; inp.setAttribute('aria-invalid', 'true'); inp.focus();
      return;
    }
    err.hidden = true; inp.setAttribute('aria-invalid', 'false');
    var btn = $('hs-niche-go');
    setBusy(btn, true, 'Отправляем…');
    call('PUT', '/analyses/' + encodeURIComponent(state.id) + '/niche', { token: state.token, body: { niche: n } }).then(function (r) {
      setBusy(btn, false);
      if (r.status === 202) { enterRun(); return; }
      var c = codeOf(r);
      if (r.status === 422 || c === 'demo_bad_request') { err.textContent = 'Опишите нишу от 3 до 200 знаков.'; err.hidden = false; inp.focus(); return; }
      if (c === 'demo_conflict') { startPoll('run', true); show('run'); return; }
      showError(kindFromProblem(r));
    }, function (e) {
      setBusy(btn, false);
      if (e && e.user) return;
      err.textContent = 'Не удалось связаться с сервером. Попробуйте ещё раз.';
      err.hidden = false;
    });
  }

  /* ---------- сброс и отмена ---------- */
  function resetToInput(opts) {
    opts = opts || {};
    var id = state.id, token = state.token;
    stopPoll();
    if (opts.del && id && token) { call('DELETE', '/analyses/' + encodeURIComponent(id), { token: token }).then(null, function () {}); }
    dropSession();
    state.id = ''; state.token = ''; state.view = null; state.result = null; state.article = null;
    state.chosen = { phrase: '', platform: '' }; state.idem = { url: '', key: '' };
    state.busy = false;
    clear($('hs-dirs')); clear($('hs-run-steps'));
    resetLead();
    $('hs-lead-form').reset();
    $('hs-go').disabled = false;
    inputError('');
    show('input');
    $('hs-site').focus();
  }

  /* ---------- заявка (форма внизу) ---------- */
  function resetLead() {
    state.leadSent = false;
    $('hs-lead-form').hidden = false;
    $('hs-lead-done').hidden = true;
    $('hs-lead-err').hidden = true;
  }

  function openLead() {
    goal('demo_lead_open');
    var box = $('hs-lead-box');
    box.hidden = false;
    var f = $('hs-lead-form').elements;
    if (!f.site.value) f.site.value = state.domain || '';
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var focusEl = state.leadSent ? $('hs-lead-done-t') : f.name;
    setTimeout(function () { try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); } }, 350);
  }

  function leadMessage() {
    var lines = [];
    if (state.id) lines.push('ID демо: ' + state.id);
    if (state.chosen.phrase) lines.push('Фраза: ' + state.chosen.phrase);
    if (state.chosen.platform) lines.push('Площадка: ' + plainPlatform(state.chosen.platform));
    return lines.join('\n');
  }

  function submitLead(ev) {
    ev.preventDefault();
    var form = $('hs-lead-form'), f = form.elements, err = $('hs-lead-err'), btn = $('hs-lead-go');
    if (state.busy) return;
    var phone = f.phone.value.replace(/\D/g, '');
    var problem = '';
    if (!f.name.value.trim()) problem = 'Укажите имя.';
    else if (phone.length < 10) problem = 'Укажите телефон, например +7 900 000-00-00.';
    else if (!f.agree.checked) problem = 'Нужно согласие на обработку персональных данных.';
    if (problem) { err.textContent = problem; err.hidden = false; return; }
    err.hidden = true;
    setBusy(btn, true, 'Отправляем…');
    fetch('/lead-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form: 'Демо на сайте', name: f.name.value, phone: f.phone.value, site: f.site.value,
        message: leadMessage(), website: f.website.value
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      setBusy(btn, false);
      state.leadSent = true;
      goal('demo_lead_sent');
      form.hidden = true;
      $('hs-lead-done').hidden = false;
      $('hs-lead-done-t').focus();
      say('Заявка отправлена. Свяжемся в рабочее время.');
      if (state.screen === 'article' && state.article) renderArticle(state.article); // снять затухание текста
    }).catch(function () {
      setBusy(btn, false);
      err.textContent = 'Не удалось отправить заявку. Позвоните нам: +7 996 924-16-48';
      err.hidden = false;
    });
  }

  /* ---------- события ---------- */
  $('hs-form').addEventListener('submit', startAnalysis);
  $('hs-site').addEventListener('input', function () { inputError(''); });
  $('hs-niche-form').addEventListener('submit', submitNiche);
  $('hs-start').addEventListener('click', startArticle);
  $('hs-copy').addEventListener('click', copyArticle);
  $('hs-cancel').addEventListener('click', function () { resetToInput({ del: true }); });
  $('hs-lead-form').addEventListener('submit', submitLead);
  $('hs-error-retry').addEventListener('click', function () { if (retryAction) retryAction(); });

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-hs-go], [data-hs-lead], [data-hs-reset], [data-pick]');
    if (!t) return;
    if (t.hasAttribute('data-hs-lead')) { openLead(); return; }
    if (t.hasAttribute('data-hs-reset')) { resetToInput(); return; }
    if (t.hasAttribute('data-pick')) {
      state.chosen.phrase = state.result.phrases[+t.getAttribute('data-pick')].phrase;
      renderTopics();
      show('topic');
      return;
    }
    var to = t.getAttribute('data-hs-go');
    if (to === 'topic') { renderTopics(); show('topic'); }
    else if (to === 'result') show('result');
  });

  /* ---------- запуск: сначала конфиг, без него — спокойная карточка вместо живого блока ---------- */
  function boot() {
    var go = $('hs-go');
    go.disabled = true;
    var done = false;
    function off() { if (done) return; done = true; show('off', { quiet: true }); }
    var guard = setTimeout(off, 8000);
    call('GET', '/config').then(function (r) {
      clearTimeout(guard);
      if (done) return;
      if (r.status !== 200 || !r.body || r.body.enabled !== true) { off(); return; }
      done = true;
      state.cfg = r.body;
      go.disabled = false;
      var saved = loadSession();
      if (saved) {
        state.id = saved.id; state.token = saved.token; state.domain = saved.domain || '';
        state.chosen = { phrase: saved.phrase || '', platform: saved.platform || '' };
        $('hs-domain-run').textContent = state.domain;
        show('run', { quiet: true });
        startPoll('run', true);
      }
    }, function () { clearTimeout(guard); off(); });
  }
  boot();
})();
