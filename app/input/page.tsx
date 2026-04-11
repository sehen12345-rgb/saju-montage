"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SajuInputForm from "@/components/SajuInputForm";
import LoadingScreen from "@/components/LoadingScreen";
import type { SajuInput, GenerateResult, ProductType } from "@/lib/types";
import { getSajuSeed } from "@/lib/prompts";

export default function InputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [productType, setProductType] = useState<ProductType>("spouse");

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedProduct") as ProductType | null;
    if (stored === "spouse" || stored === "guardian") {
      setProductType(stored);
    } else {
      setProductType("spouse");
    }
  }, []);

  const isGuardian = productType === "guardian";

  async function handleSubmit(data: SajuInput) {
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      setLoadingStep(0);

      const apiPath = isGuardian ? "/api/analyze-guardian" : "/api/analyze-saju";
      const analysisRes = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, productType }),
      });
      if (!analysisRes.ok) {
        const err = await analysisRes.json();
        throw new Error(err.error || "사주 분석 실패");
      }
      const analysis = await analysisRes.json();

      setLoadingStep(1);
      await new Promise((r) => setTimeout(r, 1200));

      setLoadingStep(2);
      await new Promise((r) => setTimeout(r, 800));

      let imageUrl: string;
      if (isGuardian) {
        // 귀인 이미지: guardian 성별 반전 (귀인은 조력자이므로 성별 제한 없음, 동성도 가능)
        const guardianGender = data.gender === "male" ? "man" : "woman";
        const seed = getSajuSeed(analysis.sajuInfo, guardianGender);
        const encoded = encodeURIComponent(analysis.imagePrompt);
        imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&model=flux&seed=${seed}&nologo=true&enhance=false`;
      } else {
        const spouseGender = data.gender === "male" ? "woman" : "man";
        const seed = getSajuSeed(analysis.sajuInfo, spouseGender);
        const encoded = encodeURIComponent(analysis.imagePrompt);
        imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&model=flux&seed=${seed}&nologo=true&enhance=false`;
      }

      const result: GenerateResult = {
        name: data.name,
        analysis,
        imageUrl,
        gender: data.gender,
        demo: false,
        productType,
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
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <LoadingScreen step={loadingStep} productType={productType} />
          </div>
        ) : (
          <>
            {/* 안내 카드 */}
            <div className="bg-white rounded-3xl shadow-sm p-5 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl">
                  {isGuardian ? "🌟" : "💑"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {isGuardian ? "내귀인은누구" : "내님은누구"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isGuardian
                      ? "생년월일시와 성별을 입력해주세요 · 귀인 분석"
                      : "생년월일시와 성별을 입력해주세요 · 배우자 분석"}
                  </p>
                </div>
              </div>
            </div>

            {/* 상품 전환 버튼 */}
            <div className="bg-white rounded-2xl shadow-sm p-3 mb-4 flex gap-2">
              <button
                onClick={() => {
                  setProductType("spouse");
                  sessionStorage.setItem("selectedProduct", "spouse");
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  !isGuardian
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                💑 내님은누구
              </button>
              <button
                onClick={() => {
                  setProductType("guardian");
                  sessionStorage.setItem("selectedProduct", "guardian");
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isGuardian
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                🌟 내귀인은누구
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm p-5">
              <SajuInputForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 입력 정보는 저장되지 않습니다
        </p>
      </div>
    </div>
  );
}
