/**
 * 만세력 기반 분석 엔진
 *
 * lib/saju.ts 의 4기둥 계산을 기반으로
 * - 대운/세운/월운, 길흉 등급
 * - 합/충/형(刑) 분석, 오행 분포
 * - 십신(十神) 도출
 * - 배우자/귀인/악연 분석에 필요한 모든 수치 필드 도출
 *
 * 모든 출력값은 결정론적(난수 없음). AI 호출은 서술 텍스트에만 사용.
 */
import type { SajuInfo } from "./types";
import { GAN_ELEMENT, JI_ELEMENT, daysToNearestJeol } from "./saju";
import { calculateFourPillars } from "manseryeok";

// ─────────────────────────────────────────────────────────────
// 기본 상수
// ─────────────────────────────────────────────────────────────

export const CHEONGAN = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const JIJI = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;

export const YANG_STEMS = ["갑", "병", "무", "경", "임"];

/** 지장간 (지지 → 숨은 천간 배열) */
export const HIDDEN_STEMS: Record<string, string[]> = {
  자: ["임", "계"],
  축: ["계", "신", "기"],
  인: ["무", "병", "갑"],
  묘: ["갑", "을"],
  진: ["을", "계", "무"],
  사: ["무", "경", "병"],
  오: ["병", "기", "정"],
  미: ["정", "을", "기"],
  신: ["무", "임", "경"],
  유: ["경", "신"],
  술: ["신", "정", "무"],
  해: ["무", "갑", "임"],
};

/** 천간 → 오행(木/火/土/金/水) */
export function ganElement(stem: string): string {
  return (GAN_ELEMENT[stem] ?? "").split("(")[0];
}
/** 지지 → 오행 */
export function jiElement(branch: string): string {
  return JI_ELEMENT[branch] ?? "";
}

/** 천간이 양인지 */
export function isYangStem(stem: string): boolean {
  return YANG_STEMS.includes(stem);
}

/** 오행 상생: 木→火→土→金→水→木 */
const SAENG_NEXT: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
/** 오행 상극: 木→土, 土→水, 水→火, 火→金, 金→木 */
const GEUK_NEXT: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

/** 두 오행이 상생 관계인지 (방향 무관) */
export function isSaeng(a: string, b: string): boolean {
  return SAENG_NEXT[a] === b || SAENG_NEXT[b] === a;
}
/** 두 오행이 상극 관계인지 (방향 무관) */
export function isGeuk(a: string, b: string): boolean {
  return GEUK_NEXT[a] === b || GEUK_NEXT[b] === a;
}

// ─────────────────────────────────────────────────────────────
// 합/충/형
// ─────────────────────────────────────────────────────────────

/** 천간합 결과 오행 (5쌍) */
const CHEONGAN_HAP: Record<string, { partner: string; result: string }> = {
  갑: { partner: "기", result: "土" },
  기: { partner: "갑", result: "土" },
  을: { partner: "경", result: "金" },
  경: { partner: "을", result: "金" },
  병: { partner: "신", result: "水" },
  신: { partner: "병", result: "水" },
  정: { partner: "임", result: "木" },
  임: { partner: "정", result: "木" },
  무: { partner: "계", result: "火" },
  계: { partner: "무", result: "火" },
};

/** 육합(지지 6쌍) */
const YUKHAP_PAIRS: [string, string][] = [
  ["자", "축"], ["인", "해"], ["묘", "술"],
  ["진", "유"], ["사", "신"], ["오", "미"],
];

/** 삼합(三合) */
const SAMHAP: Record<string, string[]> = {
  水: ["신", "자", "진"],
  木: ["해", "묘", "미"],
  火: ["인", "오", "술"],
  金: ["사", "유", "축"],
};

/** 충(沖) */
const CHUNG_PAIRS: [string, string][] = [
  ["자", "오"], ["축", "미"], ["인", "신"],
  ["묘", "유"], ["진", "술"], ["사", "해"],
];

/** 형(刑) */
const HYUNG_PAIRS: [string, string][] = [
  ["인", "사"], ["사", "신"], ["신", "인"],
  ["축", "술"], ["술", "미"], ["미", "축"],
  ["자", "묘"], ["묘", "자"],
];

function isPairIn(a: string, b: string, list: [string, string][]): boolean {
  return list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}
export function isYukhap(a: string, b: string): boolean { return isPairIn(a, b, YUKHAP_PAIRS); }
export function isChung(a: string, b: string): boolean  { return isPairIn(a, b, CHUNG_PAIRS); }
export function isHyung(a: string, b: string): boolean  { return isPairIn(a, b, HYUNG_PAIRS); }

