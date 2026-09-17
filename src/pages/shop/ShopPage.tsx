/**
 * ====================================================
 * SHOP PAGE - PÁGINA DE GESTÃO DE LOJAS
 * ====================================================
 * 
 * Esta página permite a visualização, criação, edição e remoção de lojas.
 * Implementa funcionalidades de pesquisa e paginação utilizando componentes reutilizáveis.
 * 
 * CORREÇÕES REALIZADAS:
 * - Resolvido erro de sintaxe no estado 'currentShop' (falta de vírgula).
 * - Ajustada a tipagem e passagem de props para o componente ShopForm.
 * - Padronização com o módulo Location.
 * - Removidos os tipos 'any' para cumprir a regra @typescript-eslint/no-explicit-any.
 * - Ajustada a tipagem para compatibilidade com o componente genérico DataTable.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Store, Image as ImageIcon, Eye, Badge, AlertCircle, Loader2, X } from 'lucide-react';

// Componentes da UI (Shadcn/UI)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Componentes de Diálogo
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

// Componentes Reutilizáveis do Projeto
import DataTable from '@/components/common/DataTable';
import ModalForm from '@/components/forms/ModalForm';
import GenericViewModal from '@/components/forms/GenericViewModal';
import { Input } from '@/components/ui/input';

// Utilitários
import { showSuccessToast, showErrorToast } from '@/utils/toast';

// Serviço e Componentes do Módulo Shop
import { useShopService, Shop, ShopFormData } from './ShopService';
import ShopForm, { ShopFormRef } from './ShopForm';

const ShopsPage: React.FC = () => {

  // ====================================================
  // ESTADOS (STATE)
  // ====================================================

  const [shops, setShops] = useState<Shop[]>([]); // Lista de lojas
  const [loading, setLoading] = useState(true); // Estado de carregamento da lista

  const [modalOpen, setModalOpen] = useState(false); // Controla abertura do modal
  const [isEditMode, setIsEditMode] = useState(false); // Define se é edição ou criação
  const [formLoading, setFormLoading] = useState(false); // Estado de carregamento do envio do form

  // Estado para os dados atuais do formulário
  const [currentShop, setCurrentShop] = useState<ShopFormData>({
    nome: '',
    email: '',
    contacto: '',
    numeroContribuite: '',
    caixaPostal: undefined,
    location: null,
    shopType: 'LOJA',
    logo: null,
  });

  const [deleteShop, setDeleteShop] = useState<Shop | null>(null); // Loja selecionada para exclusão
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Controla o diálogo de confirmação

  // Estados para Alterar Logo
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [selectedShopForLogo, setSelectedShopForLogo] = useState<Shop | null>(null);
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
 // Estados para Visualização (GenericViewModal)
  const [viewShop, setViewShop] = useState<Shop | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const formRef = useRef<ShopFormRef>(null); // Referência para acessar métodos do formulário (trigger, getValues)

  const { listar, criar, editar, deletar, alterarLogo } = useShopService(); // Hook do serviço de API

  // ====================================================
  // CARREGAR LOJAS (FETCH)
  // ====================================================

  /**
   * Função para carregar todas as lojas da API
   */
  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setShops(data);
    } catch (error) {
      showErrorToast('Erro ao carregar lojas.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    fetchShops();
  }, []);


  // ====================================================
  // AÇÕES (HANDLERS)
  // ====================================================

  /**
   * Prepara o estado para criação de uma nova loja
   */
  const handleCreate = () => {
    setCurrentShop({
      nome: '',
      email: '',
      contacto: '',
      numeroContribuite: '',
      caixaPostal: undefined,
      location: null,
      shopType: 'LOJA',
      logo: null,
    });
    setIsEditMode(false);
    setModalOpen(true);
  };

  /**
   * Prepara o estado para edição de uma loja existente
   */
 const handleEdit = useCallback((shop: Shop) => {
  // Reconstruímos o objeto location usando idlocation e nomelocation
  const locationData = shop.idlocation 
    ? { id: shop.idlocation, nome: shop.nomelocation || '' } 
    : null;

  setCurrentShop({
    id: shop.id,
    nome: shop.nome,
    email: shop.email ?? '',
    contacto: shop.contacto ?? '',
    numeroContribuite: shop.numeroContribuite ?? '',
    caixaPostal: shop.caixaPostal ?? undefined,
    // Aqui está o segredo: passamos o objeto montado
    location: locationData, 
    // Corrigimos também o shopType que na API parece vir como 'shopTypes'
   shopType: shop.shopType ?? 'LOJA',


    });
  
  setIsEditMode(true);
  setModalOpen(true);
}, []);
  /**
   * Fecha o modal e limpa estados temporários
   */
  const handleCloseModal = () => {
    setModalOpen(false);
  };
