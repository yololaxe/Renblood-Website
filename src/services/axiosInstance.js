// src/services/axiosInstance.js
import axios from "axios";
import { auth } from "../data/firebaseConfig";

const apiKey = import.meta.env.VITE_API_KEY;
const baseURL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": apiKey,
  },
  timeout: 15000,
});

let refreshPromise = null;

const refreshToken = async (user) => {
  if (!refreshPromise) {
    refreshPromise = user.getIdToken(true).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    if (config._tokenRetry) return config;

    const user = auth.currentUser;
    if (!user) return config;

    try {
      const idToken = await user.getIdToken();
      config.headers["Authorization"] = `Bearer ${idToken}`;
      return config;
    } catch (error) {
      const idToken = await refreshToken(user);
      config.headers["Authorization"] = `Bearer ${idToken}`;
      return config;
    }
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("API: réseau inaccessible", error.message);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status === 401 && !error.config?._tokenRetry && auth.currentUser) {
      console.warn("API: auth invalide ou expirée");
      const retryConfig = { ...error.config, _tokenRetry: true };
      return refreshToken(auth.currentUser)
        .then((token) => {
          retryConfig.headers = {
            ...retryConfig.headers,
            Authorization: `Bearer ${token}`,
          };
          return axiosInstance(retryConfig);
        })
        .catch(() => Promise.reject(error));
    }

    if (status === 500) {
      console.error("API: erreur serveur", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
