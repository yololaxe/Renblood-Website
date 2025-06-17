// src/services/api.js
import axiosInstance from "./axiosInstance";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Vérifier si l'API est active
export const checkApiStatus = async () => {
  try {
    await axiosInstance.get("/ping");
    console.log(`🟢 API en ligne`);
    return true;
  } catch (error) {
    console.error(`❌ API inaccessible`, error);
    return false;
  }
};

////////////////////////// PLAYERS ///////////////////////

// ✅ Récupérer les infos du joueur à partir de son ID Firebase
export const getPlayerData = async (userId) => {
  try {
    console.log(`🔄 GET /players/get/${userId}/`);
    const { data } = await axiosInstance.get(`/players/get/${userId}/`);
    console.log("✅ Réponse reçue :", data);
    return data;
  } catch (error) {
    console.error("❌ getPlayerData :", error.response?.data || error.message);
    return null;
  }
};

export const getPlayerJobs = async (userId) => {
  try {
    console.log(`🔄 GET /players/get/${userId}/jobs`);
    const { data } = await axiosInstance.get(`/players/get/${userId}/jobs`);
    console.log("✅ Jobs récupérés :", data);
    return data;
  } catch (error) {
    console.error("❌ getPlayerJobs :", error);
    return { jobs: {} };
  }
};

export const getPlayers = async (rank) => {
  try {
    console.log(`🔄 GET /players/getPlayers/${rank}/`);
    const { data } = await axiosInstance.get(`/players/getPlayers/${rank}/`);
    console.log("✅ getPlayers :", data);
    return data;
  } catch (error) {
    console.error("❌ getPlayers :", error);
    return null;
  }
};

export const me = async (firebaseUid) => {
  try {
    const { data } = await axiosInstance.get(`/players/me/${firebaseUid}/`);
    return data;
  } catch (error) {
    console.error("❌ me() :", error.response?.data || error.message);
    throw error;
  }
};

export const createPlayer = async (playerData) => {
  try {
    console.log(`🔄 POST /players/create/`, playerData);
    const { data } = await axiosInstance.post(`/players/create/`, playerData);
    return data;
  } catch (error) {
    console.error("❌ createPlayer :", error.response?.data || error.message);
    return null;
  }
};

export const updatePlayer = async (playerId, updates) => {
  try {
    console.log(`🔄 PUT /players/update/${playerId}/`, updates);
    const { data } = await axiosInstance.put(`/players/update/${playerId}/`, updates);
    console.log("✅ updatePlayer :", data);
    return data;
  } catch (error) {
    console.error("❌ updatePlayer :", error.response?.data || error.message);
    return null;
  }
};

export const addTraitToPlayer = async (playerId, traitId) => {
  try {
    console.log(`🔄 PUT /players/list/${playerId}/trait/add/?id=${traitId}`);
    const { data } = await axiosInstance.put(
      `/players/list/${playerId}/trait/add/`,
      null,
      { params: { id: traitId } }
    );
    return data;
  } catch (error) {
    console.error("❌ addTraitToPlayer :", error.response?.data || error.message);
    return null;
  }
};

export const removeTraitFromPlayer = async (playerId, traitId) => {
  try {
    console.log(`🔄 DELETE /players/list/${playerId}/trait/delete/?id=${traitId}`);
    const { data } = await axiosInstance.delete(
      `/players/list/${playerId}/trait/delete/`,
      { params: { id: traitId } }
    );
    return data;
  } catch (error) {
    console.error("❌ removeTraitFromPlayer :", error.response?.data || error.message);
    return null;
  }
};

export const addActionToPlayer = async (playerId, actionId) => {
  try {
    console.log(`🔄 PUT /players/list/${playerId}/action/add/?id=${actionId}`);
    const { data } = await axiosInstance.put(
      `/players/list/${playerId}/action/add/`,
      null,
      { params: { id: actionId } }
    );
    return data;
  } catch (error) {
    console.error("❌ addActionToPlayer :", error.response?.data || error.message);
    return null;
  }
};

export const removeActionFromPlayer = async (playerId, actionId) => {
  try {
    console.log(`🔄 DELETE /players/list/${playerId}/action/delete/?id=${actionId}`);
    const { data } = await axiosInstance.delete(
      `/players/list/${playerId}/action/delete/`,
      { params: { id: actionId } }
    );
    return data;
  } catch (error) {
    console.error("❌ removeActionFromPlayer :", error.response?.data || error.message);
    return null;
  }
};



export const createDefaultPlayer = async (firebaseUser) => {
  const defaultPlayer = {
    id: firebaseUser.uid,
    id_minecraft: firebaseUser.uid,
    pseudo_minecraft: firebaseUser.displayName || "Inconnu",
    name: firebaseUser.displayName?.split(" ")[0] || "",
    surname: firebaseUser.displayName?.split(" ")[1] || "",
    total_lvl: 0,
    description: "",
    rank: "NonPlayer",
    money: 0,
    divin: false,
    experiences: {
      jobs: Object.fromEntries([
        "lumberjack", "naval_architect", "artisan", "carpenter", "miner", "blacksmith", "glassmaker", "mason",
        "farmer", "breeder", "fisherman", "innkeeper", "guard", "merchant", "transporter", "explorer",
        "bestiary", "banker", "politician", "builder"
      ].map(job => [job, {
        xp: -1,
        level: 0,
        progression: Array(job === "bestiary" || job === "banker" || job === "politician" || job === "builder" ? 15 : 10).fill(false),
        inter_choice: [],
        choose_lvl_10: ""
      }]))
    }
  };

  try {
    await createPlayer(defaultPlayer);
    console.log("✅ Joueur par défaut créé !");
  } catch (err) {
    console.error("❌ Erreur lors de la création du joueur par défaut :", err);
  }
};

