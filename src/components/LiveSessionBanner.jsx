// src/components/LiveSessionBanner.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getYearAndSeason } from "../services/api";

const SEASON_LABELS = {
  1: "Printemps",
  2: "Été",
  3: "Automne",
  4: "Hiver",
};

export default function LiveSessionBanner() {
  const [show, setShow] = useState(false);
  const [year, setYear] = useState(null);
  const [season, setSeason] = useState(null);
  const [sessionState, setSessionState] = useState(false);

  // 1) Fonction qui va récupérer l'état global, mettre à jour la saison+année
  //    et, si on est en session, déclencher le bandeau.
  const checkSession = useCallback(async () => {
    try {
      const { year, season, one_session_state } = await getYearAndSeason();
      setYear(year);
      setSeason(season);
      setSessionState(one_session_state);

      if (one_session_state) {
        setShow(true);
      }
    } catch (err) {
      console.error("Erreur getYearAndSeason", err);
    }
  }, []);

  // 2) Au montage, on appelle une première fois, puis on ré-appelle toutes les 60s
  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 60_000);
    return () => clearInterval(interval);
  }, [checkSession]);

  // 3) Si on n'a pas encore récupéré an/saison, on ne rend rien.
  if (year == null || season == null) return null;

  return (
    <AnimatePresence>
      {show && sessionState && (
        <motion.div
          className="fixed top-0 left-0 w-full pointer-events-none z-50"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 16, ease: "linear" }}
          onAnimationComplete={() => setShow(false)}
        >
          <div
            className="
              mx-auto max-w-screen-lg
              bg-gradient-to-r from-green-700 to-blue-700 bg-opacity-80
              text-white py-2 px-6 rounded-b-lg shadow-xl
              inline-flex items-center space-x-4
              font-medium tracking-wide
            "
          >
            {/* Badge « live » */}
            <span className="relative flex-shrink-0">
              <span className="absolute inline-flex h-3 w-3 bg-red-500 rounded-full animate-ping" />
              <span className="relative inline-flex h-3 w-3 bg-red-400 rounded-full" />
            </span>

            {/* Texte */}
            <span>
              EN DIRECT — Session en cours :
              <strong className="ml-1">
                {SEASON_LABELS[season]} {year}
              </strong>
              <span className="text-sm text-gray-200 ml-1">
                sur evonia.mine.gg
              </span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
