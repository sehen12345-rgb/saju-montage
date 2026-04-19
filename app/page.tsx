"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SAJU_PRINCIPLES = [
  {
    han: "日柱",
    title: "일주에 배우자가 있다",
    desc: "일지(日支)는 '배우자 자리'. 이 한 글자에 운명적 상대의 기운이 담겨 있습니다.",
    color: "text-rose-400",
    border: "border-rose-500/25",
    bg: "bg-rose-500/5",
  },
  {
    han: "五行",
    title: "오행으로 궁합 계산",
    desc: "木·火·土·金·水의 상생(相生)·상극(相剋). 두 사람의 오행 조화가 궁합의 핵심입니다.",
    color: "text-yellow-400",
    border: "border-yellow-500/25",
    bg: "bg-yellow-500/5",
  },
  {
    han: "官財",
    title: "관성·재성이 배우자 기운",
    desc: "여자는 관성(官星), 남자는 재성(財星)이 배우자의 성격·직업·외모를 나타냅니다.",
    color: "text-amber-400",
    border: "border-amber-500/25",
    bg: "bg-amber-500/5",
  },
  {
    han: "萬歲",
    title: "태양 황경 정밀 계산",
    desc: "단순 음력 변환이 아닌 태양 황경(黃經) 기반 절기 계산으로 정확한 사주팔자를 산출합니다.",
    color: "text-blue-400",
    border: "border-blue-500/25",
    bg: "bg-blue-500/5",
  },
];

const REVIEWS = [
  { name: "김○○", age: "29세", gender: "여", text: "오행 분석에서 '목(木)기운 배우자'라고 나왔는데 사귀는 사람이 조경학과임... 나무 전공이 목기운 아닌가요? 소름돋아서 캡처함", stars: 5, product: "내님은누구" },
  { name: "이○○", age: "32세", gender: "남", text: "이름 첫 글자 힌트에 '水 기운 글자'라고 나왔는데 실제로 좋아하는 사람 이름에 '수'자 들어감. AI가 어떻게?", stars: 5, product: "내님은누구" },
  { name: "박○○", age: "26세", gender: "여", text: "귀인 분석에서 '50대 남성, 업무 관련 만남'이라고 나왔는데 1달 뒤 진짜로 그런 분이 제 커리어 바꿔줬어요 ㄷㄷ", stars: 5, product: "내귀인은누구" },
  { name: "최○○", age: "34세", gender: "남", text: "일주 분석 기반이라 신뢰가 갔는데 전생 인연 스토리 읽다가 울뻔... 친구한테 공유했더니 쟤도 바로 결제함ㅋ", stars: 5, product: "내님은누구" },
  { name: "정○○", age: "28세", gender: "여", text: "웬수 분석에서 '접근 첫 메시지' 예시 읽다가 전 직장 동료 생각남. 진짜 그 사람 말투랑 똑같아서 거리두기 시작함", stars: 5, product: "내웬수는누구" },
  { name: "강○○", age: "31세", gender: "남", text: "관성 분석에서 직업이 '의료·교육 계열'이라고 나왔는데 현재 진지하게 보는 사람이 물리치료사임. 이거 실화냐", stars: 5, product: "내님은누구" },
  { name: "윤○○", age: "27세", gender: "여", text: "귀인 만남 시기가 '올 하반기, 직장 관련 모임'이라고 나왔는데 진짜 회사 행사에서 중요한 분 만났어요. 소름주의", stars: 5, product: "내귀인은누구" },
  { name: "한○○", age: "33세", gender: "남", text: "웬수 유형이 '겉으로 친절한 에너지 흡혈형'이라고 나왔는데 딱 그런 사람 주변에 있음. 관계 정리하길 잘했다", stars: 5, product: "내웬수는누구" },
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
    hook: "당신의 일주(日柱)에 이미 그 사람이 있습니다",
    freeItems: ["사주팔자 · 오행 분석", "배우자 성격 · 외모 힌트", "이름 첫 글자 힌트 (일부)"],
    paidItems: ["🎨 AI 배우자 몽타주", "✉️ 카카오톡 첫 메시지", "📊 5가지 궁합 점수", "🌙 전생 인연 이야기", "📅 만남 시기 · 장소", "🔮 배우자 심리 분석"],
    color: "from-rose-500 to-pink-600",
    borderColor: "border-rose-500/30",
    glowColor: "shadow-rose-500/20",
    accentColor: "text-rose-400",
    btnGradient: "from-rose-500 to-pink-500",
    badge: "🔥 가장 인기",
    badgeCls: "bg-rose-500",
    cta: "💑 내 운명의 상대 알아보기",
  },
  {
    id: "guardian" as const,
    emoji: "🌟",
    name: "내귀인은누구",
    sub: "인생을 바꿀 귀인 AI 프로필",
    hook: "인생 전환점을 만들어줄 그 한 사람",
    freeItems: ["사주팔자 · 귀인 기운 분석", "귀인 유형 · 관계 힌트", "만남 분야 (일부)"],
    paidItems: ["🌟 귀인 AI 프로필 이미지", "✉️ 귀인 첫 카카오톡", "💼 도움 받을 3가지 영역", "🌙 전생 인연 이야기", "📅 귀인 만남 시기", "📊 월별 귀인운 차트"],
    color: "from-amber-500 to-yellow-500",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/15",
    accentColor: "text-amber-400",
    btnGradient: "from-amber-400 to-yellow-400",
    badge: "💡 커리어 추천",
    badgeCls: "bg-amber-500",
    cta: "🌟 내 귀인 알아보기",
  },
  {
    id: "enemy" as const,
    emoji: "😤",
    name: "내웬수는누구",
    sub: "조심해야 할 악연 AI 분석",
    hook: "지금 주변에 이미 그 사람이 있을 수 있습니다",
    freeItems: ["사주팔자 · 악연 기운 분석", "웬수 유형 · 관계 힌트", "위험 징후 (일부)"],
    paidItems: ["😤 웬수 AI 프로필 이미지", "💬 웬수의 접근 첫 메시지", "⚠️ 피해 영역 3가지", "🌙 전생 악연 이야기", "📅 웬수 출현 시기", "📊 월별 위험도 차트"],
    color: "from-slate-500 to-slate-700",
    borderColor: "border-slate-500/30",
    glowColor: "shadow-slate-500/10",
    accentColor: "text-slate-300",
    btnGradient: "from-slate-500 to-slate-600",
    badge: "🛡️ 자기보호",
    badgeCls: "bg-slate-600",
    cta: "😤 내 웬수 확인하기",
  },
];

