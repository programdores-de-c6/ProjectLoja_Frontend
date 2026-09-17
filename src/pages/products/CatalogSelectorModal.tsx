/**
 * ====================================================
 * CATALOG SELECTOR MODAL - VERSÃO REVISADA
 * ====================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle2, Loader2, PackageSearch } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/common/DataTable";
import { useProductService, type Product } from "./ProductsService";
import { showErrorToast } from '@/utils/toast';

interface CatalogSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
  existingProductIds: (string | number)[];
}

const CatalogSelectorModal: React.FC<CatalogSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  existingProductIds
}) => {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { listarCatalogoGlobal } = useProductService();

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const data = await listarCatalogoGlobal();
        setCatalog(Array.isArray(data) ? data : []);
      } catch (error) {
        showErrorToast("Não foi possível carregar o catálogo global.");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [isOpen, ]);

  // Lógica de filtragem: remove produtos que já existem na unidade actual
  const availableProducts = useMemo(() => {
    return catalog.filter(product => !existingProductIds.includes(product.id));
  }, [catalog, existingProductIds]);

  // Colunas compatíveis com o DataTable e interface Product
  const columns = useMemo(() => [
    {
      key: "codigobarra" as keyof Product,
      label: "Código",
      sortable: true,
      render: (value: string | number | boolean | null | undefined) => (
        <span className="text-xs font-mono text-muted-foreground">{value}</span>
      )
    },
    {
      key: "nome" as keyof Product,
      label: "Produto",
      sortable: true,
      render: (value: string | number | boolean | null | undefined) => (
        <div className="font-bold text-slate-700">{String(value).toUpperCase()}</div>
      )
    },
    {
      key: "categorys" as keyof Product,
      label: "Categoria",
      render: (value: string | number | boolean | null | undefined) => (
        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{value || 'N/A'}</span>
      )
    }
  ], []);

  // Acção de selecção com tipagem compatível com o DataTable actual
  const actions = useMemo(() => [
    {
      label: "Seleccionar",
      icon: CheckCircle2,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => {
        // Segue o padrão de cast utilizado na ProductsPage.tsx
        onSelect(row as unknown as Product);
      }
    }
  ], [onSelect]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg"><Search className="w-5 h-5 text-white" /></div>
            <div>
              <DialogTitle className="text-xl font-bold">Catálogo Global de Produtos</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">Pesquise e seleccione um produto existente para configurar na sua unidade.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-auto bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="font-medium animate-pulse">A consultar catálogo central...</p>
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border-2 border-dashed rounded-2xl bg-slate-50">
              <div className="p-4 bg-white rounded-full shadow-sm"><PackageSearch className="w-12 h-12 text-slate-300" /></div>
              <div className="max-w-xs">
                <p className="text-slate-600 font-bold uppercase text-sm">Nenhum produto novo encontrado</p>
                <p className="text-slate-400 text-xs mt-1">Todos os produtos do catálogo já estão associados à sua loja.</p>
              </div>
              <Button variant="outline" onClick={onClose} className="mt-2">Voltar à lista local</Button>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden border-slate-200">
              <DataTable
                // Cast necessário para compatibilidade com a assinatura da DataTable genérica
                data={availableProducts as unknown as Record<string, string | number | boolean | null | undefined>[]}
                columns={columns}
                actions={actions}
                loading={false}
                searchable
                searchPlaceholder="Procurar no catálogo..."
                paginated={true}
                pageSize={8}
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          <span>Identidade do Catálogo Central</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>{availableProducts.length} itens disponíveis</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogSelectorModal;