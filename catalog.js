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

// 길이: 상의·겉옷·원피스는 소매(민소매·반팔·긴팔), 하의는 기장(짧은·긴). 신발·소품은 없어요.
export const SLEEVE = [
  { id: "sleeveless", ko: "민소매", en: ["a sleeveless garment with no sleeves", "a tank top with bare shoulders"] },
  { id: "short",      ko: "반팔",   en: ["a garment with short sleeves", "a short-sleeved top"] },
  { id: "long",       ko: "긴팔",   en: ["a garment with long sleeves reaching the wrists", "a long-sleeved top"] },
];
export const LEG = [
  { id: "short", ko: "짧은 기장 (반바지·짧은 치마)", en: ["short pants above the knee", "a short mini skirt"] },
  { id: "long",  ko: "긴 기장 (긴바지·긴 치마)",     en: ["long pants reaching the ankles", "a long maxi skirt"] },
];
// 종류마다 기본 길이 (없으면 긴 것). FIXED: 종류 이름에 길이가 들어 있어서 길이를 바꾸면 종류도 같이 바뀌는 것
const LEN_DEFAULT = { tee_s: "short", sleeveless: "sleeveless", vest: "sleeveless", shorts: "short", dress: "short" };
export const LEN_FIXED = { sleeveless: "top", tee_s: "top", tee_l: "top", vest: "none", shorts: "bottom" };
// 길이를 바꿨을 때 바뀔 종류: 상의 셋은 서로, 반바지를 길게 하면 슬랙스·면바지
export const LEN_SWAP = { top: { sleeveless: "sleeveless", short: "tee_s", long: "tee_l" }, bottom: { short: "shorts", long: "slacks" } };

export const WARM_KO = ["", "아주 얇음", "얇음", "보통", "두꺼움", "아주 두꺼움"];

// 비침: 비치는 옷은 바람이 잘 통해서 조금 덜 따뜻해요 (두께에서 adj만큼)
export const SHEER = [
  { id: "none", ko: "안 비침", adj: 0 },
  { id: "some", ko: "살짝 비침", adj: -0.3 },
  { id: "much", ko: "많이 비침", adj: -0.6 },
];
export const sheerAdj = (it) => SHEER.find((x) => x.id === it.sheer)?.adj || 0;
// 비침은 상의·겉옷·하의·원피스, 이너 필요는 상의·하의·원피스만 골라요
export const hasSheer = (type) => ["top", "outer", "bottom", "dress"].includes(typeOf(type).cat);
export const hasInner = (type) => ["top", "bottom", "dress"].includes(typeOf(type).cat);

// 색 (옷장 색 고르기 순서대로). 여러색은 맨 끝.
export const COLORS = {
  검정: "#222", 차콜: "#3d3f45", 회색: "#999", 연회색: "#c4c5c8", 흰색: "#fff", 아이보리: "#f6f0dc",
  베이지: "#e3d3b5", 카멜: "#b8864b", 갈색: "#7a5232", 카키: "#6b6b3a", 올리브: "#5f6f2e",
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
// 이너로 입을 수 있는 옷: 안 비치는 나시·반팔 티셔츠
export const canInner = (it) => ["sleeveless", "tee_s"].includes(typeOf(it.type).id) && !it.inner && (it.sheer || "none") === "none";
// 셔츠는 티셔츠·나시 위에 걸쳐서 겉옷 대신 입을 수 있어요 (이너가 필요할 만큼 비치는 셔츠는 빼요)
export const canShirtOuter = (it) => typeOf(it.type).id === "shirt" && !it.inner;
export const SHIRT_BASE = ["tee_s", "tee_l", "sleeveless"];   // 셔츠를 위에 걸칠 수 있는 상의

// 무늬 옷끼리 겹치는지: 줄무늬·체크·꽃무늬는 서로(같은 무늬끼리도) 같이 입지 않아요.
//  무지·프린트는 아무하고나 괜찮아요 (줄무늬 + 프린트 O). 안에 입는 이너·신발은 안 봐요.
//  결과: 겹치는 두 무늬 id [앞, 뒤] (없으면 null)
export const BUSY = ["stripe", "check", "floral"];
export function patternClash(list, skip = []) {
  let first = null;
  for (const it of list) {
    if (skip.includes(it) || typeOf(it.type).cat === "shoes" || !BUSY.includes(it.pattern)) continue;
    if (first) return [first, it.pattern];
    first = it.pattern;
  }
  return null;
}

// 코디 하나에서 누가 겉옷이고 누가 이너인지 알아내요 (추천·직접 고르기·기록 모두 같은 방법)
//  outer: 겉옷(없으면 티셔츠 위에 걸친 셔츠), inner: 비치는 옷 안에 입은 나시·반팔,
//  noInner: 이너가 필요한데 없는 상의·원피스, bottomInner: 속바지·속치마가 필요한 하의
export function layers(list) {
  const cat = (it) => typeOf(it.type).cat;
  const tops = list.filter((it) => cat(it) === "top");
  const needer = list.find((it) => it.inner && (cat(it) === "top" || cat(it) === "dress"));
  let inner = null;
  if (needer) inner = tops.filter((x) => x !== needer && canInner(x)).sort((a, b) => (typeOf(a.type).id === "sleeveless" ? 0 : 1) - (typeOf(b.type).id === "sleeveless" ? 0 : 1))[0] || null;
  let outer = list.find((it) => cat(it) === "outer") || null, shirtOuter = false;
  if (!outer) {
    const rest = tops.filter((x) => x !== inner);
    const shirt = [...rest].reverse().find(canShirtOuter);
    const under = rest.filter((x) => x !== shirt);
    if (shirt && (under.length ? under.every((x) => SHIRT_BASE.includes(typeOf(x.type).id)) : list.some((x) => cat(x) === "dress"))) { outer = shirt; shirtOuter = true; }
  }
  return { outer, shirtOuter, inner, noInner: needer && !inner ? needer : null, bottomInner: list.filter((it) => it.inner && cat(it) === "bottom") };
}

// 이 종류가 어떤 길이를 갖는지: "sleeve" | "leg" | null
export const lenKind = (type) => { const c = typeOf(type).cat; return c === "bottom" ? "leg" : c === "top" || c === "outer" || c === "dress" ? "sleeve" : null; };
export const defaultLen = (type) => (lenKind(type) ? LEN_DEFAULT[typeOf(type).id] || "long" : null);
// 옷의 길이 (예전에 넣은 옷은 종류의 기본 길이)
export const lenOf = (it) => (lenKind(it.type) ? it.len || defaultLen(it.type) : null);
const RANK = { sleeveless: 0, short: 1, long: 2 };
// 기본보다 길면 조금 더 따뜻하게, 짧으면 조금 덜 (한 칸에 0.5)
export const lenWarmAdj = (it) => { const k = lenKind(it.type); if (!k || !it.len) return 0; return 0.5 * (RANK[it.len] - RANK[defaultLen(it.type)]); };
// 이름에 붙일 길이 말 (기본 길이와 같거나 종류 이름에 이미 있으면 안 붙여요)
export const lenWord = (it) => {
  const k = lenKind(it.type), l = lenOf(it);
  if (!k || LEN_FIXED[typeOf(it.type).id] || l === defaultLen(it.type)) return "";
  return k === "leg" ? (l === "short" ? "짧은" : "긴") : SLEEVE.find((x) => x.id === l).ko;
};
