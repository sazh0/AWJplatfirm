// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Service1Page from "./Service1Page";
import Service2Page from "./Service2Page";
import CreateAccountPage from "./CreateAccountPage";
import Dashboard from "./Dashboard";
import BusinessModelResult from "./BusinessModelResult";
import BusinessModelPage from "./BusinessModelPage";
import CreateCompanyAccount from "./CreateCompanyAccount";
import GoalDecompose from "./GoalDecompose";
import SignIn from "./SignIn";
import Services from "./Services";
import "./style.css";
import HomePage from "./HomePage";
import GoalDecomposeResult from "./GoalDecomposingResult";
import { NotificationProvider } from './NotificationContext';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      const authStatus = !!(token && userId);
      setIsAuthenticated(authStatus);
      console.log("Auth status check:", authStatus, "Token:", token, "UserId:", userId, "isAuthenticated:", authStatus);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSignInSuccess = () => {
    setIsAuthenticated(true);
    console.log("Sign-in success, auth set to true.");
  };

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<HomePage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/signin"
            element={<SignIn setIsAuthenticated={handleSignInSuccess} />}
          />
          <Route path="/services" element={<Services />} />
          <Route path="/service-1" element={<Service1Page />} />
          <Route path="/service-2" element={<Service2Page />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/signin" state={{ from: "/dashboard" }} replace />
              )
            }
          /> */}
          <Route
            path="/create-company-account"
            element={<CreateCompanyAccount />}
          />
          <Route path="/business-model" element={<BusinessModelPage />} />
          <Route path="/business-model-result" element={<BusinessModelResult />} />
          <Route path="/goal-decomposing" element={<GoalDecompose />} />
          <Route
            path="/goal-decomposing-result"
            element={<GoalDecomposeResult />}
          />
        </Routes>
      </Router>
    </NotificationProvider>
  );
};

export default App;