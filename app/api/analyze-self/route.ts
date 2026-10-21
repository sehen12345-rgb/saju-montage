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

    const prompt = `당신은 사주명리학 전문가이자 트렌디한 콘텐츠 작가입니다.
아래 만세력 데이터를 바탕으로 ${name}님 본인의 사주 분석을 작성하세요.
구체적이고 현실적이며 유머와 공감이 넘치게 작성하세요. 뻔하거나 일반적인 표현은 절대 금지입니다.

[기본 정보]
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
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
  "personality": "타고난 기질 3-4문장. 일간 ${base.dayMasterStem}(${base.dayMasterElement})의 특성이 구체적 행동·말투·사고방식에 어떻게 나타나는지. 이 사주만의 고유한 특징을 담아 공감가게.",
  "career": "직업 적성과 커리어 방향 2-3문장. 십신 분포와 오행 강세 기반으로 어떤 환경에서 빛나는지, 구체적 직업군 언급.",
  "wealthFortune": "재물운 2-3문장. 재성(財星) 강도와 오행 균형을 기반으로 언제 어떻게 돈을 버는지, 조심할 점.",
  "loveStyle": "연애·결혼 스타일 2-3문장. 일지(배우자궁) 기반으로 어떤 사람에게 끌리고 어떻게 사랑을 표현하는지.",
  "healthCaution": "건강 주의 사항 2문장. 부족한 오행 기반으로 약한 신체 부위와 예방법.",
  "thisYearFortune": "올해(2026년) 운세 2-3문장. 세운과 대운 흐름 기반으로 구체적 조언과 기회.",
  "deepSections": [
    {
      "icon": "이모지",
      "title": "재미있고 공감되는 제목 (예: '가뭄에 콩 나듯 귀한 물 한 방울, 사막의 CEO 재질'처럼 비유+핵심을 담아)",
      "content": "이 사람의 실제 사주 기반으로 비유 풍부하게 3-4문장. 유머+공감+구체적 사례 포함. 뻔한 말 금지.",
      "reason": "명리학 용어 사용한 사주 근거 2문장 (재성/관성/인성/신강신약/격국/십신 등 명시).",
      "advice": "실천 가능한 구체적 행동 조언 2문장."
    }
  ]
}

deepSections는 반드시 아래 순서로 정확히 12개를 생성하세요. 각 섹션의 title은 이 사람의 사주를 반영한 독창적이고 재미있는 제목이어야 합니다:

1. 격국/오행 — 사주 핵심 구조 분석. icon: "🏯". title 예시: "내 사주의 정체가 드디어 밝혀졌다" 같은 느낌으로
2. 성격/기질 — 외강내유/내강외유 등. icon: "🎭". title 예시: "겉으로는 쿨한데 속은 용광로" 느낌으로
3. 행동 패턴/단점 — 자신도 모르는 나쁜 습관. icon: "😅". title 예시: "통장이 텅장인 이유가 있었네" 느낌으로
4. 잠재력/강점 — 아직 안 꺼낸 능력. icon: "💎". title 예시: "아직 봉인 해제 안 한 능력치" 느낌으로
5. 내면/심리 — I vs E, 진짜 내 모습. icon: "🧠". title 예시: "I인데 E인 척 하느라 힘드시죠" 느낌으로
6. 직업/커리어 — 어울리는 직업 구체적으로. icon: "💼". title 예시: "교수님보단 대표님 소리가 어울려요" 느낌으로
7. 재물운 — 돈과 나의 관계. icon: "💰". title 예시: "돈복은 있는데 유지력이 문제야" 느낌으로
8. 연애/결혼운 — 연애 패턴과 이상형. icon: "💕". title 예시: "밀당이 아니라 그냥 멀어지는 거예요" 느낌으로
9. 가족관계 — 부모/형제/자녀와의 관계. icon: "🏠". title 예시: "집에선 막내 같고 밖에선 어른 같은 이유" 느낌으로
10. 친구/대인관계 — 사람 사귀는 방식. icon: "🤝". title 예시: "친구 많은 척하지만 진짜 친구는 3명" 느낌으로
11. 거주지/방향 — 살기 좋은 곳과 방위. icon: "🧭". title 예시: "남쪽으로 가면 돈이 따라온다" 느낌으로
12. 종합 메시지 — 이 사주가 전하는 핵심. icon: "✨". title 예시: "결국 당신은 이렇게 살아야 빛난다" 느낌으로

중요 지침:
- 각 title은 반드시 이 사람의 일간(${base.dayMasterStem}), 격국(${base.geokguk}), 신강신약(${base.isSinGang ? "신강" : "신약"}) 등을 반영해 개인화할 것
- content는 "마치 ~처럼", "~하는 타입이다" 식의 비유로 생동감 있게
- reason에는 반드시 명리학 용어(재성, 관성, 인성, 비겁, 식상, 격국명, 신강신약 등) 포함
- advice는 "오늘부터 ~해보세요" 같은 실천 가능한 내용으로`;

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
