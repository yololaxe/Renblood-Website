import {
  addTraitToPlayer,
  removeTraitFromPlayer,
  addActionToPlayer,
  removeActionFromPlayer,
} from "../../services/api";

// Ajouter un trait au joueur
export const handleAddTrait = (playerId, traitId, availableTraits, setPlayers) => {
  if (!playerId || !traitId) {
    console.error("❌ ERREUR : playerId ou traitId est manquant !");
    return;
  }

  addTraitToPlayer(playerId, traitId)
    .then(() => {
      setPlayers((prevPlayers) => {
        const updatedPlayers = prevPlayers.map((player) =>
          player.id === playerId
            ? { ...player, traits: [...player.traits, availableTraits.find((t) => t.trait_id === traitId)] }
            : player
        );
        return [...updatedPlayers];
      });
    })
    .catch((error) => console.error("❌ ERREUR lors de l'ajout du trait :", error));
};

// Supprimer un trait du joueur
export const handleRemoveTrait = (playerId, traitId, setPlayers) => {
  if (!playerId || !traitId) {
    console.error("❌ ERREUR : playerId ou traitId est manquant !");
    return;
  }

  removeTraitFromPlayer(playerId, traitId)
    .then(() => {
      setPlayers((prevPlayers) => {
        const updatedPlayers = prevPlayers.map((player) =>
          player.id === playerId
            ? { ...player, traits: player.traits.filter((t) => t.trait_id !== traitId) }
            : player
        );
        return [...updatedPlayers];
      });
    })
    .catch((error) => console.error("❌ ERREUR lors de la suppression du trait :", error));
};

// Ajouter une action au joueur
export const handleAddAction = (playerId, actionId, availableActions, setPlayers) => {
  if (!playerId || !actionId) {
    console.error("❌ ERREUR : playerId ou actionId est manquant !");
    return;
  }

  addActionToPlayer(playerId, actionId)
    .then(() => {
      setPlayers((prevPlayers) => {
        const updatedPlayers = prevPlayers.map((player) =>
          player.id === playerId
            ? { ...player, actions: [...player.actions, availableActions.find((a) => a.action_id === actionId)] }
            : player
        );
        return [...updatedPlayers];
      });
    })
    .catch((error) => console.error("❌ ERREUR lors de l'ajout de l'action :", error));
};

// Supprimer une action du joueur
export const handleRemoveAction = (playerId, actionId, setPlayers) => {
  if (!playerId || !actionId) {
    console.error("❌ ERREUR : playerId ou actionId est manquant !");
    return;
  }

  removeActionFromPlayer(playerId, actionId)
    .then(() => {
      setPlayers((prevPlayers) => {
        const updatedPlayers = prevPlayers.map((player) =>
          player.id === playerId
            ? { ...player, actions: player.actions.filter((a) => a.action_id !== actionId) }
            : player
        );
        return [...updatedPlayers];
      });
    })
    .catch((error) => console.error("❌ ERREUR lors de la suppression de l'action :", error));
};
