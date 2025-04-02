import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { FaEdit, FaSave } from "react-icons/fa";
import {
  getPlayers, updatePlayer,
  getTraits,
  getActions,
  addTraitToPlayer,
  removeTraitFromPlayer,
  addActionToPlayer,
  removeActionFromPlayer,
} from "../services/api"; // Import des appels API depuis API.js


function PlayersAdmin() {
  const { userRank } = useUser();
  const [players, setPlayers] = useState([]);
  const [editing, setEditing] = useState({});
  const [editedData, setEditedData] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const [updateTrigger, setUpdateTrigger] = useState(0);


  const handleSelectPlayer = (player) => {
    console.log("✅ Nouveau joueur sélectionné :", player);
    setSelectedPlayer(player);
  };


  const handleClose = (e) => {
    if (e.target.id === "modal-bg") {
      setSelectedPlayer(null);
    }
  };

  //Trait et ACTIONS
  const [selectedTab, setSelectedTab] = useState(null);
  const [availableTraits, setAvailableTraits] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);

  // Charger les traits/actions disponibles au montage
  useEffect(() => {
    getTraits().then(setAvailableTraits);
    getActions().then(setAvailableActions);
    console.log("🔄 Mise à jour de l'affichage des joueurs !");
  }, []);

  const handleAddTrait = (playerId, traitId) => {
    if (!playerId || !traitId) {
      console.error("❌ ERREUR : playerId ou traitId est manquant !");
      return;
    }

    console.log(`➕ Ajout du trait ${traitId} pour le joueur ${playerId}`);

    addTraitToPlayer(playerId, traitId)
      .then(() => {
        console.log(`✅ Trait ${traitId} ajouté pour ${playerId} !`);

        setPlayers((prevPlayers) => {
          const updatedPlayers = prevPlayers.map((player) =>
            player.id === playerId
              ? { ...player, traits: [...player.traits, availableTraits.find((t) => t.trait_id === traitId)] }
              : player
          );

          return [...updatedPlayers]; // 🔥 Force la mise à jour
        });
      })
      .catch((error) => console.error("❌ ERREUR lors de l'ajout du trait :", error));
  };


  const handleRemoveTrait = (playerId, traitId) => {
    if (!playerId || !traitId) {
      console.error("❌ ERREUR : playerId ou traitId est manquant !");
      return;
    }

    console.log(`🗑️ Suppression du trait ${traitId} pour le joueur ${playerId}`);

    removeTraitFromPlayer(playerId, traitId)
      .then(() => {
        console.log(`✅ Trait ${traitId} supprimé pour ${playerId} !`);

        setPlayers((prevPlayers) => {
          const updatedPlayers = prevPlayers.map((player) =>
            player.id === playerId
              ? { ...player, traits: player.traits.filter((t) => t.trait_id !== traitId) }
              : player
          );

          return [...updatedPlayers]; // 🔥 Nouvelle référence mémoire
        });

        setUpdateTrigger((prev) => prev + 1); // 🔥 Force le re-rendu
      })
      .catch((error) => console.error("❌ ERREUR lors de la suppression du trait :", error));
  };


  const handleAddAction = (playerId, actionId) => {
    if (!playerId || !actionId) {
      console.error("❌ ERREUR : playerId ou actionId est manquant !");
      return;
    }

    console.log(`➕ Ajout de l'action ${actionId} pour le joueur ${playerId}`);

    addActionToPlayer(playerId, actionId)
      .then(() => {
        console.log(`✅ Action ${actionId} ajoutée pour ${playerId} !`);

        setPlayers((prevPlayers) => {
          const updatedPlayers = prevPlayers.map((player) =>
            player.id === playerId
              ? { ...player, actions: [...player.actions, availableActions.find((a) => a.action_id === actionId)] }
              : player
          );

          return [...updatedPlayers]; // 🔥 Force la mise à jour
        });
      })
      .catch((error) => console.error("❌ ERREUR lors de l'ajout de l'action :", error));
  };

  const handleRemoveAction = (playerId, actionId) => {
    if (!playerId || !actionId) {
      console.error("❌ ERREUR : playerId ou actionId est manquant !");
      return;
    }

    console.log(`🗑️ Suppression de l'action ${actionId} pour le joueur ${playerId}`);

    removeActionFromPlayer(playerId, actionId)
      .then(() => {
        console.log(`✅ Action ${actionId} supprimée pour ${playerId} !`);

        setPlayers((prevPlayers) => {
          const updatedPlayers = prevPlayers.map((player) =>
            player.id === playerId
              ? { ...player, actions: player.actions.filter((a) => a.action_id !== actionId) }
              : player
          );

          return [...updatedPlayers]; // 🔥 Force la mise à jour
        });
      })
      .catch((error) => console.error("❌ ERREUR lors de la suppression de l'action :", error));
  };

  useEffect(() => {
    console.log("🔄 Mise à jour forcée de l'affichage des joueurs !");
  }, [updateTrigger]); // 🔥 Réagit à `updateTrigger` au lieu de `players`


  useEffect(() => {
    async function fetchPlayers() {
      if (userRank !== "Admin") {
        alert("Accès refusé !");
        return;
      }
      const data = await getPlayers("Admin");
      if (data) setPlayers(data);
    }
    fetchPlayers();
  }, [userRank]);

  const handleEdit = (playerId, field, value) => {
    setEditing((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [field]: true } }));
    setEditedData((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [field]: value } }));
  };

  const handleChange = (playerId, field, value) => {
    setEditedData((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [field]: value } }));
  };

  const handleSave = async (playerId) => {
    const response = await updatePlayer(playerId, editedData[playerId]);

    if (response) {
      alert("✅ Modifications enregistrées avec succès !");

      // 🟢 Mise à jour immédiate de l'état players pour refléter les changements
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === playerId ? { ...player, ...editedData[playerId] } : player
        )
      );

      // 🟢 Réinitialisation du mode édition
      setEditing((prev) => ({ ...prev, [playerId]: {} }));
    } else {
      alert("❌ Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <div className="p-10 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">⚙️ Gestion des Joueurs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        {players.map((player) => (
          <div
            key={player.id}
            className={`bg-gray-800 p-6 rounded-xl shadow-lg text-left transition-all duration-500 ease-in-out 
            ${selectedPlayer === player.id ? "fixed inset-0 flex items-center justify-center justify-center bg-black bg-opacity-50" : ""}
          `}
          >
            {/* 🔹 Pseudo Minecraft cliquable (disparaît quand sélectionné) */}
            {selectedPlayer !== player.id && (
              <div
                className="cursor-pointer flex items-center text-center"
                onClick={() => handleSelectPlayer(player.id)}
              >
                <h2 className="text-2xl font-bold text-blue-400 mr-2">{player.pseudo_minecraft}</h2>
                <FaEdit
                  className="text-gray-400 cursor-pointer ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(player.id, "pseudo_minecraft", player.pseudo_minecraft);
                  }}
                />
              </div>
            )}

            {/* 🔹 Affichage de la carte en mode centré */}
            {selectedPlayer === player.id && (
              <div
                id="modal-bg"
                className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
              >
                <div
                  className="bg-gray-900 p-6 rounded-lg shadow-lg w-full sm:w-3/4 lg:w-1/2 max-w-screen-md 
                            transition-transform transform scale-95 animate-fade-in overflow-auto max-h-[80vh] 
                            flex flex-col items-center justify-center"
                  onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant à l'intérieur
                >
                  {/* 🔹 Pseudo en haut de la carte avec bouton modifier */}
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center ">
                      <h2 className="text-2xl font-bold text-blue-400 mr-2 ">{player.pseudo_minecraft}</h2>
                      <FaEdit
                        className="text-gray-400 cursor-pointer "
                        onClick={() => handleEdit(player.id, "pseudo_minecraft", player.pseudo_minecraft)}
                      />
                    </div>
                    <button className="text-purple-400 text-lg font-bold" onClick={() => setSelectedPlayer(null)}>
                      ✖
                    </button>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <button onClick={() => setSelectedTab("traits")} className="px-4 py-2 bg-blue-600 text-white rounded">
                      Traits
                    </button>
                    <button onClick={() => setSelectedTab("actions")} className="px-4 py-2 bg-red-600 text-white rounded">
                      Actions
                    </button>
                  </div>
                  {/* 🔹 Contenu de la carte */}
                  <div className="flex justify-end mb-6">
                    <button
                      onClick={() => {
                        if (!selectedPlayer) {
                          alert("❌ Aucun joueur sélectionné !");
                          return;
                        }
                        window.location.href = `/player-jobs/${selectedPlayer}`;
                      }}
                      className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-lg font-semibold transition flex items-center space-x-2"
                    >
                      🏆 Gérer les métiers du joueur
                    </button>
                  </div>
                  <div className="mt-4 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {/* 🔹 Prénom */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">📛 Prénom :</span>
                        {editing[player.id]?.name ? (
                          <input
                            type="text"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.name || ""}
                            onChange={(e) => handleChange(player.id, "name", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.name || "Aucun nom"}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "name", player.name)} />
                      </div>

                      {/* 🔹 Nom */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🏷️ Nom :</span>
                        {editing[player.id]?.surname ? (
                          <input
                            type="text"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.surname || ""}
                            onChange={(e) => handleChange(player.id, "surname", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.surname || "Aucun surnom"}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "surname", player.surname)} />
                      </div>

                      {/* 🔹 Description */}
                      <div className="flex items-center justify-center ">
                        <span className="mr-2">📄 Description :</span>
                        {editing[player.id]?.description ? (
                          <textarea
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.description || ""}
                            onChange={(e) => handleChange(player.id, "description", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.description || "Aucune description"}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "description", player.description)} />
                      </div>

                      {/* 🔹 Rang */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🎖️ Rang :</span>
                        {editing[player.id]?.rank ? (
                          <select
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.rank || "player"}
                            onChange={(e) => handleChange(player.id, "rank", e.target.value)}
                          >
                            <option value="Esclave">Esclave</option>
                            <option value="Etranger">Etranger</option>
                            <option value="Villageois">Villageois</option>
                            <option value="Citoyen">Citoyen</option>
                            <option value="Citoyen Libre">Citoyen Libre</option>
                            <option value="Patricien">Patricien</option>
                            <option value="Noble">Noble</option>
                            <option value="Seigneur">Seigneur</option>
                            <option value="Vicompte">Vicompte</option>
                            <option value="Compte">Compte</option>
                            <option value="Marquis">Marquis</option>
                            <option value="Moderateur">Moderateur</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <span className="mr-2">{player.rank || "Player"}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "rank", player.rank)} />
                      </div>

                      {/* 🔹 Argent */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">💰 Argent :</span>
                        {editing[player.id]?.money ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.money || 0}
                            onChange={(e) => handleChange(player.id, "money", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.money || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "money", player.money)} />
                      </div>

                      {/* 🔹 Divinité */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🔮 Divinité :</span>
                        {editing[player.id]?.divin ? (
                          <select
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.divin || "aucun"}
                            onChange={(e) => handleChange(player.id, "divin", e.target.value)}
                          >
                            <option value="aucun">Aucun</option>
                            <option value="Ardorium">Ardorium</option>
                            <option value="Sylvaria">Sylvaria</option>
                            <option value="Inquisora">Inquisora</option>
                            <option value="Solanaré">Solanaré</option>
                            <option value="Aurelios">Aurelios</option>
                            <option value="Explorien">Explorien</option>
                            <option value="Ignotembris">Ignotembris</option>
                            <option value="Ombrelume">Ombrelume</option>
                            <option value="Scénarche">Scénarche</option>
                            <option value="Glacilune">Glacilune</option>
                            <option value="Nevrosante">Nevrosante</option>
                            <option value="Érudihiver">Érudihiver</option>
                          </select>
                        ) : (
                          <span className="mr-2">{player.divin || "Aucun"}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "divin", player.divin)} />
                      </div>

                      {/* 🔹 Vie */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">❤️ Vie :</span>
                        {editing[player.id]?.life ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.life || 0}
                            onChange={(e) => handleChange(player.id, "life", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.life || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "life", player.life)} />
                      </div>

                      {/* 🔹 Force */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">💪 Force :</span>
                        {editing[player.id]?.strength ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.strength || 0}
                            onChange={(e) => handleChange(player.id, "strength", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.strength || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "strength", player.strength)} />
                      </div>

                      {/* 🔹 Vitesse */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">⚡ Vitesse :</span>
                        {editing[player.id]?.speed ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.speed || 0}
                            onChange={(e) => handleChange(player.id, "speed", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.speed || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "speed", player.speed)} />
                      </div>

                      {/* 🔹 Portée */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">📏 Portée :</span>
                        {editing[player.id]?.reach ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.reach || 0}
                            onChange={(e) => handleChange(player.id, "reach", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.reach || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "reach", player.reach)} />
                      </div>

                      {/* 🔹 Résistance */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🛡️ Résistance :</span>
                        {editing[player.id]?.resistance ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.resistance || 0}
                            onChange={(e) => handleChange(player.id, "resistance", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.resistance || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "resistance", player.resistance)} />
                      </div>

                      {/* 🔹 Inventaire */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🏗️ Inventaire :</span>
                        {editing[player.id]?.place ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.place || 0}
                            onChange={(e) => handleChange(player.id, "place", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.place || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "place", player.place)} />
                      </div>

                      {/* 🔹 Célérité */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">⏩ Célérité :</span>
                        {editing[player.id]?.haste ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.haste || 0}
                            onChange={(e) => handleChange(player.id, "haste", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.haste || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "haste", player.haste)} />
                      </div>

                      {/* 🔹 Régénération */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">💖 Régénération :</span>
                        {editing[player.id]?.regeneration ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.regeneration || 0}
                            onChange={(e) => handleChange(player.id, "regeneration", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.regeneration || 1}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "regeneration", player.regeneration)} />
                      </div>
                      {/* 🔹 Esquive */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">💨 Esquive :</span>
                        {editing[player.id]?.dodge ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.dodge || 2}
                            onChange={(e) => handleChange(player.id, "dodge", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.dodge || 2}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "dodge", player.dodge)} />
                      </div>

                      {/* 🔹 Discrétion */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🕵️ Discrétion :</span>
                        {editing[player.id]?.discretion ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.discretion || 3}
                            onChange={(e) => handleChange(player.id, "discretion", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.discretion || 3}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "discretion", player.discretion)} />
                      </div>

                      {/* 🔹 Charisme */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">😎 Charisme :</span>
                        {editing[player.id]?.charisma ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.charisma || 1}
                            onChange={(e) => handleChange(player.id, "charisma", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.charisma || 1}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "charisma", player.charisma)} />
                      </div>

                      {/* 🔹 Rhétorique */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🗣️ Rhétorique :</span>
                        {editing[player.id]?.rethoric ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.rethoric || 1}
                            onChange={(e) => handleChange(player.id, "rethoric", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.rethoric || 1}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "rethoric", player.rethoric)} />
                      </div>

                      {/* 🔹 Mana */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🔮 Mana :</span>
                        {editing[player.id]?.mana ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.mana || 100}
                            onChange={(e) => handleChange(player.id, "mana", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.mana || 100}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "mana", player.mana)} />
                      </div>

                      {/* 🔹 Négociation */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">💼 Négociation :</span>
                        {editing[player.id]?.negotiation ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.negotiation || 0}
                            onChange={(e) => handleChange(player.id, "negotiation", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.negotiation || 0}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "negotiation", player.negotiation)} />
                      </div>

                      {/* 🔹 Influence */}
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🌟 Influence :</span>
                        {editing[player.id]?.influence ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.influence || 1}
                            onChange={(e) => handleChange(player.id, "influence", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.influence || 1}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "influence", player.influence)} />
                      </div>

                      {/* 🔹 Compétence */}
                      <div className="flex items-center justify-center justify-center">
                        <span className="mr-2">🎓 Compétence :</span>
                        {editing[player.id]?.skill ? (
                          <input
                            type="number"
                            className="bg-gray-700 px-2 py-1 rounded w-full"
                            value={editedData[player.id]?.skill || 100}
                            onChange={(e) => handleChange(player.id, "skill", e.target.value)}
                          />
                        ) : (
                          <span className="mr-2">{player.skill || 100}</span>
                        )}
                        <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "skill", player.skill)} />
                      </div>
                    </div>
                    {selectedTab && (
                      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-1/2 max-w-screen-md">
                          {/* Titre */}
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">{selectedTab === "traits" ? "Traits" : "Actions"}</h2>
                            <button className="text-purple-400 text-lg font-bold" onClick={() => setSelectedTab(null)}>
                              ✖
                            </button>
                          </div>

                          <div className="mt-4">
                            {/* Liste des actions/traits avec meilleur design */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {selectedTab === "traits" ? (
                                player?.traits && player.traits.length > 0 ? (
                                  player.traits.map((item, index) => {
                                    //console.log("🔍 Affichage du trait :", selectedPlayer);
                                    if (!item) return null; // ⚠️ Vérifie que item existe
                                    return (
                                      <div key={item.id ?? `trait-${index}`} className="flex justify-between items-center bg-gray-800 p-2 rounded-md shadow">
                                        <span className="text-white">{item.Name ?? "Nom inconnu"}</span>
                                        <button
                                          onClick={() => handleRemoveTrait(selectedPlayer, item?.id)}
                                          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md transition"
                                        >
                                          ✖
                                        </button>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-gray-400 text-center">Aucun trait.</p>
                                )
                              ) : (
                                player?.actions && player.actions.length > 0 ? (
                                  player.actions.map((item, index) => {

                                    if (!item) return null; // ⚠️ Vérifie que item existe
                                    return (
                                      <div key={item.id ?? `action-${index}`} className="flex justify-between items-center bg-gray-800 p-2 rounded-md shadow">
                                        <span className="text-white">{item.Name ?? "Nom inconnu"}</span>
                                        <button
                                          onClick={() => handleRemoveAction(selectedPlayer, item?.id)}
                                          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md transition"
                                        >
                                          ✖
                                        </button>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-gray-400 text-center">Aucune action.</p>
                                )
                              )}
                            </div>


                            {/* Sélecteur et bouton + avec bon alignement */}
                            <div className="flex items-center gap-2 mt-4">
                              <select
                                className="bg-gray-700 p-2 rounded-md text-white w-full"
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                              >
                                <option value="">Sélectionner...</option>
                                {(selectedTab === "traits" ? availableTraits : availableActions).map((item, index) => (
                                  <option key={item.trait_id ?? item.action_id ?? `fallback-${index}`} value={item.trait_id ?? item.action_id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={() => {
                                  console.log("📥 selectedPlayer avant ajout :", selectedPlayer);
                                  console.log("📥 selectedItem avant ajout :", selectedItem);
                                  console.log("📥 Onglet actif :", selectedTab);

                                  if (!selectedPlayer) {
                                    console.error("❌ ERREUR : Aucun joueur sélectionné !");
                                    return;
                                  }

                                  if (!selectedItem) {
                                    console.error(`❌ ERREUR : Aucun ${selectedTab === "traits" ? "trait" : "action"} sélectionné !`);
                                    return;
                                  }

                                  if (selectedTab === "traits") {
                                    handleAddTrait(selectedPlayer, selectedItem);
                                  } else {
                                    handleAddAction(selectedPlayer, selectedItem);
                                  }

                                  setSelectedItem(""); // Réinitialise après ajout
                                }}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md shadow-md transition"
                              >
                                ➕
                              </button>
                            </div>
                          </div>


                        </div>
                      </div>
                    )}

                    {/* 🎯 Bouton Enregistrer - Centré */}
                    {/* 🎯 Bouton Enregistrer - Fixé en bas */}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => handleSave(player.id)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-lg font-semibold transition flex items-center space-x-2"
                      >
                        <FaSave /> <span>Enregistrer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayersAdmin;
