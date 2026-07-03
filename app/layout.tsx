import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import { site } from "@/content/site";
import { THEME_INIT_SCRIPT } from "@/systems/theme";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.site.title,
  description: site.identity.taglineZh,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${serif.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-full bg-page text-on-surface">{children}</body>
    </html>
  );
}