/**
   * Prepara o estado para alterar apenas o logo
   */
  const handleLogoChangeClick = useCallback((shop: Shop) => {
    setSelectedShopForLogo(shop);
    setNewLogo(null);
    setLogoPreview(null);
    setSizeError(false);
    setIsProcessing(false);
    setUploadProgress(0);
    setLogoModalOpen(true);
  }, []);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const handleLogoFileChange = useCallback((file: File | null) => {
    if (!file) {
      setNewLogo(null);
      setLogoPreview(null);
      setUploadProgress(0);
      setSizeError(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSizeError(true);
      setLogoPreview(null);
      setUploadProgress(0);
      setNewLogo(null);
      showErrorToast('Ficheiro demasiado grande! O limite para o logótipo é de 1MB.');
      return;
    }

    setSizeError(false);
    setIsProcessing(true);
    setUploadProgress(0);
    setNewLogo(null);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    reader.onloadend = () => {
      setLogoPreview(URL.createObjectURL(file));
      setNewLogo(file);
      setUploadProgress(100);
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

/**
   * Prepara o estado para visualização detalhada
   */
  const handleViewClick = useCallback((shop: Shop) => {
    setViewShop(shop);
    setShowViewModal(true);
  }, []);

  // ====================================================
// CÁLCULOS DE RESUMO (SUMMARY)
// ====================================================
const summary = useMemo(() => {
  const total = shops.length;

  // Com email
  const withEmail = shops.filter(
    s => s.email && s.email.trim() !== ''
  ).length;

  // Com contacto
  const withContact = shops.filter(
    s => s.contacto && s.contacto.trim() !== ''
  ).length;

  // Com localidade
  const withLocation = shops.filter(
    s => s.location || s.nomelocation
  ).length;

  // Sem localidade
  const withoutLocation = total - withLocation;

  return {
    total,
    withEmail,
    withContact,
    withLocation,
    withoutLocation
  };
}, [shops]);

  /**
   * Abre o diálogo de confirmação de exclusão
   */
  const handleDeleteClick = useCallback((shop: Shop) => {
    setDeleteShop(shop);
    setShowDeleteDialog(true);
  }, []);

  /**
   * Executa a exclusão efetiva da loja
   */
  const handleDeleteConfirm = async () => {
    if (!deleteShop || !deleteShop.id) return;

    try {
      await deletar(deleteShop.id);
      showSuccessToast('Loja excluída com sucesso!');
      fetchShops();
    } catch (error) {
      showErrorToast('Erro ao excluir loja.');
    } finally {
      setShowDeleteDialog(false);
      setDeleteShop(null);
    }
  };

  /**
   * Submete o formulário (Criação ou Edição)
   */
  const handleSubmit = async () => {
    if (!formRef.current) return;

    // Dispara a validação do React Hook Form via Ref
    const isValid = await formRef.current.trigger();

    if (!isValid) {
      showErrorToast('Por favor, corrija os erros no formulário.');
      return;
    }

    // Obtém os valores validados
    const data = formRef.current.getValues();
    setFormLoading(true);

    try {
      if (isEditMode && data.id) {
        await editar(data);
        showSuccessToast(`Loja "${data.nome}" actualizada com sucesso!`);
      } else {
        await criar(data);
        showSuccessToast(`Loja "${data.nome}" criada com sucesso!`);
      }

      setModalOpen(false);
      fetchShops();
    } catch (error) {
      showErrorToast('Erro ao salvar loja.');
    } finally {
      setFormLoading(false);
    }
  };

/**
   * Submete a alteração do logotipo
   */
  const handleLogoSubmit = async () => {
    if (!selectedShopForLogo || !newLogo) {
      showErrorToast('Por favor, selecione uma imagem.');
      return;
    }

    setFormLoading(true);
    try {
      await alterarLogo(selectedShopForLogo.id, newLogo);
      showSuccessToast('Logotipo atualizado com sucesso!');
      setLogoModalOpen(false);
      fetchShops();
    } catch (error) {
      // Erro já tratado no serviço
    } finally {
      setFormLoading(false);
    }
  };

  // ====================================================
  // CONFIGURAÇÃO DA TABELA (COLUNAS E AÇÕES)
  // ====================================================

  const columns = useMemo(() => [
    {
      key: 'nome' as keyof Shop,
      label: 'Nome',
      sortable: true,
      render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value}</div>
    },
    {
      key: 'email' as keyof Shop,
      label: 'Email'
    },
    {
      key: 'contacto' as keyof Shop,
      label: 'Contacto'
    },
    {
      key: 'shopTypes' as keyof Shop,
      label: 'Tipo',
      render: (value: string | number | boolean | null | undefined) => (
        // Mostra um badge azul para Gráfica e cinza para o resto
        <Badge fontVariant={value === 'GRAFICA' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'nomelocation' as keyof Shop,
      label: 'Localidade',
      render: (value: string | number | boolean | null | undefined, row: Record<string, string | number | boolean | null | undefined>) => {
        const shopRow = row as unknown as Shop;
        return shopRow.location?.nome || value || 'N/A';
      }
    }
  ], []);

  const actions = useMemo(() => [
    {
      label: 'Visualizar',
      icon: Eye,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleViewClick(row as unknown as Shop)
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleEdit(row as unknown as Shop)
    },
    {
      label: 'Alterar Logo',
      icon: ImageIcon,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleLogoChangeClick(row as unknown as Shop)
    },
    {
      label: 'Excluir',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleDeleteClick(row as unknown as Shop)
    }
], [handleEdit, handleLogoChangeClick, handleDeleteClick]);

  // ====================================================
  // RENDERIZAÇÃO (JSX)
  // ====================================================

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="h-8 w-8" />
          Lojas
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Loja
        </Button>
      </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

  {/* Total */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Total de Lojas</p>
          <h3 className="text-2xl font-bold">{summary.total}</h3>
        </div>
        <Store className="h-6 w-6 text-primary" />
      </div>
    </CardContent>
  </Card>

  {/* Com Email */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Com Email</p>
          <h3 className="text-2xl font-bold">{summary.withEmail}</h3>
        </div>
        <Store className="h-6 w-6 text-blue-600" />
      </div>
    </CardContent>
  </Card>

  {/* Com Contacto */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Com Contacto</p>
          <h3 className="text-2xl font-bold">{summary.withContact}</h3>
        </div>
        <Store className="h-6 w-6 text-green-600" />
      </div>
    </CardContent>
  </Card>

  {/* Com Localidade */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Com Localidade</p>
          <h3 className="text-2xl font-bold">{summary.withLocation}</h3>
        </div>
        <Store className="h-6 w-6 text-purple-600" />
      </div>
    </CardContent>
  </Card>

</div>
      {/* Lista de Lojas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Lojas</CardTitle>
          <CardDescription>
            {shops.length} loja(s) encontrada(s) no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={shops as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="Buscar lojas..."
            emptyMessage="Nenhuma loja encontrada."
            paginated={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <ModalForm
        open={modalOpen}
        size='lg'
        onClose={handleCloseModal}
        title={isEditMode ? 'Editar Loja' : 'Nova Loja'}
        description="Preencha as informações detalhadas da loja abaixo."
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
      >
        <ShopForm
          ref={formRef}
          initialData={currentShop}
          setData={setCurrentShop}
          isLoading={formLoading}
          isEditMode={isEditMode}
        />
      </ModalForm>
 {/* Modal de Alterar Logo */}
      <ModalForm
        open={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        title="Alterar Logotipo"
        description={`Selecione um novo logotipo para a loja: ${selectedShopForLogo?.nome}`}
        onSubmit={handleLogoSubmit}
        loading={formLoading}
        isEditMode={true}
      >
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 ${sizeError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-6">
              <div className="relative group w-24 h-24 flex-shrink-0">
                <div className={`w-full h-full rounded-2xl overflow-hidden border-2 shadow-md flex items-center justify-center ${sizeError ? 'bg-red-100 border-red-300' : 'bg-white border-white'}`}>
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : sizeError ? (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  ) : logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                {logoPreview && !isProcessing && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setNewLogo(null);
                      setUploadProgress(0);
                      setSizeError(false);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className={`text-[10px] font-black uppercase ${sizeError ? 'text-red-600' : 'text-slate-400'}`}>
                  Logótipo (Máx 1MB)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null)}
                  disabled={formLoading || isProcessing}
                  className="h-10 bg-white text-xs"
                />

                {sizeError ? (
                  <p className="text-[10px] text-red-600 font-bold uppercase animate-pulse italic">
                    ❌ Ficheiro excede 1MB. Por favor, escolha outro.
                  </p>
                ) : (isProcessing || uploadProgress > 0) && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase">
                      <span className={uploadProgress === 100 ? 'text-emerald-600' : 'text-blue-600'}>
                        {uploadProgress === 100 ? '✓ OK' : 'A preparar...'}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${uploadProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalForm>
       {/* Modal de Visualização de Detalhes */}
      {viewShop && (
        <GenericViewModal
          open={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Detalhes da Loja"
          description={`Informações detalhadas da loja: ${viewShop.nome}`}
          image={typeof viewShop.logo === 'string' ? viewShop.logo : viewShop.logoUrl}
          fields={[
            { label: 'Nome', value: viewShop.nome },
            { label: 'NIF / Contribuinte', value: viewShop.numeroContribuite },
            { label: 'Email', value: viewShop.email },
            { label: 'Contacto', value: viewShop.contacto },
            { label: 'Caixa Postal', value: viewShop.caixaPostal },
            { label: 'Tipo', value: viewShop.shopType },
            { label: 'Localidade', value: viewShop.location?.nome || viewShop.nomelocation },
          ]}
        />
      )}
      {/* Diálogo de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a loja "{deleteShop?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={formLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShopsPage;
