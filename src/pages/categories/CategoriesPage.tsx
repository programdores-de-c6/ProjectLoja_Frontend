import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'; // hooks para estado, ciclo de vida, memoização, callbacks e refs
import { Plus, Edit, Trash2, Tags } from 'lucide-react'; // ícones para ações e título
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // componentes de layout
import { Button } from '@/components/ui/button'; // componente de botão
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'; //
import DataTable from '@/components/common/DataTable';
import ModalForm from '@/components/forms/ModalForm';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useCategoryService, Category, CategoryFormData } from './CategoryService'; //
import CategoryForm, { CategoryFormRef } from './CategoryForm';

const CategoriesPage: React.FC = () => {

  // ESTADOS
  const [categories, setCategories] = useState<Category[]>([]); // lista de categorias
  const [loading, setLoading] = useState(true); // estado de carregamento para a tabela
  const [modalOpen, setModalOpen] = useState(false); // controle de abertura do modal
  const [isEditMode, setIsEditMode] = useState(false);// para diferenciar criação de edição
  const [formLoading, setFormLoading] = useState(false); // estado de carregamento para o formulário (salvando)
  const [currentCategory, setCurrentCategory] = useState<CategoryFormData>({ nome: '', descricao: '' }); // categoria atual para edição/criação
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null); // categoria selecionada para exclusão
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // controle de abertura do diálogo de exclusão

  const formRef = useRef<CategoryFormRef>(null); // 🔹 ref do CategoryForm
  const { listar, criar, editar, deletar } = useCategoryService();// funções do serviço de categorias

  // ====================================================
  // FUNÇÕES DE AÇÃO
  // ====================================================

  // CARREGAR CATEGORIAS
  const fetchCategories = async () => { // função para carregar categorias da API
    setLoading(true);// ativa estado de carregamento
    try {// chama função listar do serviço e atualiza estado
      const data = await listar();// atualiza estado com categorias carregadas
      setCategories(data);// captura erros e exibe notificação
    } catch (error) {
      showErrorToast('Erro ao carregar categorias.');// sempre desativa estado de carregamento no final
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchCategories(); }, []);// carrega categorias ao montar componente

