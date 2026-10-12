/* Karibu Kusekwa — concept.
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
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- pânza: fâșii cu tipar, fiecare cu marginea tăiată puțin strâmb ---------- */
  const INKS = ['#24324d', '#b4492c', '#2a1d16', '#5d6a36', '#8a3a24', '#1f2a3f'];
  const svg = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  const PATTERNS = [
    // zig-zag
    (c) => svg(`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20'><path d='M0 15 L10 5 L20 15 L30 5 L40 15' fill='none' stroke='${c}' stroke-width='3'/></svg>`),
    // puncte
    (c) => svg(`<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'><circle cx='5.5' cy='5.5' r='2.6' fill='${c}'/><circle cx='16.5' cy='16.5' r='2.6' fill='${c}'/></svg>`),
    // romburi
    (c) => svg(`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'><path d='M18 3 L33 18 L18 33 L3 18Z M18 11 L25 18 L18 25 L11 18Z' fill='none' stroke='${c}' stroke-width='2.4'/></svg>`),
    // dungi și triunghiuri
    (c) => svg(`<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><path d='M0 0h30v4H0z M0 30 L15 12 L30 30Z' fill='${c}'/></svg>`)
  ];
  function weave(el, n, seed) {
    const r = rng(seed);
    el.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      const ink = INKS[(i + Math.floor(r() * 2)) % INKS.length];
      s.style.setProperty('--c', ink);
      s.style.setProperty('--p', PATTERNS[i % PATTERNS.length]('rgba(243,231,207,0.13)'));
      s.style.setProperty('--s', `${30 + Math.round(r() * 20)}px`);
      // marginea de jos tăiată cu foarfeca, nu cu rigla
      const pts = ['0% 0%', '100% 0%'];
      for (let k = 10; k >= 0; k--) pts.push(`${k * 10}% ${98 + r() * 2}%`);
      s.style.clipPath = `polygon(${pts.join(',')})`;
      el.appendChild(s);
    }
    return $$('i', el);
  }
  const N = innerWidth < 700 ? 6 : 11;

  /* ---------- LOADER ---------- */
  const loaded = (img) => img.complete && img.naturalWidth ? Promise.resolve()
    : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });

  async function runLoader() {
    const loader = $('#loader');
    const strips = weave($('#cloth'), N, 7);
    if (!motion) { loader.remove(); html.classList.remove('is-loading'); return; }
    let seen = false; try { seen = sessionStorage.getItem('kk-seen') === '1'; } catch (e) {}
    const prints = $$('#ldPrints figure'), sw = $('#ldSw'), ro = $('#ldRo'), count = $('#ldCount');
    const heroImg = $('.hero__bg img');
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const r = rng(3);

    // 1. cartela
    const card = $('#ldPresents');
    gsap.fromTo(card.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .7, stagger: .15, ease: 'power2.out' });
    await Promise.all([wait(seen ? 500 : 1300), fonts]);
    await gsap.to(card, { opacity: 0, duration: .5, ease: 'power2.in' });
    card.remove();

    // 2. pozele cad pe pânză una peste alta, ca niște fotografii tipărite
    const list = seen ? prints.slice(-2) : prints;
    const total = String(prints.length).padStart(2, '0');
    for (const [k, fig] of list.entries()) {
      const i = prints.indexOf(fig);
      await Promise.race([loaded($('img', fig)), wait(1200)]);
      const tilt = (r() - .5) * 9;
      gsap.fromTo(fig, { opacity: 0, y: -60, rotate: tilt * 2.2, scale: 1.12 },
        { opacity: 1, y: 0, rotate: tilt, scale: 1, duration: .55, ease: 'back.out(1.6)' });
      sw.textContent = fig.dataset.sw; ro.textContent = fig.dataset.ro;
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
      gsap.fromTo(sw, { yPercent: 60, opacity: 0, scale: .8 }, { yPercent: 0, opacity: 1, scale: 1, duration: .45, ease: 'back.out(2.2)' });
      gsap.fromTo(ro, { opacity: 0 }, { opacity: 1, duration: .4, delay: .1 });
      await wait(k === list.length - 1 ? 650 : seen ? 380 : 470);
    }
    await Promise.race([Promise.all([loaded(heroImg), fonts]), wait(5000)]);
    try { sessionStorage.setItem('kk-seen', '1'); } catch (e) {}

    // 3. pozele se strâng, fâșiile cad din mijloc spre margini
    loader.classList.add('is-done');
    const mid = (N - 1) / 2;
    const tl = gsap.timeline({ onComplete: () => { loader.remove(); } });
    tl.to(['.ld-place', '.ld-count', '#ldSw', '#ldRo'], { opacity: 0, duration: .3, ease: 'power2.in' }, 0)
      .to(prints, { y: 40, scale: .6, opacity: 0, rotate: (i) => (i % 2 ? 14 : -14), duration: .5, ease: 'power3.in', stagger: .03 }, 0)
      .to(strips, { yPercent: 104, rotate: (i) => (i - mid) * 1.4, duration: 1, ease: 'power3.in', stagger: (i) => Math.abs(i - mid) * .06 }, .3)
      .call(() => { html.classList.remove('is-loading'); heroIn(); }, null, .75);
  }

  /* ---------- litere care sar ---------- */
  function split(el) {
    if (el.dataset.split) return $$('.ch', el);
    el.dataset.split = '1';
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, wi) => {
      const word = document.createElement('span');
      word.style.display = 'inline-block'; word.style.whiteSpace = 'nowrap';
      [...w].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; word.appendChild(s); });
      el.appendChild(word);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return $$('.ch', el);
  }
  function hop(el) {
    const chars = split(el);
    if (!motion) return;
    gsap.fromTo(chars, { yPercent: 110, rotate: () => (Math.random() - .5) * 40, opacity: 0 },
      { yPercent: 0, rotate: 0, opacity: 1, duration: .7, ease: 'back.out(2.4)', stagger: .028 });
  }

  /* ---------- HERO ---------- */
  const lines = $$('.hero__line'), imgs = $$('.hero__bg img'), ticks = $$('.hero__ticks li'), tag = $('#heroTag');
  let slide = 0, slideT = null;
  const DWELL = 5200;
  function showSlide(i) {
    const prev = slide; slide = i;
    imgs[prev].classList.remove('is-on'); imgs[i].classList.add('is-on');
    if (motion) {
      gsap.to(split(lines[prev]), { yPercent: -80, opacity: 0, duration: .35, ease: 'power2.in', stagger: .01,
        onComplete: () => { lines[prev].classList.remove('is-on'); } });
    } else lines[prev].classList.remove('is-on');
    lines[i].classList.add('is-on'); hop(lines[i]);
    tag.textContent = lines[i].dataset.tag;
    if (motion) gsap.fromTo(tag, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, delay: .3 });
    ticks.forEach((t, k) => { t.classList.toggle('is-done', k < i); const bar = $('i', t); if (window.gsap) gsap.killTweensOf(bar); bar.style.width = k < i ? '100%' : '0'; });
    if (motion) gsap.fromTo($('i', ticks[i]), { width: '0%' }, { width: '100%', duration: DWELL / 1000, ease: 'none' });
    clearTimeout(slideT);
    slideT = setTimeout(() => showSlide((slide + 1) % imgs.length), DWELL);
  }
  function heroIn() {
    split(lines[0]);
    if (motion) {
      gsap.from('.hero__bg img.is-on', { scale: 1.25, duration: 2.2, ease: 'power3.out' });
      gsap.from(['.hero__kicker', '.hero__tag', '.hero__sub', '.hero__cta', '.hero__ticks'], { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1, delay: .35 });
      gsap.from('.nav', { y: -30, opacity: 0, duration: .8, delay: .5, ease: 'power3.out' });
      hop(lines[0]);
    }
    if (!STILL) {
      if (motion) gsap.fromTo($('i', ticks[0]), { width: '0%' }, { width: '100%', duration: DWELL / 1000, ease: 'none' });
      slideT = setTimeout(() => showSlide(1), DWELL);
    }
  }
  // cât timp hero-ul nu se vede, pozele nu se mai schimbă
  new IntersectionObserver(([e]) => {
    if (STILL || html.classList.contains('is-loading')) return;
    if (!e.isIntersecting) clearTimeout(slideT);
    else { clearTimeout(slideT); slideT = setTimeout(() => showSlide((slide + 1) % imgs.length), DWELL); }
  }).observe($('.hero'));

  /* ---------- LANȚUL: poza următoare apare în mijloc, crește, cea de dedesubt se estompează ---------- */
  function chain() {
    const shots = $$('.chain__shot'), copy = $$('.chain__line');
    if (!motion || !window.ScrollTrigger) { copy.forEach((c) => (c.style.opacity = 1)); return; }
    const narrow = innerWidth < 820;
    const card = narrow ? 'inset(24% 14% 36% 14% round 22px)' : 'inset(30% 31% 30% 31% round 26px)';
    copy.forEach((c) => split($('b', c)));
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.chain', start: 'top top', end: 'bottom bottom', scrub: .6 } });
    gsap.set(copy.slice(1), { opacity: 0 });
    gsap.set(shots.slice(1), { autoAlpha: 0 });
    for (let i = 1; i < shots.length; i++) {
      const at = (i - 1) * 1;
      tl.set(shots[i], { autoAlpha: 1 }, at + .1)
        .fromTo(shots[i], { clipPath: card, rotate: i % 2 ? -3 : 3, scale: .92 }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', rotate: 0, scale: 1, duration: .8, ease: 'power2.inOut' }, at + .1)
        .to($('img', shots[i - 1]), { filter: 'blur(14px) brightness(.55)', scale: 1.08, duration: .5 }, at)
        .to(copy[i - 1], { opacity: 0, y: -40, duration: .25 }, at + .05)
        .fromTo(copy[i], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .3 }, at + .55)
        .fromTo($$('.ch', copy[i]), { yPercent: 100, rotate: (k) => (k % 2 ? 12 : -12) }, { yPercent: 0, rotate: 0, duration: .35, stagger: .006, ease: 'back.out(2)' }, at + .55);
    }
    tl.to({}, { duration: .4 });
  }

  /* ---------- NAVBAR: se umple după hero, se ascunde la coborât, revine la urcat ---------- */
  const nav = $('#nav');
  let lastY = scrollY;
  function navAt(y) {
    const solid = y > innerHeight * .8;
    nav.classList.toggle('is-solid', solid);
    nav.classList.toggle('is-hidden', solid && y > lastY + 4 && !$('.give.is-open'));
    if (y < lastY - 4 || !solid) nav.classList.remove('is-hidden');
    lastY = y;
  }
  addEventListener('scroll', () => navAt(scrollY), { passive: true });
  const burger = $('.nav__burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); menu.hidden = !open;
    if (open && motion) gsap.from($$('a, button', menu), { y: 50, opacity: 0, rotate: () => (Math.random() - .5) * 10, stagger: .06, duration: .6, ease: 'back.out(2)' });
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); menu.hidden = true; }));

  /* ---------- scroll lin ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 1.6 }); else el.scrollIntoView();
  }));

  /* ---------- PANOUL DE DONAȚIE ---------- */
  const give = $('#give'), panel = $('.give__panel');
  let lastFocus = null;
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
  function openGive() {
    lastFocus = document.activeElement;
    give.hidden = false; requestAnimationFrame(() => give.classList.add('is-open'));
    if (lenis) lenis.stop();
    setTimeout(() => $('.give__x').focus(), 60);
  }
  function closeGive() {
    give.classList.remove('is-open'); if (lenis) lenis.start();
    setTimeout(() => { give.hidden = true; if (lastFocus) lastFocus.focus(); }, 500);
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-give]')) { e.preventDefault(); if (!menu.hidden) burger.click(); openGive(); }
    else if (e.target.closest('[data-close]')) closeGive();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !give.hidden) closeGive(); });
  $('#cardPay').addEventListener('click', pay);
  $('#applePay').addEventListener('click', pay);
  if (CONFIG.stripeLink) $('#giveHow').textContent = 'Card, Apple Pay sau Google Pay, pe pagina securizată Stripe.';
  // butonul Google Pay e desenat de Google, ca în orice magazin online
  window.gpayReady = () => {
    try {
      const client = new google.payments.api.PaymentsClient({ environment: 'TEST' });
      const btn = client.createButton({ onClick: pay, buttonType: 'donate', buttonColor: 'black', buttonSizeMode: 'fill', buttonLocale: 'en', buttonRadius: 10 });
      $('#googlePay').appendChild(btn);
    } catch (e) { $('#googlePay').remove(); }
  };
  if (window.google && google.payments) window.gpayReady();

  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copiat'; b.classList.add('ok'); }
    catch (e) { b.textContent = 'Selectează'; }
    setTimeout(() => { b.textContent = 'Copiază'; b.classList.remove('ok'); }, 2000);
  }));

  /* ---------- pornire ---------- */
  chain();
  runLoader().then(() => { if (!motion) heroIn(); });
  if (STILL && new URLSearchParams(location.search).has('give')) openGive();
})();
