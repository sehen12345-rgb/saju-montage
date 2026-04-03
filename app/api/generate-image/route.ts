import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { isKeyPlaceholder } from "@/lib/demo";

export async function POST(req: NextRequest) {
  try {
    const { prompt, gender, sajuInfo, demo } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트가 없습니다." }, { status: 400 });
    }

    const spouseGender = (gender as string) === "male" ? "woman" : "man";

    // 데모 모드: Pollinations.ai URL을 브라우저에 직접 반환 (서버 경유 X)
    if (demo || isKeyPlaceholder(process.env.OPENAI_API_KEY)) {
      const seed = sajuInfo
        ? JSON.stringify(sajuInfo).split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
        : Math.floor(Math.random() * 9999);

      const p = `portrait of Korean ${spouseGender}, ${prompt}, white background, face centered, looking at camera, photorealistic`;
      const imageUrl =
        `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}` +
        `?width=512&height=512&nologo=true&seed=${seed}&model=flux-schnell`;

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
