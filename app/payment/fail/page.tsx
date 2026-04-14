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
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="text-6xl">{isUserCancel ? "😊" : "😓"}</div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isUserCancel ? "결제를 취소했어요" : "결제에 실패했어요"}
          </h2>
          {!isUserCancel && (
            <p className="text-red-400 text-sm mt-2">{errorMsg}</p>
          )}
          {isUserCancel && (
            <p className="text-gray-400 text-sm mt-2">언제든지 다시 시도하실 수 있어요</p>
          )}
        </div>
        <button
          onClick={() => router.push("/result")}
          className="w-full py-4 rounded-2xl bg-yellow-400 text-gray-900 font-bold text-lg shadow-lg hover:bg-yellow-300 transition-all active:scale-95"
        >
          결과 페이지로 돌아가기
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
