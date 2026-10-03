import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const serifDisplay = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sansBody = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RMS Titanic — Survival & Manifest Risk Engine",
  description: "Historical statistical risk analysis and passenger survival estimation engine from the 1912 Titanic maiden voyage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifDisplay.variable} ${sansBody.variable}`}>
      <body>{children}</body>
    </html>
  );
}
