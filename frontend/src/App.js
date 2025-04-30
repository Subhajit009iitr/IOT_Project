// src/App.js
import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import { isAuthenticated } from "./utils/auth";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  return loggedIn ? (
    <Dashboard onLogout={() => setLoggedIn(false)} />
  ) : (
    <Login onLoginSuccess={() => setLoggedIn(true)} />
  );
};

export default App;