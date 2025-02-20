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

export const getPlayerJobs = async (userId) => {
  if (!userId) {
    console.error("❌ Impossible de récupérer les métiers : userId est undefined !");
    return null;
  }

  try {
    console.log(`🔄 Requête envoyée : ${API_BASE_URL}/players/get/${userId}/jobs/`);
    const response = await axios.get(`${API_BASE_URL}/players/get/${userId}/jobs/`, { timeout: 10000 });
    console.log("✅ Métiers récupérés :", response.data.jobs);
    return response.data.jobs;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des jobs :", error);
    return null;
  }
};
// ✅ Récupérer l'arbre des talents d'un métier
// ✅ Récupérer l'arbre des talents d'un métier
export const getJobDetails = async (jobId) => {
  try {
    console.log(`🔄 Requête envoyée : ${API_BASE_URL}/jobs/${jobId}/`);
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}/`);
    console.log("✅ Réponse reçue :", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur de l'API :", error);
    return null;
  }
};


// ✅ Fonction pour mettre à jour la progression d'un joueur dans un métier
export const updateTalentProgression = async (userId, jobName, newProgression) => {
  try {
    // 🔥 Vérifie que la liste fait bien 10 éléments
    if (!Array.isArray(newProgression) || newProgression.length !== 10) {
      console.error("❌ Erreur : La progression doit être une liste de 10 booléens.");
      return;
    }

    const url = `${API_BASE_URL}/players/update/${userId}/jobs/${jobName}/progression/`;

    console.log(`🔄 Envoi de la requête PUT à : ${url}`);

    const response = await axios.put(
      url,
      { new_value: newProgression }, // 🔥 Envoi dans le body (JSON)
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Mise à jour réussie :", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de la progression :", error.response?.data || error.message);
    return null;
  }
};
