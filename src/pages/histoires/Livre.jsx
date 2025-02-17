import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import livre1Img from "../../../public/livres/livre1.png";
import livre2Img from "../../../public/livres/livre2.png";


function Livre() {
  const navigate = useNavigate();
  const [livreSelectionne, setLivreSelectionne] = useState(null);

  const livres = [
    { id: 1, titre: "📜 Chroniques de Renblood", description: "L'Histoire du Royaume de Renblood (0 - 321)", image: livre1Img },
    { id: 2, titre: "📖 Les voies de la Connaisance et de l'Éveil", description: "Les mythes et histoires des premiers peuples.", image: livre2Img },
  ];

  return (
    <div className="p-10 text-center text-gray-200">
      <h1 className="text-4xl font-bold text-white mb-6">📚 Bibliothèque de Renblood</h1>
      <p className="text-lg max-w-3xl mx-auto mb-10">Choisissez un livre pour découvrir son histoire...</p>

      {/* 📖 Sélection des livres */}
      <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
        {livres.map((livre) => (
          <motion.button
            key={livre.id}
            onClick={() => setLivreSelectionne(livre.id)}
            className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex flex-col items-center transition-transform transform hover:scale-105"
            whileHover={{ scale: 1.1 }}
          >
            <img src={livre.image} alt={livre.titre} className="w-56 h-56 mb-4 rounded-md shadow-lg" />
            <span>{livre.titre}</span>
          </motion.button>
        ))}
      </div>

      {/* 📜 Affichage des chapitres après sélection */}
      {livreSelectionne && (
        <motion.div
          className="mt-10 p-6 bg-gray-900 rounded-xl shadow-lg transition-all"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            {livres.find((l) => l.id === livreSelectionne).titre}
          </h2>
          <p className="text-lg mb-4">
            {livres.find((l) => l.id === livreSelectionne).description}
          </p>

          <motion.button
            onClick={() => navigate(`/histoires/livres/${livreSelectionne}/chapitre/1`)}
            className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-lg text-lg font-semibold transition-transform hover:scale-105"
            whileHover={{ scale: 1.1 }}
          >
            📖 Ouvrir le premier chapitre
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default Livre;
