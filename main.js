/* ARGENT Dental — SPA на чистом JS + GSAP.
   Маршрутизация: History API (pushState/popstate) с хэш-URL вида #/prices —
   так прямая ссылка и обновление страницы работают на GitHub Pages без 404.

   Моушн-система:
   — масочные «сплит»-заголовки и каскадные появления (expo easing);
   — занавес-переход между страницами с «медицинской» линией сканирования;
   — кастомный курсор, магнитные кнопки и 3D-наклон карточек;
   — счётчики, бегущая строка, рисование схемы проезда и прогресс чтения.
   Все сценарии уважают prefers-reduced-motion. */

gsap.registerPlugin(ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFine = matchMedia('(hover:hover) and (pointer:fine)').matches;

/* ---------- Данные ---------- */
const ico = p => `<svg viewBox="0 0 24 24">${p}</svg>`;
const WHY = [
  ['Немецкое оборудование', 'Микроскопы Carl Zeiss, томограф и сканеры — точность до 0,01 мм.', ico('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>')],
  ['Стерильность', 'Одноразовые расходники, автоклавы класса B и многоступенчатый контроль.', ico('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>')],
  ['Опыт врачей', 'Средний стаж специалистов — 14 лет, регулярное обучение в Европе.', ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/>')],
  ['Лечение без боли', 'Современная анестезия и седация — спокойно даже тем, кто боится.', ico('<path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6-8 11-8 11z"/>')]
];
const PRICES = {
  'Терапия': [['Консультация и осмотр', 'бесплатно'], ['Лечение кариеса', 'от 5 000 ₽'], ['Лечение пульпита', 'от 9 000 ₽'], ['Профессиональная гигиена', 'от 6 500 ₽']],
  'Хирургия': [['Удаление зуба', 'от 4 000 ₽'], ['Удаление зуба мудрости', 'от 9 000 ₽'], ['Синус-лифтинг', 'от 45 000 ₽']],
  'Имплантация': [['Имплантация (под ключ)', 'от 40 000 ₽'], ['Костная пластика', 'от 30 000 ₽'], ['Керамическая коронка', 'от 22 000 ₽'], ['All-on-4', 'от 380 000 ₽']],
  'Ортодонтия': [['Металлические брекеты', 'от 70 000 ₽'], ['Сапфировые брекеты', 'от 110 000 ₽'], ['Элайнеры', 'от 190 000 ₽'], ['Ретейнер', 'от 12 000 ₽']],
  'Эстетика': [['Отбеливание', 'от 18 000 ₽'], ['Виниры', 'от 38 000 ₽ / зуб'], ['Реставрация зуба', 'от 11 000 ₽']]
};
const DOCS = [
  ['Алексей Орлов', 'Хирург-имплантолог', '18 лет', 'Более 3 000 имплантаций. Стажировки в Цюрихе и Мюнхене.', 210],
  ['Мария Штайн', 'Ортодонт', '12 лет', 'Элайнеры и брекет-системы. Планирует результат в 3D.', 200],
  ['Дмитрий Ким', 'Терапевт-эндодонтист', '15 лет', 'Лечение каналов под микроскопом, сохранение «безнадёжных» зубов.', 220],
  ['Елена Рождественская', 'Эстетическая стоматология', '10 лет', 'Виниры и реставрации, неотличимые от природных зубов.', 195],
  ['Игорь Волков', 'Ортопед', '20 лет', 'Протезирование на имплантах, сложные реабилитации.', 230],
  ['Анна Лебедева', 'Гигиенист', '8 лет', 'Бережная чистка и профилактика, индивидуальные программы ухода.', 205]
];
const EQ = [
  ['Томограф 3D', 'Снимок за 8 секунд с минимальной дозой облучения.', 210],
  ['Интраоральный сканер', 'Цифровой слепок вместо неприятной массы.', 200],
  ['Операционный микроскоп', 'Увеличение до 25× для точного лечения каналов.', 225]
];
const LIC = ['Лицензия Минздрава', 'ISO 9001', 'Сертификат Straumann', 'Страхование ответственности'];

/* ---------- Отрисовка контента ---------- */
const SPEC = ['8 с', '0,01 мм', '25×'];
$('#why').className = 'rows';
$('#why').innerHTML = WHY.map(w => `<div class="row rv"><h3>${w[0]}</h3><p>${w[1]}</p></div>`).join('');
$('#acc').innerHTML = Object.entries(PRICES).map(([cat, rows], idx) => `
  <div class="it rv">
    <button class="hd" aria-expanded="false"><span class="idx">${String(idx + 1).padStart(2, '0')}</span><span class="hl">${cat}</span><span class="pl"></span></button>
    <div class="bd"><ul>${rows.map(r => `<li><span>${r[0]}</span><i></i><b>${r[1]}</b></li>`).join('')}</ul>
      <a href="#/contacts" data-link="contacts" data-book="${cat}" class="btn sm">Записаться</a></div>
  </div>`).join('');
$('#docs').className = 'grid g3 docs';
$('#docs').innerHTML = DOCS.map(d => `
  <article class="plate rv"><div class="ph" style="--j:${d[4] - 200}">
    <svg class="vf" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true"><path d="M8 22V8h14M78 8h14v14M92 103v14H78M22 117H8v-14"/></svg>
    <div class="cap"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg><span>Фото вашего врача</span></div></div>
  <span class="tag">${d[1]} · стаж ${d[2]}</span><h3>${d[0]}</h3><p>${d[3]}</p></article>`).join('');
$('#lic').className = 'rows';
$('#lic').innerHTML = LIC.map(l => `<div class="row lic rv"><h3>${l}</h3></div>`).join('');

/* ---------- Схема зубов (нумерация 1–32): верхний и нижний ряд, коронки + корни ---------- */
const NAMES = ['Зуб мудрости', 'Второй моляр', 'Первый моляр', 'Второй премоляр', 'Первый премоляр', 'Клык', 'Боковой резец', 'Центральный резец'];
const HINT = ['Удаление · от 9 000 ₽', 'Лечение каналов · от 9 000 ₽', 'Лечение каналов · от 9 000 ₽', 'Пломба · от 5 000 ₽', 'Пломба · от 5 000 ₽', 'Коронка · от 22 000 ₽', 'Винир · от 38 000 ₽', 'Винир · от 38 000 ₽'];
// Шаблоны силуэтов: [коронка, корень]; точка (0,0) — шейка зуба, корень уходит вверх
const T = {
  inc: ['M-9,0C-11,10-10.5,20-8.5,25Q0,29 8.5,25C10.5,20 11,10 9,0Q0,-2-9,0Z', 'M-8.5,-1C-7,-14-4,-32 0,-38C4,-32 7,-14 8.5,-1Q0,1-8.5,-1Z'],
  can: ['M-10,0C-12,10-10,18-5,24L0,31L5,24C10,18 12,10 10,0Q0,-2-10,0Z', 'M-9.5,-1C-8,-16-4,-38 0,-46C4,-38 8,-16 9.5,-1Q0,1-9.5,-1Z'],
  pre: ['M-11,0C-13,8-12,16-9,22L-5,25L0,22L5,25L9,22C12,16 13,8 11,0Q0,-2-11,0Z', 'M-9,-1C-8,-14-5,-30-1,-38C3,-30 8,-14 9,-1Q0,1-9,-1Z'],
  mol: ['M-17,0C-20,8-19,17-15,22L-10,25L-5,21L0,24L5,21L10,25L15,22C19,17 20,8 17,0Q0,-2-17,0Z', 'M-16,-1C-17,-14-15,-28-11,-36C-8,-26-6,-12-3,-1L3,-1C6,-12 8,-26 11,-36C15,-28 17,-14 16,-1Q0,1-16,-1Z']
};
/* ---------- Оборудование: «окно прибора» — что видит аппарат + показание ---------- */
const SPECL = ['время снимка', 'точность скана', 'увеличение'];
const TH = (k, x, y) => `<g class="th" transform="translate(${x} ${y}) scale(${k})"><path d="${T.mol[1]}"/><path d="${T.mol[0]}"/></g>`;
let mesh = '', ruler = '';
for (let x = 56; x <= 144; x += 7) mesh += `<line x1="${x}" y1="8" x2="${x}" y2="130"/>`;
for (let y = 10; y <= 130; y += 7) mesh += `<line x1="50" y1="${y}" x2="150" y2="${y}"/>`;
for (let x = 58; x <= 142; x += 6) { const l = (x - 58) % 30 === 0 ? 5 : 2.5; ruler += `M${x} ${70 - l}V${70 + l}`; }
const clipT = `<path transform="translate(100 74) scale(1.55)" d="${T.mol[1]}"/><path transform="translate(100 74) scale(1.55)" d="${T.mol[0]}"/>`;
const EQI = [
  // Томограф: рамка с излучателем вращается вокруг зуба
  `<svg viewBox="0 0 200 140" aria-hidden="true"><circle class="dim" cx="100" cy="70" r="64"/><circle class="tk" cx="100" cy="70" r="56"/>
    <g class="spin"><path class="fan" d="M100 70V8A62 62 0 0 1 143.8 26.2Z"/><path class="arc" d="M100 8A62 62 0 0 1 143.8 26.2"/><circle class="dotp" cx="143.8" cy="26.2" r="3.5"/></g>${TH(1.55, 100, 74)}</svg>`,
  // Сканер: луч бежит по зубу и «проявляет» цифровую сетку модели
  `<svg viewBox="0 0 200 140" aria-hidden="true"><defs><clipPath id="eqt">${clipT}</clipPath></defs>${TH(1.55, 100, 74)}
    <g class="mesh" clip-path="url(#eqt)">${mesh}</g><path class="vf2" d="M40 24V8h16M144 8h16v16M160 116v16h-16M56 132H40v-16"/>
    <g class="beam"><g transform="translate(0 10)"><rect class="band" x="46" y="-7" width="108" height="14"/><line x1="44" y1="0" x2="156" y2="0"/></g></g></svg>`,
  // Микроскоп: окуляр с перекрестием, внутри увеличенные корни и каналы
  `<svg viewBox="0 0 200 140" aria-hidden="true"><defs><clipPath id="eql"><circle cx="100" cy="70" r="52"/></clipPath></defs>
    <circle class="dim" cx="100" cy="70" r="64"/><circle cx="100" cy="70" r="52"/>
    <g clip-path="url(#eql)"><g class="focus"><g class="zm" transform="translate(100 118) scale(3)"><path d="${T.mol[1]}"/><path d="${T.mol[0]}"/><path class="cn" d="M-9.5 -2C-10 -14-10.5 -26-11 -33"/><path class="cn" d="M9.5 -2C10 -14 10.5 -26 11 -33"/></g></g>
      <path class="ret" d="M100 20V62M100 78V120M50 70H92M108 70H150"/><path class="ret" d="${ruler}"/></g>
    <path class="gl" d="M62 44A42 42 0 0 1 84 28"/></svg>`
];
$('#eq').innerHTML = EQ.map((e, i) => `
  <div class="plate rv"><div class="eqv">${EQI[i]}<div class="spec"><small>${SPECL[i]}</small><b>${SPEC[i]}</b></div></div><h3>${e[0]}</h3><p>${e[1]}</p></div>`).join('');

const TY = ['mol', 'mol', 'mol', 'pre', 'pre', 'can', 'inc', 'inc'];
const BW = [38, 38, 38, 26, 26, 24, 22, 22], SC = [.88, .96, 1, 1, 1, 1, .9, 1];
const RL = [36, 36, 36, 38, 38, 46, 38, 38];                 // длина корней (для подписей)
const jaw = n => n <= 8 ? 'верхняя челюсть, справа' : n <= 16 ? 'верхняя челюсть, слева' : n <= 24 ? 'нижняя челюсть, слева' : 'нижняя челюсть, справа';
const DEFS = '<defs><linearGradient id="en" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset="1" stop-color="#aebacb"/></linearGradient></defs>';

/* Зубы стоят на подковообразной дуге (эллипс в плане) и проецируются с перспективой:
   дальние зубы меньше, уже, темнее и сходятся к линии смыкания — получается объём челюсти. */
const RX = 250, RZ = 130, F = 300, CY = 170;
const ks = [...Array(16).keys()].map(i => Math.min(i, 15 - i));
const ws = ks.map(k => BW[k] * SC[k] + 4), tot = ws.reduce((a, b) => a + b);
const items = [], gum = { 1: [], 0: [] };
[1, 0].forEach(up => {
  const rx = up ? RX : RX * .94, zo = up ? 0 : 10;           // нижняя дуга чуть уже и глубже
  const sp = t => Math.hypot(rx * Math.cos(t), RZ * Math.sin(t));
  const N = 400, tab = [0];                                   // таблица длины дуги θ → s
  for (let n = 1; n <= N; n++) tab.push(tab[n - 1] + sp((n - .5) / N * Math.PI / 2) * (Math.PI / 2 / N));
  const inv = L => { let n = 1; while (n < N && tab[n] < L) n++; return (n - 1 + (L - tab[n - 1]) / ((tab[n] - tab[n - 1]) || 1)) / N * Math.PI / 2; };
  let pos = -tot / 2;
  ks.forEach((k, i) => {
    const c = pos + ws[i] / 2; pos += ws[i];
    const th = Math.sign(c) * inv(Math.abs(c));               // положение зуба на дуге
    const z = RZ * (1 - Math.cos(th)) + zo, s = 1 / (1 + z / F);
    const yaw = Math.atan2(RZ * Math.sin(Math.abs(th)), rx * Math.cos(th));
    const xs = 300 + rx * Math.sin(th) * s, ys = CY + ((up ? 140 : 200) - CY) * s;
    const sx = SC[k] * s * Math.max(.34, Math.cos(yaw)), sy = SC[k] * s * (up ? 1 : -1);
    const n = up ? i + 1 : 32 - i;   // 1–16 сверху слева направо, 32–17 снизу в том же порядке
    const op = (1 - .55 * z / (RZ + 10)).toFixed(2);
    const ly = up ? ys - RL[k] * SC[k] * s - 9 : ys + RL[k] * SC[k] * s + 15;
    gum[up].push([xs, ys]);
    items.push({ z, h: `<g class="t" data-n="${n}" data-k="${k}" style="opacity:${op}" transform="translate(${xs.toFixed(1)} ${ys.toFixed(1)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})"><path class="r" d="${T[TY[k]][1]}"/><path class="c" d="${T[TY[k]][0]}"/></g><text class="nm" style="opacity:${op}" x="${xs.toFixed(1)}" y="${ly.toFixed(1)}">${n}</text>` });
  });
});
const gp = p => '<path class="gum" d="M' + p.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + '"/>';
$('#svg').innerHTML = DEFS + gp(gum[1]) + gp(gum[0])
  + items.sort((a, b) => b.z - a.z).map(o => o.h).join('')    // рисуем от дальних к ближним
  + '<text class="side" x="48" y="80">Правая сторона</text><text class="side" x="552" y="80" text-anchor="end">Левая сторона</text>';
const ro = $('#ro'), roDef = '<b>32</b><span>зуба</span><em>Нумерация 1–32 · наведите на зуб</em>';
ro.innerHTML = roDef;
$('#svg').addEventListener('pointerover', e => {
  const t = e.target.closest('.t');
  $$('.t.on').forEach(x => x.classList.remove('on'));
  if (!t) { ro.innerHTML = roDef; return; }
  t.classList.add('on');
  ro.innerHTML = `<b>${t.dataset.n}</b><span>${NAMES[t.dataset.k]}</span><em>${jaw(+t.dataset.n)} · ${HINT[t.dataset.k]}</em>`;
});

/* ---------- Сплит-текст: слова прячутся в масках ---------- */
function splitText() {
  $$('[data-split]').forEach(el => {
    if (el.dataset.splitDone) return;
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const frag = document.createDocumentFragment();
    words.forEach((w, i) => {
      const mask = document.createElement('span');
      mask.className = 'split-word';
      const inner = document.createElement('span');
      inner.className = 'split-inner';
      inner.textContent = w;
      mask.appendChild(inner);
      frag.appendChild(mask);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);
    el.dataset.splitDone = '1';
  });
}

/* ---------- Роутинг ---------- */
const ROUTES = { '': 'home', prices: 'prices', doctors: 'doctors', about: 'about', contacts: 'contacts' };
const TITLES = { home: 'Главная', prices: 'Услуги и цены', doctors: 'Врачи', about: 'О клинике', contacts: 'Контакты' };
let current = null, busy = false, rvTriggers = [];

const routeFromUrl = () => ROUTES[location.hash.replace(/^#\/?/, '')] || 'home';

function show(name, first) {
  const next = $(`[data-page="${name}"]`);
  if (!next || busy) return;
  if (name === current && !first) return;

  const prev = current && $(`[data-page="${current}"]`);
  busy = true;
  const swap = () => {
    if (prev) prev.classList.remove('on');
    next.classList.add('on');
    current = name;
    document.title = `${TITLES[name]} — ARGENT Dental`;
    $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.link === name));
    // без плавного скролла: новый экран должен открыться уже наверху
    const sb = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = sb;
    reveal(next);
    if (name === 'home') heroIntro(next, first ? .15 : .05);
    requestAnimationFrame(() => { moveNavLine(); ScrollTrigger.refresh(); });
  };

  // Мгновенная смена: никаких полноэкранных заставок, только анимация входа контента
  swap();
  busy = false;
}

/* Появление блоков при скролле (каскад + blur) */
function reveal(page) {
  rvTriggers.forEach(t => t.kill());
  rvTriggers = [];
  if (reduce) return;

  // Заголовки — раскрываются маской слова за словом
  $$('[data-split]', page).forEach(el => {
    if (el.closest('.hero')) return;
    const inners = $$('.split-inner', el);
    if (!inners.length) return;
    gsap.set(inners, { yPercent: 118 });
    rvTriggers.push(ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(inners, { yPercent: 0, duration: 1.15, stagger: .045, ease: 'expo.out' })
    }));
  });

  // Остальные блоки — каскад из глубины с лёгким расфокусом
  const els = $$('.rv', page).filter(el => !el.closest('.hero') && !el.matches('[data-split]'));
  gsap.set(els, { opacity: 0, y: 34, filter: 'blur(5px)' });
  rvTriggers.push(...ScrollTrigger.batch(els, {
    start: 'top 92%', once: true,
    onEnter: b => gsap.to(b, {
      opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: .07, ease: 'expo.out',
      overwrite: true, onComplete: () => gsap.set(b, { clearProps: 'filter' })
    })
  }));

  if (page.dataset.page === 'contacts') animateMap(page);
}

/* Схема проезда: дороги «прорисовываются», метки проявляются */
function animateMap(page) {
  if (reduce) return;
  const map = $('.rmap', page);
  if (!map) return;
  const roads = $$('.rd', map);
  roads.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const marks = $$('.mm,.rmap .card,.rmap .ml,.rmap .mt,.rmap .pin', map);
  gsap.set(marks, { opacity: 0 });
  rvTriggers.push(ScrollTrigger.create({
    trigger: map, start: 'top 80%', once: true,
    onEnter: () => {
      gsap.to(roads, { strokeDashoffset: 0, duration: 1.6, stagger: .07, ease: 'power2.inOut' });
      gsap.to(marks, { opacity: 1, duration: .55, stagger: .07, ease: 'power2.out', delay: .55 });
    }
  }));
}

/* Вход главного экрана: маски, каскад, счётчики, зубы от центра */
function heroIntro(page, delay = 0) {
  if (reduce) return;
  const hero = $('.hero', page);
  if (!hero) return;
  const inners = $$('.split-inner', hero);
  const copy = $$('.kicker,.lead,.hero-actions > *,.hero-stats > *,.odo,.scroll-hint', hero);
  gsap.killTweensOf([inners, copy]);
  gsap.set(inners, { yPercent: 118 });
  gsap.set(copy, { opacity: 0, y: 24 });

  gsap.timeline({ delay, defaults: { ease: 'expo.out' } })
    .to(inners, { yPercent: 0, duration: 1.15, stagger: .05 }, 0)
    .to(hero.querySelector('.kicker'), { opacity: 1, y: 0, duration: .8 }, .1)
    .to(hero.querySelector('.lead'), { opacity: 1, y: 0, duration: .9 }, .28)
    .to(hero.querySelectorAll('.hero-actions > *'), { opacity: 1, y: 0, duration: .8, stagger: .1 }, .4)
    .to(hero.querySelectorAll('.hero-stats > *'), { opacity: 1, y: 0, duration: .8, stagger: .08 }, .52)
    .to(hero.querySelector('.odo'), { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, .25)
    .to(hero.querySelector('.scroll-hint'), { opacity: 1, y: 0, duration: .8 }, .9)
    .add(() => $$('.hero-stats b', hero).forEach(countUp), .7);

  gsap.from($$('.t', hero), { opacity: 0, duration: .7, stagger: { each: .032, from: 'center' }, delay: delay + .6, ease: 'power2.out' });
}

function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const end = parseFloat(el.dataset.count) || 0, suf = el.dataset.suffix || '';
  const o = { v: 0 };
  gsap.to(o, { v: end, duration: 1.5, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } });
}

