/* print.js — tiparul de kanga, desenat în SVG.
   O kanga are trei părți: pindo (chenarul de pe toate patru laturile), mji (câmpul
   din mijloc — cuvântul înseamnă „oraș") și jina (fâșia cu fraza tipărită, care dă
   numele pânzei). Aici sunt matrițele: motive tăiate ca din lemn, culori plate,
   fără degradeuri. Tot ce se vede pe pagină iese de aici.

   Cerneluri: maximum trei pe o pânză, ca la tiparul adevărat. */

export const INK = {
  cotton: '#f2e9d8', // bumbac nealbit
  ink:    '#14110f', // negrul de tipar, cald
  yellow: '#f2b705', // galben de crom
  green:  '#1d7a4c', // verde de frunză
  blue:   '#17539b', // albastru
  red:    '#c6321e'  // roșu de print — doar unde se cere o faptă
};

const NS = 'http://www.w3.org/2000/svg';
export const el = (t, a = {}, kids = []) => {
  const e = document.createElementNS(NS, t);
  for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]);
  for (const c of [].concat(kids)) if (c) e.appendChild(c);
  return e;
};

/* zar cu sămânță: aceeași pânză iese la fel de fiecare dată */
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}

/* ---------------------------------------------------------------- motive */

/* floarea cu opt petale — motivul care se repetă pe chenar */
export function rosette(r, ink, heart) {
  const g = el('g');
  const petals = 8;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const cx = Math.cos(a) * r * 0.56, cy = Math.sin(a) * r * 0.56;
    g.appendChild(el('ellipse', {
      cx: cx.toFixed(2), cy: cy.toFixed(2), rx: (r * 0.46).toFixed(2), ry: (r * 0.27).toFixed(2),
      transform: `rotate(${(a * 180 / Math.PI).toFixed(1)} ${cx.toFixed(2)} ${cy.toFixed(2)})`,
      fill: ink
    }));
  }
  g.appendChild(el('circle', { r: (r * 0.3).toFixed(2), fill: heart || ink }));
  return g;
}

/* crenguța cu două frunze — intercalată între flori, ca pe pânzele vechi */
export function sprig(r, ink) {
  const g = el('g');
  const leaf = (dir) => el('path', {
    d: `M0 0 C ${0.7 * r * dir} ${-0.25 * r}, ${1.05 * r * dir} ${-0.75 * r}, ${1.15 * r * dir} ${-1.15 * r}
        C ${0.6 * r * dir} ${-0.95 * r}, ${0.2 * r * dir} ${-0.5 * r}, 0 0 Z`,
    fill: ink
  });
  g.appendChild(el('path', { d: `M0 ${r} L0 ${-r * 0.2}`, stroke: ink, 'stroke-width': r * 0.16, 'stroke-linecap': 'round' }));
  const a = leaf(1), b = leaf(-1);
  a.setAttribute('transform', `translate(0 ${r * 0.1})`);
  b.setAttribute('transform', `translate(0 ${r * 0.45})`);
  g.appendChild(a); g.appendChild(b);
  return g;
}

/* korosho — bobul de caju, motivul cel mai bătrân de pe kanga */
export function korosho(r, ink, dot) {
  const g = el('g');
  g.appendChild(el('path', {
    d: `M ${-r * 0.1} ${r} C ${-r * 1.1} ${r * 0.3}, ${-r * 0.75} ${-r}, ${r * 0.15} ${-r * 0.85}
        C ${r * 0.95} ${-r * 0.72}, ${r * 0.8} ${r * 0.45}, ${-r * 0.1} ${r} Z`, fill: ink
  }));
  if (dot) g.appendChild(el('circle', { cx: r * 0.05, cy: -r * 0.15, r: r * 0.26, fill: dot }));
  return g;
}

/* kibaba — măsura din proverb. Se umple: fill = 0..1 */
export function kibaba(w, ink, full, fill = 0) {
  const g = el('g');
  const h = w * 0.64, lip = w * 0.5, base = w * 0.32;
  const body = `M ${-lip} ${-h / 2} L ${lip} ${-h / 2} L ${base} ${h / 2} L ${-base} ${h / 2} Z`;
  const id = 'kb' + Math.random().toString(36).slice(2, 8);
  const clip = el('clipPath', { id }, [el('path', { d: body })]);
  g.appendChild(clip);
  const top = -h / 2 + h * (1 - Math.max(0, Math.min(1, fill)));
  g.appendChild(el('rect', {
    x: -lip, y: top, width: lip * 2, height: h, fill: full || ink, 'clip-path': `url(#${id})`,
    class: 'kibaba-fill'
  }));
  g.appendChild(el('path', { d: body, fill: 'none', stroke: ink, 'stroke-width': w * 0.11, 'stroke-linejoin': 'round' }));
  g.appendChild(el('path', {
    d: `M ${-lip * 1.16} ${-h / 2} L ${lip * 1.16} ${-h / 2}`,
    stroke: ink, 'stroke-width': w * 0.13, 'stroke-linecap': 'round'
  }));
  return g;
}

