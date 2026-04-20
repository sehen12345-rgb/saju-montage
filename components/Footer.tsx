"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/payment") || pathname === "/login") return null;

  return (
    <footer className="border-t border-white/5 bg-[#0d0d12] py-8 mt-4">
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-lg">🔮</span>
          <span className="font-black text-white text-sm">내님은누구</span>
        </div>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          AI 사주팔자 분석 서비스 · 오락 및 참고 목적으로 제공되며 실제 미래를 예측하지 않습니다.<br />
          입력하신 정보는 분석 후 즉시 삭제되며 서버에 저장되지 않습니다.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <Link href="/terms" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
            서비스 이용약관
          </Link>
          <Link href="/privacy" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
            개인정보처리방침
          </Link>
          <a href="mailto:sehen12345@gmail.com" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
            고객문의
          </a>
        </div>
        <p className="text-[10px] text-gray-700">
          © 2026 내님은누구. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
