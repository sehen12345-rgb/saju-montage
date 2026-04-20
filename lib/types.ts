export type ProductType = "spouse" | "guardian" | "enemy" | "bundle";

export interface SajuInput {
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: "male" | "female";
  productType?: ProductType;
}

export interface BodySpec {
  height: string;     // 예: "165~170cm"
  figure: string;     // 예: "슬림하고 균형 잡힌 체형"
  fashion: string;    // 예: "미니멀 캐주얼 + 단정한 오피스룩"
  vibe: string;       // 예: "지적이고 차분한 분위기"
}

export interface CompatibilityScores {
  personality: number;    // 성격 궁합 (0~100)
  values: number;         // 가치관 궁합
  lifestyle: number;      // 생활 패턴 궁합
  communication: number;  // 소통 방식 궁합
  finance: number;        // 재정 관념 궁합
}

export interface MeetTiming {
  ageRange: string;    // 예: "28~31세"
  season: string;      // 예: "봄 또는 가을"
  situation: string;   // 예: "직장 또는 지인 소개"
}

export interface Timeline {
  meetAge: string;      // 예: "29세 전후"
  datingPeriod: string; // 예: "1~2년"
  marriageAge: string;  // 예: "31~33세"
  children: string;     // 예: "1~2명"
}

export interface SajuAnalysis {
  // 기본 (무료)
  description: string;
  imagePrompt: string;
  characteristics: string[];
  sajuInfo: SajuInfo;
  mbti: string;
  job: string;
  hobbies: string[];
  compatibility: string;

  // 섹션 소제목
  descTitle?: string;
  personalityTitle?: string;
  loveStyleTitle?: string;
  lifeStyleTitle?: string;
  firstMeetTitle?: string;

  // 유료 콘텐츠
  bodySpec: BodySpec;
  personality: string;
  loveStyle: string;
  firstMeet: string;
  lifeStyle: string;
  compatibilityScores: CompatibilityScores;
  meetTiming: MeetTiming;
  caution: string[];       // 주의사항 3가지
  advice: string[];        // 인연 조언 3가지
  timeline: Timeline;

  // 추가 유료 콘텐츠
  nameHint?: string;           // 이름 첫 글자 힌트
  pastLife?: string;           // 전생 인연
  kakaoFirstMessage?: string;  // 카카오톡 첫 메시지
  firstDate?: string;          // 첫 데이트 코스
  conflictAndMakeup?: string;  // 갈등 & 화해 패턴
  favoriteThings?: {
    food: string;
    music: string;
    movie: string;
    place: string;
  };
  warnType?: string;           // 악연 주의 유형

  // 심화 유료 콘텐츠
  celebrityVibe?: string;      // 닮은꼴 연예인 분위기
  myCharm?: string;            // 배우자 눈에 비친 나의 매력
  chemistryType?: {
    name: string;              // 케미 타입명 (예: 불꽃 케미)
    emoji: string;             // 대표 이모지
    desc: string;              // 설명 2문장
  };
  monthlyChance?: number[];    // 1~12월 인연운 수치 (0~100)
  readiness?: {
    score: number;             // 인연 준비도 0~100
    comment: string;           // 준비도 코멘트
  };

  // 신규 프리미엄 콘텐츠
  loveLanguage?: {
    primary: string;           // 주요 사랑 언어 (인정하는 말/봉사/선물/함께하는 시간/스킨십)
    secondary: string;         // 보조 사랑 언어
    desc: string;              // 배우자의 사랑 표현 방식 2문장
  };
  partnerPsychology?: string;  // 배우자 심리 분석 (어떤 사람에게 마음 열리는지)
  actionGuide?: string[];      // 지금 당장 실천할 인연 행동 가이드 3가지
}

export interface SajuInfo {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}

export interface GenerateResult {
  name: string;
  analysis: SajuAnalysis | GuardianAnalysis | EnemyAnalysis;
  imageUrl: string;
  gender?: "male" | "female";
  demo?: boolean;
  paid?: boolean;
  productType?: ProductType;
}

export interface EnemyAnalysis {
  sajuInfo: SajuInfo;
  imagePrompt: string;
  description: string;
  characteristics: string[];
  enemyType: string;
  enemyTypeEmoji: string;
  relationship: string;
  dangerAreas: { area: string; desc: string; score: number }[];
  howToAvoid: string;
  meetTiming: { ageRange: string; season: string; situation: string };
  myWeakness: string;
  damage: string;
  signToRecognize: string;
  kakaoFirstMessage?: string;
  pastLifeConnection?: string;
  caution: string[];
  actionGuide: string[];
  monthlyDanger?: number[];
  readiness?: { score: number; comment: string };
}

export interface GuardianAnalysis {
  sajuInfo: SajuInfo;
  imagePrompt: string;
  description: string;
  characteristics: string[];
  guardianType: string;
  guardianTypeEmoji: string;
  relationship: string;
  luckAreas: { area: string; desc: string; score: number }[];
  howToMeet: string;
  meetTiming: { ageRange: string; season: string; situation: string };
  myStrength: string;
  benefit: string;
  signToRecognize: string;
  kakaoFirstMessage?: string;
  pastLifeConnection?: string;
  caution: string[];
  actionGuide: string[];
  monthlyLuck?: number[];
  readiness?: { score: number; comment: string };
}
