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

export const WARM_KO = ["", "아주 얇음", "얇음", "보통", "두꺼움", "아주 두꺼움"];

export const typeOf = (id) => TYPES.find((t) => t.id === id) || TYPES[0];