/* Перехват кликов по внутренним ссылкам */
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-link]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute('href');
  if (href !== location.hash && !(href === '#/' && !location.hash)) history.pushState({}, '', href);
  if (a.dataset.book) pick(a.dataset.book);
  setMenu(false);
  show(routeFromUrl());
});
addEventListener('popstate', () => show(routeFromUrl()));

/* ---------- Переключатели в стиле Apple + анимация смены темы/палитры ---------- */
const root = document.documentElement, PALS = ['bronze', 'sage', 'aqua'];

// Плавная смена через View Transitions: тема — круг от переключателя, палитра — косая волна по ходу ползунка
function morph(apply, o) {
  if (!document.startViewTransition || reduce) { apply(); return; }
  root.classList.add('vt');
  const vt = document.startViewTransition(apply);
  vt.ready.then(() => {
    const t = { duration: o.kind === 'theme' ? 1000 : 900, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'both' };
    let clip;
    if (o.kind === 'theme') {
      const end = Math.hypot(Math.max(o.x, innerWidth - o.x), Math.max(o.y, innerHeight - o.y));
      clip = [`circle(0px at ${o.x}px ${o.y}px)`, `circle(${end}px at ${o.x}px ${o.y}px)`];
    } else clip = o.dir >= 0
      ? ['polygon(-25% 0,0% 0,-25% 100%,-25% 100%)', 'polygon(-25% 0,125% 0,100% 100%,-25% 100%)']
      : ['polygon(125% 0,100% 0,125% 100%,125% 100%)', 'polygon(125% 0,-25% 0,0% 100%,125% 100%)'];
    root.animate({ clipPath: clip }, { ...t, pseudoElement: '::view-transition-new(root)' });
    // старая картинка уходит в размытие и чуть отъезжает вглубь
    root.animate({ filter: ['blur(0px) brightness(1)', 'blur(8px) brightness(.8)'], transform: ['scale(1)', 'scale(.985)'] }, { ...t, pseudoElement: '::view-transition-old(root)' });
    // зубы «проявляются» волной от центра
    if (current === 'home') gsap.from('.t', { opacity: 0, duration: .6, stagger: { each: .03, from: 'center' }, delay: .15 });
  });
  vt.finished.finally(() => root.classList.remove('vt'));
}

