const guildesData = [
    {
      id: 1,
      name: "La Guilde des Artisans",
      leader: "Vernon ROK",
      location: "Fyvelune (Eldia)",
      fortune: 48,
      reputation: 58,
      members: 79,
      buildings: 67,
      description: `Accès à la meublerie royale.
      +10% d'XP dans les métiers du bois.
      Demande de rénovation, de prêt, d'apprenti.
      Accès à la chambre des guildes.`,
      image: "artisan.jpg",
    },
    {
      id: 2,
      name: "La Guilde des Commerçants",
      leader: "Tanguy CarRok",
      location: "Fyvelune (Eldia)",
      fortune: 62,
      reputation: 31,
      members: 73,
      buildings: 31,
      description: `Accès au magasin de la guilde dans toutes les villes gratuitement.
      Accès à la chambre des guildes.
      Possibilité d'avoir des avantages dans les magasins d'événement.
      +2 négociation.`,
      image: "marchand.jpg",
    },
    {
      id: 3,
      name: "La Guilde Mystique",
      leader: "Herris CHALK",
      location: "Sylinore (Mofrage)",
      fortune: 4.5,
      reputation: 87,
      members: 37,
      buildings: 6,
      description: `Fabrication d'artefacts.
      Accès à la maison de guilde.
      +30 mana.
      Apprentissage des sorts avancés.
      Possibilité de devenir Iwyyn d'une ville.
      Fabrication d'hôpital et de temple.`,
      image: "mystique.jpg",
    },
    {
      id: 4,
      name: "La Guilde des Créatures",
      leader: "Arthur II WYNE",
      location: "Bransby Horses (Mofrage)",
      fortune: 23.5,
      reputation: 77,
      members: 54,
      buildings: 12,
      description: `Accès aux différentes licences.
      Possibilité d'acheter des animaux à la guilde.
      Accès à Bransby Horses.
      +10% de vitesse.
      Rejoindre l'hôtel de vente animalier.`,
      image: "creature.jpg",
    },
    {
      id: 5,
      name: "La Guilde de la Lettre",
      leader: "Michelle Ferand",
      location: "Isvanore (Mofrage)",
      fortune: 11,
      reputation: 44,
      members: 24,
      buildings: 5,
      description: `Proposer des prêts aux institutions publiques.
      Emprunter de l'argent à la banque du sang jaune.
      +2 influence.
      Accès à la banque du sang jaune.`,
      image: "lettre.jpg",
    },
    {
      id: 6,
      name: "La Guilde des Explorateurs",
      leader: "Julien WoWolff",
      location: "Circos (Palam)",
      fortune: 21,
      reputation: 55,
      members: 34,
      buildings: 3,
      description: `10% de réduction sur les explorations.
      Accès au /enderchest.
      Rejoindre le camp d'exploration.
      Acheter dans le marché intercontinental.`,
      image: "explorateur.jpg",
    },
    {
      id: 7,
      name: "La Guilde des Mineurs",
      leader: "Dori GoodBrook",
      location: "Moria (Cornwall)",
      fortune: 37,
      reputation: 11,
      members: 28,
      buildings: 3,
      description: `Ouvrir une carrière publique.
      Rejoindre la Moria.
      +2 force.
      Organiser un festin.`,
      image: "mineur.jpg",
    },
    {
      id: 8,
      name: "La Guilde Maritime",
      leader: "Eugène Lancastri",
      location: "Freezing Farm (Cornwall)",
      fortune: 33,
      reputation: 48,
      members: 112,
      buildings: 20,
      description: `10% de réduction sur les voyages.
      Fabriquer des navires de guerre.
      Rejoindre la chambre de guilde.
      Organiser un concours de pêche.`,
      image: "marine.jpg",
    },
    {
      id: 9,
      name: "La Guilde de la Table",
      leader: "Walda Banefort",
      location: "Triomphe (Mofrage)",
      fortune: 31,
      reputation: 97,
      members: 67,
      buildings: 36,
      description: `Organiser un festin.
      Commander de la nourriture à la guilde.
      -20% dans toutes les auberges.
      Licence d'alcool (pour Cornwall).`,
      image: "table.jpg",
    },
  ];

guildesData.globalRoles = [
    {
        role: "Dirigeant",
        actions: [
            "Détourner des fonds",
            "Changer les règles",
            "Attribuer un rôle",
            "Rencontrer des représentants royaux",
        ],
    },
    {
        role: "Trésorier",
        actions: [
            "Détourner des fonds",
            "Augmenter les contributions",
            "Gérer les attributions de subvention",
        ],
    },
    {
        role: "Gestionnaire",
        actions: ["Gérer les préfets"],
    },
    {
        role: "Représentant royal",
        actions: [
            "Conseiller",
            "Faire entendre la couronne",
            "Faire un rapport",
        ],
    },
    {
        role: "Préfet",
        actions: [
            "Gérer les membres dans un village",
            "Faire fermer un établissement",
            "Inspection des règles",
        ],
    },
    {
        role: "Membre",
        actions: [
            "Recruter des travailleurs au travers de la guilde",
            "Faire un rapport",
            "Payer les cotisations",
            "Recevoir des subventions",
        ],
    },
];

export default guildesData;
