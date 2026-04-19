"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SajuInputForm from "@/components/SajuInputForm";
import LoadingScreen from "@/components/LoadingScreen";
import type { SajuInput, GenerateResult, ProductType, SajuAnalysis, GuardianAnalysis, EnemyAnalysis } from "@/lib/types";
import { getSajuSeed } from "@/lib/prompts";

// ── API 실패 시 모의 분석 데이터 생성 ─────────────────────────

function makeSeed(name: string, year: number): number {
  let s = year;
  for (let i = 0; i < name.length; i++) s = (s * 31 + name.charCodeAt(i)) & 0xffffffff;
  return Math.abs(s);
}

function buildMockSpouseAnalysis(name: string, birthYear: number, gender: "male" | "female"): SajuAnalysis {
  const seed = makeSeed(name, birthYear);
  const pillars = ["갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유"];
  const yp = pillars[seed % 10];
  const mp = pillars[(seed + 3) % 10];
  const dp = pillars[(seed + 7) % 10];
  const hp = pillars[(seed + 5) % 10];
  const spouseAdj = gender === "male" ? ["따뜻하고 지적인", "활발하고 감성적인", "차분하고 우아한", "유머러스하고 세심한"] : ["듬직하고 자상한", "지적이고 유머러스한", "열정적이고 배려심 있는", "차분하고 책임감 있는"];
  const adj = spouseAdj[seed % spouseAdj.length];
  const jobs = ["의료·교육 계열", "IT·디자인 계열", "금융·경영 계열", "예술·문화 계열", "서비스·마케팅 계열"];
  const mbtis = ["ENFJ", "INFP", "ENFP", "ISFJ", "ENTJ", "INTJ", "ESFP", "INFJ"];
  const heights = gender === "male" ? ["175~180cm", "170~175cm", "180~185cm"] : ["160~165cm", "163~168cm", "158~163cm"];
  const meetAge = 26 + (seed % 7);
  return {
    sajuInfo: { yearPillar: yp, monthPillar: mp, dayPillar: dp, hourPillar: hp },
    imagePrompt: `Portrait of a ${adj} ${gender === "male" ? "woman" : "man"}, warm smile, photorealistic, studio lighting`,
    description: `${name}님의 운명적 배우자는 ${adj} 인상을 가진 분입니다. 첫 만남부터 묘하게 편안한 느낌이 드는 타입으로, 눈빛이 맑고 진심 어린 미소가 특징입니다. 주변 사람들에게 신뢰받는 성격으로 어디서든 존재감이 빛납니다.`,
    characteristics: [`${adj} 성품`, "깊은 공감 능력", "신뢰할 수 있는 의리"],
    mbti: mbtis[seed % mbtis.length],
    job: jobs[seed % jobs.length],
    hobbies: ["독서와 카페 탐방", "요리와 홈카페", "여행과 사진"],
    compatibility: "운명적 인연 — 처음 만난 순간부터 느껴지는 특별한 끌림",
    bodySpec: { height: heights[seed % heights.length], figure: "균형 잡힌 체형", fashion: "세련되고 단정한 스타일", vibe: `${adj} 분위기` },
    personality: `배우자는 진심과 성실함을 가장 중요하게 생각합니다. 겉으로는 차분해 보이지만 가까워지면 유머와 따뜻함이 넘칩니다. 책임감이 강하고 한 번 맺은 인연을 소중히 여기는 타입입니다.`,
    loveStyle: `상대방을 배려하는 작은 행동으로 사랑을 표현합니다. 갑작스러운 이벤트보다는 일상 속 따뜻한 말 한마디와 함께하는 시간으로 마음을 전합니다.`,
    firstMeet: `${name}님과의 첫 만남은 지인 소개나 모임에서 이루어질 가능성이 높습니다. 처음엔 특별한 인상보다 자연스럽게 대화가 이어지는 편안한 만남이 될 것입니다.`,
    lifeStyle: `규칙적인 생활을 즐기며 작은 것에서 행복을 찾는 스타일입니다. 집에서 요리하거나 가까운 공원을 산책하는 소소한 일상을 소중히 여깁니다.`,
    compatibilityScores: { personality: 78 + (seed % 18), values: 82 + (seed % 15), lifestyle: 75 + (seed % 20), communication: 80 + (seed % 17), finance: 73 + (seed % 22) },
    meetTiming: { ageRange: `${meetAge}~${meetAge + 3}세`, season: ["봄", "가을", "여름", "겨울"][seed % 4], situation: ["지인 소개", "직장·업무 환경", "취미 모임", "우연한 만남"][seed % 4] },
    caution: ["너무 완벽한 조건만 찾다가 인연을 놓치지 않도록 하세요.", "감정 표현을 조금 더 솔직하게 하면 관계가 깊어집니다.", "첫인상만으로 판단하지 말고 시간을 두고 알아가세요."],
    advice: ["자신이 즐기는 취미 활동에 적극 참여해보세요.", "주변 지인들과의 교류를 늘려보세요.", "있는 그대로의 모습을 보여주는 용기를 가져보세요."],
    timeline: { meetAge: `${meetAge}세 전후`, datingPeriod: "약 1~2년", marriageAge: `${meetAge + 2}~${meetAge + 4}세`, children: "1~2명" },
    nameHint: "이름에 水 또는 木 기운이 담긴 글자가 포함될 가능성이 높습니다.",
    pastLife: `전생에 ${name}님과 배우자는 같은 마을에서 서로를 그리워하며 살았습니다. 이번 생에서는 반드시 만나 함께하라는 하늘의 뜻이 담겨 있습니다.`,
    kakaoFirstMessage: "안녕하세요 😊 오늘 만남이 너무 즐거웠어요. 다음에 또 볼 수 있을까요?",
    firstDate: "조용한 카페에서 여유롭게 대화를 나누며 시작해, 가볍게 산책하는 코스가 잘 어울립니다.",
    conflictAndMakeup: "의견 충돌 시 서로 감정이 식을 때까지 기다렸다가 대화로 풀어가는 스타일입니다. 먼저 연락하는 쪽이 항상 이기는 편입니다.",
    myCharm: `${name}님의 진심 어린 모습과 배려하는 성품이 배우자의 마음을 움직입니다. 꾸미지 않은 자연스러운 모습이 오히려 더 매력적으로 보입니다.`,
    warnType: "겉으로는 완벽해 보이지만 이중적인 면이 있는 사람을 조심하세요. 처음부터 너무 잘해주는 상대는 한 번 더 살펴볼 필요가 있습니다.",
    celebrityVibe: "전체적인 분위기가 따뜻하고 지적인 국내 배우 스타일과 닮아 있습니다.",
    favoriteThings: { food: "집밥과 따뜻한 국물 요리", music: "잔잔한 인디·어쿠스틱", movie: "드라마·로맨스 장르", place: "조용한 카페와 공원" },
    chemistryType: { name: "운명적 소울메이트", emoji: "✨", desc: "처음 만난 순간부터 오래 알던 사람 같은 편안함. 함께 있으면 시간이 빠르게 흐르는 신기한 인연입니다." },
    monthlyChance: [65, 70, 80, 75, 60, 85, 90, 72, 68, 78, 83, 71],
    readiness: { score: 72 + (seed % 20), comment: `${name}님은 좋은 인연을 맞이할 준비가 되어가고 있습니다. 자신을 더 사랑하고 일상을 즐기다 보면 자연스럽게 만남이 찾아올 것입니다.` },
    loveLanguage: { primary: "함께하는 시간", secondary: "인정하는 말", desc: "배우자는 곁에 있어주는 것만으로도 사랑을 느끼는 타입입니다. 작은 칭찬 한마디에 크게 감동받습니다." },
    partnerPsychology: "진심 어린 사람에게 마음을 엽니다. 억지로 잘 보이려는 것보다 있는 그대로의 모습을 보여줄 때 더 빠르게 가까워집니다.",
    actionGuide: ["이번 달 안에 새로운 모임에 한 번 참석해보세요.", "평소 관심 있던 취미 클래스에 등록해보세요.", "오래된 지인에게 먼저 연락을 취해보세요."],
  };
}

