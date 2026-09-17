/**
 * ====================================================
 * APLICAÇÃO PRINCIPAL (APP.TSX) - CORRIGIDO
 * ====================================================
 */

import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importações de páginas
import Layout from '@/components/Layout/Layout';
import DashboardPage from '@/pages/Dashboard/DashboardPage.tsx';
import CustomerPage from '@/pages/Customer/CustomerPage.tsx';
import CategoriesPage from '@/pages/categories/CategoriesPage.tsx';
import ProductsPage from '@/pages/products/ProductsPage.tsx';
import ReportsPage from '@/pages/reports/ReportsPage.tsx';
import EmployeesPage from '@/pages/employees/EmployeesPage.tsx';
import SuppliersPage from '@/pages/suppliers/SuppliersPage.tsx';
import RequestsPage from '@/pages/requests/RequestsPages.tsx';
import SalesPage from '@/pages/sales/SalesPage.tsx';
import JobTitlesPage from '@/pages/job-titles/JobTitlesPage.tsx';
import LocationsPage from '@/pages/locations/LocationsPage.tsx';
import SeriesPage from '@/pages/series/SeriesPage.tsx';
import ShopPage from '@/pages/shop/ShopPage.tsx';
import TaxesPage from '@/pages/taxes/TaxesPage.tsx';
import LoginPage from '@/pages/auth/LoginPage.tsx'; 
import FirstSetupPage from '@/pages/auth/FirstSetupPage.tsx';
import SelectStorePage from '@/pages/auth/SelectStorePage.tsx';
import ReportDetailPage from '@/pages/reports/ReportDetailPage.tsx';
// Importação de Provedores de Contexto
import { ProductProvider } from '@/contexts/ProductContext';
import { CaixaProvider } from '@/contexts/CaixaContext';
import SalesHistoryPage from '@/pages/sales/SalesHistoryPage.tsx';
import CaixaManagementPage from '@/pages/caixa/CaixaManagementPage.tsx'; 

// Importação do Contexto de Autenticação
import { useAuth } from './contexts/useAuth';
import { AuthProvider } from "@/contexts/AuthContext";
import api from '@/config/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  noLayout?: boolean;
  requiredRoles?: string[];
  requireStoreSelection?: boolean;
}

/**
 * @component ProtectedRoute
 * Componente que protege rotas privadas.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  noLayout = false,
  requiredRoles,
  requireStoreSelection = false,
}) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user?.NivelAcesso && !requiredRoles.includes(user.NivelAcesso)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="text-xl font-bold">!</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Sem acesso</h1>
          <p className="mt-2 text-sm text-slate-600">
            Este utilizador não tem permissão para visualizar esta área do sistema.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
            Contacte o administrador para mais detalhes.
          </p>
        </div>
      </div>
    );
  }

  if (requireStoreSelection && user?.idl && String(user.idl) === '0') {
    return <Navigate to="/select-store" replace />;
  }
  
  return noLayout ? <>{children}</> : <Layout>{children}</Layout>;
};

/**
 * @component AppContent
 * Componente que contém a lógica de roteamento principal.
 */
const AppContent: React.FC = () => {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [checkingSetup, setCheckingSetup] = useState<boolean>(true);

  // Verifica o estado inicial do servidor (se há funcionários cadastrados)
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const response = await api.get('/employee/check-setup');
        setNeedsSetup(response.data.needsSetup);
      } catch (error) {
        console.error("Erro ao verificar status do sistema:", error);
        setNeedsSetup(false); 
      } finally {
        setCheckingSetup(false);
      }
    };

    checkInitialStatus();
  }, []);

  // Tela de transição enquanto o sistema "acorda"
  if (checkingSetup) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
           <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-r-transparent"></div>
           <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando com Servidor...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* 
          1. ROTA RAIZ (http://localhost:3001/)
          Esta é a rota que faltava. Ela decide para onde o usuário vai ao abrir o site.
      */}
      <Route 
        path="/" 
        element={needsSetup ? <Navigate to="/setup" replace /> : <Navigate to="/dashboard" replace />} 
      />

      {/* 2. ROTA DE SETUP INICIAL (Km 0 do sistema) */}
      <Route 
        path="/setup" 
        element={needsSetup ? <FirstSetupPage /> : <Navigate to="/login" replace />} 
      />

      {/* 3. ROTA DE LOGIN */}
      <Route 
        path="/login" 
        element={needsSetup ? <Navigate to="/setup" replace /> : <LoginPage />} 
      />

      {/* 4. ROTAS PROTEGIDAS (Só acessíveis após login) */}
      <Route path="/select-store" element={<ProtectedRoute noLayout><SelectStorePage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><CustomerPage /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><EmployeesPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><ProductsPage /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><CategoriesPage /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute requireStoreSelection requiredRoles={['ROLE_ADMIN','ROLE_USER', 'ROLE_MANAGER']}><SalesPage /></ProtectedRoute>} />
      <Route path="/vendas-recentes" element={<ProtectedRoute requireStoreSelection requiredRoles={['ROLE_ADMIN','ROLE_USER', 'ROLE_MANAGER']}><SalesHistoryPage /></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><ShopPage /></ProtectedRoute>} />
      <Route path="/supplier" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><SuppliersPage /></ProtectedRoute>} />
      <Route path="/job-titles" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><JobTitlesPage /></ProtectedRoute>} />
      <Route path="/locations" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><LocationsPage /></ProtectedRoute>} />
      <Route path="/taxes" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><TaxesPage /></ProtectedRoute>} />
      <Route path="/series" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN','ROLE_MANAGER']}><SeriesPage /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute requireStoreSelection requiredRoles={['ROLE_ADMIN','ROLE_USER', 'ROLE_MANAGER']}><RequestsPage /></ProtectedRoute>} />
      <Route path="/caixa-management" element={<ProtectedRoute requireStoreSelection requiredRoles={['ROLE_ADMIN','ROLE_USER','ROLE_MANAGER']}><CaixaManagementPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/reports/sales" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      <Route path="/reports/stock" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      <Route path="/reports/customers" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      <Route path="/reports/payments" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      <Route path="/reports/products" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      <Route path="/reports/movements" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      <Route path="/reports/employees" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      <Route path="/reports/boxes" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      <Route path="/reports/monthly-financial" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
      {/* ROTA 404 */}
      <Route path="*" element={<div className="h-screen flex items-center justify-center font-bold">404 - Não Encontrado</div>} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CaixaProvider>
        <ProductProvider>
          <Router>
            <div className="App">
              <Toaster richColors position="top-right" closeButton />
              <AppContent />
            </div>
          </Router>
        </ProductProvider>
      </CaixaProvider>
    </AuthProvider>
  );
};

export default App;