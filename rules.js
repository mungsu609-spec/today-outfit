// 내 규칙: 설정 → 📏 내 규칙에서 켜고 끄거나 온도를 바꿀 수 있는 추천 규칙
//  추천 계산(model.js·catalog.js)은 숫자를 직접 쓰지 않고 R.이름 으로 읽어요.
//  저장: logs 모음의 'rules' 문서 하나 (Firebase 규칙을 안 바꿔도 되고, 폰을 바꿔도 남아요)
//  규칙 추가: 아래 RULES에 한 줄 + 계산하는 곳에서 R.이름 쓰기

export const RULES_ID = "rules";

// on: 켜기/끄기, num: 온도 등 숫자 (min~max, step) · dep: 이 규칙이 켜져(꺼져) 있을 때만 의미 있음 ("!이름" = 꺼져 있을 때)
export const RULES = [
  { group: "안에 입는 옷", list: [
    { id: "tankInner", on: true, ko: "나시는 이너로만", desc: "끄면 나시도 상의로 추천해요" },
    { id: "heatOn", on: true, ko: "옷장의 히트텍 같이 고르기", desc: "쌀쌀한 날 긴팔 옷 안에 히트텍 상의, 바지 안에 히트텍 하의" },
    { id: "heatMax", num: 15, min: 5, max: 22, unit: "° 이하", ko: "히트텍 입는 온도", desc: "'어떤 이너' 고르기의 히트텍도 이 온도 이하인 날만" },
    { id: "heatStocking", on: true, dep: "heatOn", ko: "히트텍 하의를 스타킹 대신으로도", desc: "치마·원피스·짧은 하의 밑에" },
    { id: "stockingOn", on: true, ko: "스타킹 같이 고르기", desc: "치마·원피스·짧은 하의 밑에" },
    { id: "stockingMax", num: 20, min: 10, max: 26, unit: "° 이하", dep: "stockingOn", ko: "스타킹 신는 온도" },
  ] },
  { group: "민소매 옷", list: [
    { id: "sleeveCover", on: true, ko: "민소매 옷은 혼자 입지 않기", desc: "겉옷·셔츠를 걸치거나 안에 티셔츠를 받쳐 입은 코디로만" },
    { id: "underTee", on: true, ko: "안에 기본 티셔츠 받쳐 입기", desc: "옷장의 무지 반팔·긴팔 티셔츠" },
    { id: "sleeveMin", num: 20, min: 15, max: 30, unit: "° 이상", dep: "!sleeveCover", ko: "민소매 혼자 입는 온도" },
  ] },
  { group: "날씨에 맞는 옷", list: [
    { id: "shortMin", num: 20, min: 12, max: 30, unit: "° 이상", ko: "반바지·짧은 치마·샌들" },
    { id: "outerMax", num: 25, min: 15, max: 32, unit: "° 이하", ko: "겉옷" },
    { id: "shirtOuter", on: true, ko: "셔츠를 겉옷 대신 걸치기", desc: "옷마다 '겉옷으로도 입기'를 켠 셔츠만" },
    { id: "shirtMax", num: 28, min: 15, max: 34, unit: "° 이하", dep: "shirtOuter", ko: "셔츠 겉옷 대신" },
    { id: "coatMax", num: 15, min: 5, max: 22, unit: "° 이하", ko: "코트" },
    { id: "paddingMax", num: 10, min: 0, max: 18, unit: "° 이하", ko: "패딩" },
    { id: "bootsMax", num: 13, min: 0, max: 22, unit: "° 이하", ko: "부츠" },
    { id: "accMax", num: 8, min: -5, max: 18, unit: "° 이하", ko: "목도리·비니·장갑" },
  ] },
  { group: "코디 고르기", list: [
    { id: "patternAvoid", on: true, ko: "줄무늬·체크·꽃무늬끼리 같이 입지 않기", desc: "무지·프린트는 아무하고나 OK" },
    { id: "pointOne", on: true, ko: "⭐ 포인트 옷은 한 코디에 하나만" },
    { id: "seasonOnly", on: true, ko: "여름·겨울 전용 옷은 그 계절에만" },
    { id: "recentDays", num: 4, min: 0, max: 10, unit: "일", ko: "최근 입은 코디 피하기", desc: "이 날짜 안에 입은 코디는 되도록 다시 안 골라요 (0 = 끄기)" },
  ] },
];

const ALL = RULES.flatMap((g) => g.list);
export const DEFAULTS = Object.fromEntries(ALL.map((r) => [r.id, r.num ?? r.on]));
export const R = { ...DEFAULTS };   // 지금 규칙 (저장된 것으로 덮어써요)
export const ruleOf = (id) => ALL.find((r) => r.id === id);

// 저장된 규칙 → R (모르는 이름·이상한 값은 무시, 없는 건 기본값)
export function setRules(saved = {}) {
  for (const r of ALL) {
    const v = saved[r.id];
    R[r.id] = r.num != null ? (typeof v === "number" && v >= r.min && v <= r.max ? v : r.num) : typeof v === "boolean" ? v : r.on;
  }
}
// 기본값과 다른 규칙만 (저장할 때·몇 개 바꿨는지 보여 줄 때)
export const changedRules = () => Object.fromEntries(ALL.filter((r) => R[r.id] !== DEFAULTS[r.id]).map((r) => [r.id, R[r.id]]));
export const rulesKey = () => JSON.stringify(changedRules());