/* biserica — mji-ul nostru: „orașul" din mijlocul pânzei e ce se construiește */
export function church(w, ink, accent) {
  const g = el('g');
  const h = w * 0.66, wallTop = -h * 0.2;
  g.appendChild(el('path', { d: `M ${-w / 2} ${h / 2} L ${-w / 2} ${wallTop} L ${w / 2} ${wallTop} L ${w / 2} ${h / 2} Z`, fill: ink }));
  g.appendChild(el('path', { d: `M ${-w * 0.56} ${wallTop} L 0 ${-h * 0.6} L ${w * 0.57} ${wallTop} Z`, fill: ink }));
  /* turnul */
  g.appendChild(el('path', { d: `M ${-w * 0.075} ${-h * 0.6} L ${w * 0.075} ${-h * 0.6} L ${w * 0.075} ${-h * 0.92} L ${-w * 0.075} ${-h * 0.92} Z`, fill: ink }));
  g.appendChild(el('path', { d: `M 0 ${-h * 1.16} L 0 ${-h * 0.92} M ${-w * 0.045} ${-h * 1.07} L ${w * 0.045} ${-h * 1.07}`, stroke: ink, 'stroke-width': w * 0.035, 'stroke-linecap': 'round' }));
  /* ferestre în arc, decupate în culoarea pânzei */
  for (let i = -1; i <= 1; i++) {
    const x = i * w * 0.27;
    g.appendChild(el('path', {
      d: `M ${x - w * 0.055} ${h * 0.34} L ${x - w * 0.055} ${h * 0.1} A ${w * 0.055} ${w * 0.055} 0 0 1 ${x + w * 0.055} ${h * 0.1} L ${x + w * 0.055} ${h * 0.34} Z`,
      fill: accent || INK.cotton
    }));
  }
  return g;
}

/* dispensarul — acoperiș jos, o cruce pe perete */
export function clinic(w, ink, accent) {
  const g = el('g');
  const h = w * 0.5;
  g.appendChild(el('path', { d: `M ${-w / 2} ${h / 2} L ${-w / 2} ${-h * 0.16} L ${w / 2} ${-h * 0.16} L ${w / 2} ${h / 2} Z`, fill: ink }));
  g.appendChild(el('path', { d: `M ${-w * 0.58} ${-h * 0.16} L ${-w * 0.44} ${-h * 0.56} L ${w * 0.44} ${-h * 0.56} L ${w * 0.58} ${-h * 0.16} Z`, fill: ink }));
  const a = w * 0.07;
  g.appendChild(el('path', { d: `M ${-a} ${h * 0.02} h ${a} v ${-a} h ${a} v ${a} h ${a} v ${a} h ${-a} v ${a} h ${-a} v ${-a} h ${-a} Z`, fill: accent || INK.cotton }));
  return g;
}

/* cartea deschisă — seminarele */
export function book(w, ink, accent) {
  const g = el('g');
  const h = w * 0.62;
  g.appendChild(el('path', {
    d: `M ${-w / 2} ${-h * 0.34} C ${-w * 0.22} ${-h * 0.5}, ${-w * 0.08} ${-h * 0.42}, 0 ${-h * 0.3}
        C ${w * 0.08} ${-h * 0.42}, ${w * 0.22} ${-h * 0.5}, ${w / 2} ${-h * 0.34}
        L ${w / 2} ${h * 0.4} C ${w * 0.22} ${h * 0.24}, ${w * 0.08} ${h * 0.32}, 0 ${h * 0.44}
        C ${-w * 0.08} ${h * 0.32}, ${-w * 0.22} ${h * 0.24}, ${-w / 2} ${h * 0.4} Z`, fill: ink
  }));
  g.appendChild(el('path', { d: `M 0 ${-h * 0.3} L 0 ${h * 0.44}`, stroke: accent || INK.cotton, 'stroke-width': w * 0.035 }));
  for (let i = 1; i <= 3; i++) {
    const y = -h * 0.16 + i * h * 0.15;
    g.appendChild(el('path', {
      d: `M ${-w * 0.38} ${y} L ${-w * 0.08} ${y - h * 0.03} M ${w * 0.08} ${y - h * 0.03} L ${w * 0.38} ${y}`,
      stroke: accent || INK.cotton, 'stroke-width': w * 0.028, 'stroke-linecap': 'round'
    }));
  }
  return g;
}

