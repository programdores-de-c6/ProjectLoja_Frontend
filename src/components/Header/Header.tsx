/**
 * ====================================================
 * COMPONENTE HEADER COMPATÍVEL (CABEÇALHO)
 * ====================================================
 * 
 * Responsável por:
 * - Exibir título do sistema
 * - Botão de menu para mobile
 * - Barra de pesquisa
 * - Notificações
 * - Informações do usuário e logout
 * 
 * COMPATIBILIDADE:
 * - Windows 11 Pro
 * - Yarn 1.22.22
 * - React 18.3.1
 * - TypeScript 5.9.3
 * - Shadcn/UI components
 */

import React from 'react';
import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// ====================================================
// INTERFACES E TIPOS
// ====================================================

// Define a estrutura dos dados do usuário
interface User {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// Define as propriedades que o componente Header recebe
interface HeaderProps {
  onMenuToggle: () => void;  // Função para abrir/fechar menu lateral
  user?: User;               // Dados do usuário logado (opcional)
  onLogout: () => void;      // Função para fazer logout
  title?: string;            // Título personalizado (opcional)
}

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
  user, 
  onLogout, 
  title = "Sistema de Vendas" 
}) => {
  return (
    // Container principal do header usando Shadcn classes
    <header className="bg-background border-b border-border sticky top-0 z-40 w-full">
      {/* Container do conteúdo com padding e flexbox */}
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* ====================================================
            LADO ESQUERDO - Menu e Título
            ==================================================== */}
        <div className="flex items-center space-x-4">
          {/* Botão de menu (visível apenas em mobile) usando Shadcn Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Título do sistema */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
        </div>

        {/* ====================================================
            CENTRO - Barra de Pesquisa
            ==================================================== */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          {/* Container da pesquisa com posição relativa para o ícone */}
          <div className="relative">
            {/* Ícone de pesquisa posicionado absolutamente */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            {/* Campo de input usando Shadcn Input */}
            <Input
              type="text"
              placeholder="Buscar produtos, clientes..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* ====================================================
            LADO DIREITO - Notificações e Usuário
            ==================================================== */}
        <div className="flex items-center space-x-4">
          
          {/* Botão de notificações com badge usando Shadcn */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {/* Badge de notificação usando Shadcn Badge */}
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Menu do usuário */}
          <div className="flex items-center space-x-3">
            {/* Avatar do usuário usando Shadcn Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            {/* Detalhes do usuário (visível apenas em desktop) */}
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {user?.name || 'Admin'}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.role || 'Administrador'}
              </span>
            </div>
            
            {/* Botão de logout usando Shadcn Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              aria-label="Fazer logout"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;