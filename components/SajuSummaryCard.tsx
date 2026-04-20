"use client";

import type { SajuInfo } from "@/lib/types";
import { GAN_ELEMENT, JI_ELEMENT, DAY_MASTER_TRAITS } from "@/lib/saju";

// ── 오행 메타 ──────────────────────────────────────────────────
const ELEMENT_META: Record<string, { emoji: string; color: string; bgColor: string; label: string; desc: string }> = {
  木: { emoji: "🌿", color: "text-green-400",  bgColor: "bg-green-500/15 border-green-500/25",  label: "목(木)", desc: "창의·성장·유연함" },
  火: { emoji: "🔥", color: "text-red-400",    bgColor: "bg-red-500/15 border-red-500/25",      label: "화(火)", desc: "열정·표현·카리스마" },
  土: { emoji: "🏔️", color: "text-yellow-500", bgColor: "bg-yellow-500/15 border-yellow-500/25", label: "토(土)", desc: "신뢰·안정·포용력" },
  金: { emoji: "⚔️", color: "text-gray-300",   bgColor: "bg-gray-500/15 border-gray-500/25",    label: "금(金)", desc: "결단·원칙·의리" },
  水: { emoji: "💧", color: "text-blue-400",   bgColor: "bg-blue-500/15 border-blue-500/25",    label: "수(水)", desc: "지혜·감수성·적응" },
};

// ── 천간/지지 오행 색상 ──────────────────────────────────────
const GAN_COLOR: Record<string, string> = {
  갑: "text-green-400", 을: "text-green-300",
  병: "text-red-400",   정: "text-red-300",
  무: "text-yellow-500",기: "text-yellow-400",
  경: "text-gray-300",  신: "text-gray-200",
  임: "text-blue-400",  계: "text-blue-300",
};
const JI_COLOR: Record<string, string> = {
  자: "text-blue-400",  축: "text-yellow-500",
  인: "text-green-400", 묘: "text-green-300",
  진: "text-yellow-400",사: "text-red-400",
  오: "text-red-300",   미: "text-yellow-400",
  신: "text-gray-300",  유: "text-gray-200",
  술: "text-yellow-500",해: "text-blue-300",
};

// ── 일간별 한 줄 캐릭터 태그라인 ──────────────────────────────
const DAY_MASTER_TAGLINE: Record<string, string> = {
  갑: "무엇이든 처음 시작하는 개척자형 🌲",
  을: "유연하게 상황을 읽고 스며드는 공감형 🌱",
  병: "무대 위에서 빛나는 태양 같은 존재감 ☀️",
  정: "온기로 주변을 감싸는 섬세한 감성파 🕯️",
  무: "묵직하게 버티며 모두를 품어주는 산 🏔️",
  기: "꼼꼼하게 챙기고 묵묵히 헌신하는 현실파 🌾",
  경: "자존심은 강하지만 의리 하나는 확실한 철인 ⚔️",
  신: "날카로운 눈으로 세상을 꿰뚫는 분석형 🔪",
  임: "어디서든 흐르며 스며드는 자유로운 지식인 🌊",
  계: "감추고 쌓아두다 한 번에 터지는 깊은 우물 🌧️",
};

// ── 일지 배우자 힌트 ──────────────────────────────────────────
const DAY_BRANCH_HINT: Record<string, { vibe: string; desc: string }> = {
  자: { vibe: "지적이고 감성 깊은",     desc: "水 기운 — 총명하고 감수성 풍부한 상대와 인연이 깊어요" },
  축: { vibe: "현실적이고 성실한",      desc: "土 기운 — 꼼꼼하고 책임감 있는 안정형과 잘 맞아요" },
  인: { vibe: "활발하고 개척 정신의",   desc: "木 기운 — 진취적이고 에너지 넘치는 상대가 인연이에요" },
  묘: { vibe: "섬세하고 예술적인",      desc: "木 기운 — 감수성 풍부하고 창의적인 분위기의 상대예요" },
  진: { vibe: "포용력 있고 다재다능한", desc: "土 기운 — 넓은 품과 다양한 재능을 가진 상대와 어울려요" },
  사: { vibe: "열정적이고 강단 있는",   desc: "火 기운 — 카리스마 있고 추진력 넘치는 상대가 나타나요" },
  오: { vibe: "명랑하고 존재감 강한",   desc: "火 기운 — 밝고 활동적이며 어디서든 눈에 띄는 상대예요" },
  미: { vibe: "따뜻하고 예술적 감성의", desc: "土 기운 — 감성적이고 취향이 뚜렷한 상대와 잘 맞아요" },
  신: { vibe: "세련되고 논리적인",      desc: "金 기운 — 스마트하고 깔끔한 이미지의 상대가 인연이에요" },
  유: { vibe: "우아하고 심미안 있는",   desc: "金 기운 — 세련된 취향과 원칙이 뚜렷한 상대와 어울려요" },
  술: { vibe: "의리 있고 카리스마의",   desc: "土 기운 — 박력 있고 묵직한 존재감의 상대가 나타나요" },
  해: { vibe: "자유롭고 지혜로운",      desc: "水 기운 — 지적이고 자유로운 영혼의 상대와 인연이 깊어요" },
};

function getElementCounts(sajuInfo: SajuInfo): Record<string, number> {
  const pillars = [sajuInfo.yearPillar, sajuInfo.monthPillar, sajuInfo.dayPillar, sajuInfo.hourPillar];
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const p of pillars) {
    if (!p || p === "미상") continue;
    const gan = p[0];
    const ji  = p[1];
    const ganElem = (GAN_ELEMENT[gan] ?? "").split("(")[0];
    const jiElem  = JI_ELEMENT[ji] ?? "";
    if (ganElem && counts[ganElem] !== undefined) counts[ganElem]++;
    if (jiElem  && counts[jiElem]  !== undefined) counts[jiElem]++;
  }
  return counts;
}

interface Props {
  sajuInfo: SajuInfo;
  name: string;
}

export default function SajuSummaryCard({ sajuInfo, name }: Props) {
  const pillars = [sajuInfo.yearPillar, sajuInfo.monthPillar, sajuInfo.dayPillar, sajuInfo.hourPillar];
  const pillarLabels = ["년주", "월주", "일주", "시주"];
  const pillarHan    = ["年", "月", "日", "時"];

  const dayMaster = sajuInfo.dayPillar?.[0] ?? "";
  const dayBranch = sajuInfo.dayPillar?.[1] ?? "";
  const traits    = DAY_MASTER_TRAITS[dayMaster];
  const tagline   = DAY_MASTER_TAGLINE[dayMaster] ?? "";
  const branchHint = DAY_BRANCH_HINT[dayBranch];

  const elemCounts = getElementCounts(sajuInfo);
  const sorted = Object.entries(elemCounts).sort(([, a], [, b]) => b - a);
  const dominant = sorted[0]?.[0] ?? "";
  const lacking  = sorted.filter(([, v]) => v === 0).map(([k]) => k);
  const domMeta  = ELEMENT_META[dominant];

  return (
    <div className="mt-4 space-y-3">

      {/* 4기둥 컬러 디스플레이 */}
      <div className="grid grid-cols-4 gap-1.5">
        {pillars.map((p, i) => {
          const isDay  = i === 2;
          const isMiss = !p || p === "미상";
          const gan = isMiss ? "?" : p[0];
          const ji  = isMiss ? "?" : p[1];
          return (
            <div
              key={i}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-2.5 border ${
                isDay
                  ? "bg-yellow-400/10 border-yellow-400/35"
                  : "bg-white/3 border-white/8"
              }`}
            >
              <span className="text-[9px] text-gray-600">{pillarHan[i]}</span>
              <span className={`text-lg font-black leading-none ${isMiss ? "text-gray-700" : (GAN_COLOR[gan] ?? "text-white")}`}>{gan}</span>
              <span className={`text-lg font-black leading-none ${isMiss ? "text-gray-700" : (JI_COLOR[ji]  ?? "text-white")}`}>{ji}</span>
              <span className={`text-[8px] font-bold mt-0.5 ${isDay ? "text-yellow-400" : "text-gray-600"}`}>{pillarLabels[i]}</span>
              {isDay && <span className="text-[7px] text-yellow-500/70">배우자 자리</span>}
            </div>
          );
        })}
      </div>

      {/* 일간 캐릭터 */}
      {traits && (
        <div className="bg-[#0d0d12] border border-white/8 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black border ${ELEMENT_META[(GAN_ELEMENT[dayMaster] ?? "").split("(")[0]]?.bgColor ?? "bg-white/5 border-white/10"}`}>
              {dayMaster}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-tight">
                {name}님은 <span className={GAN_COLOR[dayMaster] ?? "text-white"}>{dayMaster}일간({traits.element})</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{tagline}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/3 rounded-xl p-2.5">
              <p className="text-[9px] text-gray-600 font-bold uppercase mb-1.5">✨ 강점</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">{traits.strength}</p>
            </div>
            <div className="bg-white/3 rounded-xl p-2.5">
              <p className="text-[9px] text-gray-600 font-bold uppercase mb-1.5">⚠️ 주의</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">{traits.weakness}</p>
            </div>
          </div>

          <div className="bg-white/3 rounded-xl p-2.5">
            <p className="text-[9px] text-gray-600 font-bold uppercase mb-1">💑 관계 스타일</p>
            <p className="text-[11px] text-gray-300 leading-relaxed">{traits.relationStyle}</p>
          </div>
        </div>
      )}

      {/* 오행 분포 */}
      <div className="bg-[#0d0d12] border border-white/8 rounded-2xl p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">오행(五行) 분포</p>
        <div className="space-y-1.5">
          {sorted.map(([elem, cnt]) => {
            const meta = ELEMENT_META[elem];
            if (!meta) return null;
            const pct = Math.round((cnt / 8) * 100);
            return (
              <div key={elem} className="flex items-center gap-2">
                <span className="text-sm w-5 text-center">{meta.emoji}</span>
                <span className={`text-xs font-bold w-10 ${meta.color}`}>{meta.label}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${meta.color.replace("text-", "bg-")}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 w-4 text-right">{cnt}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {domMeta && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${domMeta.bgColor} ${domMeta.color}`}>
              {domMeta.emoji} {domMeta.label} 강세 — {domMeta.desc}
            </span>
          )}
          {lacking.length > 0 && (
            <span className="text-[10px] text-gray-600 px-2 py-1 rounded-full border border-white/8 bg-white/3">
              부족: {lacking.map(e => ELEMENT_META[e]?.label).join("·")}
            </span>
          )}
        </div>
      </div>

      {/* 일지 배우자 자리 힌트 */}
      {branchHint && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1.5">
            💑 일지(日支) {dayBranch} — 배우자 자리
          </p>
          <p className="text-xs font-bold text-white mb-1">{branchHint.vibe} 상대</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">{branchHint.desc}</p>
        </div>
      )}
    </div>
  );
}
