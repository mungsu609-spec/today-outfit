// 사진 다루기: 파일 → canvas, 누끼 다듬기, 저장용 작은 그림, 대표 색 찾기

const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

// 고른 사진 파일 → canvas (긴 쪽 max px로 줄임, 폰 사진 회전도 바로잡혀요)
export async function fileToCanvas(file, max = 1280) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = mk(bmp.width * k, bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return c;
}

// 배경이 투명한 canvas → 옷이 있는 네모 범위 {x0,y0,x1,y1} (못 찾으면 null)
//  alpha: 이만큼 진해야 옷으로 봐요, frac: 줄마다 옷 픽셀이 (가장 많은 줄의) 이만큼은 있어야 해요 (점 같은 찌꺼기 무시)
export function bbox(src, { alpha = 128, frac = 0.03 } = {}) {
  const { width: w, height: h } = src, d = src.getContext("2d").getImageData(0, 0, w, h).data;
  const rows = new Uint32Array(h), cols = new Uint32Array(w);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > alpha) { rows[y]++; cols[x]++; }
  const minR = Math.max(2, Math.max(...rows) * frac), minC = Math.max(2, Math.max(...cols) * frac);
  const y0 = rows.findIndex((v) => v >= minR), y1 = h - 1 - [...rows].reverse().findIndex((v) => v >= minR);
  const x0 = cols.findIndex((v) => v >= minC), x1 = w - 1 - [...cols].reverse().findIndex((v) => v >= minC);
  return y0 < 0 || x0 < 0 ? null : { x0, y0, x1, y1 };
}

// 배경이 투명한 canvas → 옷 부분만 남게 잘라요 (가장자리 여유 4%) — AI가 옷을 알아볼 때 써요
export function cutout(src) {
  const b = bbox(src);
  if (!b) return src;   // 아무것도 못 찾으면 그대로
  let { x0, y0, x1, y1 } = b;
  const { width: w, height: h } = src;
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.04);
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
  const c = mk(x1 - x0 + 1, y1 - y0 + 1);
  c.getContext("2d").drawImage(src, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
  return c;
}

// ---------- 사진 맞추기 (돌리기·기울이기·확대·옮기기) ----------
// 상태 st = { rot: 90° 단위 돌리기, tilt: 살짝 기울이기(°), z: 확대(1 = 사진 긴 쪽이 네모에 꽉), x, y: 가운데에서 옮긴 정도(네모 크기 1 기준) }
// 네모(size×size) 안에 보이는 그대로 그려요. 저장할 때도 같은 함수로 그려서 화면과 똑같이 나와요.
export function paintFrame(g, size, src, st, W = src.width, H = src.height) {
  const px = (st.z * size) / Math.max(W, H);
  g.clearRect(0, 0, size, size);
  g.save();
  g.translate(size / 2 + st.x * size, size / 2 + st.y * size);
  g.rotate(((st.rot + st.tilt) * Math.PI) / 180);
  g.scale(px, px);
  g.imageSmoothingQuality = "high";
  g.drawImage(src, -W / 2, -H / 2, W, H);
  g.restore();
}

// (x, y)를 deg만큼 돌리기 (canvas처럼 시계 방향)
export function turn(x, y, deg) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
}

// 처음 상태: 옷 범위(b)가 네모 가운데에 margin만큼 차게. 옷이 잘리지 않게 여유를 넉넉히 둬요.
export function fitState(W, H, b, rot = 0, margin = 0.86) {
  if (!b) return { rot, tilt: 0, z: 0.96, x: 0, y: 0 };
  const bw = b.x1 - b.x0 + 1, bh = b.y1 - b.y0 + 1, L = Math.max(W, H);
  const z = (margin * L) / Math.max(bw, bh), px = z / L;   // px: 사진 1픽셀 = 네모의 몇 배
  const [x, y] = turn((W / 2 - (b.x0 + bw / 2)) * px, (H / 2 - (b.y0 + bh / 2)) * px, rot);
  return { rot, tilt: 0, z, x, y };
}

// 그림 주소(dataURL) → canvas
export async function urlToCanvas(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = mk(img.naturalWidth, img.naturalHeight);
  c.getContext("2d").drawImage(img, 0, 0);
  return c;
}

