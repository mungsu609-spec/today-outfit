// 글로 한꺼번에 넣기: "검정 니트", "연청 청바지"처럼 적은 줄에서 종류·색·무늬·두께·길이를 찾아요
//  splitLines(글) → 줄 목록,  parseLine(줄) → { name, type, known, color, pattern, warm, len, hem }
//  낱말 추가: 아래 표에 [적는 말, 앱의 이름] 한 줄
import { COLORS, TYPES, typeOf, lenKind, defaultLen, LEN_FIXED, LEN_SWAP } from "./catalog.js";

// 색: 앱의 색 이름 + 흔히 쓰는 다른 말
const COLOR_WORDS = [
  ...Object.keys(COLORS).filter((k) => k !== "여러색").map((k) => [k, k]),
  ["블랙", "검정"], ["검은", "검정"], ["까만", "검정"], ["화이트", "흰색"], ["흰", "흰색"], ["하얀", "흰색"], ["하양", "흰색"],
  ["그레이", "회색"], ["브라운", "갈색"], ["밤색", "갈색"], ["핑크", "분홍"], ["연핑크", "연분홍"], ["레드", "빨강"], ["빨간", "빨강"],
  ["블루", "파랑"], ["파란", "파랑"], ["그린", "초록"], ["녹색", "초록"], ["노란", "노랑"], ["옐로우", "노랑"], ["퍼플", "보라"],
  ["크림", "아이보리"], ["남색", "네이비"], ["곤색", "네이비"], ["소라색", "하늘색"], ["오렌지", "주황"], ["버건디", "와인"], ["누드", "베이지"],
  ["알록달록", "여러색"],
];
// 종류 (반팔·긴팔·민소매는 길이로 따로 봐요 — '반팔 셔츠'는 셔츠)
const TYPE_WORDS = [
  ["티셔츠", "tee_s"], ["반팔티", "tee_s"], ["티", "tee_s"], ["긴팔티", "tee_l"], ["롱슬리브", "tee_l"],
  ["나시", "sleeveless"], ["탱크탑", "sleeveless"], ["슬리브리스", "sleeveless"],
  ["히트텍", "heat_top"], ["히트텍 상의", "heat_top"], ["히트텍 하의", "heat_bottom"], ["히트텍 바지", "heat_bottom"], ["히트텍 레깅스", "heat_bottom"],
  ["셔츠", "shirt"], ["블라우스", "shirt"], ["남방", "shirt"],
  ["맨투맨", "sweatshirt"], ["스웨트셔츠", "sweatshirt"], ["후드티", "hoodie"], ["후드", "hoodie"], ["후디", "hoodie"],
  ["니트", "knit"], ["스웨터", "knit"], ["터틀넥", "knit"], ["폴라", "knit"],
  ["가디건", "cardigan"], ["카디건", "cardigan"], ["자켓", "jacket"], ["재킷", "jacket"], ["블레이저", "jacket"],
  ["청자켓", "denimjk"], ["청재킷", "denimjk"], ["데님 자켓", "denimjk"], ["데님자켓", "denimjk"],
  ["바람막이", "windbreaker"], ["윈드브레이커", "windbreaker"], ["플리스", "fleece"], ["후리스", "fleece"], ["뽀글이", "fleece"],
  ["트렌치", "trench"], ["트렌치코트", "trench"], ["코트", "coat"], ["패딩", "padding"], ["롱패딩", "padding"], ["숏패딩", "padding"],
  ["조끼", "vest"], ["베스트", "vest"],
  ["반바지", "shorts"], ["숏팬츠", "shorts"], ["버뮤다", "shorts"], ["치마", "skirt"], ["스커트", "skirt"],
  ["바지", "slacks"], ["슬랙스", "slacks"], ["면바지", "slacks"], ["팬츠", "slacks"], ["치노", "slacks"],
  ["청바지", "jeans"], ["데님", "jeans"], ["진바지", "jeans"],
  ["트레이닝", "jogger"], ["츄리닝", "jogger"], ["조거", "jogger"], ["트레이닝 바지", "jogger"],
  ["스타킹", "stockings"], ["타이즈", "stockings"],
  ["원피스", "dress"], ["드레스", "dress"],
  ["운동화", "sneakers"], ["스니커즈", "sneakers"], ["샌들", "sandals"], ["슬리퍼", "sandals"], ["쪼리", "sandals"],
  ["부츠", "boots"], ["워커", "boots"], ["구두", "dressshoes"], ["로퍼", "dressshoes"], ["플랫슈즈", "dressshoes"], ["힐", "dressshoes"],
  ["목도리", "scarf"], ["머플러", "scarf"], ["스카프", "scarf"], ["비니", "beanie"], ["털모자", "beanie"], ["모자", "beanie"], ["장갑", "gloves"],
  ...TYPES.map((t) => [t.ko, t.id]),
];
const SLEEVE_WORDS = [["반팔", "short"], ["긴팔", "long"], ["민소매", "sleeveless"], ["나시", "sleeveless"]];
const LEG_WORDS = [["미니", "short"], ["숏", "short"], ["짧은", "short"], ["무릎", "knee"], ["미디", "knee"], ["롱", "long"], ["긴", "long"]];
const PATTERN_WORDS = [["줄무늬", "stripe"], ["스트라이프", "stripe"], ["단가라", "stripe"], ["체크", "check"], ["깅엄", "check"],
  ["꽃무늬", "floral"], ["플라워", "floral"], ["플로럴", "floral"], ["프린트", "print"], ["로고", "print"], ["그래픽", "print"], ["레터링", "print"], ["도트", "print"], ["땡땡이", "print"], ["무지", "plain"]];
