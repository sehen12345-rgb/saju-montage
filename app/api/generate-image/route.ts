import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { isKeyPlaceholder } from "@/lib/demo";
import { getSajuSeed } from "@/lib/prompts";
import type { SajuInfo } from "@/lib/types";

// ── 씨드 기반 촬영 환경 변주 (같은 사주 = 항상 같은 분위기) ──────────
// 2026 최신 기법: 구체적 카메라 스펙 + 조명 유형 명시 → 리얼리즘 극대화
const LIGHTING_STYLES = [
  "soft butterfly lighting, seamless light gray studio background, even fill light",
  "warm Rembrandt lighting, subtle shadow triangle on cheek, deep charcoal background",
  "clean high-key studio lighting, pure white background, bright airy mood",
  "gentle natural window light diffused through sheer curtain, warm cream background",
  "golden hour rim light from behind, soft front fill, outdoor blurred bokeh",
  "professional beauty dish lighting, silver reflector fill, neutral gradient background",
];

const SHOT_STYLES = [
  "chest-up portrait, subject facing camera directly, slight natural head tilt",
  "head and shoulders, three-quarter angle, confident posture, sharp focus on eyes",
  "bust-length portrait, symmetrical frontal composition, strong eye contact",
  "close chest-up shot, slight chin-down angle, intense direct gaze into lens",
];

const EXPRESSION_STYLES = [
  "natural relaxed expression, soft parted lips, calm confident look directly at camera",
  "warm genuine smile, crow's feet at corners of eyes, approachable friendly expression",
  "composed serene expression, subtle closed-mouth smile, thoughtful intelligent gaze",
  "quiet charismatic look, eyes with natural depth and warmth, slight asymmetric smile",
];

// 피부 연령대 — 사주 씨드로 결정 (20대 초반~30대 중반 범위)
const AGE_DESCRIPTORS_F = ["early 20s", "mid 20s", "late 20s", "early 30s"];
const AGE_DESCRIPTORS_M = ["mid 20s", "late 20s", "early 30s", "mid 30s"];

function buildFinalPrompt(spouseGender: string, analysisPrompt: string, seed: number): string {
  const isFemale = spouseGender === "woman";
  const ageArr   = isFemale ? AGE_DESCRIPTORS_F : AGE_DESCRIPTORS_M;
  const age      = ageArr[seed % ageArr.length];

  // 2026 권장: 성별·나이·민족을 앞에 명시 → 모델이 얼굴 구조를 먼저 확정
  const subject = isFemale
    ? `RAW photo, portrait of a beautiful ${age} Korean woman`
    : `RAW photo, portrait of a handsome ${age} Korean man`;

  const lighting   = LIGHTING_STYLES[seed % LIGHTING_STYLES.length];
  const shot       = SHOT_STYLES[(seed >> 1) % SHOT_STYLES.length];
  const expression = EXPRESSION_STYLES[(seed >> 2) % EXPRESSION_STYLES.length];

  // 피부 디테일: "visible pores", "natural skin imperfections" → uncanny valley 제거
  const skinDetail = isFemale
    ? "flawless yet natural Korean beauty skin, subtle natural makeup, visible skin pores, soft subsurface scattering, realistic skin luminosity, natural slight skin imperfections"
    : "healthy natural skin, light stubble or clean-shaven, visible pores, realistic skin texture, natural skin tone variation, subsurface scattering";

  // 카메라 스펙 명시 → 2026 리서치 기준 최고 리얼리즘 달성
  const cameraSpec = "Canon EOS R5, 85mm f/1.4 lens, shallow depth of field, creamy bokeh background, ISO 100, 1/125s";

  // 눈 디테일 강화 (AI 인물화의 핵심 약점)
  const eyeDetail = "ultra-sharp eyes, realistic iris texture with subtle limbal ring, natural catchlight reflection, depth in pupils, natural eyelashes";

  return [
    subject,
    analysisPrompt,
    expression,
    shot,
    lighting,
    skinDetail,
    eyeDetail,
    cameraSpec,
    "professional headshot quality, high-end beauty editorial, 8K ultra-detailed",
    "photorealistic, hyperrealistic, cinematographic",
  ].join(", ");
}

