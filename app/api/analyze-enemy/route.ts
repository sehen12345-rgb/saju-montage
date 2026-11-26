import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
import { buildSajuContext } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildEnemyAnalysisBase,
  buildManseryeokPromptContext,
} from "@/lib/sajuAnalyzer";
import { buildSelfBase } from "@/lib/selfAnalyzer";
import Anthropic from "@anthropic-ai/sdk";
import type { EnemyAnalysis, SajuDeepSectionWithBridge } from "@/lib/types";

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

    const systemMsg = `당신은 35년 경력 사주명리학 전문가이자 MZ 세대 감성의 콘텐츠 작가입니다.
만세력 데이터를 근거로 웬수(악연)의 서술 텍스트를 작성합니다.
반드시 순수 JSON만 응답하세요 (마크다운 코드블록, 설명 텍스트 금지).`;

    const prompt = `아래 만세력 분석 데이터를 근거로 웬수(악연)의 서술 텍스트만 작성하세요.
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
      max_tokens: 3500,
      temperature: 0.85,
      system: systemMsg,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    // JSON 잘림 복구 (토큰 부족으로 중간에 잘렸을 때)
    let jsonStr = match[0];
    try {
      return JSON.parse(jsonStr) as Partial<EnemyAnalysis>;
    } catch {
      const repaired = jsonStr
        .replace(/,\s*"[^"]*":\s*"[^"]*$/, '"')
        .replace(/,\s*"[^"]*":\s*\{[^}]*$/, '')
        .replace(/,\s*\[[^\]]*$/, '')
        .replace(/,\s*$/, '') + "}";
      try { return JSON.parse(repaired) as Partial<EnemyAnalysis>; } catch { return null; }
    }
  } catch (err) {
    console.error("Claude enemy narrative error:", err);
    return null;
  }
}

async function generateEnemySelfDeepWithBridge(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  selfBase: ReturnType<typeof buildSelfBase>,
  enemyBase: ReturnType<typeof buildEnemyAnalysisBase>,
  manseryeokContext: string,
  sajuContext: string,
): Promise<SajuDeepSectionWithBridge[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";
    const currentAge = new Date().getFullYear() - birthYear;

    const systemMsg = `당신은 35년 경력 사주명리학 전문가이자 MZ 세대 감성의 콘텐츠 작가입니다.
만세력 데이터를 근거로 본인 사주의 딥 분석을 작성하되, 각 섹션 끝에 "이런 사주이기에 어떤 악연을 조심해야 하는지"를 자연스럽게 연결합니다.
반드시 순수 JSON만 응답하세요 (마크다운 코드블록, 설명 텍스트 금지).`;

    const prompt = `아래 만세력 데이터를 바탕으로 ${name}님(만 ${currentAge}세, ${genderLabel})의 사주 딥 분석을 작성하세요.

[★ 가장 중요한 문체 지침]
- 친한 언니/형이 솔직하게 털어놓는 말투. 딱딱한 보고서 절대 금지.
- 전체를 관통하는 핵심 비유 하나를 먼저 정하고 모든 섹션에서 일관되게 사용 (예: "이 사람 = 불바다 속 물 한 방울")
- 제목은 반드시 이 양식 중 하나: [유머+찌름], [대조], [공감+재프레임], [구체적 현실]
- 나이(만 ${currentAge}세)를 자연스럽게 언급해 개인화
- 뻔한 말 절대 금지: "노력하면 됩니다", "균형이 중요합니다" 같은 표현 금지
- 힘든 내용도 반드시 따뜻한 위로와 응원으로 마무리
- ${name}이라는 이름을 자연스럽게 섞어서 개인화

[기본 정보]
- 이름: ${name} (만 ${currentAge}세, ${genderLabel})
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 사주팔자: 년주 ${selfBase.sajuInfo.yearPillar} / 월주 ${selfBase.sajuInfo.monthPillar} / 일주 ${selfBase.sajuInfo.dayPillar} / 시주 ${selfBase.sajuInfo.hourPillar}
- 일간: ${selfBase.dayMasterStem} (${selfBase.dayMasterElement} 기운)
- 신강신약: ${selfBase.isSinGang ? "신강(身强) — 일간이 강함" : "신약(身弱) — 일간이 약함"}
- MBTI: ${selfBase.mbti}
- 격국: ${selfBase.geokguk}
- 용신: ${selfBase.yongshin}
- 신살: ${selfBase.sinSal?.join(", ") || "없음"}
- 일지 12운성: ${selfBase.dayUnSeong}

[악연 사주에서 이미 결정된 정보 — spouseBridge 작성 시 참고]
- 악연 유형: ${enemyBase.enemyType} ${enemyBase.enemyTypeEmoji}
- 관계 유형: ${enemyBase.relationship}
- 피해 영역: ${enemyBase.dangerAreas.map(a => a.area + "(위험도 " + a.score + ")").join(", ")}
- 출현 시기: ${enemyBase.meetTiming.ageRange}, ${enemyBase.meetTiming.season}

${sajuContext}

