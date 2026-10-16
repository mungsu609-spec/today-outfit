// 기본 옷 그림 (나시·반팔·긴팔 티셔츠) — 고른 색으로 그때그때 그려요.
//  basicSvg(kind, "#색") → svg 글자,  basicCanvas(kind, "#색") → 저장용 canvas
//  미리 보기: 도구/basics.html

export const BASIC_KINDS = [
  { id: "tank", type: "sleeveless", ko: "나시" },
  { id: "tee",  type: "tee_s",      ko: "반팔 티셔츠" },
  { id: "long", type: "tee_l",      ko: "긴팔 티셔츠" },
];
// 예전 기본 옷(색마다 따로 있던 것) → 새 이름
export const OLD_BASIC = { "tank-black": "tank:검정", "tank-white": "tank:흰색", "tank-nude": "tank:베이지", "tee-black": "tee:검정", "tee-white": "tee:흰색" };

// 옷 모양 (1024 × 1024, 가운데 x=512, 왼쪽·오른쪽이 똑같아요)
//  body: 바깥 모양(위쪽은 뒤판 목선), neck: 앞판 목선 안쪽(뒤판 안감이 보이는 곳)
const SHAPES = {
  tee: {
    body: "M430 172 Q512 196 594 172 L722 202 C772 244 824 302 852 354 L766 422 C744 400 726 386 708 378 C712 520 712 700 710 836 Q512 858 314 836 C312 700 312 520 316 378 C298 386 280 400 258 422 L172 354 C200 302 252 244 302 202 Z",
    neck: "M430 172 Q512 196 594 172 C580 246 444 246 430 172 Z",
    neckLine: "M430 172 C444 246 580 246 594 172",
    neckStitch: "M436 200 C452 268 572 268 588 200",
    sleeves: ["M302 202 L172 354 L258 422 C280 400 298 386 316 378 C312 300 308 248 302 202 Z",
              "M722 202 L852 354 L766 422 C744 400 726 386 708 378 C712 300 716 248 722 202 Z"],
    seams: ["M316 378 C312 300 308 248 302 202", "M708 378 C712 300 716 248 722 202"],
    cuffStitch: ["M170 325 L288 417", "M854 325 L736 417"],
    hem: "M314 812 Q512 834 710 812",
    under: [[316, 378], [708, 378]],
    folds: ["M370 470 Q390 640 366 820", "M656 500 Q638 660 662 820", "M500 300 Q526 520 506 760"],
  },
  long: {
    body: "M430 172 Q512 196 594 172 L722 202 C782 248 840 420 872 620 L890 744 L794 762 L782 650 C762 520 730 430 708 394 C712 540 712 700 710 836 Q512 858 314 836 C312 700 312 540 316 394 C294 430 262 520 242 650 L230 762 L134 744 L152 620 C184 420 242 248 302 202 Z",
    neck: "M430 172 Q512 196 594 172 C580 246 444 246 430 172 Z",
    neckLine: "M430 172 C444 246 580 246 594 172",
    neckStitch: "M436 200 C452 268 572 268 588 200",
    sleeves: ["M302 202 C242 248 184 420 152 620 L134 744 L230 762 L242 650 C262 520 294 430 316 394 C308 320 304 250 302 202 Z",
              "M722 202 C782 248 840 420 872 620 L890 744 L794 762 L782 650 C762 520 730 430 708 394 C716 320 720 250 722 202 Z"],
    seams: ["M316 394 C308 320 304 250 302 202", "M708 394 C716 320 720 250 722 202"],
    cuffs: ["M140 700 L235 716 L230 762 L134 744 Z", "M884 700 L789 716 L794 762 L890 744 Z"],
    hem: "M314 812 Q512 834 710 812",
    under: [[316, 396], [708, 396]],
    folds: ["M370 480 Q390 640 366 820", "M656 510 Q638 660 662 820", "M500 300 Q526 520 506 760", "M196 520 Q210 600 190 690", "M828 520 Q814 600 834 690"],
  },
  tank: {
    body: "M400 150 L434 150 Q512 214 590 150 L624 150 C630 300 672 382 724 402 C728 560 724 720 728 840 Q512 862 296 840 C300 720 296 560 300 402 C352 382 394 300 400 150 Z",
    neck: "M434 150 Q512 214 590 150 C582 270 548 320 512 320 C476 320 442 270 434 150 Z",
    neckLine: "M434 150 C442 270 476 320 512 320 C548 320 582 270 590 150",
    neckStitch: "M448 160 C456 282 488 336 512 336 C536 336 568 282 576 160",
    arms: ["M400 150 C394 300 352 382 300 402", "M624 150 C630 300 672 382 724 402"],
    hem: "M298 816 Q512 838 726 816",
    under: [[300, 406], [724, 406]],
    folds: ["M360 480 Q380 640 352 820", "M664 500 Q646 660 672 820", "M500 360 Q524 560 504 770"],
  },
};

