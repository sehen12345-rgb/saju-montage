import type { SajuAnalysis, SajuInfo } from "./types";

type DemoEntry = {
  womanDesc: string; womanPrompt: string; womanTraits: string[];
  womanMbti: string; womanJob: string; womanHobbies: string[];
  womanPersonality: string; womanLoveStyle: string; womanFirstMeet: string;
  womanLifeStyle: string; womanCompatibility: string;
  manDesc: string; manPrompt: string; manTraits: string[];
  manMbti: string; manJob: string; manHobbies: string[];
  manPersonality: string; manLoveStyle: string; manFirstMeet: string;
  manLifeStyle: string; manCompatibility: string;
};

// 천간별 섹션 소제목 (각 오행 특성 반영)
const TITLES: Record<string, {
  woman: { desc: string; personality: string; love: string; life: string; meet: string };
  man:   { desc: string; personality: string; love: string; life: string; meet: string };
}> = {
  갑: {
    woman: { desc: "기품과 지성이 함께 빛나는 외모", personality: "원칙을 지키는 곧은 사람", love: "행동으로 증명하는 깊은 신뢰", life: "절제 속에 풍요로운 일상", meet: "지적인 공간에서 피어나는 인연" },
    man:   { desc: "첫눈에 압도되는 카리스마", personality: "흔들리지 않는 단단한 사람", love: "책임감으로 사랑을 지키는 스타일", life: "바쁘지만 빈틈없는 자기관리", meet: "강한 첫인상이 오래 남는 만남" },
  },
  을: {
    woman: { desc: "볼수록 우아해지는 부드러운 매력", personality: "가까울수록 따뜻해지는 사람", love: "소소한 일상으로 사랑을 쌓는 스타일", life: "아늑함과 안정을 사랑하는 일상", meet: "자연스럽게 스며드는 인연" },
    man:   { desc: "강함과 부드러움을 동시에 가진 인상", personality: "감성과 배려가 공존하는 사람", love: "감성적인 방식으로 마음을 전하는 스타일", life: "느림의 미학을 아는 여유로운 삶", meet: "처음엔 수줍지만 깊어지는 만남" },
  },
  병: {
    woman: { desc: "어디서든 빛나는 화사한 존재감", personality: "곁에 있으면 절로 웃게 되는 사람", love: "열정적으로 매일을 특별하게 만드는 스타일", life: "활기와 에너지로 채운 하루하루", meet: "첫 만남부터 웃음이 끊이지 않는 인연" },
    man:   { desc: "강렬해서 잊을 수 없는 첫인상", personality: "추진력과 유머를 모두 가진 사람", love: "직접적이고 거침없는 사랑 표현", life: "도전과 즐거움으로 가득한 일상", meet: "눈에 띄는 존재로 먼저 다가오는 만남" },
  },
  정: {
    woman: { desc: "알아갈수록 깊어지는 신비로운 매력", personality: "소수의 인연을 깊이 사랑하는 사람", love: "영혼까지 교감하는 진지한 사랑", life: "내면을 가꾸는 의미 있는 일상", meet: "잊을 수 없는 첫 대화로 시작되는 인연" },
    man:   { desc: "볼수록 빠져드는 감성적인 외모", personality: "자신만의 세계가 뚜렷한 예술적 영혼", love: "감성으로 전하는 시 같은 사랑", life: "경험과 감성에 투자하는 삶", meet: "공통된 취향에서 시작되는 인연" },
  },
  무: {
    woman: { desc: "처음부터 편안함을 주는 따뜻한 외모", personality: "누구든 품어주는 넉넉한 사람", love: "묵묵히 곁을 지키는 헌신적인 스타일", life: "가정과 사람을 중심에 두는 일상", meet: "오래 알아온 것 같은 편안한 첫 만남" },
    man:   { desc: "보는 것만으로 마음이 놓이는 든든한 인상", personality: "말보다 행동이 믿음직한 사람", love: "성실함으로 쌓아가는 깊은 사랑", life: "규칙과 자연이 공존하는 안정된 삶", meet: "시간이 지날수록 소중해지는 만남" },
  },
  기: {
    woman: { desc: "미소만으로 주변을 밝히는 사랑스러운 외모", personality: "긍정 에너지가 넘치는 밝은 사람", love: "매일을 기념일처럼 만드는 로맨틱 스타일", life: "소소한 것에서 행복을 찾는 일상", meet: "환한 미소로 먼저 다가오는 인연" },
    man:   { desc: "편안하고 친근한 인상의 사람", personality: "순수하고 낙천적인 삶의 에너지", love: "즉흥적인 설렘을 선물하는 스타일", life: "맛과 여행으로 채우는 즐거운 일상", meet: "공통 취미에서 자연스럽게 가까워지는 인연" },
  },
  경: {
    woman: { desc: "차갑지만 눈을 뗄 수 없는 세련된 외모", personality: "기준이 높고 자신감이 넘치는 사람", love: "대등하고 신뢰 기반의 성숙한 연애", life: "높은 기준으로 품격 있게 쌓아가는 일상", meet: "강렬한 첫인상이 오래 남는 만남" },
    man:   { desc: "한 번 보면 잊기 힘든 강한 존재감", personality: "정의감과 책임감이 곧은 사람", love: "행동으로 지키는 흔들리지 않는 사랑", life: "규율과 안목으로 완성한 삶", meet: "묵직한 첫인상이 마음에 남는 인연" },
  },
  신: {
    woman: { desc: "보석처럼 정교하고 빛나는 외모", personality: "독특한 감각과 취향이 살아있는 사람", love: "섬세하고 절제된 방식으로 마음을 전하는 스타일", life: "아름다운 것들로만 채운 감각적인 일상", meet: "볼수록 매력이 깊어지는 인연" },
    man:   { desc: "처음엔 수수하지만 알면 알수록 빛나는 외모", personality: "논리와 창의가 공존하는 독창적인 사람", love: "조용하지만 깊고 세심한 사랑", life: "미니멀하고 깊이 있는 삶", meet: "대화할수록 점점 빠져드는 인연" },
  },
  임: {
    woman: { desc: "깊고 그윽한 눈빛이 인상적인 지적인 외모", personality: "깊은 사유와 독립심을 가진 사람", love: "정서적 교감으로 깊어지는 사랑", life: "내면을 풍요롭게 가꾸는 고요한 일상", meet: "깊은 대화로 이어지는 특별한 인연" },
    man:   { desc: "신비롭고 사색적인 분위기의 외모", personality: "세상을 바꾸고 싶은 이상주의자", love: "영혼을 나누는 진지하고 깊은 사랑", life: "의미와 경험 중심의 깊이 있는 삶", meet: "오래 알아온 것 같은 신비로운 첫 만남" },
  },
  계: {
    woman: { desc: "수수하지만 오래 볼수록 아름다운 외모", personality: "순수하고 섬세한 예술적 영혼", love: "자신만의 방식으로 조심스럽게 전하는 사랑", life: "감성과 창작으로 가득한 나만의 세계", meet: "수줍은 첫인사가 오래 남는 인연" },
    man:   { desc: "조용하지만 마음이 따뜻해지는 인상", personality: "말없이도 필요한 걸 먼저 아는 사람", love: "언제나 곁에 있다는 안정감을 주는 스타일", life: "잔잔하고 따뜻한 일상의 행복", meet: "시간이 갈수록 소중해지는 인연" },
  },
};

