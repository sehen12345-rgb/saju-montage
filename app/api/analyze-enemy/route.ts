import { NextRequest, NextResponse } from "next/server";
import { buildSajuContext } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildEnemyAnalysisBase,
  buildManseryeokPromptContext,
} from "@/lib/sajuAnalyzer";
import { buildSelfBase } from "@/lib/selfAnalyzer";
import Anthropic from "@anthropic-ai/sdk";
import type { EnemyAnalysis } from "@/lib/types";

async function generateEnemyNarrativeWithClaude(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  base: ReturnType<typeof buildEnemyAnalysisBase>,
  manseryeokContext: string,
  sajuContext: string,
): Promise<Partial<EnemyAnalysis> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";

    const prompt = `당신은 사주명리학 전문가이자 MZ 감성의 콘텐츠 작가입니다.
아래 만세력 분석 데이터를 근거로 웬수(악연)의 서술 텍스트만 작성하세요.
유형/관계/피해 영역/시기/월별 위험도/주의·실천 가이드는 만세력에서 이미 도출되었습니다.

[필수 문체 지침 — 이것이 가장 중요합니다]
- 친한 친구가 "야, 이런 사람 조심해!" 하고 귀띔해주는 톤
- "마치 ~처럼" 비유를 적극 활용
- 웃기면서도 '소름' 돋게 만들 것 (너무 현실적이라 무서운 느낌)
- 무서운 이야기지만 끝에 "${name}님은 이미 알았으니 OK!" 식으로 안심시키기
- "~합니다" 단정체가 아니라 "~할 수 있어요", "~겠죠?" 공감체 혼용
- 이 사람의 이름(${name})을 자연스럽게 섞어서 개인화
- 뻔한 말 절대 금지

[기본 정보]
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
- 사주팔자: 년주 ${base.sajuInfo.yearPillar} / 월주 ${base.sajuInfo.monthPillar} / 일주 ${base.sajuInfo.dayPillar} / 시주 ${base.sajuInfo.hourPillar}

${sajuContext}

${manseryeokContext}

[만세력에서 결정된 악연 핵심 결과]
- 악연 유형: ${base.enemyType} ${base.enemyTypeEmoji}
- 관계 유형: ${base.relationship}
- 만남 시기: ${base.meetTiming.ageRange}, ${base.meetTiming.season}, ${base.meetTiming.situation}
- 피해 영역: ${base.dangerAreas.map(a => `${a.area}(위험도 ${a.score})`).join(", ")}
- 악연 방어력: ${base.readiness?.score ?? 0}점

위 결과와 모순되지 않는 범위에서만 서술 텍스트를 작성하세요.
순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "description": "웬수 외모/첫인상 묘사 2-3문장. '마치 ~처럼' 비유로. 처음엔 매력적이지만 어딘가 불안한 느낌이 드는 묘사. '이런 사람 봤죠?' 공감 유발. (일간 오행 약점 반영)",
  "howToAvoid": "웬수 피하는 법 2-3문장. 구체적 장소·상황·행동으로. '이럴 때 이렇게 하면 돼요!' 실용적이고 안심되게. (위험 시기와 일치)",
  "myWeakness": "${name}님의 약점 2문장. '아 맞아, 나 이런 거 못 참지...' 하고 찔리게. 솔직하고 따뜻하게.",
  "damage": "웬수가 끼치는 피해 2문장. '이렇게 당할 수 있어요' 현실적으로. 소름 돋지만 알아서 좋은 정보처럼. (피해 영역과 일치)",
  "signToRecognize": "웬수 알아보는 법 2문장. '이런 신호가 오면 도망가세요!' 직관적이고 납득 가게. 유머 살짝 섞어서.",
  "kakaoFirstMessage": "웬수가 처음 접근할 때 보낼 법한 메시지 (받으면 '어 괜찮은 사람인가?' 싶을 만큼 자연스럽고 의심 없어 보이는 말투, 읽고 나서 소름 돋게, 1-2문장)",
  "pastLifeConnection": "전생 악연 이야기 2-3문장. 구체적 시대·관계·갈등으로. '이래서 이번 생에 또 만나는구나...' 납득하면서 소름 돋게.",
  "imagePrompt": "English: describe the enemy's face ONLY using these elements in order — [face shape] [eye shape + brow shape, with subtly guarded or sharp quality] [nose + lips] [skin tone] [hair style + color] [2 vibe adjectives reflecting the enemy type: ${base.enemyType}]. No evaluation words. Example: 'sharp angular face, narrow slightly cold double-lidded eyes, sharp straight brows, defined high nose, thin composed lips, clear pale skin, slicked-back dark hair, charismatic but unsettling'"
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]) as Partial<EnemyAnalysis>;
  } catch (err) {
    console.error("Claude enemy narrative error:", err);
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
    const base = buildEnemyAnalysisBase(manseryeok);

    const sajuContext = buildSajuContext(base.sajuInfo);
    const manseryeokContext = buildManseryeokPromptContext(manseryeok);

    const narrative = await generateEnemyNarrativeWithClaude(
      name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
      base, manseryeokContext, sajuContext,
    );

    const fallbackImagePrompt = `Portrait of a deceptive, two-faced person, charming yet cold eyes, superficially friendly smile that doesn't reach the eyes, stylish appearance hiding a manipulative nature, dramatic lighting with subtle shadows, cinematic, photorealistic`;

    const analysis: EnemyAnalysis = {
      ...base,
      description: narrative?.description ??
        `${name}님의 웬수는 처음엔 매력적이고 친근해 보입니다. 말이 많고 붙임성이 좋아 쉽게 가까워지지만, 시간이 지날수록 본색이 드러납니다.`,
      howToAvoid: narrative?.howToAvoid ??
        `웬수는 ${base.meetTiming.situation}에서 나타납니다. 처음 만났을 때 과하게 친절한 사람을 조심하고, 자신의 경계를 명확히 하세요.`,
      myWeakness: narrative?.myWeakness ??
        `${name}님은 타인을 쉽게 믿는 따뜻한 성격이 웬수에게 빌미를 줄 수 있습니다.`,
      damage: narrative?.damage ??
        `웬수는 ${base.dangerAreas[0]?.area} 영역에서 가장 큰 피해를 입히며, 시간과 에너지를 빼앗고 중요한 기회를 놓치게 만듭니다.`,
      signToRecognize: narrative?.signToRecognize ??
        "웬수는 처음엔 공감 능력이 뛰어난 척하지만, 내 성공을 진심으로 기뻐하지 않거나 대화 후 에너지가 빠지는 느낌이 든다면 신호입니다.",
      kakaoFirstMessage: narrative?.kakaoFirstMessage ??
        "안녕하세요~ 저 기억하세요? 우리 어디서 봤던 것 같은데ㅎㅎ 연락 한번 해보고 싶었어요!",
      pastLifeConnection: narrative?.pastLifeConnection ??
        `전생에 ${name}님과 웬수는 경쟁 관계였습니다. 그 업보가 이번 생까지 이어지고 있습니다.`,
      imagePrompt: narrative?.imagePrompt ?? fallbackImagePrompt,
    };

    const selfBase = buildSelfBase(manseryeok, name);
    return NextResponse.json({ ...analysis, selfSaju: selfBase });
  } catch (err) {
    console.error("analyze-enemy error:", err);
    return NextResponse.json({ error: "악연 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
