"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { taskStore, TaskItem } from "@/lib/store";
import { Plus, Trash2, X, ClipboardList, CheckCircle2, Circle } from "lucide-react";

type Priority = "low" | "medium" | "high";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  high:   { label: "สำคัญมาก", color: "text-red-500",    bg: "bg-red-50",    dot: "bg-red-400" },
  medium: { label: "ปานกลาง",  color: "text-orange-500", bg: "bg-orange-50", dot: "bg-orange-400" },
  low:    { label: "ไม่เร่งด่วน", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
};

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

/* ─── Add modal (slide-up on mobile) ─── */
function AddModal({ onClose, onAdd }: {
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
        <div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-pink-100"
          onClick={(e) => e.stopPropagation()}
        >
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
              <input
                type="date"
                className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">ความสำคัญ</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string; color: string; bg: string; dot: string }][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setForm({ ...form, priority: key })}
                    className={`py-2.5 rounded-2xl text-xs font-semibold transition-all border ${
                      form.priority === key
                        ? `${val.bg} ${val.color} border-transparent ring-2 ring-offset-1 ring-pink-300`
                        : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-pink-50"
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full ${val.dot} mr-1.5`} />
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => form.title.trim() && onAdd(form)}
              className="w-full bg-gradient-to-r from-fuchsia-400 to-pink-400 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-sm"
            >
              เพิ่มงาน ✨
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Page ─── */
export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  useEffect(() => { setTasks(taskStore.get()); }, []);
  const refresh = () => setTasks(taskStore.get());

  const handleAdd = (data: Omit<TaskItem, "id" | "done" | "createdAt">) => {
    taskStore.add({ ...data, id: crypto.randomUUID(), done: false, createdAt: new Date().toISOString() });
    refresh();
    setShowForm(false);
  };

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.done) {
      setCelebrateId(id);
      setTimeout(() => setCelebrateId(null), 1200);
    }
    taskStore.toggle(id);
    refresh();
  };

  const handleDelete = (id: string) => { taskStore.remove(id); refresh(); };

  const filtered = tasks
    .filter((t) => filter === "all" ? true : filter === "pending" ? !t.done : t.done)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const order: Priority[] = ["high", "medium", "low"];
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });

  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Celebrate pop */}
      <AnimatePresence>
        {celebrateId && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <span className="text-7xl drop-shadow-lg">🎉</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-300 to-pink-300 rounded-2xl flex items-center justify-center shadow-sm">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-700">วางแผนงาน</h1>
            <p className="text-xs text-gray-400 hidden sm:block">จัดการงานให้เสร็จทีละชิ้น 💪</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-400 to-pink-400 text-white px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-sm text-sm font-medium sparkle-pop"
        >
          <Plus size={16} /> เพิ่มงาน
        </motion.button>
      </motion.div>

      {/* Progress */}
      {totalCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-pink-50 mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">ความคืบหน้า</p>
            <p className="text-sm font-bold text-pink-500">{doneCount}/{totalCount}</p>
          </div>
          <div className="h-2.5 bg-pink-50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full progress-shimmer rounded-full"
            />
          </div>
          {progress === 100 && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-pink-500 mt-2 font-medium">
              🎉 ทำครบทุกงานแล้ว เก่งมากเลย!
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm"
                : "bg-white text-gray-500 hover:text-pink-500 border border-pink-100"
            }`}
          >
            {f === "all" ? `ทั้งหมด (${totalCount})` : f === "pending" ? `ค้างอยู่ (${totalCount - doneCount})` : `เสร็จแล้ว (${doneCount})`}
          </button>
        ))}
      </div>

      {/* Task list */}
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
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border transition-all group card-lift
                    ${task.done ? "border-green-50 opacity-55" : "border-pink-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleToggle(task.id)}
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

                    <button onClick={() => handleDelete(task.id)}
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

      <AnimatePresence>
        {showForm && <AddModal onClose={() => setShowForm(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
