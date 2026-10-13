/* Karibu Kusekwa — patru pagini: Acasă, Drumul, Galerie, Donează.
   CONFIG e singurul loc de schimbat când vine linkul de plată online. */
const CONFIG = {
  stripeLink: '',                          /* Stripe Payment Link cu „clientul alege suma”; gol = doar transfer bancar */
  stripeAmountParam: '__prefilled_amount', /* Stripe primește suma în bani (lei × 100) */
  departure: '2027-01-12',
  arrival: '2027-02-10'
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const page = document.body.dataset.page;
  const STILL = new URLSearchParams(location.search).has('still');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = !RM && !STILL && window.gsap;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const loaded = (img) => img.complete && img.naturalWidth ? Promise.resolve()
    : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
  const fmt = (n) => Math.round(n).toLocaleString('ro-RO');

  /* ---------- LOADER: cartela, apoi montaj într-o ramă rotunjită care devine hero-ul ---------- */
  async function runLoader(onDone) {
    const loader = $('#loader');
    let seen = false; try { seen = sessionStorage.getItem('kk4-seen') === '1'; } catch (e) {}
    // o dată pe vizită: la întoarcerea de pe altă pagină, hero-ul apare direct
    if (!motion || seen || window.__vt) { loader.remove(); html.classList.remove('is-loading'); return false; }
    const frame = $('#ldFrame'), shots = $$('img', frame), cap = $('#ldCap'), tc = $('#ldTc'), card = $('#ldCard');
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    gsap.set(frame, { opacity: 0 });
    gsap.fromTo(card.children, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .9, stagger: .3, ease: 'power2.out' });
    await Promise.all([wait(1500), fonts, Promise.race([Promise.all(shots.map(loaded)), wait(3500)])]);
    await gsap.to(card, { opacity: 0, duration: .45, ease: 'power1.in' });
    gsap.fromTo(frame, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' });
    gsap.to('.ld-cap', { opacity: 1, duration: .5, delay: .2 });
    const list = shots;
    for (const [k, img] of list.entries()) {
      shots.forEach((s) => s.classList.remove('is-on'));
      img.classList.add('is-on');
      const last = k === list.length - 1;
      if (!last) gsap.fromTo(img, { scale: 1.14 }, { scale: 1.04, duration: 1.2, ease: 'none' });
      cap.textContent = img.dataset.cap;
      tc.textContent = `${String(shots.indexOf(img) + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}`;
      await wait(last ? 650 : 420);
    }
    try { sessionStorage.setItem('kk4-seen', '1'); } catch (e) {}
    gsap.to('.ld-cap', { opacity: 0, duration: .3 });
    await gsap.to(frame, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.25, ease: 'power4.inOut' });
    loader.classList.add('is-done');
    html.classList.remove('is-loading');
    onDone();
    gsap.to(loader, { opacity: 0, duration: .5, delay: .1, onComplete: () => loader.remove() });
    return true;
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

  /* ---------- FILMUL DIN SPATE: planuri care se schimbă de la o secțiune la alta ---------- */
  const film = $('#film'), clips = film ? [...film.children] : [];
  let clipOn = -1;
  const load = (v) => { if (v && v.tagName === 'VIDEO' && !v.src) { v.src = v.dataset.src; v.load(); } };
  function show(i) {
    if (i === clipOn || !clips[i]) return;
    if (clipOn >= 0) { const old = clips[clipOn]; old.classList.remove('is-on'); if (old.pause) setTimeout(() => old.pause(), 1700); }
    clipOn = i;
    const v = clips[i]; load(v); load(clips[i + 1]);
    v.classList.add('is-on'); if (v.play) v.play().catch(() => {});
  }

  /* ---------- NAVBAR ---------- */
  const nav = $('#nav');
  const here = $(`.nav [data-nav="${page}"]`);
  if (here) {
    here.setAttribute('aria-current', 'page');
    $$('#menu a').forEach((a) => { if (a.getAttribute('href') === here.getAttribute('href')) a.setAttribute('aria-current', 'page'); });
  }
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
    if (open && motion) gsap.from($$('a', menu), { yPercent: 40, opacity: 0, stagger: .07, duration: .9, ease: 'power4.out' });
  });

  /* ---------- scroll lin ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  const go = (y) => { if (lenis) lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: typeof y === 'number' ? y : y.offsetTop, behavior: RM ? 'auto' : 'smooth' }); };

  /* ---------- „Următorul”: rama se lărgește cât cobori; la click, cadrul devine pagina următoare ---------- */
  const next = $('.next');
  if (next) {
    next.addEventListener('click', () => next.classList.add('is-going'));
    addEventListener('pageshow', () => next.classList.remove('is-going'));
    if (motion) {
      gsap.fromTo(next, { clipPath: 'inset(10% 8% 10% 8% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 25%', scrub: true } });
      const t = $('.next__t', next);
      gsap.fromTo(split(t), { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .03,
        scrollTrigger: { trigger: next, start: 'top 55%', toggleActions: 'play none none reverse' } });
    }
  }

  /* ---------- capul paginilor interioare: titlul urcă din mască, poza se apropie ---------- */
  function pageHead() {
    html.classList.remove('is-loading');
    if (!motion) return;
    const t = $('.ph__t');
    if (t) gsap.fromTo(split(t), { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: 'power4.out', stagger: .035, delay: window.__vt ? .5 : .15 });
    gsap.from($$('.ph__k, .ph__s, .ph__chip, .give-pg .donate__card'), { y: 24, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .1, delay: .6 });
    gsap.from('.nav', { opacity: 0, y: -12, duration: 1, delay: .4, ease: 'power3.out' });
    const media = $('.ph .ph__media');
    if (media) gsap.to(media, { scale: 1.1, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.ph', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* =================== ACASĂ =================== */
  function acasa() {
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
    /* hero-ul se strânge într-o ramă rotunjită și se stinge, iar în spate pornește filmul */
    function story() {
      if (!motion || !window.ScrollTrigger) { film.style.opacity = 1; show(0); return; }
      const heroEl = $('.hero');
      gsap.timeline({ scrollTrigger: { trigger: heroEl, start: 'top top', end: '+=90%', scrub: .8, pin: true, pinSpacing: true, onEnter: () => show(0) } })
        .to('.hero__copy, .hero__count', { opacity: 0, y: -30, duration: .3 }, 0)
        .to(heroEl, { clipPath: 'inset(16% 12% 22% 12% round 28px)', duration: .7, ease: 'power2.inOut' }, 0)
        .to('.hero__bg', { scale: .92, duration: .7, ease: 'power2.inOut' }, 0)
        .to(film, { opacity: 1, duration: .5 }, .25)
        .to(heroEl, { opacity: 0, y: -60, duration: .3 }, .7);
      load(clips[0]);
      $$('[data-film]').forEach((sec) => {
        const i = +sec.dataset.film;
        ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: () => show(i), onEnterBack: () => show(i) });
      });
      ScrollTrigger.create({ trigger: '.story', start: 'top bottom', end: 'bottom top',
        onLeave: () => clips[clipOn] && clips[clipOn].pause(), onEnterBack: () => clips[clipOn] && clips[clipOn].play().catch(() => {}) });
      $$('.beat').forEach((b) => {
        const h = $('.beat__h', b), pic = $('.beat__pic', b), rest = $$('.beat__k, .beat__s', b);
        const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 70%', toggleActions: 'play none none reverse' } });
        tl.fromTo(split(h), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .015 }, 0)
          .fromTo(rest, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 }, .2);
        if (pic) {
          tl.fromTo(pic, { clipPath: 'inset(12% 10% 12% 10% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'power3.inOut' }, 0)
            .fromTo($('img', pic), { scale: 1.2 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
          gsap.fromTo(pic, { y: 50 }, { y: -50, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
        }
      });
    }
    story();
    runLoader(() => heroIn(true)).then((played) => { if (!played) heroIn(false); });
  }

  /* =================== DRUMUL =================== */
  function drum() {
    pageHead();
    // numărătoarea: până la plecare, ziua din misiune, apoi întoarcerea
    const day = 864e5, today = new Date(new Date().toDateString());
    const dep = new Date(CONFIG.departure + 'T00:00'), arr = new Date(CONFIG.arrival + 'T00:00');
    const left = Math.round((dep - today) / day);
    $('#countdown').textContent = left > 1 ? `Plecăm în ${left} de zile` : left === 1 ? 'Plecăm mâine'
      : today <= arr ? `Ziua ${Math.round((today - dep) / day) + 1} din 30` : 'Ne-am întors';

    const legs = $$('.leg'), km = $('#km'), bar = $('#legsBar');
    const kms = [432, 6272, 6737, 6737];   // kilometrii adunați la capătul fiecărei etape
    film.style.opacity = 1;
    if (!motion) { show(0); legs.forEach((l) => l.style.opacity = 1); km.textContent = fmt(6737); bar.style.width = '100%'; return; }

    gsap.to(film, { opacity: 1, duration: .1 });
    show(0);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 821px)', () => {
      // pe ecran lat: etapele trec pe orizontală, kilometrii se adună cu ele
      const track = $('.legs__track'), stage = $('.legs__stage');
      const dist = () => legs[0].offsetWidth * (legs.length - 1);   // fiecare etapă se oprește exact la margine
      const state = { p: 0 };
      gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: () => '+=' + dist() * 1.2, pin: true, scrub: .8, invalidateOnRefresh: true,
          snap: { snapTo: 1 / (legs.length - 1), duration: { min: .3, max: .8 }, ease: 'power2.inOut', delay: .08 },
          onUpdate: (st) => {
            const p = st.progress, f = p * (legs.length - 1), i = Math.min(legs.length - 1, Math.round(f));
            show(i);
            const k = Math.floor(f), t = f - k;
            km.textContent = fmt(kms[k] + (kms[Math.min(k + 1, kms.length - 1)] - kms[k]) * t);
            bar.style.width = (p * 100).toFixed(2) + '%';
            legs.forEach((l, j) => l.style.opacity = j === i ? 1 : .28);
          } } })
        .to(track, { x: () => -dist(), ease: 'none' });
      return () => legs.forEach((l) => (l.style.opacity = ''));
    });
    mm.add('(max-width: 820px)', () => {
      legs.forEach((l, i) => {
        ScrollTrigger.create({ trigger: l, start: 'top 60%', end: 'bottom 40%', onEnter: () => show(i), onEnterBack: () => show(i) });
        gsap.from(l.children, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: l, start: 'top 75%' } });
      });
    });
  }

  /* =================== GALERIA =================== */
  function galerie() {
    pageHead();
    const frames = $$('.fr'), track = $('#reel'), capEl = $('#reelCap'), nEl = $('#reelN');
    const amb = [$('#ambA'), $('#ambB')]; let ambI = 0;
    const total = String(frames.length).padStart(2, '0');
    const poster = (fr) => { const m = $('img, video', fr); return m.tagName === 'VIDEO' ? m.poster : m.currentSrc || m.src; };
    const mediaOf = (fr) => $('img, video', fr);

    // cadrele video primesc proporția din poster, ca rama să aibă lățimea corectă înainte să pornească
    frames.forEach((fr) => {
      const v = $('video', fr); if (!v) return;
      const im = new Image(); im.onload = () => fr.style.setProperty('--ar', `${im.naturalWidth} / ${im.naturalHeight}`); im.src = v.poster;
    });

    let active = -1;
    function activate(i) {
      if (i === active) return;
      active = i;
      frames.forEach((fr, j) => {
        fr.classList.toggle('is-on', j === i);
        const v = $('video', fr);
        if (!v) return;
        if (j === i) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
      });
      capEl.textContent = frames[i].dataset.cap;
      nEl.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
      ambI ^= 1; amb[ambI].src = poster(frames[i]); amb[ambI].classList.add('is-on'); amb[ambI ^ 1].classList.remove('is-on');
    }

    // poziția (în px de translație) la care cadrul i stă exact în mijloc
    const centerOf = (fr) => fr.offsetLeft + fr.offsetWidth / 2 - innerWidth / 2;
    let st = null;
    if (motion) {
      const max = () => centerOf(frames[frames.length - 1]);
      const min = () => centerOf(frames[0]);
      gsap.set(track, { x: -min() });
      const tween = gsap.fromTo(track, { x: () => -min() }, { x: () => -max(), ease: 'none' });
      st = ScrollTrigger.create({
        trigger: '.reel', start: 'top top', end: () => '+=' + (max() - min()) * 1.1, pin: true, scrub: .6, animation: tween, invalidateOnRefresh: true,
        snap: { snapTo: (p) => { const c = frames.map((f) => (centerOf(f) - min()) / (max() - min())); return c.reduce((a, b) => Math.abs(b - p) < Math.abs(a - p) ? b : a); },
          duration: { min: .25, max: .7 }, ease: 'power2.inOut', delay: .08 },
        onUpdate: () => {
          const x = -gsap.getProperty(track, 'x') + innerWidth / 2;
          let best = 0, d = Infinity;
          frames.forEach((f, j) => { const dd = Math.abs(f.offsetLeft + f.offsetWidth / 2 - x); if (dd < d) { d = dd; best = j; } });
          activate(best);
        }
      });
      // imaginile au lățimea abia după încărcare: recalculăm
      Promise.all($$('.fr img').map(loaded)).then(() => ScrollTrigger.refresh());
      frames.forEach((f) => { const v = $('video', f); if (v) v.addEventListener('loadedmetadata', () => ScrollTrigger.refresh(), { once: true }); });
    } else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) activate(frames.indexOf(e.target)); }), { root: track, threshold: .6 });
      frames.forEach((f) => io.observe(f));
    }
    activate(0);

    // click pe cadrul din mijloc: se mărește; pe altul: rola vine la el
    const goTo = (i) => {
      if (!st) { frames[i].scrollIntoView({ inline: 'center', block: 'nearest' }); return; }
      const p = (centerOf(frames[i]) - centerOf(frames[0])) / (centerOf(frames[frames.length - 1]) - centerOf(frames[0]));
      go(st.start + (st.end - st.start) * p);
    };
    frames.forEach((fr, i) => fr.addEventListener('click', () => { if (i === active) openLb(i); else goTo(i); }));

    /* ---------- vizorul ---------- */
    const lb = $('#lb'), lbMedia = $('#lbMedia');
    let lbI = 0;
    function lbShow(i) {
      lbI = (i + frames.length) % frames.length;
      const src = mediaOf(frames[lbI]);
      let el;
      if (src.tagName === 'VIDEO') {
        el = document.createElement('video');
        Object.assign(el, { src: src.dataset.src, poster: src.poster, muted: true, loop: true, playsInline: true, autoplay: true, controls: true });
      } else {
        el = document.createElement('img'); el.src = src.dataset.full; el.alt = src.alt;
      }
      lbMedia.replaceChildren(el);
      $('#lbCap').textContent = frames[lbI].dataset.cap;
      $('#lbN').textContent = `${String(lbI + 1).padStart(2, '0')} / ${total}`;
      if (motion) gsap.fromTo(el, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' });
    }
    function openLb(i) { lbShow(i); lb.showModal(); if (lenis) lenis.stop(); }
    lb.addEventListener('close', () => { lbMedia.replaceChildren(); if (lenis) lenis.start(); });
    lb.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lb]');
      if (b) { const a = b.dataset.lb; if (a === 'close') lb.close(); else lbShow(lbI + (a === 'next' ? 1 : -1)); return; }
      if (e.target === lb || e.target === lbMedia) lb.close();
    });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') lbShow(lbI + 1);
      if (e.key === 'ArrowLeft') lbShow(lbI - 1);
    });
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1));
    });
  }

  /* =================== DONEAZĂ =================== */
  function doneaza() {
    pageHead();
    const online = $('#online');
    if (!CONFIG.stripeLink) { online.hidden = true; }
    else {
      $('#schoolLink').remove();
      const add = (src, extra) => { const s = document.createElement('script'); s.src = src; s.async = true; Object.assign(s, extra); document.body.appendChild(s); };
      const amount = () => {
        const other = parseInt($('#amtOther').value, 10);
        if (other >= 5) return other;
        const r = $('input[name=amt]:checked'); return r ? +r.value : 100;
      };
      const pay = () => { const u = new URL(CONFIG.stripeLink); u.searchParams.set(CONFIG.stripeAmountParam, amount() * 100); location.href = u.toString(); };
      const refresh = () => { $('#cardAmt').textContent = `${amount()} lei`; };
      $$('input[name=amt]').forEach((r) => r.addEventListener('change', () => { $('#amtOther').value = ''; refresh(); }));
      $('#amtOther').addEventListener('input', () => { if (parseInt($('#amtOther').value, 10) >= 5) $$('input[name=amt]').forEach((r) => (r.checked = false)); refresh(); });
      $('#cardPay').addEventListener('click', pay);
      $('#applePay').addEventListener('click', pay);
      window.gpayReady = () => {
        try {
          const client = new google.payments.api.PaymentsClient({ environment: 'PRODUCTION' });
          $('#googlePay').appendChild(client.createButton({ onClick: pay, buttonType: 'donate', buttonColor: 'white', buttonSizeMode: 'fill', buttonLocale: 'en', buttonRadius: 10 }));
        } catch (e) { $('#googlePay').remove(); }
      };
      add('https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js', { crossOrigin: 'anonymous' });
      add('https://pay.google.com/gp/p/js/pay.js', { onload: () => window.gpayReady() });
    }
    $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copiat'; b.classList.add('ok'); }
      catch (e) { b.textContent = 'Selectează'; }
      setTimeout(() => { b.textContent = 'Copiază'; b.classList.remove('ok'); }, 2000);
    }));
  }

  ({ acasa, drum, galerie, doneaza })[page]?.();
})();
