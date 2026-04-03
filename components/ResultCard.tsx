"use client";

import { useState, useEffect, useRef } from "react";
import type { GenerateResult } from "@/lib/types";

interface Props {
  result: GenerateResult;
  onReset: () => void;
}

const LOADING_MESSAGES = [
  "AI가 얼굴을 그리는 중...",
  "이목구비를 완성하는 중...",
  "눈매를 다듬는 중...",
  "마지막 터치 중...",
];

const TIMEOUT_MS = 90_000; // 90초 후 자동 재시도

export default function ResultCard({ result, onReset }: Props) {
  const { analysis, imageUrl } = result;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(imageUrl);
  const [elapsed, setElapsed] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  const msgTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 타이머 초기화 함수
  function clearAllTimers() {
    if (msgTimer.current) clearInterval(msgTimer.current);
    if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
  }

  // 이미지 소스 변경 시마다 타이머 재시작
  useEffect(() => {
    if (imgLoaded) return;

    clearAllTimers();
    setElapsed(0);
    setMsgIdx(0);

    // 메시지 순환 (4초마다)
    msgTimer.current = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 4000);

    // 경과 시간 카운터 (1초마다)
    elapsedTimer.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);

    // 90초 후 자동 재시도
    timeoutTimer.current = setTimeout(() => {
      retryWithNewSeed();
    }, TIMEOUT_MS);

    return clearAllTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc]);

  // 로드 성공 시 타이머 정리
  useEffect(() => {
    if (imgLoaded) clearAllTimers();
  }, [imgLoaded]);

  function retryWithNewSeed() {
    if (retryCount >= 3) {
      setImgError(true);
      clearAllTimers();
      return;
    }
    const newSeed = Date.now() % 9999;
    const newSrc = currentSrc.includes("seed=")
      ? currentSrc.replace(/seed=\d+/, `seed=${newSeed}`)
      : `${currentSrc}&seed=${newSeed}`;
    setRetryCount((c) => c + 1);
    setImgLoaded(false);
    setCurrentSrc(newSrc);
  }

  function handleManualRetry() {
    setImgError(false);
    setImgLoaded(false);
    setRetryCount(0);
    const newSrc = imageUrl.replace(/seed=\d+/, `seed=${Date.now() % 9999}`);
    setCurrentSrc(newSrc);
  }

  function handleDownload() {
    window.open(currentSrc, "_blank");
  }

  function handleShareTwitter() {
    const text = `사주로 본 내 배우자의 모습 ✨\n${analysis.characteristics.join(" · ")}\n\n#사주몽타주 #운명의상대`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  const remaining = Math.max(0, Math.ceil((TIMEOUT_MS / 1000) - elapsed));

  return (
    <div className="space-y-6">
      {/* 사주 정보 */}
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

      {/* 몽타주 이미지 */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-amber-200 bg-amber-50">

        {/* 로딩 */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🎨</span>
            </div>
            <div className="text-center space-y-2">
              <p className="text-amber-700 text-sm font-medium animate-pulse">
                {LOADING_MESSAGES[msgIdx]}
              </p>
              {retryCount > 0 && (
                <p className="text-orange-400 text-xs font-medium">다른 이미지로 재시도 중... ({retryCount}/3)</p>
              )}
              {/* 진행 바 */}
              <div className="w-40 h-1.5 bg-amber-100 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (elapsed / (TIMEOUT_MS / 1000)) * 100)}%` }}
                />
              </div>
              <p className="text-amber-300 text-xs">
                {elapsed < 10
                  ? "AI 이미지 생성 중..."
                  : `${remaining}초 후 자동으로 다시 시도합니다`}
              </p>
            </div>
          </div>
        )}

        {/* 에러 */}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-amber-50">
            <span className="text-5xl">😓</span>
            <p className="text-amber-700 text-sm font-medium">이미지 생성에 실패했습니다</p>
            <p className="text-amber-400 text-xs">AI 서버가 일시적으로 혼잡합니다</p>
            <button
              onClick={handleManualRetry}
              className="mt-1 px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-all"
            >
              🔄 다시 생성하기
            </button>
          </div>
        )}

        {/* 이미지 */}
        {!imgError && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={currentSrc}
            src={currentSrc}
            alt="AI가 생성한 배우자 몽타주"
            className={`w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => retryWithNewSeed()}
          />
        )}

        {imgLoaded && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full">
                AI가 그린 당신의 배우자
              </span>
            </div>
          </>
        )}
      </div>

      {/* 특징 키워드 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {analysis.characteristics.map((c, i) => (
          <span key={i} className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full text-sm font-semibold shadow">
            {c}
          </span>
        ))}
      </div>

      {/* 설명 */}
      <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
        <h3 className="text-sm font-semibold text-amber-700 mb-3">✨ 배우자 특징</h3>
        <p className="text-gray-700 leading-relaxed text-sm">{analysis.description}</p>
      </div>

      <p className="text-xs text-center text-gray-400">
        * 이 결과는 오락 목적으로만 제공되며, 실제 미래를 예언하지 않습니다.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          disabled={!imgLoaded}
          className="py-3 rounded-xl border-2 border-amber-400 text-amber-700 font-semibold hover:bg-amber-50 transition-all text-sm disabled:opacity-40"
        >
          💾 이미지 저장
        </button>
        <button
          onClick={handleShareTwitter}
          className="py-3 rounded-xl border-2 border-sky-400 text-sky-700 font-semibold hover:bg-sky-50 transition-all text-sm"
        >
          🐦 X(트위터) 공유
        </button>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md hover:from-amber-600 hover:to-orange-600 transition-all"
      >
        🔄 다시 해보기
      </button>
    </div>
  );
}
