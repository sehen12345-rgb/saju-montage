"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultCard from "@/components/ResultCard";
import GuardianResultCard from "@/components/GuardianResultCard";
import EnemyResultCard from "@/components/EnemyResultCard";
import type { GenerateResult } from "@/lib/types";

const PRODUCT_LABEL: Record<string, { emoji: string; name: string; color: string }> = {
  spouse:   { emoji: "💑", name: "내님은누구",   color: "text-rose-400" },
  guardian: { emoji: "🌟", name: "내귀인은누구", color: "text-yellow-400" },
  enemy:    { emoji: "😤", name: "내웬수는누구", color: "text-slate-400" },
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GenerateResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("sajuResult");
    if (!stored) { router.replace("/input"); return; }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.analysis) throw new Error("invalid");
      setResult(parsed);
    } catch {
      sessionStorage.removeItem("sajuResult");
      router.replace("/input");
    }
  }, [router]);

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

  const isGuardian = result.productType === "guardian";
  const isEnemy = result.productType === "enemy";
  const analysis = result.analysis as { sajuInfo: { yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string } };
  const productMeta = PRODUCT_LABEL[result.productType ?? "spouse"];

  return (
    <div className="min-h-screen bg-[#0d0d12]">
      <div className="max-w-md mx-auto px-4 py-5">
        {/* 유저 정보 카드 */}
        <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5 mb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-black text-white text-base">
                {result.name} <span className="text-sm font-normal text-gray-500">(본인)</span>
              </p>
              <p className="text-sm text-gray-500 font-mono">
                {analysis.sajuInfo.yearPillar} · {analysis.sajuInfo.monthPillar} · {analysis.sajuInfo.dayPillar} · {analysis.sajuInfo.hourPillar}
              </p>
              <p className="text-sm text-gray-600">{result.gender === "male" ? "남성" : "여성"}</p>
              <p className={`text-xs font-bold ${productMeta.color}`}>
                {productMeta.emoji} {productMeta.name}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-bold active:scale-95 transition-all hover:bg-white/20"
            >
              홈으로
            </button>
          </div>
        </div>

        {result.demo && (
          <div className="mb-4 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm flex items-start gap-2">
            <span>🎭</span>
            <span>데모 결과입니다.</span>
          </div>
        )}

        {isGuardian ? (
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
