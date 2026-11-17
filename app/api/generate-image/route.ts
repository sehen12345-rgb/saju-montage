import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { isKeyPlaceholder } from "@/lib/demo";
import { getSajuSeed } from "@/lib/prompts";
import type { SajuInfo } from "@/lib/types";

// ── GPT Image 2.6 최적화 프롬프트 (자연어 서술형) ──────────────────
// GPT Image 모델은 SD/FLUX와 달리 자연어 설명이 더 효과적
const MOOD_STYLES = [
  { lighting: "soft natural window light filtering through sheer curtains", bg: "a clean, airy room with warm cream walls" },
  { lighting: "warm golden hour sunlight gently touching the face", bg: "a blurred outdoor scene with soft bokeh" },
  { lighting: "professional studio lighting with a soft beauty dish", bg: "a smooth neutral gray gradient" },
  { lighting: "gentle morning light creating soft shadows", bg: "a minimal white backdrop" },
  { lighting: "warm diffused light from the side", bg: "a cozy indoor setting with soft focus" },
  { lighting: "clean bright daylight", bg: "a simple beige studio background" },
];

const POSE_STYLES = [
  "looking directly at the camera with a slight natural head tilt, chest-up framing",
  "facing the camera at a gentle three-quarter angle, head and shoulders visible",
  "gazing straight into the lens with a calm, confident expression, close-up framing",
  "slightly tilting the chin down while maintaining warm eye contact, bust-length portrait",
];

const EXPRESSION_STYLES = [
  "a natural, relaxed expression with slightly parted lips and calm, confident eyes",
  "a warm, genuine smile that reaches the eyes, friendly and approachable",
  "a composed, serene look with a subtle closed-mouth smile and thoughtful gaze",
  "a quietly charismatic expression with natural depth in the eyes",
];

/**
 * GPT Image 2.6 최적화 프롬프트 빌더.
 * - 자연어 서술형 (comma-separated tags 대신 문장형)
 * - 카메라 스펙 제거 (GPT Image는 technical specs 무시)
 * - 핵심 외모 묘사 + 분위기에 집중
 */
function buildGPTImagePrompt(spouseGender: string, analysisPrompt: string, seed: number): string {
  const isFemale = spouseGender === "woman";
  const mood = MOOD_STYLES[seed % MOOD_STYLES.length];
  const pose = POSE_STYLES[(seed >> 1) % POSE_STYLES.length];
  const expression = EXPRESSION_STYLES[(seed >> 2) % EXPRESSION_STYLES.length];

  const subject = isFemale
    ? "A photorealistic portrait of a young Korean woman"
    : "A photorealistic portrait of a young Korean man";

  const skinNote = isFemale
    ? "Natural, healthy Korean skin with minimal makeup — visible pores and subtle skin texture for realism."
    : "Natural, healthy skin with realistic texture — slight stubble or clean-shaven, visible pores.";

  return `${subject}, ${pose}. ${expression}.

Face details: ${analysisPrompt}

${skinNote} Sharp, detailed eyes with natural iris texture and clear catchlight reflections.

The person is lit by ${mood.lighting}, set against ${mood.bg}. The image should look like a high-end portrait photograph — photorealistic, not illustrated or rendered. Shallow depth of field with the face in perfect focus.`;
}

/**
 * Pollinations/FLUX용 프롬프트 (keyword-heavy 태그 형식)
 */
