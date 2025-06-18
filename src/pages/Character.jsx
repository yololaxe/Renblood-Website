// src/pages/Character.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listenToAuthChanges } from "../data/firebaseConfig";
import {
  getPlayerFullProfile,
  initializeStatsBonus,
} from "../services/api";
import { MoneyDisplay } from "../components/MoneyDisplay";
import ToolTip from "../components/Tooltip";
import { FaSync } from "react-icons/fa";

const CHARACTERISTICS = [
  { key: "life", icon: "❤️", label: "Vie" },
  { key: "strength", icon: "💪", label: "Force" },
  { key: "speed", icon: "⚡", label: "Vitesse" },
  { key: "reach", icon: "🎯", label: "Portée" },
  { key: "resistance", icon: "🛡️", label: "Résistance" },
  { key: "regeneration", icon: "💖", label: "Régénération" },
  { key: "haste", icon: "⛏️", label: "Célérité" },
  { key: "place", icon: "📦", label: "Inventaire" },
  { key: "mana", icon: "🔮", label: "Mana" },
  { key: "dodge", icon: "🏃", label: "Esquive" },
  { key: "discretion", icon: "🕵️", label: "Discrétion" },
  { key: "charisma", icon: "😎", label: "Charisme" },
  { key: "rethoric", icon: "📢", label: "Rhétorique" },
  { key: "negotiation", icon: "🤝", label: "Négociation" },
  { key: "influence", icon: "👑", label: "Influence" },
  { key: "skill", icon: "🎓", label: "Compétence" },
];

const formatTypeLabel = (raw) =>
  raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function Character() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = listenToAuthChanges(async (user) => {
      if (!user) return navigate("/auth");
      setUserId(user.uid);

      const cache = sessionStorage.getItem("mcFullProfile");
      if (cache) {
        setPlayer(JSON.parse(cache));
        setLoading(false);
        return;
      }
      try {
        const data = await getPlayerFullProfile(user.uid);
        sessionStorage.setItem("mcFullProfile", JSON.stringify(data));
        setPlayer(data);
      } catch {
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub && unsub();
  }, [navigate]);

  const handleReloadStats = async () => {
    if (!userId) return;
    setLoading(true);

    // 1) mettre à jour les bonus
    await initializeStatsBonus(userId);

    // 2) recharger tout le profil (xp métiers inclus)
    try {
      const full = await getPlayerFullProfile(userId);
      sessionStorage.setItem("mcFullProfile", JSON.stringify(full));
      setPlayer(full);
    } catch (e) {
      console.error("Erreur rechargement profil:", e);
      setError("Erreur lors du rafraîchissement complet.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-32 h-32 bg-gray-800 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center mt-10">{error}</p>;
  }

  const {
    pseudo_minecraft,
    rank,
    description,
    name,
    surname,
    money,
    divin,
    traits = [],
    actions = [],
    real_charact = {},
    experiences = {},
  } = player;

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-8">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            {pseudo_minecraft}
          </h1>
          <p className="text-gray-300 mt-2 italic">{description}</p>
        </header>

        {/* Main card */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Identity & resources */}
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              👤 {name} {surname}
              <span className="text-base sm:text-lg text-gray-300 font-medium">
                ({rank})
              </span>
            </h2>
            <div className="flex flex-wrap gap-6 text-white text-base sm:text-lg">
              <div className="flex items-center gap-1">
                <span>💰</span>
                <MoneyDisplay value={money} />
              </div>
              <div className="flex items-center gap-1">
                <span>🔮</span>
                <span>{divin}</span>
              </div>
            </div>
          </div>

          {/* Stats + bouton de recharge */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                📊 Statistiques
              </h3>
              <button
                onClick={handleReloadStats}
                className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition"
              >
                <FaSync className="animate-spin-slow duration-500" />
                Recharger
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CHARACTERISTICS.map(({ key, icon, label }) => {
                const base = player[key] || 0;
                const bonuses = Array.isArray(real_charact[key])
                  ? real_charact[key]
                  : real_charact[key]
                  ? [real_charact[key]]
                  : [];
                const totalBonus = bonuses.reduce(
                  (sum, b) => sum + b.count,
                  0
                );
                const total = base + totalBonus;

                return (
                  <div
                    key={key}
                    className="bg-gray-700 rounded-xl p-4 flex flex-col items-center text-center gap-y-2 hover:bg-gray-600 transition"
                  >
                    <span className="text-2xl sm:text-3xl">{icon}</span>
                    <p className="text-white font-semibold">{label}</p>
                    <p className="text-white text-lg flex items-center gap-2 justify-center">
                      {total}
                      {bonuses.length > 0 && (
                        <ToolTip
                          text={
                            `Base: ${base}` +
                            bonuses
                              .map((b) => {
                                const rawType = b.type
                                  ? b.type.replace(/^talent_tree_/, "")
                                  : "Inconnu";
                                const typeLabel = formatTypeLabel(rawType);
                                return `, +${b.count} (${typeLabel})`;
                              })
                              .join("")
                          }
                        >
                          <span className="text-sm text-green-300">
                            {bonuses.map((b) => `+${b.count}`).join(" ")}
                          </span>
                        </ToolTip>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Expériences */}
          <section>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              📜 Expériences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(experiences.jobs || {}).map(
                ([jobKey, job]) => (
                  <div
                    key={jobKey}
                    className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition"
                  >
                    <p className="text-white font-bold">
                      {jobKey
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-gray-300">
                      Niveau : {job.level}
                    </p>
                    <p className="text-gray-300">
                      XP : {job.xp === -1 ? "🔒" : job.xp}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Traits & Actions */}
          <section>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              🧬 Traits & Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {traits.map((t) => (
                <span
                  key={t.id}
                  className="bg-green-500 px-3 py-1 rounded-full text-white hover:bg-green-600 transition"
                >
                  {t.Name}
                </span>
              ))}
              {actions.map((a) => (
                <span
                  key={a.id}
                  className="bg-blue-500 px-3 py-1 rounded-full text-white hover:bg-blue-600 transition"
                >
                  {a.Name}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
