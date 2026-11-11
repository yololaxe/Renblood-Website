# Recette du wiki — PC et téléphone

Les tests automatisés accompagnent cette recette ; ils ne valident pas à eux seuls l’ensemble de la navigation avec vos comptes et vos appareils.

| Cas | Action | Attendu |
|---|---|---|
| W01 | Guide → registre ; rechercher Herbert Rollingford | Fiche précise, prénom homonyme non fusionné. |
| W02 | Depuis Herbert, ouvrir Dolores | Sa fiche et sa propre branche Wyne sont accessibles. |
| W03 | Revenir deux fois | Filtre du registre et contexte conservés. |
| W04 | Arbre Rollingford ; sélectionner une personne, puis centrer son arbre | Fiche sélectionnée distincte du centre ; nouveau centre correct. |
| W05 | Zoomer/déplacer puis visiter une fiche et revenir | Cadrage conservé. |
| W06 | Molette simple sur l’arbre ; puis Ctrl + molette | La première défile la page ; la seconde zoome volontairement. |
| W07 | Téléphone : arbre et vue des proches | Proches lisibles par défaut ; arbre étendu accessible volontairement. |
| W08 | Tab jusqu’à une fonction puis Échap | Aperçu lisible ; fermeture et focus conservés. |
| W09 | Téléphone : toucher Magistrat | Explication visible ; accès à la fiche complète. |
| W10 | Aperçu : épingler, suivre un lien, fermer | Aucun blocage de la navigation ou de la page. |
| W11 | Familles secondaires puis autres notables | Familles documentées ; personnes sans famille séparées. |
| W12 | Rechercher Sand | Notion de patronyme ; aucune famille fictive commune. |
| W13 | Personnages Da | Deux identités distinctes, sans fusion. |
| W14 | Politique → Conseil du Peuple | 13 sièges répartis 6/5/2 ; The Verdict décédé ; deux reconnaissances contestées. |
| W15 | Ouvrir les directions Artisans/Table/Lettre | Florentin ROK / Espero Banefort / Connie Feran, avec liens précis. |
| W16 | Fiche d’Espero et de Sergio | Consul pour Espero ; Maréchal des armées pour Sergio. |
| W17 | Valentine → carte → fiche de lieu | Grande ville et liens vers les personnages du lieu. |
| W18 | Bibliothèque et sommaires | Chroniques : 3 chapitres/15 sections ; Connaissance : 4/17. |
| W19 | Lire un passage, consulter un personnage, revenir | Passage de lecture retrouvé. |
| W20 | Revenir à la bibliothèque puis Reprendre | Dernier chapitre/passage mémorisé sur ce navigateur. |
| W21 | Téléphone : sommaire, taille du texte et paragraphes | Sommaire accessible ; alignement à gauche ; aucune ligne coupée. |
| W22 | Recherche globale d’une section de livre ou d’un article de loi | Arrivée au passage concerné, pas simplement à la rubrique. |
| W23 | URL de personne ou chapitre inconnu | État introuvable utilisable avec lien vers le registre. |
| W24 | Préférence Réduire les animations | Pages et arbre restent utilisables, sans transition imposée. |
| W25 | Navigation en tant que visiteur et joueur connecté | Le wiki public est identique ; les fonctionnalités privées gardent leurs protections existantes. |

Les autres divergences de ressources, titres et identités non arbitrées restent conservées à leur valeur précédente lorsqu’elle existait sur le site.

## Exploration et atelier — complément du 11 novembre 2026

Les essais de publication ci-dessous se font d'abord en préproduction, avec un paquet public de recette et restauration de la version précédente. Le banc automatisé utilise un service en mémoire et un hôte admin isolé ; la connexion Google réelle reste à tester avec votre compte staff.

| Cas | Action | Attendu |
|---|---|---|
| W26 | Guide → Chronologie ; choisir le troisième âge | Cinq récits datés ; lien vers leur section exacte. |
| W27 | Filtrer la frise par maison puis lieu | Seuls les événements dont le récit cite ces entités sont affichés. |
| W28 | Ouvrir Parcours personnels | Les âges ne deviennent pas des années du royaume ; dates ambiguës signalées. |
| W29 | Garder une fiche puis un passage de livre | Deux entrées accessibles dans Mes repères avec leurs liens précis. |
| W30 | Ajouter une note puis recharger et ouvrir un second onglet | Note conservée localement ; changements répercutés entre onglets. |
| W31 | Filtrer et retirer un repère | Liste et bouton de la fiche mis à jour, sans doublon. |
| W32 | Refuser le stockage du navigateur | Message explicite ; le wiki reste utilisable. |
| W33 | Rechercher « Dolroes Wyne » et « Herbert Rolingford » | Bonnes identités ; résultat exact prioritaire quand la graphie est correcte. |
| W34 | Rechercher un alias validé et un prénom homonyme | Alias reconnu ; identités homonymes distinctes. |
| W35 | Arbre → Relier Herbert Rollingford à Philipe | Filiation mise en évidence et détaillée ; unions en pointillés. |
| W36 | Comparer deux personnes sans chemin documenté | Absence de documentation expliquée ; aucune parenté inventée. |
| W37 | Plein écran, clavier Tab/Échap puis retour | Focus contenu puis restauré ; cadrage précédent retrouvé. |
| W38 | Téléphone : vue Proches, comparaison et plein écran | Aucun débordement ; déplacement tactile volontaire. |
| W39 | Admin → widget Atelier du wiki | Brouillons récents, version publique, accès à l'atelier et tableau de qualité. |
| W40 | Importer un export brut ou ajouter un champ secret au JSON | Refus avant création d'un brouillon exploitable. |
| W41 | Importer un paquet valide, accepter et conserver des champs | Avant/après lisible ; décisions persistantes et partagées entre admins. |
| W42 | Prévisualiser puis quitter | Bandeau privé ; aucune modification publique ; version publique rétablie à la sortie. |
| W43 | Publier une revue complète avec confirmation | Version publique basculée, auteur/motif/historique enregistrés ; lecteurs actualisés au rechargement. |
| W44 | Deux admins éditent le même brouillon ou publient depuis une ancienne base | Conflit explicite ; aucune dernière écriture silencieuse. |
| W45 | Restaurer la version précédente avec un motif | Contenu antérieur rétabli ; versions immuables et restauration journalisée. |

