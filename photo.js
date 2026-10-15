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

// 배경이 투명한 canvas → 옷 부분만 남게 잘라요 (가장자리 여유 4%)
export function cutout(src) {
  const { width: w, height: h } = src, d = src.getContext("2d").getImageData(0, 0, w, h).data;
  const rows = new Uint32Array(h), cols = new Uint32Array(w);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 128) { rows[y]++; cols[x]++; }
  // 점처럼 남은 작은 찌꺼기는 무시: 줄마다 옷 픽셀이 조금은 있어야 옷으로 봐요
  const minR = Math.max(2, Math.max(...rows) * 0.03), minC = Math.max(2, Math.max(...cols) * 0.03);
  let y0 = rows.findIndex((v) => v >= minR), y1 = h - 1 - [...rows].reverse().findIndex((v) => v >= minR);
  let x0 = cols.findIndex((v) => v >= minC), x1 = w - 1 - [...cols].reverse().findIndex((v) => v >= minC);
  if (y0 < 0 || x0 < 0) return src;   // 아무것도 못 찾으면 그대로
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.04);
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
  const c = mk(x1 - x0 + 1, y1 - y0 + 1);
  c.getContext("2d").drawImage(src, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
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
