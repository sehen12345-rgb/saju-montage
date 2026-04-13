import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL("https://saju-montage.vercel.app"),
  title: "내님은누구 | 사주로 보는 운명 AI 분석",
  description: "사주팔자로 그려진 운명의 상대 얼굴 🔮 AI가 직접 그린 몽타주 + 귀인·악연 완전 분석. 소름돋게 정확한 결과!",
  openGraph: {
    title: "내님은누구 👀 소름돋는 사주 AI 분석",
    description: "사주팔자로 보는 내 운명의 상대 · 귀인 · 웬수 🔮 소름돋게 정확한 AI 완전 분석",
    type: "website",
    locale: "ko_KR",
    siteName: "내님은누구",
  },
  twitter: {
    card: "summary_large_image",
    title: "내님은누구 👀",
    description: "사주팔자로 그려진 내 운명의 상대 얼굴 🔮",
  },
  keywords: ["사주", "배우자", "몽타주", "운명", "궁합", "사주팔자", "AI", "이미지생성"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" strategy="afterInteractive" />
      </head>
      <body className="min-h-screen bg-[#0d0d12]">
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
