"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SajuInputForm from "@/components/SajuInputForm";
import LoadingScreen from "@/components/LoadingScreen";
import type { SajuInput, GenerateResult } from "@/lib/types";

export default function InputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  async function handleSubmit(data: SajuInput) {
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      // Step 1: 사주 분석
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
      const demoMode = !!analysis.demo;
      setIsDemo(demoMode);

      // Step 2: 인연 탐색
      setLoadingStep(1);

      // Step 3: 이미지 생성
      setLoadingStep(2);
      const imageRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: analysis.imagePrompt,
          gender: data.gender,
          sajuInfo: analysis.sajuInfo,
          demo: demoMode,
        }),
      });
      if (!imageRes.ok) {
        const err = await imageRes.json();
        throw new Error(err.error || "이미지 생성 실패");
      }
      const { imageUrl } = await imageRes.json();

      const result: GenerateResult = { name: data.name, analysis, imageUrl, demo: demoMode };
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

        {/* API 키 안내 배너 */}
        {!loading && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm space-y-2">
            <p className="font-semibold">📸 실제 AI 포토리얼리스틱 이미지를 원하신다면</p>
            <div className="space-y-1 text-xs text-amber-700">
              <p>
                <span className="font-medium">① 무료:</span>{" "}
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer"
                   className="underline">huggingface.co</a>
                {" "}회원가입 → 토큰 발급 →{" "}
                <code className="bg-amber-100 px-1 rounded">HF_TOKEN</code> 입력
              </p>
              <p>
                <span className="font-medium">② 유료:</span>{" "}
                OpenAI API 키 →{" "}
                <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> 입력
                <span className="text-amber-500 ml-1">(이미지당 약 ₩55)</span>
              </p>
            </div>
            <p className="text-xs text-amber-500">키 없이도 사주 분석 + SVG 초상화로 체험 가능합니다.</p>
          </div>
        )}

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
          입력하신 정보는 서버에 저장되지 않습니다
        </p>
      </div>
    </div>
  );
}
