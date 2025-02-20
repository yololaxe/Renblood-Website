import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, listenToAuthChanges, signOut } from "../data/firebaseConfig";
import { useUser } from "../context/UserContext";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { setUserId, setUserRank } = useUser();

  useEffect(() => {
    listenToAuthChanges(setUser);
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex space-x-6">
        <Link to="/" className="hover:text-gray-400">Accueil</Link>
        <Link to="/histoire" className="hover:text-gray-400">Histoire</Link>
        <Link to="/players" className="hover:text-gray-400">Joueurs</Link>
        <Link to="/map" className="hover:text-gray-400">Carte</Link>
        {user && <Link to="/talents" className="hover:text-gray-400">Choisir Talent</Link>}
      </div>

      {/* Avatar utilisateur + Déconnexion */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/character" className="hover:text-gray-400">👤 Mon personnage</Link>
            <Link to="/account">
              <img
                src={user.photoURL || "/assets/default-avatar.png"}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-gray-500 cursor-pointer hover:opacity-80 transition"
              />
            </Link>
            <button
              onClick={async () => {
                if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                  try {
                    await signOut(auth);
                    sessionStorage.clear(); // ✅ Supprime toutes les données stockées
                    setUser(null); // ✅ Réinitialise l'état local
                    setUserId(null); // ✅ Réinitialise l'état global
                    setUserRank(null);
                    navigate("/home"); // ✅ Redirige vers l'accueil
                  } catch (error) {
                    console.error("Erreur lors de la déconnexion :", error);
                  }
                }
              }}
              className="text-red-500 hover:text-red-400"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <Link to="/auth" className="hover:text-gray-400">Connexion</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
