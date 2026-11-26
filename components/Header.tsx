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

  const isHome = pathname === "/";

  const pageTitle: Record<string, string> = {
    "/input": "사주 입력",
    "/result": "분석 결과",
    "/mypage": "마이페이지",
  };
  const title = isHome ? null : pageTitle[pathname ?? ""] ?? "내님은누구";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/[0.06]" style={{ background: "rgba(10,10,16,0.85)" }}>
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between relative">
        {/* 좌측: 뒤로가기 or 로고 */}
        {!isHome ? (
          <Link href="/" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg">☯</span>
            <span className="text-sm font-black text-gold-gradient">내님은누구</span>
          </Link>
        )}

        {/* 중앙 타이틀 (서브페이지) */}
        {title && (
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-white/90">{title}</span>
        )}

        {/* 우측: 유저 메뉴 */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="w-7 h-7 rounded-full bg-white/10 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-gray-900 shadow-sm shadow-amber-500/20"
              >
                {(session.user?.name ?? session.user?.email ?? "U")[0].toUpperCase()}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden z-50" style={{ background: "rgba(17,17,24,0.98)" }}>
                    <Link href="/mypage" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                      👤 마이페이지
                    </Link>
                    <Link href="/result" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                      🔮 내 결과 보기
                    </Link>
                    <div className="border-t border-white/[0.06]" />
                    <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      🚪 로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: pathname ?? "/" })}
              className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/80 text-xs font-bold hover:bg-white/10 transition-all"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
