import { useEffect, useState } from "react";
import { auth, listenToAuthChanges } from "../data/firebaseConfig";
import { API_BASE_URL } from "../data/api";
import axios from "axios";

function Account() {
  const [user, setUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    listenToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchMinecraftData(firebaseUser.uid);
      }
    });
  }, []);

  // ✅ Fonction pour récupérer les infos du joueur
  const fetchMinecraftData = async (userId) => {
    try {
      console.log(`🔄 Vérification des mises à jour : ${API_BASE_URL}/players/get/${userId}/`);
      const response = await axios.get(`${API_BASE_URL}/players/get/${userId}/`);
      sessionStorage.setItem("mcData", JSON.stringify(response.data));
      setPlayerData(response.data);
    } catch (error) {
      console.error("❌ Impossible de récupérer les données Minecraft :", error);
    }
  };

  // ✅ Écoute les changements toutes les 5 secondes
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchMinecraftData(user.uid);
      }, 5000); // Toutes les 5 secondes

      return () => clearInterval(interval); // Nettoyer l'intervalle à la déconnexion
    }
  }, [user]);

  if (!user) {
    return <p className="text-center text-gray-400 mt-10">Vous devez être connecté pour voir votre profil.</p>;
  }

  return (
    <div className="p-10 text-center text-white">
      <h1 className="text-3xl font-bold mb-6">👤 Mon Profil</h1>

      <div className="max-w-xl mx-auto bg-gray-800 text-white p-6 rounded-xl shadow-lg">
        {/* Avatar et Nom */}
        <div className="flex items-center justify-center mb-4">
          <img
            src={user.photoURL || "/assets/default-avatar.png"}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-2 border-gray-500"
          />
        </div>
        <h2 className="text-2xl font-semibold">{user.displayName}</h2>
        <p className="text-gray-400">{user.email}</p>

        {/* Infos Minecraft */}
        {playerData ? (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-2">🎮 Infos Minecraft</h3>
            <div className="grid grid-cols-2 gap-4 text-left text-lg">
              <p><strong>🔑 ID Minecraft :</strong> {playerData.id_minecraft}</p>
              <p><strong>🆕 Pseudo :</strong> {playerData.pseudo_minecraft}</p>
              <p><strong>🏷️ Nom :</strong> {playerData.name}</p>
              <p><strong>🏷️ Prénom :</strong> {playerData.surname}</p>
              <p><strong>⚔️ Rang :</strong> {playerData.rank}</p>
              <p><strong>💎 Level :</strong> {playerData.total_lvl}</p>
              <p><strong>💰 Argent :</strong> {playerData.money} Gold</p>
              <p><strong>📜 Description :</strong> {playerData.description}</p>
              <p><strong>✨ Divin :</strong> {playerData.divin ? "Oui" : "Non"}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 mt-4">Aucune donnée Minecraft trouvée.</p>
        )}
      </div>
    </div>
  );
}

export default Account;
