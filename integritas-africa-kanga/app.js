/* Kusekwa — clasa a XII-a, Liceul Integritas.
   Pagina e o kanga tipărită pentru misiune. Aici se leagă tiparul (print.js) de pânză
   (cloth.js) și de derulare: pânza respiră și se liniștește, drumul se parcurge,
   clădirile se tipăresc, iar măsura din proverb se umple cu suma aleasă.

   CONFIG e singurul loc de schimbat când vin datele de la școală. */

import { INK, el, kanga, medallion, church, clinic, book, house, trowel, kibaba, stamp, pindo, field, rng } from './print.js';
import { Cloth, printToCanvas } from './cloth.js';

const CONFIG = {
  stripeLink: '',                        /* Payment Link cu „clientul alege suma" */
  stripeAmountParam: '__prefilled_amount',
  fallbackLink: 'https://liceulintegritas.ro/donatii',
  paypalLink: '',
  sumStart: 150,
  sumFull: 400,                          /* suma la care măsura din proverb e plină */
  jina: 'HABA NA HABA HUJAZA KIBABA',
  selvedge: 'TIPĂRITĂ PENTRU MISIUNEA CLASEI A XII-A · LICEUL INTEGRITAS · 2026'
};

/* ?still=1 — pagina fără intrări și cu tot ce depinde de derulare dus la capăt.
   E pentru capturi, nu pentru vizitatori. */
const STILL = new URLSearchParams(location.search).has('still');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const GS = window.gsap;
const ST = GS && window.ScrollTrigger ? window.ScrollTrigger : null;
if (GS && ST) GS.registerPlugin(ST);
if (GS && window.SplitText) GS.registerPlugin(window.SplitText);
if (RM) document.body.classList.add('no-motion');
if (STILL) document.body.classList.add('still');

/* ---------------------------------------------------------------- pânza */

const HERO = { W: 1800, H: 1200 };
const band = Math.min(HERO.W, HERO.H) * 0.13;

function heroKanga() {
  return kanga({
    W: HERO.W, H: HERO.H, scatter: INK.green,
    center: (W, H, b) => medallion(
      W / 2, H * 0.42, b * 2.15, b * 1.65,
      [INK.ink, INK.cotton, INK.yellow],
      church(b * 2.3, INK.ink), 'KUSEKWA · TANZANIA'
    )
  });
}

/* textul de pe pânză se scrie la sfârșit, cu fontul paginii */
const heroText = [
  { text: CONFIG.jina, x: HERO.W / 2, y: HERO.H - band * 1.72, size: band * 0.52, ink: INK.ink, tracking: band * 0.022 },
  { text: CONFIG.selvedge, x: HERO.W / 2, y: HERO.H - band * 1.26, size: band * 0.135, ink: INK.ink, weight: 600, tracking: band * 0.05 }
];

async function raiseCloth() {
  const cv = $('#cloth'), flat = $('#clothFlat'), hint = $('#clothHint');

  /* varianta plată intră prima: pânza întreagă se vede și fără WebGL */
  const svgFlat = heroKanga();
  svgFlat.appendChild(el('text', {
    x: HERO.W / 2, y: HERO.H - band * 1.72, 'text-anchor': 'middle', fill: INK.ink,
    'font-family': 'BigShoulders, sans-serif', 'font-weight': 700,
    'font-size': band * 0.52, 'letter-spacing': band * 0.022
  }, [document.createTextNode(CONFIG.jina)]));
  svgFlat.appendChild(el('text', {
    x: HERO.W / 2, y: HERO.H - band * 1.26, 'text-anchor': 'middle', fill: INK.ink,
    'font-family': 'BigShoulders, sans-serif', 'font-weight': 600,
    'font-size': band * 0.135, 'letter-spacing': band * 0.05
  }, [document.createTextNode(CONFIG.selvedge)]));
  svgFlat.removeAttribute('width'); svgFlat.removeAttribute('height');
  flat.appendChild(svgFlat);

  if (RM) { hint.remove(); cv.remove(); return; }

  let cloth;
  try {
    const tex = await printToCanvas(heroKanga(), HERO.W, HERO.H, heroText);
    const weave = new Image();
    weave.src = 'assets/tex/weave-normal.webp';
    await weave.decode();
    cloth = new Cloth(cv, tex, weave, {
      aspect: HERO.W / HERO.H,
      segments: innerWidth < 760 ? 70 : 130
    });
  } catch (e) { hint.remove(); cv.remove(); return; }

  flat.classList.add('is-gone');
  cloth.resize();
  addEventListener('resize', () => cloth.resize(), { passive: true });

  let raf = 0, visible = true;
  const loop = (t) => { if (visible) cloth.frame(t); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '120px' }).observe(cv);

  /* atingerea: pânza se îndoaie sub deget și se întoarce singură */
  let touched = false;
  const at = (e) => {
    const r = cv.getBoundingClientRect();
    cloth.point(clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1), true);
    if (!touched) { touched = true; hint.classList.add('is-gone'); }
  };
  cv.addEventListener('pointermove', at);
  cv.addEventListener('pointerdown', at);
  cv.addEventListener('pointerleave', () => cloth.point(0.5, 0.5, false));

  /* la derulare pânza se întinde: trece din obiect în foaie de hârtie */
  if (ST) ST.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (self) => { cloth.calm = self.progress; cloth.fold = self.progress * 0.1; }
  });
}

