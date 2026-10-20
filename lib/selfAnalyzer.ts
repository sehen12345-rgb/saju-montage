/**
 * 자기 사주 분석 기본 데이터 도출 (만세력 기반 결정론적 필드)
 * analyze-self route에서 추출, 다른 route에서도 공유 가능.
 */
import type { ManseryeokData } from "./manseryeok";
import type { SelfSajuAnalysis } from "./types";
import {
  deriveMBTI,
  deriveCharacteristics,
  deriveCaution,
  deriveAdvice,
} from "./sajuAnalyzer";

// ── 일간 오행별 한 줄 요약 ──
const ONE_LINE_SUMMARY: Record<string, string> = {
  갑: "곧게 뻗는 나무처럼 원칙과 추진력으로 자신만의 길을 개척하는 사람",
  을: "바람에 유연한 풀처럼 섬세한 감성과 공감력으로 주변을 따뜻하게 하는 사람",
  병: "태양처럼 강렬하게 빛나며 열정과 에너지로 주변을 이끄는 사람",
  정: "촛불처럼 은은하게 타오르며 섬세한 감성과 따뜻한 마음으로 사랑받는 사람",
  무: "대지처럼 넉넉하고 묵직하게 모든 것을 품어주는 신뢰의 사람",
  기: "비옥한 땅처럼 꼼꼼한 배려와 성실함으로 주변을 돌보는 사람",
  경: "강철처럼 단단한 의지와 정의감으로 자신의 원칙을 지키는 사람",
  신: "보석처럼 날카롭고 정제된 감각과 언어로 빛을 발하는 사람",
  임: "큰 강처럼 넓은 시야와 자유로운 지성으로 세상을 탐구하는 사람",
  계: "이슬비처럼 조용하지만 깊은 통찰과 섬세한 감수성을 가진 사람",
};

const LUCKY_BY_ELEMENT: Record<string, string[]> = {
  木: ["초록·파랑 컬러 아이템", "동쪽·동남쪽 방향", "목요일·봄 시즌"],
  火: ["빨강·주황 컬러 아이템", "남쪽 방향", "화요일·여름 시즌"],
  土: ["노랑·황토 컬러 아이템", "중앙·남서쪽 방향", "토요일·환절기"],
  金: ["흰색·금색 아이템", "서쪽·북서쪽 방향", "금요일·가을 시즌"],
  水: ["검정·파란 컬러 아이템", "북쪽 방향", "수요일·겨울 시즌"],
};

export function buildSelfBase(
  manseryeok: ManseryeokData,
  name: string,
): Omit<SelfSajuAnalysis, "personality" | "career" | "wealthFortune" | "loveStyle" | "healthCaution" | "thisYearFortune"> {
  const d = manseryeok;
  const dayMasterStem = d.sajuInfo.dayPillar.charAt(0);
  const oneLineSummary = ONE_LINE_SUMMARY[dayMasterStem] ?? "사주의 기운을 타고난 독특한 사람";

  // 대운 흐름 (최대 5개)
  const lifePhases = d.daeun.slice(0, 5).map(p => ({
    age: `${p.startAge}~${p.endAge}세`,
    theme: p.pillar,
    rating: 100 - Math.round(p.rating / 9 * 100),
  }));

  // 현재 대운
  const cd = d.currentDaeunIndex >= 0 ? d.daeun[d.currentDaeunIndex] : d.daeun[0];
  const currentDaeun = cd?.pillar ?? "—";
  const currentDaeunAge = cd ? `${cd.startAge}~${cd.endAge}세` : "—";

  // 월별 운세 (만세력 기반, 0~100 변환)
  const RATING_TO_SCORE = [95, 88, 82, 75, 65, 60, 55, 50, 45, 38, 30, 22];
  const monthlyFortune = d.monthlyFortune.map(m => RATING_TO_SCORE[Math.min(m.rating, 11)] ?? 60);

  // 행운 키워드 (부족한 오행 → 보완 방향)
  const weak = d.elements.weakest;
  const luckyElements = LUCKY_BY_ELEMENT[weak] ?? ["균형 잡힌 오행 보완", "자연과 가까운 환경", "꾸준한 루틴"];

  // 전문 분석 필드
  const geokguk = d.geokguk.name;
  const yongshin = `${d.yongshin.element} (${d.yongshin.sipShinType}) — ${d.yongshin.description}`;
  const sinSal = d.sinSal.active.length > 0 ? d.sinSal.active : undefined;
  const dayUnSeong = d.dayUnSeong;

  return {
    sajuInfo: d.sajuInfo,
    elementCounts: d.elements.counts,
    dayMasterElement: d.elements.dayElement,
    dayMasterStem,
    isSinGang: d.elements.isSinGang,
    mbti: deriveMBTI(d),
    characteristics: deriveCharacteristics(d),
    oneLineSummary,
    strengths: deriveAdvice(d),
    weaknesses: deriveCaution(d),
    currentDaeun,
    currentDaeunAge,
    monthlyFortune,
    lifePhases,
    luckyElements,
    actionNow: deriveAdvice(d),
    geokguk,
    yongshin,
    sinSal,
    dayUnSeong,
  };
}
