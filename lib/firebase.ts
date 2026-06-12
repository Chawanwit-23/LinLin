import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDtgnmziv15K8rtOcucYeHNHdZvuG-7x3A",
  authDomain: "legal-case-db.firebaseapp.com",
  projectId: "legal-case-db",
  storageBucket: "legal-case-db.firebasestorage.app",
  messagingSenderId: "961778594900",
  appId: "1:961778594900:web:da9056a3ba72be413129c1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
