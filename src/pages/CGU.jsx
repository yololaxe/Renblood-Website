import React from "react";
import { motion } from "framer-motion";

export default function CGU() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-8 md:p-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-white mb-6 border-b border-gray-600 pb-4">
          Conditions Générales d'Utilisation (CGU)
        </h1>

        <p className="mb-6 italic text-sm">
          Dernière mise à jour : {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Objet</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation ont pour objet de définir les modalités de mise à disposition des services du site <strong>renblood.com</strong> et du serveur de jeu associé, ainsi que les conditions d'utilisation par l'Utilisateur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. Accès au service</h2>
          <p>
            Le site est accessible gratuitement à tout Utilisateur disposant d'un accès à internet. Tous les coûts afférents à l'accès au service, que ce soient les frais matériels, logiciels ou d'accès à internet sont exclusivement à la charge de l'utilisateur.
          </p>
          <p className="mt-2">
            L'éditeur se réserve le droit de refuser l'accès au service, unilatéralement et sans notification préalable, à tout Utilisateur ne respectant pas les présentes conditions d'utilisation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. Règles de conduite (Roleplay)</h2>
          <p>
            En rejoignant Renblood, vous acceptez de respecter les règles de courtoisie et de "Fair-play". Tout comportement toxique, harcèlement, triche (cheat), ou exploitation de bugs pourra entraîner un bannissement temporaire ou définitif du site et du serveur de jeu.
          </p>
          <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
            <li>Respect des autres joueurs et du staff.</li>
            <li>Interdiction des propos racistes, sexistes, homophobes ou haineux.</li>
            <li>Respect des règles spécifiques au Roleplay (Metagaming, Powergaming, etc.).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. Propriété intellectuelle</h2>
          <p>
            Les marques, logos, signes ainsi que tous les contenus du site (textes, images, son...) font l'objet d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.
          </p>
          <p className="mt-2">
            L'Utilisateur doit solliciter l'autorisation préalable du site pour toute reproduction, publication, copie des différents contenus. Il s'engage à une utilisation des contenus du site dans un cadre strictement privé, toute utilisation à des fins commerciales et publicitaires est strictement interdite.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">5. Données personnelles</h2>
          <p>
            Le site assure à l'Utilisateur une collecte et un traitement d'informations personnelles dans le respect de la vie privée conformément à la loi n°78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés.
          </p>
          <p className="mt-2">
            Les données collectées (pseudo, ID Discord, progression) sont utilisées uniquement pour le fonctionnement du jeu et ne sont jamais revendues à des tiers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">6. Responsabilité</h2>
          <p>
            Les sources des informations diffusées sur le site sont réputées fiables mais le site ne garantit pas qu'il soit exempt de défauts, d'erreurs ou d'omissions.
          </p>
          <p className="mt-2">
            Le site ne peut être tenu pour responsable d’éventuels virus qui pourraient infecter l’ordinateur ou tout matériel informatique de l’Internaute, suite à une utilisation, à l’accès, ou au téléchargement provenant de ce site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Droit applicable</h2>
          <p>
            La législation française s'applique au présent contrat. En cas d'absence de résolution amiable d'un litige né entre les parties, les tribunaux français seront seuls compétents pour en connaître.
          </p>
        </section>

      </motion.div>
    </div>
  );
}
