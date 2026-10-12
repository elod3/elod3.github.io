/* Karibu Kusekwa — concept, varianta cu savana.
   CONFIG e singurul loc de schimbat când vin datele de plată de la școală. */
const CONFIG = {
  stripeLink: '',                          /* Stripe Payment Link cu „clientul alege suma” */
  stripeAmountParam: '__prefilled_amount', /* Stripe primește suma în bani (lei × 100) */
  fallbackLink: 'https://liceulintegritas.ro/donatii'
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const STILL = new URLSearchParams(location.search).has('still');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = !RM && !STILL && window.gsap;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const loaded = (img) => img.complete && img.naturalWidth ? Promise.resolve()
    : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });

  /* ---------- LOADER: cartela, apoi montaj într-o ramă rotunjită care devine hero-ul ---------- */
  async function runLoader() {
    const loader = $('#loader');
    if (!motion) { loader.remove(); html.classList.remove('is-loading'); return; }
    let seen = false; try { seen = sessionStorage.getItem('kk3-seen') === '1'; } catch (e) {}
    const frame = $('#ldFrame'), shots = $$('img', frame), cap = $('#ldCap'), tc = $('#ldTc'), card = $('#ldCard');
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    gsap.set(frame, { opacity: 0 });
    gsap.fromTo(card.children, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .9, stagger: .3, ease: 'power2.out' });
    await Promise.all([wait(seen ? 600 : 1500), fonts, Promise.race([Promise.all(shots.map(loaded)), wait(3500)])]);
    await gsap.to(card, { opacity: 0, duration: .45, ease: 'power1.in' });
    gsap.fromTo(frame, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' });
    gsap.to('.ld-cap', { opacity: 1, duration: .5, delay: .2 });
    const list = seen ? shots.slice(-2) : shots;
    for (const [k, img] of list.entries()) {
      shots.forEach((s) => s.classList.remove('is-on'));
      img.classList.add('is-on');
      const last = k === list.length - 1;
      if (!last) gsap.fromTo(img, { scale: 1.14 }, { scale: 1.04, duration: 1.2, ease: 'none' });
      cap.textContent = img.dataset.cap;
      tc.textContent = `${String(shots.indexOf(img) + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}`;
      await wait(last ? 650 : 420);
    }
    try { sessionStorage.setItem('kk3-seen', '1'); } catch (e) {}
    gsap.to('.ld-cap', { opacity: 0, duration: .3 });
    await gsap.to(frame, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.25, ease: 'power4.inOut' });
    loader.classList.add('is-done');
    html.classList.remove('is-loading');
    heroIn(true);
    gsap.to(loader, { opacity: 0, duration: .5, delay: .1, onComplete: () => loader.remove() });
  }

  /* ---------- literele urcă din spatele unei măști ---------- */
  function split(el) {
    if (el.dataset.split) return $$('.ch', el);
    el.dataset.split = '1';
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.textContent = '';
    parts.forEach((part, pi) => {
      const tmp = document.createElement('div'); tmp.innerHTML = part;
      const words = tmp.textContent.trim().split(/\s+/).filter(Boolean);
      words.forEach((w, wi) => {
        const word = document.createElement('span');
        word.className = 'wd'; word.style.whiteSpace = 'nowrap';
        [...w].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; word.appendChild(s); });
        el.appendChild(word);
        if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      if (pi < parts.length - 1) el.appendChild(document.createElement('br'));
    });
    return $$('.ch', el);
  }
  function rise(el, delay = 0) {
    const chars = split(el);
    if (motion) gsap.fromTo(chars, { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .02, delay });
  }

  /* ---------- HERO ---------- */
  const lines = $$('.hero__line'), imgs = $$('.hero__bg img'), tag = $('#heroTag'), heroN = $('#heroN'), heroBar = $('#heroBar');
  let slide = 0, slideT = null;
  const DWELL = 6000;
  const runBar = () => { if (motion) gsap.fromTo(heroBar, { width: '0%' }, { width: '100%', duration: DWELL / 1000, ease: 'none' }); };
  function showSlide(i) {
    const prev = slide; slide = i;
    imgs[prev].classList.remove('is-on'); imgs[i].classList.add('is-on');
    if (motion) gsap.to(split(lines[prev]), { yPercent: -105, duration: .6, ease: 'power3.in', stagger: .01, onComplete: () => lines[prev].classList.remove('is-on') });
    else lines[prev].classList.remove('is-on');
    lines[i].classList.add('is-on'); rise(lines[i], .35);
    tag.textContent = lines[i].dataset.tag;
    if (motion) gsap.fromTo(tag, { opacity: 0 }, { opacity: 1, duration: .8, delay: .7 });
    heroN.textContent = String(i + 1).padStart(2, '0');
    runBar();
    clearTimeout(slideT);
    slideT = setTimeout(() => showSlide((slide + 1) % imgs.length), DWELL);
  }
  function heroIn(matchCut) {
    split(lines[0]);
    if (motion) {
      if (!matchCut) gsap.fromTo('.hero__bg img.is-on', { scale: 1.2 }, { scale: 1.02, duration: 2.6, ease: 'power3.out', clearProps: 'transform' });
      gsap.from(['.hero__kicker', '.hero__tag', '.hero__sub', '.hero__cta', '.hero__count'], { y: 24, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .1, delay: .7 });
      gsap.from('.nav', { opacity: 0, y: -12, duration: 1, delay: .6, ease: 'power3.out' });
      rise(lines[0], .45);
    }
    if (!STILL) { runBar(); slideT = setTimeout(() => showSlide(1), DWELL); }
  }
  new IntersectionObserver(([e]) => {
    if (STILL || html.classList.contains('is-loading')) return;
    clearTimeout(slideT);
    if (e.isIntersecting) slideT = setTimeout(() => showSlide((slide + 1) % imgs.length), DWELL);
  }).observe($('.hero'));

  /* ---------- SAVANA: dealuri cu salcâmi desenate în cod, repetate fără cusătură ---------- */
  const sv = $('#savanna');
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function ridge(W, H, base, amp, harm, r) {
    const ph = harm.map(() => r() * Math.PI * 2), pts = [];
    for (let x = 0; x <= W; x += Math.max(4, W / 220)) {
      let y = 0;
      harm.forEach((k, i) => { y += Math.sin((x / W) * Math.PI * 2 * k + ph[i]) / (i + 1); });
      pts.push([x, H * base - y * amp]);
    }
    return `M0 ${H} L${pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L')} L${W} ${H} Z`;
  }
  function acacia(x, y, h, r) {
    // trunchi bifurcat și coroană plată, ca o umbrelă
    const w = h * (1.5 + r() * .7), fork = y - h * (.42 + r() * .1), top = y - h, t = Math.max(1.5, h * .035);
    const d = `M${x - t} ${y} L${x - t * .6} ${fork} L${x - w * .28} ${top + h * .12} L${x - w * .28 + t * 1.4} ${top + h * .12} L${x} ${fork - h * .06} L${x + w * .22 - t} ${top + h * .1} L${x + w * .22 + t * .6} ${top + h * .1} L${x + t * .8} ${fork} L${x + t} ${y} Z`;
    let c = '';
    const n = 12 + Math.floor(r() * 6);
    for (let i = 0; i < n; i++) {
      const cx = x - w / 2 + (w * (i + .5)) / n + (r() - .5) * w * .08, edge = Math.abs((i + .5) / n - .5) * 2;
      const cy = top + h * .04 + edge * h * .07 + r() * h * .04, rx = (w / n) * (.8 + r() * .9), ry = h * (.04 + r() * .06) * (1 - edge * .45);
      c += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"/>`;
    }
    return `<path d="${d}"/>${c}`;
  }
  function grass(W, H, y, r, dens, hmax) {
    let d = '';
    for (let x = 0; x < W; x += dens * (.5 + r())) {
      const h = hmax * (.3 + r() * .7), lean = (r() - .5) * h * .6;
      d += `M${(x - 2).toFixed(1)} ${y} Q${(x + lean * .4).toFixed(1)} ${(y - h * .6).toFixed(1)} ${(x + lean).toFixed(1)} ${(y - h).toFixed(1)} Q${(x + lean * .3 + 1).toFixed(1)} ${(y - h * .5).toFixed(1)} ${(x + 2).toFixed(1)} ${y} Z`;
    }
    return `<path d="${d}"/>`;
  }
  function paint(svg, kind, seed) {
    const W = innerWidth, H = svg.getBoundingClientRect().height || innerHeight * .3, r = rng(seed);
    let g = '';
    if (kind === 'far') {
      g += `<path d="${ridge(W, H, .6, H * .1, [1, 2, 5], r)}"/>`;
      for (let i = 0; i < 4; i++) g += acacia(r() * W, H * .64, H * (.12 + r() * .1), r);
    } else if (kind === 'mid') {
      g += `<path d="${ridge(W, H, .72, H * .07, [2, 3, 7], r)}"/>`;
      const n = W < 700 ? 1 : 2;
      for (let i = 0; i < n; i++) g += acacia(W * (i + .25 + r() * .5) / n, H * .76, H * (.5 + r() * .25), r);
    } else {
      g += `<path d="${ridge(W, H, .62, H * .1, [1, 3, 4], r)}"/>`;
      g += grass(W, H, H * .66, r, 8, H * .45);
    }
    svg.setAttribute('viewBox', `0 0 ${W * 3} ${H}`);
    svg.innerHTML = `<g id="sv-${kind}">${g}</g><use href="#sv-${kind}" x="${W}"/><use href="#sv-${kind}" x="${W * 2}"/>`;
  }
  const paintAll = () => { paint($('.sv-far'), 'far', 11); paint($('.sv-mid'), 'mid', 23); paint($('.sv-near'), 'near', 37); };
  paintAll();
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(paintAll, 200); });

  // cerul, de la apus la noapte și înapoi la zori, cât cobori prin poveste
  const SKY = [
    ['#3e1c14', '#b04a24', '#f0a04a', '#ffe2a6', 62, 1, 0, '#4a2114', '#1c0c08'],
    ['#25120d', '#6e2a17', '#c0612b', '#ffb262', 82, .9, .25, '#2c140c', '#120806'],
    ['#0b0a12', '#191626', '#2c2030', '#ff9050', 112, 0, 1, '#120c0e', '#070505'],
    ['#0e0d16', '#231b2c', '#3d2a33', '#ff9050', 112, 0, .8, '#16100f', '#090606'],
    ['#2f3340', '#9a6a4c', '#eeb170', '#fff0c8', 74, 1, .1, '#4a2c1c', '#241510']
  ];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  const lerp = (a, b, t) => a + (b - a) * t;
  function sky(p) {
    const f = Math.max(0, Math.min(.9999, p)) * (SKY.length - 1), i = Math.floor(f);
    let t = f - i; t = t * t * (3 - 2 * t);
    const A = SKY[i], B = SKY[i + 1], st = sv.style;
    ['--sky-top', '--sky-mid', '--sky-low', '--sun'].forEach((k, j) => st.setProperty(k, mix(A[j], B[j], t)));
    st.setProperty('--sun-y', lerp(A[4], B[4], t) + 'vh');
    st.setProperty('--sun-o', lerp(A[5], B[5], t).toFixed(3));
    st.setProperty('--stars', lerp(A[6], B[6], t).toFixed(3));
    st.setProperty('--hill-far', mix(A[7], B[7], t));
    st.setProperty('--hill-near', mix(A[8], B[8], t));
  }
  sky(0);

  // praful din aer, câteva fire care plutesc în lumina de apus
  const cvs = $('.sv-dust'), ctx = cvs.getContext('2d');
  const motes = [];
  const sizeDust = () => { cvs.width = innerWidth; cvs.height = innerHeight; };
  sizeDust(); addEventListener('resize', sizeDust);
  for (let i = 0; i < 46; i++) motes.push({ x: Math.random(), y: .35 + Math.random() * .6, r: .6 + Math.random() * 1.8, v: .00004 + Math.random() * .00012, ph: Math.random() * 6 });
  let dustOn = false;
  function dust(t) {
    if (!dustOn) return;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for (const m of motes) {
      m.x -= m.v * 16; if (m.x < -.02) m.x = 1.02;
      const y = (m.y + Math.sin(t / 2400 + m.ph) * .01) * cvs.height;
      ctx.fillStyle = `rgba(255,214,150,${.18 + .22 * Math.sin(t / 900 + m.ph) ** 2})`;
      ctx.beginPath(); ctx.arc(m.x * cvs.width, y, m.r, 0, 7); ctx.fill();
    }
    requestAnimationFrame(dust);
  }

  /* ---------- HERO → SAVANA: hero-ul se strânge într-o ramă rotunjită și se stinge,
     iar în spatele lui se aprinde savana ---------- */
  function story() {
    if (!motion || !window.ScrollTrigger) { sv.style.opacity = 1; return; }
    const hero = $('.hero');
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=90%', scrub: .8, pin: true, pinSpacing: true } })
      .to('.hero__copy, .hero__count', { opacity: 0, y: -30, duration: .3 }, 0)
      .to(hero, { clipPath: 'inset(16% 12% 22% 12% round 28px)', duration: .7, ease: 'power2.inOut' }, 0)
      .to('.hero__bg', { scale: .92, duration: .7, ease: 'power2.inOut' }, 0)
      .to(sv, { opacity: 1, duration: .5 }, .25)
      .to(hero, { opacity: 0, y: -60, duration: .3 }, .7);
    ScrollTrigger.create({ trigger: '.story', start: 'top bottom', end: 'bottom top',
      onToggle: (st) => { dustOn = st.isActive; if (dustOn) requestAnimationFrame(dust); } });

    // cerul, dealurile și animalele merg odată cu toată povestea
    const sto = $('.story');
    ScrollTrigger.create({ trigger: sto, start: 'top bottom', end: 'bottom bottom', scrub: true,
      onUpdate: (st) => {
        const p = st.progress, vw = innerWidth;
        sky(p);
        gsap.set('.sv-far', { x: -(p * vw * .6) % vw });
        gsap.set('.sv-mid', { x: -(p * vw * 1.4) % vw });
        gsap.set('.sv-near', { x: -(p * vw * 2.6) % vw });
        gsap.set('.sv-giraffe', { x: -p * (vw * 1.35), y: Math.abs(Math.sin(p * 90)) * -4 });
        const lp = Math.max(0, Math.min(1, (p - .3) / .45));
        gsap.set('.sv-lion', { x: -lp * (vw * 1.5), y: Math.max(0, Math.sin(p * 160)) * -6 });
      } });

    // fiecare bătaie: textul urcă din mască, poza se descoperă dintr-o ramă mai mică
    $$('.beat, .donate').forEach((b) => {
      const h = $('.beat__h', b), pic = $('.beat__pic', b), rest = $$('.beat__k, .beat__s, .donate__card', b);
      split(h);
      const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 70%', toggleActions: 'play none none reverse' } });
      tl.fromTo($$('.ch', h), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .015 }, 0)
        .fromTo(rest, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 }, .2);
      if (pic) {
        tl.fromTo(pic, { clipPath: 'inset(12% 10% 12% 10% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'power3.inOut' }, 0)
          .fromTo($('img', pic), { scale: 1.2 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
        gsap.fromTo(pic, { y: 50 }, { y: -50, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
    });
  }

  /* ---------- NAVBAR ---------- */
  const nav = $('#nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY, solid = y > innerHeight * .85;
    nav.classList.toggle('is-solid', solid);
    if (solid && y > lastY + 4) nav.classList.add('is-hidden');
    if (y < lastY - 4 || !solid) nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });
  const burger = $('.nav__burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); menu.hidden = !open;
    $('span', burger).textContent = open ? 'Închide' : 'Meniu';
    if (open && motion) gsap.from($$('a, button', menu), { yPercent: 40, opacity: 0, stagger: .07, duration: .9, ease: 'power4.out' });
  });

  /* ---------- scroll lin ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  const go = (el) => { if (lenis) lenis.scrollTo(el, { duration: 2 }); else el.scrollIntoView(); };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault(); if (!menu.hidden) burger.click(); go(el);
  }));
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-give]')) { e.preventDefault(); if (!menu.hidden) burger.click(); go($('#doneaza')); }
  });

  /* ---------- DONAȚIA ---------- */
  const amount = () => {
    const other = parseInt($('#amtOther').value, 10);
    if (other >= 5) return other;
    const r = $('input[name=amt]:checked'); return r ? +r.value : 100;
  };
  const payUrl = () => {
    if (!CONFIG.stripeLink) return CONFIG.fallbackLink;
    const u = new URL(CONFIG.stripeLink); u.searchParams.set(CONFIG.stripeAmountParam, amount() * 100); return u.toString();
  };
  const pay = () => { location.href = payUrl(); };
  const refresh = () => { $('#cardAmt').textContent = `${amount()} lei`; };
  $$('input[name=amt]').forEach((r) => r.addEventListener('change', () => { $('#amtOther').value = ''; refresh(); }));
  $('#amtOther').addEventListener('input', () => { if (parseInt($('#amtOther').value, 10) >= 5) $$('input[name=amt]').forEach((r) => (r.checked = false)); refresh(); });
  $('#cardPay').addEventListener('click', pay);
  $('#applePay').addEventListener('click', pay);
  if (CONFIG.stripeLink) $('#giveHow').textContent = 'Card, Apple Pay sau Google Pay, pe pagina securizată Stripe.';
  window.gpayReady = () => {
    try {
      const client = new google.payments.api.PaymentsClient({ environment: 'TEST' });
      $('#googlePay').appendChild(client.createButton({ onClick: pay, buttonType: 'donate', buttonColor: 'white', buttonSizeMode: 'fill', buttonLocale: 'en', buttonRadius: 10 }));
    } catch (e) { $('#googlePay').remove(); }
  };
  if (window.google && google.payments) window.gpayReady();
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copiat'; b.classList.add('ok'); }
    catch (e) { b.textContent = 'Selectează'; }
    setTimeout(() => { b.textContent = 'Copiază'; b.classList.remove('ok'); }, 2000);
  }));

  /* ---------- pornire ---------- */
  story();
  runLoader().then(() => { if (!motion) heroIn(); });
})();
