// src/pages/histoires/Familles.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCity, FaShieldAlt, FaHorse, FaDragon, FaHome, FaHatWizard, FaShip, FaCoins, FaCrown, FaFire, FaTimes, FaSitemap } from "react-icons/fa";

// 📜 Liste des familles avec leurs détails
const familles = [
  {
    id: 1,
    nom: "Rollingford",
    comté: "Mofrage",
    ville: "Triomphe",
    symbole: "Ours",
    blason: "/blasons/rollingford.png",
    argent: 210,
    armee: 3200,
    chevaux: 1200,
    dragons: 3,
    batiments: 60,
    magiciens: 300,
    navires: 150,
    relationRoyale: 100,
    puissance: 16010,
    description:
      "Les Rollingford sont une famille puissante et influente du comté de Mofrage, connue pour leur force militaire et leur influence royale.",
  },
  {
    id: 2,
    nom: "Chalk",
    comté: "Mofrage",
    ville: "Sylinore",
    symbole: "Arc",
    blason: "/blasons/chalk.png",
    argent: 75,
    armee: 300,
    chevaux: 150,
    dragons: 0,
    batiments: 50,
    magiciens: 110,
    navires: 0,
    relationRoyale: 35,
    puissance: 4305,
    description:
      "Les Chalk sont des érudits et des archers redoutables, souvent alliés aux magiciens du royaume.",
  },
  {
    id: 3,
    nom: "Feran",
    comté: "Mofrage",
    ville: "Isvanore",
    symbole: "Livre",
    blason: "/blasons/feran.png",
    argent: 130,
    armee: 700,
    chevaux: 150,
    dragons: 0,
    batiments: 40,
    magiciens: 110,
    navires: 80,
    relationRoyale: 30,
    puissance: 3830,
    description:
      "Les Feran sont les gardiens du savoir et de la culture, réputés pour leur érudition et leurs bibliothèques.",
  },
  {
    id: 4,
    nom: "Banefort",
    comté: "Eldia",
    ville: "Fyvelune",
    symbole: "Âne",
    blason: "/blasons/banefort.png",
    argent: 220,
    armee: 1000,
    chevaux: 2400,
    dragons: 0,
    batiments: 120,
    magiciens: 40,
    navires: 60,
    relationRoyale: 40,
    puissance: 12640,
    description:
      "Les Banefort sont des seigneurs agricoles et marchands influents, possédant d'immenses terres fertiles et un important réseau commercial.",
  },
  {
    id: 5,
    nom: "Rok",
    comté: "Eldia",
    ville: "Saint Toufion de Paume",
    symbole: "Roue",
    blason: "/blasons/rok.png",
    argent: 250,
    armee: 800,
    chevaux: 1000,
    dragons: 0,
    batiments: 60,
    magiciens: 55,
    navires: 30,
    relationRoyale: 30,
    puissance: 9060,
    description:
      "Les Rok sont des stratèges et ingénieurs, experts en sièges et en constructions militaires, jouant un rôle clé dans la défense du royaume.",
  },
  {
    id: 6,
    nom: "Wyne",
    comté: "Palam",
    ville: "Circos",
    symbole: "Dragon",
    blason: "/blasons/wyne.png",
    argent: 180,
    armee: 1400,
    chevaux: 900,
    dragons: 11,
    batiments: 30,
    magiciens: 135,
    navires: 40,
    relationRoyale: 30,
    puissance: 14090,
    description:
      "Les Wyne sont des seigneurs draconiques, maîtres dans l'élevage et le dressage des dragons, leur conférant une puissance inégalée sur le champ de bataille.",
  },
  {
    id: 7,
    nom: "Roxton",
    comté: "Palam",
    ville: "Rozdru",
    symbole: "Navire",
    blason: "/blasons/roxton.png",
    argent: 120,
    armee: 1500,
    chevaux: 250,
    dragons: 10,
    batiments: 50,
    magiciens: 30,
    navires: 50,
    relationRoyale: 15,
    puissance: 7610,
    description:
      "Les Roxton sont une famille de navigateurs et de conquérants, à l’origine de nombreuses batailles navales et explorations maritimes.",
  },
  {
    id: 8,
    nom: "Lynster",
    comté: "Cornwall",
    ville: "Colrac",
    symbole: "Loup",
    blason: "/blasons/linster.png",
    argent: 220,
    armee: 1000,
    chevaux: 1900,
    dragons: 0,
    batiments: 30,
    magiciens: 40,
    navires: 40,
    relationRoyale: 15,
    puissance: 9360,
    description:
      "Les Linster sont des seigneurs du Nord, réputés pour leur résilience et leurs capacités de survie dans les conditions les plus rudes.",
  },
  {
    id: 9,
    nom: "Goodbrook",
    comté: "Cornwall",
    ville: "Moria",
    symbole: "Hache",
    blason: "/blasons/goodbrook.png",
    argent: 130,
    armee: 800,
    chevaux: 400,
    dragons: 0,
    batiments: 15,
    magiciens: 30,
    navires: 15,
    relationRoyale: 10,
    puissance: 4640,
    description:
      "Les Goodbrook sont une lignée de nains forgerons, maîtres de l’artisanat et des souterrains, produisant les armes et armures les plus redoutables du royaume.",
  },
];

