import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Auren — Economic Infrastructure for Autonomous Applications & Arc DApps",
  description: "Auren provides economic and execution infrastructure for autonomous agents and Arc DApps, powered by non-interest capital recovery and TechnoCore agent integration.",
  openGraph: {
    title: "Auren",
    description: "Economic Infrastructure for Autonomous Applications & Arc DApps",
    siteName: "Auren",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
