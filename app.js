/* Portofoliu: bootul, ferestrele care își schimbă locul, terminalul care scrie README-ul. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 1000px)');

  const P = [
    { id: 'casa-care-vinde', name: 'Inhabit Media', short: 'inhabit', acc: '#f9d65c',
      who: 'client: arh. Alin Ionescu · 2026',
      what: 'Site de parteneriate de brand pentru un arhitect urmărit de 93.000 de oameni. Cifre reale din Insights, campania NovingAIR, un calculator care îi arată firmei ce îi aduce.',
      tags: 'HTML · CSS · JS · 7 pagini' },
    { id: 'casa-care-vinde-mix', name: 'Casa care se construiește', short: 'casa-3d', acc: '#fab387',
      who: 'client: arh. Alin Ionescu · varianta 3D',
      what: 'Aceeași poveste, altă formă: o casă pasivă în secțiune se ridică strat cu strat pe măsură ce derulezi. Fiecare strat e o categorie pe care o poate sponsoriza o firmă.',
      tags: 'three.js · GSAP ScrollTrigger · Lenis' },
    { id: 'medclyn-demo', name: 'MedClyn', short: 'medclyn', acc: '#24bfcd',
      who: 'demo de concept pentru medclyn.com',
      what: 'Un perete de faianță contaminat pe care îl ștergi cu mâna și dedesubt apare placa antibacteriană. Cerințele CE 852/2004 față în față cu fișa tehnică, șantiere reale, hala construită în 3D din trei numere.',
      tags: 'three.js · texturi PBR · HDRI' },
    { id: 'prezentari', name: 'Secret sauce', short: 'prezentari', acc: '#f38ba8',
      who: 'prezentări interactive · 2 × 19 slide-uri',
      what: 'Claude pe bune, apoi servere și agenți AI. Rulează în browser, cu taste ca un deck adevărat, note de prezentator pe telefon și gravuri SVG desenate pentru ele.',
      tags: 'HTML · SVG · CSS' },
    { id: 'domino', name: 'Domino', short: 'domino', acc: '#efe8da',
      who: 'produsul meu · aplicație Android',
      what: 'Site-ul aplicației mele de auto-control. Un lanț de 30 de piese care cade când îl împingi, un telefon care schimbă clipurile după funcția de pe ecran, română și engleză.',
      tags: 'HTML · CSS · JS · video' }
  ];
  const url = (p) => 'https://elod3.github.io/' + p.id + '/';

  /* ---------- construiește bara, lista și ferestrele ---------- */
  const ws = $('#ws'), ls = $('#ls'), tiles = $('#tiles');
  P.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = i + 1; b.dataset.k = p.id; b.setAttribute('aria-label', (i + 1) + ': ' + p.name);
    ws.appendChild(b);

    const li = document.createElement('li');
    li.innerHTML = `<button type="button" data-k="${p.id}"><b>${i + 1}</b>${p.short}/</button>`;
    ls.appendChild(li);

    const a = document.createElement('a');
    a.className = 'win'; a.href = url(p); a.target = '_blank'; a.rel = 'noopener'; a.dataset.k = p.id;
    a.style.setProperty('--i', i + 2);
    a.innerHTML = `<div class="win__in">
        <div class="win__cap"><span class="url" style="--acc2:${p.acc}"><i></i><span>elod3.github.io/${p.id}</span></span><span class="open">↗ deschide</span></div>
        <img class="shot" src="media/${p.id}.webp" alt="" width="960" height="600" decoding="async">
        <video class="shot" muted loop playsinline preload="none" poster="media/${p.id}.webp" aria-hidden="true"><source src="media/${p.id}.mp4" type="video/mp4"></video>
        <div class="label"><b>${p.name}</b><small>${p.tags}</small></div>
      </div>`;
    a.setAttribute('aria-label', p.name + ', deschide site-ul');
    tiles.appendChild(a);
  });
  const wins = $$('.tiles .win');

  /* ---------- terminalul scrie README-ul proiectului ales ---------- */
  let typeTimer = null;
  function typeInto(el, text, cb){
    clearTimeout(typeTimer);
    if (reduced){ el.textContent = text; cb && cb(); return; }
    let i = 0;
    const step = () => { el.textContent = text.slice(0, ++i); if (i < text.length) typeTimer = setTimeout(step, 14); else cb && cb(); };
    step();
  }

  let cur = null;
  function focus(k, fromUser){
    const i = P.findIndex((p) => p.id === k);
    if (i < 0 || k === cur) return;
    cur = k;
    const p = P[i];
    document.documentElement.style.setProperty('--acc', p.acc);
    const rest = P.filter((x) => x.id !== k).map((x) => x.id);
    wins.forEach((w) => {
      const on = w.dataset.k === k;
      w.dataset.slot = on ? 'm' : 's' + rest.indexOf(w.dataset.k);
      w.classList.toggle('on', on);
      const v = $('video', w);
      if (!narrow.matches){
        if (on && !reduced){ v.preload = 'auto'; v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
      }
    });
    $$('.ws button, .term__ls button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
    $('#barTitle').textContent = 'firefox — ' + p.name;
    $('#catName').textContent = p.short;
    const r = $('#readme');
    r.innerHTML = `<h2></h2><p class="who">${p.who}</p><p class="what"></p><p class="tags">${p.tags}</p>`;
    typeInto($('h2', r), p.name, () => typeInto($('.what', r), p.what));
    $('#typed').textContent = 'xdg-open ' + url(p).replace('https://', '');
    if (fromUser) try { sessionStorage.setItem('ales', k); } catch (e) {}
  }

  // În stivă, click aduce fereastra în master; pe master, linkul deschide site-ul.
  wins.forEach((w) => w.addEventListener('click', (e) => {
    if (narrow.matches || w.dataset.slot === 'm') return;
    e.preventDefault(); focus(w.dataset.k, true);
  }));
  $$('.ws button, .term__ls button').forEach((b) => b.addEventListener('click', () => focus(b.dataset.k, true)));
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || document.documentElement.classList.contains('booting')) return;
    const i = P.findIndex((p) => p.id === cur);
    if (/^[1-5]$/.test(e.key)) focus(P[+e.key - 1].id, true);
    else if (['ArrowDown', 'ArrowRight', 'j', 'l'].includes(e.key)){ e.preventDefault(); focus(P[(i + 1) % P.length].id, true); }
    else if (['ArrowUp', 'ArrowLeft', 'k', 'h'].includes(e.key)){ e.preventDefault(); focus(P[(i + P.length - 1) % P.length].id, true); }
    else if (e.key === 'Enter' && !e.target.closest('a, button')) open(url(P[i]), '_blank', 'noopener');
  });

  /* pe telefon, fiecare fereastră își rulează clipul doar cât e pe ecran */
  if ('IntersectionObserver' in window){
    const vio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!narrow.matches) return;
      const v = $('video', e.target);
      if (e.isIntersecting && !reduced){ v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    }), { threshold: .5 });
    wins.forEach((w) => vio.observe(w));
  }

  const tick = () => { const d = new Date(); $('#clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  tick(); setInterval(tick, 15000);

  $('.bar').style.setProperty('--i', 0);
  $('.term').style.setProperty('--i', 1);
  $('.status').style.setProperty('--i', 7);

  let first = null;
  try { first = sessionStorage.getItem('ales'); } catch (e) {}
  const start = () => focus(P.some((p) => p.id === first) ? first : P[0].id);

  /* ---------- bootul: loguri, wordmark, apoi ferestrele intră în tiling ---------- */
  const root = document.documentElement;
  if (!root.classList.contains('boot')){ start(); return; }
  root.classList.add('booting');
  const loader = $('#loader'), log = $('#log');
  $$('#mark span').forEach((s, i) => s.style.setProperty('--i', i));

  const lines = [
    ['', ':: running early hook [udev]'],
    ['', ':: mounting \'/dev/nvme0n1p2\' on real root'],
    ['ok', 'Started Journal Service.'],
    ['ok', 'Reached target Local File Systems.'],
    ...P.map((p) => ['ok', `Mounted /proiecte/${p.short}.`]),
    ['ok', 'Started Network Manager.'],
    ['ok', 'Reached target Graphical Interface.'],
    ['st', 'Starting Hyprland…']
  ];
  let done = false, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function finish(){
    if (done) return; done = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem('booted', '1'); } catch (e) {}
    loader.classList.add('mark', 'out');
    // ferestrele pornesc după ce a început să se ridice cortina
    setTimeout(() => { root.classList.add('up'); start(); }, 300);
    setTimeout(() => { loader.remove(); root.classList.remove('booting', 'boot', 'up'); }, 1600);
  }
  if (reduced){ finish(); return; }
  lines.forEach(([k, t], i) => later(() => {
    const tag = k === 'ok' ? '<span class="ok">[  OK  ]</span> ' : k === 'st' ? '<span class="st">  ::  </span> ' : '';
    log.insertAdjacentHTML('beforeend', tag + t + '\n');
  }, 60 + i * 70));
  const tLog = 60 + lines.length * 70;
  later(() => loader.classList.add('mark'), tLog + 120);
  later(finish, tLog + 120 + 1500);
  loader.addEventListener('click', finish);
  addEventListener('keydown', function k(){ removeEventListener('keydown', k); finish(); });
})();
