import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { isKeyPlaceholder } from "@/lib/demo";
import type { SajuInfo } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { prompt, gender, sajuInfo, demo } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트가 없습니다." }, { status: 400 });
    }

    const spouseGender = (gender as string) === "male" ? "woman" : "man";

    // 데모 모드: 서버에서 직접 SVG 초상화 생성 (외부 의존 없음)
    if (demo || isKeyPlaceholder(process.env.OPENAI_API_KEY)) {
      const info = sajuInfo as SajuInfo;
      const imageUrl =
        `/api/portrait?gender=${gender}` +
        `&year=${encodeURIComponent(info?.yearPillar ?? "갑자")}` +
        `&month=${encodeURIComponent(info?.monthPillar ?? "병인")}` +
        `&day=${encodeURIComponent(info?.dayPillar ?? "무오")}` +
        `&hour=${encodeURIComponent(info?.hourPillar ?? "경신")}`;
      return NextResponse.json({ imageUrl, demo: true });
    }

    // 실제 모드: DALL·E 3
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: [
        `professional ID photo portrait of Korean ${spouseGender}`,
        prompt,
        "pure white background",
        "face centered",
        "looking at camera",
        "photorealistic",
        "no text",
        "no watermark",
      ].join(", "),
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
