/* Atlasul: globul desenat cu linia, pe hârtie crem.
   Se desenează singur la scroll — întâi cercul, apoi paralelele și meridianele, apoi țărmurile —
   după care pleacă punctul din Târgu Mureș: autocar la Budapesta, avion la Nairobi,
   mașină prin savană până la Kusekwa. Proiecție ortografică, scrisă de mână: fără d3. */

const DEG = Math.PI / 180;
const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

/* unitate pe sferă din lon/lat */
function unit(lon, lat) {
  const a = lon * DEG, b = lat * DEG, c = Math.cos(b);
  return [c * Math.cos(a), c * Math.sin(a), Math.sin(b)];
}
/* drumul cel mai scurt între două puncte de pe glob */
function slerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  d = clamp(d, -1, 1);
  const om = Math.acos(d);
  if (om < 1e-7) return a.slice();
  const s = Math.sin(om), k0 = Math.sin((1 - t) * om) / s, k1 = Math.sin(t * om) / s;
  return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
}
function toLL(v) {
  return [Math.atan2(v[1], v[0]) / DEG, Math.asin(clamp(v[2], -1, 1)) / DEG];
}
/* distanța pe glob, în km */
function km(a, b) {
  const u = unit(a[0], a[1]), w = unit(b[0], b[1]);
  return 6371 * Math.acos(clamp(u[0] * w[0] + u[1] * w[1] + u[2] * w[2], -1, 1));
}