// 시계 방향으로 deg(0·90·180·270)만큼 돌리기
export function rotate(src, deg) {
  if (!deg) return src;
  const side = deg % 180 !== 0, c = mk(side ? src.height : src.width, side ? src.width : src.height), g = c.getContext("2d");
  g.translate(c.width / 2, c.height / 2); g.rotate((deg * Math.PI) / 180);
  g.drawImage(src, -src.width / 2, -src.height / 2);
  return c;
}

// 투명 배경 → 흰 정사각형 가운데에 놓기 (AI가 가운데만 잘라 보지 않게)
export function onWhite(src, size = 320) {
  const c = mk(size, size), g = c.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, size, size);
  const k = (size * 0.9) / Math.max(src.width, src.height);
  g.drawImage(src, (size - src.width * k) / 2, (size - src.height * k) / 2, src.width * k, src.height * k);
  return c;
}

export { mk };

// 저장용: 긴 쪽 max px, webp(안 되면 png). Firebase 한 칸(1MB) 안에 들어가게 줄여요.
export function toStored(src, max = 420) {
  for (let m = max; m >= 160; m -= 80) {
    const k = Math.min(1, m / Math.max(src.width, src.height)), c = mk(src.width * k, src.height * k);
    c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
    let url = c.toDataURL("image/webp", 0.82);
    if (!url.startsWith("data:image/webp")) url = c.toDataURL("image/png");
    if (url.length < 600_000) return url;
  }
  return null;
}

// ---------- 대표 색 ----------
function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

export function colorName(r, g, b) {
  const [h, s, l] = hsl(r, g, b);
  if (l < 0.16) return "검정";
  if (l > 0.9 && s < 0.5) return "흰색";
  if (s < 0.13 || (s < 0.2 && l < 0.3)) return l > 0.78 ? "흰색" : "회색";
  if (h >= 200 && h < 255 && l < 0.32) return "네이비";
  if (h >= 15 && h < 50 && s < 0.5 && l > 0.6) return "베이지";
  if (h >= 10 && h < 45 && l < 0.45) return "갈색";
  if (h >= 45 && h < 100 && s < 0.45 && l < 0.5) return "카키";
  if (h < 12 || h >= 340) return l > 0.7 ? "분홍" : "빨강";
  if (h < 40) return l > 0.75 ? "베이지" : "주황";
  if (h < 68) return "노랑";
  if (h < 165) return "초록";
  if (h < 200) return "하늘색";
  if (h < 255) return l > 0.65 ? "하늘색" : "파랑";
  if (h < 290) return "보라";
  return l > 0.55 ? "분홍" : "보라";
}

export const COLORS = { 검정: "#222", 흰색: "#fff", 회색: "#999", 네이비: "#1f2d4d", 베이지: "#e3d3b5", 갈색: "#7a5232", 카키: "#6b6b3a",
  빨강: "#d33", 분홍: "#f2a2b8", 주황: "#f08a3c", 노랑: "#f2d24b", 초록: "#3f9a5a", 하늘색: "#8cc7ef", 파랑: "#2f6fd6", 보라: "#8a5cc7", 여러색: "conic-gradient(#e44,#fd4,#4c6,#48f,#a5d,#e44)" };

// 누끼 canvas에서 가장 많은 색 이름
export function mainColor(src) {
  const k = Math.min(1, 96 / Math.max(src.width, src.height)), c = mk(src.width * k, src.height * k), g = c.getContext("2d");
  g.drawImage(src, 0, 0, c.width, c.height);
  const d = g.getImageData(0, 0, c.width, c.height).data, count = {};
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 200) continue;
    const name = colorName(d[i], d[i + 1], d[i + 2]);
    count[name] = (count[name] || 0) + 1; n++;
  }
  const list = Object.entries(count).sort((a, b) => b[1] - a[1]);
  if (!list.length) return "회색";
  // 1등이 35%도 안 되고 2·3등도 크면 여러 색
  if (list[0][1] / n < 0.35 && list.length > 2 && list[2][1] / n > 0.15) return "여러색";
  return list[0][0];
}
