"use client";

import { useState } from "react";
import type { GenerateResult, SajuAnalysis } from "@/lib/types";

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
  ctx.fillText("사주 배우자 몽타주", W / 2, 110);

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
  ctx.fillText("사주 배우자 몽타주 · saju-montage.vercel.app", W / 2, H - 60);
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

  async function handlePay() {
    setPaying(true);
    setError(null);

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    // 테스트 키가 없으면 데모 결제 (개발/데모용)
    if (!clientKey || clientKey === "your_toss_client_key_here") {
      await new Promise((r) => setTimeout(r, 1500));
      setPaying(false);
      onPay();
      return;
    }

    try {
      // Toss Payments 스크립트 동적 로드
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
        orderName: "사주 배우자 몽타주 프리미엄",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      // 사용자가 결제창을 닫은 경우 (AbortError) 는 조용히 처리
      if (err instanceof Error && err.name !== "AbortError") {
        setError("결제 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
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
              ["💎", "배우자 스펙 (키·체형·패션·분위기)", false],
              ["📊", "5개 카테고리 궁합 점수 분석", false],
              ["💭", "성격 심층 분석 (장단점·대인관계)", false],
              ["💕", "연애 스타일 & 싸울 때 반응", false],
              ["🌿", "라이프스타일 & 소비 패턴", false],
              ["📅", "만남 시기 예측 (나이대·계절)", false],
              ["🌸", "영화 같은 첫 만남 시나리오", false],
              ["⚠️", "갈등 포인트 & 주의사항 3가지", false],
              ["💡", "인연을 당기는 조언 3가지", false],
              ["💒", "연애→결혼→자녀 타임라인", false],
            ].map(([icon, text, highlight]) => (
              <div key={text as string} className={`flex items-center gap-2 text-sm ${highlight ? "font-semibold text-amber-800" : "text-gray-700"}`}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* 가격 */}
          <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-200 mt-4">
            <p className="text-xs text-amber-600 mb-1">단 한 번만 결제</p>
            <p className="text-3xl font-black text-amber-900">990<span className="text-lg">원</span></p>
            <p className="text-xs text-gray-400 mt-1">커피 한 잔으로 운명의 상대 얼굴을 확인하세요</p>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 rounded-xl px-3 py-2">
              ⚠️ {error}
            </div>
          )}

          {/* 버튼 */}
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95 disabled:opacity-60"
          >
            {paying ? "결제 처리 중..." : "✨ 990원으로 전체 보기"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-400 text-sm hover:text-gray-600"
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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storySharing, setStorySharing] = useState(false);
  const [storyToast, setStoryToast] = useState<string | null>(null);
  const [paid, setPaid] = useState(result.paid ?? false);
  const [showModal, setShowModal] = useState(false);

  function handlePaySuccess() {
    setShowModal(false);
    setPaid(true);
    // 결제 상태 세션에 저장
    try {
      const stored = sessionStorage.getItem("sajuResult");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.paid = true;
        sessionStorage.setItem("sajuResult", JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
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
    const text = `사주로 본 내 배우자의 모습 ✨\n${analysis.characteristics.join(" · ")}\n\n#사주몽타주 #운명의상대`;
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
          title: "사주 배우자 몽타주",
          text: "사주로 알아본 내 운명의 배우자 ✨ #사주몽타주",
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
    const text = `사주로 알아본 내 운명의 배우자!\n${analysis.characteristics.join(" · ")}\n\n사주 배우자 몽타주에서 확인해보세요 ✨`;
    if (navigator.share) {
      try { await navigator.share({ title: "사주 배우자 몽타주", text }); }
      catch { await copyToClipboard(text); }
    } else {
      await copyToClipboard(text);
    }
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

            {/* MBTI + 직업 */}
            <div className="grid grid-cols-2 gap-3">
              {analysis.mbti && (
                <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100 text-center">
                  <div className="text-xs text-violet-500 font-medium mb-1">🧠 MBTI</div>
                  <div className="text-2xl font-bold text-violet-700">{analysis.mbti}</div>
                </div>
              )}
              {analysis.job && (
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                  <div className="text-xs text-blue-500 font-medium mb-1">💼 직업</div>
                  <div className="text-sm font-bold text-blue-700 leading-tight">{analysis.job}</div>
                </div>
              )}
            </div>

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

            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleShare} className="py-3 rounded-xl border-2 border-yellow-400 bg-yellow-400 text-yellow-900 font-semibold hover:bg-yellow-500 transition-all text-sm active:scale-95">
                💬 공유
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
                onClick={() => copyToClipboard(`사주로 알아본 내 운명의 배우자!\n${analysis.characteristics.join(" · ")}\n\n#사주몽타주 #운명의상대`)}
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
              {/* 숨겨진 이미지 (블러) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover blur-xl scale-110 opacity-60"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              {/* 잠금 오버레이 */}
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

            {/* 결제 유도 카드 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-300 text-center shadow-lg">
              <div className="text-4xl mb-3">🔮</div>
              <h3 className="text-lg font-bold text-amber-900 mb-1">
                몽타주 + 완전 분석 보고서
              </h3>
              <p className="text-sm text-amber-700 mb-4 leading-relaxed">
                AI가 그린 배우자 얼굴과 함께<br />상세 분석까지 한 번에 확인하세요
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-5">
                {["🎨 배우자 몽타주", "💎 배우자스펙", "📊 궁합점수", "📅 만남시기", "⚠️ 주의사항", "💡 인연조언", "💒 타임라인", "🌸 첫만남"].map((t) => (
                  <span key={t} className="px-2 py-1 bg-white rounded-full text-xs text-amber-700 border border-amber-200">{t}</span>
                ))}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
              >
                ✨ 990원으로 몽타주 보기
              </button>
              <p className="text-xs text-gray-400 mt-3">커피 한 잔 값으로 운명의 상대 얼굴을 확인하세요</p>
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
