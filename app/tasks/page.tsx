"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, useStock, DEFAULT_STOCK } from "@/lib/useStore";
import type { TaskItem, StockItem } from "@/lib/store";
import {
  Plus, Trash2, X, ClipboardList, CheckCircle2, Circle,
  Package, Minus,
} from "lucide-react";

type Priority = "low" | "medium" | "high";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  high:   { label: "สำคัญมาก", color: "text-red-500",    bg: "bg-red-50",    dot: "bg-red-400" },
  medium: { label: "ปานกลาง",  color: "text-orange-500", bg: "bg-orange-50", dot: "bg-orange-400" },
  low:    { label: "ไม่เร่งด่วน", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
};

const TABS = [
  { key: "tasks" as const, label: "งาน",   Icon: ClipboardList, grad: "from-fuchsia-400 to-pink-400", iconGrad: "from-fuchsia-300 to-pink-300" },
  { key: "stock" as const, label: "สต็อค", Icon: Package,       grad: "from-violet-400 to-pink-400",  iconGrad: "from-violet-300 to-pink-300" },
];

const STOCK_DATES = ["12", "13", "14", "19", "20", "21"];

/* ─── Helpers ─── */
function getInitial(item: StockItem): number {
  if (item.quantity > 0) return item.quantity;
  return DEFAULT_STOCK.find((d) => d.name === item.name)?.quantity ?? 0;
}

function getRemaining(item: StockItem): number {
  const base = item.dateQty?.["12"] ?? getInitial(item);
  const soldAfter = ["13", "14", "19", "20"].reduce((s, d) => s + (item.dateQty?.[d] ?? 0), 0);
  return Math.max(0, base - soldAfter);
}

/* ─── Utilities ─── */
function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function isOverdue(iso?: string) {
  if (!iso) return false;
  const due = new Date(iso);
  due.setHours(23, 59, 59);
  return due < new Date();
}

