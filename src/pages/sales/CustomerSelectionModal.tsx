/**
 * ====================================================
 * CUSTOMER SELECTION MODAL - BOTÃO NOVO OTIMIZADO
 * ====================================================
 */

import React, { useState, useMemo, useCallback } from 'react';
// Importação do UserRoundPlus para um look mais moderno
import { Search, AlertCircle, CheckCircle2, ArrowLeft, UserRoundPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Importação da interface oficial
import { Customer } from '@/pages/Customer/CustomerService';

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void; 
  customers: Customer[];
  isLoading?: boolean;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  customers,
  isLoading = false,
}) => {
  // --- ESTADOS DO MODAL ---
  const [searchTerm, setSearchTerm] = useState(''); 
  const [quickName, setQuickName] = useState('');   
  const [quickNif, setQuickNif] = useState('');     
  const [isManualMode, setIsManualMode] = useState(false); 

  // --- LÓGICA DE FILTRAGEM ---
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return customers.filter((customer) =>
      customer.nome.toLowerCase().includes(lowerSearchTerm) ||
      (customer.numeroContribuinte && customer.numeroContribuinte.includes(searchTerm))
    );
  }, [searchTerm, customers]);

  // --- VALIDAÇÃO DE NIF (9 dígitos) ---
  const isNifValid = useMemo(() => {
    const nifLimpo = quickNif.replace(/\D/g, ''); 
    return nifLimpo.length === 9;
  }, [quickNif]);

  /**
   * handleSelectCustomer: Fecha o modal e envia o cliente para a venda
   */
  const handleSelectCustomer = useCallback(
    (customer: Customer) => {
      onSelect(customer); 
      handleClose();      
    },
    [onSelect]
  );

  /**
   * handleQuickCustomer: Cria um cliente temporário
   */
  const handleQuickCustomer = useCallback(() => {
    if (!quickName.trim() || !isNifValid) return;

    const newCustomer = {
      id: "TEMP_" + Date.now(), 
      nome: quickName,
      numeroContribuinte: quickNif,
      contactoPrincipal: "",
      email: ""
    } as Customer;

    handleSelectCustomer(newCustomer);
  }, [quickName, quickNif, isNifValid, handleSelectCustomer]);

  /**
   * handleClose: Reseta os campos ao fechar
   */
  const handleClose = () => {
    setSearchTerm('');
    setQuickName('');
    setQuickNif('');
    setIsManualMode(false); 
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        
        {/* CABEÇALHO */}
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <UserRoundPlus className="h-5 w-5 text-indigo-600" />
            {isManualMode ? "Registo Rápido" : "Selecionar Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isManualMode ? "Insira os dados do novo cliente abaixo." : "Pesquise na base de dados ou crie um novo registo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 p-6 pt-2 overflow-hidden">
          
          {/* BARRA DE BUSCA + BOTÃO NOVO MODERNO */}
          {!isManualMode && (
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Buscar por nome ou NIF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-11 border-slate-200 focus:ring-indigo-500 rounded-lg bg-white shadow-sm"
                    />
                </div>
                
                {/* ✅ BOTÃO NOVO - DESIGN MODERNO E ELEGANTE */}
                <Button 
                    onClick={() => setIsManualMode(true)}
                    className="h-11 px-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 border-none active:scale-95"
                    title="Registo Manual"
                >
                    <UserRoundPlus className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-widest">Novo</span>
                </Button>
            </div>
          )}

          {/* ÁREA DE CONTEÚDO */}
          <ScrollArea className="flex-1 border rounded-xl bg-slate-50/30">
            <div className="p-4 space-y-2">
              
              {!isManualMode && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full text-left p-4 rounded-lg border border-white bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm group"
                  >
                    <p className="font-bold text-slate-700 group-hover:text-indigo-700">{customer.nome}</p>
                    <div className="flex gap-4 mt-1 text-[11px] font-medium text-slate-400 uppercase">
                      <span>NIF: {customer.numeroContribuinte || '---'}</span>
                      {customer.contactoPrincipal && <span>Tel: {customer.contactoPrincipal}</span>}
                    </div>
                  </button>
                ))
              ) : (
                <div className="space-y-4 p-6 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/50">
                   <div className="flex justify-between items-center">
                    <div className="text-left">
                        <p className="font-bold text-amber-800 uppercase text-xs">Dados do Cliente</p>
                        <p className="text-[11px] text-amber-700 font-medium">Preencha nome e NIF válido.</p>
                    </div>
                    {isManualMode && (
                        <button 
                            onClick={() => setIsManualMode(false)}
                            className="text-[10px] font-bold text-amber-600 flex items-center gap-1 hover:underline"
                        >
                            <ArrowLeft size={12} /> VOLTAR À BUSCA
                        </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-800 uppercase ml-1">Nome Completo</label>
                      <Input 
                        placeholder="Ex: João Silva" 
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        className="bg-white border-amber-200 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-800 uppercase ml-1">NIF (9 dígitos)</label>
                      <div className="relative">
                        <Input 
                          placeholder="000000000" 
                          maxLength={9}
                          value={quickNif}
                          onChange={(e) => setQuickNif(e.target.value.replace(/\D/g, ''))}
                          className={`bg-white pr-10 ${quickNif.length > 0 && !isNifValid ? 'border-red-400' : 'border-amber-200'}`}
                        />
                        <div className="absolute right-3 top-2.5">
                          {isNifValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            quickNif.length > 0 && <AlertCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleQuickCustomer}
                      disabled={!quickName.trim() || !isNifValid || isLoading}
                      className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-xs tracking-wider shadow-md"
                    >
                      Utilizar este Cliente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSelectionModal;