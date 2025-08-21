// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import routes from "./routes/routes.jsx";
import PrivateRoutes from "./routes/PrivateRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import "./index.css";

// 👇 NEW
import AdProvider from "./components/ads/AdProvider";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routes.map(({ path, element, private: isPrivate, requiredRole }, index) => {
          const WrappedElement = <PageTransition>{element}</PageTransition>;

          return (
            <Route
              key={index}
              path={path}
              element={
                isPrivate ? (
                  <PrivateRoutes requiredRole={requiredRole}>{WrappedElement}</PrivateRoutes>
                ) : (
                  <PublicRoutes>{WrappedElement}</PublicRoutes>
                )
              }
            />
          );
        })}

        {/* Redirection fallback */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      {/* 👇 NEW: on charge le script AdSense une seule fois pour toute l’app */}
      <AdProvider />

      <Navbar />
      <div className="flex-grow">
        <AnimatedRoutes />
      </div>
      <Footer />
    </div>
  );
};

export default App;