/* casa din chirpici, cu acoperiș de tablă — vizitele din casă în casă */
export function house(w, ink, accent) {
  const g = el('g');
  const h = w * 0.62;
  g.appendChild(el('path', { d: `M ${-w * 0.42} ${h / 2} L ${-w * 0.42} ${-h * 0.1} L ${w * 0.42} ${-h * 0.1} L ${w * 0.42} ${h / 2} Z`, fill: ink }));
  g.appendChild(el('path', { d: `M ${-w / 2} ${-h * 0.1} L ${-w * 0.3} ${-h * 0.46} L ${w * 0.3} ${-h * 0.46} L ${w / 2} ${-h * 0.1} Z`, fill: ink }));
  g.appendChild(el('path', { d: `M ${-w * 0.09} ${h / 2} L ${-w * 0.09} ${h * 0.06} L ${w * 0.09} ${h * 0.06} L ${w * 0.09} ${h / 2} Z`, fill: accent || INK.cotton }));
  g.appendChild(el('circle', { cx: -w * 0.26, cy: h * 0.1, r: w * 0.055, fill: accent || INK.cotton }));
  g.appendChild(el('circle', { cx: w * 0.26, cy: h * 0.1, r: w * 0.055, fill: accent || INK.cotton }));
  return g;
}

/* mistria și cărămida — mâinile puse la treabă */
export function trowel(w, ink, accent) {
  const g = el('g');
  g.appendChild(el('path', { d: `M ${-w * 0.46} ${-w * 0.3} L ${w * 0.06} ${-w * 0.3} L ${-w * 0.1} ${w * 0.08} Z`, fill: ink }));
  g.appendChild(el('path', { d: `M ${w * 0.02} ${-w * 0.26} L ${w * 0.3} ${-w * 0.26}`, stroke: ink, 'stroke-width': w * 0.07, 'stroke-linecap': 'round' }));
  g.appendChild(el('rect', { x: w * 0.26, y: -w * 0.34, width: w * 0.14, height: w * 0.17, fill: ink }));
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 3; j++) {
      const bw = w * 0.26, bh = w * 0.11;
      g.appendChild(el('rect', {
        x: -w * 0.42 + j * (bw + w * 0.025) + (i % 2 ? bw * 0.3 : 0), y: w * 0.2 + i * (bh + w * 0.025),
        width: bw, height: bh, fill: ink
      }));
    }
  return g;
}

/* vehiculele de pe drum — ștampile, nu ilustrații */
export function stamp(kind, w, ink) {
  const g = el('g');
  const P = (d, o = {}) => g.appendChild(el('path', Object.assign({ d, fill: ink }, o)));
  if (kind === 'bus') {
    P(`M ${-w / 2} ${w * 0.16} L ${-w / 2} ${-w * 0.2} Q ${-w / 2} ${-w * 0.3} ${-w * 0.38} ${-w * 0.3} L ${w * 0.4} ${-w * 0.3} Q ${w / 2} ${-w * 0.3} ${w / 2} ${-w * 0.18} L ${w / 2} ${w * 0.16} Z`);
    for (const x of [-w * 0.3, w * 0.3]) g.appendChild(el('circle', { cx: x, cy: w * 0.2, r: w * 0.1, fill: ink }));
    for (let i = 0; i < 4; i++) g.appendChild(el('rect', { x: -w * 0.42 + i * w * 0.21, y: -w * 0.22, width: w * 0.14, height: w * 0.14, fill: INK.cotton }));
  } else if (kind === 'plane') {
    P(`M ${-w * 0.5} 0 L ${w * 0.22} ${-w * 0.09} L ${w * 0.5} 0 L ${w * 0.22} ${w * 0.09} Z`);
    P(`M ${-w * 0.02} ${-w * 0.04} L ${-w * 0.24} ${-w * 0.36} L ${-w * 0.08} ${-w * 0.36} L ${w * 0.14} ${-w * 0.05} Z`);
    P(`M ${-w * 0.02} ${w * 0.04} L ${-w * 0.24} ${w * 0.36} L ${-w * 0.08} ${w * 0.36} L ${w * 0.14} ${w * 0.05} Z`);
  } else { /* car */
    P(`M ${-w / 2} ${w * 0.14} L ${-w / 2} ${-w * 0.06} L ${-w * 0.3} ${-w * 0.08} L ${-w * 0.18} ${-w * 0.28} L ${w * 0.2} ${-w * 0.28} L ${w * 0.3} ${-w * 0.08} L ${w / 2} ${-w * 0.04} L ${w / 2} ${w * 0.14} Z`);
    for (const x of [-w * 0.28, w * 0.28]) g.appendChild(el('circle', { cx: x, cy: w * 0.17, r: w * 0.1, fill: ink }));
    g.appendChild(el('path', { d: `M ${-w * 0.14} ${-w * 0.1} L ${-w * 0.07} ${-w * 0.23} L ${w * 0.16} ${-w * 0.23} L ${w * 0.2} ${-w * 0.1} Z`, fill: INK.cotton }));
  }
  return g;
}

