import { NextRequest, NextResponse } from "next/server";
import { buildSajuContext, DAY_MASTER_TRAITS } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildManseryeokPromptContext,
  deriveMBTI,
  deriveJob,
  deriveCharacteristics,
  deriveCaution,
  deriveAdvice,
} from "@/lib/sajuAnalyzer";
import type { SelfSajuAnalysis } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";

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

// ── 만세력 기반 결정론적 필드 도출 ──
function buildSelfBase(
  manseryeok: ReturnType<typeof buildManseryeokData>,
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
  const LUCKY_BY_ELEMENT: Record<string, string[]> = {
    木: ["초록·파랑 컬러 아이템", "동쪽·동남쪽 방향", "목요일·봄 시즌"],
    火: ["빨강·주황 컬러 아이템", "남쪽 방향", "화요일·여름 시즌"],
    土: ["노랑·황토 컬러 아이템", "중앙·남서쪽 방향", "토요일·환절기"],
    金: ["흰색·금색 아이템", "서쪽·북서쪽 방향", "금요일·가을 시즌"],
    水: ["검정·파란 컬러 아이템", "북쪽 방향", "수요일·겨울 시즌"],
  };
  const luckyElements = LUCKY_BY_ELEMENT[weak] ?? ["균형 잡힌 오행 보완", "자연과 가까운 환경", "꾸준한 루틴"];

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
  };
}

async function generateSelfNarrativeWithClaude(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  base: ReturnType<typeof buildSelfBase>,
  manseryeokContext: string,
  sajuContext: string,
): Promise<Partial<Pick<SelfSajuAnalysis, "personality" | "career" | "wealthFortune" | "loveStyle" | "healthCaution" | "thisYearFortune">> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";

    const prompt = `당신은 사주명리학 전문가입니다.
아래 만세력 데이터를 바탕으로 ${name}님 본인의 사주 분석 서술 텍스트를 작성하세요.
구체적이고 현실적이며 공감되게 작성하세요. 뻔하거나 일반적인 표현은 피하세요.

[기본 정보]
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
- 사주팔자: 년주 ${base.sajuInfo.yearPillar} / 월주 ${base.sajuInfo.monthPillar} / 일주 ${base.sajuInfo.dayPillar} / 시주 ${base.sajuInfo.hourPillar}
- 일간: ${base.dayMasterStem} (${base.dayMasterElement} 기운)
- 신강신약: ${base.isSinGang ? "신강(身强) — 일간이 강함" : "신약(身弱) — 일간이 약함"}
- MBTI: ${base.mbti}

${sajuContext}

${manseryeokContext}

순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "personality": "타고난 기질 3-4문장. 일간 ${base.dayMasterStem}(${base.dayMasterElement})의 특성이 구체적 행동·말투·사고방식에 어떻게 나타나는지. 이 사주만의 고유한 특징을 담아 공감가게.",
  "career": "직업 적성과 커리어 방향 2-3문장. 십신 분포와 오행 강세 기반으로 어떤 환경에서 빛나는지, 구체적 직업군 언급.",
  "wealthFortune": "재물운 2-3문장. 재성(財星) 강도와 오행 균형을 기반으로 언제 어떻게 돈을 버는지, 조심할 점.",
  "loveStyle": "연애·결혼 스타일 2-3문장. 일지(배우자궁) 기반으로 어떤 사람에게 끌리고 어떻게 사랑을 표현하는지.",
  "healthCaution": "건강 주의 사항 2문장. 부족한 오행(${base.dayMasterElement === "木" ? "金" : "木"} 계열 등) 기반으로 약한 신체 부위와 예방법.",
  "thisYearFortune": "올해(2026년) 운세 2-3문장. 세운과 대운 흐름 기반으로 구체적 조언과 기회."
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("Claude self narrative error:", err);
    return null;
  }
}

// ── 폴백 텍스트 (AI 실패 시) ──
function buildFallbackNarrative(
  name: string,
  base: ReturnType<typeof buildSelfBase>,
  job: string,
  weakestElement: string,
): Pick<SelfSajuAnalysis, "personality" | "career" | "wealthFortune" | "loveStyle" | "healthCaution" | "thisYearFortune"> {
  const traits = DAY_MASTER_TRAITS[base.dayMasterStem];
  return {
    personality: traits
      ? `${name}님은 ${traits.element} 기운을 타고났습니다. ${traits.personality}. 강점은 ${traits.strength}이며, ${traits.weakness}에 주의할 필요가 있습니다.`
      : `${name}님은 강한 ${base.dayMasterElement} 기운을 타고난 분입니다. ${base.isSinGang ? "신강하여 자기 주도적이고 추진력이 강합니다." : "신약하여 타인과의 협력을 통해 더 큰 성과를 냅니다."}`,
    career: `${name}님은 ${job} 분야에서 두각을 나타낼 수 있습니다. ${base.isSinGang ? "리더십을 발휘할 수 있는 환경이 적합합니다." : "전문성을 쌓아가는 환경에서 역량이 꽃핍니다."}`,
    wealthFortune: `꾸준한 노력으로 재물을 쌓는 타입입니다. 충동적인 투자보다는 안정적이고 장기적인 방식이 유리합니다.`,
    loveStyle: `${base.dayMasterElement} 기운의 연애 스타일로, ${traits?.relationStyle ?? "진심 어린 방식으로 관계를 이어갑니다."}`,
    healthCaution: `${weakestElement} 오행이 약한 편이므로 해당 부위 건강에 주의하세요. 규칙적인 운동과 충분한 수면이 중요합니다.`,
    thisYearFortune: `올해는 ${base.currentDaeun} 대운의 흐름 속에서 ${base.isSinGang ? "안정과 도전을 병행할 시기입니다." : "주변의 도움을 잘 활용하면 좋은 결과를 얻을 수 있습니다."}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, birthYear, birthMonth, birthDay, birthHour, gender } = body as {
      name: string; birthYear: number; birthMonth: number;
      birthDay: number; birthHour: number; gender: "male" | "female";
    };

    if (!name || !birthYear || !birthMonth || !birthDay || !gender) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const manseryeok = buildManseryeokData(
      birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
    );

    const base = buildSelfBase(manseryeok, name);
    const job = deriveJob(manseryeok);

    const sajuContext = buildSajuContext(manseryeok.sajuInfo);
    const manseryeokContext = buildManseryeokPromptContext(manseryeok);

    const narrative = await generateSelfNarrativeWithClaude(
      name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
      base, manseryeokContext, sajuContext,
    );

    const fallback = buildFallbackNarrative(name, base, job, manseryeok.elements.weakest);

    const analysis: SelfSajuAnalysis = {
      ...base,
      personality:     narrative?.personality     ?? fallback.personality,
      career:          narrative?.career          ?? fallback.career,
      wealthFortune:   narrative?.wealthFortune   ?? fallback.wealthFortune,
      loveStyle:       narrative?.loveStyle       ?? fallback.loveStyle,
      healthCaution:   narrative?.healthCaution   ?? fallback.healthCaution,
      thisYearFortune: narrative?.thisYearFortune ?? fallback.thisYearFortune,
    };

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("analyze-self error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
