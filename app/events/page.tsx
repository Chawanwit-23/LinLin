"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { eventStore, EventItem } from "@/lib/store";
import { Plus, Trash2, X, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const EMOJIS = ["🎂", "🎉", "📚", "💊", "✈️", "🎵", "💪", "🌸", "💖", "🎯", "🍕", "☕", "🎮", "🎨", "🏃"];
const COLORS = ["#ffb3c6", "#ffd6e0", "#bde0fe", "#c8f5e1", "#fde8b0", "#e0c3fc", "#ffd8b1", "#d0f0c0"];
const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS_TH = ["อา","จ","อ","พ","พฤ","ศ","ส"];

function isoToLocal(iso: string) {
  return new Date(iso + "T00:00:00");
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* ─── Add modal (slide-up on mobile) ─── */
function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: Omit<EventItem, "id">) => void }) {
  const [form, setForm] = useState({
    title: "", date: new Date().toISOString().split("T")[0],
    description: "", emoji: "🎉", color: COLORS[0],
  });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center left-0 right-0 z-50">
        <div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-0 sm:hidden">
            <div className="w-10 h-1 bg-pink-200 rounded-full" />
          </div>

          <div className="px-5 sm:px-6 pt-4 sm:pt-6 pb-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-700 text-lg">เพิ่มเหตุการณ์ 🎉</h3>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-500 p-1"><X size={20} /></button>
            </div>

            <input
              className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
              placeholder="ชื่อเหตุการณ์ *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              type="date"
              className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <textarea
              className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30 resize-none"
              placeholder="รายละเอียด (ถ้ามี)"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">เลือก Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((em) => (
                  <button key={em} onClick={() => setForm({ ...form, emoji: em })}
                    className={`text-xl w-10 h-10 rounded-xl transition-all ${form.emoji === em ? "bg-pink-100 scale-110 ring-2 ring-pink-300" : "hover:bg-pink-50"}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">สี</label>
              <div className="flex gap-2.5 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full transition-all ${form.color === c ? "scale-125 ring-2 ring-pink-400 ring-offset-2" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onAdd(form)}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-400 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-sm"
            >
              บันทึกเหตุการณ์ 🌸
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Mini calendar ─── */
function MiniCalendar({ events, viewDate, onChange }: {
  events: EventItem[]; viewDate: Date; onChange: (d: Date) => void;
}) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : new Date(year, month, i - firstDay + 1)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onChange(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-pink-50 rounded-xl transition-colors">
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
        <h3 className="font-semibold text-gray-700 text-sm">{MONTHS_FULL[month]} {year + 543}</h3>
        <button onClick={() => onChange(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-pink-50 rounded-xl transition-colors">
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_TH.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-pink-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const isToday = sameDay(date, new Date());
          const hasEvent = events.some((e) => sameDay(isoToLocal(e.date), date));
          return (
            <div key={date.toISOString()} className="flex flex-col items-center py-0.5">
              <span className={`text-xs w-7 h-7 flex items-center justify-center rounded-full transition-colors
                ${isToday ? "bg-gradient-to-br from-pink-400 to-rose-400 text-white font-bold" : "text-gray-600 hover:bg-pink-50 font-medium"}`}>
                {date.getDate()}
              </span>
              {hasEvent && <span className="w-1 h-1 bg-rose-400 rounded-full mt-0.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => { setEvents(eventStore.get()); }, []);
  const refresh = () => setEvents(eventStore.get());

  const handleAdd = (data: Omit<EventItem, "id">) => {
    if (!data.title.trim()) return;
    eventStore.add({ ...data, id: crypto.randomUUID() });
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id: string) => { eventStore.remove(id); refresh(); };

  const sorted = [...events].sort((a, b) => {
    const aUp = isoToLocal(a.date) >= new Date();
    const bUp = isoToLocal(b.date) >= new Date();
    if (aUp !== bUp) return aUp ? -1 : 1;
    return a.date.localeCompare(b.date);
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-pink-300 rounded-2xl flex items-center justify-center shadow-sm">
            <CalendarDays size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-700">บันทึกเหตุการณ์</h1>
            <p className="text-xs text-gray-500 hidden sm:block">จดบันทึกช่วงเวลาสำคัญ 🌸</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-sm text-sm font-medium sparkle-pop"
        >
          <Plus size={16} /> เพิ่ม Event
        </motion.button>
      </motion.div>

      {/* Layout: stacked on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row gap-5">

        {/* Calendar (collapsible on mobile, always visible on md+) */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-50">
            <MiniCalendar events={events} viewDate={viewDate} onChange={setViewDate} />
          </div>

          {/* Month summary (desktop only) */}
          <div className="hidden md:block mt-4 bg-pink-50/60 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-pink-500">{events.length}</p>
            <p className="text-xs text-pink-500 font-medium mt-0.5">เหตุการณ์ทั้งหมด</p>
          </div>
        </div>

        {/* Event list */}
        <div className="flex-1 min-w-0">
          {sorted.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-pink-50 text-center">
              <p className="text-4xl mb-3">🗓️</p>
              <p className="text-gray-600 text-sm font-medium">ยังไม่มีเหตุการณ์ที่บันทึกไว้</p>
              <p className="text-gray-400 text-xs mt-1">กด "+ เพิ่ม Event" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {sorted.map((e) => {
                  const d = isoToLocal(e.date);
                  const upcoming = d >= new Date();
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all group card-lift
                        ${upcoming ? "border-pink-100" : "border-gray-100 opacity-60"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0 mt-0.5">{e.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-gray-800 text-sm leading-snug">{e.title}</h4>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: e.color }} />
                              <button onClick={() => handleDelete(e.id)}
                                className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity text-gray-200 hover:text-red-400">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-pink-500 font-medium mt-1">
                            {d.toLocaleDateString("th-TH", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                          </p>
                          {e.description && (
                            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{e.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && <AddModal onClose={() => setShowForm(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
