import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM-AJAY Saathi — Voice Assistant for Livelihood & Skilling",
  description:
    "A browser-based voice interface that listens to how you currently earn a living and recommends matching NSQF-aligned skilling courses, out loud, in your own language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
