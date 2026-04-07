import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju";
import { buildSajuSystemPrompt, buildSajuUserPrompt, buildDeterministicFields, getSajuSeed } from "@/lib/prompts";
import { isKeyPlaceholder, getDemoAnalysis } from "@/lib/demo";
import type { SajuInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: SajuInput = await req.json();
    const { name, birthYear, birthMonth, birthDay, birthHour, gender } = body;

    if (!name || !birthYear || !birthMonth || !birthDay || !gender) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const sajuInfo = calculateSaju(birthYear, birthMonth, birthDay, birthHour ?? -1);

    if (isKeyPlaceholder(process.env.ANTHROPIC_API_KEY)) {
      await new Promise((r) => setTimeout(r, 2000));
      const demoSpouseGender = gender === "male" ? "woman" : "man";
      const demoSeed = getSajuSeed(sajuInfo, demoSpouseGender);
      const demoDet = buildDeterministicFields(sajuInfo, gender, demoSeed);
      return NextResponse.json({
        ...getDemoAnalysis(gender, sajuInfo),
        ...demoDet,
        demo: true,
      });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: buildSajuSystemPrompt(),
      messages: [{
        role: "user",
        content: buildSajuUserPrompt(name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender, sajuInfo),
      }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonStr = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    // 사주 시드로 직접 계산 — Claude에게 맡기면 비슷해지는 필드들
    const spouseGender = gender === "male" ? "woman" : "man";
    const seed = getSajuSeed(sajuInfo, spouseGender);
    const det = buildDeterministicFields(sajuInfo, gender, seed);

    return NextResponse.json({
      description: parsed.description,
      imagePrompt: parsed.imagePrompt,
      characteristics: parsed.characteristics,
      mbti: parsed.mbti,
      job: parsed.job,
      hobbies: det.hobbies,               // 시드 기반 직접 계산
      compatibility: parsed.compatibility,
      descTitle: parsed.descTitle,
      personalityTitle: parsed.personalityTitle,
      loveStyleTitle: parsed.loveStyleTitle,
      lifeStyleTitle: parsed.lifeStyleTitle,
      firstMeetTitle: parsed.firstMeetTitle,
      bodySpec: parsed.bodySpec,
      personality: parsed.personality,
      loveStyle: parsed.loveStyle,
      firstMeet: parsed.firstMeet,
      lifeStyle: parsed.lifeStyle,
      compatibilityScores: parsed.compatibilityScores,
      meetTiming: parsed.meetTiming,
      caution: parsed.caution,
      advice: parsed.advice,
      timeline: parsed.timeline,
      nameHint: det.nameHint,             // 시드 기반 직접 계산
      pastLife: det.pastLife,             // 시드 기반 직접 계산
      kakaoFirstMessage: det.kakaoFirstMessage, // 시드 기반 직접 계산
      firstDate: parsed.firstDate,
      conflictAndMakeup: parsed.conflictAndMakeup,
      favoriteThings: parsed.favoriteThings,
      warnType: parsed.warnType,
      celebrityVibe: parsed.celebrityVibe,
      myCharm: parsed.myCharm,
      chemistryType: parsed.chemistryType,
      monthlyChance: parsed.monthlyChance,
      readiness: parsed.readiness,
      sajuInfo,
    });
  } catch (err) {
    console.error("analyze-saju error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
