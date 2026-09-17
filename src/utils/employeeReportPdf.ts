import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  EmployeeReport,
  EmployeeRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportPdfHeader } from '@/utils/reportPdfHeader';

const money = (value?: number): string =>
  `${Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Db`;

const datePt = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('pt-PT');
};

export const printEmployeeReportPdf = (
  report: EmployeeReport,
  from: string,
  to: string,
  shop?: ReportShop
): void => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width =
    pdf.internal.pageSize.getWidth();



  const summary = report.summary;

  const rows = Array.isArray(report.rows)
    ? report.rows
    : [];

  const unidade =
    shop?.nome || 'Visão Global';

  // ====================================================
  // CABEÇALHO PADRONIZADO
  // ====================================================

  const contentStartY = drawReportPdfHeader({
    pdf,
    shop,
    title: 'RELATÓRIO DE FUNCIONÁRIOS',
    from,
    to,
    left: 14,
    right: 14,
    formatDate: datePt,
  });

  // ====================================================
  // RESUMO
  // ====================================================

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(20, 30, 45);

  const summaryTitleY =
    contentStartY + 2;

  pdf.text(
    'RESUMO DO PERÍODO',
    14,
    summaryTitleY
  );

  const gap = 4;
  const cardH = 20;
  const available = width - 28;
  const cardW =
    (available - gap * 3) / 4;

  const cardY =
    summaryTitleY + 5;

  const drawCard = (
    x: number,
    label: string,
    value: string,
    highlight = false
  ): void => {
    pdf.setFillColor(
      highlight ? 235 : 248,
      highlight ? 248 : 250,
      highlight ? 240 : 252
    );

    pdf.setDrawColor(
      highlight ? 75 : 220,
      highlight ? 170 : 225,
      highlight ? 110 : 230
    );

    pdf.setLineWidth(
      highlight ? 0.6 : 0.3
    );

    pdf.roundedRect(
      x,
      cardY,
      cardW,
      cardH,
      2,
      2,
      'FD'
    );

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);

    pdf.setTextColor(
      highlight ? 20 : 100,
      highlight ? 120 : 110,
      highlight ? 75 : 125
    );

    pdf.text(
      label.toUpperCase(),
      x + 5,
      cardY + 7
    );

    pdf.setFontSize(
      highlight ? 12 : 10
    );

    pdf.setTextColor(
      highlight ? 20 : 25,
      highlight ? 120 : 35,
      highlight ? 75 : 50
    );

    pdf.text(
      value,
      x + 5,
      cardY + 15
    );
  };

  drawCard(
    14,
    'Funcionários',
    String(rows.length)
  );

  drawCard(
    14 + cardW + gap,
    'Vendas',
    String(
      summary.salesCount ?? 0
    )
  );

  drawCard(
    14 +
      (cardW + gap) * 2,
    'Ticket médio',
    money(summary.averageTicket)
  );

  drawCard(
    14 +
      (cardW + gap) * 3,
    'Total facturado',
    money(summary.total),
    true
  );

  // ====================================================
  // TABELA
  // ====================================================

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(20, 30, 45);

  const detailTitleY =
    cardY + cardH + 9;

  pdf.text(
    'DESEMPENHO POR FUNCIONÁRIO',
    14,
    detailTitleY
  );

  const total = Number(
    summary.total ?? 0
  );

  const tableRows = rows.map(
    (
      row: EmployeeRow,
      index: number
    ) => {
      const rowTotal =
        Number(row.total ?? 0);

      const percentage =
        total > 0
          ? (rowTotal / total) * 100
          : 0;

      return [
        String(index + 1),
        row.nome || '-',
        String(row.vendas ?? 0),
        money(row.total),
        money(row.ticketMedio),
        `${percentage.toFixed(2)}%`,
      ];
    }
  );

  autoTable(pdf, {
    startY: detailTitleY + 5,

    head: [[
      '#',
      'Funcionário',
      'Vendas',
      'Facturação',
      'Ticket médio',
      '% Total',
    ]],

    body: tableRows,

    theme: 'striped',
    showHead: 'everyPage',

    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 2,
      valign: 'middle',
      overflow: 'linebreak',
    },

    headStyles: {
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
      fillColor: [35, 120, 175],
      textColor: [255, 255, 255],
    },

    columnStyles: {
      0: {
        cellWidth: 12,
        halign: 'center',
      },

      1: {
        cellWidth: 95,
        halign: 'left',
      },

      2: {
        cellWidth: 35,
        halign: 'center',
      },

      3: {
        cellWidth: 52,
        halign: 'right',
      },

      4: {
        cellWidth: 52,
        halign: 'right',
      },

      5: {
        cellWidth: 35,
        halign: 'right',
      },
    },

    margin: {
      left: 14,
      right: 14,
      bottom: 18,
    },

    didDrawPage: () => {
      const page =
        pdf.getCurrentPageInfo()
          .pageNumber;

      const w =
        pdf.internal.pageSize.getWidth();

      const h =
        pdf.internal.pageSize.getHeight();

      pdf.setDrawColor(
        225,
        228,
        232
      );

      pdf.setLineWidth(0.3);

      pdf.line(
        8,
        h - 13,
        w - 8,
        h - 13
      );

      pdf.setFont(
        'helvetica',
        'normal'
      );

      pdf.setFontSize(7);

      pdf.setTextColor(
        110,
        110,
        110
      );

      pdf.text(
        `Relatório de Funcionários — ${unidade}`,
        8,
        h - 8
      );

      pdf.text(
        `Página ${page}`,
        w - 25,
        h - 8
      );
    },
  });

  // ====================================================
  // ABRIR / IMPRIMIR
  // ====================================================

  const blob =
    pdf.output('blob');

  const url =
    URL.createObjectURL(blob);

  const win =
    window.open(
      url,
      '_blank'
    );

  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
    };
  } else {
    pdf.save(
      `relatorio-funcionarios-${from}-${to}.pdf`
    );
  }

  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    60000
  );
};