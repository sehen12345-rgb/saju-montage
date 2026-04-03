import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju";
import { buildSajuSystemPrompt, buildSajuUserPrompt } from "@/lib/prompts";
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

    // API 키 없으면 데모 응답 반환
    if (isKeyPlaceholder(process.env.ANTHROPIC_API_KEY)) {
      await new Promise((r) => setTimeout(r, 2000));
      return NextResponse.json({ ...getDemoAnalysis(gender, sajuInfo), demo: true });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildSajuSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildSajuUserPrompt(
            name, birthYear, birthMonth, birthDay, birthHour ?? -1, gender, sajuInfo
          ),
        },
      ],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonStr = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({
      description: parsed.description,
      imagePrompt: parsed.imagePrompt,
      characteristics: parsed.characteristics,
      sajuInfo,
    });
  } catch (err) {
    console.error("analyze-saju error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
