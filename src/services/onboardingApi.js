import api from "./axiosInstance";

export const profileRequest = async (method, path, body) => {
  try {
    return (await api({ method, url: `/players/onboarding/${path}`, data: body })).data;
  } catch (error) {
    const failure = new Error(error.response?.data?.message || "Le serveur est temporairement inaccessible. Réessayez dans un instant.");
    failure.code = error.response?.data?.code;
    failure.fields = error.response?.data?.fields || {};
    failure.status = error.response?.status;
    throw failure;
  }
};

const pending = new Map();
export function bootstrapProfile(uid) {
  if (!pending.has(uid)) {
    pending.set(uid, profileRequest("post", "session/", {}).finally(() => pending.delete(uid)));
  }
  return pending.get(uid);
}
export const fetchProfile = () => profileRequest("get", "me/");
export const saveProfile = (revision, fields) => profileRequest("patch", "me/", { revision, fields });
export const submitProfile = (revision) => profileRequest("post", "submit/", { revision });
export const issueMinecraftCode = () => profileRequest("post", "minecraft/code/", {});