const OHAENG_DEMO: Record<string, DemoEntry> = {
  갑: {
    womanDesc: "당신의 배우자는 긴 타원형 얼굴에 날카롭고 지적인 눈매를 가진 분입니다. 갑목(甲木)의 곧은 기운처럼 이마가 높고 콧대가 뚜렷하며, 단아하고 기품 있는 분위기를 풍깁니다. 얇고 단정한 입술에 자연스러운 미소가 인상적이며, 서늘하고 공정한 눈빛 속에 깊은 따뜻함이 담겨 있습니다.",
    womanPrompt: "oval face with high forehead, long almond-shaped double-eyelid eyes with sharp intelligent gaze, tall straight nose bridge, thin well-defined lips, slim elegant jaw, cool fair skin",
    womanTraits: ["지적인 눈매", "단아한 기품", "곧고 바른 인상"],
    womanMbti: "INTJ",
    womanJob: "변호사 또는 대학 교수",
    womanHobbies: ["클래식 음악 감상", "독서", "미술관 관람"],
    womanPersonality: "원칙과 소신이 뚜렷하며, 한 번 맺은 인연은 끝까지 책임지는 깊은 의리가 있습니다. 표현이 절제되어 차갑게 보일 수 있지만, 가까운 사람에게는 누구보다 헌신적입니다. 불합리한 것을 참지 못하고 직설적으로 말하는 편이어서 가끔 오해를 사기도 합니다.",
    womanLoveStyle: "감정 표현보다는 행동으로 사랑을 보여주는 타입입니다. 연인의 작은 부분까지 세심하게 챙기며, 한 번 사랑하면 쉽게 변하지 않는 깊은 신뢰를 줍니다.",
    womanFirstMeet: "도서관이나 세미나, 북클럽 같은 지적인 공간에서 처음 만날 가능성이 높습니다. 서로의 관심사에 대해 대화를 나누다 자연스럽게 연결되는 인연입니다.",
    womanLifeStyle: "규칙적인 생활 패턴을 유지하며, 주말에는 문화 생활을 즐깁니다. 소비는 신중하게 하되 가치 있는 것에는 아낌없이 투자하는 편입니다.",
    womanCompatibility: "당신의 흔들리는 마음을 단단하게 잡아줄 운명의 상대",
    manDesc: "당신의 배우자는 각진 얼굴에 강인하고 결단력 있는 눈빛을 가진 분입니다. 갑목의 기운을 받아 체격이 크고 곧으며, 높은 콧대와 선명한 이목구비가 카리스마를 더합니다. 묵직한 존재감과 신뢰감 있는 인상이 특징입니다.",
    manPrompt: "strong oval face with defined cheekbones, piercing almond eyes with sharp gaze, tall aquiline nose, firm thin lips, strong jaw, fair cool skin, commanding dignified expression",
    manTraits: ["강인한 눈빛", "카리스마", "신뢰감"],
    manMbti: "ENTJ",
    manJob: "기업 임원 또는 창업가",
    manHobbies: ["등산", "독서", "골프"],
    manPersonality: "추진력이 강하고 목표 의식이 뚜렷한 리더형입니다. 책임감이 강해 맡은 일은 끝까지 해내지만, 가끔 지나치게 완벽주의적 성향이 부담이 되기도 합니다. 가족을 최우선으로 생각하는 든든한 사람입니다.",
    manLoveStyle: "연인에게 최선을 다하며, 물질적·정서적으로 풍족하게 챙겨줍니다. 질투심이 강하지는 않지만 신뢰를 매우 중요하게 생각합니다.",
    manFirstMeet: "업무나 사회적 모임에서 처음 눈이 마주칠 가능성이 높습니다. 첫인상부터 강한 존재감으로 오랫동안 기억에 남는 만남이 될 것입니다.",
    manLifeStyle: "바쁜 일상이지만 자기 관리에 철저합니다. 주말에는 가까운 사람들과 질 좋은 시간을 보내는 것을 중요하게 생각합니다.",
    manCompatibility: "함께라면 어떤 어려움도 이겨낼 수 있는 완벽한 동반자",
  },
  을: {
    womanDesc: "당신의 배우자는 부드러운 타원형 얼굴에 우아하고 섬세한 눈매를 가진 분입니다. 을목(乙木)의 유연한 기운처럼 전체적으로 부드럽고 여성스러운 선을 지녔으며, 은은하게 빛나는 피부와 자연스러운 미소가 매력적입니다.",
    womanPrompt: "soft oval face, gentle doe eyes with double eyelids and warm gaze, delicate straight nose, naturally full lips with soft smile, rounded soft jaw, warm peach skin, graceful gentle expression",
    womanTraits: ["부드러운 눈매", "우아한 분위기", "따뜻한 미소"],
    womanMbti: "ISFJ",
    womanJob: "초등학교 교사 또는 상담사",
    womanHobbies: ["꽃꽂이", "요리", "영화 감상"],
    womanPersonality: "타인에 대한 배려심이 깊고, 주변 사람들을 먼저 생각하는 따뜻한 성격입니다. 갈등을 싫어해 자신의 감정을 속으로 삭이는 경향이 있어 속 깊이 상처받기도 합니다. 하지만 진심 어린 관심으로 늘 곁에 있어주는 든든한 존재입니다.",
    womanLoveStyle: "사랑하는 사람을 위해 세심하게 챙기는 헌신형입니다. 직접적인 고백보다 행동으로 감정을 표현하며, 함께하는 일상의 소소한 순간을 소중히 여깁니다.",
    womanFirstMeet: "친구의 소개나 동네 카페, 취미 모임에서 자연스럽게 만날 가능성이 높습니다. 처음에는 수줍어 보이지만 시간이 지날수록 진가가 드러나는 인연입니다.",
    womanLifeStyle: "아늑한 집에서 보내는 시간을 좋아하며, 직접 요리하고 꾸미는 것을 즐깁니다. 계획적으로 저축하며 안정된 미래를 중요시합니다.",
    womanCompatibility: "지친 하루의 끝에 언제나 편안한 쉼터가 되어줄 사람",
    manDesc: "당신의 배우자는 부드럽고 친근한 인상에 포근한 눈빛을 가진 분입니다. 을목의 유연한 기운으로 강해 보이면서도 섬세한 감성이 느껴지며, 어깨가 넓고 체형이 균형 잡혀 있습니다.",
    manPrompt: "soft oval face, warm friendly eyes with calm gaze, straight refined nose, gentle full lips, soft defined jaw, warm beige skin, approachable warm expression",
    manTraits: ["포근한 눈빛", "친근한 인상", "균형 잡힌 외모"],
    manMbti: "INFP",
    manJob: "작가 또는 UX 디자이너",
    manHobbies: ["기타 연주", "사진 촬영", "카페 탐방"],
    manPersonality: "감수성이 풍부하고 타인의 감정을 잘 이해하는 공감 능력이 뛰어납니다. 내면이 깊고 창의적이며, 한 번 마음을 열면 진심을 다해 관계를 이어갑니다. 갈등 상황에서는 회피하려는 경향이 있어 때로 답답할 수 있습니다.",
    manLoveStyle: "감성적이고 로맨틱한 방식으로 사랑을 표현합니다. 작은 이벤트와 손편지 같은 아날로그적 표현을 좋아하며, 연인의 감정 변화에 민감하게 반응합니다.",
    manFirstMeet: "전시회, 독립 서점, 또는 공통 취미 모임에서 만날 가능성이 높습니다. 잔잔하지만 깊이 있는 첫 대화로 서로에게 특별한 사람이 될 것입니다.",
    manLifeStyle: "느린 템포의 여유로운 삶을 추구합니다. 주말에는 새로운 카페나 전시회를 찾아다니며 영감을 받는 것을 즐깁니다.",
    manCompatibility: "당신의 일상에 따뜻한 색채를 더해줄 감성의 동반자",
  },
  병: {
    womanDesc: "당신의 배우자는 하트형 얼굴에 크고 생동감 넘치는 눈을 가진 분입니다. 병화(丙火)의 밝은 기운처럼 눈빛이 반짝이고 표정이 풍부하며, 자연스러운 홍조와 복숭아빛 피부가 활기차 보입니다.",
    womanPrompt: "heart-shaped face with pointed chin, large bright upturned eyes with lively expression, small cute nose, full lips with wide bright smile, delicate chin, warm peachy glowing skin, vivid energetic expression",
    womanTraits: ["반짝이는 눈빛", "화사한 미소", "활기찬 분위기"],
    womanMbti: "ENFP",
    womanJob: "방송 PD, 마케터, 또는 이벤트 플래너",
    womanHobbies: ["여행", "댄스", "SNS 콘텐츠 제작"],
    womanPersonality: "어디서나 분위기를 밝히는 에너자이저입니다. 사람을 좋아하고 새로운 것에 대한 호기심이 넘치며, 함께 있으면 절로 웃음이 나옵니다. 다만 감정 기복이 있고 계획보다 즉흥적인 편이라 때로 예측하기 어렵습니다.",
    womanLoveStyle: "사랑에 빠지면 적극적이고 열정적으로 감정을 표현합니다. 함께 다양한 경험을 쌓는 것을 즐기며, 연인에게 늘 설레는 감정을 주고 싶어 합니다.",
    womanFirstMeet: "여행지나 파티, 활기찬 소셜 모임에서 눈에 띄는 존재로 먼저 말을 걸어올 가능성이 높습니다. 첫 만남부터 웃음이 끊이지 않는 인연입니다.",
    womanLifeStyle: "활동적이고 바쁜 일상을 즐깁니다. 새로운 장소와 경험을 추구하며, 여행 계획을 세우는 것 자체를 즐기는 사람입니다.",
    womanCompatibility: "함께라면 매일이 소풍 같은, 인생의 설렘을 선물하는 사람",
    manDesc: "당신의 배우자는 날카롭고 선명한 이목구비에 강렬한 눈빛을 가진 분입니다. 병화의 강한 기운으로 첫인상부터 눈에 띄는 존재감이 있으며, 자신감 있는 표정과 당당한 자세가 매력적입니다.",
    manPrompt: "angular face with strong features, intense bright eyes with confident gaze, defined strong nose, full lips with charismatic smile, sharp jaw, warm sun-kissed skin, bold dynamic expression",
    manTraits: ["강렬한 눈빛", "당당한 존재감", "선명한 이목구비"],
    manMbti: "ESTP",
    manJob: "스타트업 대표 또는 영업 전문가",
    manHobbies: ["스포츠", "드라이브", "새로운 맛집 탐방"],
    manPersonality: "행동력이 뛰어나고 사교적인 현실주의자입니다. 유머 감각이 넘쳐 함께 있으면 지루할 틈이 없으며, 위기 상황에서 특히 빛을 발합니다. 충동적인 결정을 내리기도 하지만 결과적으로 잘 풀리는 운을 가졌습니다.",
    manLoveStyle: "직접적이고 솔직하게 감정을 표현하며, 연인에게 특별한 경험을 선사하는 것을 좋아합니다. 지루하지 않은 연애를 추구하며 언제나 새로운 자극을 만들어냅니다.",
    manFirstMeet: "스포츠 경기장, 파티, 또는 친구들과의 모임에서 가장 활기차게 웃고 있는 사람이 바로 그입니다. 다가가기 쉬운 편안한 첫인상으로 자연스럽게 연결됩니다.",
    manLifeStyle: "도전을 즐기며 바쁘게 살아가는 사람입니다. 일과 놀이의 경계 없이 열정적으로 삶을 즐깁니다.",
    manCompatibility: "매일 새로운 페이지를 함께 써 내려갈 역동적인 파트너",
  },
  정: {
    womanDesc: "당신의 배우자는 갸름한 얼굴에 또렷하고 표현력 풍부한 눈을 가진 분입니다. 정화(丁火)의 은은한 불꽃처럼 처음에는 조용해 보이지만 눈빛이 깊고 매력적입니다.",
    womanPrompt: "slender oval face, expressive double-eyelid eyes with deep mysterious gaze, elegant refined nose, naturally red full lips, soft pointed chin, fair warm skin, mysterious captivating expression",
    womanTraits: ["깊은 눈빛", "신비로운 분위기", "섬세한 이목구비"],
    womanMbti: "INFJ",
    womanJob: "심리상담사 또는 작가",
    womanHobbies: ["글쓰기", "요가", "아로마테라피"],
    womanPersonality: "직관력이 뛰어나고 타인의 마음을 잘 읽는 사람입니다. 소수의 깊은 관계를 선호하며, 한 번 마음을 준 사람에게는 끝없이 헌신합니다. 이상이 높아 현실과 괴리를 느낄 때 내면에서 갈등하는 경향이 있습니다.",
    womanLoveStyle: "깊고 진지한 사랑을 추구하며, 영혼의 동반자를 원합니다. 연인의 작은 변화도 놓치지 않고 세심하게 보살피며, 정서적 교감을 가장 중요하게 생각합니다.",
    womanFirstMeet: "조용한 카페나 문화 행사, 독서 모임에서 인연이 시작될 가능성이 높습니다. 첫 대화부터 어딘가 특별한 느낌을 주는 만남입니다.",
    womanLifeStyle: "혼자만의 시간을 소중히 여기며 내면을 가꾸는 사람입니다. 의미 있는 소비를 지향하며 아늑한 공간 꾸미기를 즐깁니다.",
    womanCompatibility: "서로의 영혼 깊은 곳까지 닿는 특별한 연결고리",
    manDesc: "당신의 배우자는 날렵하고 지적인 인상에 깊고 감성적인 눈빛을 가진 분입니다. 정화의 섬세한 기운으로 예술적 감성이 느껴지며, 단정하고 세련된 외모가 인상적입니다.",
    manPrompt: "slender defined face, deep-set intelligent eyes with sensitive gaze, straight elegant nose, defined lips with slight smile, slim jaw, fair cool skin, refined artistic expression",
    manTraits: ["감성적 눈빛", "세련된 인상", "은은한 카리스마"],
    manMbti: "INFP",
    manJob: "음악가 또는 영화 감독",
    manHobbies: ["작곡", "영화 감상", "여행 사진"],
    manPersonality: "예술적 감수성이 뛰어나고 자신만의 세계관이 확고합니다. 조용하지만 대화를 나눌수록 깊이가 느껴지는 매력이 있습니다. 자신의 감정을 쉽게 드러내지 않아 알아가는 데 시간이 필요합니다.",
    manLoveStyle: "음악이나 편지, 그림처럼 감성적인 방식으로 사랑을 표현합니다. 연인과 함께 아무것도 안 해도 좋은, 그런 편안한 관계를 꿈꿉니다.",
    manFirstMeet: "공연장이나 갤러리, 또는 공통 친구의 소개를 통해 만날 가능성이 높습니다. 조용히 나눈 첫 대화가 오랫동안 마음에 남는 인연입니다.",
    manLifeStyle: "창의적인 활동과 문화 생활 중심의 라이프스타일입니다. 물질보다 경험과 감성에 가치를 두는 사람입니다.",
    manCompatibility: "당신의 감정에 이름을 붙여줄 수 있는 단 한 사람",
  },
  무: {
    womanDesc: "당신의 배우자는 둥글고 넉넉한 얼굴형에 온화하고 편안한 눈빛을 가진 분입니다. 무토(戊土)의 포용하는 기운처럼 처음 만나는 순간부터 편안함을 주며, 따뜻한 황금빛 피부와 넓고 온화한 미소가 인상적입니다.",
    womanPrompt: "round full face with wide cheekbones, large warm gentle eyes, broad soft nose, wide full lips with warm smile, soft rounded jaw, golden olive skin, nurturing serene expression",
    womanTraits: ["따뜻한 눈빛", "편안한 인상", "넉넉한 분위기"],
    womanMbti: "ESFJ",
    womanJob: "간호사 또는 사회복지사",
    womanHobbies: ["요리", "가드닝", "봉사활동"],
    womanPersonality: "누구에게나 열린 마음으로 다가가는 포용력이 큰 사람입니다. 가정적이고 돌봄의 기질이 강하며, 주변 사람들이 자연스럽게 의지하게 됩니다. 때로 자신보다 남을 너무 먼저 생각해 정작 자신이 지치는 경우도 있습니다.",
    womanLoveStyle: "말보다 행동으로 사랑을 표현하는 헌신형입니다. 연인의 취향과 컨디션을 세심하게 챙기며, 안정적이고 따뜻한 관계를 만들어갑니다.",
    womanFirstMeet: "지인의 소개나 동네 모임, 자원봉사 활동 같은 따뜻한 자리에서 인연이 시작될 것입니다. 만나는 순간부터 오랜 친구 같은 편안함을 주는 사람입니다.",
    womanLifeStyle: "집 꾸미기와 요리를 즐기며, 가족과 함께하는 시간을 가장 소중히 여깁니다. 안정적인 소비 패턴으로 미래를 차근차근 준비합니다.",
    womanCompatibility: "언제나 당신의 빈자리를 채워줄 따뜻한 안식처",
    manDesc: "당신의 배우자는 넓고 후덕한 얼굴에 믿음직스러운 눈빛을 가진 분입니다. 무토의 안정된 기운으로 체격이 크고 든든하며, 넓은 이마와 평온한 눈빛이 신뢰감을 줍니다.",
    manPrompt: "broad round face with strong cheekbones, calm steady eyes with trustworthy gaze, broad nose, full lips, strong wide jaw, warm golden skin, dependable solid expression",
    manTraits: ["믿음직한 눈빛", "든든한 인상", "안정적 분위기"],
    manMbti: "ISTJ",
    manJob: "공무원 또는 금융업 종사자",
    manHobbies: ["낚시", "등산", "텃밭 가꾸기"],
    manPersonality: "한 번 결정하면 끝까지 책임지는 신뢰의 아이콘입니다. 화려하지 않지만 묵묵히 옆에서 지켜주는 진짜 어른의 모습을 가졌습니다. 변화보다 안정을 추구하며 보수적인 면이 있지만, 그것이 오히려 큰 안도감을 줍니다.",
    manLoveStyle: "천천히 마음을 열지만 한 번 사랑하면 변치 않는 단단한 사랑을 합니다. 특별한 이벤트보다 일상 속 성실함으로 사랑을 증명하는 사람입니다.",
    manFirstMeet: "직장 동료 소개, 지역 커뮤니티, 또는 오래된 지인의 모임에서 처음 만날 가능성이 높습니다. 처음에는 무심해 보이지만 시간이 지날수록 소중해지는 사람입니다.",
    manLifeStyle: "규칙적인 생활을 중시하며 절약과 저축으로 안정적인 기반을 만들어갑니다. 주말에는 자연 속에서 재충전하는 것을 즐깁니다.",
    manCompatibility: "흔들릴 때마다 닻이 되어줄 평생의 든든한 버팀목",
  },
  기: {
    womanDesc: "당신의 배우자는 부드러운 둥근 얼굴에 다정하고 따뜻한 눈빛을 가진 분입니다. 기토(己土)의 섬세한 기운처럼 전체적으로 포근하고 여성스러우며, 자연스러운 미소와 복숭아빛 볼이 사랑스럽습니다.",
    womanPrompt: "soft round face, gentle warm eyes with caring expression, soft button nose, naturally full lips with sweet smile, round soft jaw, warm rosy skin, sweet gentle expression",
    womanTraits: ["다정한 눈빛", "사랑스러운 인상", "포근한 분위기"],
    womanMbti: "ENFJ",
    womanJob: "유치원 교사 또는 플로리스트",
    womanHobbies: ["베이킹", "캘리그라피", "반려동물 돌보기"],
    womanPersonality: "주변 사람들에게 활력을 불어넣는 밝고 긍정적인 성격입니다. 감정 표현이 풍부하고 솔직하며, 상대방을 기분 좋게 만드는 재주가 있습니다. 가끔 감정에 너무 치우쳐 판단력이 흐려지기도 하지만, 그 순수함이 큰 매력입니다.",
    womanLoveStyle: "사소한 것도 이벤트로 만드는 로맨틱한 연애를 합니다. 연인의 기념일을 철저히 챙기며, 작은 선물과 메시지로 매일 사랑을 표현합니다.",
    womanFirstMeet: "밝고 활기찬 장소, 친목 모임이나 소개팅 자리에서 환한 미소로 먼저 말을 걸어올 것입니다. 그 미소 하나로 오랫동안 기억에 남는 첫 만남입니다.",
    womanLifeStyle: "소소한 일상에서 행복을 찾는 사람입니다. 예쁜 카페, 계절 꽃, 직접 구운 쿠키처럼 작지만 아름다운 것들로 하루를 채웁니다.",
    womanCompatibility: "당신의 매일을 특별한 날로 만들어줄 사람",
    manDesc: "당신의 배우자는 부드럽고 친근한 인상에 온화한 눈빛을 가진 분입니다. 기토의 세심한 기운으로 배려심이 깊은 성격이 얼굴에서 느껴지며, 넉넉하고 편안한 분위기가 매력적입니다.",
    manPrompt: "gentle round face, warm caring eyes with kind expression, soft rounded nose, full gentle lips, soft jaw, warm olive skin, approachable warm expression",
    manTraits: ["온화한 눈빛", "친근한 인상", "배려 깊은 표정"],
    manMbti: "ESFP",
    manJob: "요리사 또는 여행 가이드",
    manHobbies: ["요리", "캠핑", "악기 연주"],
    manPersonality: "낙천적이고 유머가 넘치는 사람으로, 함께 있으면 항상 즐겁습니다. 순간에 충실하며 삶을 즐기는 법을 아는 사람이지만, 장기적인 계획보다 현재에 집중하는 경향이 있습니다. 진심 어린 배려로 주변 사람들을 편안하게 해줍니다.",
    manLoveStyle: "즉흥적인 데이트와 깜짝 이벤트로 연인을 설레게 합니다. 함께 맛있는 걸 먹고, 새로운 곳을 탐험하는 것으로 사랑을 표현합니다.",
    manFirstMeet: "맛있는 음식이 있는 자리나 여행지에서 자연스럽게 가까워질 가능성이 높습니다. 편안하고 유쾌한 분위기로 금방 친해지는 인연입니다.",
    manLifeStyle: "현재를 즐기는 것을 최우선으로 하며, 맛집 탐방과 여행에 아낌없이 투자합니다. 삶의 작은 즐거움을 소중히 여기는 사람입니다.",
    manCompatibility: "함께라면 어디든 여행지가 되는, 즐거움의 원천",
  },
  경: {
    womanDesc: "당신의 배우자는 각진 턱선과 선명한 이목구비를 가진 세련된 분입니다. 경금(庚金)의 날카로운 기운처럼 눈빛이 총명하고 표정이 또렷하며, 맑고 하얀 피부가 돋보입니다.",
    womanPrompt: "square defined face with prominent cheekbones, sharp intelligent single-eyelid eyes with piercing gaze, high aquiline nose, thin straight lips, strong square jaw, clear porcelain skin, cool composed expression",
    womanTraits: ["날카로운 눈빛", "선명한 이목구비", "세련된 인상"],
    womanMbti: "ESTJ",
    womanJob: "판사 또는 외과 의사",
    womanHobbies: ["테니스", "와인 테이스팅", "미술 컬렉팅"],
    womanPersonality: "기준이 명확하고 자기 관리가 철저한 완벽주의자입니다. 어떤 상황에서도 감정에 흔들리지 않는 냉정함과 결단력을 갖췄습니다. 처음에는 차가워 보이지만 신뢰를 쌓으면 누구보다 따뜻한 내면을 드러냅니다.",
    womanLoveStyle: "감정 표현은 절제되어 있지만 행동으로 깊은 사랑을 보여줍니다. 연인을 존중하고 대등한 관계를 추구하며, 약속과 신뢰를 무엇보다 중요시합니다.",
    womanFirstMeet: "전문적인 모임, 비즈니스 행사, 또는 고급 문화 공간에서 만날 가능성이 높습니다. 첫인상부터 강렬한 존재감을 남기는 만남입니다.",
    womanLifeStyle: "자기 계발과 커리어에 투자를 아끼지 않습니다. 삶의 모든 영역에서 높은 기준을 유지하며 품격 있는 일상을 만들어갑니다.",
    womanCompatibility: "당신을 더 나은 사람으로 성장시켜줄 최고의 파트너",
    manDesc: "당신의 배우자는 강하고 각진 얼굴에 카리스마 넘치는 눈빛을 가진 분입니다. 경금의 금속처럼 단단한 기운으로 첫인상부터 강한 존재감이 느껴지며, 선명한 이목구비와 강한 턱선이 인상적입니다.",
    manPrompt: "strong square face with chiseled jaw, intense sharp eyes with commanding gaze, strong aquiline nose, thin firm lips, very strong square jaw, clear fair skin, powerful authoritative expression",
    manTraits: ["카리스마", "강한 턱선", "묵직한 존재감"],
    manMbti: "ENTJ",
    manJob: "군 장교 또는 검사",
    manHobbies: ["무술", "독서", "클래식 음악"],
    manPersonality: "원칙에 따라 행동하며 흔들리지 않는 신념을 가진 사람입니다. 리더십이 강하고 책임감이 뛰어나며, 약자를 보호하려는 정의감이 있습니다. 표현이 직선적이어서 가끔 오해를 사지만 진심은 언제나 올곧습니다.",
    manLoveStyle: "연인을 지키고 보호하는 것에 강한 사명감을 느낍니다. 감언이설보다는 행동으로 증명하며, 한 번 선택한 사람에게는 끝까지 충실합니다.",
    manFirstMeet: "사회적 모임이나 운동 관련 활동에서, 또는 공통의 지인을 통해 소개받을 가능성이 높습니다. 과묵하지만 강한 첫인상을 남기는 만남입니다.",
    manLifeStyle: "규율 있는 생활과 자기 단련을 중시합니다. 사치보다는 질 좋은 것에 선별적으로 투자하는 안목 있는 소비를 합니다.",
    manCompatibility: "언제나 든든한 방패가 되어줄 진짜 어른",
  },
  신: {
    womanDesc: "당신의 배우자는 갸름한 얼굴에 맑고 영롱한 눈빛을 가진 분입니다. 신금(辛金)의 빛나는 기운처럼 피부가 매끄럽고 광채가 나며, 섬세하고 정교한 이목구비가 보석처럼 빛납니다.",
    womanPrompt: "oval defined face, clear bright eyes with refined gaze, delicate straight nose, perfectly shaped thin lips, elegant slim jaw, luminous fair skin with natural glow, refined sophisticated expression",
    womanTraits: ["맑은 눈빛", "정교한 이목구비", "광채 나는 피부"],
    womanMbti: "ISTP",
    womanJob: "패션 디자이너 또는 보석 세공사",
    womanHobbies: ["패션 스타일링", "보석 만들기", "명상"],
    womanPersonality: "섬세한 감각과 미적 안목이 뛰어난 사람입니다. 말보다 행동으로, 양보다 질을 중시하며 자신만의 독특한 취향을 가지고 있습니다. 내성적이지만 자신의 분야에서는 누구보다 뛰어난 전문성을 보입니다.",
    womanLoveStyle: "섬세하고 절제된 방식으로 사랑을 표현합니다. 과한 감정 표현보다는 깊은 이해와 배려로 연인을 대하며, 함께 있는 시간의 질을 중요시합니다.",
    womanFirstMeet: "미술관, 패션 행사, 또는 취향이 맞는 소규모 모임에서 만날 가능성이 높습니다. 볼수록 매력이 느껴지는 인연입니다.",
    womanLifeStyle: "심미적인 삶을 추구하며 아름다운 것들로 일상을 채웁니다. 소비는 적게 하지만 선택한 것은 최상의 품질을 고집합니다.",
    womanCompatibility: "당신의 삶에 보석 같은 아름다움을 더해줄 사람",
    manDesc: "당신의 배우자는 날카롭고 세련된 이목구비에 총명한 눈빛을 가진 분입니다. 신금의 정제된 기운으로 전체적으로 깔끔하고 단정하며, 절제된 매력이 있습니다.",
    manPrompt: "sharp oval face, bright intelligent eyes with clear gaze, refined straight nose, neat thin lips, defined clean jaw, fair bright skin, sophisticated sharp expression",
    manTraits: ["총명한 눈빛", "날카로운 인상", "세련된 매력"],
    manMbti: "INTP",
    manJob: "건축가 또는 IT 개발자",
    manHobbies: ["체스", "피아노", "미니멀리즘 인테리어"],
    manPersonality: "논리적이고 분석적이며, 복잡한 문제를 명쾌하게 풀어내는 능력이 있습니다. 말수가 적지만 한 마디 한 마디에 깊이가 있으며, 독창적인 시각으로 세상을 바라봅니다. 감정 표현이 서툴지만 연인에 대한 마음은 깊고 순수합니다.",
    manLoveStyle: "사랑하는 사람을 위해 몰래 공부하고 준비하는 타입입니다. 화려한 이벤트보다 상대방이 진짜 필요한 것을 파악해 조용히 해결해주는 방식으로 사랑을 표현합니다.",
    manFirstMeet: "온라인 커뮤니티나 스터디 모임, 또는 취미 관련 모임에서 만날 가능성이 높습니다. 처음에는 어딘가 어색하지만 대화할수록 점점 빠져드는 인연입니다.",
    manLifeStyle: "혼자만의 시간과 집중할 수 있는 환경을 소중히 여깁니다. 미니멀한 삶을 지향하며 불필요한 것을 과감히 덜어냅니다.",
    manCompatibility: "처음엔 수수께끼 같지만 알아갈수록 보물 같은 사람",
  },
  임: {
    womanDesc: "당신의 배우자는 넓은 이마와 부드러운 눈매를 가진 신비롭고 지적인 분입니다. 임수(壬水)의 깊은 기운처럼 눈빛이 그윽하고 표정이 잔잔하며, 차분하고 세련된 분위기를 풍깁니다.",
    womanPrompt: "wide oval face with broad forehead, deep-set mysterious eyes with thoughtful gaze, rounded soft nose, naturally full lips with subtle smile, soft jaw, cool beige skin, mysterious intellectual expression",
    womanTraits: ["그윽한 눈빛", "신비로운 분위기", "지적인 인상"],
    womanMbti: "INTJ",
    womanJob: "연구원 또는 큐레이터",
    womanHobbies: ["철학서 읽기", "수영", "천문학"],
    womanPersonality: "깊은 사유와 통찰력으로 남들이 보지 못하는 것을 보는 사람입니다. 내면이 풍부하고 독립적이며, 관계에서도 자신의 정체성을 잃지 않습니다. 쉽게 속을 드러내지 않아 신비롭게 느껴지지만, 마음을 열면 누구보다 깊고 진한 관계를 만들어냅니다.",
    womanLoveStyle: "깊은 정서적 교감과 지적인 연결을 추구하는 사랑을 합니다. 상대방의 내면에 진심으로 관심을 가지며, 시간이 지날수록 깊어지는 사랑을 원합니다.",
    womanFirstMeet: "강연, 독서 모임, 또는 깊이 있는 대화가 오가는 자리에서 인연이 시작될 것입니다. 처음 나눈 대화가 오래도록 여운을 남기는 만남입니다.",
    womanLifeStyle: "풍부한 내면을 가꾸는 것을 삶의 중심에 둡니다. 새벽 독서, 명상, 자연 속 산책처럼 정적인 활동으로 재충전합니다.",
    womanCompatibility: "당신의 세상을 더 깊고 넓게 만들어줄 지적 동반자",
    manDesc: "당신의 배우자는 넓은 이마와 깊고 사색적인 눈빛을 가진 분입니다. 임수의 유동하는 기운처럼 분위기가 차분하고 깊으며, 신비로운 매력이 있습니다.",
    manPrompt: "wide oval face with prominent forehead, deep thoughtful eyes with mysterious gaze, broad straight nose, full lips, soft rounded jaw, cool fair skin, contemplative mysterious expression",
    manTraits: ["사색적 눈빛", "신비로운 매력", "지적인 분위기"],
    manMbti: "INFJ",
    manJob: "정신과 의사 또는 다큐멘터리 감독",
    manHobbies: ["철학 공부", "재즈 감상", "심해 다이빙"],
    manPersonality: "깊은 통찰과 공감 능력을 동시에 가진 드문 사람입니다. 세상을 바꾸고 싶은 이상주의적 열망이 있으며, 진정성 있는 관계만을 추구합니다. 혼자 있는 시간이 필요하지만, 연인에게는 온 마음을 쏟는 깊은 사랑을 합니다.",
    manLoveStyle: "언어로 표현하기 어려운 감정을 행동으로, 또는 오랜 편지로 표현합니다. 연인의 성장을 응원하며 함께 더 나은 사람이 되고자 하는 관계를 원합니다.",
    manFirstMeet: "사회문제나 예술에 관심 있는 모임에서, 또는 오래된 친구의 소개로 만날 가능성이 높습니다. 처음 대화부터 왠지 오래 알아온 것 같은 묘한 연결감이 있는 만남입니다.",
    manLifeStyle: "의미 있는 일과 관계에 집중하며, 소비보다 경험에 투자합니다. 밤 늦게까지 책을 읽거나 사유하는 것을 즐깁니다.",
    manCompatibility: "당신의 내면 가장 깊은 곳을 이해해주는 유일한 사람",
  },
  계: {
    womanDesc: "당신의 배우자는 부드럽고 감성적인 눈매에 수수하지만 오래 볼수록 아름다운 분입니다. 계수(癸水)의 잔잔한 기운처럼 전체적으로 부드럽고 여성스러우며, 섬세한 감수성이 눈빛과 표정에서 느껴집니다.",
    womanPrompt: "soft oval face with gentle features, sensitive expressive eyes with pure gaze, soft small nose, naturally soft lips with innocent smile, rounded gentle jaw, cool soft skin, pure sensitive expression",
    womanTraits: ["감성적 눈빛", "순수한 인상", "오래 볼수록 아름다운"],
    womanMbti: "ISFP",
    womanJob: "일러스트레이터 또는 뮤지션",
    womanHobbies: ["수채화 그리기", "피아노", "고양이 키우기"],
    womanPersonality: "말보다 감각으로 세상을 느끼는 예술적 영혼을 가진 사람입니다. 조용하고 내성적이지만 자신이 사랑하는 것에는 온 열정을 쏟아붓습니다. 타인의 감정에 예민하게 반응하여 상처받기 쉽지만, 그 순수함이 세상에서 가장 큰 매력입니다.",
    womanLoveStyle: "좋아하는 사람 앞에서 수줍어하고 조심스럽지만, 자신만의 방식으로 섬세하게 사랑을 표현합니다. 연인이 좋아하는 것을 공부해 깜짝 선물하는 타입입니다.",
    womanFirstMeet: "조용한 갤러리나 소규모 공연장, 또는 공통 취미 모임에서 인연이 시작될 것입니다. 수줍은 첫인사가 오랫동안 마음에 남는 만남입니다.",
    womanLifeStyle: "자신만의 감성적인 공간을 만들고 그 안에서 창작하며 삶의 에너지를 얻습니다. 물질보다 감성적 경험을 더 소중히 여깁니다.",
    womanCompatibility: "당신의 삶에 시 한 편을 선물할 순수한 영혼",
    manDesc: "당신의 배우자는 부드럽고 사려 깊은 인상에 온화한 눈빛을 가진 분입니다. 계수의 섬세한 기운으로 감수성이 풍부하고 배려심이 깊으며, 차분하고 절제된 아름다움이 있습니다.",
    manPrompt: "soft oval face, gentle sensitive eyes with warm thoughtful gaze, soft refined nose, gentle lips, soft jaw, cool porcelain skin, calm introspective expression",
    manTraits: ["온화한 눈빛", "사려 깊은 인상", "섬세한 감수성"],
    manMbti: "ISFJ",
    manJob: "소아과 의사 또는 초등학교 교사",
    manHobbies: ["독서", "뜨개질", "클래식 음악 연주"],
    manPersonality: "조용하고 다정하며, 곁에 있으면 마음이 편안해지는 사람입니다. 남들보다 감수성이 풍부하고 세심하여 상대방이 말하지 않아도 필요한 것을 먼저 알아챕니다. 자기 주장보다는 배려를 앞세우는 편이어서 가끔 손해를 보기도 합니다.",
    manLoveStyle: "연인의 작은 변화도 눈치채고 조용히 챙겨주는 세심한 사랑을 합니다. 요란하지 않지만 언제나 곁에 있다는 안정감을 주는 사람입니다.",
    manFirstMeet: "친한 친구의 소개나 오래된 공동체 모임에서 자연스럽게 인연이 시작될 것입니다. 처음에는 눈에 잘 띄지 않지만 알면 알수록 소중해지는 사람입니다.",
    manLifeStyle: "잔잔하고 안정적인 일상을 즐깁니다. 혼자만의 독서 시간과 소중한 사람들과의 조용한 저녁을 균형 있게 누립니다.",
    manCompatibility: "시간이 갈수록 더 소중해지는, 평생 곁에 두고 싶은 사람",
  },
};

