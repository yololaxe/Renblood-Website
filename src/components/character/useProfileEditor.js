import { useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import { fetchProfile, saveProfile } from "../../services/onboardingApi";
import { changedFields, draftKey, readDraft, profileFields } from "../../services/profileDraft";

export default function useProfileEditor() {
  const { onboarding, acceptProfile } = useUser();
  const profile = onboarding.profile;
  const [fields, setFields] = useState(() => readDraft(localStorage, profile.id, profile));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    try { localStorage.setItem(draftKey(profile.id), JSON.stringify({ revision: profile.revision, fields })); } catch {}
  }, [profile.id, profile.revision, fields]);
  const report = failure => {
    setError(failure.message); setErrors(failure.fields || {});
    requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
  };
  const save = async () => {
    if (lock.current) return null;
    const changes = changedFields(profile, fields);
    if (!Object.keys(changes).length) return onboarding;
    lock.current = true; setBusy(true); setError(""); setErrors({}); setMessage("");
    try {
      const result = await saveProfile(profile.revision, changes);
      acceptProfile(result); setFields(profileFields(result.profile));
      try { localStorage.removeItem(draftKey(profile.id)); } catch {}
      setMessage(result.profile.pending_changes ? "Profil enregistré. Votre changement de nom attend la validation du staff." : "Votre dossier est enregistré.");
      return result;
    } catch (failure) { report(failure); throw failure; }
    finally { lock.current = false; setBusy(false); }
  };
  const reload = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try { const result = await fetchProfile(); acceptProfile(result); setFields(profileFields(result.profile)); setError(""); setErrors({}); }
    catch (failure) { report(failure); }
    finally { lock.current = false; setBusy(false); }
  };
  return { fields, setFields, busy, error, errors, message, setError, setErrors, report, save, reload };
}
