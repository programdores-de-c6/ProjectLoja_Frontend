import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  CustomerReport,
  CustomerRow,
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

const datePt = (
  value?: string
): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString(
    'pt-PT'
  );
};

export const printCustomerReportPdf = (
  report: CustomerReport,
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

  const height =
    pdf.internal.pageSize.getHeight();

  const rows =
    Array.isArray(report.rows)
      ? report.rows
      : [];

  const total =
    Number(report.total ?? 0);

  const totalCompras =
    rows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.compras ?? 0
        ),
      0
    );

  const mediaPorCliente =
    rows.length > 0
      ? total / rows.length
      : 0;

  const unidade =
    shop?.nome ||
    'Visão Global';

  // ====================================================
  // CABEÇALHO PADRONIZADO
  // ====================================================

  const contentStartY =
    drawReportPdfHeader({
      pdf,
      shop,
      title: 'RELATÓRIO DE CLIENTES',
      from,
      to,
      left: 14,
      right: 14,
      formatDate: datePt,
    });

  // ====================================================
  // RESUMO
  // ====================================================

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(11);

  pdf.setTextColor(
    20,
    30,
    45
  );

  const summaryTitleY =
    contentStartY + 2;

  pdf.text(
    'RESUMO DO PERÍODO',
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
      highlight ? 11 : 9.5
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
    'Clientes',
    String(
      report.customersCount ??
        rows.length
    )
  );

  drawCard(
    14 +
      cardW +
      gap,
    'Compras',
    String(totalCompras)
  );

  drawCard(
    14 +
      (cardW + gap) * 2,
    'Média / cliente',
    money(
      mediaPorCliente
    )
  );

  drawCard(
    14 +
      (cardW + gap) * 3,
    'Total gasto',
    money(total),
    true
  );

  // ====================================================
  // DETALHE DOS CLIENTES
  // ====================================================

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(11);

  pdf.setTextColor(
    20,
    30,
    45
  );

  const detailTitleY =
    cardY +
    cardH +
    9;

  pdf.text(
    'DETALHE DOS CLIENTES',
    14,
    detailTitleY
  );

  // ====================================================
  // TABELA
  // ====================================================

  const tableRows =
    rows.map(
      (
        row: CustomerRow,
        index: number
      ) => [
        String(index + 1),
        row.nome || '-',
        row.nif || '-',
        String(
          row.compras ?? 0
        ),
        money(row.total),
        money(
          row.ticketMedio
        ),
        datePt(
          row.primeiraCompra
        ),
        datePt(
          row.ultimaCompra
        ),
        `${Number(
          row.frequenciaMediaDias ??
            0
        ).toFixed(1)} dias`,
      ]
    );

  autoTable(pdf, {
    startY:
      detailTitleY + 5,

    head: [[
      '#',
      'Cliente',
      'NIF',
      'Compras',
      'Total gasto',
      'Ticket médio',
      'Primeira compra',
      'Última compra',
      'Frequência média',
    ]],

    body: tableRows,

    theme: 'striped',

    showHead: 'everyPage',

    styles: {
      font: 'helvetica',
      fontSize: 6.4,
      cellPadding: 1.6,
      valign: 'middle',
      overflow: 'linebreak',
    },

    headStyles: {
      fontStyle: 'bold',
      fontSize: 6.2,
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
        cellWidth: 11,
        halign: 'center',
      },

      1: {
        cellWidth: 63,
        halign: 'left',
      },

      2: {
        cellWidth: 27,
        halign: 'left',
      },

      3: {
        cellWidth: 20,
        halign: 'center',
      },

      4: {
        cellWidth: 34,
        halign: 'right',
      },

      5: {
        cellWidth: 34,
        halign: 'right',
      },

      6: {
        cellWidth: 28,
        halign: 'center',
      },

      7: {
        cellWidth: 28,
        halign: 'center',
      },

      8: {
        cellWidth: 24,
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
        `Relatório de Clientes — ${unidade}`,
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
  // TOTAL
  // ====================================================

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

    pdf.setFontSize(9);

    pdf.setTextColor(
      20,
      30,
      45
    );

    pdf.text(
      `TOTAL GASTO PELOS CLIENTES: ${money(total)}`,
      14,
      finalY + 9
    );
  }

  // ====================================================
  // ABRIR / IMPRIMIR
  // ====================================================

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
      `relatorio-clientes-${from}-${to}.pdf`
    );
  }

  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    60000
  );
};