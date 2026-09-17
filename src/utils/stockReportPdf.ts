import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  StockReport,
  StockRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportPdfHeader } from '@/utils/reportPdfHeader';

const money = (
  value?: number
): string =>
  `${Number(value ?? 0).toLocaleString(
    'pt-PT',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )} Db`;

export const printStockReportPdf = (
  report: StockReport,
  reportShop?: ReportShop,
  filterLabel?: string
): void => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width =
    pdf.internal.pageSize.getWidth();

  const height =
    pdf.internal.pageSize.getHeight();

  const summary =
    report.summary;

  const rows =
    Array.isArray(report.rows)
      ? report.rows
      : [];

  const unidade =
    reportShop?.nome ||
    'Visão Global';

  // ============================================================
  // CABEÇALHO PADRONIZADO
  // ============================================================

  const contentStartY =
    drawReportPdfHeader({
      pdf,
      shop: reportShop,
      title: 'RELATÓRIO DE STOCK',
      left: 14,
      right: 14,
      formatDate: () => '-',
    });

  // ============================================================
  // FILTRO
  // ============================================================

  let infoY =
    contentStartY;

  if (filterLabel) {
    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(
      7.5
    );

    pdf.setTextColor(
      110,
      110,
      110
    );

    pdf.text(
      `Filtro: ${filterLabel}`,
      14,
      infoY
    );

    infoY += 6;
  }

  // ============================================================
  // RESUMO
  // ============================================================

  const summaryTitleY =
    infoY + 2;

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(
    11
  );

  pdf.setTextColor(
    20,
    30,
    45
  );

  pdf.text(
    'RESUMO DO STOCK',
    14,
    summaryTitleY
  );

  const gap = 4;
  const cardH = 20;
  const available =
    width - 28;

  const cardW =
    (
      available -
      gap * 3
    ) / 4;

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

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(
      7
    );

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
    'Produtos',
    String(
      summary.productsCount ?? 0
    )
  );

  drawCard(
    14 +
      cardW +
      gap,
    'Stock baixo',
    String(
      summary.stockBaixo ?? 0
    )
  );

  drawCard(
    14 +
      (cardW + gap) * 2,
    'Sem stock',
    String(
      summary.semStock ?? 0
    )
  );

  drawCard(
    14 +
      (cardW + gap) * 3,
    'Valor inventário',
    money(
      summary.valorInventario
    ),
    true
  );

  // ============================================================
  // DETALHE
  // ============================================================

  const detailTitleY =
    cardY +
    cardH +
    12;

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(
    11
  );

  pdf.setTextColor(
    20,
    30,
    45
  );

  pdf.text(
    'DETALHE DO STOCK',
    14,
    detailTitleY
  );

  const body =
    rows.map(
      (
        row: StockRow
      ) => {
        const quantidade =
          Number(
            row.quantidade ?? 0
          );

        const minimo =
          Number(
            row.minimo ?? 0
          );

        const aRepor =
          Math.max(
            0,
            minimo - quantidade
          );

        return [
          row.produto || '-',
          row.codigoBarra || '-',
          String(quantidade),
          String(minimo),
          String(aRepor),
          money(row.preco),
          money(
            row.valorInventario
          ),
          row.semStock
            ? 'SEM STOCK'
            : row.baixo
              ? 'STOCK BAIXO'
              : 'NORMAL',
        ];
      }
    );

  autoTable(pdf, {
    startY:
      detailTitleY + 5,

    head: [[
      'Produto',
      'Código',
      'Qtd.',
      'Mín.',
      'A repor',
      'Preço',
      'Valor inventário',
      'Estado',
    ]],

    body,

    theme: 'striped',

    showHead:
      'everyPage',

    styles: {
      font: 'helvetica',
      fontSize: 6.5,
      cellPadding: 1.8,
      valign: 'middle',
      overflow: 'linebreak',
      lineWidth: 0.1,
    },

    headStyles: {
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
      fillColor: [
        35,
        120,
        175,
      ],
      textColor: [
        255,
        255,
        255,
      ],
    },

    columnStyles: {
      0: {
        cellWidth: 68,
        halign: 'left',
      },

      1: {
        cellWidth: 30,
        halign: 'left',
      },

      2: {
        cellWidth: 19,
        halign: 'center',
      },

      3: {
        cellWidth: 19,
        halign: 'center',
      },

      4: {
        cellWidth: 20,
        halign: 'center',
      },

      5: {
        cellWidth: 35,
        halign: 'right',
      },

      6: {
        cellWidth: 43,
        halign: 'right',
      },

      7: {
        cellWidth: 32,
        halign: 'center',
      },
    },

    margin: {
      left: 14,
      right: 14,
      bottom: 18,
    },

    didDrawPage: () => {
      const page =
        pdf
          .getCurrentPageInfo()
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

      pdf.setLineWidth(
        0.3
      );

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

      pdf.setFontSize(
        7
      );

      pdf.setTextColor(
        110,
        110,
        110
      );

      pdf.text(
        `Relatório de Stock — ${unidade}`,
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

  // ============================================================
  // TOTAL
  // ============================================================

  const finalY =
    (
      pdf as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    )
      .lastAutoTable
      ?.finalY ?? 100;

  if (
    finalY <
    height - 25
  ) {
    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(
      10
    );

    pdf.setTextColor(
      20,
      30,
      45
    );

    pdf.text(
      `VALOR TOTAL DO INVENTÁRIO: ${money(
        summary.valorInventario
      )}`,
      14,
      finalY + 9
    );
  }

  // ============================================================
  // ABRIR / IMPRIMIR
  // ============================================================

  const blob =
    pdf.output('blob');

  const url =
    URL.createObjectURL(
      blob
    );

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
      `relatorio-stock-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  }

  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    60000
  );
};