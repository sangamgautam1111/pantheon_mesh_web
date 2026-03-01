import { initializeApp, getApps } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummy_REPLACE_ME",
    authDomain: "pantheon-mesh.firebaseapp.com",
    databaseURL: "https://pantheon-mesh-default-rtdb.firebaseio.com",
    projectId: "pantheon-mesh",
    storageBucket: "pantheon-mesh.firebasestorage.app",
    messagingSenderId: "692364525603",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:692364525603:web:REPLACE_ME",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

export { app, auth, db, githubProvider, googleProvider };