/* ------------------------------------------------------------ compoziție */

/* pindo: chenarul. Motivele se repetă pe toate patru laturile, cu colțuri pline,
   exact ca pe pânzele tipărite industrial. */
export function pindo(W, H, band, inks, seed = 7) {
  const g = el('g');
  const [ground, a, b] = inks;
  g.appendChild(el('path', {
    d: `M0 0 H${W} V${H} H0 Z M${band} ${band} V${H - band} H${W - band} V${band} Z`,
    fill: ground, 'fill-rule': 'evenodd'
  }));
  const r = band * 0.36;
  /* pasul se potrivește pe lungimea fiecărei laturi, ca motivele să cadă exact în colțuri */
  const place = (x, y, i) => {
    const m = i % 2 === 0 ? rosette(r, a, i % 4 === 0 ? b : a) : sprig(r * 0.95, b);
    m.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    g.appendChild(m);
  };
  const nx = Math.max(4, Math.round((W - band) / (band * 1.08)));
  const stepX = (W - band) / nx;
  for (let k = 0; k <= nx; k++) { place(band / 2 + k * stepX, band / 2, k); place(W - band / 2 - k * stepX, H - band / 2, k); }
  const ny = Math.max(2, Math.round((H - band * 3) / (band * 1.08)));
  const stepY = (H - band * 3) / ny;
  for (let k = 0; k <= ny; k++) {
    const y = band * 1.5 + k * stepY;
    place(band / 2, y, k + 1); place(W - band / 2, H - y, k + 1);
  }
  /* rigla dublă dinspre câmp, ca linia de tăiere a pânzei */
  g.appendChild(el('rect', { x: band * 0.9, y: band * 0.9, width: W - band * 1.8, height: H - band * 1.8, fill: 'none', stroke: ground, 'stroke-width': band * 0.085 }));
  g.appendChild(el('rect', { x: band * 0.78, y: band * 0.78, width: W - band * 1.56, height: H - band * 1.56, fill: 'none', stroke: ground, 'stroke-width': band * 0.028 }));
  return g;
}

/* dunga de margine: pe pânzele adevărate, lângă tiv, stă scris mărunt cine a tipărit-o */
export function selvedge(W, H, band, text, ink) {
  return el('text', {
    x: band * 1.15, y: H - band * 1.02, fill: ink, opacity: 0.85,
    'font-family': 'BigShoulders, sans-serif', 'font-weight': 600,
    'font-size': band * 0.145, 'letter-spacing': band * 0.045
  }, [document.createTextNode(text)]);
}

