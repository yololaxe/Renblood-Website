import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";
import familles from "../../data/famille";
import personnages from "../../data/personnages";
import { motion } from "framer-motion";
import Card from "../../components/Card";
import { getCurrentGlobal } from "../../services/api";
import { MoneyDisplay } from "../../components/MoneyDisplay";


function Arbre() {
    const { famille } = useParams();
    const navigate = useNavigate();
    const [selectedNode, setSelectedNode] = useState(null);
    const [year, setYear] = useState(null);
    const [season, setSeason] = useState(null);

    const familleData = familles[famille];

    useEffect(() => {
        const fetchDate = async () => {
            try {
                const { year, season } = await getCurrentGlobal();
                setYear(year);
                setSeason(season);
            } catch (e) {
                console.error("Erreur chargement date globale", e);
            }
        };
        fetchDate();
    }, []);

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

    const couleurFamille = familleData.couleur || "#ffffff";

    return (
        <div className="relative bg-gray-900 text-white min-h-screen p-6">
            <h1 className="text-4xl font-bold text-center mb-6" style={{ color: couleurFamille }}>
                🌳 Arbre de la famille {familleData.nom}
            </h1>
            <p className="text-lg text-center mb-6 max-w-3xl mx-auto">{familleData.description}</p>

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
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedNode(nodeDatum)}
                            >
                                <motion.circle
                                    r={20}
                                    fill={selectedNode && selectedNode.keyName === nodeDatum.keyName ? "#ffcc00" : couleurFamille}
                                    stroke="#111111"
                                    strokeWidth="4"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
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

                    <Card
                        isOpen={selectedNode?.keyName && personnages[selectedNode.keyName]}
                        onClose={() => setSelectedNode(null)}
                        couleur={couleurFamille}
                    >
                        {(() => {
                            const p = personnages[selectedNode?.keyName];
                            if (!p) return null;
                            return (
                                <>
                                    <h2 className="text-2xl font-bold text-center" style={{ color: couleurFamille }}>
                                        {selectedNode.keyName}
                                    </h2>
                                    <p className="text-center text-gray-300 mb-4">{p.description || "Aucune information disponible."}</p>
                                    <div className="bg-gray-900 p-4 rounded-md shadow-md space-y-2">
                                        <p><strong>🏅 Titre :</strong> {p.titre || "??"}</p>
                                        <p><strong>⚔️ Métier :</strong> {p.metier || "??"}</p>
                                        <p><strong>💍 Conjoint(e) :</strong> {p.conjoint || "Aucun(e)"}</p>
                                        <p><strong>💰 Argent :</strong> {p.argent === -1 || p.argent === "??" ? "??" : <MoneyDisplay value={p.argent*262144} />}</p>
                                        <p><strong>⭐ Réputation :</strong> {p.reputation === -1 || p.reputation === "??" ? "??" : p.reputation}</p>
                                        <p><strong>📅 Né(e) :</strong> {p.born === -1 ? "Inconnu" : p.born}</p>
                                        <p><strong>💀 Mort(e) :</strong> {
                                            p.death === -1 ? "Encore vivant(e)" :
                                            p.death === -2 ? "Inconnu" :
                                            p.death
                                        }</p>
                                        {p.born !== -1 && year && (
                                            <p><strong>🧓 Age:</strong> {year - p.born} ans</p>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Arbre;
