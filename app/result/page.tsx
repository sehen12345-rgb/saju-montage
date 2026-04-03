"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultCard from "@/components/ResultCard";
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
      setResult(JSON.parse(stored));
    } catch {
      router.replace("/input");
    }
  }, [router]);

  function handleReset() {
    sessionStorage.removeItem("sajuResult");
    router.push("/input");
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-600 animate-pulse text-lg">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔮</div>
          <h1 className="text-2xl font-bold text-amber-900">당신의 배우자</h1>
          <p className="text-amber-600 text-sm mt-1">사주가 말해주는 운명의 상대</p>
        </div>

        {result.demo && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm flex items-start gap-2">
            <span>🎭</span>
            <span>데모 결과입니다. 실제 AI 분석을 원하시면 API 키를 설정해주세요.</span>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-amber-100 p-6">
          <ResultCard result={result} onReset={handleReset} />
        </div>
      </div>
    </div>
  );
}
