import React,{ useState, useEffect, useMemo,  useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

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

// Utilitários
import { showSuccessToast, showErrorToast } from '@/utils/toast';
// Serviço e Componentes do Módulo Taxes
import { useTaxesService, Taxes, TaxesFormData } from './TaxesService';
import TaxesForm, { TaxesFormRef } from './TaxesForm';


const TaxesPage: React.FC = () => {

// ====================================================
  // ESTADOS (STATE)
  // ====================================================

  const [taxes, setTaxes] = useState<Taxes[]>([]); // Lista de séries
  const [loading, setLoading] = useState(true); // Estado de carregamento da lista

  const [modalOpen, setModalOpen] = useState(false); // Controla abertura do modal
  const [isEditMode, setIsEditMode] = useState(false); // Define se é edição ou criação
  const [formLoading, setFormLoading] = useState(false); // Estado de carregamento do envio do form~


  // Estado para os dados atuais do formulário
    const [currentTaxes, setCurrentTaxes] = useState<TaxesFormData>({
      imposto: '',
      baseCalculo: 0.0,
     
    });

     const [deleteTaxes, setDeleteTaxes] = useState<Taxes | null>(null); // Imposto selecionado para exclusão
      const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Controla o diálogo de conf
  
      
        const formRef = useRef<TaxesFormRef>(null); // Referência para acessar métodos do formulário
      
        const { listar, criar, editar, deletar } = useTaxesService(); // Hook do serviço de API


// ====================================================
  // CARREGAR TAXES (FETCH)
  // ====================================================

  /**
   * Função para carregar todas as taxes da API
   */
  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setTaxes(data);
    } catch (error) {
      showErrorToast('Erro ao carregar Imposto.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    fetchTaxes();
  }, []);

// ====================================================
// CÁLCULOS DE RESUMO (SUMMARY)
// ====================================================
const summary = useMemo(() => {
  const total = taxes.length;

  // Converter baseCalculo para número (caso venha como string)
  const values = taxes
    .map(t => Number(t.baseCalculo))
    .filter(v => !isNaN(v));

  // Média
  const avg = values.length > 0
    ? values.reduce((acc, v) => acc + v, 0) / values.length
    : 0;

  // Maior taxa
  const max = values.length > 0 ? Math.max(...values) : 0;

  // Menor taxa
  const min = values.length > 0 ? Math.min(...values) : 0;

  return {
    total,
    avg,
    max,
    min
  };
}, [taxes]);

  // ====================================================
  // AÇÕES (HANDLERS)
  // ====================================================

  /**
   * Prepara o estado para criação de uma nova série
   */
  const handleCreate = () => {
    setCurrentTaxes({
      imposto: '',
      baseCalculo: 0.0,
    });
    setIsEditMode(false);
    setModalOpen(true);
  };

  /**
   * Prepara o estado para edição de uma série existente
   */
  const handleEdit = useCallback((taxes: Taxes) => {
    setCurrentTaxes({
    id: (taxes.id),
    imposto: taxes.imposto,
    baseCalculo: taxes.baseCalculo,
   
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
   * Abre o diálogo de confirmação de exclusão
   */
  const handleDeleteClick = useCallback((taxes: Taxes) => {
    setDeleteTaxes(taxes);
    setShowDeleteDialog(true);
  }, []);

  /**
   * Executa a exclusão efetiva da série
   */
  const handleDeleteConfirm = async () => {
    if (!deleteTaxes || !deleteTaxes.id) return;

    try {
      await deletar(deleteTaxes.id);
      showSuccessToast('Imposto removida com sucesso!');
      fetchTaxes();
    } catch (error) {
      showErrorToast('Erro ao remover Imposto.');
    } finally {
      setShowDeleteDialog(false);
      setDeleteTaxes(null);
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
        showSuccessToast(`Imposto "${data.imposto}" atualizada com sucesso!`);
      } else {
        await criar(data);
        showSuccessToast(`Imposto "${data.imposto}" criada com sucesso!`);
      }

      setModalOpen(false);
      fetchTaxes();
    } catch (error) {
      showErrorToast('Erro ao salvar Imposto.');
    } finally {
      setFormLoading(false);
    }
  };

// ====================================================
  // CONFIGURAÇÃO DA TABELA (COLUNAS E AÇÕES)
  // ====================================================

  const columns = useMemo(() => [
    {
      key: 'imposto' as keyof Taxes,
      label: 'Imposto',
      sortable: true,
      render: (value: string | number | boolean | null | undefined) => <div className="font-bold text-primary font-mono">{value}</div>
    },
    {
  key: 'baseCalculo' as keyof Taxes,
  label: 'Taxa',
  render: (value: string | number | boolean | null | undefined) => {
    const numberValue = Number(value);

    return (
      <span className="font-medium">
        {!isNaN(numberValue) ? `${numberValue}%` : '-'}
      </span>
    );
  }
}
    
  ], []);

  const actions = useMemo(() => [
      
      {
        label: 'Editar',
        icon: Edit,
        onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleEdit(row as unknown as Taxes)
      },
      {
        label: 'Excluir',
        icon: Trash2,
        variant: 'destructive' as const,
        onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleDeleteClick(row as unknown as Taxes)
      }
    ], [handleEdit, handleDeleteClick]);



 // ====================================================
  // RENDERIZAÇÃO (JSX)
  // ====================================================

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Impostos
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Imposto
        </Button>
      </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

  {/* Total */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Total de Impostos</p>
          <h3 className="text-2xl font-bold">{summary.total}</h3>
        </div>
        <FileText className="h-6 w-6 text-primary" />
      </div>
    </CardContent>
  </Card>

  
  {/* Maior */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Maior Taxa</p>
          <h3 className="text-2xl font-bold">
            {summary.max > 0 ? `${summary.max}%` : 'Sem dados'}
          </h3>
        </div>
        <FileText className="h-6 w-6 text-red-600" />
      </div>
    </CardContent>
  </Card>

  {/* Menor */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Menor Taxa</p>
          <h3 className="text-2xl font-bold">
            {summary.min > 0 ? `${summary.min}%` : 'Sem dados'}
          </h3>
        </div>
        <FileText className="h-6 w-6 text-yellow-600" />
      </div>
    </CardContent>
  </Card>

</div>
      {/* Lista de Impostos */}
      <Card>
        <CardHeader>
          <CardTitle>Impostos Registados</CardTitle>
          <CardDescription>
            Gestão de impostos aplicáveis aos documentos fiscais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={taxes as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="Pesquisar por imposto ou taxa..."
            emptyMessage="Nenhum imposto encontrado."
            paginated={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <ModalForm
        open={modalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Editar Imposto' : 'Novo Imposto'}
        description="Configure os detalhes do imposto abaixo."
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
      >
        <TaxesForm
          ref={formRef}
          initialData={currentTaxes}
          isLoading={formLoading}
        />
      </ModalForm>

    

 {/* Diálogo de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a série "{deleteTaxes?.imposto}"? Esta ação pode afetar a emissão de novos documentos.
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

export default TaxesPage;