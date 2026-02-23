// src/pages/Arbre.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";
import { motion, AnimatePresence } from "framer-motion";
import { getYearAndSeason } from "../../services/api";
import { MoneyDisplay } from "../../components/MoneyDisplay";
import familles from "../../data/famille";
import personnages from "../../data/personnages";
import { FaTimes, FaUser, FaBriefcase, FaRing, FaCoins, FaStar, FaSkull, FaBirthdayCake, FaInfoCircle } from "react-icons/fa";

export default function Arbre() {
  const { famille } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [selectedNode, setSelectedNode] = useState(null);
  const [globalData, setGlobalData] = useState({ year: null, season: null, label: "" });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const data = familles[famille];
  const accent = data?.couleur || "#38bdf8";

  useEffect(() => {
    getYearAndSeason().then(setGlobalData).catch(console.error);
  }, []);

  // Centrer l'arbre au chargement
  const centerTree = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 6 });
    }
  }, []);

  useEffect(() => {
    centerTree();
    window.addEventListener("resize", centerTree);
    return () => window.removeEventListener("resize", centerTree);
  }, [centerTree]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Famille introuvable</h1>
      </div>
    );
  }

  // Rendu personnalisé des nœuds
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    const isSelected = selectedNode?.name === nodeDatum.name;
    const p = personnages[nodeDatum.keyName];
    const isDead = p?.death !== -1 && p?.death !== -2;

    return (
      <g onClick={() => setSelectedNode(nodeDatum)}>
        <circle 
          r={25} 
          fill={isSelected ? "#F59E0B" : isDead ? "#374151" : accent} 
          stroke={isSelected ? "#fff" : "#1F2937"} 
          strokeWidth={3}
          className="cursor-pointer transition-all duration-300 hover:opacity-80"
        />
        {/* Icône ou Initiale */}
        <text 
          fill="white" 
          stroke="none" // Force no stroke
          x="0" 
          dy="5" 
          fontSize="14" 
          fontWeight="bold" 
          textAnchor="middle"
          className="pointer-events-none"
          style={{ textShadow: "none" }}
        >
          {nodeDatum.name.charAt(0)}
        </text>

        {/* Label simple en blanc sans ombre ni contour */}
        <text 
          fill="white" 
          stroke="none" // Force no stroke
          x="0" 
          y="-35" 
          fontSize="14" 
          fontWeight="bold" 
          textAnchor="middle"
          className="pointer-events-none"
          style={{ textShadow: "none" }}
        >
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden flex flex-col relative">
      
      {/* Header Flottant */}
      <div className="absolute top-20 left-4 z-10 flex items-center gap-4 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur px-6 py-2 rounded-full border border-gray-700 shadow-xl pointer-events-auto ml-16"> {/* ml-16 pour laisser place au bouton retour global */}
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span style={{ color: accent }}>{data.nom}</span>
            {globalData.year && <span className="text-sm font-normal text-gray-400">| {globalData.label} {globalData.year}</span>}
          </h1>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-grow bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-gray-950" ref={containerRef}>
        <Tree
          data={data.data}
          translate={translate}
          zoom={zoom}
          renderCustomNodeElement={renderCustomNode}
          orientation="vertical"
          pathFunc="step"
          separation={{ siblings: 2, nonSiblings: 2.5 }}
          nodeSize={{ x: 200, y: 150 }}
          enableLegacyTransitions={true}
          transitionDuration={300}
          collapsible={false}
        />
      </div>

      {/* Sidebar Détails */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute top-0 right-0 h-full w-full md:w-96 bg-gray-800/95 backdrop-blur-md border-l border-gray-700 shadow-2xl p-6 flex flex-col z-20 overflow-y-auto"
          >
            <button 
              onClick={() => setSelectedNode(null)}
              className="self-end text-gray-400 hover:text-white mb-4 p-2 bg-gray-700 rounded-full"
            >
              <FaTimes size={20} />
            </button>

            {(() => {
              const key = selectedNode.keyName;
              const p = personnages[key];
              
              if (!p) return <p className="text-center text-gray-500 mt-10">Aucune information disponible.</p>;

              const age = p.born > 0 && globalData.year ? globalData.year - p.born : null;
              const isDead = p.death !== -1 && p.death !== -2;

              return (
                <div className="space-y-6">
                  {/* Header Perso */}
                  <div className="text-center">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-bold mb-4 border-4 ${isDead ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-700 border-blue-500 text-white"}`} style={{ borderColor: isDead ? undefined : accent }}>
                      {key.charAt(0)}
                    </div>
                    <h2 className="text-3xl font-bold text-white">{key}</h2>
                    {p.titre && <span className="inline-block bg-gray-900 px-3 py-1 rounded-full text-sm text-yellow-500 mt-2 border border-gray-700">{p.titre}</span>}
                  </div>

                  {/* Description */}
                  <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 relative">
                    <FaInfoCircle className="absolute top-4 right-4 text-gray-500" />
                    <p className="text-gray-300 text-sm leading-relaxed italic">"{p.description}"</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox icon={<FaBriefcase className="text-blue-400"/>} label="Métier" value={p.metier} />
                    <StatBox icon={<FaRing className="text-pink-400"/>} label="Conjoint(e)" value={p.conjoint} />
                    <StatBox icon={<FaCoins className="text-yellow-400"/>} label="Fortune" value={p.argent > -1 ? <MoneyDisplay value={p.argent * 262144} /> : "—"} />
                    <StatBox icon={<FaStar className="text-purple-400"/>} label="Réputation" value={p.reputation > -1 ? p.reputation : "—"} />
                    <StatBox icon={<FaBirthdayCake className="text-green-400"/>} label="Naissance" value={p.born > 0 ? p.born : "?"} />
                    <StatBox icon={<FaSkull className={isDead ? "text-red-500" : "text-gray-500"}/>} label="Statut" value={isDead ? `Mort (${p.death})` : "Vivant"} />
                    {age !== null && !isDead && <StatBox icon={<FaUser className="text-teal-400"/>} label="Âge" value={`${age} ans`} colSpan />}
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

const StatBox = ({ icon, label, value, colSpan }) => (
  <div className={`bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex flex-col items-center text-center ${colSpan ? "col-span-2" : ""}`}>
    <div className="text-lg mb-1">{icon}</div>
    <span className="text-xs text-gray-500 uppercase font-bold">{label}</span>
    <span className="text-white font-medium text-sm truncate w-full">{value || "—"}</span>
  </div>
);
