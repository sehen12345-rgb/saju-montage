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

/** 취미 — 일지(배우자궁) 기반 + 일간 오행 보조 */
export function deriveHobbies(d: ManseryeokData): string[] {
  // 일지별 취미 풀 (배우자궁이 취미 성향 결정)
  const DAYJI_HOBBIES: Record<string, string[]> = {
    자: ["수영", "낚시", "야경 산책", "음악 감상", "새벽 독서"],
    축: ["요리", "텃밭 가꾸기", "인테리어", "헬스", "재테크"],
    인: ["등산", "격투기", "여행", "드라이브", "익스트림 스포츠"],
    묘: ["피아노", "수채화", "카페 탐방", "꽃꽂이", "빈티지 쇼핑"],
    진: ["골프", "사진", "요리", "정원 가꾸기", "드라이브"],
    사: ["패션 스타일링", "클래식 음악", "독서", "박물관 관람", "뷰티"],
    오: ["댄스", "노래", "러닝", "소셜 파티", "여행"],
    미: ["미술·공예", "글쓰기", "동물 돌봄", "악기 연주", "원예"],
    신: ["여행", "코딩·테크", "격투기", "투자", "독서"],
    유: ["와인", "미술관", "피아노", "요가", "뷰티 루틴"],
    술: ["등산", "캠핑", "반려동물", "바비큐", "격투기"],
    해: ["음악 감상", "수영", "철학 독서", "창작 글쓰기", "명상"],
  };
  // 오행별 보조 취미 (일간 오행으로 추가 뽑기)
  const ELEMENT_EXTRA: Record<string, string[]> = {
    木: ["원예", "요가", "하이킹"],
    火: ["공연 관람", "춤", "페스티벌"],
    土: ["도예", "캠핑", "베이킹"],
    金: ["클라이밍", "수집", "와인 테이스팅"],
    水: ["스쿠버다이빙", "영화 감상", "명상"],
  };
  const dayJi = d.sajuInfo.dayPillar?.[1] ?? "";
  const pool = DAYJI_HOBBIES[dayJi] ?? ["독서", "음악", "여행"];
  const extra = ELEMENT_EXTRA[d.elements.dayElement] ?? [];

  // seed로 셔플해서 매번 다른 조합
  const seed = (d.sajuInfo.yearPillar + d.sajuInfo.monthPillar + d.sajuInfo.dayPillar + d.sajuInfo.hourPillar)
    .split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = [...pool].sort((a, b) => {
    const ha = a.charCodeAt(0) * 31 + seed;
    const hb = b.charCodeAt(0) * 31 + seed;
    return (ha % 97) - (hb % 97);
  });
  const result = shuffled.slice(0, 2);
  // 3번째는 오행 보조에서 중복 아닌 것 추가
  for (const h of extra) {
    if (!result.includes(h)) { result.push(h); break; }
  }
  if (result.length < 3) result.push(shuffled[2] ?? "독서");
  return result;
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
  const top = topSipShin(d.sipShin, 1)[0];

  if (d.innerHapChung.ganHapCount >= 1 && d.innerHapChung.yukhapCount >= 1)
    return "전생부터 약속한 듯, 끊을 수 없는 운명의 쌍끈 인연";
  if (d.innerHapChung.ganHapCount >= 1)
    return "보이지 않는 실로 이어진 운명적 소울메이트";
  if (isSaeng(dayBranchElem, dayElem) && d.elements.isSinGang)
    return "서로의 부족함을 채워주며 함께 빛나는 상생의 인연";
  if (isSaeng(dayBranchElem, dayElem))
    return "곁에 있을수록 편안해지는 자연스러운 상생 인연";
  if (d.innerHapChung.samhapElements.length > 0 && top === "정관")
    return "존경과 신뢰로 단단해지는 정석적인 인연";
  if (d.innerHapChung.samhapElements.length > 0)
    return "시간이 약이 되는, 갈수록 깊어지는 인연";
  if (d.innerHapChung.spousePalaceClash && d.sipShin.상관 >= 2)
    return "불꽃처럼 타오르다 한순간에 녹아드는 강렬한 인연";
  if (d.innerHapChung.spousePalaceClash)
    return "부딪칠수록 깊어지는 밀당 본능의 인연";
  if (isGeuk(dayElem, dayBranchElem))
    return "정반대라서 끌리는 자석 같은 인연";
  if (top === "식신" || top === "상관")
    return "함께 있으면 웃음이 끊이지 않는 활력 인연";
  if (top === "정인" || top === "편인")
    return "말 안 해도 통하는 지적 교감의 인연";
  if (top === "편재" || top === "정재")
    return "함께하면 풍요로워지는 복덩이 인연";
  return "잔잔하지만 한결같은 신뢰의 인연";
}

