"use client";
import { useState, useEffect, useRef } from "react";
import {
  collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { useUID } from "./AuthContext";
import type { ClassItem, EventItem, TaskItem, StockItem } from "./store";

export function useClasses() {
  const uid = useUID();
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, "users", uid, "classes"), (snap) => {
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClassItem));
    });
  }, [uid]);

  const addClass = async (item: Omit<ClassItem, "id">) => {
    if (!uid) return;
    await addDoc(collection(db, "users", uid, "classes"), item);
  };

  const removeClass = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "classes", id));
  };

  return { classes, addClass, removeClass };
}

export function useEvents() {
  const uid = useUID();
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, "users", uid, "events"), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EventItem));
    });
  }, [uid]);

  const addEvent = async (item: Omit<EventItem, "id">) => {
    if (!uid) return;
    await addDoc(collection(db, "users", uid, "events"), item);
  };

  const removeEvent = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "events", id));
  };

  const updateEvent = async (id: string, data: Omit<import("./store").EventItem, "id">) => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "events", id), data as Record<string, unknown>);
  };

  return { events, addEvent, removeEvent, updateEvent };
}

export function useTasks() {
  const uid = useUID();
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, "users", uid, "tasks"), (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TaskItem));
    });
  }, [uid]);

  const addTask = async (item: Omit<TaskItem, "id">) => {
    if (!uid) return;
    await addDoc(collection(db, "users", uid, "tasks"), item);
  };

  const toggleTask = async (id: string, currentDone: boolean) => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "tasks", id), { done: !currentDone });
  };

  const removeTask = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "tasks", id));
  };

  return { tasks, addTask, toggleTask, removeTask };
}

export const DEFAULT_STOCK: Omit<StockItem, "id">[] = [
  { name: "เข็มขัด 40", quantity: 99 },
  { name: "เข็มขัด 42", quantity: 26 },
  { name: "เข็มขัด 44", quantity: 52 },
  { name: "เข็มขัด 46", quantity: 69 },
  { name: "เข็มขัด 48", quantity: 41 },
  { name: "เข็มขัด 50", quantity: 47 },
  { name: "เข็มขัด 52", quantity: 97 },
  { name: "เข็มขัด 54", quantity: 15 },
  { name: "เข็มขัด 56", quantity: 39 },
  { name: "เข็มขัด 58", quantity: 18 },
  { name: "เข็มขัด 60", quantity: 46 },
  { name: "หัวเข็มขัด",  quantity: 48 },
  { name: "หูเข็มขัด",   quantity: 55 },
];

export function useStock() {
  const uid = useUID();
  const [stock, setStock] = useState<StockItem[]>([]);
  const seeded   = useRef(false);
  const migrated = useRef(false);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, "users", uid, "stock"), async (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StockItem);
      setStock(items);

      if (items.length === 0 && !seeded.current) {
        seeded.current = true;
        for (const item of DEFAULT_STOCK) {
          await addDoc(collection(db, "users", uid, "stock"), item);
        }
        return;
      }

      if (!migrated.current && items.length > 0) {
        migrated.current = true;
        for (const item of items) {
          if (item.quantity === 0) {
            const def = DEFAULT_STOCK.find((d) => d.name === item.name);
            if (def && def.quantity > 0) {
              updateDoc(doc(db, "users", uid, "stock", item.id), { quantity: def.quantity });
            }
          }
        }
      }
    });
  }, [uid]);

  const updateQty = async (id: string, delta: number) => {
    if (!uid) return;
    const item = stock.find((s) => s.id === id);
    if (!item) return;
    await updateDoc(doc(db, "users", uid, "stock", id), {
      quantity: Math.max(0, item.quantity + delta),
    });
  };

  const addStock = async (name: string) => {
    if (!uid) return;
    await addDoc(collection(db, "users", uid, "stock"), { name: name.trim(), quantity: 0 });
  };

  const removeStock = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "stock", id));
  };

  const renameStock = async (id: string, name: string) => {
    if (!uid || !name.trim()) return;
    await updateDoc(doc(db, "users", uid, "stock", id), { name: name.trim() });
  };

  const updateDateQty = async (id: string, date: string, delta: number) => {
    if (!uid) return;
    const item = stock.find((s) => s.id === id);
    if (!item) return;
    const current = item.dateQty?.[date] ?? 0;
    await updateDoc(doc(db, "users", uid, "stock", id), {
      [`dateQty.${date}`]: Math.max(0, current + delta),
    });
  };

  const setDateQty = async (id: string, date: string, qty: number) => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "stock", id), {
      [`dateQty.${date}`]: Math.max(0, qty),
    });
  };

  const setInitialQty = async (id: string, qty: number) => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "stock", id), { quantity: Math.max(0, qty) });
  };

  const setDateRemaining = async (id: string, date: string, qty: number) => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "stock", id), {
      [`dateRemaining.${date}`]: Math.max(0, qty),
    });
  };

  return { stock, updateQty, updateDateQty, setDateQty, setInitialQty, addStock, removeStock, renameStock, setDateRemaining };
}
