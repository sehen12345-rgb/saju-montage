import type { SajuInfo } from "./types";

const CHEONGAN = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const JIJI = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

function ganAt(n: number): string { return CHEONGAN[((n % 10) + 10) % 10]; }
function jiAt(n: number): string  { return JIJI[((n % 12) + 12) % 12]; }

// ─────────────────────────────────────────────────────────────
// 태양 황경 계산 (Jean Meeus "Astronomical Algorithms" Ch.25)
// 정확도 ±0.01° ≈ ±25분, 1900–2100년 범위
// ─────────────────────────────────────────────────────────────

/** 달력 날짜(UT) → Julian Day Number */
function ymdToJD(year: number, month: number, day: number, hourUT = 12): number {
  let Y = year, M = month;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + hourUT / 24 + B - 1524.5;
}

/** JD → 달력 날짜 */
function jdToYMDH(jd: number): { year: number; month: number; day: number; hour: number } {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  return { year, month, day, hour: f * 24 };
}

/** 태양 겉보기 황경 (degrees, 0–360) */
function solarLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M  = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * (Math.PI / 180);
  const C  =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  const sun = L0 + C;
  const omega = (125.04 - 1934.136 * T) * (Math.PI / 180);
  const apparent = sun - 0.00569 - 0.00478 * Math.sin(omega);
  return ((apparent % 360) + 360) % 360;
}

/** targetLon 에 도달하는 JD를 Newton법으로 계산 */
function findTermJD(approxJD: number, targetLon: number): number {
  let jd = approxJD;
  for (let i = 0; i < 50; i++) {
    let diff = targetLon - solarLon(jd);
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (Math.abs(diff) < 1e-7) break;
    jd += diff / 360 * 365.25;
  }
  return jd;
}

/**
 * 12절기 황경 (월지지 시작 기준):
 * idx 0=자(대설 255°), 1=축(소한 285°), 2=인(입춘 315°), 3=묘(경칩 345°),
 *     4=진(청명 15°),  5=사(입하 45°),  6=오(망종 75°),  7=미(소서 105°),
 *     8=신(입추 135°), 9=유(백로 165°), 10=술(한로 195°),11=해(입동 225°)
 */
const TERM_LON  = [255, 285, 315, 345,  15,  45,  75, 105, 135, 165, 195, 225];
/** 각 절기의 대략적 양력 월/일 (UT 기준, 검색 초기값) */
const TERM_APPROX: [number, number][] = [
  [12, 7], [1, 6], [2, 4], [3, 6], [4, 5], [5, 6],
  [6,  6], [7, 7], [8, 7], [9, 8], [10,8], [11,7],
];

const termCache = new Map<string, number>();

/**
 * year 년의 월지지 idx 절기의 JD(KST, UTC+9) 반환.
 * - idx=1(소한): 해당 year 1월초
 * - idx=0(대설): 해당 year 12월초
 */
function termJDKST(year: number, idx: number): number {
  const key = `${year}_${idx}`;
  if (termCache.has(key)) return termCache.get(key)!;

  const [mo, da] = TERM_APPROX[idx];
  const approxJD = ymdToJD(year, mo, da, 0);
  const jdUT = findTermJD(approxJD, TERM_LON[idx]);
  const result = jdUT + 9 / 24; // UT → KST
  termCache.set(key, result);
  return result;
}

/**
 * 생년월일시(KST) → JD (KST 기준 JD = UT JD + 9/24)
 * termJDKST 도 같은 기준이므로 비교 가능
 */
function birthJDKST(year: number, month: number, day: number, hour: number): number {
  return ymdToJD(year, month, day, hour); // KST 시간을 그대로 사용
}

// ─────────────────────────────────────────────────────────────
// 년주 (입춘 기준)
// ─────────────────────────────────────────────────────────────
function getYearPillar(year: number, month: number, day: number, hour: number): string {
  const bJD   = birthJDKST(year, month, day, hour >= 0 ? hour : 12);
  const ipJD  = termJDKST(year, 2); // 입춘(인월 시작, idx=2)
  const effY  = bJD < ipJD ? year - 1 : year;
  const diff  = effY - 1984; // 1984 = 갑자년
  return ganAt(diff) + jiAt(diff);
}

// ─────────────────────────────────────────────────────────────
// 월주 (절기 기준)
// ─────────────────────────────────────────────────────────────

