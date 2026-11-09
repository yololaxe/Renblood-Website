import { useState, useEffect } from "react";
import { getYearAndSeason } from "../services/api";
const seasons = {1:"Printemps",2:"Été",3:"Automne",4:"Hiver"};
export default function LiveSessionBanner() {
  const [session,setSession] = useState(null);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try { const data = await getYearAndSeason(); if (active) setSession(data); }
      catch { /* Keep the last known state until the next refresh. */ }
    };
    refresh();
    const interval = setInterval(refresh,60000);
    return () => {active = false; clearInterval(interval);};
  },[]);
  if (!session?.one_session_state) return null;
  return <div className="kingdom-live" role="status"><span aria-hidden="true" />Session en cours · {seasons[session.season]} {session.year}<span className="kingdom-live-address">evonia.mine.gg</span></div>;
}
