/**
 * ====================================================
 * EMPLOYEE FORM - FORMULÁRIO DE FUNCIONÁRIO (MULTI-STEP)
 * ====================================================
 *
 * Componente de formulário para criação e edição de funcionários.
 * Implementa navegação por etapas (Steps) com validação específica para cada uma.
 * Inclui funcionalidade de preview de imagem para melhor experiência do utilizador.
 */

import  { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import FormField from "@/components/forms/FormField";
import { useEmployeeService, type EmployeeFormData } from "./EmployeesService";
import { useJobTitlesService } from "../job-titles/JobTitlesService.tsx";
//import { type Location } from '../locations/LocationService.tsx';
import { showErrorToast } from "@/utils/toast";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";

// ================= SCHEMAS DE VALIDAÇÃO =================
const step1Schema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome demasiado longo"),

  bi: z
    .string()
    .trim()
    .min(1, "BI é obrigatório")
    .max(30, "Número do BI inválido"),

  contribuinte: z
    .string()
    .trim()
    
    ,

  email: z
    .string()
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("Formato de e-mail inválido"),
});

const step2Schema = z.object({
  contactoprincipal: z
    .string()
    .trim()
    .min(1, "Contacto principal é obrigatório")
    ,

  contactosecudario: z
    .string().optional().or(z.literal('')
    ),

  dataNascimento: z
    .string()
    .min(1, "Data de nascimento é obrigatória"),

  dataAdmissao: z
    .string()
    .min(1, "Data de admissão é obrigatória"),
})
.refine(
  (data) => {
    const nascimento =
      new Date(data.dataNascimento);

    const hoje = new Date();

    return nascimento < hoje;
  },
  {
    message:
      "A data de nascimento deve ser anterior à data actual.",
    path: ["dataNascimento"],
  }
)
.refine(
  (data) => {
    const nascimento =
      new Date(data.dataNascimento);

    const admissao =
      new Date(data.dataAdmissao);

    return admissao >= nascimento;
  },
  {
    message:
      "A data de admissão não pode ser anterior à data de nascimento.",
    path: ["dataAdmissao"],
});

// ✅ REAJUSTE STEP 3: Validação condicional para o Dono
const step3Schema = z.object({
  sexo: z
    .string()
    .min(1, "Selecione o sexo"),
 localidade: z
    .object({
      id: z.number(),
      nome: z.string(),
    })
    .nullable()
    .refine(
      (value) =>
        value !== null &&
        value.id > 0 &&
        value.nome.trim().length > 0,
      {
        message: "Selecione uma localidade",
      }
    ),
  funcao: z
    .object({
      id: z.number(),
      nomecargo: z.string(),
      accessLevel: z.string(),
    })
    .nullable()
    .refine(
      (value) => value !== null,
      {
        message: "Selecione uma função",
      }
    ),

  loja: z
    .object({
      id: z.number(),
      nome: z.string(),
    })
    .nullable()
    .optional(),
})
.refine((data) => {
  // 🛡️ Lógica: Se não for Administrador (ROLE_ADMIN), a loja é obrigatória
  if (data.funcao?.accessLevel !== 'ROLE_ADMIN') {
    return data.loja !== null && data.loja !== undefined;
  }
  return true; // Se for Dono, a loja pode ser nula
}, {
  message: "Selecione uma loja para este funcionário",
  path: ["loja"]
});

const step4Schema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const MAX_FILE_SIZE = 1 * 1024 * 1024;

// ================= TIPOS =================
export interface EmployeeFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => EmployeeFormData;
  resetStep: () => void;
}

interface Props {
  initialData: EmployeeFormData;
  isEditMode: boolean;
  isLoading?: boolean;
}

