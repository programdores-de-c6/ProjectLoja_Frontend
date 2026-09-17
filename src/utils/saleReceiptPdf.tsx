/**
 * ====================================================
 * SALE RECEIPT PDF - MOTOR DE IMPRESSÃO PROFISSIONAL
 * ====================================================
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { 
  TDocumentDefinitions, 
  TableCell, 
  Content, 
  PageSize, 
  DynamicContent,
  Column // Importamos o tipo Column para evitar o erro de 'italic'
} from 'pdfmake/interfaces';
import { SaleFinalizedResponse, SaleResponseItem } from '@/types/sale-pdf';

// Inicialização das fontes globais do motor de PDF
if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else {
  pdfMake.vfs = (pdfFonts as unknown as { [key: string]: string });
}

// Definição dos formatos suportados pelo sistema
export type ReceiptFormat = 'A4' | 'A5' | 'THERMAL';

/**
 * Interface Interna: PrintableData
 * Serve para normalizar os dados antes de enviar para o motor de desenho.
 * Isso garante que campos nulos do banco virem valores seguros (0 ou texto vazio).
 */
interface PrintableData {
  invoiceNo: string;
  date: string;
  customerName: string;
  customerNif: string;
  shop: { 
    nome: string; nif: string; address: string; contact: string; 
    logo: string | null; email: string 
  };
  financials: { 
    subtotal: number; taxes: number; discount: number; 
    total: number; received: number; change: number; method: string;
  };
  items: SaleResponseItem[];
  operator: string;
  authNo: string;
}

/**
 * ADAPTADOR: Transforma o DTO do Java em dados prontos para impressão.
 */
function adaptData(s: SaleFinalizedResponse): PrintableData {
  return {
    invoiceNo: s.numeroFactura,
    date: s.dataVenda,
    customerName: s.nomeCliente || 'VENDA AO PÚBLICO',
    customerNif: s.nifCliente || 'CONSUMIDOR FINAL',
    shop: {
      nome: s.shopNome || 'LIVRARIA SÃO TOMÉ',
      nif: s.shopNif || '---',
      address: s.shopEndereco || '---',
      contact: s.shopContacto || '---',
      email: s.shopEmail || '',
      logo: s.shopLogo || null
    },
    financials: {
      subtotal: s.subtotal || 0,
      taxes: s.totalImposto || 0,
      discount: s.desconto || 0,
      total: s.totalGeral || 0,
      method: s.metodoPagamento || '---',
      received: s.valorRecebido || 0,
      change: s.troco || 0
    },
    items: s.itens || [],
    operator: s.operador || 'SISTEMA',
    authNo: s.numeroAutorizacao || '---'
  };
}

