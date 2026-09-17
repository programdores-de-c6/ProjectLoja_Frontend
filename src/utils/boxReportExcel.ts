import ExcelJS from 'exceljs';

import {
  BoxReport,
  BoxRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportExcelHeader } from '@/utils/reportExcelHeader';

const moneyExcel = (value?: number): string =>
  `${Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Db`;

const dateTimeExcel = (value?: string): string => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('pt-PT');
};

export const exportBoxReportExcel = async (
  report: BoxReport,
  from: string,
  to: string,
  reportShop?: ReportShop
): Promise<void> => {
  if (!report) return;

  const workbook = new ExcelJS.Workbook();

  const summarySheet = workbook.addWorksheet('Resumo');

  summarySheet.columns = [
    { width: 34 },
    { width: 48 },
  ];

  const startRow = await drawReportExcelHeader({
    workbook,
    worksheet: summarySheet,
    shop: reportShop,
    title: 'RELATÓRIO DE CAIXAS',
    from,
    to,
    startRow: 1,
    lastColumn: 2,
    formatDate: (value) => {
      if (!value) return '-';

      const date = new Date(value);

      return Number.isNaN(date.getTime())
        ? '-'
        : date.toLocaleDateString('pt-PT');
    },
  });

  const rows = Array.isArray(report.rows)
    ? report.rows
    : [];

  const totalDifference = rows.reduce(
    (sum, row) =>
      sum + Number(row.difference ?? 0),
    0
  );

  const averagePerBox =
    Number(report.boxesCount ?? 0) > 0
      ? Number(report.totalSales ?? 0) /
        Number(report.boxesCount)
      : 0;

  // ============================================================
  // RESUMO
  // ============================================================

  summarySheet.mergeCells(
    startRow,
    1,
    startRow,
    2
  );

  const summaryTitle = summarySheet.getCell(
    startRow,
    1
  );

  summaryTitle.value = 'RESUMO DOS CAIXAS';

  summaryTitle.font = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  summaryTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2363EB' },
  };

  summaryTitle.alignment = {
    vertical: 'middle',
    horizontal: 'left',
  };

  summarySheet.getRow(startRow).height = 20;

  let row = startRow + 1;

  const summaryData: Array<
    [string, string | number]
  > = [
    [
      'Caixas',
      Number(report.boxesCount ?? 0),
    ],
    [
      'Total de vendas',
      moneyExcel(report.totalSales),
    ],
    [
      'Média de vendas por caixa',
      moneyExcel(averagePerBox),
    ],
    [
      'Diferença total',
      moneyExcel(totalDifference),
    ],
  ];

  summaryData.forEach(([label, value]) => {
    summarySheet.getCell(row, 1).value =
      label;

    summarySheet.getCell(row, 2).value =
      value;

    summarySheet.getCell(row, 1).font = {
      name: 'Arial',
      size: 10,
      bold: true,
    };

    summarySheet.getCell(row, 2).font = {
      name: 'Arial',
      size: 10,
    };

    summarySheet.getCell(row, 1).border = {
      bottom: {
        style: 'hair',
        color: { argb: 'D0D7DE' },
      },
    };

    summarySheet.getCell(row, 2).border = {
      bottom: {
        style: 'hair',
        color: { argb: 'D0D7DE' },
      },
    };

    row++;
  });

  // ============================================================
  // FOLHA DE CAIXAS
  // ============================================================

  const sheet = workbook.addWorksheet(
    'Caixas'
  );

  sheet.columns = [
    { width: 8 },
    { width: 10 },
    { width: 22 },
    { width: 22 },
    { width: 28 },
    { width: 28 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 12 },
    { width: 18 },
    { width: 28 },
  ];

  const boxHeaderRow = sheet.getRow(1);

  boxHeaderRow.values = [
    'Nº',
    'Caixa',
    'Abertura',
    'Fecho',
    'Aberto por',
    'Fechado por',
    'Inicial',
    'Vendas',
    'Esperado',
    'Final',
    'Diferença',
    'Nº vendas',
    'Estado',
    'Loja',
  ];

  boxHeaderRow.eachCell((cell) => {
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFF' },
    };

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '14202D' },
    };

    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };

    cell.border = {
      top: {
        style: 'thin',
        color: { argb: 'D0D7DE' },
      },
      bottom: {
        style: 'thin',
        color: { argb: 'D0D7DE' },
      },
    };
  });

  boxHeaderRow.height = 30;

  // ============================================================
  // DADOS DOS CAIXAS
  // ============================================================

  rows.forEach(
    (box: BoxRow, index: number) => {
      const dataRow = sheet.getRow(
        index + 2
      );

      dataRow.values = [
        index + 1,
        box.id,
        dateTimeExcel(box.openingDate),
        dateTimeExcel(box.closingDate),
        box.openedBy ?? '-',
        box.closedBy ?? '-',
        moneyExcel(box.openingValue),
        moneyExcel(box.salesTotal),
        moneyExcel(
          box.expectedClosingValue
        ),
        moneyExcel(box.closingValue),
        moneyExcel(box.difference),
        Number(box.salesCount ?? 0),
        box.status ?? '-',
        box.shop ??
          reportShop?.nome ??
          'Visão Global',
      ];

      dataRow.eachCell((cell) => {
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
            color: { argb: 'D0D7DE' },
          },
        };
      });
    }
  );

  // ============================================================
  // CONFIGURAÇÃO DA FOLHA
  // ============================================================

  sheet.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  sheet.autoFilter = {
    from: 'A1',
    to: 'N1',
  };

  sheet.pageSetup = {
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

  const blob = new Blob(
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
    `relatorio-caixas-${from}-${to}.xlsx`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};