/** 년간별 인월(寅月, idx=2) 천간 시작 인덱스 */
const IN_WEOL_GAN: Record<number, number> = {
  0: 2, 1: 4, 2: 6, 3: 8, 4: 0,   // 갑·을·병·정·무
  5: 2, 6: 4, 7: 6, 8: 8, 9: 0,   // 기·경·신·임·계
};

function getMonthPillar(year: number, month: number, day: number, hour: number): string {
  const bJD = birthJDKST(year, month, day, hour >= 0 ? hour : 12);

  // 가장 최근(bJD 이하) 절기 찾기 — 전년·당년·내년 범위
  let latestIdx = -1;
  let latestJD  = -Infinity;
  let latestTermYear = year;

  for (const y of [year - 1, year, year + 1]) {
    for (let idx = 0; idx < 12; idx++) {
      const tJD = termJDKST(y, idx);
      if (tJD <= bJD && tJD > latestJD) {
        latestJD  = tJD;
        latestIdx = idx;
        latestTermYear = y;
      }
    }
  }

  if (latestIdx < 0) latestIdx = 2; // fallback

  // 월 지지: JIJI[latestIdx]
  const monthJi = JIJI[latestIdx];

  // 월 천간: 입춘 기준 실효 년도의 년간에서 결정
  const ipJD = termJDKST(year, 2);
  const effY  = bJD < ipJD ? year - 1 : year;
  const yearGanIdx = ((effY - 1984) % 10 + 10) % 10;
  const baseGan    = IN_WEOL_GAN[yearGanIdx];
  // 인월(idx=2) 기준 몇 달 후인지
  const monthOffset = (latestIdx - 2 + 12) % 12;
  const monthGan    = (baseGan + monthOffset) % 10;

  return ganAt(monthGan) + monthJi;
}

// ─────────────────────────────────────────────────────────────
// 일주 (올바른 기준일 사용)
// 검증된 기준: 1969-12-01 = 甲子日 (을미일 1970-01-01 확인됨)
// ─────────────────────────────────────────────────────────────
const JIAZI_BASE_MS = Date.UTC(1969, 11, 1); // 1969-12-01 UTC = 甲子日

function getDayPillar(year: number, month: number, day: number, hour: number): { pillar: string; ganIdx: number } {
  // 야자시(23:00~) → 다음날 일주
  let y = year, m = month, d = day;
  if (hour >= 23) {
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    y = next.getUTCFullYear(); m = next.getUTCMonth() + 1; d = next.getUTCDate();
  }
  const targetMS  = Date.UTC(y, m - 1, d);
  const diffDays  = Math.round((targetMS - JIAZI_BASE_MS) / 86400000);
  const ganIdx    = ((diffDays % 10) + 10) % 10;
  return { pillar: ganAt(diffDays) + jiAt(diffDays), ganIdx };
}

// ─────────────────────────────────────────────────────────────
// 시주
// 자시 23:00~00:59 / 축시 01:00~02:59 / ... / 해시 21:00~22:59
// 23시는 야자시 → 일주는 다음날 기준(getDayPillar에서 처리)
// ─────────────────────────────────────────────────────────────
function getHourPillar(hour: number, dayGanIdx: number): string {
  // 지지 결정
  let jijiIdx: number;
  if (hour === 23 || hour === 0) {
    jijiIdx = 0; // 자시
  } else {
    jijiIdx = Math.ceil(hour / 2); // 1→1(축) 3→2(인) ... 22→11(해)
  }

  // 천간 결정: 甲·己일 → 甲자시, 乙·庚일 → 丙자시, ...
  const ganBase: Record<number, number> = {
    0: 0, 5: 0,   // 갑·기 → 갑자시
    1: 2, 6: 2,   // 을·경 → 병자시
    2: 4, 7: 4,   // 병·신 → 무자시
    3: 6, 8: 6,   // 정·임 → 경자시
    4: 8, 9: 8,   // 무·계 → 임자시
  };
  const base = ganBase[dayGanIdx];
  return ganAt(base + jijiIdx) + jiAt(jijiIdx);
}

// ─────────────────────────────────────────────────────────────
// 공개 API
// ─────────────────────────────────────────────────────────────
export function calculateSaju(year: number, month: number, day: number, hour: number): SajuInfo {
  const yearPillar  = getYearPillar(year, month, day, hour);
  const monthPillar = getMonthPillar(year, month, day, hour);
  const { pillar: dayPillar, ganIdx: dayGanIdx } = getDayPillar(year, month, day, hour);
  const hourPillar  = hour >= 0 ? getHourPillar(hour, dayGanIdx) : "미상";

  return { yearPillar, monthPillar, dayPillar, hourPillar };
}
