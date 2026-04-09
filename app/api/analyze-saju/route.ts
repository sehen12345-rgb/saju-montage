import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju";
import { getSajuSeed } from "@/lib/prompts";
import { buildFullDeterministicAnalysis } from "@/lib/deterministic";
import type { SajuInput, SajuAnalysis, SajuInfo } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";

async function analyzeWithClaude(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  sajuInfo: SajuInfo,
): Promise<Partial<SajuAnalysis> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const spouseLabel = gender === "male" ? "여성 배우자" : "남성 배우자";
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";

    const prompt = `당신은 사주명리학 전문가이자 운명 분석가입니다. 아래 사주를 깊이 분석하여 ${spouseLabel}의 완전한 운명 보고서를 생성해주세요.

사주 정보:
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
- 사주팔자: 년주 ${sajuInfo.yearPillar} / 월주 ${sajuInfo.monthPillar} / 일주 ${sajuInfo.dayPillar} / 시주 ${sajuInfo.hourPillar}

사주의 오행, 십신, 일간의 특성을 반영하여 진짜 개인화된 분석을 해주세요. 다른 사주와 절대 똑같은 내용이 나오면 안 됩니다.
순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "description": "배우자 외모 설명 2-3문장 (구체적 이목구비·분위기·피부톤 등, 사주 오행 특성 반영)",
  "characteristics": ["핵심특징1", "핵심특징2", "핵심특징3"],
  "mbti": "MBTI 유형",
  "job": "예상 직업군 (구체적 직종명)",
  "compatibility": "한 줄 궁합 한마디 (20자 이내, 임팩트 있게)",
  "bodySpec": {
    "height": "예상 키 범위 (예: 165~170cm)",
    "figure": "체형 특징",
    "fashion": "패션 스타일 (구체적으로)",
    "vibe": "전반적 분위기 한 줄"
  },
  "personality": "성격 설명 3-4문장 (구체적 일상 행동·말투 포함)",
  "loveStyle": "연애 스타일 2-3문장 (어떻게 사랑을 표현하는지 구체적으로)",
  "firstMeet": "첫 만남 시나리오 2-3문장 (구체적 장소·상황·분위기)",
  "lifeStyle": "라이프스타일 2-3문장 (일상 루틴, 취미, 소비 패턴)",
  "meetTiming": {
    "ageRange": "만남 예상 나이대 (예: 27~30세)",
    "season": "주요 계절 (예: 봄 또는 가을)",
    "situation": "만남 상황 (예: 직장 동료 소개)"
  },
  "timeline": {
    "meetAge": "첫 만남 나이 (예: 29세 전후)",
    "datingPeriod": "연애 기간 (예: 약 1년 6개월)",
    "marriageAge": "결혼 예상 나이 (예: 31~32세)",
    "children": "자녀 수 (예: 1~2명)"
  },
  "compatibilityScores": {
    "personality": 75,
    "values": 88,
    "lifestyle": 80,
    "communication": 85,
    "finance": 78
  },
  "nameHint": "이름 첫 글자 힌트 1문장 (구체적 초성/계열 언급)",
  "pastLife": "전생 인연 이야기 3-4문장 (구체적 시대·장소·상황, 감성적으로)",
  "kakaoFirstMessage": "배우자가 처음 보낼 카카오톡 메시지 (성격에 맞는 자연스러운 말투, 1-2문장)",
  "firstDate": "첫 데이트 코스 2-3문장 (구체적 장소·활동·분위기)",
  "conflictAndMakeup": "갈등 & 화해 패턴 2-3문장 (어떨 때 싸우고 어떻게 풀리는지)",
  "myCharm": "배우자 눈에 비친 나의 매력 2-3문장 (배우자 시점에서 구체적으로)",
  "warnType": "조심해야 할 악연 유형 2-3문장 (구체적 성격·행동 패턴)",
  "celebrityVibe": "닮은꼴 연예인 분위기 1-2문장 (한국 연예인 언급 가능)",
  "favoriteThings": {
    "food": "좋아하는 음식 스타일 (구체적 예시)",
    "music": "즐겨 듣는 음악 장르·분위기",
    "movie": "즐겨 보는 콘텐츠 장르",
    "place": "자주 가는 장소 유형"
  },
  "chemistryType": {
    "name": "케미 타입 이름 (예: 운명적 소울메이트, 불꽃 케미, 포근한 안식처 케미)",
    "emoji": "대표 이모지 1개",
    "desc": "케미 설명 2문장 (이 관계의 특별한 에너지)"
  },
  "caution": ["주의사항1 (1-2문장, 구체적 상황)", "주의사항2", "주의사항3"],
  "advice": ["인연 조언1 (지금 당장 할 수 있는 구체적 행동)", "인연 조언2", "인연 조언3"],
  "monthlyChance": [70, 60, 80, 75, 65, 90, 85, 70, 60, 75, 80, 65],
  "readiness": {
    "score": 75,
    "comment": "인연 준비도 코멘트 2문장 (현재 상태와 개선 방향)"
  },
  "loveLanguage": {
    "primary": "주요 사랑 언어 (인정하는 말, 봉사, 선물, 함께하는 시간, 스킨십 중 하나)",
    "secondary": "보조 사랑 언어",
    "desc": "배우자의 사랑 표현 방식 2문장 (구체적인 행동 예시 포함)"
  },
  "partnerPsychology": "배우자 심리 분석 2-3문장 (어떤 사람에게 마음이 열리고, 어떤 순간에 사랑에 빠지는지 구체적으로)",
  "actionGuide": ["지금 당장 실천할 인연 행동1 (매우 구체적인 행동)", "실천 행동2", "실천 행동3"]
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]) as Partial<SajuAnalysis>;
  } catch (err) {
    console.error("Claude API error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: SajuInput = await req.json();
    const { name, birthYear, birthMonth, birthDay, birthHour, gender } = body;

    if (!name || !birthYear || !birthMonth || !birthDay || !gender) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const sajuInfo = calculateSaju(birthYear, birthMonth, birthDay, birthHour ?? -1);
    const spouseGender = gender === "male" ? "woman" : "man";
    const seed = getSajuSeed(sajuInfo, spouseGender);

    // Base: deterministic analysis (always works, no API key needed)
    const base = buildFullDeterministicAnalysis(name, birthYear, sajuInfo, gender, seed);

    // Enhance: Claude API for all fields (text + structured data)
    const claudeResult = await analyzeWithClaude(
      name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender, sajuInfo
    );

    if (claudeResult) {
      const analysis: SajuAnalysis = {
        ...base,
        // Claude가 생성한 텍스트 필드
        description:        claudeResult.description        ?? base.description,
        characteristics:    claudeResult.characteristics    ?? base.characteristics,
        mbti:               claudeResult.mbti               ?? base.mbti,
        job:                claudeResult.job                ?? base.job,
        compatibility:      claudeResult.compatibility      ?? base.compatibility,
        personality:        claudeResult.personality        ?? base.personality,
        loveStyle:          claudeResult.loveStyle          ?? base.loveStyle,
        firstMeet:          claudeResult.firstMeet          ?? base.firstMeet,
        lifeStyle:          claudeResult.lifeStyle          ?? base.lifeStyle,
        nameHint:           claudeResult.nameHint           ?? base.nameHint,
        pastLife:           claudeResult.pastLife           ?? base.pastLife,
        kakaoFirstMessage:  claudeResult.kakaoFirstMessage  ?? base.kakaoFirstMessage,
        firstDate:          claudeResult.firstDate          ?? base.firstDate,
        conflictAndMakeup:  claudeResult.conflictAndMakeup  ?? base.conflictAndMakeup,
        myCharm:            claudeResult.myCharm            ?? base.myCharm,
        warnType:           claudeResult.warnType           ?? base.warnType,
        celebrityVibe:      claudeResult.celebrityVibe      ?? base.celebrityVibe,
        // Claude가 생성한 구조화 데이터 (기존엔 deterministic이 담당했던 필드들)
        bodySpec:              claudeResult.bodySpec              ?? base.bodySpec,
        compatibilityScores:   claudeResult.compatibilityScores   ?? base.compatibilityScores,
        meetTiming:            claudeResult.meetTiming            ?? base.meetTiming,
        timeline:              claudeResult.timeline              ?? base.timeline,
        favoriteThings:        claudeResult.favoriteThings        ?? base.favoriteThings,
        chemistryType:         claudeResult.chemistryType         ?? base.chemistryType,
        caution:               claudeResult.caution               ?? base.caution,
        advice:                claudeResult.advice                ?? base.advice,
        monthlyChance:         claudeResult.monthlyChance         ?? base.monthlyChance,
        readiness:             claudeResult.readiness             ?? base.readiness,
        // 신규 프리미엄 필드
        loveLanguage:          claudeResult.loveLanguage,
        partnerPsychology:     claudeResult.partnerPsychology,
        actionGuide:           claudeResult.actionGuide,
      };
      return NextResponse.json(analysis);
    }

    return NextResponse.json(base);
  } catch (err) {
    console.error("analyze-saju error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
