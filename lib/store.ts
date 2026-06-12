export interface ClassItem {
  id: string;
  subject: string;
  teacher?: string;
  room?: string;
  day: number; // 0=Mon...4=Fri
  startTime: string; // "08:00"
  endTime: string;
  color: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO date "2024-01-15"
  description?: string;
  emoji: string;
  color: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  createdAt: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  dateQty?: Record<string, number>;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export const classStore = {
  get: (): ClassItem[] => load("planner_classes", []),
  set: (data: ClassItem[]) => save("planner_classes", data),
  add: (item: ClassItem) => {
    const all = classStore.get();
    classStore.set([...all, item]);
  },
  remove: (id: string) => {
    classStore.set(classStore.get().filter((c) => c.id !== id));
  },
};

export const eventStore = {
  get: (): EventItem[] => load("planner_events", []),
  set: (data: EventItem[]) => save("planner_events", data),
  add: (item: EventItem) => {
    const all = eventStore.get();
    eventStore.set([...all, item]);
  },
  remove: (id: string) => {
    eventStore.set(eventStore.get().filter((e) => e.id !== id));
  },
};

export const taskStore = {
  get: (): TaskItem[] => load("planner_tasks", []),
  set: (data: TaskItem[]) => save("planner_tasks", data),
  add: (item: TaskItem) => {
    const all = taskStore.get();
    taskStore.set([...all, item]);
  },
  toggle: (id: string) => {
    taskStore.set(
      taskStore.get().map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  },
  remove: (id: string) => {
    taskStore.set(taskStore.get().filter((t) => t.id !== id));
  },
};
