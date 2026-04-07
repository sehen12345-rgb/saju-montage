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

// ── 일지별 이름 음오행 힌트 (배우자 이름 첫 글자 계열) ───────────────────────
// 음오행(音五行): 木=ㄱ·ㅋ, 火=ㄴ·ㄷ·ㄹ·ㅌ, 土=ㅇ·ㅎ, 金=ㅅ·ㅈ·ㅊ, 水=ㅁ·ㅂ·ㅍ
const DAYJI_NAME_HINT: Record<string, { ohaeng: string; consonants: string; womanNames: string[]; manNames: string[]; reason: string }> = {
  자: { ohaeng: "수(水)", consonants: "ㅁ·ㅂ·ㅍ", womanNames: ["민서", "보라", "미래", "별이", "봄"], manNames: ["민준", "범석", "박현", "병찬", "민혁"], reason: "자수(子水)의 흐르는 기운은 ㅁ·ㅂ 계열 이름과 어울립니다" },
  축: { ohaeng: "토(土)", consonants: "ㅇ·ㅎ", womanNames: ["아린", "하은", "예원", "혜진", "유나"], manNames: ["영호", "현우", "원석", "혁진", "윤서"], reason: "축토(丑土)의 안정적인 기운은 ㅇ·ㅎ 계열 이름과 어울립니다" },
  인: { ohaeng: "목(木)", consonants: "ㄱ·ㅋ", womanNames: ["가은", "경서", "기쁨", "규리", "가영"], manNames: ["건우", "기준", "규현", "경민", "강호"], reason: "인목(寅木)의 뻗어나가는 기운은 ㄱ·ㅋ 계열 이름과 어울립니다" },
  묘: { ohaeng: "목(木)", consonants: "ㄱ·ㅋ (부드러운)", womanNames: ["가람", "고은", "기연", "경아", "꽃님"], manNames: ["광현", "건형", "기오", "경태", "규완"], reason: "묘목(卯木)의 섬세한 나무 기운은 부드러운 ㄱ 계열 이름과 어울립니다" },
  진: { ohaeng: "토(土)", consonants: "ㅇ·ㅎ (위엄)", womanNames: ["예진", "혜원", "유정", "은서", "희수"], manNames: ["용준", "현진", "원태", "혁", "의찬"], reason: "진토(辰土)의 용처럼 위엄 있는 기운은 ㅇ·ㅎ 계열 이름과 어울립니다" },
  사: { ohaeng: "화(火)", consonants: "ㄴ·ㄷ·ㄹ·ㅌ", womanNames: ["나연", "다희", "라온", "리아", "나은"], manNames: ["태양", "도현", "래원", "노준", "다은"], reason: "사화(巳火)의 밝고 세련된 불꽃 기운은 ㄴ·ㄷ·ㄹ 계열 이름과 어울립니다" },
  오: { ohaeng: "화(火)", consonants: "ㄴ·ㄷ·ㄹ·ㅌ (활기)", womanNames: ["다인", "루나", "태희", "리연", "난희"], manNames: ["태오", "도윤", "륜", "남준", "달"], reason: "오화(午火)의 강렬하고 활기찬 불 기운은 ㄴ·ㄷ·ㄹ·ㅌ 계열 이름과 어울립니다" },
  미: { ohaeng: "토(土)", consonants: "ㅇ·ㅎ (다정)", womanNames: ["유이", "하린", "아이", "혜나", "유선"], manNames: ["영찬", "하율", "오준", "유성", "희범"], reason: "미토(未土)의 따뜻하고 다정한 기운은 ㅇ·ㅎ 계열 이름과 어울립니다" },
  신: { ohaeng: "금(金)", consonants: "ㅅ·ㅈ·ㅊ", womanNames: ["서연", "지수", "채원", "수아", "진아"], manNames: ["준혁", "성민", "재원", "지훈", "찬호"], reason: "신금(申金)의 날카롭고 세련된 금속 기운은 ㅅ·ㅈ·ㅊ 계열 이름과 어울립니다" },
  유: { ohaeng: "금(金)", consonants: "ㅅ·ㅈ·ㅊ (단정)", womanNames: ["서하", "채린", "지은", "수빈", "세아"], manNames: ["재현", "성호", "찬영", "주원", "세준"], reason: "유금(酉金)의 정제되고 단정한 금 기운은 ㅅ·ㅈ·ㅊ 계열 이름과 어울립니다" },
  술: { ohaeng: "토(土)", consonants: "ㅇ·ㅎ (의리)", womanNames: ["예나", "혜린", "우리", "아현", "해인"], manNames: ["현도", "원준", "의진", "해찬", "호준"], reason: "술토(戌土)의 의리 있고 진실한 기운은 ㅇ·ㅎ 계열 이름과 어울립니다" },
  해: { ohaeng: "수(水)", consonants: "ㅁ·ㅂ·ㅍ (몽환)", womanNames: ["보미", "별하", "미소", "바다", "빛나"], manNames: ["바울", "미르", "범준", "벼리", "봄날"], reason: "해수(亥水)의 몽환적이고 자유로운 물 기운은 ㅁ·ㅂ 계열 이름과 어울립니다" },
};

