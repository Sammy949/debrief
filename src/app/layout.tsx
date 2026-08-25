import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-Variable.woff2", weight: "300 900", style: "normal" },
    { path: "./fonts/Satoshi-VariableItalic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Debrief · Don't just learn it. Debrief it.",
  description:
    "Debrief tests whether you truly understand a concept: explain it in your own words, and see exactly where your explanation stops holding.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${satoshi.variable} antialiased`}>
      <body>
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
