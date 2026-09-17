/**
 * ====================================================
 * GENERIC VIEW PDF - MOTOR DE IMPRESSÃO PROFISSIONAL (VERSÃO FINAL)
 * ====================================================
 * 
 * Função híbrida de geração de PDFs profissionais para o sistema.
 * Ela preenche automaticamente o cabeçalho com os dados da loja logada,
 * mas permite sobrescrever via options.entity se desejado.
 */

import pdfMake from 'pdfmake/build/pdfmake'; // Motor pdfMake
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Fontes padrão
import { TDocumentDefinitions, TableCell, Content } from 'pdfmake/interfaces';
import { GenericViewPdfOptions, PdfField, EntityData, UserData } from '@/types/pdf';
import api from '@/config/api'; // Instância Axios da API

// ====================================================
// CONFIGURAÇÃO DE FONTES (VFS)
// ====================================================
if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else {
  pdfMake.vfs = (pdfFonts as unknown as { [key: string]: string });
}

// ====================================================
// FUNÇÕES AUXILIARES
// ====================================================

/**
 * Formata um valor para exibição no PDF.
 * Substitui null, undefined, "" ou "null" por "---".
 */
const formatValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return "---";
  }
  return String(value);
};

/**
 * Busca os dados da loja logada usando o ID guardado no localStorage.
 * Retorna os dados já mapeados para a interface EntityData.
 */
const fetchLoggedShopData = async (): Promise<EntityData | null> => {
  try {
    const idl = localStorage.getItem("idl"); // ID da loja logada
    if (!idl) return null;

    const response = await api.get(`/shop/listid/${idl}`);
    const shop = response.data;

    return {
      name: shop.nome,
      numeroContribuite: shop.numeroContribuite,
      address: shop.nomelocation || "Endereço não especificado",
      contacto: shop.contacto,
      email: shop.email,
      caixaPostal: shop.caixaPostal,
      logo: typeof shop.logo === 'string' ? shop.logo : shop.logoUrl,
    };
  } catch (error) {
    console.error("Erro ao buscar dados da loja logada para o PDF:", error);
    return null;
  }
};

/**
 * Busca dados do usuário logado no localStorage
 */
const getUserDataFromStorage = (): UserData => {
  const storedUser = localStorage.getItem("userData");
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    return { nome: parsed.nome || "Usuário" };
  }
  return { nome: "Sistema" };
};

// ====================================================
// FUNÇÃO PRINCIPAL DE IMPRESSÃO
// ====================================================

/**
 * Gera e abre o PDF de visualização genérica.
 * @param options Configurações do PDF (título, campos, imagem, entidade, usuário)
 */
export const printGenericViewPdf = async (options: GenericViewPdfOptions): Promise<void> => {
  const { title, fields, image } = options;

  // 1️⃣ Busca os dados da loja logada caso não tenha sido passado entity
  const apiShopData = !options.entity ? await fetchLoggedShopData() : null;

  // 2️⃣ Busca dados do usuário
  const userData = getUserDataFromStorage();

  // 3️⃣ Define os dados finais do cabeçalho e do usuário
  const companyData: EntityData = options.entity || apiShopData || { 
    name: "SISTEMA DE VENDAS",
    numeroContribuite: "---",
    address: "---",
    contacto: "---",
    email: "---",
    caixaPostal: "---",
    logo: undefined
  };
  const finalUser: UserData = options.user || userData;

  // ====================================================
  // CONSTRUÇÃO DO CORPO DA TABELA
  // ====================================================
  const tableBody: TableCell[][] = fields.map((field: PdfField): TableCell[] => [
    { text: field.label.toUpperCase(), bold: true, fontSize: 9, color: '#546e7a', margin: [0, 5, 0, 5] },
    { text: formatValue(field.value), fontSize: 10, color: '#263238', margin: [0, 5, 0, 5] },
  ]);

  // ====================================================
  // DEFINIÇÃO DO DOCUMENTO PDF
  // ====================================================
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 120, 40, 60],

    // Cabeçalho com dados da loja logada
    header: {
      margin: [40, 25, 40, 0],
      columns: [
        {
          width: '*',
          stack: [
            { text: companyData.name.toUpperCase(), fontSize: 14, bold: true, color: '#0d47a1', margin: [0, 0, 0, 4] },
            { text: `NIF: ${companyData.numeroContribuite || "---"}`, fontSize: 9, color: '#455a64' },
            { text: `Endereço: ${companyData.address || "---"}`, fontSize: 9, color: '#455a64' },
            { text: `Contacto: ${companyData.contacto || "---"}`, fontSize: 9, color: '#455a64' },
          ],
        },
        {
          width: 100,
          stack: [
            image && (image.startsWith('data:image') || image.startsWith('http'))
              ? { image, width: 80, height: 80, alignment: 'right', fit: [80, 80] }
              : companyData.logo
                ? { image: companyData.logo, width: 80, height: 80, alignment: 'right', fit: [80, 80] }
                : { text: '', margin: [0, 0, 0, 0] }
          ]
        }
      ]
    },

    // Rodapé com informações do usuário e página
    footer: (currentPage: number, pageCount: number) => ({
      margin: [40, 20],
      stack: [
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cfd8dc' }] },
        {
          columns: [
            { text: `Emitido por: ${finalUser.nome} em ${new Date().toLocaleDateString()}`, fontSize: 8, color: '#78909c', italic: true },
            { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 8, color: '#78909c' },
          ],
          margin: [0, 8]
        }
      ]
    }),

    // Corpo principal do PDF
    content: [
      {
        table: {
          widths: ['*'],
          body: [[{ 
            text: title.toUpperCase(), fontSize: 12, bold: true, color: '#ffffff', fillColor: '#1565c0', alignment: 'center', margin: [0, 8, 0, 8] 
          }]]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: tableBody,
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 ? 0 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => '#eceff1'
        },
      },
    ] as Content[],
  };

  // ====================================================
  // GERA E ABRE O PDF
  // ====================================================
  pdfMake.createPdf(docDefinition).print();
};