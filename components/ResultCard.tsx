"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import type { GenerateResult, SajuAnalysis } from "@/lib/types";
import { isPaidForSaju, savePaidRecord, makeSajuHash } from "@/lib/paymentStorage";

// ── 인스타그램 스토리 이미지 생성 (9:16 Canvas) ────────────

async function getImageDataUrl(src: string): Promise<string> {
  // data URL이면 그대로 반환
  if (src.startsWith("data:")) return src;
  // 외부 URL이면 proxy 경유해서 base64 변환
  const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(src)}`);
  if (!res.ok) throw new Error("이미지 로드 실패");
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function createStoryBlob(imageUrl: string, analysis: SajuAnalysis): Promise<Blob> {
  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 배경 그라디언트
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fffbf5");
  bg.addColorStop(0.5, "#fef3c7");
  bg.addColorStop(1, "#fed7aa");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 배경 원형 장식
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.12, 320, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * 0.1, H * 0.72, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // 상단 앱 이름
  ctx.fillStyle = "#92400e";
  ctx.font = "bold 52px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("내 배우자 얼굴봤다", W / 2, 110);

  ctx.fillStyle = "#b45309";
  ctx.font = "36px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.fillText("☯️ 운명의 상대를 찾았습니다", W / 2, 170);

  // 몽타주 이미지 (정사각형, 라운드)
  const IMG_SIZE = 860;
  const IMG_X = (W - IMG_SIZE) / 2;
  const IMG_Y = 220;
  const RADIUS = 60;

  try {
    const dataUrl = await getImageDataUrl(imageUrl);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(IMG_X + RADIUS, IMG_Y);
    ctx.lineTo(IMG_X + IMG_SIZE - RADIUS, IMG_Y);
    ctx.quadraticCurveTo(IMG_X + IMG_SIZE, IMG_Y, IMG_X + IMG_SIZE, IMG_Y + RADIUS);
    ctx.lineTo(IMG_X + IMG_SIZE, IMG_Y + IMG_SIZE - RADIUS);
    ctx.quadraticCurveTo(IMG_X + IMG_SIZE, IMG_Y + IMG_SIZE, IMG_X + IMG_SIZE - RADIUS, IMG_Y + IMG_SIZE);
    ctx.lineTo(IMG_X + RADIUS, IMG_Y + IMG_SIZE);
    ctx.quadraticCurveTo(IMG_X, IMG_Y + IMG_SIZE, IMG_X, IMG_Y + IMG_SIZE - RADIUS);
    ctx.lineTo(IMG_X, IMG_Y + RADIUS);
    ctx.quadraticCurveTo(IMG_X, IMG_Y, IMG_X + RADIUS, IMG_Y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE);
    ctx.restore();

    // 이미지 하단 그라디언트 오버레이
    const overlay = ctx.createLinearGradient(0, IMG_Y + IMG_SIZE - 200, 0, IMG_Y + IMG_SIZE);
    overlay.addColorStop(0, "rgba(0,0,0,0)");
    overlay.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.save();
    ctx.beginPath();
    ctx.rect(IMG_X, IMG_Y + IMG_SIZE - 200, IMG_SIZE, 200);
    ctx.clip();
    ctx.fillStyle = overlay;
    ctx.fillRect(IMG_X, IMG_Y + IMG_SIZE - 200, IMG_SIZE, 200);
    ctx.restore();
  } catch { /* 이미지 로드 실패 시 placeholder */ }

  // 이미지 테두리
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 6;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(IMG_X + RADIUS, IMG_Y);
  ctx.lineTo(IMG_X + IMG_SIZE - RADIUS, IMG_Y);
  ctx.quadraticCurveTo(IMG_X + IMG_SIZE, IMG_Y, IMG_X + IMG_SIZE, IMG_Y + RADIUS);
  ctx.lineTo(IMG_X + IMG_SIZE, IMG_Y + IMG_SIZE - RADIUS);
  ctx.quadraticCurveTo(IMG_X + IMG_SIZE, IMG_Y + IMG_SIZE, IMG_X + IMG_SIZE - RADIUS, IMG_Y + IMG_SIZE);
  ctx.lineTo(IMG_X + RADIUS, IMG_Y + IMG_SIZE);
  ctx.quadraticCurveTo(IMG_X, IMG_Y + IMG_SIZE, IMG_X, IMG_Y + IMG_SIZE - RADIUS);
  ctx.lineTo(IMG_X, IMG_Y + RADIUS);
  ctx.quadraticCurveTo(IMG_X, IMG_Y, IMG_X + RADIUS, IMG_Y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  let y = IMG_Y + IMG_SIZE + 60;

  // 궁합 한마디
  if (analysis.compatibility) {
    ctx.fillStyle = "#92400e";
    ctx.font = "bold 44px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`💫 ${analysis.compatibility}`, W / 2, y);
    y += 70;
  }

  // MBTI + 직업 칩
  const chips = [
    analysis.mbti ? `🧠 ${analysis.mbti}` : null,
    analysis.job ? `💼 ${analysis.job}` : null,
  ].filter(Boolean) as string[];

  if (chips.length > 0) {
    const chipFont = "bold 36px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
    ctx.font = chipFont;
    const chipH = 70;
    const chipPad = 36;
    const chipGap = 24;
    const widths = chips.map(c => ctx.measureText(c).width + chipPad * 2);
    const totalW = widths.reduce((a, b) => a + b, 0) + chipGap * (chips.length - 1);
    let chipX = (W - totalW) / 2;
    chips.forEach((chip, i) => {
      const cw = widths[i];
      ctx.fillStyle = "#fef3c7";
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;
      const r = chipH / 2;
      ctx.beginPath();
      ctx.moveTo(chipX + r, y); ctx.lineTo(chipX + cw - r, y);
      ctx.quadraticCurveTo(chipX + cw, y, chipX + cw, y + r);
      ctx.lineTo(chipX + cw, y + chipH - r);
      ctx.quadraticCurveTo(chipX + cw, y + chipH, chipX + cw - r, y + chipH);
      ctx.lineTo(chipX + r, y + chipH); ctx.quadraticCurveTo(chipX, y + chipH, chipX, y + chipH - r);
      ctx.lineTo(chipX, y + r); ctx.quadraticCurveTo(chipX, y, chipX + r, y);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#92400e";
      ctx.font = chipFont;
      ctx.textAlign = "left";
      ctx.fillText(chip, chipX + chipPad, y + chipH * 0.67);
      chipX += cw + chipGap;
    });
    y += chipH + 44;
  }

  // 특징 키워드
  if (analysis.characteristics?.length > 0) {
    ctx.fillStyle = "#b45309";
    ctx.font = "36px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(analysis.characteristics.join("  ·  "), W / 2, y);
    y += 60;
  }

  // 외모 설명 (2줄까지)
  if (analysis.description) {
    ctx.fillStyle = "#78350f";
    ctx.font = "34px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
    ctx.textAlign = "center";
    const lines = wrapText(ctx, analysis.description, W - 120);
    lines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, W / 2, y + i * 50);
    });
    y += Math.min(lines.length, 2) * 50 + 30;
  }

  // 하단 워터마크
  ctx.fillStyle = "#d97706";
  ctx.font = "32px 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.textAlign = "center";
  ctx.globalAlpha = 0.6;
  ctx.fillText("내 배우자 얼굴봤다 · saju-montage.vercel.app", W / 2, H - 60);
  ctx.globalAlpha = 1;

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("blob 변환 실패")), "image/jpeg", 0.92);
  });
}

interface Props {
  result: GenerateResult;
  onReset: () => void;
}

// ── 서브 컴포넌트 ──────────────────────────────────────────

function InfoSection({ icon, label, title, children }: {
  icon: string; label: string; title?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
      <p className="text-xs text-amber-400 font-medium mb-1">{icon} {label}</p>
      {title && <h4 className="text-base font-bold text-amber-900 mb-3">{title}</h4>}
      {children}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 90 ? "bg-emerald-400" :
    score >= 80 ? "bg-amber-400" :
    score >= 70 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
}

function BlurredSection({ label }: { label: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-amber-100">
      <div className="p-5 blur-sm select-none pointer-events-none bg-white">
        <p className="text-xs text-amber-400 font-medium mb-1">🔒 {label}</p>
        <p className="text-base font-bold text-amber-900 mb-3">결제 후 확인하세요</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          이 내용은 결제 후 확인하실 수 있습니다. 지금 바로 990원으로 배우자의 모든 정보를 확인해보세요. 사주로 분석한 상세한 내용이 숨겨져 있습니다.
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/60 flex items-center justify-center">
        <div className="bg-white/90 rounded-xl px-4 py-2 shadow text-sm font-semibold text-amber-700 border border-amber-200">
          🔒 결제 후 공개
        </div>
      </div>
    </div>
  );
}

// ── 결제 모달 ──────────────────────────────────────────────

function PayModal({ onClose, onPay }: { onClose: () => void; onPay: () => void }) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  async function handlePay() {
    if (paying) return;
    setPaying(true);
    setError(null);

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey || clientKey === "your_toss_client_key_here") {
      await new Promise((r) => setTimeout(r, 1200));
      setPaying(false);
      onPay();
      return;
    }

    try {
      if (!document.querySelector('script[src*="js.tosspayments.com"]')) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://js.tosspayments.com/v1/payment";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("결제 모듈 로드 실패"));
          document.head.appendChild(script);
        });
      }

      const orderId = `saju${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem("paymentOrderId", orderId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tossPayments = (window as any).TossPayments(clientKey);
      await tossPayments.requestPayment("카드", {
        amount: 990,
        orderId,
        orderName: "내 배우자 얼굴봤다 프리미엄",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      const errName = err instanceof Error ? err.name : "";
      const isCanceled = errName === "AbortError" || errName === "USER_CANCEL";
      if (!isCanceled) {
        setError("결제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center sticky top-0">
          <div className="text-4xl mb-2">🎨</div>
          <h2 className="text-xl font-bold">배우자 몽타주 공개</h2>
          <p className="text-amber-100 text-sm mt-1">AI가 그린 운명의 상대 얼굴을 확인하세요</p>
        </div>

        {/* 포함 내용 */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">결제 후 공개되는 내용</p>
          <div className="space-y-2">
            {[
              ["🎨", "배우자 AI 몽타주 이미지 공개", true],
              ["💬", "배우자가 처음 보낼 카카오톡 메시지", true],
              ["💑", "우리의 케미 타입 분석", true],
              ["🌟", "닮은꼴 연예인 분위기", false],
              ["💜", "배우자 눈에 비친 나의 매력포인트", false],
              ["📅", "월별 인연운 차트 (12개월)", false],
              ["🌱", "인연 준비도 점수", false],
              ["✨", "배우자 이름 첫 글자 힌트", false],
              ["🌙", "전생 인연 이야기", false],
              ["💎", "배우자 스펙 & 취향 분석", false],
              ["📊", "5개 궁합 점수 + 갈등 패턴", false],
              ["🌸", "첫 만남 시나리오 & 타임라인", false],
              ["💡", "인연을 당기는 조언 3가지", false],
            ].map(([icon, text, highlight]) => (
              <div key={text as string} className={`flex items-center gap-2 text-sm ${highlight ? "font-semibold text-amber-800" : "text-gray-600"}`}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* 가격 */}
          <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-200 mt-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-sm text-gray-400 line-through">3,900원</span>
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">74% 할인</span>
            </div>
            <p className="text-3xl font-black text-amber-900">990<span className="text-lg font-bold">원</span></p>
            <p className="text-xs text-gray-400 mt-1">단 한 번만 결제 · 커피 한 잔 값</p>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 rounded-xl px-3 py-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {/* 소셜 로그인 */}
          {!session && (
            <div className="space-y-2">
              <p className="text-xs text-center text-gray-400 font-medium">로그인으로 결제 내역 영구 보관</p>
              <div className="flex gap-2">
                <button
                  onClick={() => signIn("kakao", { callbackUrl: "/result" })}
                  className="flex-1 py-2.5 rounded-xl flex items-center justify-center font-bold text-xs text-gray-900 active:scale-95 transition-all"
                  style={{ backgroundColor: "#FEE500" }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current mr-1"><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/></svg>
                  카카오
                </button>
                <button
                  onClick={() => signIn("naver", { callbackUrl: "/result" })}
                  className="flex-1 py-2.5 rounded-xl flex items-center justify-center font-bold text-xs text-white active:scale-95 transition-all"
                  style={{ backgroundColor: "#03C75A" }}
                >
                  <span className="font-black mr-1">N</span>네이버
                </button>
                <button
                  onClick={() => signIn("google", { callbackUrl: "/result" })}
                  className="flex-1 py-2.5 rounded-xl flex items-center justify-center font-bold text-xs text-gray-700 bg-white border border-gray-200 active:scale-95 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  구글
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">또는 바로 결제</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95 disabled:opacity-60"
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                결제 처리 중...
              </span>
            ) : "✨ 990원으로 전체 보기"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            나중에 볼게요
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────

export default function ResultCard({ result, onReset }: Props) {
  const { analysis, imageUrl } = result;
  const { data: session } = useSession();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storySharing, setStorySharing] = useState(false);
  const [storyToast, setStoryToast] = useState<string | null>(null);
  const [paid, setPaid] = useState(result.paid ?? false);
  const [showModal, setShowModal] = useState(false);

  const sajuHash = analysis?.sajuInfo
    ? makeSajuHash(
        analysis.sajuInfo.yearPillar, analysis.sajuInfo.monthPillar,
        analysis.sajuInfo.dayPillar,  analysis.sajuInfo.hourPillar,
        result.gender ?? "male"
      )
    : "";

  // localStorage에 저장된 결제 상태 복원 (브라우저 재시작 후에도 유지)
  useEffect(() => {
    if (!paid && sajuHash && isPaidForSaju(sajuHash)) {
      setPaid(true);
      try {
        const stored = sessionStorage.getItem("sajuResult");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.paid = true;
          sessionStorage.setItem("sajuResult", JSON.stringify(parsed));
        }
      } catch { /* ignore */ }
    }
  }, [sajuHash, paid]);

  function handlePaySuccess() {
    setShowModal(false);
    setPaid(true);
    // sessionStorage 업데이트
    try {
      const stored = sessionStorage.getItem("sajuResult");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.paid = true;
        sessionStorage.setItem("sajuResult", JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
    // localStorage에도 저장 (데모 결제 시)
    if (sajuHash) savePaidRecord(sajuHash, `demo_${Date.now()}`);
  }

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      let blob: Blob;
      if (imageUrl.startsWith("data:")) {
        const res = await fetch(imageUrl);
        blob = await res.blob();
      } else {
        const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
        if (!proxyRes.ok) throw new Error("다운로드 실패");
        blob = await proxyRes.blob();
      }
      const ext = blob.type.includes("svg") ? "svg" : blob.type.includes("png") ? "png" : "jpg";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `배우자_초상화.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("이미지 저장에 실패했습니다.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShareTwitter() {
    const text = `내 배우자 얼굴봤다 👀\n${analysis.characteristics.join(" · ")}\n\nsaju-montage.vercel.app\n#사주몽타주 #내배우자얼굴봤다 #운명의상대`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function handleShareInstagram() {
    if (storySharing) return;
    setStorySharing(true);
    setStoryToast(null);
    try {
      const blob = await createStoryBlob(imageUrl, analysis);
      const file = new File([blob], "사주_배우자_스토리.jpg", { type: "image/jpeg" });

      // 1순위: Web Share API (파일 공유 지원 시 — 모바일 Chrome/Safari)
      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "내 배우자 얼굴봤다",
          text: "내 배우자 얼굴봤다 👀 사주로 그린 운명의 상대 ✨ #사주몽타주 #내배우자얼굴봤다",
        });
        return;
      }

      // 2순위: 이미지 저장 + 인스타 앱 열기 (모바일)
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "사주_배우자_스토리.jpg";
      a.click();
      URL.revokeObjectURL(url);

      // 모바일이면 인스타 앱으로 이동 시도
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setTimeout(() => {
          window.location.href = "instagram://story-camera";
        }, 800);
        setStoryToast("이미지를 저장했어요! 인스타그램 스토리에 업로드해보세요 📸");
      } else {
        setStoryToast("이미지를 저장했어요! 인스타그램 앱에서 스토리로 공유해보세요 📸");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setStoryToast("스토리 이미지 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setStorySharing(false);
      setTimeout(() => setStoryToast(null), 4000);
    }
  }

  async function handleShare() {
    const text = `내 배우자 얼굴봤다 👀\n${analysis.characteristics.join(" · ")}\n\n나도 해보기 → saju-montage.vercel.app ✨`;
    if (navigator.share) {
      try { await navigator.share({ title: "내 배우자 얼굴봤다", text }); }
      catch { await copyToClipboard(text); }
    } else {
      await copyToClipboard(text);
    }
  }

  async function handleShareKakao() {
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    const shareText = `${result.name}님의 사주로 본 배우자\n"${analysis.characteristics.join(" · ")}"\n운명의 상대 몽타주 확인하기 →`;

    // Kakao SDK 사용 가능할 때
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Kakao = (window as any).Kakao;
    if (jsKey && Kakao) {
      if (!Kakao.isInitialized()) Kakao.init(jsKey);
      Kakao.Share.sendDefault({
        objectType: "text",
        text: shareText,
        link: { mobileWebUrl: "https://saju-montage.vercel.app", webUrl: "https://saju-montage.vercel.app" },
        buttonTitle: "나도 해보기",
      });
      return;
    }
    // fallback: 링크 복사
    await copyToClipboard(`${shareText}\nhttps://saju-montage.vercel.app`);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("클립보드 복사에 실패했습니다.");
    }
  }

  return (
    <>
      {showModal && <PayModal onClose={() => setShowModal(false)} onPay={handlePaySuccess} />}

      <div className="space-y-5">
        {/* ── 사주 정보 ── */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <h3 className="text-sm font-semibold text-amber-700 mb-2">당신의 사주</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "년주", value: analysis.sajuInfo.yearPillar },
              { label: "월주", value: analysis.sajuInfo.monthPillar },
              { label: "일주", value: analysis.sajuInfo.dayPillar },
              { label: "시주", value: analysis.sajuInfo.hourPillar },
            ].map((p) => (
              <div key={p.label} className="bg-white rounded-xl p-2 border border-amber-100">
                <div className="text-xs text-amber-500">{p.label}</div>
                <div className="text-lg font-bold text-amber-900">{p.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 궁합 한마디 ── */}
        {analysis.compatibility && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-center">
            <p className="text-white font-semibold text-sm">💫 {analysis.compatibility}</p>
          </div>
        )}

        {/* ── 핵심 키워드 (무료 힌트) ── */}
        <div className="flex flex-wrap gap-2 justify-center">
          {analysis.characteristics.map((c, i) => (
            <span key={i} className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full text-sm font-semibold shadow">
              {c}
            </span>
          ))}
        </div>

        {/* ── 외모 특징 텍스트 (무료 힌트) ── */}
        <InfoSection icon="✨" label="외모 힌트" title={analysis.descTitle}>
          <p className="text-gray-700 leading-relaxed text-sm">{analysis.description}</p>
        </InfoSection>

        {/* ════════════════════════════════
            몽타주 이미지 (유료)
        ════════════════════════════════ */}

        {paid ? (
          /* ── 결제 완료: 이미지 + 전체 분석 공개 ── */
          <>
            {/* 몽타주 이미지 */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-amber-300 bg-amber-50">
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                </div>
              )}
              {imgError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-amber-50">
                  <span className="text-4xl">😓</span>
                  <p className="text-amber-700 text-sm">이미지를 불러오지 못했습니다</p>
                  <button
                    onClick={() => { setImgError(false); setImgLoaded(false); }}
                    className="px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600"
                  >🔄 다시 시도</button>
                </div>
              )}
              {!imgError && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="AI가 생성한 배우자 초상화"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              )}
              {imgLoaded && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full">
                      사주로 그린 배우자 초상화
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 배우자 프로필 카드 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 shadow-sm">
              <p className="text-xs text-amber-500 font-medium mb-3">💌 배우자 프로필</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { icon: "🧠", label: "MBTI", value: analysis.mbti },
                  { icon: "💼", label: "직업", value: analysis.job },
                  { icon: "📏", label: "키", value: analysis.bodySpec?.height },
                  { icon: "👗", label: "스타일", value: analysis.bodySpec?.fashion },
                ].filter(i => i.value).map((item) => (
                  <div key={item.label} className="bg-white/80 rounded-xl p-3 border border-amber-100">
                    <div className="text-base mb-0.5">{item.icon}</div>
                    <div className="text-[10px] text-amber-400">{item.label}</div>
                    <div className="text-xs font-bold text-amber-900 leading-snug mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
              {analysis.bodySpec?.vibe && (
                <div className="mt-2 bg-white/80 rounded-xl px-3 py-2 border border-amber-100">
                  <span className="text-[10px] text-amber-400">분위기 </span>
                  <span className="text-xs font-semibold text-amber-900">{analysis.bodySpec.vibe}</span>
                </div>
              )}
            </div>

            {/* 케미 타입 배지 */}
            {analysis.chemistryType && (
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-5 text-white text-center shadow-lg">
                <p className="text-xs text-rose-200 font-medium mb-1">💑 우리의 케미 타입</p>
                <div className="text-5xl my-3">{analysis.chemistryType.emoji}</div>
                <h3 className="text-xl font-black mb-2">{analysis.chemistryType.name}</h3>
                <p className="text-sm text-rose-100 leading-relaxed">{analysis.chemistryType.desc}</p>
              </div>
            )}

            {/* 닮은꼴 연예인 분위기 */}
            {analysis.celebrityVibe && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-2">🌟 닮은꼴 연예인 분위기</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.celebrityVibe}</p>
              </div>
            )}

            {/* 취미 */}
            {analysis.hobbies?.length > 0 && (
              <InfoSection icon="🎯" label="취미">
                <div className="flex flex-wrap gap-2">
                  {analysis.hobbies.map((h, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm">
                      {h}
                    </span>
                  ))}
                </div>
              </InfoSection>
            )}

            {/* 배우자 스펙 */}
            {analysis.bodySpec && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-3">💎 배우자 스펙</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "키", value: analysis.bodySpec.height },
                    { label: "체형", value: analysis.bodySpec.figure },
                    { label: "패션", value: analysis.bodySpec.fashion },
                    { label: "분위기", value: analysis.bodySpec.vibe },
                  ].map((s) => (
                    <div key={s.label} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <div className="text-xs text-amber-500 mb-1">{s.label}</div>
                      <div className="text-sm font-semibold text-amber-900">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 궁합 점수 */}
            {analysis.compatibilityScores && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-1">📊 궁합 점수</p>
                <h4 className="text-base font-bold text-amber-900 mb-4">
                  평균 {Math.round(Object.values(analysis.compatibilityScores).reduce((a, b) => a + b, 0) / 5)}점의 높은 궁합
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "성격 궁합", score: analysis.compatibilityScores.personality },
                    { label: "가치관 궁합", score: analysis.compatibilityScores.values },
                    { label: "생활 패턴", score: analysis.compatibilityScores.lifestyle },
                    { label: "소통 방식", score: analysis.compatibilityScores.communication },
                    { label: "재정 관념", score: analysis.compatibilityScores.finance },
                  ].map((s) => <ScoreBar key={s.label} {...s} />)}
                </div>
              </div>
            )}

            {/* 성격 */}
            {analysis.personality && (
              <InfoSection icon="💭" label="성격" title={analysis.personalityTitle}>
                <p className="text-gray-700 leading-relaxed text-sm">{analysis.personality}</p>
              </InfoSection>
            )}

            {/* 연애 스타일 */}
            {analysis.loveStyle && (
              <InfoSection icon="💕" label="연애 스타일" title={analysis.loveStyleTitle}>
                <p className="text-gray-700 leading-relaxed text-sm">{analysis.loveStyle}</p>
              </InfoSection>
            )}

            {/* 라이프스타일 */}
            {analysis.lifeStyle && (
              <InfoSection icon="🌿" label="라이프스타일" title={analysis.lifeStyleTitle}>
                <p className="text-gray-700 leading-relaxed text-sm">{analysis.lifeStyle}</p>
              </InfoSection>
            )}

            {/* 만남 시기 */}
            {analysis.meetTiming && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-3">📅 만남 시기 예측</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "나이대", value: analysis.meetTiming.ageRange, icon: "🎂" },
                    { label: "계절", value: analysis.meetTiming.season, icon: "🌸" },
                    { label: "상황", value: analysis.meetTiming.situation, icon: "📍" },
                  ].map((m) => (
                    <div key={m.label} className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                      <div className="text-lg mb-1">{m.icon}</div>
                      <div className="text-xs text-pink-400 mb-1">{m.label}</div>
                      <div className="text-xs font-bold text-pink-800">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 첫 만남 시나리오 */}
            {analysis.firstMeet && (
              <div className="bg-pink-50 rounded-2xl p-5 border border-pink-100">
                <p className="text-xs text-pink-400 font-medium mb-1">🌸 첫 만남</p>
                {analysis.firstMeetTitle && (
                  <h4 className="text-base font-bold text-pink-800 mb-3">{analysis.firstMeetTitle}</h4>
                )}
                <p className="text-gray-700 leading-relaxed text-sm">{analysis.firstMeet}</p>
              </div>
            )}

            {/* 연애·결혼 타임라인 */}
            {analysis.timeline && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-4">💒 연애·결혼 타임라인</p>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200" />
                  {[
                    { icon: "👀", label: "첫 만남", value: analysis.timeline.meetAge },
                    { icon: "💑", label: "연애 기간", value: analysis.timeline.datingPeriod },
                    { icon: "💍", label: "결혼", value: analysis.timeline.marriageAge },
                    { icon: "👶", label: "자녀", value: analysis.timeline.children },
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-4 mb-4 last:mb-0">
                      <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm shrink-0 relative z-10">
                        {t.icon}
                      </div>
                      <div className="pt-0.5">
                        <div className="text-xs text-amber-500">{t.label}</div>
                        <div className="text-sm font-semibold text-gray-800">{t.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 카카오톡 첫 메시지 */}
            {analysis.kakaoFirstMessage && (
              <div className="bg-[#FEE500] rounded-2xl p-5 border border-yellow-300">
                <p className="text-xs text-yellow-700 font-medium mb-3">💬 배우자가 처음 보낼 카카오톡</p>
                <div className="flex items-end gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl shrink-0">
                    🔮
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-xs">
                    <p className="text-sm text-gray-800 leading-relaxed">{analysis.kakaoFirstMessage}</p>
                    <p className="text-[10px] text-gray-400 mt-1 text-right">오후 11:11</p>
                  </div>
                </div>
                <p className="text-[10px] text-yellow-700 mt-3 text-center opacity-70">* 사주 기반 추정 메시지입니다</p>
              </div>
            )}

            {/* 이름 첫 글자 힌트 */}
            {analysis.nameHint && (
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  {["✦","✧","✦","✧","✦","✧","✦","✧"].map((s, i) => (
                    <span key={i} className="absolute text-white text-xl" style={{ top: `${10 + (i * 11) % 80}%`, left: `${5 + (i * 13) % 90}%` }}>{s}</span>
                  ))}
                </div>
                <p className="text-xs text-indigo-300 font-medium mb-2 relative">✨ 이름 힌트</p>
                <p className="text-lg font-bold text-white leading-relaxed relative">{analysis.nameHint}</p>
              </div>
            )}

            {/* 전생 인연 */}
            {analysis.pastLife && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-4xl opacity-20">🌙</div>
                <p className="text-xs text-slate-400 font-medium mb-2">🔮 전생 인연</p>
                <h4 className="text-sm font-bold text-amber-300 mb-2">이 사람과 나의 전생 이야기</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{analysis.pastLife}</p>
              </div>
            )}

            {/* 취향 카드 */}
            {analysis.favoriteThings && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-3">🎭 배우자의 취향</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "🍽️", label: "좋아하는 음식", value: analysis.favoriteThings.food },
                    { icon: "🎵", label: "즐겨 듣는 음악", value: analysis.favoriteThings.music },
                    { icon: "🎬", label: "즐겨 보는 장르", value: analysis.favoriteThings.movie },
                    { icon: "📍", label: "자주 가는 곳", value: analysis.favoriteThings.place },
                  ].map((t) => (
                    <div key={t.label} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-[10px] text-amber-500 mb-0.5">{t.label}</div>
                      <div className="text-xs font-semibold text-amber-900 leading-snug">{t.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 첫 데이트 코스 */}
            {analysis.firstDate && (
              <div className="bg-pink-50 rounded-2xl p-5 border border-pink-100">
                <p className="text-xs text-pink-400 font-medium mb-2">🗺️ 첫 데이트 코스</p>
                <h4 className="text-sm font-bold text-pink-800 mb-3">이 사람과 잘 맞는 첫 데이트</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.firstDate}</p>
              </div>
            )}

            {/* 갈등 & 화해 패턴 */}
            {analysis.conflictAndMakeup && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-2">⚡ 갈등 & 화해 패턴</p>
                <h4 className="text-sm font-bold text-amber-900 mb-3">어떨 때 싸우고 어떻게 화해할까</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.conflictAndMakeup}</p>
              </div>
            )}

            {/* 나의 매력포인트 (배우자 시점) */}
            {analysis.myCharm && (
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
                <p className="text-xs text-violet-500 font-medium mb-2">💜 배우자 눈에 비친 나의 매력</p>
                <h4 className="text-sm font-bold text-violet-800 mb-3">배우자가 당신에게 끌리는 이유</h4>
                <div className="bg-white/80 rounded-xl px-4 py-3 border border-violet-100">
                  <p className="text-sm text-gray-700 leading-relaxed italic">"{analysis.myCharm}"</p>
                </div>
              </div>
            )}

            {/* 월별 인연운 차트 */}
            {analysis.monthlyChance && analysis.monthlyChance.length === 12 && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-1">📅 월별 인연운</p>
                <h4 className="text-sm font-bold text-amber-900 mb-4">
                  {(() => {
                    const max = Math.max(...analysis.monthlyChance);
                    const idx = analysis.monthlyChance.indexOf(max);
                    return `${idx + 1}월이 인연운 최고조`;
                  })()}
                </h4>
                <div className="flex items-end gap-1.5 h-24">
                  {analysis.monthlyChance.map((v, i) => {
                    const max = Math.max(...analysis.monthlyChance!);
                    const isPeak = v === max;
                    const heightPct = Math.round((v / 100) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-sm transition-all ${isPeak ? "bg-amber-400" : "bg-amber-100"}`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className={`text-[9px] ${isPeak ? "font-bold text-amber-600" : "text-gray-400"}`}>
                          {i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 인연 준비도 */}
            {analysis.readiness && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <p className="text-xs text-amber-400 font-medium mb-1">🌱 인연 준비도</p>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-amber-900">지금 당신의 인연 준비 상태</h4>
                  <span className="text-2xl font-black text-amber-500">{analysis.readiness.score}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-1000"
                    style={{ width: `${analysis.readiness.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{analysis.readiness.comment}</p>
              </div>
            )}

            {/* 악연 주의 유형 */}
            {analysis.warnType && (
              <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
                <p className="text-xs text-orange-500 font-medium mb-1">🚨 악연 주의 유형</p>
                <h4 className="text-sm font-bold text-orange-800 mb-3">이런 사람은 조심하세요</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.warnType}</p>
              </div>
            )}

            {/* 주의사항 */}
            {analysis.caution?.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <p className="text-xs text-red-400 font-medium mb-1">⚠️ 주의사항</p>
                <h4 className="text-base font-bold text-red-800 mb-3">이 점은 조심하세요</h4>
                <div className="space-y-3">
                  {analysis.caution.map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-red-400 font-bold shrink-0">{i + 1}.</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 인연 조언 */}
            {analysis.advice?.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <p className="text-xs text-emerald-500 font-medium mb-1">💡 인연을 당기는 조언</p>
                <h4 className="text-base font-bold text-emerald-800 mb-3">지금 당장 실천하세요</h4>
                <div className="space-y-2">
                  {analysis.advice.map((a, i) => (
                    <div key={i} className="flex gap-3 items-start bg-white rounded-xl p-3 border border-emerald-100">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-center text-gray-400">
              * 이 결과는 오락 목적으로만 제공되며, 실제 미래를 예언하지 않습니다.
            </p>

            {/* 저장 & 공유 */}
            <button
              onClick={handleDownload}
              disabled={!imgLoaded || downloading}
              className={`w-full py-3 rounded-xl border-2 border-amber-400 text-amber-700 font-semibold text-sm transition-all ${!imgLoaded || downloading ? "opacity-40 cursor-not-allowed" : "hover:bg-amber-50 active:scale-95"}`}
            >
              {downloading ? "⏳ 저장 중..." : "💾 이미지 저장"}
            </button>

            {/* 스토리 공유 토스트 */}
            {storyToast && (
              <div className="fixed bottom-6 left-4 right-4 z-50 max-w-sm mx-auto bg-gray-900 text-white text-sm rounded-2xl px-4 py-3 shadow-xl text-center">
                {storyToast}
              </div>
            )}

            {/* 카카오 공유 */}
            <button
              onClick={handleShareKakao}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-gray-800 text-sm active:scale-95 transition-all shadow-sm"
              style={{ backgroundColor: "#FEE500" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/></svg>
              카카오톡으로 공유하기
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleShare} className="py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all text-sm active:scale-95">
                🔗 공유
              </button>
              <button
                onClick={handleShareInstagram}
                disabled={storySharing}
                className={`py-3 rounded-xl border-2 font-semibold transition-all text-sm active:scale-95 ${
                  storySharing
                    ? "border-pink-200 text-pink-300 cursor-not-allowed"
                    : "border-pink-400 text-white bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90"
                }`}
              >
                {storySharing ? "⏳" : "📸 스토리"}
              </button>
              <button
                onClick={() => copyToClipboard(`내 배우자 얼굴봤다 👀\n${analysis.characteristics.join(" · ")}\n\n나도 해보기 → saju-montage.vercel.app\n#사주몽타주 #내배우자얼굴봤다 #운명의상대`)}
                className={`py-3 rounded-xl border-2 font-semibold transition-all text-sm active:scale-95 ${copied ? "border-green-400 text-green-700 bg-green-50" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                {copied ? "✅ 복사됨" : "🔗 복사"}
              </button>
            </div>
          </>
        ) : (
          /* ── 비결제: 이미지 잠금 + 결제 유도 ── */
          <>
            {/* 블러 처리된 이미지 잠금 카드 */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-amber-200 bg-amber-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover blur-xl scale-110 opacity-60"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/60 flex items-center justify-center text-4xl shadow-xl">
                  🔒
                </div>
                <div className="text-center px-6">
                  <p className="text-white font-bold text-lg drop-shadow">AI가 그린 배우자 몽타주</p>
                  <p className="text-white/80 text-sm mt-1 drop-shadow">결제 후 실제 얼굴을 확인하세요</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-base shadow-2xl hover:from-amber-500 hover:to-orange-600 transition-all active:scale-95"
                >
                  ✨ 990원으로 공개
                </button>
              </div>
            </div>

            {/* 잠긴 콘텐츠 티저 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-500 text-center uppercase tracking-wider">결제 후 공개되는 내용 미리보기</p>
              {[
                { icon: "💬", label: "배우자가 처음 보낼 카카오톡", blur: "안녕하세요 혹시 저 기억하세요? 오늘 ..." },
                { icon: "✨", label: "이름 첫 글자 힌트", blur: "배우자 이름은 'ㅅ·ㅈ' 계열일 가능성이..." },
                { icon: "🌙", label: "전생 인연 이야기", blur: "전생에 같은 마을 물가에서 서로를 알아보..." },
                { icon: "💑", label: "케미 타입", blur: "운명적 소울메이트 💫 처음 만났을 때부터..." },
                { icon: "📅", label: "월별 인연운 차트", blur: "◼◼◼◼◼◼◼◼◼◼◼◼" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="relative bg-white rounded-xl px-4 py-3 border border-amber-100 overflow-hidden cursor-pointer"
                  onClick={() => setShowModal(true)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{item.icon}</span>
                    <span className="text-xs font-semibold text-amber-700">{item.label}</span>
                    <span className="ml-auto text-xs text-amber-400 font-bold">🔒</span>
                  </div>
                  <p className="text-sm text-gray-400 blur-sm select-none">{item.blur}</p>
                </div>
              ))}
            </div>

            {/* 결제 CTA */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-300 text-center shadow-lg">
              <div className="text-4xl mb-2">🔮</div>
              <h3 className="text-lg font-bold text-amber-900 mb-1">몽타주 + 완전 분석 보고서</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm text-gray-400 line-through">3,900원</span>
                <span className="text-2xl font-black text-amber-600">990원</span>
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">74% 할인</span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
              >
                ✨ 990원으로 몽타주 + 전체 보기
              </button>
              <p className="text-xs text-gray-400 mt-3">커피 한 잔 값 · 단 한 번만 결제</p>
            </div>

            <p className="text-xs text-center text-gray-400">
              * 이 결과는 오락 목적으로만 제공되며, 실제 미래를 예언하지 않습니다.
            </p>
          </>
        )}

        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
        >
          🔄 다시 해보기
        </button>
      </div>
    </>
  );
}
