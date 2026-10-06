import { Manrope } from "next/font/google";
import localFont from "next/font/local";

export const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "latin-ext"] });

// Manrope has no ₦ (U+20A6): a one-glyph Noto Sans subset (OFL, see fonts/README.md)
// fills that single code point and nothing else.
export const naira = localFont({
  src: "./fonts/noto-sans-naira.woff2",
  variable: "--font-naira",
  weight: "300 800",
  declarations: [{ prop: "unicode-range", value: "U+20A6" }],
  adjustFontFallback: false,
});

export const fontVariables = `${manrope.variable} ${naira.variable}`;
