import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import guildesData from "../../data/guildes";

function Guildes() {
    const [selectedGuild, setSelectedGuild] = useState(null);

    return (
        <div className="p-10 text-center text-gray-200 relative">
            <h1 className="text-4xl font-bold text-white mb-6">🛡️ Les Guildes de Renblood</h1>
            <p className="text-lg max-w-3xl mx-auto mb-10">
                Découvrez les différentes guildes et leurs rôles au sein du royaume.
            </p>

            {/* 📜 Affichage des cartes des guildes */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto ${selectedGuild ? "hidden" : ""}`}>
                {guildesData.map((guilde) => (
                    <motion.div
                        key={guilde.id} // ✅ Correction de l'erreur "key"
                        onClick={() => setSelectedGuild(guilde)}
                        className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <img src={`/guildes/${guilde.image}`} alt={guilde.name} className="w-32 h-32 object-cover rounded-lg" />
                        <h2 className="text-2xl font-bold mt-4">{guilde.name}</h2>
                    </motion.div>
                ))}
            </div>

            {/* 📖 Affichage des détails d'une guilde sélectionnée */}
            <AnimatePresence>
                {selectedGuild && (
                    <motion.div
                        className="fixed top-0 left-0 w-full h-full flex items-center justify-center p-10 backdrop-blur-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSelectedGuild(null)}
                    >
                        <motion.div
                            className="relative bg-gray-800/90 p-8 rounded-xl shadow-2xl text-white w-full max-w-3xl border border-gray-700"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            onClick={(e) => e.stopPropagation()} // ❌ Empêche la fermeture quand on clique sur la carte
                        >
                            <button
                                onClick={() => setSelectedGuild(null)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-3xl"
                            >
                                ✖
                            </button>

                            <h2 className="text-3xl font-bold mb-4">{selectedGuild.name}</h2>
                            <div className="flex justify-center mb-4">
                                <img src={`/guildes/${selectedGuild.image}`} alt={selectedGuild.name} className="w-40 h-40 object-cover rounded-md shadow-lg" />
                            </div>
                            <p className="text-lg mb-4 whitespace-pre-line">{selectedGuild.description}</p>

                            {/* 📊 Détails des statistiques */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left text-lg">
                                <p><strong>📍 Lieu :</strong> {selectedGuild.location}</p>
                                <p><strong>💰 Fortune :</strong> {selectedGuild.fortune} Gold</p>
                                <p><strong>⭐ Réputation :</strong> {selectedGuild.reputation}</p>
                                <p><strong>👥 Membres :</strong> {selectedGuild.members}</p>
                                <p><strong>🏛️ Bâtiments :</strong> {selectedGuild.buildings}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* 📜 Encadré des rôles globaux */}
            <div className="mt-12 p-6 bg-gray-800 text-white rounded-lg shadow-lg max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-center">🌍 Rôles et Responsabilités</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {guildesData.globalRoles.map((role, index) => (
                        <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">{role.role}</h3>
                            <div className="text-gray-300">
                                {role.actions.map((action, i) => (
                                    <p key={i} className="text-gray-400">{action}</p> // ✅ Plus de points
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

    );
}

export default Guildes;
