const politique = {
    data : 
    [
        {
            titre: "Chef",
            privileges: ["Acheter de nouveaux droits"],
            role: "Dirige une colonie sous l'autorité du maire et du préfet d'une ville/grande ville. Immunité communale.",
            arrivee: "Élection par le peuple d'une colonie",
            requis: ["Accord d'une Δ", "Titre de citoyen"],
            revenu: "12 bronzes / mois",
            temps: "12 mois mini puis 1 vote de destitution / 3 mois",
            lieu: ["Colonie"],
        },

    
        {
            titre: "Maire de village",
            privileges: ["Acheter de nouveaux droits", "Immunité communale"],
            role: "Dirige un village. Sous l'autorité du maire/marquis et du préfet d'une grande ville/marquisat. Nomme le régisseur du village.",
            arrivee: "Élection par le peuple d'un village",
            requis: ["Accord d'une Δ", "Titre de citoyen libre"],
            revenu: "24 bronzes / mois",
            temps: "12 mois mini puis 1 vote de destitution / 3 mois",
            lieu: ["Village"],
        },
        {
            titre: "Régisseur",
            privileges: ["Protection du village", "Perçois les impôts"],
            role: "Gère la protection et les impôts du village.",
            arrivee: "Nommé par le maire de village",
            requis: ["Titre de citoyen", "2 années dans l'armée", "Écuyer"],
            revenu: "8 bronzes / mois",
            temps: "Tant que le maire est au pouvoir",
            lieu: ["Village"],
        },
        {
            titre: "Médiateur",
            privileges: ["Rend la justice mineur", "Gestionnaire scolaire", "Représente la couronne"],
            role: "Rend la justice mineure et représente l'autorité locale.",
            arrivee: "Nommé par Δ",
            requis: ["Titre de citoyen"],
            revenu: "8 bronzes / mois",
            temps: "24 mois",
            lieu: ["Village"],
        },
    
    
        {
            titre: "Maire d'une cité libre",
            privileges: [
                "Acheter de nouveaux droits", "Immunité communale", "Bannir quelqu'un",
                "Détourner de l'argent public", "Définir les taxes"
            ],
            role: "Dirige une cité libre sous l'autorité du marquis et du préfet d'une grande ville/marquisat. Nomme le régisseur du village.",
            arrivee: "Élection par le peuple d'une cité libre",
            requis: ["Accord du Préfet", "Titre de patricien"],
            revenu: "40 bronzes / mois",
            temps: "12 mois mini puis 1 vote de destitution / 3 mois",
            lieu: ["Cité libre"],
        },
        {
            titre: "Capitaine",
            privileges: ["Protection de la ville", "Perçois les impôts", "2 gardes", "Ordonnance d'arrestation"],
            role: "Gère la sécurité de la cité libre et de la ville.",
            arrivee: "Nommé par le maire d'une cité libre ou d'une ville",
            requis: ["Titre de citoyen libre", "Chevalier"],
            revenu: "12 bronzes / mois",
            temps: "Tant que le maire est au pouvoir",
            lieu: ["Cité libre","Ville"],
        },
        {
            titre: "Préfet",
            privileges: ["Rend la justice", "Représente la couronne"],
            role: "Administre la justice et représente l'autorité royale.",
            arrivee: "Nommé par Δ",
            requis: ["Titre de citoyen libre"],
            revenu: "16 bronzes / mois",
            temps: "24 mois",
            lieu: ["Cité libre","Ville"],
        },
        {
            titre: "Représentant",
            privileges: ["Représente les villageois", "Participe à la justice", "Gestionnaire scolaire"],
            role: "Fait le lien entre les habitants et les autorités.",
            arrivee: "Élection par le peuple d'une cité libre ou ville",
            requis: ["Titre de citoyen libre"],
            revenu: "8 bronzes / mois",
            temps: "12 mois",
            lieu: ["Cité libre","Ville"],
        },
        {
            titre: "Maire d'une ville",
            privileges: [
                "Acheter de nouveaux droits",
                "Immunité communale",
                "Bannir quelqu'un",
                "Détourner de l'argent public",
                "Définir les taxes"
            ],
            role: "Dirige une ville. Sous l'autorité du marquis. Nomme le capitaine de la ville.",
            arrivee: "Élection par le peuple d'une ville",
            requis: ["Accord du Préfet", "Titre de citoyen libre"],
            revenu: "1 silver / mois",
            temps: "12 mois mini puis 1 vote de destitution / 3 mois",
            lieu: ["Ville"]
        },
        {
            titre: "Représentant de la guilde",
            privileges: ["Inspection commerciale", "Réunion des commerçants"],
            role: "Représente la guilde dans une ville, s'occupe de la réglementation des prix et des intérêts des différents corps de métier au sein de la municipalité.",
            arrivee: "Nommé par le conseil des guildes",
            requis: ["Titre de citoyen libre", "Être membre de la guilde"],
            revenu: "28 bronzes / mois",
            temps: "24 mois",
            lieu: ["Ville", "Grande ville"]
        },
        {
            titre: "Directeur de chantier",
            privileges: ["Construction de bien public"],
            role: "Gère la construction et l'entretien des bâtiments publics.",
            arrivee: "Nommé par la guilde des Artisans",
            requis: ["Titre de citoyen libre", "Être membre de la guilde des artisans", "Constructeur lvl 5"],
            revenu: "24 bronzes / mois",
            temps: "24 mois",
            lieu: ["Ville", "Grande ville"]
        },
        {
            titre: "Maire de grande ville",
            privileges: [
                "Acheter de nouveaux droits",
                "Immunité communale",
                "Bannir quelqu'un",
                "Détourner de l'argent public",
                "Définir les taxes"
            ],
            role: "Dirige une grande ville. Sous l'autorité du marquis. Nomme le colonel de la ville.",
            arrivee: "Élection par le peuple d'une grande ville",
            requis: ["Accord du Procureur", "Titre de patricien"],
            revenu: "1 silver 32 bronzes / mois",
            temps: "12 mois mini puis 1 vote de destitution / 3 mois",
            lieu: ["Grande ville"]
        },
        {
            titre: "Colonel",
            privileges: ["Protection de la ville", "Perçoit les impôts", "5 gardes", "Ordonnance d'arrestation"],
            role: "Protection de la ville et de ses citoyens.",
            arrivee: "Élection par le peuple parmi les colonels de la grande ville",
            requis: ["Titre de citoyen libre", "Héraut"],
            revenu: "50 bronzes / mois",
            temps: "Pour la vie",
            lieu: ["Grande ville"]
        },
        {
            titre: "Magistrat",
            privileges: ["Définit la gravité de la loi", "Immunité communale"],
            role: "Représente les intérêts d'une ville et de ses villageois au niveau du Royaume, fait les lois, sous l'autorité des consuls.",
            arrivee: "Élection par le peuple d'une grande ville (x2 pour un Marquisat)",
            requis: ["Titre de citoyen libre"],
            revenu: "1 silver / mois",
            temps: "36 mois",
            lieu: ["Grande ville", "Marquisat"]
        },
        {
            titre: "Geôlier",
            privileges: ["Torturer quelqu'un", "2 gardes"],
            role: "Gère la prison et la garde du donjon.",
            arrivee: "Nommé par le maire d'une grande ville",
            requis: ["Titre de citoyen libre", "Écuyer"],
            revenu: "24 bronzes / mois",
            temps: "Tant que le maire est au pouvoir",
            lieu: ["Grande ville"]
        },
        {
            titre: "Procureur",
            privileges: ["Rend la justice", "Représente la couronne", "Trancheur de décision"],
            role: "Gère la justice de la ville.",
            arrivee: "Nommé par Δ",
            requis: ["Titre de citoyen libre"],
            revenu: "40 bronzes / mois",
            temps: "24 mois",
            lieu: ["Grande ville"]
        },
        {
            titre: "Marquis",
            privileges: [
                "Immunité communale",
                "Bannir quelqu'un",
                "Détourner de l'argent public",
                "Abroger l'immunité",
                "Désapprobation",
                "Invoquer la Garde Royale"
            ],
            role: "Dirige le Marquisat. Nomme le maître du donjon et des finances. Son premier enfant reprendra le flambeau à sa mort.",
            arrivee: "Nomé par Δ",
            requis: ["Naissance"],
            revenu: "+ Infini",
            temps: "Pour la vie",
            lieu: ["Marquisat"]
        },
        {
            titre: "Maréchal",
            privileges: [
                "Immunité communale",
                "Protection du Marquisat",
                "Perçois les impôts",
                "12 gardes",
                "Ordonnance d'arrestation",
                "Former quelqu'un en tant que combattant",
                "Confisquer des marchandises"
            ],
            role: "Protection du Marquisat et commandement des forces militaires locales.",
            arrivee: "Élection par le peuple parmi les maréchaux du Marquisat",
            requis: ["Titre de Patricien","Maréchal"],
            revenu: "1 silver 32 bronzes / mois",
            temps: "Pour la vie",
            lieu: ["Marquisat"]
        },
        {
            titre: "Maitre de guilde",
            privileges: [
                "Inspection commerciale",
                "Interdiction de vente",
                "Organiser une fête"
            ],
            role: "Dirige sa guilde et des marchés financiers de sa ville.",
            arrivee: "Nomé par le conseil des guildes",
            requis: ["Patricien", "Membre d'une guilde"],
            revenu: "1 silver / mois",
            temps: "96 mois",
            lieu: ["Marquisat"]
        },
        {
            titre: "Maitre de bail x2",
            privileges: [
                "Construction de bien public",
                "Démolir le bâtiment"
            ],
            role: "Gère le placement des différents bâtiments de la ville et la maintenance des bâtiments publics.",
            arrivee: "Nomé par la guilde des Artisans & Marchande",
            requis: ["Titre de Patricien","Être membre de la guilde des artisans ou marchande","Constructeur lvl 8"],
            revenu: "48 bronzes / mois",
            temps: "24 mois",
            lieu: ["Marquisat","Royauté"]
        },
        {
            titre: "Maitre du donjon",
            privileges: [
                "Torturer quelqu'un",
                "Gère les peines dans la prison",
                "4 gardes"
            ],
            role: "Gère la prison, la garde du donjon.",
            arrivee: "Nomé par le Marquis",
            requis: ["Titre de Patricien","Chevalier"],
            revenu: "48 bronzes / mois",
            temps: "Tant que le Marquis est au pouvoir",
            lieu: ["Marquisat"]
        },
        {
            titre: "Maitre des finances",
            privileges: [
                "Définir les taxes",
                "Organisation d'évènement"
            ],
            role: "Gère les finances du Marquisat.",
            arrivee: "Nomé par le Marquis",
            requis: ["Titre de noble","Être membre de la guilde marchande"],
            revenu: "1 silver / mois",
            temps: "Tant que le Marquis est au pouvoir",
            lieu: ["Marquisat"]
        },
        {
            titre: "Roi",
            privileges: ["ALL"],
            role: "Dirige le Royaume. Nomme le maitre du donjon et des finances. Son premier enfant reprendra le flambeau à sa mort.",
            arrivee: "Hériter",
            requis: ["HAHAHAHAH AHAHAHAHA HAHA"],
            revenu: "+ Infini",
            temps: "Pour la vie",
            lieu: ["Royauté"]
        },
        {
            titre: "Chef des armées",
            privileges: [
                "Immunité communale",
                "Protection du royaume",
                "Commande l'armée du royaume",
                "Perçois les impôts royaux",
                "180 gardes",
                "Ordonnance d'arrestation",
                "Former quelqu'un en tant que guerrier",
                "Confisquer les marchandises",
                "Déclarer une guerre",
                "Tuer une personne"
            ],
            role: "Gère l'armée du royaume au service du roi.",
            arrivee: "Nomé par le Roi",
            requis: ["Titre de Noble","Chef des armées"],
            revenu: "3 silver / mois",
            temps: "Pour la vie",
            lieu: ["Royauté"]
        },
        {
            titre: "Consul x2",
            privileges: [
                "Immunité royale",
                "Définit la gravité de la loi",
                "Dirige les magistrats"
            ],
            role: "Possède l'autorité sur les magistrats lors de la création des lois, représente la loi dans l'assemblée",
            arrivee: "Nommer par le Roi",
            requis: [
                "Titre de Noble",
                "Ancien magistrat"
            ],
            revenu: "2 silver / mois",
            temps: "48 mois",
            lieu: ["Royaute"]
        },
        {
            titre: "Grand argentier",
            privileges: [
                "Définit les taxes",
                "Organisation d'événements"
            ],
            role: "Gère les finances royales et définit les taxes nationales",
            arrivee: "Nommer par le Roi",
            requis: [
                "Titre de noble",
                "Être membre de la guilde marchande"
            ],
            revenu: "2 silver / mois",
            temps: "Pour la vie",
            lieu: ["Royaute"]
        },
        {
            titre: "Coordinateur royal",
            privileges: [
                "Représente le Roi dans le Royaume"
            ],
            role: "Se déplace pour représenter le roi dans les différents comtés.",
            arrivee: "Nommer par le Roi",
            requis: [
                "Titre de noble"
            ],
            revenu: "1 silver / mois",
            temps: "Pour la vie",
            lieu: ["Royaute"]
        },
        {
            titre: "Maître mystique",
            privileges: ["X"],
            role: "Gère les intérêts mystique et magique dans le royaume",
            arrivee: "Nommer par la guilde mystique",
            requis: [
                "Titre de noble",
                "Être maître de la guilde mystique"
            ],
            revenu: "1 silver / mois",
            temps: "96 mois",
            lieu: ["Royaute"]
        },
        {
            titre: "Gardien du peuple",
            privileges: [
                "Représente les villageois",
                "Participe à la justice",
                "S'occupe des temples scolaires du royaume"
            ],
            role: "Représente les citoyens auprès du roi",
            arrivee: "Élection par le peuple de la royauté",
            requis: [
                "Titre patricien"
            ],
            revenu: "1 silver / mois",
            temps: "48 mois",
            lieu: ["Royaute"]
        },
        {
            titre: "Triomphant",
            privileges: [
                "S'occupe de la religion"
            ],
            role: "Représente la foi triparties pour le roi.",
            arrivee: "Élection par le peuple parmi les triomphants du Royaume",
            requis: [
                "Tous les titres",
                "Être un triomphant"
            ],
            revenu: "2 silver / mois",
            temps: "48 mois",
            lieu: ["Royaute"]
        }

    ]
};

export default politique;