export const printSaleReceiptPdf = (input: SaleFinalizedResponse, format: ReceiptFormat = 'A5'): void => {
  const data = adaptData(input); // Normaliza os dados
  const isThermal = format === 'THERMAL'; // Verifica se é impressora de talão
  
  // Cálculo de altura dinâmica para o rolo térmico (evita 'auto' que dá erro de tipo)
  const thermalHeight = 180 + (data.items.length * 30) + 200;

  // Configurações de margens e larguras baseadas no papel escolhido
  // Ajustamos a largura do THERMAL para garantir que o conteúdo caiba sem cortar
  const config = {
    A4: { size: 'A4' as PageSize, margin: [40, 40, 40, 160] as [number, number, number, number], width: 515 },
    A5: { size: 'A5' as PageSize, margin: [30, 30, 30, 140] as [number, number, number, number], width: 360 },
    THERMAL: {  
      size: { width: 226, height: thermalHeight }, 
      margin: [10, 10, 10, 10] as [number, number, number, number], // Reduzimos a margem direita de 28 para 10 para ganhar espaço
      width: 206 // Aumentamos a largura útil de 188 para 206 para evitar cortes
    }
  }[format];

  // --- 1. CONSTRUÇÃO DA TABELA DE PRODUTOS ---
  const tableBody: TableCell[][] = [[
    { text: 'ARTIGO', style: 'tableHeader' },
    { text: 'QTD', style: 'tableHeader', alignment: 'center' },
    { text: 'UNIT', style: 'tableHeader', alignment: 'right' },
    { text: 'TOTAL', style: 'tableHeader', alignment: 'right' }
  ]];

  // Preenchimento das linhas de produtos
  data.items.forEach(item => {
    tableBody.push([
      { text: item.productName.toUpperCase(), fontSize: isThermal ? 7 : 8, margin: [0, 3, 0, 3] },
      { text: item.quantity.toString(), fontSize: isThermal ? 7 : 8, alignment: 'center' },
      { text: item.unitPrice.toFixed(2), fontSize: isThermal ? 7 : 8, alignment: 'right' },
      { text: item.subtotal.toFixed(2), fontSize: isThermal ? 7 : 8, bold: true, alignment: 'right' }
    ]);
  });

  /**
   * FUNÇÃO: BLOCO DE TOTAIS
   * Centraliza os cálculos financeiros em um bloco visual reutilizável.
   */
  const buildTotalsBlock = (fullWidth: number): Content => ({
    unbreakable: true,
    stack: [
      {
        // Se for térmico, usamos a largura total. Se for A4/A5, alinhamos à direita.
        margin: [isThermal ? 0 : fullWidth - 180, 5, 0, 0],
        stack: [
      
          { columns: [{ text: 'SUBTOTAL:', fontSize: 8 }, { text: `${data.financials.subtotal.toFixed(2)} dbs`, alignment: 'right', fontSize: 8 }] },
          { columns: [{ text: 'IMPOSTOS (IVA):', fontSize: 8 }, { text: `${data.financials.taxes.toFixed(2)} dbs`, alignment: 'right', fontSize: 8 }] },
          { columns: [{ text: 'DESCONTO:', fontSize: 8, color: 'red' }, { text: `-${data.financials.discount.toFixed(2)} dbs`, alignment: 'right', fontSize: 8, color: 'red' }] },
          // Linha divisória antes dos totais finais
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: isThermal ? fullWidth : 180, y2: 5, lineWidth: 0.5, lineColor: '#eeeeee' }], margin: [0, 2] },
          { columns: [{ text: 'VALOR ENTREGUE:', fontSize: 8 }, { text: `${data.financials.received.toFixed(2)} dbs`, alignment: 'right', fontSize: 8 }] },
          { columns: [{ text: 'TROCO:', fontSize: 8, bold: true }, { text: `${data.financials.change.toFixed(2)} dbs`, alignment: 'right', fontSize: 8, bold: true }] },
          { 
            margin: [0, 2, 0, 0],
            columns: [
              { text: 'MÉTODO DE PAGAMENTO:', fontSize: 7, color: '#455a64' }, 
              { text: data.financials.method.toUpperCase(), alignment: 'right', fontSize: 7, bold: true, color: '#455a64' }
            ] 
          },
          // BLOCO DE TOTAL A PAGAR (AQUI FOI O AJUSTE PRINCIPAL)
          {
            margin: [0, 8, 0, 0],
            table: {
              // 'widths: ['*', 'auto']' faz a primeira coluna ocupar o máximo e a segunda o mínimo necessário.
              // Garantimos que a tabela use a largura disponível do container.
              widths: isThermal ? ['*', 'auto'] : [100, 'auto'], 
              body: [[
                { text: 'TOTAL A PAGAR', color: 'white', bold: true, fontSize: 10, fillColor: '#0d47a1', margin: [4, 4, 4, 4] },
                { text: `${data.financials.total.toFixed(2)} dbs`, color: 'white', bold: true, fontSize: 12, fillColor: '#0d47a1', alignment: 'right', margin: [4, 4, 4, 4] }
              ]]
            },
            layout: 'noBorders'
          }
        ]
      },
      // Rodapé técnico do talão
      { text: `AUTORIZAÇÃO Nº: ${data.authNo}`, fontSize: 7, alignment: 'center', margin: [0, 15, 0, 0], bold: true, color: '#455a64' },
      { text: `Operador: ${data.operator} | Processado por Software v1.0`, fontSize: 6, alignment: 'center', color: '#b0bec5' },
      { text: 'OBRIGADO PELA PREFERÊNCIA!', alignment: 'center', fontSize: 8, margin: [0, 10, 0, 0], bold: true, color: '#90a4ae' }
    ]
  });

  // Definição das colunas de transporte (SOMA A TRANSPORTAR) para evitar erro de 'italic'
  const transportColumns: Column[] = [
    { text: 'SOMA A TRANSPORTAR / CONTINUA...', fontSize: 8, color: '#90a4ae' },
    { text: '---', alignment: 'right' as const }
  ];

  // DEFINIÇÃO DO DOCUMENTO PDF
  const docDefinition: TDocumentDefinitions = {
    pageSize: config.size,
    pageMargins: config.margin,
    
    // RODAPÉ: Só aparece em A4/A5. Gerencia o transporte entre páginas.
    footer: isThermal ? undefined : ((currentPage: number, pageCount: number): Content => {
      return {
        margin: [config.margin[0], 0, config.margin[2], 10],
        stack: [
          currentPage < pageCount 
            ? { margin: [0, 10, 0, 0], columns: transportColumns }
            : buildTotalsBlock(config.width)
        ]
      };
    }) as DynamicContent,

    content: [
      // 1. CABEÇALHO (LOJA)
      {
        columns: [
          {
            stack: [
              { text: data.shop.nome.toUpperCase(), fontSize: 14, bold: true, color: '#0d47a1' },
              { text: `NIF: ${data.shop.nif}`, fontSize: 8 },
              { text: data.shop.address, fontSize: 8 },
              { text: `TEL: ${data.shop.contact}`, fontSize: 8 },
            ]
          },
          // Logotipo da loja (se existir)
          { width: 50, stack: [ data.shop.logo ? { image: data.shop.logo, width: 45, alignment: 'right' as const } : '' ] }
        ],
        margin: [0, 0, 0, 10]
      },

      // Linha divisória horizontal
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: config.width, y2: 0, lineWidth: 1, lineColor: '#eeeeee' }], margin: [0, 5] },

      // 2. CORPO (CLIENTE E DOCUMENTO)
      {
        columns: [
          { stack: [{ text: 'CLIENTE', fontSize: 6, color: '#90a4ae', bold: true }, { text: data.customerName.toUpperCase(), fontSize: 9, bold: true }, { text: `NIF: ${data.customerNif}`, fontSize: 8 }] },
          { stack: [{ text: data.invoiceNo, fontSize: 9, bold: true, alignment: 'right' as const, color: '#0d47a1' }, { text: `DATA: ${new Date(data.date).toLocaleString()}`, fontSize: 7, alignment: 'right' as const }], width: 140 }
        ]
      },

      // Outra linha divisória
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: config.width, y2: 0, lineWidth: 1, lineColor: '#eeeeee' }], margin: [0, 10] },

      // 3. LISTA DE ITENS (TABELA PRINCIPAL)
      { 
        table: { 
          headerRows: 1, 
          // Larguras das colunas: 'ARTIGO', 'QTD', 'UNIT', 'TOTAL'
          widths: isThermal ? [70, 15, 40, 38] : ['*', 30, 60, 65], 
          body: tableBody 
        }, 
        layout: 'headerLineOnly',
        margin: [0, 0, 0, 10]
      },

      // Linha antes dos totais
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: config.width, y2: 0, lineWidth: 1, lineColor: '#eeeeee' }], margin: [0, 5] },

      // 4. TOTAIS PARA TÉRMICO
      // Como o formato térmico não usa rodapé fixo (footer), os totais são inseridos diretamente no fluxo do conteúdo.
      isThermal ? buildTotalsBlock(config.width) : ''
    ],
    styles: {
      tableHeader: { fontSize: 7, bold: true, color: '#ffffff', fillColor: '#0d47a1', margin: [0, 1, 0, 1] }
    }
  };

  // Gera e abre o PDF numa nova aba
  pdfMake.createPdf(docDefinition).print();
};
