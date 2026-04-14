"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SajuInputForm from "@/components/SajuInputForm";
import LoadingScreen from "@/components/LoadingScreen";
import type { SajuInput, GenerateResult, ProductType } from "@/lib/types";
import { getSajuSeed } from "@/lib/prompts";

const PRODUCT_META = {
  spouse:  { emoji: "💑", name: "내님은누구",   sub: "운명의 배우자 분석",  color: "from-rose-500 to-pink-600" },
  guardian:{ emoji: "🌟", name: "내귀인은누구", sub: "인생 귀인 분석",      color: "from-amber-400 to-yellow-500" },
  enemy:   { emoji: "😤", name: "내웬수는누구", sub: "악연·조심 인물 분석", color: "from-slate-500 to-slate-600" },
};

export default function InputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [productType, setProductType] = useState<ProductType>("spouse");

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedProduct") as ProductType | null;
    if (stored === "spouse" || stored === "guardian" || stored === "enemy") {
      setProductType(stored);
    } else {
      setProductType("spouse");
    }
  }, []);

  const isGuardian = productType === "guardian";
  const isEnemy = productType === "enemy";
  const meta = PRODUCT_META[productType];

  async function handleSubmit(data: SajuInput) {
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      const apiPath = isGuardian ? "/api/analyze-guardian" : isEnemy ? "/api/analyze-enemy" : "/api/analyze-saju";
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
        const guardianGender = data.gender === "male" ? "man" : "woman";
        const seed = getSajuSeed(analysis.sajuInfo, guardianGender);
        const encoded = encodeURIComponent(analysis.imagePrompt);
        imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&model=flux&seed=${seed}&nologo=true&enhance=false`;
      } else if (isEnemy) {
        const enemyGender = data.gender === "male" ? "woman" : "man";
        const seed = getSajuSeed(analysis.sajuInfo, enemyGender) + 9999;
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
        paid: true, // TODO: TossPayments 승인 후 이 줄 삭제
        productType,
      };
      sessionStorage.setItem("sajuResult", JSON.stringify(result));
      // 모바일 앱 전환(카카오페이 등) 시 sessionStorage 소실 대비 백업
      localStorage.setItem("sajuResult_backup", JSON.stringify(result));
      router.push("/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setLoading(false);
      setLoadingStep(0);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-[#13131a] border border-white/10 rounded-3xl shadow-sm p-6">
            <LoadingScreen step={loadingStep} productType={productType} />
          </div>
        ) : (
          <>
            {/* 헤더 카드 */}
            <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl shadow-lg`}>
                  {meta.emoji}
                </div>
                <div>
                  <p className="font-black text-white text-sm">{meta.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{meta.sub}</p>
                </div>
              </div>
            </div>

            {/* 상품 전환 탭 */}
            <div className="bg-[#13131a] border border-white/10 rounded-2xl p-2 mb-4 flex gap-1.5">
              {(Object.entries(PRODUCT_META) as [ProductType, typeof PRODUCT_META[keyof typeof PRODUCT_META]][]).map(([id, m]) => (
                <button
                  key={id}
                  onClick={() => {
                    setProductType(id);
                    sessionStorage.setItem("selectedProduct", id);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    productType === id
                      ? `bg-gradient-to-r ${m.color} text-white shadow-md`
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {m.emoji} {id === "spouse" ? "내님" : id === "guardian" ? "내귀인" : "내웬수"}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5">
              <SajuInputForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-600 mt-4">
          🔒 입력 정보는 저장되지 않습니다
        </p>
      </div>
    </div>
  );
}
