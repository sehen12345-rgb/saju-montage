"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const REVIEWS = [
  { name: "김○○", age: "28세 여성", text: "진짜 소름... 나중에 남친 생겼는데 이름 첫 글자 맞음", stars: 5 },
  { name: "이○○", age: "31세 남성", text: "외모 묘사가 너무 구체적이라 당황함ㅋㅋ 반반도 아니고 딱 내 이상형", stars: 5 },
  { name: "박○○", age: "25세 여성", text: "카카오톡 첫 메시지 예시 보고 현웃 터짐 찐으로 그럴 것 같은 말투야", stars: 5 },
  { name: "최○○", age: "33세 남성", text: "전생 인연 읽다가 울뻔.. 감성 돋는다 진짜", stars: 5 },
  { name: "정○○", age: "27세 여성", text: "귀인 분석 해봤는데 직장 상사 딱 맞았음ㄷㄷ 소름", stars: 5 },
];

const SPOUSE_FEATURES = [
  ["🎨", "AI 배우자 몽타주"],
  ["💬", "카카오톡 첫 메시지"],
  ["💝", "배우자 사랑 언어"],
  ["🧠", "배우자 심리 분석"],
  ["✨", "이름 첫 글자 힌트"],
  ["🌙", "전생 인연 이야기"],
  ["📊", "5가지 궁합 점수"],
  ["🚀", "인연 실천 가이드"],
];

const GUARDIAN_FEATURES = [
  ["🌟", "귀인 AI 프로필"],
  ["💬", "귀인 첫 카카오톡"],
  ["💼", "도움 받을 영역 3가지"],
  ["🗺️", "귀인 만나는 방법"],
  ["🌙", "전생 인연 이야기"],
  ["📅", "귀인 만남 시기"],
  ["📊", "월별 귀인운 차트"],
  ["🚀", "귀인 실천 가이드"],
];

export default function Home() {
  const router = useRouter();
  const [reviewIdx, setReviewIdx] = useState(0);
  const [count, setCount] = useState(38412);

  useEffect(() => {
    const t = setInterval(() => setReviewIdx((i) => (i + 1) % REVIEWS.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3)), 8000);
    return () => clearInterval(t);
  }, []);

  function handleSelectProduct(product: "spouse" | "guardian") {
    sessionStorage.setItem("selectedProduct", product);
    router.push("/input");
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-10">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">

        {/* 실시간 배지 */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 text-xs font-semibold text-gray-700 shadow-sm border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            지금 {count.toLocaleString()}명이 분석 완료
          </div>
        </div>

        {/* 히어로 타이틀 */}
        <div className="bg-gray-900 rounded-3xl p-7 text-white text-center">
          <div className="text-5xl mb-3">🔮</div>
          <h1 className="text-2xl font-black leading-tight mb-2">
            사주로 보는 나의 운명
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            원하는 분석을 선택하세요<br />
            <span className="text-yellow-400 font-bold">각 990원 · AI 완전 분석</span>
          </p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { value: "38,400+", label: "분석 완료" },
              { value: "96%", label: "만족도" },
              { value: "4.9", label: "평점" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl py-3">
                <div className="text-lg font-black text-yellow-400">{s.value}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 상품 선택 레이블 */}
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">어떤 운명을 알고 싶으세요?</p>

        {/* 상품 카드 1: 내님은누구 */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-transparent hover:border-yellow-300 transition-all">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl shrink-0">💑</div>
              <div>
                <h2 className="text-lg font-black text-gray-900">내님은누구</h2>
                <p className="text-xs text-gray-500">사주로 보는 운명의 배우자 AI 몽타주</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {SPOUSE_FEATURES.map(([icon, text]) => (
                <div key={text as string} className="flex items-center gap-1.5 py-1">
                  <span className="text-sm">{icon}</span>
                  <span className="text-xs text-gray-600">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 line-through">3,900원</span>
                <span className="text-2xl font-black text-gray-900">990원</span>
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">74% 할인</span>
              </div>
              <button
                onClick={() => handleSelectProduct("spouse")}
                className="px-5 py-3 bg-gray-900 text-white font-bold text-sm rounded-2xl active:scale-95 transition-all"
              >
                선택하기 →
              </button>
            </div>
          </div>
          <button
            onClick={() => handleSelectProduct("spouse")}
            className="w-full py-3.5 bg-yellow-400 text-gray-900 font-black text-base active:scale-95 transition-all"
          >
            💑 내님 분석 시작하기
          </button>
        </div>

        {/* 상품 카드 2: 내귀인은누구 */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-transparent hover:border-yellow-300 transition-all">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">🌟</div>
              <div>
                <h2 className="text-lg font-black text-gray-900">내귀인은누구</h2>
                <p className="text-xs text-gray-500">사주로 보는 나의 인생 귀인·조력자</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {GUARDIAN_FEATURES.map(([icon, text]) => (
                <div key={text as string} className="flex items-center gap-1.5 py-1">
                  <span className="text-sm">{icon}</span>
                  <span className="text-xs text-gray-600">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 line-through">3,900원</span>
                <span className="text-2xl font-black text-gray-900">990원</span>
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">74% 할인</span>
              </div>
              <button
                onClick={() => handleSelectProduct("guardian")}
                className="px-5 py-3 bg-gray-900 text-white font-bold text-sm rounded-2xl active:scale-95 transition-all"
              >
                선택하기 →
              </button>
            </div>
          </div>
          <button
            onClick={() => handleSelectProduct("guardian")}
            className="w-full py-3.5 bg-yellow-400 text-gray-900 font-black text-base active:scale-95 transition-all"
          >
            🌟 내귀인 분석 시작하기
          </button>
        </div>

        {/* 두 개 다 해보기 */}
        <div className="bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">💡 둘 다 궁금하다면?</p>
          <p className="text-white text-sm font-bold">배우자 + 귀인 분석을 각각 해보세요</p>
          <p className="text-gray-400 text-xs mt-1">각 990원 · 합산 1,980원</p>
        </div>

        {/* 리뷰 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm min-h-[110px] relative overflow-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">실제 이용 후기</p>
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${i === reviewIdx ? "opacity-100" : "opacity-0 absolute inset-0 p-5 pt-9"}`}
            >
              {i === reviewIdx && (
                <>
                  <div className="flex items-center gap-0.5 mb-2">
                    {"★★★★★".split("").map((s, j) => (
                      <span key={j} className="text-yellow-400 text-sm">{s}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">"{r.text}"</p>
                  <p className="text-xs text-gray-400 mt-2">— {r.name} ({r.age})</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* 보안 안내 */}
        <p className="text-center text-xs text-gray-400">
          🔒 입력 정보는 서버에 저장되지 않습니다 · 오락 및 참고 목적
        </p>
      </div>
    </div>
  );
}
