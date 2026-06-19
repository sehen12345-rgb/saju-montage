/**
 * 만세력 기반 분석 도출기
 *
 * 입력: ManseryeokData (lib/manseryeok.ts)
 * 출력: SajuAnalysis / GuardianAnalysis / EnemyAnalysis 의 수치·구조 필드
 *
 * AI는 서술 텍스트(외모, 성격 묘사, 카톡 첫메시지 등)만 담당하고,
 * 점수·타임라인·월별 운·궁합·MBTI·직업 등은 모두 이 모듈에서 도출.
 */
import type {
  SajuAnalysis, GuardianAnalysis, EnemyAnalysis,
  CompatibilityScores, MeetTiming, Timeline, BodySpec,
} from "./types";
import {
  ManseryeokData, SipShin, jiElement, isSaeng, isGeuk,
} from "./manseryeok";

// ─────────────────────────────────────────────────────────────
// 십신 → 의미 매핑
// ─────────────────────────────────────────────────────────────

/** 십신별 핵심 키워드 */
const SIPSHIN_TRAITS: Record<SipShin, { keyword: string; field: string; description: string }> = {
  비견: { keyword: "독립·자주",     field: "동업·창업",      description: "스스로의 길을 가는 자립적 기질" },
  겁재: { keyword: "경쟁·승부욕",   field: "스포츠·영업",    description: "강한 추진력과 경쟁의식" },
  식신: { keyword: "여유·표현",     field: "요리·예술·교육", description: "베푸는 마음과 표현력" },
  상관: { keyword: "재능·창의",     field: "예술·기획·언론", description: "독창성과 비판적 사고" },
  편재: { keyword: "기회·역동",     field: "사업·투자·무역", description: "변화에 민감한 재물 감각" },
  정재: { keyword: "성실·축적",     field: "회계·금융·공무", description: "꾸준함으로 쌓는 안정 재물" },
  편관: { keyword: "결단·도전",     field: "군경·법조·의료", description: "강한 의지와 통제력" },
  정관: { keyword: "원칙·명예",     field: "공직·경영·법조", description: "책임감과 사회적 권위" },
  편인: { keyword: "직관·탐구",     field: "연구·예술·종교", description: "남다른 통찰과 독창성" },
  정인: { keyword: "지혜·학문",     field: "교육·연구·문화", description: "정통 학문과 어머니의 사랑" },
};

/** 가장 많은 십신 N개 반환 (동률은 비/겁/식/상/편재/정재/편관/정관/편인/정인 순) */
function topSipShin(sipShin: Record<SipShin, number>, n: number): SipShin[] {
  const order: SipShin[] = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
  return order
    .map(k => ({ k, v: sipShin[k] }))
    .sort((a, b) => b.v - a.v)
    .slice(0, n)
    .map(x => x.k);
}

// ─────────────────────────────────────────────────────────────
// MBTI / 직업 / 취미
// ─────────────────────────────────────────────────────────────

/**
 * MBTI 도출 — 일간 + 신강신약 + 십신 우세
 *  E/I: 양간(E) vs 음간(I), 비/겁/식/상 우세 → E 보강
 *  N/S: 木火 우세(N), 土金水 우세(S), 편인/상관 → N 보강
 *  T/F: 金水 우세(T), 木火 우세(F), 정관/식신 → F 보강
 *  J/P: 정관/정재 우세(J), 편관/상관/편재 우세(P)
 */
export function deriveMBTI(d: ManseryeokData): string {
  const dayStem = d.sajuInfo.dayPillar.charAt(0);
  const yang = ["갑", "병", "무", "경", "임"].includes(dayStem);
  const top = topSipShin(d.sipShin, 3);

  const eScore = (yang ? 1 : 0)
    + (top.includes("비견") ? 1 : 0)
    + (top.includes("상관") ? 1 : 0)
    + (top.includes("편재") ? 1 : 0);
  const E = eScore >= 2;

  const dom = d.elements.strongest;
  const N = ["木", "火"].includes(dom) || top.includes("편인") || top.includes("상관");

  const F = ["木", "火"].includes(dom) || top.includes("정인") || top.includes("식신");

  const J = top.includes("정관") || top.includes("정재") || top.includes("정인");

  return (E ? "E" : "I") + (N ? "N" : "S") + (F ? "F" : "T") + (J ? "J" : "P");
}

/** 직업군 — 가장 강한 십신의 분야 + 두번째 보조 */
export function deriveJob(d: ManseryeokData): string {
  const top = topSipShin(d.sipShin, 2);
  const primary = SIPSHIN_TRAITS[top[0]].field;
  const secondary = SIPSHIN_TRAITS[top[1]].field;
  return `${primary} (보조: ${secondary})`;
}