/** 천간합 partner 가져오기 */
export function ganHapPartner(stem: string): string | null {
  return CHEONGAN_HAP[stem]?.partner ?? null;
}

// ─────────────────────────────────────────────────────────────
// 십신(十神) 분석 — 일간을 기준으로 다른 천간/지지의 관계
// ─────────────────────────────────────────────────────────────

/** 십신 명칭 */
export type SipShin =
  | "비견" | "겁재"  // 일간과 같은 오행
  | "식신" | "상관"  // 일간이 생하는 오행
  | "편재" | "정재"  // 일간이 극하는 오행
  | "편관" | "정관"  // 일간을 극하는 오행
  | "편인" | "정인"; // 일간을 생하는 오행

/**
 * 일간을 기준으로 대상 천간의 십신 도출.
 * 같은 음양: 비견/식신/편재/편관/편인
 * 다른 음양: 겁재/상관/정재/정관/정인
 */
export function getSipShin(dayStem: string, targetStem: string): SipShin {
  const dayElem = ganElement(dayStem);
  const tgtElem = ganElement(targetStem);
  const dayYang = isYangStem(dayStem);
  const tgtYang = isYangStem(targetStem);
  const sameYY = dayYang === tgtYang;

  if (dayElem === tgtElem) return sameYY ? "비견" : "겁재";
  if (SAENG_NEXT[dayElem] === tgtElem) return sameYY ? "식신" : "상관"; // 일간 → 대상
  if (GEUK_NEXT[dayElem] === tgtElem) return sameYY ? "편재" : "정재"; // 일간 → 대상
  if (GEUK_NEXT[tgtElem] === dayElem) return sameYY ? "편관" : "정관"; // 대상 → 일간
  if (SAENG_NEXT[tgtElem] === dayElem) return sameYY ? "편인" : "정인"; // 대상 → 일간
  return "비견"; // 안전한 기본값
}

/**
 * 사주 4기둥(천간 + 지지 + 지장간 본기)에서 십신 카운트.
 * 일간 자신은 제외.
 */
export function countSipShin(sajuInfo: SajuInfo): Record<SipShin, number> {
  const dayStem = sajuInfo.dayPillar.charAt(0);
  const counts: Record<SipShin, number> = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0,
    정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  };

  const pillars = [sajuInfo.yearPillar, sajuInfo.monthPillar, sajuInfo.dayPillar, sajuInfo.hourPillar];
  for (let i = 0; i < pillars.length; i++) {
    const stem = pillars[i].charAt(0);
    const branch = pillars[i].charAt(1);
    if (i !== 2) {
      counts[getSipShin(dayStem, stem)] += 1;
    }
    // 지장간 본기(마지막 원소)만 카운트 — 강한 영향만 반영
    const hidden = HIDDEN_STEMS[branch] ?? [];
    if (hidden.length > 0) {
      counts[getSipShin(dayStem, hidden[hidden.length - 1])] += 1;
    }
  }
  return counts;
}

// ─────────────────────────────────────────────────────────────
// 오행 분포 / 신강신약
// ─────────────────────────────────────────────────────────────

export interface ElementAnalysis {
  counts: Record<string, number>;     // 木/火/土/金/水 → 개수
  dayElement: string;                 // 일간 오행
  strongest: string;
  weakest: string;
  isBalanced: boolean;
  isSinGang: boolean;                 // 신강(身强) 경향
}

export function analyzeElements(sajuInfo: SajuInfo): ElementAnalysis {
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const pillars = [sajuInfo.yearPillar, sajuInfo.monthPillar, sajuInfo.dayPillar, sajuInfo.hourPillar];
  for (const p of pillars) {
    const ge = ganElement(p.charAt(0));
    const je = jiElement(p.charAt(1));
    if (ge) counts[ge] += 1;
    if (je) counts[je] += 1;
  }

  const dayElement = ganElement(sajuInfo.dayPillar.charAt(0));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...Object.values(counts));
  const min = Math.min(...Object.values(counts));

  // 신강(身强): 일간 오행이 월지 오행과 동일/상생 + 일간 오행 카운트 ≥ 3
  const monthBranch = sajuInfo.monthPillar.charAt(1);
  const monthElem = jiElement(monthBranch);
  const monthSupport = monthElem === dayElement || SAENG_NEXT[monthElem] === dayElement;
  const isSinGang = monthSupport && counts[dayElement] >= 3;

  return {
    counts,
    dayElement,
    strongest: sorted[0][0],
    weakest: sorted[sorted.length - 1][0],
    isBalanced: max - min <= 2,
    isSinGang,
  };
}

