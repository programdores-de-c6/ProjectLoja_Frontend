/**
 * ====================================================
 * SELECT STORE PAGE - PAINEL DE CONTROLO PREMIUM (STRICT)
 * ====================================================
 *
 * Ecrã de entrada para o Administrador Master escolher a unidade.
 * Design escuro unificado com o ecrã de login e efeitos de profundidade.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, LayoutDashboard, Loader2, ShieldAlert, Settings, LogOut } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/useAuth';
import { useShopService, type Shop } from '@/pages/shop/ShopService';
import { showErrorToast } from '@/utils/toast';

const SelectStorePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, switchStore, logout } = useAuth();
  const { listar } = useShopService();

  const [lojas, setLojas] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const data = await listar();
        setLojas(data);
      } catch (error) {
        showErrorToast('Não foi possível carregar as unidades organizacionais.');
      } finally {
        setLoading(false);
      }
    };
    carregarLojas();
  }, []);

  const handleSelect = (lojaId: string | number, lojaNome: string, logo?: string) => {
    switchStore(String(lojaId), lojaNome, logo);
    navigate('/dashboard');
  };

  const handleGlobal = () => {
    switchStore('0', 'ADMINISTRAÇÃO CENTRAL');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          Sincronizando Unidades de Negócio...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans"
      style={{
        backgroundImage: `url('/images/vendas-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0" />

      <div className="w-full max-w-5xl space-y-10 relative z-10">
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest mx-auto">
            <ShieldAlert size={12} /> Acesso de Nível Proprietário
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
            Painel de Controlo
          </h1>
          <p className="text-slate-300 text-sm font-medium">
            Olá, <span className="text-blue-400 font-bold">{user?.nome}</span>. Selecione o balcão de operação:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {lojas.map((loja) => (
            <Card
              key={loja.id}
              className="group border border-white/10 bg-black/40 backdrop-blur-md hover:bg-white transition-all duration-300 cursor-pointer rounded-[2.5rem] overflow-hidden shadow-2xl hover:translate-y-[-4px]"
              onClick={() => handleSelect(loja.id, loja.nome, loja.logoUrl)}
            >
              <CardContent className="p-8 flex flex-col items-center text-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  {loja.logoUrl ? (
                    <img src={loja.logoUrl} alt={loja.nome} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="text-slate-300 h-10 w-10" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white group-hover:text-slate-900 uppercase leading-none transition-colors">
                    {loja.nome}
                  </h3>
                  <p className="text-[10px] text-slate-400 group-hover:text-slate-500 font-black uppercase tracking-widest">
                    {loja.numeroContribuite ? `NIF: ${loja.numeroContribuite}` : 'Unidade Ativa'}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 group-hover:bg-slate-900 transition-colors shadow-lg">
                    Aceder Unidade <ArrowRight size={12} strokeWidth={3} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card
            className="group border-2 border-dashed border-white/20 bg-black/20 hover:bg-white/90 hover:border-blue-500 transition-all duration-300 cursor-pointer rounded-[2.5rem]"
            onClick={handleGlobal}
          >
            <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center space-y-5 min-h-[250px]">
              <div className="p-4 bg-white/5 rounded-full text-white group-hover:bg-blue-50 text-blue-400 group-hover:text-blue-600 transition-colors">
                <LayoutDashboard size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white group-hover:text-slate-900 uppercase transition-colors">
                  Visão Geral
                </h3>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-500 font-medium uppercase tracking-wide leading-tight max-w-[180px] mx-auto">
                  Relatórios consolidados de todos os balcões
                </p>
              </div>
              <Button variant="outline" className="border-white/20 text-white group-hover:border-slate-300 group-hover:text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-full px-6">
                Entrar
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center items-center gap-6 pt-2">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <Settings size={14} /> Configurar Lojas
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400/80 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>

        <p className="text-center text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] opacity-50">
          Controlo Integrado de Negócios &bull; STP
        </p>
      </div>
    </div>
  );
};

export default SelectStorePage;