import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/players"; // L'URL de ton API

// ✅ Récupérer les infos du joueur à partir de son ID Firebase
export const getPlayerData = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get/${userId}/`);
    return response.data; // Retourne les infos du joueur
  } catch (error) {
    console.error("Erreur lors de la récupération des infos :", error);
    return null;
  }
};

// ✅ Supprimer les infos locales lors de la déconnexion
export const clearPlayerData = () => {
  localStorage.removeItem("playerData");
};
