# Wiki Renblood — import et publication

Le registre public est généré dans `src/data/wiki/registry.json` et le texte des livres dans `src/data/wiki/books.json`. Les pages, aperçus et recherches consultent ces mêmes données. Les identifiants Pxxxx du Grand Livre sont conservés ; ils ne sont pas des identifiants de comptes ou d’entités Minecraft.

## Sources et arbitrages

Les Sheets sont des sources éditoriales. Ils ne sont jamais interrogés depuis un navigateur joueur. Leur lecture est effectuée sur demande avec le connecteur autorisé, puis conservée dans un export de travail privé.

Le format de l’export est `{ asOf, reads: [{ sheet, requestedRange, values }] }`. `values` est le tableau de lignes renvoyé par Google Sheets. PERSONNAGES peut être réparti en plusieurs plages non chevauchantes. Les autres onglets requis : MAISONS NOBLES, Personnages secondaires importants, RELATIONS, CHRONOLOGIE, Conseil Royale, GUILDES et Livres. Ce premier jeu de sources et les décisions explicites du propriétaire sont conservés dans le dossier de travail de livraison, hors du dépôt et de l’hébergement.

Les fichiers bruts ne doivent jamais être copiés dans `public/` ou `src/`. Le compilateur produit une liste explicite de champs publics, élimine les liens/événements privés et ignore les colonnes de secrets, intrigue, notes d’auteur et liens de sources privées. Une visibilité non vide autre que Public n’est pas publiée.

`scripts/wiki/baseline.json` fige les données auparavant publiques pour conserver les valeurs des différences encore en attente. Ce fichier ne sert pas aux pages web. Une révision de ses valeurs ou du compilateur doit suivre les arbitrages du propriétaire. Les identités ne sont jamais fusionnées uniquement par ressemblance de noms.

Décisions appliquées le 10 novembre 2026 : 13 sièges de magistrat (6/5/2), Valentine grande ville, titulaire de The Verdict décédé et remplacement non précisé, reconnaissance contestée pour les représentants Chalk et Goodbrook, Florentin ROK aux Artisans, Espero Banefort à la Table et Connie Feran à la Lettre. Textes publics complets des deux livres depuis le Sheet ; consignes d’illustration conservées hors de la publication.

## Préparer une version

Avec Node 22, depuis la racine du front :

```powershell
node scripts/wiki/import.mjs --source "CHEMIN_PRIVE/sources-snapshot.json" --baseline scripts/wiki/baseline.json --decisions "CHEMIN_PRIVE/ARBITRAGES_VALIDES.json" --output src/data/wiki --review "CHEMIN_PRIVE/import-review.json"
node --test src/services/wiki.test.mjs scripts/wiki/compile.test.mjs
npm run build:staging
```

Le rapport privé doit être situé hors de l’arborescence publique. L’import refuse les identifiants en double, les liens vers des personnes absentes et les boucles d’ascendance. Le numéro de version contient une empreinte du contenu. La publication Git/Firebase est une étape séparée : un changement de Sheet ne modifie pas directement le site.

Le compilateur et les pages ne créent aucun Player, compte bancaire, stock, quête, skin ou PNJ placé. Les avantages de guilde sont documentaires et ne constituent pas une activation automatique de bonus de jeu.

## Vérification avant publication

- Examiner les écarts et conserver les valeurs non tranchées.
- Vérifier les liens Herbert ↔ Dolores et le changement de branche, les couples/parents connus et les homonymes.
- Vérifier la répartition 6/5/2 et les états des sièges, les trois directions de guilde confirmées et Valentine.
- Tester les liens profonds de personne, famille, guilde, fonction, lieu, chapitre et section.
- Contrôler lecteur et vue des proches sur téléphone ; navigation clavier, aperçus fermables et retour au contexte.
- Consulter les livres complets et vérifier les compteurs de chapitres/sections, tous calculés depuis leur contenu.
- Conserver le déploiement précédent pour revenir à une version approuvée si nécessaire.

## Arbitrages complémentaires

Le patronyme Sand désigne les personnes nées hors mariage ; aucune famille commune ni parenté n’est déduite de ce nom. Sergio Lynster reste Maréchal des armées. Espero Banefort est aussi Consul du Royaume. La direction de la Lettre appartient à Connie Feran.

Les scripts `prebuild:staging` et `prebuild:prod` exécutent les tests du wiki avant compilation. Les tests du jeu de données de référence vérifient les décisions connues ; une évolution intentionnelle du catalogue doit mettre à jour ces attentes lors de sa revue.

## Atelier partagé et paquet public

L'import peut maintenant ajouter `--package "CHEMIN_PRIVE/candidat-public.json"` pour produire le paquet `{ registry, books }` attendu par l'atelier admin. L'examen du rapport privé d'import précède la préparation du paquet ; le fichier de revue ou les sources brutes ne doivent pas être téléversés à sa place.

Le widget **Atelier du wiki** du tableau de bord ouvre `/admin/wiki` : création d'un brouillon partagé, comparaison par champ, décisions explicites, aperçu privé avec la navigation réelle, publication contrôlée et restauration historique. Les Google Sheets restent des sources éditoriales en lecture ; l'atelier ne les modifie pas.

Voir [Exploration et atelier](EXPLORATION_ET_ATELIER.md) pour les formats, limites, garanties de concurrence, stockage et fonctionnement de la chronologie et des repères.