function buildMockGuardianAnalysis(name: string, birthYear: number): GuardianAnalysis {
  const seed = makeSeed(name, birthYear);
  const pillars = ["갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유"];
  const gTypes = [{ type: "사업 귀인", emoji: "💼" }, { type: "금전 귀인", emoji: "💰" }, { type: "인생 멘토형", emoji: "🌟" }, { type: "학업 귀인", emoji: "📚" }];
  const gt = gTypes[seed % gTypes.length];
  const meetAge = 28 + (seed % 8);
  return {
    sajuInfo: { yearPillar: pillars[seed % 10], monthPillar: pillars[(seed+3)%10], dayPillar: pillars[(seed+7)%10], hourPillar: pillars[(seed+5)%10] },
    imagePrompt: `Portrait of a wise trustworthy mentor, kind authoritative face, photorealistic, studio lighting`,
    guardianType: gt.type,
    guardianTypeEmoji: gt.emoji,
    relationship: ["직장 상사형", "우연한 만남형", "소개를 통한 만남형", "오랜 지인형"][seed % 4],
    description: `${name}님의 귀인은 첫인상부터 신뢰감과 여유가 느껴지는 분입니다. 말에 무게가 있고 눈빛이 깊어 자연스럽게 존경심이 생깁니다. 주변 사람들에게 두루 인정받는 리더형 인물입니다.`,
    characteristics: ["깊은 통찰력", "신뢰감 있는 인상", "따뜻한 배려심"],
    luckAreas: [
      { area: "커리어", desc: "경력 발전의 결정적인 기회를 열어주실 분입니다.", score: 85 + (seed % 12) },
      { area: "재정", desc: "중요한 금전적 기회를 연결해 주십니다.", score: 78 + (seed % 15) },
      { area: "인맥", desc: "핵심적인 사람들과의 연결고리가 되어주십니다.", score: 72 + (seed % 18) },
    ],
    howToMeet: `귀인은 업무 관련 행사나 세미나에서 자연스럽게 만나게 됩니다. 평소 자신의 분야에서 성실히 노력하는 모습을 보이면 먼저 관심을 가져주실 것입니다.`,
    meetTiming: { ageRange: `${meetAge}~${meetAge+4}세`, season: ["봄", "가을", "여름", "겨울"][seed % 4], situation: "업무 관련 모임이나 행사" },
    myStrength: `${name}님의 성실함과 진심 어린 태도가 귀인의 눈에 띄는 핵심 매력입니다. 묵묵히 노력하는 모습이 귀인의 마음을 움직입니다.`,
    benefit: "새로운 기회의 문을 열어주고 중요한 결정의 순간에 든든한 지원군이 되어주십니다.",
    signToRecognize: "처음 만났을 때 묘하게 편안하고 조언이 현실적으로 와닿는 분이라면 귀인의 신호입니다.",
    kakaoFirstMessage: "안녕하세요, 오늘 정말 인상 깊었어요. 다음에 한번 더 이야기 나눌 수 있을까요? ☺️",
    pastLifeConnection: `전생에 ${name}님과 귀인은 스승과 제자 사이였습니다. 그 깊은 신뢰의 인연이 이번 생에도 이어져 중요한 순간에 다시 만나게 됩니다.`,
    caution: ["귀인의 조언을 귀 기울여 듣되 너무 의존하지 않도록 하세요.", "감사한 마음을 작은 행동으로 표현하세요.", "일방적 혜택이 아닌 상호 존중으로 관계를 유지하세요."],
    actionGuide: ["자신의 분야에서 꾸준히 실력을 쌓고 기록해두세요.", "새로운 모임과 네트워킹 자리에 적극 참여해보세요.", "평소 감사한 마음을 구체적인 행동으로 표현하는 습관을 들이세요."],
    monthlyLuck: [68, 72, 85, 78, 65, 90, 88, 74, 70, 80, 86, 75],
    readiness: { score: 68 + (seed % 25), comment: `${name}님은 귀인을 맞이할 준비가 되어가고 있습니다. 내면의 성장과 자신감을 키워나가면 귀인과의 만남이 더 빨리 찾아올 것입니다.` },
  };
}

