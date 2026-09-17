/**
 * ====================================================
 * CAIXA MANAGEMENT PAGE - VERSÃO FINAL (SÉNIOR)
 * ====================================================
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Monitor, RefreshCw, Printer, Search, Eye, ArrowLeft, LockKeyhole
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useCaixaService, CaixaSession } from './CaixaService';
import { printCaixaClosingPdf } from '@/utils/caixaReceiptPdf';
import { showErrorToast } from '@/utils/toast';
import { useAuth } from '@/contexts/useAuth';
import { CloseCaixaModal } from '@/components/Modal/CaixaModals';

const CaixaManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const { listarTodos } = useCaixaService();

  const [caixas, setCaixas] = useState<CaixaSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [boxToClose, setBoxToClose] = useState<CaixaSession | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const loadCaixas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarTodos();
      setCaixas(Array.isArray(data) ? data : []);
    } catch (error) {
      showErrorToast("Erro ao carregar lista de caixas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCaixas(); }, []);

  const handleForcedClose = (caixa: CaixaSession) => {
    setBoxToClose(caixa);
    setShowCloseModal(true);
  };

  const filteredCaixas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return caixas.filter(c => 
      c.nomeOperadorAbertura?.toLowerCase().includes(term) || 
      String(c.id).includes(term)
    );
  }, [caixas, searchTerm]);

 return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase flex items-center gap-2">
              <Monitor className="h-6 w-6 text-blue-600" /> Gestão de Turnos
            </h1>
            <p className="text-xs text-slate-500 font-medium">Monitorização financeira em tempo real</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadCaixas} disabled={loading} className="font-bold">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="p-4 border-b bg-white">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Pesquisar..." className="pl-10 h-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[80px] font-bold text-[10px] uppercase text-slate-500 text-center">Sessão</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-500">Operador / Unidade</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-center text-slate-500">Estado</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-right text-slate-500">Resumo Financeiro (Db)</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-center text-slate-500">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCaixas.map((c) => (
              <TableRow key={c.id} className="hover:bg-blue-50/20 transition-colors">
                <TableCell className="text-center font-mono font-bold text-blue-600">#{c.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs uppercase text-slate-700">{c.nomeOperadorAbertura}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{c.shopNome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={c.statusCaixa === 'ABERTO' ? "bg-emerald-500" : "bg-slate-400"}>{c.statusCaixa}</Badge>
                </TableCell>

                {/* RESUMO FINANCEIRO DOS 3 VALORES */}
                <TableCell className="text-right py-3">
                  <div className="inline-block text-left min-w-[130px] space-y-0.5">
                    <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-tighter">
                      <span>Fundo:</span> <span className="font-mono">{(c.valorInicial ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-blue-600 font-bold uppercase tracking-tighter">
                      <span>Vendas:</span> <span className="font-mono">+{(c.valorDia ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-slate-900 border-t border-slate-100 pt-1 mt-1">
                      <span>TOTAL:</span> 
                      <span className="font-mono text-blue-700">
                        {(c.valorFinal ?? (c.valorInicial + (c.valorDia ?? 0))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    
                    {/* ✅ ÍCONE DE FECHO: Pequeno, vermelho e alinhado */}
                    {c.statusCaixa === 'ABERTO' && (isAdmin || isManager) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Fechar Turno Administrativamente"
                        onClick={() => handleForcedClose(c)}
                      >
                        <LockKeyhole className="h-4 w-4" />
                      </Button>
                    )}

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-blue-600" 
                      title="Ver Vendas"
                      onClick={() => navigate(`/vendas-recentes?caixaId=${c.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-emerald-600" 
                      title="Relatório de Fecho"
                      disabled={c.statusCaixa === 'ABERTO'} 
                      onClick={() => printCaixaClosingPdf(c)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {boxToClose && (
        <CloseCaixaModal 
          open={showCloseModal} 
          onClose={() => { 
            setShowCloseModal(false); 
            setBoxToClose(null); 
            loadCaixas(); 
          }} 
          caixaId={boxToClose.id} 
          valorSugerido={boxToClose.valorInicial + (boxToClose.valorDia ?? 0)} 
        />
      )}
    </div>
  );
};

export default CaixaManagementPage;