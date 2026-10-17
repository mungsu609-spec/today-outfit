// 추천 계산: 날씨 → 필요한 따뜻함 → 내 옷장에서 고르기, 그리고 기록으로 나에게 맞추기
import { CATS, TYPES, typeOf, lenOf, lenKind, hemOf, lenWarmAdj, sheerAdj, canShirtOuter, SHIRT_BASE, layers, colorLum, patternClash, innerChoices, hasInnerPick, isHeatInner, HEAT_MAX, pointCount, seasonsOf, innerOnly, isHeatTop, isLegwear, stockingBase, STOCKING_MAX, isUnderTee } from "./catalog.js";

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
  const keep = bareArms(list);   // 민소매 옷 위의 겉옷은 벗으라고 하지 않아요
  const rows = slots.map((s) => {
    const diff = W - target(s.T, m), cls = fitWord(diff)[1];
    // 겉옷을 벗었을 때 더 맞으면 off: true
    const d2 = outer ? diff - itemWarmth(outer) : null;
    const off = outer != null && !keep && diff > 0.9 && Math.abs(d2) < Math.abs(diff);
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

// 민소매 옷(나시 같은 이너 말고 블라우스·원피스 등)은 혼자 입지 않아요 — 위에 소매 있는 겉옷·셔츠를 꼭 걸쳐요
//  안에 기본 티셔츠를 받쳐 입었으면 혼자 입은 게 아니에요
export const bareArms = (list) => { const L = layers(list); return !!L.sleeveMain && !L.under; };
const covers = (o) => !!o && lenOf(o) !== "sleeveless";   // 조끼처럼 소매 없는 겉옷은 안 쳐요

// ---------- 옷장에서 고르기 ----------
// 너무 안 어울리는 날씨면 아예 빼요
function allowed(it, t) {
  const id = typeOf(it.type).id;
  // 반바지·짧은 치마·짧은 원피스, 샌들은 더운 날만 (무릎 기장은 상관없어요)
  //  (민소매 상의·원피스는 늘 티셔츠를 받쳐 입거나 겉옷을 걸치니까 온도 제한이 없어요)
  if (id === "sandals" || (lenKind(it.type) === "leg" && lenOf(it) === "short") || hemOf(it) === "short") return t >= 20;
  if (id === "padding") return t <= 10;
  if (id === "coat") return t <= 15;
  if (id === "boots") return t <= 13;
  if (["scarf", "beanie", "gloves"].includes(id)) return t <= 8;
  if (typeOf(it.type).cat === "outer") return t <= 25;
  return true;
}

// 그날의 계절: 달로 정하고(6~8월 여름, 12~2월 겨울, 나머지 봄·가을), 날씨가 유난하면 더해요
//  (5월인데 23° 넘으면 여름 옷도, 11월인데 5° 아래면 겨울 옷도 OK)
export function daySeasons(date, t) {
  const m = +date.slice(5, 7), s = new Set();
  s.add(m >= 6 && m <= 8 ? "summer" : m === 12 || m <= 2 ? "winter" : "spring");
  if (t >= 23) s.add("summer");
  if (t <= 5) s.add("winter");
  return s;
}
// 여름용·겨울용으로만 정한 옷(봄·가을이 안 켜진 옷)은 그 계절에만 골라요. 봄·가을이 켜진 옷은 날씨로만 따져요.
const seasonOk = (it, season) => { const s = seasonsOf(it); return s.includes("spring") || s.some((x) => season.has(x)); };

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

// 따뜻함 차이 → 벌점. 추운 것보다 조금 더운 게 나아요
const miss = (d) => d * d + (d < 0 ? 0.4 * d * d : 0);

const sameSet = (a, b) => a.length === b.length && b.every((id) => a.includes(id));
// 코디 → 겉에 보이는 옷(상의·하의·원피스·겉옷) id들. '마음에 안 들어요'·최근 코디 비교에 써요 (이너·신발·소품은 빼요)
const MAIN = ["top", "bottom", "dress", "outer"];
//  (나시·히트텍·스타킹처럼 안에만 입는 옷도 빼요)
export const mainIds = (list, inner = layers(list).inner) => list.filter((x) => x && x !== inner && !innerOnly(x) && MAIN.includes(typeOf(x.type).cat)).map((x) => x.id);

// 결과: [{ items:[…], W, cost }] 좋은 순서
//  slots: [{ T, want }] 아침·낮·저녁 (두 개 이상이면 시간대마다 따져요)
//   → 시간대마다 '겉옷 입기 / 벗기' 중 나은 쪽으로 점수를 내서, 일교차 큰 날엔 아침저녁 입고 낮에 벗기 좋은 조합을 골라요.
//   → 셔츠는 티셔츠·원피스 위에 걸쳐서 겉옷 대신으로도 골라요.
//   → 무늬가 같은 옷끼리(체크 원피스 + 체크 겉옷 등)는 안 골라요. 그런 조합밖에 없을 때만 보여 줘요.
//   → '이너 필요'인 상의·원피스엔 옷장의 나시·반팔 티셔츠를 안에 같이 골라요(밝은 옷엔 밝은 이너, 어두운 옷엔 어두운 이너).
//     상의에 '어떤 이너'를 골라 뒀으면 그중에서 (히트텍은 쌀쌀한 날만).
//   → 포인트 옷은 한 코디에 하나만. 그런 조합밖에 없을 때만 보여 줘요.
//   → recentFits: 최근(5일 안) 입은 코디들 [옷 id Set] — 같은 코디는 되도록 다시 안 골라요.
//   → nope: '마음에 안 들어요'를 누른 코디들 [{ ids, full }] — 이너·신발·소품까지 똑같은 한 세트는 아예 안 골라요
//     (신발만 바꿔서 마음에 안 든 세트를 피할 수 있으면 다음 신발로). full이 없는 예전 기록은 겉에 보이는 옷만 비교해요.
//   → 여름용·겨울용으로만 정한 옷은 다른 계절엔 안 골라요(daySeasons).
//   → 민소매 옷(블라우스·원피스 등)은 소매 있는 겉옷·셔츠를 걸치거나 안에 기본 티셔츠를 받쳐 입은 코디로만.
//     겉옷만으로 가린 경우엔 낮에도 겉옷을 벗는 걸로 치지 않아요.
//   → 나시·히트텍·스타킹은 안에만 입어요: 혼자 상의·하의 자리엔 안 골라요.
//     히트텍 상의는 쌀쌀한 날(HEAT_MAX° 이하) 소매가 같거나 긴 옷 안에, 히트텍 하의는 긴 바지 안에 이너로,
//     치마·원피스·짧은 하의 밑엔 스타킹(STOCKING_MAX° 이하)이나 히트텍 하의(스타킹 대신)를 — 따뜻함이 맞으면 같이 골라요.
export function recommend({ items, t, want, date, recent = new Set(), recentFits = [], nope = [], skip = new Set(), slots = null }) {
  const bySlot = slots && slots.length >= 2;
  const nopeFull = nope.filter((n) => n.full).map((n) => n.ids), nopeMain = nope.filter((n) => !n.full).map((n) => n.ids);
  const usable = items.filter((it) => !it.away && !skip.has(it.id));
  const season = daySeasons(date, t);
  const ok = usable.filter((it) => allowed(it, t) && seasonOk(it, season));
  const by = (cat) => ok.filter((it) => typeOf(it.type).cat === cat);
  const tops = by("top").filter((it) => !innerOnly(it)), bottoms = by("bottom").filter((it) => !isLegwear(it)), dresses = by("dress"), outers = by("outer"), shoes = by("shoes"), accs = by("acc");
  const shirtOuters = t <= 28 ? tops.filter(canShirtOuter) : [];
  // 이너는 겉에 안 보이니까 나시도 날씨와 상관없이 써요 (히트텍만 쌀쌀한 날)
  //  후보마다 '어울림 벌점'(밝기 차이 등)을 붙여서, 따뜻함까지 같이 따져 고르게 해요.
  const innerOpts = (main) => {
    // 민소매 옷 안엔 나시만, 밝기가 비슷한 걸로 (밝은 옷엔 누드·베이지를 조금 더 좋아해요)
    const l = colorLum(main.color), sl = lenOf(main) === "sleeveless";
    const heat = !hasInnerPick(main) && t <= HEAT_MAX ? heatTops : [];   // 이너를 안 골라 둔 옷엔 쌀쌀한 날 옷장의 히트텍도
    const all = [...innerChoices(main, usable), ...heat].filter((x) => x.id !== main.id && !skip.has(x.id) && (!isHeatInner(x) || t <= HEAT_MAX));
    const c = sl && all.some((x) => typeOf(x.type).id === "sleeveless") ? all.filter((x) => typeOf(x.type).id === "sleeveless") : all;
    const score = (x) => Math.abs(colorLum(x.color) - l) + (typeOf(x.type).id === "sleeveless" || isHeatInner(x) ? 0 : 0.15) - (l > 0.6 && x.color === "베이지" ? 0.2 : 0);
    return c.map((x) => [x, score(x)]).sort((a, b) => a[1] - b[1]).slice(0, 3);
  };
  // 히트텍 상의: 비치지 않는 옷 안에도 (소매가 히트텍보다 짧은 옷 안엔 안 입어요)
  const RANK = { sleeveless: 0, short: 1, long: 2 };
  const heatTops = usable.filter((x) => isHeatTop(x) && !skip.has(x.id));
  const heatOpts = (main) => t > HEAT_MAX ? [] : heatTops.filter((x) => x.id !== main.id && RANK[lenOf(x) || "long"] <= RANK[lenOf(main) || "long"]).map((x) => [x, 0]);
  // 다리: 긴 바지 안엔 히트텍 하의, 치마·원피스·짧은 하의 밑엔 스타킹·히트텍 하의 (안 신는 것도 후보)
  //  색: 살구색·검정은 아무 데나, 그 밖엔 옷과 밝기가 비슷할수록 좋아요
  const legItems = usable.filter((x) => isLegwear(x) && !skip.has(x.id));
  const legOpts = (b) => {
    const sb = stockingBase(b), l = colorLum(b.color);
    const c = legItems.filter((x) => typeOf(x.type).id === "heat_bottom" ? t <= HEAT_MAX : sb && t <= STOCKING_MAX);
    const score = (x) => !sb ? 0 : x.color === "살구색" ? 0.05 : x.color === "검정" ? 0.1 : 0.1 + 0.3 * Math.abs(colorLum(x.color) - l);
    return [[null, 0], ...c.map((x) => [x, score(x)]).sort((a, b) => a[1] - b[1]).slice(0, 3)];
  };
  // 최근 입은 코디와 같은지: 겉에 보이는 옷(상의·하의·원피스·겉옷)만 비교해요
  const byItem = Object.fromEntries(items.map((x) => [x.id, x]));
  const fits = recentFits.map((s) => { const l = [...s].map((id) => byItem[id]).filter(Boolean); return mainIds(l, layers(l).inner); });
  const bases = [];
  // 나시는 이너로만 입어요 — 상의 자리(단독, 위에 셔츠만 걸친 것 포함)엔 안 골라요
  for (const a of tops) if (typeOf(a.type).id !== "sleeveless") for (const b of bottoms) bases.push([a, b]);
  for (const d of dresses) bases.push([d]);
  if (!bases.length) return [];
  const res = [], clashed = [];
  for (const bse of bases) {
    const main = bse[0], needer = main.inner ? main : null;
    // 민소매 옷이면 안에 기본 티셔츠(무지 반팔·긴팔)를 받쳐 입는 것도 후보 — 그러면 겉옷 없이도 OK
    const tees = lenOf(main) === "sleeveless" ? tops.filter((x) => x.id !== main.id && isUnderTee(x) && !x.inner).map((x) => [x, 0]) : [];
    const ins = needer ? [...innerOpts(needer), ...tees] : [[null, 0], ...heatOpts(main), ...tees];
    for (const [inner, innerCost] of ins.length ? ins : [[null, 0]]) {
    for (const [leg, legCost] of legOpts(bse[1] || main)) {
    const core = [main, ...(inner ? [inner] : []), ...bse.slice(1), ...(leg ? [leg] : [])];
    // 셔츠를 걸칠 수 있는 건 티셔츠(같은 옷 말고)나 원피스 위
    const canShirt = typeOf(main.type).cat === "dress" || SHIRT_BASE.includes(typeOf(main.type).id);
    const outerOpts = [null, ...outers, ...(canShirt ? shirtOuters.filter((s) => s.id !== main.id) : [])];
    const isTee = inner && isUnderTee(inner) && lenOf(main) === "sleeveless";   // 받쳐 입은 티셔츠는 겉에 보이는 옷으로 쳐요
    const bare = lenOf(main) === "sleeveless" && !isTee, hidden = isTee ? null : inner;
    for (const o of outerOpts) {
      if (bare && !covers(o)) continue;
      let list = o ? [...core, o] : [...core];
      const shirtO = o && typeOf(o.type).cat === "top", hotPen = shirtO ? 1 : 3;   // 더운 날 겉옷 벌점 (셔츠는 가볍게)
      const pre = list, W0 = outfitWarmth(list);
      let W = W0, found = false;
      // 신발: 남은 차이를 가장 잘 메우는 것부터 (마음에 안 든 세트가 되면 다음 신발)
      const hasPoint = pointCount(list, [hidden]) > 0;
      const shoeOpts = shoes.length
        ? shoes.filter((s) => !(hasPoint && s.point && shoes.some((x) => !x.point)))   // 포인트 옷이 있으면 포인트 신발은 빼요
            .map((s) => { const d = W0 + itemWarmth(s) - want; return [s, d * d + (recent.has(s.id) ? 0.2 : 0)]; }).sort((a, b) => a[1] - b[1]).map((x) => x[0])
        : [null];
      for (const sh of shoeOpts) {
        list = sh ? [...pre, sh] : [...pre]; W = W0 + (sh ? itemWarmth(sh) : 0);
        // 소품: 아주 추운 날에만, 더해서 나아지면 하나씩 (같은 종류는 하나만)
        if (want >= 14) {
          const used = new Set();
          for (const a of [...accs].sort((x, y) => itemWarmth(y) - itemWarmth(x))) {
            if (used.has(a.type) || patternClash([...list, a], [hidden]) || (a.point && pointCount(list, [hidden]))) continue;   // 체크 코트에 체크 목도리도 피해요
            if (Math.abs(W + itemWarmth(a) - want) < Math.abs(W - want)) { list.push(a); W += itemWarmth(a); used.add(a.type); }
          }
        }
        const all = list.map((x) => x.id);
        if (!nopeFull.some((f) => sameSet(f, all))) { found = true; break; }
      }
      if (!found) continue;   // 어떤 신발을 신어도 마음에 안 든다고 한 세트
      let cost;
      if (bySlot) {
        // 시간대마다 벌점: 겉옷이 있으면 벗는 것도 해 봐요(벗고 들고 다니는 수고 0.3)
        const ow = o ? itemWarmth(o) : 0;
        const cs = slots.map((s) => Math.min(miss(W - s.want), o && !bare ? miss(W - ow - s.want) + 0.3 : Infinity));
        cost = 0.7 * (cs.reduce((a, b) => a + b, 0) / cs.length) + 0.3 * Math.max(...cs);   // 평균 + 가장 안 맞는 때도 조금
        if (o && Math.min(...slots.map((s) => s.T)) >= 23) cost += hotPen;
      } else {
        cost = miss(W - want);
        if (o && t >= 23) cost += hotPen;
      }
      if (needer && !inner) cost += 0.5;   // 이너가 필요한데 옷장에 맞는 이너가 없으면 조금 덜
      cost += 0.6 * (innerCost + legCost);   // 옷 색과 덜 어울리는 이너·스타킹은 조금 덜
      // 최근 5일 안에 입은 코디: 똑같으면 많이, 상의+하의(원피스)가 같으면 조금 덜
      const mine = mainIds(list, hidden), baseIds = bse.map((x) => x.id);
      if (nopeMain.some((f) => sameSet(f, mine))) continue;   // 마음에 안 든다고 한 코디 (예전 기록)
      if (fits.some((f) => sameSet(f, mine))) cost += 4;
      else if (fits.some((f) => baseIds.every((id) => f.includes(id)))) cost += 1.5;
      for (const it of list) if (recent.has(it.id) && typeOf(it.type).cat !== "shoes" && it !== hidden && !innerOnly(it)) cost += 1.2;   // 최근 2일 안에 입은 옷은 조금 덜
      cost += hash(date + list.map((x) => x.id).join()) * 0.8;   // 같은 날엔 같은 순서, 날마다 조금씩 다르게
      (patternClash(list, [hidden]) || pointCount(list, [hidden]) >= 2 ? clashed : res).push({ items: list, W, cost, key: bse.map((x) => x.id).join() });
    }
    }
    }
  }
  if (!res.length) res.push(...clashed);   // 옷장에 무늬 옷·포인트 옷뿐이면 어쩔 수 없이
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
