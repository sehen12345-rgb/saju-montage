import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju";
import { buildSajuSystemPrompt, buildSajuUserPrompt } from "@/lib/prompts";
import type { SajuInput, SajuAnalysis } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body: SajuInput = await req.json();
    const { birthYear, birthMonth, birthDay, birthHour, gender } = body;

    if (!birthYear || !birthMonth || !birthDay || !gender) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const sajuInfo = calculateSaju(birthYear, birthMonth, birthDay, birthHour ?? -1);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildSajuSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildSajuUserPrompt(
            birthYear, birthMonth, birthDay, birthHour ?? -1, gender, sajuInfo
          ),
        },
      ],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    // JSON 파싱 (마크다운 코드블록 제거)
    const jsonStr = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    const analysis: SajuAnalysis = {
      description: parsed.description,
      imagePrompt: parsed.imagePrompt,
      characteristics: parsed.characteristics,
      sajuInfo,
    };

    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("analyze-saju error:", err);
    return NextResponse.json({ error: "사주 분석 중 오류가 발생했습니다.", detail: message }, { status: 500 });
  }
}
