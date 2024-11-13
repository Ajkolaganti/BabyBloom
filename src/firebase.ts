import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB76e5SloZEpxwirBU7pCLf3-U65wQix6c",
    authDomain: "babybloom-312c0.firebaseapp.com",
    projectId: "babybloom-312c0",
    storageBucket: "babybloom-312c0.firebasestorage.app",
    messagingSenderId: "541112200835",
    appId: "1:541112200835:web:9e74cfe7504dbe6a6bf5b6",
    measurementId: "G-EPF7G5MS7H"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 