"use client";

import { useState, useEffect } from "react";
import type { SelfSajuAnalysis, SajuInfo } from "@/lib/types";
import { isPaidForSaju, savePaidRecord, makeProductHash, PRICE_SELF } from "@/lib/paymentStorage";
import { requestTossPayment } from "@/lib/tossPayments";

// ── 오행 색상 매핑 ──────────────────────────────────────────
const STEM_ELEMENT: Record<string, string> = {
  갑: "wood", 을: "wood",
  병: "fire", 정: "fire",
  무: "earth", 기: "earth",
  경: "metal", 신: "metal",
  임: "water", 계: "water",
};
const BRANCH_ELEMENT: Record<string, string> = {
  자: "water", 해: "water",
  축: "earth", 진: "earth", 미: "earth", 술: "earth",
  인: "wood", 묘: "wood",
  사: "fire", 오: "fire",
  신: "metal", 유: "metal",
};
const ELEMENT_COLOR: Record<string, string> = {
  wood:  "bg-green-400 text-white",
  fire:  "bg-red-400 text-white",
  earth: "bg-yellow-400 text-gray-900",
  metal: "bg-gray-300 text-gray-900",
  water: "bg-blue-500 text-white",
};
const HAN_STEM: Record<string, string> = {
  갑:"甲",을:"乙",병:"丙",정:"丁",무:"戊",기:"己",경:"庚",신:"辛",임:"壬",계:"癸",
};
const HAN_BRANCH: Record<string, string> = {
  자:"子",축:"丑",인:"寅",묘:"卯",진:"辰",사:"巳",오:"午",미:"未",신:"申",유:"酉",술:"戌",해:"亥",
};

// 오행 한자 → element 키
const OHAENG_ELEMENT: Record<string, string> = {
  "木": "wood", "火": "fire", "土": "earth", "金": "metal", "水": "water",
};
const OHAENG_BAR_COLOR: Record<string, string> = {
  "木": "bg-green-400",
  "火": "bg-red-400",
  "土": "bg-yellow-400",
  "金": "bg-gray-300",
  "水": "bg-blue-500",
};
const OHAENG_TEXT_COLOR: Record<string, string> = {
  "木": "text-green-400",
  "火": "text-red-400",
  "土": "text-yellow-400",
  "金": "text-gray-300",
  "水": "text-blue-400",
};

