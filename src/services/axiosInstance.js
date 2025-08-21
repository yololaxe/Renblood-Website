// src/services/axiosInstance.js
import axios from "axios";

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

export default axiosInstance;
