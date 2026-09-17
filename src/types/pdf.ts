/**
 * ====================================================
 * PDF TYPES - DEFINIÇÕES DE TIPAGEM PARA IMPRESSÃO
 * ====================================================
 * 
 * Centraliza todas as interfaces utilizadas no motor de impressão.
 * Remove o uso de 'any' e garante consistência entre Modais e PDFs.
 */

/**
 * Interface para um campo individual de dados (ex: Nome, Email).
 */
export interface PdfField {
  label: string; // Rótulo do campo (ex: "NIF")
  value: string | number | null | undefined; // Valor do campo (ex: "123456789")
}

/**
 * Interface para os dados da empresa/entidade que aparecem no cabeçalho.
 */
export interface EntityData {
  name: string; // Nome da empresa
  address?: string; // Endereço físico
  contacto?: string; // Telefone de contacto
  email?: string; // Email institucional
  numeroContribuite?: string; // NIF
  caixaPostal?: string | number; // Caixa postal
    logo?: string; // URL ou Base64 do logotipo
}

/**
 * Interface para os dados do usuário que está gerando o documento.
 */
export interface UserData {
  nome: string; // Nome do usuário (ex: "João Silva")
}

/**
 * Opções de configuração para a geração do PDF de visualização genérica.
 */
export interface GenericViewPdfOptions {
  title: string; // Título do documento (ex: "FICHA DE LOJA")
  fields: PdfField[]; // Lista de campos a serem impressos
  image?: string | null; // URL ou Base64 do logotipo
  entity?: EntityData; // Dados da empresa para o cabeçalho
  user?: UserData; // Dados do usuário emissor
}