export function deriveCharacteristics(d: ManseryeokData): string[] {
  const top = topSipShin(d.sipShin, 3);
  return top.map(t => SIPSHIN_TRAITS[t].keyword);
}

// ─────────────────────────────────────────────────────────────
// 좋아하는 것 (음식/음악/영화/장소) — 일지(배우자궁) 기반
// ─────────────────────────────────────────────────────────────

const FAVORITE_BY_JIJI: Record<string, SajuAnalysis["favoriteThings"]> = {
  자: { food: "해산물·라멘·새벽 포장마차",           music: "Lo-fi·시티팝·재즈",           movie: "SF·다크 판타지·미스터리",       place: "바닷가·재즈바·야경 명소" },
  축: { food: "한정식·집밥·따뜻한 국물 요리",         music: "발라드·OST·잔잔한 피아노곡",   movie: "가족 드라마·휴먼 다큐",         place: "전통 한옥·카페·고즈넉한 마을" },
  인: { food: "매운 떡볶이·이국 길거리음식·바비큐",   music: "힙합·락·EDM",                  movie: "액션·어드벤처·마블 시리즈",     place: "산속 펜션·테마파크·해외 여행지" },
  묘: { food: "파스타·브런치·디저트 카페",             music: "어쿠스틱·인디·뉴에이지",       movie: "로맨스·예술 영화·지브리",       place: "숨은 카페·미술관·꽃집" },
  진: { food: "고기구이·해장국·한우 오마카세",         music: "트로트·클래식·국악 퓨전",      movie: "사극·법정 드라마·전쟁 영화",    place: "골프장·와이너리·전통 시장" },
  사: { food: "고급 다이닝·코스 요리·와인 페어링",     music: "K-pop·클럽 뮤직·라이브 무대",  movie: "뮤지컬 영화·패션 다큐·코미디",  place: "핫플레이스·루프탑 바·페스티벌" },
  오: { food: "매콤한 한식·불고기·양꼬치",             music: "댄스팝·라틴·트렌디 K-pop",     movie: "로맨틱 코미디·뮤지컬·리얼리티", place: "번화가·콘서트장·SNS 맛집" },
  미: { food: "비건·유기농·건강 도시락",               music: "뉴에이지·명상 음악·보사노바",  movie: "독립 영화·동물 다큐·힐링물",    place: "식물원·동물보호소·소규모 갤러리" },
  신: { food: "스테이크·스시 오마카세·위스키",          music: "재즈·클래식·J-pop",            movie: "스릴러·느와르·범죄 다큐",       place: "디자인 호텔·미술관·와인바" },
  유: { food: "정갈한 일식·정통 프렌치·티 코스",       music: "클래식·피아노곡·재즈 보컬",    movie: "심리극·미스터리·유럽 영화",     place: "갤러리·북카페·앤틱 숍" },
  술: { food: "캠핑 바비큐·수제버거·짬뽕",             music: "록·포크·군가풍 발라드",        movie: "전쟁 영화·의리 느와르·스포츠",  place: "캠핑장·산길·로컬 맛집" },
  해: { food: "해산물 샤브샤브·아시안 누들·간장게장",   music: "앰비언트·Lo-fi·시네마 OST",    movie: "판타지·예술 다큐·철학 영화",    place: "도서관·해변 카페·명상 센터" },
};