import type { BodySpec, CompatibilityScores, MeetTiming, Timeline } from "./types";

type PremiumData = {
  bodySpec: BodySpec;
  compatibilityScores: CompatibilityScores;
  meetTiming: MeetTiming;
  caution: string[];
  advice: string[];
  timeline: Timeline;
  nameHint: string;
  pastLife: string;
  kakaoFirstMessage: string;
  firstDate: string;
  conflictAndMakeup: string;
  favoriteThings: { food: string; music: string; movie: string; place: string };
  warnType: string;
  celebrityVibe: string;
  myCharm: string;
  chemistryType: { name: string; emoji: string; desc: string };
  monthlyChance: number[];
  readiness: { score: number; comment: string };
};

// 천간별 유료 콘텐츠 데모 데이터
const PREMIUM_DEMO: Record<string, { woman: PremiumData; man: PremiumData }> = {
  갑: {
    woman: {
      bodySpec: { height: "163~168cm", figure: "슬림하고 곧은 체형, 바른 자세가 인상적", fashion: "미니멀 오피스룩 + 클래식 원피스", vibe: "처음엔 차갑지만 알수록 따뜻한 지성미" },
      compatibilityScores: { personality: 88, values: 92, lifestyle: 79, communication: 85, finance: 90 },
      meetTiming: { ageRange: "28~32세", season: "봄 또는 겨울", situation: "업무 관련 모임 또는 지인의 소개" },
      caution: ["원칙을 고집하는 성향이 강해 의견 충돌 시 쉽게 물러서지 않습니다. 서로의 입장을 충분히 듣는 대화 습관이 중요합니다.", "감정 표현이 서툴러 가끔 무관심해 보일 수 있습니다. 말로 직접 확인하는 것이 오해를 줄입니다.", "완벽주의적 성향으로 작은 실수에도 예민하게 반응할 수 있습니다. 서로의 단점을 넉넉히 수용하는 연습이 필요합니다."],
      advice: ["지적인 관심사를 키워보세요. 책이나 강연, 전시회를 즐기는 습관이 이 인연을 가까이 불러옵니다.", "신뢰를 쌓는 꾸준한 행동이 중요합니다. 작은 약속도 반드시 지키는 습관을 들이세요.", "주변 지인들과의 네트워크를 넓혀보세요. 이 인연은 직간접적인 소개를 통해 올 가능성이 높습니다."],
      timeline: { meetAge: "29~31세", datingPeriod: "약 1~2년", marriageAge: "32~34세", children: "1~2명, 계획적으로 준비" },
      nameHint: "'지', '서', '윤' 계열의 이름일 가능성이 높습니다. 갑목의 곧고 우아한 기운이 맑은 이름과 어울립니다.",
      pastLife: "전생에 같은 서당에서 공부하던 선비와 선생의 딸이었습니다. 신분의 차이로 인해 이루지 못한 인연이 이번 생에 다시 이어지고 있습니다.",
      kakaoFirstMessage: "혹시 지난번 모임에서 잠깐 얘기 나눴던 분 맞으시죠? 그때 나눈 이야기가 계속 생각나서요 😊",
      firstDate: "오후 2시, 광화문 근처 독립서점 카페에서 시작해 북촌 골목길 산책 후 한남동 조용한 레스토랑에서 마무리하는 코스입니다. 지적이고 감성적인 분위기를 좋아하는 배우자에게 딱 맞는 하루입니다.",
      conflictAndMakeup: "주로 '계획 vs 즉흥'으로 의견이 부딪힙니다. 배우자는 꼼꼼하게 준비하는 것을 선호하는데, 상대가 갑자기 일정을 바꾸면 크게 스트레스를 받습니다. 화해는 조용히 시간을 갖고, 다음 날 아무 일 없었다는 듯 먼저 커피를 건네는 방식으로 합니다.",
      favoriteThings: { food: "깔끔한 일식·오마카세, 분위기 있는 와인 바", music: "잔잔한 재즈·클래식 피아노, 새벽 감성 팝", movie: "감성 드라마·독립영화, 다큐멘터리", place: "국립중앙도서관·소규모 전시회·경복궁 근처 카페" },
      warnType: "외모와 첫인상은 비슷하지만 감정 기복이 심하고 즉흥적인 사람은 악연입니다. 겉으로는 지적으로 보여도 깊은 대화를 싫어하는 타입은 결이 맞지 않습니다.",
      celebrityVibe: "박은빈의 지적이고 단아한 분위기에 김고은의 섬세한 눈빛이 더해진 인상입니다. 처음엔 도도해 보이지만 웃을 때 확 달라지는 반전 매력이 있습니다.",
      myCharm: "처음 봤을 때 당신의 차분하고 진지한 눈빛이 마음에 들었어요. 가볍지 않고 깊이 있어 보이는 첫인상이 계속 생각났어요. 말 한 마디도 허투루 하지 않는 것 같아서 믿음이 갔어요.",
      chemistryType: { name: "지적 소울메이트", emoji: "📚", desc: "두 사람이 함께하면 마치 오랜 친구처럼 자연스러운 대화가 끊이지 않습니다. 서로의 생각을 존중하면서도 자극을 주고받는 관계로, 시간이 갈수록 더 깊어지는 인연입니다." },
      monthlyChance: [45, 52, 78, 65, 55, 48, 42, 60, 88, 75, 62, 50],
      readiness: { score: 72, comment: "현재 자기 자신에게 집중하는 시기로 인연을 맞을 내적 준비가 70% 이상 되어 있습니다. 봄과 가을에 외부 활동을 늘리면 인연의 확률이 크게 높아집니다." },
    },
    man: {
      bodySpec: { height: "178~183cm", figure: "넓은 어깨와 균형 잡힌 체형, 단정한 체격", fashion: "비즈니스 캐주얼 + 클래식 수트", vibe: "묵직하고 신뢰감 넘치는 카리스마" },
      compatibilityScores: { personality: 85, values: 91, lifestyle: 82, communication: 78, finance: 93 },
      meetTiming: { ageRange: "29~33세", season: "가을 또는 겨울", situation: "업무 환경 또는 사회적 모임" },
      caution: ["일을 최우선시하는 성향으로 연인과의 시간이 부족해질 수 있습니다. 데이트 일정을 미리 계획하는 습관이 필요합니다.", "감정보다 논리를 앞세우는 경향이 있어 위로가 필요한 순간에 상처를 줄 수 있습니다.", "높은 기준으로 인해 연인에게 부담을 줄 수 있습니다. 완벽함보다 함께 성장하는 관계를 추구하세요."],
      advice: ["커리어와 자기계발에 꾸준히 투자하세요. 이 인연은 비슷한 목표를 가진 환경에서 만날 가능성이 높습니다.", "사교적인 모임에 적극 참여해보세요. 인연의 시작점은 지인의 소개일 가능성이 큽니다.", "당신의 진심을 표현하는 연습을 하세요. 이 배우자는 행동뿐 아니라 언어적 표현도 중요하게 생각합니다."],
      timeline: { meetAge: "30~32세", datingPeriod: "약 1~2년", marriageAge: "33~35세", children: "2명, 안정적인 계획하에" },
      nameHint: "'준', '현', '민' 계열의 이름일 가능성이 높습니다. 갑목의 강직하고 곧은 기운이 힘 있는 이름과 어울립니다.",
      pastLife: "전생에 같은 전장에서 목숨을 함께 한 무장과 의사였습니다. 짧지만 강렬한 인연이 이번 생에 더 완전한 형태로 다시 만나게 됩니다.",
      kakaoFirstMessage: "그날 말씀 나눴던 거 계속 생각이 나더라고요. 혹시 시간 되시면 커피 한 잔 어떠세요?",
      firstDate: "저녁 6시, 서울 도심의 조용한 이자카야에서 시작해 야경이 보이는 루프탑 바로 마무리하는 코스입니다. 처음엔 진중하게 대화하고 분위기가 무르익으면 자연스럽게 가까워지는 흐름이 이 배우자에게 잘 맞습니다.",
      conflictAndMakeup: "주로 '표현 방식'에서 갈등이 생깁니다. 배우자는 행동으로 사랑을 표현하는데, 상대방은 말로 확인하고 싶어하는 차이가 있습니다. 화해는 배우자가 먼저 행동으로 나서는 방식, 예를 들어 좋아하는 음식을 사 오거나 조용히 옆에 앉아 있는 것으로 마무리됩니다.",
      favoriteThings: { food: "정통 일식·스시, 고기구이 전문점", music: "감성 R&B·재즈, 조용한 인디팝", movie: "범죄 스릴러·역사 드라마, 다큐멘터리", place: "한강공원·고즈넉한 산책로·분위기 있는 바" },
      warnType: "겉으로는 믿음직해 보이지만 자기 이익을 먼저 생각하는 사람은 악연입니다. 처음엔 강인해 보여도 책임감이 없는 타입과는 오래가지 못합니다.",
      celebrityVibe: "박서준의 따뜻하고 듬직한 분위기에 공유의 지적인 눈빛이 더해진 인상입니다. 카리스마 있지만 편안한 반전 매력의 소유자입니다.",
      myCharm: "처음 봤을 때 당신의 단단하고 진실된 눈빛이 인상 깊었어요. 가볍게 웃으면서도 무게감이 느껴지는 사람이라는 게 한눈에 보였어요. 쉽게 흔들리지 않을 것 같아서 믿음이 갔어요.",
      chemistryType: { name: "든든한 한 팀", emoji: "🏆", desc: "두 사람이 함께하면 각자의 강점이 시너지를 만들어내는 환상의 팀입니다. 말없이도 서로를 이해하는 신뢰 관계로, 위기에 더 강해지는 인연입니다." },
      monthlyChance: [40, 48, 65, 58, 50, 44, 38, 55, 82, 90, 68, 52],
      readiness: { score: 68, comment: "현재 일과 목표에 집중하는 시기로 인연을 맞을 준비가 서서히 무르익고 있습니다. 가을부터 사교 활동을 늘리면 자연스러운 만남의 기회가 찾아옵니다." },
    },
  },
  무: {
    woman: {
      bodySpec: { height: "160~165cm", figure: "포근하고 여성스러운 체형, 따뜻한 인상", fashion: "내추럴 캐주얼 + 플로럴 원피스", vibe: "처음 만나는 순간부터 엄마 같은 편안함" },
      compatibilityScores: { personality: 91, values: 87, lifestyle: 93, communication: 89, finance: 82 },
      meetTiming: { ageRange: "26~30세", season: "봄 또는 여름", situation: "공통 커뮤니티 또는 친구 모임" },
      caution: ["자신보다 타인을 먼저 챙기는 성향으로 가끔 자신의 감정을 억누릅니다. 연인이 먼저 감정을 물어봐 주는 것이 중요합니다.", "변화보다 안정을 선호해 새로운 시도에 소극적일 수 있습니다. 함께 작은 도전을 즐기는 경험을 쌓아보세요.", "갈등을 피하려는 성향으로 문제를 해결하지 않고 넘어갈 수 있습니다. 솔직한 대화를 유도하는 환경을 만드세요."],
      advice: ["따뜻한 커뮤니티 활동에 참여해보세요. 봉사, 모임, 클래스 등에서 인연이 시작될 가능성이 큽니다.", "진심 어린 관심을 표현하는 연습을 하세요. 이 배우자는 화려한 이벤트보다 진정성에 감동합니다.", "안정적이고 편안한 분위기를 만드는 것을 잊지 마세요. 첫 인상에서 편안함을 주는 것이 핵심입니다."],
      timeline: { meetAge: "27~29세", datingPeriod: "약 1~3년", marriageAge: "29~32세", children: "2명, 자연스럽게" },
      nameHint: "'하', '나', '아' 계열의 부드럽고 따뜻한 이름일 가능성이 높습니다. 무토의 포근하고 넉넉한 기운이 친근한 이름과 잘 어울립니다.",
      pastLife: "전생에 같은 마을의 의원과 약초를 캐던 소녀였습니다. 서로 의지하며 살았지만 일찍 헤어진 인연으로, 이번 생에 더 오래 함께하기 위해 다시 만납니다.",
      kakaoFirstMessage: "오늘 날씨 좋더라고요~ 혹시 요즘 잘 지내고 계세요? 😊 갑자기 연락해서 놀라셨죠?",
      firstDate: "오전 11시, 서울숲 또는 망원 한강공원에서 피크닉으로 시작해 근처 감성 카페에서 디저트로 마무리하는 코스입니다. 자연스럽고 편안한 분위기에서 천천히 마음을 여는 배우자에게 꼭 맞는 하루입니다.",
      conflictAndMakeup: "주로 '내 마음을 왜 몰라줘'라는 감정적 갈등이 생깁니다. 배우자는 말하지 않아도 알아주길 바라는데, 상대가 눈치채지 못하면 서운함이 쌓입니다. 화해는 맛있는 음식을 함께 먹으며 자연스럽게 분위기가 풀리는 방식으로 이루어집니다.",
      favoriteThings: { food: "집밥 느낌의 한식·분식, 따뜻한 국밥", music: "인디팝·어쿠스틱 기타, 잔잔한 발라드", movie: "가족·힐링 드라마, 따뜻한 로맨스 영화", place: "동네 카페·시장 구경·한강 산책" },
      warnType: "겉으로는 친절해 보이지만 자기 중심적이고 배려심이 없는 사람은 악연입니다. 말만 앞서고 행동이 따르지 않는 타입과는 결국 상처만 남게 됩니다.",
      celebrityVibe: "아이유의 친근하고 따뜻한 미소에 신민아의 포근한 눈빛이 더해진 분위기입니다. 어디서든 편안함을 주는 자연스러운 매력이 있습니다.",
      myCharm: "처음 봤을 때 당신의 따뜻하고 진심 어린 미소가 마음에 들었어요. 억지로 꾸미지 않아도 자연스럽게 빛나는 것 같았어요. 곁에 있으면 왠지 마음이 편해질 것 같다고 느꼈어요.",
      chemistryType: { name: "따뜻한 봄날 같은 사이", emoji: "🌸", desc: "두 사람이 함께하면 서로의 일상이 조금 더 따뜻해지고 안온해집니다. 큰 이벤트보다 소소한 일상을 함께 쌓아가는 것이 이 인연의 가장 큰 행복입니다." },
      monthlyChance: [55, 70, 82, 75, 88, 65, 50, 58, 62, 55, 48, 60],
      readiness: { score: 80, comment: "봄·여름 기운이 강한 지금, 인연을 맞을 준비가 거의 다 되어 있습니다. 새로운 사람을 만나는 것에 열린 마음을 유지하면 곧 자연스러운 만남이 찾아옵니다." },
    },
    man: {
      bodySpec: { height: "174~179cm", figure: "든든하고 넉넉한 체형, 보기만 해도 믿음직한 인상", fashion: "단정한 캐주얼 + 클래식 아우터", vibe: "조용하지만 곁에 있으면 마음이 놓이는 사람" },
      compatibilityScores: { personality: 89, values: 85, lifestyle: 91, communication: 83, finance: 88 },
      meetTiming: { ageRange: "27~31세", season: "가을", situation: "지인 소개 또는 동네 커뮤니티" },
      caution: ["감정 표현이 적어 무관심해 보일 수 있습니다. 먼저 감정을 나누자고 제안하는 노력이 필요합니다.", "변화에 적응하는 속도가 느릴 수 있습니다. 새로운 상황에서 충분한 시간을 주는 것이 중요합니다.", "일상의 루틴을 매우 중요시해 예상치 못한 변화에 스트레스를 받을 수 있습니다."],
      advice: ["생활 속 커뮤니티에 꾸준히 참여하세요. 이 인연은 자연스럽고 반복적인 만남 속에서 시작됩니다.", "신뢰를 먼저 보여주세요. 이 배우자는 천천히 마음을 여는 타입이므로 꾸준함이 가장 중요합니다.", "여유롭고 따뜻한 분위기의 데이트 장소를 선택하세요. 조용한 카페나 공원이 좋은 시작점이 됩니다."],
      timeline: { meetAge: "28~30세", datingPeriod: "약 2~3년", marriageAge: "31~33세", children: "2명, 여유롭게 계획" },
      nameHint: "'성', '동', '우' 계열의 든든한 느낌의 이름일 가능성이 높습니다. 무토의 안정적이고 믿음직한 기운이 중후한 이름과 잘 맞습니다.",
      pastLife: "전생에 같은 동네 어귀의 대장장이와 그 집에 밥을 배달하던 소녀였습니다. 티격태격하면서도 서로를 챙기던 인연으로, 이번 생에 더 성숙한 사랑으로 다시 이어집니다.",
      kakaoFirstMessage: "요즘 바쁘시죠? 밥은 잘 드시고 있어요? 오랜만에 연락해봤어요.",
      firstDate: "저녁 6시, 동네 분위기 좋은 고기구이집에서 시작해 가볍게 맥주 한 잔 하는 소박하지만 알찬 코스입니다. 화려하지 않아도 편안하게 서로를 알아가는 시간이 이 배우자에게 가장 좋은 첫 만남입니다.",
      conflictAndMakeup: "주로 '변화 vs 안정' 문제로 갈등이 생깁니다. 배우자는 익숙한 것을 선호하는데 상대가 새로운 시도를 강요하면 부담을 느낍니다. 화해는 시간이 지나면 자연스럽게 해결되는 편이며, 맛있는 음식 앞에서 언제 그랬냐는 듯 풀립니다.",
      favoriteThings: { food: "든든한 한식·삼겹살, 뜨끈한 찌개 맛집", music: "편안한 발라드·7080 레트로, 잔잔한 포크", movie: "감동 실화·가족 드라마, 한국형 액션", place: "동네 단골 식당·공원 벤치·조용한 술집" },
      warnType: "겉으로는 안정적으로 보이지만 의존성이 강하고 주도성이 없는 사람은 악연입니다. 처음엔 편해 보여도 결정적인 순간에 책임을 회피하는 타입과는 지치게 됩니다.",
      celebrityVibe: "조인성의 따뜻하고 믿음직한 분위기에 손석구의 깊고 진한 눈빛이 더해진 인상입니다. 말수는 적어도 행동 하나하나에 진심이 담겨 있는 사람입니다.",
      myCharm: "처음 봤을 때 당신의 여유롭고 든든한 분위기에 마음이 놓였어요. 무언가 기대고 싶은 느낌이랄까요. 조용하지만 주변을 세심하게 살피는 것 같아서 인상 깊었어요.",
      chemistryType: { name: "평생 단짝 같은 사이", emoji: "🤝", desc: "두 사람이 함께하면 오랜 친구처럼 자연스럽고 편안합니다. 극적인 설렘보다는 깊고 진한 신뢰가 쌓이는 관계로, 나이 들수록 더 빛나는 인연입니다." },
      monthlyChance: [48, 55, 62, 68, 72, 60, 52, 58, 85, 78, 65, 55],
      readiness: { score: 65, comment: "지금은 자신의 기반을 다지는 시기로 인연을 맞을 준비가 서서히 되어가고 있습니다. 가을부터 주변 지인들과의 교류를 늘리면 자연스러운 소개팅 기회가 생깁니다." },
    },
  },
};

