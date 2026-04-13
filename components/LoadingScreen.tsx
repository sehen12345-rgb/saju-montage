"use client";

import { useState, useEffect } from "react";

const SPOUSE_STEPS = [
  { icon: "☯️", text: "사주팔자를 분석하는 중..." },
  { icon: "🔮", text: "배우자의 인연을 찾는 중..." },
  { icon: "🎨", text: "몽타주를 그리는 중..." },
];

const GUARDIAN_STEPS = [
  { icon: "☯️", text: "사주팔자를 분석하는 중..." },
  { icon: "🌟", text: "귀인의 인연을 찾는 중..." },
  { icon: "🎨", text: "귀인 초상화를 그리는 중..." },
];

const ENEMY_STEPS = [
  { icon: "☯️", text: "사주팔자를 분석하는 중..." },
  { icon: "😤", text: "악연의 기운을 추적하는 중..." },
  { icon: "🎨", text: "웬수 초상화를 그리는 중..." },
];

const FUN_FACTS = [
  "사주팔자에서 일간(日干)은 '나 자신'을 나타냅니다",
  "관성(官星)은 배우자와 직업운에 영향을 줍니다",
  "재성(財星)이 강하면 배우자의 재력운이 좋다고 해요",
  "일지(日支)는 배우자 자리 — 가장 중요한 글자입니다",
  "음양오행 중 水기운이 강한 상대는 지혜롭고 감성적입니다",
  "목(木)기운의 배우자는 성장과 창의성을 상징합니다",
  "화(火)기운이 강한 사람은 열정적이고 카리스마 있어요",
  "토(土)기운의 배우자는 듬직하고 신뢰감을 줍니다",
  "금(金)기운이 강한 사람은 결단력이 있고 원칙을 중시해요",
  "사주에서 합(合)이 많으면 배우자와 인연이 깊다고 봅니다",
];

export default function LoadingScreen({ step, productType = "spouse" }: { step: number; productType?: "spouse" | "guardian" | "enemy" }) {
  const STEPS = productType === "guardian" ? GUARDIAN_STEPS : productType === "enemy" ? ENEMY_STEPS : SPOUSE_STEPS;
  const [factIdx, setFactIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFactIdx((i) => (i + 1) % FUN_FACTS.length);
        setVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-7">
      {/* 회전하는 팔괘 심볼 */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-amber-200" />
        <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
        <div className="absolute inset-[-8px] rounded-full border-2 border-dashed border-amber-300/50 animate-[spin_3s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          {STEPS[Math.min(step, STEPS.length - 1)].icon}
        </div>
      </div>

      {/* 진행 단계 */}
      <div className="space-y-2.5 w-full max-w-xs">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              i === step
                ? "bg-amber-100 border-2 border-amber-400 text-amber-800 font-semibold"
                : i < step
                ? "bg-green-50 border-2 border-green-300 text-green-700"
                : "bg-gray-50 border-2 border-gray-200 text-gray-400"
            }`}
          >
            <span className="text-lg shrink-0">{i < step ? "✅" : s.icon}</span>
            <span className="text-sm">{s.text}</span>
            {i === step && (
              <span className="ml-auto flex gap-0.5">
                {[0, 1, 2].map((j) => (
                  <span
                    key={j}
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                    style={{ animationDelay: `${j * 150}ms` }}
                  />
                ))}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 사주 팩트 회전 */}
      <div className="w-full max-w-xs bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 min-h-[60px] flex flex-col justify-center">
        <p className="text-[10px] text-amber-400 font-semibold mb-1 uppercase tracking-wider">사주 상식</p>
        <p
          className={`text-xs text-amber-800 leading-relaxed transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
          style={{ transition: "opacity 0.4s, transform 0.4s" }}
        >
          {FUN_FACTS[factIdx]}
        </p>
      </div>

      <p className="text-amber-600 text-xs animate-pulse text-center">
        {step === 2
        ? productType === "guardian"
          ? "✨ AI가 귀인 초상화를 그리고 있어요... 조금만 기다려주세요"
          : productType === "enemy"
          ? "✨ AI가 웬수 초상화를 그리고 있어요... 조금만 기다려주세요"
          : "✨ AI가 배우자 몽타주를 그리고 있어요... 조금만 기다려주세요"
        : "잠시만 기다려 주세요"}
      </p>
    </div>
  );
}