export default function Home() {
  const router = useRouter();
  const [reviewIdx, setReviewIdx] = useState(0);
  const [count, setCount] = useState(41204);
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 47, s: 33 });
  const [openPrinciple, setOpenPrinciple] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setReviewIdx((i) => (i + 1) % REVIEWS.length), 4500);
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
    <div className="min-h-screen bg-[#0d0d12] text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-5 space-y-5">

        {/* 실시간 배지 */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            지금 <span className="text-white font-black">{count.toLocaleString()}명</span>이 분석 완료
          </div>
        </div>

        {/* ── 히어로 ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1025] via-[#160e2a] to-[#0d0d12] border border-white/10 p-7 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            {/* 신뢰 배지 */}
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[10px] font-bold text-gray-400 mb-4">
              <span className="text-yellow-400">☯</span>
              4,200년 동양 철학 × 최신 AI
            </div>

            <div className="text-5xl mb-3">🔮</div>
            <h1 className="text-2xl font-black leading-tight mb-2 text-white">
              당신의 사주 안에<br />
              <span className="bg-gradient-to-r from-yellow-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                이미 그 사람이 있습니다
              </span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              사주팔자 <span className="text-white font-bold">8글자</span>를 AI가 분석해<br />
              <span className="text-yellow-400 font-bold">배우자 · 귀인 · 웬수</span>의 기운을 밝힙니다
            </p>

            {/* 할인 타이머 */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5 mb-5">
              <span className="text-red-400 text-xs font-bold">🔥 특가 종료까지</span>
              <span className="font-black text-white text-sm tabular-nums">
                {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
              </span>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-2">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/5 rounded-2xl py-3 border border-white/5">
                  <div className="text-base font-black text-yellow-400">{s.value}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 사주 분석 원리 ── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/10" />
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">왜 정확한가요?</p>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SAJU_PRINCIPLES.map((p, i) => (
              <button
                key={i}
                onClick={() => setOpenPrinciple(openPrinciple === i ? null : i)}
                className={`text-left rounded-2xl border p-3.5 transition-all ${p.bg} ${p.border}`}
              >
                <div className={`text-lg font-black mb-1 ${p.color}`}>{p.han}</div>
                <div className="text-xs font-bold text-white leading-tight mb-1">{p.title}</div>
                <div className={`text-[10px] text-gray-500 leading-relaxed overflow-hidden transition-all duration-300 ${openPrinciple === i ? "max-h-24" : "max-h-0"}`}>
                  {p.desc}
                </div>
                {openPrinciple !== i && (
                  <div className="text-[10px] text-gray-600">탭하여 보기 ↓</div>
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-2">탭하면 원리 설명을 볼 수 있어요</p>
        </div>

        {/* ── 섹션 레이블 ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">분석 선택</p>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* ── 상품 카드 ── */}
        {PRODUCTS.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-3xl overflow-hidden bg-[#13131a] border ${p.borderColor} shadow-xl ${p.glowColor}`}
          >
            {/* 헤더 그라디언트 라인 */}
            <div className={`h-1 bg-gradient-to-r ${p.color}`} />

            <div className="p-5">
              {/* 상품 헤더 */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg font-black text-white">{p.name}</h2>
                    <span className={`text-[9px] ${p.badgeCls} text-white font-bold px-2 py-0.5 rounded-full shrink-0`}>{p.badge}</span>
                  </div>
                  <p className="text-xs text-gray-500">{p.sub}</p>
                </div>
              </div>

              {/* 훅 문구 */}
              <div className={`text-xs font-bold ${p.accentColor} mb-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5`}>
                ✦ {p.hook}
              </div>

              {/* 무료 공개 / 잠금 분리 */}
              <div className="space-y-2 mb-4">
                {/* 무료 항목 */}
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">무료 공개</p>
                  <div className="space-y-1">
                    {p.freeItems.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="text-green-400">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 잠금 항목 */}
                <div className={`rounded-2xl border ${p.borderColor} p-3 bg-white/2`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">2,000원으로 공개</span>
                    <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full font-bold">67% 할인</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {p.paidItems.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <span className={`text-[10px] ${p.accentColor}`}>🔒</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 가격 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600 line-through">6,000원</span>
                <span className="text-2xl font-black text-white">2,000원</span>
                <span className="text-xs text-gray-500">· 1회 결제</span>
              </div>
            </div>

            {/* CTA 버튼 */}
            <button
              onClick={() => handleSelect(p.id)}
              className={`w-full py-4 bg-gradient-to-r ${p.btnGradient} text-white font-black text-sm active:scale-95 transition-all tracking-wide`}
            >
              {p.cta}
            </button>
          </div>
        ))}

        {/* ── 번들 안내 ── */}
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-purple-300 mb-1">💡 셋 다 궁금하다면?</p>
          <p className="text-white text-sm font-bold">배우자 + 귀인 + 웬수 각각 분석</p>
          <p className="text-gray-500 text-xs mt-1">각 2,000원 개별 결제 또는 <span className="text-purple-300 font-bold">3개 묶음 5,000원</span></p>
        </div>

        {/* ── 리뷰 ── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/10" />
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">실제 이용 후기</p>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="relative bg-[#13131a] border border-white/5 rounded-3xl p-5 min-h-[148px] overflow-hidden">
            <div className="flex gap-0.5 mb-2.5">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="text-yellow-400 text-sm">{s}</span>
              ))}
              <span className="text-[10px] text-gray-500 ml-2 self-center">5.0</span>
            </div>
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${i === reviewIdx ? "opacity-100" : "opacity-0 absolute inset-0 p-5 pt-[52px]"}`}
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
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === reviewIdx ? "bg-yellow-400 w-4" : "bg-white/20 w-1.5"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── 신뢰 배지 ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "🔒", text: "정보 저장 안함" },
            { icon: "⚡", text: "즉시 분석" },
            { icon: "🏯", text: "만세력 기반" },
          ].map((b) => (
            <div key={b.text} className="bg-[#13131a] border border-white/5 rounded-2xl p-3 text-center">
              <div className="text-lg mb-1">{b.icon}</div>
              <div className="text-[10px] text-gray-500">{b.text}</div>
            </div>
          ))}
        </div>

        {/* ── 사주 팩트 한줄 ── */}
        <div className="bg-[#13131a] border border-white/5 rounded-2xl px-4 py-3.5 flex items-start gap-3">
          <span className="text-yellow-400 text-lg shrink-0 mt-0.5">☯</span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="text-yellow-400 font-bold">사주 팁</span> — 사주 8글자 중 <span className="text-white">일지(日支)</span> 하나가 배우자를 결정합니다. 나머지 7글자가 그 사람의 기운, 직업, 외모를 구체화합니다.
          </p>
        </div>

        <p className="text-center text-xs text-gray-700">
          오락 및 참고 목적 · 입력 정보는 서버에 저장되지 않습니다
        </p>
      </div>
    </div>
  );
}