// 2026 최신 네거티브 프롬프트 — FLUX/SD 공통 최적화
const NEGATIVE_PROMPT = [
  "3d render", "cgi", "illustration", "painting", "sketch", "drawing", "cartoon", "anime",
  "plastic skin", "overly smooth skin", "waxy face", "airbrushed", "excessive beauty filter",
  "doll-like", "uncanny valley", "mannequin", "fake HDR",
  "blurry face", "soft focus", "out of focus eyes", "asymmetric eyes",
  "distorted face", "deformed", "bad anatomy", "extra fingers", "mutated hands",
  "watermark", "text", "logo", "signature", "frame", "border",
  "overexposed", "underexposed", "flat lighting", "low quality", "low resolution",
].join(", ");

// ── 이미지 매직바이트 검증 (HTML/텍스트 응답 차단) ──────────
function isValidImageBuffer(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true;
  // WEBP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) return true;
  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;
  return false;
}

// ── Pollinations.ai (완전 무료, 키 불필요) ────────────────
// Vercel maxDuration=60s 기준: 단일 시도 50s timeout → 10s 여유
async function generateWithPollinations(prompt: string, seed: number): Promise<string> {
  // 프롬프트가 너무 길면 URL 길이 초과 → 앞 900자로 제한
  const trimmedPrompt = prompt.length > 900 ? prompt.slice(0, 900) : prompt;
  const encoded = encodeURIComponent(trimmedPrompt);

  // 네거티브는 핵심만 (URL 길이 절약)
  const negEncoded = encodeURIComponent("cartoon, anime, blurry, deformed, ugly, plastic skin, watermark");

  // flux-pro → flux-realism → flux 순으로 품질 우선
  const models = ["flux-pro", "flux-realism", "flux"];
  const model = models[seed % models.length];
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=1024&model=${model}&seed=${seed}&nologo=true&enhance=true&negative=${negEncoded}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(50_000) });

  if (!res.ok) throw new Error(`Pollinations ${res.status}`);

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) throw new Error(`non-image: ${contentType}`);

  const buffer = await res.arrayBuffer();
  if (!isValidImageBuffer(buffer)) throw new Error("invalid image magic bytes (HTML error page)");
  if (buffer.byteLength < 5000) throw new Error(`too small: ${buffer.byteLength}bytes`);

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
          signal: AbortSignal.timeout(40_000),
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
    const { prompt, gender, sajuInfo, _randomSeed } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트가 없습니다." }, { status: 400 });
    }

    const spouseGender = (gender as string) === "male" ? "woman" : "man";
    const info = sajuInfo as SajuInfo;
    // _randomSeed가 있으면 재생성 요청 → 다른 이미지 생성
    const seed = _randomSeed ?? getSajuSeed(info, spouseGender);
    const finalPrompt = buildFinalPrompt(spouseGender, prompt, seed);

    console.log("Image prompt:", finalPrompt);
    console.log("Seed:", seed);

    // ── 1순위: OpenAI gpt-image-1 (GPT-4o 네이티브, 최고품질) ──
    if (!isKeyPlaceholder(process.env.OPENAI_API_KEY)) {
      // gpt-image-1 시도
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // gpt-image-1은 항상 b64_json 반환, 프롬프트 1000자 제한
        const trimmedPrompt = finalPrompt.length > 1000 ? finalPrompt.slice(0, 1000) : finalPrompt;
        const response = await openai.images.generate({
          model: "gpt-image-1",
          prompt: trimmedPrompt,
          n: 1,
          size: "1024x1536",
          quality: "high",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        const b64 = response.data?.[0]?.b64_json as string | undefined;
        if (!b64) throw new Error("gpt-image-1 b64_json 없음");
        console.log("gpt-image-1 성공");
        return NextResponse.json({ imageUrl: `data:image/png;base64,${b64}` });
      } catch (gptImgErr: unknown) {
        const msg = gptImgErr instanceof Error ? gptImgErr.message : String(gptImgErr);
        console.warn("gpt-image-1 실패:", msg);
      }

      // DALL-E 3 시도
      try {
        const openai2 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response2 = await openai2.images.generate({
          model: "dall-e-3",
          prompt: finalPrompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "natural",
        });
        const imageUrl2 = response2.data?.[0]?.url;
        if (!imageUrl2) throw new Error("DALL-E 3 이미지 URL 없음");
        console.log("DALL-E 3 성공");
        return NextResponse.json({ imageUrl: imageUrl2 });
      } catch (dalleErr: unknown) {
        const dalleMsg = dalleErr instanceof Error ? dalleErr.message : String(dalleErr);
        console.warn("DALL-E 3 실패, Pollinations으로 폴백:", dalleMsg);
      }
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

    // ── 4순위: SVG 초상화 폴백 ───────────────────────────
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
