"use client";
import { createContext, useContext } from "react";

// personal app — ใช้ fixed ID แทน anonymous auth
const OWNER_ID = "linlin-planner";

const AuthContext = createContext<{ uid: string }>({ uid: OWNER_ID });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={{ uid: OWNER_ID }}>{children}</AuthContext.Provider>;
}

export const useUID = () => useContext(AuthContext).uid;
