/**
 * Toss Payments V2 SDK wrapper — 결제창형 결제 (widgets + renderPaymentWindow)
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
  if (typeof window === "undefined") {
    throw new Error("결제는 브라우저에서만 가능합니다.");
  }

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) {
    alert("결제 키가 설정되지 않았습니다. 관리자에게 문의하세요.");
    throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY not set");
  }

  // SDK 로드 대기 (최대 5초, 500ms 간격 폴링)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let TossPayments = (window as any).TossPayments;
  if (!TossPayments) {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 500));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      TossPayments = (window as any).TossPayments;
      if (TossPayments) break;
    }
  }
  if (!TossPayments) {
    alert("결제 모듈 로딩 중입니다. 페이지를 새로고침 후 다시 시도해주세요.");
    throw new Error("Toss Payments SDK not loaded after 5s");
  }

  const orderId = generateOrderId();
  const origin = window.location.origin;
  const successUrl = `${origin}/payment/success${isBundle ? "?bundle=1" : ""}`;
  const failUrl = `${origin}/payment/fail`;

  try {
    const ANON = TossPayments.ANONYMOUS;
    const toss = TossPayments(clientKey);

    // V2 결제창형: widgets + renderPaymentWindow
    const widgets = toss.widgets({ customerKey: ANON ?? "ANONYMOUS" });

    await widgets.setAmount({ currency: "KRW", value: amount });

    // 결제창 렌더링 — 팝업/오버레이 형태로 열림 (DOM 마운트 불필요)
    const paymentWindow = await widgets.renderPaymentWindow({ orderName });

    // 결제창에서 구매자가 결제수단 선택 후 "결제하기" 누르면 paymentRequest 이벤트 발생
    await new Promise<void>((resolve, reject) => {
      paymentWindow.on("paymentRequest", async () => {
        try {
          await widgets.requestPayment({
            orderId,
            orderName,
            successUrl,
            failUrl,
          });
          resolve(); // redirect 방식이라 실제로 실행되지 않지만 타입 완성용
        } catch (err) {
          await paymentWindow.destroy().catch(() => {});
          reject(err);
        }
      });

      // 구매자가 결제창을 닫으면 cancel 이벤트
      paymentWindow.on("cancel", async () => {
        await paymentWindow.destroy().catch(() => {});
        reject({ code: "PAY_PROCESS_CANCELED", message: "결제를 취소했습니다." });
      });
    });
  } catch (err: unknown) {
    // 사용자가 직접 취소한 경우 — alert 없이 조용히 처리
    const code = (err as { code?: string })?.code ?? "";
    if (code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL") {
      throw err; // 컴포넌트에서 paying 상태만 리셋
    }
    // 그 외 에러 — 전체 에러 정보 콘솔에 기록
    console.error("[TOSS_ERROR]", { code, err });
    const msg = (err as { message?: string })?.message ?? String(err);
    const displayMsg = code ? `${msg} (${code})` : msg;
    alert(`결제 오류: ${displayMsg}`);
    throw err;
  }
}
