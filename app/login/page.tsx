"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/result";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-8">
        <div>
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-2xl font-bold text-amber-900">로그인</h1>
          <p className="text-amber-600 text-sm mt-2">
            카카오 계정으로 간편하게 시작하세요
          </p>
        </div>

        <button
          onClick={() => signIn("kakao", { callbackUrl })}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-800 shadow-lg active:scale-95 transition-all text-lg"
          style={{ backgroundColor: "#FEE500" }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-gray-900">
            <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" />
          </svg>
          카카오로 계속하기
        </button>

        <p className="text-xs text-gray-400">
          로그인 없이도 사주 분석을 이용할 수 있습니다.
          <br />
          결제 내역 보존을 위해 로그인을 권장합니다.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
