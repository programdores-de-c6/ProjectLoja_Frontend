import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  StockMovementReport,
  StockMovementRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportPdfHeader } from '@/utils/reportPdfHeader';

const datePt = (
  value?: string
): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? '-'
    : date.toLocaleString(
        'pt-PT'
      );
};

const typeLabel = (
  value?: string
): string => {
  const type = (
    value ?? ''
  ).toLocaleUpperCase(
    'pt-PT'
  );

  return type === 'TRANSFERENCIA'
    ? 'TRANSFERÊNCIA'
    : type || 'N/D';
};

export const printStockMovementsReportPdf = (
  report: StockMovementReport,
  reportShop?: ReportShop,
  filterLabel?: string,
  from?: string,
  to?: string
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

  const rows = Array.isArray(
    report.rows
  )
    ? report.rows
    : [];

  const unidade =
    reportShop?.nome ||
    'Visão Global';

  // ============================================================
  // CÁLCULOS
  // ============================================================

  const entries =
    rows
      .filter(
        (row) =>
          (
            row.tipo ?? ''
          ).toLocaleUpperCase(
            'pt-PT'
          ) === 'ENTRADA'
      )
      .reduce(
        (sum, row) =>
          sum +
          Number(
            row.quantidade ?? 0
          ),
        0
      );

  const exits =
    rows
      .filter(
        (row) =>
          (
            row.tipo ?? ''
          ).toLocaleUpperCase(
            'pt-PT'
          ) === 'SAÍDA'
      )
      .reduce(
        (sum, row) =>
          sum +
          Number(
            row.quantidade ?? 0
          ),
        0
      );

  // ============================================================
  // CABEÇALHO PADRONIZADO
  // ============================================================

  const contentStartY =
    drawReportPdfHeader({
      pdf,
      shop: reportShop,
      title:
        'RELATÓRIO DE MOVIMENTOS DE STOCK',
      from,
      to,
      left: 14,
      right: 14,
      formatDate: (
        value?: string
      ) => {
        if (!value) {
          return '-';
        }

        const date =
          new Date(value);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return '-';
        }

        return date.toLocaleDateString(
          'pt-PT'
        );
      },
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

  const summaryTitleY =
    infoY + 2;

  pdf.text(
    'RESUMO DOS MOVIMENTOS',
    14,
    summaryTitleY
  );

  const gap = 4;
  const cardH = 19;
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
      90,
      100,
      110
    );

    pdf.text(
      label.toUpperCase(),
      x + 5,
      cardY + 7
    );

    pdf.setFontSize(
      10
    );

    pdf.setTextColor(
      highlight ? 20 : 30,
      highlight ? 120 : 45,
      highlight ? 75 : 55
    );

    pdf.text(
      value,
      x + 5,
      cardY + 15
    );
  };

  drawCard(
    14,
    'Movimentos',
    String(
      report.movementsCount ??
        rows.length
    )
  );

  drawCard(
    14 +
      cardW +
      gap,
    'Entradas',
    `+${entries}`
  );

  drawCard(
    14 +
      (cardW + gap) * 2,
    'Saídas',
    String(exits)
  );

  drawCard(
    14 +
      (cardW + gap) * 3,
    'Quantidade movimentada',
    String(
      report.totalQuantity ?? 0
    ),
    true
  );

  // ============================================================
  // DETALHE
  // ============================================================

  const titleY =
    cardY +
    cardH +
    10;

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
    'DETALHE DOS MOVIMENTOS',
    14,
    titleY
  );

  const body =
    rows.map(
      (
        row: StockMovementRow
      ) => [
        datePt(row.data),
        row.produto || '-',
        typeLabel(
          row.tipo
        ),
        String(
          row.quantidade ?? 0
        ),
        row.motivo || '-',
        row.funcionario || '-',
        row.loja || '-',
      ]
    );

  // ============================================================
  // TABELA
  // ============================================================

  autoTable(pdf, {
    startY:
      titleY + 5,

    head: [[
      'Data',
      'Produto',
      'Tipo',
      'Qtd.',
      'Motivo',
      'Funcionário',
      'Loja',
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
        cellWidth: 31,
      },

      1: {
        cellWidth: 55,
      },

      2: {
        cellWidth: 30,
        halign: 'center',
      },

      3: {
        cellWidth: 20,
        halign: 'center',
      },

      4: {
        cellWidth: 70,
      },

      5: {
        cellWidth: 47,
      },

      6: {
        cellWidth: 45,
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
        `Relatório de Movimentos de Stock — ${unidade}`,
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
    height - 24
  ) {
    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(
      9
    );

    pdf.setTextColor(
      20,
      30,
      45
    );

    pdf.text(
      `TOTAL DE MOVIMENTOS: ${
        report.movementsCount ??
        rows.length
      }`,
      14,
      finalY + 8
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
      `relatorio-movimentos-stock-${new Date()
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