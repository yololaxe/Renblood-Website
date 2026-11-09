export const PROFILE_FIELDS = ["name", "surname", "description", "origin", "portrait"];
export const profileFields = (profile) => Object.fromEntries(PROFILE_FIELDS.map(key => [key, profile[key] || ""]));
export const draftKey = (uid) => `renblood:character-draft:v1:${uid}`;
export function readDraft(storage, uid, profile) {
  try {
    const saved = JSON.parse(storage.getItem(draftKey(uid)) || "null");
    if (saved?.revision !== profile.revision || !saved.fields) return profileFields(profile);
    return Object.fromEntries(PROFILE_FIELDS.map(key => [key,
      typeof saved.fields[key] === "string" ? saved.fields[key] : profile[key] || ""]));
  } catch { return profileFields(profile); }
}
export const changedFields = (profile, fields) => Object.fromEntries(
  PROFILE_FIELDS.filter(key => (profile[key] || "") !== fields[key].trim()).map(key => [key, fields[key].trim()]));
export function validateIdentity(fields, settings) {
  const errors = {};
  for (const key of settings.required_fields) {
    if (!fields[key]?.trim()) errors[key] = "Ce champ est obligatoire.";
  }
  for (const [key, max] of Object.entries({ name: 60, surname: 60, description: 2000, origin: 120 })) {
    if (fields[key]?.trim().length > max) errors[key] = `Maximum ${max} caractères.`;
  }
  if (!settings.portraits.includes(fields.portrait)) errors.portrait = "Choisissez un portrait disponible.";
  return errors;
}
