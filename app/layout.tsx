import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingDecorations from "@/components/FloatingDecorations";

export const metadata: Metadata = {
  title: "LINLIN Planner ✨",
  description: "ตารางเรียน บันทึกเหตุการณ์ และวางแผนงาน ของหลิน",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // ← ให้ iPhone รู้จัก safe area
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#fff8fb]">
        <FloatingDecorations />
        <Navbar />
        <main className="
          ml-0 md:ml-16 lg:ml-64
          min-h-screen
          px-4 sm:px-6 lg:px-8
          pt-20 md:pt-6
          main-content-bottom
          transition-all duration-300
        ">
          {children}
        </main>
      </body>
    </html>
  );
}
