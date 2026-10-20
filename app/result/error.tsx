"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Result page error:", error);
    // 오류 시 sessionStorage 정리
    try { sessionStorage.removeItem("sajuResult"); } catch { /* ignore */ }
    try { localStorage.removeItem("sajuResult_backup"); } catch { /* ignore */ }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-white font-bold text-lg mb-2">결과 표시 중 오류가 발생했습니다</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          일시적인 문제로 결과를 표시하지 못했습니다.<br />
          다시 분석을 진행해 주세요.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-3 rounded-2xl bg-indigo-500 text-white font-bold text-sm active:scale-95 transition-all"
          >
            다시 시도
          </button>
          <button
            onClick={() => router.push("/input")}
            className="w-full py-3 rounded-2xl bg-white/10 border border-white/10 text-gray-300 font-bold text-sm active:scale-95 transition-all"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
