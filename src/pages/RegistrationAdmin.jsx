import { useEffect, useState } from "react";
import RealmHeader from "../components/RealmHeader";
import { profileRequest } from "../services/onboardingApi";
import { eventLabel } from "./ProfileSettings";
import "../components/character/onboarding.css";

const labels = { REQUESTS: "Demandes à traiter", DRAFT: "Brouillons", PENDING: "Inscriptions en attente", ACTIVE: "Dossiers actifs", ALL: "Tous les dossiers" };
export default function RegistrationAdmin() {
  const [settings, setSettings] = useState(null);
  const [portraits, setPortraits] = useState([]);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("REQUESTS");
  const [cursor, setCursor] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reasons, setReasons] = useState({});
  const loadQueue = async (status, after = null) => {
    const result = await profileRequest("get", `admin/queue/?status=${status}${after ? `&cursor=${encodeURIComponent(after)}` : ""}`);
    setItems(old => after ? [...old, ...result.items] : result.items); setCursor(result.next_cursor);
  };
  useEffect(() => {
    let active = true;
    profileRequest("get", "admin/settings/").then(result => { if (active) { setSettings(result.settings); setPortraits(result.portrait_options); } }).catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    setBusy(true); setError("");
    profileRequest("get", `admin/queue/?status=${filter}`).then(result => { if (active) { setItems(result.items); setCursor(result.next_cursor); } })
      .catch(failure => { if (active) setError(failure.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [filter]);
  const saveSettings = async event => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { mode, starting_rank, require_minecraft, required_fields, name_policy, portraits: allowed } = settings;
    try {
      const result = await profileRequest("put", "admin/settings/", { revision: settings.revision,
        settings: { mode, starting_rank, require_minecraft, required_fields, name_policy, portraits: allowed } });
      setSettings(result.settings); setMessage("Les règles d'inscription sont enregistrées. Les rangs des joueurs existants restent inchangés.");
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const review = async (profile, action) => {
    setBusy(true); setError(""); setMessage("");
    try {
      await profileRequest("post", `admin/review/${encodeURIComponent(profile.id)}/`, { revision: profile.revision, action, reason: reasons[profile.id] || "" });
      await loadQueue(filter); setMessage("Décision enregistrée et visible dans le dossier du joueur.");
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const toggle = (key, value) => setSettings(old => ({ ...old, [key]: old[key].includes(value) ? old[key].filter(item => item !== value) : [...old[key], value] }));
  return <main className="realm-page"><RealmHeader eyebrow="Intendance / Registre des joueurs" title="Accueillir le royaume"
    description="Réglez les inscriptions et traitez les identités en attente. Les personnages existants conservent leur progression." />
    <div className="realm-content registration-admin">
      {error && <div className="registration-error" role="alert"><p>{error}</p><button className="registration-text-button" disabled={busy} onClick={async () => { setBusy(true); try { const data = await profileRequest("get", "admin/settings/"); setSettings(data.settings); setPortraits(data.portrait_options); await loadQueue(filter); setError(""); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }}>Recharger les dossiers et les réglages</button></div>}
      {message && <p className="registration-notice" role="status">{message}</p>}
      <section className="registration-admin-settings"><details><summary>Règles d'inscription</summary>{settings ? <form onSubmit={saveSettings}><fieldset disabled={busy} className="registration-form-body registration-fields">
        <label>Ouverture du registre<select value={settings.mode} onChange={event => setSettings({ ...settings, mode: event.target.value })}><option value="OPEN">Inscriptions ouvertes</option><option value="MODERATED">Validation par le staff</option><option value="CLOSED">Inscriptions suspendues</option></select></label>
        <label>Rang de départ<select value={settings.starting_rank} onChange={event => setSettings({ ...settings, starting_rank: event.target.value })}>{["Esclave", "Etranger", "Villageois", "Citoyen"].map(rank => <option key={rank}>{rank}</option>)}</select></label>
        <label>Changements de nom<select value={settings.name_policy} onChange={event => setSettings({ ...settings, name_policy: event.target.value })}><option value="REVIEW_AFTER_VALIDATION">Staff après validation de l'identité</option><option value="FREE">Modifications libres</option></select></label>
        <label className="registration-check"><input type="checkbox" checked={settings.require_minecraft} onChange={event => setSettings({ ...settings, require_minecraft: event.target.checked })} /> Exiger Minecraft avant de terminer l'inscription</label>
        <fieldset><legend>Champs obligatoires</legend><p className="registration-muted">Prénom et nom sont toujours demandés.</p>{[["origin", "Origine RP"], ["description", "Présentation"]].map(([key, label]) => <label className="registration-check" key={key}><input type="checkbox" checked={settings.required_fields.includes(key)} onChange={() => toggle("required_fields", key)} />{label}</label>)}</fieldset>
        <fieldset><legend>Portraits proposés</legend>{portraits.map(item => <label key={item.id} className="registration-check"><input type="checkbox" checked={settings.portraits.includes(item.id)} onChange={() => toggle("portraits", item.id)} />{item.label}</label>)}</fieldset>
        <button className="realm-action" type="submit">Enregistrer les règles</button>
      </fieldset></form> : <p>Chargement des règles…</p>}</details></section>
      <section><div className="registration-queue-heading"><h2>Les dossiers</h2><label>Afficher<select disabled={busy} value={filter} onChange={event => setFilter(event.target.value)}>{Object.entries(labels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label></div>
        {busy && <p role="status">Mise à jour du registre…</p>}{!busy && !items.length && <p className="registration-muted">Aucun dossier dans cette vue.</p>}
        {items.map(profile => <article className="registration-queue-item" key={profile.id}><div className="registration-queue-heading"><div><p className="realm-eyebrow">{profile.status === "PENDING" ? "Inscription à valider" : profile.status === "DRAFT" ? "Brouillon" : "Identité enregistrée"}</p><h3>{profile.name || "Prénom à renseigner"} {profile.surname}</h3></div><span>{profile.minecraft.verified ? profile.minecraft.username : "Minecraft à associer"}</span></div>
          <p className="registration-muted">{profile.origin || "Origine non renseignée"}</p><p className="registration-biography">{profile.description || "Aucune présentation."}</p>
          {profile.pending_changes && <p className="registration-notice">Nom demandé : <strong>{profile.pending_changes.name || profile.name} {profile.pending_changes.surname || profile.surname}</strong></p>}
          {profile.pending_minecraft && <p className="registration-notice">Compte Minecraft proposé : <strong>{profile.pending_minecraft.username}</strong>. L'identité a été vérifiée en jeu.</p>}
          {(profile.status === "PENDING" || profile.pending_changes || profile.pending_minecraft) && <fieldset disabled={busy} className="registration-form-body">
            <label htmlFor={`reason-${profile.id}`}>Motif de décision <small className="registration-muted">Obligatoire pour refuser ; visible par le joueur.</small></label>
            <textarea id={`reason-${profile.id}`} maxLength={500} rows="2" value={reasons[profile.id] || ""} onChange={event => setReasons(old => ({ ...old, [profile.id]: event.target.value }))} />
            <div className="registration-actions">{[[profile.status === "PENDING", "REGISTRATION", "l'inscription"], [profile.pending_changes, "NAME", "le nom"], [profile.pending_minecraft, "MINECRAFT", "le compte Minecraft"]].filter(([show]) => show).map(([, key, label]) => <div className="registration-review-pair" key={key}><button type="button" className="realm-action" onClick={() => review(profile, `APPROVE_${key}`)}>Valider {label}</button><button type="button" className="registration-text-button" onClick={() => review(profile, `REJECT_${key}`)}>Refuser {label}</button></div>)}</div>
          </fieldset>}
          <details className="registration-history"><summary>Historique du dossier</summary><ul>{profile.history.slice(-10).reverse().map((item, index) => <li key={index}>{new Date(item.at).toLocaleString("fr-FR")} — {eventLabel(item.action)}{item.details?.reason && <p>{item.details.reason}</p>}</li>)}</ul></details>
        </article>)}
        {cursor && <button className="realm-action" disabled={busy} onClick={async () => { setBusy(true); try { await loadQueue(filter, cursor); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }}>Charger la suite</button>}
      </section>
    </div></main>;
}