// ====================================================
// CÁLCULOS DE RESUMO (SUMMARY)
// ====================================================
const summary = useMemo(() => {
  const total = categories.length;

  // Com descrição
  const withDescription = categories.filter(
    c => c.descricao && c.descricao.trim() !== ''
  ).length;

  // Sem descrição
  const withoutDescription = total - withDescription;

  // Ano atual
  const currentYear = new Date().getFullYear();

  // Criadas este ano
  const createdThisYear = categories.filter(c => {
    if (!c.createdAt) return false;
    return new Date(c.createdAt).getFullYear() === currentYear;
  }).length;

  return {
    total,
    withDescription,
    withoutDescription,
    createdThisYear
  };
}, [categories]);


  // CRIAR //
  const handleCreate = () => {// reseta categoria atual para valores vazios (novo cadastro)
    setCurrentCategory({ nome: '', descricao: '' });
    setIsEditMode(false);
    setModalOpen(true);
  };

  // EDITAR
  const handleEdit = useCallback((category: Category) => {// preenche categoria atual com dados da categoria selecionada para edição
    setCurrentCategory({ id: category.id, nome: category.nome, descricao: category.descricao || '' }); // ativa modo edição e abre modal
    setIsEditMode(true);
    setModalOpen(true);

  }, []);

  // FECHAR MODAL
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // EXCLUIR
  const handleDeleteClick = useCallback((category: Category) => {
    setDeleteCategory(category);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteCategory) return;
    try {
      await deletar(deleteCategory.id);
      showSuccessToast('Categoria excluída com sucesso!');
      fetchCategories();
    } catch {
      showErrorToast('Erro ao excluir categoria.');
    } finally {
      setShowDeleteDialog(false);
      setDeleteCategory(null);
    }
  };

  // SALVAR (criar/editar) usando ref
  const handleSubmit = async () => {// validação e obtenção de dados via ref do formulário~
    
    if (!formRef.current) return; // segurança para garantir que a ref esteja disponível

   
    // 🔹 valida antes de salvar
    const isValid = await formRef.current.trigger(); // trigger retorna true se o formulário for válido
    if (!isValid) {
      showErrorToast('Por favor, corrija os erros no formulário.');
        
      return;
    }

    const data = formRef.current.getValues(); // obtém dados do formulário via ref
    setFormLoading(true); // ativa estado de carregamento do formulário

    try {
      if (isEditMode && data.id) { // se estiver em modo edição e tiver ID, chama função de edição
        
       await editar(data);
        showSuccessToast(`Categoria "${data.nome}" atualizada com sucesso!`);
      } else {
        await criar(data);
     
        showSuccessToast(`Categoria "${data.nome}" criada com sucesso!`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch {
      showErrorToast('Erro ao salvar categoria.');
    } finally {
      setFormLoading(false);
    }
  };

  // COLUNAS DA TABELA
  const columns = useMemo(() => [
    { key: 'nome' as keyof Category, label: 'Nome', sortable: true, render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value}</div> },
    { key: 'descricao' as keyof Category, label: 'Descrição', sortable: true, render: (value: string | number | boolean | null | undefined) => <span className="text-sm text-muted-foreground">{value}</span> },
    { key: 'createdAt' as keyof Category, label: 'Criado Em', sortable: true, render: (value: string | number | boolean | null | undefined) => <span className="text-sm text-muted-foreground">{value ? new Date(value as string).toLocaleDateString() : ''}</span> },
  ], []);

  const actions = useMemo(() => [
    { label: 'Editar', icon: Edit, onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleEdit(row as unknown as Category) },
    { label: 'Excluir', icon: Trash2, variant: 'destructive' as const, onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleDeleteClick(row as unknown as Category) },
  ], [handleEdit, handleDeleteClick]);

  // RENDERIZAÇÃO
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Tags className="h-8 w-8" /> Categorias</h1>
        <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" />Nova Categoria</Button>
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

  {/* Total */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Total de Categorias</p>
          <h3 className="text-2xl font-bold">{summary.total}</h3>
        </div>
        <Tags className="h-6 w-6 text-primary" />
      </div>
    </CardContent>
  </Card>

  {/* Com descrição */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Com Descrição</p>
          <h3 className="text-2xl font-bold">{summary.withDescription}</h3>
        </div>
        <Tags className="h-6 w-6 text-green-600" />
      </div>
    </CardContent>
  </Card>

  {/* Sem descrição */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Sem Descrição</p>
          <h3 className="text-2xl font-bold">{summary.withoutDescription}</h3>
        </div>
        <Tags className="h-6 w-6 text-red-600" />
      </div>
    </CardContent>
  </Card>

  {/* Criadas este ano */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Criadas em {new Date().getFullYear()}</p>
          <h3 className="text-2xl font-bold">{summary.createdThisYear}</h3>
        </div>
        <Tags className="h-6 w-6 text-blue-600" />
      </div>
    </CardContent>
  </Card>

</div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
          <CardDescription>{categories.length} categoria(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={categories as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="Buscar categorias..."
            emptyMessage="Nenhuma categoria encontrada."
             paginated={true}   // ativa paginação
             pageSize={5} 
          />
        </CardContent>
      </Card>

      <ModalForm
        open={modalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
        description="Preencha os dados da categoria abaixo."
        onSubmit={handleSubmit}
        loading={formLoading}
        isEditMode={isEditMode}
      >
        <CategoryForm
          ref={formRef} // 🔹 usamos ref em vez de onChange
          initialData={currentCategory}
          isLoading={formLoading}
        />
      </ModalForm>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deleteCategory?.nome}"? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={formLoading}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesPage;