// 색 계산: hex → [r,g,b], 섞기, 밝기
const rgb = (h) => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const hex = (a) => "#" + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (c, to, t) => hex(rgb(c).map((v, i) => v + (to[i] - v) * t));
const lum = (c) => { const [r, g, b] = rgb(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
const BLACK = [0, 0, 0], WHITE = [255, 255, 255];

export function basicSvg(kind, color, id = "b") {
  const S = SHAPES[kind] || SHAPES.tee;
  const L = lum(color), dark = L < 0.3;
  // 어두운 옷은 밝은 쪽으로, 밝은 옷은 어두운 쪽으로 무늬(바느질·골지)를 넣어요
  const rib = dark ? mix(color, WHITE, 0.07) : mix(color, BLACK, 0.06);
  const inside = dark ? mix(color, WHITE, 0.05) : mix(color, BLACK, 0.1);
  const edge = dark ? mix(color, WHITE, 0.16) : mix(color, BLACK, L > 0.85 ? 0.2 : 0.28);
  const stitch = dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.16)";
  const shade = dark ? 0.35 : L > 0.85 ? 0.09 : 0.16;   // 가장자리·겨드랑이 그늘 진하기
  const glow = dark ? 0.09 : 0.07;                      // 가운데 빛
  const s = (d, w, c, more = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${more}/>`;
  const dash = `stroke-dasharray="7 9"`;
  const sleeveClip = (S.sleeves || []).map((d, i) => `<clipPath id="${id}sl${i}"><path d="${d}"/></clipPath>`).join("");
  let details = "";
  if (S.sleeves) details += S.sleeves.map((d) => `<path d="${d}" fill="#000" opacity="${dark ? 0.12 : 0.035}"/>`).join("");
  if (S.cuffs) details += S.cuffs.map((d) => `<path d="${d}" fill="${rib}"/>${s(d, 2, stitch)}`).join("");
  if (S.cuffStitch) details += S.cuffStitch.map((d, i) => `<g clip-path="url(#${id}sl${i})">${s(d, 2.5, stitch, dash)}</g>`).join("");
  if (S.seams) details += S.seams.map((d) => s(d, 3, stitch)).join("");
  if (S.arms) details += S.arms.map((d) => s(d, 14, rib) + s(d, 2.5, stitch, `${dash} transform="translate(${d.includes("M400") ? 14 : -14} 0)"`)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
<defs>
  <clipPath id="${id}c"><path d="${S.body}"/></clipPath>${sleeveClip}
  <linearGradient id="${id}h" gradientUnits="userSpaceOnUse" x1="140" y1="0" x2="884" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity="${shade}"/><stop offset=".26" stop-color="#000" stop-opacity="0"/>
    <stop offset=".5" stop-color="#fff" stop-opacity="${glow}"/><stop offset=".74" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="${shade}"/></linearGradient>
  <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="${glow}"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="${shade * 0.6}"/></linearGradient>
  <radialGradient id="${id}u"><stop offset="0" stop-color="#000" stop-opacity="${shade * 1.1}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <filter id="${id}s" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity=".16"/></filter>
  <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="${id}n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 ${dark ? 0.1 : 0.07} 0"/></filter>
</defs>
<path d="${S.body}" fill="${color}" filter="url(#${id}s)"/>
<g clip-path="url(#${id}c)">
  ${details}
  <g fill="none" stroke="#000" stroke-opacity="${shade * 0.5}" stroke-width="46" stroke-linecap="round" filter="url(#${id}b)">${S.folds.map((d) => `<path d="${d}"/>`).join("")}</g>
  ${S.under.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 30}" rx="70" ry="110" fill="url(#${id}u)"/>`).join("")}
  <rect width="1024" height="1024" fill="url(#${id}h)"/>
  <rect width="1024" height="1024" fill="url(#${id}v)"/>
  <rect width="1024" height="1024" filter="url(#${id}n)" style="mix-blend-mode:overlay"/>
  <path d="${S.neck}" fill="${inside}"/>
  ${s(S.neckLine, 26, rib)}
  ${s(S.neckStitch, 2.5, stitch, dash)}
  ${s(S.hem, 2.5, stitch, dash)}
</g>
<path d="${S.body}" fill="none" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>
${s(S.neckLine, 2.5, edge)}
</svg>`;
}

export const basicUrl = (kind, color) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(basicSvg(kind, color));

// 저장용 canvas (size × size, 배경 없음)
export function basicCanvas(kind, color, size = 840) {
  return new Promise((ok, bad) => {
    const img = new Image();
    img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = size; c.getContext("2d").drawImage(img, 0, 0, size, size); ok(c); };
    img.onerror = bad;
    img.src = basicUrl(kind, color);
  });
}
