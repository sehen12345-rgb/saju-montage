"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const REVIEWS = [
  { name: "김○○", age: "28세 여성", text: "진짜 소름... 나중에 남친 생겼는데 이름 첫 글자 맞음", stars: 5 },
  { name: "이○○", age: "31세 남성", text: "외모 묘사가 너무 구체적이라 당황함ㅋㅋ 반반도 아니고 딱 내 이상형", stars: 5 },
  { name: "박○○", age: "25세 여성", text: "카카오톡 첫 메시지 예시 보고 현웃 터짐 찐으로 그럴 것 같은 말투야", stars: 5 },
  { name: "최○○", age: "33세 남성", text: "전생 인연 읽다가 울뻔.. 감성 돋는다 진짜", stars: 5 },
  { name: "정○○", age: "27세 여성", text: "오빠한테 해보라고 보냄 ㅋㅋ 사주 넣자마자 '이거 나잖아' 함", stars: 5 },
];

const STATS = [
  { value: "38,400+", label: "분석 완료" },
  { value: "96%", label: "만족도" },
  { value: "4.9", label: "평점" },
];

export default function Home() {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-md w-full space-y-6">

        {/* 실시간 배지 */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs font-semibold text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            지금 {count.toLocaleString()}명이 분석 완료
          </div>
        </div>

        {/* 헤더 */}
        <div className="text-center space-y-3">
          <div className="text-6xl">🔮</div>
          <h1 className="text-4xl font-black text-amber-900 leading-tight">
            내 배우자<br />얼굴봤다
          </h1>
          <p className="text-amber-700 text-base leading-relaxed">
            사주팔자로 그려지는<br />
            <span className="font-bold text-amber-900">운명의 상대 AI 몽타주</span>
          </p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-amber-100 shadow-sm text-center">
              <div className="text-xl font-black text-amber-600">{s.value}</div>
              <div className="text-[11px] text-amber-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 무엇을 알려주나 */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-5 border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-amber-500 mb-3 text-center uppercase tracking-wider">결제 후 공개되는 것들</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["🎨", "AI 배우자 몽타주"],
              ["💬", "카카오톡 첫 메시지"],
              ["💝", "배우자 사랑 언어"],
              ["🧠", "배우자 심리 분석"],
              ["✨", "이름 첫 글자 힌트"],
              ["🌙", "전생 인연 이야기"],
              ["📊", "5가지 궁합 점수"],
              ["🚀", "인연 실천 가이드"],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-700">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-center gap-2">
            <span className="text-xs text-gray-400 line-through">3,900원</span>
            <span className="text-base font-black text-amber-600">990원</span>
            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">74% 할인</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/input"
          className="block w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xl shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center"
        >
          ✨ 사주 분석 시작하기
        </Link>

        <p className="text-center text-xs text-amber-600">
          🕐 약 20~30초 · 사주 분석 무료 · AI 몽타주·상세 결과는 <span className="font-bold">990원</span>
        </p>

        {/* 결과 미리보기 티저 */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-200 shadow-lg">
          <div className="bg-white/90 p-5 space-y-3 select-none">
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider text-center mb-3">실제 결과 미리보기</p>
            {/* 흐릿한 몽타주 자리 */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-200/80 flex items-center justify-center text-3xl">🔮</div>
                <p className="text-amber-700 font-bold text-sm">AI 배우자 몽타주</p>
                <p className="text-amber-500 text-xs">분석 후 공개됩니다</p>
              </div>
              {/* 별 장식 */}
              {["top-4 left-6", "top-8 right-8", "bottom-6 left-10", "bottom-4 right-6"].map((pos, i) => (
                <span key={i} className={`absolute ${pos} text-amber-300 text-lg opacity-60`}>✦</span>
              ))}
            </div>
            {/* 흐릿한 텍스트 카드들 */}
            <div className="space-y-2 blur-[3px]">
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-[10px] text-amber-400 mb-1">💑 케미 타입</p>
                <p className="text-sm font-bold text-amber-900">운명적 소울메이트형</p>
                <p className="text-xs text-gray-500">처음 만나는 순간부터 묘하게 이끌리는...</p>
              </div>
              <div className="bg-[#FEE500] rounded-xl p-3">
                <p className="text-[10px] text-yellow-700 mb-1">💬 배우자 첫 카카오톡</p>
                <p className="text-sm font-semibold text-gray-800">안녕하세요, 혹시 저 기억하세요? ☺️</p>
              </div>
            </div>
          </div>
          {/* 잠금 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent flex flex-col items-center justify-end pb-6 px-6">
            <Link
              href="/input"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base shadow-xl text-center active:scale-95 transition-all"
            >
              🔓 내 결과 확인하기
            </Link>
          </div>
        </div>

        {/* 리뷰 슬라이드 */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-amber-100 shadow-sm min-h-[100px] relative overflow-hidden">
          <div className="absolute top-3 right-3 text-xs text-amber-400 font-semibold">실제 이용 후기</div>
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${i === reviewIdx ? "opacity-100" : "opacity-0 absolute inset-0 p-4"}`}
            >
              {i === reviewIdx && (
                <>
                  <div className="flex items-center gap-1 mb-2">
                    {"★★★★★".split("").map((s, j) => (
                      <span key={j} className="text-amber-400 text-sm">{s}</span>
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
