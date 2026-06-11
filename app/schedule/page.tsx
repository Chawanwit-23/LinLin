"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { classStore, ClassItem } from "@/lib/store";
import { Plus, Trash2, X, BookOpen } from "lucide-react";

const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
const DAYS_SHORT = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const COLORS = ["#ffb3c6", "#ffd6e0", "#ffc8dd", "#ffafcc", "#bde0fe", "#c8f5e1", "#fde8b0", "#e0c3fc"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const BASE_HOUR = 7;
const HOUR_HEIGHT = 56; // (mobile card view only)
const HOUR_WIDTH  = 76; // px per hour column (grid view)
const ROW_HEIGHT  = 70; // px per day row (grid view)

function getTodayDay() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

/* ─── Modal ─── */
function AddModal({
  onClose, onAdd,
}: {
  onClose: () => void;
  onAdd: (data: Omit<ClassItem, "id">) => void;
}) {
  const [form, setForm] = useState({
    subject: "", teacher: "", room: "",
    day: 0, startTime: "08:00", endTime: "09:00", color: COLORS[0],
  });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-pink-200 rounded-full" />
          </div>

          <div className="px-6 pt-4 sm:pt-6 pb-6 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-700 text-lg">เพิ่มวิชาใหม่ 📚</h3>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <input
              className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
              placeholder="ชื่อวิชา *"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
                placeholder="อาจารย์"
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              />
              <input
                className="border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
                placeholder="ห้องเรียน"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              />
            </div>

            <select
              className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
            >
              {DAYS.map((d, i) => <option key={i} value={i}>วัน{d}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1.5 block">เริ่ม</label>
                <input type="time"
                  className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1.5 block">สิ้นสุด</label>
                <input type="time"
                  className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">สีวิชา</label>
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
              className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-sm"
            >
              เพิ่มวิชา ✨
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Mobile card view (one day) ─── */
function MobileView({ classes, onDelete }: { classes: ClassItem[]; onDelete: (id: string) => void }) {
  const [activeDay, setActiveDay] = useState(getTodayDay());
  const dayClasses = classes.filter((c) => c.day === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div>
      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {DAYS_SHORT.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`shrink-0 w-10 h-10 rounded-2xl text-sm font-semibold transition-all
              ${activeDay === i
                ? "bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-sm"
                : "bg-white text-gray-400 border border-pink-100 hover:border-pink-300"
              }`}
          >
            {d}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          {dayClasses.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-pink-50 shadow-sm">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-gray-500 text-sm">ไม่มีคลาสวัน{DAYS[activeDay]}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayClasses.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-4 border border-pink-50 shadow-sm flex items-center gap-4 group card-lift"
                >
                  <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-700 text-sm truncate">{c.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.startTime}–{c.endTime}</p>
                    {c.teacher && <p className="text-xs text-gray-500 mt-0.5">{c.teacher}</p>}
                    {c.room && <p className="text-xs text-gray-500">{c.room}</p>}
                  </div>
                  <button onClick={() => onDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity text-gray-200 hover:text-red-400 p-1">
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Desktop/Tablet timetable grid ───
   แกน X (บน)  = เวลา  07:00 → 19:00
   แกน Y (ซ้าย) = วัน   จันทร์ → อาทิตย์
*/
function GridView({ classes, onDelete }: { classes: ClassItem[]; onDelete: (id: string) => void }) {
  const DAY_LABEL_W = 72; // px ของ column วัน (ซ้ายสุด)
  const totalTimeW  = HOURS.length * HOUR_WIDTH;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
      {/* ── Header: เวลา (แกน X) ── */}
      <div className="flex border-b border-pink-100 bg-pink-50 sticky top-0 z-10">
        {/* มุมบนซ้าย */}
        <div
          className="shrink-0 flex items-center justify-center border-r border-pink-100"
          style={{ width: DAY_LABEL_W }}
        >
          <span className="text-[10px] font-bold text-pink-400 leading-tight text-center">วัน ╲ เวลา</span>
        </div>

        {/* Time headers — scrolls together with body */}
        <div className="overflow-x-auto flex-1 scrollbar-none">
          <div className="flex" style={{ width: totalTimeW }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="shrink-0 py-3 text-center text-xs font-bold text-gray-600 border-r border-pink-100 last:border-r-0"
                style={{ width: HOUR_WIDTH }}
              >
                {h}:00
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: วัน (แกน Y) ── */}
      <div className="flex">
        {/* Day label column (fixed left) */}
        <div className="shrink-0 border-r border-pink-100" style={{ width: DAY_LABEL_W }}>
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`flex items-center justify-center px-1 border-b border-pink-50 last:border-b-0
                ${i % 2 === 0 ? "bg-pink-50/40" : "bg-white"}`}
              style={{ height: ROW_HEIGHT }}
            >
              <span className="text-xs font-bold text-gray-600 text-center leading-tight">{day}</span>
            </div>
          ))}
        </div>

        {/* Scrollable time area */}
        <div className="overflow-x-auto flex-1 scrollbar-none">
          <div style={{ width: totalTimeW }}>
            {DAYS.map((_, dayIdx) => {
              const dayClasses = classes.filter((c) => c.day === dayIdx);
              return (
                <div
                  key={dayIdx}
                  className={`relative border-b border-pink-50 last:border-b-0 ${dayIdx % 2 === 0 ? "bg-pink-50/20" : "bg-white"}`}
                  style={{ height: ROW_HEIGHT, width: totalTimeW }}
                >
                  {/* Hour divider lines */}
                  {HOURS.map((_, hi) => (
                    <div
                      key={hi}
                      className="absolute top-0 bottom-0 border-r border-pink-50"
                      style={{ left: hi * HOUR_WIDTH }}
                    />
                  ))}

                  {/* Class blocks */}
                  {dayClasses.map((c) => {
                    const startMin = timeToMinutes(c.startTime) - BASE_HOUR * 60;
                    const endMin   = timeToMinutes(c.endTime)   - BASE_HOUR * 60;
                    const left  = (startMin / 60) * HOUR_WIDTH;
                    const width = Math.max((endMin - startMin) / 60 * HOUR_WIDTH - 4, 32);

                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="absolute top-1.5 bottom-1.5 rounded-xl px-2 py-1.5 overflow-hidden group shadow-sm cursor-default"
                        style={{ left: left + 2, width, backgroundColor: c.color }}
                      >
                        <p className="text-xs font-bold text-gray-700 leading-tight truncate">{c.subject}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5 truncate">{c.startTime}–{c.endTime}</p>
                        {c.room && (
                          <p className="text-[10px] text-gray-500 truncate">{c.room}</p>
                        )}
                        <button
                          onClick={() => onDelete(c.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity bg-white/80 rounded-full p-0.5"
                        >
                          <X size={10} className="text-gray-500" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function SchedulePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setClasses(classStore.get()); }, []);
  const refresh = () => setClasses(classStore.get());

  const handleAdd = (data: Omit<ClassItem, "id">) => {
    if (!data.subject.trim()) return;
    classStore.add({ ...data, id: crypto.randomUUID() });
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id: string) => { classStore.remove(id); refresh(); };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-rose-300 rounded-2xl flex items-center justify-center shadow-sm">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-700">ตารางเรียน</h1>
            <p className="text-xs text-gray-400 hidden sm:block">จัดตารางเรียนของคุณ 📚</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-sm text-sm font-medium sparkle-pop"
        >
          <Plus size={16} />
          <span>เพิ่มวิชา</span>
        </motion.button>
      </motion.div>

      {/* Mobile: card view | Desktop: grid */}
      <div className="block md:hidden">
        <MobileView classes={classes} onDelete={handleDelete} />
      </div>
      <div className="hidden md:block">
        <GridView classes={classes} onDelete={handleDelete} />
      </div>

      {/* Subject list (tablet+) */}
      {classes.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="hidden sm:block mt-5 bg-white rounded-3xl p-5 shadow-sm border border-pink-50">
          <h3 className="font-semibold text-gray-600 mb-3 text-sm">รายวิชาทั้งหมด ({classes.length} วิชา)</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {classes.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{c.subject}</p>
                  <p className="text-xs text-gray-400">{DAYS[c.day]} · {c.startTime}–{c.endTime}</p>
                </div>
                <button onClick={() => handleDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Mobile subject list */}
      {classes.length > 0 && (
        <div className="block sm:hidden mt-4 bg-white rounded-3xl p-4 shadow-sm border border-pink-50">
          <h3 className="font-semibold text-gray-600 mb-3 text-sm">ทุกวิชา ({classes.length})</h3>
          <div className="space-y-2">
            {classes.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50/40 group">
                <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{c.subject}</p>
                  <p className="text-xs text-gray-400">{DAYS[c.day]} · {c.startTime}–{c.endTime}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-gray-200 active:text-red-400 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showForm && <AddModal onClose={() => setShowForm(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
