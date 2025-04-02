// src/utils/sessionUtils.js
import { getItem, removeItem, setItem } from "./localstorageUtils";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export const setUserSession = ({ token, refresh, id, email, first_name, last_name, uid }) => {
    setItem("token_life", (new Date().getTime() + 60000 * 60 * 48).toString());
    setItem(ACCESS_TOKEN_KEY, token);
    setItem(REFRESH_TOKEN_KEY, refresh);
    setItem("id", id);
    setItem("email", email);
    setItem("first_name", first_name);
    setItem("last_name", last_name);
    setItem("uid", uid);
};

export const destroySession = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
    }
    keys.forEach((item) => {
        removeItem(item);
    });
};

export const getAccessToken = () => getItem(ACCESS_TOKEN_KEY) || null;
export const getRefreshToken = () => getItem(REFRESH_TOKEN_KEY);
export const setAccessToken = (token) => setItem(ACCESS_TOKEN_KEY, token);
export const setRefreshToken = (token) => setItem(REFRESH_TOKEN_KEY, token);
export const delAccessToken = () => removeItem(ACCESS_TOKEN_KEY);
export const delRefreshToken = () => removeItem(REFRESH_TOKEN_KEY);
