import { lazy, Suspense, useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { auth, listenToAuthChanges, signOut } from "../data/firebaseConfig";
import { useUser } from "../context/UserContext";
import LiveSessionBanner from "./LiveSessionBanner";
import { HiMenu, HiX } from "react-icons/hi";
import { FaSearch, FaDice } from "react-icons/fa";

const GlobalSearch = lazy(() => import("./GlobalSearch"));

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/histoire", label: "Guide" },
  { to: "/players", label: "Joueurs" },
  { to: "/map", label: "Map" },
  { to: "/talents", label: "Arbre des talents", requiresAuth: true },
  { to: "/sessions", label: "Sessions", requiresAuth: true },
  { to: "/quests", label: "Quetes", requiresAuth: true },
];

const testHeaderLinks = [
  { to: "#gate", label: "Porte", detail: "Accueil test" },
  { to: "#signal", label: "Campagne", detail: "Table interactive" },
  { to: "#hub", label: "Hub", detail: "Actions rapides" },
  { to: "/map", label: "Carte", detail: "Monde" },
  { to: "/histoire", label: "Guide", detail: "Lore" },
  { to: "/histoires/journal", label: "Journal", detail: "Chroniques" },
];

function Navbar() {
  const [user, setUser] = useState(null);
  const [showNav, setShowNav] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [testPanelOpen, setTestPanelOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserId, setUserRank, userRank } = useUser();
  const isHomeTest = location.pathname === "/home-test";

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

  useEffect(() => {
    setMobileOpen(false);
    setTestPanelOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    if (!window.confirm("Voulez-vous vraiment vous deconnecter ?")) return;
    await signOut(auth);
    sessionStorage.clear();
    localStorage.removeItem("access_token");
    setUser(null);
    setUserId(null);
    setUserRank(null);
    navigate("/home");
  };

  const openSearch = () => {
    setMobileOpen(false);
    setTestPanelOpen(false);
    setSearchOpen(true);
  };

  const goTestDestination = (to) => {
    setTestPanelOpen(false);
    if (to.startsWith("#")) {
      document.getElementById(to.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(to);
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "pointer-events-none text-blue-400 font-semibold"
      : "hover:text-gray-400 text-white transition";

  if (isHomeTest) {
    return (
      <>
        <nav
          className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 text-white transition-transform duration-300 ${
            showNav ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.35rem] border border-white/15 bg-[#050506]/62 shadow-2xl shadow-black/45 backdrop-blur-2xl">
            <div className="flex h-16 items-center justify-between gap-3 px-3 md:px-4">
              <button
                type="button"
                onClick={() => goTestDestination("#gate")}
                className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-white/8"
              >
                <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200/30 bg-amber-200/12">
                  <span className="absolute h-2 w-2 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,.9)]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black uppercase tracking-[0.24em] text-amber-100">Renblood</span>
                  <span className="block truncate text-xs font-bold text-stone-400">Prototype accueil</span>
                </span>
              </button>

              <div className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.045] p-1 lg:flex">
                {testHeaderLinks.slice(0, 5).map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => goTestDestination(item.to)}
                    className="rounded-xl px-3 py-2 text-sm font-black text-stone-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openSearch}
                  className="hidden h-11 items-center gap-2 rounded-2xl border border-cyan-200/20 bg-cyan-200/8 px-4 text-sm font-bold text-cyan-100 transition hover:bg-cyan-200/14 md:flex"
                  title="Recherche globale (Ctrl+K)"
                >
                  <FaSearch />
                  <span>Recherche</span>
                </button>

                {user ? (
                  <Link to="/character" className="hidden md:block" title="Personnage">
                    <img
                      src={user.photoURL || "/assets/default-avatar.png"}
                      alt="Avatar"
                      className="h-10 w-10 rounded-2xl border border-white/20 object-cover transition hover:opacity-80"
                    />
                  </Link>
                ) : (
                  <NavLink
                    to="/auth"
                    className="hidden h-11 items-center rounded-2xl border border-white/12 bg-white/6 px-4 text-sm font-black text-white transition hover:bg-white/12 md:flex"
                  >
                    Connexion
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={() => setTestPanelOpen((open) => !open)}
                  className="flex h-11 items-center gap-2 rounded-2xl bg-amber-200 px-4 text-sm font-black text-[#130e08] transition hover:bg-white"
                  title="Ouvrir le panneau de navigation"
                >
                  {testPanelOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
                  <span className="hidden sm:inline">Navigation</span>
                </button>
              </div>
            </div>

            {testPanelOpen && (
              <div className="border-t border-white/10 bg-black/30 p-3 md:p-4">
                <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {testHeaderLinks.slice(0, 3).map((item) => (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => goTestDestination(item.to)}
                        className="group min-h-28 rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-200/45 hover:bg-amber-200/12"
                      >
                        <span className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">{item.detail}</span>
                        <span className="mt-6 block text-2xl font-black text-white">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {testHeaderLinks.slice(3).map((item) => (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => goTestDestination(item.to)}
                        className="group flex min-h-20 flex-col justify-between rounded-2xl border border-cyan-200/12 bg-cyan-200/7 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-cyan-200/12"
                      >
                        <span className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">{item.detail}</span>
                        <span className="text-xl font-black text-white">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={openSearch}
                    className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 text-sm font-bold text-stone-200 transition hover:bg-white/12 md:hidden"
                  >
                    <FaSearch /> Rechercher
                  </button>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {userRank === "Admin" && (
                      <NavLink to="/admin-dashboard" className="rounded-2xl border border-amber-200/25 px-4 py-2 font-black text-amber-100 transition hover:bg-amber-200/10">
                        Admin
                      </NavLink>
                    )}
                    {user ? (
                      <>
                        <NavLink to="/character" className="rounded-2xl border border-white/10 px-4 py-2 font-black text-white transition hover:bg-white/10">
                          Personnage
                        </NavLink>
                        <button onClick={handleSignOut} className="rounded-2xl border border-red-300/20 px-4 py-2 font-black text-red-100 transition hover:bg-red-500/10">
                          Deconnexion
                        </button>
                      </>
                    ) : (
                      <NavLink to="/auth" className="rounded-2xl border border-white/10 px-4 py-2 font-black text-white transition hover:bg-white/10">
                        Connexion
                      </NavLink>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="h-16" />
        {searchOpen && (
          <Suspense fallback={null}>
            <GlobalSearch open onClose={() => setSearchOpen(false)} />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 bg-gray-800 bg-opacity-90 backdrop-blur-sm text-white z-50 transform transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold hover:text-gray-300">
              Renblood
            </Link>
            <NavLink to="/dice" className="flex items-center justify-center text-yellow-300 transition hover:text-yellow-200" title="Lancer un dé">
              <FaDice className="text-xl sm:text-2xl" />
            </NavLink>
            <button
              onClick={openSearch}
              className="hidden md:flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-gray-900/80 px-3 py-2 text-sm text-gray-200 hover:border-yellow-400 hover:text-white"
              title="Recherche globale (Ctrl+K)"
            >
              <FaSearch className="text-yellow-400" />
              <span>Rechercher</span>
              <span className="hidden lg:inline rounded border border-gray-600 px-1.5 py-0.5 text-[10px] text-gray-500">Ctrl K</span>
            </button>
          </div>

          <div className="hidden md:flex space-x-6">
            {navItems.map(({ to, label, requiresAuth, requiredRole }) => {
              if (requiresAuth && !user) return null;
              if (requiredRole && userRank !== requiredRole) return null;
              return (
                <NavLink key={to} to={to} end={to === "/"} className={linkClass}>
                  {label}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={openSearch}
              className="flex md:hidden items-center gap-2 rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2 text-gray-300 hover:border-gray-500 hover:text-white"
              title="Recherche globale (Ctrl+K)"
            >
              <FaSearch />
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
                    Admin
                  </NavLink>
                )}
                <Link to="/character">
                  <img
                    src={user.photoURL || "/assets/default-avatar.png"}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border-2 border-gray-600 hover:opacity-80 transition"
                  />
                </Link>
                <button onClick={handleSignOut} className="text-red-500 hover:text-red-400 transition">
                  Deconnexion
                </button>
              </>
            ) : (
              <NavLink to="/auth" className={linkClass}>
                Connexion
              </NavLink>
            )}

            <button className="md:hidden p-2 focus:outline-none" onClick={() => setMobileOpen((open) => !open)}>
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navItems.map(({ to, label, requiresAuth, requiredRole }) => {
                if (requiresAuth && !user) return null;
                if (requiredRole && userRank !== requiredRole) return null;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded ${
                        isActive ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700 text-white"
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
                Des
              </NavLink>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 text-white"
                onClick={openSearch}
              >
                <FaSearch /> Rechercher une info
              </button>
              {user && (
                <>
                  {userRank === "Admin" && (
                    <NavLink
                      to="/admin-dashboard"
                      className="block px-3 py-2 rounded hover:bg-gray-700 text-yellow-300"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin
                    </NavLink>
                  )}
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-red-500"
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                  >
                    Deconnexion
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