// ── 사주 4기둥 카드 ──────────────────────────────────────────
function SajuPillarCard({ sajuInfo }: { sajuInfo: SajuInfo }) {
  const pillars = [
    { label: "시주", value: sajuInfo.hourPillar },
    { label: "일주", value: sajuInfo.dayPillar },
    { label: "월주", value: sajuInfo.monthPillar },
    { label: "년주", value: sajuInfo.yearPillar },
  ];

  return (
    <div className="bg-[#13131a] border border-white/8 rounded-3xl p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">나의 사주팔자</p>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {pillars.map((p) => (
          <div key={p.label} className="text-center text-xs text-gray-400 font-medium">{p.label}</div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-1.5">
        {pillars.map((p) => {
          const stem = p.value[0] ?? "";
          const el = STEM_ELEMENT[stem] ?? "earth";
          const color = ELEMENT_COLOR[el];
          const han = HAN_STEM[stem] ?? stem;
          return (
            <div key={p.label + "s"} className={`aspect-square rounded-2xl flex flex-col items-center justify-center ${color}`}>
              <span className="text-xl font-black leading-none">{han}</span>
              <span className="text-[9px] mt-0.5 opacity-80">+{stem}</span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {pillars.map((p) => {
          const branch = p.value[1] ?? "";
          const el = BRANCH_ELEMENT[branch] ?? "earth";
          const color = ELEMENT_COLOR[el];
          const han = HAN_BRANCH[branch] ?? branch;
          return (
            <div key={p.label + "b"} className={`aspect-square rounded-2xl flex flex-col items-center justify-center ${color}`}>
              <span className="text-xl font-black leading-none">{han}</span>
              <span className="text-[9px] mt-0.5 opacity-80">-{branch}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 오행 분포 바 차트 ──────────────────────────────────────────
function OhaengChart({ elementCounts }: { elementCounts: Record<string, number> }) {
  const OHAENG = ["木", "火", "土", "金", "水"];
  const total = OHAENG.reduce((s, k) => s + (elementCounts[k] ?? 0), 0) || 1;

  return (
    <div className="bg-[#13131a] border border-white/8 rounded-2xl p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">오행 분포</p>
      <div className="space-y-2">
        {OHAENG.map((k) => {
          const count = elementCounts[k] ?? 0;
          const pct = Math.round((count / total) * 100);
          const barColor = OHAENG_BAR_COLOR[k];
          const textColor = OHAENG_TEXT_COLOR[k];
          return (
            <div key={k} className="flex items-center gap-3">
              <span className={`text-sm font-black w-5 shrink-0 ${textColor}`}>{k}</span>
              <div className="flex-1 bg-white/8 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-6 text-right ${textColor}`}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 결제 모달 ──────────────────────────────────────────────

const PROMO_TIMER_KEY = "naenim_promo_first_ts";
const PROMO_DURATION = 600;

function getPromoTimeLeft(): number {
  if (typeof window === "undefined") return PROMO_DURATION;
  const stored = localStorage.getItem(PROMO_TIMER_KEY);
  if (!stored) {
    localStorage.setItem(PROMO_TIMER_KEY, String(Date.now()));
    return PROMO_DURATION;
  }
  return Math.max(0, PROMO_DURATION - Math.floor((Date.now() - Number(stored)) / 1000));
}

const PAID_ITEMS = [
  "🧬 타고난 기질 분석", "💪 강점 3가지", "⚠️ 주의사항 3가지",
  "💼 직업 적성 분석", "💰 재물운 분석", "💕 연애/결혼 스타일",
  "🏥 건강 주의 사항", "🌟 올해 운세", "🔮 현재 대운",
  "📊 월별 운세 차트", "🗺️ 대운 흐름 타임라인", "✨ 행운 키워드",
];

function SelfPayModal({ onClose, onPay }: { onClose: () => void; onPay: () => void }) {
  const [paying, setPaying] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(() => getPromoTimeLeft());

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft <= 0]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  async function handlePay(method: string) {
    if (paying) return;
    setPaying(method);
    try {
      if (method === "card") {
        await requestTossPayment({ method: "CARD", amount: PRICE_SELF, orderName: "내 사주 완전 분석" });
      } else {
        await requestTossPayment({ method: "KAKAOPAY", amount: PRICE_SELF, orderName: "내 사주 완전 분석" });
      }
    } catch {
      setPaying(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-md">
      <div className="bg-[#0f0f18] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto">

        {/* 헤더 */}
        <div className="relative p-5 text-center border-b border-white/8">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-transparent to-indigo-900/20 pointer-events-none" />
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl z-10">✕</button>
          <div className="relative">
            <div className="text-4xl mb-2">🔮</div>
            <h2 className="text-xl font-black text-white">나의 사주 전체 공개</h2>
            <p className="text-gray-400 text-xs mt-1 mb-3">12가지 항목 완전 분석 보고서</p>
            {timeLeft > 0 && (
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1.5 text-xs font-bold text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                특가 종료까지 {mm}:{ss}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* 포함 항목 */}
          <div className="grid grid-cols-2 gap-1.5">
            {PAID_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-300 bg-white/4 border border-white/6 rounded-xl px-2.5 py-2">
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* 가격 표시 */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <span className="text-xs text-gray-500 line-through">3,900원</span>
              <span className="text-xs bg-violet-500/20 text-violet-400 font-bold px-2 py-0.5 rounded-full">75% 할인</span>
            </div>
            <p className="text-2xl font-black text-white">990<span className="text-base font-bold">원</span></p>
            <p className="text-xs text-gray-500 mt-0.5">1회 결제 · 회원가입 불필요</p>
          </div>

          {/* 카카오페이 결제 버튼 */}
          <button
            onClick={() => handlePay("kakaopay")}
            disabled={!!paying}
            className="w-full py-4 rounded-2xl font-black text-base text-gray-900 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: "#FEE500" }}
          >
            {paying === "kakaopay" ? (
              <span className="w-5 h-5 border-2 border-gray-400/40 border-t-gray-700 rounded-full animate-spin" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
                  <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                </svg>
                카카오페이 990원
              </>
            )}
          </button>

          {/* 카드 결제 버튼 */}
          <button
            onClick={() => handlePay("card")}
            disabled={!!paying}
            className="w-full py-3.5 rounded-2xl border border-white/15 text-gray-300 font-semibold text-sm active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {paying === "card" ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "💳 신용·체크카드 990원"}
          </button>

          <button onClick={onClose} className="w-full py-2.5 text-gray-600 text-sm hover:text-gray-400 transition-colors">
            나중에 볼게요
          </button>

          <p className="text-[10px] text-gray-600 text-center">
            토스페이먼츠 PG · 결제 정보 저장 없음
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────

interface Props {
  analysis: SelfSajuAnalysis;
  name: string;
  gender: "male" | "female";
}

export default function SelfResultCard({ analysis, name, gender }: Props) {
  const [paid, setPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  const productHash = analysis?.sajuInfo
    ? makeProductHash(
        analysis.sajuInfo.yearPillar,
        analysis.sajuInfo.monthPillar,
        analysis.sajuInfo.dayPillar,
        analysis.sajuInfo.hourPillar,
        gender,
        "self"
      )
    : "";

  // 스크롤 시 스티키 버튼 표시
  useEffect(() => {
    if (paid) return;
    const handler = () => setShowStickyBtn(window.scrollY > 300);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [paid]);

  // localStorage 결제 기록 확인
  useEffect(() => {
    if (!paid && productHash && isPaidForSaju(productHash)) {
      setPaid(true);
    }
  }, [productHash, paid]);

  function handlePaySuccess() {
    setShowModal(false);
    setPaid(true);
    setJustUnlocked(true);
    setTimeout(() => setJustUnlocked(false), 4000);
    if (productHash) savePaidRecord(productHash, `self_${Date.now()}`);
  }

  const sinGangLabel = analysis.isSinGang ? "신강(身强)" : "신약(身弱)";
  const sinGangColor = analysis.isSinGang
    ? "bg-orange-500/20 border border-orange-500/40 text-orange-300"
    : "bg-blue-500/20 border border-blue-500/40 text-blue-300";

  // 월별 운세 최댓값 (바 높이 정규화)
  const maxFortune = analysis.monthlyFortune?.length
    ? Math.max(...analysis.monthlyFortune, 1)
    : 100;

  return (
    <>
      {showModal && (
        <SelfPayModal onClose={() => setShowModal(false)} onPay={handlePaySuccess} />
      )}

      {/* 스티키 결제 버튼 */}
      {!paid && showStickyBtn && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3">
          <button
            onClick={() => setShowModal(true)}
            className="w-full max-w-md mx-auto flex items-center justify-between gap-3 py-4 px-6 rounded-2xl bg-violet-500 text-white font-bold shadow-2xl active:scale-95 transition-all"
            style={{ display: "flex" }}
          >
            <span className="text-lg">🔮 내 사주 전체 보기</span>
            <span className="bg-white/20 rounded-xl px-3 py-1 text-sm font-black">990원</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* ── 무료: 사주 4기둥 ── */}
        <SajuPillarCard sajuInfo={analysis.sajuInfo} />

        {/* ── 무료: 오행 분포 ── */}
        <OhaengChart elementCounts={analysis.elementCounts} />

        {/* ── 무료: 신강/신약 + MBTI 배지 ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-2xl p-4 text-center ${sinGangColor}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">일간 기운</p>
            <p className="text-base font-black">{sinGangLabel}</p>
            <p className="text-[10px] mt-0.5 opacity-60">{analysis.dayMasterStem}({analysis.dayMasterElement})</p>
          </div>
          <div className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">사주 MBTI</p>
            <p className="text-xl font-black">{analysis.mbti}</p>
          </div>
        </div>

        {/* ── 무료: 성격 키워드 ── */}
        <div className="flex flex-wrap gap-2 justify-center">
          {analysis.characteristics.map((c, i) => (
            <span key={i} className="px-4 py-2 bg-violet-500/20 border border-violet-500/40 text-violet-300 rounded-full text-sm font-bold">
              {c}
            </span>
          ))}
        </div>

        {/* ── 무료: 한 줄 요약 ── */}
        <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">✨ 한 줄 사주 요약</p>
          <p className="text-gray-200 leading-relaxed text-sm font-semibold">{analysis.oneLineSummary}</p>
        </div>

        {/* ── 잠금 오버레이 / 유료 섹션 ── */}
        {!paid ? (
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-lg">
            {/* 흐린 미리보기 */}
            <div className="p-5 blur-sm select-none pointer-events-none bg-[#13131a] space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                <p className="text-xs text-violet-400 mb-1">🧬 타고난 기질</p>
                <p className="text-sm text-gray-300">강한 의지와 추진력을 타고났으며...</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                <p className="text-xs text-emerald-400 mb-1">💼 직업 적성</p>
                <p className="text-sm text-gray-300">창의적 분야, 리더십이 요구되는...</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                <p className="text-xs text-amber-400 mb-1">🌟 올해 운세</p>
                <p className="text-sm text-gray-300">올해는 변화와 기회가 함께 찾아오는...</p>
              </div>
              <div className="flex items-end gap-1 h-16">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-violet-400/50"
                    style={{ height: `${30 + Math.sin(i) * 20}px` }} />
                ))}
              </div>
            </div>
            {/* 잠금 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#13131a]/20 to-[#13131a]/90 flex flex-col items-center justify-center gap-3 p-6">
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl">🔒</div>
              <p className="text-white font-black text-lg text-center">전체 사주 분석이<br />잠겨있습니다</p>
              <p className="text-gray-400 text-sm text-center">기질·적성·재물운·연애·건강<br/>올해운세·월별 운세 차트 전체 공개</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 px-8 py-4 bg-violet-500 hover:bg-violet-400 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                🔮 990원으로 내 사주 전체 보기
              </button>
            </div>
          </div>
        ) : (
          /* ── 결제 완료: 전체 공개 ── */
          <>
            {justUnlocked && (
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl p-4 text-white text-center animate-bounce shadow-lg">
                <p className="text-xl font-black mb-0.5">🎉 사주 분석이 열렸습니다!</p>
                <p className="text-sm text-violet-100">{name}님의 모든 사주 정보가 공개됩니다</p>
              </div>
            )}

            {/* 타고난 기질 */}
            {analysis.personality && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-violet-400 font-medium mb-2">🧬 타고난 기질</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.personality}</p>
              </div>
            )}

            {/* 강점 3가지 */}
            {analysis.strengths?.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-emerald-400 font-medium mb-3">💪 나의 강점</p>
                <div className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-300 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 주의사항 3가지 */}
            {analysis.weaknesses?.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5">
                <p className="text-xs text-red-400 font-medium mb-3">⚠️ 주의사항</p>
                <div className="space-y-2">
                  {analysis.weaknesses.map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-400 text-xs mt-0.5 shrink-0">•</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 직업 적성 */}
            {analysis.career && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-amber-400 font-medium mb-2">💼 직업 적성</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.career}</p>
              </div>
            )}

            {/* 재물운 */}
            {analysis.wealthFortune && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-yellow-400 font-medium mb-2">💰 재물운</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.wealthFortune}</p>
              </div>
            )}

            {/* 연애/결혼 스타일 */}
            {analysis.loveStyle && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-pink-400 font-medium mb-2">💕 연애/결혼 스타일</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.loveStyle}</p>
              </div>
            )}

            {/* 건강 주의 */}
            {analysis.healthCaution && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-teal-400 font-medium mb-2">🏥 건강 주의</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.healthCaution}</p>
              </div>
            )}

            {/* 올해 운세 */}
            {analysis.thisYearFortune && (
              <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/30 rounded-2xl p-5">
                <p className="text-xs text-indigo-400 font-medium mb-2">🌟 올해 운세</p>
                <p className="text-sm text-gray-200 leading-relaxed">{analysis.thisYearFortune}</p>
              </div>
            )}

            {/* 현재 대운 */}
            {analysis.currentDaeun && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">🔮 현재 대운</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-2xl font-black text-violet-300">
                    {analysis.currentDaeun}
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">{analysis.currentDaeun} 대운</p>
                    <p className="text-gray-400 text-sm mt-0.5">{analysis.currentDaeunAge}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 월별 운세 바 차트 */}
            {analysis.monthlyFortune?.length === 12 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-violet-400 font-medium mb-4">📊 월별 운세</p>
                <div className="flex items-end gap-1 h-24">
                  {analysis.monthlyFortune.map((v, i) => {
                    const heightPct = (v / maxFortune) * 80;
                    const isHigh = v >= 70;
                    const barClass = isHigh
                      ? "bg-gradient-to-t from-blue-600 to-blue-400"
                      : "bg-white/20";
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-md transition-all duration-700 ${barClass}`}
                          style={{ height: `${heightPct}px`, minHeight: "4px" }}
                        />
                        <span className="text-[9px] text-gray-400">{i + 1}월</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 대운 흐름 */}
            {analysis.lifePhases?.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-amber-400 font-medium mb-4">🗺️ 대운 흐름</p>
                <div className="space-y-3">
                  {analysis.lifePhases.map((phase, i) => {
                    const ratingPct = Math.min(100, Math.max(0, phase.rating));
                    return (
                      <div key={i} className="bg-white/4 border border-white/8 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-gray-200">{phase.age}</span>
                          <span className="text-xs text-amber-400 font-semibold">{phase.rating}점</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{phase.theme}</p>
                        <div className="w-full bg-white/8 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
                            style={{ width: `${ratingPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 행운 키워드 */}
            {analysis.luckyElements?.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-yellow-400 font-medium mb-3">✨ 행운 키워드</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.luckyElements.map((el, i) => (
                    <span key={i} className="px-3 py-1.5 bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 rounded-full text-sm font-semibold">
                      {el}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 지금 해야 할 행동 */}
            {analysis.actionNow?.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-emerald-400 font-medium mb-3">🚀 지금 해야 할 행동</p>
                <div className="space-y-2">
                  {analysis.actionNow.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/8">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-gray-900 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
