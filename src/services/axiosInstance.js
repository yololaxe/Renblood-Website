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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (!user) {
      return config;
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            config.headers["Authorization"] = "Bearer " + token;
            resolve(config);
          },
          reject: (err) => {
            reject(err);
          },
        });
      });
    }

    try {
      const idToken = await user.getIdToken(true);
      config.headers["Authorization"] = "Bearer " + idToken;
      return config;
    } catch (error) {
      isRefreshing = true;
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            config.headers["Authorization"] = "Bearer " + token;
            resolve(config);
          },
          reject: (err) => {
            reject(err);
          },
        });

        user.getIdToken(true).then(token => {
          processQueue(null, token);
          isRefreshing = false;
        }).catch(err => {
          processQueue(err, null);
          isRefreshing = false;
          reject(err);
        });
      });
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
