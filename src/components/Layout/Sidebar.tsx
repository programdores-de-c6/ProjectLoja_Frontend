/**
 * ====================================================
 * COMPONENTE SIDEBAR/MENU LATERAL
 * ====================================================
 *
 * Menu de navegação lateral com:
 * - Navegação hierárquica (grupos e itens)
 * - Estado colapsado/expandido
 * - Indicadores visuais de página ativa
 * - Abertura automática do grupo da página ativa
 * - Tooltips em modo colapsado
 * - Suporte a ícones e badges
 * - Controlo de acesso por nível de utilizador
 * - Controlo de acesso mediante seleção de loja
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  ChevronDown,
  Home,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  Store,
  Truck,
  Tags,
  MapPin,
  UserCheck,
  Receipt,
  BarChart3,
  CircleDollarSign,
  ChevronLeft,
  ChartNoAxesCombined,
  CreditCard,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

import { useAuth } from '@/contexts/useAuth';

/**
 * ====================================================
 * TIPOS E INTERFACES
 * ====================================================
 */

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path?: string;
  badge?: string | number;
  children?: MenuItem[];
  requiredRoles?: string[];
  requireStoreSelection?: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: () => void;
  mobile?: boolean;
}

/**
 * ====================================================
 * CONFIGURAÇÃO DO MENU
 * ====================================================
 */

