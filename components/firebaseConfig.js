// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Votre configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAtHEBytnKY-UVFfwG3KbylyCB34YilLXc",
    authDomain: "felaha-dz.firebaseapp.com",
    projectId: "felaha-dz",
    storageBucket: "felaha-dz.appspot.com",
    messagingSenderId: "966388175296",
    appId: "1:966388175296:web:c65c23f1df50edf3033825"
};

// Initialiser Firebase uniquement s'il n'est pas déjà initialisé
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialiser les services Firebase
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
