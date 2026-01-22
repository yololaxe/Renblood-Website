import React, { useState, useEffect, useCallback } from "react";
import { FaTimes, FaPlus, FaTrash, FaFileContract } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { managePlayerLicences } from "../../services/api";
import { MoneyDisplay } from "../../components/MoneyDisplay";

const PlayerLicenceManager = ({ playerId, mcId, onClose, showToast }) => {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLicence, setNewLicence] = useState({
    name: "",
    owner_name: "",
    exploitant_name: "",
    start_date: "",
    end_date: "",
    details: "",
    price: 0,
  });

  const fetchLicences = useCallback(async () => {
    if (!mcId) {
      setLoading(false);
      return;
    }
    try {
      const result = await managePlayerLicences(mcId, { action: "list" });
      const extractedLicences = Array.isArray(result) ? result : result?.licences || [];
      setLicences(extractedLicences);
    } catch (error) {
      console.error("Erreur lors du chargement des licences:", error);
      showToast("error", "Erreur lors du chargement des licences.");
    } finally {
      setLoading(false);
    }
  }, [mcId, showToast]);

  useEffect(() => {
    fetchLicences();
  }, [fetchLicences]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLicence((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLicence = async () => {
    if (!mcId) return;

    const formattedLicence = {
      ...newLicence,
      price: Number(newLicence.price),
      player_id: playerId,
    };

    try {
      const result = await managePlayerLicences(mcId, {
        action: "add",
        ...formattedLicence,
      });
      if (result) {
        await fetchLicences(); // Re-fetch instead of manual update to ensure sync
        setNewLicence({
          name: "",
          owner_name: "",
          exploitant_name: "",
          start_date: "",
          end_date: "",
          details: "",
          price: 0,
        });
        showToast("success", "Licence ajoutée avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la licence:", error);
      showToast("error", "Erreur lors de l'ajout de la licence.");
    }
  };

  const handleRemoveLicence = async (licenceId) => {
    if (!mcId) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette licence ?")) return;

    try {
      await managePlayerLicences(mcId, { action: "remove", licence_id: licenceId });
      setLicences((prev) => prev.filter((lic) => lic.id !== licenceId));
      showToast("success", "Licence supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de la licence:", error);
      showToast("error", "Erreur lors de la suppression de la licence.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-white">
        Chargement des licences...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-600 relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
        >
          <FaTimes size={20} />
        </button>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-700 pb-4">
          <FaFileContract className="text-blue-400" />
          Gérer les licences du joueur
        </h3>

        {/* Liste des licences existantes */}
        <section className="mb-8">
          <h4 className="text-xl font-semibold text-white mb-4">Licences actuelles</h4>
          {licences.length === 0 ? (
            <p className="text-gray-400 italic">Aucune licence pour ce joueur.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {licences.map((lic) => (
                <div key={lic.id} className="bg-gray-700 p-4 rounded-xl shadow-md border border-gray-600 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">{lic.name}</p>
                    <p className="text-sm text-gray-400">
                      {lic.start_date} - {lic.end_date}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveLicence(lic.id)}
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ajouter une nouvelle licence */}
        <section>
          <h4 className="text-xl font-semibold text-white mb-4">Ajouter une nouvelle licence</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nom de la licence"
              value={newLicence.name}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="owner_name"
              placeholder="Nom du propriétaire"
              value={newLicence.owner_name}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="exploitant_name"
              placeholder="Nom de l'exploitant"
              value={newLicence.exploitant_name}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="price"
              placeholder="Prix"
              value={newLicence.price}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="start_date"
              placeholder="Date de début (ex: Automne 324)"
              value={newLicence.start_date}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="end_date"
              placeholder="Date de fin (ex: Été 344)"
              value={newLicence.end_date}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="details"
              placeholder="Détails optionnels"
              value={newLicence.details}
              onChange={handleInputChange}
              rows="3"
              className="bg-gray-700 text-white p-2 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <button
            onClick={handleAddLicence}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <FaPlus /> Ajouter la licence
          </button>
        </section>
      </motion.div>
    </motion.div>
  );
};

export default PlayerLicenceManager;
