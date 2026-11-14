import { Link, useSearchParams } from "react-router-dom";
import RealmHeader from "../../components/RealmHeader";
import { deletionTarget, npcError } from "../../services/npcActions.mjs";
import { npcDirectory, selectedNpcOption } from "../../services/npcSelection.mjs";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getNpcsList, createNpc, updateNpc, deleteNpc } from "../../services/api";
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
  region: "Royaume de Renblood"
};

const questRoleLabels = {
  START: "Départ",
  COMPLETION: "Validation",
  OBJECTIVE: "Objectif"
};

const npcTypeLabels = { QUEST: "Quêtes", DECO: "Décor", SHOPKEEPER: "Marchand" };

const SKIN_MODES = {
  PLAYER: "PLAYER",
  REFERENCE: "REFERENCE"
};

const getQuestLinkRoles = (link) => link.roles || (link.role ? [link.role] : []);
const getQuestLinkLabel = (link) => link.questName || link.quest_name || link.name || link.questId || link.quest_id;
const getNpcPayload = ({ quest_ids, quest_giver, quest_validator, quests, quest_links, profile_ids, profile_types, ...npc }) => npc;
const isLikelySkinReference = (skin = "") => /[:/\\.]|textures\.minecraft\.net/i.test(skin);

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
  const [searchParams]=useSearchParams();
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [npcNotice, setNpcNotice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const mutationInFlight=useRef(false);
  
  // États pour l'édition/création
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_NPC);
  const [skinMode, setSkinMode] = useState(SKIN_MODES.PLAYER);
  
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
      setNpcs((data || []).map(n=>({...n,enabled:n.configured_enabled??n.enabled})));
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
  useEffect(()=>{const id=searchParams.get("npc");const npc=npcs.find(n=>n.npc_id===id);if(npc&&isAdmin){setFormData(npc);setIsEditing(true);}},[searchParams,npcs,isAdmin]);
  const regionsList = getRegions();
  const directory = useMemo(() => npcDirectory(npcs, { includeArchived: isAdmin }), [npcs, isAdmin]);
  useEffect(() => {
    setSelectedNpc(current => current ? selectedNpcOption(directory, current.npc_id)
      || directory.find(n => current.character_id && n.character_id === current.character_id) || null : null);
  }, [directory]);
  const selectedProfiles = selectedNpc ? npcs.filter(n => selectedNpc.profile_ids?.includes(n.npc_id) || n.npc_id === selectedNpc.npc_id) : [];

  // --- Filtrage et Tri ---
  const filteredAndSortedNpcs = useMemo(() => {
    let result = directory.filter(npc => {
      if(npc.archived&&!isAdmin)return false;
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
  }, [directory, filterRegion, filterStatus, sortBy, isAdmin, userId]);

  // --- Gestion du Formulaire ---
  const handleEditClick = (displayNpc) => {
    const npc = npcs.find(n => n.npc_id === displayNpc.npc_id) || displayNpc;
    setFormData({
      ...DEFAULT_NPC,
      ...npc,
      dialogue: npc.dialogue || [],
      region: npc.region || "Royaume de Renblood"
    });
    setSkinMode(isLikelySkinReference(npc.skin) ? SKIN_MODES.REFERENCE : SKIN_MODES.PLAYER);
    setImagePreview(npc.profile_image);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreateClick = () => {
    setFormData({ ...DEFAULT_NPC, npc_id: `npc_${Date.now()}` });
    setSkinMode(SKIN_MODES.PLAYER);
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
        await createNpc(getNpcPayload(formData));
      } else {
        await updateNpc(formData.npc_id, getNpcPayload(formData));
      }
      setIsEditing(false);
      fetchNpcs();
    } catch (error) {
      setNpcNotice({kind:"error",message:npcError(error,"Enregistrement impossible. Les modifications sont conservées dans le formulaire.")});
    }
  };

  const handleDelete = async (displayNpc) => {
    const npc = npcs.find(n => n.npc_id === displayNpc.npc_id) || displayNpc;
    if(mutationInFlight.current)return;
    try {
      const target=deletionTarget(npc);
      const linked=target.linkedQuests?`\nCe PNJ est lié à ${target.linkedQuests} quête(s). Ses références doivent être vérifiées.`:"";
      if(!window.confirm(`Supprimer ${target.name} (${target.id}) ?${linked}`))return;
      mutationInFlight.current=true;setDeletingId(target.id);setNpcNotice(null);
      const receipt=await deleteNpc(target.id);
      if(!receipt)throw new Error("La suppression n’a pas été confirmée par le serveur.");
      setNpcs(current=>current.filter(row=>row.npc_id!==target.id));
      setIsEditing(false);if(selectedNpc?.npc_id===target.id)setSelectedNpc(null);
      setNpcNotice({kind:"success",message:`${target.name} a été supprimé. La synchronisation du jeu prend effet au prochain échange avec le serveur.`});
    } catch(error) {
      setNpcNotice({kind:"error",message:npcError(error,"Suppression impossible. Le PNJ est conservé.")});
    } finally {mutationInFlight.current=false;setDeletingId(null);}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11110f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11110f] text-stone-200 pb-20">
      
      {npcNotice&&<div role={npcNotice.kind==="error"?"alert":"status"} className={`mx-auto max-w-[1680px] px-5 py-3 text-sm ${npcNotice.kind==="error"?"text-red-300":"text-emerald-300"}`}>{npcNotice.message}<button type="button" className="ml-3 underline" onClick={()=>setNpcNotice(null)}>Fermer</button></div>}
      {/* Hero Header */}
      <RealmHeader eyebrow="Les rencontres / Personnages" title="Personnages Non-Joueurs" description="Rencontrez les habitants de Renblood. Certains vous guideront, d'autres vous vendront des biens précieux.">
        {isAdmin && <Link className="realm-action" to="/admin/characters">Lore & profils de jeu ↗</Link>}
        {isAdmin && <button onClick={handleCreateClick} className="realm-action"><FaPlus /> Créer un NPC</button>}
      </RealmHeader>

      {/* Filtres et Tris */}
      <div className="max-w-[1680px] mx-auto px-6 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#1b1b17]/50 p-4 rounded-sm border border-stone-700">
        <div className="flex items-center gap-2 text-stone-400">
          <FaFilter /> <span className="font-bold">Filtres :</span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-stone-800 text-white px-4 py-2 rounded-lg border border-stone-600 focus:border-purple-500 outline-none"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Rencontrés">Rencontrés</option>
            <option value="Inconnus">Inconnus</option>
          </select>

          <select 
            value={filterRegion} 
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-stone-800 text-white px-4 py-2 rounded-lg border border-stone-600 focus:border-purple-500 outline-none"
          >
            <option value="Tous">Toutes les régions</option>
            {regionsList.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-gray-600 mx-2 hidden lg:block" />

          <div className="flex items-center gap-2">
            <FaSortAlphaDown className="text-stone-400" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-stone-800 text-white px-4 py-2 rounded-lg border border-stone-600 focus:border-purple-500 outline-none"
            >
              <option value="name">Nom (A-Z)</option>
              <option value="region">Région</option>
              <option value="met">Rencontré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1680px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  relative bg-[#1b1b17] rounded-sm overflow-hidden border shadow-none transition-all group
                  ${hasMet 
                    ? "cursor-pointer border-stone-700 hover:border-purple-500/50 hover:shadow-none hover:-translate-y-1" 
                    : "border-stone-800 opacity-60 grayscale cursor-not-allowed"
                  }
                `}
              >
                {/* Image */}
                <div className="h-48 overflow-hidden relative bg-[#11110f]">
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
                    <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                      <FaMapMarkerAlt /> {npc.region || "Lieu inconnu"}
                    </div>
                  </div>

                  {/* Admin Actions Overlay */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); npc.profile_ids.length > 1 ? setSelectedNpc(npc) : handleEditClick(npc); }}
                        aria-label={npc.profile_ids.length > 1 ? `Gérer les profils de ${npc.name}` : `Modifier ${npc.name}`}
                        className="p-2 bg-amber-800 hover:bg-amber-700 text-white rounded-full shadow-none"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          npc.profile_ids.length > 1 ? setSelectedNpc(npc) : handleDelete(npc);
                        }}
                        aria-label={npc.profile_ids.length > 1 ? `Choisir un profil de ${npc.name} à supprimer` : `Supprimer ${npc.name}`} disabled={!!deletingId} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-none disabled:opacity-50"
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
                      <p className="text-sm text-stone-400 line-clamp-2 mb-3 italic">
                        "{npc.description || "Pas de description."}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {npc.profile_types.map(type => (
                          <span key={type} className="px-2 py-1 bg-stone-800 rounded text-xs font-bold text-stone-300 border border-stone-600">
                            {npcTypeLabels[type] || type}
                          </span>
                        ))}
                        {npc.archived && <span className="text-xs text-stone-500">Archivé</span>}
                        {npc.quest_links?.length > 0 && (
                          <span className="px-2 py-1 bg-yellow-900/30 text-amber-300 rounded text-xs font-bold border border-yellow-600/30">
                            {npc.quest_links.length} quête(s)
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-stone-500 italic text-center py-4">
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
              className="bg-[#1b1b17] w-full max-w-2xl max-h-[90dvh] rounded-sm shadow-none border border-stone-600 overflow-y-auto relative flex flex-col md:flex-row"
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
              <div className="md:w-2/5 h-64 md:h-auto relative bg-[#11110f]">
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
                  {selectedNpc.character_id&&<Link className="text-amber-300 underline" to={`/histoires/personnages/${selectedNpc.character_id}`}>Fiche de lore · {selectedNpc.character_name} ↗</Link>}
                  {isAdmin&&<Link className="block text-amber-300 underline text-sm" to={`/admin/characters?npc=${selectedNpc.npc_id}`}>Gérer ses liens / archiver ↗</Link>}
                  <p className="text-purple-400 flex items-center gap-2 text-sm font-medium">
                    <FaMapMarkerAlt /> {selectedNpc.region || "Royaume de Renblood"}
                  </p>
                </div>
                
                <div className="bg-[#11110f]/50 p-4 rounded-sm border border-stone-700 mb-6">
                  <h3 className="text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-2">
                    <FaUserTie /> Description
                  </h3>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    {selectedNpc.description || "Aucune description disponible."}
                  </p>
                </div>

                {selectedNpc.dialogue && selectedNpc.dialogue.length > 0 && (
                  <div className="bg-[#11110f]/50 p-4 rounded-sm border border-stone-700">
                    <h3 className="text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-2">
                      <FaCommentDots /> Dialogues connus
                    </h3>
                    <ul className="space-y-2">
                      {selectedNpc.dialogue.map((line, i) => (
                        <li key={i} className="text-sm text-stone-300 italic border-l-2 border-purple-500 pl-3">
                          "{line}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedNpc.quest_links?.length > 0 && (
                  <div className="bg-[#11110f]/50 p-4 rounded-sm border border-stone-700 mt-4">
                    <h3 className="text-xs font-bold text-stone-500 uppercase mb-2">Quêtes liées</h3>
                    <ul className="space-y-2">
                      {selectedNpc.quest_links.map((link, index) => (
                        <li key={`${link.questId || link.quest_id || index}`} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-stone-300">{getQuestLinkLabel(link)}</span>
                          <span className="flex flex-wrap justify-end gap-1">
                            {getQuestLinkRoles(link).map(role => (
                              <span key={role} className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 text-xs font-bold">
                                {questRoleLabels[role] || role}
                              </span>
                            ))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isAdmin && selectedProfiles.length > 1 && (
                  <div className="mt-6 border-t border-stone-700 pt-4">
                    <h3 className="text-xs font-bold text-stone-400 uppercase mb-2">Profils de jeu</h3>
                    <p className="text-xs text-stone-500 mb-3">Une seule personne, plusieurs rôles. Choisis le profil à modifier ; ses références de quêtes et d’apparitions restent distinctes.</p>
                    <div className="space-y-3">
                      {selectedProfiles.map(profile => (
                        <div key={profile.npc_id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="text-stone-300">{npcTypeLabels[profile.type] || profile.type}{profile.archived ? " · Archivé" : ""}</span>
                          <div className="flex flex-wrap gap-3">
                            <button type="button" className="text-amber-300 underline underline-offset-4" onClick={() => handleEditClick(profile)}>Modifier</button>
                            <button type="button" disabled={!!deletingId} className="text-red-300 underline underline-offset-4 disabled:opacity-50" onClick={() => handleDelete(profile)}>Supprimer ce profil</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-auto pt-6 flex flex-wrap gap-2">
                  {selectedNpc.profile_types.map(type => (
                    <span key={type} className="px-3 py-1 bg-stone-800 rounded-full text-xs font-bold text-white border border-stone-600">
                      {npcTypeLabels[type] || type}
                    </span>
                  ))}
                  {[...new Set((selectedNpc.quest_links || []).flatMap(getQuestLinkRoles))].map(role => (
                    <span key={role} className="px-3 py-1 bg-yellow-600/20 text-amber-300 rounded-full text-xs font-bold border border-yellow-600/40">
                      {questRoleLabels[role] || role}
                    </span>
                  ))}
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
              className="bg-[#1b1b17] w-full max-w-lg rounded-sm shadow-none border border-stone-600 overflow-hidden flex flex-col max-h-[90vh]"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-stone-700 bg-[#11110f] flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {isCreating ? "Créer un NPC" : "Modifier le NPC"}
                </h2>
                <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">ID Unique</label>
                  <input 
                    type="text" name="npc_id" value={formData.npc_id} onChange={handleFormChange} disabled={!isCreating}
                    className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white focus:border-purple-500 outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Nom</label>
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Type</label>
                    <select name="type" value={formData.type} onChange={handleFormChange} className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white">
                      <option value="DECO">Décoration</option>
                      <option value="SHOPKEEPER">Marchand</option>
                      <option value="QUEST">Quête</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Région</label>
                    <select 
                      name="region" 
                      value={formData.region} 
                      onChange={handleFormChange}
                      className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white focus:border-purple-500 outline-none"
                    >
                      {regionsList.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Skin Minecraft</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setSkinMode(SKIN_MODES.PLAYER)}
                      className={`px-3 py-2 rounded text-sm font-bold border transition ${
                        skinMode === SKIN_MODES.PLAYER
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-stone-800 border-stone-600 text-stone-300 hover:bg-gray-600"
                      }`}
                    >
                      Pseudo joueur
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkinMode(SKIN_MODES.REFERENCE)}
                      className={`px-3 py-2 rounded text-sm font-bold border transition ${
                        skinMode === SKIN_MODES.REFERENCE
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-stone-800 border-stone-600 text-stone-300 hover:bg-gray-600"
                      }`}
                    >
                      Référence
                    </button>
                  </div>
                  <input
                    type="text"
                    name="skin"
                    value={formData.skin || ""}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white focus:border-purple-500 outline-none"
                    placeholder={skinMode === SKIN_MODES.PLAYER ? "Pseudo Minecraft du joueur" : "Référence skin, URL ou identifiant"}
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    {skinMode === SKIN_MODES.PLAYER
                      ? "Le pseudo est envoyé comme valeur de skin pour reprendre l'apparence du joueur."
                      : "Utilisez une référence existante si le skin ne vient pas d'un pseudo joueur."}
                  </p>
                </div>

                {/* Upload Image */}
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Image de profil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#11110f] rounded-lg overflow-hidden border border-stone-600 flex-shrink-0">
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
                        className="px-4 py-2 bg-stone-800 hover:bg-gray-600 text-white rounded text-sm flex items-center gap-2 transition"
                      >
                        <FaImage /> Choisir une image
                      </button>
                      <p className="text-xs text-stone-500 mt-1">Sera redimensionnée en 256x256</p>
                    </div>
                  </div>
                  {/* Canvas caché pour le traitement */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Description</label>
                  <textarea 
                    name="description" value={formData.description} onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white h-20 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Dialogues (un par ligne)</label>
                  <textarea 
                    value={formData.dialogue.join("\n")} onChange={handleDialogueChange}
                    className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-white h-24 focus:border-purple-500 outline-none"
                    placeholder="Bonjour !&#10;Comment allez-vous ?"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleFormChange} className="w-4 h-4" />
                    <span className="text-sm text-stone-300">Activé</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-stone-700 bg-[#11110f] flex justify-between">
                <button onClick={() => handleDelete(formData)} disabled={!!deletingId} className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold">
                    <FaTrash /> Supprimer
                </button>
                <div className="flex gap-3 ml-auto">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-stone-400 hover:text-white">Annuler</button>
                  <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold shadow-none">
                    <FaSave /> Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
