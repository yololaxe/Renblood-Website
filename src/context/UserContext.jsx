import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { auth } from "../data/firebaseConfig";
import { bootstrapProfile } from "../services/onboardingApi";
import dataCache from "../services/dataCache";

export const UserContext = createContext({});
export function UserProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [authStatus, setAuthStatus] = useState("loading");
  const [authError, setAuthError] = useState("");
  const generation = useRef(0);
  const activeUid = useRef(null);
  const lastSnapshot = useRef(null);

  const acceptProfile = useCallback((result) => {
    if (result.profile.id !== auth.currentUser?.uid) return;
    if (lastSnapshot.current?.profile.id === result.profile.id && lastSnapshot.current.profile.revision > result.profile.revision) return;
    lastSnapshot.current = result;
    setOnboarding(result);
    setUserId(result.profile.id);
    setUserRank(result.rank);
    sessionStorage.removeItem("mcFullProfile");
    dataCache.clear();
  }, []);

  const reloadUser = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    const current = generation.current;
    try {
      const result = await bootstrapProfile(user.uid);
      if (current !== generation.current || auth.currentUser?.uid !== user.uid) return null;
      acceptProfile(result);
      setAuthError("");
      setAuthStatus("ready");
      return result;
    } catch (error) {
      if (current === generation.current) {
        setAuthError(error.message);
        setAuthStatus("error");
      }
      throw error;
    }
  }, [acceptProfile]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
    generation.current++;
    if (activeUid.current !== user?.uid) {
      sessionStorage.removeItem("mcFullProfile");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userRank");
      dataCache.clear();
    }
    activeUid.current = user?.uid || null;
    lastSnapshot.current = null;
    setFirebaseUser(user);
    setOnboarding(null);
    setUserId(user?.uid || null);
    setUserRank(null);
    setAuthError("");
    if (!user) { setAuthStatus("signedout"); return; }
    setAuthStatus("loading");
    reloadUser().catch(() => {});
    });
    return () => { generation.current++; unsubscribe(); };
  }, [reloadUser]);

  useEffect(() => {
    if (userId) sessionStorage.setItem("userId", userId);
    else sessionStorage.removeItem("userId");
    if (userRank) sessionStorage.setItem("userRank", userRank);
    else sessionStorage.removeItem("userRank");
  }, [userId, userRank]);

  return <UserContext.Provider value={{ userId, userRank, setUserId, setUserRank, firebaseUser,
    onboarding, authStatus, authError, reloadUser, acceptProfile }}>{children}</UserContext.Provider>;
}
export const useUser = () => useContext(UserContext);