export function deriveFavoriteThings(d: ManseryeokData): SajuAnalysis["favoriteThings"] {
  const dayJi = d.sajuInfo.dayPillar?.[1] ?? "";
  return FAVORITE_BY_JIJI[dayJi] ?? FAVORITE_BY_JIJI.축;
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
  // 조건별 추가 주의사항 (다양화)
  const dayJi = d.sajuInfo.dayPillar?.[1] ?? "";
  if (out.length < 3 && (d.sipShin.편재 >= 2))
    out.push("편재가 강해 새로운 만남에 쉽게 끌리는 경향이 있으니, 현재 인연에 집중하는 연습이 필요합니다.");
  if (out.length < 3 && (d.sipShin.편인 >= 2))
    out.push("편인이 강해 혼자만의 세계에 빠지기 쉬우니, 상대에게 감정을 표현하는 연습이 중요합니다.");
  if (out.length < 3 && d.elements.isSinGang)
    out.push("신강 사주라 자기 주장이 뚜렷해, 상대 의견을 먼저 들으려는 자세가 인연의 질을 높입니다.");
  if (out.length < 3 && !d.elements.isSinGang)
    out.push("신약 사주라 주변 영향에 흔들리기 쉬우니, 자기 기준을 세우고 인연을 판단하세요.");
  const JIJI_CAUTION: Record<string, string> = {
    자: "밤에 감정이 깊어지는 타입이니, 새벽 감성에 휩쓸려 보내는 연락은 한 번 더 생각하세요.",
    축: "익숙함에 안주하다 새로운 인연의 신호를 놓칠 수 있으니, 가끔은 낯선 자리에도 나가보세요.",
    인: "첫 만남의 임팩트에 약해 썸만 타다 끝나기 쉬우니, 꾸준히 연락하는 습관이 중요합니다.",
    묘: "이상형 기준이 높아 현실의 좋은 사람을 놓칠 수 있으니, 완벽보다 편안함을 기준으로 보세요.",
    진: "고집이 셀 때가 있어 사소한 의견 충돌이 큰 싸움으로 번질 수 있으니, 양보의 타이밍을 아세요.",
    사: "관계에서 주도권을 쥐려는 경향이 있으니, 때로는 상대에게 리드를 맡겨보세요.",
    오: "감정 기복이 연애에 직결되니, 화가 날 때 바로 말하지 말고 한 시간 후에 대화하세요.",
    미: "우유부단할 때가 있어 상대가 답답해할 수 있으니, 작은 것부터 결정을 빨리 하는 연습을 하세요.",
    신: "완벽주의가 연인에게도 적용되면 숨 막힐 수 있으니, 70%만 맞아도 OK라는 여유를 가지세요.",
    유: "속마음을 잘 안 보여줘서 상대가 불안할 수 있으니, 의식적으로 감정을 말로 전하세요.",
    술: "한 번 마음이 떠나면 돌아오기 어려운 타입이니, 불만은 쌓기 전에 바로바로 얘기하세요.",
    해: "현실보다 이상을 쫓기 쉬우니, 눈앞의 좋은 사람을 판타지와 비교하지 마세요.",
  };
  if (out.length < 3 && JIJI_CAUTION[dayJi])
    out.push(JIJI_CAUTION[dayJi]);
  while (out.length < 3)
    out.push("처음의 강한 끌림보다 일관된 행동을 보고 인연의 신뢰를 쌓아가세요.");
  return out.slice(0, 3);
}

