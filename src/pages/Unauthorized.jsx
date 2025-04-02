import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1 className="text-4xl font-bold text-red-500 mb-4">⛔ Accès refusé</h1>
      <p className="text-lg mb-6">
        Tu n’as pas les droits requis pour accéder à cette page.
      </p>
      <Link
        to="/"
        className="text-sm bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg"
      >
        Retour à l'accueil
      </Link>
    </motion.div>
  );
};

export default Unauthorized;
