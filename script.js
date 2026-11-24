/* ============ Настройки страницы ============ */
// Номер счётчика Яндекс Метрики для целей первого экрана. null — цели не отправляются. Сам счётчик подключается отдельно (код счётчика в страницу).
var METRIKA_ID = null;
// Счётчик посещений Umami (свой сервер, без cookie). Пока оба значения пусты, счётчик не подключается.
// src - https-адрес script.js на нашем сервере Umami, id - идентификатор сайта «лендинг» из Umami.
var UMAMI = { src: '', id: '' };
(function () {
  'use strict';
  if (!UMAMI.src || !UMAMI.id || !/^https:\/\//.test(UMAMI.src)) return;
  var s = document.createElement('script');
  s.defer = true;
  s.src = UMAMI.src;
  s.setAttribute('data-website-id', UMAMI.id);
  document.head.appendChild(s);
})();

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
  // Как в приложении (tariff.go): пакет «Старт» — 90 кредитов за 10 000 ₽, кредит сверх пакета — 150 ₽
  var PACK_PRICE = 10000, MIN_CREDITS = 90, CREDIT_PRICE = 150, STEP = 5, MAX_POSTS = 100;
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
      var n = getN(row), fee = n > 0 ? Number(row.dataset.fee || 0) : 0, sum = n * Number(row.dataset.cr) + fee;
      credits += sum; pubs += n;
      row.querySelector('[data-count]').textContent = n;
      row.querySelector('[data-sub]').textContent = '= ' + sum + ' ' + plural(sum) + (fee ? ' с подключением' : '');
    });
    var total = Math.max(credits, MIN_CREDITS);
    document.getElementById('calc-pubs').textContent = pubs;
    document.getElementById('calc-credits').textContent = total;
    document.getElementById('calc-price').textContent = fmt(PACK_PRICE + (total - MIN_CREDITS) * CREDIT_PRICE);
    document.getElementById('calc-below').hidden = credits >= MIN_CREDITS;
  }

  rows.forEach(function (row) {
    var range = row.querySelector('input[type=range]');
    range.addEventListener('input', recalc);
    row.querySelector('[data-minus]').addEventListener('click', function () { setN(row, getN(row) - STEP); });
    row.querySelector('[data-plus]').addEventListener('click', function () { setN(row, getN(row) + STEP); });
  });
  // «Рекомендуем»: значения из data-rec (по 30 на сайт и в Телеграм)
  if (rows.length) document.getElementById('calc-rec').addEventListener('click', function () {
    rows.forEach(function (row) { row.querySelector('input[type=range]').value = row.dataset.rec; });
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

/* ============ Первый экран: ссылка на сайт → контакты → переход на платформу ============
   Шаг 1 — адрес сайта, шаг 2 — имя, телефон, почта и согласие. Отправка: POST /api/v1/public/signup (тот же домен);
   при успехе человек уходит на платформу по адресу из ответа. Тексты с сервера на страницу не выводятся. */
(function () {
  'use strict';
  var root = document.getElementById('hs');
  if (!root) return;

  var SIGNUP_API = '/api/v1/public/signup';

  /* ---------- метрика: только имя цели и код ошибки, без адреса сайта, имени, телефона и почты ---------- */
  function goal(name, params) {
    try {
      if (METRIKA_ID && typeof window.ym === 'function') {
        if (params) window.ym(METRIKA_ID, 'params', params);
        window.ym(METRIKA_ID, 'reachGoal', name);
      }
      if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, params);
    } catch (e) { /* счётчик не должен ломать страницу */ }
  }
  var CONTACT_MAIL = 'info@pro-technologii.ru';
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var FIELD_IDS = ['hs-site', 'hs-name', 'hs-phone', 'hs-email', 'hs-consent', 'hs-general'];
  var URL_RE = /^(?:https?:\/\/)?(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}\p{N}-]{2,}(?::\d{2,5})?(?:[\/?#]\S*)?$/u;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var FIELD_ERR = {
    invalid_phone: ['hs-phone', ''],  // текст зависит от режима ввода, см. phoneProblem()
    invalid_email: ['hs-email', 'Проверьте адрес почты, например ivan@ваш-сайт.ru.'],
    consent_required: ['hs-consent', 'Нужно согласие, чтобы продолжить.']
  };

  var panels = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-hs]'), function (p) { panels[p.getAttribute('data-hs')] = p; });
  var state = { url: '', busy: false };
  var phoneDigits = 0;

  function $(id) { return document.getElementById(id); }
  function show(name) {
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
    var h = panels[name].querySelector('[data-hs-focus]');
    if (h) h.focus({ preventScroll: true });
  }

  /* ошибка у поля: текст в абзаце под ним, у поля aria-invalid; сообщение — строка или узел (со ссылкой) */
  function setError(id, msg) {
    var field = $(id), box = $(id + '-err');
    if (field) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    box.textContent = '';
    if (msg) box.appendChild(typeof msg === 'string' ? document.createTextNode(msg) : msg);
    box.hidden = !msg;
  }
  function link(href, text) {
    var a = document.createElement('a');
    a.href = href; a.textContent = text;
    return a;
  }
  function textWithLink(before, href, linkText, after) {
    var f = document.createDocumentFragment();
    f.appendChild(document.createTextNode(before));
    f.appendChild(link(href, linkText));
    if (after) f.appendChild(document.createTextNode(after));
    return f;
  }

  /* ---------- шаг 1: адрес сайта ---------- */
  function normalizeUrl(raw) {
    var v = (raw || '').trim();
    if (!URL_RE.test(v)) return '';
    return /^https?:\/\//i.test(v) ? v : 'https://' + v;
  }

  function submitUrl(ev) {
    ev.preventDefault();
    var site = $('hs-site');
    var url = normalizeUrl(site.value);
    if (!url) { setError('hs-site', 'Введите адрес сайта, например example.ru'); site.focus(); return; }
    setError('hs-site', '');
    state.url = url;
    $('hs-site-name').textContent = url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    goal('signup_url_submitted');
    show('contacts');
  }

  /* ---------- телефон ----------
     Российский режим (по умолчанию, ввод 7/8/9… или +7): маска +7 (900) 123-45-67, наружу +7 и 10 цифр.
     Международный режим: «+» и первая цифра не 7 (+44, +1, +380…): без жёсткой маски, до 15 цифр
     с пробелами по группам, наружу «+» и все цифры (формат E.164, как ждёт сервер). */
  var PHONE_INTL_MAX = 15, PHONE_INTL_MIN = 8;
  var CC3_RE = /^(2[1-69]|3[578]|42|50|59|6[789]|8[0578]|9[679])/;  // коды стран из трёх цифр

  function phoneMask(digits) {
    if (!digits) return '';
    var s = '+7 (' + digits.slice(0, 3);
    if (digits.length > 3) s += ') ' + digits.slice(3, 6);
    if (digits.length > 6) s += '-' + digits.slice(6, 8);
    if (digits.length > 8) s += '-' + digits.slice(8, 10);
    return s;
  }
  /* международный номер: +44 207 946 0958 → «+44 207 946 095 8»: код страны, дальше группы по три */
  function intlMask(digits) {
    var cc = digits.charAt(0) === '1' ? 1 : (CC3_RE.test(digits) ? 3 : 2);
    var parts = [digits.slice(0, cc)];
    for (var i = cc; i < digits.length; i += 3) parts.push(digits.slice(i, i + 3));
    // одинокая последняя цифра присоединяется к предыдущей группе: +44 207 946 0958, а не «…095 8»
    if (parts.length > 2 && parts[parts.length - 1].length === 1) { var one = parts.pop(); parts[parts.length - 1] += one; }
    return '+' + parts.join(' ');
  }
  /* что ввёл пользователь: режим ('ru' | 'intl') и цифры без кода страны (ru) или с ним (intl) */
  function parsePhone(raw) {
    var all = raw.replace(/\D/g, '');
    if (raw.trim().charAt(0) === '+' && all.charAt(0) !== '7') {
      return { mode: 'intl', d: all.slice(0, PHONE_INTL_MAX) };
    }
    var d = all;
    if (d.charAt(0) === '7' || d.charAt(0) === '8') d = d.slice(1);
    return { mode: 'ru', d: d.slice(0, 10), plus: raw.trim().charAt(0) === '+' };
  }
  function onPhoneInput(ev) {
    var inp = ev.target;
    var raw = inp.value;
    var p = parsePhone(raw);
    if (p.mode === 'intl') {
      var out = p.d ? intlMask(p.d) : '+';
      // правка в середине: каретка остаётся после той же цифры, а не прыгает в конец
      var caret = inp.selectionStart;
      if (caret != null && caret < raw.length) {
        var before = raw.slice(0, caret).replace(/\D/g, '').length, pos = 0, seen = 0;
        if (before > p.d.length) before = p.d.length;
        while (pos < out.length && seen < before) { if (/\d/.test(out.charAt(pos))) seen++; pos++; }
        inp.value = out;
        try { inp.setSelectionRange(Math.max(pos, 1), Math.max(pos, 1)); } catch (e) { /* каретка не критична */ }
      } else {
        inp.value = out;
      }
      phoneDigits = p.d.length;
    } else {
      var d = p.d;
      // стирание символа маски (скобка, пробел, дефис) не меняет цифры: тогда убираем последнюю цифру
      if (ev.inputType === 'deleteContentBackward' && d.length === phoneDigits && d.length) d = d.slice(0, -1);
      phoneDigits = d.length;
      // «+7» без цифр оставляем видимым, иначе набранный код страны исчезает из поля
      inp.value = d ? phoneMask(d) : (p.plus ? '+7' : '');
    }
    setError('hs-phone', '');
  }
  /* номер для отправки: +7 и 10 цифр или + и цифры международного номера */
  function phoneValue() {
    var p = parsePhone($('hs-phone').value);
    return (p.mode === 'intl' ? '+' : '+7') + p.d;
  }
  /* текст ошибки по режиму ввода; short — для проверки до отправки, иначе для ответа сервера */
  function phoneProblem(short) {
    var p = parsePhone($('hs-phone').value);
    if (p.mode === 'intl') return 'Проверьте номер: для международного номера нужно от 8 до 15 цифр с кодом страны.';
    return short ? 'Введите номер полностью: после +7 нужно 10 цифр.' : 'Проверьте номер телефона: после +7 нужно 10 цифр.';
  }
  function phoneValid() {
    var p = parsePhone($('hs-phone').value);
    return p.mode === 'intl' ? p.d.length >= PHONE_INTL_MIN && p.d.length <= PHONE_INTL_MAX && p.d.charAt(0) !== '0' : p.d.length === 10;
  }

  /* ---------- шаг 2: отправка ---------- */
  function utmFromQuery() {
    var out = {}, q;
    try { q = new URLSearchParams(location.search); } catch (e) { return out; }
    UTM_KEYS.forEach(function (k) { var v = q.get(k); if (v) out[k] = v.slice(0, 200); });
    return out;
  }

  function setBusy(on) {
    state.busy = on;
    var b = $('hs-submit');
    b.disabled = on;
    b.textContent = on ? 'Открываем платформу…' : 'Открыть платформу →';
    $('hs-status').textContent = on ? 'Открываем платформу' : '';
  }

  function validate() {
    var bad = null;
    function flag(id, msg) { setError(id, msg); if (!bad) bad = $(id); }
    if (!$('hs-name').value.trim()) flag('hs-name', 'Укажите имя.');
    if (!phoneValid()) flag('hs-phone', phoneProblem(true));
    if (!EMAIL_RE.test($('hs-email').value.trim())) flag('hs-email', 'Проверьте адрес почты, например ivan@ваш-сайт.ru.');
    if (!$('hs-consent').checked) flag('hs-consent', 'Нужно согласие, чтобы продолжить.');
    if (bad) { bad.focus(); return false; }
    return true;
  }

  /* ответ сервера → понятное сообщение у нужного поля; введённое остаётся в форме */
  function showProblem(status, code) {
    if (code === 'invalid_url' || code === 'site_unreachable') {
      show('input');
      setError('hs-site', code === 'invalid_url'
        ? 'Не похоже на адрес сайта. Введите адрес вида example.ru'
        : 'Не получилось открыть этот сайт. Проверьте адрес и попробуйте ещё раз.');
      $('hs-site').focus();
    } else if (FIELD_ERR[code]) {
      setError(FIELD_ERR[code][0], code === 'invalid_phone' ? phoneProblem(false) : FIELD_ERR[code][1]);
      $(FIELD_ERR[code][0]).focus();
    } else if (code === 'email_taken') {
      setError('hs-email', textWithLink('Такая почта уже зарегистрирована. ', '/login', 'Войти'));
      $('hs-email').focus();
    } else if (code === 'rate_limited' || status === 429) {
      setError('hs-general', 'Слишком много попыток, попробуйте позже.');
    } else {
      generalError();
    }
  }
  function generalError() {
    setError('hs-general', textWithLink('Не получилось, попробуйте позже или ', 'mailto:' + CONTACT_MAIL, 'напишите нам', '.'));
  }

  function submitSignup(ev) {
    ev.preventDefault();
    if (state.busy) return;
    FIELD_IDS.slice(1).forEach(function (id) { setError(id, ''); });
    if (!validate()) return;
    setBusy(true);
    goal('signup_submitted');
    fetch(SIGNUP_API, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: state.url,
        name: $('hs-name').value.trim(),
        phone: phoneValue(),
        email: $('hs-email').value.trim(),
        consent: true,
        hp: $('hs-hp').value,
        utm: utmFromQuery()
      })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) { return { status: r.status, body: body || {} }; });
    }).then(function (r) {
      var to = r.body.redirect;
      if (r.status === 201 && typeof to === 'string' && /^\/(?!\/)/.test(to)) { goal('signup_success'); location.assign(to); return; }
      setBusy(false);
      goal('signup_error', { signup_error: r.status === 201 ? 'bad_redirect' : String(r.body.code || r.status) });
      showProblem(r.status, r.status === 201 ? '' : r.body.code);
    }, function () {
      setBusy(false);
      generalError();
    });
  }

  /* ---------- сброс: логотип на главной прокручивает к началу и возвращает форму к шагу 1 ---------- */
  var logo = document.querySelector('.header .logo');
  if (logo) logo.addEventListener('click', function (e) {
    e.preventDefault();
    if (!state.busy) {
      $('hs-form').reset();
      $('hs-sign').reset();
      state.url = ''; phoneDigits = 0;
      FIELD_IDS.forEach(function (id) { setError(id, ''); });
      show('input');
    }
    window.scrollTo(0, 0);
  });

  /* ---------- события ---------- */
  $('hs-form').addEventListener('submit', submitUrl);
  $('hs-site').addEventListener('input', function () { setError('hs-site', ''); });
  $('hs-sign').addEventListener('submit', submitSignup);
  $('hs-edit').addEventListener('click', function () { if (!state.busy) { show('input'); $('hs-site').focus(); } });
  $('hs-phone').addEventListener('input', onPhoneInput);
  ['hs-name', 'hs-email'].forEach(function (id) { $(id).addEventListener('input', function () { setError(id, ''); }); });
  $('hs-consent').addEventListener('change', function () { setError('hs-consent', ''); });
})();
