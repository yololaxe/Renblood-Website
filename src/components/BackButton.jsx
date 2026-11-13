import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  if (/^\/histoires\/(familles|personnages|arbre|lieux|politique|guildes|livres|lois|titres|notions|chronologie|reperes)(\/|$)/.test(location.pathname)) return null;
  // Ne pas afficher sur la page d'accueil pour éviter la confusion
  if (location.pathname === "/home" || location.pathname === "/" || location.pathname === "/home-test") {
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
  return <motion.button onClick={handleGoBack} initial={{
    opacity: 0,
    x: -20
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: -20
  }} whileHover={{
    scale: 1.1
  }} whileTap={{
    scale: 0.9
  }} className="site-back-button ml-5 my-2 inline-flex min-h-9 items-center gap-2 self-start px-2 text-xs text-stone-400 transition-colors hover:text-amber-300 sm:ml-8 lg:ml-12" aria-label="Retour">
      <FaArrowLeft aria-hidden="true" className="text-xs" /><span>Retour</span>
    </motion.button>;
};
export default BackButton;
