import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { isKeyPlaceholder, getDemoImageUrl } from "@/lib/demo";
import type { SajuInfo } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { prompt, gender, sajuInfo, demo } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트가 없습니다." }, { status: 400 });
    }

    // API 키 없거나 데모 모드면 샘플 이미지 반환
    if (demo || isKeyPlaceholder(process.env.OPENAI_API_KEY)) {
      await new Promise((r) => setTimeout(r, 1500));
      const imageUrl = getDemoImageUrl(
        (gender as "male" | "female") ?? "female",
        sajuInfo as SajuInfo ?? { yearPillar: "갑자", monthPillar: "병인", dayPillar: "무오", hourPillar: "경신" }
      );
      return NextResponse.json({ imageUrl, demo: true });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const spouseGender = (gender as string) === "male" ? "woman" : "man";
    const fullPrompt = `close-up portrait photo, face centered in frame, ${spouseGender}, Korean, ${prompt}, looking directly at camera, sharp facial features, blurred background, professional studio lighting, photorealistic, high quality, no text, no watermark`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error("이미지 URL을 받지 못했습니다.");

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("generate-image error:", err);
    return NextResponse.json({ error: "이미지 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
