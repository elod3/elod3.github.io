/* Alo: apelul de demonstrație (cu întrerupere), calculatorul de minute și butoanele de WhatsApp. */
(() => {
  // Numărul de WhatsApp, în format internațional fără „+” (ex. 40712345678). Gol = butoanele duc la portofoliu.
  const WA = '';

  const $ = (s, r = document) => r.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lei = (n) => Math.round(n).toLocaleString('ro-RO') + ' lei';

  /* ---------- apelul ---------- */
  const SCRIPT = [
    ['a', 'Bună ziua, ați sunat la cabinetul stomatologic. Sunt asistentul automat al cabinetului: vă pot programa sau vă pot răspunde la întrebări. Cu ce vă ajut?'],
    ['p', 'Bună. Aș vrea o programare pentru un detartraj.'],
    ['a', 'Sigur. Avem liber joi la 10:30 sau vineri la 16:00. Care vă convine mai bine?'],
    ['p', 'Joi.'],
    ['a', 'Am notat: detartraj, joi, la 10:30. Mai pot să vă ajut cu ceva?'],
    ['p', 'Mă cam doare o măsea de ieri…'],
    ['a', 'Îmi pare rău. Pentru dureri nu pot da sfaturi medicale, așa că vă fac legătura acum cu cabinetul.'],
    ['sys', 'Transferat la cabinet · medicul a primit o alertă']
  ];
  const BARGE = [['p', 'Pardon, o întrebare: sâmbăta lucrați?'], ['a', 'Da, sâmbătă dimineața. Revin la ce spuneam.']];
  const NAMES = { a: 'Alo', p: 'Pacient' };

  const call = $('#call'), log = $('#log'), wave = $('#wave'), start = $('#start'), cut = $('#cut');
  const bars = Array.from({ length: 30 }, () => wave.appendChild(document.createElement('i')));
  let queue = [], speaking = null, timer = 0, t0 = 0, clockT = 0, run = 0, barged = false;

  const say = (who, text) => {
    const li = document.createElement('li');
    li.className = who;
    li.innerHTML = who === 'sys' ? text : `<b>${NAMES[who]}</b><p></p>`;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
    return li;
  };
  const setState = (s) => { $('#state').textContent = s; };
  const clock = () => {
    const s = Math.floor((performance.now() - t0) / 1000);
    $('#clock').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };

  function next(id){
    if (id !== run) return;
    const line = queue.shift();
    if (!line){ end(); return; }
    const [who, text] = line;
    if (who === 'sys'){ say('sys', text); timer = setTimeout(() => next(id), 400); return; }
    const p = $('p', say(who, text));
    speaking = { who, text, p, i: 0 };
    wave.className = 'wave ' + who;
    cut.disabled = !(who === 'a' && !barged);
    const step = () => {
      if (id !== run || !speaking) return;
      speaking.i += 1;
      p.textContent = text.slice(0, speaking.i);
      log.scrollTop = log.scrollHeight;
      if (speaking.i < text.length) timer = setTimeout(step, who === 'a' ? 26 : 38);
      else { speaking = null; wave.className = 'wave'; cut.disabled = true; timer = setTimeout(() => next(id), 700); }
    };
    step();
  }

  // Întreruperea: Alo tace la jumătatea frazei, răspunde la întrebare, apoi reia fraza.
  cut.addEventListener('click', () => {
    if (!speaking || speaking.who !== 'a' || barged) return;
    clearTimeout(timer);
    barged = true; cut.disabled = true;
    speaking.p.parentElement.classList.add('cutoff');
    const again = ['a', speaking.text];
    speaking = null; wave.className = 'wave';
    queue = [...BARGE, again, ...queue];
    timer = setTimeout(() => next(run), 250);
  });

  function begin(){
    run += 1; clearTimeout(timer); clearInterval(clockT);
    log.innerHTML = ''; queue = SCRIPT.slice(); barged = false; speaking = null;
    call.classList.add('on'); setState('Apel în curs');
    start.textContent = 'Pornește din nou';
    t0 = performance.now(); clock(); clockT = setInterval(clock, 250);
    next(run);
  }
  function end(){
    clearInterval(clockT); clock();
    call.classList.remove('on'); setState('Apel încheiat');
    wave.className = 'wave'; cut.disabled = true;
  }
  start.addEventListener('click', begin);

  (function animate(){
    bars.forEach((b, i) => {
      const h = speaking ? 6 + Math.abs(Math.sin(performance.now() / 140 + i * 1.7)) * 30 * Math.random() + Math.random() * 8 : 4;
      b.style.height = h.toFixed(0) + 'px';
    });
    setTimeout(() => requestAnimationFrame(animate), 70);
  })();

  if (reduced){
    // fără animație: tot apelul, deja scris
    SCRIPT.forEach(([w, t]) => { const li = say(w, t); if (w !== 'sys') $('p', li).textContent = t; });
    setState('Apel încheiat');
  } else if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting){ io.disconnect(); setTimeout(begin, 600); }
    }, { threshold: .55 });
    io.observe(call);
  }

  /* ---------- calculatorul ---------- */
  const PLANS = [
    { name: 'VOICE BASIC', inc: 200, setup: 250, month: 400, over: 2.5 },
    { name: 'VOICE STANDARD', inc: 500, setup: 400, month: 750, over: 2 },
    { name: 'VOICE PREMIUM', inc: 1000, setup: 600, month: 1300, over: 1.7 }
  ];
  const calls = $('#calls'), days = $('#days'), dur = $('#dur'), tbody = $('#plans');
  PLANS.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name.replace('VOICE ', '')}</td><td>${p.inc.toLocaleString('ro-RO')} min</td><td>${lei(p.month)}</td><td>${String(p.over).replace('.', ',')} lei</td><td></td>`;
    tbody.appendChild(tr);
    p.tr = tr;
  });

  function calc(){
    const c = +calls.value, d = +days.value, m = +dur.value;
    const mins = Math.round(c * d * m);
    $('#oCalls').textContent = c; $('#oDays').textContent = d; $('#oDur').textContent = m.toFixed(1).replace('.', ',');
    $('#mins').textContent = mins.toLocaleString('ro-RO');
    let best = null;
    PLANS.forEach((p) => {
      p.total = p.month + Math.max(0, mins - p.inc) * p.over;
      if (!best || p.total < best.total) best = p;
    });
    PLANS.forEach((p) => {
      p.tr.classList.toggle('best', p === best);
      const extra = Math.max(0, mins - p.inc);
      p.tr.lastChild.innerHTML = lei(p.total) + (extra ? `<small>cu ${extra.toLocaleString('ro-RO')} min în plus</small>` : '');
    });
    $('#perCall').textContent = (best.total / (c * d)).toFixed(1).replace('.', ',') + ' lei';
    $('#setup').textContent = lei(best.setup);
    const msg = `Bună! Avem cam ${c} apeluri pe zi (aproximativ ${mins.toLocaleString('ro-RO')} minute pe lună). Aș vrea un apel de probă cu Alo.`;
    $('#msg').textContent = msg;
    const href = WA ? `https://wa.me/${WA}?text=${encodeURIComponent(msg)}` : 'https://elod3.github.io/#contact';
    document.querySelectorAll('.js-wa').forEach((a) => { a.href = href; if (WA){ a.target = '_blank'; a.rel = 'noopener'; } });
  }
  [calls, days, dur].forEach((i) => i.addEventListener('input', calc));
  calc();

  /* ---------- antetul primește o linie după ce începi să derulezi ---------- */
  const top = $('.top');
  addEventListener('scroll', () => top.classList.toggle('scrolled', scrollY > 10), { passive: true });
})();
