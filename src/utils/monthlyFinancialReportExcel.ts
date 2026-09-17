import * as XLSX from 'xlsx';

import {
  MonthlyReport,
  MonthlySaleRow,
} from '@/pages/reports/ReportsService';

const HEADERS = [
  'documento_numero',
  'documento_serie',
  'documento_data',
  'nif_consumidor',
  'total_valor_itens',
  'tax_aplicavel_itens',
  'codigo_isento',
  'quant_itens',
  'desc_itens',
  'numero_documento_origem',
  'data_documento_origem',
  'tipo_documento',
] as const;

const datePt = (
  value?: string
): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'pt-PT'
  );
};

export const exportMonthlyFinancialReportExcel = (
  report: MonthlyReport,
  year: number,
  month: number,
  _shopName?: string
): void => {

  // ====================================================
  // DADOS
  // ====================================================

  const rows =
    Array.isArray(report.rows)
      ? [...report.rows]
      : [];

  // ====================================================
  // ORDENAR POR NÚMERO DA FACTURA
  // ORDEM CRESCENTE: 1, 2, 3, 4...
  // ====================================================

  rows.sort(
    (
      a: MonthlySaleRow,
      b: MonthlySaleRow
    ) => {

      const numeroA =
        Number(a.documentoNumero);

      const numeroB =
        Number(b.documentoNumero);

      const validoA =
        Number.isFinite(numeroA);

      const validoB =
        Number.isFinite(numeroB);

      // Números válidos vêm primeiro.
      if (!validoA && !validoB) {
        return 0;
      }

      if (!validoA) {
        return 1;
      }

      if (!validoB) {
        return -1;
      }

      return numeroA - numeroB;
    }
  );

  // ====================================================
  // TABELA — EXACTAMENTE COMO O MODELO
  // ====================================================

  const data: Array<
    Array<string | number>
  > = [
    [...HEADERS],
  ];

  rows.forEach(
    (
      row: MonthlySaleRow
    ) => {

      data.push([
        row.documentoNumero ?? '',

        row.documentoSerie ?? '',

        datePt(
          row.documentoData
        ),

        row.nifConsumidor ?? '',

        row.totalValorItens ?? '',

        row.taxAplicavelItens ?? '',

        // REGRA FIXA
        113,

        row.quantItens ?? '',

        row.descItens ?? '',

        row.numeroDocumentoOrigem ?? '',

        datePt(
          row.dataDocumentoOrigem
        ),

        row.tipoDocumento ?? '',
      ]);
    }
  );

  // ====================================================
  // WORKBOOK
  // ====================================================

  const workbook =
    XLSX.utils.book_new();

  const worksheet =
    XLSX.utils.aoa_to_sheet(
      data
    );

  // ====================================================
  // DIMENSÕES
  // ====================================================

  worksheet['!cols'] = [
    { wch: 21 },
    { wch: 18 },
    { wch: 16 },
    { wch: 20 },
    { wch: 21 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 28 },
    { wch: 29 },
    { wch: 25 },
    { wch: 20 },
  ];

  // ====================================================
  // FORMATAÇÃO NUMÉRICA
  // ====================================================

  for (
    let rowIndex = 2;
    rowIndex <= data.length;
    rowIndex += 1
  ) {

    const amountColumns = [
      5,
      6,
    ];

    amountColumns.forEach(
      column => {

        const address =
          XLSX.utils.encode_cell({
            r: rowIndex - 1,
            c: column - 1,
          });

        const cell =
          worksheet[address];

        if (
          cell &&
          typeof cell.v === 'number'
        ) {
          cell.z = '#,##0.00';
        }
      }
    );
  }

  // ====================================================
  // FOLHA ÚNICA
  // ====================================================

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'emitted_document'
  );

  // ====================================================
  // EXPORTAÇÃO
  // ====================================================

  const mes =
    String(month).padStart(
      2,
      '0'
    );

  XLSX.writeFile(
    workbook,
    `receita-${year}-${mes}.xlsx`
  );
};