// src/components/SessionManagerWidget.jsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import {
  getYearAndSeason,
  getCurrentSession,
  createSession,
  addPlayerToSession,
  removePlayerFromSession,
  updateSessionDate,
  getPlayers,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import Tooltip from "../../components/tooltip";

registerLocale("fr", fr);

const SEASON_LABELS = {
  1: "Printemps",
  2: "Été",
  3: "Automne",
  4: "Hiver",
};

export default function SessionManagerWidget() {
  const [loading, setLoading] = useState(true);
  const [global, setGlobal] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [dateValue, setDateValue] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const g = await getYearAndSeason();
      setGlobal(g);
      const s = await getCurrentSession();
      setSession(s);
    } catch (e) {
      console.error(e);
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (session?.session_date) {
      setDateValue(new Date(session.session_date));
    } else {
      setDateValue(null);
    }
  }, [session]);

  const handleRefresh = () => loadData();

  const handleCreate = async () => {
    if (!global) return;
    if (
      !window.confirm(
        `Créer la session ${SEASON_LABELS[global.season]} ${global.year} ?`
      )
    )
      return;
    try {
      const s = await createSession({
        year: global.year,
        season: global.season,
      });
      setSession(s);
    } catch {
      alert("Échec de la création");
    }
  };

  const openAddModal = async () => {
    try {
      const list = await getPlayers("Admin");
      setAllPlayers(list || []);
      setShowAddModal(true);
    } catch {
      alert("Impossible de charger la liste des joueurs");
    }
  };

  const handleAddPlayer = async (playerId) => {
    try {
      const updated = await addPlayerToSession(session.id, playerId);
      setSession(updated);
      setShowAddModal(false);
    } catch {
      alert("Impossible d’ajouter ce joueur");
    }
  };

  const openRemoveModal = () => setShowRemoveModal(true);

  const handleRemovePlayer = async (playerId) => {
    try {
      const updated = await removePlayerFromSession(session.id, playerId);
      setSession(updated);
      setShowRemoveModal(false);
    } catch {
      alert("Impossible de retirer ce joueur");
    }
  };

  const handleSaveDate = async () => {
    if (!dateValue) return;
    try {
      const updated = await updateSessionDate(
        session.id,
        dateValue.toISOString()
      );
      setSession(updated);
      setShowDateEdit(false);
    } catch {
      alert("Impossible de mettre à jour la date");
    }
  };

  const formatDateFR = (iso) => {
    const dt = new Date(iso);
    const date = dt.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const time = dt.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} à ${time}`;
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <motion.div
      className="relative bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={handleRefresh}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        aria-label="Rafraîchir"
      >
        🔄
      </button>

      <h2 className="text-2xl font-bold text-white">🕹️ Gestion de session</h2>

      {session ? (
        <div className="space-y-2">
          <p className="text-gray-300 flex items-center">
            Session active :{" "}
            <span className="ml-1 text-green-300">
              {SEASON_LABELS[session.season]} {session.year}
            </span>
          </p>

          <p className="flex items-center">
            Date de session :
            {showDateEdit ? (
              <div className="ml-2 flex items-center space-x-2">
                <DatePicker
                  selected={dateValue}
                  onChange={(date) => setDateValue(date)}
                  showTimeSelect
                  locale="fr"
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy 'à' HH:mm"
                  className="p-2 rounded bg-gray-700 text-white"
                />
                <button
                  onClick={handleSaveDate}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white"
                >
                  💾
                </button>
                <button
                  onClick={() => setShowDateEdit(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ✖️
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center space-x-2">
                <strong>
                  {session.session_date
                    ? formatDateFR(session.session_date)
                    : "Non défini"}
                </strong>
                <button
                  onClick={() => setShowDateEdit(true)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Modifier la date"
                >
                  ✏️
                </button>
              </div>
            )}
          </p>

          <p className="flex items-center">
            Créée le :{" "}
            <strong className="ml-2">
              {formatDateFR(session.created_date)}
            </strong>
          </p>

          <p className="flex items-center">
            Joueurs inscrits :{" "}
            <Tooltip
              text={
                session.players?.length > 0
                  ? session.players.map((p) => p.pseudo_minecraft || p.name).join(", ")
                  : "Aucun joueur"
              }
            >
              <strong className="ml-2 cursor-help text-blue-400 hover:text-blue-300">
                {session.players_count}
              </strong>
            </Tooltip>
          </p>

          <p className="flex items-center">
            Futures liées :{" "}
            <Tooltip
              text={
                session.futures_players?.length > 0
                  ? session.futures_players.join(", ")
                  : "Aucune future"
              }
            >
              <strong className="ml-2 cursor-help text-blue-400 hover:text-blue-300">
                {session.futures_count}
              </strong>
            </Tooltip>
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/admin/sessions/${session.id}`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
            >
              Voir le récap
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded text-gray-900"
            >
              Ajouter un joueur
            </button>
            <button
              onClick={openRemoveModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
            >
              Retirer un joueur
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-400">
            Aucune session pour{" "}
            <strong>
              {SEASON_LABELS[global.season]} {global.year}
            </strong>
          </p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
          >
            Créer la session
          </button>
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-gray-800 text-white p-6 rounded-lg max-h-[80vh] overflow-auto w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl mb-4">Sélectionner un joueur</h3>
            <ul className="space-y-2">
              {allPlayers.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center hover:bg-gray-700 px-4 py-2 rounded cursor-pointer"
                >
                  <span>{p.pseudo_minecraft || p.name}</span>
                  <button
                    className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-white"
                    onClick={() => handleAddPlayer(p.id)}
                  >
                    ＋
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 text-sm text-gray-400 underline"
              onClick={() => setShowAddModal(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {showRemoveModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRemoveModal(false)}
        >
          <div
            className="bg-gray-800 text-white p-6 rounded-lg max-h-[80vh] overflow-auto w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl mb-4">Retirer un joueur</h3>
            <ul className="space-y-2">
              {session.players.length > 0 ? (
                session.players.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center hover:bg-gray-700 px-4 py-2 rounded"
                  >
                    <span>{p.pseudo_minecraft || p.name}</span>
                    <button
                      className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white"
                      onClick={() => handleRemovePlayer(p.id)}
                    >
                      －
                    </button>
                  </li>
                ))
              ) : (
                <p>Aucun joueur à retirer.</p>
              )}
            </ul>
            <button
              className="mt-4 text-sm text-gray-400 underline"
              onClick={() => setShowRemoveModal(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
