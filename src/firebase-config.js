import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRhEfpSy8AkfLXiinVyrxPx0XvlwfAz7g",
  authDomain: "pylearn-24098.firebaseapp.com",
  projectId: "pylearn-24098",
  storageBucket: "pylearn-24098.firebasestorage.app",
  messagingSenderId: "32253787696",
  appId: "1:32253787696:web:17c314e480d1a048cbb7f5",
  measurementId: "G-Y531KWTXCW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
