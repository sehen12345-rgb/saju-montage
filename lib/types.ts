export interface SajuInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number; // 0~23, 모름이면 -1
  gender: "male" | "female";
}

export interface SajuAnalysis {
  description: string;       // 배우자 외모 특징 (한국어)
  imagePrompt: string;       // DALL·E용 영문 프롬프트
  characteristics: string[]; // 핵심 키워드
  sajuInfo: SajuInfo;        // 사주 정보
}

export interface SajuInfo {
  yearPillar: string;  // 년주 (천간지지)
  monthPillar: string; // 월주
  dayPillar: string;   // 일주
  hourPillar: string;  // 시주
}

export interface GenerateResult {
  analysis: SajuAnalysis;
  imageUrl: string;
  demo?: boolean;
}