// ─────────────────────────────────────────────────────────────
// 길흉 등급(0=대길 ~ 9=대흉)
// ─────────────────────────────────────────────────────────────

/** 일간별 유리한 천간(요신/희신 단순화) */
const FAVORABLE_STEMS: Record<string, string[]> = {
  갑: ["갑", "병", "정", "무", "계"],
  을: ["갑", "을", "병", "정", "무", "기", "계"],
  병: ["갑", "을", "병", "무", "기", "경", "임"],
  정: ["갑", "을", "정", "무", "기", "경"],
  무: ["갑", "을", "병", "정", "무"],
  기: ["을", "병", "정", "무", "기"],
  경: ["갑", "병", "정", "무", "기", "경", "임", "계"],
  신: ["갑", "을", "신", "임", "계"],
  임: ["갑", "을", "병", "경", "임", "계"],
  계: ["갑", "을", "경", "계"],
};

/** 운(대운/세운/월운) 길흉 인덱스(0~9), 낮을수록 길함 */
export function computeRatingIndex(dayStem: string, targetStem: string, targetBranch: string): number {
  let score = 4;
  if (targetStem === dayStem) score += 3;
  const fav = FAVORABLE_STEMS[dayStem] ?? [];
  if (fav.includes(targetStem)) score += 2;
  else score -= 1;
  // 지장간에 일간이 포함되면 통근(通根) 가산점
  if ((HIDDEN_STEMS[targetBranch] ?? []).includes(dayStem)) score += 1;
  return Math.max(0, Math.min(9, 9 - Math.floor((score / 10) * 9)));
}

// ─────────────────────────────────────────────────────────────
// 대운(大運) 계산
// ─────────────────────────────────────────────────────────────

export interface DaeunPillar {
  index: number;          // 0부터 시작
  startAge: number;
  endAge: number;
  pillar: string;         // "갑자" 등 한글 2자
  rating: number;         // 0(대길)~9(대흉)
}

/**
 * 대운 시작 나이 — 정밀 절기 JD 기반.
 * 만세력 표준: |생일 ↔ 가장 가까운 절기| 일수 ÷ 3.
 * 남자 양간 / 여자 음간 → 순행, 그 외 → 역행.
 */
export function calculateDaeunStartAge(
  birthYear: number, birthMonth: number, birthDay: number, birthHour: number,
  yearStem: string, gender: "male" | "female",
): { startAge: number; isForward: boolean } {
  const isYearYang = isYangStem(yearStem);
  const isForward = (gender === "male" && isYearYang) || (gender === "female" && !isYearYang);

  const days = daysToNearestJeol(
    birthYear, birthMonth, birthDay, birthHour,
    isForward ? "forward" : "backward",
  );
  const startAge = Math.max(1, Math.min(10, Math.round(days / 3)));
  return { startAge, isForward };
}

/**
 * 8개 대운(80년) 산출.
 * 월주 천간/지지에서 출발하여 순행/역행으로 한 칸씩 이동.
 */
export function calculateDaeun(
  sajuInfo: SajuInfo,
  birthYear: number, birthMonth: number, birthDay: number, birthHour: number,
  gender: "male" | "female",
  count = 8,
): DaeunPillar[] {
  const dayStem = sajuInfo.dayPillar.charAt(0);
  const yearStem = sajuInfo.yearPillar.charAt(0);
  const monthStemIdx = CHEONGAN.indexOf(sajuInfo.monthPillar.charAt(0) as typeof CHEONGAN[number]);
  const monthBranchIdx = JIJI.indexOf(sajuInfo.monthPillar.charAt(1) as typeof JIJI[number]);

  const { startAge, isForward } = calculateDaeunStartAge(
    birthYear, birthMonth, birthDay, birthHour, yearStem, gender
  );

  const result: DaeunPillar[] = [];
  for (let i = 0; i < count; i++) {
    const stepDir = isForward ? 1 : -1;
    const sIdx = ((monthStemIdx + stepDir * (i + 1)) % 10 + 10) % 10;
    const bIdx = ((monthBranchIdx + stepDir * (i + 1)) % 12 + 12) % 12;
    const stem = CHEONGAN[sIdx];
    const branch = JIJI[bIdx];
    const sa = startAge + i * 10;
    result.push({
      index: i,
      startAge: sa,
      endAge: sa + 9,
      pillar: stem + branch,
      rating: computeRatingIndex(dayStem, stem, branch),
    });
  }
  return result;
}

