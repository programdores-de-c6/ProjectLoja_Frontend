import React, { useState, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// 🔹 Importação das páginas
import Home from "./view/main/home";
import Login from "./view/login/Login";
import ContextRegister from "./view/register/ContextRegister";
import Location from "./pages/Location/LocationPage";
import Shop from "./pages/Shop/ShopPage";
import Supplier from "./pages/Supplier/SupplierPage";
import Category from "./pages/Category/CategoryPage";
import Tax from "./pages/Tax/TaxPage";
import Product from "./pages/Product/ProductPage";
import Customer from "./pages/Customer/CustomerPage";
import JobTitle from "./pages/JobTitle/JobTitlePage";
import Employee from "./pages/Employee/EmployeePage";
import Serie from "./pages/Serie/SeriePage"
import Sale from "./pages/Sale/SalePage";
import { Box, CircularProgress } from "@mui/material"; // 🔹 Typography e Box do MUI v5


// 🔹 Contextos
import { ProductProvider } from "./component/contexts/ProductContext";
import { AuthContext } from "./component/contexts/AuthContext";
// 🔹 Layout e toast
import Layout from "./component/Layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
/**
 * 🔹 PrivateRoute
 * Componente que verifica se o utilizador está autenticado
 * - Se sim → renderiza os filhos
 * - Se não → redireciona para /login
 */
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * 🔹 ProtectedLayout
 * Combina PrivateRoute e Layout para evitar repetição de código
 * - Recebe children (conteúdo da rota)
 */
const ProtectedLayout = ({ children, isAuthenticated, onConfigOpen }) => (
  <PrivateRoute isAuthenticated={isAuthenticated}>
    <Layout onConfigOpen={onConfigOpen}>{children}</Layout>
  </PrivateRoute>
);
const Loader = () => (
  <Box
    sx={{
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress color="primary" size={60} />
  </Box>
);
function AppRoutes() {
  const { isAuthenticated, loading } = useContext(AuthContext); // 🔹 pega autenticação e estado de loading
  const [configOpen, setConfigOpen] = useState(false); // 🔹 controla modal/configurações

  // 🔹 Evita renderização antes do AuthContext carregar
  if (loading) return <Loader />; // 🔹 pode colocar <Spinner /> aqui se quiser

  return (
    <Routes>
      {/* 🔹 Rota de login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
      />

      {/* 🔹 Rota Home */}
      <Route
        path="/home"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Home
              configOpen={configOpen}
              handleConfigClose={() => setConfigOpen(false)}
            />
          </ProtectedLayout>
        }
      />

      {/* 🔹 Rota de registro */}
      <Route
        path="/register"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <ContextRegister />
          </ProtectedLayout>
        }
      />

      {/* 🔹 Rota de Localidades */}
      <Route
        path="/localidade"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Location />
          </ProtectedLayout>
        }
      />
      {/* 🔹 Rota de Shop */}
      <Route
        path="/shop"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Shop />
          </ProtectedLayout>
        }
      />

      {/* 🔹 Rota de fornecedor */}
      <Route
        path="/supplier"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Supplier />
          </ProtectedLayout>
        }
      />

      {/* 🔹 Rota de categoria */}
      <Route
        path="/category"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Category />
          </ProtectedLayout>
        }
      />

      {/* 🔹 Rota de Imposto */}
      <Route
        path="/tax"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Tax />
          </ProtectedLayout>
        }
      />

      {/* 🔹 Rota de Produto */}
      <Route
        path="/prod"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Product />
          </ProtectedLayout>
        }
      />

      {/* 🔹 Rota de Cliente */}
      <Route
        path="/client"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Customer />
          </ProtectedLayout>
        }
      />
      {/* 🔹 Rota de salario base */}
      <Route
        path="/jobtitle"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <JobTitle />
          </ProtectedLayout>
        }
      />
       {/* 🔹 Rota de funcionario */}
      <Route
        path="/employee"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Employee />
          </ProtectedLayout>
        }
      />


       {/* 🔹 Rota de serie */}
      <Route
        path="/serie"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Serie />
          </ProtectedLayout>
        }
      />
        {/* 🔹 Rota de venda */}
      <Route
        path="/sale"
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onConfigOpen={() => setConfigOpen(true)}
          >
            <Sale />
          </ProtectedLayout>
        }
      />
      {/* 🔹 Rota raiz "/" redireciona dependendo da autenticação */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

function App() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [configOpen, setConfigOpen] = useState(false);

  if (loading) return <Loader />;

  return (
      <ProductProvider>
    <Router>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        configOpen={configOpen}
        setConfigOpen={setConfigOpen}
      />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </Router>
    </ProductProvider>
  );
}
export default App;
