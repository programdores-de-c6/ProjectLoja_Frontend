/**
 * ====================================================
 * CUSTOMER SELECTOR - VERSÃO COM CLIENTE INFORMAL
 * ====================================================
 */
import React from 'react';
import { User, X, Search, UserPen  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // ✅ Importar o Input do seu UI kit

// Interface oficial
import { Customer } from '@/pages/Customer/CustomerService';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  // ✅ NOVAS PROPS: Vindas do useSaleLogic para o nome informal
  nomeInformal: string;
  setNomeInformal: (nome: string) => void;
  onSelectCustomer: () => void;
  onRemoveCustomer: () => void;
  isLoading?: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  nomeInformal,
  setNomeInformal,
  onSelectCustomer,
  onRemoveCustomer,
  isLoading = false,
}) => {

  // ====================================================
  // ESTADO 1: NENHUM CLIENTE SELECIONADO (Mostra Busca + Campo Informal)
  // ====================================================
  if (!selectedCustomer) {
    return (
      <div className="space-y-2 animate-in fade-in duration-300">
        {/* Botão de Busca (F4) */}
        <Button
          variant="outline"
          onClick={onSelectCustomer}
          disabled={isLoading}
          className="w-full border-dashed border-2 h-10 flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">Selecionar Cliente (F4)</span>
        </Button>

        {/* Campo para Nome Informal (Apenas para o recibo) */}
        <div className="relative group">
          <div className="absolute left-2.5 top-2">
            <UserPen className="h-3 w-3 text-slate-300 group-focus-within:text-blue-500" />
          </div>
          <Input 
            placeholder="Nome apenas para o recibo..."
            value={nomeInformal}
            onChange={(e) => setNomeInformal(e.target.value)}
            className="h-7 pl-7 text-[10px] bg-slate-50/50 border-slate-200 focus:bg-white transition-all italic"
          />
        </div>
      </div>
    );
  }

  // ====================================================
  // ESTADO 2: CLIENTE FORMAL SELECIONADO (Mostra Cartão Azul)
  // ====================================================
  return (
    <div className="flex items-center justify-between p-2 border border-blue-100 rounded-lg bg-blue-50/30 shadow-sm animate-in zoom-in-95 duration-200">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Ícone de utilizador em destaque */}
        <div className="bg-blue-600 p-1.5 rounded-full text-white shrink-0 shadow-sm">
          <User className="h-3.5 w-3.5" />
        </div>
        
        <div className="flex flex-col leading-tight truncate">
          {/* NOME DO CLIENTE FORMAL */}
          <span className="text-xs font-black text-slate-800 uppercase truncate">
            {selectedCustomer.nome}
          </span>
          
          {/* NIF: Se for um cliente rápido, mostra o NIF digitado, senão o do banco */}
          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">
            NIF: {selectedCustomer.numeroContribuinte || '999999999'}
          </span>
        </div>
      </div>

      {/* Botão para limpar a seleção e voltar ao Estado 1 */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRemoveCustomer} 
        className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CustomerSelector;