/* Globul: drumul de la Budiu Mic la Kusekwa, pe Pământul adevărat.
   Trei mijloace, fiindcă așa se merge: autocar până la Budapesta, avion până la Nairobi,
   mașină prin savană până la școală. Camera merge cu ei.
   Textura e Blue Marble (NASA, domeniu public); luminile de noapte, tot NASA. */

import * as THREE from './assets/vendor/three.module.js';

const R = 1;                       // raza Pământului în scena asta
const DEG = Math.PI / 180;

/* lat/lon -> punct pe sferă, în convenția SphereGeometry din three.js */
function ll(lat, lon, r = R) {
  const phi = (90 - lat) * DEG;
  const th = (lon + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(th),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(th)
  );
}

/* interpolare pe cercul mare: drumul pe care zboară avioanele */
function slerp(a, b, t) {
  const d = Math.min(1, Math.max(-1, a.dot(b)));
  const om = Math.acos(d);
  if (om < 1e-6) return a.clone();
  const s = Math.sin(om);
  return a.clone().multiplyScalar(Math.sin((1 - t) * om) / s)
    .add(b.clone().multiplyScalar(Math.sin(t * om) / s));
}

export function initGlobe(canvas, stops, opts = {}) {
  const lowRes = opts.lowRes || false;
  const onLabels = opts.onLabels || (() => {});

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.01, 60);

  /* ---------- Pământul: zi/noapte dintr-un shader mic ---------- */
  const tex = new THREE.TextureLoader();
  const load = (u) => new Promise((res) => tex.load(u, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, () => res(null)));

  const sunDir = new THREE.Vector3(1, 0.22, 0.45).normalize();
  const earthMat = new THREE.ShaderMaterial({
    uniforms: {
      dayMap: { value: null }, nightMap: { value: null },
      sunDir: { value: sunDir }, nightMix: { value: 1 }
    },
    vertexShader: `
      varying vec2 vUv; varying vec3 vN;
      void main(){ vUv = uv; vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform sampler2D dayMap, nightMap; uniform vec3 sunDir; uniform float nightMix;
      varying vec2 vUv; varying vec3 vN;
      void main(){
        vec3 n = normalize(vN);
        float d = dot(n, normalize((viewMatrix * vec4(sunDir,0.0)).xyz));
        float t = smoothstep(-0.14, 0.22, d);
        vec3 day = texture2D(dayMap, vUv).rgb;
        vec3 night = texture2D(nightMap, vUv).rgb;
        night = pow(night, vec3(1.3)) * vec3(1.25, 1.05, 0.72) * nightMix;
        vec3 col = mix(night, day * (0.42 + 0.72 * max(d, 0.0)), t);
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), earthMat);
  scene.add(earth);

  /* ---------- aerul: rimul albastru care face ca globul să pară din spațiu ---------- */
  const air = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.035, 64, 48),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { sunDir: { value: sunDir } },
      vertexShader: `varying vec3 vN; varying vec3 vP;
        void main(){ vN = normalize(normalMatrix * normal); vP = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vN; uniform vec3 sunDir;
        void main(){
          float f = pow(1.0 - abs(dot(normalize(vN), vec3(0.0,0.0,1.0))), 2.6);
          gl_FragColor = vec4(vec3(0.36, 0.60, 1.0) * f * 1.25, f);
        }`
    })
  );
  scene.add(air);

  /* ---------- stele, discret ---------- */
  {
    const n = 900, pos = new Float32Array(n * 3);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
      if (v.length() < 0.1) v.set(1, 0, 0);
      v.normalize().multiplyScalar(22 + rnd() * 14);
      pos.set([v.x, v.y, v.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.055, color: 0xbfd4ff, transparent: true, opacity: 0.75, sizeAttenuation: true })));
  }

  const sun = new THREE.DirectionalLight(0xfff2dd, 2.4);
  sun.position.copy(sunDir).multiplyScalar(10);
  scene.add(sun, new THREE.AmbientLight(0x4a5a7a, 1.1));

  /* ---------- traseul: fiecare etapă, cu mijlocul ei ---------- */
  const pts = stops.map((s) => ll(s.lat, s.lon));
  const legs = [];
  for (let i = 1; i < stops.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const air_ = stops[i].mode === 'air';
    const ang = a.angleTo(b);
    const n = Math.max(24, Math.round(ang * 150));
    const lift = air_ ? Math.min(0.14, 0.055 + ang * 0.22) : 0.0045;
    const curve = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const p = slerp(a.clone().normalize(), b.clone().normalize(), t);
      const h = air_ ? Math.sin(Math.PI * t) : 1;
      curve.push(p.multiplyScalar(R + lift * h));
    }
    legs.push({ mode: stops[i].mode, pts: curve, len: ang });
  }

  const totalLen = legs.reduce((s, l) => s + l.len, 0);
  let acc = 0;
  legs.forEach((l) => { l.t0 = acc / totalLen; acc += l.len; l.t1 = acc / totalLen; });

  const COL = { air: 0xf2e1bd, road: 0xe0782f };
  legs.forEach((l) => {
    const curve = new THREE.CatmullRomCurve3(l.pts);
    const geo = new THREE.TubeGeometry(curve, l.pts.length * 2, l.mode === 'air' ? 0.0016 : 0.0013, 7, false);
    const mat = new THREE.MeshBasicMaterial({ color: COL[l.mode], transparent: true, opacity: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 3;
    l.mesh = mesh;
    l.count = geo.index.count;
    geo.setDrawRange(0, 0);
    scene.add(mesh);
  });

  /* ---------- opririle ---------- */
  const marks = stops.map((s, i) => {
    const g = new THREE.Group();
    const p = ll(s.lat, s.lon, R * 1.002);
    g.position.copy(p);
    g.lookAt(p.clone().multiplyScalar(2));
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.0062, 0.0092, 24),
      new THREE.MeshBasicMaterial({ color: s.end ? 0xffffff : 0xf2e1bd, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.0036, 18),
      new THREE.MeshBasicMaterial({ color: s.end ? 0xffffff : 0xa18854, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    ring.renderOrder = 4; dot.renderOrder = 4;
    g.add(ring, dot);
    scene.add(g);
    return { g, ring, dot, pos: p, i, label: s.n, sub: s.s };
  });

  /* ---------- vehiculele ---------- */
  function airliner() {
    const g = new THREE.Group();
    const white = new THREE.MeshStandardMaterial({ color: 0xfffaf0, metalness: 0.1, roughness: 0.35, emissive: 0x2a2620, emissiveIntensity: 1 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x723837, metalness: 0.2, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.78, 6, 14), white);
    body.rotation.z = Math.PI / 2;
    g.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 16), white);
    nose.rotation.z = -Math.PI / 2; nose.position.x = 0.56; g.add(nose);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.022, 1.5), white);
    wing.position.set(-0.02, -0.02, 0);
    wing.geometry.translate(0, 0, 0);
    g.add(wing);
    const wingBackL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.022, 0.5), white);
    wingBackL.position.set(-0.16, -0.02, 0.56); wingBackL.rotation.y = 0.5; g.add(wingBackL);
    const wingBackR = wingBackL.clone(); wingBackR.position.z = -0.56; wingBackR.rotation.y = -0.5; g.add(wingBackR);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.62), white);
    tail.position.set(-0.46, 0.02, 0); g.add(tail);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.022), dark);
    fin.position.set(-0.46, 0.17, 0); g.add(fin);
    [0.34, -0.34].forEach((z) => {
      const e = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.05, 0.26, 12), dark);
      e.rotation.z = Math.PI / 2; e.position.set(0.04, -0.1, z); g.add(e);
    });
    g.userData.base = 0.027;
    return g;
  }
  function roadVehicle(color) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.6 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x20303c, metalness: 0.5, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.3, 0.42), m);
    g.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.24, 0.38), glass);
    cab.position.set(0.04, 0.24, 0); g.add(cab);
    const tyre = new THREE.MeshStandardMaterial({ color: 0x15100d, roughness: 0.9 });
    [[0.3, 0.23], [0.3, -0.23], [-0.3, 0.23], [-0.3, -0.23]].forEach(([x, z]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.09, 12), tyre);
      w.rotation.x = Math.PI / 2; w.position.set(x, -0.14, z); g.add(w);
    });
    g.userData.base = 0.016;
    return g;
  }

  const plane = airliner();
  const bus = roadVehicle(0xcfd6e0);
  const jeep = roadVehicle(0xa18854);
  [plane, bus, jeep].forEach((v) => { v.visible = false; scene.add(v); });

  /* ---------- unde suntem pe traseu, la progresul t ---------- */
  const up = new THREE.Vector3();
  function pointAt(t) {
    t = Math.min(0.999999, Math.max(0, t));
    let leg = legs[legs.length - 1], lt = 1;
    for (const l of legs) {
      if (t >= l.t0 && t <= l.t1) { leg = l; lt = (t - l.t0) / (l.t1 - l.t0 || 1); break; }
    }
    const n = leg.pts.length - 1;
    const f = lt * n, i = Math.min(n - 1, Math.floor(f)), k = f - i;
    const p = leg.pts[i].clone().lerp(leg.pts[i + 1], k);
    const tan = leg.pts[i + 1].clone().sub(leg.pts[i]).normalize();
    return { p, tan, mode: leg.mode, leg };
  }

  function placeVehicle(v, p, tan, lift, dist) {
    up.copy(p).normalize();
    v.scale.setScalar(v.userData.base * dist);
    v.position.copy(p).addScaledVector(up, lift * dist);
    const look = p.clone().add(tan);
    v.up.copy(up);
    v.lookAt(look);
    v.rotateY(-Math.PI / 2);   // modelele privesc pe +X
    v.visible = true;
  }

  /* ---------- camera ---------- */
  const camTarget = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  let started = false;

  const sunWant = new THREE.Vector3();
  function frame(t, spin) {
    const { p, tan, mode } = pointAt(t);

    // soarele urmează drumul, ca locul despre care vorbim să fie mereu luminat
    sunWant.copy(p).normalize().multiplyScalar(0.82).add(new THREE.Vector3(0.3, 0.42, 0.12)).normalize();
    sunDir.lerp(sunWant, started ? 0.05 : 1).normalize();
    sun.position.copy(sunDir).multiplyScalar(10);

    // traseul se desenează până la t
    legs.forEach((l) => {
      const f = (t - l.t0) / (l.t1 - l.t0);
      const c = Math.round(l.count * Math.min(1, Math.max(0, f)));
      l.mesh.geometry.setDrawRange(0, c);
    });

    // opririle apar când ajungi la ele
    marks.forEach((m, i) => {
      const at = i === 0 ? 0 : legs[i - 1].t1;
      const o = Math.min(1, Math.max(0, (t - at + 0.02) * 26));
      m.ring.material.opacity = o * 0.9;
      m.dot.material.opacity = o;
      m.ring.scale.setScalar(1 + (1 - o) * 1.8);
    });


    // camera: orbitează deasupra punctului curent și privește centrul, ca în Google Earth.
    // „înainte” e în susul ecranului, deci drumul fuge spre orizont.
    const n = p.clone().normalize();
    const back = tan.clone().multiplyScalar(-1);
    // coboară lent pe zbor, apoi mai hotărât pe ultima etapă prin savană
    const near = smooth((t - 0.931) / 0.069);
    const dist = 3.45 - 0.95 * smooth(t / 0.931) - 0.80 * near;
    camPos.copy(n).multiplyScalar(dist).addScaledVector(back, dist * (0.30 - 0.14 * near));
    if (spin) camPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), spin * 0.00012);
    // vehiculul potrivit etapei, la mărime constantă pe ecran
    plane.visible = bus.visible = jeep.visible = false;
    if (t > 0.0005) {
      if (mode === 'air') placeVehicle(plane, p, tan, 0.0022, dist);
      else if (t < 0.2) placeVehicle(bus, p, tan, 0.0012, dist);
      else placeVehicle(jeep, p, tan, 0.0012, dist);
    }

    camTarget.set(0, 0, 0);
    cam.position.lerp(camPos, started ? 0.12 : 1);
    cam.up.copy(tan);
    cam.lookAt(camTarget);
    started = true;

    // etichetele, proiectate în 2D, ca să fie text adevărat
    const out = [];
    marks.forEach((m) => {
      const v = m.pos.clone().project(cam);
      const toCam = m.pos.clone().normalize().dot(cam.position.clone().normalize());
      out.push({
        i: m.i, label: m.label, sub: m.sub,
        x: (v.x * 0.5 + 0.5), y: (-v.y * 0.5 + 0.5),
        on: t > 0.012 && toCam > 0.12 && m.dot.material.opacity > 0.25 && v.z < 1
      });
    });
    onLabels(out);
  }
  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }

  const ready = (async () => {
    const [day, night] = await Promise.all([
      load(lowRes ? 'assets/earth/earth-2k.webp' : 'assets/earth/earth-4k.webp'),
      load('assets/earth/lights.webp')
    ]);
    earthMat.uniforms.dayMap.value = day;
    earthMat.uniforms.nightMap.value = night;
    earthMat.uniforms.nightMix.value = night ? 1 : 0;
    earthMat.needsUpdate = true;
    resize();
    return true;
  })();

  return {
    ready, resize,
    render: (t, spin) => { frame(t, spin); renderer.render(scene, cam); },
    dispose: () => { renderer.dispose(); }
  };
}
