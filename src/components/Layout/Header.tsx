/**
 * ====================================================
 * COMPONENTE HEADER
 * ====================================================
 * 
 * Cabeçalho fixo da aplicação com:
 * - Botão de toggle do menu (mobile)
 * - Informações do usuário logado
 * - Menu dropdown do usuário
 * - Notificações (futuro)
 * - Breadcrumbs (futuro)
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import axios from 'axios';
import API_BASE_URL from '@/config/api';

// ====================================================
// TIPOS E INTERFACES
// ====================================================

interface User {
  id: string;
  nome: string;
  loja: string;
  NivelAcesso: string;
  logo?: string;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  user: User | null;
  className?: string;
}

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  sidebarOpen,
  user,
  className,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  /**
   * Realiza o logout do usuário
   * Chama a API de logout e limpa o contexto
   */
  const handleLogout = async () => {
    try {
      // Chama API de logout no backend
      await axios.post(
        `${API_BASE_URL}/employee/logout`,
        {},
        { withCredentials: true }
      );
      
      // Limpa o contexto e redireciona
      logout();
      navigate('/login');
      showSuccessToast('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro na API, faz logout local
      logout();
      navigate('/login');
      showErrorToast('Sessão encerrada');
    }
  };

  /**
   * Obtém as iniciais do nome do usuário para o avatar
   */
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Obtém a cor do badge baseado no nível de acesso
   */
  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'ROLE_ADMIN':
        return { label: 'Admin', variant: 'destructive' as const };
      case 'ROLE_MANAGER':
        return { label: 'Gerente', variant: 'default' as const };
      case 'ROLE_USER':
        return { label: 'Operador', variant: 'secondary' as const };
      default:
        return { label: 'Usuário', variant: 'outline' as const };
    }
  };

  const accessBadge = user ? getAccessLevelBadge(user.NivelAcesso) : null;

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm",
      "left-0 lg:left-70", // Ajusta baseado na largura do sidebar
      className
    )}>
      <div className="flex h-full items-center justify-between px-6">
        {/* ====================================================
            LADO ESQUERDO - TOGGLE MENU (MOBILE)
            ==================================================== */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs ou título da página (futuro) */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">
              Sistema de Vendas
            </h1>
          </div>
        </div>

        {/* ====================================================
            LADO DIREITO - USUÁRIO E AÇÕES
            ==================================================== */}
        <div className="flex items-center gap-4">
          {/* Botão de busca (futuro) */}
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notificações (futuro) */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {/* Badge de notificação */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          {user?.NivelAcesso === 'ROLE_ADMIN' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/select-store')}
              className="hidden md:flex"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Trocar unidade
            </Button>
          )}

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-auto px-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.logo} alt={user?.nome} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user ? getUserInitials(user.nome) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.nome || 'Usuário'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {user?.loja || 'Sistema'}
                      </span>
                      {accessBadge && (
                        <Badge variant={accessBadge.variant} className="text-xs px-1 py-0">
                          {accessBadge.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.loja || 'Sistema de Vendas'}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;