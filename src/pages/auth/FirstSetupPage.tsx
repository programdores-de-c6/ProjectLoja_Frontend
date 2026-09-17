/**
 * ====================================================
 * FIRST SETUP PAGE - ASSISTENTE DE INSTALAÇÃO (STRICT)
 * ====================================================
 * 
 * Responsável pela configuração inicial do sistema (Km 0).
 * Fluxo: Dados do Dono -> Dados da Unidade + Localidade Dinâmica.
 * 


 */

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Building2, 
  Loader2, 
  ShieldCheck, 
  Fingerprint,
  MapPinned,
  ArrowRight,
  ArrowLeft, CheckCircle2
} from 'lucide-react';

// Componentes da Interface (UI)
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';

// Utilitários de comunicação e feedback
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import api from '@/config/api';

// ====================================================
// INTERFACES (STRICT TYPING)
// ====================================================

/** Interface para o erro padronizado do Backend Java */
interface BackendError {
  message: string;
  error?: string;
  status?: number;
}

/** Interface para a lista de distritos pré-carregados */
interface Distrito {
  id: number;
  nome: string;
}

/** Interface para o estado do formulário de setup */
interface InitialSetupFormData {
  // Identidade do Dono
  adminNome: string;
  adminEmail: string;
  adminUsername: string;
  adminSenha: string;
  
  // Identidade da Empresa
  shopNome: string;
  shopNif: string;
  shopType: 'GRAFICA' | 'LOJA';
  
