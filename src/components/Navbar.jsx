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
    <nav className="relative bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* 🎲 Emoji centré */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl">
        <Link to="/dice">🎲</Link>
      </div>

      {/* Menu gauche */}
      <div className="flex space-x-6">
        <Link to="/" className="hover:text-gray-400">Accueil</Link>
        <Link to="/histoire" className="hover:text-gray-400">Information</Link>
        <Link to="/players" className="hover:text-gray-400">Joueurs</Link>
        <Link to="/map" className="hover:text-gray-400">Map</Link>
        {user && <Link to="/talents" className="hover:text-gray-400">Arbre des talents</Link>}
      </div>

      {/* Menu droite */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {/* <Link to="/character" className="hover:text-gray-400">Mon personnage</Link> */}
            <Link to="/character">
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
                    sessionStorage.clear();
                    localStorage.removeItem("access_token");
                    setUser(null);
                    setUserId(null);
                    setUserRank(null);
                    navigate("/home");
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
