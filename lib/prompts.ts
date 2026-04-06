import type { SajuInfo } from "./types";

const OHAENG_MAP: Record<string, string> = {
  갑: "목(木)", 을: "목(木)",
  병: "화(火)", 정: "화(火)",
  무: "토(土)", 기: "토(土)",
  경: "금(金)", 신: "금(金)",
  임: "수(水)", 계: "수(水)",
};

const OHAENG_VISUAL: Record<string, {
  faceShape: string; eyes: string; nose: string; lips: string; jaw: string; skin: string; vibe: string;
}> = {
  "목(木)": { faceShape: "oval face with high forehead", eyes: "long almond-shaped eyes with double eyelids, sharp gaze", nose: "tall straight nose bridge, refined tip", lips: "thin well-defined lips", jaw: "slim defined jawline", skin: "fair cool-toned skin", vibe: "intellectual, elegant, refined" },
  "화(火)": { faceShape: "heart-shaped face with pointed chin", eyes: "large bright upturned eyes, lively expression", nose: "small button nose with soft tip", lips: "full lips with prominent cupid's bow", jaw: "delicate pointed chin", skin: "warm peachy skin with natural flush", vibe: "vivid, energetic, expressive" },
  "토(土)": { faceShape: "round full face with wide cheekbones", eyes: "wide round eyes, gentle calm expression", nose: "broad flat nose, friendly appearance", lips: "full wide lips, warm smile", jaw: "soft rounded jaw", skin: "warm golden olive skin", vibe: "gentle, trustworthy, warm" },
  "금(金)": { faceShape: "square face with strong cheekbones", eyes: "narrow sharp eyes with single eyelid, piercing gaze", nose: "strong aquiline nose with high bridge", lips: "thin straight lips, composed expression", jaw: "strong square jaw, defined chin", skin: "clear fair porcelain skin", vibe: "strong, charismatic, composed" },
  "수(水)": { faceShape: "wide oval face with broad forehead", eyes: "deep-set soft eyes, thoughtful expression", nose: "rounded soft nose, approachable look", lips: "naturally full lips, subtle gentle smile", jaw: "soft gently rounded jaw", skin: "cool beige skin, smooth texture", vibe: "mysterious, deep, sophisticated" },
};

function getOhaeng(pillar: string): string {
  return OHAENG_MAP[pillar.charAt(0)] ?? "토(土)";
}

