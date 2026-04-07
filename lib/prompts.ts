import type { SajuInfo } from "./types";

// ── 10 천간별 얼굴 특징 (기존 5 오행 → 10 천간으로 세분화) ──────────────────
const CHEONGAN_VISUAL: Record<string, {
  faceShape: string; eyes: string; eyebrows: string;
  nose: string; lips: string; jaw: string; skin: string; hair: string; vibe: string;
}> = {
  갑: {
    faceShape: "tall oval face with high prominent forehead",
    eyes: "long single-lidded eyes with intense upward gaze",
    eyebrows: "straight thick horizontal brows",
    nose: "tall sharp nose bridge with narrow refined tip",
    lips: "thin firm well-defined lips",
    jaw: "slim angular jawline",
    skin: "fair neutral-toned skin",
    hair: "straight sleek dark hair",
    vibe: "upright intellectual, noble composed presence",
  },
  을: {
    faceShape: "soft egg-shaped face with gentle flowing curves",
    eyes: "large expressive double-lidded eyes with warm inviting gaze",
    eyebrows: "slightly arched soft natural brows",
    nose: "delicate refined nose with subtle rounded tip",
    lips: "naturally rosy medium full lips",
    jaw: "gentle tapered soft chin",
    skin: "luminous light skin with peachy warm undertone",
    hair: "soft wavy or slightly curled hair with natural bounce",
    vibe: "graceful and gentle, like a blooming flower",
  },
  병: {
    faceShape: "broad forehead heart-shaped face with defined temples",
    eyes: "wide bright double-lidded eyes, radiantly joyful expression",
    eyebrows: "rounded expressive full brows",
    nose: "straight medium nose with slightly upturned tip",
    lips: "full plump lips with a wide warm natural smile",
    jaw: "soft pointed delicate chin",
    skin: "warm golden skin with a healthy natural glow",
    hair: "voluminous lightly layered hair with natural sheen",
    vibe: "radiant and energetic, sun-like warmth and vitality",
  },
  정: {
    faceShape: "refined delicate narrow oval face",
    eyes: "slightly narrow double-lidded eyes with deep mysterious gaze",
    eyebrows: "thin elegantly arched brows",
    nose: "small refined nose with subtle low bridge",
    lips: "well-defined bow-shaped lips",
    jaw: "slender pointed chin",
    skin: "pale translucent cool-toned skin",
    hair: "fine silky dark hair in a neat refined style",
    vibe: "mysterious and refined, like candlelight warmth",
  },
  무: {
    faceShape: "broad square-oval face with wide stable forehead and full cheeks",
    eyes: "steady wide-set calm eyes with a reliable trustworthy gaze",
    eyebrows: "flat thick horizontal strong brows",
    nose: "broad strong nose with wide bridge",
    lips: "full wide lips with an honest warm genuine smile",
    jaw: "strong defined jaw with solid square chin",
    skin: "healthy warm olive-toned skin",
    hair: "thick dense dark hair in a natural casual style",
    vibe: "stable and trustworthy, mountain-like solidity and warmth",
  },
  기: {
    faceShape: "round moon-shaped face with full soft cheeks",
    eyes: "round soft smiling eyes with a comforting nurturing gaze",
    eyebrows: "gently curved soft friendly brows",
    nose: "round button nose with a friendly approachable look",
    lips: "plump natural lips with a frequent warm smile",
    jaw: "soft fully rounded jaw and chin",
    skin: "warm golden beige smooth skin",
    hair: "soft layered medium-length hair with gentle waves",
    vibe: "approachable and nurturing, like warm fertile earth",
  },
  경: {
    faceShape: "sharp defined angular face with prominent high cheekbones",
    eyes: "single-lidded sharp eyes with an intense piercing commanding gaze",
    eyebrows: "sharp angular straight precise brows",
    nose: "strong high aquiline nose with sharp bridge",
    lips: "thin compressed firm lips with a controlled composed expression",
    jaw: "sharp square jaw with a defined angular chin",
    skin: "fair cool porcelain skin with clarity",
    hair: "sleek straight dark hair in a clean sharp cut",
    vibe: "charismatic and commanding, metallic sharpness and authority",
  },
  신: {
    faceShape: "angular refined face with sharp sophisticated features",
    eyes: "cool narrow slightly upturned eyes with a sophisticated aloof gaze",
    eyebrows: "thin precisely shaped very neat brows",
    nose: "straight refined nose with a sharp precise tip",
    lips: "thin well-defined lips with a composed slight smile",
    jaw: "sharp V-line jaw with elegant chin",
    skin: "very clear bright skin with a cool refined tone",
    hair: "straight glossy hair in a neatly styled polished look",
    vibe: "refined and sophisticated, jewel-like brilliance and poise",
  },
  임: {
    faceShape: "wide oval face with full rounded forehead and broad temples",
    eyes: "deep-set dark heavy-lidded eyes with a fluid thoughtful gaze",
    eyebrows: "full naturally curved dark brows",
    nose: "medium soft nose with a gently rounded tip",
    lips: "naturally full lips with a subtle mysterious smile",
    jaw: "soft gently rounded strong jaw",
    skin: "cool dark beige smooth skin with depth",
    hair: "flowing wavy or straight dark voluminous hair",
    vibe: "deep and mysterious, ocean-like depth and intelligence",
  },
  계: {
    faceShape: "soft delicate face with gentle subtle proportions",
    eyes: "slightly droopy soft moist doe eyes with a gentle melancholic gaze",
    eyebrows: "softly curved thin gentle brows",
    nose: "small gentle nose with a low soft bridge",
    lips: "naturally soft slightly parted full lips",
    jaw: "delicate soft fully rounded small chin",
    skin: "pale dewy moist-looking luminous skin",
    hair: "fine soft slightly wavy flowing hair",
    vibe: "gentle and dreamy, like morning dew and soft rain",
  },
};

