// src/components/Navbar.jsx
import { lazy, Suspense, useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { auth, listenToAuthChanges, signOut } from "../data/firebaseConfig";
import { useUser } from "../context/UserContext";
import LiveSessionBanner from "./LiveSessionBanner";
import { HiMenu, HiX } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";

const GlobalSearch = lazy(() => import("./GlobalSearch"));

const navItems = [
  { to: "/",         label: "Accueil" },
  { to: "/histoire", label: "Information" },
  { to: "/players",  label: "Joueurs" },
  { to: "/map",      label: "Map" },
  { to: "/talents",  label: "Arbre des talents", requiresAuth: true },
  { to: "/sessions", label: "Sessions",         requiresAuth: true },
  { to: "/quests",   label: "Quêtes",           requiresAuth: true },
];

function Navbar() {
  const [user, setUser]       = useState(null);
  const [showNav, setShowNav] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate               = useNavigate();
  const { setUserId, setUserRank, userRank } = useUser();

  useEffect(() => {
    listenToAuthChanges(setUser);
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    let lastY = window.pageYOffset;
    const onScroll = () => {
      const y = window.pageYOffset;
      setShowNav(y < lastY || y < 50);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    if (!window.confirm("Voulez-vous vraiment vous déconnecter ?")) return;
    await signOut(auth);
    sessionStorage.clear();
    localStorage.removeItem("access_token");
    setUser(null);
    setUserId(null);
    setUserRank(null);
    navigate("/home");
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "pointer-events-none text-blue-400 font-semibold"
      : "hover:text-gray-400 text-white transition";

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 bg-gray-800 bg-opacity-90 backdrop-blur-sm text-white z-50 transform transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo + Dice */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold hover:text-gray-300">
              Renblood
            </Link>
            <NavLink
              to="/dice"
              className="text-2xl hover:text-gray-300 transition"
            >
              🎲
            </NavLink>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex space-x-6">
            {navItems.map(({ to, label, requiresAuth, requiredRole }) => {
              if (requiresAuth && !user) return null;
              if (requiredRole && userRank !== requiredRole) return null;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={linkClass}
                >
                  {label}
                </NavLink>
              );
            })}
          </div>

          {/* User actions + mobile toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2 text-gray-300 hover:border-gray-500 hover:text-white"
              title="Recherche globale (Ctrl+K)"
            >
              <FaSearch />
              <span className="hidden xl:inline text-sm">Rechercher</span>
              <span className="hidden xl:inline rounded border border-gray-600 px-1.5 py-0.5 text-[10px] text-gray-500">Ctrl K</span>
            </button>
            {user ? (
              <>
                {userRank === "Admin" && (
                  <NavLink
                    to="/admin-dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? "pointer-events-none text-yellow-400 font-semibold"
                        : "hover:text-yellow-300 text-white transition"
                    }
                  >
                    ⚙️ Admin
                  </NavLink>
                )}
                <Link to="/character">
                  <img
                    src={user.photoURL || "/assets/default-avatar.png"}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border-2 border-gray-600 hover:opacity-80 transition"
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

            <button
              className="md:hidden p-2 focus:outline-none"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {[...navItems].map(({ to, label, requiresAuth, requiredRole }) => {
                if (requiresAuth && !user) return null;
                if (requiredRole && userRank !== requiredRole) return null;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded ${
                        isActive
                          ? "bg-gray-700 text-blue-400"
                          : "hover:bg-gray-700 text-white"
                      }`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </NavLink>
                );
              })}
              <NavLink
                to="/dice"
                className="block px-3 py-2 rounded hover:bg-gray-700 text-white"
                onClick={() => setMobileOpen(false)}
              >
                🎲
              </NavLink>
              {user && (
                <>
                  {userRank === "Admin" && (
                    <NavLink
                      to="/admin-dashboard"
                      className="block px-3 py-2 rounded hover:bg-gray-700 text-yellow-300"
                      onClick={() => setMobileOpen(false)}
                    >
                      ⚙️ Admin
                    </NavLink>
                  )}
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-red-500"
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                  >
                    Déconnexion
                  </button>
                </>
              )}
              {!user && (
                <NavLink
                  to="/auth"
                  className="block px-3 py-2 rounded hover:bg-gray-700 text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Connexion
                </NavLink>
              )}
            </div>
          </div>
        )}

        <LiveSessionBanner />
      </nav>

      {/* placeholder so page content isn't hidden */}
      <div className="h-16" />
      {searchOpen && (
        <Suspense fallback={null}>
          <GlobalSearch open onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

export default Navbar;