function buildMockEnemyAnalysis(name: string, birthYear: number): EnemyAnalysis {
  const seed = makeSeed(name, birthYear);
  const pillars = ["갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유"];
  const eTypes = [{ type: "질투형 악연", emoji: "😤" }, { type: "배신형 악연", emoji: "🗡️" }, { type: "에너지 흡혈형", emoji: "🧛" }, { type: "사기형 악연", emoji: "🎭" }];
  const et = eTypes[seed % eTypes.length];
  const meetAge = 26 + (seed % 8);
  return {
    sajuInfo: { yearPillar: pillars[seed % 10], monthPillar: pillars[(seed+3)%10], dayPillar: pillars[(seed+7)%10], hourPillar: pillars[(seed+5)%10] },
    imagePrompt: `Portrait of a deceptive charming person, cold calculating eyes, superficially friendly smile, photorealistic`,
    enemyType: et.type,
    enemyTypeEmoji: et.emoji,
    relationship: ["직장 동료형", "가까운 지인형", "업무 파트너형", "우연한 만남형"][seed % 4],
    description: `${name}님의 웬수는 처음엔 매력적이고 친근해 보입니다. 붙임성이 좋고 말이 많아 쉽게 가까워지지만 시간이 지날수록 본색이 드러납니다. 겉으로는 친절하지만 속으로는 자신의 이익을 먼저 챙기는 유형입니다.`,
    characteristics: ["겉과 속이 다른 이중성", "자기 이익 최우선", "처음엔 매력적"],
    dangerAreas: [
      { area: "감정 에너지", desc: "정신적 에너지를 심각하게 소진시킵니다.", score: 72 + (seed % 22) },
      { area: "재정", desc: "금전적 손실을 입힐 가능성이 있습니다.", score: 65 + (seed % 25) },
      { area: "인간관계", desc: "주변 사람들과의 관계를 이간질합니다.", score: 68 + (seed % 20) },
    ],
    howToAvoid: `웬수는 주로 직장이나 일상적인 모임에서 나타납니다. 처음 만났을 때 과하게 친절하거나 빠르게 친해지려는 사람은 한 번 더 살펴보세요.`,
    meetTiming: { ageRange: `${meetAge}~${meetAge+4}세`, season: ["여름", "겨울", "봄", "가을"][seed % 4], situation: "직장이나 업무 환경" },
    myWeakness: `${name}님의 따뜻한 배려심이 웬수에게 빌미를 줄 수 있습니다. 호의를 베풀고 싶은 마음이 앞서면 상대의 의도를 파악하지 못하는 경우가 생깁니다.`,
    damage: "시간과 에너지를 빼앗고 중요한 기회를 놓치게 만듭니다. 심리적 상처와 함께 주변 인간관계까지 흔들 수 있습니다.",
    signToRecognize: "대화할수록 에너지가 빠지는 느낌이 든다면 그것이 신호입니다. 내 성공을 진심으로 기뻐하지 않는 모습도 주의해야 할 징표입니다.",
    kakaoFirstMessage: "안녕하세요~ 저 기억하세요? 오래됐는데 연락 한번 해보고 싶었어요ㅎㅎ",
    pastLifeConnection: `전생에 ${name}님과 웬수는 경쟁 관계였습니다. 그 업보가 이번 생까지 이어지고 있지만, 현명하게 대처한다면 끊어낼 수 있습니다.`,
    caution: ["첫인상이 너무 좋은 사람은 한 번 더 살펴보세요.", "개인적인 약점이나 비밀을 쉽게 공유하지 마세요.", "금전 거래는 반드시 문서로 남기세요."],
    actionGuide: ["새로운 만남에서는 3개월 이상 지켜본 후 신뢰를 결정하세요.", "에너지가 빠지는 관계는 과감히 거리두기를 실천하세요.", "직감을 믿으세요. 불편함이 느껴지면 그 신호를 무시하지 마세요."],
    monthlyDanger: [55, 68, 45, 72, 80, 52, 65, 75, 42, 60, 70, 58],
    readiness: { score: 60 + (seed % 30), comment: `${name}님은 악연을 알아보는 감각을 조금 더 키울 필요가 있습니다. 자신을 먼저 사랑하고 경계를 명확히 하는 연습을 하면 웬수로부터 자신을 지킬 수 있습니다.` },
  };
}

