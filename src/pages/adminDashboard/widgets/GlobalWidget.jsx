// src/components/GlobalWidget.jsx
import React, { useState, useEffect } from "react";
import {
  getYearAndSeason,
  updateGlobalFields,
  advanceToNextSeason,
  retreatToPreviousSeason,
} from "../../../services/api.js";
import { FaChevronLeft, FaChevronRight, FaCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SEASON_LABELS = {
  1: "Printemps",
  2: "Été",
  3: "Automne",
  4: "Hiver",
};

export default function GlobalWidget() {
  const [year, setYear] = useState(null);
  const [season, setSeason] = useState(null);
  const [oneSession, setOneSession] = useState(false);
  const [futureModif, setFutureModif] = useState(false);
  const [status, setStatus] = useState("");

  // charge au montage
  useEffect(() => {
    (async () => {
      try {
        const g = await getYearAndSeason();
        setYear(g.year);
        setSeason(g.season);
        setOneSession(!!g.one_session_state);
        setFutureModif(!!g.future_modif_add_state);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const flash = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 3000);
  };

  const toggleFlag = async (field, current, setter, label) => {
    const next = !current;
    if (!window.confirm(`Confirmez ${next ? "l’activation" : "la désactivation"} de “${label}” ?`))
      return;
    try {
      await updateGlobalFields({ [field]: next });
      setter(next);
      flash(`✅ “${label}” ${next ? "activé" : "désactivé"}`);
    } catch {
      alert("❌ Échec de la mise à jour");
    }
  };

  const changeSeason = async (dir) => {
    const label = dir === "next" ? "saison suivante" : "saison précédente";
    if (!window.confirm(`Passer à la ${label} ?`)) return;
    try {
      const g = dir === "next"
        ? await advanceToNextSeason()
        : await retreatToPreviousSeason();
      setYear(g.year);
      setSeason(g.season);
      flash(`✅ ${SEASON_LABELS[g.season]} ${g.year}`);
    } catch {
      alert("❌ Impossible de changer la saison");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* En-tête */}
      <div className="flex items-center space-x-2 mb-4">
        <FaCircle className={`text-sm ${oneSession ? "text-green-400 animate-pulse" : "text-gray-600"}`} />
        <h3 className="text-lg font-semibold text-white">Configuration Globale</h3>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {/* Toggles en grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Session de jeu */}
          <div className="bg-gray-700 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <p className="font-medium text-white">Session de jeu active</p>
              <p className="text-gray-400 text-sm mt-1">
                Indique si une session de jeu est en cours.
              </p>
            </div>
            <label className="self-end mt-4 inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={oneSession}
                onChange={() =>
                  toggleFlag(
                    "one_session_state",
                    oneSession,
                    setOneSession,
                    "Session de jeu active"
                  )
                }
              />
              <span className="w-10 h-5 bg-gray-600 rounded-full relative transition-colors peer-checked:bg-green-400">
                <span
                  className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                    oneSession ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
            </label>
          </div>

          {/* Future modifs */}
          <div className="bg-gray-700 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <p className="font-medium text-white">Autoriser modifs futurs</p>
              <p className="text-gray-400 text-sm mt-1">
                Permet aux joueurs de proposer ou modifier des futurs.
              </p>
            </div>
            <label className="self-end mt-4 inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={futureModif}
                onChange={() =>
                  toggleFlag(
                    "future_modif_add_state",
                    futureModif,
                    setFutureModif,
                    "Autoriser modifs futurs"
                  )
                }
              />
              <span className="w-10 h-5 bg-gray-600 rounded-full relative transition-colors peer-checked:bg-green-400">
                <span
                  className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                    futureModif ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Pied de card : saison */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-white font-medium">
          Saison :{" "}
          <span className="text-green-300">
            {season && year ? `${SEASON_LABELS[season]} ${year}` : "…"}
          </span>
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => changeSeason("prev")}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition"
          >
            <FaChevronLeft /> <span>Précédent</span>
          </button>
          <button
            onClick={() => changeSeason("next")}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition"
          >
            <span>Suivant</span> <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Message de retour */}
      <AnimatePresence>
        {status && (
          <motion.div
            className="mt-3 p-2 bg-green-700 text-white rounded text-center text-sm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
