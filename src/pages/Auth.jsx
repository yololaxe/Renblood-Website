import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, listenToAuthChanges } from "../data/firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";
import axios from "axios";
import { API_BASE_URL } from "../data/api";
import { useUser } from "../context/UserContext"; // ✅ Import du contexte

function Auth() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { setUserId, setUserRank } = useUser(); // ✅ Récupère les setters du contexte

  useEffect(() => {
    listenToAuthChanges(async (user) => {
      setUser(user);
      if (user) {
        await fetchMinecraftData(user.uid);
        navigate("/account");
      }
    });
  }, []);
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      await fetchMinecraftData(result.user.uid);
      navigate("/account");
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  const fetchMinecraftData = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/get/${userId}/`);
      
      // ✅ Stocke dans `sessionStorage`
      sessionStorage.setItem("userId", response.data.id);
      sessionStorage.setItem("userRank", response.data.rank);

      // ✅ Met à jour le contexte global
      setUserId(response.data.id);
      setUserRank(response.data.rank);
    } catch (error) {
      console.error("Impossible de récupérer les données Minecraft :", error);
    }
  };

  const logout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      try {
        await signOut(auth); // Déconnexion Firebase
        sessionStorage.clear(); // ✅ Supprime toutes les données stockées
        setUser(null); // ✅ Réinitialise l'état local
        setUserId(null); // ✅ Réinitialise l'état global
        setUserRank(null);
        navigate("/home"); // ✅ Redirige vers l'accueil
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
      }
    }
  };
  

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-white mb-6">🔐 Connexion</h1>
      {user ? (
        <div>
          <img src={user.photoURL} alt="Avatar" className="w-16 h-16 rounded-full mx-auto mb-2" />
          <p className="text-lg text-gray-200">Connecté en tant que {user.displayName}</p>
          <button onClick={logout} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">Déconnexion</button>
        </div>
      ) : (
        <button onClick={signInWithGoogle} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Se connecter avec Google
        </button>
      )}
    </div>
  );
}

export default Auth;
