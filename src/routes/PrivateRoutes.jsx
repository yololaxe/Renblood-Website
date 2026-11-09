import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";

const roleHierarchy = {
  "Esclave": 0,
  "Etranger": 1,
  "Villageois": 2,
  "Citoyen": 3,
  "Citoyen Libre": 4,
  "Patricien": 5,
  "Noble": 6,
  "Seigneur": 7,
  "Vicompte": 8,
  "Compte": 9,
  "Marquis": 10,
  "Moderateur": 11,
  "Admin": 12,
};

const PrivateRoutes = ({ children, requiredRole = "Utilisateur" }) => {
  const { userId, userRank, firebaseUser, onboarding, authStatus } = useUser();
  if (authStatus === "loading") return <p role="status" className="realm-content registration-loading">Ouverture de votre dossier…</p>;
  if (!firebaseUser || authStatus === "error" || !userId) return <Navigate to="/auth" replace />;
  if (!onboarding?.player_ready || !userRank) return <Navigate to={onboarding?.needs_onboarding ? "/welcome" : "/account/profile"} replace />;

  const minimum = requiredRole === "Utilisateur" ? roleHierarchy.Esclave : roleHierarchy[requiredRole];
  const rank = roleHierarchy[userRank];
  if (rank === undefined || minimum === undefined || rank < minimum) {
    return <Navigate to="/unauthorized" />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoutes;
