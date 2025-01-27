// src/views/home/Home.js
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { FaPlus, FaBox, FaUsers } from "react-icons/fa";
import Menu from "../../component/Menu/Menu";
import InfoCard from "../../component/InfoCard/InfoCard";
import SalesChart from "../../component/Charts/SalesChart";
import Footer from "../../component/Footer/Footer"; // Importação do Footer

const Home = () => {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [salesData] = useState([
    { name: "Jan", sales: 400 },
    { name: "Feb", sales: 300 },
    { name: "Mar", sales: 500 },
    { name: "Apr", sales: 200 },
  ]);

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <div className="d-flex flex-grow-1">
        <Menu isMenuCollapsed={isMenuCollapsed} toggleMenu={toggleMenu} />
        <main className="flex-grow-1 p-4">
          <header className="d-flex justify-content-between align-items-center mb-4">
        
            
          </header>

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

          <div className="bg-white shadow-sm rounded p-4">
            <h5 className="mb-3">Vendas Mensais</h5>
            <SalesChart data={salesData} />
          </div>
        </main>
      </div>
      <Footer /> {/* Adição do Footer */}
    </div>
  );
};

export default Home;