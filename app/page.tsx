"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { classStore, eventStore, taskStore, ClassItem, EventItem, TaskItem } from "@/lib/store";
import Link from "next/link";
import { BookOpen, CalendarDays, ClipboardList, CheckCircle2, Clock, ArrowRight } from "lucide-react";

const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];

function getTodayDay() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function isUpcoming(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d >= today;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const card = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [todayDay] = useState(getTodayDay());

  useEffect(() => {
    setClasses(classStore.get());
    setEvents(eventStore.get());
    setTasks(taskStore.get());
  }, []);

  const todayClasses = classes
    .filter((c) => c.day === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingEvents = events
    .filter((e) => isUpcoming(e.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const pendingTasks = tasks.filter((t) => !t.done).slice(0, 4);
  const doneTasks = tasks.filter((t) => t.done).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "สวัสดีตอนเช้า" : hour < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-5">

      {/* ── Hero banner ── */}
      <motion.div
        variants={card}
        className="relative overflow-hidden hero-gradient rounded-3xl p-5 sm:p-7 shadow-md border border-pink-100"
      >
        {/* decorative blobs */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 text-5xl sm:text-7xl opacity-20 float-animation select-none pointer-events-none">🌸</div>

        <p className="text-pink-700 font-semibold text-sm">{greeting} หลิน 👋</p>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-800 mt-1 leading-tight">
          ยินดีต้อนรับกลับมา หลิน!
        </h2>
        <p className="text-pink-600 text-xs sm:text-sm mt-1">
          {new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5">
          {[
            { label: "วิชาวันนี้", value: todayClasses.length, icon: BookOpen },
            { label: "Event ใกล้มา", value: upcomingEvents.length, icon: CalendarDays },
            { label: "งานเสร็จ", value: `${doneTasks}/${tasks.length}`, icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center ring-pulse">
              <s.icon size={18} className="mx-auto mb-1 text-pink-500" />
              <p className="text-lg sm:text-2xl font-bold text-pink-700">{s.value}</p>
              <p className="text-[11px] sm:text-xs text-pink-600 mt-0.5 leading-tight font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Middle row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Today classes */}
        <motion.div variants={card} className="bg-white rounded-3xl p-5 shadow-sm border border-pink-50 flex flex-col card-lift">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-pink-100 rounded-xl flex items-center justify-center">
                <BookOpen size={14} className="text-pink-500" />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">วิชาวันนี้ ({DAYS[todayDay]})</h3>
            </div>
            <Link href="/schedule" className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-500 transition-colors">
              ทั้งหมด <ArrowRight size={12} />
            </Link>
          </div>

          {todayClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
              <span className="text-4xl">🎉</span>
              <p className="text-gray-500 text-sm text-center">ไม่มีคลาสวันนี้<br />พักผ่อนได้เลย!</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {todayClasses.map((c) => (
                <motion.div
                  key={c.id}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-pink-50/60 transition-colors"
                >
                  <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 text-sm truncate">{c.subject}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {c.startTime}–{c.endTime} {c.room && `· ${c.room}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming events */}
        <motion.div variants={card} className="bg-white rounded-3xl p-5 shadow-sm border border-pink-50 flex flex-col card-lift">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-rose-100 rounded-xl flex items-center justify-center">
                <CalendarDays size={14} className="text-rose-500" />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Event ใกล้มา</h3>
            </div>
            <Link href="/events" className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-500 transition-colors">
              ทั้งหมด <ArrowRight size={12} />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
              <span className="text-4xl">📅</span>
              <p className="text-gray-500 text-sm text-center">ยังไม่มี event<br />ที่บันทึกไว้</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {upcomingEvents.map((e) => (
                <motion.div
                  key={e.id}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-50/60 transition-colors"
                >
                  <span className="text-xl shrink-0">{e.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 text-sm truncate">{e.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(e.date)}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Tasks ── */}
      <motion.div variants={card} className="bg-white rounded-3xl p-5 shadow-sm border border-pink-50 card-lift">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-fuchsia-100 rounded-xl flex items-center justify-center">
              <ClipboardList size={14} className="text-fuchsia-500" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">งานที่ต้องทำ</h3>
          </div>
          <Link href="/tasks" className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-500 transition-colors">
            ทั้งหมด <ArrowRight size={12} />
          </Link>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <span className="text-4xl">✅</span>
            <p className="text-gray-500 text-sm">ทำงานครบหมดแล้ว เก่งมาก!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pendingTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50/50 hover:bg-pink-50 transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  t.priority === "high" ? "bg-red-400" : t.priority === "medium" ? "bg-orange-300" : "bg-green-300"
                }`} />
                <p className="text-sm text-gray-700 truncate flex-1">{t.title}</p>
                {t.dueDate && <p className="text-xs text-gray-400 shrink-0 hidden sm:block">{formatDate(t.dueDate)}</p>}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
