import { NextRequest, NextResponse } from "next/server";
import { calculateSaju, buildSajuContext } from "@/lib/saju";
import Anthropic from "@anthropic-ai/sdk";
import type { GuardianAnalysis, SajuInfo } from "@/lib/types";

// ── 결정론적 폴백 (Claude API 키 없을 때) ──────────────────────

function buildDeterministicGuardianAnalysis(
  name: string,
  sajuInfo: SajuInfo,
  gender: string,
): GuardianAnalysis {
  const seed =
    sajuInfo.yearPillar.charCodeAt(0) +
    sajuInfo.monthPillar.charCodeAt(0) +
    sajuInfo.dayPillar.charCodeAt(0) +
    sajuInfo.hourPillar.charCodeAt(0) +
    name.charCodeAt(0);

  const guardianTypes = [
    { type: "사업 귀인", emoji: "💼" },
    { type: "금전 귀인", emoji: "💰" },
    { type: "학업 귀인", emoji: "📚" },
    { type: "인생 멘토형", emoji: "🌟" },
    { type: "감성 귀인", emoji: "💝" },
    { type: "건강 귀인", emoji: "🌿" },
  ];
  const relationships = [
    "직장 상사형",
    "우연한 만남형",
    "소개를 통한 만남형",
    "오랜 지인형",
    "동업자형",
  ];
  const seasons = ["봄", "여름", "가을", "겨울"];
  const situations = [
    "직장이나 업무 환경",
    "사교 모임이나 네트워킹",
    "취미 활동",
    "교육 기관이나 세미나",
    "우연한 일상의 순간",
  ];

  const gt = guardianTypes[seed % guardianTypes.length];
  const rel = relationships[seed % relationships.length];

  return {
    sajuInfo,
    guardianType: gt.type,
    guardianTypeEmoji: gt.emoji,
    relationship: rel,
    description: `${name}님의 귀인은 첫인상부터 신뢰감이 느껴지는 분입니다. 눈빛이 깊고 말에 무게가 있어 자연스럽게 존경심이 생기는 타입입니다. 주변 사람들에게 인정받고 있으며, 항상 침착하고 여유로운 분위기를 풍깁니다.`,
    characteristics: ["신뢰감 있는 인상", "깊은 통찰력", "배려심 넘치는 성품"],
    luckAreas: [
      { area: "재정", desc: "금전적 기회를 열어주실 분입니다.", score: 80 + (seed % 15) },
      { area: "커리어", desc: "경력 발전에 결정적인 도움을 주십니다.", score: 75 + (seed % 20) },
      { area: "인맥", desc: "중요한 사람들을 연결해 주십니다.", score: 70 + (seed % 25) },
    ],
    howToMeet: `귀인은 ${situations[seed % situations.length]}에서 만나게 됩니다. 평소 자신의 분야에서 진심을 다해 노력하는 모습을 보이면 자연스럽게 인연이 이어집니다. 먼저 다가가기보다 진실한 자세로 임하면 귀인이 먼저 손을 내밀어 줄 것입니다.`,
    meetTiming: {
      ageRange: `${28 + (seed % 8)}~${33 + (seed % 8)}세`,
      season: seasons[seed % seasons.length],
      situation: situations[seed % situations.length],
    },
    myStrength: `${name}님은 성실하고 꾸준한 노력으로 귀인의 눈에 띄게 됩니다. 진심 어린 태도와 책임감 있는 모습이 귀인의 마음을 움직이는 핵심 매력입니다.`,
    benefit: `귀인은 ${name}님에게 새로운 기회의 문을 열어주고 중요한 결정의 순간에 든든한 지원군이 되어줍니다. 재정적, 정서적으로 큰 힘이 되어주실 분입니다.`,
    signToRecognize: `귀인은 처음 만났을 때부터 묘하게 편안함이 느껴지는 분입니다. 조언이 현실적이고 구체적이며, 말보다 행동으로 신뢰를 쌓는 스타일입니다.`,
    kakaoFirstMessage: "안녕하세요, 오늘 정말 인상 깊었어요. 혹시 조금 더 이야기 나눌 수 있을까요? ☺️",
    pastLifeConnection: `전생에 ${name}님과 귀인은 스승과 제자 사이였습니다. 수많은 어려움을 함께 헤쳐나가며 깊은 신뢰를 쌓았고, 이번 생에도 그 인연이 이어져 중요한 순간에 다시 만나게 됩니다.`,
    caution: [
      "귀인의 조언을 귀 기울여 듣되, 너무 의존하지 않도록 주의하세요.",
      "처음에는 단순한 관심처럼 느껴질 수 있으니 감사한 마음을 표현하세요.",
      "귀인 관계는 일방적 혜택이 아닌 상호 존중으로 유지됩니다.",
    ],
    actionGuide: [
      "자신의 분야에서 꾸준히 실력을 쌓고 그 과정을 기록해두세요.",
      "사교적 자리에 적극 참여하되 진심으로 사람들과 소통하세요.",
      "감사한 마음을 작은 행동으로 표현하는 습관을 들이세요.",
    ],
    monthlyLuck: Array.from({ length: 12 }, (_, i) => 55 + ((seed + i * 7) % 40)),
    readiness: {
      score: 60 + (seed % 30),
      comment: `${name}님은 귀인을 맞이할 준비가 되어가고 있습니다. 내면의 성장과 자신감을 더 키워나가면 귀인과의 만남이 더욱 빨리 이루어질 것입니다.`,
    },
    imagePrompt: `Portrait of a wise, trustworthy ${gender === "female" ? "man" : "woman"}, kind and authoritative face, deep thoughtful eyes, well-groomed appearance, professional yet warm demeanor, soft studio lighting, high quality, photorealistic`,
  };
}

