"use client";

import { useState } from "react";
import { requestTossPayment } from "@/lib/tossPayments";

/**
 * 토스페이먼츠 심사용 결제 테스트 페이지
 * - 비회원(비로그인) 상태에서 바로 결제창 테스트 가능
 * - 로그인/회원가입 불필요
 */

const TEST_PRODUCTS = [
  { name: "내님은누구 · 배우자 사주분석", price: 1900, emoji: "💑" },
  { name: "내님은누구 · 3종 묶음 분석", price: 4900, emoji: "🔮" },
  { name: "내님은누구 · 내 사주 분석", price: 990, emoji: "🎯" },
];

export default function PaymentTestPage() {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(product: (typeof TEST_PRODUCTS)[number]) {
    setPaying(true);
    setError("");
    try {
      await requestTossPayment({
        amount: product.price,
        orderName: product.name,
        isBundle: product.price === 4900,
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code !== "PAY_PROCESS_CANCELED" && code !== "USER_CANCEL") {
        setError((err as { message?: string })?.message ?? "결제 오류가 발생했습니다.");
      }
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full space-y-6">
        {/* 안내 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-white">결제 테스트</h1>
          <p className="text-sm text-gray-400">
            비회원 카드결제 테스트 페이지입니다.<br />
            로그인 없이 아래 상품을 선택하면 토스페이먼츠 결제창이 열립니다.
          </p>
        </div>

        {/* 비회원 안내 뱃지 */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
            ✓ 회원가입·로그인 불필요 · 비회원 결제 가능
          </span>
        </div>

        {/* 상품 카드 */}
        <div className="space-y-3">
          {TEST_PRODUCTS.map((product) => (
            <button
              key={product.name}
              onClick={() => handlePay(product)}
              disabled={paying}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-[#111118] border border-white/10 hover:border-yellow-400/40 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span className="text-3xl">{product.emoji}</span>
              <div className="flex-1 text-left">
                <p className="text-white font-bold text-sm">{product.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">1회 결제 · 구독 아님</p>
              </div>
              <span className="text-yellow-400 font-black text-lg">
                {product.price.toLocaleString()}원
              </span>
            </button>
          ))}
        </div>

        {paying && (
          <p className="text-center text-yellow-400 text-sm animate-pulse">결제창을 여는 중...</p>
        )}

        {error && (
          <p className="text-center text-red-400 text-sm">{error}</p>
        )}

        {/* 결제 흐름 설명 */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-sm">결제 흐름 안내</h2>
          <ol className="text-gray-400 text-xs space-y-1.5 list-decimal list-inside">
            <li>위 상품 중 하나를 클릭하면 토스페이먼츠 결제창이 열립니다</li>
            <li>카드·간편결제 등 원하는 결제수단을 선택합니다</li>
            <li>결제 완료 시 <code className="text-gray-300 bg-white/5 px-1 rounded">/payment/success</code> 페이지로 이동합니다</li>
            <li>결제 실패 시 <code className="text-gray-300 bg-white/5 px-1 rounded">/payment/fail</code> 페이지로 이동합니다</li>
          </ol>
        </div>

        {/* 서비스 정보 */}
        <div className="text-center text-[10px] text-gray-600 space-y-0.5">
          <p>상호명: 몽타주ai · 대표자: 정필권 · 사업자등록번호: 755-74-00514</p>
          <p>고객센터: 010-6312-7762 · support@naenim.com</p>
        </div>
      </div>
    </div>
  );
}
