import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://naenim.com"),
  title: "내님은누구 | 사주로 보는 배우자·귀인·웬수 AI 분석",
  description: "사주팔자 8글자로 운명의 상대 얼굴을 AI가 직접 그립니다 🔮 배우자 몽타주 + 이름 힌트 + 귀인·웬수 완전 분석. 43,500명이 이미 확인했어요.",
  openGraph: {
    title: "내 사주 안에 이미 그 사람이 있습니다 👀",
    description: "사주팔자로 보는 운명의 상대 · 귀인 · 웬수 🔮 AI가 그려주는 배우자 몽타주 + 이름 첫 글자 힌트. 소름돋는 정확도.",
    type: "website",
    url: "https://naenim.com",
    locale: "ko_KR",
    siteName: "내님은누구",
  },
  twitter: {
    card: "summary_large_image",
    title: "내님은누구 👀 — 사주로 보는 운명의 상대",
    description: "사주팔자로 그린 배우자 AI 몽타주 + 이름 힌트. 43,500명이 이미 확인 🔮",
  },
  keywords: ["사주", "배우자", "몽타주", "운명", "궁합", "사주팔자", "AI", "이미지생성", "귀인", "웬수", "사주분석"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#0d0d12]">
        {/* 구버전 캐시 강제 초기화 */}
        <Script id="cache-bust" strategy="beforeInteractive">{`
          (function(){
            var v = localStorage.getItem('app_version');
            if(v !== '20261020') {
              sessionStorage.clear();
              localStorage.removeItem('sajuResult_backup');
              localStorage.setItem('app_version','20261020');
            }
          })();
        `}</Script>
        {/* 외부 SDK — body 안에 위치해야 Next.js Script가 정상 동작 */}
        <Script src="https://js.tosspayments.com/v2/standard" strategy="afterInteractive" />
        <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" strategy="afterInteractive" />
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
