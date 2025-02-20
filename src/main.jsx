import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom"; // ✅ Un seul BrowserRouter !
import { UserProvider } from "./context/UserContext"; // ✅ Contexte utilisateur

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
);