function buildFluxPrompt(spouseGender: string, analysisPrompt: string, seed: number): string {
  const isFemale = spouseGender === "woman";
  const mood = MOOD_STYLES[seed % MOOD_STYLES.length];
  const pose = POSE_STYLES[(seed >> 1) % POSE_STYLES.length];
  const expression = EXPRESSION_STYLES[(seed >> 2) % EXPRESSION_STYLES.length];

  const subject = isFemale
    ? "RAW photo, portrait of a Korean woman in her 20s"
    : "RAW photo, portrait of a Korean man in his late 20s";

  return [
    subject,
    analysisPrompt,
    expression,
    pose,
    mood.lighting,
    "natural skin texture, visible pores, realistic skin",
    "sharp detailed eyes, natural iris texture, catchlight",
    "Canon 85mm f/1.4, shallow depth of field, bokeh",
    "professional portrait, photorealistic, high detail",
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
// Vercel maxDuration=60s 기준: OpenAI 최대 15s + Pollinations 25s = 40s < 60s
async function generateWithPollinations(prompt: string, seed: number): Promise<string> {
  // 프롬프트가 너무 길면 URL 길이 초과 → 앞 900자로 제한
  const trimmedPrompt = prompt.length > 900 ? prompt.slice(0, 900) : prompt;
  const encoded = encodeURIComponent(trimmedPrompt);

  // 네거티브는 핵심만 (URL 길이 절약)
  const negEncoded = encodeURIComponent("cartoon, anime, blurry, deformed, ugly, plastic skin, watermark");

  const models = ["flux-realism", "flux-realism", "flux"];
  const model = models[seed % models.length];
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=1024&model=${model}&seed=${seed}&nologo=true&enhance=true&negative=${negEncoded}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(25_000) });

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

    // GPT Image용 (자연어 서술형) / Pollinations용 (태그 형식) 프롬프트 분리
    const gptPrompt = buildGPTImagePrompt(spouseGender, prompt, seed);
    const fluxPrompt = buildFluxPrompt(spouseGender, prompt, seed);

    console.log("GPT Image prompt:", gptPrompt.slice(0, 200));
    console.log("Seed:", seed);

    // ── 1순위: OpenAI GPT Image (최고품질) ──
    // 모델당 15s timeout → 최대 2회 시도 = 30s, Pollinations 25s → 총 최대 55s < 60s
    if (!isKeyPlaceholder(process.env.OPENAI_API_KEY)) {
      const imageModels = ["gpt-image-2.6-flare", "gpt-image-2.6-sunburst", "gpt-image-1"];
      // GPT Image는 긴 자연어 설명에 강함 — 1500자까지 허용
      const trimmedPrompt = gptPrompt.length > 1500 ? gptPrompt.slice(0, 1500) : gptPrompt;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      for (const imgModel of imageModels) {
        try {
          // 15s per-model timeout (SDK는 AbortSignal 미지원 → Promise.race 사용)
          const generateParams: Record<string, unknown> = {
            model: imgModel,
            prompt: trimmedPrompt,
            n: 1,
            size: "1024x1024",
          };
          // gpt-image-2.6/1 은 quality 지원
          if (!imgModel.startsWith("dall-e")) generateParams.quality = "high";

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("OpenAI 15s timeout")), 15_000)
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const response = await Promise.race([
            openai.images.generate(generateParams as any),
            timeoutPromise,
          ]);
          // b64_json 또는 url 둘 다 처리
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const b64 = (response.data?.[0] as any)?.b64_json as string | undefined;
          if (b64) {
            console.log(`${imgModel} 성공 (b64)`);
            return NextResponse.json({ imageUrl: `data:image/png;base64,${b64}` });
          }
          const imgUrl = response.data?.[0]?.url;
          if (imgUrl) {
            console.log(`${imgModel} 성공 (url)`);
            return NextResponse.json({ imageUrl: imgUrl });
          }
          throw new Error("이미지 데이터 없음");
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`${imgModel} 실패:`, msg);
        }
      }
    }

    // ── 2순위: Pollinations.ai (완전 무료, 키 불필요) ────
    try {
      const imageUrl = await generateWithPollinations(fluxPrompt, seed);
      return NextResponse.json({ imageUrl });
    } catch (pollinationsErr) {
      console.warn("Pollinations 실패:", pollinationsErr);
    }

    // ── 3순위: SVG 초상화 폴백 ───────────────────────────
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
