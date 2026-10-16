// 추천 계산: 날씨 → 필요한 따뜻함 → 내 옷장에서 고르기, 그리고 기록으로 나에게 맞추기
import { CATS, TYPES, typeOf, lenOf, lenKind, hemOf, lenWarmAdj, sheerAdj, canInner, canShirtOuter, SHIRT_BASE, layers, colorLum, patternClash } from "./catalog.js";

// ---------- 따뜻함 점수 ----------
// 옷 하나의 따뜻함 = 두께(1~5) × 부위 무게. 겉옷이 제일 커요.
// 길이도 반영: 기본보다 길면(반팔 셔츠 → 긴팔 셔츠) 조금 더 따뜻해요. 비치는 옷은 조금 덜 따뜻해요.
//  셔츠를 겉옷 대신 걸쳐도 상의 무게(1.0) 그대로예요 (자켓보다 얇으니까)
export const itemWarmth = (it) => Math.max(0.5, (it.warm || typeOf(it.type).warm) + lenWarmAdj(it) + sheerAdj(it)) * CATS[typeOf(it.type).cat].weight;
export const outfitWarmth = (list) => list.reduce((s, it) => s + itemWarmth(it), 0);

// 보통 사람 기준: 체감 온도(°C) → 필요한 따뜻함
//  28° ≈ 반팔+반바지(2), 20° ≈ 긴팔+청바지(5.5), 10° ≈ 니트+트렌치(10.5), 0° ≈ 니트+패딩+목도리(15.5)
export const base = (t) => Math.max(1.8, 15.5 - 0.5 * t);
export const WARM_PER_DEG = 0.5;

// 느낌 → 그날 "딱 맞았을" 따뜻함과의 차이
//  "조금 추웠어요 / 살짝 더웠어요"는 절반쯤 (1.2)
export const FEEL = {
  cold: { ko: "추웠어요", short: "추움", emoji: "🥶", delta: +2.5, score: 1 },
  cool: { ko: "조금 추웠어요", short: "조금 추움", emoji: "😬", delta: +1.2, score: 0.5 },
  good: { ko: "딱 좋았어요", short: "딱 좋음", emoji: "😊", delta: 0, score: 0 },
  warm: { ko: "살짝 더웠어요", short: "살짝 더움", emoji: "😅", delta: -1.2, score: -0.5 },
  hot:  { ko: "더웠어요", short: "더움", emoji: "🥵", delta: -2.5, score: -1 },
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
  const v = Object.values(slots).filter((f) => FEEL[f]).map((f) => FEEL[f].score);
  if (!v.length) return null;
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return m >= 0.75 ? "cold" : m >= 0.25 ? "cool" : m <= -0.75 ? "hot" : m <= -0.25 ? "warm" : "good";
}

const SHORT = { cold: "추울 수 있어요", cool: "살짝 시원", good: "딱 맞아요", warm: "살짝 따뜻", hot: "더울 수 있어요" };
// 코디 하나를 시간대마다 평가해요. 겉옷이 있으면 "벗으면 나아지는지"도 봐요.
//  결과: { rows:[{…시간대, cls, word, off}], tip }
export function evalSlots(list, slots, m) {
  const W = outfitWarmth(list), outer = layers(list).outer;   // 티셔츠 위에 걸친 셔츠도 '겉옷'으로 봐요
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
  // 반바지·짧은 치마·짧은 원피스, 민소매(상의·원피스), 샌들은 더운 날만 (무릎 기장은 상관없어요)
  if (id === "sandals" || (lenKind(it.type) === "leg" && lenOf(it) === "short") || hemOf(it) === "short") return t >= 20;
  if (lenOf(it) === "sleeveless" && typeOf(it.type).cat !== "outer") return t >= 20;
  if (id === "padding") return t <= 10;
  if (id === "coat") return t <= 15;
  if (id === "boots") return t <= 13;
  if (["scarf", "beanie", "gloves"].includes(id)) return t <= 8;
  if (typeOf(it.type).cat === "outer") return t <= 25;
  return true;
}

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

// 따뜻함 차이 → 벌점. 추운 것보다 조금 더운 게 나아요
const miss = (d) => d * d + (d < 0 ? 0.4 * d * d : 0);