/** 현재 나이의 대운 인덱스 (없으면 -1) */
export function findCurrentDaeunIndex(daeun: DaeunPillar[], currentAge: number): number {
  for (let i = 0; i < daeun.length; i++) {
    if (currentAge >= daeun[i].startAge && currentAge <= daeun[i].endAge) return i;
  }
  return -1;
}

// ─────────────────────────────────────────────────────────────
// 세운/월운
// ─────────────────────────────────────────────────────────────

/** year의 년주 천간/지지 (입춘 이전 보정 없이 단순 계산) */
function pillarOfYear(year: number): { stem: string; branch: string } {
  // 1984년 = 갑자년
  const diff = year - 1984;
  return {
    stem: CHEONGAN[((diff % 10) + 10) % 10],
    branch: JIJI[((diff % 12) + 12) % 12],
  };
}

/**
 * 특정 연도의 월별 운세(12개월) 길흉 등급.
 * 입력: 사주 + 대상 연도. 출력: 1~12월의 rating 0~9 + 천간/지지.
 */
export function calculateMonthlyFortune(sajuInfo: SajuInfo, targetYear: number): {
  month: number; pillar: string; rating: number;
}[] {
  const dayStem = sajuInfo.dayPillar.charAt(0);
  const yp = pillarOfYear(targetYear);
  const yearStemIdx = CHEONGAN.indexOf(yp.stem as typeof CHEONGAN[number]);

  // 인월(寅月, 2월) 천간 시작 — 오호둔(五虎遁)
  // 갑己년 → 丙寅, 乙庚 → 戊寅, 丙辛 → 庚寅, 丁壬 → 壬寅, 戊癸 → 甲寅
  const FIRST_MONTH_STEM_IDX = [2, 4, 6, 8, 0]; // 양간 인덱스 0/2/4/6/8 에 대해
  const yearStemMod = yearStemIdx % 5;
  const firstMonthStemIdx = FIRST_MONTH_STEM_IDX[yearStemMod];

  const result: { month: number; pillar: string; rating: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    // 양력 월 m → 사주 월 인덱스: 1월=축(1), 2월=인(2), ..., 12월=자(0)
    const monthBranchIdx = (m + 1) % 12;
    const monthOffsetFromIn = (monthBranchIdx - 2 + 12) % 12;
    const stemIdx = (firstMonthStemIdx + monthOffsetFromIn) % 10;
    const stem = CHEONGAN[stemIdx];
    const branch = JIJI[monthBranchIdx];
    result.push({
      month: m,
      pillar: stem + branch,
      rating: computeRatingIndex(dayStem, stem, branch),
    });
  }
  return result;
}

/** 특정 연도의 세운(년운) — 단순 1년 단위 길흉 */
export function calculateYearlyFortune(sajuInfo: SajuInfo, year: number): { pillar: string; rating: number } {
  const dayStem = sajuInfo.dayPillar.charAt(0);
  const yp = pillarOfYear(year);
  return {
    pillar: yp.stem + yp.branch,
    rating: computeRatingIndex(dayStem, yp.stem, yp.branch),
  };
}

// ─────────────────────────────────────────────────────────────
// 삼재(三災)
// ─────────────────────────────────────────────────────────────

const SAMJAE_MAP: Record<string, string[]> = {
  신: ["인", "묘", "진"], 자: ["인", "묘", "진"], 진: ["인", "묘", "진"],
  사: ["해", "자", "축"], 유: ["해", "자", "축"], 축: ["해", "자", "축"],
  인: ["신", "유", "술"], 오: ["신", "유", "술"], 술: ["신", "유", "술"],
  해: ["사", "오", "미"], 묘: ["사", "오", "미"], 미: ["사", "오", "미"],
};

export function calculateSamjae(birthYear: number, currentYear: number): {
  isSamjae: boolean; type?: "들" | "눌" | "날"; samjaeYears: number[];
} {
  const birthBranch = pillarOfYear(birthYear).branch;
  const samjaeBranches = SAMJAE_MAP[birthBranch] ?? [];

  const samjaeYears: number[] = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) {
    if (samjaeBranches.includes(pillarOfYear(y).branch)) samjaeYears.push(y);
  }

  const currentBranch = pillarOfYear(currentYear).branch;
  const idx = samjaeBranches.indexOf(currentBranch);
  const type: "들" | "눌" | "날" | undefined =
    idx === 0 ? "들" : idx === 1 ? "눌" : idx === 2 ? "날" : undefined;

  return { isSamjae: idx >= 0, type, samjaeYears };
}

// ─────────────────────────────────────────────────────────────
// 자기 사주 내부의 합/충 분석 (배우자궁 영향)
// ─────────────────────────────────────────────────────────────

