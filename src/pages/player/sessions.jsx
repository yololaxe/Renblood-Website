// src/pages/SessionsPage.jsx

import React, { useState, useEffect } from "react";
import {
  getYearAndSeason,
  getAllSessions,
  getSessionById,
  getMyFuture,
  deleteFuture,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const SEASON_LABELS = { 1: "Printemps", 2: "Été", 3: "Automne", 4: "Hiver" };

// Décale (year, season) de offset saisons (+ ou –)
function shiftSeason(year, season, offset) {
  const idx = season - 1 + offset;
  const y = year + Math.floor(idx / 4);
  const s = ((idx % 4) + 4) % 4 + 1;
  return { year: y, season: s };
}

export default function SessionsPage() {
  const { userId } = useUser();
  const [global, setGlobal] = useState(null);
  const [around, setAround] = useState([]);      // 2 précédentes, actuelle, 2 suivantes
  const [selectedId, setSelectedId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [myFuture, setMyFuture] = useState(null);
  const navigate = useNavigate();

  // 1) Charger global + toutes les sessions et construire "around"
  useEffect(() => {
    (async () => {
      const g = await getYearAndSeason();
      setGlobal(g);

      const sessions = await getAllSessions();
      const combo = [];
      for (let i = -2; i <= 2; i++) {
        combo.push(shiftSeason(g.year, g.season, i));
      }
      const arr = combo.map(({ year, season }) => {
        const found = sessions.find((s) => s.year === year && s.season === season);
        return found
          ? { ...found, exists: true }
          : { year, season, exists: false };
      });
      setAround(arr);

      const current = arr.find((x) => x.exists && x.year === g.year && x.season === g.season);
      if (current) setSelectedId(current.id);
    })();
  }, []);

  // 2) À chaque changement de selectedId, récupérer le résumé et ma future
  useEffect(() => {
    if (!selectedId) {
      setSummary(null);
      setMyFuture(null);
      return;
    }
    (async () => {
      const sessionData = await getSessionById(selectedId);
      setSummary(sessionData);

      // ATTENTION : bien passer userId en second argument
      const future = await getMyFuture(selectedId, userId);
      setMyFuture(future);
    })();
  }, [selectedId, userId]);

  if (!global) return <p>Chargement…</p>;

  const canModifyFuture = global.future_modif_add_state;
  const hasFuture = Boolean(myFuture);

  const handleRemoveFuture = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer votre proposition de future ?")) {
      return;
    }
    try {
      await deleteFuture(myFuture.id);
      const sessionData = await getSessionById(selectedId);
      setSummary(sessionData);
      setMyFuture(null);
    } catch {
      alert("Impossible de supprimer la future");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Navbar secondaire */}
      <nav className="flex space-x-4 overflow-auto pb-2 border-b border-gray-600">
        {around.map((item, i) => (
          <button
            key={i}
            onClick={() => item.exists && setSelectedId(item.id)}
            disabled={!item.exists}
            className={`px-3 py-1 rounded-lg whitespace-nowrap ${
              item.exists
                ? selectedId === item.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-800 text-gray-500 cursor-default"
            }`}
          >
            {SEASON_LABELS[item.season]} {item.year}
            {!item.exists && (
              <span className="block text-xs text-gray-400">bientôt</span>
            )}
          </button>
        ))}
      </nav>

      {/* Résumé de la session */}
      {selectedId && summary ? (
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h1 className="text-2xl font-bold text-white">
            {SEASON_LABELS[summary.season]} {summary.year}
          </h1>

          <p className="text-gray-300">
            Date réelle :{" "}
            <strong>
              {summary.session_date
                ? new Date(summary.session_date).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Non définie"}
            </strong>
          </p>

          <div>
            <h2 className="text-lg text-white">Joueurs inscrits</h2>
            <ul className="list-disc list-inside text-gray-200">
              {summary.players.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg text-white">Mon statut</h2>
            <p className="text-gray-200">
              {summary.players.some((p) => p.id === userId)
                ? "Vous êtes inscrit 😉"
                : "Vous n’êtes pas inscrit"}
            </p>
          </div>

          {canModifyFuture && (
            <div>
              <h2 className="text-lg text-white">Future</h2>
              {hasFuture ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/futures/edit/${myFuture.id}`)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded text-gray-900"
                  >
                    Modifier ma future
                  </button>
                  <button
                    onClick={handleRemoveFuture}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
                  >
                    Supprimer ma future
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/futures/create?session=${selectedId}`)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
                >
                  Ajouter une future
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400">
          Sélectionnez une session pour voir son résumé.
        </p>
      )}
    </div>
  );
}