/* ------------------------------------------------- banda dintre acte */

/* o fâșie de chenar, tipărită o dată și repetată ca fundal */
function actBands() {
  const w = 420, h = 70;
  const svg = el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${w} ${h}`, width: w, height: h });
  svg.appendChild(el('rect', { width: w, height: h, fill: INK.ink }));
  const inks = [INK.yellow, INK.green];
  for (let i = 0; i < 6; i++) {
    const g = i % 2 === 0
      ? (() => { const r = el('g'); r.appendChild(rosetteAt(h * 0.3, INK.yellow, INK.green)); return r; })()
      : (() => { const r = el('g'); r.appendChild(sprigAt(h * 0.28, INK.green)); return r; })();
    g.setAttribute('transform', `translate(${w / 12 + i * w / 6} ${h / 2})`);
    svg.appendChild(g);
  }
  const url = 'url("data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(new XMLSerializer().serializeToString(svg)).replace(/"/g, "'") + '")';
  document.documentElement.style.setProperty('--band', url);
  void inks;
}
/* mici ajutoare, ca banda să nu depindă de forma internă a motivelor */
function rosetteAt(r, a, b) {
  const g = el('g');
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2, cx = Math.cos(ang) * r * 0.56, cy = Math.sin(ang) * r * 0.56;
    g.appendChild(el('ellipse', {
      cx, cy, rx: r * 0.46, ry: r * 0.27,
      transform: `rotate(${(ang * 180 / Math.PI).toFixed(1)} ${cx.toFixed(2)} ${cy.toFixed(2)})`, fill: a
    }));
  }
  g.appendChild(el('circle', { r: r * 0.3, fill: b }));
  return g;
}
function sprigAt(r, ink) {
  const g = el('g');
  g.appendChild(el('path', { d: `M0 ${r} L0 ${-r * 0.2}`, stroke: ink, 'stroke-width': r * 0.16, 'stroke-linecap': 'round' }));
  for (const d of [1, -1]) g.appendChild(el('path', {
    d: `M0 ${r * (d > 0 ? 0.1 : 0.45)} C ${0.7 * r * d} ${-0.25 * r + r * 0.2}, ${1.05 * r * d} ${-0.75 * r + r * 0.2}, ${1.15 * r * d} ${-1.15 * r + r * 0.2}
        C ${0.6 * r * d} ${-0.95 * r + r * 0.2}, ${0.2 * r * d} ${-0.5 * r + r * 0.2}, 0 ${r * (d > 0 ? 0.1 : 0.45)} Z`, fill: ink
  }));
  return g;
}

/* ---------------------------------------------------------------- drumul */

function road() {
  const wrap = $('#road'), svg = $('#roadLine');
  if (!wrap || !svg) return;
  const stages = $$('.stage', wrap);
  const draw = () => {
    const box = wrap.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = '';
    const x = 16;
    const ys = stages.map((s) => {
      const r = s.getBoundingClientRect();
      return r.top - box.top + r.height / 2;
    });
    const y0 = ys[0], y1 = ys[ys.length - 1];
    /* întâi planul, punctat, apoi drumul făcut, plin */
    svg.appendChild(el('path', {
      d: `M ${x} ${y0} L ${x} ${y1}`, stroke: INK.ink, 'stroke-width': 3,
      'stroke-dasharray': '2 9', 'stroke-linecap': 'round', opacity: .45
    }));
    const done = el('path', {
      d: `M ${x} ${y0} L ${x} ${y1}`, stroke: INK.red, 'stroke-width': 4, 'stroke-linecap': 'round',
      id: 'roadDone'
    });
    const len = Math.abs(y1 - y0);
    done.setAttribute('stroke-dasharray', len);
    done.setAttribute('stroke-dashoffset', len);
    svg.appendChild(done);
    ys.forEach((y, i) => {
      svg.appendChild(el('circle', { cx: x, cy: y, r: i === ys.length - 1 ? 7 : 5, fill: INK.ink }));
    });
    /* ștampila care merge pe drum, cu mijlocul de transport al etapei */
    const car = el('g', { id: 'roadStamp' });
    svg.appendChild(car);
    return { x, y0, len, ys, car };
  };

  let st = draw();
  let at = RM || STILL ? 1 : 0;   /* cât din drum e parcurs, ca să-l putem reface */
  const modes = stages.map((s) => s.dataset.mode);
  const paint = (p) => {
    at = p;
    const done = $('#roadDone', svg);
    if (!done) return;
    done.setAttribute('stroke-dashoffset', st.len * (1 - p));
    const y = st.y0 + st.len * p;
    const seg = clamp(Math.floor(p * (st.ys.length - 1)), 0, st.ys.length - 2);
    st.car.innerHTML = '';
    const kind = modes[seg] === 'plane' ? 'plane' : modes[seg] === 'bus' ? 'bus' : 'car';
    const s = stamp(kind, 42, INK.ink);
    s.setAttribute('transform', `translate(${st.x} ${y})`);
    st.car.appendChild(s);
    stages.forEach((el2, i) => el2.classList.toggle('is-done', st.ys[i] <= y + 2));
  };
  paint(at);
  /* la redimensionare se redesenează tot, deci progresul se pune din nou */
  addEventListener('resize', () => { st = draw(); paint(at); ST && ST.refresh(); }, { passive: true });
  /* pozele schimbă înălțimile: mai măsurăm o dată când s-a încărcat tot */
  addEventListener('load', () => { st = draw(); paint(at); ST && ST.refresh(); }, { once: true });
  if (ST && !RM && !STILL) ST.create({
    trigger: wrap, start: 'top 72%', end: 'bottom 62%', scrub: 0.6,
    onUpdate: (self) => paint(self.progress)
  });
}

/* ------------------------------------------------------------- panourile */

const MOTIF = { book, house, trowel, clinic };

function panels() {
  $$('.panel').forEach((p, i) => {
    const slot = $('.panel__print', p);
    const W = 560, H = 394, b = Math.min(W, H) * 0.13;
    const svg = el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${W} ${H}` });
    svg.appendChild(el('rect', { width: W, height: H, fill: INK.cotton }));
    svg.appendChild(field(W, H, b, INK.blue, 31 + i * 7));
    const m = MOTIF[p.dataset.motif];
    if (m) {
      const g = medallion(W / 2, H * 0.47, b * 1.35, b * 1.15, [INK.ink, INK.cotton, i % 2 ? INK.green : INK.yellow], m(b * 1.5, INK.ink));
      svg.appendChild(g);
    }
    svg.appendChild(pindo(W, H, b * 0.62, [INK.ink, i % 2 ? INK.green : INK.yellow, i % 2 ? INK.yellow : INK.green], 5 + i));
    slot.appendChild(svg);
  });
}

