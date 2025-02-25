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

export async function getPlayerJobs(userId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/players/get/${userId}/jobs`);
    console.log("Données des métiers récupérées :", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des jobs :", error);
    return { jobs: {} };
  }
}

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
    if (!Array.isArray(newProgression) || (newProgression.length !== 10 && newProgression.length !== 15)) {
      console.error("❌ Erreur : La progression doit être une liste de 10 ou 15 booléens.");
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

// ✅ Récupérer la liste des joueurs selon leur rank
export const getPlayers = async (rank) => {
  try {
    console.log(`🔄 Requête envoyée : ${API_BASE_URL}/players/getPlayers/${rank}/`);
    const response = await axios.get(`${API_BASE_URL}/players/getPlayers/${rank}/`, { timeout: 10000 });
    console.log("✅ Réponse reçue :", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur de l'API :", error);
    return null;
  }
};

export async function updatePlayer(playerId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/players/update/${playerId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur de mise à jour");

    console.log("✅ Joueur mis à jour :", data);
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du joueur :", error);
  }
}


// TRAITS ET ACTION //


// 🔹 Récupérer tous les traits disponibles
export const getTraits = async () => {
  console.log("🔍 Appel API: Récupération des traits...");
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/get/traits/`);
    const data = await response.json();
    console.log("✅ Traits reçus :", data);
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des traits:", error);
    return [];
  }
};

// 🔹 Récupérer toutes les actions disponibles
export const getActions = async () => {
  console.log("🔍 Appel API: Récupération des actions...");
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/get/actions/`);
    const data = await response.json();
    console.log("✅ Actions reçues :", data);
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des actions:", error);
    return [];
  }
};

// 🔹 Ajouter un trait à un joueur
export const addTraitToPlayer = async (playerId, traitId) => {
  const response = await fetch(`${API_BASE_URL}/players/list/${playerId}/trait/add/?id=${traitId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
};

// 🔹 Supprimer un trait d’un joueur
export const removeTraitFromPlayer = async (playerId, traitId) => {
  if (!playerId || !traitId) {
    console.error("❌ ERREUR : playerId ou traitId est manquant !");
    return;
  }

  console.log(`🗑️ Suppression du trait ${traitId} pour le joueur ${playerId}`);

  try {
    const response = await axios.delete(`${API_BASE_URL}/players/list/${playerId}/trait/delete/`, {
      params: { id: traitId },
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Trait supprimé avec succès !");
    return response.data;
  } catch (error) {
    console.error("❌ ERREUR API :", error.response?.status, error.response?.statusText || error.message);
    return null;
  }
};



// 🔹 Ajouter une action à un joueur
export const addActionToPlayer = async (playerId, actionId) => {
  const response = await fetch(`${API_BASE_URL}/players/list/${playerId}/action/add/?id=${actionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
};

export const removeActionFromPlayer = async (playerId, actionId) => {
  if (!playerId || !actionId) {
    console.error("❌ ERREUR : playerId ou actionId est manquant !");
    return null;
  }

  console.log(`🗑️ Suppression de l'action ${actionId} pour le joueur ${playerId}`);

  try {
    const response = await axios.delete(`${API_BASE_URL}/players/list/${playerId}/action/delete/`, {
      params: { id: actionId }, // ✅ Utilisation de params pour l'ID
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Action supprimée :", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'action :", error.response?.data || error.message);
    return null;
  }
};


export async function updatePlayerJobs(playerId, jobName, field, value) {
  try {
    const url = `${API_BASE_URL}/players/update/${playerId}/jobs/${jobName}/${field}/`; // ✅ Vérification de l'URL

    console.log(`🔄 Envoi de la requête PUT à : ${url} avec new_value =`, value);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_value: value }), // ✅ Respecte la structure attendue par Django
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Erreur lors de la mise à jour du métier :`, errorData);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Mise à jour réussie :`, data);
    return data;
  } catch (error) {
    console.error("❌ Erreur de connexion à l'API :", error);
    return null;
  }
}

export const createPlayer = async (playerData) => {
  try {
    const url = `${API_BASE_URL}/players/create/`;

    console.log(`🔄 Envoi de la requête POST à : ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Erreur lors de la création du joueur :`, errorData);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Joueur créé avec succès :`, data);
    return data;
  } catch (error) {
    console.error("❌ Erreur de connexion à l'API :", error);
    return null;
  }
};
