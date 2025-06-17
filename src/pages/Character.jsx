// src/pages/Character.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listenToAuthChanges } from "../data/firebaseConfig";
import { getPlayerFullProfile } from "../services/api";
import { MoneyDisplay } from "../components/MoneyDisplay";
import ToolTip from "../components/Tooltip";

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

export default function Character() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = listenToAuthChanges(async (user) => {
      if (!user) return navigate("/auth");
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
          {/* On affiche le pseudo en titre principal */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            {pseudo_minecraft}
          </h1>
          <p className="text-gray-300 mt-2 italic">{description}</p>
        </header>

        {/* Main card */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Identity & resources */}
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
            {/* Ici on affiche le nom / prénom à la place du pseudo */}
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

          {/* Stats */}
          <section>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              📊 Statistiques
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CHARACTERISTICS.map(({ key, icon, label }) => {
                const base = player[key] || 0;
                const bonus = real_charact[key];
                const total = base + (bonus?.count || 0);
                return (
                  <div
                    key={key}
                    className="bg-gray-700 rounded-xl p-4 flex flex-col items-center text-center gap-y-2 hover:bg-gray-600 transition"
                  >
                    <span className="text-2xl sm:text-3xl">{icon}</span>
                    <p className="text-white font-semibold">{label}</p>
                    <p className="text-white text-lg flex items-center gap-1 justify-center">
                      {total}
                      {bonus && (
                        <ToolTip text={`Base: ${base} +${bonus.count}`}>
                          <span className="text-sm text-green-300">
                            +{bonus.count}
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
              {Object.entries(experiences.jobs || {}).map(([jobKey, job]) => (
                <div
                  key={jobKey}
                  className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition"
                >
                  <p className="text-white font-bold">
                    {jobKey
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-gray-300">Niveau : {job.level}</p>
                  <p className="text-gray-300">
                    XP : {job.xp === -1 ? "🔒" : job.xp}
                  </p>
                </div>
              ))}
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
