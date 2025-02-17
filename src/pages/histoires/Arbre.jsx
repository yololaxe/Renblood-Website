import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";
import familles from "../../data/familles";
import personnages from "../../data/personnages"; // ✅ Importation des personnages
import { motion } from "framer-motion"; // ✅ Import Framer Motion

function Arbre() {
    const { famille } = useParams();

    const navigate = useNavigate();
    const [selectedNode, setSelectedNode] = useState(null);

    // Vérifie si la famille existe dans les données
    const familleData = familles[famille];

    if (!familleData) {
        return (
            <div className="text-center text-red-500 p-10">
                <h1 className="text-3xl font-bold">❌ Famille introuvable</h1>
                <button
                    onClick={() => navigate("/histoires/familles")}
                    className="mt-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-lg text-lg"
                >
                    🔙 Retour à la liste des familles
                </button>
            </div>
        );
    }

    const couleurFamille = familleData.couleur || "#ffffff"; // ✅ Utilisation de la couleur définie

    // console.log("📌 Affichage de la carte ?");
    // console.log("✅ selectedNode défini :", !!selectedNode);
    // console.log("✅ selectedNode.keyName défini :", !!selectedNode?.keyName);
    // console.log("✅ Trouvé dans personnages.js :", personnages.hasOwnProperty(selectedNode?.keyName));
    return (
        <div className="relative bg-gray-900 text-white min-h-screen p-6">
            <h1 className="text-4xl font-bold text-center mb-6" style={{ color: couleurFamille }}>
                🌳 Arbre de la famille {familleData.nom}
            </h1>
            <p className="text-lg text-center mb-6 max-w-3xl mx-auto">{familleData.description}</p>

            {/* Conteneur de l'arbre */}
            <div className="flex justify-center">
                <div style={{ width: "80vw", height: "70vh" }}>
                    <Tree
                        data={familleData.data}
                        orientation="vertical"
                        pathFunc="step"
                        separation={{ siblings: 1.5, nonSiblings: 2 }}
                        translate={{ x: 400, y: 100 }}
                        nodeSize={{ x: 200, y: 100 }}
                        zoomable={true}
                        collapsible={false}
                        initialDepth={10}
                        renderCustomNodeElement={({ nodeDatum }) => (
                            <motion.g
                                whileHover={{ scale: 1.2 }} // ✅ Agrandit légèrement au survol
                                whileTap={{ scale: 0.9 }} // ⬇️ Effet de clic
                                onClick={() => {
                                    setSelectedNode(nodeDatum);
                                }}
                            >
                                {/* 🔵 Cercle du nœud */}
                                <motion.circle
                                    r={20}
                                    fill={selectedNode && selectedNode.keyName === nodeDatum.keyName ? "#ffcc00" : couleurFamille}
                                    stroke="#111111"
                                    strokeWidth="4"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />

                                {/* Texte à côté du cercle */}
                                <text
                                    x={30}
                                    y={5}
                                    fill="white"
                                    fontSize="14px"
                                    textAnchor="start"
                                    fontWeight="bold"
                                    strokeWidth="0"
                                >
                                    {nodeDatum.name}
                                </text>
                            </motion.g>
                        )}
                    />

                    {/* 📌 Affichage de la carte du personnage au clic */}
                    {selectedNode?.keyName && personnages[selectedNode.keyName] && (
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-md"
                            onClick={() => setSelectedNode(null)}
                            style={{ backdropFilter: "blur(8px)" }}
                            initial={{ opacity: 0 }} // 🔥 Animation au début
                            animate={{ opacity: 1 }} // 🎬 Transition fluide
                            exit={{ opacity: 0 }} // ❌ Disparition fluide
                        >
                            <motion.div
                                className="bg-gray-800 p-6 rounded-lg shadow-lg relative max-w-md w-full border-2"
                                style={{ borderColor: couleurFamille }}
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.8, y: 50 }} // ⬇️ Animation au début
                                animate={{ opacity: 1, scale: 1, y: 0 }} // 🎬 Transition fluide
                                exit={{ opacity: 0, scale: 0.8, y: 50 }} // ❌ Disparition fluide
                                transition={{ duration: 0.3, ease: "easeOut" }} // ⏳ Douce transition
                            >
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition-transform hover:scale-110"
                                >
                                    ✖
                                </button>

                                {/* 🔥 Récupération des infos depuis `personnages.js` */}
                                <h2 className="text-2xl font-bold text-center" style={{ color: couleurFamille }}>
                                    {selectedNode.keyName}
                                </h2>
                                <p className="text-center text-gray-300">
                                    📜 {personnages[selectedNode.keyName]?.description || "Aucune information disponible."}
                                </p>

                                {/* 📋 Détails du personnage */}
                                <div className="bg-gray-900 p-4 rounded-md shadow-md">
                                    <p><strong>🏅 Titre :</strong> {personnages[selectedNode.keyName]?.titre || "??"}</p>
                                    <p><strong>📅 Âge :</strong> {personnages[selectedNode.keyName]?.age || "??"}</p>
                                    <p><strong>⚔️ Métier :</strong> {personnages[selectedNode.keyName]?.metier || "??"}</p>
                                    <p><strong>💍 Conjoint(e) :</strong> {personnages[selectedNode.keyName]?.conjoint || "Aucun(e)"}</p>
                                    <p><strong>💰 Argent :</strong> {personnages[selectedNode.keyName]?.argent || "??"} pièces d'or</p>
                                    <p><strong>⭐ Réputation :</strong> {personnages[selectedNode.keyName]?.reputation || "??"}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Arbre;
