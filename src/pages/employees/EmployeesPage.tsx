/**
 * ====================================================
 * EMPLOYEES PAGE - PÁGINA DE GESTÃO DE FUNCIONÁRIOS
 * ====================================================
 * 
 * Esta página centraliza a gestão de funcionários, permitindo a listagem,
 * visualização detalhada, criação, edição e remoção.
 * Implementa resumos estatísticos e integração com o formulário multi-step.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Plus, Edit, Trash2, Users, Eye, UserCheck, UserMinus, Shield, Image as ImageIcon, AlertCircle, Loader2, X } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Cake } from "lucide-react";
import DataTable from "@/components/common/DataTable";
import ModalForm from "@/components/forms/ModalForm";
import GenericViewModal from "@/components/forms/GenericViewModal";

import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useEmployeeService, type Employee, type EmployeeFormData } from "./EmployeesService";
import EmployeeForm, { type EmployeeFormRef } from "./EmployeeForm";

const MAX_EMPLOYEE_PHOTO_SIZE = 2 * 1024 * 1024;

const EmployeesPage: React.FC = () => {

  // ====================================================
  // ESTADOS (STATE)
  // ====================================================
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Estado inicial limpo para o formulário
  const emptyEmployee: EmployeeFormData = {
    nome: '',
    bi: '',
    contribuinte: '',
    contactoprincipal: '',
    contactosecudario: '',
    email: '',
    sexo: '',
    dataNascimento: '',
    dataAdmissao: '',
    localidade: null,
    loja: null,
    funcao: null,
    username: '',
    password: ''
  };

  const [currentEmployee, setCurrentEmployee] = useState<EmployeeFormData>(emptyEmployee);

  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedEmployeeForPhoto, setSelectedEmployeeForPhoto] = useState<Employee | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSizeError, setPhotoSizeError] = useState(false);
  const [photoIsProcessing, setPhotoIsProcessing] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [photoFormLoading, setPhotoFormLoading] = useState(false);

  const formRef = useRef<EmployeeFormRef>(null);

  const { listar, criar, editar, deletar, listarId, alterarFoto } = useEmployeeService();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listar();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar funcionários", error);
      showErrorToast("Erro ao carregar a lista de funcionários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

// Função para converter "DD/MM/YYYY" para Date
const parseDateBR = (dateStr: string) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day); // mês começa do 0 no JS
};

// Data atual
const now = new Date();

// Filtra funcionários que fazem aniversário hoje
const aniversariantesHojeList = employees.filter(e => {
  if (!e.dataNascimento) return false;
  const data = parseDateBR(e.dataNascimento);
  return data.getDate() === now.getDate() && data.getMonth() === now.getMonth();
});

const aniversariantesHojeCount = aniversariantesHojeList.length;

  // ====================================================
  // CÁLCULOS DE RESUMO (SUMMARY)
  // ====================================================

const summary = useMemo(() => {
  const total = employees.length;
  const ativos = employees.filter(e => e.status !== 'Inativo').length;
  const comAcesso = employees.filter(e => {
    const level = e.accessLevel;
    return level && level !== "NO_ACCESS" && level !== "0";
  }).length;
  const masculino = employees.filter(e => e.gender === 'M').length;
  const feminino = employees.filter(e => e.gender === 'F').length;

  // Novos do mês (dataAdmissao no mesmo mês atual)
  const now = new Date();
  const novosMes = employees.filter(e => {
    if (!e.dataAdmissao) return false;
    const date = new Date(e.dataAdmissao);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return { total, ativos, inativos: total - ativos, comAcesso, masculino, feminino, novosMes };
}, [employees]);

  // ====================================================
  // AÇÕES (HANDLERS)
  // ====================================================

  /**
   * Prepara o formulário para um novo cadastro.
   */
  const handleCreate = () => {
    setCurrentEmployee(emptyEmployee);
    setIsEditMode(false);
    setModalOpen(true);
    // Garante que o formulário comece no step 0
    setTimeout(() => formRef.current?.resetStep(), 0);
  };
