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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-0">
        {["기본 정보", "생년월일", "태어난 시"].map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-gray-900 text-white" :
                i === step ? "bg-yellow-400 text-gray-900" :
                "bg-gray-200 text-gray-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-medium ${i === step ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
            </div>
            {i < 2 && (
              <div className={`h-0.5 w-8 mb-4 ${i < step ? "bg-gray-900" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 0: 기본 정보 */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="홍길동"
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-300 focus:border-gray-900 focus:outline-none text-base transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">성별</label>
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set("gender", g)}
                  className={`py-4 rounded-2xl border-2 font-bold text-base transition-all ${
                    form.gender === g
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {g === "male" ? "👨 남성" : "👩 여성"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!isStep0Valid}
            onClick={() => setStep(1)}
            className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-base disabled:opacity-30 active:scale-95 transition-all"
          >
            다음 →
          </button>
        </div>
      )}

      {/* STEP 1: 생년월일 */}
      {step === 1 && (
        <div className="space-y-4">
          <button type="button" onClick={() => setStep(0)} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800">
            ← 이전
          </button>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">태어난 해</label>
            <div className="flex items-center gap-3 bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
              <button
                type="button"
                onClick={() => set("birthYear", Math.max(1930, form.birthYear - 1))}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition-all active:scale-95 shrink-0"
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
                  className="w-20 text-center text-2xl font-black text-gray-900 focus:outline-none bg-transparent"
                />
                <span className="text-gray-600 font-bold ml-1">년</span>
              </div>
              <button
                type="button"
                onClick={() => set("birthYear", Math.min(currentYear, form.birthYear + 1))}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition-all active:scale-95 shrink-0"
              >+</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">월</label>
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
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">일</label>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set("birthDay", d)}
                  className={`py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                    form.birthDay === d
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
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
            className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-base disabled:opacity-30 active:scale-95 transition-all"
          >
            다음 →
          </button>
        </div>
      )}

      {/* STEP 2: 태어난 시 */}
      {step === 2 && (
        <div className="space-y-4">
          <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800">
            ← 이전
          </button>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">태어난 시간</label>
            <p className="text-xs text-gray-400 mb-3">모르시면 '모름'을 선택해도 분석 가능합니다</p>
            <div className="grid grid-cols-2 gap-2">
              {HOUR_OPTIONS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => set("birthHour", h.value)}
                  className={`px-3 py-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                    form.birthHour === h.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className={`text-sm font-bold ${form.birthHour === h.value ? "text-white" : "text-gray-700"}`}>
                    {h.label}
                  </div>
                  <div className={`text-xs mt-0.5 ${form.birthHour === h.value ? "text-gray-300" : "text-gray-400"}`}>{h.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 요약 */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-sm space-y-1.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">입력 정보 확인</p>
            {[
              { label: "이름", value: form.name },
              { label: "성별", value: form.gender === "male" ? "남성" : "여성" },
              { label: "생년월일", value: `${form.birthYear}년 ${form.birthMonth}월 ${form.birthDay}일` },
              { label: "태어난 시", value: HOUR_OPTIONS.find(h => h.value === form.birthHour)?.label ?? "모름" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400">{label}</span>
                <span className="font-bold text-gray-900">{value}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-yellow-400 text-gray-900 font-bold text-base disabled:opacity-40 active:scale-95 transition-all"
          >
            {loading ? "사주 분석 중..." : "✨ 사주 분석 시작하기"}
          </button>
        </div>
      )}
    </form>
  );
}