// ── 12 지지별 인상 포인트 ──────────────────────────────────────────────────────
const JIJI_IMPRESSION: Record<string, string> = {
  자: "delicate compact facial features, clever bright quick eyes",
  축: "steady reliable solid expression, wide stable jaw and forehead",
  인: "confident bold dynamic expression, alert energetic lively eyes",
  묘: "elegant graceful refined features, bright clear luminous eyes",
  진: "commanding deep powerful gaze, majestic dignified presence",
  사: "magnetic sophisticated sharp look, intelligent piercing eyes",
  오: "brilliant vibrant radiant expression, warm inviting passionate eyes",
  미: "sweet gentle soft expression, tender approachable smiling eyes",
  신: "lively clever quick expression, sharp witty playful eyes",
  유: "refined beautiful precise features, composed graceful serene eyes",
  술: "sincere honest warm expression, trustworthy loyal deep eyes",
  해: "deep mysterious introspective gaze, thoughtful soulful dreamy eyes",
};

// ── 년지별 피부·전반 분위기 ────────────────────────────────────────────────────
const YEAR_JIJI_TONE: Record<string, string> = {
  자: "very fair delicate almost translucent skin",
  축: "neutral healthy balanced skin tone",
  인: "warm tawny skin with natural vitality",
  묘: "bright clear luminous glowing skin",
  진: "deep warm rich complexion with depth",
  사: "warm golden slightly sun-kissed skin",
  오: "golden radiant warm glowing skin",
  미: "soft peachy cream skin",
  신: "cool pale refined porcelain skin",
  유: "fair elegant ivory skin",
  술: "warm honey-amber toned skin",
  해: "cool beige smooth subtle skin",
};

// ── 월지별 계절 인상 ──────────────────────────────────────────────────────────
const MONTH_SEASON_VIBE: Record<string, string> = {
  자: "quiet serene winter calm",
  축: "steady composed late-winter stillness",
  인: "fresh lively early spring brightness",
  묘: "blooming gentle soft spring lightness",
  진: "full vibrant rich spring presence",
  사: "sharp intense early summer energy",
  오: "bold bright passionate midsummer radiance",
  미: "warm soft easy late summer glow",
  신: "crisp clean clear early autumn freshness",
  유: "refined elegant polished mid-autumn grace",
  술: "warm golden deep late-autumn richness",
  해: "quiet introspective early winter depth",
};

