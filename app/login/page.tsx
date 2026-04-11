"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/result";

  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailDone, setEmailDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      showToast("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await signIn("emailcreds", {
        email: trimmed,
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        showToast("로그인에 실패했습니다. 다시 시도해주세요.");
      } else {
        setEmailDone(true);
      }
    } catch {
      showToast("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setEmailLoading(false);
    }
  }

  function handleSkip() {
    const safe = callbackUrl.startsWith("/") ? callbackUrl : "/result";
    router.push(safe);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      {/* 토스트 */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm rounded-2xl px-5 py-3 shadow-xl max-w-xs text-center animate-fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-sm w-full space-y-5">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🔮</div>
          <h1 className="text-2xl font-black text-amber-900">내님은누구</h1>
          <p className="text-sm text-amber-600">로그인하면 분석 결과를 영구 보관합니다</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6">
          {!showEmail ? (
            <div className="space-y-3">
              {/* 카카오 */}
              <button
                onClick={() => signIn("kakao", { callbackUrl })}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-900 active:scale-95 transition-all hover:brightness-95"
                style={{ backgroundColor: "#FEE500" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                </svg>
                카카오로 시작하기
              </button>

              {/* 네이버 */}
              <button
                onClick={() => signIn("naver", { callbackUrl })}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-white active:scale-95 transition-all hover:brightness-90"
                style={{ backgroundColor: "#03C75A" }}
              >
                <span className="text-lg font-black leading-none">N</span>
                네이버로 시작하기
              </button>

              {/* 구글 */}
              <button
                onClick={() => signIn("google", { callbackUrl })}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-700 bg-white border-2 border-gray-200 active:scale-95 transition-all hover:bg-gray-50"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 계정으로 시작
              </button>

              {/* 구분선 */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">또는</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* 이메일 */}
              <button
                onClick={() => setShowEmail(true)}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-700 bg-white border-2 border-gray-200 active:scale-95 transition-all hover:bg-gray-50"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m2 7 10 7 10-7"/>
                </svg>
                이메일로 시작
              </button>
            </div>
          ) : emailDone ? (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">✅</div>
              <div>
                <p className="font-bold text-amber-900 text-lg">로그인 완료!</p>
                <p className="text-sm text-gray-500 mt-1">{email} 계정으로 로그인했습니다</p>
              </div>
              <button
                onClick={() => {
                  const safe = callbackUrl.startsWith("/") ? callbackUrl : "/result";
                  router.push(safe);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base active:scale-95 transition-all"
              >
                계속하기 →
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <button
                type="button"
                onClick={() => setShowEmail(false)}
                className="text-sm text-amber-600 flex items-center gap-1 hover:text-amber-800 transition-colors"
              >
                ← 다른 방법으로 로그인
              </button>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 주소</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm transition-colors"
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base disabled:opacity-60 active:scale-95 transition-all"
              >
                {emailLoading ? "처리 중..." : "이메일로 시작하기"}
              </button>
              <p className="text-xs text-center text-gray-400">이메일을 입력하면 바로 로그인됩니다</p>
            </form>
          )}
        </div>

        {/* 로그인 없이 계속 */}
        <button
          onClick={handleSkip}
          className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          로그인 없이 계속하기 →
        </button>
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
