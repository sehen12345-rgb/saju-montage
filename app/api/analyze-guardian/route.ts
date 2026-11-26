import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
import { buildSajuContext } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildGuardianAnalysisBase,
  buildManseryeokPromptContext,
} from "@/lib/sajuAnalyzer";
import { buildSelfBase } from "@/lib/selfAnalyzer";
import Anthropic from "@anthropic-ai/sdk";
import type { GuardianAnalysis, SajuDeepSectionWithBridge } from "@/lib/types";

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

    const systemMsg = `당신은 35년 경력 사주명리학 전문가이자 MZ 세대 감성의 콘텐츠 작가입니다.
만세력 데이터를 근거로 귀인의 서술 텍스트를 작성합니다.
반드시 순수 JSON만 응답하세요 (마크다운 코드블록, 설명 텍스트 금지).`;

    const prompt = `아래 만세력 분석 데이터를 근거로 귀인의 서술 텍스트만 작성하세요.
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
  "imagePrompt": "English: describe the guardian's face ONLY using these elements in order — [face shape] [eye shape + brow shape] [nose + lips] [skin tone] [hair style + hair color] [2 vibe adjectives]. Use the saju day-stem (${base.sajuInfo.dayPillar[0]}) as visual base. No evaluation words (beautiful/handsome). Example format: 'soft oval face, slightly arched double-lidded warm eyes, delicate arched brows, refined button nose, naturally full lips, luminous peachy skin, shoulder-length wavy dark brown hair, gentle and trustworthy'"
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
      return JSON.parse(jsonStr) as Partial<GuardianAnalysis>;
    } catch {
      const repaired = jsonStr
        .replace(/,\s*"[^"]*":\s*"[^"]*$/, '"')
        .replace(/,\s*"[^"]*":\s*\{[^}]*$/, '')
        .replace(/,\s*\[[^\]]*$/, '')
        .replace(/,\s*$/, '') + "}";
      try { return JSON.parse(repaired) as Partial<GuardianAnalysis>; } catch { return null; }
    }
  } catch (err) {
    console.error("Claude guardian narrative error:", err);
    return null;
  }
}

async function generateGuardianSelfDeepWithBridge(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  selfBase: ReturnType<typeof buildSelfBase>,
  guardianBase: ReturnType<typeof buildGuardianAnalysisBase>,
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
만세력 데이터를 근거로 본인 사주의 딥 분석을 작성하되, 각 섹션 끝에 "이런 사주이기에 어떤 귀인이 필요한지"를 자연스럽게 연결합니다.
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

[귀인 사주에서 이미 결정된 정보 — spouseBridge 작성 시 참고]
- 귀인 유형: ${guardianBase.guardianType} ${guardianBase.guardianTypeEmoji}
- 관계 유형: ${guardianBase.relationship}
- 도움 영역: ${guardianBase.luckAreas.map(a => a.area + "(" + a.score + ")").join(", ")}
- 만남 시기: ${guardianBase.meetTiming.ageRange}, ${guardianBase.meetTiming.season}

${sajuContext}

${manseryeokContext}

[★ spouseBridge 작성 지침 — 매우 중요]
- 여기서 spouseBridge는 "귀인 브릿지"입니다 — 각 섹션의 본인 분석에서 "그래서 어떤 귀인이 필요한지"로 연결
- 위에 주어진 귀인 정보(유형, 관계, 도움 영역)를 spouseBridge에 자연스럽게 녹여넣을 것
- 뻔한 연결 금지: "그래서 좋은 귀인이 필요합니다" ← 이런 거 절대 금지
- 구체적이고 감성적으로: "이런 당신이니까, ${guardianBase.guardianType} 같은 귀인이 옆에 있어야 해요" 처럼
- 마지막 섹션("마지막 한마디")의 spouseBridge는 반드시 "그 귀인의 얼굴, 지금 보여드릴게요..." 느낌으로 몽타주 공개를 예고

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
      "spouseBridge": "이 분석에서 자연스럽게 귀인으로 연결되는 1-2문장. 구체적이고 따뜻하게."
    }
  ]
}

deepSections는 반드시 아래 순서대로 정확히 8개:

1. category: "한마디로" | icon: "✦" | 이 사주 전체를 관통하는 핵심 한 마디. 핵심 비유 확립.
2. category: "쓴소리 좀 할게" | icon: "✗" | 단점/나쁜 습관 솔직하게. spouseBridge: "이런 당신을 잡아줄 귀인은..."
3. category: "나만의 매력" | icon: "♡" | 숨겨진 강점/잠재력. spouseBridge: "이 매력을 알아볼 귀인은..."
4. category: "나에게 맞는 일" | icon: "💼" | 직업/커리어 구체적으로. spouseBridge: "커리어를 함께 성장시킬 귀인은..."
5. category: "재물복" | icon: "💰" | 재물운 솔직하게. spouseBridge: "재물운을 열어줄 귀인은..."
6. category: "연애운" | icon: "♡" | 연애 패턴+이상형. spouseBridge: "인연을 이끌어줄 귀인은..."
7. category: "곁에 둘 사람" | icon: "☽" | 대인관계/인연. spouseBridge: "평생 곁에 둘 귀인은..."
8. category: "마지막 한마디" | icon: "❝" | 따뜻한 마무리. spouseBridge: 반드시 "그 귀인의 얼굴, 지금 보여드릴게요..." 느낌

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
    console.error("Claude guardian self deep bridge error:", err);
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

    const selfBase = buildSelfBase(manseryeok, name);

    const [narrative, selfDeepSections] = await Promise.all([
      generateGuardianNarrativeWithClaude(
        name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
        base, manseryeokContext, sajuContext,
      ),
      generateGuardianSelfDeepWithBridge(
        name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
        selfBase, base, manseryeokContext, sajuContext,
      ),
    ]);

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

    return NextResponse.json({ ...analysis, selfSaju: selfBase, ...(selfDeepSections ? { selfDeepSections } : {}) });
  } catch (err) {
    console.error("analyze-guardian error:", err);
    return NextResponse.json({ error: "귀인 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
