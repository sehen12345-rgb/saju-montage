import type { SajuAnalysis, SajuInfo } from "./types";
import { getDemoData } from "./demo";
import { buildDeterministicFields } from "./prompts";

const LIGHTING_STYLES = [
  "soft natural window light, clean white background",
  "warm golden hour sunlight, outdoor bokeh background",
  "soft studio lighting, neutral gray background",
  "cool morning light, minimalist indoor setting",
  "gentle diffused light, warm beige background",
  "bright airy daylight, soft cream background",
];

const SHOT_STYLES = [
  "close-up portrait, face fills frame, sharp focus on eyes",
  "head and shoulders portrait, slight angle, sharp focus on face",
  "close-up face, straight on, intense eye contact with camera",
  "three-quarter face angle, sharp facial details",
];

function buildPollinationsPrompt(spouseGender: string, facialPrompt: string, seed: number): string {
  const genderPrefix = spouseGender === "woman"
    ? "photorealistic portrait of a young East Asian woman"
    : "photorealistic portrait of a young East Asian man";
  const lighting = LIGHTING_STYLES[seed % LIGHTING_STYLES.length];
  const shot = SHOT_STYLES[seed % SHOT_STYLES.length];
  return `${genderPrefix}, ${facialPrompt}, ${shot}, ${lighting}, natural skin pores and texture, real human face, 85mm lens, 8k resolution`;
}

function varyScore(base: number, seed: number, offset: number): number {
  return Math.min(99, Math.max(55, base + ((seed >> offset) % 15) - 7));
}

export function buildFullDeterministicAnalysis(
  _name: string,
  _birthYear: number,
  sajuInfo: SajuInfo,
  gender: "male" | "female",
  seed: number
): SajuAnalysis {
  const spouseGender = gender === "male" ? "woman" : "man";
  const isWoman = gender === "male"; // male user → wants female spouse data
  const dayGan = sajuInfo.dayPillar.charAt(0);

  const base = getDemoData(dayGan, isWoman);
  const det = buildDeterministicFields(sajuInfo, gender, seed);

  // Build full Pollinations-ready image prompt
  const imagePrompt = buildPollinationsPrompt(spouseGender, base.imagePrompt, seed);

  // Vary compatibility scores with seed
  const cs = base.compatibilityScores;
  const compatibilityScores = {
    personality:   varyScore(cs.personality,   seed, 0),
    values:        varyScore(cs.values,        seed, 2),
    lifestyle:     varyScore(cs.lifestyle,     seed, 4),
    communication: varyScore(cs.communication, seed, 6),
    finance:       varyScore(cs.finance,       seed, 8),
  };

  // Vary monthly chance with seed
  const monthlyChance = base.monthlyChance.map((v, i) =>
    Math.min(99, Math.max(30, v + ((seed >> i) % 20) - 10))
  );

  // Vary readiness score
  const readinessScore = Math.min(95, Math.max(50,
    base.readiness.score + ((seed >> 10) % 20) - 10
  ));

  return {
    ...base,
    imagePrompt,
    nameHint:          det.nameHint,
    pastLife:          det.pastLife,
    kakaoFirstMessage: det.kakaoFirstMessage,
    hobbies:           det.hobbies,
    compatibilityScores,
    monthlyChance,
    readiness: { ...base.readiness, score: readinessScore },
    sajuInfo,
  };
}