export function initAtlas(host, stops, opts = {}) {
  const onLabels = opts.onLabels || (() => {});
  const svg = el('svg', { class: 'atlas-svg', xmlns: NS, 'aria-hidden': 'true' });
  host.appendChild(svg);

  const g = {};
  ['halo', 'sphere', 'grat', 'coast', 'geo', 'route', 'stops', 'craft'].forEach((k) => {
    g[k] = el('g', { class: 'a-' + k });
    svg.appendChild(g[k]);
  });

  /* ---------- starea proiecției ---------- */
  let W = 1, H = 1, cx = 0, cy = 0, Rbase = 1;
  let lon0 = 24.56, lat0 = 46.54, zoom = 1;

  function project(lon, lat) {
    const l = (lon - lon0) * DEG, p = lat * DEG, p0 = lat0 * DEG;
    const cl = Math.cos(l), sl = Math.sin(l), cp = Math.cos(p), sp = Math.sin(p);
    const c0 = Math.cos(p0), s0 = Math.sin(p0);
    const x = cp * sl;
    const y = c0 * sp - s0 * cp * cl;
    const z = s0 * sp + c0 * cp * cl;
    const R = Rbase * zoom;
    return [cx + x * R, cy - y * R, z];
  }

  /* o polilinie proiectată, tăiată la orizont, revelată până la „grow” */
  function linePath(flat, grow) {
    const n = flat.length >> 1;
    const upto = grow >= 1 ? n : Math.max(2, Math.ceil(n * grow));
    let d = '', pen = false, prev = null;
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, any = false;
    for (let i = 0; i < upto; i++) {
      const q = project(flat[i * 2], flat[i * 2 + 1]);
      if (q[2] > 0) {
        if (!pen) {
          if (prev) {                     // intrăm în vedere: pornim exact de pe orizont
            const k = prev[2] / (prev[2] - q[2]);
            d += `M${(prev[0] + (q[0] - prev[0]) * k).toFixed(1)} ${(prev[1] + (q[1] - prev[1]) * k).toFixed(1)}`;
            d += `L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
          } else {
            d += `M${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
          }
          pen = true;
        } else {
          d += `L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
        }
      } else if (pen) {                   // ieșim din vedere: ne oprim pe orizont
        const k = prev[2] / (prev[2] - q[2]);
        d += `L${(prev[0] + (q[0] - prev[0]) * k).toFixed(1)} ${(prev[1] + (q[1] - prev[1]) * k).toFixed(1)}`;
        pen = false;
      }
      if (q[2] > 0) {
        any = true;
        if (q[0] < minx) minx = q[0]; if (q[0] > maxx) maxx = q[0];
        if (q[1] < miny) miny = q[1]; if (q[1] > maxy) maxy = q[1];
      }
      prev = q;
    }
    if (!any || maxx < -40 || minx > W + 40 || maxy < -40 || miny > H + 40) return '';
    return d;
  }

  function paint(group, lines, growOf) {
    const kids = group.childNodes;
    for (let i = 0; i < lines.length; i++) {
      const gr = growOf(i);
      const p = kids[i];
      if (gr <= 0) { p.setAttribute('d', ''); continue; }
      p.setAttribute('d', linePath(lines[i], gr));
    }
  }

  /* ---------- datele ---------- */
  let atlas = { coast: [], border: [], lake: [] };
  const grat = [];
  for (let lon = -180; lon < 180; lon += 30) {         // meridiane
    const f = [];
    for (let lat = -80; lat <= 80; lat += 4) f.push(lon, lat);
    grat.push(f);
  }
  for (let lat = -60; lat <= 60; lat += 30) {          // paralele
    const f = [];
    for (let lon = -180; lon <= 180; lon += 4) f.push(lon, lat);
    grat.push(f);
  }
  const EQ = [];
  for (let lon = -180; lon <= 180; lon += 3) EQ.push(lon, 0);

  grat.forEach(() => g.grat.appendChild(el('path', { class: 'a-l a-l--lo' })));
  const eqPath = el('path', { class: 'a-l a-l--eq' });
  g.grat.appendChild(eqPath);
  const rim = el('circle', { class: 'a-rim' });
  g.sphere.appendChild(rim);

  /* ---------- traseul ---------- */
  const P = stops.map((s) => unit(s.lon, s.lat));
  const legs = [];
  for (let i = 1; i < stops.length; i++) {
    const a = P[i - 1], b = P[i];
    const ang = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));
    const n = Math.max(16, Math.round(ang * 110));
    const pts = [];
    for (let k = 0; k <= n; k++) pts.push(toLL(slerp(a, b, k / n)));
    legs.push({ mode: stops[i].mode, pts, ang, flat: pts.flat() });
  }
  const total = legs.reduce((s, l) => s + l.ang, 0);
  let acc = 0;
  legs.forEach((l) => { l.t0 = acc / total; acc += l.ang; l.t1 = acc / total; });
  legs.forEach((l) => {
    l.ghost = el('path', { class: 'a-l a-plan' });
    g.route.appendChild(l.ghost);
  });
  legs.forEach((l) => {
    l.el = el('path', { class: 'a-l a-route a-route--' + l.mode });
    g.route.appendChild(l.el);
  });

  const dots = stops.map((s, i) => {
    const c = el('circle', { class: 'a-dot' + (s.end ? ' a-dot--end' : ''), r: 0 });
    const ring = el('circle', { class: 'a-ring', r: 0 });
    g.stops.appendChild(ring); g.stops.appendChild(c);
    return { c, ring, s, i };
  });

  /* ---------- vehiculele, desenate din linii ---------- */
  function craft(kind) {
    const w = el('g', { class: 'a-veh a-veh--' + kind });
    const put = (d, cls) => w.appendChild(el('path', { class: 'a-l ' + (cls || 'a-l--hi'), d }));
    if (kind === 'plane') {
      put('M-13 0 L6 0 L13 2.6 L13 -2.6 L6 0');                       // fuzelaj + bot
      put('M-1 0 L-9 10 L-5.5 10.6 L3 1.2');                          // aripa stângă
      put('M-1 0 L-9 -10 L-5.5 -10.6 L3 -1.2');                       // aripa dreaptă
      put('M-11 0 L-14.5 4.6 L-12.6 4.9 L-9.4 0.8', 'a-l--edge');
      put('M-11 0 L-14.5 -4.6 L-12.6 -4.9 L-9.4 -0.8', 'a-l--edge');
    } else if (kind === 'bus') {
      put('M-15 2.6 L-15 -5 Q-15 -6.4 -13.4 -6.4 L11 -6.4 Q14.4 -6.4 15 -3 L15 2.6 Z');
      put('M-10.4 -4.2 L-10.4 -0.4 M-4.6 -4.2 L-4.6 -0.4 M1.2 -4.2 L1.2 -0.4', 'a-l--edge');
      put('M7 -4.6 L13 -4.6 L14 -0.6 L7 -0.6 Z', 'a-l--edge');
      put('M-9 2.6 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0');
      put('M9 2.6 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0');
    } else {
      put('M-13 2.2 L-13 -1.8 L-8 -1.8 L-5 -6 L5 -6 L7 -1.8 L13 -1.8 L13 2.2 Z');
      put('M-4.4 -2.2 L-2.4 -4.9 L0.4 -4.9 L0.4 -2.2 Z', 'a-l--edge');
      put('M1.8 -2.2 L1.8 -4.9 L4.2 -4.9 L5.6 -2.2 Z', 'a-l--edge');
      put('M-7.4 2.2 m-3.1 0 a3.1 3.1 0 1 0 6.2 0 a3.1 3.1 0 1 0 -6.2 0');
      put('M7.4 2.2 m-3.1 0 a3.1 3.1 0 1 0 6.2 0 a3.1 3.1 0 1 0 -6.2 0');
    }
    w.style.opacity = 0;
    g.craft.appendChild(w);
    return w;
  }
  const veh = { plane: craft('plane'), bus: craft('bus'), car: craft('car') };

  /* ---------- unde suntem pe drum ---------- */
  function at(t) {
    t = clamp(t, 0, 0.999999);
    let leg = legs[legs.length - 1], lt = 1;
    for (const l of legs) if (t >= l.t0 && t <= l.t1) { leg = l; lt = (t - l.t0) / (l.t1 - l.t0 || 1); break; }
    const n = leg.pts.length - 1;
    const f = lt * n, i = Math.min(n - 1, Math.floor(f)), k = f - i;
    const a = leg.pts[i], b = leg.pts[i + 1];
    let dl = b[0] - a[0];
    if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
    return { lon: a[0] + dl * k, lat: lerp(a[1], b[1], k), leg, lt, mode: leg.mode, a, b };
  }

  /* ---------- randarea unui cadru ---------- */
  function render(state) {
    const { draw, t, zoomTo } = state;

    // centrul: la început stăm pe Târgu Mureș, apoi mergem cu drumul
    const now = t > 0 ? at(t) : { lon: stops[0].lon, lat: stops[0].lat, mode: null };
    lon0 = now.lon; lat0 = now.lat; zoom = zoomTo;

    const R = Rbase * zoom;
    rim.setAttribute('cx', cx); rim.setAttribute('cy', cy);
    rim.setAttribute('r', R * clamp(draw * 1.6, 0, 1));
    rim.style.opacity = clamp(draw * 3, 0, 1) * (zoom > 2.4 ? clamp(3.4 - zoom, 0, 1) : 1);

    // paralelele și meridianele, unul câte unul
    const gd = clamp((draw - 0.12) / 0.42, 0, 1);
    paint(g.grat, grat, (i) => clamp(gd * grat.length - i * 0.55, 0, 1));
    eqPath.setAttribute('d', gd > 0.6 ? linePath(EQ, 1) : '');
    eqPath.style.opacity = clamp((gd - 0.6) * 3, 0, 1);

    // țărmurile: fiecare se desenează ca din creion
    const cd = clamp((draw - 0.3) / 0.7, 0, 1);
    paint(g.coast, atlas.coast, (i) => clamp(cd * 2.2 - (i / atlas.coast.length) * 1.2, 0, 1));

    // granițele și lacurile apar doar când coborâm, altfel încarcă degeaba
    const near = clamp((zoom - 1.7) / 1.1, 0, 1);
    g.geo.style.opacity = near;
    if (near > 0.01) {
      paint(g.geo, geoLines, () => 1);
    } else if (g.geo.dataset.blank !== '1') {
      g.geo.childNodes.forEach((p) => p.setAttribute('d', ''));
      g.geo.dataset.blank = '1';
    }
    if (near > 0.01) g.geo.dataset.blank = '0';

    // întâi drumul plănuit, punctat; peste el, cel parcurs
    const plan = clamp((draw - 0.74) / 0.26, 0, 1);
    legs.forEach((l, i) => {
      const pg = clamp(plan * legs.length - i * 0.8, 0, 1);
      l.ghost.setAttribute('d', pg > 0 ? linePath(l.flat, pg) : '');
      const f = clamp((t - l.t0) / (l.t1 - l.t0), 0, 1);
      l.el.setAttribute('d', f > 0 ? linePath(l.flat, f) : '');
    });

    // opririle
    dots.forEach((d, i) => {
      const after = i === 0 ? 0 : legs[i - 1].t1;
      const o = i === 0 ? clamp((t + 0.02) * 40, 0, 1) * clamp(draw * 4 - 3, 0, 1)
                        : clamp((t - after + 0.012) * 30, 0, 1);
      const q = project(d.s.lon, d.s.lat);
      const on = q[2] > 0 && o > 0.02;
      d.c.style.opacity = on ? 1 : 0;
      d.ring.style.opacity = on ? (1 - o) * 0.8 : 0;
      if (on) {
        d.c.setAttribute('cx', q[0].toFixed(1)); d.c.setAttribute('cy', q[1].toFixed(1));
        d.c.setAttribute('r', (d.s.end ? 4.6 : 3.3) * clamp(o * 1.4, 0, 1));
        d.ring.setAttribute('cx', q[0].toFixed(1)); d.ring.setAttribute('cy', q[1].toFixed(1));
        d.ring.setAttribute('r', (d.s.end ? 5 : 4) + (1 - o) * 22);
      }
    });

    // vehiculul: mărime constantă, orientat pe direcția de mers
    Object.values(veh).forEach((v) => { v.style.opacity = 0; });
    if (t > 0.0008 && t < 0.9995) {
      const kind = now.mode === 'air' ? 'plane' : (t < 0.2 ? 'bus' : 'car');
      const v = veh[kind];
      const q = project(now.lon, now.lat);
      if (q[2] > 0) {
        const ahead = at(clamp(t + 0.004, 0, 1));
        const q2 = project(ahead.lon, ahead.lat);
        let ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]) / DEG;
        const flip = Math.abs(ang) > 90 && kind !== 'plane';
        const s = (kind === 'plane' ? 1.3 : 1.1) * clamp(Rbase / 200, 0.95, 2.1);
        const wob = kind === 'bus' || kind === 'car' ? Math.sin(t * 420) * 0.5 : 0;
        v.setAttribute('transform',
          `translate(${q[0].toFixed(1)} ${(q[1] + wob).toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${(flip ? -s : s).toFixed(3)} ${s.toFixed(3)})`);
        v.style.opacity = 1;
      }
    }

    // etichetele, ca text adevărat peste desen
    onLabels(stops.map((s, i) => {
      const q = project(s.lon, s.lat);
      const after = i === 0 ? 0 : legs[i - 1].t1;
      return { i, label: s.n, sub: s.s, x: q[0] / W, y: q[1] / H,
        on: q[2] > 0.02 && draw > 0.92 && (i === 0 ? t >= 0 : t > after - 0.03) };
    }));
  }

  let geoLines = [];
  function resize() {
    const r = host.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    cx = W * (W > 900 ? 0.64 : 0.5);
    cy = H * (W > 900 ? 0.5 : 0.44);
    Rbase = Math.min(W * (W > 900 ? 0.46 : 0.48), H * (W > 900 ? 0.50 : 0.42));
  }
  resize();

  const ready = fetch('assets/atlas.json').then((r) => r.json()).then((d) => {
    atlas = d;
    atlas.coast.sort((a, b) => b.length - a.length);
    atlas.coast.forEach(() => g.coast.appendChild(el('path', { class: 'a-l a-l--edge' })));
    geoLines = atlas.border.concat(atlas.lake);
    geoLines.forEach(() => g.geo.appendChild(el('path', { class: 'a-l a-l--lo' })));
    return true;
  });

  return { ready, resize, render, km,
    legKm: legs.map((l, i) => Math.round(km([stops[i].lon, stops[i].lat], [stops[i + 1].lon, stops[i + 1].lat]))) };
}
