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

// ─────────────────────────────────────────────────────────────
// 사주 심화 해석 컨텍스트 (Claude 프롬프트 강화용)
// ─────────────────────────────────────────────────────────────

/** 천간 → 오행 */
const GAN_ELEMENT: Record<string, string> = {
  갑: "木(양)", 을: "木(음)", 병: "火(양)", 정: "火(음)",
  무: "土(양)", 기: "土(음)", 경: "金(양)", 신: "金(음)",
  임: "水(양)", 계: "水(음)",
};

/** 지지 → 오행 */
const JI_ELEMENT: Record<string, string> = {
  자: "水", 축: "土", 인: "木", 묘: "木",
  진: "土", 사: "火", 오: "火", 미: "土",
  신: "金", 유: "金", 술: "土", 해: "水",
};

/** 일간별 핵심 성격 특성 (명리학 기반) */
const DAY_MASTER_TRAITS: Record<string, { element: string; personality: string; strength: string; weakness: string; relationStyle: string }> = {
  갑: { element: "木(양·양목)", personality: "리더십 강하고 직선적, 원칙주의자, 추진력 넘침", strength: "결단력·개척 정신·정직함", weakness: "고집스럽고 타협 어려움, 유연성 부족", relationStyle: "주도적으로 이끌려 하며 관계에서 책임감 강함" },
  을: { element: "木(음·음목)", personality: "유연하고 적응력 뛰어남, 감성적이며 눈치 빠름", strength: "사교성·공감 능력·섬세함", weakness: "우유부단하고 타인 눈치를 지나치게 봄", relationStyle: "상대에게 맞춰주려 하며 배려심이 깊음" },
  병: { element: "火(양·양화)", personality: "열정적이고 외향적, 존재감 강하며 카리스마 있음", strength: "에너지·긍정성·표현력·영향력", weakness: "감정 기복 크고 과시 욕구, 지속력 약함", relationStyle: "열정적이고 드라마틱한 사랑 표현, 주목받길 원함" },
  정: { element: "火(음·음화)", personality: "따뜻하고 섬세한 감성, 예술적 감각 뛰어남", strength: "직관력·감수성·헌신성·따뜻함", weakness: "감정에 치우치며 상처받기 쉬움", relationStyle: "세심하게 챙기며 감정 공유를 중시함" },
  무: { element: "土(양·양토)", personality: "믿음직스럽고 중후함, 현실적이고 포용력 있음", strength: "신뢰감·안정감·중재력·포용력", weakness: "변화 싫어하고 고집스럽고 둔감해 보일 수 있음", relationStyle: "안정적·장기적 관계 지향, 책임감으로 사랑 표현" },
  기: { element: "土(음·음토)", personality: "세심하고 꼼꼼함, 실용적이며 봉사 정신 강함", strength: "성실함·꼼꼼함·현실 감각·배려심", weakness: "소심하고 걱정 많으며 결정 어려움", relationStyle: "작은 것에 세심히 챙기며 조용히 헌신함" },
  경: { element: "金(양·양금)", personality: "강직하고 원칙적, 결단력 있으며 자존심 강함", strength: "추진력·결단력·명예욕·의리", weakness: "냉정해 보이고 자존심 강해 타협 어려움", relationStyle: "의리와 책임감으로 지키며 표현은 서툴지만 깊음" },
  신: { element: "金(음·음금)", personality: "날카롭고 영리함, 언변 뛰어나고 심미안 있음", strength: "분석력·언어능력·심미안·재치", weakness: "비판적이고 예민하며 자기 기준 높음", relationStyle: "이성적으로 판단하며 상대에게 높은 기준 적용" },
  임: { element: "水(양·양수)", personality: "총명하고 적응력 강함, 자유로운 영혼, 다방면 관심", strength: "지적 능력·융통성·추진력·포용력", weakness: "변덕스럽고 끈기 부족, 집중력 분산", relationStyle: "자유롭고 다양한 만남 즐기나 깊어지면 진지해짐" },
  계: { element: "水(음·음수)", personality: "깊은 사고력과 직관력, 감성적이며 지혜로움", strength: "통찰력·섬세함·감수성·지혜", weakness: "내성적이고 표현 부족, 감정 숨기는 경향", relationStyle: "내면 깊이 감정을 쌓으며 신뢰 형성 후 헌신" },
};

