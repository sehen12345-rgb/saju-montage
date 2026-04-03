"use client";

import { useState } from "react";
import type { SajuInput } from "@/lib/types";

interface Props {
  onSubmit: (data: SajuInput) => void;
  loading: boolean;
}

const HOURS = [
  { value: -1, label: "모름" },
  { value: 0, label: "00시 (자시 초반)" },
  { value: 1, label: "01시 (자시 후반)" },
  { value: 2, label: "02시 (축시 초반)" },
  { value: 3, label: "03시 (축시 후반)" },
  { value: 4, label: "04시 (인시 초반)" },
  { value: 5, label: "05시 (인시 후반)" },
  { value: 6, label: "06시 (묘시 초반)" },
  { value: 7, label: "07시 (묘시 후반)" },
  { value: 8, label: "08시 (진시 초반)" },
  { value: 9, label: "09시 (진시 후반)" },
  { value: 10, label: "10시 (사시 초반)" },
  { value: 11, label: "11시 (사시 후반)" },
  { value: 12, label: "12시 (오시 초반)" },
  { value: 13, label: "13시 (오시 후반)" },
  { value: 14, label: "14시 (미시 초반)" },
  { value: 15, label: "15시 (미시 후반)" },
  { value: 16, label: "16시 (신시 초반)" },
  { value: 17, label: "17시 (신시 후반)" },
  { value: 18, label: "18시 (유시 초반)" },
  { value: 19, label: "19시 (유시 후반)" },
  { value: 20, label: "20시 (술시 초반)" },
  { value: 21, label: "21시 (술시 후반)" },
  { value: 22, label: "22시 (해시 초반)" },
  { value: 23, label: "23시 (해시 후반)" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function SajuInputForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<SajuInput>({
    name: "",
    birthYear: 1995,
    birthMonth: 1,
    birthDay: 1,
    birthHour: -1,
    gender: "male",
  });

  function handleChange(field: keyof SajuInput, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-2">이름</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="홍길동"
          required
          maxLength={20}
          className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-amber-900 placeholder-amber-300 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* 성별 */}
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-2">성별</label>
        <div className="flex gap-4">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleChange("gender", g)}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                form.gender === g
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-amber-200 bg-white text-amber-700 hover:border-amber-400"
              }`}
            >
              {g === "male" ? "👨 남성" : "👩 여성"}
            </button>
          ))}
        </div>
      </div>

      {/* 생년월일 */}
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-2">생년월일</label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <select
              value={form.birthYear}
              onChange={(e) => handleChange("birthYear", Number(e.target.value))}
              className="w-full px-3 py-3 rounded-xl border-2 border-amber-200 bg-white text-amber-900 focus:border-amber-500 focus:outline-none"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={form.birthMonth}
              onChange={(e) => handleChange("birthMonth", Number(e.target.value))}
              className="w-full px-3 py-3 rounded-xl border-2 border-amber-200 bg-white text-amber-900 focus:border-amber-500 focus:outline-none"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={form.birthDay}
              onChange={(e) => handleChange("birthDay", Number(e.target.value))}
              className="w-full px-3 py-3 rounded-xl border-2 border-amber-200 bg-white text-amber-900 focus:border-amber-500 focus:outline-none"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 태어난 시간 */}
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-2">
          태어난 시간 <span className="text-amber-500 font-normal">(모르면 '모름' 선택)</span>
        </label>
        <select
          value={form.birthHour}
          onChange={(e) => handleChange("birthHour", Number(e.target.value))}
          className="w-full px-3 py-3 rounded-xl border-2 border-amber-200 bg-white text-amber-900 focus:border-amber-500 focus:outline-none"
        >
          {HOURS.map((h) => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "사주 분석 중..." : "✨ 배우자 몽타주 보기"}
      </button>
    </form>
  );
}