// ================= COMPONENTE PRINCIPAL =================
const EmployeeForm = forwardRef<EmployeeFormRef, Props>(
  ({ initialData, isEditMode, isLoading }, ref) => {
    const [step, setStep] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
      initialData.imagem
        ? typeof initialData.imagem === "string"
          ? initialData.imagem
          : URL.createObjectURL(initialData.imagem)
        : null
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(
      initialData.imagem && typeof initialData.imagem !== "string" ? initialData.imagem : null
    );
    const [sizeError, setSizeError] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [lojas, setLojas] = useState<{ id: number; nome: string }[]>([]);
    const [localidades, setLocalidades] = useState<{ id: number; nome: string }[]>([]);
    const [funcoes, setFuncoes] = useState<{ id: number; nomecargo: string; accessLevel: string }[]>([]);

    // useEmployeeService fornece funções de API para carregar opções de selects.
    // Essas funções são memoizadas no serviço para evitar reexecução infinita do useEffect.
    const { listarLocalidades, listarLojas } = useEmployeeService();
    const { listar } = useJobTitlesService();
    const { user, isAdmin, isManager } = useAuth();
    const isManagerRole = isManager && !isAdmin;

const getCurrentSchema = () => {
  switch (step) {
    case 0: return step1Schema;
    case 1: return step2Schema;
    case 2: return step3Schema;
    case 3:
      return isEditMode ? step3Schema : step4Schema;
    default: return step1Schema;
  }
};

    const { control, trigger, getValues, reset, watch,setValue, formState: { errors } } = useForm<EmployeeFormData>({
      resolver: zodResolver(getCurrentSchema()),
      defaultValues: initialData,
      mode: 'onChange'
    });

    const funcaoSelecionada = watch("funcao");
    const isAdminRole = funcaoSelecionada?.accessLevel === 'ROLE_ADMIN';
    const hasAccess = funcaoSelecionada?.accessLevel !== "NO_ACCESS";
    const totalSteps = hasAccess && !isEditMode ? 4 : 3;


useEffect(() => {
      if (isAdminRole) {
        setValue("loja", null);
      }
    }, [isAdminRole, setValue]);
    useEffect(() => {
      const loadSelectData = async () => {
        try {
          // Carrega as listas usadas pelos selects do formulário: localidade, loja e função.
          // O useEffect depende das funções e do user?.idl, por isso essas funções devem ser estáveis.
          const [locs, shops, roles] = await Promise.all([
            listarLocalidades(),
            listarLojas(),
            listar()
          ]);
          setLocalidades(locs);
          const visibleShops = isManagerRole
            ? shops.filter((shop: { id: number; nome: string }) => String(shop.id) === String(user?.idl || ''))
            : shops;
          setLojas(visibleShops);
          setFuncoes(roles);
        } catch (error) {
          console.error(error);
          showErrorToast("Erro ao carregar dados de selects");
        }
      };
      loadSelectData();
    }, [isManagerRole, listar, listarLocalidades, listarLojas, user?.idl]);

    useEffect(() => {
      reset(initialData);
      setPreviewUrl(
        initialData.imagem
          ? typeof initialData.imagem === "string"
            ? initialData.imagem
            : URL.createObjectURL(initialData.imagem)
          : null
      );
      setSelectedFile(initialData.imagem && typeof initialData.imagem !== "string" ? initialData.imagem : null);
    }, [initialData, reset]);

   useEffect(() => {
  // Cria a URL de preview, se houver selectedFile
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // void retornado
    }
  };
}, [previewUrl]);
    const handleFileChange = (file: File | null) => {
      if (!file) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setSizeError(false);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setSizeError(true);
        setPreviewUrl(null);
        setUploadProgress(0);
        setSelectedFile(null);
        showErrorToast("Ficheiro demasiado grande! O limite para a foto do utilizador é de 1MB.");
        return;
      }

      setSizeError(false);
      setIsProcessing(true);
      setUploadProgress(0);
      setSelectedFile(null);

      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      reader.onloadend = () => {
        setPreviewUrl(URL.createObjectURL(file));
        setSelectedFile(file);
        setUploadProgress(100);
        setIsProcessing(false);
      };

      reader.readAsArrayBuffer(file);
    };

    const handleRemoveImage = () => {
      setPreviewUrl(null);
      setSelectedFile(null);
      setUploadProgress(0);
      setSizeError(false);
    };

    const handleNext = async () => {
      const values = getValues(); // pega todos os dados do form
  if (step === 2) {
    console.log("Step 3 valores antes de validar:", values);
  }
      const valid = await trigger();
      if (valid) setStep(s => s + 1);
      else showErrorToast("Preencha corretamente os campos obrigatórios da etapa atual.");
    };
    const handleBack = () => setStep(s => s - 1);

    useImperativeHandle(ref, () => ({
      trigger: async () => await trigger(),
      getValues: () => ({ ...getValues(), imagem: selectedFile }),
      resetStep: () => setStep(0)
    }));

    const progressValue = ((step + 1) / totalSteps) * 100;

    return (
      <div className="space-y-3">
        {/* PROGRESSO */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Etapa {step + 1} de {totalSteps}</span>
            <span>{Math.round(progressValue)}% concluído</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

    
{/* ================= STEP 1 - IDENTIFICAÇÃO E FOTO ================= */}
{step === 0 && (
  <div className="grid grid-cols-12 gap-y-4 gap-x-6 animate-in fade-in duration-500">

    {/* COLUNA DA ESQUERDA: NOME */}
    <div className="col-span-12 md:col-span-8 space-y-4">
      <Controller
        name="nome"
        control={control}
        render={({ field }) => (
          <FormField
            label="Nome Completo *"
            placeholder="Ex: João Silva"
            {...field}
            error={errors.nome?.message}
            disabled={isLoading}
          />
        )}
      />

      <p className="text-[11px] text-slate-400 italic">
        Certifique-se que o nome coincide com o documento de identificação.
      </p>
    </div>

    {/* COLUNA DA DIREITA: FOTO COMPACTA */}
    {!isEditMode && (
      <div className="col-span-12 md:col-span-4">
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex items-center gap-4 h-full min-h-[110px]">
          <div className="relative shrink-0">
            <div className={cn(
              "w-20 h-20 rounded-full border-4 border-white shadow-sm flex items-center justify-center overflow-hidden transition-all",
              previewUrl ? "ring-2 ring-blue-500" : "bg-slate-100 ring-2 ring-slate-200"
            )}>
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              ) : previewUrl ? (
                <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
              ) : (
                <Camera size={24} className="text-slate-300" />
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />

            {previewUrl && !isProcessing && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all z-20"
                title="Remover foto"
              >
                <X size={10} strokeWidth={4} />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fotografia</p>
            {sizeError ? (
              <p className="text-[10px] text-red-600 font-bold leading-tight uppercase animate-pulse">Erro: maior que 1MB</p>
            ) : (isProcessing || uploadProgress > 0) ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-bold uppercase">
                  <span className={uploadProgress === 100 ? "text-emerald-600" : "text-blue-500"}>
                    {uploadProgress === 100 ? "✓ Pronto" : "Lendo..."}
                  </span>
                  <span className="text-slate-400">{uploadProgress}%</span>
                </div>
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-300", uploadProgress === 100 ? "bg-emerald-500" : "bg-blue-500")}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 leading-tight">Clique no círculo para adicionar</p>
            )}
          </div>
        </div>
      </div>
    )}

    {/* LINHA DE BAIXO: BI, NIF E EMAIL */}
    <div className="col-span-12 md:col-span-4">
      <Controller
        name="bi"
        control={control}
        render={({ field }) => (
          <FormField label="Número do BI *" placeholder="123456789LA040" {...field} error={errors.bi?.message} disabled={isLoading} />
        )}
      />
    </div>

    <div className="col-span-12 md:col-span-4">
      <Controller
        name="contribuinte"
        control={control}
        render={({ field }) => (
          <FormField label="Número de Contribuinte *" placeholder="541236547" {...field} error={errors.contribuinte?.message} disabled={isLoading} />
        )}
      />
    </div>

    <div className="col-span-12 md:col-span-4">
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <FormField
            label="Email *"
            placeholder="joao@exemplo.com"
            type="email"
            {...field}
            error={errors.email?.message}
            disabled={isLoading}
          />
        )}
      />
    </div>
  </div>
)}
        {/* ================= STEP 2 ================= */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <Controller name="contactoprincipal" control={control} render={({ field }) => (
              <FormField label="Contacto Principal *" placeholder="Ex: 923 000 000" {...field} error={errors.contactoprincipal?.message} disabled={isLoading} />
            )} />
            <Controller name="contactosecudario" control={control} render={({ field }) => (
              <FormField label="Contacto Secundário" placeholder="Opcional" {...field} error={errors.contactosecudario?.message} disabled={isLoading} />
            )} />
            <Controller name="dataNascimento" control={control} render={({ field }) => (
              <FormField type="date" label="Data de Nascimento *" {...field} error={errors.dataNascimento?.message} disabled={isLoading} />
            )} />
            <Controller name="dataAdmissao" control={control} render={({ field }) => (
              <FormField type="date" label="Data de Admissão *" {...field} error={errors.dataAdmissao?.message} disabled={isLoading} />
            )} />
          </div>
        )}

      {/* ================= STEP 3 ================= */}
{step === 2 && (
  <div className="grid grid-cols-2 gap-4">
    {/* Género */}
    <Controller
      name="sexo"
      control={control}
      render={({ field }) => (
        <FormField
          name="sexo"
          label="Género *"
          type="select"
          options={[
            { value: "M", label: "Masculino" },
            { value: "F", label: "Feminino" }
          ]}
          value={field.value}
          onSelectChange={field.onChange}
          error={errors.sexo?.message}
          disabled={isLoading}
        />
      )}
    />

    {/* Loja */}
    <Controller
  name="loja"
  control={control}
  render={({ field }) => (
    <FormField
      name="loja"
      label={isAdminRole ? "Unidade (Acesso Global)" : "Loja *"}
      type="select"
      options={lojas.map(l => ({ value: String(l.id), label: l.nome }))}
      value={isAdminRole ? "" : (field.value?.id ? String(field.value.id) : '')}
      onSelectChange={(id) => {
        const selected = lojas.find(l => String(l.id) === id) || null;
        field.onChange(selected);
      }}
      error={errors.loja?.message}
      disabled={isLoading || isAdminRole}
    />
  )}
/>
    {/* Localidade */}
    <Controller
      name="localidade"
      control={control}
      render={({ field }) => (
        <FormField
          name="localidade"
          label="Localidade *"
          type="select"
          options={localidades.map(l => ({ value: String(l.id), label: l.nome }))}
          value={field.value?.id ? String(field.value.id) : ''}
          onSelectChange={(id) => {
            const selected = localidades.find(l => String(l.id) === String(id)) || null;
            field.onChange(selected);
          }}
          error={errors.localidade?.message}
          disabled={isLoading}
        />
      )}
    />

    {/* Função */}
    <Controller
      name="funcao"
      control={control}
      render={({ field }) => (
        <FormField
          name="funcao"
          label="Função *"
          type="select"
          options={funcoes
            .filter((f) => {
              if (!isManagerRole) return true;
              return String(f.accessLevel) !== 'ROLE_ADMIN';
            })
            .map(f => ({ value: String(f.id), label: f.nomecargo }))}
          value={field.value?.id ? String(field.value.id) : ''}
          onSelectChange={(id) => {
            const selected = funcoes.find(f => String(f.id) === String(id)) || null;
            if (selected) {
              const normalizedAccess = String(selected.accessLevel);
              if (isManagerRole && normalizedAccess === 'ROLE_ADMIN') {
                showErrorToast('Gerentes não podem criar utilizadores administradores.');
                field.onChange(null);
                return;
              }
              field.onChange({
                ...selected,
                accessLevel: normalizedAccess
              });
            } else field.onChange(null);
          }}
          error={errors.funcao?.message}
          disabled={isLoading}
        />
      )}
    />
  </div>
)}

