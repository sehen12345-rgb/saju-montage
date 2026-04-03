import type { SajuInfo } from "./types";

export function buildSajuSystemPrompt(): string {
  return `당신은 사주명리학과 관상학을 결합한 전문가입니다.
사주팔자를 분석하여 그 사람과 인연이 될 배우자(이성)의 외모와 분위기를 묘사합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "description": "배우자의 외모와 분위기 묘사 (한국어, 3~4문장, 구체적이고 생생하게)",
  "imagePrompt": "realistic portrait photo, [외모 특징 영문 묘사], soft studio lighting, high quality, photorealistic, 4k",
  "characteristics": ["특징1", "특징2", "특징3"]
}`;
}

export function buildSajuUserPrompt(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: "male" | "female",
  sajuInfo: SajuInfo
): string {
  const hourText = hour >= 0 ? `${hour}시` : "미상";
  const spouseGender = gender === "male" ? "여성" : "남성";

  return `의뢰인 정보:
- 생년월일시: ${year}년 ${month}월 ${day}일 ${hourText}
- 성별: ${gender === "male" ? "남성" : "여성"}
- 사주: 년주(${sajuInfo.yearPillar}) 월주(${sajuInfo.monthPillar}) 일주(${sajuInfo.dayPillar}) 시주(${sajuInfo.hourPillar})

위 사주를 가진 분과 인연이 될 배우자 ${spouseGender}의 외모와 분위기를 분석해주세요.
일주(${sajuInfo.dayPillar})의 배우자궁과 오행 상생상극을 고려하여 구체적으로 묘사하세요.`;
}
