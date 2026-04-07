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

  // 나이대
  const spouseAgeRange = getSpouseAgeRange(year, gender);
  const spouseAgeEN = getSpouseAgeEN(year, gender);
  const genderEN = gender === "male" ? "woman" : "man";

  return `의뢰인 정보:
- 이름: ${name}
- 생년월일시: ${year}년 ${month}월 ${day}일 ${hourText}
- 성별: ${gender === "male" ? "남성" : "여성"}
- 사주: 년주(${sajuInfo.yearPillar}) 월주(${sajuInfo.monthPillar}) 일주(${sajuInfo.dayPillar}) 시주(${sajuInfo.hourPillar})

──────────────── 사주 기반 배우자 외모 레퍼런스 ────────────────

[일간 ${dayGan} - 기본 얼굴 구조]
얼굴형: ${dayGanVisual.faceShape}
눈: ${dayGanVisual.eyes}
눈썹: ${dayGanVisual.eyebrows}
코: ${dayGanVisual.nose}
입술: ${dayGanVisual.lips}
턱/윤곽: ${dayGanVisual.jaw}
기본 분위기: ${dayGanVisual.vibe}

[일지 ${dayJi} - 인상 포인트]
${dayJiImpression}

[년지 ${yearJi} - 피부/전반톤]
${yearJiTone}

[월간 ${monthGan} × 월지 ${monthJi} - 계절 인상]
헤어/마무리: ${monthGanVisual.hair}
계절감: ${monthSeasonVibe}

[시주 ${sajuInfo.hourPillar} - 특별 포인트]
${hourSpecial}

──────────────────────────────────────────────────────────────

분석 지시:
1. 위 레퍼런스를 기반으로 배우자 ${spouseGender}를 분석하세요.
2. 4개 기둥의 특징을 조합하여 이 사주만의 완전히 독창적인 외모를 창조하세요.
3. description에 얼굴형·눈·코·입·피부·머리까지 구체적으로 묘사하세요.
4. imagePrompt는 위 특징들을 영어로 조합하되, 매우 구체적인 얼굴 묘사를 만드세요.

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
