"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code") ?? "";
  const errorMsg = searchParams.get("message") ?? "결제가 취소되었습니다.";

  const isUserCancel = errorCode === "PAY_PROCESS_CANCELED" || errorCode === "USER_CANCEL";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0d0d12]">
      <div className="max-w-sm w-full text-center space-y-5">

        <div className="text-6xl">{isUserCancel ? "🙂" : "😓"}</div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            {isUserCancel ? "결제를 취소했어요" : "결제에 실패했어요"}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {isUserCancel
              ? "언제든 다시 시도할 수 있어요 — 분석 결과는 그대로 남아있어요"
              : errorMsg}
          </p>
        </div>

        {!isUserCancel && (
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-left space-y-1.5">
            <p className="text-xs font-bold text-gray-400">이런 경우에 실패할 수 있어요</p>
            <p className="text-xs text-gray-500">• 카드 한도 초과 또는 결제 차단</p>
            <p className="text-xs text-gray-500">• 네트워크 연결 문제</p>
            <p className="text-xs text-gray-500">• 브라우저 팝업 차단 설정</p>
          </div>
        )}

        <button
          onClick={() => router.push("/result")}
          className="w-full py-4 rounded-2xl bg-yellow-400 text-gray-900 font-bold text-base shadow-lg hover:bg-yellow-300 transition-all active:scale-95"
        >
          {isUserCancel ? "🔮 결과 페이지로 돌아가기" : "↩ 다시 시도하기"}
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full py-3 rounded-2xl border border-white/10 text-gray-500 text-sm hover:text-gray-300 transition-colors"
        >
          홈으로
        </button>

      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense>
      <PaymentFailContent />
    </Suspense>
  );
}