// ── 일지별 배우자 성격 특성 (일지 = 배우자궁, 가장 중요) ──────────────────────
const DAYJI_PERSONALITY: Record<string, string> = {
  자: "영리하고 직관력이 뛰어나며 독립적. 감정이 예민하고 야행성 기질. 혼자만의 공간이 필요한 타입",
  축: "묵묵히 성실하게 노력하는 현실주의자. 고집이 있고 한 번 믿은 사람에게는 끝까지 헌신. 안정을 최우선 가치로 여김",
  인: "활동적이고 도전적인 리더형. 직접적이고 시원시원한 성격. 새로운 것을 두려워하지 않으나 때로 성급",
  묘: "감성적이고 예술적 감각이 뛰어남. 부드럽고 친절하지만 내면은 섬세하고 상처받기 쉬움. 미적 감각이 탁월",
  진: "포부가 크고 능력이 출중. 겉으로는 대범하지만 내면은 복잡. 완고한 면이 있고 자존심이 강함",
  사: "세련되고 지적이며 계획적. 속마음을 쉽게 드러내지 않음. 목표를 향해 묵묵히 나아가는 전략가형",
  오: "열정적이고 직설적. 감정 기복이 있지만 매력이 넘침. 자기표현이 강하고 존재감이 확실함",
  미: "따뜻하고 배려심이 깊은 공감형. 예술적 감수성이 있지만 결정이 느리고 우유부단한 면도 존재",
  신: "영리하고 논리적이며 실용적. 빠른 두뇌와 변화 적응력이 강점. 때로 산만하고 일관성이 부족",
  유: "완벽주의 성향이 강하고 단정함. 까다롭지만 그만큼 섬세하고 독립적. 자기 기준이 확실함",
  술: "의리 있고 충성스러운 진심파. 솔직하고 직선적이나 집착 경향. 한 번 맺은 인연을 소중히 여김",
  해: "자유로운 영혼의 이상주의자. 감성적이고 창의적. 방랑기가 있고 정신적 교감을 가장 중요시",
};

// ── 일지별 취미 경향 ──────────────────────────────────────────────────────────
const DAYJI_HOBBIES: Record<string, string[]> = {
  자: ["수영", "낚시", "야경 산책", "음악 감상", "새벽 독서"],
  축: ["요리", "텃밭 가꾸기", "인테리어", "헬스", "재테크"],
  인: ["등산", "격투기", "여행", "드라이브", "익스트림 스포츠"],
  묘: ["피아노", "수채화", "카페 탐방", "꽃꽂이", "빈티지 쇼핑"],
  진: ["골프", "사진", "요리", "정원 가꾸기", "드라이브"],
  사: ["패션 스타일링", "클래식 음악", "독서", "박물관 관람", "뷰티"],
  오: ["춤·댄스", "노래", "러닝", "소셜 파티", "여행"],
  미: ["미술·공예", "글쓰기", "동물 돌봄", "악기 연주", "원예"],
  신: ["여행", "코딩·테크", "격투기", "투자", "독서"],
  유: ["와인", "미술관", "피아노", "요가", "뷰티 루틴"],
  술: ["등산", "캠핑", "반려동물", "바비큐", "격투기"],
  해: ["음악 감상", "수영", "철학 독서", "창작 글쓰기", "명상"],
};

// ── 일지별 직업 경향 ──────────────────────────────────────────────────────────
const DAYJI_CAREER: Record<string, string[]> = {
  자: ["IT·개발자", "의료·간호사", "연구원", "데이터 분석가"],
  축: ["금융·은행원", "건설·부동산", "공무원", "식품·요리사"],
  인: ["법조인", "스포츠 트레이너", "창업가·스타트업", "군경"],
  묘: ["그래픽 디자이너", "패션 디자이너", "유치원 교사", "플로리스트"],
  진: ["경영 기획", "공무원·행정", "요리사·셰프", "부동산 컨설턴트"],
  사: ["방송·미디어", "IT·데이터", "보험·금융 전문가", "강사·교육자"],
  오: ["연예·퍼포머", "마케터", "스포츠 선수", "유튜버·크리에이터"],
  미: ["화가·공예가", "사회복지사", "영양사", "음악 치료사"],
  신: ["의사·약사", "변호사", "컨설턴트", "엔지니어"],
  유: ["회계사·세무사", "제약 연구원", "패션 MD", "교사"],
  술: ["경찰·소방관", "군인", "반려동물 훈련사", "스포츠 코치"],
  해: ["심리상담사", "작가·시나리오 작가", "음악가", "철학·종교 계열"],
};

