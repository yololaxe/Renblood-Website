// src/pages/Auth.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, listenToAuthChanges } from "../data/firebaseConfig";
import { signInWithPopup, signOut, getIdToken } from "firebase/auth";
import axios from "axios";
import { API_BASE_URL } from "../services/api";
import { useUser } from "../context/UserContext";
import { setAccessToken } from "../utils/sessionUtils";

function Auth() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { setUserId, setUserRank } = useUser();

  // À la connexion Firebase (initiale ou reload), on récupère les données Minecraft
  useEffect(() => {
    return listenToAuthChanges(async firebaseUser => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Récupère et stocke Firebase ID token
        const token = await getIdToken(firebaseUser);
        setAccessToken(token);
        // Récupère les données Minecraft backend
        await fetchMinecraftData(firebaseUser.uid);
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // L'effet `listenToAuthChanges` se chargera du reste (token + fetch)
      navigate("/character");
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  const fetchMinecraftData = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/get/${userId}/`);
      const { id, rank } = response.data;
      sessionStorage.setItem("userId", id);
      sessionStorage.setItem("userRank", rank);
      setUserId(id);
      setUserRank(rank);
    } catch (error) {
      console.error("Impossible de récupérer les données Minecraft :", error);
    }
  };

  const logout = async () => {
    if (!window.confirm("Voulez-vous vraiment vous déconnecter ?")) return;
    try {
      await signOut(auth);
      sessionStorage.clear();
      setUser(null);
      setUserId(null);
      setUserRank(null);
      navigate("/home");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-white mb-6">🔐 Connexion</h1>
      {user ? (
        <div>
          <img src={user.photoURL} alt="Avatar" className="w-16 h-16 rounded-full mx-auto mb-2" />
          <p className="text-lg text-gray-200">Connecté en tant que {user.displayName}</p>
          <button onClick={logout} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">
            Déconnexion
          </button>
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