/* -------------------------------------------------------------- vocile */

function voices() {
  $$('.voice__med').forEach((slot, i) => {
    const S = 320, r = S * 0.34;
    const svg = el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${S} ${S}` });
    const uid = 'vc' + i;
    svg.appendChild(el('defs', {}, [
      el('clipPath', { id: uid }, [el('ellipse', { cx: S / 2, cy: S / 2, rx: r * 0.95, ry: r * 1.02 })])
    ]));
    svg.appendChild(medallion(S / 2, S / 2, r, r * 1.07, [INK.ink, INK.cotton, [INK.yellow, INK.green, INK.blue][i % 3]]));
    const img = el('image', {
      href: slot.dataset.photo, x: S / 2 - r * 0.92, y: S / 2 - r * 1.02, width: r * 1.84, height: r * 2.04,
      preserveAspectRatio: 'xMidYMax meet', 'clip-path': `url(#${uid})`
    });
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', slot.dataset.photo);
    svg.appendChild(img);
    slot.appendChild(svg);
  });
}

/* --------------------------------------------------- clădirile se tipăresc */

function buildings() {
  const svg = $('#buildSvg');
  if (!svg) return;
  const W = 1000, H = 620;
  svg.innerHTML = '';
  svg.appendChild(el('rect', { width: W, height: H, fill: 'none' }));

  /* pământul, ca o linie de tipar */
  svg.appendChild(el('path', { d: `M 40 ${H - 58} L ${W - 40} ${H - 58}`, stroke: INK.ink, 'stroke-width': 5, 'stroke-linecap': 'round' }));

  const parts = [];
  const add = (node, order) => { node.dataset && (node.dataset.order = order); parts.push(node); svg.appendChild(node); };

  /* biserica, mare, în stânga — se ridică din cinci matrițe */
  const ch = el('g', { transform: `translate(${W * 0.33} ${H - 58})` });
  const w = 420, h = 250;
  const wall = el('path', { d: `M ${-w / 2} 0 L ${-w / 2} ${-h * 0.62} L ${w / 2} ${-h * 0.62} L ${w / 2} 0 Z`, fill: INK.ink });
  const roof = el('path', { d: `M ${-w * 0.56} ${-h * 0.62} L 0 ${-h * 1.12} L ${w * 0.56} ${-h * 0.62} Z`, fill: INK.ink });
  const tower = el('path', { d: `M ${-w * 0.08} ${-h * 1.12} L ${w * 0.08} ${-h * 1.12} L ${w * 0.08} ${-h * 1.44} L ${-w * 0.08} ${-h * 1.44} Z`, fill: INK.ink });
  const cross = el('path', { d: `M 0 ${-h * 1.74} L 0 ${-h * 1.44} M ${-w * 0.045} ${-h * 1.63} L ${w * 0.045} ${-h * 1.63}`, stroke: INK.ink, 'stroke-width': 11, 'stroke-linecap': 'round' });
  const win = el('g');
  for (let i = -1; i <= 1; i++) {
    const x = i * w * 0.27;
    win.appendChild(el('path', {
      d: `M ${x - 26} ${-h * 0.1} L ${x - 26} ${-h * 0.34} A 26 26 0 0 1 ${x + 26} ${-h * 0.34} L ${x + 26} ${-h * 0.1} Z`,
      fill: INK.yellow
    }));
  }
  [wall, roof, tower, cross, win].forEach((n) => ch.appendChild(n));
  svg.appendChild(ch);

  /* dispensarul, mai mic, în dreapta */
  const cl = el('g', { transform: `translate(${W * 0.76} ${H - 58})` });
  const cw = 260, chh = 150;
  const cwall = el('path', { d: `M ${-cw / 2} 0 L ${-cw / 2} ${-chh * 0.6} L ${cw / 2} ${-chh * 0.6} L ${cw / 2} 0 Z`, fill: INK.ink });
  const croof = el('path', { d: `M ${-cw * 0.6} ${-chh * 0.6} L ${-cw * 0.44} ${-chh * 1.0} L ${cw * 0.44} ${-chh * 1.0} L ${cw * 0.6} ${-chh * 0.6} Z`, fill: INK.ink });
  const a = 22;
  const ccross = el('path', { d: `M ${-a / 2} ${-chh * 0.26} h ${a / 2} v ${-a / 2} h ${a / 2} v ${a / 2} h ${a / 2} v ${a / 2} h ${-a / 2} v ${a / 2} h ${-a / 2} v ${-a / 2} h ${-a / 2} Z`, fill: INK.red });
  [cwall, croof, ccross].forEach((n) => cl.appendChild(n));
  svg.appendChild(cl);

  /* etichetele, ca pe un plan */
  const tag = (x, y, t, sub) => {
    const g = el('g', { transform: `translate(${x} ${y})` });
    g.appendChild(el('path', { d: `M 0 -4 L 0 -30`, stroke: INK.ink, 'stroke-width': 2 }));
    g.appendChild(el('text', { y: -60, 'text-anchor': 'middle', fill: INK.ink, 'font-family': 'BigShoulders, sans-serif', 'font-weight': 700, 'font-size': 21, 'letter-spacing': 2 }, [document.createTextNode(t)]));
    g.appendChild(el('text', { y: -40, 'text-anchor': 'middle', fill: INK.ink, opacity: .65, 'font-family': 'Archivo, sans-serif', 'font-size': 13 }, [document.createTextNode(sub)]));
    return g;
  };
  svg.appendChild(tag(W * 0.33, H - 72 - 250 * 1.74, 'BISERICA', 'șapte sute de locuri'));
  svg.appendChild(tag(W * 0.76, H - 68 - 150 * 1.0, 'DISPENSARUL', 'primul din sat'));

  const order = [wall, cwall, roof, croof, tower, ccross, cross, win];
  if (RM || STILL || !GS) { order.forEach((n) => n.style.opacity = 1); return; }
  order.forEach((n) => { n.style.opacity = 0; n.style.transformBox = 'fill-box'; n.style.transformOrigin = '50% 100%'; });
  $$('text, path[stroke-width="2"]', svg).forEach(() => {});

  const tl = GS.timeline({
    scrollTrigger: { trigger: '#build', start: 'top 78%', end: 'bottom 70%', scrub: 0.7 }
  });
  order.forEach((n, i) => {
    tl.fromTo(n, { opacity: 0, scaleY: 0.72, y: 16 }, { opacity: 1, scaleY: 1, y: 0, duration: 1, ease: 'back.out(1.6)' }, i * 0.65);
  });
  void parts; void add;
}

