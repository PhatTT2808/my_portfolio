import type { Metadata } from "next";
import { Inter, Saira_Condensed } from "next/font/google";

import "./globals.css";

/**
 * Body voice — Light (300) per DESIGN.md. Inter is the documented
 * open-source substitute for BMW Type Next Latin.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/** Display voice — condensed, heavy, uppercase. */
const saira = Saira_Condensed({
  subsets: ["latin"],
  variable: "--font-saira",
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tran Tan Phat — AI Engineer",
  description:
    "Third-year AI student at FPT University. Machine learning, deep learning and NLP projects, plus a private personal workspace.",
  icons: {
    icon: "/icon.png?v=2",
    apple: "/icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${saira.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
