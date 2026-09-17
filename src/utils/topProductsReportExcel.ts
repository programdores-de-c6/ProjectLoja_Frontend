import ExcelJS from 'exceljs';

import {
  TopProductsReport,
  TopProductRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportExcelHeader } from '@/utils/reportExcelHeader';

const moneyExcel = (
  value?: number
): string =>
  `${Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Db`;

const dateExcel = (
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

export const exportTopProductsReportExcel = async (
  report: TopProductsReport,
  from: string,
  to: string,
  shop?: ReportShop
): Promise<void> => {
  if (!report) return;

  const workbook =
    new ExcelJS.Workbook();

  // ============================================================
  // FOLHA 1 — RESUMO
  // ============================================================

  const summarySheet =
    workbook.addWorksheet(
      'Resumo'
    );

  summarySheet.columns = [
    { width: 34 },
    { width: 48 },
  ];

  const startRow =
    await drawReportExcelHeader({
      workbook,
      worksheet: summarySheet,
      shop,
      title:
        'RELATÓRIO DE PRODUTOS MAIS VENDIDOS',
      from,
      to,
      startRow: 1,
      lastColumn: 2,
      formatDate: dateExcel,
    });

  // ============================================================
  // RESUMO DO PERÍODO
  // ============================================================

  summarySheet.mergeCells(
    startRow,
    1,
    startRow,
    2
  );

  const summaryTitle =
    summarySheet.getCell(
      startRow,
      1
    );

  summaryTitle.value =
    'RESUMO DO PERÍODO';

  summaryTitle.font = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: {
      argb: 'FFFFFF',
    },
  };

  summaryTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb: '2363EB',
    },
  };

  summaryTitle.alignment = {
    vertical: 'middle',
    horizontal: 'left',
  };

  summarySheet.getRow(
    startRow
  ).height = 20;

  let row =
    startRow + 1;

  const summaryData: Array<
    [string, string | number]
  > = [
    [
      'Produtos',
      Number(
        report.summary.productsCount ?? 0
      ),
    ],
    [
      'Unidades vendidas',
      Number(
        report.summary.itemsCount ?? 0
      ),
    ],
    [
      'Subtotal',
      moneyExcel(
        report.summary.subtotal
      ),
    ],
    [
      'Facturação',
      moneyExcel(
        report.summary.total
      ),
    ],
  ];

  summaryData.forEach(
    ([label, value]) => {
      summarySheet.getCell(
        row,
        1
      ).value = label;

      summarySheet.getCell(
        row,
        2
      ).value = value;

      summarySheet.getCell(
        row,
        1
      ).font = {
        name: 'Arial',
        size: 10,
        bold: true,
      };

      summarySheet.getCell(
        row,
        2
      ).font = {
        name: 'Arial',
        size: 10,
      };

      summarySheet.getCell(
        row,
        1
      ).border = {
        bottom: {
          style: 'hair',
          color: {
            argb: 'D0D7DE',
          },
        },
      };

      summarySheet.getCell(
        row,
        2
      ).border = {
        bottom: {
          style: 'hair',
          color: {
            argb: 'D0D7DE',
          },
        },
      };

      row++;
    }
  );

  summarySheet.pageSetup = {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
  };

  // ============================================================
  // FOLHA 2 — PRODUTOS
  // ============================================================

  const productsSheet =
    workbook.addWorksheet(
      'Produtos'
    );

  productsSheet.columns = [
    { width: 10 },
    { width: 40 },
    { width: 20 },
    { width: 18 },
    { width: 18 },
    { width: 28 },
  ];

  const total =
    Number(
      report.summary.total ?? 0
    );

  // ============================================================
  // CABEÇALHO DA TABELA
  // ============================================================

  const headerRow =
    productsSheet.getRow(1);

  headerRow.values = [
    'Ranking',
    'Produto',
    'Quantidade vendida',
    'Subtotal',
    'Facturação',
    '% da facturação',
  ];

  headerRow.eachCell(
    (cell) => {
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: {
          argb: 'FFFFFF',
        },
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: '14202D',
        },
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      cell.border = {
        top: {
          style: 'thin',
          color: {
            argb: 'D0D7DE',
          },
        },
        bottom: {
          style: 'thin',
          color: {
            argb: 'D0D7DE',
          },
        },
      };
    }
  );

  headerRow.height = 30;

  // ============================================================
  // DADOS DOS PRODUTOS
  // ============================================================

  const rows =
    Array.isArray(report.rows)
      ? report.rows
      : [];

  rows.forEach(
    (
      product: TopProductRow,
      index: number
    ) => {
      const productTotal =
        Number(
          product.total ?? 0
        );

      const percentage =
        total > 0
          ? (
              productTotal /
              total
            ) * 100
          : 0;

      const dataRow =
        productsSheet.addRow([
          index + 1,
          product.nome ?? '-',
          Number(
            product.quantidade ?? 0
          ),
          moneyExcel(
            product.subtotal
          ),
          moneyExcel(
            product.total
          ),
          `${percentage.toFixed(
            2
          )}%`,
        ]);

      dataRow.eachCell(
        (cell) => {
          cell.font = {
            name: 'Arial',
            size: 9,
          };

          cell.alignment = {
            vertical: 'middle',
            wrapText: true,
          };

          cell.border = {
            bottom: {
              style: 'hair',
              color: {
                argb: 'D0D7DE',
              },
            },
          };
        }
      );
    }
  );

  productsSheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  productsSheet.autoFilter = {
    from: 'A1',
    to: 'F1',
  };

  productsSheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  // ============================================================
  // EXPORTAÇÃO
  // ============================================================

  const buffer =
    await workbook.xlsx.writeBuffer();

  const blob =
    new Blob(
      [buffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    `relatorio-produtos-${from}-${to}.xlsx`;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(url);
};