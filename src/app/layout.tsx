import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Picram - 画像編集アプリ",
  description: "簡単に画像をトリミング・フレーム追加できるWebアプリケーション。スマートフォン対応で直感的な操作が可能です。",
  keywords: ["画像編集", "トリミング", "フレーム", "写真加工", "Web アプリ", "スマートフォン対応"],
  authors: [{ name: "MayuLeo" }],
  creator: "MayuLeo",
  publisher: "MayuLeo",
  robots: "index, follow",
  openGraph: {
    title: "Picram - 画像編集アプリ",
    description: "簡単に画像をトリミング・フレーム追加できるWebアプリケーション",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Picram - 画像編集アプリ",
    description: "簡単に画像をトリミング・フレーム追加できるWebアプリケーション",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
