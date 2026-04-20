/**
 * 결제 완료 상태를 localStorage에 저장/확인.
 * 사주 해시를 키로 사용해 같은 사주는 다시 결제 안 해도 됨.
 */

// ── 가격 상수 ─────────────────────────────────────────────
export const PRICE_INDIVIDUAL = 2000;   // 개별 상품 1개
export const PRICE_BUNDLE = 5000;       // 3개 묶음

const STORAGE_KEY = "saju_paid_v1";
const BUNDLE_STORAGE_KEY = "saju_bundle_paid_v1";

interface PaidRecord {
  sajuHash: string;
  orderId: string;
  paidAt: number;
}

function getRecords(key: string): PaidRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

export function savePaidRecord(sajuHash: string, orderId: string) {
  const records = getRecords(STORAGE_KEY).filter((r) => r.sajuHash !== sajuHash);
  records.push({ sajuHash, orderId, paidAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function isPaidForSaju(sajuHash: string): boolean {
  return getRecords(STORAGE_KEY).some((r) => r.sajuHash === sajuHash);
}

/** 번들(3개 묶음) 결제 저장 — 사주 기본 해시 기준 */
export function saveBundlePaidRecord(sajuBaseHash: string, orderId: string) {
  const records = getRecords(BUNDLE_STORAGE_KEY).filter((r) => r.sajuHash !== sajuBaseHash);
  records.push({ sajuHash: sajuBaseHash, orderId, paidAt: Date.now() });
  localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(records));
}

/** 번들 결제 여부 확인 */
export function isBundlePaid(sajuBaseHash: string): boolean {
  return getRecords(BUNDLE_STORAGE_KEY).some((r) => r.sajuHash === sajuBaseHash);
}

/** 사주 4기둥 + 성별로 해시 생성 */
export function makeSajuHash(yearPillar: string, monthPillar: string, dayPillar: string, hourPillar: string, gender: string): string {
  const str = `${yearPillar}${monthPillar}${dayPillar}${hourPillar}${gender}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/** 사주 4기둥 + 성별 + 상품유형으로 해시 생성 */
export function makeProductHash(yearPillar: string, monthPillar: string, dayPillar: string, hourPillar: string, gender: string, productType: string): string {
  const str = `${productType}_${yearPillar}${monthPillar}${dayPillar}${hourPillar}${gender}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
