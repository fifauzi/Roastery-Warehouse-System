import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config Firebase khusus project BDS Coffee:
export const firebaseConfig = {
  apiKey: "AIzaSyBlrDOvHLR6HkM5n4Re8dFQv2wFgGyuqr8",
  authDomain: "maps-a6773.firebaseapp.com",
  projectId: "maps-a6773",
  storageBucket: "maps-a6773.firebasestorage.app",
  messagingSenderId: "774756813751",
  appId: "1:774756813751:web:067703f3aa245e741f3632",
  measurementId: "G-LPN7FE0H05"
};

// Initialize Firebase safely (avoid re-initialization in HMR/Fast Refresh)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export Auth & Firestore instance
export const auth = getAuth(app);
export const db = getFirestore(app);

export const COLLECTIONS = {
  GREEN_BEANS: 'green_beans',
  ROASTED_BEANS: 'roasted_beans',
  ROAST_REQUESTS: 'roast_requests',
  STOCK_TRANSACTIONS: 'stock_transactions',
  PACKAGING: 'packaging_inventory',
  USERS: 'users',
  SURAT_JALAN: 'delivery_orders',
} as const;