export interface InnerHapChung {
  ganHapCount: number;       // 천간합 쌍 개수
  yukhapCount: number;       // 육합 개수
  samhapElements: string[];  // 삼합 형성된 오행
  chungCount: number;        // 충 개수
  hyungCount: number;        // 형 개수
  spousePalaceClash: boolean;// 일지에 충/형/해 직접 발생 여부
}

export function analyzeInnerHapChung(sajuInfo: SajuInfo): InnerHapChung {
  const stems = [
    sajuInfo.yearPillar.charAt(0),
    sajuInfo.monthPillar.charAt(0),
    sajuInfo.dayPillar.charAt(0),
    sajuInfo.hourPillar.charAt(0),
  ].filter(s => CHEONGAN.includes(s as typeof CHEONGAN[number]));
  const branches = [
    sajuInfo.yearPillar.charAt(1),
    sajuInfo.monthPillar.charAt(1),
    sajuInfo.dayPillar.charAt(1),
    sajuInfo.hourPillar.charAt(1),
  ].filter(b => JIJI.includes(b as typeof JIJI[number]));

  let ganHapCount = 0;
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      if (CHEONGAN_HAP[stems[i]]?.partner === stems[j]) ganHapCount += 1;
    }
  }

  let yukhapCount = 0, chungCount = 0, hyungCount = 0;
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (isYukhap(branches[i], branches[j])) yukhapCount += 1;
      if (isChung(branches[i], branches[j])) chungCount += 1;
      if (isHyung(branches[i], branches[j])) hyungCount += 1;
    }
  }

  const branchSet = new Set(branches);
  const samhapElements: string[] = [];
  for (const [elem, trio] of Object.entries(SAMHAP)) {
    if (trio.every(b => branchSet.has(b))) samhapElements.push(elem);
  }

  // 일지 충/형 → 배우자궁 깨짐
  const dayBranch = sajuInfo.dayPillar.charAt(1);
  const spousePalaceClash = branches.some(
    (b, idx) => idx !== 2 && (isChung(dayBranch, b) || isHyung(dayBranch, b))
  );

  return { ganHapCount, yukhapCount, samhapElements, chungCount, hyungCount, spousePalaceClash };
}

// ─────────────────────────────────────────────────────────────
// 12운성 (Twelve Life Stages)
// ─────────────────────────────────────────────────────────────

const UN_SEONG_12 = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"] as const;
export type UnSeong12 = typeof UN_SEONG_12[number];

const YANG_JANGSEONG: Record<string, number> = {
  갑: 11, 병: 2, 무: 2, 경: 5, 임: 8,
};
const YIN_JANGSEONG: Record<string, number> = {
  을: 6, 정: 9, 기: 9, 신: 0, 계: 3,
};

export function derive12UnSeong(dayStem: string, targetBranch: string): UnSeong12 {
  const branchIdx = JIJI.indexOf(targetBranch as typeof JIJI[number]);
  if (branchIdx < 0) return "장생";
  const isYang = YANG_STEMS.includes(dayStem);
  const startIdx = isYang ? (YANG_JANGSEONG[dayStem] ?? 0) : (YIN_JANGSEONG[dayStem] ?? 0);
  let offset: number;
  if (isYang) {
    offset = ((branchIdx - startIdx) + 12) % 12;
  } else {
    offset = ((startIdx - branchIdx) + 12) % 12;
  }
  return UN_SEONG_12[offset];
}

// ─────────────────────────────────────────────────────────────
// 용신(用神) — 억부법
// ─────────────────────────────────────────────────────────────

const GEUK_BY: Record<string, string> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
const SAENG_BY: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };

export interface YongshinResult {
  element: string;
  sipShinType: string;
  description: string;
  hiShin: string;
}

