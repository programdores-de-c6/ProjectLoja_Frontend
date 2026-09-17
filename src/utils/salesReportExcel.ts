import ExcelJS from 'exceljs';

import {
  SalesPeriodReport,
  SalesRow,
} from '@/pages/reports/ReportsService';

import type { ReportShop } from '@/utils/reportShopTypes';

import { drawReportExcelHeader } from '@/utils/reportExcelHeader';

const moneyExcel = (value?: number): string =>
  `${Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Db`;

const dateExcel = (value?: string): string => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('pt-PT');
};

export const exportSalesReportExcel = async (
  report: SalesPeriodReport,
  from: string,
  to: string,
  shop?: ReportShop
): Promise<void> => {
  if (!report) return;

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet('Relatório de Vendas');

  // ============================================================
  // CONFIGURAÇÃO DAS COLUNAS
  // ============================================================

  worksheet.columns = [
    { width: 18 },
    { width: 12 },
    { width: 15 },
    { width: 26 },
    { width: 18 },
    { width: 11 },
    { width: 22 },
    { width: 10 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
  ];

  // ============================================================
  // CABEÇALHO PADRONIZADO
  // ============================================================

  const startRow = await drawReportExcelHeader({
    workbook,
    worksheet,
    shop,
    title: 'RELATÓRIO DE VENDAS',
    from,
    to,
    startRow: 1,
    lastColumn: 13,
    formatDate: dateExcel,
  });

  // ============================================================
  // DADOS
  // ============================================================

  const summary = report.summary;

  const rows = Array.isArray(report.rows)
    ? report.rows
    : [];

  const bestDay = report.daily?.length
    ? [...report.daily].sort(
        (a, b) =>
          Number(b.total ?? 0) -
          Number(a.total ?? 0)
      )[0]
    : null;

  // ============================================================
  // RESUMO
  // ============================================================

 const summaryTitleRow = worksheet.getRow(startRow);

worksheet.mergeCells(
  startRow,
  1,
  startRow,
  2
);

summaryTitleRow.getCell(1).value =
  'RESUMO DO PERÍODO';

summaryTitleRow.getCell(1).font = {
  name: 'Arial',
  size: 11,
  bold: true,
  color: { argb: 'FFFFFF' },
};

summaryTitleRow.getCell(1).fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: '2363EB' },
};

summaryTitleRow.getCell(1).alignment = {
  vertical: 'middle',
  horizontal: 'left',
};

summaryTitleRow.height = 20;

  let row = startRow + 1;

  const summaryData: Array<[string, string | number]> = [
    ['Facturas', summary?.salesCount ?? 0],
    ['Itens vendidos', summary?.itemsCount ?? 0],
    ['Subtotal', moneyExcel(summary?.subtotal)],
    ['Impostos', moneyExcel(summary?.tax)],
    ['Descontos', moneyExcel(summary?.discount)],
    ['Total facturado', moneyExcel(summary?.total)],
    ['Ticket médio', moneyExcel(summary?.averageTicket)],
    [
      'Melhor dia',
      bestDay
        ? `${dateExcel(bestDay.data)} — ${moneyExcel(bestDay.total)}`
        : '-',
    ],
  ];

  summaryData.forEach(([label, value]) => {
    worksheet.getCell(row, 1).value = label;
    worksheet.getCell(row, 2).value = value;

    worksheet.getCell(row, 1).font = {
      name: 'Arial',
      size: 10,
      bold: true,
    };

    worksheet.getCell(row, 2).font = {
      name: 'Arial',
      size: 10,
    };

    row++;
  });

  row++;

  // ============================================================
  // DETALHE DAS VENDAS
  // ============================================================

  worksheet.mergeCells(
    row,
    1,
    row,
    13
  );

  const detailTitleCell = worksheet.getCell(row, 1);

  detailTitleCell.value = 'DETALHE DAS VENDAS';

  detailTitleCell.font = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  detailTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2363EB' },
  };

  detailTitleCell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
  };

  worksheet.getRow(row).height = 20;

  row++;

  // ============================================================
  // CABEÇALHO DA TABELA
  // ============================================================

  const tableHeader = worksheet.getRow(row);

  tableHeader.values = [
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
  ];

  tableHeader.eachCell((cell) => {
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

  worksheet.getRow(row).height = 30;

  row++;

  // ============================================================
  // LINHAS DAS VENDAS
  // ============================================================

  rows.forEach((sale: SalesRow) => {
    const dataRow = worksheet.getRow(row);

    dataRow.values = [
      sale.numeroFactura || '-',
      sale.serie || '-',
      dateExcel(sale.dataVenda),
      sale.cliente || 'Venda ao Público',
      sale.nifCliente || '-',
      sale.boxId != null
        ? String(sale.boxId)
        : '-',
      sale.operador || '-',
      sale.quantidadeItens ?? 0,
      moneyExcel(sale.subtotal),
      moneyExcel(sale.imposto),
      moneyExcel(sale.desconto),
      moneyExcel(sale.total),
      sale.metodoPagamento || '-',
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

    row++;
  });

  // ============================================================
  // TOTAL DO PERÍODO
  // ============================================================

  row += 1;

  worksheet.mergeCells(
    row,
    1,
    row,
    11
  );

  const totalLabelCell = worksheet.getCell(row, 1);

  totalLabelCell.value = 'TOTAL DO PERÍODO';

  totalLabelCell.font = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  totalLabelCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '14202D' },
  };

  totalLabelCell.alignment = {
    horizontal: 'right',
    vertical: 'middle',
  };

  const totalValueCell = worksheet.getCell(row, 12);

  totalValueCell.value = moneyExcel(
    summary?.total
  );

  totalValueCell.font = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  totalValueCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '14202D' },
  };

  totalValueCell.alignment = {
    horizontal: 'right',
    vertical: 'middle',
  };

  worksheet.getCell(row, 13).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '14202D' },
  };

  worksheet.getRow(row).height = 22;

  // ============================================================
  // CONFIGURAÇÕES
  // ============================================================

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: startRow + 1,
    },
  ];

  worksheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  worksheet.properties.defaultRowHeight = 18;

  // ============================================================
  // EXPORTAR
  // ============================================================

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob(
    [buffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = `relatorio-vendas-${from}-${to}.xlsx`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};