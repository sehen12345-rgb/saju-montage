import { NextRequest, NextResponse } from "next/server";
import { buildSajuContext } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildGuardianAnalysisBase,
  buildManseryeokPromptContext,
} from "@/lib/sajuAnalyzer";
import Anthropic from "@anthropic-ai/sdk";
import type { GuardianAnalysis } from "@/lib/types";

async function generateGuardianNarrativeWithClaude(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  base: ReturnType<typeof buildGuardianAnalysisBase>,
  manseryeokContext: string,
  sajuContext: string,
): Promise<Partial<GuardianAnalysis> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";

    const prompt = `당신은 사주명리학 전문가이자 귀인(贵人) 분석가입니다.
아래 만세력 분석 데이터를 근거로 귀인의 서술 텍스트만 작성하세요.
유형/관계/도움 영역/시기/월별 운/주의·실천 가이드는 만세력에서 이미 도출되었습니다.

[기본 정보]
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
- 사주팔자: 년주 ${base.sajuInfo.yearPillar} / 월주 ${base.sajuInfo.monthPillar} / 일주 ${base.sajuInfo.dayPillar} / 시주 ${base.sajuInfo.hourPillar}

${sajuContext}

${manseryeokContext}

[만세력에서 결정된 귀인 핵심 결과]
- 귀인 유형: ${base.guardianType} ${base.guardianTypeEmoji}
- 관계 유형: ${base.relationship}
- 만남 시기: ${base.meetTiming.ageRange}, ${base.meetTiming.season}, ${base.meetTiming.situation}
- 도움 영역: ${base.luckAreas.map(a => `${a.area}(${a.score})`).join(", ")}
- 귀인 준비도: ${base.readiness?.score ?? 0}점

위 결과와 모순되지 않는 범위에서만 서술 텍스트를 작성하세요.
순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "description": "귀인 외모/첫인상 묘사 2-3문장 (구체적 이목구비·분위기·옷차림, 일간 오행 특성 반영)",
  "howToMeet": "귀인을 만나는 방법과 상황 2-3문장 (위 만남 시기와 일치)",
  "myStrength": "귀인에게 어필하는 나의 강점 2문장 (구체적으로)",
  "benefit": "귀인이 가져다줄 혜택과 기회 2문장 (도움 영역과 일치)",
  "signToRecognize": "귀인을 알아보는 법 2문장 (어떤 느낌·신호·행동으로 알아볼 수 있는지)",
  "kakaoFirstMessage": "귀인이 처음 보낼 메시지 (자연스러운 말투, 1-2문장)",
  "pastLifeConnection": "전생 인연 이야기 2-3문장 (구체적 시대·관계·상황, 감성적으로)",
  "imagePrompt": "English portrait prompt for AI image generation: wise trustworthy person, describe appearance based on saju elements, kind yet authoritative face, professional and warm, photorealistic, studio lighting, high quality"
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]) as Partial<GuardianAnalysis>;
  } catch (err) {
    console.error("Claude guardian narrative error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, birthYear, birthMonth, birthDay, birthHour, gender } = body as {
      name: string;
      birthYear: number;
      birthMonth: number;
      birthDay: number;
      birthHour: number;
      gender: "male" | "female";
    };

    if (!name || !birthYear || !birthMonth || !birthDay || !gender) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const manseryeok = buildManseryeokData(
      birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
    );
    const base = buildGuardianAnalysisBase(manseryeok);

    const sajuContext = buildSajuContext(base.sajuInfo);
    const manseryeokContext = buildManseryeokPromptContext(manseryeok);

    const narrative = await generateGuardianNarrativeWithClaude(
      name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
      base, manseryeokContext, sajuContext,
    );

    const fallbackImagePrompt = `Portrait of a wise, trustworthy ${gender === "female" ? "man" : "woman"}, kind and authoritative face, deep thoughtful eyes, well-groomed appearance, professional yet warm demeanor, soft studio lighting, high quality, photorealistic`;

    const analysis: GuardianAnalysis = {
      ...base,
      description: narrative?.description ??
        `${name}님의 귀인은 첫인상부터 신뢰감이 느껴지는 분입니다. 눈빛이 깊고 말에 무게가 있어 자연스럽게 존경심이 생기는 타입입니다.`,
      howToMeet: narrative?.howToMeet ??
        `귀인은 ${base.meetTiming.situation}에서 만나게 됩니다. 평소 자신의 분야에서 진심을 다해 노력하면 자연스럽게 인연이 이어집니다.`,
      myStrength: narrative?.myStrength ??
        `${name}님은 성실하고 꾸준한 노력으로 귀인의 눈에 띄게 됩니다. 진심 어린 태도와 책임감이 핵심 매력입니다.`,
      benefit: narrative?.benefit ??
        `귀인은 ${base.luckAreas[0]?.area} 영역에서 새로운 기회의 문을 열어주고, 결정의 순간에 든든한 지원군이 되어줍니다.`,
      signToRecognize: narrative?.signToRecognize ??
        "귀인은 처음 만났을 때부터 묘하게 편안함이 느껴지는 분입니다. 조언이 현실적이고 구체적이며, 행동으로 신뢰를 쌓는 스타일입니다.",
      kakaoFirstMessage: narrative?.kakaoFirstMessage ??
        "안녕하세요, 오늘 정말 인상 깊었어요. 혹시 조금 더 이야기 나눌 수 있을까요? ☺️",
      pastLifeConnection: narrative?.pastLifeConnection ??
        `전생에 ${name}님과 귀인은 스승과 제자 사이였습니다. 깊은 신뢰를 쌓았고, 이번 생에도 그 인연이 이어져 중요한 순간에 다시 만나게 됩니다.`,
      imagePrompt: narrative?.imagePrompt ?? fallbackImagePrompt,
    };

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("analyze-guardian error:", err);
    return NextResponse.json({ error: "귀인 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
