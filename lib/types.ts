export interface SajuInput {
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: "male" | "female";
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
}

export interface SajuInfo {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}

export interface GenerateResult {
  name: string;
  analysis: SajuAnalysis;
  imageUrl: string;
  gender?: "male" | "female";
  demo?: boolean;
  paid?: boolean;
}
