/* Fără platou: claqueta de la intrare, monitorul care rulează scenariul pe secunde și mesajul de WhatsApp. */
(() => {
  // Numărul de WhatsApp, în format internațional fără „+” (ex. 40712345678). Gol = butonul duce la portofoliu.
  const WA = '';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- claqueta ---------- */
  if (root.classList.contains('slate-on')){
    const slate = $('#slate');
    const done = () => { slate.classList.add('gone'); try { sessionStorage.setItem('dubla', '1'); } catch (e) {} setTimeout(() => slate.remove(), 700); };
    if (reduced) done();
    else {
      setTimeout(() => slate.classList.add('clap'), 450);
      setTimeout(done, 1050);
      slate.addEventListener('click', done);
    }
  }

  /* ---------- scenariul: 15 secunde, patru bucăți ---------- */
  const LEN = 15;
  const B = [
    { from: 0, to: 3, part: 'HOOK', shot: 'PRIM-PLAN', desc: 'Boabele cad pe cântar. Cifra se oprește la 18,0 g.',
      vo: 'Optsprezece grame. Niciunul în plus.', sup: '18,0 g' },
    { from: 3, to: 7, part: 'PRODUS', shot: 'PLAN MEDIU', desc: 'Apa fierbinte trece prin filtru. Lumină de dimineață din stânga, aburul urcă.',
      vo: 'Prăjită marți. În ceașca ta, joi.', sup: 'prăjită acum 2 zile' },
    { from: 7, to: 11, part: 'MOMENTUL', shot: 'DETALIU', desc: 'O mână ia cana. În spate, o fereastră cu ploaie. Fără fețe.',
      vo: 'Cinci minute de liniște înainte de toată ziua.', sup: '5 minute doar ale tale' },
    { from: 11, to: 15, part: 'CTA', shot: 'PLAN ÎNTREG', desc: 'Punga pe masă, logo-ul întreg în cadru, două secunde fixe.',
      vo: 'Comandă din link. Ajunge mâine.', sup: 'Comandă din link' }
  ];
  const tc = (s) => '00:' + String(Math.floor(s)).padStart(2, '0') + ':' + String(Math.floor((s % 1) * 25)).padStart(2, '0');
  const clock = (s) => '0:' + String(s).padStart(2, '0');

  const rows = $('#rows'), beats = $('#beats');
  B.forEach((b, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${clock(b.from)}–${clock(b.to)}<small>${b.part}</small></td>
      <td><span class="shot">${b.shot}</span>${b.desc}</td>
      <td><span class="vo">VOCE: „${b.vo}”</span><span class="sup">TEXT PE ECRAN: ${b.sup}</span></td>`;
    tr.addEventListener('click', () => { seek(b.from + .01); if (!playing) toggle(); });
    rows.appendChild(tr);
    const s = document.createElement('span');
    s.style.flex = b.to - b.from;
    beats.appendChild(s);
  });
  const trs = $$('#rows tr'), segs = $$('#beats span');

  /* ---------- monitorul și capul de redare ---------- */
  const track = $('#track'), head = $('#head'), play = $('#play'), monitor = $('.monitor');
  let t = 0, playing = !reduced, last = performance.now(), cur = -1, dragging = false;

  function render(){
    head.style.left = (t / LEN * 100) + '%';
    $('#tc').textContent = tc(t);
    track.setAttribute('aria-valuenow', Math.floor(t));
    const i = B.findIndex((b) => t >= b.from && t < b.to);
    if (i !== cur && i >= 0){
      cur = i;
      const b = B[i];
      $('#shot').textContent = b.shot;
      $('#desc').textContent = b.desc;
      const sup = $('#super');
      sup.textContent = b.sup;
      sup.classList.remove('pop'); void sup.offsetWidth; sup.classList.add('pop');
      trs.forEach((r, j) => r.classList.toggle('on', j === i));
      segs.forEach((s, j) => s.classList.toggle('on', j === i));
    }
  }
  function seek(s){ t = Math.max(0, Math.min(LEN - .001, s)); render(); }
  function toggle(){
    playing = !playing;
    play.textContent = playing ? '❚❚' : '▶';
    play.setAttribute('aria-label', playing ? 'Pauză' : 'Pornește');
    monitor.classList.toggle('playing', playing);
    last = performance.now();
  }
  play.addEventListener('click', toggle);
  if (!playing){ play.textContent = '▶'; play.setAttribute('aria-label', 'Pornește'); } else monitor.classList.add('playing');

  // Rulează doar cât monitorul e pe ecran; reia de la capăt ca o buclă.
  let visible = false;
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; last = performance.now(); }, { threshold: .2 }).observe(monitor);
  (function loop(now){
    if (playing && visible && !dragging){ t = (t + (now - last) / 1000) % LEN; render(); }
    last = now;
    requestAnimationFrame(loop);
  })(performance.now());

  const at = (e) => { const r = track.getBoundingClientRect(); return (e.clientX - r.left) / r.width * LEN; };
  track.addEventListener('pointerdown', (e) => { dragging = true; track.setPointerCapture(e.pointerId); seek(at(e)); });
  track.addEventListener('pointermove', (e) => { if (dragging) seek(at(e)); });
  track.addEventListener('pointerup', () => { dragging = false; last = performance.now(); });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight'){ e.preventDefault(); seek(t + 1); }
    else if (e.key === 'ArrowLeft'){ e.preventDefault(); seek(t - 1); }
    else if (e.key === ' '){ e.preventDefault(); toggle(); }
  });
  seek(0);

  /* ---------- trimite: produsul tău apare pe claqueta din monitor și în mesaj ---------- */
  const prod = $('#prod'), prod2 = $('#prod2');
  const msgFor = (p) => `Salut! Vreau o reclamă video pentru: ${p || 'produsul meu'}. Vă trimit poze și linkul. Îmi puteți face scenariul?`;
  function update(e){
    if (e && e.target === prod2) prod.value = prod2.value;
    else if (e) prod2.value = prod.value;
    const p = prod.value.trim();
    $('#sheetName').textContent = 'SCENARIU AV · ' + (p || 'cafea de specialitate').toUpperCase();
    $('#msg').textContent = msgFor(p);
    $('#frameSlate').textContent = 'PRODUCȚIE: ' + (p || 'cafea de specialitate').toUpperCase();
  }
  prod.addEventListener('input', update);
  prod2.addEventListener('input', update);
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = WA ? `https://wa.me/${WA}?text=${encodeURIComponent(msgFor(prod.value.trim()))}` : 'https://elod3.github.io/#contact';
    open(url, WA ? '_blank' : '_self', 'noopener');
  });
  update();
})();
