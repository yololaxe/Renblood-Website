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
  const jobNames = [
    "lumberjack", "naval_architect", "artisan", "carpenter", "miner", "blacksmith", "glassmaker", "mason",
    "farmer", "breeder", "fisherman", "innkeeper", "guard", "merchant", "transporter", "explorer",
    "bestiary", "banker", "politician", "builder"
  ];

  const experiences = {
    jobs: Object.fromEntries(
      jobNames.map((job) => {
        const length = ["bestiary", "banker", "politician", "builder"].includes(job) ? 15 : 10;
        return [
          job,
          {
            xp: -1,
            level: 0,
            progression: Array(length).fill(false),
            inter_choice: [],
            choose_lvl_10: ""
          }
        ];
      })
    )
  };

  const defaultPlayer = {
    id: firebaseUser.uid,
    id_minecraft: firebaseUser.uid,
    pseudo_minecraft: firebaseUser.displayName || "Inconnu",
    name: firebaseUser.displayName?.split(" ")[0] || "",
    surname: firebaseUser.displayName?.split(" ")[1] || "",
    description: "",
    rank: "Citoyen",
    money: 0.0,
    divin: "",

    // Attributs physiques
    life: 10,
    strength: 1,
    speed: 100,
    reach: 5,
    resistance: 0,
    place: 18,
    haste: 78,
    regeneration: 1,

    // Traits et Actions par défaut
    traits: [],
    actions: [],

    // Compétences diverses
    dodge: 2,
    discretion: 3,
    charisma: 1,
    rethoric: 1,
    mana: 100,
    negotiation: 0,
    influence: 1,
    skill: 100,

    // Discord fields
    discord_id: null,
    discord_username: null,
    discord_discriminator: null,
    discord_avatar: null,

    // Expériences et caractéristiques réelles
    experiences,
    real_charact: {}
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


/**
 * GET /stats/globals/             → liste de tous les Global
 */
export const getGlobals = async () => {
  try {
    console.log("🔄 GET /stats/globals/");
    const { data } = await axiosInstance.get("/stats/globals/");
    return data;
  } catch (error) {
    console.error("❌ getGlobals :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * GET /stats/globals/             → premier Global
 */
export const getCurrentGlobal = async () => {
  try {
    const data = await getGlobals();
    return data[0];
  } catch (error) {
    console.error("❌ getCurrentGlobal :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * GET /stats/globals/current-season/
 * → { id, year, season, label, one_session_state, future_modif_add_state }
 */
export const getYearAndSeason = async () => {
  try {
    console.log("🔄 GET /stats/globals/current-season/");
    const { data } = await axiosInstance.get("/stats/globals/current-season/");
    return data;
  } catch (error) {
    console.error("❌ getYearAndSeason :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * PATCH /stats/globals/{id}/
 * Permet de mettre à jour un ou plusieurs champs.
 */
export const updateGlobalFields = async (payload) => {
  try {
    console.log("🔄 PATCH /stats/globals/update-flags/", payload);
    const { data } = await axiosInstance.patch(
      `/stats/globals/update-flags/`,
      payload
    );
    return data;
  } catch (error) {
    console.error("❌ updateGlobalFields :", error.response?.data || error.message);
    throw error;
  }
};


/**
 * POST /stats/globals/next-season/
 */
export const advanceToNextSeason = async () => {
  try {
    console.log("🔄 POST /stats/globals/next-season/");
    const { data } = await axiosInstance.post("/stats/globals/next-season/");
    return data;
  } catch (error) {
    console.error("❌ advanceToNextSeason :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * POST /stats/globals/prev-season/
 */
export const retreatToPreviousSeason = async () => {
  try {
    console.log("🔄 POST /stats/globals/prev-season/");
    const { data } = await axiosInstance.post("/stats/globals/prev-season/");
    return data;
  } catch (error) {
    console.error(
      "❌ retreatToPreviousSeason :",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getSessionActiveState = async () => {
  const { data } = await axiosInstance.get('/stats/globals/active-state/');
  return data.one_session_state;
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

/**
 * Ajoute un bonus sur une stat pour le joueur.
 * @param {string|number} playerId
 * @param {string} stat   La clé de la stat (ex: "skill", "speed", ...)
 * @param {number} count  Le montant à ajouter
 * @param {string} type   Le type du bonus (ex: "COMP", "talent_tree", ...)
 */
export const addBonus = async (playerId, stat, count, type) => {
  try {
    console.log(`🔄 POST /players/stats/${playerId}/add_bonus/`, { stat, count, type });
    const { data } = await axiosInstance.post(
      `/players/stats/${playerId}/add_bonus/`,
      { stat, count, type }
    );
    console.log("✅ addBonus réponse :", data);
    return data.real_charact;
  } catch (error) {
    console.error("❌ addBonus :", error.response?.data || error.message);
    throw error;
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


/////////////////////////////// SESSIONS ////////////////////////////////////

/**
 * Récupère la session pour l’année/saison courante
 * GET /stats/sessions/current/
 */
export const getCurrentSession = async () => {
  try {
    const { data } = await axiosInstance.get("/sessions/current/");
    return data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    console.error("getCurrentSession error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Crée une nouvelle session
 * POST /stats/sessions/
 */
export const createSession = async ({ year, season }) => {
  try {
    const { data } = await axiosInstance.post("/sessions/", { year, season });
    return data;
  } catch (err) {
    console.error("createSession error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Ajoute un joueur à la session donnée
 * POST /stats/sessions/{id}/add-player/
 */
export const addPlayerToSession = async (sessionId, playerId) => {
  const { data } = await axiosInstance.post(
    `/sessions/${sessionId}/add-player/`,
    { player_id: playerId }
  );
  return data;
};

/**
 * Supprime un joueur de la session donnée
 * POST /stats/sessions/{id}/remove-player/
 */
export const removePlayerFromSession = async (sessionId, playerId) => {
  const { data } = await axiosInstance.post(
    `/sessions/${sessionId}/remove-player/`,
    { player_id: playerId }
  );
  return data;
};

export const updateSessionDate = async (sessionId, sessionDate) => {
  try {
    const { data } = await axiosInstance.patch(
      `/sessions/${sessionId}/set-session-date/`,
      { session_date: sessionDate }
    );
    return data;
  } catch (err) {
    console.error("updateSessionDate error:", err.response?.data || err.message);
    throw err;
  }
};
/**
 * Récupère la liste de toutes les sessions
 * GET /stats/sessions/
 */
export const getAllSessions = async () => {
  const { data } = await axiosInstance.get("/sessions/");
  return data;
};

/**
 * Récupère une session par ID
 * GET /stats/sessions/{id}/
 */
export const getSessionById = async (sessionId) => {
  const { data } = await axiosInstance.get(`/sessions/${sessionId}/`);
  return data;
};


/////////////////////////FUTURE/////////////////////////////
export const getMyFuture = async (sessionId, playerId) => {
  try {
    console.log(`🔄 GET /session/futures/my-future/?session=${sessionId}&player_id=${playerId}`);
    const { data } = await axiosInstance.get(
        `/sessions/futures/my-future/`,
        {params: { session: sessionId, player_id: playerId }}
    );
    console.log("✅ getMyFuture:", data);
    return data;
  } catch (err) {
    if (err.response?.status === 404) {
      // pas de future -> on renvoie null
      return null;
    }
    console.error("❌ getMyFuture error:", err.response?.data || err.message);
    throw err;
  }
};

export const deleteFuture = async (futureId) => {
  try {
    await axiosInstance.delete(`/sessions/futures/${futureId}/`);
    return true;
  } catch (err) {
    console.error("deleteFuture error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Crée une future pour une session et un player
 * POST /sessions/futures/add-future/
 * → renvoie 205 Reset Content + body de la future créée
 */
export const createFuture = async ({ sessionId, playerId, type, answer }) => {
  try {
    console.log(
      `🔄 POST /sessions/futures/add-future/ →`,
      { session: sessionId, player: playerId, type, answer }
    );
    const { data } = await axiosInstance.post(
      "/sessions/futures/add-future/",
      { session: sessionId, player: playerId, type, answer }
    );
    console.log("✅ createFuture:", data);
    return data;
  } catch (err) {
    console.error("❌ createFuture error:", err.response?.data || err.message);
    throw err;
  }
};
export const getFutureById = async (futureId) => {
  const { data } = await axiosInstance.get(`/sessions/futures/${futureId}/`);
  return data;
};

export const updateFuture = async (futureId, payload) => {
  // PATCH partiel : on ne met à jour que 'answer'
  const { data } = await axiosInstance.patch(
    `/sessions/futures/${futureId}/`,
    payload
  );
  return data;
};

export const getSessionPlayersWithFutures = async (sessionId) => {
  const { data } = await axiosInstance.get(
    `/sessions/futures/players-with-futures/`,
    { params: { session: sessionId } }
  );
  return data;
};

// DISCORD
/**
 * Lance le flow OAuth pour lier le compte Discord :
 * renvoie une 302 via le backend
 */
export const getDiscordLink = async (userId) => {
  const { data } = await axiosInstance.get(`/players/discord/link/?state=${userId}`);
  return data.url;
};

/**
 * Récupère les infos Discord du joueur logué (si déjà lié)
 * @returns {Promise<{
 *   discord_id: string,
 *   discord_username: string,
 *   discord_discriminator: string,
 *   discord_avatar: string
 * }|null>}
 */
export const getPlayerDiscord = async (playerId) => {
  try {
    console.log("🔄 GET /players/discord/me/");
    const { data } = await axiosInstance.get(`/players/discord/${playerId}/me/`);
    console.log("✅ getPlayerDiscord :", data);
    return data;
  } catch (error) {
    console.error("❌ getPlayerDiscord :", error.response?.data || error.message);
    return null;
  }
};
export const unlinkDiscord = async (userId) => {
  console.log("🔄 POST /players/discord/unlink/");
  const response = await axiosInstance.post(`/players/discord/${userId}/unlink/`);
  return response.data;
};

export const getOnlineDiscordMembers = async () => {
  try {
    console.log("🔄 GET /players/discord/online-members/");
    const { data } = await axiosInstance.get(`/players/discord/online-members/`);
    return data;  // un array de pseudos
  } catch (err) {
    console.error("❌ getOnlineDiscordMembers :", err.response?.data || err.message);
    return [];
  }
};