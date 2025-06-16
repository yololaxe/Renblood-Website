// Données des métiers
export const categories = [
  {
    name: 'Bois',
    jobs: [
      {
        id: 'lumberjack',
        name: 'Bûcheron',
        image: '/metiers/lumberjack.png',
        description:
          'Coupe et collecte le bois dans les forêts, fournissant une ressource cruciale pour la construction, le chauffage et la fabrication d\'outils.',
        difficulty: 'Facile',
        potentialGain: 'Grande quantité de bois, champignons, force et célérité',
        mods: ['BiomeOPlenty']
      },
      {
        id: 'artisan',
        name: 'Artisan',
        image: '/metiers/artisan.png',
        description:
          'Travaille le bois pour créer meubles, charpentes, outils et autres objets du quotidien.',
        difficulty: 'Moyenne',
        potentialGain: 'Meubles, objets en bois, stockages, influence et points de négociation',
        mods: ['Macaws', 'MrMrcfrish']
      },
      {
        id: 'naval_architect',
        name: 'Architecte naval',
        image: '/metiers/naval_architect.png',
        description:
          'Construit et répare des navires, essentiels pour le commerce, l\'exploration et la défense.',
        difficulty: 'Difficile',
        potentialGain: 'Navires solides et durables',
        mods: ['Small ship']
      },
      {
        id: 'carpenter',
        name: 'Charpentier',
        image: '/metiers/naval_architect.png',
        description:
          'Expert dans la construction de charpentes et de toits, fabrique tous les éléments en bois d’une construction.',
        difficulty: 'Facile',
        potentialGain: 'Structures en bois de qualité, place d\'inventaire et techniques',
        mods: ['MrMrcfrish', 'Macaws']
      }
    ]
  },
  {
    name: 'Pierre',
    jobs: [
      {
        id: 'miner',
        name: 'Mineur',
        image: '/metiers/miner.png',
        description:
          'Extrait minerais et pierres précieuses, fournissant des matériaux indispensables aux autres métiers.',
        difficulty: 'Facile',
        potentialGain: 'Minerais rares, rapidité et célérité',
        mods: []
      },
      {
        id: 'blacksmith',
        name: 'Forgeron',
        image: '/metiers/blacksmith.png',
        description:
          'Artisan spécialisé dans le travail des métaux : armes, armures, outils et objets métalliques.',
        difficulty: 'Difficile',
        potentialGain: 'Armes et armures de qualité, influence et points de négociation',
        mods: ['Tinker']
      },
      {
        id: 'glassmaker',
        name: 'Verrier',
        image: '/metiers/glassmaker.png',
        description:
          'Fabrique objets en verre : vitres, bouteilles et ornements divers.',
        difficulty: 'Moyen',
        potentialGain: 'Produits en verre raffinés, esquive et rapidité',
        mods: ['Macaws']
      },
      {
        id: 'mason',
        name: 'Maçon',
        image: '/metiers/mason.png',
        description:
          'Coupe et façonne la pierre pour la construction de bâtiments, statues et autres structures durables.',
        difficulty: 'Facile',
        potentialGain: 'Bâtiments solides, résistance et place d\inventaire',
        mods: ['Tous les mods']
      }
    ]
  },
  {
    name: 'Nourriture',
    jobs: [
      {
        id: 'farmer',
        name: 'Fermier',
        image: '/metiers/farmer.png',
        description:
          'Cultive terres et jardins pour produire céréales, légumes et fruits.',
        difficulty: 'Facile',
        potentialGain: 'Récoltes abondantes, apiculture, points de vie et résistance',
        mods: ['Croptopia', 'Farmer’s delight', 'Pam’s']
      },
      {
        id: 'breeder',
        name: 'Éleveur',
        image: '/metiers/breeder.png',
        description:
          'Élève et soigne animaux domestiques (bétail, volaille, etc.) pour produits alimentaires.',
        difficulty: 'Moyenne',
        potentialGain: 'Viande, lait, laine, point de vie et régénération',
        mods: ['Butcher', 'Backpack', 'Livestock', 'MoreAnimals']
      },
      {
        id: 'fisherman',
        name: 'Pêcheur',
        image: '/metiers/fisherman.png',
        description:
          'Capture poissons et autres ressources aquatiques pour l’alimentation.',
        difficulty: 'Facile',
        potentialGain: 'Poissons frais, mana et régénération',
        mods: ['Aquaculture 2']
      },
      {
        id: 'innkeeper',
        name: 'Aubergiste',
        image: '/metiers/innkeeper.png',
        description:
          'Gère une auberge : hébergement, nourriture et boissons pour voyageurs et locaux.',
        difficulty: 'Dificile',
        potentialGain: 'Profit et hospitalité, restaurant, boulangerie, négociation et place d\'inventaire',
        mods: ['Croptopia', 'Farmer’s delight', 'Pam’s']
      }
    ]
  },
  {
    name: 'Services',
    jobs: [
      {
        id: 'transporter',
        name: 'Transporteur',
        image: '/metiers/transporter.png',
        description:
          'Assure le déplacement de marchandises et de personnes, vital pour le commerce.',
        difficulty: 'Facile',
        potentialGain: 'Commerce fluide, licence de tout type, rapidité, place d\'inventaire',
        mods: []
      },
      {
        id: 'guard',
        name: 'Garde',
        image: '/metiers/guard.png',
        description:
          'Protège les habitants des attaques de bandits et de monstres, peut servir un seigneur.',
        difficulty: 'Moyenne',
        potentialGain: 'Sécurité accrue, licence de garde, force et résistance',
        mods: []
      },
      {
        id: 'merchant',
        name: 'Marchand',
        image: '/metiers/merchant.png',
        description:
          'Vend objets, nourriture et terres tout en recherchant les meilleures affaires.',
        difficulty: 'Difficile',
        potentialGain: 'Profit commercial, licence marchande, charisme et rhétorique',
        mods: []
      },
      {
        id: 'explorer',
        name: 'Explorateur',
        image: '/metiers/explorer.png',
        description:
          'Organise et mène des expéditions pour découvrir de nouveaux horizons.',
        difficulty: 'Difficile',
        potentialGain: 'Nouvelles découvertes, place d\'inventaire',
        mods: []
      }
    ]
  }
];

