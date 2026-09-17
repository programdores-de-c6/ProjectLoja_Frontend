/**
 * ====================================================
 * PRODUCTS PAGE - PÁGINA DE GESTÃO DE PRODUTOS
 * ====================================================
 * 
 * Esta página centraliza a gestão de produtos, permitindo a listagem,
 * visualização detalhada, criação, edição, remoção e gestão de stock.
 * Implementa integração com o formulário multi-step e confirmação de stock.
 * 
 * ATUALIZAÇÃO ETAPA 2.4.1 (REVISADA): 
 * - Trancas de UI por Role (Admin, Manager, User).
 * - Tipagem estrita.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  AlertTriangle,  
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2, ShieldCheck,
  Search, 
  LayoutGrid, 
  ImageIcon, 
  Info
} from "lucide-react"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent, 
  AlertDialogDescription,
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog"; 

import DataTable from "@/components/common/DataTable";
import ModalForm from "@/components/forms/ModalForm";
import GenericViewModal from "@/components/forms/GenericViewModal";
import { Label } from "@/components/ui/label"; 

import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useProductService, type Product, type ProductFormData, type StockDTO } from "./ProductsService";
import ProductForm, { type ProductFormRef, type ProductFormMode } from "./productForm";
import StockForm, { type StockFormRef } from "./StockForm";
import CatalogSelectorModal from "./CatalogSelectorModal";
import { useAuth } from "@/contexts/useAuth";

const ProductsPage: React.FC = () => {

  // ====================================================
  // CONTEXTO E ESTADO
  // ====================================================
  
  const { isAdmin, isManager, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopsCount, setShopsCount] = useState<number>(0);
  const [isFromCatalog, setIsFromCatalog] = useState(false);
  const isGlobalView = isAdmin && user?.idl === '0';
  // Modais de Produto
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductFormData | undefined>(undefined);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  
  // Modais de Stock
  type StockConfirmPayload = {
    distribuicaoStock: StockDTO[];
  };

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockMode, setStockMode] = useState<'adicionar' | 'baixar'>('adicionar');
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);
  const [stockConfirmOpen, setStockConfirmOpen] = useState(false);
  const [stockConfirmData, setStockConfirmData] = useState<StockConfirmPayload | null>(null);

  // Modal de Visualização e Exclusão
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const productFormRef = useRef<ProductFormRef>(null);
  const stockFormRef = useRef<StockFormRef>(null);

const [imageModalOpen, setImageModalOpen] = useState(false);
const [productForImage, setProductForImage] = useState<Product | null>(null);
const [selectedFile, setSelectedFile] = useState<File | null>(null);

// ✅ Lógica Sénior: Gera a URL de pré-visualização apenas quando o ficheiro muda
const previewUrl = useMemo(() => {
  if (!selectedFile) return null;
  return URL.createObjectURL(selectedFile);
}, [selectedFile]);

// Função para limpar estados ao fechar
const closeImageModal = () => {
  setImageModalOpen(false);
  setSelectedFile(null);
  setProductForImage(null);
};

  const { listar, criar, editar, deletar, listarId, updateStock, listarLojas, uploadFoto } = useProductService();

  // ====================================================
  // CARREGAMENTO DE DADOS
  // ====================================================

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [data, stores] = await Promise.all([listar(), listarLojas()]);
      setProducts(Array.isArray(data) ? data : []);
      setShopsCount(Array.isArray(stores) ? stores.length : 0);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      showErrorToast("Erro ao carregar a lista de produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const formMode = useMemo<ProductFormMode>(() => {
    if (isEditMode) {
      return 'EDIT';
    }

    // Uma única loja: cadastro normal para Admin e Gerente.
    if (shopsCount === 1) {
      return 'SINGLE_STORE';
    }

    // Várias lojas: Gerente configura Product existente.
    if (isManager && isFromCatalog) {
      return 'CONFIGURE_EXISTING';
    }

    if (isAdmin && user?.idl === '0') {
      return 'GLOBAL_CATALOG';
    }

    if (isAdmin && user?.idl !== '0') {
      return 'LOCAL_STORE';
    }

    return 'GLOBAL_CATALOG';
  }, [isEditMode, shopsCount, isManager, isFromCatalog, isAdmin, user?.idl]);

  // Permissões de interface:
  // - 1 loja: Admin e Gerente podem criar normalmente.
  // - >1 lojas: Admin cria; Gerente configura pelo catálogo.
  const canCreateNormally = shopsCount === 1 && (isAdmin || isManager);
  const canCreateAsAdmin = shopsCount > 1 && isAdmin;
  const canConfigureFromCatalog = shopsCount > 1 && isManager;

  // ====================================================
  // CÁLCULOS DE RESUMO
  // ====================================================

  const summary = useMemo(() => {
    const total = products.length;
    const stockBaixo = products.filter(p => p.controlaStock && p.stock <= p.stockMin).length;
    const semStock = products.filter(p => p.controlaStock && p.stock === 0).length;
    const stockOk = products.filter(p => !p.controlaStock || (p.stock > p.stockMin && p.stock > 0)).length;
    
    const valorTotal = products.reduce((acc, p) => { 
      const preco = typeof p.precoUnitario === 'string'
        ? parseFloat(p.precoUnitario.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."))
        : Number(p.precoUnitario);

      return acc + (preco * (p.stock || 0));
    }, 0);

    const percentStockBaixo = total > 0 
      ? ((stockBaixo / total) * 100).toFixed(1)
      : 0;

    return { total, stockBaixo, semStock, valorTotal, percentStockBaixo, stockOk };
  }, [products]);

  // ====================================================
  // HANDLERS
  // ====================================================

  const handleCreate = () => {
    setCurrentProduct(undefined);
    setIsEditMode(false);
    setIsFromCatalog(false);
    setModalOpen(true);
    setTimeout(() => productFormRef.current?.resetStep(), 0);
  };

  /**
   * Abre o catálogo global para o Gerente.
   * O CatalogSelectorModal trata exclusivamente da consulta e selecção.
   */
  const handleOpenCatalog = () => {
    setCatalogModalOpen(true);
  };

  /**
   * Produto seleccionado no catálogo:
   * não é uma edição do Product global; é uma configuração comercial local.
   */
  const handleSelectFromCatalog = (product: Product) => {
    const mapped: ProductFormData = {
      id: product.id,
      codigobarra: product.codigobarra || '',
      nome: product.nome || '',
      descricao: product.descricao || '',
      controlaStock: product.controlaStock,
      precoUnitario: '0',
      categoria: product.idcatgory
        ? { id: product.idcatgory, nome: product.categorys || '' }
        : null,
      fornacedor: product.idsupplier
        ? { id: product.idsupplier, nome: product.suppliers || '' }
        : null,
      imposto: product.idtax
        ? { id: product.idtax, nome: product.taxs || '' }
        : null,
      imagem: product.logoUrl || null,
      distribuicaoStock: [],
    };

    setCatalogModalOpen(false);
    setCurrentProduct(mapped);
    setIsEditMode(false);
    setIsFromCatalog(true);
    setModalOpen(true);

    setTimeout(() => productFormRef.current?.resetStep(), 50);
  };

  /**
   * handleOpenCatalog: Placeholder para o fluxo de "Adicionar do Catálogo" (ROLE_MANAGER).
   * Implementação detalhada prevista para a Etapa 2.4.2.
   */
  

  const handleEdit = useCallback(async (product: Product) => { 
    try {
      setFormLoading(true);
      const idParaBuscar = product.id;
      if (!idParaBuscar) {
        showErrorToast("ID do produto não encontrado.");
        return;
      }
      const response = await listarId(idParaBuscar);
      const res = Array.isArray(response) ? response[0] : response;

      if (!res) {
        showErrorToast("Não foi possível encontrar os dados deste produto.");
        return;
      }

      const mapped: ProductFormData = { 
        id: res.id,
        codigobarra: res.codigobarra || '',
        nome: res.nome || '',
        descricao: res.descricao || '',
        controlaStock: res.controlaStock,
        precoUnitario: String(res.precoUnitario || '0'),
        categoria: res.idcatgory ? { id: res.idcatgory, nome: res.categorys || '' } : null,
        fornacedor: res.idsupplier ? { id: res.idsupplier, nome: res.suppliers || '' } : null,
        imposto: res.idtax ? { id: res.idtax, nome: res.taxs || '' } : null,
        imagem: res.logoUrl || null,
        distribuicaoStock: [],
      };

      setCurrentProduct(mapped);
      setIsEditMode(true);
        setModalOpen(true);

      setTimeout(() => {
        productFormRef.current?.resetStep();
      }, 50);

    } catch (error) {
      console.error("Erro no mapeamento de edição:", error);
      showErrorToast("Erro ao carregar dados do produto.");
    } finally {
      setFormLoading(false);
    }
  }, [listarId]);

