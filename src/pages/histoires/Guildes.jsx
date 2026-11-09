import RealmHeader from "../../components/RealmHeader";
// src/pages/Guildes.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStaticGuilds, getStaticCatalog } from "../../data/catalog";
import EmptyState from "../../components/ui/EmptyState";
import { FaUsers, FaMapMarkerAlt, FaCoins, FaStar, FaBuilding, FaUserTie, FaTimes, FaGlobe } from "react-icons/fa";

export default function Guildes() {
  const [selectedGuild, setSelectedGuild] = useState(null);

  const guildesList = useMemo(() => getStaticGuilds(), []);
  const globalRoles = useMemo(() => getStaticCatalog("guildRoles"), []);

  if (!guildesList.length) {
    return (
      <div className="min-h-screen bg-[#11110f] px-6 py-20 text-stone-200">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            title="Aucune guilde disponible"
            message="Le catalogue des guildes est vide pour le moment. Vérifie la source de données ou réessaie plus tard."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11110f] text-stone-200 pb-20">
      
      {/* Hero Header */}
      <RealmHeader eyebrow="Le royaume / Organisations" title="Guildes & Organisations" description="Les piliers économiques et sociaux du royaume. Rejoignez une confrérie et gravissez les échelons." />

      {/* Grid des Guildes */}
      <div className="max-w-[1680px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {guildesList.map((g, index) => (
          <motion.div
            key={g.id || index}
            layoutId={`guild-${g.id || index}`}
            onClick={() => setSelectedGuild(g)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -10 }}
            className="group cursor-pointer bg-[#1b1b17] rounded-sm overflow-hidden shadow-none border border-stone-700 hover:border-green-500/50 transition-all"
          >
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
              <img
                src={`/guildes/${g.image}`}
                alt={g.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => e.target.src = "/guildes/default.png"}
              />
              <div className="absolute bottom-4 left-4 z-20">
                <h2 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">{g.name}</h2>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center text-sm text-stone-400 bg-[#1b1b17]">
              <span className="flex items-center gap-2"><FaMapMarkerAlt /> {g.location || "Inconnu"}</span>
              <span className="flex items-center gap-2"><FaUsers /> {g.members || 0}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Section Rôles Globaux */}
      {globalRoles.length > 0 && (
        <div className="max-w-[1520px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-stone-700 pb-4">
            <FaGlobe className="text-amber-300" /> Rôles et Responsabilités
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {globalRoles.map((role, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01 }}
                className="bg-[#1b1b17] rounded-sm p-6 border border-stone-700 hover:border-amber-600/30 transition shadow-md"
              >
                <h4 className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
                  <FaUserTie /> {role.role}
                </h4>
                <ul className="space-y-2">
                  {role.actions.map((act, j) => (
                    <li key={j} className="flex items-start gap-2 text-stone-300 text-sm">
                      <span className="text-blue-500 mt-1">•</span> {act}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Détails */}
      <AnimatePresence>
        {selectedGuild && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGuild(null)}
          >
            <motion.div
              layoutId={`guild-${selectedGuild.id}`}
              className="bg-[#1b1b17] w-full max-w-3xl rounded-sm shadow-none border border-stone-600 overflow-hidden relative flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedGuild(null)}
                className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition"
              >
                <FaTimes />
              </button>

              {/* Image Side */}
              <div className="md:w-2/5 h-64 md:h-auto relative">
                <img
                  src={`/guildes/${selectedGuild.image}`}
                  alt={selectedGuild.name}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = "/guildes/default.png"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent md:bg-gradient-to-l" />
                <div className="absolute bottom-4 left-4 md:hidden">
                  <h2 className="text-3xl font-bold text-white">{selectedGuild.name}</h2>
                </div>
              </div>

              {/* Content Side */}
              <div className="p-8 md:w-3/5 flex flex-col">
                <h2 className="text-3xl font-bold text-white mb-4 hidden md:block">{selectedGuild.name}</h2>
                
                <p className="text-stone-300 mb-8 leading-relaxed flex-grow">
                  {selectedGuild.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <StatItem icon={<FaMapMarkerAlt className="text-red-400"/>} label="QG" value={selectedGuild.location} />
                  <StatItem icon={<FaCoins className="text-yellow-400"/>} label="Fortune" value={selectedGuild.fortune} />
                  <StatItem icon={<FaStar className="text-purple-400"/>} label="Réputation" value={selectedGuild.reputation} />
                  <StatItem icon={<FaUsers className="text-amber-300"/>} label="Membres" value={selectedGuild.members} />
                  <StatItem icon={<FaBuilding className="text-orange-400"/>} label="Bâtiments" value={selectedGuild.buildings} colSpan />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

const StatItem = ({ icon, label, value, colSpan }) => (
  <div className={`bg-[#11110f]/50 p-3 rounded-lg border border-stone-700 flex items-center gap-3 ${colSpan ? "col-span-2" : ""}`}>
    <div className="text-lg">{icon}</div>
    <div>
      <span className="block text-xs text-stone-500 uppercase font-bold">{label}</span>
      <span className="text-white font-medium">{value || "-"}</span>
    </div>
  </div>
);
