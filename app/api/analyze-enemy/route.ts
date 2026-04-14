import { NextRequest, NextResponse } from "next/server";
import { calculateSaju, buildSajuContext } from "@/lib/saju";
import Anthropic from "@anthropic-ai/sdk";
import type { EnemyAnalysis, SajuInfo } from "@/lib/types";

function buildDeterministicEnemyAnalysis(
  name: string,
  sajuInfo: SajuInfo,
  gender: string,
): EnemyAnalysis {
  const seed =
    sajuInfo.yearPillar.charCodeAt(0) +
    sajuInfo.monthPillar.charCodeAt(0) +
    sajuInfo.dayPillar.charCodeAt(0) +
    sajuInfo.hourPillar.charCodeAt(0) +
    name.charCodeAt(0);

  const enemyTypes = [
    { type: "질투형 악연", emoji: "😤" },
    { type: "배신형 악연", emoji: "🗡️" },
    { type: "사기형 악연", emoji: "🎭" },
    { type: "에너지 흡혈형", emoji: "🧛" },
    { type: "경쟁형 악연", emoji: "⚔️" },
    { type: "감정 소모형", emoji: "🌀" },
  ];
  const relationships = [
    "직장 동료형",
    "가까운 지인형",
    "우연한 만남형",
    "오래된 친구형",
    "업무 파트너형",
  ];
  const seasons = ["봄", "여름", "가을", "겨울"];
  const situations = [
    "직장이나 업무 환경",
    "사교 모임이나 네트워킹",
    "취미 활동",
    "온라인 공간",
    "일상의 우연한 순간",
  ];

  const et = enemyTypes[seed % enemyTypes.length];
  const rel = relationships[seed % relationships.length];

  return {
    sajuInfo,
    enemyType: et.type,
    enemyTypeEmoji: et.emoji,
    relationship: rel,
    description: `${name}님의 웬수는 처음엔 매력적이고 친근해 보입니다. 말이 많고 붙임성이 좋아 쉽게 가까워지지만, 시간이 지날수록 본색이 드러납니다. 겉으로는 친절하지만 속으로는 자신의 이익을 먼저 챙기는 유형입니다.`,
    characteristics: ["겉과 속이 다른 이중성", "자기 이익 최우선", "처음엔 매력적"],
    dangerAreas: [
      { area: "재정", desc: "금전적 손실을 입힐 가능성이 높습니다.", score: 70 + (seed % 25) },
      { area: "인간관계", desc: "주변 사람들과의 관계를 이간질합니다.", score: 65 + (seed % 30) },
      { area: "감정", desc: "정신적 에너지를 심각하게 소진시킵니다.", score: 60 + (seed % 35) },
    ],
    howToAvoid: `웬수는 ${situations[seed % situations.length]}에서 나타납니다. 처음 만났을 때 과하게 친절하거나 빠르게 친해지려는 사람을 조심하세요. 자신의 경계를 명확히 하고 개인 정보나 약점을 쉽게 드러내지 마세요.`,
    meetTiming: {
      ageRange: `${26 + (seed % 8)}~${32 + (seed % 8)}세`,
      season: seasons[seed % seasons.length],
      situation: situations[seed % situations.length],
    },
    myWeakness: `${name}님은 타인을 쉽게 믿는 따뜻한 성격이 웬수에게 빌미를 줄 수 있습니다. 호의를 베풀고 싶은 마음이 앞서면 상대의 의도를 제대로 파악하지 못하는 경우가 생깁니다.`,
    damage: `웬수는 ${name}님의 시간과 에너지를 빼앗고 중요한 기회를 놓치게 만듭니다. 심리적 상처와 함께 주변 인간관계까지 흔들 수 있어 각별한 주의가 필요합니다.`,
    signToRecognize: `웬수는 처음엔 공감 능력이 뛰어나고 내 편인 척합니다. 하지만 내 성공을 진심으로 기뻐하지 않거나, 대화할수록 에너지가 빠지는 느낌이 든다면 신호입니다.`,
    kakaoFirstMessage: "안녕하세요~ 저 기억하세요? 우리 어디서 봤던 것 같은데ㅎㅎ 연락 한번 해보고 싶었어요!",
    pastLifeConnection: `전생에 ${name}님과 웬수는 경쟁 관계였습니다. 서로 원하는 것이 같았지만 결국 갈등으로 끝났고, 그 업보가 이번 생까지 이어지고 있습니다. 이번 생에서 현명하게 대처한다면 업보를 끊어낼 수 있습니다.`,
    caution: [
      "첫인상이 너무 좋은 사람은 한 번 더 살펴보세요.",
      "개인적인 약점이나 비밀을 쉽게 공유하지 마세요.",
      "금전 거래나 중요한 계약은 반드시 문서로 남기세요.",
    ],
    actionGuide: [
      "새로운 만남에서는 3개월 이상 지켜본 후 신뢰 여부를 결정하세요.",
      "에너지가 빠지는 관계는 과감히 거리두기를 실천하세요.",
      "직감을 믿으세요. 불편함이 느껴지면 그 신호를 무시하지 마세요.",
    ],
    monthlyDanger: Array.from({ length: 12 }, (_, i) => 40 + ((seed + i * 7) % 45)),
    readiness: {
      score: 55 + (seed % 35),
      comment: `${name}님은 악연을 알아보는 감각을 조금 더 키울 필요가 있습니다. 자신을 먼저 사랑하고 경계를 명확히 하는 연습을 하면 웬수로부터 자신을 지킬 수 있습니다.`,
    },
    imagePrompt: `Portrait of a deceptive, two-faced person, charming yet cold eyes, superficially friendly smile that doesn't reach the eyes, stylish appearance hiding a manipulative nature, dramatic lighting with subtle shadows, cinematic, photorealistic`,
  };
}

