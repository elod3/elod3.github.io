/* Kusekwa — clasa a XII-a, Liceul Integritas.
   Pagina e drumul și ce facem la capătul lui. Se derulează în jos, dar și pe lateral:
   ce facem acolo trece prin fața ta, nu sub ea. */
(() => {
  'use strict';

  /* ======================================================================
     CONFIG — singurul loc de schimbat când vin datele de la școală.
     ====================================================================== */
  const CONFIG = {
    stripeLink: '',
    stripeAmountParam: '__prefilled_amount',
    fallbackLink: 'https://liceulintegritas.ro/donatii',
    paypalLink: '',
    stops: [
      { n: 'Târgu Mureș', s: 'România',  lat:  46.54, lon: 24.56 },
      { n: 'Budapesta',   s: 'Ungaria',  lat:  47.50, lon: 19.04, mode: 'road' },
      { n: 'Istanbul',    s: 'Turcia',   lat:  41.01, lon: 28.98, mode: 'air'  },
      { n: 'Nairobi',     s: 'Kenya',    lat:  -1.29, lon: 36.82, mode: 'air'  },
      { n: 'Sirari',      s: 'graniță',  lat:  -1.25, lon: 34.50, mode: 'road' },
      { n: 'Bariadi',     s: 'Tanzania', lat:  -2.80, lon: 33.98, mode: 'road' },
      { n: 'Kusekwa',     s: 'școala',   lat:  -2.95, lon: 33.80, mode: 'road', end: true }
    ],
    // scroll (0..1) -> cât din drum s-a parcurs; neliniar, altfel zborul mănâncă tot
    pace:     [[0, 0], [0.30, 0], [0.44, 0.064], [0.72, 0.931], [0.92, 1], [1, 1]],
    drawPace: [[0, 0.42], [0.24, 1], [1, 1]],
    // apropierea: lumea întreagă → jos la Mureș → sus la decolare → jos în savană
    zoomPace: [[0, 1], [0.24, 1], [0.32, 9], [0.46, 9], [0.58, 1], [0.76, 1], [0.95, 9.5], [1, 9.5]],
    // cât de mult se retrage textul și intră globul în prim-plan
    focusPace:[[0, 0], [0.10, 0], [0.22, 1], [1, 1]]
  };

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smoothstep = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const GS = window.gsap;
  if (GS && window.ScrollTrigger) GS.registerPlugin(ScrollTrigger);
  if (GS && window.SplitText) GS.registerPlugin(SplitText);
  const ST = GS && window.ScrollTrigger ? ScrollTrigger : null;
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (t, a = {}) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };

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

  /* ---------- scroll lin ---------- */
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
     Titlurile intră pe rânduri, ca la generic de film
     ====================================================================== */
  function splitIn() {
    if (RM || !GS || !ST || !window.SplitText) return;
    $$('[data-split]').forEach((el) => {
      let sp;
      try { sp = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ln' }); }
      catch (e) { return; }
      GS.from(sp.lines, {
        yPercent: 108, opacity: 0, duration: 1.05, stagger: 0.09, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });
  }

  /* ======================================================================
     I · ATLASUL
     ====================================================================== */
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
    } catch (err) { console.warn('atlasul nu a pornit:', err); fallback(); return; }

    let rz;
    addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { atlas.resize(); frame(0.016); }, 140); });

    const want = { t: 0, draw: RM ? 1 : 0.42, zoom: 1, focus: 0 };
    const has = { t: 0, draw: RM ? 1 : 0.42, zoom: 1, focus: 0 };
    let intro = RM ? 1 : 0;

    function frame(dt) {
      const k = 1 - Math.pow(0.0025, dt);
      for (const key of ['t', 'draw', 'zoom', 'focus']) has[key] += (want[key] - has[key]) * k;
      if (intro < 1) intro = Math.min(1, intro + dt / 2.1);
      const e = intro < 1 ? intro * intro * (3 - 2 * intro) : 1;
      atlas.render({ t: has.t, draw: has.draw * e, zoomTo: has.zoom, focus: has.focus });
    }
    atlas.render({ t: 0, draw: RM ? 1 : 0.42, zoomTo: 1, focus: 0 });
    if (RM) { atlas.render({ t: 0.55, draw: 1, zoomTo: 1, focus: 1 }); return; }

    let last = performance.now();
    const loop = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; frame(dt); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);

    const take = (self) => {
      want.t = paceOn(CONFIG.pace, self.progress);
      want.draw = paceOn(CONFIG.drawPace, self.progress);
      want.zoom = paceOn(CONFIG.zoomPace, self.progress);
      want.focus = paceOn(CONFIG.focusPace, self.progress);
    };
    ST && ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: take, onRefresh: take });

    /* titlul se retrage în stânga-jos și se micșorează; etapele îi iau locul */
    const hero = $('.beat--hero'), beats = $$('.beat:not(.beat--hero)');
    if (GS) {
      GS.set(beats, { opacity: 0, y: 18 });
      GS.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: '14% top', scrub: 0.8 } })
        .to(hero, { top: '100%', y: '-34vh', scale: 0.64, duration: 1, ease: 'none' }, 0)
        .to(hero, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 0.62);
    }
    const marks = [0.14, 0.31, 0.50, 0.77, 0.94];
    ST && ST.create({
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (self) => {
        let at = -1;
        marks.forEach((m, i) => { if (self.progress >= m) at = i - 1; });
        beats.forEach((b, i) => {
          const w = i === at ? 1 : 0;
          if (+b.dataset.on !== w) {
            b.dataset.on = w;
            if (GS) GS.to(b, { opacity: w, y: w ? 0 : 18, duration: 0.5, ease: 'power2.out', overwrite: true });
          }
        });
      }
    });
  }

  function paintLabels(host, list) {
    if (!host) return;
    if (!host.children.length) list.forEach((l) => {
      const d = document.createElement('div');
      d.className = 'glabel';
      d.innerHTML = '<b></b><span></span>';
      d.querySelector('b').textContent = l.label;
      d.querySelector('span').textContent = l.sub;
      host.appendChild(d);
    });
    const w = host.clientWidth, h = host.clientHeight, narrow = w < 900;
    const placed = [], show = new Array(list.length).fill(false);
    list.map((l, i) => ({ l, i })).reverse().forEach(({ l, i }) => {
      if (!l.on) return;
      const x = l.x * w, y = l.y * h;
      if (x < 8 || x > w - 60 || y < 80 || y > h - 24) return;
      if (narrow && y > h * 0.5) return;
      if (placed.some((q) => Math.hypot(q.x - x, q.y - y) < 92)) return;
      placed.push({ x, y }); show[i] = { x, y };
    });
    list.forEach((l, i) => {
      const el = host.children[i];
      if (!el) return;
      el.classList.toggle('on', !!show[i]);
      if (show[i]) el.style.transform = `translate(${(show[i].x + 13).toFixed(1)}px, ${(show[i].y - 18).toFixed(1)}px)`;
    });
  }

  /* ======================================================================
     II · PULSUL — linia de monitor, desenată, care curge la nesfârșit
     ====================================================================== */
  function buildPulse() {
    const svg = $('#ecg'), sec = $('.pulse'), bpmEl = $('#bpm');
    if (!svg || !sec) return;
    const P = 200, H = 100, reps = 14, W = P * reps;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // un ciclu: P, complexul QRS, apoi T. Proporțiile unui traseu real, nu zimți la întâmplare.
    const beat = (x0) => {
      const y = (v) => (H / 2 - v).toFixed(1);
      const p = [];
      const put = (x, v) => p.push(`${(x0 + x).toFixed(1)} ${y(v)}`);
      put(0, 0); put(22, 0);
      put(30, 5); put(38, 8); put(46, 5); put(54, 0);     // unda P
      put(66, 0); put(70, -5);                            // Q
      put(76, 34); put(82, -12);                          // R, S
      put(88, 0); put(104, 0);
      put(116, 7); put(126, 11); put(136, 7); put(146, 0); // unda T
      put(P, 0);
      return p;
    };
    let pts = [];
    for (let i = 0; i < reps; i++) pts = pts.concat(beat(i * P));
    const d = 'M' + pts.join(' L');
    svg.appendChild(svgEl('path', { class: 'ecg-ghost', d: `M0 ${H / 2} L${W} ${H / 2}` }));
    const line = svgEl('path', { class: 'ecg-path', d, 'vector-effect': 'non-scaling-stroke' });
    svg.appendChild(line);

    if (RM || !GS) return;
    // curge spre stânga exact cu un ciclu, deci bucla nu se vede
    GS.to(line, { attr: { transform: `translate(${-P} 0)` }, duration: 0.84, ease: 'none', repeat: -1 });
    if (ST) {
      GS.from(line, { opacity: 0, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 70%' } });
      // bătaia se mai schimbă, ca la un om care stă liniștit
      let bpm = 72;
      ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top',
        onToggle: (s) => {
          if (!s.isActive) return;
          clearInterval(buildPulse.t);
          buildPulse.t = setInterval(() => {
            bpm = 68 + Math.round(Math.random() * 9);
            if (bpmEl) bpmEl.textContent = bpm;
          }, 2600);
        } });
    }
  }

  /* ======================================================================
     III · CE FACEM ACOLO — pe orizontală, prin fața ta
     ====================================================================== */
  const ART = {
    // patru desene, în aceeași linie ca atlasul și biserica
    seminar: [
      'M8 86 L112 86',
      'M30 86 L30 56 L48 56 L48 86', 'M26 54 L52 54', 'M34 62 L44 62 M34 70 L44 70',
      'M39 46 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0',
      'M70 86 L70 72 L82 72 L82 86 M76 66 m-4.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0',
      'M88 86 L88 72 L100 72 L100 86 M94 66 m-4.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0'
    ],
    home: [
      'M8 86 L112 86',
      'M22 86 L22 50 L60 24 L98 50 L98 86',
      'M52 86 L52 62 L68 62 L68 86', 'M58 74 m-1.6 0 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0',
      'M30 56 L44 56 L44 68 L30 68 Z', 'M37 56 L37 68 M30 62 L44 62',
      'M74 44 L90 44 L90 56 L74 56 Z', 'M82 44 L82 56 M74 50 L90 50'
    ],
    school: [
      'M8 86 L112 86',
      'M22 86 L22 44 L78 44 L78 86',
      'M22 58 L78 58 M22 72 L78 72', 'M36 44 L36 86 M50 44 L50 86 M64 44 L64 86',
      'M44 86 L44 76 L56 76 L56 86',
      'M88 86 L88 30 M100 86 L100 30 M88 30 L100 30 M88 46 L100 46 M88 62 L100 62',
      'M94 22 L94 30 M88 22 L100 22'
    ],
    med: [
      'M6 58 L32 58 L40 36 L50 80 L60 44 L68 58 L114 58',
      'M60 96 C34 78 20 64 20 48 a15 15 0 0 1 40 -9 a15 15 0 0 1 40 9 c0 16 -14 30 -40 48 Z'
    ]
  };

  function buildRail() {
    $$('.card-art').forEach((fig) => {
      const key = fig.dataset.art, paths = ART[key];
      if (!paths) return;
      const svg = svgEl('svg', { viewBox: '0 0 120 100', 'aria-hidden': 'true' });
      paths.forEach((d, i) => svg.appendChild(svgEl('path', {
        class: 'a-l ' + (key === 'med' ? (i ? 'a-l--edge' : 'a-l--hi') : i === 0 ? 'a-l--lo' : 'a-l--edge'), d
      })));
      fig.appendChild(svg);
      if (RM || !GS || !ST) return;
      const ps = $$('path', svg);
      ps.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      GS.to(ps, { strokeDashoffset: 0, duration: 1.1, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: fig, start: 'left 88%', horizontal: true, containerAnimation: buildRail.anim } });
    });

    const sec = $('.rail'), track = $('#railTrack');
    if (!sec || !track || RM || !GS || !ST) return;
    const dist = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 48);
    buildRail.anim = GS.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 }
    });
  }

  /* ======================================================================
     IV · OAMENII
     ====================================================================== */
  function buildVoices() {
    const sec = $('.voices');
    if (!sec || RM || !GS || !ST) return;
    const bs = $$('.vbeat', sec), turn = $('.vturn', sec);
    GS.set(bs, { opacity: 0 }); GS.set(bs[0], { opacity: 1 });
    const tl = GS.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'bottom bottom', scrub: 0.7 } });
    bs.forEach((b, i) => {
      const at = 0.3 + i * 1.1;
      if (i) tl.to(bs[i - 1], { opacity: 0, duration: 0.22 }, at - 0.1).to(b, { opacity: 1, duration: 0.22 }, at - 0.08);
      tl.from($('.sil', b), { yPercent: 13, opacity: 0, duration: 0.4, ease: 'power2.out' }, at)
        .from($('.vsub', b), { opacity: 0, y: 10, duration: 0.3 }, at + 0.42)
        .from($('.vfact', b), { opacity: 0, y: 14, duration: 0.3 }, at + 0.55);
    });
    tl.to(turn, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.3 + bs.length * 1.1 - 0.35);
  }

  /* ======================================================================
     V · BISERICA
     ====================================================================== */
  function buildChapel() {
    const host = $('#chapel');
    if (!host) return;
    const W = 520, H = 440;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Biserica, desenată din linii' });
    host.appendChild(svg);
    const CX = W / 2, CY = H * 0.70, U = 32;
    const iso = (x, y, z) => [CX + (x - y) * U * 0.866, CY + (x + y) * U * 0.5 - z * U];
    const L = (pts, cls) => {
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      const el = svgEl('path', { class: 'ch-l ' + (cls || ''), d });
      svg.appendChild(el); return el;
    };
    const A = 2.15, B = 3.35, wallH = 2.15, ridgeH = 3.65;
    const parts = [];
    parts.push({ at: 0, el: L([iso(-A-.18,-B-.18,0), iso(A+.18,-B-.18,0), iso(A+.18,B+.18,0), iso(-A-.18,B+.18,0), iso(-A-.18,-B-.18,0)], 'ch-l--soft'), kind: 'draw' });
    const corners = [[-A,-B],[A,-B],[A,B],[-A,B]];
    corners.forEach((c, i) => {
      const n = corners[(i + 1) % 4];
      parts.push({ at: 0.09 + i * 0.07, el: L([iso(c[0],c[1],0), iso(c[0],c[1],wallH), iso(n[0],n[1],wallH), iso(n[0],n[1],0)], ''), kind: 'rise', a: c, b: n, h: wallH });
    });
    [-B, -B/2.2, B/2.2, B].forEach((y, i) => parts.push({ at: 0.39 + i*0.04, el: L([iso(-A,y,wallH), iso(0,y,ridgeH), iso(A,y,wallH)], 'ch-l--soft'), kind: 'draw' }));
    parts.push({ at: 0.56, el: L([iso(0,-B,ridgeH), iso(0,B,ridgeH)], 'ch-l--gold'), kind: 'draw' });
    parts.push({ at: 0.60, el: L([iso(-A,-B,wallH), iso(0,-B,ridgeH), iso(0,B,ridgeH), iso(-A,B,wallH)], ''), kind: 'draw' });
    parts.push({ at: 0.64, el: L([iso(A,-B,wallH), iso(0,-B,ridgeH), iso(0,B,ridgeH), iso(A,B,wallH)], ''), kind: 'draw' });
    parts.push({ at: 0.68, el: L([iso(-A-.2,-B-.2,wallH-.08), iso(-A-.2,B+.2,wallH-.08)], 'ch-l--soft'), kind: 'draw' });
    parts.push({ at: 0.68, el: L([iso(A+.2,-B-.2,wallH-.08), iso(A+.2,B+.2,wallH-.08)], 'ch-l--soft'), kind: 'draw' });
    [-2.0,-0.7,0.7,2.0].forEach((y, i) => parts.push({ at: 0.72 + i*0.022, el: L([iso(A,y-.35,.72), iso(A,y+.35,.72), iso(A,y+.35,1.62), iso(A,y-.35,1.62), iso(A,y-.35,.72)], ''), kind: 'draw' }));
    parts.push({ at: 0.80, el: L([iso(-.95,B,0), iso(-.95,B+.85,0), iso(-.95,B+.85,1.75), iso(.95,B+.85,1.75), iso(.95,B+.85,0), iso(.95,B,0)], 'ch-l--soft'), kind: 'draw' });
    parts.push({ at: 0.83, el: L([iso(-.95,B+.85,1.75), iso(0,B+.85,2.45), iso(.95,B+.85,1.75)], ''), kind: 'draw' });
    parts.push({ at: 0.86, el: L([iso(-.56,B,0), iso(.56,B,0), iso(.56,B,1.72), iso(-.56,B,1.72), iso(-.56,B,0)], ''), kind: 'draw' });
    parts.push({ at: 0.88, el: L([iso(0,B,0), iso(0,B,1.72)], 'ch-l--soft'), kind: 'draw' });
    parts.push({ at: 0.90, el: L([iso(-1.15,B+1.1,0), iso(1.15,B+1.1,0)], 'ch-l--soft'), kind: 'draw' });
    parts.push({ at: 0.93, el: L([iso(0,B,ridgeH), iso(0,B,ridgeH+1.25)], 'ch-l--gold'), kind: 'draw' });
    parts.push({ at: 0.97, el: L([iso(-.42,B,ridgeH+.82), iso(.42,B,ridgeH+.82)], 'ch-l--gold'), kind: 'draw' });
    parts.forEach((p) => { p.len = (p.el.getTotalLength && p.el.getTotalLength()) || 1; });

    let want = RM ? 1 : 0, now = RM ? 1 : 0;
    const render = () => parts.forEach((q) => {
      const t = clamp((now * 1.14 - q.at) / 0.1, 0, 1);
      if (q.kind === 'rise') {
        const pts = [iso(q.a[0],q.a[1],0), iso(q.a[0],q.a[1],q.h*t), iso(q.b[0],q.b[1],q.h*t), iso(q.b[0],q.b[1],0)];
        q.el.setAttribute('d', pts.map((z,i) => (i?'L':'M')+z[0].toFixed(1)+' '+z[1].toFixed(1)).join(' '));
        q.el.style.opacity = t > 0 ? 1 : 0;
      } else { q.el.style.strokeDasharray = q.len; q.el.style.strokeDashoffset = q.len * (1 - t); }
    });
    render();

    const hint = $('#buildHint');
    if (hint && !matchMedia('(hover: hover) and (pointer: fine)').matches) hint.textContent = 'Derulează: se ridică.';
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
     VI · FIȘA DE DONAȚIE
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
      goSum.textContent = String(sum); go.href = link();
      if (note) note.textContent = live
        ? 'Plata se face pe pagina securizată Stripe a școlii.'
        : 'Deocamdată butonul duce la pagina de donații a școlii. Când Stripe-ul e pornit, cardul, Google Pay și Apple Pay merg direct de aici.';
    };
    $$('.pay-amounts button').forEach((b) => b.addEventListener('click', () => {
      $$('.pay-amounts button').forEach((o) => o.classList.toggle('is-on', o === b));
      if (other) other.value = '';
      sum = Number(b.dataset.sum); paint();
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
      ST.create({ trigger: '#doneaza', start: 'top 80%', end: 'bottom 20%',
        onEnter: () => { setTimeout(hop, 420); timer = setInterval(hop, 6000); },
        onEnterBack: () => { hop(); timer = setInterval(hop, 6000); },
        onLeave: () => clearInterval(timer), onLeaveBack: () => clearInterval(timer) });
      go.addEventListener('mouseenter', hop);
    }

    const mq = matchMedia('(min-width: 1180px)');
    const place = () => {
      if (mq.matches) { if (card.parentElement !== pay) pay.appendChild(card); }
      else if (here && card.parentElement !== here) here.appendChild(card);
    };
    place(); mq.addEventListener('change', place);

    $$('[data-focus-pay]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      (card.parentElement === pay ? go : card).scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' });
      if (GS && !RM) GS.fromTo(card, { boxShadow: '0 0 0 0 rgba(232,116,43,0)' },
        { boxShadow: '0 0 0 8px rgba(232,116,43,.3)', duration: .35, yoyo: true, repeat: 1, ease: 'power2.out' });
    }));

    if (ST) {
      ST.create({ trigger: '.pulse', start: 'top 70%',
        onToggle: (s) => document.body.classList.toggle('pay-on', s.isActive || s.progress > 0) });
      // cât ține secțiunea pe orizontală, fișa se dă la o parte: acolo trec panourile
      ST.create({ trigger: '.rail', start: 'top 60%', end: 'bottom bottom',
        onToggle: (s) => document.body.classList.toggle('pay-off', s.isActive) });
    }
    document.body.classList.toggle('pay-on', scrollY > innerHeight);

    const bar = $('#paybar');
    if (bar && GS && ST && !RM) {
      ST.create({ trigger: '.pulse', start: 'top 80%',
        onEnter: () => GS.to(bar, { y: 0, duration: .45, ease: 'power3.out' }),
        onLeaveBack: () => GS.to(bar, { y: '102%', duration: .35, ease: 'power2.in' }) });
      ST.create({ trigger: '#doneaza', start: 'top 70%',
        onEnter: () => GS.to(bar, { y: '102%', duration: .35, ease: 'power2.in' }),
        onLeaveBack: () => GS.to(bar, { y: 0, duration: .4, ease: 'power3.out' }) });
    } else if (bar) bar.style.transform = 'none';
  }

  /* ---------- restul ---------- */
  function buildMisc() {
    if (!RM && GS && ST) $$('.doc').forEach((s) => {
      GS.from($$(':scope > .wrap > *:not(.dhead)', s), { y: 26, opacity: 0, duration: .8, stagger: .1,
        ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 76%' } });
    });
    $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copiat'; b.classList.add('ok'); }
      catch (e) { b.textContent = 'Selectează manual'; }
      setTimeout(() => { b.textContent = 'Copiază'; b.classList.remove('ok'); }, 2200);
    }));
  }

  buildVoices();
  buildPulse();
  buildRail();
  buildChapel();
  buildPay();
  buildMisc();
  splitIn();
  buildAtlas();
  if (ST) addEventListener('load', () => ST.refresh());
})();
