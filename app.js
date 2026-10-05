/* Portofoliu: teancul de lucrări din intro, fișele cu ecranul fix, culoarea paginii care urmează proiectul
   și pagina care ține minte ce ai văzut (titlul tab-ului, rândul din final). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = matchMedia('(min-width: 961px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  // Culorile vin din site-ul fiecărui proiect: fundal, text, accent.
  const P = [
    { id: 'arcadian', path: 'sitehuni-', name: 'Arcadian Residence', who: 'dezvoltator imobiliar, Mureș', year: '2026', kind: 'Site de vânzare imobiliară',
      what: 'Site de vânzare pentru un ansamblu nZEB P+1E din Ceuașu de Câmpie. Planul apartamentului e legat de tabelul de suprafețe, turul prin casă aprinde camera pe plan, iar loaderul e făcut din panourile fațadei.',
      fig: '15 min', figL: 'până la Târgu Mureș, cu 40% din ansamblu lăsat spațiu verde',
      tech: 'HTML · CSS · GSAP · Lenis · SVG', bg: '#f2eee7', ink: '#1f1d1a', acc: '#2f6a4e' },
    { id: 'minicurs', name: 'Minicurs', who: 'arh. Alin Ionescu & arh. Anca Oprea', year: '2026', kind: 'Redesign de concept',
      what: 'Pagina minicursului gratuit pe email, refăcută ca o planșă care se desenează pe măsură ce derulezi: terenul, bugetul, casa, anvelopa, autorizația și devizul, în ordinea lecțiilor. La final liniile se trag peste randarea lor și casa apare din desen.',
      fig: '22', figL: 'de lecții pe email; cartușul planșei le numără pe măsură ce se desenează',
      tech: 'HTML · CSS · JS · SVG', bg: '#f5f5f2', ink: '#203524', acc: '#8f6d00' },
    { id: 'casa-care-vinde', name: 'Inhabit Media', who: 'arh. Alin Ionescu', year: '2026', kind: 'Site de parteneriate',
      what: 'Site de parteneriate de brand pentru un arhitect urmărit de 93.000 de oameni. Cifre reale din Insights, campania NovingAIR și un calculator care îi arată firmei ce îi aduce colaborarea.',
      fig: '93.000', figL: 'de oameni îl urmăresc; site-ul le vorbește firmelor care vor să ajungă la ei',
      tech: 'HTML · CSS · JS · 7 pagini', bg: '#17140d', ink: '#f3ecd9', acc: '#f9d65c' },
    { id: 'casa-care-vinde-mix', name: 'Casa care se construiește', who: 'arh. Alin Ionescu', year: '2026', kind: 'Variantă 3D',
      what: 'Aceeași poveste, altă formă: o casă pasivă în secțiune se ridică strat cu strat pe măsură ce derulezi. Fiecare strat e o categorie pe care o poate sponsoriza o firmă.',
      fig: 'PHI', figL: 'casă pasivă, după standardul Passive House Institute din Darmstadt',
      tech: 'three.js · GSAP ScrollTrigger · Lenis', bg: '#221b15', ink: '#f4e9dc', acc: '#fab387' },
    { id: 'planificatorul-casei-tale', name: 'Planificatorul Casei Tale', who: 'arh. Alin Ionescu & arh. Anca Oprea', year: '2026', kind: 'Pagină de vânzare',
      what: 'Pagina de vânzare pentru caietul celor care își construiesc casa: exerciții despre cum vrei să locuiești, mobilier la scară în jurul căruia desenezi camerele, bugetul pe camere și calculatorul online de cost BuildWise, inclus la achiziție.',
      fig: '60', figL: 'de pagini de exerciții, tabele și planșe la scară, vândute la 250 lei',
      tech: 'HTML · CSS · JS · video', bg: '#f4f0e5', ink: '#16151b', acc: '#e03a1c' },
    { id: 'medclyn-demo', name: 'MedClyn', who: 'medclyn.com', year: '2026', kind: 'Demo de concept',
      what: 'Un perete de faianță contaminat pe care îl ștergi cu mâna, iar dedesubt apare placa antibacteriană. Cerințele regulamentului față în față cu fișa tehnică, șantiere reale și hala construită în 3D din trei numere.',
      fig: '852/2004', figL: 'regulamentul CE de igienă, citat rând cu rând lângă fișa tehnică a plăcii',
      tech: 'three.js · texturi PBR · HDRI', bg: '#0e1c29', ink: '#e4edf2', acc: '#24bfcd' },
    { id: 'alo', name: 'Alo', who: 'produsul meu', year: '2026', kind: 'Agent AI pentru afaceri locale',
      what: 'Site de vânzare pentru agentul AI pe care îl fac pentru saloane, restaurante și cabinete: răspunde pe WhatsApp 24/7 și, separat, la telefon. Un robotel care se uită după tine vorbește când vorbește Alo; demo-ul îl poți întrerupe ca pe un om, iar calculatorul de minute marchează pachetul cel mai ieftin.',
      fig: '24/7', figL: 'pe WhatsApp; telefonul se adaugă separat, plătit pe minute',
      tech: 'HTML · CSS · JS · SVG', bg: '#121412', ink: '#e9ebe4', acc: '#d8f45a' },
    { id: 'fara-platou', name: 'Fără platou', who: 'agenția mea de reclame AI', year: '2026', kind: 'Site de agenție',
      what: 'Reclame video făcute cu Higgsfield și voce AI, vândute gata făcute. Pagina e un document de producție: un monitor rulează reclama pe 15 secunde, foaia de scenariu se aprinde în sincron, iar ce scrii că vinzi apare pe claqueta.',
      fig: '15 s', figL: 'scenariul pe secunde, aprobat de client înainte de generare',
      tech: 'HTML · CSS · JS', bg: '#0d0d0c', ink: '#ede9df', acc: '#ffb21a' },
    { id: 'riseup', name: 'RiseUp', who: 'mișcare de tineret creștin', year: '2026', kind: 'Site de prezentare',
      what: 'Pagina unei mișcări de tineret creștin. Se deschide cu stâlpul de foc din pustie, cu scântei care urcă din el, apoi tabăra și cele 12 triburi, fiecare cu rolul lui în mișcare.',
      fig: '12', figL: 'triburi, ca taberele lui Israel în jurul Cortului Întâlnirii',
      tech: 'HTML · CSS · JS · canvas · video', bg: '#05060a', ink: '#ece6d8', acc: '#f0a43c' },
    { id: 'domino', name: 'Domino', who: 'produsul meu', year: '2026', kind: 'Site de aplicație',
      what: 'Site-ul aplicației mele Android de auto-control. Un lanț de piese care cade când îl împingi, un telefon care schimbă clipurile după funcția despre care citești, în română și engleză.',
      fig: '30', figL: 'de piese în lanțul care cade când îl împingi',
      tech: 'HTML · CSS · JS · video', bg: '#0d0d0c', ink: '#efe8da', acc: '#ff5533' }
  ];
  const url = (p) => 'https://elod3.github.io/' + (p.path || p.id) + '/';
  const nr = (i) => String(i + 1).padStart(2, '0');
  const clip = (p) => `<video muted loop playsinline preload="none" poster="media/${p.id}.webp" width="960" height="600"><source src="media/${p.id}.mp4" type="video/mp4"></video>`;

  /* ---------- teancul, fișele, ecranul, barele și indexul ---------- */
  const deck = $('#deck'), cases = $('#cases'), screen = $('#screen'), bars = $('#bars'), rows = $('#rows');
  P.forEach((p, i) => {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'card'; c.style.setProperty('--i', P.length - 1 - i);  // 01 stă deasupra
    c.style.setProperty('--mid', (P.length - 1) / 2);
    c.innerHTML = `<img src="media/${p.id}.webp" alt="" width="960" height="600" decoding="async"><span>${nr(i)} · ${p.name}</span>`;
    c.setAttribute('aria-label', 'Mergi la ' + p.name);
    c.addEventListener('click', () => go(i));
    deck.appendChild(c);

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

    const b = document.createElement('button');
    b.type = 'button'; b.tabIndex = -1; b.innerHTML = '<i></i>';
    b.addEventListener('click', () => go(i));
    bars.appendChild(b);

    const tr = document.createElement('tr');
    tr.dataset.i = i;
    tr.innerHTML = `<td class="m">${nr(i)}</td><td><a href="${url(p)}" target="_blank" rel="noopener">${p.name}</a></td><td>${p.who}</td><td>${p.kind}</td><td class="m">${p.tech}</td><td class="go" aria-hidden="true">↗</td>`;
    tr.addEventListener('click', (e) => { if (!e.target.closest('a')) $('a', tr).click(); });
    rows.appendChild(tr);
  });
  bars.style.gridTemplateColumns = `repeat(${P.length}, 1fr)`;
  const caseEls = $$('.case'), shots = $$('.shot'), barEls = $$('#bars button');

  function go(i){
    const top = caseEls[i].getBoundingClientRect().top + scrollY;
    scrollTo({ top: wide.matches ? top + 2 : top - 60, behavior: reduced ? 'auto' : 'smooth' });
  }

  const play = (v, on) => {
    if (on && !reduced){ v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  };

  /* ---------- ce ai văzut: titlul tab-ului și rândul din final ---------- */
  const seen = new Set();
  try { JSON.parse(sessionStorage.getItem('vazute') || '[]').forEach((i) => seen.add(i)); } catch (e) {}
  const baseTitle = document.title;
  const left = () => P.filter((_, i) => !seen.has(i));
  function see(i){
    if (seen.has(i)) return;
    seen.add(i);
    try { sessionStorage.setItem('vazute', JSON.stringify([...seen])); } catch (e) {}
    renderSeen();
  }
  const list = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' și ' + a.at(-1);
  function renderSeen(){
    const el = $('#seen'), l = left();
    if (!seen.size){ el.hidden = true; return; }
    el.hidden = false;
    if (!l.length){ el.textContent = 'Le-ai văzut pe toate. Următoarea poate fi a ta.'; return; }
    el.innerHTML = `Ai văzut ${seen.size} din ${P.length}. ${l.length === 1 ? 'Ți-a scăpat' : 'Ți-au scăpat'}: ` +
      list(l.map((p) => `<button type="button" data-i="${P.indexOf(p)}">${p.name}</button>`)) + '.';
    $$('button', el).forEach((b) => b.addEventListener('click', () => go(+b.dataset.i)));
  }
  document.addEventListener('visibilitychange', () => {
    const k = left().length;
    document.title = document.hidden
      ? (k ? `Mai ai ${k === 1 ? 'o lucrare' : k + ' lucrări'} de văzut` : 'Ai un site de făcut? · Koreh Elod')
      : baseTitle;
  });
  renderSeen();

  /* ---------- proiectul activ: culoarea paginii, clipul de pe ecran, barele ---------- */
  const root = document.documentElement;
  let cur = -1, seeTimer = 0;
  function activate(i){
    if (i === cur) return;
    cur = i;
    const p = P[i];
    if (p){
      root.style.setProperty('--bg', p.bg); root.style.setProperty('--ink', p.ink); root.style.setProperty('--acc', p.acc);
      $('#stageUrl').textContent = url(p).replace('https://', '').replace(/\/$/, '');
      $('#stageNr').textContent = nr(i) + ' / ' + nr(P.length - 1);
      screen.href = url(p);
      // o lucrare e „văzută” doar dacă ai stat pe ea, nu dacă ai trecut în viteză
      clearTimeout(seeTimer); seeTimer = setTimeout(() => see(i), 1200);
    } else {
      clearTimeout(seeTimer);
      ['--bg', '--ink', '--acc'].forEach((k) => root.style.removeProperty(k));
    }
    caseEls.forEach((c, j) => c.classList.toggle('on', j === i));
    barEls.forEach((b, j) => { $('i', b).style.transform = `scaleX(${j < i ? 1 : 0})`; });
    shots.forEach((s, j) => {
      s.classList.toggle('on', j === i);
      if (wide.matches) play($('video', s), j === i);
    });
  }

  // Proiectul activ e fișa care trece prin mijlocul ecranului; în afara lucrărilor, pagina revine la hârtie.
  const work = $('#lucrari');
  function onScroll(){
    const mid = innerHeight / 2;
    const w = work.getBoundingClientRect();
    if (w.top > mid || w.bottom < mid){ activate(-1); return; }
    let best = 0;
    caseEls.forEach((c, i) => { if (c.getBoundingClientRect().top < mid) best = i; });
    activate(best);
  }
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; onScroll(); }); }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Bara proiectului activ se umple odată cu clipul, ca la story-uri.
  (function fill(){
    if (cur >= 0){
      const v = $('video', shots[cur]);
      const k = v.duration ? v.currentTime / v.duration : 0;
      $('i', barEls[cur]).style.transform = `scaleX(${k})`;
    }
    requestAnimationFrame(fill);
  })();

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

  /* ---------- cursorul: teancul se înclină, ecranul se deschide, indexul arată posterul ---------- */
  const tag = $('#tag'), peek = $('#peek');
  let mx = 0, my = 0, px = 0, py = 0, peekOn = false;
  if (fine.matches){
    const intro = $('.intro');
    intro.addEventListener('pointermove', (e) => {
      if (reduced) return;
      const r = deck.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / innerWidth, y = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      deck.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
      deck.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
    });
    intro.addEventListener('pointerleave', () => { deck.style.setProperty('--ry', '0deg'); deck.style.setProperty('--rx', '0deg'); });

    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    screen.addEventListener('pointerenter', () => tag.classList.add('on'));
    screen.addEventListener('pointerleave', () => tag.classList.remove('on'));

    $$('tr', rows).forEach((tr) => {
      tr.addEventListener('pointerenter', () => {
        peek.src = 'media/' + P[+tr.dataset.i].id + '.webp';
        if (!peekOn){ px = mx; py = my; }
        peekOn = true; peek.classList.add('on');
      });
      tr.addEventListener('pointerleave', () => { peekOn = false; peek.classList.remove('on'); });
    });

    // eticheta stă lipită de cursor; posterul îl urmează cu puțină întârziere
    (function follow(){
      tag.style.transform = `translate(${mx + 16}px, ${my + 18}px)`;
      const k = reduced ? 1 : .16;
      px += (mx - px) * k; py += (my - py) * k;
      peek.style.transform = `translate(${px + 24}px, ${py - 100}px)`;
      requestAnimationFrame(follow);
    })();
  }

  // Intrarea: titlul urcă, apoi cărțile se împart una câte una.
  requestAnimationFrame(() => {
    root.classList.add('in');
    setTimeout(() => deck.classList.add('dealt'), reduced ? 0 : 350);
    setTimeout(() => deck.classList.add('ready'), reduced ? 0 : 1600);
  });
})();
