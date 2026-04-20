"use client";

import { useState, useMemo } from "react";
import type { SajuInput } from "@/lib/types";
import { calculateSaju } from "@/lib/saju";

interface Props {
  onSubmit: (data: SajuInput) => void;
  loading: boolean;
}

const HOUR_TO_SHI: Record<number, { shi: string; han: string }> = {
  23: { shi: "야자시", han: "夜子時" },
  0:  { shi: "자시",   han: "子時" },
  1:  { shi: "축시",   han: "丑時" },
  2:  { shi: "축시",   han: "丑時" },
  3:  { shi: "인시",   han: "寅時" },
  4:  { shi: "인시",   han: "寅時" },
  5:  { shi: "묘시",   han: "卯時" },
  6:  { shi: "묘시",   han: "卯時" },
  7:  { shi: "진시",   han: "辰時" },
  8:  { shi: "진시",   han: "辰時" },
  9:  { shi: "사시",   han: "巳時" },
  10: { shi: "사시",   han: "巳時" },
  11: { shi: "오시",   han: "午時" },
  12: { shi: "오시",   han: "午時" },
  13: { shi: "미시",   han: "未時" },
  14: { shi: "미시",   han: "未時" },
  15: { shi: "신시",   han: "申時" },
  16: { shi: "신시",   han: "申時" },
  17: { shi: "유시",   han: "酉時" },
  18: { shi: "유시",   han: "酉時" },
  19: { shi: "술시",   han: "戌時" },
  20: { shi: "술시",   han: "戌時" },
  21: { shi: "해시",   han: "亥時" },
  22: { shi: "해시",   han: "亥時" },
};

const SHI_COLORS: Record<string, string> = {
  "야자시": "border-purple-500/40 bg-purple-500/8",
  "자시":   "border-blue-500/40 bg-blue-500/8",
  "축시":   "border-slate-500/40 bg-slate-500/8",
  "인시":   "border-green-600/40 bg-green-600/8",
  "묘시":   "border-green-400/40 bg-green-400/8",
  "진시":   "border-teal-500/40 bg-teal-500/8",
  "사시":   "border-red-500/40 bg-red-500/8",
  "오시":   "border-orange-500/40 bg-orange-500/8",
  "미시":   "border-yellow-500/40 bg-yellow-500/8",
  "신시":   "border-amber-500/40 bg-amber-500/8",
  "유시":   "border-rose-500/40 bg-rose-500/8",
  "술시":   "border-pink-500/40 bg-pink-500/8",
  "해시":   "border-indigo-500/40 bg-indigo-500/8",
};

// 4기둥 한자
const PILLAR_HAN: Record<number, string> = { 0: "年", 1: "月", 2: "日", 3: "時" };
const PILLAR_KO:  Record<number, string> = { 0: "년주", 1: "월주", 2: "일주★", 3: "시주" };
const PILLAR_DESC: Record<number, string> = {
  0: "조상·초년",
  1: "부모·청년",
  2: "배우자 자리",
  3: "자녀·말년",
};

// 천간·지지 오행 색상
const GAN_COLOR: Record<string, string> = {
  갑: "text-green-400", 을: "text-green-300",
  병: "text-red-400",   정: "text-red-300",
  무: "text-yellow-500",기: "text-yellow-400",
  경: "text-gray-300",  신: "text-gray-200",
  임: "text-blue-400",  계: "text-blue-300",
};
const JI_COLOR: Record<string, string> = {
  자: "text-blue-400", 축: "text-yellow-500",
  인: "text-green-400",묘: "text-green-300",
  진: "text-yellow-400",사: "text-red-400",
  오: "text-red-300",  미: "text-yellow-400",
  신: "text-gray-300", 유: "text-gray-200",
  술: "text-yellow-500",해: "text-blue-300",
};

