/**
 * ====================================================
 * CLIENTES PAGE - PÁGINA DE GESTÃO DE CLIENTES
 * ====================================================
 * 
 * Esta página permite a visualização, criação, edição e remoção de clientes.
 * Segue o modelo de implementação do módulo ShopsPage.
 * Implementa funcionalidades de pesquisa, paginação e visualização detalhada.
 */

// Importações do React e hooks essenciais
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// Importação de ícones da biblioteca Lucide React
import { Plus, Edit, Trash2, Users, /*CheckCircle2, XCircle, TrendingUp,*/ Eye } from 'lucide-react';

// Componentes da UI (Shadcn/UI) para estruturar a página
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Botões e Badges da UI
import { Button } from '@/components/ui/button';


// Componentes de Diálogo para confirmação de exclusão
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

// Componentes Reutilizáveis do Projeto para Tabela e Formulários em Modal
import DataTable from '@/components/common/DataTable';
import ModalForm from '@/components/forms/ModalForm';
// Componente para visualização detalhada de dados de forma genérica
import GenericViewModal from '@/components/forms/GenericViewModal';
// Utilitários para exibição de notificações (toasts)
import { showSuccessToast, showErrorToast } from '@/utils/toast';

// Serviço e componentes específicos do módulo de Clientes
import { useCustomerService, Customer, CustomerFormData } from './CustomerService';
import CustomerForm, { CustomerFormRef } from './CustomerForm';

/**
 * Componente Principal da Página de Clientes.
 */
