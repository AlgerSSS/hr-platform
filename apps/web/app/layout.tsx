import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Platform",
  description: "HR Recruitment Platform — BOSS, Xiaohongshu, TikTok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
