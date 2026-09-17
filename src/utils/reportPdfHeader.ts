import jsPDF from 'jspdf';

import type {
  ReportShop,
} from '@/utils/reportShopTypes';

interface ReportPdfHeaderOptions {
  pdf: jsPDF;
  shop?: ReportShop;
  title: string;
  from?: string;
  to?: string;
  left?: number;
  right?: number;
  formatDate?: (value: string) => string;
}

export const drawReportPdfHeader = ({
  pdf,
  shop,
  title,
  from,
  to,
  left = 14,
  right = 14,
  formatDate = (value) => value,
}: ReportPdfHeaderOptions): number => {

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const currentShop =
    shop?.nome || 'Visão Global';

  const shopNif =
    shop?.numeroContribuite || '---';

  const shopContact =
    shop?.contacto || '---';

  const shopAddress =
    shop?.nomelocation || '---';

  const shopEmail =
    shop?.email || '';

  const shopLogo =
    shop?.logoUrl ||
    shop?.logo ||
    null;

  // ==================================================
  // NOME DA LOJA
  // ==================================================

  pdf.setTextColor(
    20,
    30,
    45
  );

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(
    14
  );

  pdf.text(
    currentShop.toUpperCase(),
    left,
    12
  );

  // ==================================================
  // DADOS DA LOJA
  // ==================================================

  pdf.setFont(
    'helvetica',
    'normal'
  );

  pdf.setFontSize(
    8.5
  );

  pdf.setTextColor(
    80,
    80,
    80
  );

  pdf.text(
    `NIF: ${shopNif}`,
    left,
    17
  );

  pdf.text(
    shopAddress,
    left,
    22
  );

  pdf.text(
    `TEL: ${shopContact}`,
    left,
    27
  );

  let lastInfoY = 27;

  if (shopEmail) {
    pdf.text(
      `Email: ${shopEmail}`,
      left,
      32
    );

    lastInfoY = 32;
  }

  // ==================================================
  // LOGOTIPO
  // ==================================================

  if (shopLogo) {
    try {

      pdf.addImage(
        shopLogo,
        'AUTO',
        pageWidth - right - 25,
        5,
        25,
        25
      );

    } catch (error) {

      console.warn(
        'Não foi possível carregar o logotipo da loja:',
        error
      );

    }
  }

  // ==================================================
  // TÍTULO
  // ==================================================

  const titleY =
    lastInfoY + 10;

  pdf.setTextColor(
    20,
    30,
    45
  );

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(
    18
  );

  pdf.text(
    title,
    left,
    titleY
  );

  // ==================================================
  // LINHA
  // ==================================================

  const lineY =
    titleY + 5;

  pdf.setDrawColor(
    35,
    99,
    235
  );

  pdf.setLineWidth(
    0.7
  );

  pdf.line(
    left,
    lineY,
    pageWidth - right,
    lineY
  );

  // ==================================================
  // PERÍODO
  // ==================================================

  let infoY =
    lineY + 7;

  if (from && to) {

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(
      8.5
    );

    pdf.setTextColor(
      80,
      80,
      80
    );

    pdf.text(
      `Período: ${formatDate(from)} a ${formatDate(to)}`,
      left,
      infoY
    );

    infoY += 5;
  }

  // ==================================================
  // DATA DE EMISSÃO
  // ==================================================

  pdf.text(
    `Data de emissão: ${new Date().toLocaleString('pt-PT')}`,
    left,
    infoY
  );

  return infoY + 8;
};