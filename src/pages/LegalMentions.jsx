import React from "react";
import { motion } from "framer-motion";

export default function LegalMentions() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-8 md:p-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-white mb-6 border-b border-gray-600 pb-4">
          Mentions Légales
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Éditeur du site</h2>
          <p>
            Le présent site, accessible à l'URL <strong>renblood.com</strong> (le « Site »), est édité par :
          </p>
          <p className="mt-2 italic">
            [Votre Nom ou Pseudonyme si particulier]<br/>
            [Adresse ou "Adresse transmise à l'hébergeur"]<br/>
            Contact : <a href="mailto:leroyaumederenblood@gmail.com" className="text-blue-400 hover:underline">leroyaumederenblood@gmail.com</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. Hébergement</h2>
          <p>
            Le Site est hébergé par :
          </p>
          <p className="mt-2">
            <strong>Google LLC (Firebase Hosting)</strong><br/>
            1600 Amphitheatre Parkway<br/>
            Mountain View, CA 94043, USA<br/>
            Téléphone : +1 650-253-0000
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
            Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p className="mt-2">
            Le contenu relatif à l'univers de Renblood (textes, lore, images originales) est la propriété exclusive de ses auteurs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. Données personnelles</h2>
          <p>
            Les informations recueillies (via Discord ou formulaire) sont enregistrées dans un fichier informatisé par l'éditeur pour la gestion des joueurs et du Roleplay.
          </p>
          <p className="mt-2">
            Conformément à la loi « informatique et libertés », vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier en contactant : <a href="mailto:leroyaumederenblood@gmail.com" className="text-blue-400 hover:underline">leroyaumederenblood@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
          <p>
            Le site peut collecter automatiquement des informations standards telles que tous types d'informations personnalisées qui permettent au site d'identifier ses visiteurs. 
            Toutes les informations collectées indirectement ne seront utilisées que pour suivre le volume, le type et la configuration du trafic utilisant ce site.
          </p>
        </section>

      </motion.div>
    </div>
  );
}
