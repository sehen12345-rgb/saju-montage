import { NextRequest, NextResponse } from "next/server";
import { buildSajuContext } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildSpouseAnalysisBase,
  buildManseryeokPromptContext,
} from "@/lib/sajuAnalyzer";
import { getSajuSeed } from "@/lib/prompts";
import { buildFullDeterministicAnalysis } from "@/lib/deterministic";
import type { SajuInput, SajuAnalysis } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";

/**
 * 만세력으로 도출한 base 위에 AI는 서술 텍스트만 생성.
 * 점수/타임라인/월별 인연운/궁합점수/MBTI/직업 등은 모두 base(만세력)에서 결정됨.
 */
async function generateNarrativeWithClaude(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  base: ReturnType<typeof buildSpouseAnalysisBase>,
  manseryeokContext: string,
  sajuContext: string,
): Promise<Partial<SajuAnalysis> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") return null;

  try {
    const client = new Anthropic({ apiKey });
    const spouseLabel = gender === "male" ? "여성 배우자" : "남성 배우자";
    const genderLabel = gender === "male" ? "남성" : "여성";
    const hourStr = birthHour >= 0 ? `${birthHour}시` : "시간 모름";

    const prompt = `당신은 사주명리학 전문가이자 운명 분석가입니다.
아래 만세력 분석 데이터를 근거로 ${spouseLabel}의 서술 텍스트만 작성하세요.
점수·시기·MBTI·직업 등 수치/구조 필드는 이미 만세력에서 도출되었으므로 작성하지 마세요.

[기본 정보]
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
- 사주팔자: 년주 ${base.sajuInfo.yearPillar} / 월주 ${base.sajuInfo.monthPillar} / 일주 ${base.sajuInfo.dayPillar} / 시주 ${base.sajuInfo.hourPillar}

${sajuContext}

${manseryeokContext}

[만세력에서 이미 결정된 핵심 결과]
- MBTI: ${base.mbti}
- 한 줄 궁합: ${base.compatibility}
- 만남 시기: ${base.meetTiming.ageRange}, ${base.meetTiming.season}, ${base.meetTiming.situation}
- 결혼 타임라인: ${base.timeline.meetAge} 만남 → ${base.timeline.datingPeriod} 연애 → ${base.timeline.marriageAge} 결혼
- 케미 타입: ${base.chemistryType?.name ?? ""} ${base.chemistryType?.emoji ?? ""}
- 인연 준비도: ${base.readiness?.score ?? 0}점
- 사랑 언어: 주 ${base.loveLanguage?.primary} / 보조 ${base.loveLanguage?.secondary}

위 만세력 결정 결과와 모순되지 않는 범위에서만 서술 텍스트를 작성하세요.
순수 JSON만 응답하세요 (마크다운 코드블록 없이):
{
  "description": "배우자 외모 설명 2-3문장 (구체적 이목구비·분위기·피부톤, 일간 오행 특성 반영)",
  "personality": "성격 설명 3-4문장 (구체적 일상 행동·말투, 만세력 일간/십신 특성 반영)",
  "loveStyle": "연애 스타일 2-3문장 (만세력 사랑언어와 일치하는 표현 방식)",
  "firstMeet": "첫 만남 시나리오 2-3문장 (만세력에서 도출된 시기/상황과 일치)",
  "lifeStyle": "라이프스타일 2-3문장 (일상 루틴, 취미, 소비 패턴)",
  "nameHint": "이름 첫 글자 힌트 1문장 (구체적 초성/계열 언급)",
  "pastLife": "전생 인연 이야기 3-4문장 (구체적 시대·장소·상황, 감성적으로)",
  "kakaoFirstMessage": "배우자가 처음 보낼 카카오톡 메시지 (성격에 맞는 자연스러운 말투, 1-2문장)",
  "firstDate": "첫 데이트 코스 2-3문장 (구체적 장소·활동·분위기)",
  "conflictAndMakeup": "갈등 & 화해 패턴 2-3문장 (어떨 때 싸우고 어떻게 풀리는지)",
  "myCharm": "배우자 눈에 비친 나의 매력 2-3문장 (배우자 시점에서 구체적으로)",
  "warnType": "조심해야 할 악연 유형 2-3문장 (구체적 성격·행동 패턴)",
  "celebrityVibe": "닮은꼴 연예인 분위기 1-2문장 (한국 연예인 언급 가능)",
  "partnerPsychology": "배우자 심리 분석 2-3문장 (어떤 사람에게 마음이 열리고, 어떤 순간에 사랑에 빠지는지 구체적으로)"
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]) as Partial<SajuAnalysis>;
  } catch (err) {
    console.error("Claude narrative API error:", err);
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

    // 1) 만세력 종합 데이터
    const manseryeok = buildManseryeokData(
      birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
    );
    const { sajuInfo } = manseryeok;

    // 2) 만세력 기반 base — 점수·타임라인·월별 인연운·궁합·MBTI·직업 모두 여기서 결정
    const base = buildSpouseAnalysisBase(manseryeok);

    // 3) 외모/이미지 프롬프트는 결정론적 demo 룩업에서 가져옴 (얼굴 묘사는 demo가 자세함)
    const spouseGender = gender === "male" ? "woman" : "man";
    const seed = getSajuSeed(sajuInfo, spouseGender);
    const det = buildFullDeterministicAnalysis(name, birthYear, sajuInfo, gender, seed);

    // 4) 서술 텍스트만 AI로 생성
    const sajuContext = buildSajuContext(sajuInfo);
    const manseryeokContext = buildManseryeokPromptContext(manseryeok);
    const narrative = await generateNarrativeWithClaude(
      name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
      base, manseryeokContext, sajuContext,
    );

    // 5) 합성: base(만세력) ← demo 외모 ← AI 서술
    const analysis: SajuAnalysis = {
      // 외모/이미지(데모)
      description: narrative?.description ?? det.description,
      imagePrompt: det.imagePrompt,

      // 만세력 결정 필드
      ...base,

      // AI 서술 (없으면 데모 서술 fallback)
      personality:        narrative?.personality        ?? det.personality,
      loveStyle:          narrative?.loveStyle          ?? det.loveStyle,
      firstMeet:          narrative?.firstMeet          ?? det.firstMeet,
      lifeStyle:          narrative?.lifeStyle          ?? det.lifeStyle,
      nameHint:           narrative?.nameHint           ?? det.nameHint,
      pastLife:           narrative?.pastLife           ?? det.pastLife,
      kakaoFirstMessage:  narrative?.kakaoFirstMessage  ?? det.kakaoFirstMessage,
      firstDate:          narrative?.firstDate          ?? det.firstDate,
      conflictAndMakeup:  narrative?.conflictAndMakeup  ?? det.conflictAndMakeup,
      myCharm:            narrative?.myCharm            ?? det.myCharm,
      warnType:           narrative?.warnType           ?? det.warnType,
      celebrityVibe:      narrative?.celebrityVibe      ?? det.celebrityVibe,
      partnerPsychology:  narrative?.partnerPsychology,

      // 데모에만 있는 보조 필드
      descTitle:          det.descTitle,
      personalityTitle:   det.personalityTitle,
      loveStyleTitle:     det.loveStyleTitle,
      lifeStyleTitle:     det.lifeStyleTitle,
      firstMeetTitle:     det.firstMeetTitle,

      // actionGuide 는 만세력 기반 advice로 대체
      actionGuide: base.advice,
    };

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("analyze-saju error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
