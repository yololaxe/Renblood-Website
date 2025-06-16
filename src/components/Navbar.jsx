// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { auth, listenToAuthChanges, signOut } from "../data/firebaseConfig";
import { useUser } from "../context/UserContext";

const navItems = [
  { to: "/",       label: "Accueil" },
  { to: "/histoire", label: "Information" },
  { to: "/players",  label: "Joueurs" },
  { to: "/map",      label: "Map" },
  { to: "/talents",  label: "Arbre des talents", requiresAuth: true },
];

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { setUserId, setUserRank } = useUser();

  useEffect(() => {
    listenToAuthChanges(setUser);
  }, []);

  const handleSignOut = async () => {
    if (!window.confirm("Voulez-vous vraiment vous déconnecter ?")) return;
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
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "pointer-events-none text-blue-400 font-semibold"
      : "hover:text-gray-400 text-white transition";

  return (
    <nav className="relative bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* 🎲 Emoji centré */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl">
        <Link to="/dice">🎲</Link>
      </div>

      {/* Menu gauche */}
      <div className="flex space-x-6">
        {navItems.map(({ to, label, requiresAuth }) => {
          if (requiresAuth && !user) return null;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}             // exact match pour la racine
              className={linkClass}
            >
              {label}
            </NavLink>
          );
        })}
      </div>

      {/* Menu droite */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/character">
              <img
                src={user.photoURL || "/assets/default-avatar.png"}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-gray-500 cursor-pointer hover:opacity-80 transition"
              />
            </Link>
            <button
              onClick={handleSignOut}
              className="text-red-500 hover:text-red-400 transition"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <NavLink to="/auth" className={linkClass}>
            Connexion
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