/** 취미 — 일간 오행 + dominant 오행 */
export function deriveHobbies(d: ManseryeokData): string[] {
  const ELEMENT_HOBBIES: Record<string, string[]> = {
    木: ["등산", "독서", "원예"],
    火: ["여행", "공연 관람", "댄스"],
    土: ["요리", "도예", "캠핑"],
    金: ["악기 연주", "수집", "운동"],
    水: ["수영", "사진", "영화 감상"],
  };
  const set = new Set<string>();
  ELEMENT_HOBBIES[d.elements.dayElement]?.forEach(h => set.add(h));
  ELEMENT_HOBBIES[d.elements.strongest]?.forEach(h => set.add(h));
  return Array.from(set).slice(0, 3);
}

// ─────────────────────────────────────────────────────────────
// 궁합 점수 — 일지(배우자궁)와 사주 내부 합/충 기반
// ─────────────────────────────────────────────────────────────

/**
 * 5가지 궁합 점수 도출.
 * - personality: 일간 오행과 일지 오행의 상생/상극 + 신강신약 균형
 * - values: 정관/정인 강도 vs 비/겁 강도 비율
 * - lifestyle: 식상 + 정재 (안정 vs 창의)
 * - communication: 식상 + 정인 + 천간합 개수
 * - finance: 정재 + 편재 강도, 겁재 페널티
 */