/* Тема: iOS-переключатель */
const sw = $('#theme');
const setTheme = t => { root.dataset.theme = t; sw.setAttribute('aria-checked', t === 'light'); };
sw.onclick = () => {
  const r = sw.getBoundingClientRect(), t = root.dataset.theme === 'light' ? 'dark' : 'light';
  morph(() => setTheme(t), { kind: 'theme', x: r.left + r.width / 2, y: r.top + r.height / 2 });
  try { localStorage.setItem('theme', t); } catch (e) {}
};
setTheme(root.dataset.theme);

/* Палитра: стеклянный ползунок — тап, перетаскивание, пружина и «растяжение» при движении */
const pals = $('#pals'), thumb = $('#thumb');
const seg = () => $('.pal').offsetWidth;
const setPal = p => {
  root.dataset.palette = p;
  $$('.pal').forEach(x => x.setAttribute('aria-pressed', x.dataset.p === p));
};
function place(i, instant) {
  const x = i * seg();
  if (instant || reduce) { gsap.set(thumb, { x }); return; }
  gsap.timeline({ defaults: { overwrite: 'auto' } })
    .to(thumb, { x, duration: .8, ease: 'elastic.out(1,.6)' }, 0)
    .fromTo(thumb, { scaleX: 1 }, { scaleX: 1.4, duration: .14, ease: 'power2.out', yoyo: true, repeat: 1 }, 0);
}
function selectPal(i) {
  const cur = PALS.indexOf(root.dataset.palette);
  if (i === cur) { place(i); return; }
  place(i);
  morph(() => setPal(PALS[i]), { kind: 'pal', dir: i - cur });
  try { localStorage.setItem('palette', PALS[i]); } catch (e) {}
}
const follow = cx => {
  const r = pals.getBoundingClientRect(), x = Math.max(0, Math.min(2 * seg(), cx - r.left - 3 - seg() / 2));
  gsap.to(thumb, { x, duration: .18, ease: 'power2.out', overwrite: 'auto' });
};
const idxAt = cx => Math.max(0, Math.min(2, Math.floor((cx - pals.getBoundingClientRect().left - 3) / seg())));
let drag = false;
pals.addEventListener('pointerdown', e => {
  drag = true; pals.setPointerCapture(e.pointerId);
  gsap.to(thumb, { scaleX: 1.12, scaleY: 1.14, duration: .25, ease: 'back.out(2)', overwrite: 'auto' }); // «нажатие»
  follow(e.clientX);
});
pals.addEventListener('pointermove', e => { if (drag) follow(e.clientX); });
const release = e => {
  if (!drag) return; drag = false;
  gsap.to(thumb, { scaleY: 1, duration: .3, overwrite: 'auto' });
  selectPal(idxAt(e.clientX));
};
pals.addEventListener('pointerup', release);
pals.addEventListener('pointercancel', release);
$$('.pal').forEach((b, i) => b.addEventListener('click', e => { if (e.detail === 0) selectPal(i); })); // клавиатура
setPal(root.dataset.palette); place(PALS.indexOf(root.dataset.palette), true);
addEventListener('resize', () => place(PALS.indexOf(root.dataset.palette), true));