{/* ================= STEP 4 ================= */}
{/* Step 4: credenciais de acesso. Deve aparecer somente em criação de usuário com acesso. */}
{step === 3 && hasAccess && !isEditMode && (
  <div className="grid grid-cols-2 gap-4">
    <div className="col-span-2 bg-primary/5 p-3 rounded-md mb-2">
      <p className="text-xs text-primary font-medium">Esta função exige credenciais de acesso ao sistema.</p>
    </div>
    <Controller
      name="username"
      control={control}
      render={({ field }) => (
        <FormField
          label="Nome de Utilizador *"
          placeholder="Ex: joao.silva"
          {...field}
          error={errors.username?.message}
          disabled={isLoading}
        />
      )}
    />
    <Controller
      name="password"
      control={control}
      render={({ field }) => (
        <FormField
          label="Senha de Acesso *"
          type="password"
          placeholder="********"
          {...field}
          error={errors.password?.message}
          disabled={isLoading}
        />
      )}
    />
  </div>
)}

        {/* NAVEGAÇÃO */}
        <div className="flex justify-between pt-0 border-t">
          <Button variant="outline" onClick={handleBack} disabled={step === 0 || isLoading} type="button">Anterior</Button>
          {step < totalSteps - 1 ? (
            <Button onClick={handleNext} type="button" disabled={isLoading}>Próximo</Button>
          ) : (
            <div className="text-xs text-muted-foreground italic flex items-center">Pode agora confirmar o registo no botão abaixo.</div>
          )}
        </div>
      </div>
    );
  }
);

EmployeeForm.displayName = "EmployeeForm";
export default EmployeeForm;