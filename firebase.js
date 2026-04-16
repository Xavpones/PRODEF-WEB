// Importaciones Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// Configuración PRODEF
const firebaseConfig = {
  apiKey: "AIzaSyDClF6InDI2_IFUvnX2cvt6kx9ZQAE7sfA",
  authDomain: "prodef-5665d.firebaseapp.com",
  projectId: "prodef-5665d",
  storageBucket: "prodef-5665d.firebasestorage.app",
  messagingSenderId: "710463144143",
  appId: "1:710463144143:web:50d58fe1ee5222743237ba",
  measurementId: "G-G0L9ZSRZKF"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios que vamos a usar
export const auth = getAuth(app);
export const db = getFirestore(app);