// Converte "16/12/2025" para "2025-12-16"
const formatToInputDate = (dateStr: string | undefined | null) => {
  if (!dateStr || !dateStr.includes('/')) return '';
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
};
  /**
   * Carrega os dados completos do funcionário para edição.
   */
 const handleEdit = useCallback(async (employee: Employee) => {
  try {
    setFormLoading(true);
    const res = await listarId(String(employee.id)); // Dados que colaste acima

    // Mapeamento corrigido baseado na estrutura real da tua API
    const mapped: EmployeeFormData = {
      id: res.id,
      nome: res.nome,
      bi: res.numeroBi,             // API usa 'numeroBi'
      contribuinte: res.numeroContribuinte, // API usa 'numeroContribuinte'
      contactoprincipal: res.contactoPrincipal,
      contactosecudario: res.contactoSecudario || '',
      email: res.email || '',
      sexo: res.gender,             // API usa 'gender'
    // CORREÇÃO: Converter as datas para o formato que o <input type="date"> entende
      dataNascimento: formatToInputDate(res.dataNascimento),
      dataAdmissao: formatToInputDate(res.dataAdmissao),
      
      // Localidade: API envia 'location' (id) e 'locations' (nome)
      localidade: res.location ? { id: res.location, nome: res.locations || '' } : null,
      
      // Loja: API envia 'shop' (id) e 'shops' (nome) OU o objeto 'shop2'
     //  REGRA DO DONO: Se shops for "ADMINISTRAÇÃO CENTRAL", a loja é null no form
      loja: (res.shop === 0 || !res.shop) ? null : { id: res.shop, nome: res.shops || '' },
      
      // Função: API envia 'jobtitle' (id), 'jobTitle' (nome) e 'accessLevel'
      funcao: res.jobtitle ? { 
        id: res.jobtitle, 
        nomecargo: res.jobTitle || '', 
        accessLevel: res.accessLevel || '0' 
      } : null,

    };

    setCurrentEmployee(mapped);
    setIsEditMode(true);
    setModalOpen(true);
    setTimeout(() => formRef.current?.resetStep(), 0);
  } catch (error) {
    showErrorToast("Erro ao processar dados do funcionário.");
  } finally {
    setFormLoading(false);
  }
}, [listarId]);

  /**
   * Prepara a visualização detalhada.
   */
  const handleViewClick = useCallback(async (employee: Employee) => {
    try {
      const res = await listarId(String(employee.id));
      setViewEmployee(res);
      setShowViewModal(true);
    } catch (error) {
      showErrorToast("Erro ao carregar detalhes para visualização.");
    }
  }, [listarId]);

  /**
   * Controla a confirmação de exclusão.
   */
  const handleDeleteClick = useCallback((employee: Employee) => {
    setDeleteEmployee(employee);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteEmployee) return;

    try {
      await deletar(String(deleteEmployee.id));
      showSuccessToast(`Funcionário "${deleteEmployee.nome}" removido com sucesso.`);
      fetchEmployees();
    } catch (error) {
      showErrorToast("Erro ao tentar remover o funcionário.");
    } finally {
      setShowDeleteDialog(false);
      setDeleteEmployee(null);
    }
  };

  const handlePhotoChangeClick = useCallback((employee: Employee) => {
    setSelectedEmployeeForPhoto(employee);
    setNewPhoto(null);
    setPhotoPreview(null);
    setPhotoSizeError(false);
    setPhotoIsProcessing(false);
    setPhotoUploadProgress(0);
    setPhotoModalOpen(true);
  }, []);

  const handleEmployeePhotoFileChange = (file: File | null) => {
    if (!file) {
      setNewPhoto(null);
      setPhotoPreview(null);
      setPhotoUploadProgress(0);
      setPhotoSizeError(false);
      return;
    }

    if (file.size > MAX_EMPLOYEE_PHOTO_SIZE) {
      setPhotoSizeError(true);
      setPhotoPreview(null);
      setPhotoUploadProgress(0);
      setNewPhoto(null);
      showErrorToast('Ficheiro demasiado grande! O limite para a foto do funcionário é de 1MB.');
      return;
    }

    setPhotoSizeError(false);
    setPhotoIsProcessing(true);
    setPhotoUploadProgress(0);
    setNewPhoto(null);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setPhotoUploadProgress(percent);
      }
    };

    reader.onloadend = () => {
      setPhotoPreview(URL.createObjectURL(file));
      setNewPhoto(file);
      setPhotoUploadProgress(100);
      setPhotoIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEmployeePhotoSubmit = async () => {
    if (!selectedEmployeeForPhoto || !newPhoto) {
      showErrorToast('Selecione uma imagem antes de submeter.');
      return;
    }

    setPhotoFormLoading(true);
    try {
      await alterarFoto(String(selectedEmployeeForPhoto.id), newPhoto);
      showSuccessToast(`Foto de ${selectedEmployeeForPhoto.nome} atualizada com sucesso.`);
      setPhotoModalOpen(false);
      fetchEmployees();
    } catch (error) {
      showErrorToast('Erro ao atualizar a foto do funcionário.');
    } finally {
      setPhotoFormLoading(false);
    }
  };

  /**
   * Submete os dados do formulário (Criação ou Edição).
   */
  const handleSubmit = async () => {
    if (!formRef.current) return;

    // Validação final antes de enviar
    const isValid = await formRef.current.trigger();
    if (!isValid) {
      showErrorToast("Por favor, corrija os erros nas etapas do formulário.");
      return;
    }

    const data = formRef.current.getValues();
    setFormLoading(true);

    try {
      if (isEditMode) {
        await editar(data);
        showSuccessToast(`Funcionário "${data.nome}" atualizado com sucesso!`);
      } else {
        await criar(data);
        showSuccessToast(`Funcionário "${data.nome}" cadastrado com sucesso!`);
      }
      setModalOpen(false);
      fetchEmployees();
    } catch (error) {
      // O erro já é tratado no service com toast, mas podemos adicionar lógica extra aqui se necessário
    } finally {
      setFormLoading(false);
    }
  };

  // ====================================================
  // CONFIGURAÇÃO DA TABELA
  // ====================================================

  const columns = useMemo(() => [
    {
      key: "nome" as keyof Employee,
      label: "Funcionário",
      sortable: true,
            render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value}</div>

    },
    { key: "numeroBi" as keyof Employee, label: "BI" },
    { key: "numeroContribuinte" as keyof Employee, label: "Contribuinte" },
 {
      key: "email" as keyof Employee,
      label: "Email",
      sortable: true,
            render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value}</div>

    },
    {
      key: "gender" as keyof Employee,
      label: "Género",
            render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value === 'M' ? 'Masculino' : value === 'F' ? 'Feminino' : '-'}</div>
    },
    { key: "contactoPrincipal" as keyof Employee, label: "Contacto" },
    {
      key: "jobTitle" as keyof Employee,
      label: "Cargo / Função",
            render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value}</div>

    },
    {
      key: "status" as keyof Employee,
      label: "Estado",
            render: (value: string | number | boolean | null | undefined) => <div className="font-medium">{value}</div>

    }
  ], []);
 /**
   * Fecha o modal e limpa estados temporários
   */
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const actions = useMemo(() => [
    { label: "Visualizar", icon: Eye, 
    onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleViewClick(row as unknown as Employee)
  },

    { label: "Editar", icon: Edit, 
    onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleEdit(row as unknown as Employee)
    
    },

    { label: "Alterar Foto", icon: ImageIcon,
      onClick: (row: Record<string, string | number | boolean | null | undefined>) => handlePhotoChangeClick(row as unknown as Employee)
    },

    { label: "Excluir", icon: Trash2, variant: "destructive" as const, 
    onClick: (row: Record<string, string | number | boolean | null | undefined>) => handleDeleteClick(row as unknown as Employee)


    },
  ], [handleViewClick, handleEdit, handlePhotoChangeClick, handleDeleteClick]);

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Gestão de Funcionários
          </h1>
          <p className="text-muted-foreground">Administre a sua equipa, cargos e acessos ao sistema.</p>
        </div>
        <Button onClick={handleCreate} className="shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Funcionário
        </Button>
      </div>

