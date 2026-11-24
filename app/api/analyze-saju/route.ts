import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
import { buildSajuContext } from "@/lib/saju";
import { buildManseryeokData } from "@/lib/manseryeok";
import {
  buildSpouseAnalysisBase,
  buildManseryeokPromptContext,
} from "@/lib/sajuAnalyzer";
import { buildSelfBase } from "@/lib/selfAnalyzer";
import { getSajuSeed } from "@/lib/prompts";
import { buildFullDeterministicAnalysis } from "@/lib/deterministic";
import type { SajuInput, SajuAnalysis, SajuDeepSectionWithBridge } from "@/lib/types";
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

    const systemMsg = `당신은 35년 경력 사주명리학 전문가이자 MZ 세대 감성의 연애 콘텐츠 작가입니다.
만세력 데이터를 근거로 ${spouseLabel}의 서술 텍스트를 작성합니다.
반드시 순수 JSON만 응답하세요 (마크다운 코드블록, 설명 텍스트 금지).`;

    const prompt = `아래 만세력 분석 데이터를 근거로 ${spouseLabel}의 서술 텍스트만 작성하세요.
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
  "animalFace": { "type": "오행 매핑 참고: 木→사슴상(🦌 길고 단정한 이목구비)/火→고양이상(🐱 날카롭고 도도한 느낌)/土→강아지상(🐶 둥글고 친근한 인상)/金→여우상(🦊 세련되고 날렵한 얼굴)/水→토끼상(🐰 맑고 순수한 눈매). 일간 오행 기반으로 선택", "emoji": "해당 이모지", "desc": "왜 이 동물상인지 눈코입 특징 1문장" },
  "celebrityLookalikes": [{"name": "한국 연예인 실명", "likePart": "닮은 부위", "reason": "닮은 이유 한 줄"}, {"name": "...", "likePart": "...", "reason": "..."}, {"name": "...", "likePart": "...", "reason": "..."}],
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
      max_tokens: 5000,
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
      return JSON.parse(jsonStr) as Partial<SajuAnalysis>;
    } catch {
      // 열린 문자열/객체 닫기 시도
      const repaired = jsonStr
        .replace(/,\s*"[^"]*":\s*"[^"]*$/, '"')  // 잘린 key-value
        .replace(/,\s*"[^"]*":\s*\{[^}]*$/, '')   // 잘린 object
        .replace(/,\s*\[[^\]]*$/, '')              // 잘린 array
        .replace(/,\s*$/, '') + "}";
      try { return JSON.parse(repaired) as Partial<SajuAnalysis>; } catch { return null; }
    }
  } catch (err) {
    console.error("Claude narrative API error:", err);
    return null;
  }
}

/**
 * 본인 사주 딥 분석 8개 섹션 + 배우자 브릿지 생성 (Opus)
 */
async function generateSelfDeepWithBridge(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: "male" | "female",
  selfBase: ReturnType<typeof buildSelfBase>,
  spouseBase: ReturnType<typeof buildSpouseAnalysisBase>,
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
만세력 데이터를 근거로 본인 사주의 딥 분석을 작성하되, 각 섹션 끝에 "이런 사주이기에 어떤 배우자가 필요한지"를 자연스럽게 연결합니다.
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

[배우자 사주에서 이미 결정된 정보 — spouseBridge 작성 시 참고]
- 배우자 MBTI: ${spouseBase.mbti}
- 배우자 직업군: ${spouseBase.job}
- 케미 타입: ${spouseBase.chemistryType?.name ?? "미정"} ${spouseBase.chemistryType?.emoji ?? ""}
- 사랑 언어: 주 ${spouseBase.loveLanguage?.primary ?? "미정"} / 보조 ${spouseBase.loveLanguage?.secondary ?? "미정"}
- 만남 시기: ${spouseBase.meetTiming.ageRange}, ${spouseBase.meetTiming.season}

${sajuContext}

${manseryeokContext}

[★ spouseBridge 작성 지침 — 매우 중요]
- 각 섹션의 본인 분석 내용에서 자연스럽게 "그래서 어떤 배우자가 필요한지"로 연결
- 위에 주어진 배우자 정보(MBTI, 직업, 케미타입 등)를 spouseBridge에 자연스럽게 녹여넣을 것
- 뻔한 연결 금지: "그래서 좋은 배우자가 필요합니다" ← 이런 거 절대 금지
- 구체적이고 감성적으로: "이런 당신이니까, 옆에서 조용히 손잡아줄 ${spouseBase.mbti} 타입이 딱이에요" 처럼
- 마지막 섹션("마지막 한마디")의 spouseBridge는 반드시 "그 사람의 얼굴, 지금 보여드릴게요..." 느낌으로 몽타주 공개를 예고

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
      "spouseBridge": "이 분석에서 자연스럽게 배우자로 연결되는 1-2문장. 구체적이고 설레게."
    }
  ]
}

deepSections는 반드시 아래 순서대로 정확히 8개:

1. category: "한마디로" | icon: "✦" | 이 사주 전체를 관통하는 핵심 한 마디. 핵심 비유 확립.
2. category: "쓴소리 좀 할게" | icon: "✗" | 단점/나쁜 습관 솔직하게. spouseBridge: "이런 당신을 잡아줄 사람은..."
3. category: "나만의 매력" | icon: "♡" | 숨겨진 강점/잠재력. spouseBridge: "이 매력에 반할 배우자는..."
4. category: "나에게 맞는 일" | icon: "💼" | 직업/커리어 구체적으로. spouseBridge: "커리어를 함께할 파트너는..."
5. category: "재물복" | icon: "💰" | 재물운 솔직하게. spouseBridge: "돈 궁합이 맞는 상대는..."
6. category: "연애운" | icon: "♡" | 연애 패턴+이상형. spouseBridge: "당신의 연애를 완성할 사람은..."
7. category: "곁에 둘 사람" | icon: "☽" | 대인관계/인연. spouseBridge: "평생 곁에 둘 배우자는..."
8. category: "마지막 한마디" | icon: "❝" | 따뜻한 마무리. spouseBridge: 반드시 "그 사람의 얼굴, 지금 보여드릴게요..." 느낌

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
    console.error("Claude self deep bridge error:", err);
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

    // 4) 사용자 본인 사주 기본 데이터 (AI 호출 전에 필요)
    const selfBase = buildSelfBase(manseryeok, name);

    // 5) AI 서술 2개 병렬 호출: 배우자 서술(Sonnet) + 본인 딥 분석+브릿지(Opus)
    const sajuContext = buildSajuContext(sajuInfo);
    const manseryeokContext = buildManseryeokPromptContext(manseryeok);
    const [narrative, selfDeepSections] = await Promise.all([
      generateNarrativeWithClaude(
        name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
        base, manseryeokContext, sajuContext,
      ),
      generateSelfDeepWithBridge(
        name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender,
        selfBase, base, manseryeokContext, sajuContext,
      ),
    ]);

    // 6) 합성: base(만세력) ← demo 외모 ← AI 서술
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
      animalFace:         narrative?.animalFace,
      celebrityLookalikes: narrative?.celebrityLookalikes,
      partnerPsychology:  narrative?.partnerPsychology,

      // 데모에만 있는 보조 필드
      descTitle:          det.descTitle,
      personalityTitle:   det.personalityTitle,
      loveStyleTitle:     det.loveStyleTitle,
      lifeStyleTitle:     det.lifeStyleTitle,
      firstMeetTitle:     det.firstMeetTitle,

      // actionGuide 는 만세력 기반 advice로 대체
      actionGuide: base.advice,

      // 본인 사주 딥 분석 + 배우자 브릿지
      ...(selfDeepSections ? { selfDeepSections } : {}),
    };

    return NextResponse.json({ ...analysis, selfSaju: selfBase });
  } catch (err) {
    console.error("analyze-saju error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
