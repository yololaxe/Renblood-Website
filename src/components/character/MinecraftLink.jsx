import { useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import { fetchProfile, issueMinecraftCode } from "../../services/onboardingApi";

export default function MinecraftLink() {
  const { onboarding, acceptProfile } = useUser();
  const { minecraft, pending_minecraft: pending } = onboarding.profile;
  const [code, setCode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (!code) return;
    let stopped = false, running = false;
    const poll = async () => {
      if (stopped || running || document.hidden) return;
      if (Date.now() >= code.expires_at * 1000) { setCode(null); setError("Ce code a expiré. Vous pouvez en demander un nouveau."); return; }
      running = true;
      try {
        const result = await fetchProfile();
        if (stopped) return;
        acceptProfile(result);
        const identity = result.profile.pending_minecraft || result.profile.minecraft;
        if (Date.parse(identity?.verified_at || "") >= (code.expires_at - 600) * 1000) setCode(null);
        setError("");
      } catch (failure) { if (!stopped) setError(failure.message); }
      finally { running = false; }
    };
    const timer = setInterval(poll, 5000);
    document.addEventListener("visibilitychange", poll);
    return () => { stopped = true; clearInterval(timer); document.removeEventListener("visibilitychange", poll); };
  }, [code, acceptProfile]);
  const generate = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setCopied(false);
    try { setCode(await issueMinecraftCode()); }
    catch (failure) { setError(failure.message); }
    finally { lock.current = false; setBusy(false); }
  };
  return <section className="registration-minecraft" aria-labelledby="minecraft-heading">
    <p className="realm-eyebrow">Votre compte en jeu</p><h2 id="minecraft-heading">{minecraft.verified ? minecraft.username : "Associer Minecraft"}</h2>
    <p>{minecraft.verified ? "Votre identité en jeu est associée à ce personnage. Sa progression reste attachée à votre dossier Renblood." :
      "Depuis votre session Minecraft, une commande permet de confirmer que ce compte est bien le vôtre. Aucun UUID à chercher ou à saisir."}</p>
    {pending && <p className="registration-notice" role="status">Le remplacement par <strong>{pending.username}</strong> attend le staff. Votre compte actuel reste associé.</p>}
    {code ? <div className="registration-link-code"><p>Dans Minecraft, exécutez cette commande :</p><code>{code.command}</code>
      <button type="button" className="registration-text-button" onClick={async () => { try { await navigator.clipboard.writeText(code.command); setCopied(true); } catch { setError("Sélectionnez la commande ci-dessus pour la copier."); } }}>{copied ? "Commande copiée" : "Copier la commande"}</button>
      <p className="registration-muted" role="status">En attente de confirmation en jeu · valable jusqu'à {new Date(code.expires_at * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.</p>
    </div> : <button type="button" className="realm-action" onClick={generate} disabled={busy || Boolean(pending)}>
      {busy ? "Préparation…" : minecraft.verified ? "Vérifier un autre compte Minecraft" : "Obtenir ma commande de liaison"}</button>}
    {minecraft.verified && !pending && <p className="registration-muted">Un remplacement de compte sera soumis au staff. Vos statistiques et votre solde ne sont pas réinitialisés.</p>}
    {!minecraft.verified && <details><summary>Je ne suis pas encore en jeu</summary><p>{onboarding.settings.require_minecraft ? "L'association est requise avant de terminer. Votre brouillon reste disponible." : "Vous pouvez continuer et associer Minecraft depuis votre profil plus tard. Les fonctions liées au jeu seront accessibles après cette étape."}</p></details>}
    {error && <p className="registration-error" role="alert">{error}</p>}
  </section>;
}
