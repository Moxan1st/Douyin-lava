import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lava — 照出你心里真实的欲望",
  description: "刷到懂你的瞬间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
