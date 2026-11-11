// src/App.js
import { Suspense } from "react";
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
import WikiRuntime from "./components/wiki/WikiRuntime";
import AdProvider from "./components/ads/AdProvider";
const AnimatedRoutes = () => {
  const location = useLocation();
  return <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
  return <MotionConfig reducedMotion="user"><WikiRuntime>
      <div className="flex flex-col min-h-screen bg-[#11110f] text-stone-200">
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