/* mji: câmpul. Bulinele vin de la bibilică — pasărea care a dat numele pânzei. */
export function field(W, H, band, ink, seed = 11, second) {
  const g = el('g');
  const rand = rng(seed);
  const step = band * 0.34;
  let row = 0;
  for (let y = band * 1.15; y < H - band * 1.05; y += step, row++) {
    for (let x = band * 1.15 + (row % 2 ? step / 2 : 0); x < W - band * 1.05; x += step) {
      const jx = (rand() - 0.5) * step * 0.3, jy = (rand() - 0.5) * step * 0.3;
      const rr = step * (0.1 + rand() * 0.055);
      g.appendChild(el('circle', { cx: (x + jx).toFixed(1), cy: (y + jy).toFixed(1), r: rr.toFixed(2), fill: ink, opacity: 0.92 }));
    }
  }
  /* bobul de caju, risipit rar peste buline — al doilea strat de matriță */
  if (second) {
    const stepK = band * 1.55;
    let r2 = 0;
    for (let y = band * 1.6; y < H - band * 1.4; y += stepK, r2++) {
      for (let x = band * 1.6 + (r2 % 2 ? stepK / 2 : 0); x < W - band * 1.4; x += stepK) {
        const k = korosho(band * 0.13, second);
        k.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(rand() * 360).toFixed(0)})`);
        k.setAttribute('opacity', 0.9);
        g.appendChild(k);
      }
    }
  }
  return g;
}

/* jina: fâșia cu fraza tipărită. Ea dă numele pânzei. */
export function jina(W, y, h, text, sub, inks) {
  const [ground, ink] = inks;
  const g = el('g');
  g.appendChild(el('rect', { x: 0, y: y - h / 2, width: W, height: h, fill: ground }));
  g.appendChild(el('text', {
    x: W / 2, y: y + h * (sub ? -0.02 : 0.1), 'text-anchor': 'middle', fill: ink,
    'font-family': 'BigShoulders, sans-serif', 'font-weight': 700,
    'font-size': h * (sub ? 0.46 : 0.56), 'letter-spacing': h * 0.03
  }, [document.createTextNode(text)]));
  if (sub) g.appendChild(el('text', {
    x: W / 2, y: y + h * 0.34, 'text-anchor': 'middle', fill: ink,
    'font-family': 'Archivo, sans-serif', 'font-size': h * 0.2, 'letter-spacing': h * 0.012, opacity: 0.75
  }, [document.createTextNode(sub)]));
  return g;
}

/* medalionul oval din mijloc — pe kanga comemorative acolo stă chipul */
export function medallion(cx, cy, rx, ry, inks, inner, arc) {
  const [ring, ground, accent] = inks;
  const g = el('g', { transform: `translate(${cx} ${cy})` });
  const uid = 'md' + Math.random().toString(36).slice(2, 8);
  if (arc) {
    /* inelul de text: numele locului, cum scrie pe pânzele comemorative */
    g.appendChild(el('ellipse', { rx: rx * 1.26, ry: ry * 1.33, fill: ring }));
    const rr = rx * 1.145, rry = ry * 1.2;
    g.appendChild(el('defs', {}, [el('path', {
      id: uid, fill: 'none',
      d: `M ${-rr} 0 A ${rr} ${rry} 0 1 1 ${rr} 0 A ${rr} ${rry} 0 1 1 ${-rr} 0`
    })]));
    const t = el('text', {
      fill: ground, 'text-anchor': 'middle',
      'font-family': 'BigShoulders, sans-serif', 'font-weight': 700,
      'font-size': rx * 0.135, 'letter-spacing': rx * 0.05
    });
    const tp = el('textPath', { startOffset: '25%' }, [document.createTextNode(arc)]);
    tp.setAttribute('href', `#${uid}`);
    tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${uid}`);
    t.appendChild(tp); g.appendChild(t);
  }
  g.appendChild(el('ellipse', { rx: rx * 1.065, ry: ry * 1.08, fill: ground }));
  g.appendChild(el('ellipse', { rx: rx * 1.02, ry: ry * 1.03, fill: 'none', stroke: accent || ring, 'stroke-width': rx * 0.055 }));
  if (inner) g.appendChild(inner);
  return g;
}

/* o pânză întreagă, gata de pus în pagină sau pe un shader */
export function kanga(opts) {
  const {
    W = 1800, H = 1200, seed = 7,
    inks = [INK.ink, INK.yellow, INK.green],
    ground = INK.cotton, dots = INK.blue, scatter = null,
    text = '', sub = '', center = null, edge = ''
  } = opts;
  const band = Math.min(W, H) * 0.13;
  const svg = el('svg', { xmlns: NS, viewBox: `0 0 ${W} ${H}`, width: W, height: H });
  svg.appendChild(el('rect', { width: W, height: H, fill: ground }));
  svg.appendChild(field(W, H, band, dots, seed + 3, scatter));
  if (center) {
    const c = center(W, H, band);
    if (c) svg.appendChild(c);
  }
  if (text) svg.appendChild(jina(W, H - band * 1.46, band * 0.74, text, sub, [ground, inks[0]]));
  svg.appendChild(pindo(W, H, band, inks, seed));
  if (edge) svg.appendChild(selvedge(W, H, band, edge, inks[0]));
  return svg;
}
