"use client";

import { useState, useEffect } from "react";
import type { GenerateResult, EnemyAnalysis } from "@/lib/types";
import { isPaidForSaju, savePaidRecord, makeProductHash } from "@/lib/paymentStorage";

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

function SajuPillarCard({ sajuInfo }: { sajuInfo: import("@/lib/types").SajuInfo }) {
  const pillars = [
    { label: "시주", value: sajuInfo.hourPillar },
    { label: "일주", value: sajuInfo.dayPillar },
    { label: "월주", value: sajuInfo.monthPillar },
    { label: "년주", value: sajuInfo.yearPillar },
  ];

  return (
    <div className="bg-[#13131a] border border-white/8 rounded-3xl p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">당신의 사주팔자</p>
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
      <div className="grid grid-cols-4 gap-2 mb-2">
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

function PayModal({ onClose, onPay }: { onClose: () => void; onPay: () => void }) {
  const [paying, setPaying] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(599);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  async function handlePay(type: "individual" | "bundle" | "card") {
    if (paying) return;
    setPaying(type);
    await new Promise((r) => setTimeout(r, 900));
    setPaying(null);
    onPay();
  }

  const ITEMS = ["😤 웬수 AI 프로필 이미지", "💬 웬수 접근 메시지 패턴", "⚠️ 피해를 주는 영역", "🛡️ 웬수 피하는 방법", "🌙 전생 악연 이야기", "📅 웬수 출현 시기", "😰 나의 약점 분석", "📊 월별 위험도 차트", "🔍 웬수 알아보는 법", "🚀 자기보호 실천 가이드", "🎯 주의사항 3가지", "🌱 악연 방어력 체크"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-md">
      <div className="bg-[#0f0f18] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto">

        {/* 헤더 */}
        <div className="relative p-5 text-center border-b border-white/8">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-orange-900/20 pointer-events-none" />
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl z-10">✕</button>
          <div className="relative">
            <div className="text-4xl mb-2">😤</div>
            <h2 className="text-xl font-black text-white">웬수 분석 공개</h2>
            <p className="text-gray-400 text-xs mt-1 mb-3">웬수 프로필 + 완전 분석 보고서</p>
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
            {ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-300 bg-white/4 border border-white/6 rounded-xl px-2.5 py-2">
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* ── 번들 특가 (추천) ── */}
          <div className="relative rounded-2xl border-2 border-purple-500/50 bg-purple-500/8 p-4 overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl">BEST</div>
            <p className="text-xs font-bold text-purple-300 mb-1">💜 3개 묶음 특가</p>
            <p className="text-sm text-white font-bold mb-0.5">배우자 + 귀인 + 웬수 전부 공개</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs text-gray-500 line-through">6,000원</span>
              <span className="text-2xl font-black text-purple-300">5,000원</span>
              <span className="text-xs text-purple-400 font-bold">1,000원 절약</span>
            </div>
            <button
              onClick={() => handlePay("bundle")}
              disabled={!!paying}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black text-sm active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {paying === "bundle" ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "💜 5,000원으로 3개 전부 보기"}
            </button>
          </div>

          {/* ── 개별 결제 ── */}
          <div className="space-y-2">
            <p className="text-[11px] text-gray-500 text-center">— 또는 이 상품만 —</p>
            <div className="bg-white/4 border border-white/8 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <span className="text-xs text-gray-500 line-through">6,000원</span>
                <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full">67% 할인</span>
              </div>
              <p className="text-2xl font-black text-white">2,000<span className="text-base font-bold">원</span></p>
              <p className="text-xs text-gray-500 mt-0.5">1회 결제 · 회원가입 불필요</p>
            </div>

            <button
              onClick={() => handlePay("individual")}
              disabled={!!paying}
              className="w-full py-4 rounded-2xl font-black text-base text-gray-900 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: "#FEE500" }}
            >
              {paying === "individual" ? <span className="w-5 h-5 border-2 border-gray-400/40 border-t-gray-700 rounded-full animate-spin" /> : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0"><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/></svg>
                  카카오페이 2,000원
                </>
              )}
            </button>

            <button
              onClick={() => handlePay("card")}
              disabled={!!paying}
              className="w-full py-3.5 rounded-2xl border border-white/15 text-gray-300 font-semibold text-sm active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {paying === "card" ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "💳 신용·체크카드 2,000원"}
            </button>

            <button onClick={onClose} className="w-full py-2.5 text-gray-600 text-sm hover:text-gray-400 transition-colors">
              나중에 볼게요
            </button>
          </div>

          <p className="text-[10px] text-gray-600 text-center">
            토스페이먼츠 PG · 결제 정보 저장 없음
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, delay = 0, danger = false }: { label: string; score: number; delay?: number; danger?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-white/8 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${danger ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-yellow-400 to-amber-400"}`}
          style={{ width: `${score}%`, transition: `width 0.8s ease ${delay}ms` }}
        />
      </div>
      <span className={`text-xs font-black w-8 text-right ${danger ? "text-red-400" : "text-amber-400"}`}>{score}</span>
    </div>
  );
}

interface Props {
  result: GenerateResult;
  onReset: () => void;
}

export default function EnemyResultCard({ result, onReset }: Props) {
  const analysis = result.analysis as EnemyAnalysis;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  // TODO: TossPayments PG 승인 후 아래를 (result.paid ?? false) 로 변경
  const [paid, setPaid] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  const imageUrl = result.imageUrl;

  const productHash = analysis?.sajuInfo
    ? makeProductHash(
        analysis.sajuInfo.yearPillar, analysis.sajuInfo.monthPillar,
        analysis.sajuInfo.dayPillar,  analysis.sajuInfo.hourPillar,
        result.gender ?? "male",
        "enemy"
      )
    : "";

  useEffect(() => {
    if (paid) return;
    const handler = () => setShowStickyBtn(window.scrollY > 300);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [paid]);

  useEffect(() => {
    if (!paid && productHash && isPaidForSaju(productHash)) {
      setPaid(true);
      try {
        const stored = sessionStorage.getItem("sajuResult");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.paid = true;
          sessionStorage.setItem("sajuResult", JSON.stringify(parsed));
        }
      } catch { /* ignore */ }
    }
  }, [productHash, paid]);

  function handlePaySuccess() {
    setShowModal(false);
    setPaid(true);
    setJustUnlocked(true);
    setTimeout(() => setJustUnlocked(false), 4000);
    try {
      const stored = sessionStorage.getItem("sajuResult");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.paid = true;
        sessionStorage.setItem("sajuResult", JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
    if (productHash) savePaidRecord(productHash, `demo_${Date.now()}`);
  }

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
      if (!proxyRes.ok) throw new Error("다운로드 실패");
      const blob = await proxyRes.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `웬수_초상화.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  async function handleShareKakao() {
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    const shareText = `${result.name}님의 사주로 본 웬수\n"${analysis.characteristics.join(" · ")}"\n악연 분석 확인하기 →`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Kakao = (window as any).Kakao;
    if (jsKey && Kakao) {
      if (!Kakao.isInitialized()) Kakao.init(jsKey);
      Kakao.Share.sendDefault({
        objectType: "text",
        text: shareText,
        link: { mobileWebUrl: "https://saju-montage.vercel.app", webUrl: "https://saju-montage.vercel.app" },
        buttonTitle: "나도 해보기",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\nhttps://saju-montage.vercel.app`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("클립보드 복사에 실패했습니다.");
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText("https://saju-montage.vercel.app");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("클립보드 복사에 실패했습니다.");
    }
  }

  return (
    <>
      {showModal && <PayModal onClose={() => setShowModal(false)} onPay={handlePaySuccess} />}

      {!paid && showStickyBtn && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 animate-slideUp">
          <button
            onClick={() => setShowModal(true)}
            className="w-full max-w-md mx-auto flex items-center justify-between gap-3 py-4 px-6 rounded-2xl bg-red-500 text-white font-bold shadow-2xl active:scale-95 transition-all"
            style={{ display: "flex" }}
          >
            <span className="text-lg">😤 웬수 전체 분석 보기</span>
            <span className="bg-white/20 rounded-xl px-3 py-1 text-sm font-black">2,000원</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        <SajuPillarCard sajuInfo={analysis.sajuInfo} />

        {/* 웬수 유형 배지 */}
        <div className="bg-red-900/40 border border-red-500/30 rounded-2xl p-4 text-center">
          <p className="text-xs text-red-300 mb-2">⚔️ 나의 웬수 유형</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{analysis.enemyTypeEmoji}</span>
            <span className="text-white font-black text-xl">{analysis.enemyType}</span>
          </div>
        </div>

        {/* 핵심 특징 태그 */}
        <div className="flex flex-wrap gap-2 justify-center">
          {analysis.characteristics.map((c, i) => (
            <span key={i} className="px-4 py-2 bg-red-900/40 border border-red-500/30 text-red-300 rounded-full text-sm font-bold">
              {c}
            </span>
          ))}
        </div>

        {/* 외모 힌트 (부분 블러) */}
        <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5 relative overflow-hidden">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">🔍 웬수 첫인상 힌트</p>
          <p className="text-gray-300 leading-relaxed text-sm">{analysis.description.slice(0, 40)}...</p>
          <div className="mt-2 blur-sm select-none pointer-events-none">
            <p className="text-gray-500 text-sm leading-relaxed">{analysis.description.slice(40)}</p>
          </div>
        </div>

        {!paid ? (
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-lg">
            <div className="p-5 blur-sm select-none pointer-events-none bg-[#13131a] space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                <p className="text-xs text-red-400 mb-1">⚠️ 피해를 주는 영역</p>
                <p className="text-sm font-bold text-white">재정, 인간관계, 감정</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                <p className="text-xs text-orange-400 mb-1">🛡️ 웬수 피하는 방법</p>
                <p className="text-sm text-gray-300">직장이나 업무 환경에서...</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                <p className="text-xs text-purple-400 mb-1">🌙 전생 악연</p>
                <p className="text-sm text-gray-300">전생에 경쟁 관계였습니다...</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#13131a]/20 to-[#13131a]/85 flex flex-col items-center justify-center gap-3 p-6">
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl">🔒</div>
              <p className="text-white font-black text-lg text-center">웬수의 모든 것이<br />잠겨있습니다</p>
              <p className="text-gray-400 text-sm text-center">웬수 프로필 이미지, 피하는 방법,<br/>전생 악연, 월별 위험도 등 전체 공개</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 px-8 py-4 bg-red-500 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                😤 2,000원으로 웬수 확인하기
              </button>
            </div>
          </div>
        ) : (
          <>
            {justUnlocked && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white text-center animate-bounce shadow-lg">
                <p className="text-xl font-black mb-0.5">🎉 웬수가 나타났습니다!</p>
                <p className="text-sm text-red-100">웬수의 모든 것이 열렸습니다. 조심하세요!</p>
              </div>
            )}

            {/* 웬수 요약 카드 */}
            <div className="bg-gradient-to-br from-red-900 to-orange-900 rounded-3xl p-5 text-white shadow-2xl">
              <p className="text-xs text-red-300 font-semibold mb-4 text-center uppercase tracking-widest">악연 분석 요약</p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-5xl">
                    {analysis.enemyTypeEmoji}
                  </div>
                  <span className="text-xs text-red-300">{analysis.enemyType}</span>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { icon: "🤝", label: "관계유형", value: analysis.relationship },
                    { icon: "🎂", label: "주의시기", value: analysis.meetTiming.ageRange },
                    { icon: "🌸", label: "계절", value: analysis.meetTiming.season },
                    { icon: "📍", label: "상황", value: analysis.meetTiming.situation },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="text-[10px] text-red-400 w-14 shrink-0">{item.label}</span>
                      <span className="text-xs font-semibold text-white truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {analysis.readiness && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-red-300">🛡️ 악연 방어력</span>
                    <span className="text-sm font-black text-red-300">{analysis.readiness.score}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-red-400 to-orange-400"
                      style={{ width: `${analysis.readiness.score}%`, transition: "width 1.2s ease" }}/>
                  </div>
                </div>
              )}
            </div>

            {/* 웬수 AI 프로필 이미지 */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-[#13131a]">
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-red-900/40 border-t-red-400 animate-spin" />
                </div>
              )}
              {imgError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#13131a]">
                  <span className="text-4xl">😓</span>
                  <p className="text-gray-400 text-sm">이미지를 불러오지 못했습니다</p>
                  <button
                    onClick={() => { setImgError(false); setImgLoaded(false); }}
                    className="px-4 py-2 bg-white/10 text-gray-300 rounded-xl text-sm font-semibold hover:bg-white/15"
                  >🔄 재시도</button>
                </div>
              )}
              {!imgError && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="AI가 생성한 웬수 초상화"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              )}
              {imgLoaded && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center px-4">
                    <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full">
                      사주로 그린 웬수 초상화
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 웬수 외모 묘사 */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <p className="text-xs text-red-400 font-medium mb-2">✨ 웬수 첫인상</p>
              <p className="text-sm text-gray-300 leading-relaxed">{analysis.description}</p>
            </div>

            {/* 피해를 주는 영역 */}
            {analysis.dangerAreas?.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-red-400 font-medium mb-1">⚠️ 피해를 주는 영역</p>
                <h4 className="text-base font-bold text-white mb-4">웬수가 끼치는 악영향</h4>
                <div className="space-y-3">
                  {analysis.dangerAreas.map((area, i) => (
                    <div key={i}>
                      <ScoreBar label={area.area} score={area.score} delay={i * 120} danger />
                      <p className="text-xs text-gray-400 mt-1">{area.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 웬수 피하는 방법 */}
            {analysis.howToAvoid && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-orange-400 font-medium mb-1">🛡️ 웬수 피하는 방법</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.howToAvoid}</p>
              </div>
            )}

            {/* 주의 시기 */}
            {analysis.meetTiming && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-red-400 font-medium mb-3">📅 웬수 출현 시기 예측</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "나이대", value: analysis.meetTiming.ageRange, icon: "🎂" },
                    { label: "계절", value: analysis.meetTiming.season, icon: "🌸" },
                    { label: "상황", value: analysis.meetTiming.situation, icon: "📍" },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/5 rounded-xl p-3 border border-white/8">
                      <div className="text-lg mb-1">{m.icon}</div>
                      <div className="text-xs text-red-400 mb-1">{m.label}</div>
                      <div className="text-xs font-bold text-white leading-snug">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 나의 약점 */}
            {analysis.myWeakness && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-orange-400 font-medium mb-2">😰 웬수에게 이용당하는 나의 약점</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.myWeakness}</p>
              </div>
            )}

            {/* 웬수가 끼치는 피해 */}
            {analysis.damage && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5">
                <p className="text-xs text-red-400 font-medium mb-2">💢 웬수가 끼치는 피해</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.damage}</p>
              </div>
            )}

            {/* 웬수 알아보는 법 */}
            {analysis.signToRecognize && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-red-400 font-medium mb-2">🔍 웬수를 알아보는 법</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.signToRecognize}</p>
              </div>
            )}

            {/* 웬수의 접근 메시지 */}
            {analysis.kakaoFirstMessage && (
              <div className="bg-[#FEE500] rounded-2xl p-5 border border-yellow-300">
                <p className="text-xs text-yellow-700 font-medium mb-1">💬 웬수가 처음 접근할 때 보낼 메시지</p>
                <p className="text-xs text-yellow-700/70 mb-3">⚠️ 이런 메시지가 오면 주의하세요!</p>
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed">{analysis.kakaoFirstMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 전생 악연 */}
            {analysis.pastLifeConnection && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white border border-white/8">
                <p className="text-xs text-slate-300 font-medium mb-2">🌙 전생 악연 이야기</p>
                <p className="text-sm text-slate-200 leading-relaxed">{analysis.pastLifeConnection}</p>
              </div>
            )}

            {/* 주의사항 */}
            {analysis.caution?.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5">
                <p className="text-xs text-red-400 font-medium mb-3">⚠️ 주의사항</p>
                <div className="space-y-2">
                  {analysis.caution.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-400 text-xs mt-0.5 shrink-0">•</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 실천 가이드 */}
            {analysis.actionGuide?.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-red-400 font-medium mb-3">🚀 자기보호 실천 가이드</p>
                <div className="space-y-2">
                  {analysis.actionGuide.map((g, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/8">
                      <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">{g}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 월별 위험도 차트 */}
            {analysis.monthlyDanger?.length === 12 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-red-400 font-medium mb-4">📊 월별 악연 위험도</p>
                <div className="flex items-end gap-1 h-24">
                  {analysis.monthlyDanger.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-red-500 transition-all duration-700"
                        style={{ height: `${(v / 100) * 80}px`, minHeight: "4px" }}
                      />
                      <span className="text-[9px] text-gray-400">{i + 1}월</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 악연 방어력 */}
            {analysis.readiness && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-emerald-400 font-medium mb-1">🛡️ 악연 방어력</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-emerald-400">{analysis.readiness.score}%</span>
                </div>
                <div className="w-full bg-white/8 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-1000"
                    style={{ width: `${analysis.readiness.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{analysis.readiness.comment}</p>
              </div>
            )}

            {/* 이미지 다운로드 */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3.5 rounded-2xl border border-white/15 text-gray-300 font-semibold text-sm hover:border-white/25 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {downloading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "💾"}
              {downloading ? "저장 중..." : "웬수 이미지 저장하기"}
            </button>

            {/* 공유 버튼 */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareKakao}
                className="py-3.5 rounded-2xl font-semibold text-sm text-gray-900 active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: "#FEE500" }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                  <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                </svg>
                카카오 공유
              </button>
              <button
                onClick={handleCopyLink}
                className="py-3.5 rounded-2xl border border-white/15 text-gray-300 font-semibold text-sm hover:border-white/25 active:scale-95 transition-all"
              >
                {copied ? "✅ 복사됨!" : "🔗 링크 복사"}
              </button>
            </div>
          </>
        )}

        <button
          onClick={onReset}
          className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-semibold text-sm hover:bg-white/8 active:scale-95 transition-all"
        >
          🔄 다시 분석하기
        </button>
      </div>
    </>
  );
}
