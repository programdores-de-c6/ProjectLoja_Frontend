import React, { useState } from "react";
import SalesChart from "./SalesChart";
import TopBar from "../TopBar"; // Importa a barra superior
import InfoCard from "../InfoCard"; // Importa o componente InfoCard
import { FaBox, FaUsers } from "react-icons/fa"; // Ícones para os cartões

const SalesDashboard = () => {
  // Dados de vendas simulados
  const [salesData] = useState([
    { name: "Jan", sales: 400 },
    { name: "Feb", sales: 300 },
    { name: "Mar", sales: 500 },
    { name: "Apr", sales: 200 },
  ]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Barra Superior */}
      <TopBar />

      {/* Conteúdo principal */}
      <div className="flex-grow-1 p-4">
        {/* Notificações e Cartões de Informações */}
        <div className="row mb-4">
          <div className="col-md-4">
            <InfoCard icon={<FaBox />} title="Total de Vendas" value="120" bgColor="primary" />
          </div>
          <div className="col-md-4">
            <InfoCard icon={<FaBox />} title="Produtos no Estoque" value="85" bgColor="success" />
          </div>
          <div className="col-md-4">
            <InfoCard icon={<FaUsers />} title="Clientes" value="45" bgColor="warning" />
          </div>
        </div>

        {/* Gráfico de Vendas */}
        <div className="bg-white shadow-sm rounded p-4">
          <h5 className="mb-3">Vendas Mensais</h5>
          <SalesChart data={salesData} />
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
