/**
 * ====================================================
 * PÁGINAS BÁSICAS DO SISTEMA
 * ====================================================
 * 
 * Páginas simples para completar a estrutura do sistema
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const BasePage: React.FC<PageProps> = ({ title, description, icon: Icon }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Página em Desenvolvimento</h3>
              <p className="text-gray-600 max-w-md">
                Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Construction className="h-4 w-4" />
              <span>Em construção</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasePage;