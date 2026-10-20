"use client";

import type { SelfSajuAnalysis } from "@/lib/types";

const STEM_ELEMENT: Record<string, string> = {
  갑: "wood", 을: "wood", 병: "fire", 정: "fire",
  무: "earth", 기: "earth", 경: "metal", 신: "metal",
  임: "water", 계: "water",
};
const BRANCH_ELEMENT: Record<string, string> = {
  자: "water", 해: "water", 축: "earth", 진: "earth", 미: "earth", 술: "earth",
  인: "wood", 묘: "wood", 사: "fire", 오: "fire", 신: "metal", 유: "metal",
};
const ELEMENT_BG: Record<string, string> = {
  wood: "bg-green-500/20 text-green-300 border-green-500/30",
  fire: "bg-red-500/20 text-red-300 border-red-500/30",
  earth: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  metal: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  water: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};
const ELEMENT_BAR: Record<string, string> = {
  木: "bg-green-400", 火: "bg-red-400", 土: "bg-yellow-400", 金: "bg-gray-300", 水: "bg-blue-400",
};
const HAN_STEM: Record<string, string> = {
  갑:"甲",을:"乙",병:"丙",정:"丁",무:"戊",기:"己",경:"庚",신:"辛",임:"壬",계:"癸",
};
const HAN_BRANCH: Record<string, string> = {
  자:"子",축:"丑",인:"寅",묘:"卯",진:"辰",사:"巳",오:"午",미:"未",신:"申",유:"酉",술:"戌",해:"亥",
};

interface Props {
  selfSaju: SelfSajuAnalysis;
  name: string;
  isPaid: boolean;
}

export default function SelfSajuSection({ selfSaju, name, isPaid }: Props) {
  const s = selfSaju;
  const pillars = [
    { label: "년주", value: s.sajuInfo.yearPillar },
    { label: "월주", value: s.sajuInfo.monthPillar },
    { label: "일주", value: s.sajuInfo.dayPillar },
    { label: "시주", value: s.sajuInfo.hourPillar },
  ];

  const totalElements = Object.values(s.elementCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-[#13131a] border border-indigo-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-base">&#x1F4CA;</span>
          <h3 className="text-sm font-bold text-white">내 사주 분석</h3>
          <span className="text-[9px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold px-2 py-0.5 rounded-full">
            {name}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* 4기둥 compact */}
        <div className="grid grid-cols-4 gap-1.5">
          {pillars.map((p) => {
            const stem = p.value[0] ?? "";
            const branch = p.value[1] ?? "";
            const stemEl = STEM_ELEMENT[stem] ?? "earth";
            const branchEl = BRANCH_ELEMENT[branch] ?? "earth";
            return (
              <div key={p.label} className="text-center">
                <p className="text-[9px] text-gray-500 mb-0.5">{p.label}</p>
                <div className={`rounded-lg border py-1 mb-0.5 ${ELEMENT_BG[stemEl]}`}>
                  <span className="text-xs font-bold">{HAN_STEM[stem] ?? stem}</span>
                </div>
                <div className={`rounded-lg border py-1 ${ELEMENT_BG[branchEl]}`}>
                  <span className="text-xs font-bold">{HAN_BRANCH[branch] ?? branch}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 오행 분포 bar */}
        <div>
          <p className="text-[10px] text-gray-500 mb-1">오행 분포</p>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {(["木", "火", "土", "金", "水"] as const).map((el) => {
              const count = s.elementCounts[el] ?? 0;
              const pct = Math.max(4, (count / totalElements) * 100);
              return (
                <div
                  key={el}
                  className={`${ELEMENT_BAR[el]} rounded-full`}
                  style={{ width: `${pct}%` }}
                  title={`${el}: ${count}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-0.5">
            {(["木", "火", "土", "金", "水"] as const).map((el) => (
              <span key={el} className="text-[9px] text-gray-500">{el}{s.elementCounts[el] ?? 0}</span>
            ))}
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-medium">
            {s.mbti}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
            s.isSinGang
              ? "bg-amber-500/15 text-amber-300 border-amber-500/20"
              : "bg-cyan-500/15 text-cyan-300 border-cyan-500/20"
          }`}>
            {s.isSinGang ? "신강(身强)" : "신약(身弱)"}
          </span>
          {s.geokguk && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 font-medium">
              {s.geokguk}
            </span>
          )}
        </div>

        {/* 신살 badges */}
        {s.sinSal && s.sinSal.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {s.sinSal.map((sal, i) => {
              const shortName = sal.split("—")[0].trim();
              return (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {shortName}
                </span>
              );
            })}
          </div>
        )}

        {/* 한 줄 요약 */}
        <p className="text-xs text-gray-300 leading-relaxed">
          {s.oneLineSummary}
        </p>

        {/* ── PAID section ── */}
        <div className={`space-y-3 ${!isPaid ? "blur-[6px] select-none pointer-events-none" : ""}`}>
          {/* 용신 highlight */}
          {s.yongshin && (
            <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-3">
              <p className="text-[10px] text-amber-400 font-bold mb-1">&#x2728; 용신(用神)</p>
              <p className="text-xs text-gray-300 leading-relaxed">{s.yongshin}</p>
            </div>
          )}

          {/* personality preview */}
          {s.personality && (
            <div>
              <p className="text-[10px] text-gray-500 font-bold mb-1">타고난 기질</p>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{s.personality}</p>
            </div>
          )}

          {/* 월별 운세 mini chart */}
          {s.monthlyFortune && s.monthlyFortune.length === 12 && (
            <div>
              <p className="text-[10px] text-gray-500 font-bold mb-1.5">월별 운세</p>
              <div className="flex items-end gap-0.5 h-10">
                {s.monthlyFortune.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className={`w-full rounded-sm ${v >= 75 ? "bg-green-400" : v >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ height: `${Math.max(4, (v / 100) * 32)}px` }}
                    />
                    <span className="text-[7px] text-gray-600">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 현재 대운 */}
          {s.currentDaeun && s.currentDaeun !== "—" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">현재 대운:</span>
              <span className="font-bold text-white">{s.currentDaeun}</span>
              <span className="text-gray-500">({s.currentDaeunAge})</span>
            </div>
          )}
        </div>

        {!isPaid && (
          <p className="text-[10px] text-center text-gray-500">
            &#x1F512; 결제 후 상세 분석을 확인할 수 있습니다
          </p>
        )}
      </div>
    </div>
  );
}
