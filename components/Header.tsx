"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // 결과/로그인/결제 페이지엔 심플 헤더
  const isMinimal = pathname?.startsWith("/payment") || pathname === "/login";
  if (isMinimal) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-amber-100 shadow-sm">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🔮</span>
          <span className="font-black text-amber-900 text-sm leading-tight">
            내 배우자<br className="hidden" />얼굴봤다
          </span>
        </Link>

        {/* 오른쪽 액션 */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="w-7 h-7 rounded-full bg-amber-100 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold">
                  {(session.user?.name ?? session.user?.email ?? "U")[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-amber-800 max-w-[80px] truncate">
                  {session.user?.name ?? session.user?.email?.split("@")[0]}
                </span>
                <span className="text-amber-400 text-xs">{menuOpen ? "▲" : "▼"}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden z-50">
                    <Link
                      href="/mypage"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                    >
                      👤 마이페이지
                    </Link>
                    <Link
                      href="/result"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                    >
                      🔮 내 결과 보기
                    </Link>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      🚪 로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: pathname ?? "/" })}
              className="px-4 py-1.5 rounded-full bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all active:scale-95"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
