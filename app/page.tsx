"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const REVIEWS = [
  { name: "김○○", age: "29세", gender: "여", text: "헐 이거 실화냐... 남친 생겼는데 이름 첫 글자 진짜 맞음. 소름 돋아서 스샷 찍어뒀음", stars: 5, product: "내님은누구" },
  { name: "이○○", age: "32세", gender: "남", text: "외모 묘사가 너무 구체적이라 당황했음ㅋㅋ 그냥 \"키 크고 날씬\" 이런 거 아니고 이목구비까지 묘사함", stars: 5, product: "내님은누구" },
  { name: "박○○", age: "26세", gender: "여", text: "귀인 분석 해봤는데 직장 상사랑 딱 맞아떨어짐 ㄷㄷ 그 분 덕분에 이직 성공했거든요", stars: 5, product: "내귀인은누구" },
  { name: "최○○", age: "34세", gender: "남", text: "전생 인연 읽다가 울뻔... 감성 돋는다 진짜. 친구한테 공유했더니 쟤도 바로 해봤음", stars: 5, product: "내님은누구" },
  { name: "정○○", age: "28세", gender: "여", text: "내웬수 분석 보고 주변 사람 딱 떠올랐는데... 진짜 그 사람임? 소름이라 거리두기 시작함", stars: 5, product: "내웬수는누구" },
  { name: "강○○", age: "31세", gender: "남", text: "카카오톡 첫 메시지 예시 보고 현웃ㅋㅋ 찐으로 그럴 것 같은 말투인데? AI가 어떻게 알았지", stars: 5, product: "내님은누구" },
];

const STATS = [
  { value: "41,200+", label: "분석 완료" },
  { value: "97%", label: "만족도" },
  { value: "4.9★", label: "평점" },
];

const PRODUCTS = [
  {
    id: "spouse" as const,
    emoji: "💑",
    name: "내님은누구",
    sub: "운명의 배우자 AI 몽타주",
    color: "from-rose-500 to-pink-600",
    badgeColor: "bg-rose-500",
    btnColor: "bg-rose-500 hover:bg-rose-400",
    borderColor: "border-rose-500/40",
    glowColor: "shadow-rose-500/20",
    features: [
      ["🎨", "AI 배우자 몽타주"],
      ["💬", "카카오톡 첫 메시지"],
      ["💝", "배우자 사랑 언어"],
      ["🧠", "배우자 심리 분석"],
      ["✨", "이름 첫 글자 힌트"],
      ["🌙", "전생 인연 이야기"],
      ["📊", "5가지 궁합 점수"],
      ["🚀", "인연 실천 가이드"],
    ],
    cta: "💑 내님 찾기",
  },
  {
    id: "guardian" as const,
    emoji: "🌟",
    name: "내귀인은누구",
    sub: "인생을 바꿀 귀인 AI 프로필",
    color: "from-amber-500 to-yellow-500",
    badgeColor: "bg-amber-500",
    btnColor: "bg-amber-400 hover:bg-amber-300",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/20",
    features: [
      ["🌟", "귀인 AI 프로필"],
      ["💬", "귀인 첫 카카오톡"],
      ["💼", "도움 받을 영역 3가지"],
      ["🗺️", "귀인 만나는 방법"],
      ["🌙", "전생 인연 이야기"],
      ["📅", "귀인 만남 시기"],
      ["📊", "월별 귀인운 차트"],
      ["🚀", "귀인 실천 가이드"],
    ],
    cta: "🌟 귀인 찾기",
  },
  {
    id: "enemy" as const,
    emoji: "😤",
    name: "내웬수는누구",
    sub: "조심해야 할 악연 AI 분석",
    color: "from-slate-600 to-slate-700",
    badgeColor: "bg-slate-500",
    btnColor: "bg-slate-600 hover:bg-slate-500",
    borderColor: "border-slate-500/40",
    glowColor: "shadow-slate-500/20",
    features: [
      ["😤", "웬수 AI 프로필"],
      ["💬", "웬수의 접근 메시지"],
      ["⚠️", "피해 영역 3가지"],
      ["🛡️", "웬수 피하는 방법"],
      ["🌙", "전생 악연 이야기"],
      ["📅", "웬수 출현 시기"],
      ["📊", "월별 위험도 차트"],
      ["🚀", "자기보호 가이드"],
    ],
    cta: "😤 웬수 확인",
  },
];

