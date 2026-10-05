/* Integritas · Africa — concept. Loader de film + o singură zi pe savană, legată de scroll. */
(() => {
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
    const tiles = svg.classList.contains('ld-layer') ? 3 : 1;
    svg.setAttribute('viewBox', `0 0 ${W * tiles} ${H}`);
    let out = `<g id="t-${kind}">${g}</g>`;
    for (let i = 1; i < tiles; i++) out += `<use href="#t-${kind}" x="${W * i}"/>`;
    svg.innerHTML = out;
  }
  function paintAll() {
    paintLayer($('.ld-far'), 'far', 11);
    paintLayer($('.ld-mid'), 'mid', 23);
    paintLayer($('.ld-near'), 'near', 37);
    paintLayer($('.sky-hills--far'), 'skyfar', 51);
    paintLayer($('.sky-hills--near'), 'skynear', 67);
    paintLayer($('.sky-front'), 'front', 83);
  }
  paintAll();
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(paintAll, 200); });

  /* ---------- LOADER ---------- */
  const loader = $('#loader');
  const cam = $('.ld-cam');
  const layers = $$('.ld-layer').map((el) => ({ el, sp: +el.dataset.speed }));
  const gir = $('.ld-giraffe'), lion = $('.ld-lion'), jeep = $('.ld-jeep');
  const cvs = $('.ld-dust'), ctx = cvs.getContext('2d');
  const pctEl = $('#ldPct'), barEl = $('#ldBar');
  let seen = false; try { seen = sessionStorage.getItem('ia-seen') === '1'; } catch (e) {}
  const MIN = RM ? 600 : seen ? 2200 : 4600;
  const t0 = performance.now();
  let loaded = 0, total = 0, ready = false, running = true;

  // ce trebuie încărcat: toate imaginile + fonturile
  const srcs = [...new Set($$('img').map((i) => i.currentSrc || i.src))];
  total = srcs.length + 1;
  srcs.forEach((s) => { const im = new Image(); im.onload = im.onerror = () => loaded++; im.src = s; });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => loaded++);
  setTimeout(() => { loaded = total; }, 9000); // nu ținem pe nimeni ostatic

  function sizeCanvas() { cvs.width = innerWidth; cvs.height = innerHeight; }
  sizeCanvas(); addEventListener('resize', sizeCanvas);
  const dust = [];
  function puff(x, y, n, s) {
    for (let i = 0; i < n; i++) dust.push({ x: x + (Math.random() - 0.5) * 10, y: y - Math.random() * 6, vx: -(1.2 + Math.random() * 2.2) * s, vy: -(0.15 + Math.random() * 0.5), r: 3 + Math.random() * 8 * s, a: 0.32 + Math.random() * 0.2, life: 1 });
  }
  function foot(el, fx) { const b = el.getBoundingClientRect(); return [b.left + b.width * fx, b.bottom - 2]; }

  let last = t0;
  function frame(now) {
    if (!running) return;
    const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    // pan de cameră: lumea fuge spre stânga, noi urmărim animalele
    const vw = innerWidth;
    layers.forEach(({ el, sp }) => { el.style.transform = `translate3d(${-((t * sp * vw * 0.42) % vw)}px,0,0)`; });
    // mișcarea camerei: o apropiere lentă și un tremur de mână
    const push = 1 + Math.min(t / 6, 1) * 0.06;
    cam.style.transform = `scale(${push}) translate(${Math.sin(t * 1.3) * 2}px, ${Math.sin(t * 2.1) * 1.5}px)`;
    // girafa: galop lent, legănat
    const gp = t * Math.PI * 2 * 1.25;
    gir.style.transform = `translate(${Math.sin(t * 0.6) * 1.5}vw, ${-Math.abs(Math.sin(gp)) * 3}%) rotate(${Math.sin(gp) * 3.2}deg)`;
    // leul: salturi scurte, se strânge și se întinde, câștigă teren
    const lp = t * Math.PI * 2 * 2.4;
    const gain = Math.sin(t * 0.9) * 3 + Math.min(t, 4) * 0.9;
    lion.style.transform = `translate(${gain}vw, ${-Math.max(0, Math.sin(lp)) * 16}%) scaleX(${1 + Math.sin(lp) * 0.05}) rotate(${Math.sin(lp + 1) * -4}deg)`;
    // mașina: noi, pe drum de pământ
    jeep.style.transform = `translate(${Math.sin(t * 0.7) * 1.2 + Math.min(t, 4) * 0.5}vw, ${(Math.sin(t * 23) * 0.6 + Math.sin(t * 9) * 1.2).toFixed(2)}px) rotate(${Math.sin(t * 7) * 0.6}deg)`;
    // praf din spatele fiecăruia
    if (Math.random() < 0.9) { const [x, y] = foot(gir, 0.3); puff(x, y, 1, 0.8); }
    if (Math.random() < 0.9) { const [x, y] = foot(lion, 0.25); puff(x, y, 2, 0.9); }
    { const [x, y] = foot(jeep, 0.15); puff(x, y, 2, 1.3); }
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for (let i = dust.length - 1; i >= 0; i--) {
      const p = dust[i];
      p.x += p.vx * 60 * dt; p.y += p.vy * 60 * dt; p.r += 14 * dt; p.life -= 0.55 * dt;
      if (p.life <= 0) { dust.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(214,128,62,${p.a * p.life})`); g.addColorStop(1, 'rgba(214,128,62,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
    // progres: cel mai mic dintre timp și încărcare, ca să nu sară
    const p = Math.min(loaded / total, (now - t0) / MIN);
    pctEl.textContent = String(Math.floor(p * 100)).padStart(2, '0');
    barEl.style.width = (p * 100).toFixed(1) + '%';
    if (p >= 1 && !ready) { ready = true; outro(); }
    requestAnimationFrame(frame);
  }

  function staticLoader() {
    const tick = () => {
      const p = Math.min(loaded / total, (performance.now() - t0) / MIN);
      pctEl.textContent = String(Math.floor(p * 100)).padStart(2, '0');
      barEl.style.width = p * 100 + '%';
      if (p >= 1) { ready = true; outro(); } else setTimeout(tick, 80);
    };
    tick();
  }

  function outro() {
    try { sessionStorage.setItem('ia-seen', '1'); } catch (e) {}
    const done = () => { running = false; loader.remove(); };
    document.body.classList.remove('is-loading');
    if (RM || !window.gsap) { loader.style.transition = 'opacity .4s'; loader.style.opacity = 0; setTimeout(done, 450); heroIn(); return; }
    loader.classList.add('is-done');
    const tl = gsap.timeline({ onComplete: done });
    tl.to('.ld-bar--top', { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, 0)
      .to('.ld-bar--bot', { yPercent: 100, duration: 0.9, ease: 'power3.inOut' }, 0)
      .to(cam, { scale: 1.35, duration: 1.4, ease: 'power2.in' }, 0)
      .to(loader, { opacity: 0, duration: 0.7, ease: 'power1.in' }, 0.65)
      .add(heroIn, 0.75);
  }

  if (RM) { staticLoader(); } else requestAnimationFrame(frame);

  /* ---------- CERUL: o singură zi, de la apus la dimineață ---------- */
  const SKY = {
    hero:     ['#3e1c14', '#b04a24', '#f0a04a', '#ffe2a6', 70, 1, 0, '#4a2114', '#1c0c08'],
    lion:     ['#34170f', '#93391c', '#e0813a', '#ffcb7c', 79, 1, 0, '#3d1a10', '#170a06'],
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
      onEnter: () => { setTimeout(hop, 500); hopT = setInterval(hop, 5200); },
      onEnterBack: () => { hop(); hopT = setInterval(hop, 5200); },
      onLeave: () => clearInterval(hopT), onLeaveBack: () => clearInterval(hopT) });
    btn.addEventListener('mouseenter', hop);

    // fiecare cadru se stinge înainte să se dezlipească, ca să nu se vadă marginea scenei
    $$('.scene:not(.scene--every):not(.scene--partners):not(.scene--give)').forEach((s) => {
      gsap.to($('.stage', s), { opacity: 0, ease: 'power1.in', scrollTrigger: { trigger: s, start: 'bottom 122%', end: 'bottom 100%', scrub: 0.3 } });
    });
    addEventListener('load', () => ScrollTrigger.refresh());
    ScrollTrigger.addEventListener('refresh', () => { measure(); applySky(scrollY); });
  }

  /* ---------- copiere IBAN ---------- */
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copiat'; b.classList.add('ok'); }
    catch (e) { b.textContent = 'Selectează manual'; }
    setTimeout(() => { b.textContent = 'Copiază'; b.classList.remove('ok'); }, 2200);
  }));
})();