export function buildSajuSystemPrompt(): string {
  return `당신은 사주명리학, 관상학, 심리학을 결합한 최고 수준의 전문가입니다.
사주팔자를 심층 분석하여 그 사람과 인연이 될 배우자(이성)를 다각도로 정밀하게 묘사합니다.

오행별 외모 특징:
- 목(木): 긴 타원형 얼굴, 길고 날카로운 눈, 높은 콧대, 지적이고 단아한 분위기
- 화(火): 하트형 얼굴, 크고 생동감 있는 눈, 또렷한 입술, 활발하고 화사한 분위기
- 토(土): 둥글고 넉넉한 얼굴, 온화한 눈빛, 넓은 입술, 따뜻하고 친근한 분위기
- 금(金): 각진 턱과 강한 광대, 날카로운 눈빛, 선명한 이목구비, 카리스마 있는 분위기
- 수(水): 넓은 이마, 깊고 그윽한 눈, 부드러운 인상, 신비롭고 지적인 분위기

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "description": "배우자 외모 묘사 (3~4문장, 얼굴형/눈/코/입/피부/분위기 구체적으로)",
  "imagePrompt": "[성별 및 얼굴형], [눈 묘사], [코 묘사], [입술], [턱/윤곽], [피부톤], [분위기], looking at camera, shallow depth of field, studio lighting",
  "characteristics": ["외모 키워드1", "눈빛/표정 키워드2", "전체 인상 키워드3"],
  "mbti": "MBTI 유형",
  "job": "구체적인 직업 (예: 소아과 의사, 그래픽 디자이너)",
  "hobbies": ["취미1", "취미2", "취미3"],
  "compatibility": "궁합 한마디 (25자 이내, 감성적으로)",
  "descTitle": "외모 섹션 소제목 (15자 이내)",
  "personalityTitle": "성격 섹션 소제목 (15자 이내)",
  "loveStyleTitle": "연애 스타일 섹션 소제목 (15자 이내)",
  "lifeStyleTitle": "라이프스타일 섹션 소제목 (15자 이내)",
  "firstMeetTitle": "첫 만남 섹션 소제목 (15자 이내)",
  "bodySpec": {
    "height": "키 범위 (예: 165~170cm)",
    "figure": "체형 묘사 (예: 슬림하고 균형 잡힌 체형)",
    "fashion": "평소 패션 스타일 (예: 미니멀 캐주얼 + 단정한 오피스룩)",
    "vibe": "전체 분위기 한 줄 (예: 첫눈에는 차갑지만 알수록 따뜻한)"
  },
  "personality": "성격 상세 묘사 (4~5문장, 장점과 단점, 대인관계, 감정 표현 방식)",
  "loveStyle": "연애 스타일 (3~4문장, 애정 표현 방식, 연인에게 어떻게 대하는지, 싸울 때 반응)",
  "firstMeet": "첫 만남 시나리오 (3문장, 어디서 어떻게 만날지 영화 장면처럼 구체적으로)",
  "lifeStyle": "라이프스타일 (3문장, 아침 루틴·주말·소비 패턴 포함)",
  "compatibilityScores": {
    "personality": 성격 궁합 점수 (60~98 사이 정수),
    "values": 가치관 궁합 점수 (60~98 사이 정수),
    "lifestyle": 생활 패턴 궁합 점수 (60~98 사이 정수),
    "communication": 소통 방식 궁합 점수 (60~98 사이 정수),
    "finance": 재정 관념 궁합 점수 (60~98 사이 정수)
  },
  "meetTiming": {
    "ageRange": "만날 나이대 (예: 28~31세)",
    "season": "만날 계절 (예: 봄 또는 가을)",
    "situation": "만날 상황 (예: 직장 동료 소개 또는 공통 취미 모임)"
  },
  "caution": ["주의사항1 (2문장)", "주의사항2 (2문장)", "주의사항3 (2문장)"],
  "advice": ["지금 당장 할 수 있는 조언1", "조언2", "조언3"],
  "timeline": {
    "meetAge": "첫 만남 예상 나이 (예: 29세 전후)",
    "datingPeriod": "연애 기간 예상 (예: 약 1~2년)",
    "marriageAge": "결혼 예상 나이 (예: 31~33세)",
    "children": "자녀 운 (예: 2명, 첫째는 딸일 가능성)"
  }
}

imagePrompt는 영어로, 외모 묘사만. "photorealistic"·"portrait" 같은 기술 단어 제외.`;
}

export function buildSajuUserPrompt(
  name: string, year: number, month: number, day: number,
  hour: number, gender: "male" | "female", sajuInfo: SajuInfo
): string {
  const hourText = hour >= 0 ? `${hour}시` : "미상";
  const spouseGender = gender === "male" ? "여성" : "남성";
  const dayOhaeng = getOhaeng(sajuInfo.dayPillar);
  const yearOhaeng = getOhaeng(sajuInfo.yearPillar);
  const visual = OHAENG_VISUAL[dayOhaeng] ?? OHAENG_VISUAL["토(土)"];

  return `의뢰인 정보:
- 이름: ${name}
- 생년월일시: ${year}년 ${month}월 ${day}일 ${hourText}
- 성별: ${gender === "male" ? "남성" : "여성"}
- 사주: 년주(${sajuInfo.yearPillar}·${yearOhaeng}) 월주(${sajuInfo.monthPillar}) 일주(${sajuInfo.dayPillar}·${dayOhaeng}) 시주(${sajuInfo.hourPillar})

${name}님의 일주 ${sajuInfo.dayPillar}(${dayOhaeng})를 기준으로 인연이 될 배우자 ${spouseGender}를 분석하세요.
참고: ${dayOhaeng} 기질의 배우자는 [${visual.faceShape}, ${visual.eyes}, ${visual.vibe}] 경향이 있으나, 년주·월주 영향도 반영해 개성 있게 묘사하세요.

bodySpec의 성별: ${gender === "male" ? "여성 배우자" : "남성 배우자"}
imagePrompt 성별 표현: ${gender === "male" ? "beautiful Korean woman in her mid-20s" : "handsome Korean man in his late 20s"}`;
}

export function getSajuSeed(sajuInfo: SajuInfo, gender: string): number {
  const str = `${sajuInfo.yearPillar}${sajuInfo.monthPillar}${sajuInfo.dayPillar}${sajuInfo.hourPillar}${gender}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 2147483647;
}