// ── 년지별 전생 시대 배경 ──────────────────────────────────────────────────────
const YEARJI_ERA: Record<string, string> = {
  자: "고려 말 ~ 조선 초 물가 마을",
  축: "조선 초기 한양 근교 농촌",
  인: "임진왜란 전후 산간 마을",
  묘: "조선 중기 봄날의 꽃 마을",
  진: "삼국시대 신라 왕경 근처",
  사: "조선 후기 한양 저잣거리",
  오: "고려 시대 불교 사찰 근처",
  미: "고조선 ~ 삼한시대 초원 지대",
  신: "조선 후기 실학 시대 서원 마을",
  유: "통일신라 시대 해변 마을",
  술: "개화기 구한말 서울 외곽",
  해: "고려 시대 바닷가 어촌",
};

// ── 일지별 전생 역할 쌍 ────────────────────────────────────────────────────────
const DAYJI_PASTLIFE_ROLES: Record<string, { roles: string; bond: string; tragedy: string }> = {
  자: { roles: "강가 마을의 점술사와 그 집을 찾아온 나그네", bond: "운명을 알면서도 함께하려 했던", tragedy: "때를 맞추지 못해 스쳐 지나간" },
  축: { roles: "같은 밭을 일구던 소작농 남녀", bond: "묵묵히 서로를 의지하며 살아온", tragedy: "흉년과 이별이 갈라놓은" },
  인: { roles: "산속 서당의 훈장과 그 집 딸", bond: "학문과 마음을 함께 나누던", tragedy: "신분의 차이로 이루지 못한" },
  묘: { roles: "꽃밭 옆 약방의 의원과 약초를 캐던 처녀", bond: "계절마다 꽃처럼 만나고 헤어진", tragedy: "병으로 일찍 이별한" },
  진: { roles: "관아의 아전과 그 이웃집 여인", bond: "가까이 있었지만 표현하지 못했던", tragedy: "임무와 의무에 가로막힌" },
  사: { roles: "저잣거리 도자기 장인과 그 작품을 늘 구경하던 여인", bond: "눈빛으로 서로를 알아보던", tragedy: "화재로 모든 것을 잃고 헤어진" },
  오: { roles: "전장에서 부상당한 무장과 그를 치료한 의원 딸", bond: "짧지만 강렬하게 서로의 목숨을 살린", tragedy: "전쟁이 다시 그들을 갈라놓은" },
  미: { roles: "드넓은 들판에서 가축을 키우던 목동 남녀", bond: "매일 석양 아래 함께 노닐던", tragedy: "집안의 결혼 약조에 가로막힌" },
  신: { roles: "산사의 스님과 그 절을 자주 찾던 여인", bond: "말 없이도 마음이 통하던", tragedy: "계율과 세속의 벽에 막힌" },
  유: { roles: "바닷가 마을의 악사와 그 음악에 매료된 처녀", bond: "음악과 노래로 영혼이 연결된", tragedy: "먼 항해 끝에 다시 돌아오지 못한" },
  술: { roles: "마을 어귀를 지키던 포졸과 그 길을 매일 지나치던 여인", bond: "매일 같은 시간 눈빛을 나누던", tragedy: "임무 중 희생으로 갑자기 사라진" },
  해: { roles: "바다 위 배에서 만난 선원과 여행자", bond: "망망대해 위에서 서로에게 의지한", tragedy: "폭풍우가 둘을 다른 항구로 데려간" },
};

