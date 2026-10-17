"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SavedResult {
  savedAt: number;
  productType: "spouse" | "guardian" | "enemy" | "bundle";
  name: string;
  gender: "male" | "female";
  imageUrl: string;
  analysis: object;
  bundleResults: object | null;
  paid: boolean;
}

interface PaidRecord {
  sajuHash: string;
  orderId: string;
  paidAt: number;
}

const PRODUCT_META = {
  spouse:  { emoji: "💑", name: "내님은누구",   color: "from-rose-500 to-pink-600",   accent: "text-rose-400",   border: "border-rose-500/30" },
  guardian:{ emoji: "🌟", name: "내귀인은누구", color: "from-amber-400 to-yellow-500", accent: "text-amber-400",  border: "border-amber-500/30" },
  enemy:   { emoji: "😤", name: "내웬수는누구", color: "from-slate-500 to-slate-600",  accent: "text-slate-300",  border: "border-slate-500/30" },
  bundle:  { emoji: "🔮", name: "3종 묶음",     color: "from-purple-500 to-violet-600",accent: "text-purple-400", border: "border-purple-500/30" },
};

function getSavedResults(userId: string): SavedResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(`naenim_results_${userId}`) ?? "[]");
  } catch { return []; }
}

function getPaidRecords(): PaidRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("saju_paid_v1") ?? "[]");
  } catch { return []; }
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [paidRecords, setPaidRecords] = useState<PaidRecord[]>([]);

  useEffect(() => {
    setPaidRecords(getPaidRecords());
    if (session?.user?.id) {
      setSavedResults(getSavedResults(session.user.id));
    }
  }, [session]);

  function handleViewResult(r: SavedResult) {
    const resultData = {
      name: r.name,
      gender: r.gender,
      analysis: r.analysis,
      imageUrl: r.imageUrl,
      productType: r.productType,
      bundleResults: r.bundleResults,
      paid: true,
      demo: false,
    };
    try {
      sessionStorage.setItem("sajuResult", JSON.stringify(resultData));
    } catch { /* ignore */ }
    router.push("/result");
  }

  function handleDeleteResult(idx: number) {
    if (!session?.user?.id) return;
    const updated = savedResults.filter((_, i) => i !== idx);
    setSavedResults(updated);
    localStorage.setItem(`naenim_results_${session.user.id}`, JSON.stringify(updated));
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d12]">
        <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[#0d0d12]">
      <div className="max-w-md mx-auto space-y-5">

        <h1 className="text-xl font-black text-white">마이페이지</h1>

        {/* 계정 */}
        <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-gray-900 text-2xl font-black shadow-md">
                {(session.user?.name ?? session.user?.email ?? "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">
                  {session.user?.name ?? session.user?.email?.split("@")[0] ?? "사용자"}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{session.user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs font-semibold rounded-full">
                  카카오 로그인
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all shrink-0"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="text-5xl">🔮</div>
              <div>
                <p className="font-bold text-white text-lg">로그인하고 결과 저장하기</p>
                <p className="text-sm text-gray-500 mt-1">결제 후 로그인하면 언제든 다시 볼 수 있어요</p>
              </div>
              <button
                onClick={() => signIn("kakao", { callbackUrl: "/mypage" })}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-900 active:scale-95 transition-all"
                style={{ backgroundColor: "#FEE500" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                </svg>
                카카오로 3초 로그인
              </button>
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/mypage" })}
                className="w-full py-3 rounded-2xl text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                다른 방법으로 로그인
              </button>
            </div>
          )}
        </div>

        {/* 저장된 결과 */}
        {session && (
          <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">저장된 분석 결과</p>
              <span className="text-xs text-gray-500">{savedResults.length}개</span>
            </div>

            {savedResults.length > 0 ? (
              <div className="space-y-3">
                {savedResults.map((r, i) => {
                  const meta = PRODUCT_META[r.productType] ?? PRODUCT_META.spouse;
                  return (
                    <div key={i} className={`rounded-2xl border ${meta.border} bg-white/3 overflow-hidden`}>
                      <div className="flex items-center gap-3 p-3">
                        {/* 몽타주 썸네일 */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 shrink-0">
                          {r.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.imageUrl} alt="몽타주" className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl`}>
                              {meta.emoji}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-xs font-bold ${meta.accent}`}>{meta.emoji} {meta.name}</span>
                          </div>
                          <p className="text-sm font-bold text-white">{r.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(r.savedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleViewResult(r)}
                            className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${meta.color} text-white text-xs font-bold active:scale-95 transition-all`}
                          >
                            다시 보기
                          </button>
                          <button
                            onClick={() => handleDeleteResult(i)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 text-gray-600 text-xs hover:text-red-400 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-3xl">🔮</p>
                <p className="text-sm text-gray-500">아직 저장된 결과가 없어요</p>
                <p className="text-xs text-gray-600">결제 완료 후 자동으로 저장됩니다</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-sm active:scale-95 transition-all"
                >
                  ✨ 사주 분석 시작하기
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 결제 내역 */}
        <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">결제 내역</p>
            <span className="text-xs text-gray-500">{paidRecords.length}건</span>
          </div>

          {paidRecords.length > 0 ? (
            <div className="space-y-2">
              {paidRecords.slice().reverse().map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm shrink-0">✅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">프리미엄 분석</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(r.paidAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    {r.orderId && !r.orderId.startsWith("demo_") && (
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">주문번호: {r.orderId}</p>
                    )}
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold shrink-0">결제완료</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">결제 내역이 없습니다</p>
            </div>
          )}
        </div>

        {/* 초기화 */}
        <button
          onClick={() => {
            if (confirm("모든 저장 데이터를 삭제하시겠습니까?")) {
              localStorage.removeItem("saju_paid_v1");
              sessionStorage.removeItem("sajuResult");
              if (session?.user?.id) {
                localStorage.removeItem(`naenim_results_${session.user.id}`);
                setSavedResults([]);
              }
              setPaidRecords([]);
            }
          }}
          className="w-full py-3 text-sm text-gray-600 hover:text-red-400 transition-colors"
        >
          🗑 저장된 데이터 초기화
        </button>

      </div>
    </div>
  );
}
