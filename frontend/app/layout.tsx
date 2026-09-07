import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--next-font-display",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--next-font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Habit Nebula — Streak Tracker",
  description:
    "A vivid habit tracker with a GitHub-style heatmap, rolling streak counters and confetti milestone celebrations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}