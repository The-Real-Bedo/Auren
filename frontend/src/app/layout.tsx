import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://auren-build.vercel.app"),
  title: "AUREN — The economic layer for autonomous applications",
  description: "Auren enables applications and autonomous agents to sponsor activity, enforce economic policies, and settle application revenue on Arc.",
  openGraph: {
    title: "AUREN — The economic layer for autonomous applications",
    description: "Auren enables applications and autonomous agents to sponsor activity, enforce economic policies, and settle application revenue on Arc.",
    siteName: "Auren",
    images: [
      {
        url: "/brand/social/auren-og-image.png",
        width: 1200,
        height: 630,
        alt: "AUREN — The economic layer for autonomous applications",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AUREN — The economic layer for autonomous applications",
    description: "Auren enables applications and autonomous agents to sponsor activity, enforce economic policies, and settle application revenue on Arc.",
    images: ["/brand/social/auren-og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
