import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  // ✅ Récupère `userId` et `userRank` depuis `sessionStorage` si existants
  const [userId, setUserId] = useState(() => sessionStorage.getItem("userId") || null);
  const [userRank, setUserRank] = useState(() => sessionStorage.getItem("userRank") || null);

  // ✅ Met à jour `sessionStorage` à chaque changement de `userId` ou `userRank`
  useEffect(() => {
    if (userId) sessionStorage.setItem("userId", userId);
    else sessionStorage.removeItem("userId"); // ✅ Supprime si `null`

    if (userRank) sessionStorage.setItem("userRank", userRank);
    else sessionStorage.removeItem("userRank"); // ✅ Supprime si `null`
  }, [userId, userRank]);
  return (
    <UserContext.Provider value={{ userId, setUserId, userRank, setUserRank }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
