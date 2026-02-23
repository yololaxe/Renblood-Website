// src/components/GlobalWidget.jsx
import React, { useState, useEffect } from "react";
import {
  getYearAndSeason,
  updateGlobalFields,
  advanceToNextSeason,
  retreatToPreviousSeason,
} from "../../../services/api.js";
import { FaChevronLeft, FaChevronRight, FaCircle, FaCalendarAlt, FaClock, FaEdit } from "react-icons/fa";
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
    <div className="h-full flex flex-col gap-6">
      
      {/* --- SAISON ACTUELLE --- */}
      <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-lg text-white">
            <FaCalendarAlt size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold">Date Actuelle</p>
            <p className="text-xl font-bold text-white">
              {season && year ? `${SEASON_LABELS[season]} ${year}` : "Chargement..."}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => changeSeason("prev")} className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition" title="Saison précédente">
            <FaChevronLeft />
          </button>
          <button onClick={() => changeSeason("next")} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition" title="Saison suivante">
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* --- TOGGLES --- */}
      <div className="grid grid-cols-1 gap-4 flex-1">
        
        {/* Session Active */}
        <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${oneSession ? "bg-green-900/20 border-green-500/50" : "bg-gray-700/30 border-gray-600"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${oneSession ? "bg-green-500 text-white" : "bg-gray-600 text-gray-400"}`}>
              <FaClock />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Session de Jeu</p>
              <p className="text-xs text-gray-400">{oneSession ? "En cours" : "Arrêtée"}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={oneSession} onChange={() => toggleFlag("one_session_state", oneSession, setOneSession, "Session de jeu")} />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        {/* Futures Modifs */}
        <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${futureModif ? "bg-yellow-900/20 border-yellow-500/50" : "bg-gray-700/30 border-gray-600"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${futureModif ? "bg-yellow-500 text-black" : "bg-gray-600 text-gray-400"}`}>
              <FaEdit />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Modifs Futures</p>
              <p className="text-xs text-gray-400">{futureModif ? "Autorisées" : "Bloquées"}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={futureModif} onChange={() => toggleFlag("future_modif_add_state", futureModif, setFutureModif, "Modifs Futures")} />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
        </div>

      </div>

      {/* Message de retour */}
      <AnimatePresence>
        {status && (
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg text-sm font-bold z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
