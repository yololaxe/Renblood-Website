import familles from "./famille";
import guildes from "./guildes";
import lois from "./lois";
import titres from "./titre";
import politique from "./politique";
import armee from "./armee";
import { categories, specials } from "./metiers";
import comtes from "./comtes";

const familyMembers = (node, familyKey, familyName) => {
  if (!node) return [];
  return [
    {
      label: node.keyName || node.name,
      description: `Membre de la famille ${familyName}`,
      path: `/histoires/arbre/${familyKey}`,
      type: "Joueur",
      keywords: "famille noble arbre généalogie parent alliance",
    },
    ...(node.children || []).flatMap((child) => familyMembers(child, familyKey, familyName)),
  ];
};

const familyResults = Object.entries(familles).flatMap(([key, family]) => [
  {
    label: `Famille ${family.nom}`,
    description: family.description,
    path: `/histoires/arbre/${key}`,
    type: "Page",
    keywords: "famille noble alliance lignée arbre généalogie",
  },
  ...familyMembers(family.data, key, family.nom),
]);

const guildResults = guildes.map((guild) => ({
  label: guild.name,
  description: `${guild.leader} · ${guild.location}`,
  path: "/histoires/guildes",
  type: "Page",
  keywords: "guilde organisation faction groupe chef rejoindre parler",
}));

const jobResults = [...categories.flatMap((category) => category.jobs), ...specials].map((job) => ({
  label: job.name,
  description: job.description,
  path: "/histoires/metiers",
  type: "Métier",
  keywords: "métier travail xp argent économie gagner produire craft vendre",
}));

const titleResults = titres.map((title) => ({
  label: title.titre,
  description: title.description,
  path: "/histoires/titres",
  type: "Règle",
  keywords: "titre rang statut droit permission noblesse hiérarchie",
}));

const politicalResults = politique.data.map((role) => ({
  label: role.titre,
  description: role.role,
  path: "/histoires/politique",
  type: "Page",
  keywords: "politique gouvernement pouvoir autorité roi conseil parler",
}));

const lawResults = lois.flatMap((section) => [
  {
    label: section.titre,
    description: "Section des lois du royaume",
    path: "/histoires/lois",
    type: "Règle",
    keywords: "loi règle règlement sanction amende prison justice crime interdit",
  },
  ...section.articles.map((article) => ({
    label: `${section.titre} · ${article.titre}`,
    description: article.contenu.join(" "),
    path: "/histoires/lois",
    type: "Règle",
    keywords: "loi règle règlement sanction amende prison justice crime interdit",
  })),
]);

const armyResults = Object.entries(armee)
  .filter(([, values]) => Array.isArray(values))
  .flatMap(([armyName, ranks]) =>
    ranks.filter(Boolean).map((rank) => ({
      label: rank,
      description: armyName,
      path: "/histoires/armee",
      type: "Page",
      keywords: "armée garde soldat grade défense guerre militaire autorité",
    }))
  );

const locationResults = Object.entries(comtes).flatMap(([county, cities]) => [
  {
    label: `Comté de ${county}`,
    description: `${cities.length} lieux répertoriés`,
    path: "/map",
    type: "Lieu",
    keywords: "carte map ville comté lieu territoire coordonnées chemin",
  },
  ...cities.map((city) => ({
    label: city.ville,
    description: `${city.type} · ${county} · ${city.chef || "Chef inconnu"}`,
    path: "/map",
    type: "Lieu",
    keywords: "carte map ville comté lieu territoire coordonnées chef",
  })),
]);

export const staticContentResults = [
  {
    label: "Zeubillage n'est plus : vive Shaleton !",
    description: "Édition spéciale du Conseil de l'an 336, par Paul Mortadelle",
    path: "/histoires/journal",
    type: "Journal",
    keywords: "actualité journal nouvelle événement patch note changement annonce",
  },
  ...familyResults,
  ...guildResults,
  ...jobResults,
  ...titleResults,
  ...politicalResults,
  ...lawResults,
  ...armyResults,
  ...locationResults,
];
