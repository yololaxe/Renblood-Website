// src/services/axiosInstance.js
import axios from "axios";
import { auth } from "../data/firebaseConfig"; // Importer l'instance d'auth

// 🔐 API Key stockée dans .env.development (ex: VITE_API_KEY=ma-cle-secrete)
const apiKey = import.meta.env.VITE_API_KEY;

// 🌍 Base URL de l’API (ex: VITE_API_URL=http://127.0.0.1:8000)
const baseURL = import.meta.env.VITE_API_URL;

// 🔧 Création d'une instance Axios personnalisée
const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": apiKey, // 🔐 Appliqué à toutes les requêtes
  },
  timeout: 15000,
});

// --- Intercepteur pour ajouter le token Firebase ---
axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    // Si l'utilisateur est connecté, on ajoute le token
    if (user) {
      try {
        const idToken = await user.getIdToken(true); // true force le rafraîchissement
        config.headers.Authorization = `Bearer ${idToken}`;
      } catch (error) {
        console.error("❌ Erreur récupération du token Firebase:", error);
        // Optionnel : on pourrait annuler la requête ici si le token est crucial
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
