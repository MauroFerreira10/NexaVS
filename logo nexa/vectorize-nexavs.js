// vetorizacao do wordmark nexavs: crop -> upscale 6x -> desmistura de cor -> 2 mascaras -> imagetracerjs -> SVG final
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const ImageTracer = require('imagetracerjs');

const root = process.env.USERPROFILE + '\\Documents\\Projetos\\NexaVS\\to-top-adapted';
const outDir = process.env.TEMP + '\\zyon-logo';
fs.mkdirSync(outDir, { recursive: true });

// --- load source ---
const src = PNG.sync.read(fs.readFileSync(path.join(root, 'logo nexa', 'logo 1.png')));
const x0 = 210, y0 = 285, cw = 693, ch = 120, S = 6;
const W = cw * S, H = ch * S;

// cores
const NAVY = [0, 52, 146], TEAL = [0, 136, 162], WHITE = [255, 255, 255];
const dN = WHITE.map((v, i) => v - NAVY[i]);   // branco - navy
const dT = WHITE.map((v, i) => v - TEAL[i]);
const lenN = dN.reduce((s, v) => s + v * v, 0);
const lenT = dT.reduce((s, v) => s + v * v, 0);

function px(x, y) { // crop coords -> rgb
  const i = ((y0 + y) * src.width + (x0 + x)) * 4;
  return [src.data[i], src.data[i + 1], src.data[i + 2]];
}

// bilinear 6x com smoothstep
function smooth(t) { return t * t * (3 - 2 * t); }
function sample(fx, fy) {
  const ix = Math.floor(fx), iy = Math.floor(fy);
  const tx = smooth(fx - ix), ty = smooth(fy - fy);
  const ty2 = smooth(fy - iy);
  const c = (xx, yy) => px(Math.min(xx, cw - 1), Math.min(yy, ch - 1));
  const a = c(ix, iy), b = c(ix + 1, iy), d = c(ix, iy + 1), e = c(ix + 1, iy + 1);
  const out = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const top = a[k] + (b[k] - a[k]) * tx;
    const bot = d[k] + (e[k] - d[k]) * tx;
    out[k] = top + (bot - top) * ty2;
  }
  return out;
}

const navyMask = new Uint8Array(W * H * 4);
const tealMask = new Uint8Array(W * H * 4);
const navyProf = new Uint32Array(W);
const tealProf = new Uint32Array(W);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const p = sample(x / S, y / S);
    const w = [WHITE[0] - p[0], WHITE[1] - p[1], WHITE[2] - p[2]];
    // p = WHITE + t*(C - WHITE)  =>  w = t*(WHITE - C)
    let tN = (w[0] * dN[0] + w[1] * dN[1] + w[2] * dN[2]) / lenN;
    let tT = (w[0] * dT[0] + w[1] * dT[1] + w[2] * dT[2]) / lenT;
    tN = Math.max(0, Math.min(1, tN));
    tT = Math.max(0, Math.min(1, tT));
    const rN = Math.abs(w[0] - tN * dN[0]) + Math.abs(w[1] - tN * dN[1]) + Math.abs(w[2] - tN * dN[2]);
    const rT = Math.abs(w[0] - tT * dT[0]) + Math.abs(w[1] - tT * dT[1]) + Math.abs(w[2] - tT * dT[2]);
    const i = (y * W + x) * 4;
    let cov = 0, isNavy = rN <= rT;
    if (rN + rT > 6) cov = Math.round((isNavy ? tN : tT) * 255);
    const on = cov >= 128;
    const v = on ? 255 : 0;
    navyMask[i] = navyMask[i + 1] = navyMask[i + 2] = navyMask[i + 3] = isNavy && on ? 255 : (isNavy ? 0 : 0);
    // fundo preto opaco + forma branca opaca (1-bit)
    navyMask[i] = navyMask[i + 1] = navyMask[i + 2] = (isNavy && on) ? 255 : 0;
    navyMask[i + 3] = 255;
    tealMask[i] = tealMask[i + 1] = tealMask[i + 2] = (!isNavy && on) ? 255 : 0;
    tealMask[i + 3] = 255;
    if (isNavy && on) navyProf[x]++;
    if (!isNavy && on) tealProf[x]++;
  }
}

fs.writeFileSync(path.join(outDir, 'mask-navy.png'), PNG.sync.write({ width: W, height: H, data: Buffer.from(navyMask) }));
fs.writeFileSync(path.join(outDir, 'mask-teal.png'), PNG.sync.write({ width: W, height: H, data: Buffer.from(tealMask) }));

// --- segmentos (letras) ---
function segments(prof) {
  const segs = []; let inS = false, st = 0;
  for (let x = 0; x < W; x++) {
    if (prof[x] > 0 && !inS) { inS = true; st = x; }
    else if (prof[x] === 0 && inS) { inS = false; segs.push([st, x - 1]); }
  }
  if (inS) segs.push([st, W - 1]);
  return segs;
}
const navySegs = segments(navyProf);
const tealSegs = segments(tealProf);
console.log('mascara:', W + 'x' + H);
console.log('navy letras:', JSON.stringify(navySegs));
console.log('teal letras:', JSON.stringify(tealSegs));

