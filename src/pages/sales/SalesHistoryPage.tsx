/**
 * ====================================================
 * SALES HISTORY PAGE - VERSÃO MULTI-CAIXA
 * ====================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptText, RefreshCw, ArrowLeft, Lock, Calendar, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Adicionado useSearchParams

import { printSaleReceiptPdf } from '@/utils/saleReceiptPdf';
import { RecentSale } from '@/types/sale-pdf'; 

import { useCaixa } from '@/contexts/CaixaContext';
import { useSalesService } from './SalesService';
import { RecentSalesTable } from './RecentSalesTable';
import { CloseCaixaModal } from '@/components/Modal/CaixaModals';
import { SaleDetailsModal } from './SaleDetailsModal';
import { showErrorToast } from '@/utils/toast';

export const SalesHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 1. CAPTURAR ID DA URL (Ex: ?caixaId=10)
  const caixaIdFromUrl = searchParams.get('caixaId');

  // 2. CONSUMO DE SERVIÇOS
  const { currentCaixa } = useCaixa(); 
  const { listarPorCaixa, getById } = useSalesService(); 

  // 3. DEFINIR QUAL CAIXA ESTAMOS A VER
  // Se veio da URL, usamos esse. Se não, usamos o que está aberto no momento.
  const targetBoxId = caixaIdFromUrl || currentCaixa?.id;
  // Verifica se o que estamos a ver é o nosso próprio caixa ativo
  const isViewingCurrentSession = targetBoxId === currentCaixa?.id;

  const [sales, setSales] = useState<RecentSale[]>([]); 
  const [selectedSale, setSelectedSale] = useState<RecentSale | null>(null);
  const [loading, setLoading] = useState(false);        
  const [showCloseModal, setShowCloseModal] = useState(false); 
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);   

  /**
   * loadSales: Agora usa o targetBoxId (que pode ser da URL)
   */
  const loadSales = useCallback(async () => {
    if (!targetBoxId) return;
    setLoading(true);
    try {
      const data = await listarPorCaixa(Number(targetBoxId));
      setSales(data); 
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      showErrorToast("Não foi possível carregar as vendas deste turno.");
    } finally {
      setLoading(false);
    }
  }, [targetBoxId, listarPorCaixa]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Handlers para Detalhes e Reimpressão (Mantêm-se iguais)
  const handleViewDetails = async (saleResumida: RecentSale) => {
    setLoading(true);
    try {
      const fullData = await getById(String(saleResumida.id));
      setSelectedSale(fullData); 
      setIsDetailsOpen(true);    
    } catch (error) {
      showErrorToast("Erro ao carregar detalhes.");
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = async (saleResumida: RecentSale) => {
    setLoading(true);
    try {
      const fullData = await getById(String(saleResumida.id));
      printSaleReceiptPdf(fullData, 'A5'); 
    } catch (error) {
      showErrorToast("Erro ao gerar recibo.");
    } finally {
      setLoading(false);
    }
  };
  // 1. Calcula o total das vendas que estão na tabela
  const totalFacturado = sales.reduce((acc, s) => acc + (s.totalGeral || 0), 0);

  // 2. Define o valor inicial (Fundo de Maneio)
  const valorInicial = isViewingCurrentSession ? (currentCaixa?.valorInicial || 0) : 0;

  // 3. Valor Total Sugerido para o Fecho (O que deve estar na gaveta)
  const valorTotalSugerido = totalFacturado + valorInicial;


  // --- 4. NOVA PROTEÇÃO INTELIGENTE ---
  // Se não houver ID na URL E o caixa do utilizador estiver fechado, mostra aviso.
  // Mas se houver ID na URL, permitimos ver mesmo que esteja fechado (modo consulta).
  if (!caixaIdFromUrl && !currentCaixa?.id) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="bg-slate-100 p-6 rounded-full"><Lock className="h-16 w-16 text-slate-400" /></div>
        <h2 className="text-2xl font-black text-slate-800 uppercase">Nenhum Turno Ativo</h2>
        <p className="text-slate-500 max-w-xs">Abra o caixa primeiro ou selecione um turno na Gestão de Caixas.</p>
        <Button onClick={() => navigate('/sales')} className="bg-blue-600 font-bold uppercase">Ir para Vendas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 animate-in fade-in duration-500">
      
      {/* CABEÇALHO DINÂMICO */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase flex items-center gap-2">
              <ReceiptText className="h-6 w-6 text-blue-600" /> 
              {isViewingCurrentSession ? "Histórico do Meu Turno" : `Consulta de Turno #${targetBoxId}`}
            </h1>
            <div className="flex gap-3">
               <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1">
                 <Calendar className="h-3 w-3" /> Sessão: #{targetBoxId}
               </p>
               {caixaIdFromUrl && (
                 <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest flex items-center gap-1">
                   <Lock className="h-3 w-3" /> MODO APENAS LEITURA
                 </p>
               )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSales} disabled={loading} className="font-bold uppercase text-[10px] h-9">
            <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          
          {/* SÓ MOSTRA O BOTÃO DE FECHAR SE FOR O MEU CAIXA ATIVO */}
          {isViewingCurrentSession && (
            <Button variant="destructive" size="sm" onClick={() => setShowCloseModal(true)} className="font-bold uppercase text-[10px] h-9">
              <Lock className="h-3 w-3 mr-2" /> Encerrar Meu Turno
            </Button>
          )}
        </div>
      </div>

      {/* TABELA DE RESULTADOS */}
      <Card className="shadow-md border-slate-200 overflow-hidden bg-white">
        <CardContent className="p-0">
          <RecentSalesTable 
            sales={sales} 
            onView={handleViewDetails} 
            onPrint={handleReprint}     
          />
        </CardContent>
      </Card>

      {/* RESUMO FINANCEIRO DO TURNO CONSULTADO */}
      <div className="flex justify-start">
       <Card className="bg-slate-900 text-white ...">
  <div className="p-5 flex justify-between items-center">
    <div>
      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">
        Total Facturado no Turno
      </span>
      <span className="text-3xl font-black text-emerald-400 tracking-tighter">
        {totalFacturado.toFixed(2)} {/* <--- APENAS VENDAS AQUI */}
      </span>
      <span className="text-xs font-bold text-emerald-500 ml-2 uppercase">dbs</span>
    </div>
    <ReceiptText className="h-8 w-8 text-slate-700 opacity-30" />
  </div>
</Card>
      </div>

      <SaleDetailsModal sale={selectedSale} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
  <CloseCaixaModal 
  open={showCloseModal} 
  onClose={() => setShowCloseModal(false)} 
  valorSugerido={valorTotalSugerido} // <--- VENDAS + FUNDO AQUI
  caixaId={Number(targetBoxId)}
/>
    </div>
  );
};

export default SalesHistoryPage;