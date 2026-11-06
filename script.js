(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Интро ---------- */
  const intro = $('#intro');
  let seen = false;
  try { seen = sessionStorage.getItem('afrika-intro') === '1'; } catch (e) {}
  const introTime = reduced ? 300 : seen ? 1900 : 3700;
  let introClosed = false;
  const closeIntro = () => {
    if (introClosed) return;
    introClosed = true;
    intro.classList.add('is-done');
    setTimeout(() => document.body.classList.remove('is-loading'), 250);
    try { sessionStorage.setItem('afrika-intro', '1'); } catch (e) {}
  };
  const startIntro = () => setTimeout(closeIntro, introTime);
  const wm = $('.intro__logo img');
  if (wm.complete) startIntro(); else { wm.addEventListener('load', startIntro); wm.addEventListener('error', startIntro); }
  $('.intro__skip').addEventListener('click', closeIntro);
  intro.addEventListener('click', closeIntro);
  setTimeout(closeIntro, 7000); // страховка

  /* ---------- Шапка ---------- */
  const header = $('#header');
  const fab = $('.fab');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > 500 && y > lastY && !nav.classList.contains('is-open'));
    fab.classList.toggle('is-visible', y > innerHeight * 0.9 && y < document.body.scrollHeight - innerHeight * 1.6);
    lastY = y;
  };

  /* ---------- Меню ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  const toggleMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Параллакс ---------- */
  const heroBg = $('#heroBg');
  const heroLeaves = $$('.hero__leaf');
  let ticking = false;
  const parallax = () => {
    const y = scrollY;
    if (y < innerHeight * 1.2) {
      heroBg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
      heroLeaves.forEach((l, i) => l.style.setProperty('--py', `${y * (0.15 + i * 0.12)}px`));
    }
    ticking = false;
  };
  addEventListener('scroll', () => {
    onScroll();
    if (!ticking && !reduced) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Активный пункт меню ---------- */
  const sections = $$('main section[id]');
  const navLinks = $$('.nav a[href^="#"]');
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObs.observe(s));

  /* ---------- Счётчики ---------- */
  const countUp = (el) => {
    const to = parseFloat(el.dataset.count);
    const dec = +(el.dataset.decimals || 0);
    const suf = el.dataset.suffix || '';
    const dur = 1600;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec).replace('.', ',') + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Появление при скролле ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      const c = e.target.querySelector('[data-count]');
      if (c) countUp(c);
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  const observeReveals = (root = document) => {
    $$('.reveal, .reveal-draw', root).forEach(el => {
      // каскад для соседей
      const sibs = [...el.parentElement.children].filter(n => n.classList.contains('reveal'));
      const idx = sibs.indexOf(el);
      if (idx > 0 && !el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(idx, 6) * 0.08}s`);
      revealObs.observe(el);
    });
  };

  /* ---------- Цены ---------- */
  const PRICES = {
    hair: {
      label: 'Стрижки и укладки',
      groups: [
        ['Стрижки', [
          ['Женская стрижка', '2500–3000 ₽'],
          ['Мужская стрижка', 'от 1500 ₽', 'Мытьё головы до и после, стайлинг'],
          ['Чёлка', 'от 500 ₽'],
        ]],
        ['Укладки и причёски', [
          ['Укладка', 'от 1300 ₽', 'Локоны, объём, вытянутые — на разную длину. В среднем 60 минут'],
          ['Причёска', '2500 ₽', 'Мытьё головы, маска, стайлинг, термоинструмент и аксессуары'],
          ['Свадебная причёска', '3000 ₽', 'Всегда обсуждаем и делаем пробную — от 2000 ₽'],
        ]],
        ['Объём и завивка', [
          ['Флисинг (прикорневой объём)', 'от 4000 ₽'],
          ['Химическая завивка', 'от 6500 ₽'],
          ['Снятие кос', 'от 2000 ₽'],
          ['Снятие нарощенных волос', '4500 ₽'],
        ]],
      ],
    },
    color: {
      label: 'Окрашивание и уход',
      groups: [
        ['Окрашивание L\'Oréal', [
          ['Окрашивание L\'Oréal', '6000 ₽', 'Перманентные и неперманентные красители, уход для сохранения цвета и стайлинг'],
          ['Мелирование L\'Oréal', '6000 ₽'],
          ['Сложное окрашивание L\'Oréal', '7000 ₽'],
        ]],
        ['Окрашивание Kezy', [
          ['Окрашивание корней Kezy', '4500 ₽', 'Нанесение на корни и протяжка по длине, чтобы скрыть границу отрастания'],
          ['Тонирование Kezy', '3500 ₽'],
          ['Скрытое окрашивание Kezy', '2500 ₽'],
        ]],
        ['Уход за волосами', [
          ['Экспресс-увлажнение', 'от 1200 ₽'],
          ['Уход за волосами', '2000–3500 ₽'],
          ['Уход Kezy', '2000 ₽'],
          ['Уход L\'Oréal', '3000 ₽', 'Увлажнение и питание: убирает пушистость и сухость, возвращает блеск, сдерживает выпадение курсом'],
          ['Уход Label', 'от 5500 ₽'],
        ]],
      ],
    },
    nails: {
      label: 'Маникюр и педикюр',
      groups: [
        ['Маникюр', [
          ['Маникюр', '1200 ₽'],
          ['Маникюр с покрытием', '2000 ₽'],
          ['Френч гель-лаком', '1900 ₽'],
          ['Мужской маникюр', '1200 ₽'],
          ['Дизайн ногтей', '150 ₽'],
          ['Ремонт ногтя', '100 ₽'],
          ['Снятие гель-лака', '250 ₽'],
        ]],
        ['Педикюр', [
          ['Экспресс-педикюр', '1700 ₽'],
          ['Педикюр', '2000 ₽'],
          ['Смарт-педикюр без покрытия', '2000 ₽'],
          ['Педикюр с покрытием', '2500 ₽'],
          ['Мужской педикюр', '2200 ₽'],
        ]],
      ],
    },
    body: {
      label: 'Массаж',
      groups: [
        ['Массаж', [
          ['Массаж мануальный', '3000 ₽'],
          ['Лимфодренажный массаж, 1 час', '2100 ₽'],
          ['Лимфодренажный массаж, 1,5 часа', '2800 ₽'],
          ['Антицеллюлитный массаж, 1 час', '2000 ₽'],
        ]],
      ],
    },
    face: {
      label: 'Брови, ресницы, депиляция',
      groups: [
        ['Косметология', [
          ['Наращивание ресниц', 'по записи'],
          ['Коррекция бровей', 'по записи'],
          ['Окрашивание бровей и ресниц', 'по записи'],
          ['Визаж', 'по записи'],
          ['Уход за телом, коррекция фигуры', 'по записи'],
        ]],
        ['Депиляция', [
          ['Шугаринг', 'по записи'],
          ['Восковая депиляция', 'по записи'],
        ]],
      ],
    },
  };

  const tabs = $('#tabs');
  const list = $('#priceList');
  const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const renderPrices = (key) => {
    let i = 0;
    list.innerHTML = PRICES[key].groups.map(([title, items]) =>
      `<div class="price-group"><h3>${esc(title)}</h3>${items.map(([n, v, d]) =>
        `<div class="price" style="animation-delay:${(i++) * 0.045}s"><span class="price__name">${esc(n)}</span><span class="price__val">${esc(v)}</span>${d ? `<span class="price__desc">${esc(d)}</span>` : ''}</div>`
      ).join('')}</div>`
    ).join('');
    $$('.tab', tabs).forEach(t => t.setAttribute('aria-selected', t.dataset.key === key));
  };
  tabs.innerHTML = Object.entries(PRICES).map(([k, v]) => `<button class="tab" role="tab" type="button" data-key="${k}">${esc(v.label)}</button>`).join('');
  tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) renderPrices(t.dataset.key); });
  $$('[data-tab]').forEach(a => a.addEventListener('click', () => renderPrices(a.dataset.tab)));
  renderPrices('hair');

  /* ---------- Отзывы ---------- */
  const REVIEWS = [
    ['Юлия Серая', 'сентябрь 2025', 'За три года ни разу не возникло мысли сменить салон. Делаю и педикюр, и маникюр, уход за волосами, вожу туда детей и советую подругам. Очень душевный коллектив, и кофе, и прекрасный травяной чай.'],
    ['Татьяна В.', 'сентябрь 2025', 'Делала сложное окрашивание, уход за волосами, стрижку. Качество волос после процедур прекрасное, цвет всегда «в точку» — а для блондинки это важно. Вежливые администраторы, приятная атмосфера, отличное расположение.'],
    ['Анастасия М.', 'апрель 2025', 'Сложное окрашивание в блонд: мастер Анна подобрала идеальный оттенок — волосы сияют без желтизны, структура осталась здоровой. Уютная атмосфера, ароматный кофе и собственная парковка.'],
    ['Ю. В.', 'сентябрь 2025', 'Маникюр и педикюр у Светланы — безупречно и быстро. Кабинет просторный и светлый, кресло с электроприводом, инструмент стерилизуют в сухожаровом шкафу. Обязательно вернусь!'],
    ['Юлия М.', 'октябрь 2025', 'В «Африку» ходим всей семьёй к своему любимому мастеру. Анна — профессионал с большой буквы, доверяем ей волосы уже больше 20 лет!'],
    ['Валерия Г.', 'январь 2025', 'Мастер Анастасия прекрасна! Все пожелания учтены. Девушки с каре поймут, как тяжело найти мастера — а тут полное попадание. Рекомендую на все 5 звёзд!'],
    ['Ольга К.', 'октябрь 2025', 'Хожу к Анне около 10 лет — она всегда учитывает пожелания из разряда «хочу то, не знаю что», и всё получается прекрасно. Приятный салон в центре.'],
    ['Ольга К.', 'сентябрь 2025', '«Африка» — одно из любимых моих мест: выхожу не только помолодевшая и красивая, но и с прекрасным настроением от общения с мастерами и администраторами.'],
  ];
  const track = $('#sliderTrack');
  const dotsEl = $('#dots');
  track.innerHTML = REVIEWS.map(([n, d, t]) =>
    `<article class="review"><div class="review__inner"><div class="review__quote">“</div><p>${esc(t)}</p><footer><span><b>${esc(n)}</b><br>${esc(d)}</span><span class="stars" aria-label="5 из 5">★★★★★</span></footer></div></article>`
  ).join('');
  let idx = 0;
  const perView = () => innerWidth <= 600 ? 1 : innerWidth <= 1000 ? 2 : 3;
  const pages = () => REVIEWS.length - perView() + 1;
  const go = (n) => {
    const max = pages();
    idx = (n + max) % max;
    track.style.transform = `translateX(-${idx * (100 / perView())}%)`;
    $$('button', dotsEl).forEach((b, i) => b.classList.toggle('is-active', i === idx));
  };
  const buildDots = () => {
    dotsEl.innerHTML = Array.from({ length: pages() }, (_, i) => `<button type="button" aria-label="Отзыв ${i + 1}"></button>`).join('');
    go(Math.min(idx, pages() - 1));
  };
  dotsEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { go($$('button', dotsEl).indexOf(b)); restart(); } });
  $('#prev').addEventListener('click', () => { go(idx - 1); restart(); });
  $('#next').addEventListener('click', () => { go(idx + 1); restart(); });
  let timer;
  const restart = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(idx + 1), 6000); };
  // свайп
  let sx = null;
  track.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
  });
  let rw;
  addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(buildDots, 150); });
  buildDots();
  restart();

  /* ---------- 3D-наклон карточек ---------- */
  if (!reduced && matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Часы работы ---------- */
  const HOURS = { 0: [10, 18], 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [10, 18] };
  // время в Перми (UTC+5)
  const now = new Date(Date.now() + (new Date().getTimezoneOffset() + 300) * 60000);
  const day = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  const li = $(`#hours li[data-day="${day}"]`);
  if (li) li.classList.add('is-today');
  const st = $('#openStatus');
  const [o, c] = HOURS[day];
  if (h >= o && h < c) { st.textContent = `Сейчас открыто · до ${c}:00`; st.classList.add('is-open'); }
  else {
    const next = h < o ? `сегодня в ${o}:00` : `завтра в ${HOURS[(day + 1) % 7][0]}:00`;
    st.textContent = `Сейчас закрыто · откроемся ${next}`; st.classList.add('is-closed');
  }

  $('#year').textContent = new Date().getFullYear();

  observeReveals();
})();