// 기본 프리미엄 데이터 (천간별 개별 데이터 없을 경우 fallback)
function getDefaultPremium(isWoman: boolean) {
  const base = PREMIUM_DEMO["무"];
  return isWoman ? base.woman : base.man;
}

// 천간별 추가 신규 필드 (갑/무 외 나머지 fallback 데이터)
const EXTRA_DEMO: Record<string, {
  woman: Pick<PremiumData, "nameHint"|"pastLife"|"kakaoFirstMessage"|"firstDate"|"conflictAndMakeup"|"favoriteThings"|"warnType"|"celebrityVibe"|"myCharm"|"chemistryType"|"monthlyChance"|"readiness">;
  man:   Pick<PremiumData, "nameHint"|"pastLife"|"kakaoFirstMessage"|"firstDate"|"conflictAndMakeup"|"favoriteThings"|"warnType"|"celebrityVibe"|"myCharm"|"chemistryType"|"monthlyChance"|"readiness">;
}> = {
  을: {
    woman: {
      nameHint: "'수', '유', '은' 계열의 부드럽고 우아한 이름일 가능성이 높습니다.",
      pastLife: "전생에 함께 꽃밭을 가꾸던 정원사 남매였습니다. 서로를 아끼던 마음이 이번 생에 깊은 인연으로 이어집니다.",
      kakaoFirstMessage: "안녕하세요~ 혹시 저 기억하세요? 오늘 날씨가 봄 같아서 갑자기 생각났어요 🌸",
      firstDate: "오후 1시, 성수동 감성 카페에서 시작해 뚝섬 한강공원 산책으로 이어지는 봄날 같은 코스입니다.",
      conflictAndMakeup: "감정을 솔직하게 표현하지 못해 서운함이 쌓이는 패턴이 있습니다. 화해는 따뜻한 음식을 함께 먹으며 자연스럽게 이루어집니다.",
      favoriteThings: { food: "예쁜 브런치 카페·파스타", music: "인디팝·어쿠스틱 커버", movie: "감성 로맨스·힐링 드라마", place: "꽃시장·작은 전시회·강변 카페" },
      warnType: "겉으로는 부드러워 보이지만 감정 조절이 안 되는 사람은 악연입니다. 표면적으로 비슷해 보여도 내면의 결이 다른 타입과는 오래 가지 못합니다.",
      celebrityVibe: "수지의 청순하고 우아한 분위기에 한가인의 섬세한 눈빛이 더해진 인상입니다.",
      myCharm: "처음 봤을 때 당신의 부드럽고 따뜻한 눈빛이 마음에 들었어요. 억지로 꾸미지 않은 자연스러움이 오히려 더 아름다웠어요.",
      chemistryType: { name: "봄비 같은 설렘", emoji: "🌧️", desc: "두 사람이 함께하면 잔잔하지만 촉촉하게 서로를 채워주는 관계입니다. 처음엔 수줍지만 시간이 지날수록 깊어지는 인연입니다." },
      monthlyChance: [50, 65, 88, 72, 60, 55, 48, 58, 70, 62, 55, 50],
      readiness: { score: 75, comment: "봄 기운이 강한 지금, 인연을 맞을 준비가 잘 되어 있습니다. 자연스러운 모임과 일상적인 만남에서 인연이 시작될 것입니다." },
    },
    man: {
      nameHint: "'진', '우', '태' 계열의 부드러우면서 강인한 이름일 가능성이 높습니다.",
      pastLife: "전생에 함께 여행하던 나그네와 여관 주인이었습니다. 짧은 만남이었지만 서로에게 깊은 인상을 남긴 인연입니다.",
      kakaoFirstMessage: "안녕하세요, 혹시 바쁘시지 않으면 잠깐 얘기 나눌 수 있을까요? 최근에 생각이 나서요.",
      firstDate: "저녁 6시, 이태원 분위기 있는 레스토랑에서 저녁 식사 후 가볍게 칵테일 바로 이어지는 세련된 코스입니다.",
      conflictAndMakeup: "결정을 미루는 습관 때문에 갈등이 생기기도 합니다. 화해는 상대방이 먼저 다가오면 금방 마음을 여는 방식입니다.",
      favoriteThings: { food: "이탈리안·스테이크 레스토랑", music: "감성 재즈·뉴에이지", movie: "로맨스 멜로·예술영화", place: "갤러리·루프탑 바·한강뷰 카페" },
      warnType: "처음엔 매력적이지만 이중적인 면모를 가진 사람은 악연입니다. 말과 행동이 다른 타입과는 결국 신뢰가 무너집니다.",
      celebrityVibe: "정해인의 부드럽고 섬세한 분위기에 박보검의 따뜻한 미소가 더해진 인상입니다.",
      myCharm: "처음 봤을 때 당신의 자연스럽고 편안한 분위기에 마음이 열렸어요. 뭔가 오래전부터 알던 사람 같은 느낌이 들었어요.",
      chemistryType: { name: "잔잔한 강물 같은 사이", emoji: "🌊", desc: "두 사람이 함께하면 조용하지만 깊고 오래가는 관계입니다. 눈에 띄진 않아도 늘 곁에 있어주는 믿음직한 인연입니다." },
      monthlyChance: [45, 60, 75, 80, 68, 55, 50, 60, 72, 65, 55, 48],
      readiness: { score: 70, comment: "봄·여름에 걸쳐 인연을 맞을 준비가 되어 있습니다. 주변 사람들과 자연스럽게 어울리는 것이 인연의 출발점이 됩니다." },
    },
  },
};

