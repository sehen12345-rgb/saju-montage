"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SajuInputForm from "@/components/SajuInputForm";
import LoadingScreen from "@/components/LoadingScreen";
import type { SajuInput, GenerateResult } from "@/lib/types";
import { getSajuSeed } from "@/lib/prompts";

export default function InputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: SajuInput) {
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      // Step 1: 사주 분석 (deterministic, instant)
      setLoadingStep(0);
      const analysisRes = await fetch("/api/analyze-saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!analysisRes.ok) {
        const err = await analysisRes.json();
        throw new Error(err.error || "사주 분석 실패");
      }
      const analysis = await analysisRes.json();

      // Step 2: 인연 탐색 (visual pause)
      setLoadingStep(1);
      await new Promise((r) => setTimeout(r, 1200));

      // Step 3: 이미지 준비 (Pollinations URL — client-side, free)
      setLoadingStep(2);
      await new Promise((r) => setTimeout(r, 800));

      const spouseGender = data.gender === "male" ? "woman" : "man";
      const seed = getSajuSeed(analysis.sajuInfo, spouseGender);
      const encoded = encodeURIComponent(analysis.imagePrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&model=flux&seed=${seed}&nologo=true&enhance=false`;

      const result: GenerateResult = {
        name: data.name,
        analysis,
        imageUrl,
        gender: data.gender,
        demo: false,
      };
      sessionStorage.setItem("sajuResult", JSON.stringify(result));
      router.push("/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setLoading(false);
      setLoadingStep(0);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-amber-600 hover:text-amber-800 transition-colors">
            ← 홈
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">사주 입력</h1>
        </div>


<div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-amber-100 p-6">
          {loading ? (
            <LoadingScreen step={loadingStep} />
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-amber-700 text-sm">생년월일시와 성별을 입력해주세요</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <SajuInputForm onSubmit={handleSubmit} loading={loading} />
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 입력 정보는 저장되지 않습니다 · 사주 분석 무료 · AI 몽타주·전체 결과 990원
        </p>
      </div>
    </div>
  );
}
