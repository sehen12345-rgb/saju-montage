import type { SajuAnalysis, SajuInfo } from "./types";

const DEMO_ANALYSES: { male: Omit<SajuAnalysis, "sajuInfo">; female: Omit<SajuAnalysis, "sajuInfo"> } = {
  male: {
    description:
      "당신의 배우자는 부드럽고 단아한 눈매를 가진 분으로, 첫인상부터 지적인 분위기가 풍깁니다. 갑목(甲木)의 기운을 받아 곧고 바른 성품이 외모에도 배어나오며, 은은한 미소가 따뜻함을 전합니다. 날씬하면서도 균형 잡힌 체형에 단정한 이미지로, 주변을 편안하게 만드는 매력이 있습니다.",
    imagePrompt:
      "realistic portrait photo of a beautiful Korean woman in her late 20s, soft gentle eyes, intellectual expression, warm natural smile, elegant and refined features, natural makeup, dark hair, soft studio lighting, high quality photorealistic portrait",
    characteristics: ["지적인 분위기", "단아한 눈매", "따뜻한 미소"],
  },
  female: {
    description:
      "당신의 배우자는 선이 뚜렷하고 카리스마 있는 외모를 가진 분입니다. 경금(庚金)의 기운이 강하여 자신감 있는 눈빛과 단단한 인상을 풍기며, 키가 크고 당당한 체형입니다. 말수는 적지만 깊이 있는 눈빛으로 신뢰감을 주며, 성실하고 책임감 있는 성품이 외모에도 나타납니다.",
    imagePrompt:
      "realistic portrait photo of a handsome Korean man in his early 30s, strong defined features, confident intelligent eyes, trustworthy expression, tall athletic build, well-groomed appearance, natural lighting, high quality photorealistic portrait",
    characteristics: ["카리스마", "신뢰감 있는 눈빛", "당당한 인상"],
  },
};

// 사주 기반 시드로 일관된 얼굴 샘플 이미지 반환
// randomuser.me: 실제 인물 얼굴 사진 (0~99)
export function getDemoImageUrl(gender: "male" | "female", sajuInfo: SajuInfo): string {
  const seed = `${sajuInfo.yearPillar}${sajuInfo.dayPillar}${gender}`;
  const hash = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const id = hash % 70; // 0~69 (randomuser.me 안정 범위)
  const category = gender === "male" ? "women" : "men"; // 배우자 성별 반전
  return `https://randomuser.me/api/portraits/${category}/${id}.jpg`;
}

export function getDemoAnalysis(gender: "male" | "female", sajuInfo: SajuInfo): SajuAnalysis {
  return { ...DEMO_ANALYSES[gender], sajuInfo };
}

export function isKeyPlaceholder(key: string | undefined): boolean {
  return !key || key.startsWith("your_") || key.length < 20;
}
