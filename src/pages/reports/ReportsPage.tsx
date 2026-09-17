/**
 * ====================================================
 * REPORTS PAGE - CENTRAL DE RELATÓRIOS
 * ====================================================
 *
 * Página principal do módulo de relatórios.
 *
 * Responsabilidades:
 * - Apresentar os relatórios disponíveis;
 * - Organizar por categorias;
 * - Encaminhar para o relatório específico;
 * - Destacar o relatório financeiro mensal.
 *
 * A lógica de dados pertence ao ReportDetailPage /
 * ReportsService e não deve ficar toda aqui.
 */

import React from 'react';
import {
  BarChart3,
  Box,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Package,
  Users,
  ArrowRight,
  TrendingUp,
  ClipboardList,
  WalletCards,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


// ====================================================
// TIPOS
// ====================================================

interface ReportDefinition {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  category: 'operational' | 'financial';
  highlight?: boolean;
}


// ====================================================
// DEFINIÇÃO DOS RELATÓRIOS
// ====================================================

const reports: ReportDefinition[] = [

  {
    key: 'sales',
    title: 'Vendas',
    description:
      'Analise as vendas por período, dia, semana e mês, com evolução e indicadores.',
    icon: BarChart3,
    category: 'operational',
  },

  {
    key: 'payments',
    title: 'Pagamentos',
    description:
      'Consulte os valores recebidos por método de pagamento e a sua distribuição.',
    icon: CreditCard,
    category: 'operational',
  },

  {
    key: 'products',
    title: 'Produtos',
    description:
      'Veja os produtos mais vendidos, quantidades, subtotal e facturação.',
    icon: Package,
    category: 'operational',
  },

  {
    key: 'stock',
    title: 'Stock',
    description:
      'Consulte stock actual, stock mínimo, produtos em baixo e produtos sem stock.',
    icon: Box,
    category: 'operational',
  },

  {
    key: 'movements',
    title: 'Movimentos de Stock',
    description:
      'Analise entradas, saídas, transferências, ajustes e respectivos responsáveis.',
    icon: ClipboardList,
    category: 'operational',
  },

  {
    key: 'employees',
    title: 'Funcionários',
    description:
      'Analise vendas, facturação e desempenho por funcionário.',
    icon: Users,
    category: 'operational',
  },

  {
    key: 'boxes',
    title: 'Caixas',
    description:
      'Consulte abertura, fecho, vendas, valor esperado, valor final e diferenças.',
    icon: WalletCards,
    category: 'operational',
  },

  {
    key: 'customers',
    title: 'Clientes',
    description:
      'Identifique os clientes com mais compras, maior consumo e frequência.',
    icon: Users,
    category: 'operational',
  },

  {
    key: 'monthly-financial',
    title: 'Receita Mensal — Finanças',
    description:
      'Gere a receita mensal no modelo emitted_document para exportação em Excel.',
    icon: FileSpreadsheet,
    category: 'financial',
    highlight: true,
  },
];


// ====================================================
// COMPONENTE DE CARTÃO DE RELATÓRIO
// ====================================================

interface ReportCardProps {
  report: ReportDefinition;
  onOpen: (key: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onOpen,
}) => {

  const Icon = report.icon;

  return (
    <Card
      className={`
        group relative overflow-hidden
        border-slate-200
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${
          report.highlight
            ? 'border-emerald-200 bg-emerald-50/30'
            : 'bg-white'
        }
      `}
    >

      {/* Indicador lateral */}
      <div
        className={`
          absolute left-0 top-0 h-full w-1
          ${
            report.highlight
              ? 'bg-emerald-500'
              : 'bg-blue-600'
          }
        `}
      />

      <CardHeader className="pb-3">

        <div className="flex items-start justify-between gap-3">

          {/* Ícone */}
          <div
            className={`
              flex h-11 w-11 items-center justify-center
              rounded-xl
              ${
                report.highlight
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }
            `}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Badge */}
          {report.highlight && (
            <Badge
              className="
                border-emerald-200
                bg-emerald-100
                text-emerald-700
                hover:bg-emerald-100
              "
            >
              Excel / Finanças
            </Badge>
          )}

        </div>

        <CardTitle className="mt-4 text-base font-bold text-slate-900">
          {report.title}
        </CardTitle>

      </CardHeader>


      <CardContent>

        <p className="min-h-[48px] text-sm leading-6 text-slate-500">
          {report.description}
        </p>

        <Button
          type="button"
          variant="outline"
          className="
            mt-5 w-full
            justify-between
            font-semibold
            group-hover:border-blue-300
            group-hover:text-blue-700
          "
          onClick={() => onOpen(report.key)}
        >
          Abrir relatório

          <ArrowRight
            className="
              h-4 w-4
              transition-transform
              group-hover:translate-x-1
            "
          />
        </Button>

      </CardContent>

    </Card>
  );
};


// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const ReportsPage: React.FC = () => {

  const navigate = useNavigate();


  // ====================================================
  // NAVEGAR PARA RELATÓRIO
  // ====================================================

  const handleOpenReport = (key: string) => {

    navigate(`/reports/${key}`);

  };


  // ====================================================
  // FILTROS DE RELATÓRIOS
  // ====================================================

  const operationalReports =
    reports.filter(
      (report) =>
        report.category === 'operational'
    );

  const financialReports =
    reports.filter(
      (report) =>
        report.category === 'financial'
    );


  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">

      <div className="mx-auto max-w-7xl space-y-8">


        {/* ==================================================
            CABEÇALHO
        ================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-xl bg-blue-100 text-blue-700
                "
              >
                <BarChart3 className="h-6 w-6" />
              </div>

              <div>

                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 md:text-3xl">
                  Relatórios
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Análise operacional, financeira e de desempenho do sistema.
                </p>

              </div>

            </div>

          </div>


          {/* Indicador */}

          <div
            className="
              flex items-center gap-2
              rounded-lg
              border border-slate-200
              bg-white
              px-4 py-2
              text-xs font-semibold
              text-slate-500
            "
          >

            <TrendingUp className="h-4 w-4 text-blue-600" />

            <span>
              {reports.length} relatórios disponíveis
            </span>

          </div>

        </div>


        {/* ==================================================
            VISÃO GERAL
        ================================================== */}

        <Card className="border-slate-200 shadow-sm">

          <CardContent className="p-5">

            <div className="grid gap-5 md:grid-cols-3">

              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Operacionais
                  </p>

                  <p className="text-xl font-black text-slate-900">
                    {operationalReports.length}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Financeiros
                  </p>

                  <p className="text-xl font-black text-slate-900">
                    {financialReports.length}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Package className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Análise
                  </p>

                  <p className="text-sm font-bold text-slate-700">
                    Vendas · Stock · Clientes
                  </p>

                </div>

              </div>

            </div>

          </CardContent>

        </Card>


        {/* ==================================================
            RELATÓRIOS OPERACIONAIS
        ================================================== */}

        <section>

          <div className="mb-4 flex items-center gap-3">

            <div className="h-2 w-2 rounded-full bg-blue-600" />

            <div>

              <h2 className="text-lg font-black uppercase tracking-wide text-slate-900">
                Relatórios Operacionais
              </h2>

              <p className="text-sm text-slate-500">
                Informação para acompanhamento diário e gestão.
              </p>

            </div>

          </div>


          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {operationalReports.map(
              (report) => (
                <ReportCard
                  key={report.key}
                  report={report}
                  onOpen={handleOpenReport}
                />
              )
            )}

          </div>

        </section>


        {/* ==================================================
            RELATÓRIO FINANCEIRO
        ================================================== */}

        <section>

          <div className="mb-4 flex items-center gap-3">

            <div className="h-2 w-2 rounded-full bg-emerald-500" />

            <div>

              <h2 className="text-lg font-black uppercase tracking-wide text-slate-900">
                Relatório Financeiro
              </h2>

              <p className="text-sm text-slate-500">
                Exportação mensal destinada à preparação da informação financeira.
              </p>

            </div>

          </div>


          <div className="grid gap-5 lg:grid-cols-2">

            {financialReports.map(
              (report) => (
                <ReportCard
                  key={report.key}
                  report={report}
                  onOpen={handleOpenReport}
                />
              )
            )}

          </div>

        </section>


        {/* ==================================================
            NOTA
        ================================================== */}

        <div
          className="
            rounded-xl
            border border-slate-200
            bg-white
            px-5 py-4
            text-xs leading-5 text-slate-500
          "
        >
          <div className="flex items-start gap-3">

            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

            <p>
              Os relatórios respeitam o contexto da unidade seleccionada.
              A visão global fica reservada aos utilizadores com as permissões
              correspondentes, enquanto os relatórios de Finanças utilizam
              exclusivamente vendas concluídas.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
};


export default ReportsPage;