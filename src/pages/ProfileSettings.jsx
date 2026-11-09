import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { IdentityFields, CharacterPreview } from "../components/character/ProfileFields";
import MinecraftLink from "../components/character/MinecraftLink";
import useProfileEditor from "../components/character/useProfileEditor";
import { ProfileGate } from "./Onboarding";
import { profileRequest } from "../services/onboardingApi";
import "../components/character/onboarding.css";

function Settings() {
  const { onboarding, reloadUser, acceptProfile } = useUser();
  const { profile, settings } = onboarding;
  const editor = useProfileEditor();
  const [cancelling, setCancelling] = useState(false);
  const cancelRequest = async type => {
    setCancelling(true);
    try { acceptProfile(await profileRequest("post", "requests/cancel/", { revision: profile.revision, type })); }
    catch (failure) { editor.report(failure); }
    finally { setCancelling(false); }
  };
  return <main className="realm-page registration-profile-page">
    <header className="realm-content registration-profile-toolbar"><h1>Mon profil</h1>
      {onboarding.player_ready && <Link className="registration-text-button" to="/character">Voir ma fiche en jeu ↗</Link>}
    </header><div className="realm-content registration-layout"><div className="registration-workspace">
    {profile.status === "DRAFT" && <p className="registration-notice">Votre dossier est encore en brouillon. <Link to="/welcome">Terminer mon inscription</Link></p>}
    {profile.status === "PENDING" && <p className="registration-notice" role="status">Votre inscription attend la validation du staff. Vous pouvez encore compléter votre présentation.</p>}
    {profile.status === "ACTIVE" && !profile.minecraft.verified && <p className="registration-notice">Votre identité RP est enregistrée. Associez Minecraft ci-dessous pour activer votre personnage en jeu.</p>}
    {onboarding.missing_fields?.length > 0 && profile.status !== "DRAFT" && <p className="registration-notice">Votre dossier peut être complété : certains champs demandés par le registre sont encore vides. Votre personnage et votre progression restent disponibles.</p>}
    {profile.pending_changes && <div className="registration-notice" role="status"><p>Changement de nom demandé : <strong>{profile.pending_changes.name || profile.name} {profile.pending_changes.surname || profile.surname}</strong>. Votre nom actuel reste affiché jusqu'à validation.</p><button className="registration-text-button" disabled={cancelling || editor.busy} onClick={() => cancelRequest("NAME")}>Annuler ma demande de nom</button></div>}
    {profile.pending_minecraft && <button className="registration-text-button" disabled={cancelling || editor.busy} onClick={() => cancelRequest("MINECRAFT")}>Annuler ma demande de remplacement Minecraft</button>}
    {onboarding.player_ready && !profile.legacy && !onboarding.bank_ready && <p className="registration-notice" role="status">Votre personnage est prêt ; la préparation de sa banque reste à terminer. <button className="registration-text-button" onClick={async () => { try { await reloadUser(); } catch (failure) { editor.report(failure); } }}>Réessayer la préparation</button></p>}
    <form onSubmit={async event => { event.preventDefault(); try { await editor.save(); } catch {} }} noValidate>
      <h2>Identité & présentation</h2><p className="registration-muted">{settings.name_policy === "FREE" || profile.status !== "ACTIVE" ? "Vous pouvez modifier les informations ci-dessous." : "La présentation, l'origine et le portrait sont modifiables librement. Le staff valide les changements de nom."}</p>
      {editor.error && <div className="registration-error" role="alert"><p>{editor.error}</p><button type="button" className="registration-text-button" disabled={editor.busy} onClick={editor.reload}>Recharger la version enregistrée</button></div>}
      <fieldset disabled={editor.busy} className="registration-form-body"><IdentityFields fields={editor.fields} setFields={editor.setFields} errors={editor.errors} settings={settings} portraitOptions={onboarding.portrait_options} /></fieldset>
      <div className="registration-actions"><button className="realm-action" disabled={editor.busy}>{editor.busy ? "Enregistrement…" : "Enregistrer mes modifications"}</button></div>
      <p role="status" className="registration-muted">{editor.message}</p>
    </form><MinecraftLink />
    <section className="registration-account-section"><h2>Discord & compte</h2><p>La connexion Google sert à retrouver ce dossier. Elle ne change pas votre identité RP.</p>
      {onboarding.player_ready ? <Link to="/character#discord" className="realm-action">Gérer mon association Discord</Link> : <p className="registration-muted">L'association Discord sera disponible sur votre fiche après activation du personnage.</p>}
    </section>
    <details className="registration-history"><summary>Derniers événements de mon dossier</summary><ul>{profile.history.slice(-8).reverse().map((item, index) => <li key={`${item.at}-${index}`}><time>{new Date(item.at).toLocaleString("fr-FR")}</time> — {eventLabel(item.action)}{item.details?.reason && <p>{item.details.reason}</p>}</li>)}</ul></details>
  </div><CharacterPreview fields={editor.fields} minecraft={profile.minecraft} rank={onboarding.rank || profile.starting_rank} rankLabel={onboarding.rank ? "Rang actuel" : "Rang de départ"} /></div></main>;
}
export function eventLabel(action) {
  return ({ PROFILE_EDITED: "Dossier modifié", REGISTRATION_SUBMITTED: "Inscription envoyée", MINECRAFT_VERIFIED: "Minecraft associé",
    MINECRAFT_CHANGE_REQUESTED: "Remplacement de compte demandé", APPROVE_REGISTRATION: "Inscription validée", REJECT_REGISTRATION: "Inscription à compléter",
    APPROVE_NAME: "Nouveau nom validé", REJECT_NAME: "Changement de nom refusé", APPROVE_MINECRAFT: "Compte Minecraft remplacé", REJECT_MINECRAFT: "Remplacement refusé",
    NAME_CHANGE_CANCELLED: "Demande de nom annulée", MINECRAFT_CHANGE_CANCELLED: "Remplacement Minecraft annulé" })[action] || "Dossier mis à jour";
}
export default function ProfileSettings() { return <ProfileGate><Settings /></ProfileGate>; }
