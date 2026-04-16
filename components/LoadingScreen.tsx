"use client";

import { useState, useEffect } from "react";

const SPOUSE_STEPS = [
  { icon: "📐", text: "사주팔자 산출 중 (년·월·일·시주)" },
  { icon: "⚖️", text: "오행 분석 및 관성·재성 파악" },
  { icon: "🔮", text: "AI 배우자 기운 분석" },
  { icon: "🎨", text: "AI 몽타주 생성 중" },
];
const GUARDIAN_STEPS = [
  { icon: "📐", text: "사주팔자 산출 중 (년·월·일·시주)" },
  { icon: "⚖️", text: "오행 분석 및 인성·식상 파악" },
  { icon: "🌟", text: "AI 귀인 기운 분석" },
  { icon: "🎨", text: "AI 귀인 초상화 생성 중" },
];
const ENEMY_STEPS = [
  { icon: "📐", text: "사주팔자 산출 중 (년·월·일·시주)" },
  { icon: "⚖️", text: "오행 분석 및 충·형·파 파악" },
  { icon: "😤", text: "AI 악연 기운 분석" },
  { icon: "🎨", text: "AI 웬수 초상화 생성 중" },
];

const SAJU_FACTS: Record<"spouse" | "guardian" | "enemy", string[]> = {
  spouse: [
    "사주 8글자 중 일지(日支) 하나가 '배우자 자리'입니다",
    "여자의 관성(官星), 남자의 재성(財星)이 배우자 기운을 나타냅니다",
    "갑목(甲木) 일간의 배우자는 기토(己土) 기운이 인연입니다",
    "일주에 합(合)이 있으면 배우자와의 인연이 특별히 깊습니다",
    "사주 오행 중 용신(用神)이 배우자에게도 나타나면 천생연분입니다",
    "水기운이 강한 배우자는 지혜롭고 감성이 풍부합니다",
    "木기운의 배우자는 성장과 창의성을 상징합니다",
    "火기운이 강한 상대는 열정적이고 카리스마가 있습니다",
    "관성 대운(大運)이 오는 시기에 배우자 인연이 찾아옵니다",
    "일지와 월지의 합(合)은 빠른 결혼 인연을 암시합니다",
  ],
  guardian: [
    "인성(印星)이 강한 사주는 멘토형 귀인을 만날 가능성이 높습니다",
    "귀인은 대부분 용신(用神) 오행을 가진 사람으로 나타납니다",
    "재성 대운에 귀인을 만나면 금전적 도움을 받을 수 있습니다",
    "편관(偏官)이 길신(吉神)이면 강한 후원자를 만나게 됩니다",
    "사주에 천을귀인(天乙貴人)이 있으면 주변에 귀인이 많습니다",
    "정인(正印)이 강한 사람은 학문·교육 분야 귀인을 만납니다",
    "귀인은 처음 만남에서 자연스럽게 편안함을 주는 사람입니다",
    "사주 일주가 강한 사람은 귀인을 스스로 찾아가는 타입입니다",
    "월지(月支)에 귀인이 있으면 직장 환경에서 귀인이 나타납니다",
    "귀인의 기운은 상생(相生) 오행으로 연결된 사람에게서 옵니다",
  ],
  enemy: [
    "사주에서 충(沖)·형(刑)·파(破)·해(害)가 악연을 나타냅니다",
    "기신(忌神) 오행을 가진 사람이 에너지를 빼앗는 악연이 됩니다",
    "웬수는 처음엔 매력적으로 다가오는 것이 특징입니다",
    "일주를 극(剋)하는 오행의 사람과는 갈등이 생기기 쉽습니다",
    "사주에서 공망(空亡)이 있는 인연은 허무하게 끝나기 쉽습니다",
    "겁재(劫財)가 강한 사람은 재물 관련 악연에 주의해야 합니다",
    "비겁(比劫) 운에서 만나는 사람은 경쟁·배신의 악연일 수 있습니다",
    "사주에서 형(刑)이 있으면 가까운 사람과의 배신을 암시합니다",
    "직감으로 불편한 사람은 기신(忌神) 기운을 가진 악연일 가능성이 높습니다",
    "악연은 끊어내면 오히려 새로운 귀인이 들어오는 공간이 생깁니다",
  ],
};

