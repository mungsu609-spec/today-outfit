// 추천 계산: 날씨 → 필요한 따뜻함 → 내 옷장에서 고르기, 그리고 기록으로 나에게 맞추기
import { CATS, TYPES, typeOf } from "./catalog.js";

// ---------- 따뜻함 점수 ----------
// 옷 하나의 따뜻함 = 두께(1~5) × 부위 무게. 겉옷이 제일 커요.
export const itemWarmth = (it) => (it.warm || typeOf(it.type).warm) * CATS[typeOf(it.type).cat].weight;
export const outfitWarmth = (list) => list.reduce((s, it) => s + itemWarmth(it), 0);

// 보통 사람 기준: 체감 온도(°C) → 필요한 따뜻함
//  28° ≈ 반팔+반바지(2), 20° ≈ 긴팔+청바지(5.5), 10° ≈ 니트+트렌치(10.5), 0° ≈ 니트+패딩+목도리(15.5)
export const base = (t) => Math.max(1.8, 15.5 - 0.5 * t);
export const WARM_PER_DEG = 0.5;

// 느낌 → 그날 "딱 맞았을" 따뜻함과의 차이
export const FEEL = {
  cold: { ko: "추웠어요", emoji: "🥶", delta: +2.5 },
  good: { ko: "딱 좋았어요", emoji: "😊", delta: 0 },
  hot:  { ko: "더웠어요", emoji: "🥵", delta: -2.5 },
};

// ---------- 나에게 맞추기 ----------
// 기록마다 "딱 맞았을 따뜻함 - 보통 기준"을 구해서, 그 차이를 c + d×(온도-15) 로 맞춰요.
//  c: 평소에 얼마나 더(덜) 따뜻하게 입어야 하는지,  d: 추운 날·더운 날 차이가 다른 정도
//  기록이 적으면 0 쪽으로 끌어당겨서(믿을 만큼만 반영) 처음엔 보통 기준과 거의 같아요.
//  아침·낮·저녁을 따로 누른 날은 시간대마다 점 하나(그 시간대 체감 온도)로 봐요. 하루에 점이 여러 개라 하나씩은 조금 덜 믿어요.
export function fit(logs, itemsById, today = new Date()) {
  let swx = 0, sw = 0, swxx = 0, swy = 0, swxy = 0, n = 0;
  for (const g of logs) {
    const pts = feelPoints(g);
    if (!pts.length) continue;
    const list = (g.items || []).map((id) => itemsById[id]).filter(Boolean);
    const W = list.length && list.length === (g.items || []).length ? outfitWarmth(list) : g.W;
    if (W == null) continue;
    const age = (today - new Date(g.date)) / 864e5;
    const w = Math.pow(0.5, Math.max(0, age) / 60) / Math.sqrt(pts.length);   // 60일 지난 기록은 절반만 믿어요
    for (const [T, feel] of pts) {
      const x = T - 15, y = W + FEEL[feel].delta - base(T);
      sw += w; swx += w * x; swxx += w * x * x; swy += w * y; swxy += w * x * y;
    }
    n++;
  }
  const lc = 1.5, ld = 400;   // 끌어당기는 힘
  const a = sw + lc, b = swx, c2 = swxx + ld, det = a * c2 - b * b;
  const c = (swy * c2 - b * swxy) / det, d = (a * swxy - b * swy) / det;
  return { c, d, n };
}

export const target = (t, m) => Math.max(1.5, base(t) + m.c + m.d * (t - 15));
// 보통 사람과 비교해서 몇 도 더 춥게(+) / 덥게(-) 느끼는지
export const degOffset = (t, m) => (m.c + m.d * (t - 15)) / WARM_PER_DEG;

// ---------- 날씨 정리 ----------
// 외출 시간대 체감 온도: 평균 60% + 가장 추울 때 40% (아침·저녁 쌀쌀함도 챙기려고)
export function dayFeel(hours) {
  const a = hours.map((h) => h.feel);
  const mean = a.reduce((s, x) => s + x, 0) / a.length, min = Math.min(...a), max = Math.max(...a);
  return { T: 0.6 * mean + 0.4 * min, min, max, mean };
}

// ---------- 아침·낮·저녁 ----------
export const SLOTS = [
  { id: "morning", ko: "아침", emoji: "🌅", from: 0, to: 11 },
  { id: "noon", ko: "낮", emoji: "☀️", from: 12, to: 16 },
  { id: "evening", ko: "저녁", emoji: "🌙", from: 17, to: 23 },
];