export function deriveYongshin(sajuInfo: SajuInfo, elements: ElementAnalysis, sipShin: Record<SipShin, number>): YongshinResult {
  const dayElem = elements.dayElement;
  const isSinGang = elements.isSinGang;

  const gwanElement = (Object.keys(GEUK_BY) as string[]).find(k => GEUK_BY[k] === dayElem) ?? "金";
  const inElement = (Object.keys(SAENG_BY) as string[]).find(k => SAENG_BY[k] === dayElem) ?? "水";
  const siksangElement = SAENG_BY[dayElem] ?? "火";
  const jaeElement = GEUK_BY[dayElem] ?? "土";

  if (isSinGang) {
    const biGeop = (sipShin.비견 ?? 0) + (sipShin.겁재 ?? 0);
    const inSeong = (sipShin.정인 ?? 0) + (sipShin.편인 ?? 0);
    if (inSeong >= 3) {
      return {
        element: jaeElement,
        sipShinType: "재성(財星)",
        description: `인성이 과다하여 ${jaeElement} 기운의 재성이 용신입니다. 실용적 가치를 추구하면 운이 열립니다.`,
        hiShin: siksangElement,
      };
    }
    if (biGeop >= 3) {
      return {
        element: gwanElement,
        sipShinType: "관성(官星)",
        description: `비겁이 강하여 ${gwanElement} 기운의 관성이 용신입니다. 원칙과 책임감이 운의 열쇠입니다.`,
        hiShin: jaeElement,
      };
    }
    return {
      element: siksangElement,
      sipShinType: "식상(食傷)",
      description: `신강하여 ${siksangElement} 기운의 식상이 용신입니다. 재능과 표현으로 에너지를 발산하면 길합니다.`,
      hiShin: jaeElement,
    };
  } else {
    const biGeop = (sipShin.비견 ?? 0) + (sipShin.겁재 ?? 0);
    if (biGeop >= 2) {
      return {
        element: dayElem,
        sipShinType: "비겁(比劫)",
        description: `신약하여 ${dayElem} 기운의 비겁이 용신입니다. 동료·협력자와 함께할 때 운이 상승합니다.`,
        hiShin: inElement,
      };
    }
    return {
      element: inElement,
      sipShinType: "인성(印星)",
      description: `신약하여 ${inElement} 기운의 인성이 용신입니다. 학습·배움·정신적 충만함이 운의 근원입니다.`,
      hiShin: dayElem,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// 격국(格局) — 월지 기반
// ─────────────────────────────────────────────────────────────

export interface GeokgukResult {
  name: string;
  sipShinType: string;
  element: string;
  description: string;
}

const GEOKGUK_DESC: Record<string, string> = {
  정관격: "사회적 규범과 명예를 중시하며 책임감이 강한 격국입니다. 공직·경영·법조에 적합하며 안정된 삶을 추구합니다.",
  편관격: "강한 의지와 결단력을 가진 칠살격입니다. 도전적 환경에서 빛나며 군경·의료·스포츠 분야에 적합합니다.",
  정인격: "지혜와 학문을 추구하는 격국입니다. 교육·연구·문화 분야에서 두각을 나타내며 어머니의 사랑처럼 포용력이 큽니다.",
  편인격: "독창적 직관과 예술적 감수성이 특징입니다. 기존 틀을 벗어난 창의적 분야에서 능력이 발휘됩니다.",
  식신격: "베풀고 표현하는 복덕 격국입니다. 요리·예술·교육 등 사람을 즐겁게 하는 분야에서 복이 넘칩니다.",
  상관격: "뛰어난 재능과 창의성을 가진 격국입니다. 예술·기획·언론·IT에서 남다른 성과를 냅니다.",
  정재격: "성실하고 꾸준하게 재물을 쌓는 격국입니다. 금융·회계·공무원처럼 안정적 수입이 강점입니다.",
  편재격: "기회를 포착하는 역동적 재물 격국입니다. 사업·투자·무역에서 빛나며 활동적 삶을 즐깁니다.",
  비견격: "독립심과 자존감이 강한 격국입니다. 자기 사업이나 전문직에서 자신만의 길을 개척합니다.",
  겁재격: "강한 승부욕과 추진력의 격국입니다. 경쟁 환경에서 두각을 나타내며 리더십이 강합니다.",
};

export function deriveGeokguk(sajuInfo: SajuInfo): GeokgukResult {
  const dayStem = sajuInfo.dayPillar.charAt(0);
  const monthBranch = sajuInfo.monthPillar.charAt(1);
  const hidden = HIDDEN_STEMS[monthBranch] ?? [];
  const mainStem = hidden[hidden.length - 1] ?? monthBranch;
  const sipShin = getSipShin(dayStem, mainStem);
  const element = ganElement(mainStem);

  const SIPSHIN_TO_GEOKGUK: Record<SipShin, string> = {
    정관: "정관격", 편관: "편관격", 정인: "정인격", 편인: "편인격",
    식신: "식신격", 상관: "상관격", 정재: "정재격", 편재: "편재격",
    비견: "비견격", 겁재: "겁재격",
  };

  const name = SIPSHIN_TO_GEOKGUK[sipShin];
  return {
    name,
    sipShinType: sipShin,
    element,
    description: GEOKGUK_DESC[name] ?? "사주의 기운을 온전히 발휘하는 격국입니다.",
  };
}

// ─────────────────────────────────────────────────────────────
// 신살(神殺)
// ─────────────────────────────────────────────────────────────

export interface SinSalResult {
  dohwa: boolean;
  yeokma: boolean;
  hwagae: boolean;
  yangIn: boolean;
  cheonUlGuiIn: boolean;
  munChang: boolean;
  active: string[];
}

const SINSAL_SAMHAP_GROUPS: Record<string, string[]> = {
  인오술: ["인", "오", "술"],
  해묘미: ["해", "묘", "미"],
  신자진: ["신", "자", "진"],
  사유축: ["사", "유", "축"],
};

function getSinsalSamhapGroup(branch: string): string | null {
  for (const [key, members] of Object.entries(SINSAL_SAMHAP_GROUPS)) {
    if (members.includes(branch)) return key;
  }
  return null;
}

const DOHWA_MAP: Record<string, string> = {
  인오술: "묘", 해묘미: "자", 신자진: "유", 사유축: "오",
};
const YEOKMA_MAP: Record<string, string> = {
  인오술: "신", 해묘미: "사", 신자진: "인", 사유축: "해",
};
const HWAGAE_MAP: Record<string, string> = {
  인오술: "술", 해묘미: "미", 신자진: "진", 사유축: "축",
};

const YANGIN_BRANCH: Record<string, string> = {
  갑: "묘", 병: "오", 무: "오", 경: "유", 임: "자",
};

const CHEONUL_MAP: Record<string, string[]> = {
  갑: ["축", "미"], 무: ["축", "미"], 경: ["축", "미"],
  을: ["자", "신"], 기: ["자", "신"],
  병: ["해", "유"], 정: ["해", "유"],
  임: ["묘", "사"], 계: ["묘", "사"],
  신: ["인", "오"],
};

const MUNCHANG_MAP: Record<string, string> = {
  갑: "사", 을: "오", 병: "신", 정: "유",
  무: "신", 기: "유", 경: "해", 신: "자",
  임: "인", 계: "묘",
};

export function deriveSinSal(sajuInfo: SajuInfo): SinSalResult {
  const dayStem = sajuInfo.dayPillar.charAt(0);
  const branches = [
    sajuInfo.yearPillar.charAt(1),
    sajuInfo.monthPillar.charAt(1),
    sajuInfo.dayPillar.charAt(1),
    sajuInfo.hourPillar.charAt(1),
  ].filter(b => JIJI.includes(b as typeof JIJI[number]));

  const yearBranch = sajuInfo.yearPillar.charAt(1);
  const dayBranch = sajuInfo.dayPillar.charAt(1);
  const refBranches = [yearBranch, dayBranch];

  let dohwa = false, yeokma = false, hwagae = false;
  for (const ref of refBranches) {
    const group = getSinsalSamhapGroup(ref);
    if (!group) continue;
    if (branches.includes(DOHWA_MAP[group])) dohwa = true;
    if (branches.includes(YEOKMA_MAP[group])) yeokma = true;
    if (branches.includes(HWAGAE_MAP[group])) hwagae = true;
  }

  const yangInBranch = YANGIN_BRANCH[dayStem];
  const yangIn = !!yangInBranch && YANG_STEMS.includes(dayStem) && branches.includes(yangInBranch);

  const cheonUlBranches = CHEONUL_MAP[dayStem] ?? [];
  const cheonUlGuiIn = branches.some(b => cheonUlBranches.includes(b));

  const munChangBranch = MUNCHANG_MAP[dayStem];
  const munChang = !!munChangBranch && branches.includes(munChangBranch);

  const active: string[] = [];
  if (dohwa) active.push("도화살(桃花殺) — 강한 이성적 매력");
  if (yeokma) active.push("역마살(驛馬殺) — 이동·변화·해외운");
  if (hwagae) active.push("화개살(華蓋殺) — 예술·종교·고독한 천재성");
  if (yangIn) active.push("양인살(羊刃殺) — 강렬한 추진력, 양날의 검");
  if (cheonUlGuiIn) active.push("천을귀인(天乙貴人) — 귀인의 복이 강함");
  if (munChang) active.push("문창귀인(文昌貴人) — 학문·재능·총명함");

  return { dohwa, yeokma, hwagae, yangIn, cheonUlGuiIn, munChang, active };
}

// ─────────────────────────────────────────────────────────────
// 통근(通根) 강도
// ─────────────────────────────────────────────────────────────

export interface TongGeunResult {
  score: number;
  roots: string[];
  description: string;
}

export function deriveTongGeun(sajuInfo: SajuInfo): TongGeunResult {
  const dayStem = sajuInfo.dayPillar.charAt(0);
  const dayElem = ganElement(dayStem);
  const branches = [
    sajuInfo.yearPillar.charAt(1),
    sajuInfo.monthPillar.charAt(1),
    sajuInfo.dayPillar.charAt(1),
    sajuInfo.hourPillar.charAt(1),
  ].filter(b => JIJI.includes(b as typeof JIJI[number]));

  let score = 0;
  const roots: string[] = [];

  for (const branch of branches) {
    const hidden = HIDDEN_STEMS[branch] ?? [];
    const mainIdx = hidden.length - 1;
    for (let i = 0; i < hidden.length; i++) {
      if (ganElement(hidden[i]) === dayElem) {
        const pts = i === mainIdx ? 3 : i === mainIdx - 1 ? 2 : 1;
        score += pts;
        if (!roots.includes(branch)) roots.push(branch);
      }
    }
  }

  const desc = score >= 7 ? "통근이 매우 강해 일간의 뿌리가 깊습니다."
    : score >= 4 ? "적당한 통근으로 일간이 안정적입니다."
    : score >= 1 ? "통근이 약해 외부 지원이 필요합니다."
    : "통근이 없어 일간이 뿌리 없이 허공에 떠 있는 상태입니다.";

  return { score: Math.min(score, 10), roots, description: desc };
}

// ─────────────────────────────────────────────────────────────
// 편의 함수: 입력 → 종합 만세력 데이터
// ─────────────────────────────────────────────────────────────

export interface ManseryeokData {
  sajuInfo: SajuInfo;
  elements: ElementAnalysis;
  sipShin: Record<SipShin, number>;
  innerHapChung: InnerHapChung;
  daeun: DaeunPillar[];
  currentDaeunIndex: number;
  monthlyFortune: { month: number; pillar: string; rating: number }[];
  yearlyFortune: { pillar: string; rating: number };
  samjae: ReturnType<typeof calculateSamjae>;
  birthYear: number;
  currentAge: number;
  gender: "male" | "female";
  yongshin: YongshinResult;
  geokguk: GeokgukResult;
  sinSal: SinSalResult;
  dayUnSeong: UnSeong12;
  tongGeun: TongGeunResult;
}

export function buildManseryeokData(
  birthYear: number, birthMonth: number, birthDay: number, birthHour: number,
  gender: "male" | "female",
  todayYear?: number,
): ManseryeokData {
  // 만세력 npm 패키지로 4기둥 계산 (birthHour < 0이면 정오 기준으로 계산 후 시주만 "미상" 처리)
  const effectiveHour = birthHour >= 0 ? birthHour : 12;
  const fp = calculateFourPillars({
    year: birthYear, month: birthMonth, day: birthDay,
    hour: effectiveHour, minute: 0,
  });
  const sajuInfo: SajuInfo = {
    yearPillar: fp.year.heavenlyStem + fp.year.earthlyBranch,
    monthPillar: fp.month.heavenlyStem + fp.month.earthlyBranch,
    dayPillar: fp.day.heavenlyStem + fp.day.earthlyBranch,
    hourPillar: birthHour >= 0
      ? fp.hour.heavenlyStem + fp.hour.earthlyBranch
      : "미상",
  };
  const currentYear = todayYear ?? new Date().getFullYear();
  const currentAge = currentYear - birthYear;

  const elements = analyzeElements(sajuInfo);
  const sipShin = countSipShin(sajuInfo);
  const innerHapChung = analyzeInnerHapChung(sajuInfo);
  const daeun = calculateDaeun(sajuInfo, birthYear, birthMonth, birthDay, birthHour, gender);
  const currentDaeunIndex = findCurrentDaeunIndex(daeun, currentAge);
  const monthlyFortune = calculateMonthlyFortune(sajuInfo, currentYear);
  const yearlyFortune = calculateYearlyFortune(sajuInfo, currentYear);
  const samjae = calculateSamjae(birthYear, currentYear);

  const yongshin = deriveYongshin(sajuInfo, elements, sipShin);
  const geokguk = deriveGeokguk(sajuInfo);
  const sinSal = deriveSinSal(sajuInfo);
  const dayUnSeong = derive12UnSeong(sajuInfo.dayPillar.charAt(0), sajuInfo.dayPillar.charAt(1));
  const tongGeun = deriveTongGeun(sajuInfo);

  return {
    sajuInfo, elements, sipShin, innerHapChung,
    daeun, currentDaeunIndex,
    monthlyFortune, yearlyFortune, samjae,
    birthYear, currentAge, gender,
    yongshin, geokguk, sinSal, dayUnSeong, tongGeun,
  };
}
