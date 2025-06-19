// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../data/firebaseConfig";
import { me } from "../services/api";

const UserContext = createContext({
  userId: null,
  userRank: null,
  setUserId: () => {},
  setUserRank: () => {},
});

export function UserProvider({ children }) {
  // 1) Démarrage depuis sessionStorage (si l’user était déjà identifié)
  const [userId, setUserId] = useState(() => sessionStorage.getItem("userId") || null);
  const [userRank, setUserRank] = useState(() => sessionStorage.getItem("userRank") || null);
  const [loading, setLoading] = useState(true);

  // 2) Sync dans sessionStorage dès que userId / userRank changent
  useEffect(() => {
    if (userId) sessionStorage.setItem("userId", userId);
    else sessionStorage.removeItem("userId");

    if (userRank) sessionStorage.setItem("userRank", userRank);
    else sessionStorage.removeItem("userRank");
  }, [userId, userRank]);

  // 3) À la première montée, on écoute Firebase pour récupérer à chaque chargement l’UID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      if (!fbUser) {
        // pas de session Firebase → on reset le contexte
        setUserId(null);
        setUserRank(null);
        setLoading(false);
        return;
      }

      // on a un utilisateur, on le stocke
      setUserId(fbUser.uid);

      try {
        // on appelle votre endpoint me() pour récupérer le rôle
        const data = await me(fbUser.uid);
        setUserRank(data.rank);
      } catch (err) {
        console.error("❌ Impossible de récupérer le profil:", err);
        setUserRank(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 4) Si on est encore en train de charger, on affiche un loader global
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Chargement…
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ userId, userRank, setUserId, setUserRank }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook d’accès dans vos composants
export function useUser() {
  return useContext(UserContext);
}
