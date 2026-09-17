/**
 * ====================================================
 * COMPONENTE DE TABELA DE DADOS REUTILIZÁVEL
 * ====================================================
 * 
 * Tabela padronizada com:
 * - Ordenação por colunas
 * - Paginação integrada
 * - Busca/filtros
 * - Ações por linha
 * - Estados de loading e vazio
 * - Responsividade
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  MoreHorizontal,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// ====================================================
// TIPOS E INTERFACES
// ====================================================

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
  filterable?: boolean; // Adiciona propriedade para indicar se a coluna é filtrável
}

interface Action<T> {
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  show?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  
  // Configurações de busca
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  
  // Configurações de paginação
  paginated?: boolean;
  pageSize?: number;
  
  // Estados
  loading?: boolean;
  emptyMessage?: string;
  
  // Callbacks
  onRowClick?: (row: T) => void;
  
  // Classes customizadas
  className?: string;
  tableClassName?: string;
}

type SortDirection = 'asc' | 'desc' | null;
type FilterState = Record<string, string>; // Estado para armazenar os filtros

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

function DataTable<T extends Record<string, string | number | boolean | null | undefined>>({
  data,
  columns,
  actions = [],
  searchable = true,
  searchPlaceholder = 'Buscar...',
  searchKeys,
  paginated = true,
  pageSize = 10,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
  className,
  tableClassName,
}: DataTableProps<T>) {
  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({}); // Novo estado para filtros

  /**
   * Filtra os dados baseado no termo de busca e nos filtros avançados
   */
  const filteredData = useMemo(() => {
    let currentFilteredData = data;

    // Aplica busca global
    if (searchTerm) {
      const keys = searchKeys || Object.keys(data[0] || {}) as (keyof T)[];
      currentFilteredData = currentFilteredData.filter((row) =>
        keys.some((key) => {
          const value = row[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Aplica filtros por coluna
    currentFilteredData = currentFilteredData.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true; // Ignora filtros vazios
        const rowValue = row[key];
        if (rowValue == null) return false;
        return String(rowValue).toLowerCase().includes(value.toLowerCase());
      });
    });

    return currentFilteredData;
  }, [data, searchTerm, searchKeys, filters]);

  /**
   * Ordena os dados baseado na coluna e direção selecionadas
   */
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  /**
   * Pagina os dados
   */
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, paginated]);

  /**
   * Calcula informações de paginação
   */
  const paginationInfo = useMemo(() => {
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return {
      totalItems,
      totalPages,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [sortedData.length, currentPage, pageSize]);

  /**
   * Manipula a ordenação por coluna
   */
  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      // Cicla entre asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  /**
   * Manipula a mudança de filtro para uma coluna específica
   */
  const handleFilterChange = (columnKey: keyof T, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [columnKey as string]: value,
    }));
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };

  /**
   * Limpa um filtro específico
   */
  const clearFilter = (columnKey: keyof T) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      delete newFilters[columnKey as string];
      return newFilters;
    });
    setCurrentPage(1); // Reset para primeira página ao limpar filtro
  };

  /**
   * Renderiza o ícone de ordenação
   */
  const renderSortIcon = (column: keyof T) => {
    if (sortColumn !== column) {
      return <ChevronUp className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
    }

    if (sortDirection === 'asc') {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }

    if (sortDirection === 'desc') {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }

    return null;
  };

  /**
   * Renderiza as ações da linha
   */
  const renderActions = (row: T) => {
    const visibleActions = actions.filter(action =>
      !action.show || action.show(row)
    );

    if (visibleActions.length === 0) return null;

    if (visibleActions.length === 1) {
      const action = visibleActions[0];
      const Icon = action.icon;
      
      return (
        <Button
          variant={action.variant || 'ghost'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(row);
          }}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {!Icon && action.label}
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick(row)}
                className={cn(
                  action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
                )}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const filterableColumns = useMemo(() => columns.filter(col => col.filterable), [columns]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* ====================================================
          BARRA DE BUSCA E FILTROS
          ==================================================== */}
      <div className="flex items-center gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset para primeira página ao buscar
              }}
              className="pl-10"
            />
          </div>
        )}
        
        {/* Botão de filtros (futuro) - AGORA COM FUNCIONALIDADE */}
        {filterableColumns.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {Object.keys(filters).length > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full px-2 py-0.5">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filtrar por</h4>
                  <p className="text-sm text-muted-foreground">Aplique filtros às colunas.</p>
                </div>
                <div className="grid gap-2">
                  {filterableColumns.map(column => (
                    <div key={String(column.key)} className="grid grid-cols-3 items-center gap-4">
                      <label htmlFor={`filter-${String(column.key)}`} className="text-sm font-medium leading-none">
                        {column.label}
                      </label>
                      <Input
                        id={`filter-${String(column.key)}`}
                        value={filters[column.key as string] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="col-span-2 h-8"
                        placeholder={`Filtrar ${column.label}`}
                      />
                      {filters[column.key as string] && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => clearFilter(column.key)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* ====================================================
          TABELA
          ==================================================== */}
      <div className="rounded-md border">
        <Table className={tableClassName}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    column.className,
                    column.sortable && "cursor-pointer select-none group hover:bg-muted/50",
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-[100px]">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={column.className}>
                      {column.render 
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')
                      }
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      {renderActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ====================================================
          PAGINAÇÃO
          ==================================================== */}
      {paginated && paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {paginationInfo.startItem} a {paginationInfo.endItem} de{' '}
            {paginationInfo.totalItems} registros
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!paginationInfo.hasPrevPage}
            >
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                let pageNumber;
                if (paginationInfo.totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= paginationInfo.totalPages - 2) {
                  pageNumber = paginationInfo.totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!paginationInfo.hasNextPage}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;