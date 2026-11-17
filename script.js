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

  // Отправка: здесь подключается ваш обработчик (CRM, почта, Telegram и т.п.)
  demoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    demoForm.hidden = true;
    demoDone.hidden = false;
  });

  var fbForm = document.getElementById('fb-form');
  var fbDone = document.getElementById('fb-done');
  if (fbForm) {
    fbForm.addEventListener('submit', function (e) {
      e.preventDefault();
      fbForm.hidden = true;
      fbDone.hidden = false;
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
