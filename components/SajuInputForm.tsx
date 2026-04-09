"use client";

import { useState } from "react";
import type { SajuInput } from "@/lib/types";

interface Props {
  onSubmit: (data: SajuInput) => void;
  loading: boolean;
}

const HOUR_OPTIONS = [
  { value: -1, label: "모름", sub: "시간을 모를 경우" },
  { value: 23, label: "23–01시", sub: "자시 (子時)" },
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
  const [step, setStep] = useState(0); // 0:기본정보 1:생년월일 2:시간

  function set<K extends keyof SajuInput>(k: K, v: SajuInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const isStep0Valid = form.name.trim().length > 0;
  const isStep1Valid = form.birthYear > 0 && form.birthMonth > 0 && form.birthDay > 0;

  // 월별 최대 일수
  const maxDay = new Date(form.birthYear, form.birthMonth, 0).getDate();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-2">
        {["기본 정보", "생년월일", "태어난 시"].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
              i < step ? "bg-amber-500 text-white" :
              i === step ? "bg-amber-500 text-white ring-4 ring-amber-200" :
              "bg-gray-100 text-gray-400"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-amber-700 font-semibold" : "text-gray-400"}`}>{label}</span>
            {i < 2 && <div className={`flex-1 h-0.5 ${i < step ? "bg-amber-400" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 0: 기본 정보 */}
      {step === 0 && (
        <div className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="홍길동"
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border-2 border-amber-200 bg-white text-amber-900 placeholder-amber-300 focus:border-amber-500 focus:outline-none text-base transition-colors"
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">성별</label>
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set("gender", g)}
                  className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    form.gender === g
                      ? "border-amber-500 bg-amber-500 text-white shadow-md scale-[1.02]"
                      : "border-amber-100 bg-white text-amber-700 hover:border-amber-300"
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
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            다음 →
          </button>
        </div>
      )}

      {/* STEP 1: 생년월일 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <button type="button" onClick={() => setStep(0)} className="text-amber-500 text-sm hover:text-amber-700">← 이전</button>
          </div>

          {/* 연도 */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">태어난 해</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set("birthYear", Math.max(1930, form.birthYear - 1))}
                className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold text-lg hover:bg-amber-200 transition-all active:scale-95 shrink-0"
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
                  className="w-24 text-center text-2xl font-black text-amber-900 border-b-2 border-amber-300 focus:border-amber-500 focus:outline-none bg-transparent"
                />
                <span className="text-amber-700 font-bold ml-1">년</span>
              </div>
              <button
                type="button"
                onClick={() => set("birthYear", Math.min(currentYear, form.birthYear + 1))}
                className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold text-lg hover:bg-amber-200 transition-all active:scale-95 shrink-0"
              >+</button>
            </div>
          </div>

          {/* 월 */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">월</label>
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
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100"
                  }`}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>

          {/* 일 */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">일</label>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set("birthDay", d)}
                  className={`py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                    form.birthDay === d
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100"
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
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg disabled:opacity-40 active:scale-95 transition-all"
          >
            다음 →
          </button>
        </div>
      )}

      {/* STEP 2: 태어난 시 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <button type="button" onClick={() => setStep(1)} className="text-amber-500 text-sm hover:text-amber-700">← 이전</button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-1">태어난 시간</label>
            <p className="text-xs text-amber-500 mb-3">모르시면 '모름'을 선택해도 분석 가능합니다</p>
            <div className="grid grid-cols-2 gap-2">
              {HOUR_OPTIONS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => set("birthHour", h.value)}
                  className={`px-3 py-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                    form.birthHour === h.value
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-amber-100 bg-white hover:border-amber-300"
                  }`}
                >
                  <div className={`text-sm font-bold ${form.birthHour === h.value ? "text-amber-700" : "text-gray-700"}`}>
                    {h.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{h.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 요약 */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-sm text-amber-800 space-y-1">
            <p className="font-semibold text-amber-600 text-xs uppercase tracking-wider mb-2">입력 정보 확인</p>
            <div className="flex justify-between"><span className="text-gray-500">이름</span><span className="font-bold">{form.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">성별</span><span className="font-bold">{form.gender === "male" ? "남성" : "여성"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">생년월일</span><span className="font-bold">{form.birthYear}년 {form.birthMonth}월 {form.birthDay}일</span></div>
            <div className="flex justify-between"><span className="text-gray-500">태어난 시</span><span className="font-bold">{HOUR_OPTIONS.find(h => h.value === form.birthHour)?.label ?? "모름"}</span></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? "사주 분석 중..." : "✨ 사주 분석 시작하기"}
          </button>
        </div>
      )}
    </form>
  );
}
