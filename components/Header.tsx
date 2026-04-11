"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname?.startsWith("/payment") || pathname === "/login") return null;

  const pageTitle: Record<string, string> = {
    "/": "내님은누구",
    "/input": "사주 입력",
    "/result": "사주 분석 결과",
    "/mypage": "마이페이지",
  };
  const title = pageTitle[pathname ?? "/"] ?? "내님은누구";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between relative">
        {/* 뒤로가기 or 로고 */}
        {pathname !== "/" ? (
          <Link href="/" className="w-8 h-8 flex items-center justify-center text-gray-700">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </Link>
        ) : (
          <div className="w-8" />
        )}

        {/* 타이틀 */}
        <span className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-gray-900">{title}</span>

        {/* 오른쪽 액션 */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-gray-900"
              >
                {(session.user?.name ?? session.user?.email ?? "U")[0].toUpperCase()}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <Link href="/mypage" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      👤 마이페이지
                    </Link>
                    <Link href="/result" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      🔮 내 결과 보기
                    </Link>
                    <div className="border-t border-gray-100" />
                    <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50">
                      🚪 로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: pathname ?? "/" })}
              className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
