// src/App.js
import { Suspense, useSyncExternalStore } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import routes from "./routes/routes.jsx";
import PrivateRoutes from "./routes/PrivateRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import BackButton from "./components/BackButton";
import LoadingState from "./components/LoadingState";
import "./index.css";
import "./compact-headings.css";
import { subscribeWiki, getWikiRevision } from "./services/wiki.mjs";
import WikiRuntime from "./components/wiki/WikiRuntime";
import AdProvider from "./components/ads/AdProvider";
const AnimatedRoutes = () => {
  const location = useLocation();
  const wikiRevision = useSyncExternalStore(subscribeWiki, getWikiRevision, getWikiRevision);
  const pageKey = location.pathname + (location.pathname.startsWith("/histoires/") ? ":" + wikiRevision : "");
  return <AnimatePresence mode="wait">
      <Routes location={location} key={pageKey}>
        {routes.map(({
        path,
        element,
        private: isPrivate,
        requiredRole
      }, index) => {
        const WrappedElement = <PageTransition>
              <Suspense fallback={<LoadingState message="Chargement de la page..." />}>
                {element}
              </Suspense>
            </PageTransition>;
        return <Route key={index} path={path} element={isPrivate ? <PrivateRoutes requiredRole={requiredRole}>{WrappedElement}</PrivateRoutes> : <PublicRoutes>{WrappedElement}</PublicRoutes>} />;
      })}

        {/* Redirection fallback */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </AnimatePresence>;
};
const App = () => {
  const { pathname } = useLocation();
  const compactHeadings = !["/", "/home", "/home-test"].includes(pathname);
  return <MotionConfig reducedMotion="user"><WikiRuntime>
      <div className={`${compactHeadings ? "site-compact-headings " : ""}flex flex-col min-h-screen bg-[#11110f] text-stone-200`}>
      {/* 👇 NEW: on charge le script AdSense une seule fois pour toute l’app */}
      <AdProvider />

      <Navbar />
      
      {/* Bouton retour global */}
      <BackButton />

      <div className="flex-grow">
        <AnimatedRoutes />
      </div>
      <Footer />
      </div>
    </WikiRuntime></MotionConfig>;
};
export default App;