// 외출 시간대 시간별 날씨 → 시간대별 체감 (외출 시간에 없는 시간대는 빠져요)
//  한 시간대 안에서는 평균 70% + 가장 추울 때 30%
export function slotFeels(hours) {
  return SLOTS.map((s) => {
    const hs = hours.filter((h) => h.hr >= s.from && h.hr <= s.to);
    if (!hs.length) return null;
    const a = hs.map((h) => h.feel), mean = a.reduce((x, y) => x + y, 0) / a.length;
    return { ...s, start: hs[0].hr, end: hs[hs.length - 1].hr, T: 0.7 * mean + 0.3 * Math.min(...a) };
  }).filter(Boolean);
}

// 기록 하나 → [[체감 온도, 느낌], …]  (시간대별로 누른 게 있으면 그것, 없으면 하루 전체)
export function feelPoints(g) {
  const pts = Object.entries(g.slots || {}).filter(([k, f]) => FEEL[f] && g.slotT?.[k] != null).map(([k, f]) => [g.slotT[k], f]);
  if (pts.length) return pts;
  return g.feel && FEEL[g.feel] && g.T != null ? [[g.T, g.feel]] : [];
}

// 시간대별 느낌 → 하루 전체 느낌 (목록·그래프에 보여 줄 때)
export function overallFeel(slots = {}) {
  const v = Object.values(slots).filter((f) => FEEL[f]).map((f) => (f === "cold" ? 1 : f === "hot" ? -1 : 0));
  if (!v.length) return null;
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return m >= 0.3 ? "cold" : m <= -0.3 ? "hot" : "good";
}

const SHORT = { cold: "추울 수 있어요", cool: "살짝 시원", good: "딱 맞아요", warm: "살짝 따뜻", hot: "더울 수 있어요" };
// 코디 하나를 시간대마다 평가해요. 겉옷이 있으면 "벗으면 나아지는지"도 봐요.
//  결과: { rows:[{…시간대, cls, word, off}], tip }
export function evalSlots(list, slots, m) {
  const W = outfitWarmth(list), outer = list.find((it) => typeOf(it.type).cat === "outer");
  const rows = slots.map((s) => {
    const diff = W - target(s.T, m), cls = fitWord(diff)[1];
    // 겉옷을 벗었을 때 더 맞으면 off: true
    const d2 = outer ? diff - itemWarmth(outer) : null;
    const off = outer != null && diff > 0.9 && Math.abs(d2) < Math.abs(diff);
    return { ...s, diff, cls, word: SHORT[cls], off, offGood: off && Math.abs(d2) <= 0.9 };
  });
  const names = (rs) => rs.map((r) => r.ko).join("·");
  const tips = [];
  const offs = rows.filter((r) => r.off), on = rows.filter((r) => !r.off);
  const cold = on.filter((r) => r.cls === "cold" || r.cls === "cool");
  const hot = on.filter((r) => r.cls === "hot" || r.cls === "warm");
  if (offs.length && on.length) tips.push(`${names(offs)}엔 겉옷을 벗으면 ${offs.every((r) => r.offGood) ? "딱 좋아요" : "한결 나아요"}`);
  else if (offs.length) tips.push("겉옷 없이도 괜찮은 날이에요");
  if (cold.length) tips.push(`${names(cold)}엔 ${cold.some((r) => r.cls === "cold") ? "추울 수 있어요" : "살짝 쌀쌀해요"}${outer ? "" : " — 얇은 겉옷을 챙기면 좋아요"}`);
  if (hot.length) tips.push(`${names(hot)}엔 ${hot.some((r) => r.cls === "hot") ? "더울 수 있어요" : "살짝 따뜻해요"}`);
  if (!tips.length) tips.push(`${rows.length > 2 ? "아침부터 저녁까지" : names(rows) + " 모두"} 잘 맞아요`);
  return { rows, tip: tips.join(" · ") };
}

// ---------- 옷장에서 고르기 ----------
// 너무 안 어울리는 날씨면 아예 빼요
function allowed(it, t) {
  const id = typeOf(it.type).id;
  if (["shorts", "sleeveless", "sandals"].includes(id)) return t >= 20;
  if (id === "padding") return t <= 10;
  if (id === "coat") return t <= 15;
  if (id === "boots") return t <= 13;
  if (["scarf", "beanie", "gloves"].includes(id)) return t <= 8;
  if (typeOf(it.type).cat === "outer") return t <= 25;
  return true;
}

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