{/* CARDS DE RESUMO ESTATÍSTICO */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Total */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Total</p>
          <h3 className="text-2xl font-bold">{summary.total}</h3>
        </div>
        <Users className="h-8 w-8 text-primary/70" />
      </div>
    </CardContent>
  </Card>

  {/* Ativos */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Ativos</p>
          <h3 className="text-2xl font-bold">{summary.ativos}</h3>
        </div>
        <UserCheck className="h-8 w-8 text-green-500" />
      </div>
    </CardContent>
  </Card>

  {/* Inativos */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Inativos</p>
          <h3 className="text-2xl font-bold">{summary.inativos}</h3>
        </div>
        <UserMinus className="h-8 w-8 text-red-500" />
      </div>
    </CardContent>
  </Card>

  {/* Com Acesso */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Com Acesso</p>
          <h3 className="text-2xl font-bold">{summary.comAcesso}</h3>
        </div>
        <Shield className="h-8 w-8 text-blue-500" />
      </div>
    </CardContent>
  </Card>

  {/* Sem Acesso */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Sem Acesso</p>
          <h3 className="text-2xl font-bold">{summary.total - summary.comAcesso}</h3>
        </div>
        <Shield className="h-8 w-8 text-gray-500" />
      </div>
    </CardContent>
  </Card>

  {/* Masculino */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Masculino</p>
          <h3 className="text-2xl font-bold">{summary.masculino}</h3>
        </div>
        <UserCheck className="h-8 w-8 text-cyan-500" />
      </div>
    </CardContent>
  </Card>

  {/* Feminino */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Feminino</p>
          <h3 className="text-2xl font-bold">{summary.feminino}</h3>
        </div>
        <UserMinus className="h-8 w-8 text-pink-500" />
      </div>
    </CardContent>
  </Card>

  {/* Aniversariantes de Hoje */}
  <Card>
    <CardHeader>
      <CardTitle className="text-sm md:text-base">
        Aniversariantes de Hoje ({aniversariantesHojeCount})
      </CardTitle>
      <CardDescription className="text-xs md:text-sm">
        Comemore com a sua equipa 🎉
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
      {aniversariantesHojeList.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum aniversário hoje.</p>
      )}
      {aniversariantesHojeList.map((emp) => {
        const nomes = emp.nome.split(" ");
        const shortName =
          nomes.length > 1
            ? `${nomes[0]} ${nomes[nomes.length - 1]}`
            : nomes[0];

        return (
          <div
            key={emp.id}
            className="flex items-center gap-1 text-sm truncate"
            title={emp.nome}
          >
            <Cake className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <span className="truncate">{shortName}</span>
          </div>
        );
      })}
    </CardContent>
  </Card>
</div>
      {/* TABELA DE FUNCIONÁRIOS */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg">Listagem Geral</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
          data={employees as unknown as Record<string, string | number | boolean | null | undefined>[]}
            columns={columns}
            actions={actions}
            loading={loading}
            searchable
            searchPlaceholder="pesquisar por nome ou bi..."
            emptyMessage="Nenhuma loja encontrada."
            paginated={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* MODAL DE FORMULÁRIO (CRIAR / EDITAR) */}
      <ModalForm
       open={modalOpen}
         onClose={handleCloseModal}
        title={isEditMode ? "Editar Funcionário" : "Registar Novo Funcionário"}
        description={isEditMode ? "Atualize as informações do funcionário selecionado." : "Preencha as etapas para cadastrar um novo membro na equipa."}
        onSubmit={handleSubmit}
        loading={formLoading}
        size="lg"
         isEditMode={isEditMode}

      >
        <EmployeeForm
          ref={formRef}
          initialData={currentEmployee}
          isEditMode={isEditMode}
          isLoading={formLoading}
        />
      </ModalForm>

      <ModalForm
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Alterar Foto do Funcionário"
        description={`Escolha uma nova foto para ${selectedEmployeeForPhoto?.nome || 'o funcionário'}.`}
        onSubmit={handleEmployeePhotoSubmit}
        loading={photoFormLoading}
        size="sm"
        isEditMode={true}
      >
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 ${photoSizeError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-6">
              <div className="relative group w-24 h-24 flex-shrink-0">
                <div className={`w-full h-full rounded-full overflow-hidden border-2 shadow-md flex items-center justify-center ${photoSizeError ? 'bg-red-100 border-red-300' : 'bg-white border-white'}`}>
                  {photoIsProcessing ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : photoSizeError ? (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  ) : photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                {photoPreview && !photoIsProcessing && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setNewPhoto(null);
                      setPhotoUploadProgress(0);
                      setPhotoSizeError(false);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className={`text-[10px] font-black uppercase ${photoSizeError ? 'text-red-600' : 'text-slate-400'}`}>
                  Foto do Funcionário (Máx 1MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEmployeePhotoFileChange(e.target.files?.[0] || null)}
                  disabled={photoFormLoading || photoIsProcessing}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />

                {photoSizeError ? (
                  <p className="text-[10px] text-red-600 font-bold uppercase animate-pulse italic">
                    ❌ Ficheiro excede 2MB. Por favor, selecione outro.
                  </p>
                ) : (photoIsProcessing || photoUploadProgress > 0) ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase">
                      <span className={photoUploadProgress === 100 ? 'text-emerald-600' : 'text-blue-600'}>
                        {photoUploadProgress === 100 ? '✓ OK' : 'A preparar...'}
                      </span>
                      <span>{photoUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${photoUploadProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${photoUploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Clique em selecionar para enviar uma nova foto de perfil.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalForm>

      {/* MODAL DE VISUALIZAÇÃO DETALHADA */}
      {viewEmployee && (
        <GenericViewModal
            open={showViewModal}
            onClose={() => setShowViewModal(false)}
            title="Ficha Detalhada do Funcionário"
            image={viewEmployee.logoUrl || viewEmployee.logoUrl || undefined}
            fields={[
            { label: "Nome Completo", value: viewEmployee.nome },
            { label: "BI / Documento", value: viewEmployee.numeroBi },
            { label: "NIF / Contribuinte", value: viewEmployee.numeroContribuinte },
            { label: "Email", value: viewEmployee.email || 'Não informado' },
            { label: "Contacto Principal", value: viewEmployee.contactoPrincipal },
            { label: "Contacto Secundário", value: viewEmployee.contactoSecudario || '-' },
            { label: "Género", value: viewEmployee.gender === 'M' ? 'Masculino' : 'Feminino' },
            { label: "Data de Nascimento", value: viewEmployee.dataNascimento },
            { label: "Data de Admissão", value: viewEmployee.dataAdmissao },
            { label: "Loja", value: viewEmployee.shops || '-' },
            { label: "Localidade", value: viewEmployee.locations || '-' },
            { label: "Função / Cargo", value: viewEmployee.jobTitle || '-' },
            //{ label: "Utilizador do Sistema", value: viewEmployee.accessLevel || 'Sem acesso' },
            { label: "Estado Atual", value: viewEmployee.status || 'Ativo' },
          ]}
        />
      )}

      {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá remover permanentemente o funcionário
              <span className="font-bold text-foreground"> {deleteEmployee?.nome} </span>
              e todos os dados associados do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default EmployeesPage;