const PRODUCT_META = {
  spouse:  { emoji: "💑", name: "내님은누구",   sub: "운명의 배우자 분석",  color: "from-rose-500 to-pink-600" },
  guardian:{ emoji: "🌟", name: "내귀인은누구", sub: "인생 귀인 분석",      color: "from-amber-400 to-yellow-500" },
  enemy:   { emoji: "😤", name: "내웬수는누구", sub: "악연·조심 인물 분석", color: "from-slate-500 to-slate-600" },
  bundle:  { emoji: "🔮", name: "3개 묶음",      sub: "배우자+귀인+웬수 분석", color: "from-purple-500 to-violet-600" },
};

export default function InputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [productType, setProductType] = useState<ProductType>("spouse");

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedProduct") as ProductType | null;
    if (stored === "spouse" || stored === "guardian" || stored === "enemy") {
      setProductType(stored);
    } else {
      setProductType("spouse");
    }
  }, []);

  const isGuardian = productType === "guardian";
  const isEnemy = productType === "enemy";
  const meta = PRODUCT_META[productType];

  async function handleSubmit(data: SajuInput) {
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      // ── 1. API 호출 (실패 시 모의 데이터 폴백) ──
      let analysis;
      let usedMock = false;
      try {
        const apiPath = isGuardian ? "/api/analyze-guardian" : isEnemy ? "/api/analyze-enemy" : "/api/analyze-saju";
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 25000); // 25초 타임아웃
        const analysisRes = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, productType }),
          signal: ctrl.signal,
        });
        clearTimeout(timeout);
        if (analysisRes.ok) {
          analysis = await analysisRes.json();
        } else {
          throw new Error("api_fail");
        }
      } catch {
        usedMock = true;
        if (isGuardian) {
          analysis = buildMockGuardianAnalysis(data.name, data.birthYear);
        } else if (isEnemy) {
          analysis = buildMockEnemyAnalysis(data.name, data.birthYear);
        } else {
          analysis = buildMockSpouseAnalysis(data.name, data.birthYear, data.gender);
        }
      }

      setLoadingStep(1);
      await new Promise((r) => setTimeout(r, 800));
      setLoadingStep(2);
      await new Promise((r) => setTimeout(r, 600));

      // ── 2. 이미지 URL 생성 ──
      const sajuInfo = analysis.sajuInfo ?? {
        yearPillar: "갑자", monthPillar: "병인", dayPillar: "무오", hourPillar: "경신",
      };
      let imageUrl: string;
      if (isGuardian) {
        const g = data.gender === "male" ? "man" : "woman";
        const seed = getSajuSeed(sajuInfo, g);
        const prompt = analysis.imagePrompt ?? `wise trustworthy ${g}, photorealistic portrait`;
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&model=flux&seed=${seed}&nologo=true&enhance=false`;
      } else if (isEnemy) {
        const g = data.gender === "male" ? "woman" : "man";
        const seed = getSajuSeed(sajuInfo, g) + 9999;
        const prompt = analysis.imagePrompt ?? `charming deceptive ${g}, photorealistic portrait`;
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&model=flux&seed=${seed}&nologo=true&enhance=false`;
      } else {
        const g = data.gender === "male" ? "woman" : "man";
        const seed = getSajuSeed(sajuInfo, g);
        const prompt = analysis.imagePrompt ?? `beautiful ${g}, warm smile, photorealistic portrait`;
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&model=flux&seed=${seed}&nologo=true&enhance=false`;
      }

      // ── 3. 결과 저장 ──
      const result: GenerateResult = {
        name: data.name,
        analysis,
        imageUrl,
        gender: data.gender,
        demo: usedMock,
        paid: true, // TODO: TossPayments 승인 후 삭제
        productType,
      };
      const json = JSON.stringify(result);
      try { sessionStorage.setItem("sajuResult", json); } catch { /* private mode */ }
      try { localStorage.setItem("sajuResult_backup", json); } catch { /* storage full */ }

      router.push("/result");
    } catch (err) {
      console.error("handleSubmit error:", err);
      setError("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
      setLoadingStep(0);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-[#13131a] border border-white/10 rounded-3xl shadow-sm p-6">
            <LoadingScreen step={loadingStep} productType={productType} />
          </div>
        ) : (
          <>
            {/* 헤더 카드 */}
            <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl shadow-lg`}>
                  {meta.emoji}
                </div>
                <div>
                  <p className="font-black text-white text-sm">{meta.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{meta.sub}</p>
                </div>
              </div>
            </div>

            {/* 상품 전환 탭 */}
            <div className="bg-[#13131a] border border-white/10 rounded-2xl p-2 mb-4 flex gap-1.5">
              {(Object.entries(PRODUCT_META) as [ProductType, typeof PRODUCT_META[keyof typeof PRODUCT_META]][]).map(([id, m]) => (
                <button
                  key={id}
                  onClick={() => {
                    setProductType(id);
                    sessionStorage.setItem("selectedProduct", id);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    productType === id
                      ? `bg-gradient-to-r ${m.color} text-white shadow-md`
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {m.emoji} {id === "spouse" ? "내님" : id === "guardian" ? "내귀인" : "내웬수"}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5">
              <SajuInputForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-600 mt-4">
          🔒 입력 정보는 저장되지 않습니다
        </p>
      </div>
    </div>
  );
}
