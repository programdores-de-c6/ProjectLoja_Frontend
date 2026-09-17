import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  SalesPeriodReport,
  SalesRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import {
  drawReportPdfHeader,
} from '@/utils/reportPdfHeader';

// ====================================================
// FORMATAÇÃO
// ====================================================

const money = (value?: number): string => {
  return `${Number(value ?? 0).toLocaleString(
    'pt-PT',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )} Db`;
};

const datePt = (value?: string): string => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('pt-PT');
};

// ====================================================
// PDF — RELATÓRIO DE VENDAS
// ====================================================

export const printSalesReportPdf = (
  report: SalesPeriodReport,
  from: string,
  to: string,
  shop?: ReportShop
): void => {
  if (!report) {
    return;
  }

  // ==================================================
  // DOCUMENTO
  // ==================================================

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // ==================================================
  // DIMENSÕES
  // ==================================================

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const left = 14;
  const right = 14;

  // ==================================================
  // DADOS
  // ==================================================

  const summary = report.summary;

  const rows = Array.isArray(report.rows)
    ? report.rows
    : [];

  // ==================================================
  // CABEÇALHO PADRONIZADO
  // ==================================================

  const contentStartY = drawReportPdfHeader({
    pdf,
    shop,
    title: 'RELATÓRIO DE VENDAS',
    from,
    to,
    left,
    right,
    formatDate: datePt,
  });

  // ==================================================
  // RESUMO
  // ==================================================

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(20, 30, 45);

  const summaryTitleY = contentStartY;

  pdf.text(
    'RESUMO DO PERÍODO',
    left,
    summaryTitleY
  );

  // ==================================================
  // CARTÕES
  // ==================================================

  const drawCard = (
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    highlight = false
  ) => {
    if (highlight) {
      pdf.setFillColor(235, 248, 240);
      pdf.setDrawColor(70, 170, 110);
    } else {
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(220, 225, 230);
    }

    pdf.setLineWidth(highlight ? 0.6 : 0.3);

    pdf.roundedRect(
      x,
      y,
      width,
      height,
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
      y + 7
    );

    pdf.setFontSize(highlight ? 12 : 9.5);

    pdf.setTextColor(
      highlight ? 20 : 25,
      highlight ? 120 : 35,
      highlight ? 75 : 50
    );

    pdf.text(
      value,
      x + 5,
      y + 15
    );
  };

  const gap = 4;
  const cardHeight = 19;

  const cardWidth =
    (
      pageWidth -
      left -
      right -
      gap * 3
    ) / 4;

  const row1 = summaryTitleY + 5;

  const row2 =
    row1 +
    cardHeight +
    gap;

  const bestDay =
    report.daily?.length
      ? [...report.daily].sort(
          (a, b) =>
            Number(b.total ?? 0) -
            Number(a.total ?? 0)
        )[0]
      : null;

  // ==================================================
  // LINHA 1
  // ==================================================

  drawCard(
    left,
    row1,
    cardWidth,
    cardHeight,
    'Facturas',
    String(summary?.salesCount ?? 0)
  );

  drawCard(
    left + (cardWidth + gap),
    row1,
    cardWidth,
    cardHeight,
    'Itens vendidos',
    String(summary?.itemsCount ?? 0)
  );

  drawCard(
    left + (cardWidth + gap) * 2,
    row1,
    cardWidth,
    cardHeight,
    'Impostos',
    money(summary?.tax)
  );

  drawCard(
    left + (cardWidth + gap) * 3,
    row1,
    cardWidth,
    cardHeight,
    'Total facturado',
    money(summary?.total),
    true
  );

  // ==================================================
  // LINHA 2
  // ==================================================

  drawCard(
    left,
    row2,
    cardWidth,
    cardHeight,
    'Subtotal',
    money(summary?.subtotal)
  );

  drawCard(
    left + (cardWidth + gap),
    row2,
    cardWidth,
    cardHeight,
    'Descontos',
    money(summary?.discount)
  );

  drawCard(
    left + (cardWidth + gap) * 2,
    row2,
    cardWidth,
    cardHeight,
    'Ticket médio',
    money(summary?.averageTicket)
  );

  drawCard(
    left + (cardWidth + gap) * 3,
    row2,
    cardWidth,
    cardHeight,
    'Melhor dia',
    bestDay ? money(bestDay.total) : '-'
  );

  // ==================================================
  // TEXTO DE APOIO
  // ==================================================

  const summaryBottom =
    row2 +
    cardHeight;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(110, 110, 110);

  pdf.text(
    `Foram analisadas ${summary?.salesCount ?? 0} venda(s) e ${summary?.itemsCount ?? 0} item(ns) no período seleccionado.`,
    left,
    summaryBottom + 7
  );

  // ==================================================
  // DETALHE
  // ==================================================

  const detailTitleY =
    summaryBottom +
    18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(20, 30, 45);

  pdf.text(
    'DETALHE DAS VENDAS',
    left,
    detailTitleY
  );

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(110, 110, 110);

  pdf.text(
    'Cada linha corresponde a uma factura/venda concluída.',
    left,
    detailTitleY + 6
  );

  // ==================================================
  // LINHAS DA TABELA
  // ==================================================

  const tableRows =
    rows.map(
      (row: SalesRow) => [
        row.numeroFactura || '-',
        row.serie || '-',
        datePt(row.dataVenda),
        row.cliente || 'Venda ao Público',
        row.nifCliente || '-',
        row.boxId != null
          ? String(row.boxId)
          : '-',
        row.operador || '-',
        String(row.quantidadeItens ?? 0),
        money(row.subtotal),
        money(row.imposto),
        money(row.desconto),
        money(row.total),
        row.metodoPagamento || '-',
      ]
    );

  // ==================================================
  // TABELA
  // ==================================================

  autoTable(pdf, {
    startY: detailTitleY + 10,

    showHead: 'everyPage',

    head: [[
      'Factura',
      'Série',
      'Data',
      'Cliente',
      'NIF',
      'Caixa',
      'Operador',
      'Qtd.',
      'Subtotal',
      'Imposto',
      'Desconto',
      'Total',
      'Pagamento',
    ]],

    body: tableRows,

    theme: 'striped',

    styles: {
      font: 'helvetica',
      fontSize: 6.0,
      cellPadding: 1.45,
      overflow: 'linebreak',
      valign: 'middle',

      textColor: [
        45,
        55,
        70,
      ],

      lineColor: [
        225,
        228,
        232,
      ],

      lineWidth: 0.2,
    },

    headStyles: {
      font: 'helvetica',
      fontStyle: 'bold',
      fontSize: 6.0,

      textColor: [
        255,
        255,
        255,
      ],

      fillColor: [
        35,
        120,
        175,
      ],

      halign: 'center',
      valign: 'middle',
      cellPadding: 1.5,
    },

    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 14 },
      2: { cellWidth: 20 },
      3: { cellWidth: 31 },
      4: { cellWidth: 22 },

      5: {
        cellWidth: 11,
        halign: 'center',
      },

      6: { cellWidth: 24 },

      7: {
        cellWidth: 9,
        halign: 'center',
      },

      8: {
        cellWidth: 20,
        halign: 'right',
      },

      9: {
        cellWidth: 20,
        halign: 'right',
      },

      10: {
        cellWidth: 20,
        halign: 'right',
      },

      11: {
        cellWidth: 20,
        halign: 'right',
      },

      12: { cellWidth: 27 },
    },

    margin: {
      top: 10,
      right: 5,
      bottom: 17,
      left: 5,
    },

    didDrawPage: () => {
      const page =
        pdf
          .getCurrentPageInfo()
          .pageNumber;

      const width =
        pdf.internal.pageSize.getWidth();

      const height =
        pdf.internal.pageSize.getHeight();

      pdf.setDrawColor(
        225,
        228,
        232
      );

      pdf.setLineWidth(0.3);

      pdf.line(
        8,
        height - 13,
        width - 8,
        height - 13
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
        `Relatório de Vendas — ${
          shop?.nome || 'Visão Global'
        }`,
        8,
        height - 8
      );

      pdf.text(
        `Página ${page}`,
        width - 25,
        height - 8
      );
    },
  });

  // ==================================================
  // TOTAL FINAL
  // ==================================================

  const finalY =
    (
      pdf as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    ).lastAutoTable?.finalY
      ?? detailTitleY + 20;

  if (
    finalY <
    pageHeight - 25
  ) {
    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(9);

    pdf.setTextColor(
      20,
      30,
      45
    );

    pdf.text(
      `TOTAL DO PERÍODO: ${money(
        summary?.total
      )}`,
      left,
      finalY + 8
    );
  }

  // ==================================================
  // ABRIR / IMPRIMIR
  // ==================================================

  const blob =
    pdf.output('blob');

  const url =
    URL.createObjectURL(blob);

  const printWindow =
    window.open(
      url,
      '_blank'
    );

  if (printWindow) {
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    setTimeout(
      () => {
        URL.revokeObjectURL(
          url
        );
      },
      60000
    );
  } else {
    pdf.save(
      `relatorio-vendas-${from}-${to}.pdf`
    );

    URL.revokeObjectURL(url);
  }
};
