import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { isKeyPlaceholder } from "@/lib/demo";
import { getSajuSeed } from "@/lib/prompts";
import type { SajuInfo } from "@/lib/types";

// 씨드 기반으로 촬영 환경/분위기 변주 (같은 사주면 항상 같은 환경)
const LIGHTING_STYLES = [
  "soft butterfly lighting, neutral gray gradient background",
  "warm Rembrandt lighting, dark bokeh background",
  "clean high-key studio lighting, pure white background",
  "gentle natural window light, soft cream background",
  "golden hour back-rim light, outdoor blurred background",
  "soft diffused overcast light, warm beige background",
];

const SHOT_STYLES = [
  "chest-up portrait, facing camera, slight head tilt",
  "head and shoulders, three-quarter angle, sharp eyes",
  "bust portrait, facing directly forward, symmetrical",
  "close bust shot, slight chin-down angle, intense eye contact",
];

const EXPRESSION_STYLES = [
  "natural confident expression, soft relaxed lips, looking directly at camera",
  "warm gentle smile, approachable expression, eyes looking at camera",
  "calm composed expression, slight smile, direct eye contact",
  "subtle warm expression, thoughtful gaze, looking at camera",
];

function buildFinalPrompt(spouseGender: string, analysisPrompt: string, seed: number): string {
  const genderPrefix = spouseGender === "woman"
    ? "ultra-realistic portrait photograph of a beautiful young East Asian woman"
    : "ultra-realistic portrait photograph of a handsome young East Asian man";

  const lighting   = LIGHTING_STYLES[seed % LIGHTING_STYLES.length];
  const shot       = SHOT_STYLES[(seed >> 1) % SHOT_STYLES.length];
  const expression = EXPRESSION_STYLES[(seed >> 2) % EXPRESSION_STYLES.length];

  return [
    genderPrefix,
    analysisPrompt,
    expression,
    shot,
    lighting,
    "85mm portrait lens, f/1.4 shallow depth of field, creamy background bokeh",
    "natural skin pores and micro-texture, subsurface scattering, true-to-life skin",
    "4K DSLR photograph, ultra-sharp facial details, professional headshot quality",
    "hyperrealistic, photorealistic, RAW photo",
  ].join(", ");
}

const NEGATIVE_PROMPT = [
  "blurry face", "soft focus face", "low quality", "low resolution",
  "distorted face", "ugly", "deformed", "bad anatomy",
  "cartoon", "anime", "illustration", "painting", "sketch", "drawing",
  "digital art", "render", "3d cgi", "plastic skin",
  "over-smoothed skin", "airbrushed", "excessive beauty filter",
  "doll-like", "uncanny valley", "watermark", "text", "logo",
  "extra limbs", "disfigured", "mutated hands", "bad proportions",
  "dark background", "flat lighting", "overexposed", "underexposed",
].join(", ");

// ── Pollinations.ai (완전 무료, 키 불필요) ────────────────
async function generateWithPollinations(prompt: string, seed: number): Promise<string> {
  const encoded  = encodeURIComponent(prompt);
  const negative = encodeURIComponent(NEGATIVE_PROMPT);
  // 768×1024: 인물 포트레이트에 최적, enhance=true: AI 품질 향상, negative 프롬프트 추가
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=1024&model=flux-realism&seed=${seed}&nologo=true&enhance=true&negative=${negative}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) throw new Error(`Pollinations 오류: ${res.status}`);

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) throw new Error("Pollinations: 이미지 응답 아님");

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength < 1000) throw new Error("Pollinations: 이미지 크기 너무 작음");

  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
}

// ── HuggingFace FLUX (무료 토큰) ──────────────────────────
async function generateWithHuggingFace(prompt: string): Promise<string> {
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
              num_inference_steps: model.includes("flux") ? 4 : 30,
              width: 768,
              height: 1024,
              guidance_scale: 7.5,
            },
          }),
          signal: AbortSignal.timeout(120_000),
        }
      );

      if (res.status === 503 || res.status === 429) continue;
      if (!res.ok) { console.warn(`HF ${model} error ${res.status}`); continue; }

      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      if (contentType.includes("application/json")) continue;

      const buffer = await res.arrayBuffer();
      if (buffer.byteLength < 1000) continue;

      const base64 = Buffer.from(buffer).toString("base64");
      return `data:${contentType};base64,${base64}`;
    } catch (e) {
      console.warn(`HF ${model} failed:`, e);
      continue;
    }
  }

  throw new Error("HuggingFace 이미지 생성에 실패했습니다.");
}