${manseryeokContext}

[★ spouseBridge 작성 지침 — 매우 중요]
- 여기서 spouseBridge는 "악연 브릿지"입니다 — 각 섹션의 본인 분석에서 "그래서 어떤 악연을 조심해야 하는지"로 연결
- 위에 주어진 악연 정보(유형, 관계, 피해 영역)를 spouseBridge에 자연스럽게 녹여넣을 것
- 뻔한 연결 금지: "그래서 나쁜 사람을 조심하세요" ← 이런 거 절대 금지
- 구체적이고 소름끼치게: "이런 약점이 있으니까, ${enemyBase.enemyType} 타입이 딱 노릴 수 있어요" 처럼
- 무서우면서도 "알았으니까 괜찮아!" 톤으로 안심시키기
- 마지막 섹션("마지막 한마디")의 spouseBridge는 반드시 "그 웬수의 얼굴, 지금 보여드릴게요..." 느낌으로 몽타주 공개를 예고

순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "deepSections": [
    {
      "icon": "이모지",
      "category": "섹션 카테고리",
      "title": "제목",
      "content": "3-4문장. 핵심 비유로 시작 → 구체 묘사 → 공감/위로.",
      "reason": "명리학 근거 2문장. 전문 용어(재성/관성/인성/비겁/식상/격국/신강신약) 자연스럽게.",
      "advice": "오늘 당장 실천 2문장. '~해보세요' 희망적으로.",
      "spouseBridge": "이 분석에서 자연스럽게 악연으로 연결되는 1-2문장. 구체적이고 소름끼치면서도 안심되게."
    }
  ]
}

deepSections는 반드시 아래 순서대로 정확히 8개:

1. category: "한마디로" | icon: "✦" | 이 사주 전체를 관통하는 핵심 한 마디. 핵심 비유 확립.
2. category: "쓴소리 좀 할게" | icon: "✗" | 단점/나쁜 습관 솔직하게. spouseBridge: "이 약점을 노릴 웬수는..."
3. category: "나만의 매력" | icon: "♡" | 숨겨진 강점/잠재력. spouseBridge: "이 매력이 오히려 악연을 끌어당길 수 있어요..."
4. category: "나에게 맞는 일" | icon: "💼" | 직업/커리어 구체적으로. spouseBridge: "커리어에서 발목 잡을 악연은..."
5. category: "재물복" | icon: "💰" | 재물운 솔직하게. spouseBridge: "돈 문제로 엮일 악연은..."
6. category: "연애운" | icon: "♡" | 연애 패턴+이상형. spouseBridge: "연애에서 만날 위험한 상대는..."
7. category: "곁에 둘 사람" | icon: "☽" | 대인관계/인연. spouseBridge: "관계에서 조심해야 할 사람은..."
8. category: "마지막 한마디" | icon: "❝" | 따뜻한 마무리. spouseBridge: 반드시 "그 웬수의 얼굴, 지금 보여드릴게요..." 느낌

[title 작성 필수 규칙]
- 반드시 이 사람의 일간(${selfBase.dayMasterStem}), 격국(${selfBase.geokguk}), 신강신약(${selfBase.isSinGang ? "신강" : "신약"}), 나이(만 ${currentAge}세) 중 최소 1개 반영
- 유머/공감/대조/질문 중 하나의 방식으로
- content는 동일한 핵심 비유를 다른 각도로 재사용 (일관성 유지)
- reason에는 전문 용어(재성, 관성, 인성, 비겁, 식상, 격국명 등) 반드시 포함`;

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 5000,
      temperature: 0.85,
      system: systemMsg,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    let jsonStr = match[0];
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed.deepSections ?? null;
    } catch {
      const repaired = jsonStr
        .replace(/,\s*"[^"]*":\s*"[^"]*$/, '"')
        .replace(/,\s*"[^"]*":\s*\{[^}]*$/, '')
        .replace(/,\s*\[[^\]]*$/, '')
        .replace(/,\s*$/, '');
      const closed = repaired.endsWith("]") ? repaired + "}" : repaired + "]}";
      try {
        const parsed = JSON.parse(closed);
        return parsed.deepSections ?? null;
      } catch {
        try {
          const parsed = JSON.parse(repaired + "}");
          return parsed.deepSections ?? null;
        } catch { return null; }
      }
    }
  } catch (err) {
    console.error("Claude enemy self deep bridge error:", err);
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

    const selfBase = buildSelfBase(manseryeok, name);

    const [narrative, selfDeepSections] = await Promise.all([
      generateEnemyNarrativeWithClaude(
        name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
        base, manseryeokContext, sajuContext,
      ),
      generateEnemySelfDeepWithBridge(
        name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
        selfBase, base, manseryeokContext, sajuContext,
      ),
    ]);

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

    return NextResponse.json({ ...analysis, selfSaju: selfBase, ...(selfDeepSections ? { selfDeepSections } : {}) });
  } catch (err) {
    console.error("analyze-enemy error:", err);
    return NextResponse.json({ error: "악연 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
