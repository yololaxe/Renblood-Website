import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, listenToAuthChanges } from "../data/firebaseConfig";
import { getPlayerData } from "../data/api";

function Character() {
  const [user, setUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const data = await getPlayerData(firebaseUser.uid);
          if (data) {
            sessionStorage.setItem("mcData", JSON.stringify(data));
            setPlayerData(data);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      } else {
        navigate("/auth");
      }
    });
  
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [navigate]);
  

  if (!user || !playerData) {
    return <p className="text-center text-gray-400 mt-10">Chargement des données...</p>;
  }

  // Protection contre les valeurs nulles
  const {
    pseudo_minecraft = "Inconnu",
    rank = "Non défini",
    description = "Aucune description",
    money = 0,
    divin = false,
    traits = [],
    actions = [],
    experiences = {},
    life = 0,
    strength = 0,
    speed = 0,
    reach = 0,
    resistance = 0,
    haste = 0,
    regeneration = 0,
    mana = 0,
    dodge = 0,
    discretion = 0,
    charisma = 0,
    rethoric = 0,
    negotiation = 0,
    influence = 0,
    skill = 0
  } = playerData;

  const jobs = experiences?.jobs || {};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 text-white">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
        <span>👤</span> Mon Personnage
      </h1>

      <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-center">
          {pseudo_minecraft} <span className="text-gray-400">({rank})</span>
        </h2>
        <p className="text-gray-400 text-center italic">{description}</p>

        <div className="flex justify-between items-center mt-4 text-lg">
          <p><strong>💰 Argent :</strong> {money} Gold</p>
          <p><strong>✨ Divin :</strong> {divin ? "Oui" : "Non"}</p>
        </div>

        <h3 className="text-xl font-bold text-center mt-6">🧬 Traits & Actions</h3>
        <div className="flex flex-col md:flex-row justify-center gap-6 mt-2">
          <div className="bg-gray-700 p-4 rounded-lg shadow-md w-full md:w-1/2">
            <h4 className="text-lg font-semibold text-center mb-2">Traits</h4>
            {Array.isArray(traits) && traits.length > 0 ? (
              <ul className="list-none space-y-2">
                {traits.map((t, idx) => (
                  <li key={t.trait_id ?? `trait-${idx}`} className="bg-gray-800 p-2 rounded-md shadow text-center">
                    {t.Name || "Nom inconnu"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">Aucun trait.</p>
            )}
          </div>

          <div className="bg-gray-700 p-4 rounded-lg shadow-md w-full md:w-1/2">
            <h4 className="text-lg font-semibold text-center mb-2">Actions</h4>
            {Array.isArray(actions) && actions.length > 0 ? (
              <ul className="list-none space-y-2">
                {actions.map((a, idx) => (
                  <li key={a.action_id ?? `action-${idx}`} className="bg-gray-800 p-2 rounded-md shadow text-center">
                    {a.Name || "Nom inconnu"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">Aucune action.</p>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold mt-6 text-center">📊 Statistiques</h3>
        <div className="grid grid-cols-2 gap-4 text-lg mt-2">
          <p><strong>❤️ Vie :</strong> {life}</p>
          <p><strong>💪 Force :</strong> {strength}</p>
          <p><strong>⚡ Vitesse :</strong> {speed}</p>
          <p><strong>🎯 Portée :</strong> {reach}</p>
          <p><strong>🛡️ Résistance :</strong> {resistance}</p>
          <p><strong>⛏️ Célérité :</strong> {haste}</p>
          <p><strong>🔥 Régénération :</strong> {regeneration}</p>
          <p><strong>🔮 Mana :</strong> {mana}</p>
        </div>

        <h3 className="text-xl font-bold mt-6 text-center">📜 Expériences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-lg mt-2">
          {Object.keys(jobs).map((jobKey) => {
            const job = jobs[jobKey] || {};
            return (
              <p key={jobKey}>
                <strong>{jobKey.replace("_", " ")} :</strong> {job.xp ?? 0} XP (Lvl {job.level ?? 0})
                {Array.isArray(job.progression) ? ` - Progression: ${job.progression.length}` : ""}
              </p>
            );
          })
          }
        </div>
      </div>
    </div>
  );
}

export default Character;
