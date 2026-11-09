import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { FaGoogle, FaArrowRight } from "react-icons/fa";
import { auth, googleProvider } from "../data/firebaseConfig";
import { useUser } from "../context/UserContext";
import RealmHeader from "../components/RealmHeader";
import "../components/character/onboarding.css";

export default function Auth() {
  const { firebaseUser, onboarding, authStatus, authError, reloadUser } = useUser();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (authStatus === "ready" && onboarding) {
      navigate(onboarding.needs_onboarding ? "/welcome" : onboarding.player_ready ? "/character" : "/account/profile", { replace: true });
    }
  }, [authStatus, onboarding, navigate]);
  const connect = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await signInWithPopup(auth, googleProvider); }
    catch (failure) {
      const messages = {
        "auth/popup-closed-by-user": "La fenêtre a été fermée. Vous pouvez réessayer.",
        "auth/cancelled-popup-request": "Une connexion est déjà en cours.",
        "auth/popup-blocked": "Autorisez la fenêtre Google dans votre navigateur, puis réessayez.",
        "auth/network-request-failed": "La connexion a été interrompue. Vérifiez votre réseau.",
        "auth/unauthorized-domain": "La connexion Google n'est pas disponible sur cette adresse. Contactez le staff.",
      };
      setError(messages[failure.code] || "Impossible de se connecter avec Google. Réessayez dans un instant.");
    } finally { setBusy(false); lock.current = false; }
  };
  return <main className="realm-page"><RealmHeader eyebrow="Le registre / Connexion" title="Votre histoire commence ici"
    description="Connectez-vous pour retrouver votre personnage ou préparer votre arrivée dans le royaume." />
    <div className="realm-content registration-entry"><div><p className="realm-eyebrow">01 / Votre compte</p><h2>Un compte Google.<br />Une identité dans le royaume.</h2>
      <p>Votre nom de personnage est votre choix. Votre nom et votre photo Google ne sont pas publiés automatiquement.</p>
      <Link to="/histoire" className="realm-action">Découvrir le royaume <FaArrowRight /></Link></div>
      <section className="registration-signin" aria-label="Connexion à Renblood">
        {(error || authError) && <p className="registration-error" role="alert">{error || authError}</p>}
        {authStatus === "loading" ? <p role="status">Ouverture de votre dossier…</p> : firebaseUser ? <>
          <p>Votre compte Google est connecté. Nous n'avons pas encore pu ouvrir votre dossier Renblood.</p>
          <button className="realm-action" disabled={busy} onClick={async () => { setBusy(true); try { await reloadUser(); } catch {} finally { setBusy(false); } }}>Réessayer</button>
          <button className="registration-text-button" onClick={() => signOut(auth)}>Utiliser un autre compte</button>
        </> : <><button className="realm-action registration-google" disabled={busy} onClick={connect}><FaGoogle /> {busy ? "Connexion en cours…" : "Continuer avec Google"}</button>
          <p className="registration-muted">Un personnage existant sera retrouvé automatiquement. Sinon, vous pourrez créer votre fiche en trois étapes.</p></>}
        <p className="registration-muted"><Link to="/tos">Conditions d'utilisation</Link> · <Link to="/legal">Mentions légales</Link></p>
      </section></div></main>;
}