/* ─── Add task modal ─── */
function AddTaskModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: Omit<TaskItem, "id" | "done" | "createdAt">) => void;
}) {
  const [form, setForm] = useState({ title: "", dueDate: "", priority: "medium" as Priority });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center left-0 right-0 z-50">
        <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-pink-100"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center pt-3 pb-0 sm:hidden">
            <div className="w-10 h-1 bg-pink-200 rounded-full" />
          </div>
          <div className="px-5 sm:px-6 pt-4 sm:pt-6 pb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-700 text-lg">เพิ่มงานใหม่ 📝</h3>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-500 p-1"><X size={20} /></button>
            </div>
            <input
              className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
              placeholder="ชื่องาน *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && form.title.trim() && onAdd(form)}
            />
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1.5 block">วันกำหนดส่ง (ถ้ามี)</label>
              <input type="date"
                className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">ความสำคัญ</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, val]) => (
                  <button key={key} onClick={() => setForm({ ...form, priority: key })}
                    className={`py-2.5 rounded-2xl text-xs font-semibold transition-all border ${
                      form.priority === key
                        ? `${val.bg} ${val.color} border-transparent ring-2 ring-offset-1 ring-pink-300`
                        : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-pink-50"
                    }`}>
                    <span className={`inline-block w-2 h-2 rounded-full ${val.dot} mr-1.5`} />
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => form.title.trim() && onAdd(form)}
              className="w-full bg-gradient-to-r from-fuchsia-400 to-pink-400 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-sm">
              เพิ่มงาน ✨
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Stock summary (รวม) ─── */
function StockSummary({ stock }: { stock: StockItem[] }) {
  const totalRemaining = stock.reduce((s, i) => s + getRemaining(i), 0);
  const totalSold      = stock.reduce(
    (s, i) => s + ["13","14","19","20"].reduce((t, d) => t + (i.dateQty?.[d] ?? 0), 0), 0
  );

  return (
    <div className="space-y-4">

      {/* ── Top stats ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50 text-center">
          <p className="text-3xl font-bold text-pink-600 tabular-nums">{totalRemaining}</p>
          <p className="text-xs text-gray-400 mt-1">ชิ้น คงเหลือ</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-50 text-center">
          <p className="text-3xl font-bold text-violet-500 tabular-nums">{totalSold}</p>
          <p className="text-xs text-gray-400 mt-1">ชิ้น ขายแล้ว</p>
        </div>
      </div>

      {/* ── Per-date sold totals ── */}
      <div className="grid grid-cols-5 gap-2">
        {STOCK_DATES.map((d) => {
          const t = stock.reduce((s, i) => s + (i.dateQty?.[d] ?? 0), 0);
          if (d === "12") {
            return (
              <div key={d} className={`rounded-xl p-2.5 text-center border ${
                t > 0 ? "bg-white border-emerald-100 shadow-sm" : "bg-white/60 border-pink-50"
              }`}>
                <p className="text-[10px] text-gray-400 mb-0.5">วันที่ 12</p>
                <p className="text-[10px] text-gray-400">คงเหลือ</p>
                <p className={`text-sm font-bold tabular-nums ${t > 0 ? "text-emerald-600" : "text-gray-200"}`}>
                  {t > 0 ? t : "—"}
                </p>
              </div>
            );
          }
          return (
            <div key={d} className={`rounded-xl p-2.5 text-center border ${
              t > 0 ? "bg-white border-violet-100 shadow-sm" : "bg-white/60 border-pink-50"
            }`}>
              <p className="text-[10px] text-gray-400 mb-0.5">วัน {d}</p>
              <p className={`text-sm font-bold tabular-nums ${t > 0 ? "text-violet-600" : "text-gray-200"}`}>
                {t > 0 ? t : "—"}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Item list ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
        <div className="flex items-center px-4 py-2.5 border-b border-pink-50 bg-pink-50/40">
          <span className="flex-1 text-xs font-bold text-gray-400">สินค้า</span>
          <span className="text-xs font-bold text-pink-500">คงเหลือ</span>
        </div>
        {stock.map((item, i) => {
          const remaining = getRemaining(item);
          const initial   = getInitial(item);
          const pct       = initial > 0 ? (remaining / initial) * 100 : 0;
          const soldOut   = remaining === 0;

          return (
            <div key={item.id}
              className={`px-4 py-3 ${i < stock.length - 1 ? "border-b border-pink-50" : ""} ${soldOut ? "opacity-40" : ""}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                <span className={`text-lg font-bold tabular-nums ${soldOut ? "text-gray-400" : "text-pink-600"}`}>
                  {soldOut ? "หมด" : remaining}
                </span>
              </div>
              <div className="h-1 bg-pink-50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: pct > 50
                      ? "linear-gradient(to right,#a78bfa,#f472b6)"
                      : pct > 20
                        ? "linear-gradient(to right,#fb923c,#f472b6)"
                        : "linear-gradient(to right,#f87171,#fb923c)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

/* ─── Stock sale row (date tabs) ─── */
function StockSaleRow({ item, date, isLast, onSet, onSetRemaining }: {
  item: StockItem;
  date: string;
  isLast: boolean;
  onSet: (id: string, date: string, qty: number) => void;
  onSetRemaining: (id: string, date: string, qty: number) => void;
}) {
  const isDay12 = date === "12";
  const sold      = item.dateQty?.[date] ?? 0;
  const remaining = item.dateRemaining?.[date] ?? 0;

  const [soldVal, setSoldVal]           = useState(String(sold));
  const [remainingVal, setRemainingVal] = useState(String(remaining));

  useEffect(() => { setSoldVal(String(sold)); }, [sold]);
  useEffect(() => { setRemainingVal(String(remaining)); }, [remaining]);

  const commitSold = (raw: string) => {
    const n = parseInt(raw);
    if (!isNaN(n) && n >= 0) onSet(item.id, date, n);
    else setSoldVal(String(sold));
  };

  const commitRemaining = (raw: string) => {
    const n = parseInt(raw);
    if (!isNaN(n) && n >= 0) onSetRemaining(item.id, date, n);
    else setRemainingVal(String(remaining));
  };

  /* วันที่ 12 — input เดียว */
  if (isDay12) {
    return (
      <div className={`flex items-center gap-2.5 px-4 py-3 ${!isLast ? "border-b border-pink-50" : ""}`}>
        <span className="flex-1 text-sm font-semibold text-gray-700 truncate">{item.name}</span>
        <input
          type="number" min="0"
          value={soldVal}
          onChange={(e) => setSoldVal(e.target.value)}
          onBlur={(e) => commitSold(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitSold(soldVal)}
          className="w-16 text-center border border-emerald-200 rounded-xl px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200 tabular-nums shrink-0 text-emerald-600 bg-emerald-50/60"
        />
      </div>
    );
  }

  /* วันที่ 13–21 — ขายไป + คงเหลือ */
  return (
    <div className={`flex items-center gap-2 px-4 py-3 ${!isLast ? "border-b border-pink-50" : ""}`}>
      <span className="flex-1 text-sm font-semibold text-gray-700 truncate min-w-0">{item.name}</span>

      {/* ขายไป */}
      <button
        disabled={sold === 0}
        onClick={() => onSet(item.id, date, Math.max(0, sold - 1))}
        className="w-9 h-9 rounded-xl bg-pink-50 hover:bg-pink-100 disabled:opacity-25 flex items-center justify-center text-pink-400 active:scale-90 transition-all shrink-0">
        <Minus size={14} />
      </button>
      <input
        type="number" min="0"
        value={soldVal}
        onChange={(e) => setSoldVal(e.target.value)}
        onBlur={(e) => commitSold(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commitSold(soldVal)}
        className="w-14 text-center border border-violet-100 rounded-xl px-1 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-200 tabular-nums shrink-0 text-violet-600 bg-violet-50/50"
      />
      <button
        onClick={() => onSet(item.id, date, sold + 1)}
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-pink-400 text-white hover:opacity-90 flex items-center justify-center active:scale-90 transition-all shadow-sm shrink-0">
        <Plus size={14} />
      </button>

      {/* คงเหลือ */}
      <button
        disabled={remaining === 0}
        onClick={() => onSetRemaining(item.id, date, Math.max(0, remaining - 1))}
        className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-25 flex items-center justify-center text-emerald-500 active:scale-90 transition-all shrink-0">
        <Minus size={14} />
      </button>
      <input
        type="number" min="0"
        value={remainingVal}
        onChange={(e) => setRemainingVal(e.target.value)}
        onBlur={(e) => commitRemaining(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commitRemaining(remainingVal)}
        className="w-14 text-center border border-emerald-200 rounded-xl px-1 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200 tabular-nums shrink-0 text-emerald-600 bg-emerald-50/60"
      />
      <button
        onClick={() => onSetRemaining(item.id, date, remaining + 1)}
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white hover:opacity-90 flex items-center justify-center active:scale-90 transition-all shadow-sm shrink-0">
        <Plus size={14} />
      </button>
    </div>
  );
}

/* ─── Page ─── */
export default function TasksPage() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const { stock, setDateQty, setDateRemaining } = useStock();

  const [view, setView]           = useState<"tasks" | "stock">("tasks");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filter, setFilter]       = useState<"all" | "pending" | "done">("all");
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  const handleAddTask = async (data: Omit<TaskItem, "id" | "done" | "createdAt">) => {
    await addTask({ ...data, done: false, createdAt: new Date().toISOString() });
    setShowTaskForm(false);
  };

  const handleToggle = async (id: string, currentDone: boolean) => {
    if (!currentDone) {
      setCelebrateId(id);
      setTimeout(() => setCelebrateId(null), 1200);
    }
    await toggleTask(id, currentDone);
  };

  const filtered = tasks
    .filter((t) => filter === "all" ? true : filter === "pending" ? !t.done : t.done)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const order: Priority[] = ["high", "medium", "low"];
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });

  const doneCount  = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progress   = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const activeTab = TABS.find((t) => t.key === view)!;

  const totalSoldToday = selectedDate
    ? stock.reduce((s, i) => s + (i.dateQty?.[selectedDate] ?? 0), 0)
    : 0;

  return (
    <div className="max-w-2xl mx-auto">

      {/* Celebrate */}
      <AnimatePresence>
        {celebrateId && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <span className="text-7xl drop-shadow-lg">🎉</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${activeTab.iconGrad} rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300`}>
            <activeTab.Icon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-700">
              {view === "tasks" ? "วางแผนงาน" : "สต็อคสินค้า"}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {view === "tasks"
                ? "จัดการงานให้เสร็จทีละชิ้น 💪"
                : selectedDate
                  ? `วันที่ ${selectedDate} · ขายไปแล้ว ${totalSoldToday} ชิ้น`
                  : "สรุปยอดขายและของคงเหลือ"}
            </p>
          </div>
        </div>

        {view === "tasks" && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-400 to-pink-400 text-white px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-sm text-sm font-medium sparkle-pop">
            <Plus size={16} /> เพิ่มงาน
          </motion.button>
        )}
      </motion.div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-2 mb-5">
        {TABS.map(({ key, label, Icon, grad }) => (
          <button key={key} onClick={() => setView(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
              view === key
                ? `bg-gradient-to-r ${grad} text-white shadow-sm`
                : "bg-white text-gray-400 border border-pink-100 hover:text-pink-500"
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">

        {/* Tasks */}
        {view === "tasks" && (
          <motion.div key="tasks" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            {totalCount > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-pink-50 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">ความคืบหน้า</p>
                  <p className="text-sm font-bold text-pink-500">{doneCount}/{totalCount}</p>
                </div>
                <div className="h-2.5 bg-pink-50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full progress-shimmer rounded-full" />
                </div>
                {progress === 100 && (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-pink-500 mt-2 font-medium">
                    🎉 ทำครบทุกงานแล้ว เก่งมากเลย!
                  </motion.p>
                )}
              </motion.div>
            )}

            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
              {(["all", "pending", "done"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm"
                      : "bg-white text-gray-500 hover:text-pink-500 border border-pink-100"
                  }`}>
                  {f === "all" ? `ทั้งหมด (${totalCount})` : f === "pending" ? `ค้างอยู่ (${totalCount - doneCount})` : `เสร็จแล้ว (${doneCount})`}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-pink-50 text-center">
                <p className="text-4xl mb-3">{filter === "done" ? "😊" : "✅"}</p>
                <p className="text-gray-600 text-sm font-medium">
                  {filter === "done" ? "ยังไม่มีงานที่เสร็จ" : filter === "pending" ? "ไม่มีงานค้าง!" : "ยังไม่มีงาน กด + เพื่อเพิ่ม"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {filtered.map((task) => {
                    const pc = PRIORITY_CONFIG[task.priority];
                    const overdue = !task.done && isOverdue(task.dueDate);
                    return (
                      <motion.div key={task.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border transition-all group card-lift
                          ${task.done ? "border-green-50 opacity-55" : "border-pink-50"}`}>
                        <div className="flex items-start gap-3">
                          <button onClick={() => handleToggle(task.id, task.done)}
                            className="mt-0.5 shrink-0 transition-transform active:scale-90 hover:scale-110">
                            {task.done
                              ? <CheckCircle2 size={22} className="text-green-400" />
                              : <Circle size={22} className="text-gray-300 hover:text-pink-400" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-snug ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${pc.bg} ${pc.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                                {pc.label}
                              </span>
                              {task.dueDate && (
                                <span className={`text-xs flex items-center gap-0.5 ${overdue ? "text-red-500 font-bold" : "text-gray-500 font-medium"}`}>
                                  {overdue ? "⚠️" : "📅"} {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => removeTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity text-gray-200 hover:text-red-400 shrink-0 mt-0.5 p-1">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Stock */}
        {view === "stock" && (
          <motion.div key="stock" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
            {stock.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-pink-50 text-center">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-gray-500 text-sm">กำลังโหลด...</p>
              </div>
            ) : (
              <>
                {/* Date tabs */}
                <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none pb-1">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className={`shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                      selectedDate === null
                        ? "bg-gradient-to-r from-violet-400 to-pink-400 text-white shadow-sm"
                        : "bg-white text-gray-400 border border-pink-100 hover:text-pink-500"
                    }`}>
                    รวม
                  </button>
                  {STOCK_DATES.map((d) => (
                    <button key={d} onClick={() => setSelectedDate(d)}
                      className={`shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                        selectedDate === d
                          ? "bg-gradient-to-r from-violet-400 to-pink-400 text-white shadow-sm"
                          : "bg-white text-gray-400 border border-pink-100 hover:text-pink-500"
                      }`}>
                      วันที่ {d}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {selectedDate === null ? (
                    <motion.div key="summary"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                      <StockSummary stock={stock} />
                    </motion.div>
                  ) : (
                    <motion.div key={selectedDate}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                      {/* Day total card */}
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-50 text-center mb-4">
                        <p className="text-3xl font-bold text-violet-600">{totalSoldToday}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedDate === "12" ? `วันที่12 คงเหลือ` : `ชิ้น ขายวันที่ ${selectedDate}`}
                        </p>
                      </div>

                      {/* Item list */}
                      <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-pink-50">
                          <span className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-wide">สินค้า</span>
                          {selectedDate === "12" ? (
                            <span className="w-16 text-center text-xs font-bold text-emerald-500">คงเหลือ</span>
                          ) : (
                            <>
                              <span className="w-9 text-center text-xs font-bold text-gray-300">-</span>
                              <span className="w-14 text-center text-xs font-bold text-violet-400">ขายไป</span>
                              <span className="w-9 text-center text-xs font-bold text-gray-300">+</span>
                              <span className="w-9 text-center text-xs font-bold text-gray-300">-</span>
                              <span className="w-14 text-center text-xs font-bold text-emerald-500">คงเหลือ</span>
                              <span className="w-9 text-center text-xs font-bold text-gray-300">+</span>
                            </>
                          )}
                        </div>
                        {stock.map((item, i) => (
                          <StockSaleRow
                            key={item.id}
                            item={item}
                            date={selectedDate}
                            isLast={i === stock.length - 1}
                            onSet={setDateQty}
                            onSetRemaining={setDateRemaining}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showTaskForm && <AddTaskModal onClose={() => setShowTaskForm(false)} onAdd={handleAddTask} />}
      </AnimatePresence>
    </div>
  );
}
