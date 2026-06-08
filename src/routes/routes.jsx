// src/routes/routes.js
import React from "react";
import Home from "../pages/Home.jsx";
import Players from "../pages/Players.jsx";
import PlayersAdmin from "../pages/admin/PlayersAdmin.jsx";
import PlayerJobs from "../pages/PlayerJobs.jsx";
import CreatePlayer from "../pages/CreatePlayer.jsx";
import Map from "../pages/Map.jsx";
import Auth from "../pages/Auth.jsx";
import TalentSelection from "../pages/player/TalentSelection.jsx";
import TalentTree from "../pages/player/TalentTree.jsx";
import TalentTree2 from "../pages/player/TalentTree2.jsx";
import SessionsPage from "../pages/player/sessions.jsx";
import Quests from "../pages/Quests.jsx";

import Information from "../pages/Information.jsx";
import Character from "../pages/Character.jsx";
import Livres from "../pages/histoires/Livre.jsx";
import Chapitres from "../pages/histoires/livres/Chapitres.jsx";
import Familles from "../pages/histoires/Familles.jsx";
import Lois from "../pages/histoires/Lois.jsx";
import Politique from "../pages/histoires/Politique.jsx";
import Armee from "../pages/histoires/Armee.jsx";
import Titres from "../pages/histoires/Titres.jsx";
import Guildes from "../pages/histoires/Guildes.jsx";
import Unauthorized from "../pages/Unauthorized.jsx";
import Arbre from "../pages/histoires/Arbre.jsx";
import DicePage from "../pages/dice/DicePage.jsx";
import Metiers from "../pages/histoires/Metiers.jsx";
import Npcs from "../pages/histoires/Npcs.jsx";
import Journal from "../pages/histoires/Journal.jsx";
import AdminDashboard from "../pages/adminDashboard/AdminDashboard.jsx";
import CreateFuturePage from "../pages/player/CreateFuture.jsx";
import EditFuturePage from "../pages/player/EditFuturePage.jsx";
import SessionPlayersFuturesPage from "../pages/adminDashboard/SessionPlayers.jsx";
import MoneyReport from "../pages/adminDashboard/reporting/MoneyReport.jsx";
import QuestEditor from "../pages/adminDashboard/QuestEditor.jsx";
import LegalMentions from "../pages/LegalMentions.jsx";
import CGU from "../pages/CGU.jsx";

const routes = [
  { path: "/", element: <Home /> },
  { path: "/home", element: <Home /> },
  { path: "/auth", element: <Auth /> },
  { path: "/unauthorized", element: <Unauthorized /> },

  { path: "/histoire", element: <Information /> },
  { path: "/players", element: <Players />},
  { path: "/players-admin", element: <PlayersAdmin />, private: true, requiredRole: "Admin" },

  { path: "/player-jobs/:playerId", element: <PlayerJobs />, private: true, requiredRole: "Admin" },
  { path: "/create-player", element: <CreatePlayer />, private: true, requiredRole: "Admin" },
  { path: "/reporting/money", element: <MoneyReport />,   private: true, requiredRole: "Admin" },

  { path: "/map", element: <Map />},

  { path: "/character", element: <Character />},
  { path: "/talents", element: <TalentSelection />, private: true, requiredRole: "Esclave"},
  { path: "/talents/:profession", element: <TalentTree />, private: true, requiredRole: "Esclave"},
  { path: "/talent2/:profession", element: <TalentTree2 />, private: true, requiredRole: "Esclave"},
  { path: "/sessions", element: <SessionsPage />, private: true, requiredRole: "Esclave"},
  { path: "/quests", element: <Quests />, private: true, requiredRole: "Etranger"},

  { path: "/futures/create", element: <CreateFuturePage />, private: true, requiredRole: "Esclave"},
  { path: "/futures/create", element: <CreateFuturePage />, private: true, requiredRole: "Esclave"},
  { path: "/histoires/livres", element: <Livres />},
  { path: "/histoires/livres/:livreId/chapitre/:chapitreId", element: <Chapitres />},
  { path: "/histoires/familles", element: <Familles />},
  { path: "/histoires/arbre/:famille", element: <Arbre />},
  { path: "/histoires/lois", element: <Lois />},
  { path: "/histoires/armee", element: <Armee />},
  { path: "/histoires/politique", element: <Politique />},
  { path: "/histoires/titres", element: <Titres />},
  { path: "/histoires/guildes", element: <Guildes />},
  { path: "/histoires/metiers", element: <Metiers />},
  { path: "/histoires/npcs", element: <Npcs />},
  { path: "/histoires/journal", element: <Journal />},
  { path: "/futures/edit/:id", element: <EditFuturePage />,   private: true, requiredRole: "Esclave" },


  { path: "/admin-dashboard", element: <AdminDashboard />, private: true, requiredRole: "Admin" },
  { path: "/admin/sessions/:sessionId/players-futures", element: <SessionPlayersFuturesPage  />, private: true, requiredRole: "Admin" },
  { path: "/admin/quests", element: <QuestEditor />, private: true, requiredRole: "Admin" },

  { path: "/dice", element: <DicePage />},
  { path: "/legal", element: <LegalMentions />},
  { path: "/tos", element: <CGU />},
];

export default routes;
