# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

🌍 Renblood Website
Ce projet est le site officiel du serveur Minecraft semi-RP médiéval-fantastique Renblood.
Il permet aux joueurs d’accéder à diverses fonctionnalités et informations sur le serveur, tout en offrant une interface moderne et immersive.

🚀 Technologies utilisées
Frontend : React + Vite ⚡
Styling : Tailwind CSS 🎨
Backend : API Django avec PostgreSQL (en cours d'intégration)
Authentification : Google OAuth (uniquement) 🔑
📌 Fonctionnalités principales
🔹 Pages accessibles à tous :

🏠 Accueil → Informations générales sur le serveur.
🎮 Joueurs → Statistiques des joueurs et classement.
🗺️ Map → Carte interactive du serveur.
🔐 Authentification → Connexion via Google uniquement.
🔹 Pages accessibles après connexion :

🌟 Arbres des talents → Consultation et gestion des talents des personnages.
⚙️ Gérer mon compte → Accès aux paramètres du joueur et informations détaillées.

⚡ Installation et utilisation
📥 1. Cloner le projet

git clone https://github.com/ton-pseudo/renblood-website.git
cd renblood-website

📦 2. Installer les dépendances

npm install

🏃‍♂️ 3. Lancer le projet en local

npm run dev

To deploy : 

npm run build

Staging → npm run deploy:staging → https://renblood-staging.web.app

Prod → npm run deploy:prod → https://renblood-website.web.app