// 결과: [{ items:[…], W, cost }] 좋은 순서
export function recommend({ items, t, want, date, recent = new Set(), skip = new Set() }) {
  const ok = items.filter((it) => !it.away && !skip.has(it.id) && allowed(it, t));
  const by = (cat) => ok.filter((it) => typeOf(it.type).cat === cat);
  const tops = by("top"), bottoms = by("bottom"), dresses = by("dress"), outers = by("outer"), shoes = by("shoes"), accs = by("acc");
  const bases = [];
  for (const a of tops) for (const b of bottoms) bases.push([a, b]);
  for (const d of dresses) bases.push([d]);
  if (!bases.length) return [];
  const outerOpts = [null, ...outers];
  const res = [];
  for (const bse of bases) {
    for (const o of outerOpts) {
      let list = o ? [...bse, o] : [...bse];
      let W = outfitWarmth(list);
      // 신발: 남은 차이를 가장 잘 메우는 것
      if (shoes.length) {
        let best = null, bc = Infinity;
        for (const s of shoes) { const d = W + itemWarmth(s) - want; const cc = d * d + (recent.has(s.id) ? 0.2 : 0); if (cc < bc) { bc = cc; best = s; } }
        list.push(best); W += itemWarmth(best);
      }
      // 소품: 아주 추운 날에만, 더해서 나아지면 하나씩 (같은 종류는 하나만)
      if (want >= 14) {
        const used = new Set();
        for (const a of [...accs].sort((x, y) => itemWarmth(y) - itemWarmth(x))) {
          if (used.has(a.type)) continue;
          if (Math.abs(W + itemWarmth(a) - want) < Math.abs(W - want)) { list.push(a); W += itemWarmth(a); used.add(a.type); }
        }
      }
      const diff = W - want;
      let cost = diff * diff + (diff < 0 ? 0.4 * diff * diff : 0);   // 추운 것보다 조금 더운 게 나아요
      if (o && t >= 23) cost += 3;
      for (const it of list) if (recent.has(it.id) && typeOf(it.type).cat !== "shoes") cost += 1.2;   // 최근 2일 안에 입은 옷은 조금 덜
      cost += hash(date + list.map((x) => x.id).join()) * 0.8;   // 같은 날엔 같은 순서, 날마다 조금씩 다르게
      res.push({ items: list, W, cost });
    }
  }
  res.sort((a, b) => a.cost - b.cost);
  // 비슷한 코디(겉옷만 같은 걸 줄줄이) 너무 많지 않게: 상의+하의 조합이 같으면 2개까지만
  const seen = {}, out = [];
  for (const r of res) {
    const k = r.items.filter((x) => ["top", "bottom", "dress"].includes(typeOf(x.type).cat)).map((x) => x.id).join();
    if ((seen[k] = (seen[k] || 0) + 1) > 2) continue;
    out.push(r);
    if (out.length >= 15) break;
  }
  return out;
}

// 옷장이 비었거나 모자랄 때 글로 알려 주는 기본 추천
export function genericOutfit(want) {
  const L = [
    [3.5, "반팔 티셔츠 + 반바지·얇은 치마 + 샌들"],
    [6, "반팔이나 얇은 긴팔 + 긴 바지"],
    [8, "긴팔 티셔츠·셔츠 + 얇은 가디건이나 바람막이"],
    [10, "맨투맨·니트 + 자켓이나 가디건"],
    [12, "니트 + 트렌치코트·자켓"],
    [14, "니트 + 코트"],
    [16.5, "두꺼운 니트 + 코트나 얇은 패딩 + 목도리"],
    [99, "두꺼운 니트 + 패딩 + 목도리·장갑"],
  ];
  return L.find(([w]) => want < w)[1];
}

// 차이 → 한마디
export function fitWord(diff) {
  if (diff < -2) return ["좀 추울 수 있어요", "cold"];
  if (diff < -0.9) return ["살짝 시원할 수 있어요", "cool"];
  if (diff > 2) return ["좀 더울 수 있어요", "hot"];
  if (diff > 0.9) return ["살짝 따뜻할 수 있어요", "warm"];
  return ["딱 맞을 거예요", "good"];
}

export { TYPES };
