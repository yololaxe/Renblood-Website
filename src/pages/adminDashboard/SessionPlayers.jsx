// src/pages/admin/SessionPlayersFuturesPage.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getSessionById,
  getSessionPlayersWithFutures,
  getPlayerData,
} from "../../services/api";

const SEASON_LABELS = { 1: "Printemps", 2: "Été", 3: "Automne", 4: "Hiver" };
const FUTURE_LABELS = {
  exploration:     "Exploration",
  construction:    "Construction",
  caisse_royale:   "La caisse royale !",
  rejoindre_armee: "Rejoindre l’armée",
  tenir_magasin:   "Tenir le magasin",
  travailler:      "Travailler",
  espionner:       "Espionner",
  sentrainer:      "S’entraîner",
};

export default function SessionPlayersFuturesPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sess = await getSessionById(sessionId);
        setSession(sess);

        const list = await getSessionPlayersWithFutures(sessionId);
        const detailed = await Promise.all(
          list.map(async ({ player, future }) => {
            const details = await getPlayerData(player.id);
            return {
              id:         player.id,
              pseudo:     player.pseudo_minecraft || "-",
              name:       player.name,
              level:      details?.total_lvl ?? "-",
              money:      details?.money ?? 0,
              reputation: details?.reputation ?? 0,
              future,
            };
          })
        );
        setRows(detailed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Non définie";

  if (loading) return <p>Chargement…</p>;

  return (
    <motion.div
      className="p-6 bg-gray-900 rounded-lg shadow-xl space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gray-800 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-200">
        <div>
          <h2 className="text-lg font-semibold">Session</h2>
          <p>
            {SEASON_LABELS[session.season]} {session.year}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Créée le</h2>
          <p>{fmtDate(session.created_date)}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Date de session</h2>
          <p>{fmtDate(session.session_date)}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Stats</h2>
          <p>Joueurs : {session.players_count}</p>
          <p>Futures : {session.futures_count}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-gray-200 rounded-md overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Pseudo</th>
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Argent</th>
              <th className="px-4 py-2 text-left">Future</th>
              <th className="px-4 py-2 text-left">Réponse</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-2">{p.pseudo}</td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.money.toLocaleString()} B</td>
                <td className="px-4 py-2">
                  {p.future
                    ? FUTURE_LABELS[p.future.type] || p.future.type
                    : <em>–</em>}
                </td>
                <td className="px-4 py-2">{p.future?.answer || <em>–</em>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
