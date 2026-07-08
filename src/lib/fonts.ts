import { Inter, Playfair_Display, Cairo, Amiri } from "next/font/google";

/*
 * Fonts are self-hosted by next/font at build time: no render-blocking request
 * to Google, automatic preload, and `display: swap` so text paints immediately.
 * Latin display + sans and Arabic display + sans, exposed as CSS variables the
 * Tailwind theme reads.
 */

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const fontVariables = `${inter.variable} ${playfair.variable} ${cairo.variable} ${amiri.variable}`;
