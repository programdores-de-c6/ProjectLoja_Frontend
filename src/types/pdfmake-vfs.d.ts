// src/types/pdfmake-vfs.d.ts

declare module 'pdfmake/build/pdfmake' {
  import { TDocumentDefinitions } from 'pdfmake/interfaces';

  interface PdfMakeStatic {
    vfs: { [key: string]: string };
    createPdf(docDefinition: TDocumentDefinitions): { 
      download(filename?: string): void; 
      open(): void; 
      print(): void;
      // ✅ ADICIONADO: getBlob é a forma mais segura para Iframe Printing
      getBlob(cb: (blob: Blob) => void): void; 
            getDataUrl(cb: (url: string) => void): void; 

    };
  }
  const pdfMake: PdfMakeStatic;
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  interface VfsFonts {
    pdfMake?: { vfs: { [key: string]: string } };
    [key: string]: unknown; 
  }
  const pdfFonts: VfsFonts;
  export default pdfFonts;
}