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
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const loaded = (img) => img.complete && img.naturalWidth ? Promise.resolve()
    : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });

  /* ---------- LOADER: cartela, apoi un montaj de cadre într-o ramă rotunjită; ultimul cadru
     e chiar prima poză din hero, iar rama se lărgește până devine hero-ul ---------- */
  async function runLoader() {
    const loader = $('#loader');
    if (!motion) { loader.remove(); html.classList.remove('is-loading'); return; }
    let seen = false; try { seen = sessionStorage.getItem('kk-seen') === '1'; } catch (e) {}
    const frame = $('#ldFrame'), shots = $$('img', frame), cap = $('#ldCap'), tc = $('#ldTc'), card = $('#ldCard');
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    gsap.set(frame, { opacity: 0 });

    // 1. cartela
    gsap.fromTo(card.children, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .9, stagger: .3, ease: 'power2.out' });
    await Promise.all([wait(seen ? 600 : 1500), fonts, Promise.race([Promise.all(shots.map(loaded)), wait(3500)])]);
    await gsap.to(card, { opacity: 0, duration: .45, ease: 'power1.in' });

    // 2. rama apare, cadrele se taie pe ritm
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
    await Promise.race([fonts, wait(2000)]);
    try { sessionStorage.setItem('kk-seen', '1'); } catch (e) {}

    // 3. rama se lărgește până umple ecranul: e deja poza din hero, deci nu se vede nicio tăietură
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
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, wi) => {
      const word = document.createElement('span');
      word.className = 'wd'; word.style.whiteSpace = 'nowrap';
      [...w].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; word.appendChild(s); });
      el.appendChild(word);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return $$('.ch', el);
  }
  function rise(el, delay = 0) {
    const chars = split(el);
    if (motion) gsap.fromTo(chars, { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .02, delay });
  }

  /* ---------- HERO: pozele se schimbă singure, încet, ca într-un montaj ---------- */
  const lines = $$('.hero__line'), imgs = $$('.hero__bg img'), tag = $('#heroTag'), heroN = $('#heroN'), heroBar = $('#heroBar');
  let slide = 0, slideT = null;
  const DWELL = 6000;
  const runBar = () => { if (motion) gsap.fromTo(heroBar, { width: '0%' }, { width: '100%', duration: DWELL / 1000, ease: 'none' }); };
  function showSlide(i) {
    const prev = slide; slide = i;
    imgs[prev].classList.remove('is-on'); imgs[i].classList.add('is-on');
    if (motion) {
      gsap.to(split(lines[prev]), { yPercent: -105, duration: .6, ease: 'power3.in', stagger: .01,
        onComplete: () => lines[prev].classList.remove('is-on') });
    } else lines[prev].classList.remove('is-on');
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
  // cât timp hero-ul nu se vede, montajul stă
  new IntersectionObserver(([e]) => {
    if (STILL || html.classList.contains('is-loading')) return;
    clearTimeout(slideT);
    if (e.isIntersecting) slideT = setTimeout(() => showSlide((slide + 1) % imgs.length), DWELL);
  }).observe($('.hero'));

  /* ---------- LANȚUL: cadrul următor urcă de jos ca o ramă rotunjită și se lărgește până
     umple ecranul; cel vechi se trage puțin înapoi și se întunecă ---------- */
  function chain() {
    const shots = $$('.chain__shot'), copy = $$('.chain__line'), n = $('#chainN');
    if (!motion || !window.ScrollTrigger) { copy.forEach((c) => (c.style.opacity = 1)); return; }
    copy.forEach((c) => split($('b', c)));
    gsap.set(copy.slice(1), { opacity: 0 });
    gsap.set(shots.slice(1), { clipPath: 'inset(100% 6% 0% 6% round 24px)' });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: '.chain', start: 'top top', end: 'bottom bottom', scrub: .8,
      onUpdate: (st) => { n.textContent = String(Math.min(shots.length, Math.floor(st.progress * (shots.length - 1) + 1.5))).padStart(2, '0'); }
    } });
    for (let i = 1; i < shots.length; i++) {
      const at = i - 1;
      tl.fromTo(shots[i], { clipPath: 'inset(100% 6% 0% 6% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: .85, ease: 'power3.inOut' }, at + .1)
        .fromTo($('img', shots[i]), { yPercent: 10, scale: 1.12 }, { yPercent: 0, scale: 1, duration: 1, ease: 'power2.out' }, at + .1)
        .to($('img', shots[i - 1]), { scale: .94, filter: 'brightness(.35) saturate(.7)', duration: .85, ease: 'power3.inOut' }, at + .1)
        .to(copy[i - 1], { opacity: 0, duration: .2 }, at + .05)
        .set(copy[i], { opacity: 1 }, at + .55)
        .fromTo($$('.ch', copy[i]), { yPercent: 105 }, { yPercent: 0, duration: .4, stagger: .006, ease: 'power3.out' }, at + .55)
        .fromTo($('span', copy[i]), { opacity: 0 }, { opacity: 1, duration: .25 }, at + .75);
    }
    tl.to({}, { duration: .4 });
  }

  /* ---------- NAVBAR: se umple după hero, se ascunde la coborât, revine la urcat ---------- */
  const nav = $('#nav');
  let lastY = scrollY;
  function navAt(y) {
    const solid = y > innerHeight * .85;
    nav.classList.toggle('is-solid', solid);
    if (solid && y > lastY + 4 && !$('.give.is-open')) nav.classList.add('is-hidden');
    if (y < lastY - 4 || !solid) nav.classList.remove('is-hidden');
    lastY = y;
  }
  addEventListener('scroll', () => navAt(scrollY), { passive: true });
  const burger = $('.nav__burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); menu.hidden = !open;
    $('span', burger).textContent = open ? 'Închide' : 'Meniu';
    if (open && motion) gsap.from($$('a, button', menu), { yPercent: 40, opacity: 0, stagger: .07, duration: .9, ease: 'power4.out' });
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => { if (!menu.hidden) burger.click(); }));

  /* ---------- scroll lin ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 1.8 }); else el.scrollIntoView();
  }));

  /* ---------- PANOUL DE DONAȚIE ---------- */
  const give = $('#give');
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
    setTimeout(() => { give.hidden = true; if (lastFocus) lastFocus.focus(); }, 800);
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
      const btn = client.createButton({ onClick: pay, buttonType: 'donate', buttonColor: 'white', buttonSizeMode: 'fill', buttonLocale: 'en', buttonRadius: 10 });
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