/* ------------------------------------------------------- măsura și plata */

function pay() {
  const form = $('#pay'); if (!form) return;
  const go = $('#payGo'), pp = $('#payPP'), other = $('#other'), meas = $('#kibaba');
  let sum = CONFIG.sumStart;

  const drawMeasure = (s) => {
    if (!meas) return;
    meas.innerHTML = '';
    const lvl = clamp(s / CONFIG.sumFull, 0.06, 1);
    const g = kibaba(150, INK.ink, INK.yellow, lvl);
    g.setAttribute('transform', 'translate(110 120)');
    meas.appendChild(g);
    /* boabele care tocmai au căzut în măsură */
    const grain = rng(Math.round(s));
    const gr = el('g', { transform: 'translate(110 120)' });
    const h = 150 * 0.64, top = -h / 2 + h * (1 - lvl);
    for (let i = 0; i < 9; i++) {
      const x = (grain() - 0.5) * 92;
      gr.appendChild(el('circle', { cx: x.toFixed(1), cy: (top - 10 - grain() * 34).toFixed(1), r: 2.8, fill: INK.yellow }));
    }
    meas.appendChild(gr);
    meas.appendChild(el('text', {
      x: 110, y: 212, 'text-anchor': 'middle', fill: INK.ink, opacity: .6,
      'font-family': 'BigShoulders, sans-serif', 'font-weight': 600, 'font-size': 17, 'letter-spacing': 5
    }, [document.createTextNode('KIBABA')]));
    /* boabele care cad înăuntru, cât timp alegi */
    if (!RM && GS) {
      const fill = $('.kibaba-fill', meas);
      if (fill) GS.from(fill, { attr: { y: '+=40' }, opacity: .4, duration: .5, ease: 'power2.out' });
    }
  };

  const paint = () => {
    const live = !!CONFIG.stripeLink.trim();
    go.textContent = `Donează ${sum.toLocaleString('ro-RO')} lei`;
    if (live) {
      const u = new URL(CONFIG.stripeLink);
      u.searchParams.set(CONFIG.stripeAmountParam, String(Math.round(sum * 100)));
      go.href = u.toString();
    } else go.href = CONFIG.fallbackLink;
    drawMeasure(sum);
  };

  $$('.pay__amounts button').forEach((b) => b.addEventListener('click', () => {
    $$('.pay__amounts button').forEach((o) => o.classList.toggle('is-on', o === b));
    sum = +b.dataset.sum; if (other) other.value = ''; paint();
  }));
  if (other) other.addEventListener('input', () => {
    const v = Math.round(+other.value || 0);
    if (v > 0) { $$('.pay__amounts button').forEach((o) => o.classList.remove('is-on')); sum = v; paint(); }
  });
  if (pp && CONFIG.paypalLink.trim()) { pp.hidden = false; pp.href = CONFIG.paypalLink; }
  paint();

  $$('.copy').forEach((b) => b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      const t = b.textContent; b.textContent = 'Copiat'; b.classList.add('is-done');
      setTimeout(() => { b.textContent = t; b.classList.remove('is-done'); }, 1600);
    } catch { /* fără clipboard: IBAN-ul e oricum scris pe pagină */ }
  }));
}

