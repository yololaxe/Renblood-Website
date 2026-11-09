import { useEffect, useState } from "react";
import { getYearAndSeason } from "../services/api";

const seasons = { 1: "Printemps", 2: "Été", 3: "Automne", 4: "Hiver" };

export default function LiveSessionBanner({ onAvailabilityChange, paused = false }) {
  const [session, setSession] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const live = Boolean(session?.one_session_state);
  const available = live && !dismissed;

  useEffect(() => {
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const data = await getYearAndSeason();
        if (active && data) setSession(data);
      } catch { /* Keep the last known session during a temporary outage. */ }
      finally { pending = false; }
    };
    const onVisible = () => { if (!document.hidden) refresh(); };
    refresh();
    const interval = window.setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => { if (!live) setDismissed(false); }, [live]);
  useEffect(() => { onAvailabilityChange?.(available); }, [available, onAvailabilityChange]);

  if (!available) return null;
  const date = `${seasons[session.season] || ""} · An ${session.year}`;
  return <div className={`kingdom-live${paused ? " is-paused" : ""}`}>
    <span className="kingdom-live-status" role="status">Session en cours · {date}. Serveur : evonia.mine.gg.</span>
    <div className="kingdom-live-strip">
      <div className="kingdom-live-content">
        <span className="kingdom-live-kicker" aria-hidden="true">En ce moment</span>
        <p aria-hidden="true"><strong>Session en cours</strong><span className="kingdom-live-date">{date}</span></p>
        <span className="kingdom-live-address" aria-hidden="true">evonia.mine.gg <span>↗</span></span>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Masquer l’annonce de session">×</button>
      </div>
    </div>
  </div>;
}
