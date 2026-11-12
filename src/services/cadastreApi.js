import axios from "./axiosInstance";
export async function fetchCadastre(bounds, admin, signal) {
  const [minX, minZ, maxX, maxZ] = bounds;
  const { data } = await axios.get("/api/lands/v1/map/", { signal, headers: { "X-API-KEY": undefined }, params: { minX, minZ, maxX, maxZ, mode: admin ? "admin" : "player" } });
  return data;
}
export async function sendLandChange(value) {
  const { data } = await axios.post("/api/lands/v1/commands/", value, { headers: { "X-API-KEY": undefined } });
  return data;
}
export const cadastreError = error => error?.response?.data?.message || "Le cadastre n’a pas pu être chargé. Réessayez dans un instant.";