// 결과: [{ items:[…], W, cost }] 좋은 순서
//  slots: [{ T, want }] 아침·낮·저녁 (두 개 이상이면 시간대마다 따져요)
//   → 시간대마다 '겉옷 입기 / 벗기' 중 나은 쪽으로 점수를 내서, 일교차 큰 날엔 아침저녁 입고 낮에 벗기 좋은 조합을 골라요.
//   → 셔츠는 티셔츠·나시·원피스 위에 걸쳐서 겉옷 대신으로도 골라요.
//   → 무늬가 같은 옷끼리(체크 원피스 + 체크 겉옷 등)는 안 골라요. 그런 조합밖에 없을 때만 보여 줘요.
//   → '이너 필요'인 상의·원피스엔 옷장의 나시·반팔 티셔츠를 안에 같이 골라요(밝은 옷엔 밝은 이너, 어두운 옷엔 어두운 이너).
export function recommend({ items, t, want, date, recent = new Set(), skip = new Set(), slots = null }) {
  const bySlot = slots && slots.length >= 2;
  const usable = items.filter((it) => !it.away && !skip.has(it.id));
  const ok = usable.filter((it) => allowed(it, t));
  const by = (cat) => ok.filter((it) => typeOf(it.type).cat === cat);
  const tops = by("top"), bottoms = by("bottom"), dresses = by("dress"), outers = by("outer"), shoes = by("shoes"), accs = by("acc");
  const shirtOuters = t <= 28 ? tops.filter(canShirtOuter) : [];
  // 이너는 겉에 안 보이니까 나시도 날씨와 상관없이 써요
  const inners = usable.filter((it) => typeOf(it.type).cat === "top" && canInner(it));
  const pickInner = (main) => {
    // 민소매 옷 안엔 나시만, 밝기가 비슷한 걸로 (밝은 옷엔 누드·베이지를 조금 더 좋아해요)
    const l = colorLum(main.color), sl = lenOf(main) === "sleeveless";
    const c = inners.filter((x) => x.id !== main.id && (!sl || typeOf(x.type).id === "sleeveless"));
    const score = (x) => Math.abs(colorLum(x.color) - l) + (typeOf(x.type).id === "sleeveless" ? 0 : 0.15) - (l > 0.6 && x.color === "베이지" ? 0.2 : 0);
    return c.sort((a, b) => score(a) - score(b))[0] || null;
  };
  const bases = [];
  for (const a of tops) for (const b of bottoms) bases.push([a, b]);
  for (const d of dresses) bases.push([d]);
  if (!bases.length) return [];
  const res = [], clashed = [];
  for (const bse of bases) {
    const main = bse[0], needer = main.inner ? main : null;
    const inner = needer ? pickInner(needer) : null;
    const core = inner ? [main, inner, ...bse.slice(1)] : [...bse];
    // 셔츠를 걸칠 수 있는 건 티셔츠·나시(같은 옷 말고)나 원피스 위
    const canShirt = typeOf(main.type).cat === "dress" || SHIRT_BASE.includes(typeOf(main.type).id);
    const outerOpts = [null, ...outers, ...(canShirt ? shirtOuters.filter((s) => s.id !== main.id) : [])];
    for (const o of outerOpts) {
      let list = o ? [...core, o] : [...core];
      const shirtO = o && typeOf(o.type).cat === "top", hotPen = shirtO ? 1 : 3;   // 더운 날 겉옷 벌점 (셔츠는 가볍게)
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
          if (used.has(a.type) || patternClash([...list, a], [inner])) continue;   // 체크 코트에 체크 목도리도 피해요
          if (Math.abs(W + itemWarmth(a) - want) < Math.abs(W - want)) { list.push(a); W += itemWarmth(a); used.add(a.type); }
        }
      }
      let cost;
      if (bySlot) {
        // 시간대마다 벌점: 겉옷이 있으면 벗는 것도 해 봐요(벗고 들고 다니는 수고 0.3)
        const ow = o ? itemWarmth(o) : 0;
        const cs = slots.map((s) => Math.min(miss(W - s.want), o ? miss(W - ow - s.want) + 0.3 : Infinity));
        cost = 0.7 * (cs.reduce((a, b) => a + b, 0) / cs.length) + 0.3 * Math.max(...cs);   // 평균 + 가장 안 맞는 때도 조금
        if (o && Math.min(...slots.map((s) => s.T)) >= 23) cost += hotPen;
      } else {
        cost = miss(W - want);
        if (o && t >= 23) cost += hotPen;
      }
      if (needer && !inner) cost += 0.5;   // 이너가 필요한데 옷장에 맞는 이너가 없으면 조금 덜
      for (const it of list) if (recent.has(it.id) && typeOf(it.type).cat !== "shoes" && it !== inner) cost += 1.2;   // 최근 2일 안에 입은 옷은 조금 덜
      cost += hash(date + list.map((x) => x.id).join()) * 0.8;   // 같은 날엔 같은 순서, 날마다 조금씩 다르게
      (patternClash(list, [inner]) ? clashed : res).push({ items: list, W, cost, key: bse.map((x) => x.id).join() });
    }
  }
  if (!res.length) res.push(...clashed);   // 옷장에 무늬 옷뿐이면 어쩔 수 없이
  res.sort((a, b) => a.cost - b.cost);
  // 비슷한 코디(겉옷만 같은 걸 줄줄이) 너무 많지 않게: 상의+하의 조합이 같으면 2개까지만
  const seen = {}, out = [];
  for (const r of res) {
    if ((seen[r.key] = (seen[r.key] || 0) + 1) > 2) continue;
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
