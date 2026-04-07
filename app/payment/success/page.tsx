"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { savePaidRecord, makeSajuHash } from "@/lib/paymentStorage";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"confirming" | "done" | "error">("confirming");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      setStatus("error");
      return;
    }

    fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          try {
            const stored = sessionStorage.getItem("sajuResult");
            if (stored) {
              const parsed = JSON.parse(stored);
              parsed.paid = true;
              sessionStorage.setItem("sajuResult", JSON.stringify(parsed));
              // localStorage에도 저장 → 브라우저 닫아도 유지
              if (parsed.analysis?.sajuInfo) {
                const { yearPillar, monthPillar, dayPillar, hourPillar } = parsed.analysis.sajuInfo;
                const gender = parsed.gender ?? "male";
                const sajuHash = makeSajuHash(yearPillar, monthPillar, dayPillar, hourPillar, gender);
                savePaidRecord(sajuHash, orderId!);
              }
            }
          } catch {
            /* ignore */
          }
          setStatus("done");
          setTimeout(() => router.push("/result"), 1500);
        } else {
          setErrorMsg(data.error || "결제 확인에 실패했습니다.");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setStatus("error");
      });
  }, [searchParams, router]);

  if (status === "confirming") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🔮</div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-900">결제 확인 중...</h2>
            <p className="text-amber-600 text-sm mt-2">잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="text-6xl">✨</div>
          <div>
            <h2 className="text-2xl font-bold text-amber-900">결제 완료!</h2>
            <p className="text-amber-600 text-sm mt-2">배우자 완전 분석 보고서를 확인하세요</p>
          </div>
          <div className="text-sm text-gray-400 animate-pulse">결과 페이지로 이동 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="text-6xl">😓</div>
        <div>
          <h2 className="text-2xl font-bold text-red-800">결제 확인 실패</h2>
          <p className="text-red-600 text-sm mt-2">{errorMsg}</p>
        </div>
        <button
          onClick={() => router.push("/result")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all"
        >
          결과 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
