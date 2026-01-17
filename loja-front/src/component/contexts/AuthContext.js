import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import api from "../../service/Api.js";

// Criar contexto
export const AuthContext = createContext();

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // evita piscar login/logout

  // ⚡️ Escolha de storage
  const storage = sessionStorage; // ou localStorage

  // Função de login
  const login = (userInfo) => {
    setUser(userInfo);
    setIsAuthenticated(true);
    storage.setItem("userData", JSON.stringify(userInfo));
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    storage.removeItem("userData");
  };
 const initAuth = async () => {
      try {
        // Tenta renovar token
        const res = await axios.post(
          `${api}/employee/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (res.status === 200 && res.data.accessToken) {
          const decoded = jwtDecode(res.data.accessToken);
          let shopData = {};
          try {
            const shopDTO = {
              id: decoded.lojaid,
            };

            const shopResponse = await axios.post(
              `${api}/shop/fetch`,
              shopDTO,
              {
                withCredentials: true,
              }
            );

            shopData = shopResponse.data || {};
          } catch (shopError) {
            console.warn("Não foi possível buscar logo da loja:", shopError);
            shopData.logoUrl = null; // fallback
          }
          login({
            id: decoded.id,
            nome: decoded.nome,
            loja: decoded.loja,
            idl:decoded.lojaid,
            NivelAcesso: decoded.NivelAcesso,
            accessToken: res.data.accessToken,
            logo: shopData?.logoUrl || "/default-logo.png", // fallback caso não exista logo
          });
        } else {
          logout();
        }
         return true;
      } catch (err) {
        console.warn("Falha ao renovar token:", err);
        // fallback para user armazenado
        const storedUser = storage.getItem("userData");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
  // Inicializa estado ao carregar a app
  useEffect(() => {
    initAuth();
  }, []);

  // Renderiza children só quando loading = false
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Carregando...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading, initAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