// --- trace ---
const opts = {
  ltres: 0.5, qtres: 0.5, pathomit: 8, rightangleenhance: true,
  colorsnumber: 2, strokewidth: 0, linefilter: true, scale: 1,
  roundcoords: 2, viewbox: true, desc: false, blurradius: 0, blurdelta: 20,
  colorquantcycles: 2, mincolorratio: 0
};
function trace(mask, name) {
  const imgd = { width: W, height: H, data: new Uint8ClampedArray(mask) };
  const svg = ImageTracer.imagedataToSVG(imgd, opts);
  fs.writeFileSync(path.join(outDir, name), svg);
  // paths da forma sao brancos; preto = fundo/contadores
  const paths = svg.match(/<path[^>]*\/>/g) || [];
  const keep = paths.filter(p => /fill="rgb\(255,255,255\)"/.test(p));
  console.log(name + ': ' + paths.length + ' paths, ' + keep.length + ' mantidos');
  return keep;
}
const navyPaths = trace(navyMask, 'trace-navy.svg');
const tealPaths = trace(tealMask, 'trace-teal.svg');

function clean(p) {
  return p
    .replace(/\s*fill="rgb\(255,255,255\)"/g, '')
    .replace(/\s*stroke="[^"]*"/g, '')
    .replace(/\s*stroke-width="[^"]*"/g, '');
}
// width/height intrinseco igual ao PNG (693x120) para nao mexer no layout
const vb = '0 0 ' + W + ' ' + H;
const logoSvg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="693" height="120" role="img" aria-label="nexavs">
<title>nexavs</title>
<g fill="#003492">${navyPaths.map(clean).join('')}</g>
<g fill="#0088A2">${tealPaths.map(clean).join('')}</g>
</svg>`;
const whiteSvg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="693" height="120" role="img" aria-label="nexavs">
<title>nexavs</title>
<g fill="#ffffff">${navyPaths.concat(tealPaths).map(clean).join('')}</g>
</svg>`;
fs.writeFileSync(path.join(root, 'images', 'nexavs-logo.svg'), logoSvg);
fs.writeFileSync(path.join(root, 'images', 'nexavs-logo-white.svg'), whiteSvg);
console.log('SVGs escritos:', logoSvg.length, 'bytes /', whiteSvg.length, 'bytes');

// --- monograma X: path da 3a letra navy [1503,2109] ---
function pathBBox(d) {
  const nums = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    if (nums[i] < x0) x0 = nums[i];
    if (nums[i] > x1) x1 = nums[i];
    if (nums[i + 1] < y0) y0 = nums[i + 1];
    if (nums[i + 1] > y1) y1 = nums[i + 1];
  }
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
}
let xPath = null, xBox = null, best = 1e9;
for (const p of navyPaths) {
  const d = (p.match(/ d="([^"]*)"/) || [])[1];
  if (!d) continue;
  const b = pathBBox(d);
  const dist = Math.abs(b.x0 - 1503);
  if (dist < best && b.w > 400 && b.w < 800) { best = dist; xPath = d; xBox = b; }
}
if (!xPath) throw new Error('X nao encontrado');
console.log('X bbox:', JSON.stringify(xBox));
const tgt = 660;
const s = Math.min(tgt / xBox.w, tgt / xBox.h);
const tx = (1000 - xBox.w * s) / 2 - xBox.x0 * s;
const ty = (1000 - xBox.h * s) / 2 - xBox.y0 * s;
const markSvg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000" role="img" aria-label="nexavs mark">
<title>nexavs</title>
<g fill="#ffffff" transform="translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${s.toFixed(5)})"><path d="${xPath}"/></g>
</svg>`;
fs.writeFileSync(path.join(root, 'images', 'nexavs-mark.svg'), markSvg);
console.log('nexavs-mark.svg:', markSvg.length, 'bytes');

// --- templates para rasterizacao via Edge headless ---
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/');
const imgs = path.join(root, 'images');
const bg = 'background:linear-gradient(155deg,#0a4bd0 0%,#003492 45%,#001e5a 100%)';
fs.writeFileSync(path.join(outDir, '_fav.html'),
  `<!doctype html><html><body style="margin:0;${bg};width:64px;height:64px;display:flex;align-items:center;justify-content:center"><img src="${fileUrl(path.join(imgs, 'nexavs-mark.svg'))}" style="width:40px"></body></html>`);
fs.writeFileSync(path.join(outDir, '_webclip.html'),
  `<!doctype html><html><body style="margin:0;${bg};width:180px;height:180px;display:flex;align-items:center;justify-content:center"><img src="${fileUrl(path.join(imgs, 'nexavs-mark.svg'))}" style="width:112px"></body></html>`);
fs.writeFileSync(path.join(outDir, '_og.html'),
  `<!doctype html><html><body style="margin:0;width:1200px;height:630px;background:#001b4d;display:flex;align-items:center;justify-content:center"><img src="${fileUrl(path.join(imgs, 'nexavs-logo-white.svg'))}" style="width:560px"></body></html>`);
console.log('templates escritos');
