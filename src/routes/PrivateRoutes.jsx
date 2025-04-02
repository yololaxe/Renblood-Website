import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth } from "../data/firebaseConfig";
import { me } from "../services/api";
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
  const [loading, setLoading] = useState(true);
  const { userId, userRank, setUserId, setUserRank } = useUser();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUserId(null);
        setUserRank(null);
        setLoading(false);
        return;
      }

      try {
        const data = await me(user.uid);
        setUserId(data.id);
        setUserRank(data.rank);
      } catch (err) {
        setUserId(null);
        setUserRank(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUserId, setUserRank]);

  if (loading) return <div className="text-center mt-12">Chargement...</div>;

  if (!userId || !userRank) return <Navigate to="/home" />;

  if (requiredRole && roleHierarchy[userRank] < roleHierarchy[requiredRole]) {
    return <Navigate to="/unauthorized" />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoutes;
