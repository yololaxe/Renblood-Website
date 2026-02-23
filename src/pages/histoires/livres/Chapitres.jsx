// src/pages/histoires/livres/Chapitres.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaBookOpen, FaListUl } from "react-icons/fa";

// Images (assurez-vous qu'elles sont dans public/livres/)
const livres = {
  1: {
    titre: "Chroniques de Renblood",
    image: "/livres/livre1.png",
    chapitres: [
      {
        id: 1,
        titre: "Premier âge : Hommes, elfes et nains",
        sections: [
          {
            id: 1,
            titre: "Année 0-21 | La Grande Conquête",
            contenu:
              "Le début de l'histoire du royaume de Renblood est marqué par la Grande Conquête. Les humains, les elfes et les nains envahissent les quatre comtés, unissant leurs forces pour vaincre les peuples autochtones. Durant cette campagne, le peuple cyclope est décimé, et les sirènes sont exterminées, consolidant le contrôle des envahisseurs sur le territoire.",
          },
          {
            id: 2,
            titre: "Année 21 | La Chute de The Verdict",
            contenu:
              "La paix est brisée lorsque les cyclopes lancent une contre-offensive, envahissant le nord du comté de Cornwall. La grande ville de The Verdict est détruite lors de cette invasion. Ce désastre annonce une période de troubles pour le royaume et mène à l'instauration de nouvelles puissances. La famille Paltain règne désormais sur les quatre continents.",
          },
          {
            id: 3,
            titre: "Année 57 | L’Alliance de la Montagne",
            contenu:
              "Lors de la Grande Conquête, alors que les humains, les elfes, et les nains repoussaient les cyclopes, Bertorah Goodbrook, chef de la famille naine Goodbrook, et Elanor Chalk, une puissante mage elfe de la lignée des Éthilion, signèrent le fameux 'Pacte de la Montagne.' Cet accord établit une alliance durable entre les nains et les elfes du royaume, leur permettant de partager des secrets de forge et de magie. La signature du pacte eut lieu dans les montagnes de Mofrage et fut scellée avec une amulette forgée dans la légendaire forge de The Verdict, avant sa chute. Cette alliance serait à l'origine de la construction future de la grande mine de Moria.",
          },
          {
            id: 4,
            titre: "Année 88 | La Grande Famine du Nord",
            contenu:
              "Pendant une décennie difficile pour le comté de Cornwall, la terre se retrouva stérile et incapable de fournir suffisamment de nourriture à ses habitants. Herbert Lynster, gouverneur du Nord, utilisa ses relations avec les familles humaines et naines pour assurer la survie de son peuple. Il fit appel à Julien Rollingford, seigneur de Wild Range, qui ordonna l'acheminement de réserves de céréales et de bétail vers le Nord. La famine fut ainsi évitée, et les liens entre les Lynster et les Rollingford s’en trouvèrent renforcés, jetant les bases de leur future alliance lors des guerres à venir.",
          },
          {
            id: 5,
            titre: "Année 122-124 | Le Nord",
            contenu:
              "Plusieurs décennies passent, et le comté de Cornwall devient le théâtre d'une nouvelle invasion. Les familles humaines et naines, les Linster et les Goodbrook, s'unissent pour repousser les cyclopes du comté. Leur alliance scelle une nouvelle ère de coopération entre les peuples du nord, menant à une série de victoires contre les envahisseurs.",
          },
        ],
      },
      {
        id: 2,
        titre: "Deuxième âge : Des créatures pour la guerre !",
        sections: [
          {
            id: 1,
            titre: "Année 134 | Naissance du Premier Dragon",
            contenu:
              "Dans le comté de Palam, à l'est du royaume, naît le premier dragon. Cet événement extraordinaire change la dynamique de pouvoir au sein du royaume, car les dragons deviennent une force redoutable et convoité par toutes les grandes familles.",
          },
          {
            id: 2,
            titre: "Année 161-164 | Grande Guerre de Séparation",
            contenu:
              "La paix est à nouveau rompue par la Grande Guerre de Séparation. La famille Paltain, jusque-là souveraine, perd le contrôle des terres, et le royaume est divisé. Les Paltain règnent sur l'Ouest (Mofrage), les Lynster sur le Nord (Cornwall), les Roxton sur l'Est (Palam), et les Ouloh sur le Sud (Eldia). Durant cette guerre, les familles Roxton et Ouloh massacrent les peuples elfes, les forçant à se réfugier dans les forêts du comté de Mofrage. En parallèle, les nains et les hommes s'allient pour construire la grande mine de Moria dans le comté de Cornwall.",
          },
          {
            id: 3,
            titre: "Année 171 | L'Ascension du Dragon",
            contenu:
              "Après des années de recherches dans les terres reculées du comté de Palam, Vactir Wyne devint le premier humain à dompter un dragon. Il trouva un œuf de dragon dans les montagnes de l'Est, et par sa patience et sa maîtrise de la magie apprise auprès des elfes, il fit éclore l'œuf et apprivoisa la créature. Le dragon devint un symbole de puissance pour la famille Wyne, marquant le début de leur domination dans l'Est. La naissance du dragon et l'exploit de Vactir furent célébrés à Rozdru, consolidant le statut de la famille Wyne comme maîtres des dragons. Cela ouvrit également la voie à leur alliance future avec les Roxton, scellant le destin du royaume.",
          },
        ],
      },
      {
        id: 3,
        titre: "Troisième âge : Le royaume de Renblood",
        sections: [
          {
            id: 1,
            titre: "Année 225-236 | La Conquête du Feu",
            contenu:
              "Les Roxton, alliés aux dragons des Wyne, lancent une campagne pour conquérir les quatre continents. Les Lynster rejoignent l'alliance des Roxton, et ensemble, ils déclenchent une guerre qui aboutit à l'extinction des familles Ouloh et Paltain. En 236, les Roxton fondent le Royaume de Renblood et s'autoproclament Rois, établissant la forteresse de Rozdru comme capitale du royaume.",
          },
          {
            id: 2,
            titre: "Année 311 | L'Éveil du Gardien des Mystères",
            contenu:
              "Après des décennies d'études et de méditation dans les forêts du comté de Mofrage, Herris Chalk, maître druidique et gardien des mystères de la nature, découvrit un rituel ancien capable de renforcer les pouvoirs des forêts environnantes. Grâce à ce rituel, les elfes purent protéger les forêts de l'expansion humaine et y établir des refuges sûrs. Herris rejoignit la Guilde Mystique et devint son chef en 312. Ses actes consolidèrent le rôle des elfes dans la préservation de la magie et de la nature du royaume.",
          },
          {
            id: 3,
            titre: "Année 321 | Le Présent",
            contenu:
              "Le royaume de Renblood continue d'évoluer sous la gouvernance de la famille Rollingford. Stannis le Bon, grâce à ses actions lors de la bataille de l'Haguersier, reste une figure respectée. Le royaume, désormais unifié, se prépare à faire face aux nouveaux défis et aux changements à venir, tandis que les dragons, les elfes et les différentes guildes continuent de jouer un rôle majeur dans le maintien du pouvoir et de la culture de Renblood.",
          },
        ],
      },
    ],
  },
  2: {
    titre: "Voies de la Connaissance",
    image: "/livres/livre2.png",
    chapitres: [
      {
        id: 1,
        titre: "La Foi Tripartite",
        sections: [
          {
            id: 1,
            titre: "L'Éveil des Trois Dieux",
            contenu:
              "L'histoire se déroule dans un monde antique où les quatre continents étaient autrefois prospères, abritant des humains, des elfes et des nains. Cependant, la paix fut rompue lorsque des hordes d'orques et de cyclopes, dirigées par de sombres seigneurs, envahirent les terres. Au bord de l'extinction, les peuples libres se tournèrent vers la foi en trois dieux mythiques : Le Gardien, Le Guérisseur et Le Chercheur. Ces entités divines apportèrent respectivement la protection, la guérison et la connaissance, unissant les peuples contre les envahisseurs. Après une victoire décisive, la Foi Tripartite devint le socle spirituel du Royaume de Renblood.",
          },
          {
            id: 2,
            titre: "Les Pratiques Religieuses",
            contenu:
              "Les fidèles de la Foi Tripartite pratiquent un mélange de prières, rituels et méditations. Les temples de chaque dieu sont souvent construits côte à côte, symbolisant leur unité. Les prêtres et prêtresses offrent soins spirituels et physiques, tout en encourageant l'apprentissage et la découverte. Des pèlerinages vers les sites sacrés des dieux sont communs, renforçant la foi et l'harmonie entre humains, elfes et nains.",
          },
          {
            id: 3,
            titre: "Fêtes Religieuses",
            contenu:
              "Plusieurs fêtes jalonnent l'année : le Jour du Gardien célèbre la protection et la force, la Fête du Guérisseur apporte soins et réconfort aux malades, et la Journée du Chercheur est dédiée à la quête du savoir. Ces célébrations renforcent l'unité entre les races et rappellent l'importance de l'équilibre entre protection, guérison et sagesse.",
          },
        ],
      },
      {
        id: 2,
        titre: "L'Armée dans le Royaume de Renblood",
        sections: [
          {
            id: 1,
            titre: "Armée Traditionnelle",
            contenu:
              "L'armée traditionnelle est constituée de soldats formés aux tactiques conventionnelles de combat. Les recrues débutent leur carrière en tant que simples soldats, puis évoluent en écuyers et chevaliers. Les grades supérieurs, comme Héraut et Commandant, assurent la protection du royaume en menant des batailles et en formant les nouvelles générations de combattants.",
          },
          {
            id: 2,
            titre: "Armée des Créatures",
            contenu:
              "Certaines unités militaires se spécialisent dans la maîtrise et l'utilisation de créatures sur le champ de bataille. Les cavaliers débutent leur apprentissage avec des chevaux et hippogriffes, avant de progresser vers des montures plus puissantes, comme les wyvernes et les dragons. Cette branche militaire est particulièrement difficile d'accès et nécessite des compétences exceptionnelles en dressage et en stratégie.",
          },
          {
            id: 3,
            titre: "Armée Mystique",
            contenu:
              "L'Armée Mystique est constituée de magiciennes et d'elfes maniant des arcanes puissants. Elles développent leurs talents sous la tutelle de maîtres expérimentés et assurent la défense du royaume contre les menaces surnaturelles. Ces combattantes possèdent des connaissances avancées en sortilèges de protection et en invocation.",
          },
          {
            id: 4,
            titre: "Légalité du Service Militaire",
            contenu:
              "Tous les citoyens humains âgés de 14 à 22 ans doivent servir au moins deux ans dans l'armée. Ce service obligatoire inclut formation et déploiement dans les différentes branches militaires. Pour les elfes, cette période s'étend entre 20 et 40 ans, reflétant leur longévité accrue. Le non-respect de cette obligation est sévèrement puni.",
          },
          {
            id: 5,
            titre: "L'Armée Mystique et la Magie Guerrière",
            contenu:
              "Chez les humains, une unité spéciale appelée l'Armée Mystique regroupe des femmes maîtrisant la magie en complément du combat physique. Ces guerrières combinent force brute et puissance magique, créant une élite redoutable pour défendre le royaume contre toute menace.",
          },
        ],
      },
      {
        id: 3,
        titre: "L'Éducation dans le Royaume de Renblood",
        sections: [
          {
            id: 1,
            titre: "Le Temple Scolaire et l'Apprentissage",
            contenu:
              "Dès l'âge de 5 ans, les enfants du royaume intègrent le Temple Scolaire, où ils apprennent la lecture, l'écriture et les bases de la vie quotidienne. Cet enseignement vise à donner à chaque individu les outils nécessaires pour comprendre et naviguer dans le monde qui l'entoure.",
          },
          {
            id: 2,
            titre: "Passage à l'Apprentissage",
            contenu:
              "À partir de 8 ans, les enfants choisissent une voie professionnelle. Ils passent la moitié de leur temps en étude et l'autre moitié en apprentissage pratique, préparant ainsi leur futur métier au sein du royaume.",
          },
          {
            id: 3,
            titre: "Enseignement Distinct pour Garçons et Filles",
            contenu:
              "L'éducation est divisée en deux filières : les garçons sont formés aux arts martiaux, à la stratégie et à la gestion financière, tandis que les filles se spécialisent dans la magie et l'étude des artefacts anciens. Cette distinction reflète la tradition du royaume et l'importance des rôles complémentaires dans la société.",
          },
          {
            id: 4,
            titre: "Le Pouvoir Mystique des Femmes",
            contenu:
              "Les femmes et les elfes maîtrisent la magie à un niveau avancé. Leur capacité à manipuler les émotions et à utiliser des artefacts fait d'elles des magiciennes respectées et influentes. L'étude de la magie est rigoureuse et nécessite des années de formation intensive.",
          },
        ],
      },
      {
        id: 4,
        titre: "Les Elfes",
        sections: [
          {
            id: 1,
            titre: "Les Elfes Célestes (Ailurion)",
            contenu:
              "Les Elfes Célestes, ou Ailurion, sont liés aux cieux et aux étoiles. Ils possèdent une peau argentée et des yeux lumineux. Experts en magie céleste, ils conservent les connaissances anciennes dans leurs bibliothèques astrales. Chaque lignée Ailurion est associée à une constellation spécifique.",
          },
          {
            id: 2,
            titre: "Les Elfes des Profondeurs (Abyssion)",
            contenu:
              "Les Abyssions vivent dans les profondeurs des océans et des cavernes. Leur peau sombre et leurs yeux phosphorescents leur permettent de naviguer dans les ténèbres. Ils sont reconnus pour leur maîtrise de la magie aquatique et leur capacité à communiquer avec les créatures marines.",
          },
          {
            id: 3,
            titre: "Les Elfes Éthérés (Éthilion)",
            contenu:
              "Les Éthilions vivent dans les forêts anciennes et sont étroitement liés à la nature. Leur peau translucide et leur magie druidique leur permettent de protéger les sanctuaires naturels. Ils vivent en harmonie avec les esprits de la nature et utilisent leur magie pour maintenir l'équilibre écologique.",
          },
          {
            id: 4,
            titre: "L'Éveil de l'Arbre d'Éther",
            contenu:
              "Les Éthilions vénèrent un arbre sacré appelé l'Arbre d'Éther, qui maintient l'équilibre magique de la forêt. Lorsqu'une force maléfique corrompt les trois arbres protecteurs, une jeune elfe, Élanor, entreprend une quête pour purifier la forêt et restaurer l'harmonie.",
          },
          {
            id: 5,
            titre: "Les Exploits d'Élanor",
            contenu:
              "Élanor, élue par l'Arbre d'Éther, traverse des épreuves dangereuses, affronte des créatures maudites et purifie les gardiens corrompus. Son triomphe marque le renouveau de la forêt et la préservation des traditions Éthilions.",
          },
        ],
      },
    ],
  },
};

