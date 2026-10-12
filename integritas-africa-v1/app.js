/* Integritas · Africa — concept. Cartela de titlu + o singură zi pe savană, legată de scroll.
   CONFIG e singurul loc de schimbat când vin datele de la școală. */
const CONFIG = {
  stripeLink: '',   /* Stripe Payment Link cu „clientul alege suma”: card, Google Pay, Apple Pay */
  paypalLink: '',
  fallbackLink: 'https://liceulintegritas.ro/donatii'
};

(() => {
  /* ?still=1 sare peste cartelă, pentru capturi */
  const STILL = new URLSearchParams(location.search).has('still');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- teren: dealuri periodice + salcâmi, generate în pixeli reali ---------- */
  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
  function ridge(W, H, base, amp, harm, r) {
    // sumă de sinusuri cu frecvențe întregi => se repetă exact la fiecare W
    const ph = harm.map(() => r() * Math.PI * 2);
    const pts = [];
    for (let x = 0; x <= W; x += Math.max(4, W / 220)) {
      let y = 0;
      harm.forEach((k, i) => { y += Math.sin((x / W) * Math.PI * 2 * k + ph[i]) / (i + 1); });
      pts.push([x, H * base - y * amp]);
    }
    return `M0 ${H} L${pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L')} L${W} ${H} Z`;
  }
  function acacia(x, y, h, r) {
    // trunchi bifurcat + coroană plată, ca umbrela: siluetele de pe savană
    const w = h * (1.5 + r() * 0.7);
    const fork = y - h * (0.42 + r() * 0.1);
    const top = y - h;
    const t = Math.max(1.5, h * 0.035);
    let d = `M${x - t} ${y} L${x - t * 0.6} ${fork} L${x - w * 0.28} ${top + h * 0.12} L${x - w * 0.28 + t * 1.4} ${top + h * 0.12} L${x} ${fork - h * 0.06} L${x + w * 0.22 - t} ${top + h * 0.1} L${x + w * 0.22 + t * 0.6} ${top + h * 0.1} L${x + t * 0.8} ${fork} L${x + t} ${y} Z`;
    let c = '';
    const n = 12 + Math.floor(r() * 6);
    for (let i = 0; i < n; i++) {
      const cx = x - w / 2 + (w * (i + 0.5)) / n + (r() - 0.5) * w * 0.08;
      const edge = Math.abs((i + 0.5) / n - 0.5) * 2;
      const cy = top + h * 0.04 + edge * h * 0.07 + r() * h * 0.04;
      const rx = (w / n) * (0.8 + r() * 0.9);
      const ry = h * (0.04 + r() * 0.06) * (1 - edge * 0.45);
      c += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"/>`;
    }
    return `<path d="${d}"/>${c}`;
  }
  function grass(W, H, y, r, dens, hmax) {
    let d = '';
    for (let x = 0; x < W; x += dens * (0.5 + r())) {
      const h = hmax * (0.3 + r() * 0.7), lean = (r() - 0.5) * h * 0.6;
      d += `M${(x - 2).toFixed(1)} ${y} Q${(x + lean * 0.4).toFixed(1)} ${(y - h * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(y - h).toFixed(1)} Q${(x + lean * 0.3 + 1).toFixed(1)} ${(y - h * 0.5).toFixed(1)} ${(x + 2).toFixed(1)} ${y} Z`;
    }
    return `<path d="${d}"/>`;
  }
  function paintLayer(svg, kind, seed) {
    const W = innerWidth, H = svg.getBoundingClientRect().height || innerHeight * 0.4;
    const r = rng(seed);
    let g = '';
    if (kind === 'far') {
      g += `<path d="${ridge(W, H, 0.62, H * 0.09, [1, 2, 5], r)}"/>`;
      for (let i = 0; i < 5; i++) g += acacia(r() * W, H * 0.66, H * (0.1 + r() * 0.08), r);
    } else if (kind === 'mid') {
      g += `<path d="${ridge(W, H, 0.84, H * 0.05, [2, 3, 7], r)}"/>`;
      const n = W < 700 ? 2 : 3;
      for (let i = 0; i < n; i++) g += acacia(W * (i + 0.2 + r() * 0.6) / n, H * 0.86, H * (0.42 + r() * 0.3), r);
    } else if (kind === 'near') {
      g += `<path d="${ridge(W, H, 0.78, H * 0.06, [1, 3, 4], r)}"/>`;
      g += grass(W, H, H * 0.8, r, 9, H * 0.28);
    } else if (kind === 'skyfar') {
      g += `<path d="${ridge(W, H, 0.55, H * 0.12, [1, 2, 4], r)}"/>`;
      for (let i = 0; i < 4; i++) g += acacia(W * (0.05 + r() * 0.9), H * 0.6, H * (0.18 + r() * 0.16), r);
    } else if (kind === 'front') {
      g += `<path d="${ridge(W, H, 0.55, H * 0.12, [2, 3, 5], r)}"/>`;
      g += grass(W, H, H * 0.58, r, 7, H * 0.5);
    } else if (kind === 'skynear') {
      g += `<path d="${ridge(W, H, 0.6, H * 0.1, [1, 2, 3], r)}"/>`;
      g += grass(W, H, H * 0.62, r, 11, H * 0.22);
    }
    const tiles = 1;
    svg.setAttribute('viewBox', `0 0 ${W * tiles} ${H}`);
    let out = `<g id="t-${kind}">${g}</g>`;
    for (let i = 1; i < tiles; i++) out += `<use href="#t-${kind}" x="${W * i}"/>`;
    svg.innerHTML = out;
  }
  function paintAll() {
    paintLayer($('.sky-hills--far'), 'skyfar', 51);
    paintLayer($('.sky-hills--near'), 'skynear', 67);
    paintLayer($('.sky-front'), 'front', 83);
  }
  paintAll();
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(paintAll, 200); });

  /* ---------- LOADER: cartela distribuitorului, ține cât se încarcă primul ecran ---------- */
  const loader = $('#loader');
  const barEl = $('#ldBar');
  let seen = false; try { seen = sessionStorage.getItem('ia-seen') === '1'; } catch (e) {}
  const MIN = STILL ? 0 : RM ? 300 : seen ? 600 : 2200;
  const t0 = performance.now();
  let loaded = 0, total = 0, ready = false;

  // ce trebuie încărcat: imaginile din primul ecran + fonturile
  const srcs = [...new Set($$('.scene--hero img, .top img').map((i) => i.currentSrc || i.src))];
  total = srcs.length + 1;
  srcs.forEach((s) => { const im = new Image(); im.onload = im.onerror = () => loaded++; im.src = s; });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => loaded++);
  setTimeout(() => { loaded = total; }, 6000); // nu ținem pe nimeni ostatic

  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  function frame(now) {
    // progres: cel mai mic dintre timp și încărcare, ca să nu sară
    const p = MIN ? Math.min(loaded / total, easeOut(Math.min(1, (now - t0) / MIN))) : loaded / total;
    barEl.style.width = (p * 100).toFixed(2) + '%';
    if (p >= 1 && !ready) { ready = true; outro(); return; }
    requestAnimationFrame(frame);
  }

  function outro() {
    try { sessionStorage.setItem('ia-seen', '1'); } catch (e) {}
    const done = () => loader.remove();
    document.body.classList.remove('is-loading');
    if (STILL) { done(); heroIn(); return; }
    if (RM || !window.gsap) { loader.style.transition = 'opacity .4s'; loader.style.opacity = 0; setTimeout(done, 450); heroIn(); return; }
    loader.classList.add('is-done');
    const tl = gsap.timeline({ onComplete: done });
    tl.to('.ld-card, .ld-line', { opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.1)
      .to('.ld-bar--top', { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, 0.45)
      .to('.ld-bar--bot', { yPercent: 100, duration: 0.9, ease: 'power3.inOut' }, 0.45)
      .to(loader, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 0.7)
      .add(heroIn, 0.75);
  }

  requestAnimationFrame(frame);

  /* ---------- CERUL: o singură zi, de la apus la dimineață ---------- */
  const SKY = {
    hero:     ['#3e1c14', '#b04a24', '#f0a04a', '#ffe2a6', 70, 1, 0, '#4a2114', '#1c0c08'],
    lion:     ['#34170f', '#93391c', '#e0813a', '#ffcb7c', 79, 1, 0, '#3d1a10', '#170a06'],
    reel:     ['#1f0f0b', '#5c2416', '#b8572a', '#ffb262', 88, 0.9, 0.2, '#2a120b', '#110705'],
    child:    ['#1f0f0b', '#5c2416', '#b8572a', '#ffb262', 88, 0.9, 0.2, '#2a120b', '#110705'],
    pastor:   ['#140a09', '#331612', '#7a3219', '#ff9a50', 97, 0.55, 0.55, '#1c0d08', '#0b0504'],
    teacher:  ['#0b0708', '#1a100e', '#3d1d13', '#ff9050', 110, 0, 1, '#120907', '#070303'],
    us:       ['#2f3340', '#9a6a4c', '#eeb170', '#fff0c8', 76, 1, 0.1, '#4a2c1c', '#241510'],
    every:    ['#eadcc0', '#f2e3c4', '#f5e7c9', '#fff6e0', 60, 0, 0, '#e8d6b0', '#dfc89a'],
    partners: ['#ecdfc3', '#f3e5c6', '#f5e8ca', '#fff6e0', 60, 0, 0, '#e8d6b0', '#dfc89a'],
    give:     ['#eee1c4', '#f3e6c8', '#f6e9cc', '#fff6e0', 60, 0, 0, '#e8d6b0', '#dfc89a'],
  };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const scenes = $$('.scene');
  const root = document.documentElement.style;
  let anchors = [];
  function measure() {
    anchors = scenes.map((s) => ({ key: s.dataset.sky, y: s.offsetTop + Math.max(0, s.offsetHeight - innerHeight) * 0.5 }));
  }
  function applySky(y) {
    let i = 0;
    while (i < anchors.length - 1 && y > anchors[i + 1].y) i++;
    const a = anchors[i], b = anchors[Math.min(i + 1, anchors.length - 1)];
    let t = b === a ? 0 : (y - a.y) / (b.y - a.y);
    t = Math.max(0, Math.min(1, t)); t = t * t * (3 - 2 * t);
    const A = SKY[a.key], B = SKY[b.key];
    root.setProperty('--sky-top', mix(A[0], B[0], t));
    root.setProperty('--sky-mid', mix(A[1], B[1], t));
    root.setProperty('--sky-low', mix(A[2], B[2], t));
    root.setProperty('--sun', mix(A[3], B[3], t));
    root.setProperty('--sun-y', lerp(A[4], B[4], t) + 'vh');
    root.setProperty('--sun-o', lerp(A[5], B[5], t).toFixed(3));
    root.setProperty('--stars', lerp(A[6], B[6], t).toFixed(3));
    root.setProperty('--hill-far', mix(A[7], B[7], t));
    root.setProperty('--hill-near', mix(A[8], B[8], t));
    const light = ['every', 'partners', 'give'];
    document.body.classList.toggle('on-light', light.includes(t < 0.5 ? a.key : b.key));
  }
  measure(); applySky(scrollY);
  addEventListener('resize', () => { measure(); applySky(scrollY); });
  addEventListener('load', () => { measure(); applySky(scrollY); });

  /* ---------- SCROLL + SCENE ---------- */
  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (window.gsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((tm) => lenis.raf(tm * 1000)); gsap.ticker.lagSmoothing(0); }
  }
  addEventListener('scroll', () => applySky(scrollY), { passive: true });

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 2.2 }); else el.scrollIntoView();
  }));

  function heroIn() {
    if (RM || !window.gsap) return;
    gsap.from('.scene--hero .copy > *', { y: 28, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.15 });
    // girafa ridică capul în cadru și se uită la tine
    gsap.from('.actor--giraffe img', { yPercent: 38, duration: 1.8, ease: 'power3.out' });
    gsap.from('.top', { opacity: 0, y: -10, duration: 0.8, delay: 0.6 });
  }

  if (!RM && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const st = (el) => ({ trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.6 });

    const hero = $('.scene--hero');
    gsap.to('.actor--giraffe', { yPercent: -10, xPercent: 8, ease: 'none', scrollTrigger: st(hero) });
    gsap.to('.scene--hero .copy', { y: -60, opacity: 0, ease: 'power1.in', scrollTrigger: { trigger: hero, start: '20% top', end: 'bottom bottom', scrub: 0.6 } });

    // leul traversează cadrul de la dreapta la stânga, fără grabă
    const ls = $('.scene--lion');
    gsap.fromTo('.actor--lion', { xPercent: 55 }, { xPercent: -40, ease: 'none', scrollTrigger: { trigger: ls, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    gsap.from('.scene--lion .copy > *', { y: 40, opacity: 0, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: ls, start: 'top 60%', end: 'top top', scrub: 0.6 } });

    // vocile: silueta urcă în contre-jour, apoi replica, apoi faptul real
    $$('.scene--voice').forEach((s) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 92%', end: 'top 5%', scrub: 0.7 } });
      tl.from($('.actor--sil', s), { yPercent: 22, opacity: 0, ease: 'power2.out' }, 0)
        .from($('.voice p', s), { clipPath: 'inset(0 100% 0 0)', ease: 'power1.inOut' }, 0.25)
        .from($('.fact', s), { y: 24, opacity: 0, ease: 'power2.out' }, 0.6);
    });

    const us = $('.scene--us');
    gsap.timeline({ scrollTrigger: { trigger: us, start: 'top 92%', end: 'top 5%', scrub: 0.7 } })
      .from('.scene--us .copy > *', { y: 36, opacity: 0, stagger: 0.2 }, 0)
      .from('.group-slot', { yPercent: 18, opacity: 0, ease: 'power2.out' }, 0.2);

    $$('.stage--doc').forEach((s) => {
      gsap.from($$(':scope > *', s), { y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 72%' } });
    });

    // butonul de donație sare când apare: trebuie apăsat
    const btn = $('.give-btn');
    const hop = () => gsap.timeline()
      .to(btn, { scaleY: 0.82, scaleX: 1.12, duration: 0.14, ease: 'power2.in' })
      .to(btn, { y: -22, scaleY: 1.1, scaleX: 0.94, duration: 0.24, ease: 'power2.out' })
      .to(btn, { y: 0, scaleY: 0.9, scaleX: 1.08, duration: 0.2, ease: 'power2.in' })
      .to(btn, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.4)' });
    let hopT = null;
    ScrollTrigger.create({ trigger: btn, start: 'top 85%', end: 'bottom 10%',
      onEnter: () => { hopT = setTimeout(hop, 600); }, onLeaveBack: () => clearTimeout(hopT) });
    btn.addEventListener('mouseenter', hop);

    // fiecare cadru se stinge înainte să se dezlipească, ca să nu se vadă marginea scenei
    $$('.scene:not(.scene--every):not(.scene--partners):not(.scene--give):not(.scene--reel)').forEach((s) => {
      gsap.to($('.stage', s), { opacity: 0, ease: 'power1.in', scrollTrigger: { trigger: s, start: 'bottom 122%', end: 'bottom 100%', scrub: 0.3 } });
    });
    addEventListener('load', () => ScrollTrigger.refresh());
    ScrollTrigger.addEventListener('refresh', () => { measure(); applySky(scrollY); });
  }

  /* ---------- capitolul curent ---------- */
  const chN = $('#chN'), chT = $('#chT'), chBar = $('#chBar');
  const chapterAt = (y) => {
    const mid = y + innerHeight * 0.5;
    let cur = scenes[0];
    scenes.forEach((s) => { if (s.offsetTop <= mid) cur = s; });
    const [n, t] = cur.dataset.ch.split('|');
    if (chN.textContent !== n) { chN.textContent = n; chT.textContent = t; }
    const max = document.documentElement.scrollHeight - innerHeight;
    chBar.style.width = (max > 0 ? (y / max) * 100 : 0).toFixed(2) + '%';
  };
  chapterAt(scrollY);
  addEventListener('scroll', () => chapterAt(scrollY), { passive: true });

  /* ---------- KUSEKWA: tăieturi pe scroll, ca într-un trailer ---------- */
  const reelSec = $('.scene--reel'), shots = $$('.shot'), reelN = $('#reelN');
  let shotOn = 0;
  const cut = (i) => {
    if (i === shotOn) return;
    const prev = shots[shotOn], next = shots[i];
    prev.classList.remove('is-on'); const pv = $('video', prev); if (pv) pv.pause();
    next.classList.add('is-on'); const nv = $('video', next);
    if (nv) { if (nv.preload !== 'auto') { nv.preload = 'auto'; } nv.currentTime = 0; nv.play().catch(() => {}); }
    // următorul cadru se încarcă din timp
    const after = shots[i + 1] && $('video', shots[i + 1]); if (after && after.preload === 'none') { after.preload = 'auto'; after.load(); }
    reelN.textContent = String(i + 1).padStart(2, '0');
    shotOn = i;
  };
  const reelAt = (y) => {
    const top = reelSec.offsetTop, len = reelSec.offsetHeight - innerHeight;
    const inside = y >= top - innerHeight * 0.2 && y <= top + len + innerHeight * 0.2;
    document.body.classList.toggle('in-reel', inside);
    if (RM) return;
    const p = Math.max(0, Math.min(0.9999, (y - top) / len));
    cut(Math.floor(p * shots.length));
    const v = $('video', shots[shotOn]);
    if (v) { if (inside && v.paused) v.play().catch(() => {}); if (!inside && !v.paused) v.pause(); }
  };
  if (RM) shots.forEach((s) => { s.classList.add('is-on'); const v = $('video', s); if (v) v.preload = 'metadata'; });
  reelAt(scrollY);
  addEventListener('scroll', () => reelAt(scrollY), { passive: true });

  /* ---------- plata ---------- */
  if (CONFIG.stripeLink) {
    $('#giveCard').href = CONFIG.stripeLink;
    $('#giveHow').textContent = 'Card, Google Pay sau Apple Pay, pe pagina securizată Stripe. Sau prin transfer, cu datele de alături.';
  }
  if (CONFIG.paypalLink) { const pp = $('#givePaypal'); pp.href = CONFIG.paypalLink; pp.hidden = false; }

  /* ---------- copiere IBAN ---------- */
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copiat'; b.classList.add('ok'); }
    catch (e) { b.textContent = 'Selectează manual'; }
    setTimeout(() => { b.textContent = 'Copiază'; b.classList.remove('ok'); }, 2200);
  }));
})();
