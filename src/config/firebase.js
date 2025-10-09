// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeaHZnn4rCzftVVlpYS-W-mZuQ1YM_dXY",
    authDomain: "nexon-911f9.firebaseapp.com",
    projectId: "nexon-911f9",
    storageBucket: "nexon-911f9.firebasestorage.app",
    messagingSenderId: "516274272391",
    appId: "1:516274272391:web:693bcfea3542a444556022",
    measurementId: "G-R8PJ0YDFSH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

export default app;