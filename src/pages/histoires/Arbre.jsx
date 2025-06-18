// src/pages/Arbre.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";
import { motion, AnimatePresence } from "framer-motion";
import { getYearAndSeason } from "../../services/api";    // ← changement ici
import { MoneyDisplay } from "../../components/MoneyDisplay";
import familles from "../../data/famille";
import personnages from "../../data/personnages";

export default function Arbre() {
  const { famille } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [selectedNode, setSelectedNode] = useState(null);
  // on conserve désormais year, season (numéro) et label (Printemps, Été…)
  const [globalData, setGlobalData] = useState({
    year: null,
    season: null,
    label: "",
  });

  const data = familles[famille];
  const accent = data?.couleur || "#38bdf8";

  // 🌱 Récupère year, season et label
  useEffect(() => {
    getYearAndSeason()
      .then(setGlobalData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Famille introuvable
        </h1>
        <button
          onClick={() => navigate("/histoires/familles")}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition"
        >
          ← Retour
        </button>
      </div>
    );
  }

  return (
    // le parent doit rester `relative` pour que le panneau détail colle sous la navbar
    <div className="relative min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="text-center py-8 px-4">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent
                     bg-gradient-to-r from-green-300 to-blue-400 inline-block"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          🌳 Arbre de {data.nom}
        </motion.h1>

        {data.description && (
          <motion.p
            className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {data.description}
          </motion.p>
        )}

        {globalData.year !== null && (
          <motion.p
            className="mt-1 text-sm text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {globalData.label} {globalData.year}
          </motion.p>
        )}
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* TREE VIEW */}
        <div ref={containerRef} className="flex-1">
          <Tree
            data={data.data}
            orientation="vertical"
            pathFunc="step"
            separation={{ siblings: 1.2, nonSiblings: 2 }}
            translate={{
              x: (containerRef.current?.clientWidth || 0) / 2,
              y: 80,
            }}
            nodeSize={{ x: 200, y: 100 }}
            zoomable
            collapsible={false}
            renderCustomNodeElement={({ nodeDatum }) => {
              const label = nodeDatum.name;
              return (
                <motion.g
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedNode(nodeDatum)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r={20}
                    fill={
                      selectedNode?.keyName === nodeDatum.keyName
                        ? "#fde047"
                        : accent
                    }
                    stroke="#111"
                    strokeWidth="3"
                  />
                  <text
                    x={0}
                    y={-30}
                    fill="#fff"
                    stroke="none"
                    fontSize="14px"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="600"
                    textAnchor="middle"
                    style={{ pointerEvents: "none" }}
                  >
                    {label}
                  </text>
                </motion.g>
              );
            }}
          />
        </div>
      </div>

      {/* DETAIL SIDE PANEL */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="absolute top-0 right-0 h-full w-80 bg-gray-800 shadow-2xl z-10 p-6 overflow-auto"
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-200 mb-4 text-2xl"
            >
              ✖
            </button>
            {(() => {
              const key = selectedNode.keyName;
              const p = personnages[key];
              if (!p) {
                return (
                  <p className="text-center text-gray-500">Aucune info</p>
                );
              }
              const age =
                p.born > 0 && globalData.year
                  ? `${globalData.year - p.born} ans`
                  : null;
              return (
                <div className="space-y-4">
                  <h2
                    className="text-2xl font-bold text-center"
                    style={{ color: accent }}
                  >
                    {key}
                  </h2>
                  <p className="text-gray-300 text-center">
                    {p.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div>
                      <strong>🏅 Titre :</strong> {p.titre || "—"}
                    </div>
                    <div>
                      <strong>⚔ Métier :</strong> {p.metier || "—"}
                    </div>
                    <div>
                      <strong>💍 Conjoint(e) :</strong> {p.conjoint || "—"}
                    </div>
                    <div>
                      <strong>💰 Argent :</strong>{" "}
                      {p.argent > -1 ? (
                        <MoneyDisplay value={p.argent * 262144} />
                      ) : (
                        "—"
                      )}
                    </div>
                    <div>
                      <strong>⭐ Réputation :</strong>{" "}
                      {p.reputation > -1 ? p.reputation : "—"}
                    </div>
                    <div>
                      <strong>📅 Né(e) :</strong>{" "}
                      {p.born > 0 ? p.born : "Inconnu"}
                    </div>
                    <div>
                      <strong>💀 Mort(e) :</strong>{" "}
                      {p.death === -1
                        ? "Vivant"
                        : p.death === -2
                        ? "Inconnu"
                        : p.death}
                    </div>
                    {age && (
                      <div>
                        <strong>🧓 Âge :</strong> {age}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
