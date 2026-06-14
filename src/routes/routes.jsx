// src/routes/routes.js
import React, { lazy } from "react";

const Home = lazy(() => import("../pages/Home.jsx"));
const Players = lazy(() => import("../pages/Players.jsx"));
const Map = lazy(() => import("../pages/Map.jsx"));
const Auth = lazy(() => import("../pages/Auth.jsx"));
const TalentSelection = lazy(() => import("../pages/player/TalentSelection.jsx"));
const TalentTree = lazy(() => import("../pages/player/TalentTree.jsx"));
const TalentTree2 = lazy(() => import("../pages/player/TalentTree2.jsx"));
const SessionsPage = lazy(() => import("../pages/player/sessions.jsx"));
const Information = lazy(() => import("../pages/Information.jsx"));
const Character = lazy(() => import("../pages/Character.jsx"));
const Livres = lazy(() => import("../pages/histoires/Livre.jsx"));
const Chapitres = lazy(() => import("../pages/histoires/livres/Chapitres.jsx"));
const Familles = lazy(() => import("../pages/histoires/Familles.jsx"));
const Lois = lazy(() => import("../pages/histoires/Lois.jsx"));
const Politique = lazy(() => import("../pages/histoires/Politique.jsx"));
const Armee = lazy(() => import("../pages/histoires/Armee.jsx"));
const Titres = lazy(() => import("../pages/histoires/Titres.jsx"));
const Guildes = lazy(() => import("../pages/histoires/Guildes.jsx"));
const Unauthorized = lazy(() => import("../pages/Unauthorized.jsx"));
const DicePage = lazy(() => import("../pages/dice/DicePage.jsx"));
const Metiers = lazy(() => import("../pages/histoires/Metiers.jsx"));
const Npcs = lazy(() => import("../pages/histoires/Npcs.jsx"));
const Journal = lazy(() => import("../pages/histoires/Journal.jsx"));
const CreateFuturePage = lazy(() => import("../pages/player/CreateFuture.jsx"));
const EditFuturePage = lazy(() => import("../pages/player/EditFuturePage.jsx"));
const LegalMentions = lazy(() => import("../pages/LegalMentions.jsx"));
const CGU = lazy(() => import("../pages/CGU.jsx"));
const PlayersAdmin = lazy(() => import("../pages/admin/PlayersAdmin.jsx"));
const PlayerJobs = lazy(() => import("../pages/PlayerJobs.jsx"));
const CreatePlayer = lazy(() => import("../pages/CreatePlayer.jsx"));
const Quests = lazy(() => import("../pages/Quests.jsx"));
const Arbre = lazy(() => import("../pages/histoires/Arbre.jsx"));
const AdminDashboard = lazy(() => import("../pages/adminDashboard/AdminDashboard.jsx"));
const SessionPlayersFuturesPage = lazy(() => import("../pages/adminDashboard/SessionPlayers.jsx"));
const MoneyReport = lazy(() => import("../pages/adminDashboard/reporting/MoneyReport.jsx"));
const QuestEditor = lazy(() => import("../pages/adminDashboard/QuestEditor.jsx"));
const AdminMarketDashboard = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminMarketDashboard })));
const AdminReferenceItemsPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminReferenceItemsPage })));
const AdminCityModifiersPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminCityModifiersPage })));
const AdminCalculatedPricesPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminCalculatedPricesPage })));
const AdminMerchantCountersPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminMerchantCountersPage })));
const AdminMerchantCounterDetailsPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminMerchantCounterDetailsPage })));
const AdminMarketModerationPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminMarketModerationPage })));
const AdminMarketModerationDetailsPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminMarketModerationDetailsPage })));
const AdminMarketTransactionsPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminMarketTransactionsPage })));
const AdminMarketWithdrawalsPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminMarketWithdrawalsPage })));
const AdminCalculationRunsPage = lazy(() => import("../pages/markets/AdminMarketPages.jsx").then((m) => ({ default: m.AdminCalculationRunsPage })));
const PublicMarketPricesPage = lazy(() => import("../pages/markets/PlayerMarketPages.jsx").then((m) => ({ default: m.PublicMarketPricesPage })));
const PlayerOwnedCountersPage = lazy(() => import("../pages/markets/PlayerMarketPages.jsx").then((m) => ({ default: m.PlayerOwnedCountersPage })));
const PlayerCounterHistoryPage = lazy(() => import("../pages/markets/PlayerMarketPages.jsx").then((m) => ({ default: m.PlayerCounterHistoryPage })));

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
  { path: "/admin/markets", element: <AdminMarketDashboard />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/reference-items", element: <AdminReferenceItemsPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/city-modifiers", element: <AdminCityModifiersPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/calculated-prices", element: <AdminCalculatedPricesPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/counters", element: <AdminMerchantCountersPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/counters/:id", element: <AdminMerchantCounterDetailsPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/moderation", element: <AdminMarketModerationPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/moderation/:id", element: <AdminMarketModerationDetailsPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/transactions", element: <AdminMarketTransactionsPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/withdrawals", element: <AdminMarketWithdrawalsPage />, private: true, requiredRole: "Admin" },
  { path: "/admin/markets/calculation-runs", element: <AdminCalculationRunsPage />, private: true, requiredRole: "Admin" },
  { path: "/market-prices", element: <PublicMarketPricesPage /> },
  { path: "/account/merchant-counters", element: <PlayerOwnedCountersPage />, private: true, requiredRole: "Esclave" },
  { path: "/account/merchant-counters/:id", element: <PlayerCounterHistoryPage />, private: true, requiredRole: "Esclave" },

  { path: "/dice", element: <DicePage />},
  { path: "/legal", element: <LegalMentions />},
  { path: "/tos", element: <CGU />},
];

export default routes;
