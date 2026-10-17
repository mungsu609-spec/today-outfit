// 옷 종류 목록 — 앱과 AI 라벨 만들기 도구(도구/make-labels.html)가 같이 써요.
// 종류를 추가하거나 영어 설명(en)을 바꾸면 도구로 labels.json을 다시 만들어야 해요.

// 부위(cat): 옷 따뜻함을 더할 때 부위마다 무게가 달라요 (겉옷이 제일 많이 따뜻하게 해 줘요)
export const CATS = {
  top:    { ko: "상의",   weight: 1.0 },
  outer:  { ko: "겉옷",   weight: 1.6 },
  bottom: { ko: "하의",   weight: 0.8 },
  dress:  { ko: "원피스", weight: 1.4 },
  shoes:  { ko: "신발",   weight: 0.3 },
  acc:    { ko: "소품",   weight: 0.6 },
};

// warm: 기본 두께(1 아주 얇음 ~ 5 아주 두꺼움)
export const TYPES = [
  { id: "tee_s",       ko: "반팔 티셔츠",     cat: "top",    warm: 1, en: ["a short sleeve t-shirt", "a short-sleeved crew neck tee"] },
  { id: "sleeveless",  ko: "민소매",          cat: "top",    warm: 1, en: ["a sleeveless tank top", "a sleeveless top"] },
  { id: "tee_l",       ko: "긴팔 티셔츠",     cat: "top",    warm: 2, en: ["a long sleeve t-shirt", "a long-sleeved jersey top"] },
  { id: "heat_top",    ko: "히트텍 상의",     cat: "top",    warm: 2 },   // 이너로만 (AI 글자 계산 없음 — 기본 옷으로 넣거나 직접 골라요)
  { id: "shirt",       ko: "셔츠·블라우스",   cat: "top",    warm: 2, en: ["a button-up collared shirt", "a women's blouse"] },
  { id: "sweatshirt",  ko: "맨투맨",          cat: "top",    warm: 3, en: ["a crewneck sweatshirt", "a cotton fleece pullover sweatshirt"] },
  { id: "hoodie",      ko: "후드티",          cat: "top",    warm: 3, en: ["a hoodie with a hood", "a hooded sweatshirt"] },
  { id: "knit",        ko: "니트",            cat: "top",    warm: 3, en: ["a knit sweater", "a wool pullover jumper"] },
  { id: "cardigan",    ko: "가디건",          cat: "outer",  warm: 2, en: ["a knit cardigan with buttons", "an open front cardigan"] },
  { id: "jacket",      ko: "자켓",            cat: "outer",  warm: 3, en: ["a tailored blazer jacket", "a casual jacket"] },
  { id: "denimjk",     ko: "청자켓",          cat: "outer",  warm: 3, en: ["a denim jacket", "a jean jacket"] },
  { id: "windbreaker", ko: "바람막이",        cat: "outer",  warm: 2, en: ["a nylon windbreaker jacket", "a thin rain jacket with a zipper"] },
  { id: "fleece",      ko: "플리스",          cat: "outer",  warm: 3, en: ["a fleece jacket", "a fuzzy sherpa fleece zip jacket"] },
  { id: "trench",      ko: "트렌치코트",      cat: "outer",  warm: 3, en: ["a beige trench coat", "a belted trench coat"] },
  { id: "coat",        ko: "코트",            cat: "outer",  warm: 4, en: ["a long wool overcoat", "a winter wool coat"] },
  { id: "padding",     ko: "패딩",            cat: "outer",  warm: 5, en: ["a puffer down jacket", "a quilted padded winter jacket"] },
  { id: "vest",        ko: "조끼",            cat: "outer",  warm: 2, en: ["a sleeveless vest", "a padded vest"] },
  { id: "shorts",      ko: "반바지",          cat: "bottom", warm: 1, en: ["shorts", "short pants"] },
  { id: "skirt",       ko: "치마",            cat: "bottom", warm: 2, en: ["a skirt", "a midi skirt"] },
  { id: "slacks",      ko: "슬랙스·면바지",   cat: "bottom", warm: 2, en: ["dress trousers", "chino pants"] },
  { id: "jeans",       ko: "청바지",          cat: "bottom", warm: 3, en: ["blue jeans", "denim pants"] },
  { id: "jogger",      ko: "트레이닝 바지",   cat: "bottom", warm: 2, en: ["track pants", "jogger sweatpants"] },
  { id: "heat_bottom", ko: "히트텍 하의",     cat: "bottom", warm: 2 },   // 바지 안 이너, 치마·원피스 밑엔 스타킹 대신
  { id: "stockings",   ko: "스타킹",          cat: "bottom", warm: 1 },   // 치마·원피스·반바지 밑에
  { id: "dress",       ko: "원피스",          cat: "dress",  warm: 2, en: ["a dress", "a one-piece dress"] },
  { id: "sneakers",    ko: "운동화",          cat: "shoes",  warm: 2, en: ["sneakers", "running shoes"] },
  { id: "sandals",     ko: "샌들·슬리퍼",     cat: "shoes",  warm: 1, en: ["sandals", "flip flops slippers"] },
  { id: "boots",       ko: "부츠",            cat: "shoes",  warm: 4, en: ["boots", "winter ankle boots"] },
  { id: "dressshoes",  ko: "구두·로퍼",       cat: "shoes",  warm: 2, en: ["leather loafers", "formal shoes"] },
  { id: "scarf",       ko: "목도리",          cat: "acc",    warm: 3, en: ["a knitted scarf", "a winter muffler"] },
  { id: "beanie",      ko: "비니·털모자",     cat: "acc",    warm: 2, en: ["a knit beanie hat", "a winter hat"] },
  { id: "gloves",      ko: "장갑",            cat: "acc",    warm: 2, en: ["gloves", "winter mittens"] },
];

