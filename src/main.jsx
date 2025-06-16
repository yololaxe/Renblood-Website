import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Vous pouvez ici afficher un toast/bannière "Nouvelle version dispo, cliquez pour recharger"
    console.log('🎉 Nouvelle version disponible !');
  },
  onOfflineReady() {
    // UI info mode offline
    console.log('👌 Prêt à fonctionner hors-ligne');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
);
