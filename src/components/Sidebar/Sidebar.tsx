/**
 * ====================================================
 * COMPONENTE SIDEBAR COMPATÍVEL (BARRA LATERAL)
 * ====================================================
 * 
 * Responsável por:
 * - Navegação principal do sistema
 * - Menu hierárquico com submenus
 * - Logo e informações da empresa
 * - Responsividade (desktop/mobile)
 * 
 * COMPATIBILIDADE:
 * - Windows 11 Pro
 * - Yarn 1.22.22
 * - React 18.3.1
 * - TypeScript 5.9.3
 * - Shadcn/UI components
 */

import React, { useState } from 'react';
import { 
  Home, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Store,
  Tag,
  Truck,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ====================================================
// INTERFACES E TIPOS
// ====================================================

// Define a estrutura de um item do menu
interface MenuItem {
  id: string;                           // Identificador único
  label: string;                        // Texto exibido
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;  // Componente do ícone
  path?: string;                        // Rota de navegação (opcional)
  children?: MenuItem[];                // Submenus (opcional)
  badge?: string | number;              // Badge de notificação (opcional)
}

// Define as propriedades que o componente Sidebar recebe
interface SidebarProps {
  isOpen: boolean;        // Estado de abertura (mobile)
  onClose: () => void;    // Função para fechar sidebar
  activeItem?: string;    // Item ativo no menu
}

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeItem = 'dashboard' 
}) => {
  // Estado para controlar quais submenus estão expandidos
  const [expandedItems, setExpandedItems] = useState<string[]>(['produtos']);

  // ====================================================
  // CONFIGURAÇÃO DO MENU
  // ====================================================
  
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'produtos',
      label: 'Produtos',
      icon: Package,
      children: [
        { 
          id: 'produtos-lista', 
          label: 'Lista de Produtos', 
          icon: Package, 
          path: '/produtos' 
        },
        { 
          id: 'produtos-categorias', 
          label: 'Categorias', 
          icon: Tag, 
          path: '/produtos/categorias' 
        }
      ]
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      path: '/clientes'
    },
    {
      id: 'fornecedores',
      label: 'Fornecedores',
      icon: Truck,
      path: '/fornecedores'
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: ShoppingCart,
      children: [
        { 
          id: 'vendas-nova', 
          label: 'Nova Venda', 
          icon: ShoppingCart, 
          path: '/vendas/nova' 
        },
        { 
          id: 'vendas-historico', 
          label: 'Histórico', 
          icon: FileText, 
          path: '/vendas/historico' 
        }
      ]
    },
    {
      id: 'requisicoes',
      label: 'Requisições',
      icon: FileText,
      path: '/requisicoes',
      badge: 5  // Exemplo de badge com número
    },

    {
      id: 'caixa-management',
      label: 'Gestão de Caixa',
      icon: FileText,
      path: '/caixa-management',
      
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: BarChart3,
      path: '/relatorios'
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      path: '/configuracoes'
    }
  ];

  // ====================================================
  // FUNÇÕES AUXILIARES
  // ====================================================

  // Função para expandir/recolher submenus
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)  // Remove se já está expandido
        : [...prev, itemId]                 // Adiciona se não está expandido
    );
  };

  // Função recursiva para renderizar itens do menu
  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);     // Verifica se está expandido
    const hasChildren = item.children && item.children.length > 0;  // Verifica se tem filhos
    const isActive = activeItem === item.id;               // Verifica se é o item ativo

    if (hasChildren) {
      // Renderiza item com submenu usando Shadcn Collapsible
      return (
        <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
          <CollapsibleTrigger asChild>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-between h-auto p-3 ${level > 0 ? 'ml-6' : ''}`}
            >
              <div className="flex items-center space-x-3">
                {/* Ícone do item */}
                <item.icon className="h-5 w-5 flex-shrink-0" />
                
                {/* Label do item */}
                <span className="font-medium">{item.label}</span>
                
                {/* Badge de notificação (se existir) */}
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </div>
              
              {/* Ícone de expansão */}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          {/* Submenu */}
          <CollapsibleContent className="space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    } else {
      // Renderiza item simples sem submenu
      return (
        <Button
          key={item.id}
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start h-auto p-3 ${level > 0 ? 'ml-6' : ''}`}
          onClick={() => console.log(`Navegar para: ${item.path}`)}
        >
          <div className="flex items-center space-x-3 w-full">
            {/* Ícone do item */}
            <item.icon className="h-5 w-5 flex-shrink-0" />
            
            {/* Label do item */}
            <span className="font-medium">{item.label}</span>
            
            {/* Badge de notificação (se existir) */}
            {item.badge && (
              <Badge variant="destructive" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </div>
        </Button>
      );
    }
  };

  return (
    <>
      {/* ====================================================
          BACKDROP PARA MOBILE
          ==================================================== */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ====================================================
          SIDEBAR PRINCIPAL
          ==================================================== */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        
        {/* ====================================================
            CABEÇALHO DA SIDEBAR (LOGO)
            ==================================================== */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          {/* Logo e nome da empresa */}
          <div className="flex items-center space-x-3">
            {/* Ícone da logo */}
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            
            {/* Nome da empresa */}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">ERP Vendas</span>
              <span className="text-xs text-muted-foreground">Sistema Integrado</span>
            </div>
          </div>
          
          {/* Botão de fechar (apenas mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ====================================================
            NAVEGAÇÃO PRINCIPAL
            ==================================================== */}
        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="space-y-2">
            {/* Renderiza todos os itens do menu */}
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </ScrollArea>

        {/* ====================================================
            RODAPÉ DA SIDEBAR
            ==================================================== */}
        <div className="p-4 border-t border-border">
          <Separator className="mb-4" />
          
          {/* Informações da versão */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground">Versão 1.0.0</span>
          </div>
          
          {/* Status de conexão */}
          <div className="flex items-center justify-center mt-2 space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;