// ── Stable Horde (무료, 느림) ─────────────────────────────
async function generateWithStableHorde(prompt: string, seed: number): Promise<string> {
  const submitRes = await fetch("https://stablehorde.net/api/v2/generate/async", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": "0000000000",
      "Client-Agent": "saju-montage:1.0:anonymous",
    },
    body: JSON.stringify({
      prompt: `${prompt} ### ${NEGATIVE_PROMPT}`,
      params: {
        sampler_name: "k_dpmpp_2m",
        cfg_scale: 8,
        steps: 35,
        width: 512,
        height: 768,
        n: 1,
        karras: true,
        seed,
      },
      models: ["Realistic Vision", "Dreamshaper"],
      r2: true,
      shared: false,
      trusted_workers: false,
      slow_workers: true,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!submitRes.ok) throw new Error(`Stable Horde 제출 실패: ${submitRes.status}`);

  const { id } = await submitRes.json() as { id: string };
  if (!id) throw new Error("Stable Horde: job ID 없음");

  const maxWait = 150_000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    await new Promise((r) => setTimeout(r, 3_000));

    const checkRes = await fetch(
      `https://stablehorde.net/api/v2/generate/check/${id}`,
      { signal: AbortSignal.timeout(10_000) }
    ).catch(() => null);
    if (!checkRes?.ok) continue;

    const check = await checkRes.json() as { done: boolean; faulted: boolean };
    if (check.faulted) throw new Error("Stable Horde: 생성 실패");
    if (!check.done) continue;

    const statusRes = await fetch(
      `https://stablehorde.net/api/v2/generate/status/${id}`,
      { signal: AbortSignal.timeout(10_000) }
    );
    if (!statusRes.ok) throw new Error("Stable Horde: 결과 가져오기 실패");

    const status = await statusRes.json() as {
      generations: Array<{ img: string; censored: boolean; state: string }>;
    };
    const gen = status.generations?.[0];
    if (!gen || gen.censored || gen.state !== "ok") throw new Error("Stable Horde: 유효한 이미지 없음");

    const imgRes = await fetch(gen.img, { signal: AbortSignal.timeout(30_000) });
    if (!imgRes.ok) throw new Error("Stable Horde: 이미지 다운로드 실패");

    const buffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") ?? "image/webp";
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  }

  throw new Error("Stable Horde: 시간 초과");
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, gender, sajuInfo } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트가 없습니다." }, { status: 400 });
    }

    const spouseGender = (gender as string) === "male" ? "woman" : "man";
    const info = sajuInfo as SajuInfo;
    const seed = getSajuSeed(info, spouseGender);
    const finalPrompt = buildFinalPrompt(spouseGender, prompt, seed);

    console.log("Image prompt:", finalPrompt);
    console.log("Seed:", seed);

    // ── 1순위: OpenAI DALL·E 3 (키 있을 때) ─────────────
    if (!isKeyPlaceholder(process.env.OPENAI_API_KEY)) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural",
      });
      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) throw new Error("이미지 URL을 받지 못했습니다.");
      return NextResponse.json({ imageUrl });
    }

    // ── 2순위: Pollinations.ai (완전 무료, 키 불필요) ────
    try {
      const imageUrl = await generateWithPollinations(finalPrompt, seed);
      return NextResponse.json({ imageUrl });
    } catch (pollinationsErr) {
      console.warn("Pollinations 실패:", pollinationsErr);
    }

    // ── 3순위: HuggingFace FLUX (무료 토큰) ─────────────
    if (!isKeyPlaceholder(process.env.HF_TOKEN)) {
      try {
        const imageUrl = await generateWithHuggingFace(finalPrompt);
        return NextResponse.json({ imageUrl });
      } catch (hfErr) {
        console.warn("HuggingFace 실패:", hfErr);
      }
    }

    // ── 4순위: Stable Horde (무료, 느림) ─────────────────
    try {
      const imageUrl = await generateWithStableHorde(finalPrompt, seed);
      return NextResponse.json({ imageUrl });
    } catch (hordeErr) {
      console.warn("Stable Horde 실패, SVG 폴백:", hordeErr);
    }

    // ── 5순위: SVG 초상화 폴백 ───────────────────────────
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
