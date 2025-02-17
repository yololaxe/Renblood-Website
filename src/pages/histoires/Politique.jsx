import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import politique from "../../data/politique"; // ✅ Import des données

const Politiques = () => {
  console.log("📌 Données Politique :", politique); // ✅ Vérification des données

  if (!politique || !Array.isArray(politique.data)) {
    console.error("❌ Erreur : `politique.data` n'est pas un tableau valide !");
    return <div className="text-center text-red-500 p-6">Erreur de chargement des données.</div>;
  }

  // 📌 Extraire dynamiquement tous les lieux disponibles à partir des rôles
  const lieuxDisponibles = [
    ...new Set(politique.data.flatMap((role) => (role.lieu ? role.lieu : []))) // 🔥 Vérification de `role.lieu`
  ];

  const [lieuSelectionne, setLieuSelectionne] = useState(lieuxDisponibles[0] || ""); // Sélection par défaut

  // 📌 Filtrer les rôles correspondant au lieu sélectionné
  const rolesFiltres = politique.data.filter(
    (role) => Array.isArray(role.lieu) && role.lieu.includes(lieuSelectionne) // ✅ Vérifie si `lieu` est bien défini
  );

  return (
    <div className="table-container">
      <div className="table-content">
        <table className="w-full">
          {/* Contenu du tableau */}


          <div className="bg-gray-900 text-white min-h-screen p-6 overflow-hidden">
            <motion.h1
              className="text-4xl font-bold text-center mb-6 text-yellow-500"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              🏛️ Système Politique
            </motion.h1>

            {/* 🔹 Sélection du lieu */}
            <div className="flex justify-center space-x-4 mb-6">
              {lieuxDisponibles.length > 0 ? (
                lieuxDisponibles.map((lieu, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setLieuSelectionne(lieu)}
                    className={`px-4 py-2 rounded-lg text-lg font-semibold transition ${lieuSelectionne === lieu
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {lieu}
                  </motion.button>
                ))
              ) : (
                <p className="text-center text-gray-400">Aucun lieu disponible.</p>
              )}
            </div>

            {/* 🔹 Affichage des rôles filtrés avec animation */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-700">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-700 px-4 py-2">Titre</th>
                    <th className="border border-gray-700 px-4 py-2">Privilèges</th>
                    <th className="border border-gray-700 px-4 py-2">Rôle</th>
                    <th className="border border-gray-700 px-4 py-2">Arrivée en fonction</th>
                    <th className="border border-gray-700 px-4 py-2">Requis</th>
                    <th className="border border-gray-700 px-4 py-2">Revenu</th>
                    <th className="border border-gray-700 px-4 py-2">Temps</th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait">
                  <motion.tbody
                    key={lieuSelectionne} // Ré-anime la liste au changement de lieu
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {rolesFiltres.length > 0 ? (
                      rolesFiltres.map((role, index) => (
                        <motion.tr
                          key={index}
                          className="border border-gray-700 text-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <td className="border border-gray-700 px-4 py-2 font-bold">{role.titre}</td>
                          <td className="border border-gray-700 px-4 py-2 text-left">
                            <ul className="list-disc list-inside">
                              {role.privileges?.map((privilege, i) => (
                                <li key={i}>{privilege}</li>
                              )) || "Aucun"}
                            </ul>
                          </td>
                          <td className="border border-gray-700 px-4 py-2">{role.role || "Non spécifié"}</td>
                          <td className="border border-gray-700 px-4 py-2">{role.arrivee || "Non spécifié"}</td>
                          <td className="border border-gray-700 px-4 py-2">
                            <ul className="list-disc list-inside">
                              {role.requis?.map((req, i) => (
                                <li key={i}>{req}</li>
                              )) || "Aucun"}
                            </ul>
                          </td>
                          <td className="border border-gray-700 px-4 py-2 font-semibold">{role.revenu || "Non spécifié"}</td>
                          <td className="border border-gray-700 px-4 py-2">{role.temps || "Non spécifié"}</td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td colSpan="7" className="text-center py-4 text-gray-400">
                          Aucun rôle disponible pour ce lieu.
                        </td>
                      </motion.tr>
                    )}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>
          </div>
        </table>
      </div>
    </div>
  );
};

export default Politiques;
