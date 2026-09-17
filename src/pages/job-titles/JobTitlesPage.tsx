/**
 * ====================================================
 * JOB TITLES PAGE - PÁGINA DE GESTÃO DE CARGOS
 * ====================================================
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';

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

// Componentes Reutilizáveis
import DataTable from '@/components/common/DataTable';
import ModalForm from '@/components/forms/ModalForm';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

// Serviço e tipos
import { useJobTitlesService, JobTitle, JobTitlesFormData } from './JobTitlesService';
import JobTitleForm, { JobTitleFormRef } from './JobTitlesForm';

// Enum de acesso para select
const ACCESS_LEVELS = [
  { value: '', label: 'Sem acesso ao sistema' },
  { value: 'ROLE_USER', label: 'Operador / Caixa' },
  { value: 'ROLE_MANAGER', label: 'Gerente' },
  { value: 'ROLE_ADMIN', label: 'Administrador' },
];

const JobTitlesPage: React.FC = () => {

  // ====================================================
  // ESTADOS
  // ====================================================
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [currentJobTitle, setCurrentJobTitle] = useState<JobTitlesFormData>({
    nomecargo: '',
    descricao: '',
    valor: 0,
    accessLevel: ''
  });

  const [deleteJobTitle, setDeleteJobTitle] = useState<JobTitle | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formRef = useRef<JobTitleFormRef>(null);

  const { listar, criar, editar, deletar } = useJobTitlesService();

  // ====================================================
  // FETCH
  // ====================================================
  const fetchJobTitles = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setJobTitles(data);
    } catch {
      showErrorToast('Erro ao carregar cargos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobTitles();
  }, []);
  
const summary = useMemo(() => {
  const total = jobTitles.length;

  // Cargos com acesso
  const withAccess = jobTitles.filter(
    j => j.accessLevel && j.accessLevel !== 'NO_ACCESS'
  ).length;

  const withoutAccess = total - withAccess;

  const values = jobTitles
  .map(j => {
    if (!j.valor) return NaN;

    // Remove "Db" e espaços
    let cleaned = j.valor.toString().replace(/[^\d.,]/g, '');

    // Remove pontos que são separador de milhar
    cleaned = cleaned.replace(/\.(?=\d{3},)/g, ''); 

    // Substitui vírgula decimal por ponto
    cleaned = cleaned.replace(',', '.');

    return parseFloat(cleaned);
  })
  .filter(v => !isNaN(v));

  // Soma total dos valores
  const totalValue = values.reduce((acc, v) => acc + v, 0);

  // Média dos valores
  const avgValue = values.length > 0 ? totalValue / values.length : 0;

  // Maior valor
  const maxValue = values.length > 0 ? Math.max(...values) : 0;

  return {
    total,
    withAccess,
    withoutAccess,
    totalValue,
    avgValue,
    maxValue
  };
}, [jobTitles]);
  // ====================================================
  // AÇÕES (HANDLERS)
  // ====================================================

  /**
   * Prepara a interface para a criação de um novo cliente.
   */
  // ====================================================
  // HANDLERS
  // ====================================================
  const handleCreate = () => {
    setCurrentJobTitle({
      nomecargo: '',
      descricao: '',
      valor: 0,
      accessLevel: undefined
    });
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = useCallback((jobTitle: JobTitle) => {
    setCurrentJobTitle({
      id: jobTitle.id,
      nomecargo: jobTitle.nomecargo,
      descricao: jobTitle.descricao,
      valor: jobTitle.valor,
      accessLevel: jobTitle.accessLevel || undefined // trata string vazia como undefined para select
    });
    setIsEditMode(true);
    setModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((jobTitle: JobTitle) => {
    setDeleteJobTitle(jobTitle);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteJobTitle?.id) return;
    try {
      await deletar(deleteJobTitle.id);
      showSuccessToast('Cargo removido com sucesso!');
      fetchJobTitles();
    } catch {
      showErrorToast('Erro ao remover cargo.');
    } finally {
      setShowDeleteDialog(false);
      setDeleteJobTitle(null);
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
        showSuccessToast(`Cargo "${data.nomecargo}" atualizado com sucesso!`);
      } else {
        await criar(data);
        showSuccessToast(`Cargo "${data.nomecargo}" criado com sucesso!`);
      }
      setModalOpen(false);
      fetchJobTitles();
    } catch {
      showErrorToast('Erro ao salvar cargo.');
    } finally {
      setFormLoading(false);
    }
  };

  // ====================================================
  // COLUNAS DO DATATABLE
  // ====================================================
 const columns = useMemo(() => [
    {
      key: 'nomecargo' as keyof Location,
      label: 'Cargo',
      sortable: true
    },
    {
      key: 'descricao' as keyof Location,
      label: 'Descrição',
       sortable: true
    },
    {
      key: 'valor' as keyof Location,
      label: 'Valor',
    render: (value: string | number | boolean | null | undefined) => (
    <div className="font-medium">
      {typeof value === 'number'
        ? `${value.toLocaleString('pt-ST', { style: 'currency', currency: 'STN' })}` // moeda Dobras
        : value ?? '-'}
    </div>
  )
    },
        {
      key: 'accessLevel' as keyof JobTitle, // ou Location, dependendo do tipo
      label: 'Nível de Acesso',
      render: (value: string | number | boolean | null | undefined) => {
        const level = ACCESS_LEVELS.find(l => l.value === value);
        return <div className="font-medium">{level ? level.label : 'NO_ACCESS'}</div>;
      }
    }
  ], []);

  const actions = useMemo(() => [
    {
      label: 'Editar',
      icon: Edit,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) =>
              handleEdit(row as unknown as JobTitle) 
    },
    {
      label: 'Excluir',
      icon: Trash2,
      variant: 'destructive' as const,
            onClick: (row: Record<string, string | number | boolean | null | undefined>) =>
              handleDeleteClick(row as unknown as JobTitle) 
    }
  ], [handleEdit, handleDeleteClick]);

  // ====================================================
  // RENDER
  // ====================================================
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8" /> Cargos
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
      </div>
 {/* Cards de resumo */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

  {/* Total de Cargos */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total de Cargos</p>
          <h3 className="text-2xl font-bold">{summary.total}</h3>
        </div>
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Briefcase className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Com Acesso */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Com Acesso</p>
          <h3 className="text-2xl font-bold">{summary.withAccess}</h3>
        </div>
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <Briefcase className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Sem Acesso */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Sem Acesso</p>
          <h3 className="text-2xl font-bold">{summary.withoutAccess}</h3>
        </div>
        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <Briefcase className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Valor Médio */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Valor Médio</p>
          <h3 className="text-2xl font-bold">
            {summary.avgValue.toLocaleString('pt-ST', {
              style: 'currency',
              currency: 'STN'
            })}
          </h3>
        </div>
        <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
          <Briefcase className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>

</div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cargos</CardTitle>
          <CardDescription>Gestão de cargos do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={jobTitles as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="Buscar localidades..."
            emptyMessage="Nenhuma localidade encontrada."
            paginated={true}
            pageSize={5}
          />
        </CardContent>
      </Card>

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? 'Editar Cargo' : 'Novo Cargo'}
        description="Preencha os detalhes do cargo abaixo."
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
      >
        <JobTitleForm
          ref={formRef}
          initialData={currentJobTitle}
          isLoading={formLoading}
        />
      </ModalForm>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o cargo "{deleteJobTitle?.nomecargo}"? Esta ação não pode ser desfeita.
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

export default JobTitlesPage;
