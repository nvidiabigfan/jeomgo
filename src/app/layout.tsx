import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "점고 - 직장인 점심 메뉴 추천",
  description: "직장인을 위한 점심 메뉴 추천 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
