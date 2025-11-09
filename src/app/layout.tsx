import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
// Beautiful custom animated background
import { CustomBackground } from "@/components/ui/custom-background";
import Header from "@/components/header";
import { Providers } from "@/components/providers";
import Image from "next/image";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polyseer | See the future.",
  description: "AI-powered deep research for prediction markets. Paste any Polymarket or Kalshi URL and get an analyst-grade research report in seconds.",
  keywords: ["polymarket", "kalshi", "prediction markets", "AI deep research", "forecasting", "analysis"],
  authors: [{ name: "Polyseer" }],
  openGraph: {
    title: "Polyseer | See the future.",
    description: "AI-powered deep research for prediction markets. Supports Polymarket and Kalshi.",
    url: "https://polyseer.xyz",
    siteName: "Polyseer",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Verdict: ✅ YES • Confidence 78% • polyseer.xyz",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polyseer | See the future.",
    description: "AI-powered deep research for prediction markets. Supports Polymarket and Kalshi.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-black text-neutral-900 dark:text-neutral-100`}
      >
        <Providers>
          {/* Beautiful custom animated background */}
          <CustomBackground />
          <Header />
          <main className="relative min-h-screen">{children}</main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
