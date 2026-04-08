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

    const prompt = `당신은 사주명리학 전문가입니다. 아래 사주를 분석하여 ${spouseLabel}의 특성을 상세히 설명해주세요.

사주 정보:
- 이름: ${name}
- 생년월일시: ${birthYear}년 ${birthMonth}월 ${birthDay}일 ${hourStr}
- 성별: ${genderLabel}
- 사주팔자: 년주 ${sajuInfo.yearPillar} / 월주 ${sajuInfo.monthPillar} / 일주 ${sajuInfo.dayPillar} / 시주 ${sajuInfo.hourPillar}

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이 순수 JSON만):
{
  "description": "배우자 외모 설명 2-3문장 (한국어, 구체적이고 시각적으로)",
  "characteristics": ["핵심특징1", "핵심특징2", "핵심특징3"],
  "mbti": "MBTI 유형 (예: INFJ)",
  "job": "예상 직업군",
  "compatibility": "한 줄 궁합 한마디 (매력적이고 구체적으로, 20자 이내)",
  "personality": "성격 설명 3-4문장 (한국어, 구체적인 일상 행동 포함)",
  "loveStyle": "연애 스타일 2-3문장 (한국어)",
  "firstMeet": "첫 만남 시나리오 2-3문장 (한국어, 구체적인 장소/상황 포함)",
  "lifeStyle": "라이프스타일 2-3문장 (한국어)",
  "nameHint": "이름 첫 글자 힌트 1문장 (예: 받침 없는 'ㅅ'이나 'ㅈ' 계열 이름일 가능성이 높습니다)",
  "pastLife": "전생 인연 이야기 3-4문장 (한국어, 구체적인 시대/상황 포함, 감성적으로)",
  "kakaoFirstMessage": "배우자가 처음 보낼 카카오톡 메시지 (자연스럽고 성격에 맞게, 1-2문장)",
  "firstDate": "첫 데이트 코스 2-3문장 (한국어, 구체적인 장소/활동 포함)",
  "conflictAndMakeup": "갈등 & 화해 패턴 2-3문장 (한국어)",
  "myCharm": "배우자 눈에 비친 나의 매력 2-3문장 (한국어, 구체적으로)",
  "warnType": "조심해야 할 악연 유형 2-3문장 (한국어)",
  "celebrityVibe": "닮은꼴 연예인 분위기 1-2문장 (한국어, 구체적인 연예인 이름 언급 가능)"
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
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

    // Enhance: Claude API for natural language text fields
    const claudeResult = await analyzeWithClaude(
      name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender, sajuInfo
    );

    if (claudeResult) {
      const analysis: SajuAnalysis = {
        ...base,
        // Claude-generated natural text fields
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
      };
      return NextResponse.json(analysis);
    }

    return NextResponse.json(base);
  } catch (err) {
    console.error("analyze-saju error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
