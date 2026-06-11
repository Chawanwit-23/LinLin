"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, BookOpen, ClipboardList } from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/",         label: "หน้าหลัก",    icon: LayoutDashboard },
  { href: "/schedule", label: "ตารางเรียน",  icon: BookOpen },
  { href: "/events",   label: "Events",      icon: CalendarDays },
  { href: "/tasks",    label: "งาน",         icon: ClipboardList },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* ══ Sidebar (tablet md+, desktop lg+) ══ */}
      <aside className="
        hidden md:flex fixed top-0 left-0 h-full z-40 flex-col
        w-16 lg:w-64
        bg-white/90 backdrop-blur-md border-r border-pink-100 shadow-sm
      ">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 lg:px-5 py-4 border-b border-pink-100 min-h-[76px]">
          {/* Avatar — วงกลม + border ชมพู + glow */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="shrink-0 relative"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden ring-2 ring-pink-300 ring-offset-2 shadow-md">
              <Image
                src="/Logo.png"
                alt="LINLIN"
                width={48}
                height={48}
                className="w-full h-full object-cover object-top"
                priority
              />
            </div>
            {/* online-dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm" />
          </motion.div>

          {/* Text (desktop only) */}
          <div className="hidden lg:block overflow-hidden">
            <h1 className="text-base font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent leading-tight whitespace-nowrap">
              LINLIN Planner ✨
            </h1>
            <p className="text-[11px] text-pink-400 whitespace-nowrap mt-0.5">สวัสดี หลิน 🌸</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 lg:p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 px-2.5 lg:px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer
                    ${active
                      ? "bg-gradient-to-r from-pink-100 to-rose-50 text-pink-600 shadow-sm font-semibold"
                      : "text-gray-400 hover:bg-pink-50 hover:text-pink-500"
                    }`}
                >
                  <Icon size={20} className={`shrink-0 ${active ? "text-pink-500" : ""}`} />
                  <span className="hidden lg:block text-sm truncate">{label}</span>
                  {active && <span className="hidden lg:block ml-auto text-xs text-pink-400">🌸</span>}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Motivational card (desktop only) */}
        <div className="hidden lg:block p-4 pb-6">
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 text-center border border-pink-100">
            <p className="text-2xl mb-1">🌸</p>
            <p className="text-xs text-pink-400 font-medium">หลินทำได้ดีมากเลย! 💕</p>
          </div>
        </div>
      </aside>

      {/* ══ Mobile top bar ══ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo + name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-pink-300 ring-offset-1 shadow-sm shrink-0">
              <Image
                src="/Logo.png"
                alt="LINLIN"
                width={32}
                height={32}
                className="w-full h-full object-cover object-top"
                priority
              />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
              LINLIN Planner ✨
            </span>
          </div>
          {/* Greeting */}
          <span className="text-xs text-pink-400 font-medium">สวัสดี หลิน 🌸</span>
        </div>
      </header>

      {/* ══ Bottom navigation (mobile only) ══
          nav-safe เพิ่ม env(safe-area-inset-bottom) ด้านล่าง
          ทำให้ปุ่มไม่ถูกบัง home indicator บน iPhone
      */}
      <nav className="
        md:hidden fixed bottom-0 left-0 right-0 z-50
        bg-white/95 backdrop-blur-md
        border-t border-pink-100
        shadow-[0_-4px_20px_rgba(255,182,193,0.15)]
        nav-safe
      ">
        <div className="grid grid-cols-4 h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-0.5 group"
              >
                {/* Active indicator line at top */}
                {active && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.div whileTap={{ scale: 0.80 }} className="flex flex-col items-center gap-0.5">
                  <Icon
                    size={22}
                    className={`transition-colors duration-200 ${
                      active ? "text-pink-500" : "text-gray-300 group-hover:text-pink-300"
                    }`}
                  />
                  <span className={`text-[9px] font-semibold tracking-wide transition-colors duration-200 ${
                    active ? "text-pink-500" : "text-gray-300"
                  }`}>
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
