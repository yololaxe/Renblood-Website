import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, listenToAuthChanges } from "../data/firebaseConfig";
import { getPlayerData } from "../data/api";

function Character() {
  const [user, setUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    listenToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const data = await getPlayerData(firebaseUser.uid);
        if (data) {
          sessionStorage.setItem("mcData", JSON.stringify(data));
          setPlayerData(data);
        }
      } else {
        navigate("/auth"); // 🔐 Redirection si non connecté
      }
    });
  }, []);

  if (!user || !playerData) {
    return <p className="text-center text-gray-400 mt-10">Chargement des données...</p>;
  }

  const { pseudo_minecraft, rank, description, money, divin, trait, actions, experiences } = playerData;
  const jobs = experiences?.jobs || {};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 text-white">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
        <span>👤</span> Mon Personnage
      </h1>

      {/* 🛡️ Carte du personnage */}
      <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-center">
          {pseudo_minecraft} <span className="text-gray-400">({rank})</span>
        </h2>
        <p className="text-gray-400 text-center italic">{description || "Aucune description"}</p>

        {/* 💰 Argent & Divin */}
        <div className="flex justify-between items-center mt-4 text-lg">
          <p><strong>💰 Argent :</strong> {money} Gold</p>
          <p><strong>✨ Divin :</strong> {divin ? "Oui" : "Non"}</p>
        </div>

        {/* 📜 Traits et Actions */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-center">🧬 Traits & Actions</h3>
          <div className="flex justify-center gap-6 mt-2">
            <div>
              <h4 className="text-lg font-semibold">Traits</h4>
              <ul className="list-disc list-inside">
                {trait.length > 0 ? trait.map((t, idx) => <li key={idx}>{t}</li>) : <li>Aucun</li>}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Actions</h4>
              <ul className="list-disc list-inside">
                {actions.length > 0 ? actions.map((a, idx) => <li key={idx}>{a}</li>) : <li>Aucune</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* 📊 Statistiques */}
        <h3 className="text-xl font-bold mt-6 text-center">📊 Statistiques</h3>
        <div className="grid grid-cols-2 gap-4 text-lg mt-2">
          <p><strong>❤️ Vie :</strong> {playerData.life}</p>
          <p><strong>💪 Force :</strong> {playerData.strength}</p>
          <p><strong>⚡ Vitesse :</strong> {playerData.speed}</p>
          <p><strong>🎯 Portée :</strong> {playerData.reach}</p>
          <p><strong>🛡️ Résistance :</strong> {playerData.resistance}</p>
          <p><strong>⛏️ Hâte :</strong> {playerData.haste}</p>
          <p><strong>🔥 Régénération :</strong> {playerData.regeneration}</p>
          <p><strong>🔮 Mana :</strong> {playerData.mana}</p>
        </div>

        {/* 🏆 Capacités */}
        <h3 className="text-xl font-bold mt-6 text-center">🏆 Capacités</h3>
        <div className="grid grid-cols-2 gap-4 text-lg mt-2">
          <p><strong>💨 Esquive :</strong> {playerData.dodge}</p>
          <p><strong>🕵️ Discrétion :</strong> {playerData.discretion}</p>
          <p><strong>🗣️ Charisme :</strong> {playerData.charisma}</p>
          <p><strong>📜 Rhétorique :</strong> {playerData.rethoric}</p>
          <p><strong>💰 Négociation :</strong> {playerData.negotiation}</p>
          <p><strong>🌍 Influence :</strong> {playerData.influence}</p>
          <p><strong>🛠️ Compétence :</strong> {playerData.skill}</p>
        </div>

        {/* 📜 Expériences */}
        <h3 className="text-xl font-bold mt-6 text-center">📜 Expériences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-lg mt-2">
          {Object.keys(jobs).map((jobKey) => {
            const job = jobs[jobKey];
            return (
              <p key={jobKey}>
                <strong>{jobKey.replace("_", " ")} :</strong> {job.xp} XP (Lvl {job.level})
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Character;