const menuItems: MenuItem[] = [
  /**
   * ==================================================
   * DASHBOARD
   * ==================================================
   */
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/',
  },

  /**
   * ==================================================
   * GESTÃO DE RECURSOS
   * ==================================================
   */
  {
    id: 'gestao-recursos',
    label: 'Gestão de Recursos',
    icon: Package,
    requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    children: [
      {
        id: 'lojas',
        label: 'Lojas',
        icon: Store,
        path: '/shop',
        requiredRoles: ['ROLE_ADMIN'],
      },
      {
        id: 'fornecedores',
        label: 'Fornecedores',
        icon: Truck,
        path: '/supplier',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'produtos',
        label: 'Produtos',
        icon: Package,
        path: '/products',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'funcionarios',
        label: 'Funcionários',
        icon: Users,
        path: '/employees',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'categorias',
        label: 'Categorias',
        icon: Tags,
        path: '/categories',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'clientes',
        label: 'Clientes',
        icon: Users,
        path: '/customers',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
    ],
  },

  /**
   * ==================================================
   * GESTÃO AVANÇADA
   * ==================================================
   */
  {
    id: 'gestao-avancada',
    label: 'Gestão Avançada',
    icon: Settings,
    requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    children: [
      {
        id: 'cargos',
        label: 'Cargos',
        icon: UserCheck,
        path: '/job-titles',
        requiredRoles: ['ROLE_ADMIN'],
      },
      {
        id: 'localidades',
        label: 'Localidades',
        icon: MapPin,
        path: '/locations',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'impostos',
        label: 'Impostos',
        icon: Receipt,
        path: '/taxes',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'series',
        label: 'Séries',
        icon: FileText,
        path: '/series',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
    ],
  },

  /**
   * ==================================================
   * OPERAÇÕES
   * ==================================================
   */
  {
    id: 'operacoes',
    label: 'Operações',
    icon: ShoppingCart,
    requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
    requireStoreSelection: true,
    children: [
      {
        id: 'vendas',
        label: 'Vendas',
        icon: ShoppingCart,
        path: '/sales',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
      },
      {
        id: 'historico-vendas',
        label: 'Histórico de Vendas',
        icon: ChartNoAxesCombined,
        path: '/vendas-recentes',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
      },
      {
        id: 'caixa-management',
        label: 'Gestão de Caixa',
        icon: CircleDollarSign,
        path: '/caixa-management',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
      },
      {
        id: 'requisicoes',
        label: 'Requisições',
        icon: FileText,
        path: '/requests',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
      },
    ],
  },

  /**
   * ==================================================
   * RELATÓRIOS
   * ==================================================
   */
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: BarChart3,
    children: [
      {
        id: 'relatorio-vendas',
        label: 'Vendas',
        icon: BarChart3,
        path: '/reports/sales',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'relatorio-estoque',
        label: 'Estoque',
        icon: Package,
        path: '/reports/stock',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
      },
      {
        id: 'relatorio-clientes',
        label: 'Clientes',
        icon: Users,
        path: '/reports/customers',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
      },
      {
        id: 'relatorio-pagamentos',
        label: 'Pagamentos',
        icon: CreditCard,
        path: '/reports/payments',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
      },
      {
        id: 'relatorio-produtos',
        label: 'Produtos',
        icon: Package,
        path: '/reports/products',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
      },
      {
        id: 'relatorio-movimentos',
        label: 'Movimentos de Stock',
        icon: FileText,
        path: '/reports/movements',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'relatorio-funcionarios',
        label: 'Funcionários',
        icon: Users,
        path: '/reports/employees',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'relatorio-caixas',
        label: 'Caixas',
        icon: CircleDollarSign,
        path: '/reports/boxes',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
      {
        id: 'relatorio-financeiro',
        label: 'Receita Mensal — Finanças',
        icon: FileText,
        path: '/reports/monthly-financial',
        requiredRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      },
    ],
  },
];

/**
 * ====================================================
 * COMPONENTE ITEM DO MENU
 * ====================================================
 */

interface MenuItemComponentProps {
  item: MenuItem;
  collapsed: boolean;
  level: number;
  onNavigate: () => void;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  collapsed,
  level,
  onNavigate,
}) => {
  const location = useLocation();

  const hasChildren = Boolean(item.children?.length);

  /**
   * Verifica se o próprio item está activo.
   */
  const isActive = item.path
    ? location.pathname === item.path
    : false;

  /**
   * Verifica se algum filho está activo.
   */
  const hasActiveChild = hasChildren
    ? item.children!.some(
        (child) => child.path === location.pathname
      )
    : false;

  /**
   * Estado do grupo aberto/fechado.
   * Quando um filho fica activo, o grupo abre automaticamente.
   */
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  /**
   * ==================================================
   * CLICK
   * ==================================================
   */
  const handleClick = () => {
    if (hasChildren) {
      setIsOpen((prev) => !prev);
    }
  };

  /**
   * ==================================================
   * CONTEÚDO INTERNO DO ITEM
   * ==================================================
   */
  const ItemContent = () => (
    <>
      <item.icon className="h-5 w-5 flex-shrink-0" />

      {!collapsed && (
        <>
          <span className="flex-1 text-left">
            {item.label}
          </span>

          {item.badge !== undefined && (
            <Badge
              variant="secondary"
              className="ml-2 text-xs"
            >
              {item.badge}
            </Badge>
          )}

          {hasChildren && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          )}
        </>
      )}
    </>
  );

  /**
   * ==================================================
   * CLASSES DO BOTÃO
   * ==================================================
   */
  const buttonClasses = cn(
    'w-full justify-start gap-3 h-10 px-3 transition-all duration-200',
    level > 0 && 'ml-4 w-[calc(100%-1rem)]',
    collapsed && 'justify-center px-2',
    isActive && 'bg-primary text-primary-foreground',
    hasActiveChild && !isActive && 'bg-muted',
    !isActive &&
      !hasActiveChild &&
      'hover:bg-muted'
  );

  /**
   * ==================================================
   * GRUPO COLAPSADO
   * ==================================================
   *
   * Quando o sidebar está recolhido e o item tem
   * filhos, mostramos apenas o ícone + tooltip.
   */
  if (collapsed && hasChildren) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={buttonClasses}
            onClick={handleClick}
          >
            <ItemContent />
          </Button>
        </TooltipTrigger>

        <TooltipContent
          side="right"
          className="font-medium"
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  /**
   * ==================================================
   * ITEM COM PATH
   * ==================================================
   */
  if (item.path) {
    const buttonComponent = (
      <Button
        variant="ghost"
        className={buttonClasses}
        asChild
      >
        <Link
          to={item.path}
          onClick={onNavigate}
          className="flex w-full items-center gap-3"
        >
          <ItemContent />
        </Link>
      </Button>
    );

    /**
     * Tooltip quando o sidebar está recolhido.
     */
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonComponent}
          </TooltipTrigger>

          <TooltipContent
            side="right"
            className="font-medium"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonComponent;
  }

  /**
   * ==================================================
   * GRUPO COM FILHOS
   * ==================================================
   */
  return (
    <>
      <Button
        variant="ghost"
        className={buttonClasses}
        onClick={handleClick}
      >
        <ItemContent />
      </Button>

      {hasChildren && isOpen && !collapsed && (
        <div className="ml-2 space-y-1">
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              collapsed={collapsed}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </>
  );
};

/**
 * ====================================================
 * COMPONENTE PRINCIPAL SIDEBAR
 * ====================================================
 */

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onNavigate,
  mobile = false,
}) => {
  const { user } = useAuth();

  /**
   * Normaliza o ID da loja.
   *
   * idl = 0 -> visão global
   * idl > 0 -> loja seleccionada
   */
  const normalizedStoreId = user?.idl
    ? String(user.idl)
    : '';

  const isGlobalView = normalizedStoreId === '0';

  /**
   * ==================================================
   * CONTROLO DE ACESSO
   * ==================================================
   */
  const canAccessItem = (item: MenuItem): boolean => {
    /**
     * Verificação do nível de acesso.
     *
     * Sem NivelAcesso definido -> não possui
     * permissão para itens que exigem roles.
     */
    if (
      item.requiredRoles &&
      !item.requiredRoles.includes(
        user?.NivelAcesso ?? ''
      )
    ) {
      return false;
    }

    /**
     * Algumas secções só podem ser utilizadas
     * quando existe uma loja seleccionada.
     */
    if (
      item.requireStoreSelection &&
      isGlobalView
    ) {
      return false;
    }

    return true;
  };

  /**
   * ==================================================
   * CONSTRUÇÃO DO MENU VISÍVEL
   * ==================================================
   */
  const visibleMenuItems = menuItems
    .map((item) => {
      /**
       * Verifica acesso ao item principal.
       */
      const accessible = canAccessItem(item);

      /**
       * Filtra os filhos sem permissão.
       */
      const children = item.children
        ?.filter((child) =>
          canAccessItem(child)
        );

      return {
        ...item,
        children:
          children && children.length > 0
            ? children
            : undefined,
        accessible,
      };
    })
    .filter((item) => {
      /**
       * Grupo:
       * só aparece se existir pelo menos um filho
       * que o utilizador possa aceder.
       */
      if (item.children) {
        return item.children.length > 0;
      }

      /**
       * Item simples:
       * aparece apenas se tiver permissão.
       */
      return item.accessible;
    });

  /**
   * ==================================================
   * RENDER
   * ==================================================
   */
  return (
    <div className="flex h-full flex-col bg-white">

      {/* ==================================================
          CABEÇALHO DO SIDEBAR
          ================================================== */}
      <div className="flex h-16 items-center justify-between border-b px-4">

        {!collapsed && (
          <div className="flex items-center gap-3">

            {user?.logo ? (
              <img
                src={user.logo}
                alt="Logo"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Store className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {user?.loja || 'Sistema de Vendas'}
              </span>

              <span className="text-xs text-gray-500">
                {user?.nome || 'Utilizador'}
              </span>
            </div>
          </div>
        )}

        {!mobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
            aria-label={
              collapsed
                ? 'Expandir menu'
                : 'Recolher menu'
            }
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* ==================================================
          NAVEGAÇÃO
          ================================================== */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <TooltipProvider>
          {visibleMenuItems.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              collapsed={collapsed}
              level={0}
              onNavigate={onNavigate}
            />
          ))}
        </TooltipProvider>
      </nav>

      {/* ==================================================
          RODAPÉ DO SIDEBAR
          ================================================== */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="text-center text-xs text-gray-500">
            Sistema de Vendas v1.0
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;