export const specials = [
  {
    id: 'builder',
    name: 'Builder',
    image: '/metiers/builder.png',
    description:
      'Construit tout type de bâtiment, piliers majeurs de la vie du royaume.',
    difficulty: 'Facile',
    potentialGain: 'Infrastructure variée, bonus pour future, reach, rapidité, négociation, place d\'iventaire',
    mods: []
  },
  {
    id: 'bestiary',
    name: 'Bestiaire',
    image: '/metiers/bestiary.png',
    description:
      'Élève créatures variées (chiens, dragons, chevaux), du dressage à l’adoration.',
    difficulty: 'Moyenne',
    potentialGain: 'Créatures domestiquées, point de vie, régénération et résistance',
    mods: ['Doggy talents', 'SWEM']
  },
  {
    id: 'politician',
    name: 'Politique',
    image: '/metiers/politician.png',
    description:
      'Gère les affaires du royaume : diplomatie, lois et débats publics.',
    difficulty: 'Difficile',
    potentialGain: 'Influence, charisme, rhetorique, négociation et différentes actions',
    mods: []
  },
  
  {
    id: 'banker',
    name: 'Banquier',
    image: '/metiers/banker.png',
    description:
      'Gère argent et crédit, prête et conserve les dépôts pour le royaume.',
    difficulty: 'Moyenne',
    potentialGain: 'Licence de banquier, charisme, influence, lien avec la banque jaune',
    mods: ['Minecraft']
  }
];