/* ---------- Мобильное меню ---------- */
function setMenu(open) {
  const nav = $('#nav'), b = $('#burger');
  if (!nav || !b) return;
  nav.classList.toggle('open', open);
  b.classList.toggle('open', open);
  b.setAttribute('aria-expanded', open);
  if (open && innerWidth <= 860 && !reduce) {
    gsap.fromTo($$('#nav a'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, stagger: .05, ease: 'power2.out', delay: .12, clearProps: 'all' });
  }
  moveNavLine();
}
$('#burger').onclick = () => setMenu(!$('#nav').classList.contains('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); moveNavLine(); });

/* Подвижная линия активного пункта меню */
function moveNavLine(target) {
  const nav = $('#nav'), line = $('#navLine');
  if (!nav || !line) return;
  if (innerWidth <= 860) { gsap.set(line, { opacity: 0 }); return; }
  const a = target || $('#nav a.on');
  if (!a) { gsap.set(line, { opacity: 0 }); return; }
  const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
  gsap.to(line, { opacity: 1, x: r.left - nr.left, y: r.bottom - nr.top + 2, width: r.width, duration: .55, ease: 'expo.out', overwrite: 'auto' });
}
$$('#nav a').forEach(a => {
  a.addEventListener('pointerenter', () => moveNavLine(a));
  a.addEventListener('pointerleave', () => moveNavLine());
});

/* ---------- Шапка: сжатие и автоскрытие при скролле ---------- */
let lastY = 0;
addEventListener('scroll', () => {
  const hdr = $('.hdr'), y = scrollY;
  if (!hdr) return;
  hdr.classList.toggle('scrolled', y > 24);
  hdr.classList.toggle('hide', y > lastY && y > 260 && !$('#nav').classList.contains('open'));
  lastY = y;
}, { passive: true });

/* ---------- Аккордеон: один открытый раздел + каскад строк ---------- */
$('#acc').addEventListener('click', e => {
  const btn = e.target.closest('.hd');
  if (!btn) return;
  const it = btn.parentElement, bd = $('.bd', it), open = !it.classList.contains('open');

  $$('.it.open').forEach(other => {
    if (other === it) return;
    other.classList.remove('open');
    $('.hd', other).setAttribute('aria-expanded', 'false');
    gsap.to($('.bd', other), { height: 0, duration: .45, ease: 'power2.inOut' });
  });

  it.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open);
  if (open) {
    gsap.to(bd, { height: 'auto', duration: .6, ease: 'power3.inOut', onComplete: () => ScrollTrigger.refresh() });
    gsap.fromTo($$('li', bd), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, stagger: .045, ease: 'power2.out', delay: .14 });
  } else {
    gsap.to(bd, { height: 0, duration: .45, ease: 'power2.inOut', onComplete: () => ScrollTrigger.refresh() });
  }
});

