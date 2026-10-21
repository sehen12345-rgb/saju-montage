import { NextRequest, NextResponse } from "next/server";
import { buildSajuContext } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildGuardianAnalysisBase,
  buildManseryeokPromptContext,
} from "@/lib/sajuAnalyzer";
import { buildSelfBase } from "@/lib/selfAnalyzer";
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

    const prompt = `당신은 사주명리학 전문가이자 MZ 감성의 콘텐츠 작가입니다.
아래 만세력 분석 데이터를 근거로 귀인의 서술 텍스트만 작성하세요.
유형/관계/도움 영역/시기/월별 운/주의·실천 가이드는 만세력에서 이미 도출되었습니다.

[필수 문체 지침 — 이것이 가장 중요합니다]
- 친한 친구가 솔직하게 말해주는 톤. 딱딱한 보고서 절대 금지.
- "마치 ~처럼" 비유를 적극 활용
- 읽는 사람이 "아, 이런 분이 내 편이구나!" 하고 따뜻하게 느끼게 만들 것
- 귀인을 만났을 때의 설렘과 기대감을 자연스럽게 담을 것
- "~합니다" 단정체가 아니라 "~할 수 있어요", "~겠죠?" 공감체 혼용
- 이 사람의 이름(${name})을 자연스럽게 섞어서 개인화
- 뻔한 말 절대 금지: "노력하면 됩니다" 같은 표현 금지

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
  "description": "귀인 외모/첫인상 묘사 2-3문장. '마치 ~처럼' 비유로 시각적으로. 처음 봤을 때 '이 사람 뭔가 다르다' 느낌이 들게. (일간 오행 특성 반영)",
  "howToMeet": "귀인을 만나는 상황 2-3문장. '이런 상황에서 우연히 만나게 돼요' 식으로 구체적 시나리오. 기대감 있게. (만남 시기와 일치)",
  "myStrength": "${name}님이 귀인에게 어필하는 강점 2문장. '이런 모습이 귀인의 눈에 띄어요' 식으로. 자신감 주는 표현으로.",
  "benefit": "귀인이 가져다줄 혜택 2문장. 구체적이고 현실적인 도움으로. '이런 기회가 열려요!' 설레게. (도움 영역과 일치)",
  "signToRecognize": "귀인을 알아보는 법 2문장. '이런 느낌이 오면 그 사람이에요!' 직관적이고 납득 가게.",
  "kakaoFirstMessage": "귀인이 처음 보낼 메시지 (따뜻하고 신뢰감 있는 말투, 받으면 '오, 이 분 믿음직스러워' 느낌, 1-2문장)",
  "pastLifeConnection": "전생 인연 이야기 2-3문장. 구체적 시대·관계로 드라마틱하게. '이래서 이번 생에서도 만나는구나!' 납득 가게.",
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

    const selfBase = buildSelfBase(manseryeok, name);
    return NextResponse.json({ ...analysis, selfSaju: selfBase });
  } catch (err) {
    console.error("analyze-guardian error:", err);
    return NextResponse.json({ error: "귀인 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
