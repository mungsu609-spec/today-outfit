// 폰 안에서 돌아가는 무료 AI 두 개
//  1) 배경 지우기(누끼): ISNet
//  2) 옷 알아보기: MobileCLIP (그림만 보는 쪽만 받고, 글자 쪽 계산은 labels.json에 미리 해 둠)
// 처음 한 번만 AI 파일을 내려받고, 다음부터는 폰에 저장된 걸 써요.

const TJS = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";
export let BG_MODEL = "onnx-community/ISNet-ONNX";
export let BG_OPTS = {};
export const setBg = (m, o = {}) => { BG_MODEL = m; BG_OPTS = o; seg = null; };   // 시험용
export const CLIP_MODEL = "Xenova/mobileclip_s1";
export const CLIP_DTYPE = "fp16";

let T = null, seg = null, proc = null, vision = null, labels = null;

async function lib() {
  if (!T) {
    T = await import(TJS);
    T.env.allowLocalModels = false;
  }
  return T;
}

// onProgress(0~1, 글자)
function tracker(onProgress, label) {
  const files = {};
  return (p) => {
    if (p.status === "progress" && p.total) {
      files[p.file] = [p.loaded, p.total];
      let a = 0, b = 0;
      for (const [l, t] of Object.values(files)) { a += l; b += t; }
      onProgress?.(a / b, `${label} ${Math.round(b / 1e6)}MB 중 ${Math.round(a / 1e6)}MB`);
    }
  };
}

export async function loadBg(onProgress) {
  const { pipeline } = await lib();
  if (!seg) seg = await pipeline("background-removal", BG_MODEL, { dtype: "q8", ...BG_OPTS, progress_callback: tracker(onProgress, "배경 지우기 AI") });
  return seg;
}

export async function loadClip(onProgress) {
  const { AutoProcessor, CLIPVisionModelWithProjection } = await lib();
  if (!labels) labels = await (await fetch(new URL("labels.json", import.meta.url))).json();
  if (!proc) proc = await AutoProcessor.from_pretrained(CLIP_MODEL);
  if (!vision) vision = await CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL, { dtype: CLIP_DTYPE, progress_callback: tracker(onProgress, "옷 알아보기 AI") });
}

// 사진(canvas) → 배경이 투명해진 canvas
export async function removeBg(canvas, onProgress) {
  const s = await loadBg(onProgress);
  const { RawImage } = await lib();
  const out = await s(RawImage.fromCanvas(canvas));
  const img = Array.isArray(out) ? out[0] : out;
  return img.toCanvas();
}

// base64(int8) → Float32Array
function unpack(b64, scale) {
  const bin = atob(b64), v = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++) { const x = bin.charCodeAt(i); v[i] = (x > 127 ? x - 256 : x) / scale; }
  return v;
}

function softmax(xs) {
  const m = Math.max(...xs), e = xs.map((x) => Math.exp(x - m)), s = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / s);
}

// 사진 한 장 → 종류·무늬·두께별 확률
async function probs(canvas) {
  const { RawImage } = await lib();
  const inputs = await proc(RawImage.fromCanvas(canvas));
  const { image_embeds } = await vision(inputs);
  const e = image_embeds.data, n = Math.hypot(...e);
  const img = Array.from(e, (x) => x / n);
  const vec = labels.vec || (labels.vec = Object.fromEntries(Object.entries(labels.emb).map(([k, b]) => [k, unpack(b, labels.scale)])));
  const sim = (k) => { const v = vec[k]; let s = 0; for (let i = 0; i < v.length; i++) s += v[i] * img[i]; return s * labels.logit; };
  const out = {};
  for (const g of ["type", "pat", "thick", "sleeve", "leg"]) {
    const keys = Object.keys(vec).filter((k) => k.startsWith(g + ":"));
    if (!keys.length) continue;
    const p = softmax(keys.map(sim));
    out[g] = Object.fromEntries(keys.map((k, i) => [k.split(":")[1], p[i]]));
  }
  return out;
}

// 옷 사진(투명 배경 누끼) → { types:[{id,p}], pattern:{id,p}, thick: 0~1, sleeve:[{id,p}], leg:[{id,p}], rot: 0|90|180|270 }
// 옷이 옆으로 누워 찍혀도 맞히도록 네 방향으로 돌려 보고 평균을 내요. rot = 가장 똑바로 보이는 방향.
export async function classify(cut, onProgress, { onWhite, rotate }) {
  await loadClip(onProgress);
  const runs = [];
  for (const deg of [0, 90, 180, 270]) runs.push({ deg, p: await probs(onWhite(rotate(cut, deg))) });
  const avg = (g) => { if (!runs[0].p[g]) return []; const o = {}; for (const r of runs) for (const [k, v] of Object.entries(r.p[g])) o[k] = (o[k] || 0) + v / runs.length; return Object.entries(o).map(([id, p]) => ({ id, p })).sort((a, b) => b.p - a.p); };
  const types = avg("type"), best = types[0].id;
  const rot = runs.reduce((a, b) => (b.p.type[best] > a.p.type[best] ? b : a)).deg;
  return { types, pattern: avg("pat")[0], thick: avg("thick").find((x) => x.id === "thick").p, sleeve: avg("sleeve"), leg: avg("leg"), rot };
}