async function analyzeEnemyWithClaude(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  sajuInfo: SajuInfo,
): Promise<Partial<EnemyAnalysis> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";

    const sajuContext = buildSajuContext(sajuInfo);
    const prompt = `당신은 사주명리학 전문가이자 악연(惡緣) 분석가입니다. 아래 사주를 깊이 분석하여 이 사람의 웬수(악연·해로운 인연)에 대한 완전한 운명 보고서를 생성해주세요.

사주 정보:
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
- 사주팔자: 년주 ${sajuInfo.yearPillar} / 월주 ${sajuInfo.monthPillar} / 일주 ${sajuInfo.dayPillar} / 시주 ${sajuInfo.hourPillar}

${sajuContext}

위 사주 해석을 반드시 모든 항목에 반영하여 이 사람만의 고유한 악연 분석을 생성하세요. 특히 일간의 약점과 부족한 오행을 파고드는 웬수의 특성을 구체적으로 묘사하세요.
순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "enemyType": "악연 유형 (예: 질투형 악연, 배신형 악연, 사기형 악연, 에너지 흡혈형, 경쟁형 악연)",
  "enemyTypeEmoji": "유형을 대표하는 이모지 1개",
  "description": "웬수 외모/첫인상 묘사 2-3문장 (겉으로 매력적이지만 속은 다른 특징, 사주 오행 특성 반영)",
  "characteristics": ["핵심 특징1 (짧게)", "핵심 특징2", "핵심 특징3"],
  "relationship": "악연과의 관계 유형 (예: 직장 동료형, 가까운 지인형, 업무 파트너형)",
  "dangerAreas": [
    { "area": "피해 영역명 (예: 재정)", "desc": "구체적 설명 1문장", "score": 75 },
    { "area": "두 번째 영역", "desc": "설명", "score": 68 },
    { "area": "세 번째 영역", "desc": "설명", "score": 72 }
  ],
  "howToAvoid": "웬수를 피하는 방법과 상황 2-3문장 (구체적 장소·상황·행동)",
  "meetTiming": {
    "ageRange": "웬수를 만날 나이대 (예: 27~32세)",
    "season": "주요 계절 (예: 여름 또는 겨울)",
    "situation": "만남 상황 (예: 직장이나 업무 환경)"
  },
  "myWeakness": "웬수에게 이용당하는 나의 약점 2문장 (구체적으로)",
  "damage": "웬수가 끼치는 피해와 영향 2문장 (구체적으로)",
  "signToRecognize": "웬수를 알아보는 법 2문장 (어떤 신호·행동·느낌으로 알아볼 수 있는지)",
  "kakaoFirstMessage": "웬수가 처음 접근할 때 보낼 법한 메시지 (자연스럽고 의심 없어 보이는 말투, 1-2문장)",
  "pastLifeConnection": "전생 악연 이야기 2-3문장 (구체적 시대·관계·갈등, 감성적으로)",
  "caution": ["주의사항1 (1-2문장, 구체적 상황)", "주의사항2", "주의사항3"],
  "actionGuide": ["웬수를 피하는 실천 가이드1 (매우 구체적인 행동)", "실천 행동2", "실천 행동3"],
  "monthlyDanger": [1월~12월 악연 위험도 각각 0~100 숫자 12개, 사주 오행·계절 특성 반영해 각 달마다 다르게],
  "readiness": {
    "score": 악연 방어력 0~100(사주 기반),
    "comment": "악연 방어력 코멘트 2문장 (현재 상태와 개선 방향)"
  },
  "imagePrompt": "English portrait prompt for AI image generation: charming yet deceptive person, superficially attractive but cold calculating eyes, two-faced nature, stylish appearance, dramatic cinematic lighting with subtle shadows, photorealistic, high quality"
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]) as Partial<EnemyAnalysis>;
  } catch (err) {
    console.error("Claude enemy API error:", err);
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

    const sajuInfo = calculateSaju(birthYear, birthMonth, birthDay, birthHour ?? -1);
    const base = buildDeterministicEnemyAnalysis(name, sajuInfo, gender);

    const claudeResult = await analyzeEnemyWithClaude(
      name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender, sajuInfo
    );

    if (claudeResult) {
      const analysis: EnemyAnalysis = {
        ...base,
        enemyType:          claudeResult.enemyType          ?? base.enemyType,
        enemyTypeEmoji:     claudeResult.enemyTypeEmoji     ?? base.enemyTypeEmoji,
        description:        claudeResult.description        ?? base.description,
        characteristics:    claudeResult.characteristics    ?? base.characteristics,
        relationship:       claudeResult.relationship       ?? base.relationship,
        dangerAreas:        claudeResult.dangerAreas        ?? base.dangerAreas,
        howToAvoid:         claudeResult.howToAvoid         ?? base.howToAvoid,
        meetTiming:         claudeResult.meetTiming         ?? base.meetTiming,
        myWeakness:         claudeResult.myWeakness         ?? base.myWeakness,
        damage:             claudeResult.damage             ?? base.damage,
        signToRecognize:    claudeResult.signToRecognize    ?? base.signToRecognize,
        kakaoFirstMessage:  claudeResult.kakaoFirstMessage  ?? base.kakaoFirstMessage,
        pastLifeConnection: claudeResult.pastLifeConnection ?? base.pastLifeConnection,
        caution:            claudeResult.caution            ?? base.caution,
        actionGuide:        claudeResult.actionGuide        ?? base.actionGuide,
        monthlyDanger:      claudeResult.monthlyDanger      ?? base.monthlyDanger,
        readiness:          claudeResult.readiness          ?? base.readiness,
        imagePrompt:        claudeResult.imagePrompt        ?? base.imagePrompt,
      };
      return NextResponse.json(analysis);
    }

    return NextResponse.json(base);
  } catch (err) {
    console.error("analyze-enemy error:", err);
    return NextResponse.json({ error: "악연 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
