/**
 * ====================================================
 * SERIES PAGE - PÁGINA DE GESTÃO DE SÉRIES
 * ====================================================
 * 
 * Esta página permite a visualização, criação, edição e remoção de séries de numeração fiscal.
 * Implementa funcionalidades de pesquisa e paginação utilizando componentes reutilizáveis.
 * 

 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, FileText, Eye } from 'lucide-react';

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

// Utilitários
import { showSuccessToast, showErrorToast } from '@/utils/toast';

// Serviço e Componentes do Módulo Série
import { useSerieService, Serie, SerieFormData } from './SeriesService';
import SerieForm, { SerieFormRef } from './SerieForm';

const SeriesPage: React.FC = () => {

  // ====================================================
  // ESTADOS (STATE)
  // ====================================================

  const [series, setSeries] = useState<Serie[]>([]); // Lista de séries
  const [loading, setLoading] = useState(true); // Estado de carregamento da lista

  const [modalOpen, setModalOpen] = useState(false); // Controla abertura do modal
  const [isEditMode, setIsEditMode] = useState(false); // Define se é edição ou criação
  const [formLoading, setFormLoading] = useState(false); // Estado de carregamento do envio do form

  // Estado para os dados atuais do formulário
  const [currentSerie, setCurrentSerie] = useState<SerieFormData>({
    serie: '',
    numeroautorizacao: '',
    ano: new Date().getFullYear(),
    shop: '',
  });

  const [deleteSerie, setDeleteSerie] = useState<Serie | null>(null); // Série selecionada para exclusão
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Controla o diálogo de confirmação

  // Estados para Visualização
  const [viewSerie, setViewSerie] = useState<Serie | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const formRef = useRef<SerieFormRef>(null); // Referência para acessar métodos do formulário

  const { listar, criar, editar, deletar } = useSerieService(); // Hook do serviço de API

  // ====================================================
  // CARREGAR SÉRIES (FETCH)
  // ====================================================

  /**
   * Função para carregar todas as séries da API
   */
  const fetchSeries = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSeries(data);
    } catch (error) {
      showErrorToast('Erro ao carregar séries.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    fetchSeries();
  }, []);


  // ====================================================
  // AÇÕES (HANDLERS)
  // ====================================================

  /**
   * Prepara o estado para criação de uma nova série
   */
  const handleCreate = () => {
    setCurrentSerie({
      serie: '',
      numeroautorizacao: '',
      ano: new Date().getFullYear(),
      shop: '',
    });
    setIsEditMode(false);
    setModalOpen(true);
  };

  /**
   * Prepara o estado para edição de uma série existente
   */
  const handleEdit = useCallback((serie: Serie) => {
    setCurrentSerie({
    id: (serie.id),
    serie: serie.serie,
    numeroautorizacao: serie.numeroAutorizacao,
    ano: serie.ano,
    shop: String(serie.shops ?? '')
    });
    setIsEditMode(true);
    setModalOpen(true);
  }, []);

  /**
   * Prepara o estado para visualização detalhada
   */
  const handleViewClick = useCallback((serie: Serie) => {
    setViewSerie(serie);
    setShowViewModal(true);
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
  const handleDeleteClick = useCallback((serie: Serie) => {
    setDeleteSerie(serie);
    setShowDeleteDialog(true);
  }, []);

  /**
   * Executa a exclusão efetiva da série
   */
  const handleDeleteConfirm = async () => {
    if (!deleteSerie || !deleteSerie.id) return;

    try {
      await deletar(deleteSerie.id);
      showSuccessToast('Série removida com sucesso!');
      fetchSeries();
    } catch (error) {
      showErrorToast('Erro ao remover série.');
    } finally {
      setShowDeleteDialog(false);
      setDeleteSerie(null);
    }
  };
const summary = useMemo(() => {
  const total = series.length;
  return {
    total,
  };
}, [series]);
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
        showSuccessToast(`Série "${data.serie}" atualizada com sucesso!`);
      } else {
        await criar(data);
        showSuccessToast(`Série "${data.serie}" criada com sucesso!`);
      }

      setModalOpen(false);
      fetchSeries();
    } catch (error) {
      showErrorToast('Erro ao salvar série.');
    } finally {
      setFormLoading(false);
    }
  };

  // ====================================================
  // CONFIGURAÇÃO DA TABELA (COLUNAS E AÇÕES)
  // ====================================================

  const columns = useMemo(() => [
    {
      key: 'serie' as keyof Serie,
      label: 'Série',
      sortable: true,
      render: (value: string | number | boolean | null | undefined) => <div className="font-bold text-primary font-mono">{value}</div>
    },
    {
      key: 'numeroAutorizacao' as keyof Serie,
      label: 'Nº Autorização',
      render: (value: string | number | boolean | null | undefined) => <span className="font-mono">{value}</span>
    },
    {
      key: 'ano' as keyof Serie,
      label: 'Ano Fiscal',
      sortable: true
    },
    {
      key: 'nomeshop' as keyof Serie,
      label: 'Loja / Estabelecimento',
      render: (value: string | number | boolean | null | undefined, row: Record<string, string | number | boolean | null | undefined>) => {
        const serieRow = row as unknown as Serie;
        return serieRow.shop || value || 'Todas as lojas';
      }
    }
  ], []);

  const actions = useMemo(() => [
    {
      label: 'Visualizar',
      icon: Eye,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleViewClick(row as unknown as Serie)
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleEdit(row as unknown as Serie)
    },
    {
      label: 'Excluir',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleDeleteClick(row as unknown as Serie)
    }
  ], [handleEdit, handleDeleteClick, handleViewClick]);

  // ====================================================
  // RENDERIZAÇÃO (JSX)
  // ====================================================

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Séries de Numeração
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Série
        </Button>
      </div>
{/* Cards de resumo */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

  {/* Total de Cargos */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground"> Total de Séries Registrada</p>
          <h3 className="text-2xl font-bold">{summary.total}</h3>
        </div>
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <FileText className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
  </div>
      {/* Lista de Séries */}
      <Card>
        <CardHeader>
          <CardTitle>Séries Registadas</CardTitle>
          <CardDescription>
            Gestão de sequências numéricas para documentos fiscais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={series as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="Pesquisar por série ou autorização..."
            emptyMessage="Nenhuma série encontrada."
            paginated={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <ModalForm
        open={modalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Editar Série' : 'Nova Série'}
        description="Configure os detalhes da série de numeração fiscal abaixo."
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
      >
        <SerieForm
          ref={formRef}
          initialData={currentSerie}
          isLoading={formLoading}
        />
      </ModalForm>

      {/* Modal de Visualização de Detalhes */}
      {viewSerie && (
        <GenericViewModal
          open={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Detalhes da Série"
          description={`Informações detalhadas da série fiscal: ${viewSerie.serie}`}
          fields={[
            { label: 'Série', value: viewSerie.serie },
            { label: 'Número de Autorização', value: viewSerie.numeroAutorizacao },
            { label: 'Ano Fiscal', value: viewSerie.ano },
            { label: 'Loja / Estabelecimento', value: viewSerie.shop || viewSerie.shops || 'Todas as lojas' },
          ]}
        />
      )}

      {/* Diálogo de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a série "{deleteSerie?.serie}"? Esta ação pode afetar a emissão de novos documentos.
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

export default SeriesPage;
