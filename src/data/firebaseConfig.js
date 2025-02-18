import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBdO5-ycFDAFbH_6s14FSMo-LpRORusXUM",
    authDomain: "renblood-website.firebaseapp.com",
    projectId: "renblood-website",
    storageBucket: "renblood-website.firebasestorage.app",
    messagingSenderId: "684430362417",
    appId: "1:684430362417:web:eb6c348707c9d03a9c9210",
    measurementId: "G-54E840VXFN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Fonction pour écouter les changements de connexion
export const listenToAuthChanges = (setUser) => {
  onAuthStateChanged(auth, (user) => {
    setUser(user);
  });
};

// ✅ Correction : Exportation de signOut
export { signOut };