export function deriveAdvice(d: ManseryeokData): string[] {
  const top = topSipShin(d.sipShin, 3);
  const dayJi = d.sajuInfo.dayPillar?.[1] ?? "";
  const out: string[] = [];
  if (top.includes("정관") || top.includes("정재"))
    out.push("정기적 모임/직장처럼 일관된 환경에서 인연이 자라니, 새로운 자리보다 늘 가던 곳을 더 정성껏 가꾸세요.");
  if (top.includes("식신") || top.includes("상관"))
    out.push("취미·창작·여행 같은 표현 활동을 공유하는 자리에서 자연스럽게 마음이 이어집니다.");
  if (top.includes("정인") || top.includes("편인"))
    out.push("배움·전시·강연 같은 지적 자극이 있는 공간에서 가치관이 맞는 사람을 만날 가능성이 높습니다.");
  if (out.length < 3 && (top.includes("비견") || top.includes("겁재")))
    out.push("같은 관심사를 공유하는 동호회·팀 활동에서 경쟁이 아닌 협력 관계로 인연이 시작됩니다.");
  if (out.length < 3 && (top.includes("편관")))
    out.push("사회적으로 도전적인 프로젝트나 봉사활동에서 멋진 인연을 만날 확률이 높습니다.");
  if (out.length < 3 && (top.includes("편재")))
    out.push("새로운 경험·여행·네트워킹 모임에 적극 참여하면 예상치 못한 인연이 열립니다.");
  // 일지별 맞춤 조언
  const JIJI_ADVICE: Record<string, string> = {
    자: "밤 시간대 활동(야경·바·문화행사)에서 인연 에너지가 활성화됩니다.",
    축: "꾸준히 같은 장소를 가면 단골 인연이 열립니다. 급하게 찾지 마세요.",
    인: "운동·아웃도어 활동에서 가장 매력적인 모습이 나옵니다. 몸을 움직이세요.",
    묘: "예술·음악·카페 같은 감성적 공간에서 자연스럽게 대화가 시작됩니다.",
    진: "리더 역할을 맡는 모임이나 프로젝트에서 존경과 함께 호감이 싹틉니다.",
    사: "SNS·온라인 커뮤니티에서 먼저 대화를 시작하면 의외의 인연이 열립니다.",
    오: "파티·모임·축제에서 가장 빛나는 타입이니, 사교적인 자리를 피하지 마세요.",
    미: "봉사·돌봄 활동에서 같은 가치관의 인연을 만날 확률이 높습니다.",
    신: "자기계발·공부 모임에서 지적으로 끌리는 인연이 나타납니다.",
    유: "소규모 취미 클래스(와인·요리·미술)에서 조용히 깊은 인연이 시작됩니다.",
    술: "등산·캠핑 같은 야외 활동에서 의리로 시작해 사랑으로 발전합니다.",
    해: "명상·요가·영적 모임에서 영혼의 깊은 곳까지 통하는 인연을 만납니다.",
  };
  if (out.length < 3 && JIJI_ADVICE[dayJi])
    out.push(JIJI_ADVICE[dayJi]);
  if (out.length < 3)
    out.push("운동·산책 등 몸을 움직이는 루틴을 늘리면 기운이 풀리며 인연 자석 효과가 생깁니다.");
  if (out.length < 3)
    out.push("주변에 솔직한 호감을 표현하는 연습부터 시작하면 인연 회로가 빠르게 열립니다.");
  return out.slice(0, 3);
}

// ─────────────────────────────────────────────────────────────
// Body Spec — 일지(배우자궁) + 일간 오행 조합 기반
// ─────────────────────────────────────────────────────────────

const BODY_BY_JIJI: Record<string, BodySpec> = {
  자: { height: "167~175cm",  figure: "유연하고 슬림한 모델 체형",         fashion: "올블랙·시크한 도시적 캐주얼",          vibe: "도시적이고 미스터리한 분위기" },
  축: { height: "163~170cm",  figure: "탄탄하고 안정감 있는 체형",         fashion: "베이직·내추럴 톤의 편안한 스타일",     vibe: "믿음직하고 따뜻한 분위기" },
  인: { height: "172~180cm",  figure: "넓은 어깨에 균형 잡힌 운동 체형",   fashion: "스포티·아웃도어 캐주얼",               vibe: "당당하고 에너지 넘치는 분위기" },
  묘: { height: "164~172cm",  figure: "가늘고 균형 잡힌 우아한 체형",      fashion: "파스텔·플로럴·로맨틱 무드",            vibe: "부드럽고 감성적인 분위기" },
  진: { height: "170~178cm",  figure: "떡 벌어진 체격에 존재감 있는 체형", fashion: "정장·클래식 스타일·명품 포인트",        vibe: "듬직하고 카리스마 있는 분위기" },
  사: { height: "166~174cm",  figure: "날씬하고 비율 좋은 체형",           fashion: "트렌디·컬러풀 포인트·SNS 감성",        vibe: "화려하고 시선을 끄는 분위기" },
  오: { height: "168~176cm",  figure: "탄탄하고 활동적인 균형 체형",       fashion: "캐주얼 믹스·스트릿 패션",              vibe: "밝고 열정적인 분위기" },
  미: { height: "162~169cm",  figure: "소형에 귀엽고 아담한 체형",         fashion: "빈티지·핸드메이드·자연소재",           vibe: "소박하고 따뜻한 힐링 분위기" },
  신: { height: "170~178cm",  figure: "라인이 살아있는 단단한 체형",       fashion: "미니멀·모던·심플한 하이엔드",          vibe: "차갑고 세련된 도시적 분위기" },
  유: { height: "165~173cm",  figure: "정돈되고 단정한 슬림 체형",         fashion: "정갈한 오피스룩·모노톤 베이직",        vibe: "깔끔하고 단정한 고급스러운 분위기" },
  술: { height: "171~179cm",  figure: "근육질에 건강한 체형",              fashion: "아웃도어·밀리터리·워크웨어",           vibe: "듬직하고 의리 있는 형·오빠 분위기" },
  해: { height: "165~173cm",  figure: "유연하고 부드러운 곡선형 체형",     fashion: "레이어드·오버사이즈·보헤미안",         vibe: "몽환적이고 자유로운 예술가 분위기" },
};

