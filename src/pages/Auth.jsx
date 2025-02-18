import { useEffect, useState } from "react";
import { auth, googleProvider, listenToAuthChanges } from "../data/firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";
import axios from "axios";

function Auth() {
  const [user, setUser] = useState(null);
  const [mcData, setMcData] = useState(null);

  useEffect(() => {
    listenToAuthChanges(async (user) => {
      setUser(user);
      if (user) {
        await fetchMinecraftData(user.uid);
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      await fetchMinecraftData(result.user.uid);
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  const fetchMinecraftData = async (userId) => {
    try {
      const response = await axios.get(`https://renblood-backend.onrender.com/players/get/${userId}/`);
      sessionStorage.setItem("mcData", JSON.stringify(response.data)); // Stockage local
      setMcData(response.data);
    } catch (error) {
      console.error("Impossible de récupérer les données Minecraft :", error);
    }
  };

  const logout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await signOut(auth);
      sessionStorage.removeItem("mcData"); // Suppression des données locales
      setMcData(null);
    }
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-white mb-6">🔐 Connexion</h1>
      {user ? (
        <div>
          <img src={user.photoURL} alt="Avatar" className="w-16 h-16 rounded-full mx-auto mb-2" />
          <p className="text-lg text-gray-200">Connecté en tant que {user.displayName}</p>
          {mcData && <p className="text-lg text-green-400">Pseudo Minecraft : {mcData.pseudo_minecraft}</p>}
          <button onClick={logout} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">Déconnexion</button>
        </div>
      ) : (
        <button onClick={signInWithGoogle} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Se connecter avec Google</button>
      )}
    </div>
  );
}

export default Auth;
