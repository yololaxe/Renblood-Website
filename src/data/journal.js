const journalEditions = [
  {
    id: "conseil-an-336",
    title: "Zeubillage n'est plus : vive Shaleton !",
    publication: "Édition spéciale - Conseil de l'an 336",
    author: "Paul Mortadelle",
    intro: [
      "Habitantes, habitants,",
      "Le Conseil de l'an 336 restera sans doute dans les mémoires. Après débats, rires, soupirs et quelques regards lancés vers les trois derniers nostalgiques du vieux nom, notre village quitte officiellement son ancienne appellation.",
      "Zeubillage devient Shaleton.",
      "Il faut dire que l'ancien nom faisait sourire les voyageurs, mais beaucoup moins les marchands, les familles ambitieuses et ceux qui rêvent de voir un jour notre communauté reconnue comme une vraie ville du Royaume de Renblood. Le Conseil l'a compris : pour peser sur les cartes du royaume, il faut un nom qui tienne droit dans les registres.",
      "Shaleton est donc né.",
    ],
    sections: [
      {
        title: "Un temple pour élever les âmes",
        paragraphs: [
          "Le Conseil a d'abord étudié la construction d'un temple. Le projet, estimé à 4 Silvers et 20 Bronzes, sera réalisé en 338 si les délais sont tenus.",
          "Le terrain sera loué auprès d'Isaure Landry, pour 32 Bronzes par an, payés par la mairie. Le chantier a été confié à Bob Bainabet et Arthur Morgan, deux noms désormais bien connus lorsqu'il s'agit de bâtir du solide.",
          "Ce temple devra offrir aux habitants un lieu digne pour les prières, les rassemblements et les cérémonies.",
        ],
      },
      {
        title: "Une école pour apprendre à lire les contrats et les cartes",
        paragraphs: [
          "Grande nouvelle pour les familles du village : un temple scolaire a été validé.",
          "Six familles, dont les Kounar et les Miria, ont rappelé que les enfants ne peuvent pas grandir uniquement avec des histoires de taverne et des sermons du dimanche. Il leur faut savoir lire, compter, comprendre un contrat commercial et reconnaître une route sûre sur une carte du royaume.",
          "Le Conseil a donc accordé à Arthur Morgan et Arold Milizé un budget de 3 Silvers et 40 Bronzes. Une somme supplémentaire de 80 Bronzes servira à l'achat des terrains auprès de Nagaki Rok.",
          "Les travaux sont prévus pour 339.",
        ],
      },
      {
        title: "Le port s'agrandit pour les gros bateaux",
        paragraphs: [
          "À la demande du Maire, le port est déjà en cours d'amélioration. L'objectif est simple : accueillir des bateaux de plus gros tonnage et ouvrir Shaleton au commerce de gros.",
          "Le chantier, mené par Arthur Morgan, coûte 92 Bronzes, soit 1 Silver et 28 Bronzes.",
          "Les marchands peuvent déjà se frotter les mains : si le port tient ses promesses, les caisses du village pourraient bien entendre chanter les pièces plus souvent.",
        ],
      },
      {
        title: "Une muraille ? Pas tout de suite",
        paragraphs: [
          "La question d'une muraille a été évoquée. Tout le monde s'accorde sur son utilité, surtout si Shaleton continue de grandir.",
          "Mais le Conseil a tranché : ce n'est pas la priorité.",
          "L'idée est donc conservée pour une estimation future, mais aucune pierre ne sera posée pour le moment. Il faudra d'abord finir les chantiers déjà engagés.",
        ],
      },
      {
        title: "Une tour de garde pour surveiller les alentours",
        paragraphs: [
          "La sécurité n'est toutefois pas oubliée. Une tour de garde a été approuvée pour l'année 336.",
          "Elle sera construite par le groupe de construction militaire de Lone, sur les terres communales de la mairie, pour un coût de 204 Bronzes.",
          "De quoi rassurer les habitants qui n'aiment pas trop entendre des bruits dans les bois après la tombée du jour.",
        ],
      },
      {
        title: "Un four commun pour économiser le bois",
        paragraphs: [
          "Le boucher Birb Linelife en avait assez de voir chacun brûler son bois dans son coin. Il a donc demandé la création d'un four commun, où pains, viandes et autres préparations pourront cuire pour tout le village.",
          "Le Conseil a approuvé le projet.",
          "La construction aura lieu en 337, pour un montant de 1 Silver et 20 Bronzes. Lone a donné son accord, ce qui ouvre officiellement la voie au chantier.",
          "On murmure déjà que les boulangers et les bouchers y voient une excellente nouvelle. Les amateurs de pain chaud aussi.",
        ],
      },
      {
        title: "La Guilde des Explorateurs regarde vers Shaleton",
        paragraphs: [
          "Autre projet ambitieux : la création d'un hall des explorateurs.",
          "Shaleton est entouré de terres encore mal connues, de chemins incertains et, paraît-il, de quelques donjons où certains jurent avoir entendu tinter des trésors. Le Conseil veut donc attirer l'attention de la Guilde des Explorateurs.",
          "Le hall servira de base pour cartographier les environs, organiser les expéditions et stocker les trouvailles ramenées des profondeurs.",
          "Le coût est fixé à 4 Silvers et 60 Bronzes. La Guilde des Explorateurs a donné une réponse favorable, et la construction est prévue pour 337.",
        ],
      },
      {
        title: "Elys Drakon veut un vrai corps de garde",
        paragraphs: [
          "Elys Drakon a parlé franchement : on ne peut pas faire respecter l'ordre depuis un banc sur la place.",
          "Elle a proposé plusieurs solutions, du simple cabanon de patrouille jusqu'au vrai commissariat avec cellules. Le Conseil a choisi l'option ambitieuse : un commissariat complet, capable d'accueillir les fauteurs de troubles, les ivrognes du port et tous ceux qui confondent liberté et chaos.",
          "Le projet sera construit sur les terres de Nagaki Rok. Coût total, terrain compris : 10 Silvers.",
          "La mairie financera 5 Silvers. Isaure Landry et Elys Drakon apporteront chacune 2 Silvers et 32 Bronzes.",
          "La construction est prévue pour 340. Un appel aux constructeurs, charpentiers et maçons a déjà été lancé.",
        ],
      },
      {
        title: "La mine gardera ses tarifs",
        paragraphs: [
          "Miria Mair a demandé une baisse du tarif de la mine, actuellement fixé à 8 Bronzes par saison et par personne. La proposition visait à descendre le prix à 6 Bronzes.",
          "Le Conseil a refusé.",
          "Les tarifs restent donc inchangés.",
        ],
      },
      {
        title: "Des terres agricoles au sud pour nourrir la population",
        paragraphs: [
          "La population grandit. Avec 33 habitants sur une capacité estimée à 50, les réserves alimentaires deviennent un sujet sérieux, surtout à l'approche des hivers.",
          "Le Conseil a donc étudié l'extension des terres agricoles vers le sud, en bordure de forêt.",
          "Le défrichement pourrait coûter 80 Bronzes en main-d'œuvre auprès de Tanguy Dorcas. Des demandes ont été transmises à Isaure Landry et Arthur Morgan. Isaure Landry propose déjà 28 Bronzes pour soutenir l'affaire.",
          "Le Conseil a décidé d'ouvrir une négociation avec Tanguy Dorcas. Le projet est envisagé pour 341.",
        ],
      },
      {
        title: "Rose Dorcas obtient son dispensaire de fortune",
        paragraphs: [
          "Avec les travaux du port et de la mine, les blessures se multiplient. Coupures, chutes, outils mal tenus et autres malheurs du quotidien remplissent les conversations.",
          "Rose Dorcas a donc demandé la création d'un dispensaire de fortune, installé dans un cabanon réaménagé.",
          "Le Conseil a validé le projet pour 338, avec un budget de 50 Bronzes destiné à l'aménagement, aux fournitures médicales et aux herbes.",
          "Une formation médicale sera également obligatoire. Elle sera financée par Isaure Landry, à hauteur de 1 Silver, pour une durée de 6 saisons à Fyvelune.",
        ],
      },
      {
        title: "Deux mariages et un journal pour le village",
        paragraphs: [
          "Le Conseil a également annoncé que deux mariages seront bientôt dévoilés. Les noms ne sont pas encore publiés, mais les rumeurs, elles, galopent déjà plus vite qu'un cheval de messager.",
          "Enfin, notre village dispose désormais d'un journal local, tenu pour l'instant par votre serviteur, Paul Mortadelle. Ce journal aura pour mission de rapporter les nouvelles, les décisions du Conseil et les événements qui façonnent la vie de Shaleton.",
        ],
      },
      {
        title: "Shaleton entre dans une nouvelle époque",
        paragraphs: [
          "Temple, école, port, tour de garde, four commun, hall des explorateurs, commissariat, terres agricoles et dispensaire : rarement un Conseil aura ouvert autant de chantiers à la fois.",
          "Certains diront que c'est trop. D'autres diront qu'il était temps.",
          "Une chose est sûre : Shaleton n'est plus un simple village au nom amusant. C'est désormais une communauté qui cherche à grandir, à se défendre, à instruire ses enfants, à soigner ses travailleurs et à trouver sa place dans le Royaume de Renblood.",
          "Et nous serons là pour l'écrire.",
        ],
      },
    ],
  },
];

export default journalEditions;
