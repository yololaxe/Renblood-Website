import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";
import RealmHeader from "../components/RealmHeader";
import { IdentityFields, CharacterPreview } from "../components/character/ProfileFields";
import MinecraftLink from "../components/character/MinecraftLink";
import useProfileEditor from "../components/character/useProfileEditor";
import { submitProfile } from "../services/onboardingApi";
import { draftKey, validateIdentity } from "../services/profileDraft";
import "../components/character/onboarding.css";

export function ProfileGate({ children }) {
  const { firebaseUser, onboarding, authStatus } = useUser();
  if (authStatus === "loading") return <p className="realm-content registration-loading" role="status">Ouverture de votre dossier…</p>;
  if (!firebaseUser || !onboarding || authStatus === "error") return <Navigate to="/auth" replace />;
  return children;
}
function Registration() {
  const { onboarding, acceptProfile } = useUser();
  const editor = useProfileEditor();
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const actionLock = useRef(false);
  const heading = useRef(null);
  const navigate = useNavigate();
  const { profile, settings } = onboarding;
  const busy = editor.busy || sending;
  useEffect(() => { heading.current?.focus(); }, [step]);
  if (profile.status !== "DRAFT") return <Navigate to="/account/profile" replace />;
  const advance = async () => {
    if (actionLock.current) return;
    if (step === 1) {
      const errors = validateIdentity(editor.fields, settings);
      if (Object.keys(errors).length) { editor.report({ message: "Vérifiez votre identité avant de continuer.", fields: errors }); return; }
    }
    actionLock.current = true;
    try { const result = await editor.save(); if (result) setStep(value => Math.min(3, value + 1)); }
    catch {} finally { actionLock.current = false; }
  };
  const finish = async event => {
    event.preventDefault();
    if (step !== 3) { await advance(); return; }
    if (actionLock.current) return;
    actionLock.current = true; setSending(true);
    try {
      const saved = await editor.save();
      if (!saved) return;
      const result = await submitProfile(saved.profile.revision);
      acceptProfile(result);
      try { localStorage.removeItem(draftKey(profile.id)); } catch {}
      navigate(result.player_ready ? "/character" : "/account/profile", { replace: true });
    } catch (failure) { editor.report(failure); }
    finally { actionLock.current = false; setSending(false); }
  };
  return <main className="realm-page"><RealmHeader eyebrow="Le registre / Première arrivée" title="Donnez vie à votre personnage"
    description="Une identité à vous. Quelques détails aujourd'hui, une histoire à construire en jeu." />
    <div className="realm-content registration-layout"><section className="registration-workspace">
      <ol className="registration-steps" aria-label="Étapes de création">{["Identité RP", "Minecraft", "Récapitulatif"].map((label, index) =>
        <li key={label} aria-current={step === index + 1 ? "step" : undefined}><button type="button" disabled={busy || index + 1 > step} onClick={() => setStep(index + 1)}><span>0{index + 1}</span>{label}</button></li>)}</ol>
      <form onSubmit={finish} noValidate><h2 ref={heading} tabIndex="-1" className="registration-step-title">{["Qui entre dans le royaume ?", "Votre présence en jeu", "Le début de votre histoire"][step - 1]}</h2>
        {settings.mode === "CLOSED" && <p className="registration-notice">Les inscriptions sont suspendues. Vous pouvez préparer et enregistrer votre brouillon.</p>}
        {editor.error && <div className="registration-error" role="alert"><p>{editor.error}</p><button type="button" className="registration-text-button" disabled={busy} onClick={editor.reload}>Recharger la version enregistrée</button></div>}
        <fieldset disabled={busy} className="registration-form-body"><motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}>
          {step === 1 && <IdentityFields fields={editor.fields} setFields={editor.setFields} errors={editor.errors} settings={settings} portraitOptions={onboarding.portrait_options} />}
          {step === 2 && <MinecraftLink />}
          {step === 3 && <div className="registration-summary"><p>Votre fiche pourra être complétée depuis « Mon profil ». Les changements de nom seront {settings.name_policy === "FREE" ? "libres" : "soumis au staff après validation"}.</p>
            <dl><div><dt>Identité</dt><dd>{editor.fields.name} {editor.fields.surname}</dd></div><div><dt>Minecraft</dt><dd>{profile.minecraft.verified ? profile.minecraft.username : "Association à terminer plus tard"}</dd></div>
              <div><dt>Accueil</dt><dd>{settings.mode === "MODERATED" ? "Votre dossier sera présenté au staff" : "Votre inscription sera enregistrée immédiatement"}</dd></div></dl>
            <p className="registration-muted">Le rang, les métiers, les talents et les ressources sont attribués selon les règles du royaume.</p>
            {settings.require_minecraft && !profile.minecraft.verified && <p className="registration-notice">L'association Minecraft est requise. Revenez à l'étape 2 pour la terminer.</p>}
          </div>}
        </motion.div></fieldset>
        <div className="registration-actions">{step > 1 && <button type="button" className="registration-text-button" disabled={busy} onClick={() => setStep(value => value - 1)}>Retour</button>}
          <button className="realm-action" type="submit" disabled={busy || (step === 3 && (settings.mode === "CLOSED" || (settings.require_minecraft && !profile.minecraft.verified)))}>{busy ? "Enregistrement…" : step === 3 ? "Confirmer mon personnage" : "Enregistrer et continuer"}</button></div>
        <p className="registration-muted" aria-live="polite">{editor.message || "Votre saisie est conservée sur cet appareil ; chaque étape validée est enregistrée dans votre dossier."}</p>
      </form><Link className="registration-text-button" to="/home">Revenir au site et terminer plus tard</Link>
    </section><CharacterPreview fields={editor.fields} minecraft={profile.minecraft} rank={settings.starting_rank} rankLabel="Rang de départ" /></div></main>;
}
export default function Onboarding() { return <ProfileGate><Registration /></ProfileGate>; }
