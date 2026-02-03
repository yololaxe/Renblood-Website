import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Ne pas afficher sur la page d'accueil pour éviter la confusion
  if (location.pathname === "/home" || location.pathname === "/") {
    return null;
  }

  const handleGoBack = () => {
    // Vérifie s'il y a un historique de navigation dans la session actuelle
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // Fallback : si pas d'historique (ex: lien direct), retour à l'accueil
      navigate("/home");
    }
  };

  return (
    <motion.button
      onClick={handleGoBack}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed top-24 left-6 z-40 p-3 bg-gray-800/80 backdrop-blur-sm text-white rounded-full shadow-lg border border-gray-700 hover:bg-gray-700 transition-all group"
      aria-label="Retour"
    >
      <FaArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
    </motion.button>
  );
};

export default BackButton;
