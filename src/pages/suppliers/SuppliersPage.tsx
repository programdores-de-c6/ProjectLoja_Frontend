/**
 * ====================================================
 * SUPPLIERS PAGE - PÁGINA DE GESTÃO DE FORNECEDORES
 * ====================================================
 * 
 * Esta página permite a visualização, criação, edição e remoção de fornecedores.
 * Segue o modelo de implementação do módulo CustomerPage.
 * Implementa funcionalidades de pesquisa, paginação e visualização detalhada.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Truck, Eye } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

import DataTable from '@/components/common/DataTable';
import ModalForm from '@/components/forms/ModalForm';
import GenericViewModal from '@/components/forms/GenericViewModal';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

import { useSupplierService, Supplier, SupplierFormData } from './SuppliersService';
import SupplierForm, { SupplierFormRef } from './SuppliersForm';

const SuppliersPage: React.FC = () => {

  // ====================================================
  // ESTADOS (STATE)
  // ====================================================

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [currentSupplier, setCurrentSupplier] = useState<SupplierFormData>({
    id: undefined,
    nome: '',
    numeroContribuite: '',
    email: '',
    contactoPrincipal: '',
    contactoSecudario: '',
    country: null,
  });

  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formRef = useRef<SupplierFormRef>(null);

  const { listar, criar, editar, deletar } = useSupplierService();

  // ====================================================
  // CARREGAMENTO DE DADOS (FETCH)
  // ====================================================

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSuppliers(data);
    } catch (error) {
      showErrorToast('Erro ao carregar fornecedores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);


// ====================================================
// CÁLCULOS DE RESUMO (SUMMARY)
// ====================================================
const supplierSummary = useMemo(() => {
  const total = suppliers.length;

  // Com email
  const withEmail = suppliers.filter(
    s => s.email && s.email.trim() !== ''
  ).length;

  // Com contacto principal
  const withPrimaryContact = suppliers.filter(
    s => s.contactoPrincipal && s.contactoPrincipal.trim() !== ''
  ).length;

  // Com país definido
  const withCountry = suppliers.filter(
    s =>  s.nomepais
  ).length;

  return {
    total,
    withEmail,
    withPrimaryContact,
    withCountry
  };
}, [suppliers]);

  // ====================================================
  // AÇÕES (HANDLERS)
  // ====================================================

  const handleCreate = () => {
    setCurrentSupplier({
      id: undefined,
      nome: '',
      numeroContribuite: '',
      email: '',
      contactoPrincipal: '',
      contactoSecudario: '',
      country: null
    });
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = useCallback((supplier: Supplier) => {
    const countryData = supplier.idpais 
      ? { id: supplier.idpais, nome: supplier.nomepais || '' } 
      : null;

    setCurrentSupplier({
      id: supplier.id,
      nome: supplier.nome,
      numeroContribuite: supplier.numeroContribuite,
      email: supplier.email,
      contactoPrincipal: supplier.contactoPrincipal,
      contactoSecudario: supplier.contactoSecudario,
      country: countryData
    });
    setIsEditMode(true);
    setModalOpen(true);
  }, []);

  const handleViewClick = useCallback((supplier: Supplier) => {
    setViewSupplier(supplier);
    setShowViewModal(true);
  }, []);

  const handleDeleteClick = useCallback((supplier: Supplier) => {
    setDeleteSupplier(supplier);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteSupplier?.id) return;
    try {
      await deletar(deleteSupplier.id);
      showSuccessToast('Fornecedor removido com sucesso!');
      fetchSuppliers();
    } catch (error) {
      showErrorToast('Erro ao remover fornecedor.');
    } finally {
      setShowDeleteDialog(false);
      setDeleteSupplier(null);
    }
  };

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
        showSuccessToast(`Fornecedor "${data.nome}" atualizado com sucesso!`);
      } else {
        await criar(data);
        showSuccessToast(`Fornecedor "${data.nome}" criado com sucesso!`);
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      showErrorToast('Erro ao salvar fornecedor.');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'nome' as keyof Supplier,
      label: 'Fornecedor',
      sortable: true,
render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value}</div>
    },
    {
      key: 'numeroContribuite' as keyof Supplier,
      label: 'Contribuinte',
      render: (value: string | number | boolean | null | undefined) => <div>{value || '-'}</div>
    },
    {
      key: 'email' as keyof Supplier,
      label: 'Email',
      render: (value: string | number | boolean | null | undefined) => <div>{value || '-'}</div>
    },
    {
      key: 'contactoPrincipal' as keyof Supplier,
      label: 'Contacto',
      render: (value: string | number | boolean | null | undefined) => <div>{value || '-'}</div>
    },
    {
      key: 'nomepais' as keyof Supplier,
      label: 'País',
      sortable: true,
      render: (value: string | number | boolean | null | undefined) => <div>{value || '-'}</div>
    },
  ], []);

  const actions = useMemo(() => [
    {
      label: 'Visualizar',
      icon: Eye,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleViewClick(row as unknown as Supplier)
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleEdit(row as unknown as Supplier)
    },
    {
      label: 'Excluir',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleDeleteClick(row as unknown as Supplier)
    }
  ], [handleViewClick, handleEdit, handleDeleteClick]);

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8" /> Fornecedores
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">

  {/* Total */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Total de Fornecedores</p>
          <h3 className="text-2xl font-bold">{supplierSummary.total}</h3>
        </div>
        <Truck className="h-6 w-6 text-primary" />
      </div>
    </CardContent>
  </Card>

  {/* Com Email */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Com Email</p>
          <h3 className="text-2xl font-bold">{supplierSummary.withEmail}</h3>
        </div>
        <Truck className="h-6 w-6 text-blue-600" />
      </div>
    </CardContent>
  </Card>

  {/* Com Contacto Principal */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Com Contacto Principal</p>
          <h3 className="text-2xl font-bold">{supplierSummary.withPrimaryContact}</h3>
        </div>
        <Truck className="h-6 w-6 text-green-600" />
      </div>
    </CardContent>
  </Card>

  {/* Com País */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Com País</p>
          <h3 className="text-2xl font-bold">{supplierSummary.withCountry}</h3>
        </div>
        <Truck className="h-6 w-6 text-purple-600" />
      </div>
    </CardContent>
  </Card>

</div>
        {/* Tabela de Fornecedores */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Fornecedor</CardTitle>
                <CardDescription>Gestão completa de Fornecedor e histórico financeiro.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                data={suppliers as unknown as Record<string, string | number | boolean | null | undefined>[]}
                  columns={columns}
                  actions={actions}
                  loading={loading}
                  searchable
                  searchPlaceholder="Pesquisar fornecedores...."
                  emptyMessage="Nenhum fornecedor encontrado."
                  paginated
                  pageSize={10}
                />
              </CardContent>
            </Card>
      

      {/* Modal de Formulário (Criar/Editar) */}
      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        description={isEditMode ? 'Atualize os dados do fornecedor.' : 'Preencha os dados para cadastrar um novo fornecedor.'}
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
      >
        <SupplierForm
          ref={formRef}
          initialData={currentSupplier}
          isLoading={formLoading}
        />
      </ModalForm>

      {/* Modal de Visualização */}
      {viewSupplier && (
        <GenericViewModal
          open={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Detalhes do Fornecedor"
          fields={[
            { label: 'Nome', value: viewSupplier.nome },
            { label: 'Contribuinte', value: viewSupplier.numeroContribuite },
            { label: 'Email', value: viewSupplier.email },
            { label: 'Contacto Principal', value: viewSupplier.contactoPrincipal },
            { label: 'Contacto Secundário', value: viewSupplier.contactoSecudario || '-' },
            { label: 'País', value: viewSupplier.nomepais || '-' },
          ]}
        />
      )}

      {/* Diálogo de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá remover permanentemente o fornecedor
              <span className="font-bold"> {deleteSupplier?.nome}</span> do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuppliersPage;
