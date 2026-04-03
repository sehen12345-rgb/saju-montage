import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { isKeyPlaceholder } from "@/lib/demo";
import type { SajuInfo } from "@/lib/types";

// 포토리얼리스틱 한국인 초상화 프롬프트 빌더
function buildPortraitPrompt(spouseGender: string, analysisPrompt: string): string {
  const genderDesc = spouseGender === "woman"
    ? "beautiful Korean woman, 20s, soft feminine features, pearl earrings"
    : "handsome Korean man, 20s, sharp clean features";
  return [
    `photorealistic portrait photo of ${genderDesc}`,
    "slight natural smile, looking at camera",
    "soft bokeh background, natural indoor lighting",
    "high quality photography, sharp focus",
    "professional portrait",
    analysisPrompt,
  ].join(", ");
}

// HuggingFace FLUX.1-schnell 호출 → base64 data URL 반환
async function generateWithHuggingFace(prompt: string): Promise<string> {
  // 1순위: FLUX.1-schnell (최고 품질, 무료 토큰으로 사용 가능)
  const models = [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0",
  ];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_inference_steps: model.includes("flux") ? 4 : 20,
              width: 768,
              height: 768,
              guidance_scale: 3.5,
            },
          }),
          signal: AbortSignal.timeout(120_000),
        }
      );

      // 모델 로딩 중(503) 또는 rate limit(429) — 다음 모델 시도
      if (res.status === 503 || res.status === 429) continue;

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn(`HF ${model} error ${res.status}:`, txt);
        continue;
      }

      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      // 이미지가 아닌 JSON 응답이면 스킵
      if (contentType.includes("application/json")) continue;

      const buffer = await res.arrayBuffer();
      if (buffer.byteLength < 1000) continue; // 너무 작으면 오류 응답

      const base64 = Buffer.from(buffer).toString("base64");
      return `data:${contentType};base64,${base64}`;
    } catch (e) {
      console.warn(`HF ${model} failed:`, e);
      continue;
    }
  }

  throw new Error("HuggingFace 이미지 생성에 실패했습니다.");
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, gender, sajuInfo, demo } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트가 없습니다." }, { status: 400 });
    }

    const spouseGender = (gender as string) === "male" ? "woman" : "man";
    const fullPrompt = buildPortraitPrompt(spouseGender, prompt);

    // ── 1순위: OpenAI DALL·E 3 ──────────────────────────
    if (!isKeyPlaceholder(process.env.OPENAI_API_KEY)) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
    }

    // ── 2순위: HuggingFace FLUX (무료 토큰) ─────────────
    if (!isKeyPlaceholder(process.env.HF_TOKEN)) {
      const imageUrl = await generateWithHuggingFace(fullPrompt);
      return NextResponse.json({ imageUrl });
    }

    // ── 3순위: SVG 초상화 데모 ───────────────────────────
    const info = sajuInfo as SajuInfo;
    const imageUrl =
      `/api/portrait?gender=${gender}` +
      `&year=${encodeURIComponent(info?.yearPillar ?? "갑자")}` +
      `&month=${encodeURIComponent(info?.monthPillar ?? "병인")}` +
      `&day=${encodeURIComponent(info?.dayPillar ?? "무오")}` +
      `&hour=${encodeURIComponent(info?.hourPillar ?? "경신")}`;
    return NextResponse.json({ imageUrl, demo: true });

  } catch (err) {
    console.error("generate-image error:", err);
    return NextResponse.json({ error: "이미지 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
