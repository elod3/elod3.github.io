/* Alo: robotelul (se uită după tine, clipește, vorbește când vorbește Alo), demo-ul pe WhatsApp și la telefon
   (cu întrerupere), calculatorul de minute pentru voce și butoanele de WhatsApp. */
(() => {
  // Numărul de WhatsApp, în format internațional fără „+” (ex. 40712345678). Gol = butoanele duc la portofoliu.
  const WA = '';
  if (!WA) document.documentElement.classList.add('no-wa');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lei = (n) => Math.round(n).toLocaleString('ro-RO') + ' lei';

  /* ================= robotelul ================= */
  const BOT = `<svg viewBox="0 0 120 124" aria-hidden="true">
    <g class="b-ant"><line x1="60" y1="24" x2="60" y2="10" /><circle class="b-ball" cx="60" cy="9" r="6" /></g>
    <rect class="b-ear" x="3" y="56" width="11" height="26" rx="5.5" /><rect class="b-ear" x="106" y="56" width="11" height="26" rx="5.5" />
    <rect class="b-skull" x="12" y="24" width="96" height="92" rx="32" />
    <rect class="b-visor" x="23" y="38" width="74" height="58" rx="21" />
    <g class="b-eyes">
      <rect class="b-eye b-l" x="40" y="53" width="11" height="19" rx="5.5" />
      <rect class="b-eye b-r" x="69" y="53" width="11" height="19" rx="5.5" />
      <path class="b-happy" d="M38 66 q7 -9 14 0 M67 66 q7 -9 14 0" />
    </g>
    <path class="b-smile" d="M50 81 Q60 89 70 81" />
    <ellipse class="b-talk" cx="60" cy="84" rx="7" ry="2" />
    <circle class="b-oh" cx="60" cy="84" r="4.5" />
    <circle class="b-cheek" cx="27" cy="104" r="4.5" /><circle class="b-cheek" cx="93" cy="104" r="4.5" />
  </svg>`;

  const bots = $$('[data-bot]').map((el) => {
    el.innerHTML = BOT;
    return { el, svg: $('svg', el), eyes: $('.b-eyes', el), talk: $('.b-talk', el), x: 0, y: 0 };
  });
  const big = bots.find((b) => b.el.id === 'bigBot');
  const setAll = (cls, on) => bots.forEach((b) => b.el.classList.toggle(cls, on));

  // unde se uită: cursorul, o țintă impusă de demo (ex. mesajul clientului) sau, când n-ai mouse, priviri la întâmplare
  let px = innerWidth / 2, py = innerHeight / 3, lastMove = 0, target = null, targetUntil = 0, wander = null;
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; lastMove = performance.now(); }, { passive: true });
  addEventListener('pointerdown', (e) => { px = e.clientX; py = e.clientY; lastMove = performance.now(); }, { passive: true });
  const lookAt = (el, ms = 1400) => { target = el; targetUntil = performance.now() + ms; };

  let talking = false, mouth = 0;
  function frame(now){
    let tx = px, ty = py;
    if (target && now < targetUntil){
      const r = target.getBoundingClientRect(); tx = r.left + r.width / 2; ty = r.top + r.height / 2;
    } else if (now - lastMove > 3500){
      if (!wander || now > wander.t){ wander = { x: Math.random() * innerWidth, y: Math.random() * innerHeight * .8, t: now + 1800 + Math.random() * 2200 }; }
      tx = wander.x; ty = wander.y;
    }
    bots.forEach((b) => {
      const r = b.svg.getBoundingClientRect();
      const dx = tx - (r.left + r.width / 2), dy = ty - (r.top + r.height * .5);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      const gx = dx / d * 7 * k, gy = dy / d * 5 * k;
      b.x += (gx - b.x) * .18; b.y += (gy - b.y) * .18;
      b.eyes.setAttribute('transform', `translate(${b.x.toFixed(2)} ${b.y.toFixed(2)})`);
      b.el.style.setProperty('--tilt', (b.x * .9).toFixed(2) + 'deg');
    });
    // gura urmează vocea: deschisă cât timp vorbește Alo
    mouth += ((talking ? 2 + Math.abs(Math.sin(now / 90)) * 5 * (0.6 + Math.random() * .4) : 2) - mouth) * .35;
    bots.forEach((b) => b.talk.setAttribute('ry', mouth.toFixed(2)));
    requestAnimationFrame(frame);
  }
  if (!reduced) requestAnimationFrame(frame);

  // clipitul: la 2,5–5,5 s, uneori de două ori
  function blink(){
    setAll('blink', true);
    setTimeout(() => setAll('blink', false), 110);
    if (Math.random() < .25) setTimeout(() => { setAll('blink', true); setTimeout(() => setAll('blink', false), 110); }, 260);
    setTimeout(blink, 2500 + Math.random() * 3000);
  }
  if (!reduced) setTimeout(blink, 1800);

  // click pe robot: face cu ochiul și sare
  bots.forEach((b) => {
    b.el.addEventListener('pointerenter', () => b.el.classList.add('happy'));
    b.el.addEventListener('pointerleave', () => b.el.classList.remove('happy'));
    b.el.addEventListener('click', () => {
      if (reduced) return;
      b.el.classList.remove('jump', 'wink'); void b.el.offsetWidth;
      b.el.classList.add('jump', 'wink');
      setTimeout(() => b.el.classList.remove('wink'), 420);
    });
  });
  const surprise = () => { setAll('oh', true); setTimeout(() => setAll('oh', false), 900); };

  /* ================= demo: WhatsApp și telefon ================= */
  const MODES = {
    wa: {
      who: 'Salon · mesaj la 23:14', names: { a: 'Alo', c: 'Client' }, speed: 14, gap: 900,
      note: 'O conversație pe WhatsApp, noaptea. Apoi încearcă tab-ul „Telefon”.',
      script: [
        ['c', 'Bună seara! Mai aveți loc sâmbătă pentru tuns și vopsit?'],
        ['a', 'Bună seara! Sunt asistentul automat al salonului. Sâmbătă avem liber la 10:00 și la 13:30; tunsul cu vopsit durează cam două ore. Care oră vă convine?'],
        ['c', '10:00, vă rog. Cât costă?'],
        ['a', 'Pentru păr mediu, 250 de lei. V-am trecut sâmbătă la 10:00 și vă trimit un reminder vineri seara.'],
        ['c', 'Super, mersi! 🙌'],
        ['sys', 'Programare adăugată în Google Calendar · sâmbătă, 10:00']
      ]
    },
    tel: {
      who: 'Cabinet stomatologic · apel', names: { a: 'Alo', c: 'Pacient' }, speed: 26, gap: 700,
      note: 'Apasă „Întrerupe-l” cât timp vorbește Alo: se oprește și te ascultă, ca un om.',
      script: [
        ['a', 'Bună ziua, ați sunat la cabinetul stomatologic. Sunt asistentul automat al cabinetului: vă pot programa sau vă pot răspunde la întrebări. Cu ce vă ajut?'],
        ['c', 'Bună. Aș vrea o programare pentru un detartraj.'],
        ['a', 'Sigur. Avem liber joi la 10:30 sau vineri la 16:00. Care vă convine mai bine?'],
        ['c', 'Joi.'],
        ['a', 'Am notat: detartraj, joi, la 10:30. Mai pot să vă ajut cu ceva?'],
        ['c', 'Mă cam doare o măsea de ieri…'],
        ['a', 'Îmi pare rău. Pentru dureri nu pot da sfaturi medicale, așa că vă fac legătura acum cu cabinetul.'],
        ['sys', 'Transferat la cabinet · medicul a primit o alertă']
      ],
      barge: [['c', 'Pardon, o întrebare: sâmbăta lucrați?'], ['a', 'Da, sâmbătă dimineața. Revin la ce spuneam.']]
    }
  };

  const call = $('#call'), log = $('#log'), wave = $('#wave'), start = $('#start'), cut = $('#cut');
  const bars = Array.from({ length: 30 }, () => wave.appendChild(document.createElement('i')));
  let mode = 'wa', queue = [], speaking = null, timer = 0, t0 = 0, clockT = 0, run = 0, barged = false;

  const say = (who, text) => {
    const li = document.createElement('li');
    li.className = who;
    li.innerHTML = who === 'sys' ? text : `<b>${MODES[mode].names[who]}</b><p></p>`;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
    return li;
  };
  const setState = (s) => { $('#state').textContent = s; };
  const clock = () => {
    const s = Math.floor((performance.now() - t0) / 1000);
    $('#clock').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };
  const setTalk = (on) => { talking = on; setAll('talking', on); };

  function next(id){
    if (id !== run) return;
    const line = queue.shift();
    if (!line){ end(); return; }
    const [who, text] = line, M = MODES[mode];
    if (who === 'sys'){ const li = say('sys', text); lookAt(li, 1600); timer = setTimeout(() => next(id), 400); return; }
    const li = say(who, text), p = $('p', li);
    if (mode === 'wa' && who === 'c'){
      // pe WhatsApp mesajul clientului apare întreg; robotul se uită la el
      p.textContent = text; lookAt(li, 1500);
      setState('online');
      timer = setTimeout(() => { setState('scrie…'); timer = setTimeout(() => next(id), M.gap); }, 500);
      return;
    }
    speaking = { who, text, p, i: 0 };
    wave.className = 'wave ' + who;
    if (who === 'a') setTalk(true); else lookAt(li, 2000);
    cut.disabled = !(mode === 'tel' && who === 'a' && !barged);
    const step = () => {
      if (id !== run || !speaking) return;
      speaking.i += 1;
      p.textContent = text.slice(0, speaking.i);
      log.scrollTop = log.scrollHeight;
      if (speaking.i < text.length) timer = setTimeout(step, who === 'a' ? M.speed : 38);
      else {
        speaking = null; wave.className = 'wave'; cut.disabled = true; setTalk(false);
        if (mode === 'wa') setState('online');
        timer = setTimeout(() => next(id), M.gap);
      }
    };
    step();
  }

  // Întreruperea: Alo tace la jumătatea frazei, face ochii mari, răspunde la întrebare, apoi reia fraza.
  cut.addEventListener('click', () => {
    if (!speaking || speaking.who !== 'a' || barged) return;
    clearTimeout(timer);
    barged = true; cut.disabled = true; setTalk(false); surprise();
    speaking.p.parentElement.classList.add('cutoff');
    const again = ['a', speaking.text];
    speaking = null; wave.className = 'wave';
    queue = [...MODES.tel.barge, again, ...queue];
    timer = setTimeout(() => next(run), 450);
  });

  function begin(m = mode){
    mode = m; run += 1; clearTimeout(timer); clearInterval(clockT); setTalk(false);
    const M = MODES[mode];
    call.dataset.mode = mode;
    $$('.call__tabs button').forEach((b) => { const on = b.dataset.mode === mode; b.setAttribute('aria-selected', on); if (on) b.classList.remove('nudge'); });
    $('#who').textContent = M.who; $('#note').textContent = M.note;
    log.innerHTML = ''; queue = M.script.slice(); barged = false; speaking = null;
    call.classList.add('on'); setState(mode === 'wa' ? 'online' : 'Apel în curs');
    start.textContent = 'Din nou';
    t0 = performance.now(); clock(); clockT = setInterval(clock, 250);
    next(run);
  }
  function end(){
    clearInterval(clockT); clock(); setTalk(false);
    call.classList.remove('on'); setState(mode === 'wa' ? 'Conversație încheiată' : 'Apel încheiat');
    wave.className = 'wave'; cut.disabled = true;
    if (mode === 'wa'){
      const tel = $('.call__tabs [data-mode="tel"]');
      tel.classList.add('nudge'); lookAt(tel, 2200);
    }
  }
  start.addEventListener('click', () => begin());
  $$('.call__tabs button').forEach((b) => b.addEventListener('click', () => begin(b.dataset.mode)));

  (function animate(){
    bars.forEach((b, i) => {
      const h = speaking ? 6 + Math.abs(Math.sin(performance.now() / 140 + i * 1.7)) * 30 * Math.random() + Math.random() * 8 : 4;
      b.style.height = h.toFixed(0) + 'px';
    });
    setTimeout(() => requestAnimationFrame(animate), 70);
  })();

  if (reduced){
    // fără animație: toată conversația, deja scrisă
    call.dataset.mode = 'wa';
    MODES.wa.script.forEach(([w, t]) => { const li = say(w, t); if (w !== 'sys') $('p', li).textContent = t; });
    setState('Conversație încheiată');
  } else if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting){ io.disconnect(); setTimeout(() => begin('wa'), 700); }
    }, { threshold: .5 });
    io.observe(call);
  }

  /* ================= calculatorul pentru voce ================= */
  const PLANS = [
    { name: 'VOICE BASIC', inc: 200, setup: 250, month: 400, over: 2.5 },
    { name: 'VOICE STANDARD', inc: 500, setup: 400, month: 750, over: 2 },
    { name: 'VOICE PREMIUM', inc: 1000, setup: 600, month: 1300, over: 1.7 }
  ];
  // pachetele de bază, pe WhatsApp: intervale (prețul exact depinde de afacere)
  const WA_PLANS = [
    { name: 'BASIC', month: [500, 800], setup: [300, 500] },
    { name: 'STANDARD', month: [800, 1500], setup: [500, 1000] },
    { name: 'PREMIUM', month: [1500, 2500], setup: [1000, 2000] }
  ];
  const range = (a, b) => Math.round(a).toLocaleString('ro-RO') + '–' + Math.round(b).toLocaleString('ro-RO') + ' lei';
  const calls = $('#calls'), days = $('#days'), dur = $('#dur'), tbody = $('#plans');
  PLANS.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td>${lei(p.month)}</td><td>${p.inc.toLocaleString('ro-RO')} min</td><td>${String(p.over).replace('.', ',')} lei</td><td></td>`;
    tbody.appendChild(tr);
    p.tr = tr;
  });

  let touched = false;
  function calc(e){
    if (e) touched = true;
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
      p.tr.lastChild.innerHTML = lei(p.total) + `<small>${extra ? `${lei(p.month)} + ${extra.toLocaleString('ro-RO')} min × ${String(p.over).replace('.', ',')} lei` : 'intră în minutele incluse'}</small>`;
    });
    $('#totHead').textContent = `La ${mins.toLocaleString('ro-RO')} min plătești`;
    const cheap = PLANS[0];
    $('#why').textContent = best === cheap
      ? `La volumul tău, cea mai mică extensie e și cea mai ieftină.`
      : `${cheap.name} e extensia cea mai ieftină (${lei(cheap.month)} pe lună), dar include doar ${cheap.inc} de minute. La ${mins.toLocaleString('ro-RO')} de minute, cele în plus îl fac mai scump decât ${best.name}, așa că ți-l marcăm pe ${best.name}.`;
    $('#perCall').textContent = (best.total / (c * d)).toFixed(1).replace('.', ',') + ' lei';
    const w = WA_PLANS[+($('input[name="wa"]:checked') || { value: 1 }).value];
    $('#sWaName').textContent = 'WhatsApp ' + w.name;
    $('#sWaM').textContent = range(...w.month); $('#sWaS').textContent = range(...w.setup);
    $('#sVoName').textContent = '+ ' + best.name;
    $('#sVoM').textContent = lei(best.total); $('#sVoS').textContent = lei(best.setup);
    $('#sTotM').textContent = range(w.month[0] + best.total, w.month[1] + best.total);
    $('#sTotS').textContent = range(w.setup[0] + best.setup, w.setup[1] + best.setup);
    const msg = touched
      ? `Bună! Aș vrea o demonstrație cu Alo: WhatsApp ${w.name} plus telefonul (avem cam ${c} apeluri pe zi).`
      : 'Bună! Aș vrea o demonstrație cu Alo.';
    $('#msg').textContent = msg;
    const href = WA ? `https://wa.me/${WA}?text=${encodeURIComponent(msg)}` : '#';
    $$('.js-wa').forEach((a) => { a.href = href; if (WA){ a.target = '_blank'; a.rel = 'noopener'; } });
  }
  [calls, days, dur, ...$$('input[name="wa"]')].forEach((i) => i.addEventListener('input', calc));
  calc();

  /* ---------- antetul primește o linie după ce începi să derulezi ---------- */
  const top = $('.top');
  addEventListener('scroll', () => top.classList.toggle('scrolled', scrollY > 10), { passive: true });
})();