export default function LoadingScreen({ step, productType = "spouse" }: {
  step: number;
  productType?: "spouse" | "guardian" | "enemy"
}) {
  const STEPS = productType === "guardian" ? GUARDIAN_STEPS : productType === "enemy" ? ENEMY_STEPS : SPOUSE_STEPS;
  const facts = SAJU_FACTS[productType];
  const [factIdx, setFactIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFactIdx((i) => (i + 1) % facts.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(t);
  }, [facts.length]);

  const accentRing =
    productType === "enemy"
      ? "border-slate-700 border-t-slate-300"
      : productType === "guardian"
      ? "border-yellow-900 border-t-yellow-400"
      : "border-rose-900 border-t-rose-400";

  const accentText =
    productType === "enemy" ? "text-slate-300" :
    productType === "guardian" ? "text-yellow-400" :
    "text-rose-400";

  const completedStepCount = step + 1;
  const progressPct = Math.round((completedStepCount / STEPS.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6">
      {/* 회전 심볼 */}
      <div className="relative w-24 h-24">
        <div className={`absolute inset-0 rounded-full border-4 animate-spin ${accentRing}`} />
        <div className="absolute inset-[-8px] rounded-full border-2 border-dashed border-white/8 animate-[spin_3s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          {STEPS[Math.min(step, STEPS.length - 1)].icon}
        </div>
      </div>

      {/* 진행 바 */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-gray-500 font-medium">분석 진행</span>
          <span className={`text-[10px] font-bold ${accentText}`}>{progressPct}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              productType === "enemy" ? "bg-slate-400" :
              productType === "guardian" ? "bg-yellow-400" :
              "bg-rose-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 진행 단계 */}
      <div className="space-y-2 w-full max-w-xs">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
              i === step
                ? "bg-white/8 border-white/15 font-semibold"
                : i < step
                ? "bg-white/3 border-white/5 text-gray-600"
                : "bg-transparent border-transparent text-gray-700"
            }`}
          >
            <span className="text-base shrink-0">
              {i < step ? "✅" : s.icon}
            </span>
            <span className={`text-xs flex-1 ${i === step ? "text-white" : i < step ? "text-gray-600" : "text-gray-700"}`}>
              {s.text}
            </span>
            {i === step && (
              <span className="flex gap-0.5">
                {[0, 1, 2].map((j) => (
                  <span
                    key={j}
                    className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                      productType === "enemy" ? "bg-slate-400" :
                      productType === "guardian" ? "bg-yellow-400" :
                      "bg-rose-400"
                    }`}
                    style={{ animationDelay: `${j * 150}ms` }}
                  />
                ))}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 사주 팩트 */}
      <div className="w-full max-w-xs bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 min-h-[68px] flex flex-col justify-center">
        <p className={`text-[10px] font-bold mb-1.5 uppercase tracking-wider ${accentText}`}>
          ☯ 사주 상식
        </p>
        <p
          className="text-xs text-gray-400 leading-relaxed"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s" }}
        >
          {facts[factIdx]}
        </p>
      </div>

      <p className="text-gray-600 text-xs animate-pulse text-center">
        {step >= STEPS.length - 1
          ? productType === "guardian" ? "✨ 귀인 초상화를 완성하는 중이에요..."
          : productType === "enemy" ? "✨ 웬수 초상화를 완성하는 중이에요..."
          : "✨ AI 몽타주를 완성하는 중이에요..."
          : "정밀 사주 분석 중입니다. 잠시만 기다려 주세요"}
      </p>
    </div>
  );
}
