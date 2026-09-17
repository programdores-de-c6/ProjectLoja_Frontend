/**
 * ====================================================
 * GENERIC VIEW MODAL - MODAL DE VISUALIZAÇÃO PROFISSIONAL
 * ====================================================
 * 
 * Componente reutilizável para exibir detalhes de uma entidade (ex: Loja, Localidade).
 * Suporta a exibição de uma imagem (logo/avatar) e uma lista de campos chave-valor.
 * 
 * MELHORIAS NESTA VERSÃO:
 * 1. Botão 'Imprimir PDF' movido para o rodapé do modal, ao lado do botão 'Fechar'.
 * 2. Comentários detalhados linha por linha.
 */

import React from 'react'; // Importa o React
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'; // Componentes de diálogo do Shadcn/UI
import { Button } from '@/components/ui/button'; // Botão padronizado
import { Separator } from '@/components/ui/separator'; // Linha separadora
import { Printer } from 'lucide-react'; // Ícone de impressora
import { printGenericViewPdf } from '@/utils/genericViewPdf'; // Motor de impressão que refatoramos
import { GenericViewPdfOptions, PdfField, EntityData } from '@/types/pdf'; // Interfaces de tipos profissionais

// ====================================================
// PROPS DO COMPONENTE
// ====================================================

interface GenericViewModalProps {
  open: boolean; // Controla se o modal está aberto
  onClose: () => void; // Função para fechar o modal
  title: string; // Título do modal (ex: "Detalhes da Loja")
  description?: string; // Descrição opcional abaixo do título
  image?: string | null; // URL ou Base64 da imagem/logo
  fields: PdfField[]; // Lista de campos { label, value } para exibir
  entityData?: EntityData; // Dados da empresa para o cabeçalho do PDF
}

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const GenericViewModal: React.FC<GenericViewModalProps> = ({
  open,
  onClose,
  title,
  description,
  image,
  fields,
  entityData
}) => {

  /**
   * Manipulador para disparar a impressão do PDF.
   * Ele utiliza as mesmas informações exibidas no modal para garantir consistência.
   */
  const handlePrint = () => {
    // Monta as opções de impressão seguindo a interface GenericViewPdfOptions
    const printOptions: GenericViewPdfOptions = {
      title: title.toUpperCase(), // Título em maiúsculas no PDF
      fields, // Mesmos campos exibidos no modal
      image, // Mesmo logo exibido no modal
      entity: entityData, // Dados da empresa para o cabeçalho
      user: { nome: "Administrador" } // Pode ser substituído pelo usuário logado do AuthContext
    };

    // Chama o motor de impressão profissional
    printGenericViewPdf(printOptions);
  };

  return (
    // Componente Dialog do Shadcn/UI
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho do Modal */}
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              {title}
            </DialogTitle>
          </div>

          {description && <DialogDescription className="text-slate-500">{description}</DialogDescription>}
        </DialogHeader>

        <Separator className="my-2" />

        {/* Conteúdo do Modal */}
        <div className="py-4 space-y-6">
          
          {/* Visualização da Imagem (Logo/Avatar) */}
          {image && (
            <div className="flex justify-center">
              <div className="relative w-32 h-32 border-2 border-slate-100 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center shadow-sm">
                <img 
                  src={image} 
                  alt="Logo da Entidade" 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Fallback caso a imagem não carregue ou a URL seja inválida
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/200x200?text=Sem+Logo';
                  }}
                />
              </div>
            </div>
          )}

          {/* Grid de Campos Dinâmicos (2 colunas em telas maiores) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <div key={index} className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {field.label}
                </p>
                <p className="text-sm font-semibold text-slate-700 min-h-[24px] flex items-center">
                  {field.value || '—'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-2" />

        {/* Rodapé do Modal */}
        <DialogFooter className="flex-row justify-end gap-3">
          {/* Botão de Impressão Rápida movido para o rodapé */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint} 
            className="flex gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Imprimir PDF
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50">
            Fechar Visualização
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default GenericViewModal;