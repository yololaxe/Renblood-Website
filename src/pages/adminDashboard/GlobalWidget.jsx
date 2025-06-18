// src/components/GlobalWidget.jsx
import React, { useState, useEffect } from "react";
import {
  getYearAndSeason,
  updateGlobalFields,
  advanceToNextSeason,
  retreatToPreviousSeason,
} from "../../services/api";

const SEASON_LABELS = {
  1: "Printemps",
  2: "Été",
  3: "Automne",
  4: "Hiver",
};

export default function GlobalWidget() {
  const [globalId, setGlobalId] = useState(null);
  const [year, setYear] = useState(null);
  const [season, setSeason] = useState(null);
  const [oneSessionState, setOneSessionState] = useState(false);
  const [futureModifAddState, setFutureModifAddState] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function fetchGlobal() {
      try {
        const g = await getYearAndSeason();
        setGlobalId(g.id);
        setYear(g.year);
        setSeason(g.season);
        setOneSessionState(!!g.one_session_state);
        setFutureModifAddState(!!g.future_modif_add_state);
      } catch (e) {
        console.error("Impossible de charger l’état global", e);
      }
    }
    fetchGlobal();
  }, []);

  const flash = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleToggle = async (field, currentValue, setter, label) => {
    const next = !currentValue;
    if (
      !window.confirm(
        `Êtes-vous sûr·e de ${next ? "activer" : "désactiver"} « ${label} » ?`
      )
    )
      return;
    try {
      await updateGlobalFields(globalId, { [field]: next });
      setter(next);
      flash(`✅ « ${label} » mis à ${next ? "ON" : "OFF"}.`);
    } catch (e) {
      console.error(e);
      alert("❌ Échec de la mise à jour.");
    }
  };

  const handleSeason = async (direction) => {
    const label = direction === "next" ? "saison suivante" : "saison précédente";
    if (!window.confirm(`Confirmer le passage à la ${label} ?`)) return;
    try {
      const g =
        direction === "next"
          ? await advanceToNextSeason()
          : await retreatToPreviousSeason();
      setYear(g.year);
      setSeason(g.season);
      flash(`✅ ${SEASON_LABELS[g.season]} ${g.year}.`);
    } catch (e) {
      console.error(e);
      alert("❌ Échec du changement de saison.");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-white">⚙️ Configuration Globale</h2>

      {/* Toggles */}
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Session de jeu active</p>
            <p className="text-gray-400 text-sm">
              OneSessionState : session de jeu en cours.
            </p>
          </div>
          <input
            type="checkbox"
            checked={Boolean(oneSessionState)}
            onChange={() =>
              handleToggle(
                "one_session_state",
                oneSessionState,
                setOneSessionState,
                "Session de jeu active"
              )
            }
            className="h-6 w-6 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">
              Autoriser modifs / ajouts futurs
            </p>
            <p className="text-gray-400 text-sm">
              FutureModifAddState : permet aux joueurs de proposer/modifier.
            </p>
          </div>
          <input
            type="checkbox"
            checked={Boolean(futureModifAddState)}
            onChange={() =>
              handleToggle(
                "future_modif_add_state",
                futureModifAddState,
                setFutureModifAddState,
                "Autoriser modifs futurs"
              )
            }
            className="h-6 w-6 cursor-pointer"
          />
        </label>
      </div>

      <hr className="border-gray-700" />

      {/* Contrôle de la saison */}
      <div className="space-y-2">
        <p className="text-white font-semibold">
          Saison courante :
          <span className="ml-2 text-green-300">
            {SEASON_LABELS[season]} {year}
          </span>
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleSeason("prev")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition"
          >
            ← Précédent
          </button>
          <button
            onClick={() => handleSeason("next")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition"
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* Message de statut */}
      {statusMsg && (
        <div className="mt-4 p-2 bg-green-700 text-white rounded">{statusMsg}</div>
      )}
    </div>
  );
}
