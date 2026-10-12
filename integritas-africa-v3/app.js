/* Karibu Kusekwa — concept, varianta cu filmul de la școală în spate.
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
    let seen = false; try { seen = sessionStorage.getItem('kk3b-seen') === '1'; } catch (e) {}
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
    try { sessionStorage.setItem('kk3b-seen', '1'); } catch (e) {}
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

  /* ---------- FILMUL DIN SPATE: clipurile se încarcă abia când e nevoie de ele ---------- */
  const film = $('#film'), clips = $$('video', film);
  let clipOn = -1;
  const load = (v) => { if (v && !v.src) { v.src = v.dataset.src; v.load(); } };
  function show(i) {
    if (i === clipOn || !clips[i]) return;
    if (clipOn >= 0) { clips[clipOn].classList.remove('is-on'); const old = clips[clipOn]; setTimeout(() => old.pause(), 1700); }
    clipOn = i;
    const v = clips[i]; load(v); load(clips[i + 1]);
    v.classList.add('is-on'); v.play().catch(() => {});
  }

  /* ---------- HERO → FILM: hero-ul se strânge într-o ramă rotunjită și se stinge,
     iar în spatele lui pornește filmul de la școală ---------- */
  function story() {
    if (!motion || !window.ScrollTrigger) { film.style.opacity = 1; show(0); return; }
    const hero = $('.hero');
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=90%', scrub: .8, pin: true, pinSpacing: true,
        onEnter: () => show(0) } })
      .to('.hero__copy, .hero__count', { opacity: 0, y: -30, duration: .3 }, 0)
      .to(hero, { clipPath: 'inset(16% 12% 22% 12% round 28px)', duration: .7, ease: 'power2.inOut' }, 0)
      .to('.hero__bg', { scale: .92, duration: .7, ease: 'power2.inOut' }, 0)
      .to(film, { opacity: 1, duration: .5 }, .25)
      .to(hero, { opacity: 0, y: -60, duration: .3 }, .7);
    load(clips[0]);

    // fiecare secțiune își aduce planul ei de fundal
    $$('[data-film]').forEach((sec) => {
      const i = +sec.dataset.film;
      ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: () => show(i), onEnterBack: () => show(i) });
    });
    // când ieși cu totul din poveste, filmul stă
    ScrollTrigger.create({ trigger: '.story', start: 'top bottom', end: 'bottom top',
      onLeave: () => clips[clipOn] && clips[clipOn].pause(), onEnterBack: () => clips[clipOn] && clips[clipOn].play().catch(() => {}) });

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
