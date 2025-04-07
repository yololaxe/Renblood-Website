const personnages = {
  "Jonh ROLLINGFORD ✞": {
    "titre": "Seigneur de Wild Range",
    "metier": "Seigneur & Chevalier",
    "conjoint": "Inconnu",
    "argent": -1,
    "reputation": -1,
    "description": "Fondateur de la grande ville de Wild Range, Jonh se battit dans la grande guerre des dragons en tant que commandant des armées humaines. Ceci lui value une place de maitre auprès du nouveau Roi Bob Roxton.",
    "born": -1,
    "death": -2
  },
  "Stannis ROLLINGFORD ✞": {
    "titre": "Roi du royaume de Renblood, Seigneur de Wild Range, Seigneur des 4 Terres, Gardien des Mondes",
    "metier": "Roi",
    "conjoint": "Jade Linster",
    "argent": -1,
    "reputation": -1,
    "description": "Stannis le bon se battit lors de la bataille navale de l'Haguesier, qu'il remporta avec succès en annéantissant la flotte des Roxton. Il fut un très bon roi nottament en créant le rôle politique de Magistrat",
    "born": 274,
    "death": 321
  },
  "Didier ROLLINGFORD": {
    "titre": "Prince du temple d'Aquillon, Gardien des frontières",
    "metier": "Coordinateur Royale",
    "conjoint": "Elisabeth Ouloh",
    "argent": 12,
    "reputation": 81,
    "description": "Frère de Stannis celui-ci se battat à ses côtés lors de la bataille sanglante (Verdict). il fût nommée le tueur de cyclope suite à cela. il fut nommé Coordinateur Royale par le roi HERBERT.",
    "born": 289,
    "death": -1
  },
  "Pristine ROLLINGFORD": {
    "titre": "Princesse du Vincourt",
    "metier": "Maitre Magicienne",
    "conjoint": "Aucun",
    "argent": 6,
    "reputation": 77,
    "description": "Première princesse royale, celle ci quitta très vite le chateau de triomphe pour partir faire l'armée. Son talent en magie fût très vite remarquée et après 7 années de service elle devenu maitre magicienne. Elle rejoins très vite la citadelle de Vincourt et y installa une culture autour de la magie très avancée. Elle a rejoins la guilde magique en 327 et est vu comme la prochaine maitresse mystique du Royaume",
    "born": 298,
    "death": -1
  },
  "Herbert ROLLINGFORD": {
    "titre": "Roi du royaume de Renblood, Seigneur de Wild Range, Seigneur des 4 Terres, Gardien des Mondes",
    "metier": "Roi",
    "conjoint": "Dolores Wyne",
    "argent": 140,
    "reputation": 68,
    "description": "HERBERT est un roi très controversé, lors du début de son reigne il augmenta les droits des elfes et des nains en leur donnant un statut équivalent aux humaine.",
    "born": 301,
    "death": -1
  },
  "James ROLLINGFORD": {
    "titre": "Prince de Ages, le conquérant",
    "metier": "Maire de Ages",
    "conjoint": "Walda Banefort",
    "argent": 40,
    "reputation": 97,
    "description": "James partis seul avec une armée pour conquérir l'archipel de l'hibou. Il en revint vinqueur et fit nomée prince de Ages par son frères le Roi.",
    "born": 307,
    "death": -1
  },
  "Adeline ROLLINGFORD": {
    "titre": "Princesse d'Aquillon",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": 4,
    "reputation": 100,
    "description": "Nièce du Roi, elle aime l'art et la danse. Promise du jeune Silvain Feran.",
    "born": 320,
    "death": -1
  },
  "Philipe ROLLINGFORD": {
    "titre": "Dauphin du royaume",
    "metier": "Aucun",
    "conjoint": "Aucune",
    "argent": 5,
    "reputation": 0,
    "description": "Fils du Roi il aime la chasse, manger et grimper partout dans le chateau du Triomphe.",
    "born": 325,
    "death": -1
  },
  "Audrey ROLLINGFORD": {
    "titre": "Princesse du Royaume",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": 3,
    "reputation": 0,
    "description": "Fille du Roi",
    "born": 327,
    "death": -1
  },
  "Julien ROLLINGFORD": {
    "titre": "Seigneur de Wild Range",
    "metier": "???",
    "conjoint": "???",
    "argent": -1,
    "reputation": -1,
    "description": "Sauveur de la grand famine du Nord, il achemina des cargaison de céréale dans le comté de Cornwall pour sauver les peuples",
    "born": -1,
    "death": -1
  },
  "Elanor CHALK ✞": {
    "titre": "Reine Elfiques",
    "metier": "Maître magicienne",
    "conjoint": "Qinfir ✞ Abyssion",
    "argent": -1,
    "reputation": -1,
    "type": "Éthilion",
    "description": "La regrettée Reine Elfe, connue pour sa sagesse et sa puissance magique, ayant dirigé avec grâce la communauté elfique jusqu'à sa disparition",
    "born": 71,
    "death": 210
  },
  "Wranmaris CHALK ✞": {
    "titre": "Seigneur des elfes",
    "metier": "Seigneur des elfes",
    "conjoint": "Xillana Éthilion",
    "argent": -1,
    "reputation": -1,
    "type": "Éthilion",
    "description": "Ancien dirigeant des Elfes, reconnu pour sa force et sa loyauté envers son peuple. Son court règne a été marqué par la prospérité et la paix elfique",
    "born": 169,
    "death": 322
  },
  "Orixina CHALK ✞": {
    "titre": "Gardienne des étoiles",
    "metier": "Cheffe de l'armée Ailurion",
    "conjoint": "Zumpetor Éthilion",
    "argent": 15,
    "reputation": -1,
    "type": "Ailurion",
    "description": "Suite aux massacres des elfes par les Roxton et les Ouloh durant la Grande Guerre de Séparation, les survivants elfes, dirigés par Orixina Chalk, entreprirent une quête pour retrouver le Sceptre des Étoiles, un ancien artefact détenu par les Éthilion. Cette quête les mena à travers les forêts et les montagnes de Mofrage. Le Sceptre, une relique de grande puissance, avait le pouvoir de renforcer la magie des elfes et d'assurer leur protection. Après des années de recherches, Orixina le trouva dans une ancienne ruine elfique, et sa découverte permit de protéger les elfes restants des incursions humaines. La légende de Orixina devint un symbole d’espoir et de résilience pour tous les elfes du royaume.",
    "born": 196,
    "death": -1
  },
  "Herris CHALK": {
    "titre": "Druide",
    "metier": "Druide & maitre de la guilde Mystique",
    "conjoint": "Orizorwyn Ailurion",
    "argent": 10,
    "reputation": 91,
    "type": "Éthilion",
    "description": "Après des décennies d'études et de méditation dans les forêts du comté de Mofrage, Herris Chalk, maître druidique et gardien des mystères de la nature, découvrit un rituel ancien capable de renforcer les pouvoirs des forêts environnantes. Grâce à ce rituel, les elfes purent protéger les forêts de l'expansion humaine et y établir des refuges sûrs. Herris rejoignit la Guilde Mystique et devint son chef en 312. Ses actes consolidèrent le rôle des elfes dans la préservation de la magie et de la nature du royaume.",
    "born": 231,
    "death": -1
  },
  "Glynvalur CHALK": {
    "titre": "Seigneur des elfes",
    "metier": "Seigneur des elfes",
    "conjoint": "Aucun",
    "argent": 35,
    "reputation": 87,
    "type": "Ailurion",
    "description": "Dirigeant charismatique, Glynvalur est admiré pour sa diplomatie et son engagement envers l'unité elfique.",
    "born": 247,
    "death": -1
  },
  "Tia CHALK": {
    "titre": "Gardienne des arbres et des âmes",
    "metier": "Emissaire principale des elfes pour les humains",
    "conjoint": "Aucun",
    "argent": 10,
    "reputation": 94,
    "type": "Éthilion",
    "description": "Ambassadrice émérite, Tia représente les elfes avec grâce et sert de pont entre les mondes elfique et humain",
    "born": 256,
    "death": -1
  },
  "Wynyra CHALK": {
    "titre": "Noble",
    "metier": "Tisserande",
    "conjoint": "Pazu ",
    "argent": 5,
    "reputation": 67,
    "type": "Abyssion",
    "description": "Artisane talentueuse, Wynyra est appréciée pour ses compétences dans l'art de la tapisserie, ajoutant une touche d'élégance à la société elfique.",
    "born": 291,
    "death": -1
  },
  "Bob ROXTON ✞": {
    "titre": "Roi du Royaume de Renblood, Seigneur de Rozdru, Seigneur des mers, Gardien des Mondes",
    "metier": "Capitaine navale",
    "conjoint": "Louisa Paltain",
    "argent": -1,
    "reputation": -1,
    "description": "Bob Roxton mena les armées du royaume dans une lutte acharnée contre les créatures mythiques. Stratège exceptionnel, il comprit avant tout le monde que les dragons pourraient devenir des alliés plutôt que des menaces. C'est lui qui scella l'alliance avec les premiers dragonniers et posa les bases du futur royaume.",
    "born": 190,
    "death": 251
  },
  "Lassiou ROXTON ✞": {
    "titre": "Roi du Royaume de Renblood, Seigneur de Rozdru, Seigneur des mers, Gardien des Mondes",
    "metier": "Capitaine navale",
    "conjoint": "Louize Ouloh",
    "argent": -1,
    "reputation": -1,
    "description": "L’architecte du pouvoir naval, Lassiou Roxton consolida la suprématie des Roxton sur les mers en créant une flotte de guerre sans précédent. Sous son règne, la confrérie des Frères Maritimes assura aux Roxton un monopole absolu sur les routes commerciales. Cependant, il négligea les affaires terrestres, ce qui affaiblit les défenses du royaume.",
    "born": 222,
    "death": 278
  },
  "Antina ROXTON ✞": {
    "titre": "Princesse du Royaume de Renblood, La \"Putain\", La \"Bannie\"",
    "metier": "Diplomate",
    "conjoint": "Entropri Rok",
    "argent": -1,
    "reputation": -1,
    "description": "La Princesse Bannie, Antina avait une réputation sulfureuse. Connue pour ses intrigues de cour et ses alliances douteuses avec des factions criminelles, elle fut exilée au comté d’Eldia après avoir tenté d’évincer son frère.",
    "born": 230,
    "death": 298
  },
  "Isandre ROXTON ✞": {
    "titre": "Roi du Royaume de Renblood, Seigneur de Rozdru, Seigneur des mers, Gardien des Mondes",
    "metier": "Capitaine navale",
    "conjoint": "Daé Feran",
    "argent": -1,
    "reputation": -1,
    "description": "Isandre hérita d’un royaume en crise. Il tenta de rétablir l’ordre mais fut rapidement acculé par ses ennemis. Malgré un certain talent militaire, il n’était pas préparé à la bataille de l’Haguersier, où il trouva la mort face aux forces de Stannis Rollingford.",
    "born": 260,
    "death": 296
  },
  "Anna ROXTON": {
    "titre": "Princesse",
    "metier": "Aucun",
    "conjoint": "Leny II LYNSTER ✞",
    "argent": 35,
    "reputation": 52,
    "description": "Mariée à Leny II Lynster, Anna a toujours joué un rôle discret dans les affaires politiques mais son influence est indéniable. Grâce à elle, les relations entre les Roxton et les Lynster sont restées solides malgré les conflits passés.",
    "born": 270,
    "death": -1
  },
  "Araceli ROXTON": {
    "titre": "Dame de Palam",
    "metier": "Conseillère du Seigneur",
    "conjoint": "Arthur I WYNE \t",
    "argent": 15,
    "reputation": 61,
    "description": "Araceli est une figure d'autorité respectée, ayant apporté stabilité et prospérité au comté de Palam après la chute des Roxton. Malgré le passé belliqueux de sa famille, elle a su réconcilier les populations humaines et dragonnières grâce à son mariage avec Arthur I Wyne.",
    "born": 290,
    "death": -1
  },
  "Joras ROXTON": {
    "titre": "Seigneur de Rozdru",
    "metier": "Capitaine naval",
    "conjoint": "Louiza Juifou",
    "argent": 55,
    "reputation": 32,
    "description": "Joras fut l’un des derniers à tenter de reconstruire la flotte Roxton après la destruction des Frères Maritimes. Cependant, il fut confronté à la montée des Rollingford et ne parvint jamais à restaurer le pouvoir naval de sa famille.",
    "born": 292,
    "death": -1
  },
  "Conrad ROXTON": {
    "titre": "Seigneur de Paume",
    "metier": "Diplomate",
    "conjoint": "Ebony Wyne",
    "argent": 25,
    "reputation": 62,
    "description": "Conrad est un homme diplomatique qui a su préserver l’influence de sa famille après la chute des Roxton. Marié à Ebony Wyne, il a consolidé l'alliance entre les Wyne et les derniers Roxton, garantissant la stabilité du comté de Palam.",
    "born": 300,
    "death": -1
  },
  "Sévrin ROXTON": {
    "titre": "Héritier des Roxton",
    "metier": "Apprenti",
    "conjoint": "Aucun",
    "argent": 5,
    "reputation": 100,
    "description": "Sévrin est trop jeune pour régner, mais il est éduqué dans le secret par des anciens fidèles des Roxton qui espèrent restaurer leur dynastie. Certains le considèrent comme le dernier espoir de sa lignée.",
    "born": 322,
    "death": -1
  },
  "Edmon ROXTON": {
    "titre": "Seigneur en devenir",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": 5,
    "reputation": 0,
    "description": "Fils cadet de Joras, Edmon grandit loin des intrigues de la noblesse. Il est élevé dans une famille de marchands, loin des anciennes ambitions de grandeur de sa famille.",
    "born": 326,
    "death": -1
  },
  "Entropri ROK ✞": {
    "titre": "Seigneur de St Troufion, Forgeron Noble de Saint Troufion, Époux de l'Exilée",
    "metier": "Maître forgeron",
    "conjoint": "Antina ROXTON ✞",
    "argent": -1,
    "reputation": -1,
    "description": "Connu pour son mariage audacieux avec l'exilée Antina Roxton, il devint célèbre en forgeant des armes réputées à travers tout le comté d'Eldia.",
    "born": 236,
    "death": 306
  },
  "Blanche ROK ✞": {
    "titre": "Dame des Érudits",
    "metier": "Érudite",
    "conjoint": "Thibault FERAN ✞",
    "argent": -1,
    "reputation": -1,
    "description": "Connue pour avoir co-fondé la grande bibliothèque du Chercheur à Isvanore, célébrée pour sa sagesse.",
    "born": 254,
    "death": 314
  },
  "Florentin ROK": {
    "titre": "Seigneur de St Troufion, Maître de la Forge de Saint Troufion",
    "metier": "Maître forgeron et artisan",
    "conjoint": "Lisia JUIFOU",
    "argent": 70,
    "reputation": 77,
    "description": "Forgeron respecté, succédant à Entropri, il renforce la renommée des armes de Saint Troufion, équipant régulièrement les familles nobles du Sud.",
    "born": 274,
    "death": -1
  },
  "Kounay ROK": {
    "titre": "Marquise d'Eldia, Dame de Fyvelune",
    "metier": "Diplomate",
    "conjoint": "Eudes BANEFORT",
    "argent": 30,
    "reputation": 87,
    "description": "Marquise influente, jouant un rôle clé dans les relations entre le Sud et Fyvelune, aidant à renforcer les alliances avec les Banefort.",
    "born": 282,
    "death": -1
  },
  "Terror ROK": {
    "titre": "Seigneur Consort de Saint Troufion",
    "metier": "Ancien Maire, diplomate",
    "conjoint": "Reli LYNSTER",
    "argent": 45,
    "reputation": 74,
    "description": "Respecté pour avoir dirigé la ville après la mort précoce de son épouse, il est impliqué dans la médiation entre les familles nobles locales.",
    "born": 284,
    "death": -1
  },
  "Rose ROK": {
    "titre": "Dame du Commerce, Ambassadrice Économique",
    "metier": "Marchande, Ambassadrice",
    "conjoint": "Gardieu VERTOUAN",
    "argent": 35,
    "reputation": 64,
    "description": "Connue pour avoir établi d'importantes routes commerciales et diplomatiques entre Eldia et les autres comtés, renforçant ainsi l'économie locale.",
    "born": 285,
    "death": -1
  },
  "Lilas ROK": {
    "titre": "Noble de Saint Troufion",
    "metier": "Artisane, noble",
    "conjoint": "Moha ZIWO",
    "argent": 20,
    "reputation": 51,
    "description": "Appréciée pour son habileté dans la création de bijoux précieux, elle forge une alliance subtile avec la famille Ziwo",
    "born": 297,
    "death": -1
  },
  "Iris ROK": {
    "titre": "Maire actuelle de Saint Troufion",
    "metier": "Maire",
    "conjoint": "Vespa NAYTIX",
    "argent": 20,
    "reputation": 62,
    "description": "Reconnue pour sa gestion efficace et son rôle déterminant dans le maintien de la stabilité politique et économique locale.",
    "born": 296,
    "death": -1
  },
  "Ambroise ROK": {
    "titre": "Héritier seigneur de St Troufion",
    "metier": "Apprenti forgeron",
    "conjoint": "Aucune ",
    "argent": 20,
    "reputation": 75,
    "description": "Héritier prometteur de la tradition familiale, il montre un talent précoce pour la forge.",
    "born": 316,
    "death": -1
  },
  "Mystia ROK": {
    "titre": "Future Dame Consort des Feran",
    "metier": "Noble",
    "conjoint": "Lio FERAN",
    "argent": 10,
    "reputation": 99,
    "description": "Fiancée au futur chef des Feran, son mariage renforce l'influence de la famille ROK et étend leur renommée jusqu'à Isvanore.",
    "born": 318,
    "death": -1
  },
  "Bertorah GOODBROOK ✞": {
    "titre": "Fondateur de l'Alliance de la Montagne",
    "metier": "Maître mineur et diplomate",
    "conjoint": "Helvina Granite ✞",
    "argent": -1,
    "reputation": -1,
    "description": "Fondateur légendaire qui scella l'Alliance de la Montagne avec les elfes lors de la Grande Conquête, établissant la prospérité de Moria",
    "born": 90,
    "death": 300
  },
  "Dworin GOODBROOK ✞": {
    "titre": "Gardien des Profondeurs",
    "metier": "Chef des mineurs",
    "conjoint": "Bruna Fersolide ✞",
    "argent": -1,
    "reputation": -1,
    "description": "Célèbre pour avoir dirigé les mines de Moria avec sagesse, assurant la prospérité économique du royaume par l'exploitation de richesses minérales.",
    "born": 120,
    "death": 300
  },
  "Torvin GOODBROOK": {
    "titre": "Seigneur actuel de Moria",
    "metier": "Seigneur des mines et maître forgeron",
    "conjoint": "Selma Rochedure",
    "argent": 130,
    "reputation": "???",
    "description": "Respecté pour ses compétences en forge et son rôle crucial dans l'approvisionnement militaire du royaume, en particulier lors des conflits récents contre les cyclopes.",
    "born": 184,
    "death": -1
  },
  "Bryna GOODBROOK": {
    "titre": "Diplomate de Cornwall",
    "metier": "Ambassadrice auprès des Lynster",
    "conjoint": "Kelan Rougerocher",
    "argent": 85,
    "reputation": "???",
    "description": "Figure diplomatique importante, elle entretient des relations étroites avec les Lynster et assure des échanges commerciaux fructueux.",
    "born": 210,
    "death": -1
  },
  "Haldar GOODBROOK": {
    "titre": "Commandant des Défenses de Moria",
    "metier": "Militaire, gardien des portes",
    "conjoint": "Freja Orbemine",
    "argent": 75,
    "reputation": "???",
    "description": "Responsable de la sécurité des mines, il est reconnu pour avoir repoussé plusieurs invasions cyclopéennes, protégeant ainsi les richesses du royaume.",
    "born": 223,
    "death": -1
  },
  "Thrain GOODBROOK": {
    "titre": "Maître ingénieur de Moria",
    "metier": "Ingénieur et bâtisseur",
    "conjoint": "Hilda Rochefer",
    "argent": 70,
    "reputation": "???",
    "description": "Inventeur renommé, ses innovations technologiques ont permis d'améliorer considérablement l'exploitation minière et la sécurité de Moria.",
    "born": 241,
    "death": -1
  },
  "Mira GOODBROOK": {
    "titre": "Archiviste Royale de Moria",
    "metier": "Archiviste, érudite",
    "conjoint": "Aucun",
    "argent": 60,
    "reputation": "???",
    "description": "Érudite de renom, elle conserve les archives historiques et entretient des échanges intellectuels réguliers avec les familles Chalk et Feran.",
    "born": 249,
    "death": -1
  },
  "Gimli GOODBROOK": {
    "titre": "Jeune Guerrier des Montagnes",
    "metier": "Guerrier, explorateur",
    "conjoint": "Aucun",
    "argent": 30,
    "reputation": "???",
    "description": "Jeune guerrier aventureux et prometteur, il participe régulièrement à des missions exploratoires risquées et représente l'avenir courageux des Goodbrook.",
    "born": 285,
    "death": -1
  },
  "Vactir WYNE ✞": {
    "titre": "Seigneur de l'Est, Père des Dragons",
    "metier": "Dragonnier",
    "conjoint": "Inconnu",
    "argent": -1,
    "reputation": -1,
    "description": "Vactir fût le premier Humain à chevaucher les dragons de Palam. Il débutat en s'alliant aux Roxton la Grande guerres des Dragons et fût nommé Gouverneur de l'Est suite à cette victoire.",
    "born": -1,
    "death": -1
  },
  "Arthur I WYNE": {
    "titre": "Marquis de Palam, Père des dragons, Gouverneur de l'Est, Seigneur de Circos",
    "metier": "Dragonnier",
    "conjoint": "Araceli Roxton",
    "argent": 90,
    "reputation": 37,
    "description": "Arthur I retourna sa veste au Roxton pendant la bataille navalle de l'Haguesier quand celui-ci vit que les rebelles étaient proches de la victoire. Il fût nomée premier Marquis du comté de Palam en récompense.",
    "born": 277,
    "death": -1
  },
  "Arthur II WYNE": {
    "titre": "Comte de Palam, fils du dragon",
    "metier": "Dragonnier, maitre de la guilde des créatures magiques",
    "conjoint": "Lyza Linster",
    "argent": 40,
    "reputation": 62,
    "description": "Arthur II se fit remarqué lors de son long séjour dans l'armée, très bon avec les créatures celui-ci passa 9 années pour devenir Dragonnier. Il fût nommée maitre de la Guilde des Créatures magiques en 331.",
    "born": 300,
    "death": -1
  },
  "Dolores WYNE": {
    "titre": "Reine du royaume de Reinblood, Comptesse de Palam",
    "metier": "Reine",
    "conjoint": "HERBERT Rollingford",
    "argent": 140,
    "reputation": 91,
    "description": "Dolores passas 4 ans dans l'armée comme Chevalier, ensuite promise au Dauphin Herbert, celle ci l'épousa  en 319. En 321 celle-ci rejoins Triomphe en tant que Reine du royaume de Reinblood. Elle apprécie énormément l'art le théatre et les ménestrelle.",
    "born": 307,
    "death": -1
  },
  "Ethan WYNE": {
    "titre": "Vicomte de Palam, Seigneur de la forteresse de Dragoar",
    "metier": "Magistrat de Circos",
    "conjoint": "Connie Feran",
    "argent": 15,
    "reputation": 79,
    "description": "Ethan l'hargneux en soif de pouvoir tenta d'éliminer son frère ainé pour devenir compte de Palam, il ne pus rien faire face aux dragons et se vit forcé de s'éloigner de Circos par son père Arthur I. En exil il construisis la forteresse de Draogar dans le désert. Quelque année plus tard il réussi à se faire élir Magistrat de Circos par le peuple au grand regret de sa famille.",
    "born": 309,
    "death": -1
  },
  "Ebony WYNE": {
    "titre": "Vicomptesse de Palam",
    "metier": "Aucun",
    "conjoint": "Conrad Roxton",
    "argent": "?",
    "reputation": 98,
    "description": "Jeune femme magnifique, Ebony se passionat pour l'écriture, elle fut promise à Conrad Roxton et forcé de l'épousé.",
    "born": 309,
    "death": -1
  },
  "Arthur III WYNE": {
    "titre": "Compte de Palam, fils du dragon, héritier de l'Est",
    "metier": "Aucun",
    "conjoint": "Aucune",
    "argent": 15,
    "reputation": 100,
    "description": "Jeune héritier des Wyne, Arthur III aime les combats, les joutes et les chevaux. Il rêve de rejoindre l'armée et de devenir un Cavalier hors paires.",
    "born": 323,
    "death": -1
  },
  "Lys WYNE": {
    "titre": "Vicomptesse de Palam",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": 15,
    "reputation": 0,
    "description": "Du haut de ses 5 ans, Lys ne fait rien.",
    "born": 329,
    "death": -1
  },
  "Rob WYNE": {
    "titre": "Seigneur",
    "metier": "Aucun ",
    "conjoint": "Aucune",
    "argent": 5,
    "reputation": 0,
    "description": "Rob est Rob.",
    "born": 332,
    "death": -1
  },
  "Carle SAND": {
    "titre": "Noble",
    "metier": "Ni",
    "conjoint": "Aucune",
    "argent": 0,
    "reputation": 7,
    "description": "Bâtard de Arthur I, celui-ci rejoins les Frère du sable dès sa majorités, haïs de son père pour l'image qu'il lui donne, Carle hai son père et le Royaume.",
    "born": 310,
    "death": -1
  },
  "Robert LYNSTER ✞": {
    "titre": "Seigneur du Nord, l'Assassin des cyclopes, Seigneur des plaines glacées",
    "metier": "Maréchal des armées du Nord",
    "conjoint": "Inconnue",
    "argent": -1,
    "reputation": -1,
    "description": "Seigneur du Nord et fidèle allié des Roxton durant la Grande Guerre des Dragons, Robert Lynster se distingua en combattant aux côtés de Vactir Wyne, le premier humain à dompter un dragon. Après la guerre, il fut récompensé par la création de la ville de Freezing Farm, qui devint un centre majeur de production alimentaire pour le royaume. Il jura fidélité aux Roxton et assura la prospérité du Nord pendant plusieurs décennies.",
    "born": -1,
    "death": -1
  },
  "Leny II LYNSTER ✞": {
    "titre": "Marquis de Cornwall, Gouverneur du Nord, Seigneur de Colrac, le Loup Doré ",
    "metier": "Maréchal des armées du Nord",
    "conjoint": "Anna Roxton",
    "argent": -1,
    "reputation": -1,
    "description": "Marquis de Cornwall, Leny II continua l’héritage de son père en tant que maréchal des armées du Nord. Il fut un stratège reconnu pour ses victoires contre les incursions des bandits et des créatures magiques dans les plaines glacées. Il gouverna avec fermeté et maintint l'ordre dans son comté, tout en consolidant l'influence des Lynster dans le Nord. Leny II mourut dans des circonstances mystérieuses en 334.",
    "born": 264,
    "death": 334
  },
  "Tanguy LYNSTER ✞": {
    "titre": "Comte de Cornwall, le mortel",
    "metier": "Chevalier ",
    "conjoint": "Aucune",
    "argent": -1,
    "reputation": -1,
    "description": "Comte de Cornwall, Tanguy fut surnommé \"Le Mortel\" pour ses compétences exceptionnelles au combat. Son règne fut marqué par une série de campagnes militaires pour protéger les frontières du Nord contre les invasions cyclopéennes. Malgré son apparence impitoyable sur le champ de bataille, il était profondément respecté par son peuple pour sa loyauté et son sens de la justice. Il régna jusqu’à sa mort en 324.",
    "born": 260,
    "death": 324
  },
  "Jade LYNSTER ✞": {
    "titre": "Reine, Reine régente ",
    "metier": "Reine ",
    "conjoint": "Stannis Rollingford",
    "argent": -1,
    "reputation": -1,
    "description": "Jade Lynster était une reine respectée et aimée, ayant servi en tant que régente pendant une période de crise pour le royaume de Renblood. Mariée à Stannis Rollingford, elle joua un rôle clé dans la consolidation du pouvoir des Rollingford et dans la gestion des affaires du royaume. Jade était aussi connue pour son engagement envers les réformes sociales et politiques. Son décès en 329 fut une grande perte pour le royaume.",
    "born": 274,
    "death": 329
  },
  "Reli LYNSTER ✞": {
    "titre": "Dame de Paume",
    "metier": "Dame de Paume, Ex-mairesse de St Troufion de Paumé",
    "conjoint": "Terror Rok",
    "argent": -1,
    "reputation": -1,
    "description": "Mariée à Terror Rok, Reli fut une figure politique centrale dans la gestion de St Troufion. Elle a laissé un héritage durable dans la gouvernance locale avant son décès en 332.",
    "born": 288,
    "death": 332
  },
  "Stanislas LYNSTER": {
    "titre": "Marquis de Cornwall, Gouverneur du Nord, Seigneur de Colrac, le Fier",
    "metier": "Marquis",
    "conjoint": "Michelle Feran",
    "argent": 120,
    "reputation": 58,
    "description": "Fils de Lenyll, Stanislas gouverne actuellement Cornwall avec une poigne de fer. Il s'est marié à Michelle Feran, assurant une alliance durable avec la famille Feran. Sa gouvernance est marquée par la discipline militaire et la sécurité des frontières du Nord.",
    "born": 290,
    "death": -1
  },
  "Lyza LYNSTER": {
    "titre": "Dame de Palam, femme du dragon, la puissante",
    "metier": "Maitresse des finances",
    "conjoint": "Arthur II Wyne",
    "argent": 40,
    "reputation": 47,
    "description": "Mariée à Arthur II Wyne, Lyza est une figure influente du comté de Palam. Elle gère les finances du comté avec efficacité et s’assure que la richesse familiale soit bien investie dans les dragons de Palam et les projets économiques majeurs.",
    "born": 294,
    "death": -1
  },
  "Sergio LYNSTER": {
    "titre": "Compte de Cornwall, seigneur d'Avimasse",
    "metier": "Maréchal des armées ",
    "conjoint": "Jeanne Banefort",
    "argent": 20,
    "reputation": 83,
    "description": "Sergio fut reconnu par le peuple en tant que Maréchal des armées, contrairement à ses prédéceseurs il chercha plutôt à renforcer les relations commerciales avec les comtés voisins, notamment avec Mofrage. Sergio est marié à Jeanne Banefort et ensemble, ils ont œuvré pour consolider la position des Lynster au sein du royaume.",
    "born": 302,
    "death": -1
  },
  "Mircella LYNSTER": {
    "titre": "Vicomptesse de Cornwall",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": 25,
    "reputation": 74,
    "description": "Mircella est encore jeune, mais son avenir au sein de la famille Lynster semble prometteur. Elle est déjà impliquée dans la formation et l'apprentissage des coutumes politiques du royaume et est destinée à devenir une figure influente dans le futur. Mircella montre un grand intérêt pour la diplomatie et la gestion des affaires internes du comté.",
    "born": 321,
    "death": -1
  },
  "Leny III LYNSTER": {
    "titre": "Comte de Cornwall, héritier du Nord",
    "metier": "Aucun",
    "conjoint": "Aucune",
    "argent": 10,
    "reputation": 100,
    "description": "Fils de Stanislas Lynster, LeenyIII est destiné à devenir un leader important dans Cornwall. Encore jeune, il est formé pour prendre les rênes de la région et maintenir la domination de sa famille.",
    "born": 323,
    "death": -1
  },
  "Lina LYNSTER": {
    "titre": "Vicomptesse de Cornwall, dame d'Avimasse",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": 5,
    "reputation": 0,
    "description": "Fille cadette de Stanislas et Michelle, Lina est encore très jeune mais son avenir au sein de la famille Lynster semble déjà prometteur. Elle est élevée pour assumer des responsabilités politiques à l’avenir.",
    "born": 330,
    "death": -1
  },
  "Herbert LYNSTER": {
    "titre": "Gouverneur du Nord",
    "metier": "???",
    "conjoint": "???",
    "argent": -1,
    "reputation": -1,
    "description": "Pendant une décennie difficile pour le comté de Cornwall, la terre se retrouva stérile et incapable de fournir suffisamment de nourriture à ses habitants. Herbert Lynster, gouverneur du Nord, utilisa ses relations avec les familles humaines et naines pour assurer la survie de son peuple. Il fit appel à Julien Rollingford, Seigneur de Wild Range, qui ordonna l'acheminement de réserves de céréales et de bétail vers le Nord. La famine fut ainsi évitée, et les liens entre les Lynster et les Rollingford s’en trouvèrent renforcés, jetant les bases de leur future alliance lors des guerres à venir.",
    "born": -1,
    "death": -1
  },
  "Gaudfroy FERAN ✞": {
    "titre": "Seigneur fondateur d'Isvanore, Père de Feran",
    "metier": "Constructeur, Seigneur et Stratège",
    "conjoint": "Aliénor Paltain ✞",
    "argent": -1,
    "reputation": -1,
    "description": "Fondateur légendaire d'Isvanore, respecté pour son habileté à établir une ville prospère sur l'île isolée de Feran. Reconnu pour avoir pacifié les terres sauvages et instauré une paix durable.",
    "born": -1,
    "death": -1
  },
  "Thibault FERAN ✞": {
    "titre": "Grand érudit d'Isvanore, Gardien du Savoir",
    "metier": "Érudit, bibliothécaire royal, conseiller",
    "conjoint": "Blanche ROK ✞",
    "argent": -1,
    "reputation": -1,
    "description": "Admiré pour avoir fondé la grande bibliothèque du Chercheur, Thibault est célébré comme le protecteur de la connaissance et des traditions littéraires du royaume.",
    "born": 251,
    "death": 325
  },
  "Harno FERAN ✞": {
    "titre": "Seigneur d'Isvanore",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": -1,
    "reputation": -1,
    "description": "Tragiquement connu pour sa mort prématurée, qui marqua profondément la famille Feran et la population d'Isvanore.",
    "born": 254,
    "death": 265
  },
  "Daé FERAN": {
    "titre": "Reine consort de Renblood, Dame d'Isvanore, Gardienne du Souvenir, Maire de Lone",
    "metier": "Diplomate et Mairesse",
    "conjoint": "Isandre ROXTON ✞",
    "argent": 30,
    "reputation": 91,
    "description": "Respectée pour sa sagesse diplomatique et son rôle discret mais déterminant durant son règne comme Reine consort, elle est maintenant une figure emblématique de résilience. Elle est devenu Maire de Lone suite au décès de son mari.",
    "born": 260,
    "death": -1
  },
  "Enguerrand FERAN": {
    "titre": "Chef actuel de la famille Feran, Maire d'Isvanore, Seigneur régent des terres insulaires",
    "metier": "Gouverneur, administrateur et maire",
    "conjoint": "Liza BANEFORT",
    "argent": 50,
    "reputation": 93,
    "description": "Reconnu pour ses qualités administratives exceptionnelles, Enguerrand est apprécié autant par ses sujets que par ses pairs. Son leadership a consolidé la prospérité et la stabilité d'Isvanore.",
    "born": 286,
    "death": -1
  },
  "Michelle FERAN": {
    "titre": "Dame de Cornwall, Noble d'Isvanore",
    "metier": "Ambassadrice familiale, Noble",
    "conjoint": "Stanislas LYNSTER",
    "argent": 20,
    "reputation": 81,
    "description": "Connue pour sa discrétion et son habileté à gérer subtilement les alliances familiales, Michelle est une figure respectée au sein des cercles diplomatiques.",
    "born": 287,
    "death": -1
  },
  "Connie FERAN": {
    "titre": "Maîtresse de la guilde de la Lettre",
    "metier": "Maîtresse de guilde",
    "conjoint": "Ethan WYNE",
    "argent": 10,
    "reputation": 97,
    "description": "Connie est admirée pour sa rapidité d'ascension et son efficacité à gérer les réseaux d'informations à travers tout le royaume. Sa jeunesse est perçue comme un signe prometteur pour l'avenir des guildes.",
    "born": 312,
    "death": -1
  },
  "Lio FERAN": {
    "titre": "Héritier d'Isvanore",
    "metier": "Noble héritier",
    "conjoint": "Mystia ROK",
    "argent": 10,
    "reputation": 99,
    "description": "Lio est considéré comme un jeune héritier prometteur, attentivement formé par son père pour assurer la continuité et l'essor des Feran. Il s'investit particulièrement dans les affaires familiales et publiques.",
    "born": 316,
    "death": -1
  },
  "Anna FERAN": {
    "titre": "Lettrée d'Isvanore, Apprentie érudite",
    "metier": "Apprentie érudite",
    "conjoint": "Aucun",
    "argent": 5,
    "reputation": 100,
    "description": "Très prometteuse, Anna se démarque déjà par ses connaissances avancées pour son âge. Elle est suivie avec intérêt par les érudits du royaume",
    "born": 323,
    "death": -1
  },
  "Silvain FERAN": {
    "titre": "Nole",
    "metier": "Aucun",
    "conjoint": "Adeline ROLLINGFORD (Promise)",
    "argent": 5,
    "reputation": 100,
    "description": "Jeune noble engagé dans une alliance cruciale avec la famille royale Rollingford, Silvain est déjà impliqué dans la diplomatie familiale.",
    "born": 322,
    "death": -1
  },
  "Loa FERAN": {
    "titre": "Dame d'Isvanore",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": 0,
    "reputation": 0,
    "description": "Bien qu'encore très jeune, Loa porte déjà les espoirs de la famille, son avenir demeurant ouvert à de multiples possibilités au sein du royaume.",
    "born": 326,
    "death": -1
  },
  "Amaury BANEFORT ✞": {
    "titre": "Seigneur du Sud, Grand Bâtisseur de Fyvelune",
    "metier": "Architecte ",
    "conjoint": "Inconnue",
    "argent": -1,
    "reputation": -1,
    "description": "Réputé pour avoir construit le prestigieux palais de Fyvelune, l'un des bâtiments les plus impressionnants du Royaume.",
    "born": 191,
    "death": 241
  },
  "Foulques BANEFORT ✞": {
    "titre": "Marquis d'Eldia, Gouverneur du Sud, Seigneur de Fyvelune",
    "metier": "???",
    "conjoint": "Inconnue",
    "argent": -1,
    "reputation": -1,
    "description": "Célèbre pour sa bravoure lors de la bataille navale décisive de l'Haguersier aux côtés de Stannis Rollingford.",
    "born": 231,
    "death": 302
  },
  "Geoffroy BANEFORT ✞": {
    "titre": "Marquis d'Eldia, Gouverneur du Sud, Seigneur de Fyvelune",
    "metier": "Seigneur",
    "conjoint": "Inconnue",
    "argent": -1,
    "reputation": -1,
    "description": "Apprécié pour son règne juste et stable, il renforça les défenses et l'économie du marquisat.",
    "born": 250,
    "death": 320
  },
  "Landry BANEFORT ✞": {
    "titre": "Comte d'Eldia, Le Jeune unificateur",
    "metier": "Diplomate",
    "conjoint": "Grey ENVAHISSANT",
    "argent": -1,
    "reputation": -1,
    "description": "Reconnu pour ses compétences diplomatiques, notamment dans les négociations difficiles avec des familles rivales.",
    "born": 265,
    "death": 324
  },
  "Liza BANEFORT": {
    "titre": "Dame Consort des Feran",
    "metier": "Artisan",
    "conjoint": "Enguerrand FERAN",
    "argent": 20,
    "reputation": 79,
    "description": "Elle fu connus our son mariage stratégique, elle assure une solide alliance entre Banefort et Feran tout en se rapprochant de son grand rève : la Forge de St Troufion. Très bonne forgeron",
    "born": 285,
    "death": -1
  },
  "Eudes BANEFORT": {
    "titre": "Marquis d'Eldia, Gouverneur du Sud, Seigneur de Fyvelune",
    "metier": "Seigneur",
    "conjoint": "Kounay ROK",
    "argent": 60,
    "reputation": 91,
    "description": "Seigneur respecté, passionné par l'histoire du royaume et reconnu pour ses écrits détaillés sur les guerres passées. Très proche des familles Rollingford et Wyne, il est souvent consulté pour ses connaissances historiques précieuses.",
    "born": 285,
    "death": -1
  },
  "Espero BANEFORT": {
    "titre": "Comte d'Eldia, Intendant Général de Fyvelune",
    "metier": "Intendant",
    "conjoint": "Lia Ouloh",
    "argent": 30,
    "reputation": 88,
    "description": "Reconnu pour sa loyauté indéfectible envers les Banefort et son efficacité remarquable dans la gestion des ressources. A joué un rôle clé dans la résolution de la Grande Famine du Nord en collaborant étroitement avec Herbert Lynster.",
    "born": 288,
    "death": -1
  },
  "Alix BANEFORT": {
    "titre": "Vicomtesse d'Eldia, la Dame de Paix",
    "metier": "Ambassadrice",
    "conjoint": "Vincent Ziwo",
    "argent": 20,
    "reputation": 69,
    "description": "Connue pour sa diplomatie subtile et sa capacité à négocier efficacement des accords commerciaux et des traités de paix. Son mariage avec Vincent Ziwo a permis une alliance forte avec une famille influente du Sud.",
    "born": 305,
    "death": -1
  },
  "Sybille BANEFORT": {
    "titre": "Protectrice des Arts et de la Culture (Abandon du titre noble)",
    "metier": "Mécène, organisatrice culturelle",
    "conjoint": "Aucun",
    "argent": 15,
    "reputation": 88,
    "description": "Très appréciée pour sa générosité et son engagement dans la préservation des traditions culturelles et artistiques. Elle entretient de bonnes relations avec la famille Chalk, célèbre pour ses artistes.",
    "born": 310,
    "death": -1
  },
  "Marguerite BANEFORT": {
    "titre": "Vicomtesse d'Eldia",
    "metier": "Érudit et archiviste",
    "conjoint": "Aucun",
    "argent": 15,
    "reputation": 76,
    "description": "Jeune érudite dont les travaux sur les elfes et les anciennes civilisations sont réputés à travers tout le royaume. Elle travaille étroitement avec des érudits des familles Chalk et Goodbrook.",
    "born": 313,
    "death": -1
  },
  "Walda BANEFORT": {
    "titre": "Dame Consort d'Ages, Comtesse d'Eldia",
    "metier": "Aucun",
    "conjoint": "James ROLLINGFORD",
    "argent": 20,
    "reputation": 98,
    "description": "Son mariage avec James Rollingford, maire d'Ages, a consolidé l'influence des Banefort dans l'Ouest.",
    "born": 309,
    "death": -1
  },
  "Renaud BANEFORT": {
    "titre": "Comte d'Eldia, Heritier du Sud",
    "metier": "Chevalier",
    "conjoint": "Aucun",
    "argent": 10,
    "reputation": 93,
    "description": "Jeune chevalier renommé pour ses exploits militaires aux frontières de Cornwall, souvent loué par les Rollingford pour sa bravoure contre les incursions cyclopéennes.",
    "born": 313,
    "death": -1
  },
  "Jeanne BANEFORT": {
    "titre": "Vicomtesse d'Eldia",
    "metier": "Stratège militaire, Iwwyn ",
    "conjoint": "Sergio LYNSTER",
    "argent": 10,
    "reputation": 78,
    "description": "Mariée au Maréchal Sergio Lynster, Jeanne est appréciée pour son intelligence stratégique et ses conseils précieux dans la défense du Nord. Elle fut cruciale lors des récentes batailles contre les envahisseurs orques.",
    "born": 305,
    "death": -1
  },
  "Aélis BANEFORT": {
    "titre": "Héritière de Fyvelune",
    "metier": "Aucun",
    "conjoint": "Aucun",
    "argent": 10,
    "reputation": 0,
    "description": "Très jeune encore, elle incarne néanmoins les espoirs futurs de la famille Banefort et fait l'objet d'attentions particulières dans le cadre de la future gouvernance de Fyvelune.",
    "born": 332,
    "death": -1
  }
};
export default personnages;