// ── 월지별 연애 스타일 ────────────────────────────────────────────────────────
const MONTHJI_LOVESTYLE: Record<string, string> = {
  자: "조용하고 깊은 감정 표현 방식. 독점욕이 있고 속마음과 겉 표현의 차이가 있음",
  축: "천천히 신뢰를 쌓아가는 헌신형. 묵묵하게 행동으로 사랑을 보여줌",
  인: "열정적이고 주도적. 먼저 다가오고 직접적으로 감정을 표현",
  묘: "섬세하고 로맨틱. 감성적인 방식으로 소소한 일상을 특별하게 만들어줌",
  진: "현실적이고 미래 지향적. 안정된 미래를 함께 설계하는 연애",
  사: "신중하고 내면적. 천천히 마음을 열지만 한 번 열면 깊고 진실한 사랑",
  오: "직접적이고 표현이 풍부. 감정 기복이 있지만 열정적인 사랑",
  미: "다정하고 배려가 넘침. 연인을 최우선으로 챙기는 헌신적 스타일",
  신: "논리적이고 독립적인 연애. 서로의 공간을 존중하는 성숙한 관계 추구",
  유: "완벽주의적이고 섬세한 애정 표현. 높은 기준을 가진 까다로운 연인",
  술: "의리와 충성이 강한 진심 스타일. 집착에 가까운 깊은 사랑",
  해: "자유롭고 정신적 교감을 최우선. 이상적인 사랑을 꿈꾸는 낭만파",
};

// ── 년간별 가치관·인생관 ──────────────────────────────────────────────────────
const YEANGAN_VALUES: Record<string, string> = {
  갑: "성취와 독립을 중시. 인정받는 것이 중요한 동기",
  을: "관계와 조화를 최우선. 안정된 가정과 연인에게 헌신",
  병: "현재의 즐거움과 경험을 추구. 밝고 긍정적인 삶의 태도",
  정: "예술과 정신적 가치 추구. 의미 있는 삶과 깊은 교감 중시",
  무: "안정과 실용을 우선. 가정과 재산을 탄탄히 쌓는 것이 목표",
  기: "배려와 봉사 정신. 따뜻한 공동체와 주변 사람을 소중히 여김",
  경: "정의와 원칙을 중시. 사회적 인정과 지위에도 관심 있음",
  신: "미적 감각과 독창성 추구. 자신만의 기준과 세계를 가짐",
  임: "자유와 지적 성장 중시. 이상을 향해 끊임없이 나아가는 삶",
  계: "감성과 창의, 진정성 있는 관계. 겉보다 내면의 깊이를 중시",
};

// ── 시주별 특별 포인트 ────────────────────────────────────────────────────────
const HOUR_SPECIAL: Record<string, string> = {
  자: "subtle charming dimples",
  축: "strong straight brow line",
  인: "naturally expressive eyebrows",
  묘: "long beautiful eyelashes",
  진: "slightly hooded deep-set eyes",
  사: "sharp defined cupid's bow",
  오: "bright wide smile that lights up the face",
  미: "soft rounded cheeks",
  신: "small neat ears and refined temples",
  유: "perfectly symmetrical features",
  술: "slightly prominent cheekbones",
  해: "soulful deep dark irises",
  미상: "subtle natural beauty mark",
};

function getPillarChar(pillar: string, pos: 0 | 1): string {
  return pillar.charAt(pos) ?? "";
}

function getHourJiji(pillar: string): string {
  if (pillar === "미상") return "미상";
  return getPillarChar(pillar, 1);
}

// ── 사주 기반 나이대 계산 ─────────────────────────────────────────────────────
function getSpouseAgeRange(birthYear: number, gender: "male" | "female"): string {
  // 배우자는 보통 ±3세 범위 + 성별에 따른 경향 반영
  const ageModifier = gender === "male" ? -1 : 1; // 남성 의뢰인 → 여성 배우자(동갑~연하), 여성 → 남성(동갑~연상)
  const currentYear = 2026;
  const userAge = currentYear - birthYear + 1;
  const spouseBaseAge = userAge + ageModifier;

  if (spouseBaseAge < 23) return "20대 초반";
  if (spouseBaseAge < 27) return "20대 중반";
  if (spouseBaseAge < 31) return "20대 후반";
  if (spouseBaseAge < 35) return "30대 초반";
  return "30대 중반";
}

