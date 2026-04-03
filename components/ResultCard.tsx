"use client";

import { useState } from "react";
import type { GenerateResult } from "@/lib/types";

interface Props {
  result: GenerateResult;
  onReset: () => void;
}

export default function ResultCard({ result, onReset }: Props) {
  const { analysis, imageUrl } = result;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleDownload() {
    window.open(imageUrl, "_blank");
  }

  function handleShareTwitter() {
    const text = `사주로 본 내 배우자의 모습 ✨\n${analysis.characteristics.join(" · ")}\n\n#사주몽타주 #운명의상대`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

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
      <div className="relative">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-amber-200 bg-amber-50">

          {/* 로딩 중 스켈레톤 */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-amber-50">
              <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
              <p className="text-amber-600 text-sm animate-pulse">AI 이미지 생성 중...</p>
              <p className="text-amber-400 text-xs">처음 로딩은 10~20초 소요될 수 있어요</p>
            </div>
          )}

          {/* 에러 */}
          {imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-amber-50">
              <span className="text-4xl">🖼️</span>
              <p className="text-amber-600 text-sm">이미지를 불러오지 못했습니다</p>
              <button
                onClick={() => { setImgError(false); setImgLoaded(false); }}
                className="text-xs text-amber-500 underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 실제 이미지 - img 태그 직접 사용 (외부 AI 서비스 URL 최적화 불필요) */}
          {!imgError && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="AI가 생성한 배우자 몽타주"
              className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}

          {/* 하단 레이블 */}
          {imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          )}
          {imgLoaded && (
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full">
                AI가 그린 당신의 배우자
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 특징 키워드 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {analysis.characteristics.map((c, i) => (
          <span
            key={i}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full text-sm font-semibold shadow"
          >
            {c}
          </span>
        ))}
      </div>

      {/* 설명 텍스트 */}
      <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
        <h3 className="text-sm font-semibold text-amber-700 mb-3">✨ 배우자 특징</h3>
        <p className="text-gray-700 leading-relaxed text-sm">{analysis.description}</p>
      </div>

      <p className="text-xs text-center text-gray-400">
        * 이 결과는 오락 목적으로만 제공되며, 실제 미래를 예언하지 않습니다.
      </p>

      {/* 버튼들 */}
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