/** 지지별 숨겨진 기운 (지장간 요약) */
const JI_HIDDEN: Record<string, string> = {
  자: "임·계(水 강)", 축: "기·신·계(土·金·水)", 인: "무·병·갑(土·火·木)",
  묘: "갑·을(木 강)", 진: "을·계·무(木·水·土)", 사: "무·경·병(土·金·火)",
  오: "기·정(土·火 강)", 미: "정·을·기(火·木·土)", 신: "무·임·경(土·水·金)",
  유: "경·신(金 강)", 술: "신·정·무(金·火·土)", 해: "무·갑·임(土·木·水)",
};

/**
 * 4기둥에서 오행 분포·일간 특성·신강신약 등을 계산해 Claude 프롬프트용 컨텍스트 문자열 반환
 */
export function buildSajuContext(sajuInfo: SajuInfo): string {
  const pillars = [sajuInfo.yearPillar, sajuInfo.monthPillar, sajuInfo.dayPillar, sajuInfo.hourPillar];

  // 천간 4개 추출
  const stems = pillars.map(p => p[0]);
  // 지지 4개 추출
  const branches = pillars.map(p => p[1]);

  // 일간
  const dayMaster = stems[2];
  const traits = DAY_MASTER_TRAITS[dayMaster] ?? { element: "不明", personality: "미상", strength: "미상", weakness: "미상", relationStyle: "미상" };

  // 오행 카운트 (천간 4개 기준)
  const elemCount: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const s of stems) {
    const e = GAN_ELEMENT[s] ?? "";
    if (e.startsWith("木")) elemCount["木"]++;
    else if (e.startsWith("火")) elemCount["火"]++;
    else if (e.startsWith("土")) elemCount["土"]++;
    else if (e.startsWith("金")) elemCount["金"]++;
    else if (e.startsWith("水")) elemCount["水"]++;
  }
  for (const b of branches) {
    const e = JI_ELEMENT[b] ?? "";
    if (e) elemCount[e] = (elemCount[e] ?? 0) + 1;
  }

  const elemStr = Object.entries(elemCount)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k}${v}개`)
    .join(", ");

  const dominant = Object.entries(elemCount).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "土";
  const lacking = Object.entries(elemCount).filter(([, v]) => v === 0).map(([k]) => k).join("·") || "없음";

  // 일간과 월지 관계로 신강/신약 간략 판단
  const monthBranch = branches[1];
  const monthElem = JI_ELEMENT[monthBranch] ?? "";
  const dayElem = (GAN_ELEMENT[dayMaster] ?? "").split("(")[0]; // 木/火/土/金/水
  const sameOrGen = monthElem === dayElem; // 신강 경향
  const strengthLabel = sameOrGen ? "신강(身强) 경향 - 일간이 강함" : "신약(身弱) 경향 - 일간 보완 필요";

  // 지지 지장간
  const hiddenStems = branches.map(b => `${b}(${JI_HIDDEN[b] ?? "미상"})`).join(", ");

  return `
【일간(日干) - 이 사주의 핵심】
- 일간: ${dayMaster}(${traits.element})
- 성격 핵심: ${traits.personality}
- 강점: ${traits.strength}
- 약점/주의: ${traits.weakness}
- 관계 스타일: ${traits.relationStyle}

【오행(五行) 분포】
- 분포: ${elemStr}
- 강한 오행: ${dominant}
- 부족한 오행: ${lacking}
- ${strengthLabel}

【4기둥 천간 오행】
- 년간 ${stems[0]}(${GAN_ELEMENT[stems[0]] ?? "미상"}) / 월간 ${stems[1]}(${GAN_ELEMENT[stems[1]] ?? "미상"}) / 일간 ${stems[2]}(${GAN_ELEMENT[stems[2]] ?? "미상"}) / 시간 ${stems[3]}(${GAN_ELEMENT[stems[3]] ?? "미상"})

【지지(地支) 지장간 - 숨겨진 기운】
- ${hiddenStems}

【분석 지침】
위 사주 데이터를 바탕으로 반드시 이 사람만의 고유한 특성을 도출하세요.
특히 일간 "${dayMaster}"의 특성과 오행 분포(${dominant} 강세, ${lacking} 부족)가
배우자/귀인/악연의 성격·외모·만남 방식·궁합에 어떻게 반영되는지 구체적으로 서술하세요.`.trim();
}
