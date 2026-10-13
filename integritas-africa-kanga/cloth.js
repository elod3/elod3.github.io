/* cloth.js — pânza. Tiparul desenat în print.js ajunge aici ca textură și e pus
   pe bumbac adevărat: harta de normale e o țesătură scanată (ambientCG, Fabric019,
   CC0), nu zgomot inventat. De acolo vine firul care se vede în lumină.

   Pânza atârnă de două colțuri, respiră, și se îndoaie sub cursor. Când cobori în
   pagină se întinde și se așază — pânza devine foaia pe care scrie mai departe.
   Fără WebGL: rămâne tiparul plat, care e oricum întreg. */

const VERT = `
attribute vec2 a_uv;
uniform vec2  u_grid;
uniform float u_time, u_calm, u_aspect, u_fold;
uniform vec3  u_touch;      /* xy în spațiul pânzei, z = tărie */
varying vec2  v_uv;
varying vec3  v_pos, v_nrm;

/* înălțimea pânzei într-un punct: trei unde lungi + atingerea cursorului */
float sheet(vec2 uv) {
  float hang = smoothstep(0.0, 0.85, uv.y);          /* sus e prinsă, jos e liberă */
  float t = u_time;
  float z = 0.0;
  z += sin(uv.x * 6.1 + t * 0.9) * 0.082 * hang;
  z += sin((uv.x * 2.3 + uv.y * 3.7) - t * 0.62) * 0.064 * hang;
  z += sin((uv.x * 9.4 - uv.y * 5.1) + t * 1.27) * 0.022 * hang;
  z += sin(uv.y * 4.4 - t * 0.73) * 0.032 * hang;
  z *= mix(1.0, 0.12, u_calm);                        /* se liniștește la derulare */
  float d = distance(vec2(uv.x * u_aspect, uv.y), vec2(u_touch.x * u_aspect, u_touch.y));
  z += u_touch.z * 0.1 * exp(-d * d * 26.0);
  z -= u_fold * 0.5 * pow(max(0.0, uv.y - 0.1), 2.0); /* căderea de la greutate */
  return z;
}

void main() {
  v_uv = a_uv;
  vec2 e = vec2(1.0 / u_grid.x, 1.0 / u_grid.y);
  float z  = sheet(a_uv);
  float zx = sheet(a_uv + vec2(e.x, 0.0));
  float zy = sheet(a_uv + vec2(0.0, e.y));
  vec3 tx = vec3(e.x * u_aspect, 0.0, zx - z);
  vec3 ty = vec3(0.0, e.y, zy - z);
  v_nrm = normalize(cross(tx, ty));
  /* colțurile de sus trag puțin spre interior, ca o pânză agățată */
  float pull = (1.0 - smoothstep(0.0, 0.6, a_uv.y)) * 0.018;
  vec3 p = vec3((a_uv.x - 0.5) * u_aspect * (1.0 - pull), (0.5 - a_uv.y), z);
  v_pos = p;
  /* perspectivă scurtă: pânza e aproape, nu o hartă */
  float persp = 1.0 / (1.0 - p.z * 0.33);
  gl_Position = vec4(p.x * persp / (u_aspect * 0.5), p.y * persp * 2.0, -p.z * 0.4, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D u_print, u_weave;
uniform float u_time, u_calm, u_weaveScale;
uniform vec2  u_printUV;
varying vec2 v_uv;
varying vec3 v_pos, v_nrm;

void main() {
  vec3 albedo = texture2D(u_print, v_uv * u_printUV).rgb;

  /* firul: harta de normale a bumbacului scanat, peste îndoitura mare */
  vec3 wn = texture2D(u_weave, v_uv * u_weaveScale).rgb * 2.0 - 1.0;
  vec3 N = normalize(v_nrm + vec3(wn.xy * 0.85, 0.0));

  vec3 L = normalize(vec3(-0.42, 0.62, 0.66));
  vec3 V = vec3(0.0, 0.0, 1.0);

  /* bumbacul nu are lumină tăiată: half-lambert, cum se comportă o țesătură */
  float d = dot(N, L) * 0.5 + 0.5;
  float diff = d * d;

  /* lumina care trece prin pânză, de dincolo */
  float back = max(0.0, dot(-N, L)) * 0.22;

  /* luciul mat al bumbacului călcat */
  vec3  H = normalize(L + V);
  float spec = pow(max(0.0, dot(N, H)), 16.0) * 0.2;

  /* firul mai aspru pe muchii, ca la o pânză întinsă în lumină piezișă */
  float sheen = pow(1.0 - max(0.0, dot(N, V)), 3.2) * 0.16;

  vec3 col = albedo * (0.56 + 0.46 * diff + back * 0.6) + spec * albedo * 0.7 + sheen * albedo * 0.5;

  /* umbra proprie a cutelor, doar cât s-o crezi */
  col *= 1.0 - smoothstep(0.0, 0.14, -v_pos.z) * 0.38;
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src); gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(sh)); return null; }
  return sh;
}

/* tiparul ajunge textură: SVG-ul desenat → imagine → canvas. Textul se scrie peste,
   cu fontul paginii, fiindcă un SVG serializat nu-și ia fonturile cu el. */
export function printToCanvas(svg, W, H, overlays = []) {
  return new Promise((resolve) => {
    /* WebGL1 face mipmap doar pe texturi putere a lui doi; tiparul stă în colțul
       de sus al unui pătrat de 2048 și se citește cu u_printUV. */
    const pot = 2048;
    const cv = document.createElement('canvas');
    cv.width = pot; cv.height = pot;
    const drawW = pot, drawH = Math.round(pot * H / W);
    cv.uvScale = [1, drawH / pot];
    const ctx = cv.getContext('2d');
    ctx.save();
    ctx.scale(drawW / W, drawH / H);
    const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, W, H);
      for (const o of overlays) {
        ctx.save();
        ctx.fillStyle = o.ink;
        ctx.textAlign = o.align || 'center';
        ctx.font = `${o.weight || 700} ${o.size}px ${o.family || 'BigShoulders'}`;
        if (o.tracking) {
          const chars = [...o.text];
          const w = chars.reduce((s, c) => s + ctx.measureText(c).width + o.tracking, -o.tracking);
          let x = o.align === 'left' ? o.x : o.x - w / 2;
          ctx.textAlign = 'left';
          for (const c of chars) { ctx.fillText(c, x, o.y); x += ctx.measureText(c).width + o.tracking; }
        } else ctx.fillText(o.text, o.x, o.y);
        ctx.restore();
      }
      ctx.restore();
      resolve(cv);
    };
    img.onerror = () => resolve(cv);
    img.src = src;
  });
}

export class Cloth {
  constructor(canvas, printCanvas, weaveImg, opts = {}) {
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error('fără webgl');
    this.gl = gl; this.canvas = canvas;
    this.aspect = opts.aspect || 1.5;
    this.calm = 0; this.fold = 0;
    this.touch = [0.5, 0.5, 0]; this.touchTarget = 0;
    this.t0 = performance.now();

    const p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p); gl.useProgram(p);
    this.p = p;

    /* grila: destulă ca o cută să fie rotundă, nu un acoperiș */
    /* grila stă sub 65.535 de vârfuri, ca indicii să încapă pe 16 biți */
    const nx = Math.min(200, opts.segments || 110), ny = Math.round(nx / this.aspect);
    const verts = [], idx = [];
    for (let y = 0; y <= ny; y++) for (let x = 0; x <= nx; x++) verts.push(x / nx, y / ny);
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const a = y * (nx + 1) + x, b = a + 1, c = a + nx + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    this.count = idx.length;
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, 'a_uv');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    this.idxType = gl.UNSIGNED_SHORT;

    this.u = {};
    for (const n of ['u_grid', 'u_time', 'u_calm', 'u_aspect', 'u_fold', 'u_touch', 'u_print', 'u_weave', 'u_weaveScale', 'u_printUV'])
      this.u[n] = gl.getUniformLocation(p, n);
    gl.uniform2f(this.u.u_grid, nx, ny);
    gl.uniform1f(this.u.u_aspect, this.aspect);
    gl.uniform1f(this.u.u_weaveScale, opts.weaveScale || 46);
    const uv = printCanvas.uvScale || [1, 1];
    gl.uniform2f(this.u.u_printUV, uv[0], uv[1]);

    this.texPrint = this.makeTex(printCanvas, true);
    this.texWeave = this.makeTex(weaveImg, false);
    gl.uniform1i(this.u.u_print, 0);
    gl.uniform1i(this.u.u_weave, 1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.texPrint);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.texWeave);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0, 0, 0, 0);
  }

  makeTex(src, clamp) {
    const gl = this.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const wrap = clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.generateMipmap(gl.TEXTURE_2D);
    return t;
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  /* cursorul apasă pânza; degetul ridicat o lasă să se întoarcă */
  point(u, v, on) { this.touch[0] = u; this.touch[1] = v; this.touchTarget = on ? 1 : 0; }

  frame(now) {
    const gl = this.gl;
    this.touch[2] += (this.touchTarget - this.touch[2]) * 0.08;
    gl.useProgram(this.p);
    gl.uniform1f(this.u.u_time, (now - this.t0) / 1000);
    gl.uniform1f(this.u.u_calm, this.calm);
    gl.uniform1f(this.u.u_fold, this.fold);
    gl.uniform3f(this.u.u_touch, this.touch[0], this.touch[1], this.touch[2]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, this.count, this.idxType, 0);
  }
}