export default function Home() {
  const router = useRouter();
  const [reviewIdx, setReviewIdx] = useState(0);
  const [count, setCount] = useState(41204);
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 47, s: 33 });

  useEffect(() => {
    const t = setInterval(() => setReviewIdx((i) => (i + 1) % REVIEWS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 2)), 9000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 47; s = 33; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function handleSelect(product: "spouse" | "guardian" | "enemy") {
    sessionStorage.setItem("selectedProduct", product);
    router.push("/input");
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white pb-16">
      <div className="max-w-md mx-auto px-4 pt-5 space-y-4">

        {/* 실시간 배지 */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            지금 <span className="text-white font-black">{count.toLocaleString()}명</span>이 분석 완료
          </div>
        </div>

        {/* 히어로 */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1025] via-[#16102a] to-[#0d0d12] border border-white/10 p-7 text-center">
          {/* 배경 글로우 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="text-5xl mb-3">🔮</div>
            <h1 className="text-2xl font-black leading-tight mb-2 text-white">
              사주로 보는<br />
              <span className="bg-gradient-to-r from-yellow-400 to-rose-400 bg-clip-text text-transparent">나의 운명</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              AI가 사주팔자를 분석해<br />
              <span className="text-yellow-400 font-bold">소름돋게 정확한</span> 결과를 알려드려요
            </p>

            {/* 할인 타이머 */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5">
              <span className="text-red-400 text-xs font-bold">🔥 특가 종료까지</span>
              <span className="font-black text-white text-sm tabular-nums">
                {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
              </span>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/5 rounded-2xl py-3 border border-white/5">
                  <div className="text-base font-black text-yellow-400">{s.value}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 섹션 레이블 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">분석 선택</p>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* 상품 카드 */}
        {PRODUCTS.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-3xl overflow-hidden bg-[#13131a] border ${p.borderColor} shadow-xl ${p.glowColor} transition-all hover:scale-[1.01]`}
          >
            {/* 헤더 그라디언트 라인 */}
            <div className={`h-1 bg-gradient-to-r ${p.color}`} />

            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {p.emoji}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{p.name}</h2>
                  <p className="text-xs text-gray-500">{p.sub}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-1 rounded-full border border-red-500/20">74% ↓</span>
                </div>
              </div>

              {/* 피처 그리드 */}
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {p.features.map(([icon, text]) => (
                  <div key={text as string} className="flex items-center gap-2 py-1">
                    <span className="text-sm opacity-80">{icon}</span>
                    <span className="text-xs text-gray-400">{text}</span>
                  </div>
                ))}
              </div>

              {/* 가격 + 버튼 */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-600 line-through">3,900원</span>
                  <span className="text-2xl font-black text-white">990원</span>
                </div>
                <button
                  onClick={() => handleSelect(p.id)}
                  className="px-5 py-2.5 bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl active:scale-95 transition-all hover:bg-white/20"
                >
                  선택하기 →
                </button>
              </div>
            </div>

            {/* CTA 버튼 */}
            <button
              onClick={() => handleSelect(p.id)}
              className={`w-full py-4 ${p.btnColor} text-white font-black text-base active:scale-95 transition-all`}
            >
              {p.cta}
            </button>
          </div>
        ))}

        {/* 번들 안내 */}
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-purple-300 mb-1">💡 세 가지가 다 궁금하다면?</p>
          <p className="text-white text-sm font-bold">배우자 + 귀인 + 웬수 각각 분석</p>
          <p className="text-gray-500 text-xs mt-1">각 990원 · 합산 2,970원</p>
        </div>

        {/* 리뷰 */}
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center mb-3">실제 이용 후기</p>
          <div className="relative bg-[#13131a] border border-white/5 rounded-3xl p-5 min-h-[130px] overflow-hidden">
            {/* 별점 */}
            <div className="flex gap-0.5 mb-2">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="text-yellow-400 text-sm">{s}</span>
              ))}
            </div>
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${i === reviewIdx ? "opacity-100" : "opacity-0 absolute inset-0 p-5 pt-12"}`}
              >
                {i === reviewIdx && (
                  <>
                    <p className="text-sm text-gray-200 leading-relaxed mb-3">"{r.text}"</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">— {r.name} ({r.age} {r.gender})</p>
                      <span className="text-[10px] bg-white/5 text-gray-400 border border-white/10 px-2 py-0.5 rounded-full">{r.product}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
            {/* 인디케이터 */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === reviewIdx ? "bg-yellow-400 w-4" : "bg-white/20"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 신뢰 배지 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "🔒", text: "정보 저장 안함" },
            { icon: "⚡", text: "즉시 분석" },
            { icon: "🎯", text: "AI 완전 분석" },
          ].map((b) => (
            <div key={b.text} className="bg-[#13131a] border border-white/5 rounded-2xl p-3 text-center">
              <div className="text-lg mb-1">{b.icon}</div>
              <div className="text-[10px] text-gray-500">{b.text}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600">
          오락 및 참고 목적 · 입력 정보는 서버에 저장되지 않습니다
        </p>
      </div>
    </div>
  );
}
