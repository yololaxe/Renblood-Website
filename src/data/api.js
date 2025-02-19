import axios from "axios";

// 🔍 Détection de l'environnement (local / production)
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://renblood-backend.onrender.com"
    : "http://127.0.0.1:8000";

// ✅ Vérifier si l'API est active
export const checkApiStatus = async () => {
  try {
    await axios.get(`${API_BASE_URL}/ping`);
    console.log(`🟢 API en ligne (${API_BASE_URL})`);
    return true;
  } catch (error) {
    console.error(`❌ API inaccessible (${API_BASE_URL})`, error);
    return false;
  }
};

// ✅ Récupérer les infos du joueur à partir de son ID Firebase
export const getPlayerData = async (userId) => {
  try {
    console.log(`🔄 Requête envoyée : ${API_BASE_URL}/players/get/${userId}/`);
    const response = await axios.get(`${API_BASE_URL}/players/get/${userId}/`, { timeout: 10000 });
    console.log("✅ Réponse reçue :", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("❌ Erreur de l'API :", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("❌ L'API Render ne répond pas (serveur en veille ?)");
    } else {
      console.error("❌ Erreur Axios :", error.message);
    }
    return null;
  }
};

// ✅ Supprimer les infos locales lors de la déconnexion
export const clearPlayerData = () => {
  localStorage.removeItem("playerData");
};