export const PATTERNS = [
  { id: "plain",   ko: "무지",     en: ["a plain solid color garment with no pattern"] },
  { id: "stripe",  ko: "줄무늬",   en: ["a striped garment"] },
  { id: "check",   ko: "체크",     en: ["a plaid checked garment"] },
  { id: "print",   ko: "프린트",   en: ["a garment with a printed graphic or logo"] },
  { id: "floral",  ko: "꽃무늬",   en: ["a floral pattern garment"] },
];

// 두께 짐작용: 얇은 옷 vs 두꺼운 옷
export const THICK = [
  { id: "thin",  en: ["a thin lightweight summer garment", "sheer light fabric clothing"] },
  { id: "thick", en: ["a thick heavy warm winter garment", "chunky thick fabric clothing"] },
];

// 길이: 상의·겉옷·원피스는 소매(민소매·반팔·긴팔), 하의는 기장(짧은·무릎·긴). 원피스는 기장(hem)도 따로 있어요. 신발·소품은 없어요.
export const SLEEVE = [
  { id: "sleeveless", ko: "민소매", en: ["a sleeveless garment with no sleeves", "a tank top with bare shoulders"] },
  { id: "short",      ko: "반팔",   en: ["a garment with short sleeves", "a short-sleeved top"] },
  { id: "long",       ko: "긴팔",   en: ["a garment with long sleeves reaching the wrists", "a long-sleeved top"] },
];
export const LEG = [
  { id: "short", ko: "짧은 기장", word: "짧은", en: ["short pants above the knee", "a short mini skirt"] },
  { id: "knee",  ko: "무릎 기장", word: "무릎" },   // AI 글자 계산 없음 — 직접 골라요
  { id: "long",  ko: "긴 기장", word: "긴", en: ["long pants reaching the ankles", "a long maxi skirt"] },
];
// 원피스 기장 (예전에 넣은 원피스는 무릎 기장으로 봐요)
export const HEM = [
  { id: "short", ko: "짧은 기장", word: "짧은" },
  { id: "knee",  ko: "무릎 기장", word: "무릎" },
  { id: "long",  ko: "긴 기장",   word: "긴" },
];
export const hasHem = (type) => typeOf(type).cat === "dress";
export const hemOf = (it) => (hasHem(it.type) ? it.hem || "knee" : null);
// 종류마다 기본 길이 (없으면 긴 것). FIXED: 종류 이름에 길이가 들어 있어서 길이를 바꾸면 종류도 같이 바뀌는 것
const LEN_DEFAULT = { tee_s: "short", sleeveless: "sleeveless", vest: "sleeveless", shorts: "short", dress: "short" };
export const LEN_FIXED = { sleeveless: "top", tee_s: "top", tee_l: "top", vest: "none", shorts: "bottom" };
// 길이를 바꿨을 때 바뀔 종류: 상의 셋은 서로, 반바지를 길게 하면 슬랙스·면바지
//  (반바지를 무릎 기장으로 하면 반바지 그대로 = 무릎 반바지)
export const LEN_SWAP = { top: { sleeveless: "sleeveless", short: "tee_s", long: "tee_l" }, bottom: { short: "shorts", knee: "shorts", long: "slacks" } };

