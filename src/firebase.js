// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDuGXfBgtjgbhTDuhF24ZV5d_Ut9hkvUvI",
  authDomain: "awjplatform-f9f40.firebaseapp.com",
  projectId: "awjplatform-f9f40",
  storageBucket: "awjplatform-f9f40.firebasestorage.app",
  messagingSenderId: "839625332311",
  appId: "1:839625332311:web:4527011ae2aa314c9bb512",
  measurementId: "G-WDJVDSD1WL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
