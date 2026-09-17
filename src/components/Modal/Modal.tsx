/**
 * ====================================================
 * COMPONENTE MODAL - VERSÃO TIPADA (TS STRICT)
 * ====================================================
 */

import React, { ReactNode } from 'react';

// ✅ 1. Definimos a Interface para as Props (Acaba com os erros ts(7031))
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string; // Opcional
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Opcional, com valores fixos
}

// ✅ 2. Aplicamos a Interface no Componente
const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' 
}) => {
  if (!isOpen) return null;

  // Tipagem estrita para o mapeamento de tamanhos
  const sizes: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop com transição */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full transition-all transform ${sizes[size]}`}>
          
          {/* Header - Apenas renderiza se houver título */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;