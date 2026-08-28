import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// The concept voice - a distinctive editorial serif (self-hosted, Fontshare Sentient).
// Used for headlines, questions, and quotes. Variable, so weight is a range.
const sentient = localFont({
  src: [
    { path: "./fonts/Sentient-Variable.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/Sentient-VariableItalic.woff2", weight: "200 800", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Iowan Old Style", "Palatino", "Georgia", "serif"],
});

// The interface voice - body, labels, inputs.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Technical data - the terminal-style response field, code, filenames.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Debrief · Don't just learn it. Debrief it.",
  description:
    "Debrief tests whether you truly understand a concept: explain it in your own words, and see exactly where your explanation stops holding.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Set the theme before paint (no flash): stored choice wins, else follow the OS.
  // Default is dark (:root); light mode adds the `light` class.
  const themeScript =
    "(function(){try{var s=localStorage.getItem('debrief-theme');var light=s?s==='light':window.matchMedia('(prefers-color-scheme: light)').matches;if(light)document.documentElement.classList.add('light');}catch(e){}})();";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sentient.variable} ${geist.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
