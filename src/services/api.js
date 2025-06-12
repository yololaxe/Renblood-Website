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

export const me = async (firebaseUid) => {
  try {
    const { data } = await axiosInstance.get(`/players/me/${firebaseUid}/`);
    return data;
  } catch (error) {
    console.error("❌ me() :", error.response?.data || error.message);
    throw error;
  }
};

export const clearPlayerData = () => {
  localStorage.removeItem("playerData");
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
    const { data } = await axiosInstance.put(`/players/list/${playerId}/trait/add/`, null, { params: { id: traitId } });
    return data;
  } catch (error) {
    console.error("❌ addTraitToPlayer :", error.response?.data || error.message);
    return null;
  }
};

export const removeTraitFromPlayer = async (playerId, traitId) => {
  try {
    console.log(`🔄 DELETE /players/list/${playerId}/trait/delete/?id=${traitId}`);
    const { data } = await axiosInstance.delete(`/players/list/${playerId}/trait/delete/`, { params: { id: traitId } });
    return data;
  } catch (error) {
    console.error("❌ removeTraitFromPlayer :", error.response?.data || error.message);
    return null;
  }
};

export const addActionToPlayer = async (playerId, actionId) => {
  try {
    console.log(`🔄 PUT /players/list/${playerId}/action/add/?id=${actionId}`);
    const { data } = await axiosInstance.put(`/players/list/${playerId}/action/add/`, null, { params: { id: actionId } });
    return data;
  } catch (error) {
    console.error("❌ addActionToPlayer :", error.response?.data || error.message);
    return null;
  }
};

export const removeActionFromPlayer = async (playerId, actionId) => {
  try {
    console.log(`🔄 DELETE /players/list/${playerId}/action/delete/?id=${actionId}`);
    const { data } = await axiosInstance.delete(`/players/list/${playerId}/action/delete/`, { params: { id: actionId } });
    return data;
  } catch (error) {
    console.error("❌ removeActionFromPlayer :", error.response?.data || error.message);
    return null;
  }
};

export const updatePlayerJobs = async (playerId, jobName, field, value) => {
  try {
    console.log(`🔄 PUT /players/update/${playerId}/jobs/${jobName}/${field}/`, value);
    const { data } = await axiosInstance.put(`/players/update/${playerId}/jobs/${jobName}/${field}/`, {
      new_value: value
    });
    return data;
  } catch (error) {
    console.error("❌ updatePlayerJobs :", error.response?.data || error.message);
    return null;
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
