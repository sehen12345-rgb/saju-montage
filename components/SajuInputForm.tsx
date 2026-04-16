"use client";

import { useState } from "react";
import type { SajuInput } from "@/lib/types";

interface Props {
  onSubmit: (data: SajuInput) => void;
  loading: boolean;
}

const HOUR_OPTIONS = [
  { value: -1, label: "모름",    sub: "시간을 모를 경우" },
  { value: 23, label: "23–24시", sub: "야자시 (夜子時)" },
  { value: 0,  label: "00–01시", sub: "정자시 (正子時)" },
  { value: 1,  label: "01–03시", sub: "축시 (丑時)" },
  { value: 3,  label: "03–05시", sub: "인시 (寅時)" },
  { value: 5,  label: "05–07시", sub: "묘시 (卯時)" },
  { value: 7,  label: "07–09시", sub: "진시 (辰時)" },
  { value: 9,  label: "09–11시", sub: "사시 (巳時)" },
  { value: 11, label: "11–13시", sub: "오시 (午時)" },
  { value: 13, label: "13–15시", sub: "미시 (未時)" },
  { value: 15, label: "15–17시", sub: "신시 (申時)" },
  { value: 17, label: "17–19시", sub: "유시 (酉時)" },
  { value: 19, label: "19–21시", sub: "술시 (戌時)" },
  { value: 21, label: "21–23시", sub: "해시 (亥時)" },
];

const currentYear = new Date().getFullYear();

const STEP_HINTS = [
  {
    icon: "☯",
    text: "성별에 따라 관성(官星)·재성(財星) 방향이 달라집니다. 여성은 관성, 남성은 재성이 배우자 기운입니다.",
  },
  {
    icon: "📅",
    text: "생년은 년주(年柱), 생월은 월주(月柱), 생일은 일주(日柱)를 결정합니다. 일주는 배우자 자리가 담긴 가장 중요한 기둥입니다.",
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
      <div className="flex items-start gap-2.5 bg-yellow-500/5 border border-yellow-500/15 rounded-2xl px-3.5 py-3">
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

          <button
            type="button"
            disabled={!isStep1Valid}
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-xl bg-white text-gray-900 font-black text-base disabled:opacity-20 active:scale-95 transition-all"
          >
            다음 →
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
            <p className="text-xs text-gray-600 mb-3">모르셔도 분석 가능하지만, 알면 훨씬 정밀해집니다</p>
            <div className="grid grid-cols-2 gap-2">
              {HOUR_OPTIONS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => set("birthHour", h.value)}
                  className={`px-3 py-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                    form.birthHour === h.value
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className={`text-sm font-bold ${form.birthHour === h.value ? "text-yellow-400" : "text-gray-300"}`}>
                    {h.label}
                  </div>
                  <div className="text-xs mt-0.5 text-gray-600">{h.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 입력 확인 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm space-y-1.5">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">사주 입력 확인</p>
            {[
              { label: "이름", value: form.name },
              { label: "성별", value: form.gender === "male" ? "남성 (재성 분석)" : "여성 (관성 분석)" },
              { label: "생년월일", value: `${form.birthYear}년 ${form.birthMonth}월 ${form.birthDay}일` },
              { label: "태어난 시", value: HOUR_OPTIONS.find(h => h.value === form.birthHour)?.label ?? "모름" },
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