  // Localidade Criada na Hora
  nomeLocalidade: string;
  idDistrito: string; // ID como string para o componente Select
}

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const FirstSetupPage: React.FC = () => {
  const navigate = useNavigate();
  
  // ESTADOS DE CONTROLE
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [distritos, setDistritos] = useState<Distrito[]>([]);

  // Estado inicial do formulário (Km 0)
  const [formData, setFormData] = useState<InitialSetupFormData>({
    adminNome: '',
    adminEmail: '',
    adminUsername: '',
    adminSenha: '',
    shopNome: '',
    shopNif: '',
    shopType: 'GRAFICA',
    nomeLocalidade: '',
    idDistrito: ''
  });

  /**
   * useEffect: Carrega os distritos de São Tomé e Príncipe.
   * Permite que o utilizador vincule o seu bairro a um distrito real.
   */
  useEffect(() => {
    const fetchDistritos = async (): Promise<void> => {
      try {
        // Rota pública definida no DistritoController
        const response = await api.get<Distrito[]>('/distritos/listar');
        setDistritos(response.data);
      } catch (error) {
        console.error("Erro ao carregar distritos para o setup.");
      }
    };
    fetchDistritos();
  }, []);

  /**
   * handleInputChange: Atualização reativa dos campos de texto.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * handleFinish: Submete o setup completo ao Java.
   * O Java criará a Localidade, a Loja, o Cargo e o Dono em uma transação única.
   */
  const handleFinish = async (): Promise<void> => {
    // Validação de campos obrigatórios
    if (!formData.idDistrito || !formData.nomeLocalidade || !formData.shopNif) {
      showErrorToast("Por favor, preencha todos os dados da empresa.");
      return;
    }

    setLoading(true); // Mantém o estado de carregamento durante o processo e o delay
    
    try {
      // 1. Envia os dados para o Backend
      await api.post('/employee/setup-initial', formData);
      
      // 2. Mostra a mensagem de sucesso
      showSuccessToast("Sistema configurado com sucesso! A preparar o acesso...");

      // 3. ⏳ ATRASO DE 3 SEGUNDOS (3000ms)
      // Usamos o setTimeout para dar tempo ao utilizador de ler o "Toast"
      setTimeout(() => {
        // 4. Força o recarregamento total para o App.tsx detetar o needsSetup: false
        window.location.href = '/login';
      }, 3000);

    } catch (error: unknown) {
      // Em caso de erro, paramos o loading imediatamente para permitir correção
      setLoading(false); 
      
      let errorMessage = "Erro na instalação inicial.";
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as BackendError;
        errorMessage = data.message || errorMessage;
      }
      showErrorToast(errorMessage);
    } 
    // Nota: O finally foi removido ou alterado para não dar 'setLoading(false)' 
    // no sucesso, senão o botão voltaria a ficar ativo durante os 3 segundos.
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decorativo Estilo Gráfica */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600" />
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-[520px] space-y-6 relative z-10">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <ShieldCheck size={12} /> Instalação de Sistema Profissional
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">SETUP INICIAL</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Passo {step} de 2</p>
        </div>

        <Card className="border-none shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10">
            
            {/* PASSO 1: IDENTIDADE DO PROPRIETÁRIO */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-1 mb-8">
                  <h2 className="text-xl font-black text-slate-800 uppercase leading-none flex items-center gap-2">
                    <User className="text-blue-600" /> Administrador Master
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">Esta será a conta principal do sistema.</p>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome Completo</Label>
                    <Input 
                      name="adminNome"
                      placeholder="Ex: Alberto Santos" 
                      className="h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500"
                      value={formData.adminNome} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome de Utilizador</Label>
                      <div className="relative">
                        <Fingerprint className="absolute left-3 top-3.5 h-4 w-4 text-blue-500" />
                        <Input 
                          name="adminUsername"
                          placeholder="admin.master" 
                          className="h-12 pl-9 bg-slate-50 border-none rounded-2xl font-bold text-blue-600"
                          value={formData.adminUsername} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</Label>
                      <Input 
                        name="adminEmail"
                        type="email"
                        placeholder="seu@email.com" 
                        className="h-12 bg-slate-50 border-none rounded-2xl"
                        value={formData.adminEmail} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Senha Master</Label>
                    <Input 
                      name="adminSenha"
                      type="password" 
                      placeholder="Segurança mínima: 6 caracteres" 
                      className="h-12 bg-slate-50 border-none rounded-2xl"
                      value={formData.adminSenha} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <Button 
                  className="w-full bg-slate-900 hover:bg-blue-600 h-14 mt-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-100" 
                  onClick={() => setStep(2)}
                  disabled={!formData.adminNome || !formData.adminUsername || !formData.adminSenha}
                >
                  Continuar para Unidade <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* PASSO 2: UNIDADE DE NEGÓCIO + LOCALIDADE DINÂMICA */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-1 mb-8">
                  <h2 className="text-xl font-black text-slate-800 uppercase leading-none flex items-center gap-2">
                    <Building2 className="text-emerald-600" /> Detalhes da Unidade
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">Configure a sua Gráfica ou Livraria.</p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome Comercial da Unidade</Label>
                    <Input 
                      name="shopNome"
                      placeholder="Ex: Gráfica Livraria São Tomé" 
                      className="h-12 bg-slate-50 border-none rounded-2xl"
                      value={formData.shopNome} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">NIF / Contribuinte</Label>
                      <Input 
                        name="shopNif"
                        placeholder="NIF da Empresa" 
                        className="h-12 bg-slate-50 border-none rounded-2xl font-bold"
                        value={formData.shopNif} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tipo de Negócio</Label>
                      <Select 
                        defaultValue="GRAFICA"
                        onValueChange={(v: 'GRAFICA' | 'LOJA') => setFormData(prev => ({ ...prev, shopType: v }))}
                      >
                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GRAFICA">GRÁFICA (Serviços)</SelectItem>
                          <SelectItem value="LOJA">LOJA / LIVRARIA (Comércio)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* SEÇÃO DE LOCALIDADE DINÂMICA */}
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 mt-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <MapPinned size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Endereço da Unidade</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Distrito</Label>
                        <Select onValueChange={(v) => setFormData(prev => ({ ...prev, idDistrito: v }))}>
                          <SelectTrigger className="h-10 bg-white border-none rounded-xl shadow-sm">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {distritos.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>{d.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Bairro / Local</Label>
                        <Input 
                          name="nomeLocalidade"
                          placeholder="Ex: Almas" 
                          className="h-10 bg-white border-none rounded-xl shadow-sm"
                          value={formData.nomeLocalidade} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="ghost" className="h-14 px-6 rounded-2xl font-bold text-slate-400" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100" 
                    onClick={handleFinish} 
                    disabled={loading || !formData.shopNome || !formData.nomeLocalidade || !formData.idDistrito}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Finalizar Instalação <CheckCircle2 className="ml-2 h-4 w-4" /></>}
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
        
        <p className="text-center text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">
          Ambiente Seguro &bull; Todos os direitos reservados &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default FirstSetupPage;