function getSpouseAgeEN(birthYear: number, gender: "male" | "female"): string {
  const currentYear = 2026;
  const userAge = currentYear - birthYear + 1;
  const ageModifier = gender === "male" ? -1 : 1;
  const spouseAge = userAge + ageModifier;

  if (spouseAge < 24) return "in her early 20s" ;
  if (spouseAge < 27) return "in her mid-20s";
  if (spouseAge < 30) return "in her late 20s";
  if (spouseAge < 33) return "in her early 30s";
  return "in her mid-30s";
}

export function buildSajuSystemPrompt(): string {
  return `당신은 사주명리학, 관상학, 심리학을 결합한 최고 수준의 전문가입니다.
사주팔자를 심층 분석하여 그 사람과 인연이 될 배우자(이성)를 다각도로 정밀하게 묘사합니다.

⚠️ 핵심 원칙: 사주 조합은 수십만 가지이며, 각 사람의 배우자는 완전히 다른 외모를 가집니다.
절대로 이전 답변과 비슷하게 작성하지 마세요. 이 사주만이 가진 독특하고 구체적인 외모를 묘사하세요.

천간별 외모 기질:
- 갑(甲): 우뚝한 타원형, 직선적 눈매, 높은 콧대 → 지적이고 당당
- 을(乙): 부드러운 달걀형, 크고 따뜻한 눈 → 우아하고 섬세
- 병(丙): 넓은 이마 하트형, 빛나는 큰 눈 → 화사하고 활기
- 정(丁): 좁고 갸름한 타원, 깊고 신비로운 눈 → 섬세하고 신비
- 무(戊): 넓고 안정적인 사각형, 안정적 눈빛 → 믿음직하고 듬직
- 기(己): 동글동글 보름달형, 부드럽고 웃는 눈 → 친근하고 포근
- 경(庚): 날카로운 각형, 뚫어보는 눈빛 → 카리스마 있고 강렬
- 신(辛): 정교한 각형, 차가운 세련된 눈 → 정제되고 도회적
- 임(壬): 넓은 타원형, 깊고 그윽한 눈 → 신비롭고 지성적
- 계(癸): 섬세한 작은형, 촉촉하고 순한 눈 → 몽환적이고 부드러움

지지별 인상 포인트 (일지가 가장 중요):
- 자(子): 작고 정밀한 이목구비
- 축(丑): 넓고 안정적인 윤곽
- 인(寅): 생동감 넘치는 표정
- 묘(卯): 청아하고 우아한 이목구비
- 진(辰): 위엄 있는 깊은 눈빛
- 사(巳): 세련되고 날카로운 인상
- 오(午): 빛나고 활기찬 표정
- 미(未): 부드럽고 귀여운 인상
- 신(申): 재치 있고 총명한 눈빛
- 유(酉): 단정하고 아름다운 이목구비
- 술(戌): 진실하고 따뜻한 눈빛
- 해(亥): 몽환적이고 그윽한 눈빛

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "description": "배우자 외모 묘사 (3~4문장, 얼굴형·눈·코·입·피부·분위기 매우 구체적으로, 이 사주만의 독특한 특징 포함)",
  "imagePrompt": "구체적 얼굴형, 구체적 눈 묘사, 구체적 코 묘사, 입술, 턱/윤곽, 피부톤, 헤어스타일, 분위기, looking directly at camera, soft bokeh background, natural light, high detail face",
  "characteristics": ["이 사주만의 외모 키워드1", "눈빛/표정 키워드2", "전체 인상 키워드3"],
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
  },
  "nameHint": "배우자 이름 첫 글자 계열 힌트 (예: '지', '서', '민' 같은 부드러운 이름일 가능성이 높습니다. 이유 포함, 30자 이내)",
  "pastLife": "전생 인연 묘사 (신비롭고 감성적으로, 예: '전생에 같은 마을에 살던 의원과 환자였습니다. 짧은 만남이었지만 깊은 인연을 남겼습니다.' 2문장)",
  "kakaoFirstMessage": "배우자가 처음 카카오톡으로 보낼 것 같은 메시지 내용 (그 사람 성격·말투가 느껴지게, 1~2문장, 이모지 포함 가능)",
  "firstDate": "첫 데이트 코스 (장소 2~3곳, 배우자 성향에 맞는 구체적 코스. 예: '오후 2시 성수동 카페에서 시작해 한강 산책 후 이태원 소규모 레스토랑 마무리.' 2~3문장)",
  "conflictAndMakeup": "갈등 & 화해 패턴 (어떤 주제로 자주 부딪히는지, 그리고 어떻게 화해하는지. 구체적이고 공감가게 2~3문장)",
  "favoriteThings": {
    "food": "좋아하는 음식 스타일 (예: 깔끔한 일식, 분위기 있는 파스타집)",
    "music": "자주 듣는 음악 분위기 (예: 새벽 감성 R&B, 잔잔한 인디팝)",
    "movie": "즐겨 보는 장르 (예: 감성 로맨스 영화, 범죄 스릴러 드라마)",
    "place": "자주 가는 장소 스타일 (예: 한적한 카페 + 전시회, 주말 등산)"
  },
  "warnType": "조심해야 할 악연 유형 (비슷해 보이지만 결이 다른 사람 특징. 예: '외모와 첫인상은 비슷하지만 감정 표현이 없는 사람은 악연입니다.' 2문장)",
  "celebrityVibe": "배우자가 어떤 연예인·유명인의 분위기와 닮았는지 (예: '박보검의 따뜻하고 친근한 미소에 차은우의 섬세한 눈빛이 더해진 분위기입니다.' 1~2문장, 외모+분위기 조합으로)",
  "myCharm": "배우자의 눈에 비친 의뢰인의 매력 포인트 (배우자 시점에서 1인칭으로, '처음 봤을 때 당신의 ○○가 마음에 들었어요' 형식, 2~3문장)",
  "chemistryType": {
    "name": "두 사람의 케미 타입명 (예: 운명적 소울메이트, 불꽃 티격태격형, 조용한 베프형, 완벽한 퍼즐형 등)",
    "emoji": "케미 타입을 대표하는 이모지 1개",
    "desc": "케미 타입 설명 (두 사람이 함께하면 어떤 모습인지 감성적으로 2문장)"
  },
  "monthlyChance": [1월 인연운(0~100 정수), 2월, 3월, 4월, 5월, 6월, 7월, 8월, 9월, 10월, 11월, 12월],
  "readiness": {
    "score": 현재 인연을 만날 준비도 (0~100 정수, 사주의 현재 운기 반영),
    "comment": "준비도에 대한 코멘트 (2문장, 지금 상태와 앞으로 해야 할 것)"
  }
}

imagePrompt 작성 규칙:
- 반드시 영어로 작성
- 헤어스타일 구체적으로 명시 (예: shoulder-length wavy dark brown hair / short neat black hair / long straight hair with side-swept bangs)
- 얼굴 특징을 구체적으로 (눈 모양, 눈썹 모양, 입술 모양 등)
- "photorealistic"·"portrait"·"Korean" 같은 기술적·민족 단어 제외
- 분위기 단어 반드시 포함 (예: warm, mysterious, confident, gentle 등)`;
}

