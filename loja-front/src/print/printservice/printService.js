import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

const vfs = pdfFonts && pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;
pdfMake.vfs = vfs;

export function printPdf(docDefinition) {
  // Adicionamos os estilos específicos do corpo aqui para manter o código limpo
  docDefinition.styles = {
    ...docDefinition.styles,
    sectionTitleBlue: {
      fontSize: 11,
      bold: true,
      color: 'white',
      fillColor: '#2980b9',
      margin: [5, 2, 5, 2]
    },
    label: { fontSize: 8, bold: true, color: '#7f8c8d', margin: [0, 0, 0, 2] },
    value: { fontSize: 10, bold: true, color: '#2c3e50' }
  };

  pdfMake.createPdf(docDefinition).open(); // Abre em nova aba para conferir o visual
}