/* ---------------------------------------------------------- bara de jos */

function railCta() {
  const rail = $('#railcta'), give = $('#masura');
  if (!rail || !give) return;
  const io = new IntersectionObserver(([e]) => {
    rail.classList.toggle('is-up', !e.isIntersecting && scrollY > innerHeight * 1.2);
  }, { threshold: 0 });
  io.observe(give);
  addEventListener('scroll', () => {
    const r = give.getBoundingClientRect();
    const inGive = r.top < innerHeight && r.bottom > 0;
    rail.classList.toggle('is-up', !inGive && scrollY > innerHeight * 1.2);
  }, { passive: true });
}

/* ---------------------------------------------------------- intrări */

function entrances() {
  if (RM || STILL || !GS || !ST) return;
  /* titlurile intră pe rânduri, ca o matriță apăsată de două ori */
  $$('h1, h2').forEach((h) => {
    let split;
    try { split = new window.SplitText(h, { type: 'lines', linesClass: 'ln' }); } catch { return; }
    GS.from(split.lines, {
      yPercent: 108, opacity: 0, duration: .9, stagger: .09, ease: 'power3.out',
      scrollTrigger: { trigger: h, start: 'top 86%' }
    });
    h.style.overflow = 'hidden';
  });
  $$('.act__lead, .lead, .hero__jina, .hero__go, .panel, .shot, .voice, .ways li, .pay, .give__cost').forEach((n, i) => {
    GS.from(n, {
      y: 26, opacity: 0, duration: .7, ease: 'power2.out', delay: (i % 4) * 0.04,
      scrollTrigger: { trigger: n, start: 'top 92%' }
    });
  });
}

/* ---------------------------------------------------------------- pornire */

function smooth() {
  if (RM || STILL || !window.Lenis) return;
  const lenis = new window.Lenis({ lerp: .1, smoothWheel: true });
  if (GS && ST) {
    lenis.on('scroll', ST.update);
    GS.ticker.add((t) => lenis.raf(t * 1000));
    GS.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href'));
    if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -56 }); }
  }));
}

async function start() {
  actBands();
  panels();
  voices();
  try { await document.fonts.load('700 100px BigShoulders'); } catch { /* fontul vine oricum din CSS */ }
  await document.fonts.ready;
  await raiseCloth();
  road();
  buildings();
  pay();
  railCta();
  smooth();
  entrances();
  if (ST) ST.refresh();
  /* link direct spre o secțiune: după ce s-a așezat tot, sărim acolo */
  if (location.hash) {
    const t = $(location.hash);
    if (t) requestAnimationFrame(() => t.scrollIntoView({ behavior: 'auto', block: 'start' }));
  }
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true });
else start();
