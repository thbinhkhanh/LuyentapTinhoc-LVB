// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAhfBnZ3HP0ME2jG6JzY9dR_YO8MB4IxA",
  authDomain: "tinhoc-lvb.firebaseapp.com",
  projectId: "tinhoc-lvb",
  storageBucket: "tinhoc-lvb.firebasestorage.app",
  messagingSenderId: "14655384833",
  appId: "1:14655384833:web:f21c5d5900de6a3ce37f00"
};

// Khởi tạo Firebase (tránh init nhiều lần)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore
const db = getFirestore(app);

export { db };