export function deriveCompatibilityScores(d: ManseryeokData): CompatibilityScores {
  const ss = d.sipShin;
  const elem = d.elements;
  const hap = d.innerHapChung;

  const dayBranch = d.sajuInfo.dayPillar.charAt(1);
  const dayBranchElem = jiElement(dayBranch);
  const dayElem = elem.dayElement;

  // personality (60~95): 일지가 일간을 상생/같은 오행이면 +, 상극이면 -
  let personality = 75;
  if (dayBranchElem === dayElem) personality += 5;
  else if (isSaeng(dayBranchElem, dayElem)) personality += 10;
  else if (isGeuk(dayBranchElem, dayElem)) personality -= 8;
  if (elem.isBalanced) personality += 5;
  if (hap.spousePalaceClash) personality -= 10;
  personality = clamp(personality, 55, 95);

  // values (60~95): 정관·정인 강 → 가치관 안정
  let values = 70 + (ss.정관 + ss.정인) * 4 - (ss.겁재 + ss.상관) * 2;
  values = clamp(values, 55, 95);

  // lifestyle (60~95): 식신·정재 강 → 일상 안정, 충 많으면 -
  let lifestyle = 70 + (ss.식신 + ss.정재) * 4 - hap.chungCount * 5;
  lifestyle = clamp(lifestyle, 55, 95);

  // communication: 식상 + 정인 + 천간합
  let communication = 70 + (ss.식신 + ss.상관) * 3 + ss.정인 * 2 + hap.ganHapCount * 4;
  communication = clamp(communication, 55, 95);

  // finance: 정재 + 편재 (겁재 페널티)
  let finance = 70 + ss.정재 * 5 + ss.편재 * 3 - ss.겁재 * 5;
  finance = clamp(finance, 55, 95);

  return { personality, values, lifestyle, communication, finance };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ─────────────────────────────────────────────────────────────
// 만남 시기 / 타임라인
// ─────────────────────────────────────────────────────────────

/** 일지/월지 오행 → 계절 매핑 */
function elementToSeason(elem: string): string {
  return ({ 木: "봄", 火: "여름", 土: "환절기", 金: "가을", 水: "겨울" } as Record<string, string>)[elem] ?? "사계절";
}

/**
 * 만남 시기 — 현재 ~ +12년 내 대운 중 가장 길운(rating 최저) 구간 선택.
 * 그 안에 길운(≤5)이 없으면 가장 가까운 대운의 후반부 사용.
 * 결과는 항상 currentAge 이상 ~ currentAge + 12 이내로 클램프.
 */
export function deriveMeetTiming(d: ManseryeokData, target: "spouse" | "guardian" | "enemy"): MeetTiming {
  const dayBranch = d.sajuInfo.dayPillar.charAt(1);
  const dayBranchElem = jiElement(dayBranch);
  const monthBranch = d.sajuInfo.monthPillar.charAt(1);

  // 5년 내 길운(rating ≤ 4)이 들어오면 그쪽으로 시기를 당겨주고, 아니면 현재 나이부터 4년.
  const earliestGood = d.daeun.find(p =>
    p.startAge >= d.currentAge && p.startAge <= d.currentAge + 5 && p.rating <= 4
  );
  const ageStart = earliestGood ? earliestGood.startAge : d.currentAge;
  const ageEnd = ageStart + 4;
  const ageRange = `${ageStart}~${ageEnd}세`;

  // 시즌: 배우자/귀인 = 일지 오행 계절, 악연 = 충하는 지지의 오행
  let seasonBranchElem = dayBranchElem;
  if (target === "enemy") {
    // 일지를 충하는 지지 → 그 오행 계절
    const CHUNG_PARTNER: Record<string, string> = {
      자: "오", 오: "자", 축: "미", 미: "축", 인: "신", 신: "인",
      묘: "유", 유: "묘", 진: "술", 술: "진", 사: "해", 해: "사",
    };
    const partner = CHUNG_PARTNER[dayBranch] ?? monthBranch;
    seasonBranchElem = jiElement(partner);
  }
  const season = elementToSeason(seasonBranchElem);

  const top = topSipShin(d.sipShin, 1)[0];
  const SITUATION_BY_SS: Record<SipShin, string> = {
    비견: "취미 모임이나 동호회",
    겁재: "스포츠·경쟁 활동의 장",
    식신: "맛집·여행지 같은 일상의 즐거움",
    상관: "전시·공연·창작 모임",
    편재: "사업/네트워킹 모임",
    정재: "직장이나 정기 모임",
    편관: "도전적 환경(군경·운동·의료 현장)",
    정관: "공식적 자리(직장·세미나)",
    편인: "독서·연구 모임, 종교 공간",
    정인: "교육 기관, 학습 모임",
  };
  let situation = SITUATION_BY_SS[top];
  if (target === "guardian") situation = `${situation} (전문성을 인정받는 자리)`;
  if (target === "enemy") situation = `${situation} (가까이 있을 때 가장 위험)`;

  return { ageRange, season, situation };
}

/**
 * 결혼 타임라인 — 정관(여자)/정재(남자) 십신 강도 + 가까운 길운 대운 기반.
 * 만남 나이는 currentAge 이상, currentAge + 10 이내로 클램프 (이미 결혼 적령기 지난 경우 +5 이내).
 */
export function deriveTimeline(d: ManseryeokData): Timeline {
  const isMale = d.gender === "male";
  const partnerSS = isMale ? d.sipShin.정재 + d.sipShin.편재 : d.sipShin.정관 + d.sipShin.편관;

  // 5년 내 길운(≤4) 대운이 있으면 그 시작점, 아니면 현재 나이 + 1
  const earliestGood = d.daeun.find(p =>
    p.startAge >= d.currentAge && p.startAge <= d.currentAge + 5 && p.rating <= 4
  );
  const meetAgeNum = earliestGood ? earliestGood.startAge : d.currentAge + 1;

  const datingMonths = partnerSS >= 3 ? 18 : partnerSS >= 1 ? 24 : 30;
  const datingPeriod = datingMonths >= 24 ? `${Math.round(datingMonths / 12)}년` : `${datingMonths}개월`;

  const marriageAgeNum = meetAgeNum + Math.round(datingMonths / 12);
  const children = partnerSS >= 4 ? "2~3명" : partnerSS >= 2 ? "1~2명" : "1명";

  return {
    meetAge: `${meetAgeNum}세 전후`,
    datingPeriod,
    marriageAge: `${marriageAgeNum}~${marriageAgeNum + 1}세`,
    children,
  };
}

// ─────────────────────────────────────────────────────────────
// 월별 인연운 / 귀인운 / 악연 위험도
// ─────────────────────────────────────────────────────────────

/** rating(0대길~9대흉) → 점수(0~100). target=positive: 길할수록 ↑, negative: 흉할수록 ↑ */
function ratingToScore(rating: number, mode: "positive" | "negative"): number {
  if (mode === "positive") return Math.round(40 + (9 - rating) * (55 / 9)); // 40~95
  return Math.round(30 + rating * (55 / 9));                                // 30~85
}

export function deriveMonthlyChance(d: ManseryeokData): number[] {
  return d.monthlyFortune.map(m => ratingToScore(m.rating, "positive"));
}
export function deriveMonthlyLuck(d: ManseryeokData): number[] {
  return d.monthlyFortune.map(m => ratingToScore(m.rating, "positive"));
}
export function deriveMonthlyDanger(d: ManseryeokData): number[] {
  return d.monthlyFortune.map(m => ratingToScore(m.rating, "negative"));
}

// ─────────────────────────────────────────────────────────────
// 인연 준비도
// ─────────────────────────────────────────────────────────────

export function deriveReadiness(d: ManseryeokData): { score: number; comment: string } {
  const cd = d.currentDaeunIndex >= 0 ? d.daeun[d.currentDaeunIndex] : null;
  const daeunRating = cd?.rating ?? 5;
  const yearRating = d.yearlyFortune.rating;

  // 대운(40%) + 세운(30%) + 천간합 보너스(15%) + 균형(15%)
  let score = 40;
  score += (9 - daeunRating) * (25 / 9);
  score += (9 - yearRating) * (20 / 9);
  score += Math.min(d.innerHapChung.ganHapCount, 3) * 5;
  if (d.elements.isBalanced) score += 8;
  if (d.innerHapChung.spousePalaceClash) score -= 8;
  score = clamp(Math.round(score), 50, 95);

  const tone =
    score >= 80 ? "현재 인연의 기운이 매우 강하게 흐르고 있어, 진심으로 다가서면 결실을 맺기 좋은 시기입니다."
    : score >= 65 ? "인연을 맞이할 준비가 되어가는 중이며, 자신의 매력을 다듬으면 자연스럽게 좋은 만남이 이어집니다."
    : "지금은 자신을 가꾸고 내면을 정돈할 시기이며, 조급함을 내려놓을수록 좋은 인연이 다가옵니다.";

  return { score, comment: tone };
}

// ─────────────────────────────────────────────────────────────
// 한 줄 궁합 / 핵심 특성
// ─────────────────────────────────────────────────────────────

export function deriveOneLineCompatibility(d: ManseryeokData): string {
  const dayBranch = d.sajuInfo.dayPillar.charAt(1);
  const dayBranchElem = jiElement(dayBranch);
  const dayElem = d.elements.dayElement;

  if (d.innerHapChung.ganHapCount >= 1) return "끊을 수 없는 운명의 끈으로 이어진 인연";
  if (isSaeng(dayBranchElem, dayElem)) return "곁에 있을수록 서로를 빛내주는 상생의 인연";
  if (d.innerHapChung.samhapElements.length > 0) return "시간이 지날수록 더 단단해지는 인연";
  if (d.innerHapChung.spousePalaceClash) return "부딪치며 깊어지는 강렬한 인연";
  return "잔잔하지만 오래 가는 신뢰의 인연";
}

export function deriveCharacteristics(d: ManseryeokData): string[] {
  const top = topSipShin(d.sipShin, 3);
  return top.map(t => SIPSHIN_TRAITS[t].keyword);
}

// ─────────────────────────────────────────────────────────────
// 좋아하는 것 (음식/음악/영화/장소) — 일간 오행 기반
// ─────────────────────────────────────────────────────────────

const FAVORITE_BY_ELEMENT: Record<string, SajuAnalysis["favoriteThings"]> = {
  木: { food: "샐러드·비건·신선한 채소 중심",   music: "어쿠스틱·재즈·인디",        movie: "예술 영화·다큐멘터리",   place: "공원·식물원·산책로" },
  火: { food: "매콤한 한식·이국 요리·바비큐",   music: "K-pop·EDM·라이브 무대",     movie: "로맨스·뮤지컬·드라마",   place: "활기찬 거리·페스티벌·핫플" },
  土: { food: "한정식·집밥·따뜻한 국물 요리",   music: "발라드·OST·잔잔한 클래식",  movie: "가족 드라마·휴먼",       place: "전통 카페·한옥·고즈넉한 마을" },
  金: { food: "고급 다이닝·정제된 코스 요리",   music: "클래식·재즈·J-pop",         movie: "스릴러·느와르·미스터리", place: "갤러리·미술관·디자인 호텔" },
  水: { food: "해산물·일식·아시안 누들",         music: "Lo-fi·앰비언트·시티팝",     movie: "SF·예술 다큐·독립영화",  place: "바닷가·도서관·재즈바" },
};

export function deriveFavoriteThings(d: ManseryeokData): SajuAnalysis["favoriteThings"] {
  return FAVORITE_BY_ELEMENT[d.elements.dayElement] ?? FAVORITE_BY_ELEMENT.土;
}

// ─────────────────────────────────────────────────────────────
// 주의사항 / 조언 — 약한 십신/오행 보완
// ─────────────────────────────────────────────────────────────

export function deriveCaution(d: ManseryeokData): string[] {
  const out: string[] = [];
  if (d.innerHapChung.spousePalaceClash) {
    out.push("일지(배우자궁)에 충/형이 있어 가까운 사이일수록 사소한 말투에 상처받기 쉬우니 표현을 다듬어야 합니다.");
  }
  if (d.sipShin.겁재 >= 2) {
    out.push("겁재가 강해 경쟁심이 사랑을 가릴 수 있으니, 함께 이기려는 마음보다 함께 채워주는 방향을 유지하세요.");
  }
  if (d.sipShin.상관 >= 2) {
    out.push("상관 기운이 강해 직설적 표현이 오해를 부를 수 있으니, 한 박자 쉬고 말하는 습관이 필요합니다.");
  }
  if (d.elements.weakest === "金" || d.elements.weakest === "水") {
    out.push(`${d.elements.weakest} 기운이 부족해 결단/정리가 늦어질 수 있으니, 인연도 늘 점검과 정돈이 필요합니다.`);
  }
  while (out.length < 3) {
    out.push("처음의 강한 끌림보다 일관된 행동을 보고 인연의 신뢰를 쌓아가세요.");
  }
  return out.slice(0, 3);
}

export function deriveAdvice(d: ManseryeokData): string[] {
  const top = topSipShin(d.sipShin, 3);
  const out: string[] = [];
  if (top.includes("정관") || top.includes("정재"))
    out.push("정기적 모임/직장처럼 일관된 환경에서 인연이 자라니, 새로운 자리보다 늘 가던 곳을 더 정성껏 가꾸세요.");
  if (top.includes("식신") || top.includes("상관"))
    out.push("취미·창작·여행 같은 표현 활동을 공유하는 자리에서 자연스럽게 마음이 이어집니다.");
  if (top.includes("정인") || top.includes("편인"))
    out.push("배움·전시·강연 같은 지적 자극이 있는 공간에서 가치관이 맞는 사람을 만날 가능성이 높습니다.");
  if (out.length < 3)
    out.push("운동·산책 등 몸을 움직이는 루틴을 늘리면 기운이 풀리며 인연 자석 효과가 생깁니다.");
  if (out.length < 3)
    out.push("주변에 솔직한 호감을 표현하는 연습부터 시작하면 인연 회로가 빠르게 열립니다.");
  return out.slice(0, 3);
}

// ─────────────────────────────────────────────────────────────
// Body Spec — 일간 오행 기반 추정 (서술은 AI가 보강)
// ─────────────────────────────────────────────────────────────

const BODY_BY_ELEMENT: Record<string, BodySpec> = {
  木: { height: "170~178cm",      figure: "키가 크고 곧은 체형",         fashion: "단정한 미니멀·오피스룩",          vibe: "지적이고 곧은 분위기" },
  火: { height: "165~173cm",      figure: "균형 잡힌 활동적 체형",       fashion: "포인트 컬러를 살린 캐주얼",       vibe: "밝고 화사한 분위기" },
  土: { height: "163~170cm",      figure: "안정감 있는 중후한 체형",     fashion: "베이직·내추럴 스타일",            vibe: "편안하고 따뜻한 분위기" },
  金: { height: "168~176cm",      figure: "단단하고 라인이 살아있는 체형", fashion: "심플하고 정돈된 모던 스타일",   vibe: "세련되고 단정한 분위기" },
  水: { height: "166~174cm",      figure: "유연하고 슬림한 체형",        fashion: "레이어드·도시적 캐주얼",          vibe: "차분하고 사색적인 분위기" },
};

export function deriveBodySpec(d: ManseryeokData): BodySpec {
  return BODY_BY_ELEMENT[d.elements.dayElement] ?? BODY_BY_ELEMENT.土;
}

// ─────────────────────────────────────────────────────────────
// 케미 타입 — 일간↔일지/월지 오행 관계 기반
// ─────────────────────────────────────────────────────────────

export function deriveChemistryType(d: ManseryeokData): { name: string; emoji: string; desc: string } {
  const dayElem = d.elements.dayElement;
  const monthElem = jiElement(d.sajuInfo.monthPillar.charAt(1));
  const dayBranchElem = jiElement(d.sajuInfo.dayPillar.charAt(1));

  if (d.innerHapChung.ganHapCount >= 1) {
    return { name: "운명적 소울메이트 케미", emoji: "🔮",
      desc: "두 사람 사이에 끊어지지 않는 강한 인연의 끈이 있어, 멀어졌다가도 결국 다시 이어지는 관계입니다." };
  }
  if (isSaeng(dayElem, monthElem) || isSaeng(dayElem, dayBranchElem)) {
    return { name: "서로를 키워주는 상생 케미", emoji: "🌱",
      desc: "한쪽의 강점이 다른 쪽의 빈자리를 채워주며, 함께 있을수록 둘 다 성장하는 관계입니다." };
  }
  if (d.innerHapChung.samhapElements.length > 0) {
    return { name: "오래 갈수록 깊어지는 안정 케미", emoji: "🪴",
      desc: "처음의 설렘은 잔잔하지만 시간이 지날수록 단단해지는, 가족처럼 편안한 관계입니다." };
  }
  if (d.innerHapChung.chungCount >= 2 || d.innerHapChung.spousePalaceClash) {
    return { name: "부딪칠수록 빠져드는 불꽃 케미", emoji: "🔥",
      desc: "강하게 끌리고 강하게 부딪히지만, 그 긴장 속에서 서로의 진짜 모습을 발견하는 관계입니다." };
  }
  return { name: "잔잔하고 따뜻한 안식처 케미", emoji: "🫧",
    desc: "큰 자극보다 일상의 소소함을 함께 나누며, 지친 하루의 끝에 서로의 쉼이 되어주는 관계입니다." };
}

// ─────────────────────────────────────────────────────────────
// 사랑 언어 / 첫 데이트 / 갈등&화해 — 십신 기반 (간결한 한 줄 + AI 보강 가능)
// ─────────────────────────────────────────────────────────────

export function deriveLoveLanguage(d: ManseryeokData): { primary: string; secondary: string; desc: string } {
  const top = topSipShin(d.sipShin, 2);
  const MAP: Record<SipShin, string> = {
    정관: "함께하는 시간",
    편관: "스킨십",
    정재: "선물",
    편재: "함께하는 시간",
    정인: "인정하는 말",
    편인: "인정하는 말",
    식신: "봉사",
    상관: "함께하는 시간",
    비견: "봉사",
    겁재: "스킨십",
  };
  const primary = MAP[top[0]];
  const secondary = MAP[top[1]] === primary ? MAP[top[1] === "정관" ? "식신" : "정관"] : MAP[top[1]];
  return {
    primary,
    secondary,
    desc: `상대는 ${primary}으로 사랑을 가장 깊이 느끼며, ${secondary}이 더해질 때 마음이 활짝 열리는 사람입니다.`,
  };
}

// ─────────────────────────────────────────────────────────────
// 귀인 분석 — 정관·정인·정재·식신 강한 영역
// ─────────────────────────────────────────────────────────────

export function deriveLuckAreas(d: ManseryeokData): { area: string; desc: string; score: number }[] {
  const ss = d.sipShin;
  const candidates: { area: string; desc: string; score: number }[] = [
    { area: "재정",     desc: "금전 기회를 열어주고 안정적인 수익 흐름을 도와줍니다.",     score: 65 + ss.정재 * 6 + ss.편재 * 3 },
    { area: "커리어",   desc: "경력 발전과 승진의 결정적 디딤돌이 되어줍니다.",         score: 65 + ss.정관 * 6 + ss.편관 * 3 },
    { area: "학업·지혜", desc: "배움과 깊은 통찰을 통해 방향을 잡아줍니다.",            score: 65 + ss.정인 * 6 + ss.편인 * 3 },
    { area: "인맥",     desc: "중요한 사람들을 연결해주고 영향력을 넓혀줍니다.",        score: 65 + ss.식신 * 5 + ss.비견 * 3 },
    { area: "건강·정서", desc: "지친 마음을 회복시키고 든든한 정서적 지지를 제공합니다.", score: 65 + ss.정인 * 4 + ss.식신 * 4 },
  ];
  return candidates.sort((a, b) => b.score - a.score).slice(0, 3).map(c => ({
    ...c, score: clamp(c.score, 70, 95),
  }));
}

export function deriveGuardianType(d: ManseryeokData): { type: string; emoji: string } {
  const top = topSipShin(d.sipShin, 1)[0];
  const MAP: Record<SipShin, { type: string; emoji: string }> = {
    정관: { type: "인생 멘토형 귀인",    emoji: "🌟" },
    편관: { type: "결단 귀인",           emoji: "⚡" },
    정재: { type: "금전 귀인",           emoji: "💰" },
    편재: { type: "사업 귀인",           emoji: "💼" },
    정인: { type: "학업·지혜 귀인",       emoji: "📚" },
    편인: { type: "영감·예술 귀인",       emoji: "🎨" },
    식신: { type: "감성·복덕 귀인",       emoji: "💝" },
    상관: { type: "재능 귀인",           emoji: "✨" },
    비견: { type: "동료 귀인",           emoji: "🤝" },
    겁재: { type: "도전 귀인",           emoji: "🏃" },
  };
  return MAP[top];
}

export function deriveGuardianRelationship(d: ManseryeokData): string {
  const top = topSipShin(d.sipShin, 1)[0];
  const MAP: Record<SipShin, string> = {
    정관: "직장 상사 또는 공식 멘토형",
    편관: "사회에서 만난 강한 선배형",
    정재: "오랜 지인의 신뢰형",
    편재: "사업·네트워킹에서의 동업자형",
    정인: "스승 또는 어머니 같은 멘토형",
    편인: "전문가 또는 종교적 인연형",
    식신: "친근한 지인의 소개형",
    상관: "창의적 모임의 동료형",
    비견: "오랜 친구·동료형",
    겁재: "강한 라이벌이자 조력자형",
  };
  return MAP[top];
}

// ─────────────────────────────────────────────────────────────
// 악연 분석 — 칠살(편관)·겁재·상관·일지 충 기반
// ─────────────────────────────────────────────────────────────

export function deriveDangerAreas(d: ManseryeokData): { area: string; desc: string; score: number }[] {
  const ss = d.sipShin;
  const clashBonus = d.innerHapChung.spousePalaceClash ? 10 : 0;

  const candidates: { area: string; desc: string; score: number }[] = [
    { area: "재정",       desc: "금전 손실·사기·과한 빚보증으로 끌어들일 위험이 큽니다.",  score: 60 + ss.겁재 * 7 + ss.편재 * 3 + clashBonus },
    { area: "인간관계",   desc: "이간질과 험담으로 주변 관계를 흔들어 놓습니다.",         score: 60 + ss.상관 * 6 + ss.겁재 * 3 + clashBonus },
    { area: "감정·정신",  desc: "에너지를 빼앗고 스스로를 의심하게 만드는 패턴이 강합니다.", score: 60 + ss.편관 * 5 + ss.상관 * 4 + clashBonus },
    { area: "커리어",     desc: "경력에 발목을 잡고 평판을 손상시키는 행동을 합니다.",     score: 60 + ss.편관 * 6 + ss.겁재 * 4 + clashBonus },
  ];
  return candidates.sort((a, b) => b.score - a.score).slice(0, 3).map(c => ({
    ...c, score: clamp(c.score, 60, 92),
  }));
}

export function deriveEnemyType(d: ManseryeokData): { type: string; emoji: string } {
  const ss = d.sipShin;
  const max = Math.max(ss.겁재, ss.상관, ss.편관);
  if (max === ss.겁재) return { type: "경쟁·배신형 악연", emoji: "🗡️" };
  if (max === ss.상관) return { type: "험담·이간질형 악연", emoji: "🎭" };
  if (max === ss.편관) return { type: "압박·통제형 악연", emoji: "⚔️" };
  return { type: "에너지 흡혈형 악연", emoji: "🧛" };
}

export function deriveEnemyRelationship(d: ManseryeokData): string {
  const ss = d.sipShin;
  if (ss.겁재 >= 2) return "가장 가까운 지인·친구로 위장한 라이벌형";
  if (ss.상관 >= 2) return "직장 동료·SNS 지인의 가면 쓴 비방자형";
  if (ss.편관 >= 2) return "권위를 앞세운 직속 상사·고압적 파트너형";
  return "처음엔 친절했던 우연한 만남형";
}

// ─────────────────────────────────────────────────────────────
// AI 프롬프트용 만세력 컨텍스트 — saju.ts 의 buildSajuContext 보강
// ─────────────────────────────────────────────────────────────

export function buildManseryeokPromptContext(d: ManseryeokData): string {
  const cd = d.currentDaeunIndex >= 0 ? d.daeun[d.currentDaeunIndex] : null;
  const top3 = topSipShin(d.sipShin, 3);
  const RATING_LABEL = ["대길", "중길", "길", "소길", "평", "소평", "소평", "중평", "대평", "대흉"];

  const monthly = d.monthlyFortune
    .map(m => `${m.month}월 ${m.pillar}(${RATING_LABEL[m.rating]})`)
    .join(", ");

  const daeunStr = d.daeun
    .slice(0, 4)
    .map(p => `${p.startAge}~${p.endAge}세 ${p.pillar}(${RATING_LABEL[p.rating]})`)
    .join(" / ");

  return `
【만세력 분석 데이터 — 이 사람의 운명 흐름】
- 현재 나이: ${d.currentAge}세
- 신강신약: ${d.elements.isSinGang ? "신강(身强)" : "신약(身弱)"}
- 오행 분포: 木${d.elements.counts["木"]} 火${d.elements.counts["火"]} 土${d.elements.counts["土"]} 金${d.elements.counts["金"]} 水${d.elements.counts["水"]}
- 강한 십신 Top3: ${top3.map(t => `${t}(${d.sipShin[t]}회)`).join(", ")}
- 사주 내 합/충: 천간합 ${d.innerHapChung.ganHapCount}회, 육합 ${d.innerHapChung.yukhapCount}회, 충 ${d.innerHapChung.chungCount}회, 형 ${d.innerHapChung.hyungCount}회
- 배우자궁(일지) 충/형 발생: ${d.innerHapChung.spousePalaceClash ? "있음(불안 요소)" : "없음(안정)"}
- 현재 대운: ${cd ? `${cd.startAge}~${cd.endAge}세 ${cd.pillar}(${RATING_LABEL[cd.rating]})` : "—"}
- 향후 대운 흐름: ${daeunStr}
- 올해 세운: ${d.yearlyFortune.pillar}(${RATING_LABEL[d.yearlyFortune.rating]})
- 올해 월별: ${monthly}
- 삼재: ${d.samjae.isSamjae ? `현재 ${d.samjae.type}삼재 진입` : `해당없음 (대상 연도: ${d.samjae.samjaeYears.join("/") || "—"})`}

【지침】
위 만세력 데이터를 근거로, 점수·시기 등 수치 필드는 수정하지 말고
오직 서술 텍스트(외모/성격/장면 묘사 등)만 풍부하게 작성하세요.`.trim();
}

// ─────────────────────────────────────────────────────────────
// 한 번에 묶어서 SajuAnalysis/Guardian/Enemy 의 base 객체 생성
// ─────────────────────────────────────────────────────────────

export function buildSpouseAnalysisBase(d: ManseryeokData): Omit<SajuAnalysis, "description" | "imagePrompt" | "personality" | "loveStyle" | "firstMeet" | "lifeStyle" | "nameHint" | "pastLife" | "kakaoFirstMessage" | "firstDate" | "conflictAndMakeup" | "myCharm" | "warnType" | "celebrityVibe" | "partnerPsychology" | "actionGuide"> {
  return {
    characteristics: deriveCharacteristics(d),
    sajuInfo: d.sajuInfo,
    mbti: deriveMBTI(d),
    job: deriveJob(d),
    hobbies: deriveHobbies(d),
    compatibility: deriveOneLineCompatibility(d),
    bodySpec: deriveBodySpec(d),
    compatibilityScores: deriveCompatibilityScores(d),
    meetTiming: deriveMeetTiming(d, "spouse"),
    timeline: deriveTimeline(d),
    monthlyChance: deriveMonthlyChance(d),
    readiness: deriveReadiness(d),
    favoriteThings: deriveFavoriteThings(d),
    chemistryType: deriveChemistryType(d),
    caution: deriveCaution(d),
    advice: deriveAdvice(d),
    loveLanguage: deriveLoveLanguage(d),
  };
}

export function buildGuardianAnalysisBase(d: ManseryeokData): Pick<
  GuardianAnalysis,
  "sajuInfo" | "characteristics" | "guardianType" | "guardianTypeEmoji" | "relationship"
  | "luckAreas" | "meetTiming" | "monthlyLuck" | "readiness" | "caution" | "actionGuide"
> {
  const gt = deriveGuardianType(d);
  return {
    sajuInfo: d.sajuInfo,
    characteristics: deriveCharacteristics(d),
    guardianType: gt.type,
    guardianTypeEmoji: gt.emoji,
    relationship: deriveGuardianRelationship(d),
    luckAreas: deriveLuckAreas(d),
    meetTiming: deriveMeetTiming(d, "guardian"),
    monthlyLuck: deriveMonthlyLuck(d),
    readiness: deriveReadiness(d),
    caution: deriveCaution(d),
    actionGuide: deriveAdvice(d),
  };
}

export function buildEnemyAnalysisBase(d: ManseryeokData): Pick<
  EnemyAnalysis,
  "sajuInfo" | "characteristics" | "enemyType" | "enemyTypeEmoji" | "relationship"
  | "dangerAreas" | "meetTiming" | "monthlyDanger" | "readiness" | "caution" | "actionGuide"
> {
  const et = deriveEnemyType(d);
  return {
    sajuInfo: d.sajuInfo,
    characteristics: deriveCharacteristics(d),
    enemyType: et.type,
    enemyTypeEmoji: et.emoji,
    relationship: deriveEnemyRelationship(d),
    dangerAreas: deriveDangerAreas(d),
    meetTiming: deriveMeetTiming(d, "enemy"),
    monthlyDanger: deriveMonthlyDanger(d),
    readiness: deriveReadiness(d),
    caution: deriveCaution(d),
    actionGuide: deriveAdvice(d),
  };
}

