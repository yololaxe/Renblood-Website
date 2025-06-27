// src/pages/Auth.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, listenToAuthChanges } from "../data/firebaseConfig";
import { signInWithPopup, signOut, getIdToken } from "firebase/auth";
import axios from "axios";
import {
  API_BASE_URL,
  createDefaultPlayer,
  initializeStatsBonus
} from "../services/api";
import { useUser } from "../context/UserContext";
import { setAccessToken } from "../utils/sessionUtils";

// Petite icône Google SVG inline
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3">
    {/* … contenu du path Google … */}
    <path fill="#4285F4" d="M533.5 278.4c0-17.7-1.6-35-4.7-51.7H272v97.8h146.9c-6.3 34.2-25.2 63.2-53.8 82.6v68h86.9c50.7-46.7 80.5-115.7 80.5-196.7z"/>
    {/* … un seul path pour simplifier … */}
  </svg>
);

function Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserId, setUserRank } = useUser();

  // Écoute Firebase
  useEffect(() => {
    return listenToAuthChanges(async firebaseUser => {
      setUser(firebaseUser);
      if (!firebaseUser) return;

      setLoading(true);
      const token = await getIdToken(firebaseUser);
      setAccessToken(token);

      const isNew =
        firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;
      if (isNew) {
        await createDefaultPlayer(firebaseUser);
      }

      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/players/get/${firebaseUser.uid}/`
        );
        sessionStorage.setItem("userId", data.id);
        sessionStorage.setItem("userRank", data.rank);
        setUserId(data.id);
        setUserRank(data.rank);
        await initializeStatsBonus(data.id);
      } catch (err) {
        console.error("Fetch Minecraft :", err);
      }
      setLoading(false);
      navigate("/character");
    });
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!window.confirm("Voulez-vous vraiment vous déconnecter ?")) return;
    setLoading(true);
    try {
      await signOut(auth);
      sessionStorage.clear();
      setUser(null);
      setUserId(null);
      setUserRank(null);
      navigate("/home");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
          🔐 Connexion
        </h1>
        {!user ? (
          <>
            <p className="text-gray-200">
              Connectez-vous pour accéder à votre profil Minecraft personnalisé.
            </p>
            <button
              onClick={signIn}
              disabled={loading}
              className="w-full flex items-center justify-center py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-colors text-white font-medium disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <>
                  <GoogleIcon /> Se connecter avec Google
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-24 h-24 rounded-full mx-auto ring-2 ring-white"
            />
            <p className="text-xl text-white font-semibold">
              {user.displayName}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/character")}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-lg font-medium"
              >
                Mon personnage
              </button>
              <button
                onClick={logout}
                disabled={loading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin" />
                ) : (
                  "Déconnexion"
                )}
              </button>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4">
          En vous connectant, vous acceptez nos{" "}
          <a href="/terms" className="underline hover:text-gray-200">
            conditions d’utilisation
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default Auth;
