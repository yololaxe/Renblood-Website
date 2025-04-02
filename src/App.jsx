// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import routes from "./routes/routes.jsx";
import PrivateRoutes from "./routes/PrivateRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import "./index.css";

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {routes.map(({ path, element, private: isPrivate, requiredRole }, index) => {
                    const WrappedElement = (
                        <PageTransition>{element}</PageTransition>
                    );

                    return (
                        <Route
                            key={index}
                            path={path}
                            element={
                                isPrivate ? (
                                    <PrivateRoutes requiredRole={requiredRole}>
                                        {WrappedElement}
                                    </PrivateRoutes>
                                ) : (
                                    <PublicRoutes>
                                        {WrappedElement}
                                    </PublicRoutes>
                                )
                            }
                        />
                    );
                })}

                {/* Redirection fallback */}
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </AnimatePresence>
    );
};


const App = () => {
    return (
      <div className="bg-gray-900 text-gray-200 min-h-screen">
        <Navbar />
        <AnimatedRoutes />
      </div>
    );
  };
  
  export default App;
  