/* ---------- Контакты: выбор услуги, режим работы, форма ---------- */
const chipsEl = $('#chips');
chipsEl.innerHTML = ['Консультация', ...Object.keys(PRICES)].map(c => `<button type="button" class="chip" data-svc="${c}" aria-pressed="false">${c}</button>`).join('');
function pick(name) {
  $$('.chip', chipsEl).forEach(c => { const on = c.dataset.svc === name; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
}
chipsEl.addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (c) pick(c.classList.contains('on') ? '' : c.dataset.svc);
});

// Режим работы: подсвечиваем сегодняшний день (МСК) и показываем «открыто / закрыто»
const HRS = [['Пн', 9, 21], ['Вт', 9, 21], ['Ср', 9, 21], ['Чт', 9, 21], ['Пт', 9, 21], ['Сб', 9, 21], ['Вс', 10, 18]];
function hours() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map(x => [x.type, x.value]));
  const d = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday), h = +p.hour + +p.minute / 60;
  const [, o, c] = HRS[d], open = h >= o && h < c;
  const txt = open ? `Сейчас открыто · до ${c}:00` : `Сейчас закрыто · откроемся ${h < o ? 'сегодня' : 'завтра'} в ${HRS[h < o ? d : (d + 1) % 7][1]}:00`;
  $('#live').className = 'live' + (open ? '' : ' off');
  $('#live').innerHTML = `<i></i>${txt}`;
  $('#hrs').innerHTML = HRS.map((r, i) => `<li class="${i === d ? 'now' : ''}"><span>${r[0]}</span><i></i><b>${r[1]}:00–${r[2]}:00</b></li>`).join('');
}
hours(); setInterval(hours, 60000);

