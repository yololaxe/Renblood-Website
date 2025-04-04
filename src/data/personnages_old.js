const personnages = {
  "Jonh ROLLINGFORD ✞": {
    "titre": "Seigneur de Wild Range",
    "age": "???",
    "metier": "Seigneur & Chevalier",
    "conjoint": "Inconnu",
    "argent": "✞",
    "reputation": "✞",
    "description": "Fondateur de la grande ville de Wild Range, Jonh se battit dans la grande guerre des dragons en tant que commandant des armées humaines. Ceci lui value une place de maitre auprès du nouveau Roi Bob Roxton."
  },
  "Stannis ROLLINGFORD ✞": {
    "titre": "Roi du royaume de Renblood, Seigneur de Wild Range, Seigneur des 4 Terres, Gardien des Mondes",
    "age": "47 ✞ (274 -> 321)",
    "metier": "Roi ",
    "conjoint": "Jade Linster",
    "argent": "✞",
    "reputation": "✞",
    "description": "Stannis le bon se battit lors de la bataille navale de l'Haguesier, qu'il remporta avec succès en annéantissant la flotte des Roxton. Il fut un très bon roi nottament en créant le rôle politique de Magistrat"
  },
  "Didier ROLLINGFORD": {
    "titre": "Prince du temple d'Aquillon, Gardien des frontières",
    "age": "45 (289)",
    "metier": "Coordinateur Royale",
    "conjoint": "Elisabeth Ouloh",
    "argent": 12,
    "reputation": 81,
    "description": "Frère de Stannis celui-ci se battat à ses côtés lors de la bataille sanglante (Verdict). il fût nommée le tueur de cyclope suite à cela. il fut nommé Coordinateur Royale par le roi HERBERT."
  },
  "Pristine ROLLINGFORD": {
    "titre": "Princesse du Vincourt",
    "age": "36 (298)",
    "metier": "Maitre Magicienne",
    "conjoint": "Aucun",
    "argent": 6,
    "reputation": 77,
    "description": "Première princesse royale, celle ci quitta très vite le chateau de triomphe pour partir faire l'armée. Son talent en magie fût très vite remarquée et après 7 années de service elle devenu maitre magicienne. Elle rejoins très vite la citadelle de Vincourt et y installa une culture autour de la magie très avancée. Elle a rejoins la guilde magique en 327 et est vu comme la prochaine maitresse mystique du Royaume"
  },
  "James ♥ Walda": {
    "titre": "???",
    "age": "???",
    "metier": "Seigneur du Nord, l'Assassin des cyclopes, Seigneur des plaines glacées",
    "conjoint": "???",
    "argent": "Maréchal des armées du Nord",
    "reputation": "Inconnue",
    "description": "Pristine ROLLINGFORD"
  },
  "Bob Roxton ✞": {
    "titre": "Roi du Royaume de Renblood, Seigneur de Rozdru, Seigneur des mers, Gardien des Mondes",
    "age": "61 (190-251)",
    "metier": "Capitaine navale",
    "conjoint": "Louisa Paltain",
    "argent": "✞",
    "reputation": "✞",
    "description": "Bob Roxton mena les armées du royaume dans une lutte acharnée contre les créatures mythiques. Stratège exceptionnel, il comprit avant tout le monde que les dragons pourraient devenir des alliés plutôt que des menaces. C'est lui qui scella l'alliance avec les premiers dragonniers et posa les bases du futur royaume."
  },
  "Lassiou Roxton ✞": {
    "titre": "Roi du Royaume de Renblood, Seigneur de Rozdru, Seigneur des mers, Gardien des Mondes",
    "age": "56 ✞ (222-278)",
    "metier": "Capitaine navale",
    "conjoint": "Louize Ouloh",
    "argent": "✞",
    "reputation": "✞",
    "description": "L’architecte du pouvoir naval, Lassiou Roxton consolida la suprématie des Roxton sur les mers en créant une flotte de guerre sans précédent. Sous son règne, la confrérie des Frères Maritimes assura aux Roxton un monopole absolu sur les routes commerciales. Cependant, il négligea les affaires terrestres, ce qui affaiblit les défenses du royaume."
  },
  "Antina Roxton ✞": {
    "titre": "Princesse du Royaume de Renblood, La \"Putain\", La \"Bannie\"",
    "age": "68 ✞ (230-298)",
    "metier": "Diplomate",
    "conjoint": "Entropri Rok",
    "argent": "✞",
    "reputation": "✞",
    "description": "La Princesse Bannie, Antina avait une réputation sulfureuse. Connue pour ses intrigues de cour et ses alliances douteuses avec des factions criminelles, elle fut exilée au comté d’Eldia après avoir tenté d’évincer son frère."
  },
  "Isandre Roxton ✞": {
    "titre": "Roi du Royaume de Renblood, Seigneur de Rozdru, Seigneur des mers, Gardien des Mondes",
    "age": "36 ✞ (260-296)",
    "metier": "Capitaine navale",
    "conjoint": "Daé Feran",
    "argent": "✞",
    "reputation": "✞",
    "description": "Isandre hérita d’un royaume en crise. Il tenta de rétablir l’ordre mais fut rapidement acculé par ses ennemis. Malgré un certain talent militaire, il n’était pas préparé à la bataille de l’Haguersier, où il trouva la mort face aux forces de Stannis Rollingford."
  },
  "Entropri ROK ✞": {
    "titre": "Seigneur de St Troufion, Forgeron Noble de Saint Troufion, Époux de l'Exilée",
    "age": "70 ✞ (236-306)",
    "metier": "Maître forgeron",
    "conjoint": "Antina ROXTON ✞",
    "argent": "✞",
    "reputation": "✞",
    "description": "Connu pour son mariage audacieux avec l'exilée Antina Roxton, il devint célèbre en forgeant des armes réputées à travers tout le comté d'Eldia."
  },
  "Blanche ROK ✞": {
    "titre": "Dame des Érudits",
    "age": " 60 ✞ (254-314)",
    "metier": "Érudite",
    "conjoint": "Thibault FERAN ✞",
    "argent": "✞",
    "reputation": "✞",
    "description": "Connue pour avoir co-fondé la grande bibliothèque du Chercheur à Isvanore, célébrée pour sa sagesse."
  },
  "Florentin ROK": {
    "titre": "Seigneur de St Troufion, Maître de la Forge de Saint Troufion",
    "age": "60 (274)",
    "metier": "Maître forgeron et artisan",
    "conjoint": "Lisia JUIFOU",
    "argent": 70,
    "reputation": 77,
    "description": "Forgeron respecté, succédant à Entropri, il renforce la renommée des armes de Saint Troufion, équipant régulièrement les familles nobles du Sud."
  },
  "Kounay ROK": {
    "titre": "Marquise d'Eldia, Dame de Fyvelune",
    "age": "52 (282)",
    "metier": "Diplomate",
    "conjoint": "Eudes BANEFORT",
    "argent": 30,
    "reputation": 87,
    "description": "Marquise influente, jouant un rôle clé dans les relations entre le Sud et Fyvelune, aidant à renforcer les alliances avec les Banefort."
  },
  "Bertorah GOODBROOK ✞": {
    "titre": "Fondateur de l'Alliance de la Montagne",
    "age": "210✞ (90-300)",
    "metier": "Maître mineur et diplomate",
    "conjoint": "Helvina Granite ✞",
    "argent": "✞",
    "reputation": "✞",
    "description": "Fondateur légendaire qui scella l'Alliance de la Montagne avec les elfes lors de la Grande Conquête, établissant la prospérité de Moria"
  },
  "Dworin GOODBROOK ✞": {
    "titre": "Gardien des Profondeurs",
    "age": "180✞ (120-300)",
    "metier": "Chef des mineurs",
    "conjoint": "Bruna Fersolide ✞",
    "argent": "✞",
    "reputation": "✞",
    "description": "Célèbre pour avoir dirigé les mines de Moria avec sagesse, assurant la prospérité économique du royaume par l'exploitation de richesses minérales."
  },
  "Torvin GOODBROOK": {
    "titre": "Seigneur actuel de Moria",
    "age": "150✞ (184)",
    "metier": "Seigneur des mines et maître forgeron",
    "conjoint": "Selma Rochedure",
    "argent": 130,
    "reputation": "???",
    "description": "Respecté pour ses compétences en forge et son rôle crucial dans l'approvisionnement militaire du royaume, en particulier lors des conflits récents contre les cyclopes."
  },
  "Bryna GOODBROOK": {
    "titre": "Diplomate de Cornwall",
    "age": "124 (210)",
    "metier": "Ambassadrice auprès des Lynster",
    "conjoint": "Kelan Rougerocher",
    "argent": 85,
    "reputation": "???",
    "description": "Figure diplomatique importante, elle entretient des relations étroites avec les Lynster et assure des échanges commerciaux fructueux."
  }
};