export function deriveBodySpec(d: ManseryeokData): BodySpec {
  const dayJi = d.sajuInfo.dayPillar?.[1] ?? "";
  return BODY_BY_JIJI[dayJi] ?? BODY_BY_JIJI.축;
}

// ─────────────────────────────────────────────────────────────
// 케미 타입 — 일간↔일지/월지 오행 관계 기반
// ─────────────────────────────────────────────────────────────

export function deriveChemistryType(d: ManseryeokData): { name: string; emoji: string; desc: string } {
  const dayElem = d.elements.dayElement;
  const monthElem = jiElement(d.sajuInfo.monthPillar.charAt(1));
  const dayBranchElem = jiElement(d.sajuInfo.dayPillar.charAt(1));
  const top = topSipShin(d.sipShin, 2);

  if (d.innerHapChung.ganHapCount >= 1 && d.innerHapChung.yukhapCount >= 1) {
    return { name: "전생부터 약속된 운명 케미", emoji: "💫",
      desc: "천간합과 지지합이 동시에 걸려 있어, 우주가 허락한 짝이라 해도 과언이 아닌 관계. 헤어져도 결국 돌아올 수밖에 없는 끈이 있습니다." };
  }
  if (d.innerHapChung.ganHapCount >= 1) {
    return { name: "운명적 소울메이트 케미", emoji: "🔮",
      desc: "두 사람 사이에 끊어지지 않는 강한 인연의 끈이 있어, 멀어졌다가도 결국 다시 이어지는 관계입니다." };
  }
  if (isSaeng(dayElem, dayBranchElem) && isSaeng(dayElem, monthElem)) {
    return { name: "완벽한 보완 파트너 케미", emoji: "🧩",
      desc: "일지와 월지 모두 상생이라, 사생활에서도 사회생활에서도 서로를 완벽하게 보완하는 환상의 조합입니다." };
  }
  if (isSaeng(dayElem, dayBranchElem)) {
    return { name: "서로를 키워주는 상생 케미", emoji: "🌱",
      desc: "한쪽의 강점이 다른 쪽의 빈자리를 채워주며, 함께 있을수록 둘 다 성장하는 관계입니다." };
  }
  if (d.innerHapChung.samhapElements.length > 0 && top.includes("정재")) {
    return { name: "부부 사업 대박 케미", emoji: "💰",
      desc: "삼합의 안정감 위에 재물 기운까지 얹혀져, 함께하면 돈도 사랑도 불어나는 황금 궁합입니다." };
  }
  if (d.innerHapChung.samhapElements.length > 0) {
    return { name: "오래 갈수록 깊어지는 안정 케미", emoji: "🪴",
      desc: "처음의 설렘은 잔잔하지만 시간이 지날수록 단단해지는, 가족처럼 편안한 관계입니다." };
  }
  if (d.innerHapChung.spousePalaceClash && d.innerHapChung.chungCount >= 2) {
    return { name: "폭풍 속 운명 케미", emoji: "⚡",
      desc: "강렬하게 끌리고 거세게 부딪히지만, 그 태풍 한가운데에 둘만의 고요한 눈이 있는 관계. 화해 후가 가장 달콤합니다." };
  }
  if (d.innerHapChung.spousePalaceClash) {
    return { name: "부딪칠수록 빠져드는 불꽃 케미", emoji: "🔥",
      desc: "강하게 끌리고 강하게 부딪히지만, 그 긴장 속에서 서로의 진짜 모습을 발견하는 관계입니다." };
  }
  if (isGeuk(dayElem, dayBranchElem)) {
    return { name: "정반대라 끌리는 자석 케미", emoji: "🧲",
      desc: "성격도 취향도 다르지만 그래서 더 강하게 끌립니다. '이런 사람은 처음이야'라는 말이 나오는 관계." };
  }
  if (top.includes("식신") || top.includes("상관")) {
    return { name: "함께 있으면 웃음꽃 케미", emoji: "😆",
      desc: "유머와 감성이 맞아 옆에만 있어도 에너지가 충전되는 관계. 대화가 절대 끊기지 않습니다." };
  }
  if (top.includes("정인") || top.includes("편인")) {
    return { name: "말 안 해도 통하는 텔레파시 케미", emoji: "🧠",
      desc: "눈빛만으로 의도를 읽는 지적 교감의 관계. 깊은 대화가 이 커플의 최고 애정 표현입니다." };
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
  const DESC_BY_PRIMARY: Record<string, string> = {
    "함께하는 시간": "상대는 같이 있는 시간 자체가 사랑의 증거예요. 바쁘더라도 짧게라도 얼굴을 보는 게 중요하고, '오늘 뭐 했어?'보다 '나 지금 옆에 있잖아'에 마음이 녹는 사람입니다.",
    "스킨십": "상대는 말보다 손끝의 온기에 마음이 열리는 사람이에요. 가볍게 어깨를 감싸거나 손을 잡아주는 작은 접촉이 천 마디 말보다 강력합니다.",
    "선물": "상대는 '이거 보고 네 생각났어'라는 한마디에 심장이 뛰는 사람이에요. 비싼 게 아니라, 나를 기억하고 있다는 증거가 담긴 작은 선물에 감동합니다.",
    "인정하는 말": "상대는 '너 정말 대단하다', '잘하고 있어'라는 말 한마디에 세상을 얻은 기분이 되는 사람이에요. 진심 어린 칭찬이 이 사람의 사랑 연료입니다.",
    "봉사": "상대는 말이나 선물보다 행동으로 사랑을 느끼는 사람이에요. 아플 때 죽 끓여주거나, 묵묵히 짐을 들어주는 작은 배려에 마음이 무너집니다.",
  };
  return {
    primary,
    secondary,
    desc: DESC_BY_PRIMARY[primary] ?? `상대는 ${primary}으로 사랑을 가장 깊이 느끼며, ${secondary}이 더해질 때 마음이 활짝 열리는 사람입니다.`,
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
- 격국: ${d.geokguk.name} — ${d.geokguk.description}
- 용신(用神): ${d.yongshin.element} 기운 (${d.yongshin.sipShinType}) — ${d.yongshin.description}
- 희신: ${d.yongshin.hiShin} 기운
- 일지 12운성: ${d.dayUnSeong} — 일간이 일지에서 ${d.dayUnSeong} 단계에 있음
- 통근: ${d.tongGeun.description} (강도 ${d.tongGeun.score}/10, 뿌리: ${d.tongGeun.roots.join("/") || "없음"})
- 신살: ${d.sinSal.active.length > 0 ? d.sinSal.active.join(", ") : "특별 신살 없음"}

【사주 전문 해석 지침】
- 격국(${d.geokguk.name})의 특성을 인물 묘사에 반드시 반영하세요
- 용신(${d.yongshin.element})과 희신(${d.yongshin.hiShin}) 기운이 강한 사람/환경을 긍정적으로 서술하세요
- 신살(${d.sinSal.active.length > 0 ? d.sinSal.active.map(s => s.split("—")[0].trim()).join(", ") : "없음"})이 있다면 그 특성을 자연스럽게 녹여내세요
- 12운성 ${d.dayUnSeong} 단계의 에너지를 현재 시기 서술에 반영하세요

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

