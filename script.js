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

/* ============ Первый экран: экспресс-анализ сайта (демо-сценарий, данные условные) ============ */
(function () {
  'use strict';
  var root = document.getElementById('hs');
  if (!root) return;

  var RUN = [['🌐', 'Читаем сайт и структуру страниц'], ['🏷️', 'Определяем бренд и УТП'], ['👥', 'Собираем аудиторию, товары и услуги'], ['📈', 'Оцениваем спрос по направлениям']];
  var GEN = [['🧩', 'Подбираем структуру по запросу'], ['✍️', 'Пишем текст'], ['🎨', 'Оформляем под площадку']];
  var TOPICS = [
    ['химчистка дивана', 31400, 'Химчистка дивана: как выбрать способ и не испортить обивку'],
    ['чистка матраса', 12300, 'Чистка матраса: когда нужна и как сделать это правильно'],
    ['клининг офисов', 18200, 'Клининг офисов: как выбрать подрядчика и график уборки'],
    ['послестроительная уборка', 17400, 'Послестроительная уборка: что входит и сколько занимает'],
    ['клининг после ремонта цена', 9800, 'Цена клининга после ремонта: из чего складывается стоимость']
  ];
  // направления: [эмодзи+название, показов, статус(done|part|grow), [[запрос, показов, процент, есть материал]], «ещё N»]
  var DIRS = [
    ['🏠 Уборка квартир', 412300, 'done', [['уборка квартир', 118400, 100, 1], ['заказать уборку квартиры', 41200, 35, 1], ['генеральная уборка квартиры', 36900, 31, 1], ['уборка квартир цена', 28700, 24, 1]], 148],
    ['🧱 Уборка после ремонта', 96800, 'part', [['уборка после ремонта', 52100, 44, 1], ['послестроительная уборка', 17400, 15, 0], ['клининг после ремонта цена', 9800, 8, 0]], 64],
    ['🏢 Уборка офисов', 71500, 'part', [['уборка офисов', 24600, 21, 1], ['клининг офисов', 18200, 15, 0]], 41],
    ['🛋️ Химчистка мебели', 58900, 'grow', [['химчистка дивана', 31400, 27, 0], ['чистка матраса', 12300, 10, 0], ['химчистка мебели на дому', 9100, 8, 0]], 37]
  ];
  var BADGE = { done: ['✅ Закрыто', 'hs-badge hs-badge--done'], part: ['✍️ Частично', 'hs-badge'], grow: ['💡 Точка роста', 'hs-badge hs-badge--grow'] };

  var panels = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-hs]'), function (p) { panels[p.getAttribute('data-hs')] = p; });
  var timers = [];
  var state = { site: '', topic: 0 };

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function $(id) { return document.getElementById(id); }

  function show(name) {
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
    var top = root.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: window.pageYOffset + top - 84, behavior: 'smooth' });
  }

  function steps(box, defs, cur) {
    box.innerHTML = defs.map(function (d, i) {
      var cls = i < cur ? 'is-on is-done' : (i === cur ? 'is-on' : '');
      var mark = i < cur ? '✓' : (i === cur ? '…' : String(i + 1));
      return '<div class="hs-step ' + cls + '"><span class="hs-step__dot">' + mark + '</span><span class="hs-step__t">' + d[0] + ' ' + d[1] + '</span></div>';
    }).join('');
  }

  function run(box, defs, delay, done) {
    var n = 0;
    steps(box, defs, 0);
    (function tick() {
      later(function () {
        n += 1;
        steps(box, defs, n);
        if (n >= defs.length) later(done, 700); else tick();
      }, delay);
    })();
  }

  function topicIndex(name) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i][0] === name) return i;
    return -1;
  }

  function renderTree() {
    $('hs-dirs').innerHTML = DIRS.map(function (d) {
      var b = BADGE[d[2]];
      var kws = d[3].map(function (k) {
        var inner = '<span class="hs-kw__i">' + (k[3] ? '✅' : '💡') + '</span><span class="hs-kw__n">' + esc(k[0]) + '</span>' +
          '<span class="hs-kw__bar"><i class="' + (k[3] ? '' : 'is-new') + '" style="width:' + k[2] + '%"></i></span><span class="hs-kw__f">' + fmt(k[1]) + '</span>';
        var ti = topicIndex(k[0]);
        return ti >= 0 && !k[3]
          ? '<button type="button" class="hs-kw" data-topic="' + ti + '" title="Создать пробную статью по этому запросу">' + inner + '</button>'
          : '<div class="hs-kw">' + inner + '</div>';
      }).join('');
      return '<div class="hs-dir"><div class="hs-dir__box"><div class="hs-dir__n">' + d[0] + '</div><div class="hs-dir__v">' + fmt(d[1]) + '</div><span class="' + b[1] + '">' + b[0] + '</span></div>' +
        '<div class="hs-kws">' + kws + '<div class="hs-more">+ ещё ' + d[4] + ' запросов в направлении</div></div></div>';
    }).join('');
  }

  function renderTopics() {
    $('hs-topics').innerHTML = TOPICS.map(function (t, i) {
      var sel = i === state.topic;
      return '<button type="button" role="radio" aria-checked="' + sel + '" class="hs-topic' + (sel ? ' is-sel' : '') + '" data-topic="' + i + '">' +
        '<span class="hs-topic__m">' + (sel ? '✓' : '') + '</span><span class="hs-topic__n">' + esc(t[0]) + '</span>' +
        '<span class="hs-topic__h">💡 материала нет</span><span class="hs-topic__f">' + fmt(t[1]) + '</span></button>';
    }).join('');
  }

  function go(name) {
    clearTimers();
    if (name === 'input') { state.topic = 0; }
    if (name === 'topic') renderTopics();
    show(name);
  }

  function domainOf(v) { return v.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/[\/?#].*$/, ''); }

  $('hs-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('hs-site').value.trim();
    var d = domainOf(v);
    if (!d || d.indexOf('.') < 1 || /\s/.test(d)) { $('hs-err').hidden = false; $('hs-site').focus(); return; }
    $('hs-err').hidden = true;
    state.site = d;
    $('hs-domain-run').textContent = d;
    $('hs-domain-res').textContent = d;
    show('run');
    run($('hs-run-steps'), RUN, 900, function () { renderTree(); show('result'); });
  });
  $('hs-site').addEventListener('input', function () { $('hs-err').hidden = true; });

  $('hs-start').addEventListener('click', function () {
    var t = TOPICS[state.topic];
    $('hs-sel-gen').textContent = t[0];
    $('hs-sel-art').textContent = t[0];
    $('hs-sel-art2').textContent = t[0];
    $('hs-art-title').textContent = t[2];
    show('gen');
    run($('hs-gen-steps'), GEN, 1000, function () { show('article'); });
  });

  root.addEventListener('click', function (e) {
    var g = e.target.closest('[data-hs-go]');
    if (g) { go(g.getAttribute('data-hs-go')); return; }
    var t = e.target.closest('[data-topic]');
    if (!t) return;
    state.topic = +t.getAttribute('data-topic');
    // из дерева — переходим к выбору запроса, внутри списка — только меняем выбор
    if (t.classList.contains('hs-kw')) go('topic'); else renderTopics();
  });
})();
