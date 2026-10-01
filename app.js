/* Portofoliu: fișele lucrărilor, ecranul fix care schimbă clipul și culoarea paginii care urmează proiectul. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = matchMedia('(min-width: 961px)');

  // Culorile vin din site-ul fiecărui proiect: fundal, text, accent.
  const P = [
    { id: 'casa-care-vinde', name: 'Inhabit Media', who: 'arh. Alin Ionescu', year: '2026', kind: 'Site de parteneriate',
      what: 'Site de parteneriate de brand pentru un arhitect urmărit de 93.000 de oameni. Cifre reale din Insights, campania NovingAIR și un calculator care îi arată firmei ce îi aduce colaborarea.',
      fig: '93.000', figL: 'de oameni îl urmăresc; site-ul le vorbește firmelor care vor să ajungă la ei',
      tech: 'HTML · CSS · JS · 7 pagini', bg: '#17140d', ink: '#f3ecd9', acc: '#f9d65c' },
    { id: 'casa-care-vinde-mix', name: 'Casa care se construiește', who: 'arh. Alin Ionescu', year: '2026', kind: 'Variantă 3D',
      what: 'Aceeași poveste, altă formă: o casă pasivă în secțiune se ridică strat cu strat pe măsură ce derulezi. Fiecare strat e o categorie pe care o poate sponsoriza o firmă.',
      fig: 'PHI', figL: 'casă pasivă, după standardul Passive House Institute din Darmstadt',
      tech: 'three.js · GSAP ScrollTrigger · Lenis', bg: '#221b15', ink: '#f4e9dc', acc: '#fab387' },
    { id: 'medclyn-demo', name: 'MedClyn', who: 'medclyn.com', year: '2026', kind: 'Demo de concept',
      what: 'Un perete de faianță contaminat pe care îl ștergi cu mâna, iar dedesubt apare placa antibacteriană. Cerințele regulamentului față în față cu fișa tehnică, șantiere reale și hala construită în 3D din trei numere.',
      fig: '852/2004', figL: 'regulamentul CE de igienă, citat rând cu rând lângă fișa tehnică a plăcii',
      tech: 'three.js · texturi PBR · HDRI', bg: '#0e1c29', ink: '#e4edf2', acc: '#24bfcd' },
    { id: 'prezentari', name: 'Secret sauce', who: 'prezentări proprii', year: '2026', kind: 'Prezentări interactive',
      what: 'Două prezentări: Claude pe bune, apoi servere și agenți AI. Rulează în browser, se controlează din taste ca un deck adevărat, au note de prezentator pe telefon și gravuri SVG desenate pentru ele.',
      fig: '2 × 19', figL: 'slide-uri, cu note de prezentator pe telefon',
      tech: 'HTML · SVG · CSS', bg: '#f1ebe1', ink: '#1d1a16', acc: '#c9512f' },
    { id: 'domino', name: 'Domino', who: 'produsul meu', year: '2026', kind: 'Site de aplicație',
      what: 'Site-ul aplicației mele Android de auto-control. Un lanț de piese care cade când îl împingi, un telefon care schimbă clipurile după funcția despre care citești, în română și engleză.',
      fig: '30', figL: 'de piese în lanțul care cade când îl împingi',
      tech: 'HTML · CSS · JS · video', bg: '#0d0d0c', ink: '#efe8da', acc: '#ff5533' }
  ];
  const url = (p) => 'https://elod3.github.io/' + p.id + '/';
  const nr = (i) => String(i + 1).padStart(2, '0');
  const clip = (p) => `<video muted loop playsinline preload="none" poster="media/${p.id}.webp" width="960" height="600"><source src="media/${p.id}.mp4" type="video/mp4"></video>`;

  /* ---------- fișele, ecranul și indexul ---------- */
  const cases = $('#cases'), screen = $('#screen'), rows = $('#rows');
  P.forEach((p, i) => {
    const a = document.createElement('article');
    a.className = 'case'; a.dataset.i = i;
    a.innerHTML = `
      <p class="case__nr"><span>${nr(i)}</span>${p.kind}</p>
      <h2 class="case__name">${p.name}</h2>
      <figure class="case__clip">${clip(p)}</figure>
      <p class="case__what">${p.what}</p>
      <p class="case__fig"><b>${p.fig}</b><span>${p.figL}</span></p>
      <dl class="case__meta">
        <div><dt>Pentru</dt><dd>${p.who}</dd></div>
        <div><dt>An</dt><dd>${p.year}</dd></div>
        <div><dt>Tehnologie</dt><dd>${p.tech}</dd></div>
      </dl>
      <a class="case__go" href="${url(p)}" target="_blank" rel="noopener">Deschide site-ul<span class="sr"> ${p.name}</span></a>`;
    cases.appendChild(a);

    const f = document.createElement('div');
    f.className = 'shot'; f.dataset.i = i;
    f.innerHTML = clip(p);
    screen.appendChild(f);

    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="m">${nr(i)}</td><td><a href="${url(p)}" target="_blank" rel="noopener">${p.name}</a></td><td>${p.who}</td><td>${p.kind}</td><td class="m">${p.tech}</td><td class="go" aria-hidden="true">↗</td>`;
    tr.addEventListener('click', (e) => { if (!e.target.closest('a')) $('a', tr).click(); });
    rows.appendChild(tr);
  });

  const play = (v, on) => {
    if (on && !reduced){ v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  };

  /* ---------- proiectul activ: culoarea paginii, clipul de pe ecran ---------- */
  const root = document.documentElement;
  let cur = -1;
  function activate(i){
    if (i === cur) return;
    cur = i;
    const p = P[i];
    if (p){
      root.style.setProperty('--bg', p.bg); root.style.setProperty('--ink', p.ink); root.style.setProperty('--acc', p.acc);
      root.dataset.tone = luma(p.bg) < .5 ? 'dark' : 'light';
      $('#stageUrl').textContent = 'elod3.github.io/' + p.id;
      $('#stageNr').textContent = nr(i) + ' / ' + nr(P.length - 1);
    } else {
      ['--bg', '--ink', '--acc'].forEach((k) => root.style.removeProperty(k));
      root.dataset.tone = 'light';
    }
    $$('.case').forEach((c) => c.classList.toggle('on', +c.dataset.i === i));
    $$('.shot').forEach((s) => {
      const on = +s.dataset.i === i;
      s.classList.toggle('on', on);
      if (wide.matches) play($('video', s), on);
    });
  }
  function luma(hex){
    const n = parseInt(hex.slice(1), 16);
    return (0.2126 * (n >> 16) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255;
  }

  // Proiectul activ e fișa care trece prin mijlocul ecranului; în afara lucrărilor, pagina revine la hârtie.
  const work = $('#lucrari');
  function onScroll(){
    const mid = innerHeight / 2;
    const w = work.getBoundingClientRect();
    if (w.top > mid || w.bottom < mid){ activate(-1); return; }
    let best = 0;
    $$('.case').forEach((c, i) => { if (c.getBoundingClientRect().top < mid) best = i; });
    activate(best);
  }
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; onScroll(); }); }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Pe telefon fiecare fișă are clipul ei, care rulează doar cât e pe ecran.
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!wide.matches) play(e.target, e.isIntersecting);
    }), { threshold: .5 });
    $$('.case__clip video').forEach((v) => io.observe(v));
  }
  wide.addEventListener('change', () => {
    $$('video').forEach((v) => v.pause());
    cur = -1; onScroll();
  });

  requestAnimationFrame(() => root.classList.add('in'));
})();