function PillarCard({ pillar, index, highlight }: { pillar: string; index: number; highlight?: boolean }) {
  const gan = pillar[0];
  const ji  = pillar[1];
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl py-2.5 px-2 border transition-all ${
      highlight
        ? "bg-yellow-400/10 border-yellow-400/40"
        : "bg-white/3 border-white/10"
    }`}>
      <span className="text-[10px] text-gray-500">{PILLAR_HAN[index]}</span>
      <span className={`text-xl font-black ${GAN_COLOR[gan] ?? "text-white"}`}>{gan}</span>
      <span className={`text-xl font-black ${JI_COLOR[ji] ?? "text-white"}`}>{ji}</span>
      <span className={`text-[9px] font-bold ${highlight ? "text-yellow-400" : "text-gray-600"}`}>{PILLAR_KO[index]}</span>
      {highlight && <span className="text-[8px] text-yellow-500/80">{PILLAR_DESC[index]}</span>}
    </div>
  );
}

function SajuPreview({ year, month, day, hour }: { year: number; month: number; day: number; hour: number }) {
  const saju = useMemo(
    () => calculateSaju(year, month, day, hour >= 0 ? hour : 12),
    [year, month, day, hour]
  );
  const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar === "미상" ? "??" : saju.hourPillar];

  return (
    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">☯ 사주팔자 미리보기</p>
        {hour < 0 && <span className="text-[9px] text-gray-600">시주는 시간 선택 후 확정</span>}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {pillars.map((p, i) => (
          p === "??" ? (
            <div key={i} className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-2 border border-dashed border-white/10">
              <span className="text-[10px] text-gray-500">{PILLAR_HAN[i]}</span>
              <span className="text-xl font-black text-gray-700">?</span>
              <span className="text-xl font-black text-gray-700">?</span>
              <span className="text-[9px] text-gray-700">{PILLAR_KO[i]}</span>
            </div>
          ) : (
            <PillarCard key={i} pillar={p} index={i} highlight={i === 2} />
          )
        ))}
      </div>
      <p className="text-[10px] text-gray-600 mt-2 text-center">
        일주 <span className="text-yellow-400 font-bold">{saju.dayPillar}</span>의 지지가 배우자 자리입니다
      </p>
    </div>
  );
}

function getHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function getHourSummary(hour: number): string {
  if (hour < 0) return "모름";
  const shi = HOUR_TO_SHI[hour];
  return `${getHourLabel(hour)} (${shi?.shi ?? ""})`;
}

const currentYear = new Date().getFullYear();

const STEP_HINTS = [
  {
    icon: "☯",
    text: "성별에 따라 관성(官星)·재성(財星) 방향이 달라집니다. 여성은 관성, 남성은 재성이 배우자 기운입니다.",
  },
  {
    icon: "📅",
    text: "반드시 양력(陽曆·태양력) 생년월일을 입력해 주세요. 음력 생일은 양력으로 변환 후 입력해야 정확한 사주가 나옵니다.",
  },
  {
    icon: "⏰",
    text: "태어난 시간은 시주(時柱)를 결정합니다. 모르셔도 분석 가능하지만, 알면 훨씬 정밀한 결과를 얻을 수 있어요.",
  },
];

export default function SajuInputForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<SajuInput>({
    name: "",
    birthYear: 1995,
    birthMonth: 6,
    birthDay: 15,
    birthHour: -1,
    gender: "male",
  });
  const [step, setStep] = useState(0);
  const [calType, setCalType] = useState<"solar" | "lunar">("solar");

  function set<K extends keyof SajuInput>(k: K, v: SajuInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const isStep0Valid = form.name.trim().length > 0;
  const isStep1Valid = form.birthYear > 0 && form.birthMonth > 0 && form.birthDay > 0;
  const maxDay = new Date(form.birthYear, form.birthMonth, 0).getDate();

  const stepLabels = ["기본 정보", "생년월일", "태어난 시"];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-yellow-400 text-gray-900" :
                i === step ? "bg-white text-gray-900" :
                "bg-white/10 text-gray-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-medium ${i === step ? "text-white" : "text-gray-600"}`}>{label}</span>
            </div>
            {i < 2 && (
              <div className={`h-px w-8 mb-4 ${i < step ? "bg-yellow-400" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      {/* 사주 힌트 박스 */}
      <div className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 ${
        step === 1
          ? "bg-amber-500/10 border border-amber-500/25"
          : "bg-yellow-500/5 border border-yellow-500/15"
      }`}>
        <span className="text-yellow-400 text-base shrink-0 mt-0.5">{STEP_HINTS[step].icon}</span>
        <p className="text-[11px] text-yellow-200/70 leading-relaxed">{STEP_HINTS[step].text}</p>
      </div>

      {/* STEP 0: 기본 정보 */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="홍길동"
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:border-white/30 focus:outline-none text-base transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">성별</label>
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set("gender", g)}
                  className={`py-4 rounded-2xl border-2 font-bold text-base transition-all ${
                    form.gender === g
                      ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  {g === "male" ? "👨 남성" : "👩 여성"}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5 text-center">
              성별에 따라 관성·재성 방향이 달라집니다
            </p>
          </div>

          <button
            type="button"
            disabled={!isStep0Valid}
            onClick={() => setStep(1)}
            className="w-full py-4 rounded-xl bg-white text-gray-900 font-black text-base disabled:opacity-20 active:scale-95 transition-all"
          >
            다음 →
          </button>
        </div>
      )}

      {/* STEP 1: 생년월일 */}
      {step === 1 && (
        <div className="space-y-4">
          <button type="button" onClick={() => setStep(0)} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-300">
            ← 이전
          </button>

          {/* 양력/음력 선택 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-bold text-gray-300">생일 기준</label>
              <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">중요</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-1">
              <button
                type="button"
                onClick={() => setCalType("solar")}
                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  calType === "solar"
                    ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                    : "border-white/10 bg-white/5 text-gray-400"
                }`}
              >
                🌞 양력 (태양력)
              </button>
              <button
                type="button"
                onClick={() => setCalType("lunar")}
                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  calType === "lunar"
                    ? "border-amber-400 bg-amber-400/10 text-amber-400"
                    : "border-white/10 bg-white/5 text-gray-400"
                }`}
              >
                🌙 음력 (음력 생일)
              </button>
            </div>
            {calType === "lunar" && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-300 space-y-1">
                <p className="font-bold">⚠️ 음력 생일이신가요?</p>
                <p className="text-amber-300/80 leading-relaxed">
                  사주 계산은 <span className="font-bold text-amber-200">양력 날짜</span>로 해야 합니다.
                  음력 생일을 양력으로 변환 후 다시 양력을 선택해 주세요.
                </p>
                <a
                  href="https://search.naver.com/search.naver?query=음력+양력+변환"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-yellow-400 font-bold hover:text-yellow-300 mt-1"
                >
                  🔍 음력→양력 변환하기 →
                </a>
              </div>
            )}
            {calType === "solar" && (
              <p className="text-[10px] text-gray-600 px-1">
                주민등록증·출생증명서에 적힌 날짜 기준입니다
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              태어난 해 <span className="text-[10px] text-gray-600 font-normal">— 년주(年柱) 결정</span>
            </label>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={() => set("birthYear", Math.max(1930, form.birthYear - 1))}
                className="w-9 h-9 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all active:scale-95 shrink-0"
              >−</button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={form.birthYear}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1930 && v <= currentYear) set("birthYear", v);
                  }}
                  min={1930}
                  max={currentYear}
                  className="w-20 text-center text-2xl font-black text-white focus:outline-none bg-transparent"
                />
                <span className="text-gray-400 font-bold ml-1">년</span>
              </div>
              <button
                type="button"
                onClick={() => set("birthYear", Math.min(currentYear, form.birthYear + 1))}
                className="w-9 h-9 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all active:scale-95 shrink-0"
              >+</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              월 <span className="text-[10px] text-gray-600 font-normal">— 월주(月柱) 결정</span>
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    set("birthMonth", m);
                    const newMax = new Date(form.birthYear, m, 0).getDate();
                    if (form.birthDay > newMax) set("birthDay", newMax);
                  }}
                  className={`py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    form.birthMonth === m
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/30"
                  }`}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              일 <span className="text-[10px] text-gray-600 font-normal">— 일주(日柱) 결정 ★ 배우자 자리</span>
            </label>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set("birthDay", d)}
                  className={`py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                    form.birthDay === d
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/30"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 실시간 사주 미리보기 */}
          <SajuPreview
            year={form.birthYear}
            month={form.birthMonth}
            day={form.birthDay}
            hour={-1}
          />

          <button
            type="button"
            disabled={!isStep1Valid}
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-xl bg-white text-gray-900 font-black text-base disabled:opacity-20 active:scale-95 transition-all"
          >
            다음 → (태어난 시간 입력)
          </button>
        </div>
      )}

      {/* STEP 2: 태어난 시 */}
      {step === 2 && (
        <div className="space-y-4">
          <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-300">
            ← 이전
          </button>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">
              태어난 시간 <span className="text-[10px] text-gray-600 font-normal">— 시주(時柱) 결정</span>
            </label>
            <p className="text-xs text-gray-600 mb-3">1시간 단위로 선택하면 시주가 더 정밀해집니다</p>

            <button
              type="button"
              onClick={() => set("birthHour", -1)}
              className={`w-full py-2.5 rounded-xl border-2 font-bold text-sm mb-3 transition-all active:scale-95 ${
                form.birthHour === -1
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
              }`}
            >
              ❓ 모름 — 시간을 모를 경우 (분석 가능)
            </button>

            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 24 }, (_, i) => i).map((h) => {
                const shi = HOUR_TO_SHI[h];
                const isSelected = form.birthHour === h;
                const groupCls = SHI_COLORS[shi?.shi ?? ""] ?? "";
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => set("birthHour", h)}
                    className={`py-2.5 rounded-xl border transition-all active:scale-95 text-center ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-400/15 shadow-sm shadow-yellow-500/20"
                        : `${groupCls} hover:border-white/30`
                    }`}
                  >
                    <div className={`text-sm font-black leading-none ${isSelected ? "text-yellow-400" : "text-white"}`}>
                      {String(h).padStart(2, "0")}시
                    </div>
                    <div className={`text-[9px] mt-0.5 font-medium ${isSelected ? "text-yellow-300" : "text-gray-500"}`}>
                      {shi?.shi ?? ""}
                    </div>
                  </button>
                );
              })}
            </div>

            {form.birthHour >= 0 && (
              <div className="mt-3 flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-3 py-2">
                <span className="text-yellow-400 text-xs font-bold">시주(時柱)</span>
                <span className="text-white text-xs font-bold">{HOUR_TO_SHI[form.birthHour]?.shi}</span>
                <span className="text-gray-500 text-xs">{HOUR_TO_SHI[form.birthHour]?.han}</span>
                <span className="text-gray-600 text-xs ml-auto">{getHourLabel(form.birthHour)} 출생</span>
              </div>
            )}
          </div>

          {/* 완성된 사주팔자 미리보기 */}
          <SajuPreview
            year={form.birthYear}
            month={form.birthMonth}
            day={form.birthDay}
            hour={form.birthHour}
          />

          {/* 입력 확인 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm space-y-1.5">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">입력 확인</p>
            {[
              { label: "이름", value: form.name },
              { label: "성별", value: form.gender === "male" ? "남성 (재성 분석)" : "여성 (관성 분석)" },
              { label: "생년월일", value: `${form.birthYear}년 ${form.birthMonth}월 ${form.birthDay}일 (양력)` },
              { label: "태어난 시", value: getHourSummary(form.birthHour) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-bold text-white text-right">{value}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-black text-base disabled:opacity-40 active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
          >
            {loading ? "사주 분석 중..." : "✨ 사주팔자 분석 시작하기"}
          </button>
        </div>
      )}
    </form>
  );
}
