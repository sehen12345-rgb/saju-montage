import { NextRequest, NextResponse } from "next/server";
import { buildSajuContext, DAY_MASTER_TRAITS } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildManseryeokPromptContext,
  deriveJob,
} from "@/lib/sajuAnalyzer";
import { buildSelfBase } from "@/lib/selfAnalyzer";
import type { SelfSajuAnalysis, SajuDeepSection } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";

type NarrativeResult = Partial<Pick<SelfSajuAnalysis, "personality" | "career" | "wealthFortune" | "loveStyle" | "healthCaution" | "thisYearFortune">> & {
  deepSections?: SajuDeepSection[];
};

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
): Promise<NarrativeResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";

    const currentAge = new Date().getFullYear() - birthYear;

    const prompt = `당신은 35년 경력 사주명리 전문가의 노하우로 훈련된 AI입니다.
아래 만세력 데이터를 바탕으로 ${name}님(만 ${currentAge}세) 본인의 사주 분석을 작성하세요.

[★ 가장 중요한 문체 지침]
- 친한 언니/형이 솔직하게 털어놓는 말투. 딱딱한 보고서 절대 금지.
- 전체를 관통하는 핵심 비유 하나를 먼저 정하고 모든 섹션에서 일관되게 사용 (예: "이 사람 = 불바다 속 물 한 방울")
- 제목은 반드시 이 양식 중 하나: [유머+찌름] "혹시 금사빠에 용두사미 전문 아니세요?", [대조] "겉은 불도저, 속은 섬세한 예술가", [공감+재프레임] "아무도 몰라주는 고군분투, 사실은 다이아몬드 원석", [구체적 현실] "돈은 벌 만큼 버는데 통장이 텅장?"
- 나이(만 ${currentAge}세)를 자연스럽게 언급해 개인화
- 뻔한 말 절대 금지: "노력하면 됩니다", "균형이 중요합니다" 같은 표현 금지
- 힘든 내용도 반드시 따뜻한 위로와 응원으로 마무리

[기본 정보]
- 이름: ${name} (만 ${currentAge}세, ${genderLabel})
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 사주팔자: 년주 ${base.sajuInfo.yearPillar} / 월주 ${base.sajuInfo.monthPillar} / 일주 ${base.sajuInfo.dayPillar} / 시주 ${base.sajuInfo.hourPillar}
- 일간: ${base.dayMasterStem} (${base.dayMasterElement} 기운)
- 신강신약: ${base.isSinGang ? "신강(身强) — 일간이 강함" : "신약(身弱) — 일간이 약함"}
- MBTI: ${base.mbti}
- 격국: ${base.geokguk}
- 용신: ${base.yongshin}
- 신살: ${base.sinSal?.join(", ") || "없음"}
- 일지 12운성: ${base.dayUnSeong}

${sajuContext}

${manseryeokContext}

순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "personality": "${name}님의 타고난 기질. 핵심 비유 1개로 시작. 3-4문장. 읽으면 '맞아 나 이렇잖아!'를 외치게. 따뜻하게 마무리.",
  "career": "직업 2-3문장. '교수님보단 대표님 소리가 어울려요' 같은 캐주얼한 직접 표현. 이유를 재미있게.",
  "wealthFortune": "돈 2-3문장. '통장이 텅장' 같은 현실 유머. 버는 능력 vs 지키는 능력 솔직하게. 위로+조언.",
  "loveStyle": "연애 2-3문장. '혹시 ~하지 않나요?' 공감 질문 포함. 패턴+이상형 솔직하게.",
  "healthCaution": "건강 2문장. 걱정 주입 말고 '이거 조심하면 오래 살아요' 가볍게.",
  "thisYearFortune": "올해 운세 2-3문장. 구체적 시기+상황 언급. 기대감 UP.",
  "deepSections": [
    {
      "icon": "이모지",
      "category": "섹션 카테고리 (아래 목록에서 정확히 사용)",
      "title": "제목",
      "content": "3-4문장. 핵심 비유로 시작 → 구체 묘사 → 공감/위로. 웃기거나 찔리거나 둘 중 하나.",
      "reason": "명리학 근거 2문장. 전문 용어(재성/관성/인성/비겁/식상/격국/신강신약) 자연스럽게.",
      "advice": "오늘 당장 실천 2문장. '~해보세요' 희망적으로."
    }
  ]
}

deepSections는 반드시 아래 순서대로 정확히 12개. category는 반드시 아래 한국어 표기 그대로 사용:

1. category: "한마디로" | icon: "✦" | 이 사주 전체를 관통하는 핵심 한 마디. 핵심 비유 확립. title 예: "가뭄에 콩 나듯 귀한 물 한 방울, 사막의 CEO 재질"
2. category: "오행으로 보는 사주" | icon: "◈" | 오행 불균형과 의미. title 예: "불바다 속 외로운 물방울, 금수저... 아니 金과 水저가 시급!"
3. category: "일주와 십성" | icon: "◎" | 일주 특성 + 십성 분포. title 예: "겉바속촉 CEO? NO, 겉은 불도저 속은 섬세한 예술가"
4. category: "쓴소리 좀 할게" | icon: "✗" | 단점/나쁜 습관. title 예: "혹시... 금사빠에 용두사미 전문 아니세요?"
5. category: "나만의 매력" | icon: "♡" | 숨겨진 강점/잠재력. title 예: "아무도 몰라주는 당신의 고군분투, 사실은 다이아몬드 원석"
6. category: "나라는 사람" | icon: "☺" | 내면 심리/진짜 나. title 예: "MBTI는 I인데 E인 척 하느라 힘드시죠? 내 안의 혹염룡을 다스리는 법"
7. category: "나에게 맞는 일" | icon: "💼" | 직업/커리어 구체적으로. title 예: "교수님보단 대표님 소리가 어울려요. 돈 냄새는 기가 막히게 맡는 편"
8. category: "재물복" | icon: "💰" | 재물운. title 예: "돈은 벌 만큼 버는데 통장이 텅장? 댐을 지어야 부자가 됩니다"
9. category: "연애운" | icon: "♡" | 연애 패턴+이상형. title 예: "인기는 많은데 연애는 왜 항상 롤러코스터일까?"
10. category: "가족인연" | icon: "🏠" | 부모형제 관계. title 예: "아빠는 슈퍼맨, 엄마는... 글쎄요? 독립이 최고의 효도"
11. category: "곁에 둘 사람" | icon: "☽" | 친구/대인관계. title 예: "나보다 잘난 친구 말고, 내 편인 친구 딱 한 명이면 돼"
12. category: "마지막 한마디" | icon: "❝" | 따뜻한 마무리. title 예: "사막을 적시는 단 한 방울의 물, 당신의 존재가 바로 기적입니다."

[title 작성 필수 규칙]
- 반드시 이 사람의 일간(${base.dayMasterStem}), 격국(${base.geokguk}), 신강신약(${base.isSinGang ? "신강" : "신약"}), 나이(만 ${currentAge}세) 중 최소 1개 반영
- 유머/공감/대조/질문 중 하나의 방식으로
- content는 동일한 핵심 비유를 다른 각도로 재사용 (일관성 유지)
- reason에는 전문 용어(재성, 관성, 인성, 비겁, 식상, 격국명 등) 반드시 포함`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
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
      ...(narrative?.deepSections ? { deepSections: narrative.deepSections } : {}),
    };

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("analyze-self error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