export default function Chapitres() {
  const { livreId, chapitreId } = useParams();
  const navigate = useNavigate();
  const livre = livres[livreId];
  const chapitreIndex = Number(chapitreId) - 1;
  const total = livre?.chapitres.length || 0;
  const chapitre = livre?.chapitres[chapitreIndex];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapitreId]);

  if (!livre || !chapitre) return <div className="text-center text-white mt-20">Livre ou chapitre introuvable.</div>;

  const progress = total > 1 ? (chapitreIndex / (total - 1)) * 100 : 100;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Header Flottant */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-lg font-bold text-white truncate max-w-xs sm:max-w-md text-center">
            {livre.titre}
          </h1>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-800 w-full">
          <motion.div 
            className="h-full bg-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <FaListUl /> Sommaire
            </h3>
            <ul className="space-y-1">
              {livre.chapitres.map((c, idx) => (
                <li key={c.id}>
                  <button
                    onClick={() => navigate(`/histoires/livres/${livreId}/chapitre/${c.id}`)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      idx === chapitreIndex
                        ? "bg-yellow-600 text-white font-semibold"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {idx + 1}. {c.titre.split("|")[0].trim()}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Contenu Principal */}
        <main className="flex-1 max-w-3xl">
          <motion.div
            key={chapitre.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
              {chapitre.titre.split("|")[1] || chapitre.titre}
            </h2>
            <p className="text-yellow-500 font-mono text-sm mb-8 uppercase tracking-widest">
              {chapitre.titre.split("|")[0]}
            </p>

            <div className="space-y-12">
              {chapitre.sections.map((section) => (
                <section key={section.id} className="relative pl-6 border-l-2 border-gray-700 hover:border-yellow-500/50 transition-colors">
                  <h3 className="text-xl font-bold text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-yellow-500 text-sm">§</span> {section.titre}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg font-serif text-justify">
                    {section.contenu}
                  </p>
                </section>
              ))}
            </div>
          </motion.div>

          {/* Navigation Footer */}
          <div className="mt-16 pt-8 border-t border-gray-700 flex justify-between items-center">
            {chapitreIndex > 0 ? (
              <button
                onClick={() => navigate(`/histoires/livres/${livreId}/chapitre/${chapitreIndex}`)}
                className="flex items-center gap-3 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition shadow-md"
              >
                <FaArrowLeft /> Précédent
              </button>
            ) : <div />}

            {chapitreIndex < total - 1 ? (
              <button
                onClick={() => navigate(`/histoires/livres/${livreId}/chapitre/${chapitreIndex + 2}`)}
                className="flex items-center gap-3 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white font-bold transition shadow-lg"
              >
                Suivant <FaArrowRight />
              </button>
            ) : (
              <button
                onClick={() => navigate("/histoires/livres")}
                className="flex items-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold transition shadow-lg"
              >
                Terminer <FaBookOpen />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
