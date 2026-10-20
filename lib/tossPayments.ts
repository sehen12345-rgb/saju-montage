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
  method,
  amount,
  orderName,
  isBundle = false,
}: {
  method: "CARD" | "KAKAOPAY";
  amount: number;
  orderName: string;
  isBundle?: boolean;
}): Promise<void> {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY not set");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TossPayments = (window as any).TossPayments;
  if (typeof window === "undefined" || !TossPayments) {
    throw new Error("Toss Payments SDK not loaded");
  }

  const orderId = generateOrderId();
  const origin = window.location.origin;
  const successUrl = `${origin}/payment/success${isBundle ? "?bundle=1" : ""}`;
  const failUrl = `${origin}/payment/fail`;

  const toss = TossPayments(clientKey);
  const payment = toss.payment({ customerKey: "ANONYMOUS" });

  await payment.requestPayment({
    method: method === "KAKAOPAY" ? "EASY_PAY" : "CARD",
    amount: { currency: "KRW", value: amount },
    orderId,
    orderName,
    successUrl,
    failUrl,
    ...(method === "KAKAOPAY" && { easyPay: { easyPayCompany: "KAKAOPAY" } }),
  });
}
