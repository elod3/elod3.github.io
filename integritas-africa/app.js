/* Integritas · Africa — concept.
   Două acte: apus (hero + voci), apoi hârtie (drumul, noi, clipul, galeria, visul, donația).
   Elementul care ține pagina: linia traseului, desenată din coordonatele reale ale celor
   șapte opriri. Aceeași linie, îndoită în izometrie, ridică biserica din secțiunea 05. */
(() => {
  'use strict';

  /* ======================================================================
     CONFIG — singurul loc de schimbat când școala dă datele reale.
     ====================================================================== */
  const CONFIG = {
    // Stripe Payment Link al școlii (Dashboard › Payment links › „clientul alege suma”).
    // Cardul, Google Pay și Apple Pay apar automat pe pagina Stripe.
    // Lasă gol cât timp nu există: butonul trimite atunci la pagina de donații a școlii.
    stripeLink: '',
    // suma se trimite în bani (1 leu = 100); Stripe o preia din parametrul de mai jos
    stripeAmountParam: '__prefilled_amount',
    // fallback cât timp nu e Stripe
    fallbackLink: 'https://liceulintegritas.ro/donatii',
    // butonul PayPal apare doar dacă e completat (ex. https://www.paypal.com/donate/?hosted_button_id=…)
    paypalLink: '',
    // clipul, pe limbi. Pune ID-ul de YouTube când e gata; gol = „se montează”.
    clip: { ro: '', en: '', hu: '', es: '' },
    clipNames: { ro: 'română', en: 'engleză', hu: 'maghiară', es: 'spaniolă' },
    // traseul: coordonate reale (lon, lat). „road” = bucata făcută pe uscat.
    route: [
      { n: 'Târgu Mureș',  s: 'România',   lon: 24.56, lat:  46.54 },
      { n: 'Budapesta',    s: 'Ungaria',   lon: 19.04, lat:  47.50, road: true },
      { n: 'Istanbul',     s: 'Turcia',    lon: 28.98, lat:  41.01 },
      { n: 'Nairobi',      s: 'Kenya',     lon: 36.82, lat:  -1.29 },
      { n: 'Sirari',       s: 'graniță',   lon: 34.50, lat:  -1.25, road: true },
      { n: 'Bariadi',      s: 'Tanzania',  lon: 33.98, lat:  -2.80, road: true },
      { n: 'Kusekwa',      s: 'școala',    lon: 33.80, lat:  -2.95, road: true, end: true }
    ],
    gallery: [
      { f: 'misiune-kenya-2025.webp', up: true, c: 'Kenya, februarie 2025: pachete cu alimente pentru 50 de familii, duse acasă la fiecare.' },
      { f: 'galerie/drum-readytoserve.webp', c: 'Poarta campusului de la Budiu Mic: „Ready to serve”.' },
      { f: 'galerie/azil-batrani.webp',      c: 'Azilul de bătrâni, la finalul vizitei. Una dintre opririle săptămânii de misiune.' },
      { f: 'galerie/razvan-prezentare.webp', c: 'Seminar în fața unei săli pline. Așa arată misiunea de acasă.' },
      { f: 'galerie/elevi-cantand.webp',     c: 'Două colege, la microfon.' },
      { f: 'galerie/clasa-elevi.webp',       c: 'Ora de clasă la Integritas.' },
      { f: 'galerie/clasa-11.webp',          c: 'În capelă, cu foile în mână. Jumătate din misiune se face cu vocea.' },
      { f: 'galerie/baieti-rugaciune.webp',  c: 'Băieții, la rugăciune.' },
      { f: 'galerie/imbratisare.webp',       c: 'O îmbrățișare, în sală.' },
      { f: 'galerie/aruncare-toci.webp',     c: 'Clasa terminală, la absolvire. Anul viitor suntem noi.' },
      { f: 'galerie/apus.webp',              c: 'Dealurile din jurul campusului, la apus.' },
      { slot: 'Namibia', c: 'Poze din misiunea anterioară — le aducem de la colegii din anii trecuți.' },
      { slot: 'Kusekwa, anul acesta', c: 'Locul gol pe care îl umplem când ne întoarcem.' }
    ]
  };

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const GS = window.gsap;
  if (GS) {
    if (window.ScrollTrigger) GS.registerPlugin(ScrollTrigger);
    if (window.DrawSVGPlugin) GS.registerPlugin(DrawSVGPlugin);
    if (window.MotionPathPlugin) GS.registerPlugin(MotionPathPlugin);
  }
  const ST = GS && window.ScrollTrigger ? ScrollTrigger : null;
  const svgEl = (t, a = {}) => {
    const e = document.createElementNS('http://www.w3.org/2000/svg', t);
    for (const k in a) e.setAttribute(k, a[k]);
    return e;
  };

  /* ======================================================================
     Dealurile din fundal — aceleași siluete de salcâm ca înainte, fără animale.
     ====================================================================== */
  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
  function ridge(W, H, base, amp, harm, r) {
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
    const w = h * (1.5 + r() * 0.7);
    const fork = y - h * (0.42 + r() * 0.1);
    const top = y - h;
    const t = Math.max(1.5, h * 0.035);
    const d = `M${x - t} ${y} L${x - t * 0.6} ${fork} L${x - w * 0.28} ${top + h * 0.12} L${x - w * 0.28 + t * 1.4} ${top + h * 0.12} L${x} ${fork - h * 0.06} L${x + w * 0.22 - t} ${top + h * 0.1} L${x + w * 0.22 + t * 0.6} ${top + h * 0.1} L${x + t * 0.8} ${fork} L${x + t} ${y} Z`;
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
  function paintHills() {
    const far = $('.sky-hills--far'), near = $('.sky-hills--near');
    [[far, 'far', 51], [near, 'near', 67]].forEach(([svg, kind, seed]) => {
      if (!svg) return;
      const W = innerWidth, H = svg.getBoundingClientRect().height || innerHeight * 0.3;
      const r = rng(seed);
      let g = '';
      if (kind === 'far') {
        g += `<path d="${ridge(W, H, 0.55, H * 0.12, [1, 2, 4], r)}"/>`;
        for (let i = 0; i < 4; i++) g += acacia(W * (0.05 + r() * 0.9), H * 0.6, H * (0.18 + r() * 0.16), r);
      } else {
        g += `<path d="${ridge(W, H, 0.6, H * 0.1, [1, 2, 3], r)}"/>`;
        g += grass(W, H, H * 0.62, r, 11, H * 0.22);
      }
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = g;
    });
  }
  paintHills();
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(paintHills, 200); });

  /* ======================================================================
     Cerul: de la apus (hero) la noapte (vocile), apoi hârtie.
     ====================================================================== */
  const SKY = {
    hero:   ['#3e1c14', '#b04a24', '#f0a04a', '#ffe2a6', 70, 1,   0,   '#4a2114', '#1c0c08'],
    voices: ['#0d0708', '#1d1210', '#44200f', '#ff9050', 108, 0,  1,   '#120907', '#070303'],
    paper:  ['#efe2c6', '#f3e6c9', '#f6e9cc', '#fff6e0', 60, 0,   0,   '#e8d6b0', '#dfc89a']
  };
  const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const root = document.documentElement.style;
  let anchors = [];
  function measureSky() {
    anchors = [];
    const seen = new Set();
    $$('[data-sky]').forEach((s) => {
      const k = s.dataset.sky;
      if (seen.has(k)) return;
      seen.add(k);
      anchors.push({ key: k, y: s.offsetTop + Math.max(0, s.offsetHeight - innerHeight) * 0.35 });
    });
  }
  function applySky(y) {
    if (!anchors.length) return;
    let i = 0;
    while (i < anchors.length - 1 && y > anchors[i + 1].y) i++;
    const a = anchors[i], b = anchors[Math.min(i + 1, anchors.length - 1)];
    let t = b === a ? 0 : (y - a.y) / (b.y - a.y);
    t = clamp(t, 0, 1); t = t * t * (3 - 2 * t);
    const A = SKY[a.key] || SKY.paper, B = SKY[b.key] || SKY.paper;
    root.setProperty('--sky-top', mix(A[0], B[0], t));
    root.setProperty('--sky-mid', mix(A[1], B[1], t));
    root.setProperty('--sky-low', mix(A[2], B[2], t));
    root.setProperty('--sun', mix(A[3], B[3], t));
    root.setProperty('--sun-y', lerp(A[4], B[4], t) + 'vh');
    root.setProperty('--sun-o', lerp(A[5], B[5], t).toFixed(3));
    root.setProperty('--stars', lerp(A[6], B[6], t).toFixed(3));
    root.setProperty('--hill-far', mix(A[7], B[7], t));
    root.setProperty('--hill-near', mix(A[8], B[8], t));
    document.body.classList.toggle('on-paper', (t < 0.5 ? a.key : b.key) === 'paper');
  }
  measureSky(); applySky(scrollY);
  addEventListener('resize', () => { measureSky(); applySky(scrollY); });
  addEventListener('load',   () => { measureSky(); applySky(scrollY); });
  addEventListener('scroll', () => applySky(scrollY), { passive: true });

  /* ======================================================================
     Scroll lin + ancore
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
    if (lenis) lenis.scrollTo(el, { duration: 1.5 }); else el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ======================================================================
     01 · TRASEUL — proiecție echidistantă din coordonate reale, la scară egală
     pe cele două axe; latitudinea dă înălțimea, longitudinea lățimea.
     ====================================================================== */
  function buildRoute() {
    const svg = $('.route-svg');
    if (!svg) return;
    const P = CONFIG.route;
    const VH = 620, padT = 30, padB = 34, x0 = 42, labelGap = 58, labelW = 196;
    const lats = P.map((p) => p.lat), lons = P.map((p) => p.lon);
    const latMax = Math.max(...lats), lonMin = Math.min(...lons);
    const k = (VH - padT - padB) / (latMax - Math.min(...lats));   // px / grad, egal pe ambele axe
    const ribbon = (Math.max(...lons) - lonMin) * k;
    const labelX = x0 + ribbon + labelGap;
    const VW = Math.round(labelX + labelW);
    svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
    const xy = P.map((p) => [x0 + (p.lon - lonMin) * k, padT + (latMax - p.lat) * k]);

    // etichetele se despart pe verticală când opririle sunt prea apropiate
    const MIN = 34;
    const ly = xy.map((q) => q[1]);
    for (let i = 1; i < ly.length; i++) if (ly[i] - ly[i - 1] < MIN) ly[i] = ly[i - 1] + MIN;
    const over = ly[ly.length - 1] - (VH - 16);
    if (over > 0) for (let i = 0; i < ly.length; i++) ly[i] -= over;

    const title = svg.querySelector('title');
    svg.innerHTML = '';
    if (title) svg.appendChild(title);
    const g = svgEl('g');
    svg.appendChild(g);

    // ecuatorul: îl trecem între Istanbul și Nairobi
    const eqY = padT + latMax * k;
    g.appendChild(svgEl('line', { class: 'r-line r-eq', x1: 8, y1: eqY, x2: VW - 8, y2: eqY }));
    const eqT = svgEl('text', { class: 'r-eq-t', x: 8, y: eqY - 11 });
    eqT.textContent = 'Ecuator';
    g.appendChild(eqT);

    // fiecare etapă, segment propriu: uscatul portocaliu, zborul vișiniu și arcuit
    const legs = [];
    for (let i = 1; i < P.length; i++) {
      const [ax, ay] = xy[i - 1], [bx, by] = xy[i];
      const road = !!P[i].road;
      let d;
      if (road) {
        d = `M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}`;
      } else {
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
        const off = Math.min(54, len * 0.14);
        d = `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${(mx + (dy / len) * off).toFixed(1)} ${(my - (dx / len) * off).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
      }
      const path = svgEl('path', { class: 'r-line' + (road ? ' r-road' : ' r-air'), d });
      g.appendChild(path);
      legs.push(path);
    }

    // opririle: punct, linie-ghid cu cot, nume
    P.forEach((p, i) => {
      const [px, py] = xy[i], ty = ly[i];
      const bend = labelX - 24;
      g.appendChild(svgEl('path', {
        class: 'r-line r-lead',
        d: `M${(px + 9).toFixed(1)} ${py.toFixed(1)} L${bend} ${py.toFixed(1)} L${bend + 10} ${ty.toFixed(1)} L${(labelX - 8).toFixed(1)} ${ty.toFixed(1)}`
      }));
      g.appendChild(svgEl('circle', { class: 'r-dot' + (p.end ? ' r-dot--end' : ''), cx: px, cy: py, r: p.end ? 7 : 5.4 }));
      const n = svgEl('text', { class: 'r-name', x: labelX, y: ty + 1 });
      n.textContent = p.n;
      g.appendChild(n);
      const sb = svgEl('text', { class: 'r-sub', x: labelX, y: ty + 17 });
      sb.textContent = p.s;
      g.appendChild(sb);
    });

    // o singură linie-mamă pentru semnul care merge pe traseu
    const master = svgEl('path', {
      d: xy.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' '),
      fill: 'none', stroke: 'none'
    });
    g.appendChild(master);
    const tok = svgEl('circle', { class: 'r-tok', cx: 0, cy: 0, r: 5 });
    g.appendChild(tok);

    if (RM || !GS || !ST) { tok.setAttribute('opacity', '0'); return; }

    const tl = GS.timeline({
      scrollTrigger: { trigger: svg, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 }
    });
    if (window.DrawSVGPlugin) {
      legs.forEach((p, i) => tl.from(p, { drawSVG: '0%', ease: 'none' }, i * 0.9));
      tl.from($$('.r-lead', svg), { drawSVG: '0%', stagger: 0.55, ease: 'none' }, 0.3);
    }
    tl.from($$('.r-dot', svg), { scale: 0, transformOrigin: '50% 50%', stagger: 0.75, ease: 'back.out(2)' }, 0.25)
      .from($$('.r-name, .r-sub', svg), { opacity: 0, x: -10, stagger: 0.1, ease: 'power2.out' }, 0.45);
    if (window.MotionPathPlugin) {
      tl.fromTo(tok, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
        .to(tok, { motionPath: { path: master, align: master, alignOrigin: [0.5, 0.5] }, ease: 'none', duration: legs.length * 0.9 }, 0);
    }
  }

  /* ======================================================================
     03 · CLIPUL — română implicit, trei limbi la butoane
     ====================================================================== */
  function buildClip() {
    const box = $('.player-box');
    if (!box) return;
    const nameEl = $('[data-lang-name]');
    const show = (lang) => {
      const id = (CONFIG.clip[lang] || '').trim();
      if (nameEl) nameEl.textContent = CONFIG.clipNames[lang] || lang;
      if (!id) {
        box.dataset.state = 'soon';
        const soon = $('.player-soon', box);
        if (soon) soon.hidden = false;
        const fr = $('iframe', box);
        if (fr) fr.remove();
        return;
      }
      box.dataset.state = 'video';
      const soon = $('.player-soon', box);
      if (soon) soon.hidden = true;
      let fr = $('iframe', box);
      if (!fr) {
        fr = document.createElement('iframe');
        fr.setAttribute('allow', 'accelerometer; encrypted-media; picture-in-picture; fullscreen');
        fr.setAttribute('allowfullscreen', '');
        fr.setAttribute('loading', 'lazy');
        box.appendChild(fr);
      }
      fr.title = 'Clipul misiunii, în ' + (CONFIG.clipNames[lang] || lang);
      fr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?rel=0';
    };
    $$('.lang button').forEach((b) => b.addEventListener('click', () => {
      $$('.lang button').forEach((o) => { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', String(o === b)); });
      show(b.dataset.lang);
    }));
    show('ro');
  }

  /* ======================================================================
     04 · GALERIA — contact sheet desfăcut în evantai; trage, săgeți, taste
     ====================================================================== */
  function buildFan() {
    const fan = $('#fan'), track = $('.fan-track'), cap = $('#fanCap');
    if (!fan || !track) return;
    const items = CONFIG.gallery;
    const cards = items.map((it, i) => {
      const fig = document.createElement('figure');
      fig.className = 'fan-card' + (it.slot ? ' fan-card--slot' : '');
      if (it.slot) {
        fig.innerHTML = `<div class="fan-card__slot"><b>${it.slot}</b><span>de adăugat</span></div>`;
      } else {
        const img = document.createElement('img');
        img.src = 'assets/img/' + it.f;
        img.alt = it.c;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 420; img.height = 315;
        fig.appendChild(img);
      }
      const n = document.createElement('span');
      n.className = 'fan-card__n';
      n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
      fig.appendChild(n);
      fig.addEventListener('click', () => go(i));
      track.appendChild(fig);
      return fig;
    });

    let at = 0;
    const SPREAD = () => (innerWidth < 760 ? 74 : 128);
    const place = (anim) => {
      cards.forEach((c, i) => {
        const d = i - at, ad = Math.abs(d);
        const to = {
          x: d * SPREAD() - 0.5 * c.offsetWidth,
          y: ad * ad * 7 - 0.5 * c.offsetHeight + (ad ? 10 : -6),
          rotate: d * 5.2,
          scale: ad ? Math.max(0.74, 1 - ad * 0.07) : 1,
          opacity: ad > 4 ? 0 : 1,
          zIndex: 100 - ad
        };
        if (anim && GS && !RM) GS.to(c, { ...to, duration: 0.62, ease: 'power3.out' });
        else if (GS) GS.set(c, to);
      });
      const it = items[at];
      if (cap) cap.textContent = it.c;
    };
    const go = (i) => { at = clamp(i, 0, cards.length - 1); place(true); };

    $$('[data-fan]').forEach((b) => b.addEventListener('click', () => go(at + Number(b.dataset.fan))));
    fan.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(at - 1); }
    });

    // tras cu mouse-ul / degetul
    let down = null;
    const start = (x) => { down = { x, at }; };
    const move = (x) => { if (down === null) return; go(down.at - Math.round((x - down.x) / SPREAD())); };
    const end = () => { down = null; };
    fan.addEventListener('pointerdown', (e) => { start(e.clientX); fan.setPointerCapture(e.pointerId); });
    fan.addEventListener('pointermove', (e) => { if (down) move(e.clientX); });
    fan.addEventListener('pointerup', end);
    fan.addEventListener('pointercancel', end);

    place(false);
    addEventListener('resize', () => place(false));
    // intrarea: cărțile se desfac din teanc, o singură dată
    if (GS && !RM) {
      GS.from(cards, {
        y: '+=120', rotate: 0, opacity: 0, duration: 0.8, stagger: 0.035, ease: 'power3.out',
        scrollTrigger: ST ? { trigger: fan, start: 'top 82%' } : undefined
      });
    }
  }

  /* ======================================================================
     05 · BISERICA — desen izometric din linii; cursorul o construiește.
     Ordinea e ordinea de pe șantier: soclu, ziduri, ferme, acoperiș, uși, cruce.
     ====================================================================== */
  function buildChapel() {
    const host = $('#chapel');
    if (!host) return;
    const W = 460, H = 420;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Desen izometric al bisericii' });
    host.appendChild(svg);

    const CX = W / 2, CY = H * 0.72, U = 29;          // unitate izometrică
    const iso = (x, y, z) => [CX + (x - y) * U * 0.866, CY + (x + y) * U * 0.5 - z * U];
    const L = (pts, cls) => {
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      const el = svgEl('path', { class: 'ch-l ' + (cls || ''), d });
      svg.appendChild(el);
      return el;
    };
    const A = 2.1, B = 3.2;                            // jumătate-lățime, jumătate-lungime
    const parts = [];

    // soclu
    const base = [iso(-A, -B, 0), iso(A, -B, 0), iso(A, B, 0), iso(-A, B, 0), iso(-A, -B, 0)];
    parts.push({ at: 0.00, el: L(base, 'ch-l--soft'), kind: 'draw' });

    // cele patru ziduri, fiecare se ridică de la zero
    const wallH = 2.0;
    const corners = [[-A, -B], [A, -B], [A, B], [-A, B]];
    const walls = corners.map((c, i) => {
      const n = corners[(i + 1) % 4];
      const el = L([iso(c[0], c[1], 0), iso(c[0], c[1], wallH), iso(n[0], n[1], wallH), iso(n[0], n[1], 0)], '');
      return { at: 0.10 + i * 0.07, el, kind: 'rise', a: c, b: n, h: wallH };
    });
    parts.push(...walls);

    // fermele acoperișului
    const ridgeH = 3.3;
    [-B, -B / 3, B / 3, B].forEach((y, i) => {
      const el = L([iso(-A, y, wallH), iso(0, y, ridgeH), iso(A, y, wallH)], 'ch-l--soft');
      parts.push({ at: 0.40 + i * 0.045, el, kind: 'draw' });
    });
    // coama și cele două ape
    parts.push({ at: 0.58, el: L([iso(0, -B, ridgeH), iso(0, B, ridgeH)], 'ch-l--gold'), kind: 'draw' });
    parts.push({ at: 0.62, el: L([iso(-A, -B, wallH), iso(0, -B, ridgeH), iso(0, B, ridgeH), iso(-A, B, wallH)], ''), kind: 'draw' });
    parts.push({ at: 0.66, el: L([iso(A, -B, wallH), iso(0, -B, ridgeH), iso(0, B, ridgeH), iso(A, B, wallH)], ''), kind: 'draw' });

    // ferestre pe latura lungă
    [-1.6, 0, 1.6].forEach((y, i) => {
      const el = L([iso(A, y - 0.34, 0.65), iso(A, y + 0.34, 0.65), iso(A, y + 0.34, 1.5), iso(A, y - 0.34, 1.5), iso(A, y - 0.34, 0.65)], 'ch-l--soft');
      parts.push({ at: 0.72 + i * 0.03, el, kind: 'draw' });
    });
    // ușa, pe fațada dinspre privitor
    parts.push({ at: 0.82, el: L([iso(-0.52, B, 0), iso(0.52, B, 0), iso(0.52, B, 1.62), iso(-0.52, B, 1.62), iso(-0.52, B, 0)], ''), kind: 'draw' });
    parts.push({ at: 0.86, el: L([iso(0, B, 0), iso(0, B, 1.62)], 'ch-l--soft'), kind: 'draw' });
    // treapta
    parts.push({ at: 0.88, el: L([iso(-0.72, B + 0.26, 0), iso(0.72, B + 0.26, 0)], 'ch-l--soft'), kind: 'draw' });
    // crucea, deasupra intrării
    parts.push({ at: 0.92, el: L([iso(0, B, ridgeH), iso(0, B, ridgeH + 1.15)], 'ch-l--gold'), kind: 'draw' });
    parts.push({ at: 0.96, el: L([iso(-0.38, B, ridgeH + 0.76), iso(0.38, B, ridgeH + 0.76)], 'ch-l--gold'), kind: 'draw' });

    // lungimile, pentru desenul progresiv
    parts.forEach((p) => {
      const len = p.el.getTotalLength ? p.el.getTotalLength() : 0;
      p.len = len || 1;
      if (p.kind === 'rise') {
        p.full = p.el.getAttribute('d');
        p.flat = [iso(p.a[0], p.a[1], 0), iso(p.a[0], p.a[1], 0), iso(p.b[0], p.b[1], 0), iso(p.b[0], p.b[1], 0)]
          .map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
      }
    });

    let p = RM ? 1 : 0, shown = RM ? 1 : 0;
    const render = () => {
      parts.forEach((q) => {
        const t = clamp((shown * 1.14 - q.at) / 0.1, 0, 1);
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

    if (RM) return;
    // pe telefon și cât timp cursorul e în altă parte, scroll-ul o ridică
    let basep = 0;
    // cursorul construiește: stânga = teren gol, dreapta = gata
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      p = clamp((e.clientX - r.left) / r.width, 0, 1);
    });
    host.addEventListener('pointerleave', () => { p = basep; });
    if (ST) {
      const take = (self) => { basep = self.progress; if (!host.matches(':hover')) p = basep; };
      ST.create({ trigger: host, start: 'top 85%', end: 'bottom 45%', scrub: true,
        onUpdate: take, onRefresh: take });
    }
    const tick = () => { shown += (p - shown) * 0.12; render(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ======================================================================
     VOCILE — trei bătăi pe un cadru care stă
     ====================================================================== */
  function buildVoices() {
    const sec = $('.scene--voices');
    if (!sec || RM || !GS || !ST) return;
    const beats = $$('.beat', sec);
    const turn = $('.turn', sec);
    GS.set(beats, { opacity: 0 });
    GS.set(beats[0], { opacity: 1 });

    const tl = GS.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'bottom bottom', scrub: 0.7 } });
    beats.forEach((b, i) => {
      const sil = $('.sil', b), v = $('.voice p', b), as = $('.aside', b), f = $('.fact', b);
      const at = 0.35 + i * 1.1;
      if (i) tl.to(beats[i - 1], { opacity: 0, duration: 0.22 }, at - 0.1)
              .to(b, { opacity: 1, duration: 0.22 }, at - 0.08);
      tl.from(sil, { yPercent: 16, opacity: 0, duration: 0.4, ease: 'power2.out' }, at)
        .from(v,   { clipPath: 'inset(0 100% 0 0)', duration: 0.45, ease: 'power1.inOut' }, at + 0.12)
        .from(as,  { opacity: 0, y: 12, duration: 0.3 }, at + 0.42)
        .from(f,   { opacity: 0, y: 16, duration: 0.3 }, at + 0.55);
    });
    tl.to(turn, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.35 + beats.length * 1.1 - 0.35);
  }

  /* ======================================================================
     PANOUL DE PLATĂ
     ====================================================================== */
  function buildPay() {
    const pay = $('#pay'), card = $('.pay-card'), here = $('#giveHere');
    const go = $('#payGo'), goSum = $('#payGoSum'), other = $('#paySum'), note = $('#payNote');
    const pp = $('#payPaypal');
    if (!pay || !go) return;

    let sum = 150;
    const stripeOK = !!CONFIG.stripeLink.trim();

    const link = () => {
      if (!stripeOK) return CONFIG.fallbackLink;
      const u = new URL(CONFIG.stripeLink);
      u.searchParams.set(CONFIG.stripeAmountParam, String(Math.round(sum * 100)));
      return u.toString();
    };
    const paint = () => {
      goSum.textContent = String(sum);
      go.href = link();
      if (note) {
        note.textContent = stripeOK
          ? 'Plata se face pe pagina securizată Stripe a școlii. Suma o poți schimba și acolo.'
          : 'Deocamdată butonul duce la pagina de donații a școlii. Când Stripe-ul e pornit, cardul, Google Pay și Apple Pay merg direct de aici.';
      }
    };
    $$('.pay-amounts button').forEach((b) => b.addEventListener('click', () => {
      $$('.pay-amounts button').forEach((o) => o.classList.toggle('is-on', o === b));
      if (other) other.value = '';
      sum = Number(b.dataset.sum);
      paint();
      if (GS && !RM) GS.fromTo(go, { scaleX: 1.03, scaleY: 0.94 }, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1.1,.45)' });
    }));
    if (other) other.addEventListener('input', () => {
      const v = Number(other.value);
      if (v > 0) { $$('.pay-amounts button').forEach((o) => o.classList.remove('is-on')); sum = v; paint(); }
    });
    if (pp && CONFIG.paypalLink.trim()) { pp.hidden = false; pp.href = CONFIG.paypalLink; }
    paint();

    // butonul sare când intră în cadru: trebuie apăsat
    if (GS && ST && !RM) {
      const hop = () => GS.timeline()
        .to(go, { scaleY: 0.86, scaleX: 1.08, duration: 0.13, ease: 'power2.in' })
        .to(go, { y: -14, scaleY: 1.07, scaleX: 0.96, duration: 0.22, ease: 'power2.out' })
        .to(go, { y: 0, scaleY: 0.94, scaleX: 1.05, duration: 0.18, ease: 'power2.in' })
        .to(go, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1.1,.4)' });
      let timer = null;
      ST.create({
        trigger: '#doneaza', start: 'top 80%', end: 'bottom 20%',
        onEnter: () => { setTimeout(hop, 450); timer = setInterval(hop, 6000); },
        onEnterBack: () => { hop(); timer = setInterval(hop, 6000); },
        onLeave: () => clearInterval(timer), onLeaveBack: () => clearInterval(timer)
      });
      go.addEventListener('mouseenter', hop);
    }

    // sub 1180px panoul coboară în secțiunea 07, iar bara de jos ia CTA-ul
    const mq = matchMedia('(min-width: 1180px)');
    const relocate = () => {
      if (mq.matches) { if (card.parentElement !== pay) pay.appendChild(card); }
      else if (here && card.parentElement !== here) here.appendChild(card);
    };
    relocate();
    mq.addEventListener('change', relocate);

    $$('[data-focus-pay]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = card.parentElement === pay ? go : card;
      target.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' });
      if (GS && !RM) GS.fromTo(card, { boxShadow: '0 0 0 0 rgba(161,136,84,0)' },
        { boxShadow: '0 0 0 7px rgba(161,136,84,.35)', duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.out' });
    }));

    const bar = $('#paybar');
    if (bar && GS && ST && !RM) {
      ST.create({
        trigger: '.scene--hero', start: 'bottom 70%',
        onEnter: () => GS.to(bar, { y: 0, duration: 0.45, ease: 'power3.out' }),
        onLeaveBack: () => GS.to(bar, { y: '102%', duration: 0.35, ease: 'power2.in' })
      });
      ST.create({
        trigger: '#doneaza', start: 'top 70%',
        onEnter: () => GS.to(bar, { y: '102%', duration: 0.35, ease: 'power2.in' }),
        onLeaveBack: () => GS.to(bar, { y: 0, duration: 0.4, ease: 'power3.out' })
      });
    } else if (bar) { bar.style.transform = 'none'; }
  }

  /* ======================================================================
     Intrări de secțiune, copiere IBAN, pornire
     ====================================================================== */
  function buildReveals() {
    if (RM || !GS || !ST) return;
    GS.from('.hero-in > *', { y: 24, opacity: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out', delay: 0.1 });
    GS.from('.top', { opacity: 0, y: -10, duration: 0.7, delay: 0.35 });
    $$('.doc').forEach((s) => {
      const kids = $$(':scope > .wrap > *', s);
      GS.from(kids, { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: s, start: 'top 76%' } });
    });
  }

  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copiat'; b.classList.add('ok'); }
    catch (e) { b.textContent = 'Selectează manual'; }
    setTimeout(() => { b.textContent = 'Copiază'; b.classList.remove('ok'); }, 2200);
  }));

  buildVoices();
  buildRoute();
  buildClip();
  buildFan();
  buildChapel();
  buildPay();
  buildReveals();
  if (ST) {
    addEventListener('load', () => ST.refresh());
    ST.addEventListener('refresh', () => { measureSky(); applySky(scrollY); });
  }
})();
