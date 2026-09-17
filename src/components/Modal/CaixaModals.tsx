/**
 * ====================================================
 * CAIXA MODALS - VERSÃO 100% TIPADA (SEM ANY)
 * ====================================================
 */

import React, { useState, useEffect, ChangeEvent } from "react";
import { Lock, Unlock, AlertTriangle, ArrowLeft, Printer, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/contexts/useAuth";
import { useCaixa } from "@/contexts/CaixaContext";
import { 
  useCaixaService, 
  OpenCaixaFormData, 
  CloseCaixaFormData, 
  CaixaSession 
} from "../../pages/caixa/CaixaService";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { printCaixaClosingPdf } from "@/utils/caixaReceiptPdf";

// Interface para erro padrão do Backend
interface BackendError {
  message: string;
}

// ====================================================
// MODAL DE ABERTURA DE CAIXA
// ====================================================

interface OpenCaixaModalProps {
  open: boolean;
}

export const OpenCaixaModal: React.FC<OpenCaixaModalProps> = ({ open }) => {
  const [valorAbertura, setValorAbertura] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const { setCaixa } = useCaixa();
  const { abrirCaixa } = useCaixaService();

  const handleOpenCaixa = async (): Promise<void> => {
    if (!user?.id) {
      showErrorToast("Erro: Utilizador não identificado.");
      return;
    }

    setIsProcessing(true);
    try {
      const openData: OpenCaixaFormData = {
        employeeOpened: { id: Number(user.id) },
        valorInicial: valorAbertura 
      };

      const newSession: CaixaSession = await abrirCaixa(openData);
      setCaixa(newSession);
      showSuccessToast(`Caixa aberto com sucesso!`);
    } catch (error) {
      let msg = "Erro ao abrir caixa no servidor.";
      if (axios.isAxiosError(error) && error.response) {
        msg = (error.response.data as BackendError).message || msg;
      }
      showErrorToast(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setValorAbertura(Math.max(0, parseFloat(e.target.value) || 0));
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[425px] border-2 border-blue-50 shadow-2xl [&>button]:hidden" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-2">
            <Unlock className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold">Abertura de Turno</DialogTitle>
          <DialogDescription>
            Introduza o valor do fundo de maneio disponível na gaveta.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-3 text-center">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Valor Inicial (Fundo)
            </Label>
            <div className="relative max-w-[220px] mx-auto">
              <span className="absolute left-4 top-3.5 text-blue-600 font-black text-sm">db</span>
              <Input
                type="number"
                className="pl-12 h-14 text-2xl font-black text-center text-blue-700 border-2 border-blue-100 focus:border-blue-500 rounded-xl"
                placeholder="0.00"
                value={valorAbertura === 0 ? "" : valorAbertura}
                onChange={handleInputChange}
                autoFocus
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")} 
            disabled={isProcessing}
            className="flex-1 text-slate-400 font-bold hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Sair
          </Button>

          <Button
            className="flex-[2] h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg rounded-xl transition-all"
            onClick={handleOpenCaixa}
            disabled={isProcessing}
          >
            {isProcessing ? "A Sincronizar..." : "Abrir e Vender"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ====================================================
// MODAL DE FECHO DE CAIXA
// ====================================================

interface CloseCaixaModalProps {
  open: boolean;
  onClose: () => void;
  valorSugerido?: number;
  caixaId?: number;
}

export const CloseCaixaModal: React.FC<CloseCaixaModalProps> = ({ 
  open, 
  onClose, 
  valorSugerido = 0, 
  caixaId 
  
}) => {
  const [valorFecho, setValorFecho] = useState<number>(valorSugerido);
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const { currentCaixa, setCaixa } = useCaixa();
  const { fecharCaixa } = useCaixaService();

  useEffect(() => {
    if (open) {
      setValorFecho(valorSugerido);
    }
  }, [open, valorSugerido]);

  const handleCloseCaixa = async (): Promise<void> => {
    const idParaFechar = caixaId || currentCaixa?.id;

    if (!idParaFechar || !user?.id) {
      showErrorToast("Erro: Sessão ou utilizador inválido.");
      return;
    }

    setIsProcessing(true);
    try {
      const closeData: CloseCaixaFormData = {
        id: Number(idParaFechar), 
        employeeId:  Number(user.id),
        valor: valorFecho
      };

      const result: CaixaSession = await fecharCaixa(closeData);
      
      // Impressão tipada
      printCaixaClosingPdf(result);

      if (idParaFechar === currentCaixa?.id) {
        setCaixa(null);
      }
      
      showSuccessToast(`Caixa #${idParaFechar} encerrado com sucesso!`);
      onClose();
    } catch (error) {
      let msg = "Não foi possível encerrar a sessão.";
      if (axios.isAxiosError(error) && error.response) {
        msg = (error.response.data as BackendError).message || msg;
      }
      showErrorToast(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setValorFecho(Math.max(0, parseFloat(e.target.value) || 0));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
        <DialogHeader className="items-center text-center">
          <div className="bg-red-50 p-3 rounded-full mb-2 border border-red-100">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-800">Encerrar Turno</DialogTitle>
          <DialogDescription className="text-xs">
            Confirme o valor total contado na gaveta (Vendas + Fundo).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          <div className="space-y-2 text-center">
            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center justify-center gap-2">
              <Calculator size={12} /> Total Físico (db)
            </Label>
            <Input
              type="number"
              className="h-16 text-3xl font-black text-center border-red-100 text-red-600 focus:ring-red-500 bg-red-50/30 rounded-xl"
              placeholder="0.00"
              value={valorFecho === 0 ? "" : valorFecho}
              onFocus={(e) => e.target.select()}
              onChange={handleInputChange}
              autoFocus
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-amber-800 leading-tight uppercase">Conferência</p>
              <p className="text-[10px] text-amber-700 leading-tight italic">
                O valor sugerido baseia-se nas vendas registadas mais o fundo inicial.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 text-slate-400 font-bold">
            Cancelar
          </Button>
          <Button
            className="flex-[2] h-12 font-black bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 rounded-xl flex items-center gap-2"
            onClick={handleCloseCaixa}
            disabled={isProcessing}
          >
            {isProcessing ? "A encerrar..." : <><Printer size={18} /> Confirmar Fecho</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};