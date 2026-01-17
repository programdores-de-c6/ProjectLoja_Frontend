import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./component/contexts/AuthContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

// 🎨 Define o tema global
const theme = createTheme({
  palette: {
    primary: { main: "#0d6efd" }, // Azul padrão do Bootstrap/MUI
    background: {
      default: "#f5f5f5", // Fundo global mais suave
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          height: "70px", // Altura fixa para o cabeçalho
        },
      },
    },
  },
});

// 🚀 Renderização da aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* 🔹 Normaliza estilos globais (importante no MUI v5) */}
      <CssBaseline /> 
      
      {/* 🔹 Autenticação e contexto da app */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
