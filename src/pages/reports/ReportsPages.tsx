import React from 'react';
import BasePage from '@/components/common/BasePage';
import { BarChart3 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  return (
    <BasePage
      title="Relatórios"
      description="Relatórios e análises do sistema"
      icon={BarChart3}
    />
  );
};

export default ReportsPage;