import React from 'react';
import BasePage from '@/components/common/BasePage';
import { Users } from 'lucide-react';

const CustomersPage: React.FC = () => {
  return (
    <BasePage
      title="Clientes"
      description="Gerencie sua base de clients"
      icon={Users}
    />
  );
};

export default CustomersPage;