const handleUpdateImage = async () => {
  if (!productForImage || !selectedFile) return;

  setFormLoading(true);
  try {
    await uploadFoto(productForImage.id, selectedFile);
    showSuccessToast("Imagem do catálogo actualizada com sucesso!");
    closeImageModal();
    fetchProducts(); // Recarrega a tabela para mostrar a nova foto
  } catch (error) {
    // Erro tratado no service
  } finally {
    setFormLoading(false);
  }
};
  const handleViewClick = useCallback(async (product: Product) => {
  try {
    setFormLoading(true);
    // ✅ Faz a busca real no servidor para garantir que os detalhes estão atualizados
    const response = await listarId(product.id);
    const res = Array.isArray(response) ? response[0] : response;

    if (!res) {
      showErrorToast("Produto não encontrado no servidor.");
      return;
    }

    setViewProduct(res); // Agora o viewProduct tem os dados frescos do banco
    setShowViewModal(true);
  } catch (error) {
    showErrorToast("Erro ao carregar detalhes para visualização.");
  } finally {
    setFormLoading(false);
  }
}, [listarId]);

  const handleDeleteClick = useCallback((product: Product) => {
    setDeleteProduct(product);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;
    try {
      await deletar(deleteProduct.id);
      showSuccessToast(`Produto "${deleteProduct.nome}" removido com sucesso.`);
      fetchProducts();
    } catch (error) {
      showErrorToast("Erro ao tentar remover o produto.");
    } finally {
      setShowDeleteDialog(false);
      setDeleteProduct(null);
    }
  };

  const handleSubmit = async () => {
    if (!productFormRef.current) return;

    const isValid = await productFormRef.current.trigger();
    if (!isValid) {
      showErrorToast("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const data = productFormRef.current.getValues();
    setFormLoading(true);

    try {
      if (isEditMode) {
        await editar(data);
        showSuccessToast(`Produto "${data.nome}" atualizado com sucesso!`);
      } else if (formMode === 'CONFIGURE_EXISTING') {
        await criar(data);
        showSuccessToast(`Produto "${data.nome}" configurado com sucesso na sua loja!`);
      } else {
        await criar(data);
        showSuccessToast(`Produto "${data.nome}" cadastrado com sucesso!`);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Erro ao guardar produto:", error);
      showErrorToast("Não foi possível concluir a operação do produto.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenStock = useCallback((product: Product, mode: 'adicionar' | 'baixar') => { 
    if (!product.controlaStock) { 
       showErrorToast("Este produto é de fluxo livre e não gere stock."); 
       return; 
    }
    setSelectedProductId(product.id);
    setStockMode(mode);
    setStockModalOpen(true);
  }, []);

  const handleStockSubmit = async () => {
    if (!stockFormRef.current) return;
    const isValid = await stockFormRef.current.trigger();
    if (!isValid) return;

    const data = stockFormRef.current.getValues() as StockConfirmPayload;
    setStockConfirmData(data);
    setStockConfirmOpen(true);
  };

  const handleConfirmStockUpdate = async () => {
    if (!stockConfirmData) return;
    setFormLoading(true);
    try {
      const stockPayload = stockConfirmData.distribuicaoStock.map(item => ({
        storeId: item.storeId ?? item.storeName,
        storeName: item.storeName,
        stock: item.stock,
        stockMin: item.stockMin,
        productId: item.productId
      }));

      await updateStock({
        acao: stockMode,
        distribuicaoStock: stockPayload
      });
      showSuccessToast("Stock atualizado com sucesso!");
      setStockModalOpen(false);
      setStockConfirmOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Erro ao guardar produto:", error);
      showErrorToast("Não foi possível concluir a operação do produto.");
    } finally {
      setFormLoading(false);
    }
  };

  // ====================================================
  // CONFIGURAÇÃO DA TABELA (TIPAGEM ESTRITA)
  // ====================================================

  type TableRow = Record<string, string | number | boolean | null | undefined>;

 const columns = useMemo(() => {
  // 1. Definimos todas as colunas possíveis
  const allColumns = [
    {
      key: "codigobarra" as keyof Product,
      label: "Código de Barras",
      sortable: true,
      render: (value: string | number | boolean | null | undefined) => (
        <span className="text-sm text-muted-foreground">{value}</span>
      ),
    },
    {
      key: "nome" as keyof Product,
      label: "Produto",
      sortable: true,
      render: (value: string | number | boolean | null | undefined) => (
        <div className="font-medium">{value}</div>
      ),
    },
    { 
      key: "categorys" as keyof Product, 
      label: "Categoria",
      sortable: false // Adicionado explicitamente para satisfazer o contrato do DataTable
    },
    {
      key: "precoUnitario" as keyof Product,
      label: "Preço",
      sortable: false, // Adicionado para evitar o erro de propriedade ausente
      render: (value: string | number | boolean | null | undefined) => (
        <span className="font-semibold">{value} </span>
      ),
    },
    {
      key: "stock" as keyof Product,
      label: "Stock",
      sortable: false, // Adicionado para evitar o erro de propriedade ausente
      render: (
        value: string | number | boolean | null | undefined,
        row: TableRow
      ) => {
        if (row.controlaStock === false) {
          return (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-none">
              <ShieldCheck size={10} className="mr-1" />
              LIVRE
            </Badge>
          );
        }

        const stock = Number(value) || 0;
        const stockMin = Number(row.stockMin) || 0;
        const isLow = stock <= stockMin;

        return (
          <div className="flex items-center gap-2">
            <Badge variant={isLow ? "destructive" : "secondary"}>
              {stock}
            </Badge>
            {isLow && (
              <AlertTriangle className="w-4 h-4 text-orange-500 animate-pulse" />
            )}
          </div>
        );
      },
    },
  ];

  // 2. ✅ FILTRAGEM: Se for visão global, removemos as colunas comerciais
  if (isGlobalView) {
    return allColumns.filter(col => col.key !== 'precoUnitario' && col.key !== 'stock');
  }

  return allColumns;
}, [isGlobalView]); 


  const actions = useMemo(() => {
    const list = [
      {
        label: "Visualizar",
        icon: Eye,
        onClick: (row: TableRow) => {
          setViewProduct(row as unknown as Product);
          setShowViewModal(true);
        },
        show: (_row: TableRow): boolean => true,
      },
      {
        label: "Editar",
        icon: Edit,
        onClick: (row: TableRow) => {
          void handleEdit(row as unknown as Product);
        },
        show: (_row: TableRow): boolean => isAdmin || isManager,
      },
      {
        label: "Aumentar Stock",
        icon: ArrowUpCircle,
        onClick: (row: TableRow) => {
          handleOpenStock(row as unknown as Product, "adicionar");
        },
        show: (_row: TableRow): boolean => !isGlobalView && (isAdmin || isManager),
      },
      {
        label: "Baixar Stock",
        icon: ArrowDownCircle,
        onClick: (row: TableRow) => {
          handleOpenStock(row as unknown as Product, "baixar");
        },
        show: (_row: TableRow): boolean => !isGlobalView && (isAdmin || isManager),
      },
      {
        label: "Eliminar",
        icon: Trash2,
        onClick: (row: TableRow) => {
          handleDeleteClick(row as unknown as Product);
        },
        show: (_row: TableRow): boolean =>  (isAdmin || isManager),
      },
      // ✅ NOVO: Ação de Foto - Apenas para Admin no modo Global
    {
      label: "Foto",
      icon: ImageIcon, // Use 'ImageIcon' do lucide ou 'Package'
      onClick: (row: TableRow) => {
        setProductForImage(row as unknown as Product);
        setImageModalOpen(true);
      },
      show: (_row: TableRow) => isGlobalView && isAdmin,
    },
    ];

    return list;
  }, [isAdmin, isManager, isGlobalView, handleEdit, handleOpenStock, handleDeleteClick]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
  <h1 className="text-2xl font-bold tracking-tight">
    {isGlobalView ? "Catálogo Central de Produtos" : "Gestão de Inventário"}
  </h1>
  <p className="text-muted-foreground text-sm">
    {isGlobalView 
      ? "Gestão das fichas técnicas e identidades globais do sistema." 
      : "Controle de quantidades, preços e alertas da unidade actual."}
  </p>
</div>
        
        <div className="flex gap-2">
          {(canCreateNormally || canCreateAsAdmin) && (
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          )}

          {canConfigureFromCatalog && (
            <Button
              onClick={handleOpenCatalog}
              variant="outline"
              className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Search className="w-4 h-4" />
              Adicionar Produto à Minha Loja
            </Button>
          )}
        </div>
      </div>

    {/* ✅ LÓGICA DE CARDS ADAPTATIVA */}
{!isGlobalView ? (
  /* VISÃO DE LOJA: Mostra todos os indicadores de stock */
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
      <CardContent className="pt-6 flex justify-between items-center">
        <div><p className="text-xs text-muted-foreground uppercase">Total na Unidade</p><h3 className="text-2xl font-bold">{summary.total}</h3></div>
        <Package className="h-8 w-8 text-blue-500" />
      </CardContent>
    </Card>

    <Card>
      <CardContent className="pt-6 flex justify-between items-center">
        <div><p className="text-xs text-muted-foreground uppercase">Stock Baixo</p><h3 className="text-2xl font-bold">{summary.stockBaixo}</h3></div>
        <AlertTriangle className="h-8 w-8 text-orange-500" />
      </CardContent>
    </Card>

    <Card>
      <CardContent className="pt-6 flex justify-between items-center">
        <div><p className="text-xs text-muted-foreground uppercase">Sem Stock</p><h3 className="text-2xl font-bold">{summary.semStock}</h3></div>
        <ArrowDownCircle className="h-8 w-8 text-red-500" />
      </CardContent>
    </Card>

    <Card>
      <CardContent className="pt-6 flex justify-between items-center">
        <div><p className="text-xs text-muted-foreground uppercase">Stock OK</p><h3 className="text-2xl font-bold">{summary.stockOk}</h3></div>
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </CardContent>
    </Card>
  </div>
) : (
  /* ✅ VISÃO GLOBAL: Mostra apenas o total de produtos cadastrados no catálogo */
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card className="bg-slate-50/50 border-dashed">
      <CardContent className="pt-6 flex justify-between items-center">
        <div>
          <p className="text-xs text-blue-600 font-bold uppercase">Total no Catálogo</p>
          <h3 className="text-2xl font-bold text-slate-800">{summary.total}</h3>
        </div>
        <Package className="h-8 w-8 text-blue-400" />
      </CardContent>
    </Card>
    
    {/* Espaço vazio ou mensagem informativa para manter o alinhamento do grid */}
    <div className="col-span-3 flex items-center px-6 text-slate-400 text-sm italic">
      <LayoutGrid size={16} className="mr-2" />
      Modo de Gestão Global: Consulte e edite as fichas técnicas dos produtos.
    </div>
  </div>
)}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>{products.length} produto(s) encontrado(s) no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="Pesquisar por nome ou código...."
            emptyMessage="Nenhum produto encontrado."
            paginated={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={formMode === "CONFIGURE_EXISTING" ? "Configurar Produto na Loja" : isEditMode ? "Editar Produto" : "Novo Produto"}
        description={formMode === "CONFIGURE_EXISTING" ? "Configure o preço e o stock deste produto para a sua loja." : isEditMode ? "Atualize as informações do produto selecionado." : "Preencha os dados para cadastrar um novo produto no sistema."}
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
        size="lg"
      >
        <ProductForm 
          ref={productFormRef}
          initialData={currentProduct}
          isLoading={formLoading}
          isEditMode={isEditMode}
          mode={formMode}
        />
      </ModalForm>

      <CatalogSelectorModal
        isOpen={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        onSelect={handleSelectFromCatalog}
        existingProductIds={products.map((product) => product.id)}
      />

      <ModalForm 
  open={stockModalOpen} 
  onClose={() => setModalOpen(false)} 
  title={stockMode === 'adicionar' ? "Entrada" : "Baixa"} 
  onSubmit={handleStockSubmit} 
  loading={formLoading} 
  isEditMode={false} 
  submitText="Confirmar"
>
  {selectedProductId && (
    <StockForm 
      ref={stockFormRef} 
      productId={selectedProductId} 
      mode={stockMode} 
      productName={products.find(p => p.id === selectedProductId)?.nome} 
      // ✅ PASSA O STOCK ACTUAL DA LISTA
      currentStock={products.find(p => p.id === selectedProductId)?.stock || 0} 
      isLoading={formLoading} 
    />
  )}
</ModalForm>

<ModalForm
  open={imageModalOpen}
  onClose={closeImageModal}
  title="Actualizar Imagem do Catálogo"
  description={`Alterar foto de: ${productForImage?.nome}`}
  onSubmit={handleUpdateImage}
  loading={formLoading}
  submitText="Confirmar Alteração"
>
  <div className="grid grid-cols-2 gap-6 py-4">
    
    {/* Lado Esquerdo: Imagem Actual */}
    <div className="flex flex-col items-center gap-2">
      <Label className="text-[10px] font-black uppercase text-slate-400">Imagem Actual</Label>
      <div className="w-full aspect-square rounded-2xl border bg-slate-50 flex items-center justify-center overflow-hidden">
        {productForImage?.logoUrl ? (
          <img src={productForImage.logoUrl} alt="Actual" className="w-full h-full object-cover" />
        ) : (
          <Package className="w-10 h-10 text-slate-200" />
        )}
      </div>
    </div>

    {/* Lado Direito: Nova Pré-visualização */}
    <div className="flex flex-col items-center gap-2">
      <Label  className="text-[10px] font-black uppercase text-blue-500">Nova Imagem</Label>
      <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 flex items-center justify-center overflow-hidden relative hover:border-blue-400 transition-colors cursor-pointer">
        {previewUrl ? (
          <img src={previewUrl} alt="Nova" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-blue-400">
            <Plus className="w-8 h-8 mb-1" />
            <span className="text-[9px] font-bold">Seleccionar</span>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
        />
      </div>
    </div>

  </div>
  
  <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
    <Info  size={14} className="text-blue-500" />
    <p className="text-[10px] text-slate-500 leading-tight">
      A nova imagem substituirá a anterior em todas as unidades do sistema. Formatos suportados: JPG, PNG. Máx 1MB.
    </p>
  </div>
</ModalForm>

      <AlertDialog open={stockConfirmOpen} onOpenChange={setStockConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Confirmar Operação</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>Tem a certeza que deseja <strong>{stockMode === 'adicionar' ? 'aumentar' : 'baixar'}</strong> o stock nas seguintes lojas:</p>
              <div className="bg-muted p-3 rounded-md space-y-1">
                {stockConfirmData?.distribuicaoStock?.map((item: StockDTO, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium">• {item.storeName}</span>
                    <span>{item.stock} unidade(s)</span>
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStockUpdate} className="bg-green-600 hover:bg-green-700">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

     {viewProduct && (
  <GenericViewModal
    open={showViewModal}
    onClose={() => setShowViewModal(false)}
    title="Detalhes do Produto"
    description={isGlobalView ? "Ficha Técnica Central" : `Informações de stock na unidade: ${user?.loja}`}
    image={viewProduct.logoUrl || undefined} 
    fields={[
      { label: "Código de Barras", value: String(viewProduct.codigobarra || "VAZIO") },
      { label: "Nome", value: String(viewProduct.nome || "VAZIO") },
      
      // ✅ INJECÇÃO CONDICIONAL: Só mostra Preço e Stock se NÃO for Visão Global
      ...(!isGlobalView ? [
        { label: "Preço Unitário", value: `${viewProduct.precoUnitario} db` },
        { label: "Stock Atual", value: String(viewProduct.stock) },
        { label: "Stock Mínimo", value: String(viewProduct.stockMin) },
      ] : []),

      { label: "Categoria", value: String(viewProduct.categorys || "VAZIO") },
      { label: "Fornecedor", value: String(viewProduct.suppliers || "VAZIO") },
      { label: "Imposto", value: String(viewProduct.taxs || "VAZIO") },
      { label: "Descrição", value: viewProduct.descricao || "Sem descrição" },
      { label: "Data de Registo", value: String(viewProduct.datacriacao || "VAZIO") },
    ]}
  />
)}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja remover o produto <strong>{deleteProduct?.nome}</strong>? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;