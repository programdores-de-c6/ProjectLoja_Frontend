import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Home from "./view/main/home";
import Login from "./view/login/Login";
import ContextRegister from "./view/register/ContextRegister";
import Layout from "./component/Layout/Layout";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d6efd', // Cor primária padrão
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleConfigOpen = () => {
    setConfigOpen(true);
  };

  const handleConfigClose = () => {
    setConfigOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
            />
            <Route
              path="/home"
              element={
                isAuthenticated ? (
                  <Layout onConfigOpen={handleConfigOpen}>
                    <Home configOpen={configOpen} handleConfigClose={handleConfigClose} />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Layout onConfigOpen={handleConfigOpen}>
                    <ContextRegister />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={<Login />}
          />
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;