// ── Claude API 분석 ────────────────────────────────────────

async function analyzeGuardianWithClaude(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  sajuInfo: SajuInfo,
): Promise<Partial<GuardianAnalysis> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";
    const guardianGender = gender === "male" ? "남성 또는 여성" : "남성 또는 여성";

    const sajuContext = buildSajuContext(sajuInfo);
    const prompt = `당신은 사주명리학 전문가이자 귀인(贵人) 운세 분석가입니다. 아래 사주를 깊이 분석하여 이 사람의 귀인(인생을 도와줄 조력자)에 대한 완전한 운명 보고서를 생성해주세요.

사주 정보:
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
- 사주팔자: 년주 ${sajuInfo.yearPillar} / 월주 ${sajuInfo.monthPillar} / 일주 ${sajuInfo.dayPillar} / 시주 ${sajuInfo.hourPillar}

${sajuContext}

위 사주 해석을 반드시 모든 항목에 반영하여 이 사람만의 고유한 귀인 분석을 생성하세요. 특히 일간 특성과 부족한 오행을 보완해주는 귀인의 모습을 구체적으로 묘사하세요.
순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "guardianType": "귀인 유형 (예: 사업 귀인, 금전 귀인, 학업 귀인, 인생 멘토형, 감성 귀인)",
  "guardianTypeEmoji": "유형을 대표하는 이모지 1개",
  "description": "귀인 외모/첫인상 묘사 2-3문장 (구체적 이목구비·분위기·옷차림, 사주 오행 특성 반영)",
  "characteristics": ["핵심 특징1 (짧게)", "핵심 특징2", "핵심 특징3"],
  "relationship": "귀인과의 관계 유형 (예: 직장 상사형, 우연한 만남형, 소개를 통한 만남형)",
  "luckAreas": [
    { "area": "도움 영역명 (예: 재정)", "desc": "구체적 설명 1문장", "score": 85 },
    { "area": "두 번째 영역", "desc": "설명", "score": 78 },
    { "area": "세 번째 영역", "desc": "설명", "score": 72 }
  ],
  "howToMeet": "귀인을 만나는 방법과 상황 2-3문장 (구체적 장소·상황·행동)",
  "meetTiming": {
    "ageRange": "귀인을 만날 나이대 (예: 29~34세)",
    "season": "주요 계절 (예: 가을 또는 겨울)",
    "situation": "만남 상황 (예: 업무 관련 행사나 모임)"
  },
  "myStrength": "귀인에게 어필하는 나의 강점 2문장 (구체적으로)",
  "benefit": "귀인이 가져다줄 혜택과 기회 2문장 (구체적으로)",
  "signToRecognize": "귀인을 알아보는 법 2문장 (어떤 느낌·신호·행동으로 알아볼 수 있는지)",
  "kakaoFirstMessage": "귀인이 처음 보낼 메시지 (자연스러운 말투, 1-2문장)",
  "pastLifeConnection": "전생 인연 이야기 2-3문장 (구체적 시대·관계·상황, 감성적으로)",
  "caution": ["주의사항1 (1-2문장, 구체적 상황)", "주의사항2", "주의사항3"],
  "actionGuide": ["귀인을 당기는 실천 가이드1 (매우 구체적인 행동)", "실천 행동2", "실천 행동3"],
  "monthlyLuck": [1월~12월 귀인운 각각 0~100 숫자 12개, 사주 오행·계절 특성 반영해 각 달마다 다르게],
  "readiness": {
    "score": 귀인 준비도 0~100(사주 기반),
    "comment": "귀인 준비도 코멘트 2문장 (현재 상태와 개선 방향)"
  },
  "imagePrompt": "English portrait prompt for AI image generation: wise trustworthy person, describe appearance based on saju elements (water/wood/fire/earth/metal energy), kind yet authoritative face, professional and warm, photorealistic, studio lighting, high quality"
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]) as Partial<GuardianAnalysis>;
  } catch (err) {
    console.error("Claude guardian API error:", err);
    return null;
  }
}

// ── POST 핸들러 ────────────────────────────────────────────

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
    const base = buildDeterministicGuardianAnalysis(name, sajuInfo, gender);

    const claudeResult = await analyzeGuardianWithClaude(
      name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender, sajuInfo
    );

    if (claudeResult) {
      const analysis: GuardianAnalysis = {
        ...base,
        guardianType:       claudeResult.guardianType       ?? base.guardianType,
        guardianTypeEmoji:  claudeResult.guardianTypeEmoji  ?? base.guardianTypeEmoji,
        description:        claudeResult.description        ?? base.description,
        characteristics:    claudeResult.characteristics    ?? base.characteristics,
        relationship:       claudeResult.relationship       ?? base.relationship,
        luckAreas:          claudeResult.luckAreas          ?? base.luckAreas,
        howToMeet:          claudeResult.howToMeet          ?? base.howToMeet,
        meetTiming:         claudeResult.meetTiming         ?? base.meetTiming,
        myStrength:         claudeResult.myStrength         ?? base.myStrength,
        benefit:            claudeResult.benefit            ?? base.benefit,
        signToRecognize:    claudeResult.signToRecognize    ?? base.signToRecognize,
        kakaoFirstMessage:  claudeResult.kakaoFirstMessage  ?? base.kakaoFirstMessage,
        pastLifeConnection: claudeResult.pastLifeConnection ?? base.pastLifeConnection,
        caution:            claudeResult.caution            ?? base.caution,
        actionGuide:        claudeResult.actionGuide        ?? base.actionGuide,
        monthlyLuck:        claudeResult.monthlyLuck        ?? base.monthlyLuck,
        readiness:          claudeResult.readiness          ?? base.readiness,
        imagePrompt:        claudeResult.imagePrompt        ?? base.imagePrompt,
      };
      return NextResponse.json(analysis);
    }

    return NextResponse.json(base);
  } catch (err) {
    console.error("analyze-guardian error:", err);
    return NextResponse.json({ error: "귀인 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