$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, ok = $('#ok'), btn = $('.btn', f);
  const bad = [f.name, f.phone].filter(i => !i.value.trim() || (i === f.phone && i.value.replace(/\D/g, '').length < 10));
  [f.name, f.phone].forEach(i => i.classList.toggle('err', bad.includes(i)));
  if (bad.length) { ok.textContent = 'Укажите имя и телефон (минимум 10 цифр).'; return; }

  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Отправляем…';
  ok.textContent = '';
  setTimeout(() => {
    const name = f.name.value.trim();
    btn.textContent = 'Заявка отправлена';
    btn.classList.add('sent');
    ok.textContent = `Спасибо, ${name}! Администратор перезвонит в течение 15 минут.`;
    if (!reduce) gsap.fromTo(ok, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' });
    f.reset(); pick('');
    setTimeout(() => { btn.textContent = label; btn.classList.remove('sent'); btn.disabled = false; }, 3000);
  }, 900);
});
[$('#form').name, $('#form').phone].forEach(i => i.addEventListener('input', () => i.classList.remove('err')));

/* ---------- Кастомный курсор + магнитные кнопки + 3D-наклон ---------- */
function initCursor() {
  if (!isFine || reduce) return;
  const cur = $('#cursor');
  if (!cur) return;
  const dot = $('.cur-dot', cur), ring = $('.cur-ring', cur);
  document.body.classList.add('cursor-on');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -120, y: -120 });
  const dx = gsap.quickTo(dot, 'x', { duration: .09, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .09, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
  addEventListener('mousemove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  addEventListener('pointerdown', () => cur.classList.add('down'));
  addEventListener('pointerup', () => cur.classList.remove('down'));
  $$('a,button,.chip,.t,.pal,.plate').forEach(el => {
    el.addEventListener('pointerenter', () => cur.classList.add('hover'));
    el.addEventListener('pointerleave', () => cur.classList.remove('hover'));
  });
}

function initMagnetic() {
  if (!isFine || reduce) return;
  $$('[data-magnet]').forEach(el => {
    const x = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' }), y = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * .16);
      y((e.clientY - r.top - r.height / 2) * .3);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

function initTilt() {
  if (!isFine || reduce) return;
  $$('.docs .plate').forEach(plate => {
    const setRX = gsap.quickTo(plate, 'rotateX', { duration: .5, ease: 'power3' });
    const setRY = gsap.quickTo(plate, 'rotateY', { duration: .5, ease: 'power3' });
    plate.addEventListener('pointermove', e => {
      const r = plate.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      setRY(px * 9); setRX(-py * 9);
      gsap.to(plate, { y: -10, duration: .45, ease: 'power2.out', overwrite: 'auto' });
    });
    plate.addEventListener('pointerleave', () => {
      setRX(0); setRY(0);
      gsap.to(plate, { y: 0, duration: .7, ease: 'power3.out', overwrite: 'auto' });
    });
  });
}

/* ---------- Подсветка схемы зубов под курсором ---------- */
function initSpotlight() {
  const odo = $('#odo');
  if (!odo) return;
  odo.addEventListener('pointermove', e => {
    const r = odo.getBoundingClientRect();
    odo.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
    odo.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
  }, { passive: true });
}

/* ---------- Скролл-эффекты ---------- */
function initScroll() {
  if (reduce) return;
  gsap.to('#sprog', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .25 }
  });
  gsap.to('.o1', { y: 260, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } });
  gsap.to('.o2', { y: -160, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } });
  gsap.to('#odo', { y: 70, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.fromTo('.ftr-mega', { yPercent: 18 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: 1 } });

  if (isFine) {
    const mx = gsap.quickTo('#svg', 'x', { duration: 1.2 }), my = gsap.quickTo('#svg', 'y', { duration: 1.2 });
    addEventListener('mousemove', e => { mx((e.clientX / innerWidth - .5) * -24); my((e.clientY / innerHeight - .5) * -24); }, { passive: true });
  }
}

/* ---------- Вход шапки (без полноэкранной заставки) ---------- */
function initEntrance() {
  if (reduce) return;
  gsap.from('.hdr', { yPercent: -100, duration: .9, ease: 'expo.out', clearProps: 'transform' });
}

/* ---------- Старт ---------- */
splitText();
initCursor();
initMagnetic();
initTilt();
initSpotlight();
initScroll();
show(routeFromUrl(), true);
initEntrance();
moveNavLine();
