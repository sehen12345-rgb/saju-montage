"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultCard from "@/components/ResultCard";
import GuardianResultCard from "@/components/GuardianResultCard";
import type { GenerateResult } from "@/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GenerateResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("sajuResult");
    if (!stored) {
      router.replace("/input");
      return;
    }
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
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="text-gray-400 animate-pulse text-base">불러오는 중...</div>
      </div>
    );
  }

  const isGuardian = result.productType === "guardian";
  const analysis = result.analysis as { sajuInfo: { yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string } };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-md mx-auto px-4 py-5">
        {/* 유저 정보 카드 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-black text-gray-900 text-base">
                {result.name} <span className="text-sm font-normal text-gray-400">(본인)</span>
              </p>
              <p className="text-sm text-gray-600">
                {analysis.sajuInfo.yearPillar} · {analysis.sajuInfo.monthPillar} · {analysis.sajuInfo.dayPillar} · {analysis.sajuInfo.hourPillar}
              </p>
              <p className="text-sm text-gray-500">{result.gender === "male" ? "남성" : "여성"}</p>
              <p className="text-xs text-gray-400 font-semibold">
                {isGuardian ? "🌟 내귀인은누구" : "💑 내님은누구"}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-full bg-yellow-400 text-gray-900 text-sm font-bold active:scale-95 transition-all"
            >
              홈으로
            </button>
          </div>
        </div>

        {result.demo && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm flex items-start gap-2">
            <span>🎭</span>
            <span>데모 결과입니다. 실제 AI 분석을 원하시면 API 키를 설정해주세요.</span>
          </div>
        )}

        {isGuardian ? (
          <GuardianResultCard result={result} onReset={handleReset} />
        ) : (
          <ResultCard result={result} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
