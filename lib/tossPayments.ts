/**
 * Toss Payments V2 SDK wrapper
 * CDN script (https://js.tosspayments.com/v2/standard) must be loaded before calling.
 * Add to app/layout.tsx: <Script src="https://js.tosspayments.com/v2/standard" strategy="afterInteractive" />
 */

export function generateOrderId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `naenim-${ts}-${rand}`;
}

export async function requestTossPayment({
  amount,
  orderName,
  isBundle = false,
}: {
  amount: number;
  orderName: string;
  isBundle?: boolean;
}): Promise<void> {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) {
    alert("결제 키가 설정되지 않았습니다. 관리자에게 문의하세요.");
    throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY not set");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TossPayments = (window as any).TossPayments;
  if (typeof window === "undefined" || !TossPayments) {
    alert("결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요.");
    throw new Error("Toss Payments SDK not loaded");
  }

  const orderId = generateOrderId();
  const origin = window.location.origin;
  const successUrl = `${origin}/payment/success${isBundle ? "?bundle=1" : ""}`;
  const failUrl = `${origin}/payment/fail`;

  try {
    const toss = TossPayments(clientKey);
    // V2: 비회원 결제는 TossPayments.ANONYMOUS 상수 사용 (문자열 "ANONYMOUS" 아님)
    const payment = toss.payment({ customerKey: TossPayments.ANONYMOUS });

    await payment.requestPayment({
      method: "CARD",
      amount: { currency: "KRW", value: amount },
      orderId,
      orderName,
      successUrl,
      failUrl,
      card: {
        flowMode: "DEFAULT",
      },
    });
  } catch (err: unknown) {
    // 사용자가 직접 취소한 경우 — 조용히 처리
    const code = (err as { code?: string })?.code ?? "";
    if (code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL") {
      throw err; // 컴포넌트에서 paying 상태만 리셋
    }
    // 그 외 에러는 사용자에게 알림
    const msg = (err as { message?: string })?.message ?? String(err);
    alert(`결제 오류: ${msg}`);
    throw err;
  }
}
