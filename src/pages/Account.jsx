import { useEffect, useState } from "react";
import { auth, listenToAuthChanges } from "../data/firebaseConfig";

function Account() {
  const [user, setUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    listenToAuthChanges(setUser);

    const storedPlayerData = localStorage.getItem("playerData");
    if (storedPlayerData) {
      setPlayerData(JSON.parse(storedPlayerData));
    }
  }, []);

  if (!user) {
    return <p className="text-center text-gray-400 mt-10">Vous devez être connecté pour voir votre profil.</p>;
  }

  return (
    <div className="p-10 text-center text-white">
      <h1 className="text-3xl font-bold mb-6">👤 Mon Profil</h1>
      <img src={user.photoURL || "/assets/default-avatar.png"} alt="Avatar" className="w-32 h-32 rounded-full mx-auto mb-4" />
      <p className="text-lg"><strong>Nom :</strong> {user.displayName}</p>
      <p className="text-lg"><strong>Email :</strong> {user.email}</p>

      {/* ✅ Affichage des infos Minecraft */}
      {playerData ? (
        <>
          <h2 className="text-2xl font-bold mt-6">🎮 Minecraft</h2>
          <p className="text-lg"><strong>Pseudo :</strong> {playerData.pseudo_minecraft}</p>
          <p className="text-lg"><strong>Rang :</strong> {playerData.rank}</p>
          <p className="text-lg"><strong>Level :</strong> {playerData.total_lvl}</p>
          <p className="text-lg"><strong>Argent :</strong> {playerData.money} Gold</p>
        </>
      ) : (
        <p className="text-gray-400">Aucune donnée Minecraft trouvée.</p>
      )}
    </div>
  );
}

export default Account;
