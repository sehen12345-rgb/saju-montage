"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultCard from "@/components/ResultCard";
import GuardianResultCard from "@/components/GuardianResultCard";
import EnemyResultCard from "@/components/EnemyResultCard";
import type { GenerateResult, SajuAnalysis, GuardianAnalysis, EnemyAnalysis } from "@/lib/types";
import SajuSummaryCard from "@/components/SajuSummaryCard";
import { makeSajuHash, isBundlePaid, saveBundlePaidRecord } from "@/lib/paymentStorage";

const PRODUCT_LABEL: Record<string, { emoji: string; name: string; color: string }> = {
  spouse:   { emoji: "💑", name: "내님은누구",   color: "text-rose-400" },
  guardian: { emoji: "🌟", name: "내귀인은누구", color: "text-yellow-400" },
  enemy:    { emoji: "😤", name: "내웬수는누구", color: "text-slate-400" },
};

const BUNDLE_TABS = [
  { key: "spouse",   emoji: "💑", label: "내님은누구",   color: "from-rose-500 to-pink-600",   active: "text-rose-400",   border: "border-rose-500/30" },
  { key: "guardian", emoji: "🌟", label: "내귀인은누구", color: "from-amber-400 to-yellow-500", active: "text-amber-400",  border: "border-amber-500/30" },
  { key: "enemy",    emoji: "😤", label: "내웬수는누구", color: "from-slate-500 to-slate-600",  active: "text-slate-300",  border: "border-slate-500/30" },
] as const;

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [bundleTab, setBundleTab] = useState<"spouse" | "guardian" | "enemy">("spouse");
  const [bundlePaid, setBundlePaid] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = sessionStorage.getItem("sajuResult"); } catch { /* ignore */ }
    if (!stored) {
      try { stored = localStorage.getItem("sajuResult_backup"); } catch { /* ignore */ }
    }
    if (!stored) { router.replace("/input"); return; }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.analysis) throw new Error("invalid");
      parsed.paid = false; // ResultCard의 isPaidForSaju 검증 후에만 복원
      try { sessionStorage.setItem("sajuResult", JSON.stringify(parsed)); } catch { /* ignore */ }
      setResult(parsed);
    } catch {
      try { sessionStorage.removeItem("sajuResult"); } catch { /* ignore */ }
      try { localStorage.removeItem("sajuResult_backup"); } catch { /* ignore */ }
      router.replace("/input");
    }
  }, [router]);

  // 번들 결제 상태 복원 (브라우저 재방문 시)
  useEffect(() => {
    if (!result || result.productType !== "bundle") return;
    const sajuInfo = (result.analysis as SajuAnalysis)?.sajuInfo;
    if (!sajuInfo) return;
    const hash = makeSajuHash(sajuInfo.yearPillar, sajuInfo.monthPillar, sajuInfo.dayPillar, sajuInfo.hourPillar, result.gender ?? "male");
    if (isBundlePaid(hash)) setBundlePaid(true);
  }, [result]);

  function handleBundlePaid() {
    setBundlePaid(true);
    const sajuInfo = (result?.analysis as SajuAnalysis)?.sajuInfo;
    if (sajuInfo) {
      const hash = makeSajuHash(sajuInfo.yearPillar, sajuInfo.monthPillar, sajuInfo.dayPillar, sajuInfo.hourPillar, result?.gender ?? "male");
      saveBundlePaidRecord(hash, `demo_${Date.now()}`);
    }
  }

  function handleReset() {
    sessionStorage.removeItem("sajuResult");
    router.push("/");
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d12]">
        <div className="text-gray-600 animate-pulse text-base">불러오는 중...</div>
      </div>
    );
  }

  const isBundle = result.productType === "bundle";
  const isGuardian = result.productType === "guardian";
  const isEnemy = result.productType === "enemy";
  const analysis = result.analysis as { sajuInfo: { yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string } };
  const productMeta = PRODUCT_LABEL[isBundle ? "spouse" : (result.productType ?? "spouse")];

  // 번들 탭에서 현재 탭의 result 생성
  function getBundleResult(): GenerateResult | null {
    if (!result?.bundleResults) return null;
    const br = result.bundleResults[bundleTab];
    if (!br) return null;
    return { ...result, analysis: br.analysis, imageUrl: br.imageUrl, productType: bundleTab, paid: bundlePaid };
  }

  return (
    <div className="min-h-screen bg-[#0d0d12]">
      <div className="max-w-md mx-auto px-4 py-5">
        {/* 유저 정보 카드 */}
        <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5 mb-4">
          <div className="flex items-start justify-between mb-1">
            <div className="space-y-0.5">
              <p className="font-black text-white text-base">
                {result.name} <span className="text-sm font-normal text-gray-500">(본인)</span>
              </p>
              <p className="text-xs text-gray-600">{result.gender === "male" ? "👨 남성" : "👩 여성"}</p>
              {isBundle ? (
                <p className="text-xs font-bold text-purple-400">🔮 3종 묶음 분석</p>
              ) : (
                <p className={`text-xs font-bold ${productMeta.color}`}>
                  {productMeta.emoji} {productMeta.name}
                </p>
              )}
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-bold active:scale-95 transition-all hover:bg-white/20 shrink-0"
            >
              홈으로
            </button>
          </div>
          <SajuSummaryCard sajuInfo={analysis.sajuInfo} name={result.name} />
        </div>

        {result.demo && (
          <div className="mb-4 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm flex items-start gap-2">
            <span>🎭</span>
            <span>데모 결과입니다.</span>
          </div>
        )}

        {isBundle ? (
          <>
            {/* 번들 탭 */}
            <div className="bg-[#13131a] border border-white/10 rounded-2xl p-1.5 mb-4 flex gap-1">
              {BUNDLE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setBundleTab(tab.key)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    bundleTab === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.emoji} {tab.key === "spouse" ? "내님" : tab.key === "guardian" ? "귀인" : "웬수"}
                </button>
              ))}
            </div>
            {(() => {
              const br = getBundleResult();
              if (!br) return <p className="text-center text-gray-600 py-8">분석 데이터를 불러올 수 없습니다.</p>;
              if (bundleTab === "guardian") return <GuardianResultCard key="guardian" result={br} onReset={handleReset} onPaid={handleBundlePaid} />;
              if (bundleTab === "enemy")    return <EnemyResultCard    key="enemy"    result={br} onReset={handleReset} onPaid={handleBundlePaid} />;
              return <ResultCard key="spouse" result={br} onReset={handleReset} onPaid={handleBundlePaid} />;
            })()}
          </>
        ) : isGuardian ? (
          <GuardianResultCard result={result} onReset={handleReset} />
        ) : isEnemy ? (
          <EnemyResultCard result={result} onReset={handleReset} />
        ) : (
          <ResultCard result={result} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
