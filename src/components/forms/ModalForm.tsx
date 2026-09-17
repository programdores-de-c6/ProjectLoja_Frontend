/**
 * ====================================================
 * COMPONENTE DE MODAL REUTILIZÁVEL (ModalForm.tsx)
 * ====================================================
 * * Modal padronizado que centraliza os botões de ação.
 * Recebe o formulário como 'children' e a acção de submissão da 'Page'.
 */

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Edit, X } from 'lucide-react';

// ====================================================
// TIPOS E INTERFACES
// ====================================================

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  
  // Configurações da Acção (Vem da Page)
  onSubmit?: () => void | Promise<void>;
  isEditMode?: boolean;
  loading?: boolean;
  canSubmit?: boolean;
  
  // Customização de botões
  submitText?: string;
  cancelText?: string;
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  // Tamanho do modal
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Classes customizadas
  className?: string;
  contentClassName?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] h-[95vh]',
};

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================

const ModalForm: React.FC<ModalFormProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  isEditMode = false,
  loading = false,
  canSubmit = true,
  submitText,
  cancelText = 'Cancelar',
  submitVariant = 'default',
  size = 'md',
  className,
  contentClassName,
}) => {
  
  /**
   * Manipula o envio do formulário disparado pelo botão de submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && canSubmit && !loading) {
      await onSubmit();
    }
  };

  const getSubmitText = () => {
    if (submitText) return submitText;
    if (loading) return isEditMode ? 'Salvando...' : 'Criando...';
    return isEditMode ? ' Edição' : 'Criar ';
  };

  const getSubmitIcon = () => {
    if (loading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    return isEditMode ? <Save className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />;
  };

  return (
    <Dialog open={open} >
      <DialogContent 
      className={cn(
          sizeClasses[size],
          size === 'full' && 'h-[95vh] flex flex-col',
          "&& [&>button]:hidden", // ✅ SOLUÇÃO: Esconde o botão X (filtro de seletor CSS)
          contentClassName
        )}
        onPointerDownOutside={(e) => {
          // Impede o fechamento acidental se estiver a salvar
          if (loading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <Edit className="h-5 w-5 text-blue-600" />
            ) : (
              <Save className="h-5 w-5 text-green-600" />
            )}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* O formulário envolve o conteúdo e os botões para permitir o submit via teclado (Enter) */}
        <form onSubmit={handleSubmit} className={cn(
          "space-y-6",
          size === 'full' && 'flex-1 overflow-y-auto',
          className
        )}>
          <div className={cn(
            "space-y-4",
            size === 'full' && 'flex-1'
          )}>
            {children} {/* Aqui entra o CategoryForm com apenas os campos */}
          </div>

          <DialogFooter className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            size === 'full' && 'border-t pt-4 mt-6'
          )}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose} // 🔹 Acção de fechar o modal
              disabled={loading}
              className="mt-3 sm:mt-0"
            >
              <X className="mr-2 h-4 w-4" />
              {cancelText}
            </Button>
            
            {onSubmit && (
              <Button
                type="submit"
                variant={submitVariant}
                disabled={!canSubmit || loading}
                className="w-full sm:w-auto"
              >
                {getSubmitIcon()}
                {getSubmitText()}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalForm;