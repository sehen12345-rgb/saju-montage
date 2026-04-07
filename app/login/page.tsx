"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/result";
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailDone, setEmailDone] = useState(false);
  const [emailError, setEmailError] = useState("");

  const kakaoEnabled = process.env.NEXT_PUBLIC_KAKAO_ENABLED === "true";
  const naverEnabled = process.env.NEXT_PUBLIC_NAVER_ENABLED === "true";
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setEmailError("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    setEmailLoading(true);
    setEmailError("");
    const res = await signIn("email", { email, callbackUrl, redirect: false });
    setEmailLoading(false);
    if (res?.error) {
      setEmailError("로그인에 실패했습니다. 다시 시도해주세요.");
    } else {
      setEmailDone(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-sm w-full space-y-6">

        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🔮</div>
          <h1 className="text-2xl font-black text-amber-900">내 배우자 얼굴봤다</h1>
          <p className="text-sm text-amber-600">로그인하고 분석 결과를 영구 보관하세요</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6 space-y-3">

          {!showEmail ? (
            <>
              {/* 카카오 */}
              {kakaoEnabled ? (
                <button
                  onClick={() => signIn("kakao", { callbackUrl })}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-900 active:scale-95 transition-all shadow-sm hover:brightness-95"
                  style={{ backgroundColor: "#FEE500" }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                  </svg>
                  카카오로 시작하기
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-400 bg-gray-100 cursor-not-allowed">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.6 5.12 4.04 6.56l-1.02 3.76 4.38-2.88c.84.12 1.72.18 2.6.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                  </svg>
                  카카오로 시작하기 <span className="text-xs font-normal ml-1">(준비중)</span>
                </div>
              )}

              {/* 네이버 */}
              {naverEnabled ? (
                <button
                  onClick={() => signIn("naver", { callbackUrl })}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-white active:scale-95 transition-all shadow-sm hover:brightness-90"
                  style={{ backgroundColor: "#03C75A" }}
                >
                  <span className="text-lg font-black leading-none">N</span>
                  네이버로 시작하기
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-400 bg-gray-100 cursor-not-allowed">
                  <span className="text-lg font-black leading-none">N</span>
                  네이버로 시작하기 <span className="text-xs font-normal ml-1">(준비중)</span>
                </div>
              )}

              {/* 구글 */}
              {googleEnabled ? (
                <button
                  onClick={() => signIn("google", { callbackUrl })}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-700 bg-white border-2 border-gray-200 active:scale-95 transition-all shadow-sm hover:bg-gray-50"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google 계정으로 시작
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[15px] text-gray-400 bg-gray-100 border-2 border-gray-200 cursor-not-allowed">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-40">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google 계정으로 시작 <span className="text-xs font-normal ml-1">(준비중)</span>
                </div>
              )}

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
            </>
          ) : emailDone ? (
            /* 이메일 전송 완료 */
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">📬</div>
              <p className="font-bold text-amber-900">로그인 완료!</p>
              <p className="text-sm text-gray-500">이메일 <strong>{email}</strong>으로 로그인했습니다.</p>
              <button
                onClick={() => { window.location.href = callbackUrl; }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
              >
                계속하기
              </button>
            </div>
          ) : (
            /* 이메일 입력 폼 */
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <button
                type="button"
                onClick={() => setShowEmail(false)}
                className="text-sm text-amber-600 flex items-center gap-1 hover:text-amber-800"
              >
                ← 다른 방법으로 로그인
              </button>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일 주소</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
                  autoFocus
                />
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[15px] disabled:opacity-60 active:scale-95 transition-all"
              >
                {emailLoading ? "처리 중..." : "이메일로 시작하기"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                이메일을 입력하면 바로 로그인됩니다
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          로그인하지 않아도 사주 분석은 이용 가능합니다
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
