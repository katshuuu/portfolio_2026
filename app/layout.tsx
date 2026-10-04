import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import "@/styles/globals.css";

/** Single Google font — body fallback; display faces are local woff2 */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "katshu — Go-разработчик",
    template: "%s · katshu",
  },
  description:
    "Портфолио начинающего Go-разработчика: backend-системы, проекты и стек.",
  metadataBase: new URL("https://portfolio-2026-jet-two.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.webp", type: "image/webp" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "katshu — Go-разработчик",
    description: "Портфолио · Go · backend-системы",
    type: "website",
    locale: "ru_RU",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="light" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/blue-screen.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/snell-roundhand.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/bristol.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preload" href="/images/hero-blur.jpg" as="image" />
      </head>
      <body className={`${manrope.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
