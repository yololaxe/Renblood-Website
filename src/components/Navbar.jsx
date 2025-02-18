import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth, listenToAuthChanges, signOut } from "../data/firebaseConfig";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    listenToAuthChanges(setUser); // 🔄 Écoute de l'état Firebase
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex space-x-6">
        <Link to="/" className="hover:text-gray-400">Accueil</Link>
        <Link to="/histoire" className="hover:text-gray-400">Histoire</Link>
        <Link to="/players" className="hover:text-gray-400">Joueurs</Link>
        <Link to="/map" className="hover:text-gray-400">Carte</Link>
      </div>

      {/* Avatar utilisateur ou bouton de connexion */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <img 
              src={user.photoURL || "/assets/default-avatar.png"} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate("/account")} // ✅ Redirection vers le profil
            />
            <button
              onClick={() => {
                if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                  signOut(auth);
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