export const WARM_KO = ["", "아주 얇음", "얇음", "보통", "두꺼움", "아주 두꺼움"];

// 비침: 비치는 옷은 바람이 잘 통해서 조금 덜 따뜻해요 (두께에서 adj만큼)
export const SHEER = [
  { id: "none", ko: "안 비침", adj: 0 },
  { id: "some", ko: "살짝 비침", adj: -0.3 },
  { id: "much", ko: "많이 비침", adj: -0.6 },
];
export const sheerAdj = (it) => SHEER.find((x) => x.id === it.sheer)?.adj || 0;
// 비침은 상의·겉옷·하의·원피스, 이너 필요는 상의·하의·원피스만 골라요
//  (안에 입는 히트텍·스타킹은 둘 다 없어요)
const LAYER_ONLY = ["heat_top", "heat_bottom", "stockings"];
export const hasSheer = (type) => ["top", "outer", "bottom", "dress"].includes(typeOf(type).cat) && !LAYER_ONLY.includes(typeOf(type).id);
export const hasInner = (type) => ["top", "bottom", "dress"].includes(typeOf(type).cat) && !LAYER_ONLY.includes(typeOf(type).id);

// 색 (옷장 색 고르기 순서대로). 여러색은 맨 끝.
export const COLORS = {
  검정: "#222", 차콜: "#3d3f45", 회색: "#999", 연회색: "#c4c5c8", 흰색: "#fff", 아이보리: "#f6f0dc",
  베이지: "#e3d3b5", 살구색: "#f2c4a4", 카멜: "#b8864b", 갈색: "#7a5232", 커피색: "#8b6650", 카키: "#6b6b3a", 올리브: "#5f6f2e",
  초록: "#3f9a5a", 민트: "#9fe0c9", 하늘색: "#8cc7ef", 연청: "#8fb0d6", 진청: "#2f4f7f", 파랑: "#2f6fd6", 네이비: "#1f2d4d",
  라벤더: "#c6b5e8", 보라: "#8a5cc7", 분홍: "#f2a2b8", 코랄: "#f4846c", 빨강: "#d33", 와인: "#6e1f2f",
  주황: "#f08a3c", 머스타드: "#d2a227", 노랑: "#f2d24b",
  여러색: "conic-gradient(#e44,#fd4,#4c6,#48f,#a5d,#e44)",
};
// 색의 밝기 0(검정)~1(흰색). 모르는 색·여러색은 0.6
export function colorLum(name) {
  const v = COLORS[name];
  if (!v || !v.startsWith("#")) return 0.6;
  const h = v.length === 4 ? [...v.slice(1)].map((c) => c + c) : [v.slice(1, 3), v.slice(3, 5), v.slice(5, 7)];
  const [r, g, b] = h.map((x) => parseInt(x, 16) / 255);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export const typeOf = (id) => TYPES.find((t) => t.id === id) || TYPES[0];

// ---------- 이너·겉옷 대용 ----------
// 이너로 입을 수 있는 옷: 안 비치는 나시·반팔 티셔츠 (+ 이름에 '히트텍'이 들어간 옷, 아래 이너 고르기용 옷)
//  히트텍 상의: 종류가 '히트텍 상의'이거나 이름에 '히트텍'이 들어간 상의
const isHeat = (it) => typeOf(it.type).cat === "top" && (typeOf(it.type).id === "heat_top" || /히트텍/.test(it.name || ""));
// 다리에 신는 옷: 히트텍 하의(바지 안 이너, 치마 밑엔 스타킹 대신)·스타킹
const LEGWEAR = ["heat_bottom", "stockings"];
export const isLegwear = (it) => LEGWEAR.includes(typeOf(it.type).id);
export const STOCKING_MAX = 20;   // 스타킹은 이 온도 이하인 날만 (히트텍 하의는 HEAT_MAX 이하)
// 안에만 입는 옷: 나시·히트텍·스타킹 — 혼자(상의·하의 자리) 추천하지 않고, 무늬·포인트·최근 코디 비교에서도 빼요
export const innerOnly = (it) => typeOf(it.type).id === "sleeveless" || isHeat(it) || isLegwear(it);
export const isHeatTop = (it) => isHeat(it);
// 이 하의(원피스) 밑엔 스타킹을 신어요: 치마·원피스, 짧은·무릎 기장. 긴 바지면 히트텍 하의만 안에.
export const stockingBase = (b) => typeOf(b.type).cat === "dress" || typeOf(b.type).id === "skirt" || lenOf(b) !== "long";
export const canInner = (it) => !!it.virtual || ((["sleeveless", "tee_s"].includes(typeOf(it.type).id) || isHeat(it)) && !it.inner && (it.sheer || "none") === "none");

// 이너 필요한 상의에서 '어떤 이너를 입을지' 고르기 (여러 개 가능, 저장 이름 innerPick)
//  옷장에 같은 옷(흰색 나시 등)이 있으면 그 옷을 쓰고, 없으면 이 목록의 옷(virtual)을 써요. 히트텍은 HEAT_MAX° 이하인 날만.
export const INNER_PICKS = [
  { id: "tank_w", ko: "흰색 나시",   type: "sleeveless", color: "흰색", basic: "tank" },
  { id: "tank_b", ko: "검정 나시",   type: "sleeveless", color: "검정", basic: "tank" },
  { id: "tee_w",  ko: "흰색 티셔츠", type: "tee_s",      color: "흰색", basic: "tee" },
  { id: "tee_b",  ko: "검정 티셔츠", type: "tee_s",      color: "검정", basic: "tee" },
  { id: "heat",   ko: "히트텍",      type: "heat_top",   color: "베이지", basic: "heattop", warm: 1.5 },
];
export const HEAT_MAX = 15;
// 목록의 옷 (늘 같은 물건이라 코디 안에서 비교할 수 있어요). 사진(photo)은 index.html이 그려 넣어요.
export const VIRTUAL_INNERS = INNER_PICKS.map((p) => ({ id: "inner:" + p.id, virtual: true, pick: p.id, type: p.type, color: p.color, name: p.ko, warm: p.warm || 1, pattern: "plain", sheer: "none", inner: false }));
export const hasInnerPick = (it) => typeOf(it.type).cat === "top" && !!it.inner && !!it.innerPick?.length;
// 옷장에서 이 이너와 같은 옷 찾기 (빼 둔 옷은 안 써요)
function closetInner(p, items) {
  return items.find((x) => !x.away && canInner(x) && (p.id === "heat" ? isHeat(x) : typeOf(x.type).id === p.type && x.color === p.color && !isHeat(x))) || null;
}
// 이너 후보: 고른 게 있으면 그것들, 없으면 옷장의 나시·반팔 티셔츠 (예전처럼)
export function innerChoices(main, items) {
  if (hasInnerPick(main)) return main.innerPick.map((id) => { const p = INNER_PICKS.find((x) => x.id === id); return p && (closetInner(p, items) || VIRTUAL_INNERS.find((v) => v.pick === id)); }).filter(Boolean);
  return items.filter((x) => !x.away && typeOf(x.type).cat === "top" && !x.virtual && canInner(x) && !isHeat(x));
}
export const isHeatInner = (x) => x.pick === "heat" || isHeat(x);

// 포인트 옷: 눈에 띄는 옷은 한 코디에 하나만 (안에 입는 이너는 안 세요)
export const pointCount = (list, skip = []) => list.filter((it) => it.point && !skip.includes(it) && !innerOnly(it)).length;
// 셔츠는 티셔츠·나시 위에 걸쳐서 겉옷 대신 입을 수 있어요.
//  옷마다 '겉옷으로도 입기'(asOuter)로 정해요 — 비치는 셔츠도 사용자가 켜 두면 골라요. 예전에 넣은 셔츠는 켜진 걸로 봐요.
export const canShirtOuter = (it) => typeOf(it.type).id === "shirt" && it.asOuter !== false;
export const SHIRT_BASE = ["tee_s", "tee_l", "sleeveless"];   // 셔츠를 위에 걸칠 수 있는 상의

// 무늬 옷끼리 겹치는지: 줄무늬·체크·꽃무늬는 서로(같은 무늬끼리도) 같이 입지 않아요.
//  무지·프린트는 아무하고나 괜찮아요 (줄무늬 + 프린트 O). 안에 입는 이너·신발은 안 봐요.
//  결과: 겹치는 두 무늬 id [앞, 뒤] (없으면 null)
export const BUSY = ["stripe", "check", "floral"];
export function patternClash(list, skip = []) {
  let first = null;
  for (const it of list) {
    if (skip.includes(it) || innerOnly(it) || typeOf(it.type).cat === "shoes" || !BUSY.includes(it.pattern)) continue;
    if (first) return [first, it.pattern];
    first = it.pattern;
  }
  return null;
}

// 코디 하나에서 누가 겉옷이고 누가 이너인지 알아내요 (추천·직접 고르기·기록 모두 같은 방법)
//  outer: 겉옷(없으면 티셔츠 위에 걸친 셔츠), inner: 비치는 옷 안에 입은 나시·반팔,
//  noInner: 이너가 필요한데 없는 상의·원피스, bottomInner: 속바지·속치마가 필요한 하의,
//  legs: 히트텍 하의·스타킹, legUnder: 긴 바지 안에 입었는지(아니면 치마·원피스 밑 스타킹 자리)
export function layers(list) {
  const cat = (it) => typeOf(it.type).cat;
  const tops = list.filter((it) => cat(it) === "top");
  let outer = list.find((it) => cat(it) === "outer") || null, shirtOuter = false;
  // 겉옷이 없으면: 티셔츠·나시(또는 원피스) 위의 셔츠가 겉옷 대신 (셔츠 밑에 니트 등이 있으면 셔츠는 안에 입은 것)
  if (!outer) {
    // (나시·히트텍만 밑에 있으면 셔츠를 그 위에 입은 것 — 겉옷 대신 아님)
    const wear = tops.filter((x) => !innerOnly(x));
    const shirt = [...wear].reverse().find(canShirtOuter);
    const under = wear.filter((x) => x !== shirt);
    if (shirt && (under.length ? under.every((x) => SHIRT_BASE.includes(typeOf(x.type).id)) : list.some((x) => cat(x) === "dress"))) { outer = shirt; shirtOuter = true; }
  }
  // 겉옷 대신 걸친 셔츠는 비쳐도 이너를 따로 찾지 않아요 (밑에 입은 옷이 있으니까)
  const needer = list.find((it) => it.inner && it !== (shirtOuter ? outer : null) && (cat(it) === "top" || cat(it) === "dress"));
  let inner = null;
  if (!needer) inner = tops.find((x) => isHeat(x) && x !== outer) || null;   // 히트텍은 비치지 않는 옷 안에도
  if (needer) inner = tops.filter((x) => x !== needer && x !== (shirtOuter ? outer : null) && canInner(x)).sort((a, b) => (a.virtual ? 0 : 1) - (b.virtual ? 0 : 1) || (typeOf(a.type).id === "sleeveless" ? 0 : 1) - (typeOf(b.type).id === "sleeveless" ? 0 : 1))[0] || null;
  const legs = list.filter(isLegwear), legBase = list.find((it) => (cat(it) === "bottom" && !isLegwear(it)) || cat(it) === "dress");
  return { outer, shirtOuter, inner, noInner: needer && !inner ? needer : null, bottomInner: list.filter((it) => it.inner && cat(it) === "bottom"), legs, legUnder: !!legBase && !stockingBase(legBase) };
}

// 이 종류가 어떤 길이를 갖는지: "sleeve" | "leg" | null
//  (히트텍 하의·스타킹은 늘 발목까지라 길이를 안 골라요)
export const lenKind = (type) => { const c = typeOf(type).cat; if (LEGWEAR.includes(typeOf(type).id)) return null; return c === "bottom" ? "leg" : c === "top" || c === "outer" || c === "dress" ? "sleeve" : null; };
export const defaultLen = (type) => (lenKind(type) ? LEN_DEFAULT[typeOf(type).id] || "long" : null);
// 옷의 길이 (예전에 넣은 옷은 종류의 기본 길이)
export const lenOf = (it) => (lenKind(it.type) ? it.len || defaultLen(it.type) : null);
const RANK = { sleeveless: 0, short: 1, long: 2 };
const LEG_RANK = { short: 0, knee: 0.5, long: 1 };   // 기장: 무릎은 짧은 것과 긴 것의 가운데
// 기본보다 길면 조금 더 따뜻하게, 짧으면 조금 덜 (소매 한 칸·기장 짧은↔긴에 0.5, 무릎은 그 절반)
//  원피스는 소매에 더해 기장도 봐요 (무릎 기장이 기준)
export const lenWarmAdj = (it) => {
  const k = lenKind(it.type);
  let a = 0;
  if (k && it.len) a = k === "leg" ? 0.5 * ((LEG_RANK[it.len] ?? 1) - LEG_RANK[defaultLen(it.type)]) : 0.5 * (RANK[it.len] - RANK[defaultLen(it.type)]);
  if (hasHem(it.type)) a += 0.5 * (LEG_RANK[hemOf(it)] - LEG_RANK.knee);
  return a;
};
// 이름에 붙일 길이 말 (기본 길이와 같거나 종류 이름에 이미 있으면 안 붙여요)
//  (무릎 반바지처럼 종류 이름에 길이가 있어도 '무릎'은 붙여요. 원피스는 기장 말도: '무릎 원피스'는 기본이라 안 붙임)
export const lenWord = (it) => {
  const k = lenKind(it.type), l = lenOf(it);
  const hem = hasHem(it.type) && hemOf(it) !== "knee" ? HEM.find((x) => x.id === hemOf(it)).word : "";
  if (!k || l === defaultLen(it.type) || (LEN_FIXED[typeOf(it.type).id] && l !== "knee")) return hem;
  return [hem, k === "leg" ? LEG.find((x) => x.id === l).word : SLEEVE.find((x) => x.id === l).ko].filter(Boolean).join(" ");
};

// ---------- 계절 ----------
// 옷마다 입는 계절(여러 개 가능). 고른 적 없는 옷은 종류·두께·길이로 짐작해요(옷장에서 고칠 수 있어요).
export const SEASONS = [
  { id: "spring", ko: "봄·가을", emoji: "🍂" },
  { id: "summer", ko: "여름",    emoji: "☀️" },
  { id: "winter", ko: "겨울",    emoji: "❄️" },
];
export function guessSeasons(it) {
  const t = typeOf(it.type), id = t.id;
  if (t.cat === "shoes") return id === "sandals" ? ["summer"] : id === "boots" ? ["spring", "winter"] : ["spring", "summer", "winter"];
  if (t.cat === "acc") return ["winter"];
  if (id === "padding") return ["winter"];
  if (["heat_top", "heat_bottom", "stockings"].includes(id)) return ["spring", "winter"];
  if (id === "coat") return ["spring", "winter"];
  const w = (it.warm || t.warm) + lenWarmAdj(it) + sheerAdj(it);
  const short = ["short", "sleeveless"].includes(lenOf(it)) || hemOf(it) === "short";
  const out = [];
  if (w >= 1.5 && w < 4.5) out.push("spring");
  if (short || w <= 1.5) out.push("summer");
  if (!short && w >= (t.cat === "outer" ? 4 : 3)) out.push("winter");
  return out.length ? out : ["spring"];
}
export const seasonsOf = (it) => (it.seasons?.length ? it.seasons : guessSeasons(it));
