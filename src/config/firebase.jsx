
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCdZSKPwmGXTcZcXaFLjp468BZMzF08g84",
  authDomain: "listacompras-dc6ee.firebaseapp.com",
  databaseURL: "https://listacompras-dc6ee-default-rtdb.firebaseio.com",
  projectId: "listacompras-dc6ee",
  storageBucket: "listacompras-dc6ee.firebasestorage.app",
  messagingSenderId: "1021456032389",
  appId: "1:1021456032389:web:ddd02c40b1cc303999bfec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);