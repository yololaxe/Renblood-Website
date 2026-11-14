import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { auth, signOut } from "../data/firebaseConfig";
import { useUser } from "../context/UserContext";
import LiveSessionBanner from "./LiveSessionBanner";
import { HiMenu, HiX } from "react-icons/hi";
import { FaSearch, FaDice, FaChevronDown } from "react-icons/fa";
import "./navbar.css";

const GlobalSearch = lazy(() => import("./GlobalSearch"));
const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/histoire", label: "Guide" },
  { to: "/players", label: "Joueurs" },
  { to: "/map", label: "Carte" },
  { to: "/marchand", label: "Marchand", requiresAuth: true },
  { to: "/finances", label: "Finances", requiresAuth: true },
  { to: "/talents", label: "Talents", requiresAuth: true },
  { to: "/sessions", label: "Sessions", requiresAuth: true },
  { to: "/quests", label: "Quêtes", requiresAuth: true },
];

export default function Navbar() {
  const [showNav, setShowNav] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [hasSessionAnnouncement, setHasSessionAnnouncement] = useState(false);
  const staffRef = useRef(null);
  const staffButton = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser: user, setUserId, setUserRank, userRank } = useUser();
  const isStaff = Boolean(user && ["Moderateur", "Admin"].includes(userRank));
  useEffect(() => {
    const shortcut = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setMobileOpen(false); setStaffOpen(false); setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setMobileOpen(false);
        setStaffOpen(wasOpen => { if (wasOpen) staffButton.current?.focus(); return false; });
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (!staffOpen) return;
    const outside = event => { if (!staffRef.current?.contains(event.target)) setStaffOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [staffOpen]);
  useEffect(() => {
    let lastY = window.scrollY;
    const scroll = () => { const y = window.scrollY; setShowNav(y < lastY || y < 50); lastY = y; };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => { setMobileOpen(false); setStaffOpen(false); setShowNav(true); }, [location.pathname]);
  const logout = async () => {
    if (!window.confirm("Voulez-vous vraiment vous déconnecter ?")) return;
    await signOut(auth);
    sessionStorage.clear(); localStorage.removeItem("access_token");
    setUserId(null); setUserRank(null); navigate("/home");
  };
  const openSearch = () => { setMobileOpen(false); setStaffOpen(false); setSearchOpen(true); };
  const links = navItems.filter(item => !item.requiresAuth || user);
  const linkClass = ({ isActive }) => `kingdom-nav-link${isActive ? " is-active" : ""}`;
  const staffLinks = <>
    <NavLink to="/support/economie" onClick={() => { setStaffOpen(false); setMobileOpen(false); }}><strong>Suivi des échanges</strong><span>Reçus et incidents économiques</span></NavLink>
    {userRank === "Admin" && <NavLink to="/admin-dashboard" onClick={() => { setStaffOpen(false); setMobileOpen(false); }}><strong>Administration</strong><span>Gérer le royaume et ses joueurs</span></NavLink>}
  </>;

  return <>
    <header className={`kingdom-header${hasSessionAnnouncement ? " kingdom-header--announced" : ""}${showNav || mobileOpen || searchOpen || staffOpen ? "" : " kingdom-header--hidden"}`}>
      <div className="kingdom-bar">
        <Link to="/" className="kingdom-brand" aria-label="Renblood — Accueil">Renblood<span aria-hidden="true">.</span></Link>
        <nav className="kingdom-desktop" aria-label="Navigation principale">
          {links.map(({to,label}) => <NavLink key={to} to={to} end={to === "/"} className={linkClass}>{label}</NavLink>)}
        </nav>
        <div className="kingdom-tools">
          <NavLink to="/dice" className="kingdom-icon kingdom-dice" aria-label="Lancer un dé" title="Lancer un dé"><FaDice /></NavLink>
          <button onClick={openSearch} className="kingdom-icon" aria-label="Recherche globale" title="Rechercher (Ctrl+K)"><FaSearch /></button>
          {user ? <>
            {isStaff && <div className="kingdom-staff" ref={staffRef} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setStaffOpen(false); }}>
              <button ref={staffButton} type="button" className="kingdom-staff-toggle" aria-expanded={staffOpen} aria-controls="kingdom-staff-links"
                onClick={() => setStaffOpen(value => !value)}>Équipe <FaChevronDown aria-hidden="true" /></button>
              {staffOpen && <nav id="kingdom-staff-links" className="kingdom-staff-links" aria-label="Outils de l’équipe">{staffLinks}</nav>}
            </div>}
            <NavLink to="/account/profile" className="kingdom-account" aria-label="Mon profil"><span className="kingdom-account-mark" aria-hidden="true">{(user.displayName || "R").charAt(0)}</span><span className="kingdom-account-label">Mon profil</span></NavLink>
            <button className="kingdom-logout" onClick={logout}>Déconnexion</button>
          </> : <NavLink to="/auth" className="kingdom-account">Connexion <span aria-hidden="true">↗</span></NavLink>}
          <button className="kingdom-menu-toggle kingdom-icon" aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileOpen} aria-controls="main-mobile-navigation" onClick={() => { setStaffOpen(false); setMobileOpen(v => !v); }}>{mobileOpen ? <HiX /> : <HiMenu />}</button>
        </div>
      </div>
      {mobileOpen && <nav id="main-mobile-navigation" className="kingdom-mobile" aria-label="Navigation mobile">
        {links.map(({to,label},index) => <NavLink key={to} to={to} end={to === "/"} className={linkClass} onClick={() => setMobileOpen(false)}><span className="kingdom-link-number">{String(index+1).padStart(2,"0")}</span>{label}<span className="kingdom-link-arrow" aria-hidden="true">↗</span></NavLink>)}
        {isStaff && <div className="kingdom-mobile-staff"><p>Équipe</p>{staffLinks}</div>}
        <div className="kingdom-mobile-actions"><NavLink to="/dice" onClick={() => setMobileOpen(false)}>Lancer un dé</NavLink>{user && <button onClick={() => {setMobileOpen(false); logout();}}>Déconnexion</button>}</div>
      </nav>}
      <LiveSessionBanner onAvailabilityChange={setHasSessionAnnouncement} paused={mobileOpen || searchOpen || staffOpen} />
    </header>
    <div className={`kingdom-header-spacer${hasSessionAnnouncement ? " kingdom-header-spacer--announced" : ""}`} />
    {searchOpen && <Suspense fallback={null}><GlobalSearch open onClose={() => setSearchOpen(false)} /></Suspense>}
  </>;
}