/**
 * Met à jour le level du métier `jobName` pour le joueur `playerId`
 * @param {string} playerId
 * @param {string} jobName
 * @returns {Promise<{job: string, xp: number, new_level: number}>}
 */
export const updateJobLevel = async (playerId, jobName) => {
  try {
    console.log(`🔄 POST /players/stats/${playerId}/update_job_level/${jobName}/`);
    const { data } = await axiosInstance.post(
      `/players/stats/${playerId}/update_job_level/${jobName}/`
    );
    console.log('✅ updateJobLevel:', data);
    return data;
  } catch (error) {
    console.error(
      '❌ updateJobLevel:',
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getPlayerFullProfile = async (playerId) => {
  const { data } = await axiosInstance.get(
    `/players/stats/${playerId}/full_profile/`
  );
  return data;
};


//////////////////// TRAITS & ACTIONS //////////////////////

export const getTraits = async () => {
  try {
    console.log(`🔄 GET /stats/trait/get`);
    const { data } = await axiosInstance.get(`/stats/trait/get`);
    return data;
  } catch (error) {
    console.error("❌ getTraits :", error.response?.data || error.message);
    return [];
  }
};

export const getActions = async () => {
  try {
    console.log(`🔄 GET /stats/action/get`);
    const { data } = await axiosInstance.get(`/stats/action/get`);
    return data;
  } catch (error) {
    console.error("❌ getActions :", error.response?.data || error.message);
    return [];
  }
};

////////////////////////// JOBS ////////////////////////////

export const getJobDetails = async (jobId) => {
  try {
    console.log(`🔄 GET /stats/jobs/${jobId}/`);
    const { data } = await axiosInstance.get(`/stats/jobs/${jobId}/`);
    return data;
  } catch (error) {
    console.error("❌ getJobDetails :", error.response?.data || error.message);
    return null;
  }
};

/////////////////////////// GLOBALS /////////////////////////

export const getCurrentGlobal = async () => {
  try {
    console.log(`🔄 GET /stats/globals/`);
    const { data } = await axiosInstance.get(`/stats/globals/`);
    return data[0];
  } catch (error) {
    console.error("❌ getCurrentGlobal :", error.response?.data || error.message);
    throw error;
  }
};

export const advanceToNextSeason = async () => {
  try {
    console.log(`🔄 POST /stats/globals/next-season/`);
    const { data } = await axiosInstance.post(`/stats/globals/next-season/`);
    return data;
  } catch (error) {
    console.error("❌ advanceToNextSeason :", error.response?.data || error.message);
    throw error;
  }
};

/////////////////////////// DICE ////////////////////////////

export const rollDice = async (token) => {
  try {
    console.log(`🔄 POST /api/jobs/dice/roll/`);
    const { data } = await axiosInstance.post(
      `/api/jobs/dice/roll/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error("❌ rollDice :", error.response?.data || error.message);
    return null;
  }
};

////////////////////////// UPDATES /////////////////////////

export const updateTalentProgression = async (userId, jobName, newProgression) => {
  try {
    if (!Array.isArray(newProgression) || (newProgression.length !== 10 && newProgression.length !== 15)) {
      console.error("❌ progression must be 10 or 15 booleans");
      return null;
    }
    console.log(`🔄 PUT /players/update/${userId}/jobs/${jobName}/progression/`, newProgression);
    const { data } = await axiosInstance.put(
      `/players/update/${userId}/jobs/${jobName}/progression/`,
      { new_value: newProgression }
    );
    console.log("✅ Progression mise à jour :", data);
    return data;
  } catch (error) {
    console.error("❌ updateTalentProgression :", error.response?.data || error.message);
    return null;
  }
};

export const updatePlayerJobs = async (playerId, jobName, field, value) => {
  try {
    console.log(`🔄 PUT /players/update/${playerId}/jobs/${jobName}/${field}/`, value);
    const { data } = await axiosInstance.put(
      `/players/update/${playerId}/jobs/${jobName}/${field}/`,
      { new_value: value }
    );
    return data;
  } catch (error) {
    console.error("❌ updatePlayerJobs :", error.response?.data || error.message);
    return null;
  }
};

////////////////////////////// STATS UPDATE ////////////////////////////////
/**
 * Initialise tous les bonus "talent_tree" pour un joueur en récupérant
 * les choix de jobs débloqués et en les ajoutant à real_charact.
 *
 * @param {string} playerId - L’ID Firebase du joueur.
 * @returns {Promise<Object|null>} - Le real_charact mis à jour ou null en cas d’erreur.
 */
export const initializeStatsBonus = async (playerId) => {
  try {
    console.log(`🔄 POST /players/stats/${playerId}/initialize_stats_bonus/`);
    const { data } = await axiosInstance.post(
      `/players/stats/${playerId}/initialize_stats_bonus/`
    );
    console.log("✅ real_charact initialisé :", data);
    return data.real_charact;
  } catch (error) {
    console.error(
      "❌ initializeStatsBonus :",
      error.response?.data || error.message
    );
    return null;
  }
};


////////////////////////////// NODES ////////////////////////////////////
export const getAllNodes = async () => {
  try {
    const res = await axiosInstance.get(`stats/nodes/`);
    return res.data;
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des nodes :", err);
    return [];
  }
};


