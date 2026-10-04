import type { Metadata, Viewport } from "next";
import { Manrope, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import "@/styles/globals.css";

/** Manrope — Cyrillic + Latin for «ПОРТФОЛИО» and RU/EN UI */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alex Dev — Backend Golang разработчик",
    template: "%s · Alex Dev",
  },
  description:
    "Портфолио Backend Golang разработчика: high-load systems, microservices и Clean Architecture.",
  metadataBase: new URL("https://localhost:3000"),
  openGraph: {
    title: "Alex Dev — Backend Golang разработчик",
    description: "High-load systems · Microservices · Clean Architecture",
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
      <body
        className={`${manrope.variable} ${inter.variable} ${jetbrains.variable} font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
