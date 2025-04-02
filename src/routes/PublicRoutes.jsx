// src/routes/PublicRoutes.js
import React from "react";
import { Outlet } from "react-router-dom";

const PublicRoutes = ({ children }) => {
  return children ? children : <Outlet />;
};

export default PublicRoutes;