## Fiabilisation des publications et de l’interface

| Cas | Action | Attendu |
|---|---|---|
| W46 | Avec la musique et une recherche ouvertes, charger une version wiki actualisée | Le menu et la recherche restent montés ; les résultats et les fiches reflètent la version chargée. |
| W47 | Publier un brouillon puis restaurer une version | Confirmation de succès conservée après le rafraîchissement du registre ; un échec d'actualisation ne présente pas une publication confirmée comme annulée. |
| W48 | Interrompre une publication de recette puis vérifier son état, éventuellement depuis un second compte admin | État explicite, reprise après expiration ; une ancienne requête ne remplace pas la nouvelle revue. Tester en préproduction uniquement. |
| W49 | Importer un paquet avec dirigeant de lieu/gouvernement absent, siège ou texte de livre en double | Refus avant publication ; aucune modification du registre public. |
| W50 | Refuser le stockage du navigateur, ouvrir puis quitter un aperçu | Aperçu utilisable dans l'onglet avec indication de reprise indisponible ; sortie vers le dernier registre public connu. |

Les réponses publiques invalides, les réponses d'aperçu tardives après sortie/déconnexion et les entrelacements de publications sont également couverts par les tests automatisés, sans altérer le lore public.

## Reprise des revues et carnets portables

| Cas | Action | Attendu |
|---|---|---|
| W51 | Choisir des décisions sans les envoyer, fermer puis rouvrir le brouillon | Copie locale proposée pour ce compte et cet environnement ; choix partagés inchangés avant enregistrement. |
| W52 | Deux admins prennent des décisions opposées sur le même changement, puis reprendre la copie locale | Comparaison explicite ; conflit non envoyé tant qu'un choix n'est pas fait. Les choix indépendants du collègue sont conservés. |
| W53 | Importer un paquet de plus de 30 changements, filtrer, conserver les lignes affichées et aller au suivant | Seules les lignes affichées sont conservées ; aucun autre changement n'est accepté automatiquement. |
| W54 | Exporter une revue non enregistrée | Fichier contenant les décisions locales et conflits ; aucune sauvegarde partagée déclenchée par l'export. |
| W55 | Refuser la sauvegarde locale pendant une revue puis enregistrer les décisions | Indication explicite ; enregistrement partagé toujours utilisable. |
| W56 | Exporter un carnet avec notes, puis importer le fichier sur un autre navigateur | Aperçu avant ajout ; liens et accents des notes conservés. |
| W57 | Importer un carnet comportant un repère déjà présent avec une autre note | Note actuelle conservée ; différence signalée avant ajout des nouveaux repères. |
| W58 | Importer un fichier invalide, doublonné, ou dépassant les 200 repères après fusion | Refus sans modification du carnet actuel ; aucune note écartée pour faire de la place. |
| W59 | Saisir une note dans un onglet et modifier sa version enregistrée depuis un second | Brouillon conservé ; comparaison et choix explicite avant remplacement. |
| W60 | Reprendre une revue et ouvrir l'aperçu d'une modification acceptée | Première fiche modifiée existante ouverte ; libellés de champs en français. Une fiche supprimée renvoie vers un registre utilisable. |

Le carnet exporté contient les notes enregistrées ; le texte encore marqué « Note non enregistrée » n'en fait pas partie. La recette compte 60 cas. Les scénarios de publication de données réelles restent à effectuer par l'équipe en préproduction.

## Glissement des arbres sans sélection parasite

| Cas | Action | Attendu |
|---|---|---|
| W61 | Faire glisser un portrait, un nom puis le fond de l'arbre | Arbre déplacé ; aucun texte sélectionné, image déplacée ou personnage ouvert involontairement. |
| W62 | Cliquer avec un léger mouvement, puis activer un personnage au clavier | Une sélection par clic ou activation clavier ; le léger mouvement ne devient pas un déplacement. |
| W63 | Terminer le geste hors de l'arbre ou annuler un glissement tactile | Déplacement terminé, pas de geste bloqué ni de clic consommé au geste suivant, même après changement du mode tactile. |
| W64 | Déplacer en plein écran, fermer par Échap et utiliser Recentrer | Geste utilisable en plein écran ; cadrage précédent retrouvé ; carte centrale réellement centrée. |
| W65 | Molette simple, Ctrl + molette, puis glissement sur téléphone avec et sans mode tactile | Défilement de page préservé ; zoom volontaire conservé ; déplacement tactile actif uniquement lorsqu'il est choisi. |

La recette comprend maintenant 65 cas. Les essais tactiles automatisés utilisent les événements tactiles natifs du navigateur de recette ; un essai sur vos téléphones reste utile pour les comportements propres à leur navigateur.
