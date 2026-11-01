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
          <Link href="/refund" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
            환불정책
          </Link>
          <a href="tel:01063127762" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
            고객센터
          </a>
        </div>
        <div className="text-[10px] text-gray-700 leading-relaxed space-y-0.5">
          <p>상호명: 몽타주ai · 대표자: 정필권</p>
          <p>사업자등록번호: 755-74-00514</p>
          <p>주소: 충청남도 천안시 동남구 대흥로 321, 508-7호</p>
          <p>고객센터: 010-6312-7762</p>
          <p className="mt-1">© 2026 내님은누구. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
