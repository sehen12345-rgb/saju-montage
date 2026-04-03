import type { SajuInfo } from "./types";

const CHEONGAN = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const JIJI = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

const HOUR_JIJI: Record<number, string> = {
  0: "자", 1: "자", 2: "축", 3: "축", 4: "인", 5: "인",
  6: "묘", 7: "묘", 8: "진", 9: "진", 10: "사", 11: "사",
  12: "오", 13: "오", 14: "미", 15: "미", 16: "신", 17: "신",
  18: "유", 19: "유", 20: "술", 21: "술", 22: "해", 23: "해",
};

function getCheongan(index: number): string {
  return CHEONGAN[((index % 10) + 10) % 10];
}

function getJiji(index: number): string {
  return JIJI[((index % 12) + 12) % 12];
}

// 년주 계산 (1984년 = 갑자년)
function getYearPillar(year: number): string {
  const base = 1984;
  const diff = year - base;
  return getCheongan(diff) + getJiji(diff);
}

// 월주 계산 (1월=인월 기준 단순 계산)
function getMonthPillar(year: number, month: number): string {
  const yearGanIdx = (year - 1984) % 10;
  // 월 천간 기준표: 년간에 따라 1월 천간 결정
  const monthGanBase: Record<number, number> = {
    0: 2, 1: 4, 2: 6, 3: 8, 4: 0, 5: 2, 6: 4, 7: 6, 8: 8, 9: 0,
  };
  const base = monthGanBase[((yearGanIdx % 10) + 10) % 10];
  const idx = (base + month - 1) % 10;
  const jijiIdx = (month + 1) % 12; // 1월=인(2)
  return getCheongan(idx) + JIJI[jijiIdx];
}

// 일주 계산 (율리우스 일수 기반)
function getDayPillar(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(1900, 0, 1); // 기준: 1900-01-01 = 갑자일
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / 86400000);
  // 1900-01-01은 갑자(0,0)
  return getCheongan(diffDays) + getJiji(diffDays);
}

// 시주 계산
function getHourPillar(hour: number, dayGanIdx: number): string {
  if (hour < 0) return "미상";
  const jijiStr = HOUR_JIJI[hour];
  const jijiIdx = JIJI.indexOf(jijiStr);
  const ganBase: Record<number, number> = {
    0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 0, 6: 2, 7: 4, 8: 6, 9: 8,
  };
  const base = ganBase[((dayGanIdx % 10) + 10) % 10];
  return getCheongan(base + jijiIdx) + jijiStr;
}

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number
): SajuInfo {
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);

  // 일 천간 인덱스 추출
  const dayDate = new Date(year, month - 1, day);
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((dayDate.getTime() - baseDate.getTime()) / 86400000);
  const dayGanIdx = ((diffDays % 10) + 10) % 10;

  const hourPillar = hour >= 0 ? getHourPillar(hour, dayGanIdx) : "미상";

  return { yearPillar, monthPillar, dayPillar, hourPillar };
}
