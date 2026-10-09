/* Kusekwa — clasa a XII-a, Liceul Integritas.
   Pagina e drumul: globul duce privitorul de la Budiu Mic la Kusekwa, cu autocarul,
   avionul și mașina, apoi coboară în lumina de la fața locului, apoi pe hârtie, la cifre. */
(() => {
  'use strict';

  /* ======================================================================
     CONFIG — singurul loc de schimbat când vin datele de la școală.
     ====================================================================== */
  const CONFIG = {
    // Stripe Payment Link cu „clientul alege suma”. Card, Google Pay și Apple Pay
    // apar automat pe pagina Stripe, fără backend. Gol = butonul duce la /donatii.
    stripeLink: '',
    stripeAmountParam: '__prefilled_amount',
    fallbackLink: 'https://liceulintegritas.ro/donatii',
    // buton separat; PayPal nu merge prin Stripe pe cont din România
    paypalLink: '',
    // opririle, cu mijlocul de transport pentru etapa care duce la ele
    stops: [
      { n: 'Târgu Mureș', s: 'România',  lat:  46.54, lon: 24.56 },
      { n: 'Budapesta',   s: 'Ungaria',  lat:  47.50, lon: 19.04, mode: 'road' },
      { n: 'Istanbul',    s: 'Turcia',   lat:  41.01, lon: 28.98, mode: 'air'  },
      { n: 'Nairobi',     s: 'Kenya',    lat:  -1.29, lon: 36.82, mode: 'air'  },
      { n: 'Sirari',      s: 'graniță',  lat:  -1.25, lon: 34.50, mode: 'road' },
      { n: 'Bariadi',     s: 'Tanzania', lat:  -2.80, lon: 33.98, mode: 'road' },
      { n: 'Kusekwa',     s: 'școala',   lat:  -2.95, lon: 33.80, mode: 'road', end: true }
    ],
    // scroll (0..1) -> cât din drum s-a parcurs. Nu e liniar cu distanța:
    // zborul ar fi mâncat tot, iar savana n-ar fi apucat să se vadă.
    // cât din drum s-a parcurs, după scroll. Nu e liniar cu distanța: zborul
    // ar fi mâncat tot, iar etapa prin savană n-ar fi apucat să se vadă.
    pace:     [[0, 0], [0.30, 0], [0.44, 0.064], [0.72, 0.931], [0.92, 1], [1, 1]],
    // cât din glob e desenat
    drawPace: [[0, 0.42], [0.24, 1], [1, 1]],
    // apropierea: desenăm lumea întreagă, coborâm la Mureș pentru autocar,
    // urcăm înapoi la decolare, coborâm iar în savană la sosire
    zoomPace: [[0, 1], [0.24, 1], [0.32, 9], [0.46, 9], [0.58, 1], [0.76, 1], [0.95, 9.5], [1, 9.5]]
  };

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const GS = window.gsap;
  if (GS && window.ScrollTrigger) GS.registerPlugin(ScrollTrigger);
  const ST = GS && window.ScrollTrigger ? ScrollTrigger : null;
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (t, a = {}) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };

  /* ======================================================================
     Scroll lin
     ====================================================================== */
  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (GS && ST) {
      lenis.on('scroll', ST.update);
      GS.ticker.add((tm) => lenis.raf(tm * 1000));
      GS.ticker.lagSmoothing(0);
    }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = $(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 1.4 }); else el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ======================================================================
     ACTUL I · globul
     ====================================================================== */
  const smoothstep = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  function paceOn(p, x) {
    for (let i = 1; i < p.length; i++) {
      if (x <= p[i][0]) {
        const [x0, y0] = p[i - 1], [x1, y1] = p[i];
        const u = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
        return y0 + (y1 - y0) * smoothstep(u);
      }
    }
    return p[p.length - 1][1];
  }

  function fallback() {
    document.body.classList.add('no-atlas');
    const h = $('#atlas'); if (h) h.remove();
  }

  async function buildAtlas() {
    const host = $('#atlas'), sec = $('.journey'), labels = $('#globeLabels');
    if (!host || !sec) return;

    let atlas;
    try {
      const mod = await import('./atlas.js');
      atlas = mod.initAtlas(host, CONFIG.stops, { onLabels: (l) => paintLabels(labels, l) });
      await atlas.ready;
    } catch (err) {
      console.warn('atlasul nu a pornit:', err);
      fallback();
      return;
    }

    let rz;
    addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { atlas.resize(); draw(true); }, 140); });

    // ținta vine de la scroll, afișarea o urmărește lin — de aici vine mersul „frumos”
    const want = { t: 0, draw: RM ? 1 : 0.42, zoom: 1 };
    const has = { t: 0, draw: RM ? 1 : 0.42, zoom: 1 };
    let intro = RM ? 1 : 0;

    function draw(snap) {
      if (snap) { has.t = want.t; has.zoom = want.zoom; }
      atlas.render({ t: has.t, draw: has.draw * intro, zoomTo: has.zoom });
    }
    draw(true);
    if (RM) { want.t = 0.55; draw(true); return; }

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const k = 1 - Math.pow(0.0016, dt);        // urmărire amortizată, fără sacadare
      has.t += (want.t - has.t) * k;
      has.draw += (want.draw - has.draw) * k;
      has.zoom += (want.zoom - has.zoom) * k;
      if (intro < 1) intro = Math.min(1, intro + dt / 2.0);
      const e = intro < 1 ? intro * intro * (3 - 2 * intro) : 1;
      atlas.render({ t: has.t, draw: has.draw * e, zoomTo: has.zoom });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const take = (self) => {
      want.t = paceOn(CONFIG.pace, self.progress);
      want.draw = paceOn(CONFIG.drawPace, self.progress);
      want.zoom = paceOn(CONFIG.zoomPace, self.progress);
    };
    ST && ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: take, onRefresh: take });

    // beat-urile se schimbă odată cu etapele
    const beats = $$('.beat');
    const marks = [0, 0.31, 0.50, 0.77, 0.94];
    if (GS) { GS.set(beats, { opacity: 0 }); GS.set(beats[0], { opacity: 1 }); beats[0].dataset.on = 1; }
    ST && ST.create({
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (self) => {
        let at = 0;
        marks.forEach((m, i) => { if (self.progress >= m) at = i; });
        beats.forEach((b, i) => {
          const w = i === at ? 1 : 0;
          if (+b.dataset.on !== w) {
            b.dataset.on = w;
            if (GS) GS.to(b, { opacity: w, y: w ? 0 : 16, duration: 0.5, ease: 'power2.out', overwrite: true });
            else b.style.opacity = w;
          }
        });
      }
    });
  }

  function paintLabels(host, list) {
    if (!host) return;
    if (!host.children.length) {
      list.forEach((l) => {
        const d = document.createElement('div');
        d.className = 'glabel';
        d.innerHTML = '<b></b><span></span>';
        d.querySelector('b').textContent = l.label;
        d.querySelector('span').textContent = l.sub;
        host.appendChild(d);
      });
    }
    const w = host.clientWidth, h = host.clientHeight;
    const narrow = w < 900;
    const placed = [];
    // ultima oprire are prioritate: ea e cea despre care vorbim
    const order = list.map((l, i) => ({ l, i })).reverse();
    const show = new Array(list.length).fill(false);
    order.forEach(({ l, i }) => {
      if (!l.on) return;
      const x = l.x * w, y = l.y * h;
      if (x < 8 || x > w - 60 || y < 70 || y > h - 20) return;
      if (narrow && y > h * 0.56) return;                 // acolo stă textul etapei
      if (placed.some((q) => Math.hypot(q.x - x, q.y - y) < 92)) return;
      placed.push({ x, y });
      show[i] = { x, y };
    });
    list.forEach((l, i) => {
      const el = host.children[i];
      if (!el) return;
      el.classList.toggle('on', !!show[i]);
      if (show[i]) el.style.transform = `translate(${(show[i].x + 13).toFixed(1)}px, ${(show[i].y - 17).toFixed(1)}px) translateY(-50%)`;
    });
  }

  /* ======================================================================
     ACTUL II · vocile
     ====================================================================== */
  function buildVoices() {
    const sec = $('.voices');
    if (!sec || RM || !GS || !ST) return;
    const bs = $$('.vbeat', sec), turn = $('.vturn', sec);
    GS.set(bs, { opacity: 0 });
    GS.set(bs[0], { opacity: 1 });
    const tl = GS.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'bottom bottom', scrub: 0.7 } });
    bs.forEach((b, i) => {
      const at = 0.3 + i * 1.1;
      if (i) tl.to(bs[i - 1], { opacity: 0, duration: 0.22 }, at - 0.1)
              .to(b, { opacity: 1, duration: 0.22 }, at - 0.08);
      tl.from($('.sil', b), { yPercent: 14, opacity: 0, duration: 0.4, ease: 'power2.out' }, at)
        .from($('blockquote p', b), { clipPath: 'inset(0 100% 0 0)', duration: 0.45, ease: 'power1.inOut' }, at + 0.12)
        .from($('.vsub', b), { opacity: 0, y: 10, duration: 0.3 }, at + 0.42)
        .from($('.vfact', b), { opacity: 0, y: 14, duration: 0.3 }, at + 0.55);
    });
    tl.to(turn, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.3 + bs.length * 1.1 - 0.35);
  }

  /* ======================================================================
     ACTUL IV · biserica: desen izometric, linii groase, se ridică
     ====================================================================== */
  function buildChapel() {
    const host = $('#chapel');
    if (!host) return;
    const W = 520, H = 440;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Biserica, desenată izometric' });
    host.appendChild(svg);

    const CX = W / 2, CY = H * 0.70, U = 32;
    const iso = (x, y, z) => [CX + (x - y) * U * 0.866, CY + (x + y) * U * 0.5 - z * U];
    const L = (pts, cls) => {
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      const el = svgEl('path', { class: 'ch-l ' + (cls || ''), d });
      svg.appendChild(el);
      return el;
    };
    const A = 2.15, B = 3.35, wallH = 2.15, ridgeH = 3.65;
    const parts = [];

    // soclul
    parts.push({ at: 0.00, el: L([iso(-A - .18, -B - .18, 0), iso(A + .18, -B - .18, 0), iso(A + .18, B + .18, 0), iso(-A - .18, B + .18, 0), iso(-A - .18, -B - .18, 0)], 'ch-l--soft'), kind: 'draw' });

    // zidurile, fiecare se ridică de la zero
    const corners = [[-A, -B], [A, -B], [A, B], [-A, B]];
    corners.forEach((c, i) => {
      const n = corners[(i + 1) % 4];
      const el = L([iso(c[0], c[1], 0), iso(c[0], c[1], wallH), iso(n[0], n[1], wallH), iso(n[0], n[1], 0)], '');
      parts.push({ at: 0.09 + i * 0.07, el, kind: 'rise', a: c, b: n, h: wallH });
    });

    // fermele acoperișului
    [-B, -B / 2.2, B / 2.2, B].forEach((y, i) => {
      parts.push({ at: 0.39 + i * 0.04, el: L([iso(-A, y, wallH), iso(0, y, ridgeH), iso(A, y, wallH)], 'ch-l--soft'), kind: 'draw' });
    });
    // coama și cele două ape
    parts.push({ at: 0.56, el: L([iso(0, -B, ridgeH), iso(0, B, ridgeH)], 'ch-l--gold'), kind: 'draw' });
    parts.push({ at: 0.60, el: L([iso(-A, -B, wallH), iso(0, -B, ridgeH), iso(0, B, ridgeH), iso(-A, B, wallH)], ''), kind: 'draw' });
    parts.push({ at: 0.64, el: L([iso(A, -B, wallH), iso(0, -B, ridgeH), iso(0, B, ridgeH), iso(A, B, wallH)], ''), kind: 'draw' });
    // streașina
    parts.push({ at: 0.68, el: L([iso(-A - .2, -B - .2, wallH - .08), iso(-A - .2, B + .2, wallH - .08)], 'ch-l--soft'), kind: 'draw' });
    parts.push({ at: 0.68, el: L([iso(A + .2, -B - .2, wallH - .08), iso(A + .2, B + .2, wallH - .08)], 'ch-l--soft'), kind: 'draw' });

    // ferestrele, pe latura lungă
    [-2.0, -0.7, 0.7, 2.0].forEach((y, i) => {
      parts.push({ at: 0.72 + i * 0.022, el: L([iso(A, y - .35, .72), iso(A, y + .35, .72), iso(A, y + .35, 1.62), iso(A, y - .35, 1.62), iso(A, y - .35, .72)], ''), kind: 'draw' });
    });

    // intrarea: pridvor, ușă, treaptă
    parts.push({ at: 0.80, el: L([iso(-.95, B, 0), iso(-.95, B + .85, 0), iso(-.95, B + .85, 1.75), iso(.95, B + .85, 1.75), iso(.95, B + .85, 0), iso(.95, B, 0)], 'ch-l--soft'), kind: 'draw' });
    parts.push({ at: 0.83, el: L([iso(-.95, B + .85, 1.75), iso(0, B + .85, 2.45), iso(.95, B + .85, 1.75)], ''), kind: 'draw' });
    parts.push({ at: 0.86, el: L([iso(-.56, B, 0), iso(.56, B, 0), iso(.56, B, 1.72), iso(-.56, B, 1.72), iso(-.56, B, 0)], ''), kind: 'draw' });
    parts.push({ at: 0.88, el: L([iso(0, B, 0), iso(0, B, 1.72)], 'ch-l--soft'), kind: 'draw' });
    parts.push({ at: 0.90, el: L([iso(-1.15, B + 1.1, 0), iso(1.15, B + 1.1, 0)], 'ch-l--soft'), kind: 'draw' });

    // crucea, deasupra intrării
    parts.push({ at: 0.93, el: L([iso(0, B, ridgeH), iso(0, B, ridgeH + 1.25)], 'ch-l--gold'), kind: 'draw' });
    parts.push({ at: 0.97, el: L([iso(-.42, B, ridgeH + .82), iso(.42, B, ridgeH + .82)], 'ch-l--gold'), kind: 'draw' });

    parts.forEach((p) => {
      p.len = (p.el.getTotalLength && p.el.getTotalLength()) || 1;
      if (p.kind === 'rise') p.full = p.el.getAttribute('d');
    });

    let want = RM ? 1 : 0, now = RM ? 1 : 0;
    const render = () => {
      parts.forEach((q) => {
        const t = clamp((now * 1.14 - q.at) / 0.1, 0, 1);
        if (q.kind === 'rise') {
          const pts = [iso(q.a[0], q.a[1], 0), iso(q.a[0], q.a[1], q.h * t), iso(q.b[0], q.b[1], q.h * t), iso(q.b[0], q.b[1], 0)];
          q.el.setAttribute('d', pts.map((z, i) => (i ? 'L' : 'M') + z[0].toFixed(1) + ' ' + z[1].toFixed(1)).join(' '));
          q.el.style.opacity = t > 0 ? 1 : 0;
        } else {
          q.el.style.strokeDasharray = q.len;
          q.el.style.strokeDashoffset = q.len * (1 - t);
        }
      });
    };
    render();

    const hint = $('#buildHint');
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hint && !fine) hint.textContent = 'Derulează: se ridică.';
    if (RM) return;

    let base = 0;
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      want = clamp((e.clientX - r.left) / r.width, 0, 1);
    });
    host.addEventListener('pointerleave', () => { want = base; });
    if (ST) {
      const take = (self) => { base = self.progress; if (!host.matches(':hover')) want = base; };
      ST.create({ trigger: host, start: 'top 85%', end: 'bottom 45%', scrub: true, onUpdate: take, onRefresh: take });
    }
    const tick = () => { now += (want - now) * 0.12; render(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ======================================================================
     Fișa de donație
     ====================================================================== */
  function buildPay() {
    const pay = $('#pay'), card = $('.pay-card'), here = $('#giveHere');
    const go = $('#payGo'), goSum = $('#payGoSum'), other = $('#paySum'), note = $('#payNote'), pp = $('#payPaypal');
    if (!pay || !go) return;

    let sum = 150;
    const live = !!CONFIG.stripeLink.trim();
    const link = () => {
      if (!live) return CONFIG.fallbackLink;
      const u = new URL(CONFIG.stripeLink);
      u.searchParams.set(CONFIG.stripeAmountParam, String(Math.round(sum * 100)));
      return u.toString();
    };
    const paint = () => {
      goSum.textContent = String(sum);
      go.href = link();
      if (note) note.textContent = live
        ? 'Plata se face pe pagina securizată Stripe a școlii. Suma o poți schimba și acolo.'
        : 'Deocamdată butonul duce la pagina de donații a școlii. Când Stripe-ul e pornit, cardul, Google Pay și Apple Pay merg direct de aici.';
    };
    $$('.pay-amounts button').forEach((b) => b.addEventListener('click', () => {
      $$('.pay-amounts button').forEach((o) => o.classList.toggle('is-on', o === b));
      if (other) other.value = '';
      sum = Number(b.dataset.sum);
      paint();
      if (GS && !RM) GS.fromTo(go, { scaleX: 1.03, scaleY: .94 }, { scaleX: 1, scaleY: 1, duration: .45, ease: 'elastic.out(1.1,.45)' });
    }));
    if (other) other.addEventListener('input', () => {
      const v = Number(other.value);
      if (v > 0) { $$('.pay-amounts button').forEach((o) => o.classList.remove('is-on')); sum = v; paint(); }
    });
    if (pp && CONFIG.paypalLink.trim()) { pp.hidden = false; pp.href = CONFIG.paypalLink; }
    paint();

    if (GS && ST && !RM) {
      const hop = () => GS.timeline()
        .to(go, { scaleY: .86, scaleX: 1.08, duration: .13, ease: 'power2.in' })
        .to(go, { y: -15, scaleY: 1.07, scaleX: .96, duration: .22, ease: 'power2.out' })
        .to(go, { y: 0, scaleY: .94, scaleX: 1.05, duration: .18, ease: 'power2.in' })
        .to(go, { scaleY: 1, scaleX: 1, duration: .5, ease: 'elastic.out(1.1,.4)' });
      let timer = null;
      ST.create({
        trigger: '#doneaza', start: 'top 80%', end: 'bottom 20%',
        onEnter: () => { setTimeout(hop, 420); timer = setInterval(hop, 6000); },
        onEnterBack: () => { hop(); timer = setInterval(hop, 6000); },
        onLeave: () => clearInterval(timer), onLeaveBack: () => clearInterval(timer)
      });
      go.addEventListener('mouseenter', hop);
    }

    const mq = matchMedia('(min-width: 1180px)');
    const place = () => {
      if (mq.matches) { if (card.parentElement !== pay) pay.appendChild(card); }
      else if (here && card.parentElement !== here) here.appendChild(card);
    };
    place();
    mq.addEventListener('change', place);

    $$('[data-focus-pay]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      (card.parentElement === pay ? go : card).scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' });
      if (GS && !RM) GS.fromTo(card, { boxShadow: '0 0 0 0 rgba(161,136,84,0)' },
        { boxShadow: '0 0 0 8px rgba(161,136,84,.38)', duration: .35, yoyo: true, repeat: 1, ease: 'power2.out' });
    }));

    // fișa din dreapta intră abia după glob, ca să-i lase scena
    if (ST) ST.create({ trigger: '.voices', start: 'top 70%',
      onToggle: (self) => document.body.classList.toggle('pay-on', self.isActive || self.progress > 0) });
    document.body.classList.toggle('pay-on', scrollY > innerHeight);

    const bar = $('#paybar');
    if (bar && GS && ST && !RM) {
      ST.create({ trigger: '.voices', start: 'top 80%',
        onEnter: () => GS.to(bar, { y: 0, duration: .45, ease: 'power3.out' }),
        onLeaveBack: () => GS.to(bar, { y: '102%', duration: .35, ease: 'power2.in' }) });
      ST.create({ trigger: '#doneaza', start: 'top 70%',
        onEnter: () => GS.to(bar, { y: '102%', duration: .35, ease: 'power2.in' }),
        onLeaveBack: () => GS.to(bar, { y: 0, duration: .4, ease: 'power3.out' }) });
    } else if (bar) bar.style.transform = 'none';
  }

  /* ======================================================================
     Hârtia: bara de sus se schimbă; intrări; copiere IBAN
     ====================================================================== */
  function buildMisc() {
    if (ST) {
      ST.create({ trigger: '.voices', start: 'top 40%', end: 'bottom 60px',
        onToggle: (s) => document.body.classList.toggle('on-dark', s.isActive) });
      ST.create({ trigger: '.doc--school', start: 'top 60px', end: 'max',
        onToggle: (s) => document.body.classList.toggle('on-paper', s.isActive) });
    }
    if (!RM && GS && ST) {
      $$('.doc').forEach((s) => {
        GS.from($$(':scope > .wrap > *', s), { y: 28, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out',
          scrollTrigger: { trigger: s, start: 'top 78%' } });
      });
    }
    $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copiat'; b.classList.add('ok'); }
      catch (e) { b.textContent = 'Selectează manual'; }
      setTimeout(() => { b.textContent = 'Copiază'; b.classList.remove('ok'); }, 2200);
    }));
  }

  buildVoices();
  buildChapel();
  buildPay();
  buildMisc();
  buildAtlas();
  if (ST) addEventListener('load', () => ST.refresh());
})();