// ── 일간별 카카오톡 말투 스타일 ───────────────────────────────────────────────
const DAEGAN_TALK_STYLE: Record<string, string> = {
  갑: "격식 있지만 따뜻하게, 짧고 명확한 문장, 이모지 1개 이하, '~요' 정중체",
  을: "살짝 조심스럽고 부드럽게, 중간 길이 문장, 이모지 1~2개, 말끝이 '~요?' 올리기",
  병: "밝고 활기차게, 느낌표 많이, 이모지 2~3개, '~ 아닌가요?' 같은 적극 표현",
  정: "섬세하고 감성적으로, 여운 있는 문장, 이모지 1개, '... ' 말줄임 활용",
  무: "무뚝뚝하지만 진심 있게, 아주 짧고 직접적, 이모지 없거나 1개, '~야/~요' 혼용",
  기: "친근하고 다정하게, 일상적인 말투, 이모지 2개, '~ 어때요?' 같이 배려형",
  경: "간결하고 직접적, 2~3 단어로 핵심만, 이모지 없음, '~합니다/~요' 격식체",
  신: "세련되고 쿨하게, 중간 길이, 이모지 1개 (세련된 것), 말끝 여운 있게",
  임: "신비롭고 여운 있게, 긴 문장 또는 짧은 시 한 줄, 이모지 없거나 ✨ 계열",
  계: "감성적이고 순수하게, 일상 속 작은 것을 언급, 이모지 1~2개, '~ 생각났어요' 형식",
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

  // 이름·전생·카톡 레퍼런스
  const nameHintRef = DAYJI_NAME_HINT[dayJi] ?? DAYJI_NAME_HINT["자"];
  const spouseNameExamples = gender === "male" ? nameHintRef.womanNames : nameHintRef.manNames;
  const eraRef = YEARJI_ERA[yearJi] ?? "조선 시대 어느 마을";
  const pastLifeRef = DAYJI_PASTLIFE_ROLES[dayJi] ?? DAYJI_PASTLIFE_ROLES["자"];
  const talkStyle = DAEGAN_TALK_STYLE[dayGan] ?? DAEGAN_TALK_STYLE["무"];

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

════════════ 이름·전생·카톡 레퍼런스 ════════════

[일지 ${dayJi} - 배우자 이름 음오행 기준]
오행: ${nameHintRef.ohaeng} / 초성 계열: ${nameHintRef.consonants}
이름 예시: ${spouseNameExamples.join(", ")}
이유: ${nameHintRef.reason}

[년지 ${yearJi} × 일지 ${dayJi} - 전생 배경]
시대/장소: ${eraRef}
전생 역할: ${pastLifeRef.roles}
인연의 성격: ${pastLifeRef.bond} 관계
이별 원인: ${pastLifeRef.tragedy} 인연

[일간 ${dayGan} - 카카오톡 말투 스타일]
${talkStyle}

════════════════════════════════════════════════════════

분석 지시:
1. 위 레퍼런스를 모두 활용해 이 사주만의 완전히 독창적인 배우자 ${spouseGender}를 묘사하세요.
2. hobbies: 반드시 일지 ${dayJi} 취미 경향에서 선택하세요 (독서·음악·운동 같은 뻔한 조합 금지).
3. job: 반드시 일지 ${dayJi} 직업 경향에서 구체적인 직업명으로 작성하세요.
4. personality: 일지 ${dayJi} 성격 특성을 기반으로 구체적인 에피소드와 함께 묘사하세요.
5. loveStyle: 월지 ${monthJi} 연애 스타일을 기반으로 작성하세요.
6. 외모 description과 imagePrompt는 외모 레퍼런스를 조합해 매우 구체적으로 묘사하세요.
7. nameHint: 반드시 일지 ${dayJi}의 음오행(${nameHintRef.ohaeng})을 기반으로, 예시 이름(${spouseNameExamples.slice(0,3).join("·")})을 활용해 구체적으로 작성하세요.
8. pastLife: 반드시 "${eraRef}"를 배경으로, "${pastLifeRef.roles}"의 구도를 사용하세요. 매번 다른 구체적인 서사를 만드세요.
9. kakaoFirstMessage: 반드시 일간 ${dayGan}의 말투(${talkStyle.split(",")[0]})로 작성하세요. 성격과 말투가 바로 느껴지게, 절대 "안녕하세요 혹시 기억하세요" 같은 뻔한 시작 금지.

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

// ── 카카오톡 첫 메시지 템플릿 (일간별 × 상황별) ──────────────────────────────
const KAKAO_TEMPLATES: Record<string, string[]> = {
  갑: [
    "연락처를 받고 나서 한참을 망설였는데, 그냥 한번 드려봅니다.",
    "솔직히 먼저 연락하는 게 낯선데, 그럼에도 드리고 싶었어요.",
    "잠깐 얘기 나눴는데 기억하실지 모르겠네요. 연락드려도 될까요?",
    "오늘 갑자기 생각이 나서요. 시간 되시면 커피 한 잔 어떠세요?",
  ],
  을: [
    "이런 연락 갑작스러우실 것 같은데... 그냥 한번 용기 내봤어요 🌸",
    "혹시 요즘 잘 지내고 계세요? 그냥 문득 궁금해서요 😊",
    "바람이 좋은 날이라 그런지 자꾸 생각이 나서요 🍃",
    "연락드려도 될지 한참 고민했는데, 결국 이렇게 됐어요 😊",
  ],
  병: [
    "갑자기 연락해서 놀라셨죠?? 그냥 오늘 너무 좋은 날 같아서요 ☀️",
    "먼저 연락해도 되나 엄청 고민했는데 그냥 해버렸어요!! 괜찮죠? 😄",
    "오늘 뭐 하세요?? 갑자기 생각나서 여쭤봤어요 😆✨",
    "안녕하세요!! 저 기억하세요? 그날 너무 재밌어서 또 연락하고 싶었어요 😄",
  ],
  정: [
    "이런 연락이 이상하게 느껴지실 수도 있는데, 그냥 솔직히 말씀드리고 싶었어요.",
    "말을 꺼내기 참 어렵네요. 그래도 연락하길 잘한 것 같아요.",
    "오늘 혼자 걷다가 갑자기 생각이 나서요... 이상하죠?",
    "이런 감정이 자주 있는 게 아닌데, 오늘은 그냥 솔직하게 연락해봤어요.",
  ],
  무: [
    "밥은 먹었어요?",
    "시간 되면 커피 한 잔 해요.",
    "요즘 어떻게 지내요.",
    "연락해도 되나 싶었는데, 그냥 해봤어요.",
  ],
  기: [
    "안녕하세요~ 오늘 날씨 너무 좋지 않아요? 😊 혹시 산책 즐기세요?",
    "저 기억하세요~? 오늘 맛있는 거 먹다가 갑자기 생각나서요 🍽️",
    "연락드려도 괜찮으실까요? 그냥 한번 여쭤보고 싶어서요 😊",
    "오늘 지나가다가 딱 맞는 카페 발견했는데 혹시 커피 좋아하세요? ☕",
  ],
  경: [
    "연락드립니다. 시간 되시면 커피 한 잔 어떠세요.",
    "한 가지 여쭤봐도 될까요.",
    "잠깐 얘기 나눌 수 있을까요.",
    "오늘 시간 되세요?",
  ],
  신: [
    "오랜만이에요. 잘 지내셨죠? ✨",
    "갑자기 연락해서 놀라셨나요? 그냥 한번 드려보고 싶었어요.",
    "연락드릴까 말까 한참 고민했는데, 결국 이렇게 됐네요.",
    "이런 연락 처음이라 좀 어색한데요. 그냥 드려봅니다. ✨",
  ],
  임: [
    "이상하게 자꾸 생각이 나서요.",
    "오늘 길을 걷다가 문득 연락하고 싶어졌어요. ✨",
    "이런 감각이 자주 있는 건 아닌데, 오늘은 그냥 따라가 보기로 했어요.",
    "연락을 드리는 게 맞는 건지 한참 생각했어요. 그래도 드리고 싶었어요.",
  ],
  계: [
    "갑자기 연락드려서 놀라셨죠? 왠지 오늘은 용기가 생겼어요 😊",
    "이런 연락 처음이라 좀 어색한데... 그냥 솔직하게 말씀드리고 싶었어요.",
    "오늘 하늘이 너무 예뻐서 그런지 자꾸 생각이 났어요 🌙",
    "왠지 연락하지 않으면 후회할 것 같아서요. 잘 지내고 계세요? 🌸",
  ],
};

// ── 전생 서사 변주 요소 ────────────────────────────────────────────────────────
const PASTLIFE_SEASONS = ["봄 어느 날", "여름 새벽", "가을 저녁", "겨울 밤"];
const PASTLIFE_ENDINGS = [
  "그 그리움이 이번 생의 깊은 인연으로 이어졌습니다.",
  "두 영혼은 결국 다시 만나기로 약속하고 헤어졌습니다.",
  "이번 생에서는 반드시 이루리라는 다짐이 두 사람을 다시 불러냈습니다.",
  "그 미완의 인연이 이번 생에서 완성되려 하고 있습니다.",
];

/**
 * Claude에게 맡기지 않고 사주 시드로 직접 계산하는 결정론적 필드.
 * 같은 사주 → 항상 같은 결과 / 다른 사주 → 반드시 다른 결과.
 */
export function buildDeterministicFields(
  sajuInfo: SajuInfo,
  gender: "male" | "female",
  seed: number
): { nameHint: string; pastLife: string; kakaoFirstMessage: string; hobbies: string[] } {
  const dayGan = getPillarChar(sajuInfo.dayPillar, 0);
  const dayJi  = getPillarChar(sajuInfo.dayPillar, 1);
  const yearJi = getPillarChar(sajuInfo.yearPillar, 1);

  // ── 이름 힌트 ──
  const nameRef = DAYJI_NAME_HINT[dayJi] ?? DAYJI_NAME_HINT["자"];
  const namePool = gender === "male" ? nameRef.womanNames : nameRef.manNames;
  const n1 = namePool[seed % namePool.length];
  const n2 = namePool[(seed + 2) % namePool.length];
  const n3 = namePool[(seed + 4) % namePool.length];
  const nameHint =
    `일지 ${dayJi}의 ${nameRef.ohaeng} 기운이 담긴 '${n1}', '${n2}', '${n3}' 같은 ` +
    `${nameRef.consonants} 초성의 이름일 가능성이 높습니다. ${nameRef.reason}.`;

  // ── 전생 인연 ──
  const era      = YEARJI_ERA[yearJi] ?? "조선 시대 어느 마을";
  const roles    = DAYJI_PASTLIFE_ROLES[dayJi] ?? DAYJI_PASTLIFE_ROLES["자"];
  const season   = PASTLIFE_SEASONS[seed % PASTLIFE_SEASONS.length];
  const ending   = PASTLIFE_ENDINGS[(seed >> 2) % PASTLIFE_ENDINGS.length];
  const pastLife =
    `${era}의 ${season}, 두 사람은 ${roles.roles}였습니다. ` +
    `${roles.bond} 관계였지만 ${roles.tragedy} 결국 헤어졌고, ${ending}`;

  // ── 카카오톡 첫 메시지 ──
  const templates = KAKAO_TEMPLATES[dayGan] ?? KAKAO_TEMPLATES["무"];
  const kakaoFirstMessage = templates[(seed >> 1) % templates.length];

  // ── 취미 (일지 풀에서 시드로 3개 픽, 매번 다른 조합) ──
  const hobbyPool = DAYJI_HOBBIES[dayJi] ?? ["요리", "독서", "여행"];
  const picked: string[] = [];
  for (let i = 0; picked.length < 3; i++) {
    const candidate = hobbyPool[(seed + i * 3) % hobbyPool.length];
    if (!picked.includes(candidate)) picked.push(candidate);
    if (i > hobbyPool.length * 2) break; // 무한루프 방지
  }
  const hobbies = picked;

  return { nameHint, pastLife, kakaoFirstMessage, hobbies };
}
