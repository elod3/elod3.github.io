/* Minicurs — concept de redesign. Fără biblioteci: tot ce se mișcă e legat direct de scroll. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = () => innerWidth <= 760;

  /* ---------- numărul planșei din bară ---------- */
  const sheetNr = $('#sheetNr'), sheetName = $('#sheetName');
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      sheetNr.textContent = e.target.dataset.sheet;
      sheetName.textContent = e.target.dataset.name;
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-sheet]').forEach((s) => io.observe(s));

  /* ---------- video: bucla mută, iar la click clipul întreg de pe YouTube, cu sunet ---------- */
  const play = $('.reel__play');
  play.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${play.dataset.yt}?autoplay=1&playsinline=1&rel=0`;
    f.title = 'Arh. Alin Ionescu despre minicurs';
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.allowFullscreen = true;
    const fr = $('.reel__frame');
    fr.replaceChildren(f);
  });
  if (reduce) { const v = $('.reel__loop'); v.removeAttribute('autoplay'); v.pause(); }

  /* ---------- planșa care se desenează ---------- */
  const draft = $('.draft'), plan = $('#plan');
  const steps = $$('.step'), lays = $$('.lay', plan);
  const lessonsEl = $('#lessons'), stepNr = $('#stepNr'), lessonsNow = $('#lessonsNow');
  for (let i = 1; i <= 22; i++) { const li = document.createElement('li'); li.textContent = i; lessonsEl.appendChild(li); }
  const cells = $$('li', lessonsEl);
  const stepLessons = steps.map((s) => s.dataset.l.split(',').map(Number));

  // fiecare strat: liniile se trag cu dash, restul (hașuri, text, linii punctate) apar treptat
  const parts = lays.map((g) => $$('path, rect, circle, text', g)
    .map((el) => {
      const isLine = el.classList.contains('d') && !el.matches('.dash, .dash2') && el.getTotalLength;
      const len = isLine ? Math.ceil(el.getTotalLength()) + 2 : 0;
      if (isLine) { el.style.strokeDasharray = len; }
      return { el, isLine, len };
    }));

  const paintLayer = (i, k) => {
    const list = parts[i], n = list.length;
    list.forEach((p, j) => {
      const kj = clamp(k * 1.6 - (j / n) * 0.6);
      if (p.isLine) p.el.style.strokeDashoffset = p.len * (1 - kj);
      else p.el.style.opacity = kj;
    });
  };

  // pe telefon, „camera” se mută pe detaliul care se desenează
  const FULL = [0, 0, 1000, 640];
  const BOX = [[20, 250, 780, 590], [60, 60, 640, 485], [330, 40, 610, 462], [190, 100, 620, 470], [30, 330, 860, 310], [600, 20, 400, 303]];
  let vb = FULL.slice();
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);

  let lastStep = -1;
  const setStep = (s, done) => {
    if (s === lastStep) return;
    lastStep = s;
    steps.forEach((el, i) => el.classList.toggle('is-on', i === s));
    stepNr.textContent = s + 1;
    lessonsNow.textContent = steps[s].querySelector('.step__l').textContent;
    cells.forEach((c, i) => {
      const n = i + 1;
      c.classList.toggle('on', stepLessons[s].includes(n));
      c.classList.toggle('done', stepLessons.slice(0, s).flat().includes(n) || (done && stepLessons.flat().includes(n)));
    });
  };

  const drawStatic = () => {
    document.documentElement.classList.add('static');
    lays.forEach((_, i) => paintLayer(i, 1));
    steps.forEach((el) => el.classList.add('is-on'));
    cells.forEach((c, i) => c.classList.toggle('done', stepLessons.flat().includes(i + 1)));
    stepNr.textContent = '6'; lessonsNow.textContent = 'cele de pe planșă';
  };

  const drawScroll = () => {
    const r = draft.getBoundingClientRect();
    const lead = innerHeight * 0.45;              // terenul începe să se traseze cât intră secțiunea
    const prog = clamp((lead - r.top) / (r.height - innerHeight + lead));
    const raw = prog * 6.5;                       // ultimele 0,5 țin planșa completă pe ecran
    const s = Math.min(5, Math.floor(raw));
    lays.forEach((_, i) => paintLayer(i, clamp((raw - i) / 0.72)));
    setStep(s, raw >= 6);
    // camera
    let target = FULL;
    if (narrow()) {
      if (raw >= 5.85) target = FULL;
      else {
        const f = raw - s, a = BOX[s];
        const b = s < 5 ? BOX[s + 1] : FULL;
        const t = s < 5 ? ease(clamp((f - 0.8) / 0.2)) : 0;
        target = a.map((v, i) => lerp(v, b[i], t));
      }
    }
    vb = vb.map((v, i) => lerp(v, target[i], 0.3));
    plan.setAttribute('viewBox', vb.map((v) => v.toFixed(1)).join(' '));
    return vb.some((v, i) => Math.abs(v - target[i]) > 0.5);   // camera încă se mișcă
  };

  /* ---------- finalul: din planșă în casă ---------- */
  const fin = $('.final'), trace = $('#trace'), casa = $('#casaImg');
  const tr = $$('path', trace).map((el) => { const l = Math.ceil(el.getTotalLength()) + 2; el.style.strokeDasharray = l; el.style.strokeDashoffset = l; return { el, l }; });
  const drawFinal = () => {
    const r = fin.getBoundingClientRect();
    const q = narrow()
      ? clamp((innerHeight - r.top) / (innerHeight * 1.1))
      : clamp((innerHeight * 0.6 - r.top) / (r.height - innerHeight * 0.4 + 56));
    const k = clamp(q / 0.5);
    tr.forEach((p, j) => { p.el.style.strokeDashoffset = p.l * (1 - clamp(k * 1.5 - j / tr.length * 0.5)); });
    const w = clamp((q - 0.45) / 0.4);
    casa.style.setProperty('--wipe', (100 - w * 100).toFixed(2) + '%');
    trace.classList.toggle('lit', w > 0.55);
  };

  if (reduce) {
    drawStatic();
    tr.forEach((p) => { p.el.style.strokeDashoffset = 0; });
    casa.style.setProperty('--wipe', '0%');
  } else {
    let ticking = false;
    const frame = () => {
      ticking = false;
      const moving = drawScroll(); drawFinal();
      if (moving) req();                                   // camera se așază lin și după ce scroll-ul s-a oprit
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    frame();
  }

  /* ---------- barele de comparație cresc când ajungi la ele ---------- */
  const calc = $('.calc');
  if (!reduce) {
    calc.classList.add('pre');
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { calc.classList.remove('pre'); o.disconnect(); } }), { threshold: 0.25 }).observe(calc);
  }
  // scara de sub bare: procentele stau unde le e locul
  $$('.bars').forEach((b) => {
    const sc = $('.bars__scale', b), bar = $('.b--full', b);
    const place = () => {
      const r0 = sc.getBoundingClientRect(), rb = bar.getBoundingClientRect();
      const x0 = rb.left - r0.left, w = rb.width;
      $$('span', sc).forEach((s) => { s.style.left = (x0 + w * parseFloat(s.textContent) / 100) + 'px'; });
    };
    place(); addEventListener('resize', place);
  });

  /* ---------- cele 22 de zile ---------- */
  const days = $('#days');
  for (let i = 1; i <= 22; i++) {
    const d = document.createElement('span');
    d.innerHTML = `${i === 1 ? 'azi' : 'ziua'}<b>${String(i).padStart(2, '0')}</b>5 min`;
    days.appendChild(d);
  }

  /* ---------- fișa de verificare ---------- */
  const qs = $$('#qs li'), verdict = $('#verdict'), vCount = $('#vCount');
  const state = new Array(qs.length).fill(null);
  const update = () => {
    const ez = state.filter((v) => v === 'ezit').length, st = state.filter((v) => v === 'stiu').length;
    const answered = ez + st;
    vCount.textContent = answered ? `Ai răspuns la ${answered} din 7 · ai ezitat la ${ez}` : '';
    const was = verdict.className;
    verdict.classList.toggle('v-all', st === 7);
    verdict.classList.toggle('v-some', ez > 0);
    if (ez > 0 && !was.includes('v-some')) { const b = $('.btn', verdict); b.style.animation = 'none'; b.offsetWidth; b.style.animation = ''; }
  };
  qs.forEach((li, i) => {
    const p = $('p', li); p.innerHTML = `<span>${p.innerHTML}</span>`;
    const pick = document.createElement('div');
    pick.className = 'pick'; pick.setAttribute('role', 'group'); pick.setAttribute('aria-label', 'Întrebarea ' + (i + 1));
    pick.innerHTML = '<button type="button" class="s" aria-pressed="false">Știu</button><button type="button" class="z" aria-pressed="false">Ezit</button>';
    li.appendChild(pick);
    const [bs, bz] = $$('button', pick);
    const set = (v) => {
      state[i] = state[i] === v ? null : v;
      bs.setAttribute('aria-pressed', state[i] === 'stiu'); bz.setAttribute('aria-pressed', state[i] === 'ezit');
      li.classList.toggle('stiu', state[i] === 'stiu'); li.classList.toggle('ezit', state[i] === 'ezit');
      update();
    };
    bs.addEventListener('click', () => set('stiu'));
    bz.addEventListener('click', () => set('ezit'));
  });

  /* ---------- capturile originale ale mesajelor ---------- */
  const box = $('#shotbox'), img = $('#shotImg');
  $$('.shot').forEach((b) => b.addEventListener('click', () => {
    img.src = b.dataset.src; img.alt = 'Captura mesajului de la ' + b.dataset.who;
    box.showModal();
  }));
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
})();
