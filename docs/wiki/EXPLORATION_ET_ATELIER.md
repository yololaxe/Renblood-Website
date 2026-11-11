# Exploration et atelier du wiki

## Chronologie

`/histoires/chronologie` présente les quinze passages datés des Chroniques. Filtres : âge, maison, personnage cité, lieu cité et texte. Les liens vers les livres visent la section concernée. Les mentions sont déterministes et reposent sur les noms publics exacts ; aucune alliance ou participation n'est déduite d'une proximité de noms.

Les 174 repères personnels ont une vue distincte. Leurs périodes ressemblent souvent à des âges, et certaines cellules proviennent de dates de tableur ambiguës. Elles ne sont pas transformées en années du royaume ; les numéros de série sont signalés « À préciser ». Les durées de fonctions non documentées ne sont pas inventées.

## Mes repères

`/histoires/reperes` conserve jusqu'à 200 fiches, vues ou passages avec une note de 1 000 caractères par repère. Le stockage est local au navigateur, sans envoi des notes au backend. Le bouton d'enregistrement indique son état. Filtres par catégorie et texte ; ajout, retrait et notes se retrouvent après rechargement, et les onglets se synchronisent via l'événement de stockage. Un stockage refusé ou plein affiche un message explicite.

## Recherche

La recherche globale et le registre emploient les mêmes règles : normalisation des accents et de la casse, noms exacts prioritaires, alias publics approuvés et tolérance bornée aux fautes/transpositions. Les mots courts ne font pas l'objet de rapprochements flous. Le classement ne fusionne jamais les identités ni les homonymes. Un résultat approximatif est signalé dans la recherche globale. Aucun appel serveur n'est ajouté par frappe pour le lore.

## Arbres

« Relier deux personnes » utilise les unions et filiations effectivement documentées. Le chemin est mis en évidence et détaillé sous les champs ; aucun lien ne signifie « non documenté », pas « sans parenté ». La recherche de chemin est bornée à 24 liens et l'arbre rendu à 64 personnages. Les unions sont en pointillés, les filiations continues ; une légende explique la distinction.

Le plein écran est une fenêtre modale rendue hors des conteneurs animés. Échap ferme et restaure le focus ; le cadrage antérieur est conservé. La molette simple continue de faire défiler la page ; Ctrl/Cmd + molette zoome volontairement. Sur téléphone, la vue des proches reste le point d'entrée.

## Atelier et widget admin

Le tableau de bord admin contient **Atelier du wiki**, qui mène à `/admin/wiki`. Les API exigent un administrateur Firebase réel. Les brouillons et décisions sont partagés dans Mongo, indépendamment des notes locales des joueurs.

1. Télécharger la version publique ou préparer un paquet public compilé `{ registry, books }`, inférieur à 2 Mo. Le compilateur existant peut l'exporter avec `--package CHEMIN_PRIVE/candidat-public.json`. Les exports Sheets bruts sont refusés : aucun secret, colonne de préparation ou champ inconnu n'est accepté.
2. Importer le paquet avec un motif et confirmer son caractère public. La comparaison porte sur les champs des fiches ; les textes complets des livres sont examinés ensemble avec leurs sommaires.
3. Pour chaque changement, accepter la proposition ou conserver la valeur actuelle. Enregistrer la revue. Une révision concurrente renvoie un conflit, jamais un écrasement silencieux.
4. Prévisualiser les fiches avec la navigation réelle du wiki. Un bandeau persistant signale l'aperçu privé. Les propositions sans décision gardent leur valeur actuelle. Quitter l'aperçu rétablit la version publique. Une combinaison de décisions invalide, par exemple un personnage supprimé avec des relations conservées, doit être corrigée avant aperçu ou publication.
5. Une fois tous les changements examinés, confirmer puis publier. La bascule de version utilise une révision attendue ; un brouillon dépassé ne remplace pas une publication plus récente.
6. L'historique permet de restaurer une version conservée avec un motif. Le contenu des versions est immuable ; la bascule et l'auteur sont journalisés côté staff.

Le tableau de qualité liste les biographies, lieux, statuts et dates de décès manquants, sans produire de lore automatiquement. Les administrateurs peuvent télécharger une base JSON publique et la retravailler ; l'atelier ne modifie pas les Google Sheets.

Le site charge une version publique au démarrage et utilise le registre embarqué si l'API est indisponible. Il ne consulte pas les Sheets et ne sonde pas la version à chaque fiche. Les publications sont visibles aux lecteurs qui rechargent le site ; le cache HTTP public est limité à 60 secondes. Les données des joueurs, banques, inventaires et PNJ sont indépendantes.

Le backend embarque `wiki/seed.json`, copie du paquet public approuvé, pour initialiser cet environnement sans migration des données de jeu. Une future nouvelle référence embarquée doit être mise à jour avec le registre front. Les collections de l'atelier sont `wiki_state`, `wiki_versions` et `wiki_drafts`.

## Garanties complémentaires de fiabilisation

Le chargement d'un registre vérifie entièrement son format avant de remplacer les données et index en mémoire. Une réponse invalide conserve la version déjà affichée. La reprise asynchrone d'un aperçu est annulée lorsqu'on le quitte ou que l'identité change. Un stockage navigateur refusé n'empêche pas l'aperçu dans l'onglet.

Les changements de version remontent les pages publiques du wiki et actualisent la recherche ; ils ne remontent plus l'ensemble de l'application. Le menu et son état restent présents. L'atelier conserve ses confirmations après publication/restauration ; une erreur ultérieure de synchronisation est distinguée de l'opération déjà confirmée.

La publication réserve une révision d'état et un identifiant d'opération unique avant la bascule publique. La libération d'une réservation expirée incrémente cette révision : une ancienne requête ne peut plus poursuivre sa bascule, même si le même contenu a été restauré entre-temps. La finalisation d'un brouillon vérifie aussi l'identifiant de l'opération ; elle n'écrase pas une revue reprise par un autre administrateur. Les opérations interrompues se rapprochent de l'historique public avant une reprise. Seules les versions effectivement publiées sont proposées à la restauration.

L'import contrôle aussi les références de dirigeants des lieux, les membres du gouvernement, les identifiants de sièges et de textes de livres, et les coordonnées des lieux. Les décisions éditoriales et le contenu de référence demeurent inchangés.
