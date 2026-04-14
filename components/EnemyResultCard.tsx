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
    <div className="bg-white rounded-3xl p-4 shadow-sm">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">당신의 사주팔자</p>
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
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(599);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  async function handlePay(method: "카카오페이" | "카드") {
    if (paying) return;
    setPaying(true);
    setError(null);

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    const isDemoAllowed = process.env.NEXT_PUBLIC_DEMO_PAYMENT === "true";

    if (!clientKey || clientKey === "your_toss_client_key_here") {
      if (isDemoAllowed) {
        await new Promise((r) => setTimeout(r, 1200));
        setPaying(false);
        onPay();
        return;
      }
      setError("결제 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.");
      setPaying(false);
      return;
    }

    try {
      if (!document.querySelector('script[src*="js.tosspayments.com"]')) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://js.tosspayments.com/v1/payment";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("결제 모듈 로드 실패"));
          document.head.appendChild(script);
        });
      }

      const orderId = `enemy${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem("paymentOrderId", orderId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tossPayments = (window as any).TossPayments(clientKey);
      await tossPayments.requestPayment(method, {
        amount: 990,
        orderId,
        orderName: "사주 악연 AI 분석",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      const errName = err instanceof Error ? err.name : "";
      const isCanceled = errName === "AbortError" || errName === "USER_CANCEL";
      if (!isCanceled) {
        setError("결제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="bg-red-900 p-5 text-white text-center sticky top-0 z-10">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white text-xl leading-none">✕</button>
          <div className="text-3xl mb-1.5">😤</div>
          <h2 className="text-lg font-bold">웬수 AI 분석 공개</h2>
          <p className="text-red-200 text-xs mt-0.5 mb-2">나의 웬수 프로필 + 전체 분석 결과</p>
          {timeLeft > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-red-500 rounded-full px-3 py-1 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              특가 종료까지 {minutes}:{seconds}
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">결제 후 공개되는 항목</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ["😤", "웬수 AI 프로필 이미지"],
                ["💬", "웬수의 접근 메시지"],
                ["⚠️", "피해를 주는 영역 3가지"],
                ["🛡️", "웬수 피하는 방법"],
                ["🌙", "전생 악연 이야기"],
                ["📅", "웬수 만남 시기"],
                ["😰", "나의 약점 분석"],
                ["📊", "월별 위험도 차트"],
                ["🔍", "웬수 알아보는 법"],
                ["🚀", "자기보호 실천 가이드"],
                ["🎯", "주의사항 3가지"],
                ["🌱", "악연 방어력 체크"],
              ].map(([icon, text]) => (
                <div key={text as string} className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 rounded-lg px-2.5 py-2">
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <span className="text-sm text-gray-400 line-through">3,900원</span>
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">74% 할인</span>
            </div>
            <p className="text-3xl font-black text-gray-900">990<span className="text-lg font-bold">원</span></p>
            <p className="text-xs text-gray-400 mt-0.5">1회 결제 · 회원가입 불필요</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 rounded-xl px-3 py-2 flex items-center gap-2">
              <span>⚠️</span><span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400">✕</button>
            </div>
          )}

          <div className="space-y-2.5">
            <button
              onClick={() => handlePay("카카오페이")}
              disabled={paying}
              className="w-full py-4 rounded-2xl font-bold text-base text-gray-900 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md"
              style={{ backgroundColor: "#FEE500" }}
            >
              {paying ? (
                <span className="w-5 h-5 border-2 border-gray-400/40 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
                  <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                </svg>
              )}
              {paying ? "결제 처리 중..." : "카카오페이로 결제하기"}
            </button>

            <button
              onClick={() => handlePay("카드")}
              disabled={paying}
              className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              💳 신용·체크카드로 결제
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              나중에 볼게요
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            토스페이먼츠 PG · 결제 정보는 저장되지 않습니다
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, delay = 0, danger = false }: { label: string; score: number; delay?: number; danger?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${danger ? "bg-red-400" : "bg-yellow-400"}`}
          style={{ width: `${score}%`, transition: `width 0.8s ease ${delay}ms` }}
        />
      </div>
      <span className="text-xs font-black w-8 text-right text-gray-700">{score}</span>
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
  const [paid, setPaid] = useState(result.paid ?? false);
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
      // 프록시 실패 시 직접 열기 fallback
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
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3">
          <button
            onClick={() => setShowModal(true)}
            className="w-full max-w-md mx-auto flex items-center justify-between gap-3 py-4 px-6 rounded-2xl bg-red-500 text-white font-bold shadow-2xl active:scale-95 transition-all"
            style={{ display: "flex" }}
          >
            <span className="text-lg">😤 웬수 전체 분석 보기</span>
            <span className="bg-white/20 rounded-xl px-3 py-1 text-sm font-black">990원</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        <SajuPillarCard sajuInfo={analysis.sajuInfo} />

        {/* 웬수 유형 배지 */}
        <div className="bg-red-900 rounded-2xl p-4 text-center">
          <p className="text-xs text-red-300 mb-2">⚔️ 나의 웬수 유형</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{analysis.enemyTypeEmoji}</span>
            <span className="text-white font-black text-xl">{analysis.enemyType}</span>
          </div>
        </div>

        {/* 핵심 특징 태그 */}
        <div className="flex flex-wrap gap-2 justify-center">
          {analysis.characteristics.map((c, i) => (
            <span key={i} className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold">
              {c}
            </span>
          ))}
        </div>

        {/* 외모 힌트 (부분 블러) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">🔍 웬수 첫인상 힌트</p>
          <p className="text-gray-700 leading-relaxed text-sm">{analysis.description.slice(0, 40)}...</p>
          <div className="mt-2 blur-sm select-none pointer-events-none">
            <p className="text-gray-500 text-sm leading-relaxed">{analysis.description.slice(40)}</p>
          </div>
        </div>

        {!paid ? (
          <div className="relative rounded-3xl overflow-hidden border-2 border-red-300 shadow-lg">
            <div className="p-5 blur-sm select-none pointer-events-none bg-white space-y-3">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-red-400 mb-1">⚠️ 피해를 주는 영역</p>
                <p className="text-sm font-bold text-red-900">재정, 인간관계, 감정</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-xs text-orange-400 mb-1">🛡️ 웬수 피하는 방법</p>
                <p className="text-sm text-gray-600">직장이나 업무 환경에서...</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs text-purple-400 mb-1">🌙 전생 악연</p>
                <p className="text-sm text-gray-600">전생에 경쟁 관계였습니다...</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/80 flex flex-col items-center justify-center gap-3 p-6">
              <div className="text-4xl">🔒</div>
              <p className="text-gray-900 font-black text-lg text-center">웬수의 모든 것이<br />잠겨있습니다</p>
              <p className="text-gray-500 text-sm text-center">웬수 프로필 이미지, 피하는 방법,<br/>전생 악연, 월별 위험도 등 전체 공개</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 px-8 py-4 bg-red-500 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                😤 990원으로 웬수 확인하기
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
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-red-300 bg-red-50">
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-red-200 border-t-red-500 animate-spin" />
                </div>
              )}
              {imgError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-red-50">
                  <span className="text-4xl">😓</span>
                  <p className="text-red-700 text-sm">이미지를 불러오지 못했습니다</p>
                  <button
                    onClick={() => { setImgError(false); setImgLoaded(false); }}
                    className="px-4 py-2 bg-red-200 text-red-800 rounded-xl text-sm font-semibold hover:bg-red-300"
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
            <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
              <p className="text-xs text-red-400 font-medium mb-2">✨ 웬수 첫인상</p>
              <p className="text-sm text-gray-700 leading-relaxed">{analysis.description}</p>
            </div>

            {/* 피해를 주는 영역 */}
            {analysis.dangerAreas?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                <p className="text-xs text-red-400 font-medium mb-1">⚠️ 피해를 주는 영역</p>
                <h4 className="text-base font-bold text-red-900 mb-4">웬수가 끼치는 악영향</h4>
                <div className="space-y-3">
                  {analysis.dangerAreas.map((area, i) => (
                    <div key={i}>
                      <ScoreBar label={area.area} score={area.score} delay={i * 120} danger />
                      <p className="text-xs text-gray-500 mt-1">{area.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 웬수 피하는 방법 */}
            {analysis.howToAvoid && (
              <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                <p className="text-xs text-orange-400 font-medium mb-1">🛡️ 웬수 피하는 방법</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.howToAvoid}</p>
              </div>
            )}

            {/* 주의 시기 */}
            {analysis.meetTiming && (
              <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                <p className="text-xs text-red-400 font-medium mb-3">📅 웬수 출현 시기 예측</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "나이대", value: analysis.meetTiming.ageRange, icon: "🎂" },
                    { label: "계절", value: analysis.meetTiming.season, icon: "🌸" },
                    { label: "상황", value: analysis.meetTiming.situation, icon: "📍" },
                  ].map((m) => (
                    <div key={m.label} className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <div className="text-lg mb-1">{m.icon}</div>
                      <div className="text-xs text-red-400 mb-1">{m.label}</div>
                      <div className="text-xs font-bold text-red-800 leading-snug">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 나의 약점 */}
            {analysis.myWeakness && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-200 shadow-sm">
                <p className="text-xs text-orange-500 font-medium mb-2">😰 웬수에게 이용당하는 나의 약점</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.myWeakness}</p>
              </div>
            )}

            {/* 웬수가 끼치는 피해 */}
            {analysis.damage && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-200 shadow-sm">
                <p className="text-xs text-red-500 font-medium mb-2">💢 웬수가 끼치는 피해</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.damage}</p>
              </div>
            )}

            {/* 웬수 알아보는 법 */}
            {analysis.signToRecognize && (
              <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                <p className="text-xs text-red-400 font-medium mb-2">🔍 웬수를 알아보는 법</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.signToRecognize}</p>
              </div>
            )}

            {/* 웬수의 접근 메시지 */}
            {analysis.kakaoFirstMessage && (
              <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
                <p className="text-xs text-yellow-600 font-medium mb-3">💬 웬수가 처음 접근할 때 보낼 메시지</p>
                <p className="text-xs text-gray-500 mb-2">⚠️ 이런 메시지가 오면 주의하세요!</p>
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-800 leading-relaxed">{analysis.kakaoFirstMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 전생 악연 */}
            {analysis.pastLifeConnection && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                <p className="text-xs text-slate-300 font-medium mb-2">🌙 전생 악연 이야기</p>
                <p className="text-sm text-slate-200 leading-relaxed">{analysis.pastLifeConnection}</p>
              </div>
            )}

            {/* 주의사항 */}
            {analysis.caution?.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <p className="text-xs text-red-400 font-medium mb-3">⚠️ 주의사항</p>
                <div className="space-y-2">
                  {analysis.caution.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-400 text-xs mt-0.5 shrink-0">•</span>
                      <p className="text-xs text-gray-700 leading-relaxed">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 실천 가이드 */}
            {analysis.actionGuide?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                <p className="text-xs text-red-400 font-medium mb-3">🚀 자기보호 실천 가이드</p>
                <div className="space-y-2">
                  {analysis.actionGuide.map((g, i) => (
                    <div key={i} className="flex items-start gap-3 bg-red-50 rounded-xl p-3">
                      <span className="w-6 h-6 rounded-full bg-red-400 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-700 leading-relaxed">{g}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 월별 위험도 차트 */}
            {analysis.monthlyDanger?.length === 12 && (
              <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                <p className="text-xs text-red-400 font-medium mb-4">📊 월별 악연 위험도</p>
                <div className="flex items-end gap-1 h-24">
                  {analysis.monthlyDanger.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-red-400 transition-all duration-700"
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 shadow-sm">
                <p className="text-xs text-green-500 font-medium mb-1">🛡️ 악연 방어력</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-green-700">{analysis.readiness.score}%</span>
                </div>
                <div className="w-full bg-green-100 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                    style={{ width: `${analysis.readiness.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{analysis.readiness.comment}</p>
              </div>
            )}

            {/* 이미지 다운로드 */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {downloading ? (
                <span className="w-4 h-4 border-2 border-gray-400/40 border-t-gray-600 rounded-full animate-spin" />
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
                className="py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 active:scale-95 transition-all"
              >
                {copied ? "✅ 복사됨!" : "🔗 링크 복사"}
              </button>
            </div>
          </>
        )}

        <button
          onClick={onReset}
          className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold text-sm hover:border-gray-300 active:scale-95 transition-all"
        >
          🔄 다시 분석하기
        </button>
      </div>
    </>
  );
}