export function buildSajuUserPrompt(
  name: string, year: number, month: number, day: number,
  hour: number, gender: "male" | "female", sajuInfo: SajuInfo
): string {
  const hourText = hour >= 0 ? `${hour}시` : "미상";
  const spouseGender = gender === "male" ? "여성" : "남성";

  // 천간 추출 (각 기둥의 첫 글자)
  const dayGan = getPillarChar(sajuInfo.dayPillar, 0);
  const yearGan = getPillarChar(sajuInfo.yearPillar, 0);
  const monthGan = getPillarChar(sajuInfo.monthPillar, 0);

  // 지지 추출 (각 기둥의 두 번째 글자)
  const dayJi = getPillarChar(sajuInfo.dayPillar, 1);
  const yearJi = getPillarChar(sajuInfo.yearPillar, 1);
  const monthJi = getPillarChar(sajuInfo.monthPillar, 1);
  const hourJi = getHourJiji(sajuInfo.hourPillar);

  // 각 요소별 특징 조회
  const dayGanVisual = CHEONGAN_VISUAL[dayGan] ?? CHEONGAN_VISUAL["무"];
  const monthGanVisual = CHEONGAN_VISUAL[monthGan] ?? CHEONGAN_VISUAL["기"];
  const dayJiImpression = JIJI_IMPRESSION[dayJi] ?? "balanced harmonious features";
  const yearJiTone = YEAR_JIJI_TONE[yearJi] ?? "natural healthy skin";
  const monthSeasonVibe = MONTH_SEASON_VIBE[monthJi] ?? "balanced seasonal presence";
  const hourSpecial = HOUR_SPECIAL[hourJi] ?? HOUR_SPECIAL["미상"];

  // 성격·취미·직업·연애 레퍼런스
  const dayJiPersonality = DAYJI_PERSONALITY[dayJi] ?? "균형 잡힌 성격";
  const dayJiHobbies = DAYJI_HOBBIES[dayJi] ?? ["독서", "음악", "여행"];
  const dayJiCareer = DAYJI_CAREER[dayJi] ?? ["전문직", "서비스직"];
  const monthJiLoveStyle = MONTHJI_LOVESTYLE[monthJi] ?? "진지하고 성실한 연애 스타일";
  const yearGanValues = YEANGAN_VALUES[yearGan] ?? "균형 잡힌 가치관";

  // 나이대
  const spouseAgeRange = getSpouseAgeRange(year, gender);
  const spouseAgeEN = getSpouseAgeEN(year, gender);
  const genderEN = gender === "male" ? "woman" : "man";

  return `의뢰인 정보:
- 이름: ${name}
- 생년월일시: ${year}년 ${month}월 ${day}일 ${hourText}
- 성별: ${gender === "male" ? "남성" : "여성"}
- 사주: 년주(${sajuInfo.yearPillar}) 월주(${sajuInfo.monthPillar}) 일주(${sajuInfo.dayPillar}) 시주(${sajuInfo.hourPillar})

════════════ 외모 레퍼런스 (일간·지지 기반) ════════════

[일간 ${dayGan} - 기본 얼굴 구조]
얼굴형: ${dayGanVisual.faceShape}
눈: ${dayGanVisual.eyes} / 눈썹: ${dayGanVisual.eyebrows}
코: ${dayGanVisual.nose} / 입술: ${dayGanVisual.lips}
턱/윤곽: ${dayGanVisual.jaw}
기본 분위기: ${dayGanVisual.vibe}

[일지 ${dayJi} - 인상 포인트]
${dayJiImpression}

[년지 ${yearJi} - 피부/전반톤]
${yearJiTone}

[월간 ${monthGan} × 월지 ${monthJi} - 헤어/계절감]
헤어: ${monthGanVisual.hair} / 계절감: ${monthSeasonVibe}

[시주 ${sajuInfo.hourPillar} - 특별 포인트]
${hourSpecial}

════════════ 성격·취미·직업 레퍼런스 (일지 = 배우자궁) ════════════

[일지 ${dayJi} - 배우자 성격 특성]
${dayJiPersonality}

[일지 ${dayJi} - 취미 경향 (이 중에서 선택·조합하세요)]
${dayJiHobbies.join(", ")}

[일지 ${dayJi} - 직업 경향 (이 중에서 선택하세요)]
${dayJiCareer.join(", ")}

[월지 ${monthJi} - 연애 스타일]
${monthJiLoveStyle}

[년간 ${yearGan} - 가치관·인생관]
${yearGanValues}

════════════════════════════════════════════════════════

분석 지시:
1. 위 레퍼런스를 모두 활용해 이 사주만의 완전히 독창적인 배우자 ${spouseGender}를 묘사하세요.
2. hobbies: 반드시 일지 ${dayJi} 취미 경향에서 선택하세요 (독서·음악·운동 같은 뻔한 조합 금지).
3. job: 반드시 일지 ${dayJi} 직업 경향에서 구체적인 직업명으로 작성하세요.
4. personality: 일지 ${dayJi} 성격 특성을 기반으로 구체적인 에피소드와 함께 묘사하세요.
5. loveStyle: 월지 ${monthJi} 연애 스타일을 기반으로 작성하세요.
6. 외모 description과 imagePrompt는 외모 레퍼런스를 조합해 매우 구체적으로 묘사하세요.

배우자 나이대: ${spouseAgeRange} (imagePrompt에 "${genderEN} ${spouseAgeEN}" 포함)
imagePrompt 헤어: "${monthGanVisual.hair}" 기반으로 구체적인 헤어 묘사 포함
bodySpec 성별: ${gender === "male" ? "여성 배우자" : "남성 배우자"}`;
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
