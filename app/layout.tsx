import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사주 배우자 몽타주 | 운명의 상대를 만나보세요",
  description: "사주팔자로 알아보는 나의 인연! AI가 그려주는 배우자 몽타주를 확인해보세요.",
  openGraph: {
    title: "사주 배우자 몽타주",
    description: "사주로 알아보는 운명의 배우자 외모",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='30' text-anchor='middle' dominant-baseline='central'%3E%E2%98%AF%3C/text%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <main className="relative z-10 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
