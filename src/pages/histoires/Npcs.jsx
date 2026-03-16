import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getNpcsList, createNpc, updateNpc, deleteNpc, getQuestsList, updateQuest } from "../../services/api";
import { useUser } from "../../context/UserContext";
import { FaMapMarkerAlt, FaUserTie, FaQuestionCircle, FaTimes, FaCommentDots, FaPlus, FaEdit, FaTrash, FaSave, FaImage, FaFilter, FaSortAlphaDown } from "react-icons/fa";
import comtes from "../../data/comtes";

const DEFAULT_NPC = {
  npc_id: "",
  name: "",
  type: "DECO",
  skin: "",
  description: "",
  profile_image: "",
  dialogue: [],
  tags: [],
  enabled: true,
  quest_giver: false,
  region: "Royaume de Renblood"
};

// Liste des régions/villes depuis comtes.js
const getRegions = () => {
  const regions = ["Royaume de Renblood"];
  Object.entries(comtes).forEach(([comte, villes]) => {
    regions.push(comte); // Ajoute le comté
    villes.forEach(v => regions.push(v.ville)); // Ajoute les villes
  });
  return [...new Set(regions)]; // Dédoublonnage
};

export default function Npcs() {
  const { userId, userRank } = useUser();
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNpc, setSelectedNpc] = useState(null);
  
  // États pour l'édition/création
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_NPC);
  
  // États pour l'upload d'image
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Filtres et Tris
  const [filterRegion, setFilterRegion] = useState("Tous");
  const [filterStatus, setFilterStatus] = useState("Tous"); // Tous, Rencontrés, Inconnus
  const [sortBy, setSortBy] = useState("name"); // name, region, met

  const fetchNpcs = async () => {
    setLoading(true);
    try {
      const data = await getNpcsList();
      setNpcs(data || []);
    } catch (error) {
      console.error("Erreur chargement NPCs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNpcs();
  }, []);

  const isAdmin = userRank === "Admin";
  const regionsList = getRegions();

  // --- Filtrage et Tri ---
  const filteredAndSortedNpcs = useMemo(() => {
    let result = npcs.filter(npc => {
      const hasMet = isAdmin || (npc.met_by && npc.met_by.includes(userId));
      
      // Filtre par statut
      if (filterStatus === "Rencontrés" && !hasMet) return false;
      if (filterStatus === "Inconnus" && hasMet) return false;

      // Filtre par région
      if (filterRegion !== "Tous" && npc.region !== filterRegion) return false;

      return true;
    });

    // Tri
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "region") {
        return (a.region || "").localeCompare(b.region || "");
      } else if (sortBy === "met") {
        const aMet = isAdmin || (a.met_by && a.met_by.includes(userId));
        const bMet = isAdmin || (b.met_by && b.met_by.includes(userId));
        return (bMet === aMet) ? 0 : aMet ? -1 : 1; // Rencontrés en premier
      }
      return 0;
    });

    return result;
  }, [npcs, filterRegion, filterStatus, sortBy, isAdmin, userId]);

  // --- Gestion du Formulaire ---
  const handleEditClick = (npc) => {
    setFormData({
      ...DEFAULT_NPC,
      ...npc,
      dialogue: npc.dialogue || [],
      region: npc.region || "Royaume de Renblood"
    });
    setImagePreview(npc.profile_image);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreateClick = () => {
    setFormData({ ...DEFAULT_NPC, npc_id: `npc_${Date.now()}` });
    setImagePreview(null);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleDialogueChange = (e) => {
    const lines = e.target.value.split("\n");
    setFormData(prev => ({ ...prev, dialogue: lines }));
  };

  // --- Gestion Image (Upload + Resize) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;
        const size = Math.min(width, height);
        const sx = (width - size) / 2;
        const sy = (height - size) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, MAX_SIZE, MAX_SIZE);

        const dataUrl = canvas.toDataURL("image/png", 0.8);
        setImagePreview(dataUrl);
        setFormData(prev => ({ ...prev, profile_image: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      // Validation basique
      if (!formData.region) {
        formData.region = "Royaume de Renblood";
      }

      if (isCreating) {
        await createNpc(formData);
      } else {
        await updateNpc(formData.npc_id, formData);
      }
      setIsEditing(false);
      fetchNpcs();
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (npcId, npcName) => {
    try {
      // 1. Vérifier les quêtes liées
      const quests = await getQuestsList();
      const linkedQuests = quests.filter(q => q.npc === npcName || q.npc === npcId);

      if (linkedQuests.length > 0) {
        const questNames = linkedQuests.map(q => q.name).join(", ");
        const dummyName = `dummy-${npcName}`;
        
        const confirmReplace = window.confirm(
          `⚠️ Ce NPC est lié à ${linkedQuests.length} quête(s) :\n${questNames}\n\nVoulez-vous remplacer ce NPC par "${dummyName}" dans ces quêtes avant de le supprimer ?\n(Annuler pour ne rien faire)`
        );

        if (!confirmReplace) return;

        // 2. Remplacer par dummy
        await Promise.all(linkedQuests.map(q => 
          updateQuest(q.questId, { npc: dummyName })
        ));
        
        alert(`✅ NPC remplacé par "${dummyName}" dans ${linkedQuests.length} quête(s).`);
      } else {
        if (!window.confirm("Supprimer ce NPC ?")) return;
      }

      // 3. Supprimer le NPC
      await deleteNpc(npcId);
      fetchNpcs();
      if (selectedNpc?.npc_id === npcId) setSelectedNpc(null);
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression ou du remplacement.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-16 px-4 mb-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4 relative z-10"
        >
          Personnages Non-Joueurs
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
          Rencontrez les habitants de Renblood. Certains vous guideront, d'autres vous vendront des biens précieux.
        </p>
        
        {isAdmin && (
          <div className="mt-6 relative z-10">
            <button 
              onClick={handleCreateClick}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2 mx-auto transition transform hover:scale-105"
            >
              <FaPlus /> Créer un NPC
            </button>
          </div>
        )}
      </div>

      {/* Filtres et Tris */}
      <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-800/50 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center gap-2 text-gray-400">
          <FaFilter /> <span className="font-bold">Filtres :</span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 outline-none"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Rencontrés">Rencontrés</option>
            <option value="Inconnus">Inconnus</option>
          </select>

          <select 
            value={filterRegion} 
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 outline-none"
          >
            <option value="Tous">Toutes les régions</option>
            {regionsList.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-gray-600 mx-2 hidden lg:block" />

          <div className="flex items-center gap-2">
            <FaSortAlphaDown className="text-gray-400" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 outline-none"
            >
              <option value="name">Nom (A-Z)</option>
              <option value="region">Région</option>
              <option value="met">Rencontré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredAndSortedNpcs.map((npc, index) => {
            const hasMet = isAdmin || (npc.met_by && npc.met_by.includes(userId));
            
            return (
              <motion.div
                key={npc.npc_id || index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => hasMet && setSelectedNpc(npc)}
                className={`
                  relative bg-gray-800 rounded-xl overflow-hidden border shadow-lg transition-all group
                  ${hasMet 
                    ? "cursor-pointer border-gray-700 hover:border-purple-500/50 hover:shadow-2xl hover:-translate-y-1" 
                    : "border-gray-800 opacity-60 grayscale cursor-not-allowed"
                  }
                `}
              >
                {/* Image */}
                <div className="h-48 overflow-hidden relative bg-gray-900">
                  {hasMet ? (
                    <img
                      src={npc.profile_image || "/assets/NPCdefault.png"}
                      alt={npc.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => e.target.src = "/assets/NPCdefault.png"}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <FaQuestionCircle size={60} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h2 className="text-xl font-bold text-white drop-shadow-md">
                      {hasMet ? npc.name : "???"}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <FaMapMarkerAlt /> {npc.region || "Lieu inconnu"}
                    </div>
                  </div>

                  {/* Admin Actions Overlay */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditClick(npc); }}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(npc.npc_id, npc.name); }}
                        className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  {hasMet ? (
                    <>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3 italic">
                        "{npc.description || "Pas de description."}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {npc.type && (
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs font-bold text-gray-300 border border-gray-600">
                            {npc.type}
                          </span>
                        )}
                        {npc.quest_giver && (
                          <span className="px-2 py-1 bg-yellow-900/30 text-yellow-500 rounded text-xs font-bold border border-yellow-600/30">
                            Quête
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      Vous n'avez pas encore rencontré ce personnage.
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal Détails */}
      <AnimatePresence>
        {selectedNpc && !isEditing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNpc(null)}
          >
            <motion.div
              className="bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-600 overflow-hidden relative flex flex-col md:flex-row"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedNpc(null)}
                className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition"
              >
                <FaTimes />
              </button>

              {/* Image Side */}
              <div className="md:w-2/5 h-64 md:h-auto relative bg-gray-900">
                <img
                  src={selectedNpc.profile_image || "/assets/NPCdefault.png"}
                  alt={selectedNpc.name}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = "/assets/NPCdefault.png"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent md:bg-gradient-to-l" />
              </div>

              {/* Content Side */}
              <div className="p-8 md:w-3/5 flex flex-col">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white mb-1">{selectedNpc.name}</h2>
                  <p className="text-purple-400 flex items-center gap-2 text-sm font-medium">
                    <FaMapMarkerAlt /> {selectedNpc.region || "Royaume de Renblood"}
                  </p>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <FaUserTie /> Description
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedNpc.description || "Aucune description disponible."}
                  </p>
                </div>

                {selectedNpc.dialogue && selectedNpc.dialogue.length > 0 && (
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                      <FaCommentDots /> Dialogues connus
                    </h3>
                    <ul className="space-y-2">
                      {selectedNpc.dialogue.map((line, i) => (
                        <li key={i} className="text-sm text-gray-300 italic border-l-2 border-purple-500 pl-3">
                          "{line}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-auto pt-6 flex gap-2">
                  {selectedNpc.type && (
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-bold text-white border border-gray-600">
                      {selectedNpc.type}
                    </span>
                  )}
                  {selectedNpc.quest_giver && (
                    <span className="px-3 py-1 bg-yellow-600/20 text-yellow-500 rounded-full text-xs font-bold border border-yellow-600/40">
                      Donneur de quête
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Édition / Création */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              className="bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-600 overflow-hidden flex flex-col max-h-[90vh]"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {isCreating ? "Créer un NPC" : "Modifier le NPC"}
                </h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ID Unique</label>
                  <input 
                    type="text" name="npc_id" value={formData.npc_id} onChange={handleFormChange} disabled={!isCreating}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-purple-500 outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom</label>
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleFormChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                    <select name="type" value={formData.type} onChange={handleFormChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white">
                      <option value="DECO">Décoration</option>
                      <option value="SHOPKEEPER">Marchand</option>
                      <option value="QUEST">Quête</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Région</label>
                    <select 
                      name="region" 
                      value={formData.region} 
                      onChange={handleFormChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-purple-500 outline-none"
                    >
                      {regionsList.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Upload Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Image de profil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-900 rounded-lg overflow-hidden border border-gray-600 flex-shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600"><FaUserTie /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current.click()}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm flex items-center gap-2 transition"
                      >
                        <FaImage /> Choisir une image
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Sera redimensionnée en 256x256</p>
                    </div>
                  </div>
                  {/* Canvas caché pour le traitement */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                  <textarea 
                    name="description" value={formData.description} onChange={handleFormChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-20 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Dialogues (un par ligne)</label>
                  <textarea 
                    value={formData.dialogue.join("\n")} onChange={handleDialogueChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-24 focus:border-purple-500 outline-none"
                    placeholder="Bonjour !&#10;Comment allez-vous ?"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="quest_giver" checked={formData.quest_giver} onChange={handleFormChange} className="w-4 h-4" />
                    <span className="text-sm text-gray-300">Donneur de quête</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleFormChange} className="w-4 h-4" />
                    <span className="text-sm text-gray-300">Activé</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 bg-gray-900 flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white">Annuler</button>
                <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold shadow-lg">
                  <FaSave /> Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
