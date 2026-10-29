import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: "필수 파라미터 누락" }, { status: 400 });
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    // 테스트/데모 모드: TOSS_SECRET_KEY가 없거나 플레이스홀더면 성공 처리
    if (!secretKey || secretKey === "your_toss_secret_key_here") {
      return NextResponse.json({ success: true, payment: { orderId, amount, method: "demo" } });
    }

    const encoded = Buffer.from(`${secretKey}:`).toString("base64");

    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Toss confirm error:", error);
      return NextResponse.json({ success: false, error: error.message || "결제 확인 실패" }, { status: 400 });
    }

    const payment = await res.json();
    return NextResponse.json({ success: true, payment });
  } catch (err) {
    console.error("payment/confirm error:", err);
    return NextResponse.json({ error: "결제 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
