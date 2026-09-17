/**
 * ====================================================
 * COMPONENTE DE LAYOUT PRINCIPAL
 * ====================================================
 * 
 * Estrutura base da aplicação que organiza:
 * - Sidebar/Menu lateral responsivo
 * - Header fixo com navegação
 * - Área de conteúdo principal
 * - Footer (opcional)
 * 
 * Funcionalidades:
 * - Menu colapsável em desktop
 * - Menu overlay em mobile
 * - Navegação por teclado
 * - Tema responsivo
 */

import React, { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';

// ====================================================
// TIPOS E INTERFACES
// ====================================================

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

// ====================================================
// CONSTANTES DE LAYOUT
// ====================================================

const SIDEBAR_WIDTH = {
  EXPANDED: 280,
  COLLAPSED: 80,
  MOBILE: 280,
};

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  // Estados do layout
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Contexto de autenticação
  const { user } = useAuth();

  /**
   * Alterna o estado do sidebar em mobile
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Alterna o estado colapsado do sidebar em desktop
   */
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  /**
   * Fecha o sidebar (usado em mobile após navegação)
   */
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Calcula a largura do sidebar baseado no estado
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ====================================================
          SIDEBAR DESKTOP
          ==================================================== */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white shadow-lg transition-all duration-300 ease-in-out hidden lg:block",
          sidebarCollapsed ? "w-20" : "w-70"
        )}
      >
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          onNavigate={closeSidebar}
        />
      </div>

      {/* ====================================================
          SIDEBAR MOBILE (OVERLAY)
          ==================================================== */}
      {sidebarOpen && (
        <>
          {/* Overlay de fundo */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={closeSidebar}
          />
          
          {/* Sidebar mobile */}
          <div className="fixed left-0 top-0 z-50 h-full w-70 bg-white shadow-xl lg:hidden">
            <Sidebar 
              collapsed={false}
              onToggleCollapse={() => {}} // Não usado em mobile
              onNavigate={closeSidebar}
              mobile
            />
          </div>
        </>
      )}

      {/* ====================================================
          CONTEÚDO PRINCIPAL
          ==================================================== */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          "lg:ml-70", // Margem fixa em desktop
          sidebarCollapsed && "lg:ml-20" // Margem reduzida quando colapsado
        )}
      >
        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          user={user}
        />

        {/* Área de conteúdo */}
        <main className={cn(
          "min-h-[calc(100vh-4rem)] p-6 pt-20", // pt-20 para compensar header fixo
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;