const THIN = ["얇은", "얇음", "린넨", "시스루", "여름용"], THICK = ["두꺼운", "두꺼움", "도톰", "기모", "겨울용", "울 ", "양털", "니트"];

// 가장 긴 낱말 (같으면 뒤에 나온 것 — 보통 종류는 맨 뒤에 적어요)
function find(text, words) {
  let best = null;
  for (const [w, v] of words) {
    const at = text.lastIndexOf(w);
    if (at >= 0 && (!best || w.length > best.w.length || (w.length === best.w.length && at > best.at))) best = { w, v, at };
  }
  return best;
}

export const splitLines = (text) => text.split(/[\n,]+/).map((l) => l.replace(/^\s*(?:[-•·*]|\d+[.)])\s*/, "").replace(/\s+/g, " ").trim()).filter(Boolean);

export function parseLine(line) {
  const t = line + " ";
  const sleeve = find(t, SLEEVE_WORDS)?.v;
  const hit = find(t, TYPE_WORDS);
  // 종류 낱말이 없으면 '반팔'·'긴팔'·'민소매'만 적어도 티셔츠·나시로
  let type = hit?.v || (sleeve ? LEN_SWAP.top[sleeve] : null);
  const known = !!type;
  type ||= "tee_s";
  if (sleeve && LEN_FIXED[type] === "top") type = LEN_SWAP.top[sleeve];   // '긴팔 티' → 긴팔 티셔츠
  const kind = lenKind(type);
  const leg = find(t, LEG_WORDS)?.v;
  let len = defaultLen(type), hem;
  if (kind === "sleeve" && sleeve) len = sleeve;
  if (kind === "leg" && leg) len = typeOf(type).id === "shorts" && leg === "long" ? len : leg;
  if (typeOf(type).cat === "dress" && leg) hem = leg;
  let warm = typeOf(type).warm;
  if (THIN.some((w) => t.includes(w))) warm--;
  if (THICK.some((w) => t.includes(w)) && typeOf(type).id !== "knit") warm++;
  warm = Math.min(5, Math.max(1, warm));
  return { name: line, type, known, color: find(t, COLOR_WORDS)?.v || "", pattern: find(t, PATTERN_WORDS)?.v || "plain", warm, len, ...(hem ? { hem } : {}) };
}