function getExtraDemo(dayGan: string, isWoman: boolean) {
  const entry = EXTRA_DEMO[dayGan] ?? EXTRA_DEMO["을"];
  return isWoman ? entry.woman : entry.man;
}

function getDemoData(dayGan: string, isWoman: boolean) {
  const data = OHAENG_DEMO[dayGan] ?? OHAENG_DEMO["무"];
  const t = TITLES[dayGan] ?? TITLES["무"];
  const premiumEntry = PREMIUM_DEMO[dayGan] ?? null;
  // 갑/무는 직접 데이터, 나머지는 을 또는 무 fallback (새 필드 포함)
  const premiumData = premiumEntry
    ? (isWoman ? premiumEntry.woman : premiumEntry.man)
    : getDefaultPremium(isWoman);
  const extraData = getExtraDemo(dayGan, isWoman);

  const base = isWoman ? {
    description: data.womanDesc, imagePrompt: data.womanPrompt,
    characteristics: data.womanTraits, mbti: data.womanMbti,
    job: data.womanJob, hobbies: data.womanHobbies,
    personality: data.womanPersonality, loveStyle: data.womanLoveStyle,
    firstMeet: data.womanFirstMeet, lifeStyle: data.womanLifeStyle,
    compatibility: data.womanCompatibility,
    descTitle: t.woman.desc, personalityTitle: t.woman.personality,
    loveStyleTitle: t.woman.love, lifeStyleTitle: t.woman.life,
    firstMeetTitle: t.woman.meet,
  } : {
    description: data.manDesc, imagePrompt: data.manPrompt,
    characteristics: data.manTraits, mbti: data.manMbti,
    job: data.manJob, hobbies: data.manHobbies,
    personality: data.manPersonality, loveStyle: data.manLoveStyle,
    firstMeet: data.manFirstMeet, lifeStyle: data.manLifeStyle,
    compatibility: data.manCompatibility,
    descTitle: t.man.desc, personalityTitle: t.man.personality,
    loveStyleTitle: t.man.love, lifeStyleTitle: t.man.life,
    firstMeetTitle: t.man.meet,
  };

  // premiumData가 새 필드를 포함하지 않는 경우(이전 천간) extraData로 보완
  return { ...base, ...extraData, ...premiumData };
}

export function getDemoAnalysis(gender: "male" | "female", sajuInfo: SajuInfo): SajuAnalysis {
  const dayGan = sajuInfo.dayPillar.charAt(0);
  const isWoman = gender === "male";
  const data = getDemoData(dayGan, isWoman);
  return { ...data, sajuInfo };
}

export function getDemoImageUrl(gender: "male" | "female", sajuInfo: SajuInfo): string {
  const seed = `${sajuInfo.yearPillar}${sajuInfo.dayPillar}${gender}`;
  const hash = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const id = hash % 70;
  const category = gender === "male" ? "women" : "men";
  return `https://randomuser.me/api/portraits/${category}/${id}.jpg`;
}

export function isKeyPlaceholder(key: string | undefined): boolean {
  return !key || key.startsWith("your_") || key.length < 20;
}
