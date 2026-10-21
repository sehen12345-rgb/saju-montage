import { NextRequest, NextResponse } from "next/server";
import { buildSajuContext } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildSpouseAnalysisBase,
  buildManseryeokPromptContext,
} from "@/lib/sajuAnalyzer";
import { buildSelfBase } from "@/lib/selfAnalyzer";
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

    const prompt = `당신은 사주명리학 전문가이자 MZ 감성의 콘텐츠 작가입니다.
아래 만세력 분석 데이터를 근거로 ${spouseLabel}의 서술 텍스트만 작성하세요.
점수·시기·MBTI·직업 등 수치/구조 필드는 이미 만세력에서 도출되었으므로 작성하지 마세요.

[필수 문체 지침 — 이것이 가장 중요합니다]
- 친한 친구가 솔직하게 말해주는 톤. 학술 보고서나 딱딱한 설명 절대 금지.
- "마치 ~처럼", "~하는 것 같아요" 비유를 적극 활용
- 읽는 사람이 "맞아, 이런 사람 있잖아!" 하고 고개 끄덕이게 만들 것
- 설레고 기대되는 감정을 자연스럽게 건드릴 것 (두근두근 설렘 유발)
- "~합니다" 단정체가 아니라 "~할 수 있어요", "~겠죠?" 공감체 혼용
- 이 사람의 이름(${name})을 자연스럽게 섞어서 개인화
- 뻔한 말 절대 금지: "노력하면 됩니다", "균형이 중요합니다" 같은 표현 금지

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
  "description": "배우자 외모 설명 2-3문장. '마치 ~처럼' 비유로 시각적으로 묘사. 딱딱한 나열이 아니라 실제로 마주쳤을 때의 첫인상 느낌으로. (일간 오행 특성 반영)",
  "personality": "성격 설명 3-4문장. 일상에서 드러나는 구체적 행동·말투로. '이런 사람 있잖아요~' 공감 유도. (만세력 일간/십신 특성 반영)",
  "loveStyle": "연애 스타일 2-3문장. '연애할 때 ~하는 타입이에요' 식으로 구체적이고 공감되게. 설레는 감정 유발. (만세력 사랑언어와 일치)",
  "firstMeet": "첫 만남 시나리오 2-3문장. 영화 장면처럼 생생하게 묘사. '이런 상황에서 만나겠구나!' 기대감 유발. (만세력 시기/상황과 일치)",
  "lifeStyle": "라이프스타일 2-3문장. 구체적인 취미·일상·소비 패턴. '나랑 잘 맞겠다/안 맞겠다' 판단할 수 있게.",
  "nameHint": "이름 힌트 1문장. 구체적 초성·계열로 '혹시 이 이름 아니에요?' 느낌으로 신기하게.",
  "pastLife": "전생 인연 이야기 3-4문장. 구체적 시대·장소·상황으로 드라마틱하게. 감성적이고 설레게 마무리.",
  "kakaoFirstMessage": "배우자가 처음 보낼 카카오톡 메시지 (성격에 딱 맞는 말투로, 받으면 심장 두근할 만큼 자연스럽게, 1-2문장)",
  "firstDate": "첫 데이트 코스 2-3문장. 구체적 장소·활동을 '이런 데이트 가고 싶다!' 느낌으로 생생하게.",
  "conflictAndMakeup": "갈등 & 화해 패턴 2-3문장. '이럴 때 이렇게 싸우고 이렇게 풀려요' 아주 현실적으로. 공감 100%",
  "myCharm": "배우자 눈에 비친 나의 매력 2-3문장. ${name}님이 상대방 눈에 어떻게 보이는지. 뭉클하거나 설레게.",
  "warnType": "조심해야 할 악연 유형 2-3문장. 구체적 성격·행동 패턴으로 '이런 사람 조심해요!' 현실 경고.",
  "celebrityVibe": "닮은꼴 연예인 분위기 1-2문장. 한국 연예인 실명 가능. '딱 이 느낌이에요!' 납득 가게.",
  "partnerPsychology": "배우자 심리 분석 2-3문장. 어떤 사람에게 마음이 열리는지, 어떤 순간 사랑에 빠지는지. ${name}님이 읽으면 '이 사람 내가 잡을 수 있겠다!' 희망 주게."
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

    // 6) 사용자 본인 사주 기본 데이터
    const selfBase = buildSelfBase(manseryeok, name);

    return NextResponse.json({ ...analysis, selfSaju: selfBase });
  } catch (err) {
    console.error("analyze-saju error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