export default function Familles() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-16 px-4 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-600 mb-4 relative z-10"
        >
          Grandes Familles
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
          Découvrez l’histoire, la puissance et les alliances des dynasties qui façonnent Renblood.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {familles.map((f, index) => (
          <motion.div
            key={f.id}
            layoutId={`family-${f.id}`}
            onClick={() => setSelected(f)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group cursor-pointer bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 shadow-lg hover:shadow-2xl transition-all flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gray-700 p-1 border-2 border-gray-600 group-hover:border-purple-500 transition-colors mb-4">
              <img
                src={f.blason}
                alt={f.nom}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{f.nom}</h2>
            <p className="text-sm text-gray-400 flex items-center gap-2 justify-center mb-4">
              <FaMapMarkerAlt /> {f.comté}, {f.ville}
            </p>
            <div className="w-full h-px bg-gray-700 mb-4" />
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 w-full">
              <div className="flex items-center gap-1 justify-center bg-gray-900/50 py-1 rounded"><FaShieldAlt /> {f.armee}</div>
              <div className="flex items-center gap-1 justify-center bg-gray-900/50 py-1 rounded"><FaCoins /> {f.argent}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Détails */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              layoutId={`family-${selected.id}`}
              className="bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-600 overflow-hidden relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="relative bg-gradient-to-r from-purple-900 to-indigo-900 p-8 text-center">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition"
                >
                  <FaTimes />
                </button>
                <img
                  src={selected.blason}
                  alt={selected.nom}
                  className="w-32 h-32 object-contain mx-auto mb-4 drop-shadow-xl"
                />
                <h2 className="text-4xl font-bold text-white">{selected.nom}</h2>
                <p className="text-purple-200 mt-2 flex items-center justify-center gap-2">
                  <FaMapMarkerAlt /> {selected.comté} • {selected.ville}
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-300 mb-8 text-center italic leading-relaxed border-l-4 border-purple-500 pl-4 bg-gray-900/30 py-4 rounded-r-lg">
                  "{selected.description}"
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  <StatItem icon={<FaShieldAlt className="text-red-400"/>} label="Armée" value={selected.armee} />
                  <StatItem icon={<FaHorse className="text-yellow-600"/>} label="Chevaux" value={selected.chevaux} />
                  <StatItem icon={<FaDragon className="text-green-500"/>} label="Dragons" value={selected.dragons} />
                  <StatItem icon={<FaHome className="text-blue-400"/>} label="Bâtiments" value={selected.batiments} />
                  <StatItem icon={<FaHatWizard className="text-purple-400"/>} label="Magiciens" value={selected.magiciens} />
                  <StatItem icon={<FaShip className="text-cyan-400"/>} label="Navires" value={selected.navires} />
                  <StatItem icon={<FaCoins className="text-yellow-400"/>} label="Argent" value={selected.argent} />
                  <StatItem icon={<FaCrown className="text-yellow-500"/>} label="Relation" value={`${selected.relationRoyale}%`} />
                  <StatItem icon={<FaFire className="text-orange-500"/>} label="Puissance" value={selected.puissance} colSpan />
                </div>

                <button
                  onClick={() => navigate(`/histoires/arbre/${selected.nom.toLowerCase()}`)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaSitemap /> Voir l’Arbre Généalogique
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

const StatItem = ({ icon, label, value, colSpan }) => (
  <div className={`bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex flex-col items-center ${colSpan ? "sm:col-span-3 bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30" : ""}`}>
    <div className="text-xl mb-1">{icon}</div>
    <span className="text-xs text-gray-500 uppercase font-bold">{label}</span>
    <span className="text-white font-mono font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</span>
  </div>
);
