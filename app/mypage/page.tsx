"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PaidRecord {
  sajuHash: string;
  orderId: string;
  paidAt: number;
}

function getPaidRecords(): PaidRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("saju_paid_v1") ?? "[]");
  } catch {
    return [];
  }
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paidRecords, setPaidRecords] = useState<PaidRecord[]>([]);
  const [hasSavedResult, setHasSavedResult] = useState(false);

  useEffect(() => {
    setPaidRecords(getPaidRecords());
    setHasSavedResult(!!sessionStorage.getItem("sajuResult"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[#0d0d12]">
      <div className="max-w-md mx-auto space-y-5">

        <h1 className="text-xl font-black text-white">마이페이지</h1>

        {/* 계정 정보 */}
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
                  로그인됨
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
            <div className="text-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl mx-auto">
                👤
              </div>
              <div>
                <p className="font-bold text-white">로그인이 필요합니다</p>
                <p className="text-xs text-gray-500 mt-1">로그인하면 결제 내역이 영구 보관됩니다</p>
              </div>
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/mypage" })}
                className="w-full py-3 rounded-2xl bg-yellow-400 text-gray-900 font-bold active:scale-95 transition-all hover:bg-yellow-300"
              >
                로그인하기
              </button>
            </div>
          )}
        </div>

        {/* 내 결과 */}
        <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5 space-y-3">
          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">내 분석 결과</p>
          {hasSavedResult ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-yellow-400/10 rounded-2xl p-4 border border-yellow-400/20">
                <span className="text-3xl">🔮</span>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">사주 분석 완료</p>
                  <p className="text-xs text-gray-500 mt-0.5">세션에 저장된 결과가 있습니다</p>
                </div>
                <Link
                  href="/result"
                  className="px-3 py-1.5 rounded-xl bg-yellow-400 text-gray-900 text-xs font-bold hover:bg-yellow-300 transition-all active:scale-95 shrink-0"
                >
                  보기
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-gray-500">저장된 결과가 없습니다</p>
              <Link
                href="/input"
                className="inline-block px-6 py-2.5 rounded-2xl bg-yellow-400 text-gray-900 font-bold text-sm active:scale-95 transition-all hover:bg-yellow-300"
              >
                ✨ 사주 분석 시작하기
              </Link>
            </div>
          )}
        </div>

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
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm shrink-0">
                    ✅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">프리미엄 분석 · 990원</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(r.paidAt).toLocaleDateString("ko-KR", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                    {r.orderId && !r.orderId.startsWith("demo_") && (
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">주문번호: {r.orderId}</p>
                    )}
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold shrink-0">
                    결제완료
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">결제 내역이 없습니다</p>
              <p className="text-xs text-gray-600 mt-1">결제 내역은 이 기기에 저장됩니다</p>
            </div>
          )}
        </div>

        {/* 앱 정보 */}
        <div className="bg-[#13131a] border border-white/10 rounded-3xl p-5 space-y-3">
          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">앱 정보</p>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>버전</span><span className="text-gray-500">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>결제 금액</span><span className="text-gray-500">990원 (1회)</span>
            </div>
            <div className="flex justify-between">
              <span>데이터 저장</span><span className="text-gray-500">이 기기에만 저장</span>
            </div>
          </div>
        </div>

        {/* 로컬 데이터 초기화 */}
        <button
          onClick={() => {
            if (confirm("모든 결제 내역과 저장된 결과를 삭제하시겠습니까?")) {
              localStorage.removeItem("saju_paid_v1");
              sessionStorage.removeItem("sajuResult");
              setPaidRecords([]);
              setHasSavedResult(false);
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