const CustomerPage: React.FC = () => {

  // ====================================================
  // ESTADOS (STATE)
  // ====================================================

  // Lista de clientes carregada da API
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Estado de carregamento da lista de clientes
  const [loading, setLoading] = useState(true);

  // Controla se o modal de formulário (criação/edição) está aberto
  const [modalOpen, setModalOpen] = useState(false);
  // Define se o modal está em modo de edição (true) ou criação (false)
  const [isEditMode, setIsEditMode] = useState(false);
  // Estado de carregamento durante o envio do formulário
  const [formLoading, setFormLoading] = useState(false);

  // Dados atuais do cliente que está a ser criado ou editado
  const [currentCustomer, setCurrentCustomer] = useState<CustomerFormData>({
    id: undefined,
    nome: '',
    numeroContribuinte: '',
    email: '',
    contactoPrincipal: '',
    contactoSecudario: '',
    location: null
  });

  // Cliente selecionado para visualização detalhada
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  // Controla a abertura do modal de visualização
  const [showViewModal, setShowViewModal] = useState(false);

  // Cliente selecionado para ser removido
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  // Controla a abertura do diálogo de confirmação de exclusão
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Referência para aceder aos métodos do componente CustomerForm (ex: trigger, getValues)
  const formRef = useRef<CustomerFormRef>(null);

  // Hook do serviço de API para as operações de CRUD
  const { listar, criar, editar, deletar } = useCustomerService();

  // ====================================================
  // CARREGAMENTO DE DADOS (FETCH)
  // ====================================================

  /**
   * Função para carregar a lista de clientes da API.
   */
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setCustomers(data);
    } catch (error) {
      showErrorToast('Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hook de efeito que dispara o carregamento de dados ao montar o componente.
   */
  useEffect(() => {
    fetchCustomers();
  }, []);

  // ====================================================
  // CÁLCULOS DE RESUMO (SUMMARY)
  // ====================================================

  /**
   * Memoização dos cálculos estatísticos para evitar re-processamento desnecessário.
   */
  const summary = useMemo(() => {
    const total = customers.length;
    const ativos = customers.filter(c => c.ativo).length;
    const inativos = total - ativos;
    const faturamentoTotal = customers.reduce((acc, curr) => acc + (curr.faturamentoTotal || 0), 0);

    return { total, ativos, inativos, faturamentoTotal };
  }, [customers]);

  // ====================================================
  // AÇÕES (HANDLERS)
  // ====================================================

  /**
   * Prepara a interface para a criação de um novo cliente.
   */
  const handleCreate = () => {
    setCurrentCustomer({
      id: undefined,
      nome: '',
      numeroContribuinte: '',
      email: '',
      contactoPrincipal: '',
      contactoSecudario: '',
      location: null
    });
    setIsEditMode(false);
    setModalOpen(true);
  };

  /**
   * Prepara a interface para a edição de um cliente existente.
   */
  const handleEdit = useCallback((customer: Customer) => {

     const locationData = customer.idLocations 
    ? { id: customer.idLocations, nome: customer.nomeLocations || '' } 
    : null;
    setCurrentCustomer({
      id: customer.id,
      nome: customer.nome,
      numeroContribuinte: customer.numeroContribuinte,
      email: customer.email,
      contactoPrincipal: customer.contactoPrincipal,
      contactoSecudario: customer.contactoSecudario,
      location: locationData
    });
    setIsEditMode(true);
    setModalOpen(true);
  }, []);

  /**
   * Abre o modal de visualização detalhada para o cliente selecionado.
   */
  const handleViewClick = useCallback((customer: Customer) => {
    setViewCustomer(customer);
    setShowViewModal(true);
  }, []);

  /**
   * Abre o diálogo de confirmação para a exclusão de um cliente.
   */
  const handleDeleteClick = useCallback((customer: Customer) => {
    setDeleteCustomer(customer);
    setShowDeleteDialog(true);
  }, []);

  /**
   * Executa a remoção efetiva do cliente após confirmação do utilizador.
   */
  const handleDeleteConfirm = async () => {
    if (!deleteCustomer?.id) return;
    try {
      await deletar(deleteCustomer.id);
      showSuccessToast('Cliente removido com sucesso!');
      fetchCustomers();
    } catch (error) {
      showErrorToast('Erro ao remover cliente.');
    } finally {
      setShowDeleteDialog(false);
      setDeleteCustomer(null);
    }
  };

  /**
   * Submete os dados do formulário para criação ou atualização de cliente.
   */
  const handleSubmit = async () => {
    if (!formRef.current) return;

    const isValid = await formRef.current.trigger();
    if (!isValid) {
      showErrorToast('Por favor, corrija os erros no formulário.');
      return;
    }

    const data = formRef.current.getValues();
    setFormLoading(true);
    try {
      if (isEditMode && data.id) {
        await editar(data);
        showSuccessToast(`Cliente "${data.nome}" atualizado com sucesso!`);
      } else {
        await criar(data);
        showSuccessToast(`Cliente "${data.nome}" criado com sucesso!`);
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (error) {
      showErrorToast('Erro ao salvar cliente.');
    } finally {
      setFormLoading(false);
    }
  };

 const columns = useMemo(() => [
  {
    key: 'nome' as keyof Customer,
    label: 'Cliente',
    sortable: true,
    render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value}</div>
  },
  {
    key: 'numeroContribuinte' as keyof Customer,
    label: 'NIF/Contribuinte',
    render: (value: string | number | boolean | null | undefined) => <div>{value || '-'}</div>
  },
  {
    key: 'email' as keyof Customer,
    label: 'Email',
    render: (value: string | number | boolean | null | undefined) => <div>{value || '-'}</div>
  },
  {
    key: 'contactoPrincipal' as keyof Customer,
    label: 'Contacto',
    render: (value: string | number | boolean | null | undefined) => <div>{value || '-'}</div>
  },
  {
    key: 'nomeLocations' as keyof Customer,
    label: 'Localidade',
    sortable: true,
    render: (value: string | number | boolean | null | undefined) => <div>{value || '-'}</div>
  },

 
], []);
  const actions = useMemo(() => [
    
 {
      label: 'Visualizar',
      icon: Eye,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleViewClick(row as unknown as Customer)
    },

   {
         label: 'Editar',
         icon: Edit,
         onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleEdit(row as unknown as Customer)
    },
    {
         label: 'Excluir',
         icon: Trash2,
         variant: 'destructive' as const,
         onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleDeleteClick(row as unknown as Customer)
       }
  ], [handleViewClick, handleEdit, handleDeleteClick]);

  // ====================================================
  // RENDERIZAÇÃO (JSX)
  // ====================================================

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" /> Clientes
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <h3 className="text-2xl font-bold">{summary.total}</h3>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
{ /* Uso posterior */ }
{/*

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <h3 className="text-2xl font-bold text-green-600">{summary.ativos}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Inativos</p>
                <h3 className="text-2xl font-bold text-red-600">{summary.inativos}</h3>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento Total</p>
                <h3 className="text-2xl font-bold">€ {summary.faturamentoTotal.toFixed(2).replace(".", ",")}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        */}
      </div>

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Gestão completa de clientes e histórico financeiro.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
          data={customers as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="Pesquisar por nome, contribuinte, email..."
            emptyMessage="Nenhum cliente encontrado."
            paginated
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
        description="Insira as informações do cliente nos campos abaixo."
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
      >
        <CustomerForm
          ref={formRef}
         setData={setCurrentCustomer}
          initialData={currentCustomer}
          isLoading={formLoading}
        />
      </ModalForm>

      {/* Modal de Visualização */}
      {viewCustomer && (
        <GenericViewModal
          open={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Detalhes do Cliente"
          fields={[
            { label: 'Nome Completo', value: viewCustomer.nome },
            { label: 'NIF / Contribuinte', value: viewCustomer.numeroContribuinte },
            { label: 'Email', value: viewCustomer.email },
            { label: 'Contacto Principal', value: viewCustomer.contactoPrincipal },
            { label: 'Contacto Secundário', value: viewCustomer.contactoSecudario },
            { label: 'Localidade', value: viewCustomer.nomeLocations },
            { label: 'Estado', value: viewCustomer.ativo ? 'Ativo' : 'Inativo' },
            { label: 'Faturamento Total', value: `€ ${viewCustomer.faturamentoTotal?.toFixed(2).replace(".", ",")}` }
          ]}
        />
      )}

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o cliente "{deleteCustomer?.nome}"? Esta ação é permanente e não poderá ser desfeita.
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

// Exportação da página de clientes para uso no roteamento da aplicação
export default CustomerPage;