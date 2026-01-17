import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { FaBars, FaBox, FaUsers } from "react-icons/fa";
//import Menu from "../../component/Menu/Menu";
import InfoCard from "../../component/InfoCard/InfoCard";
import SalesChart from "../../component/Charts/SalesChart";
import CategorySalesChart from "../../component/Charts/CategorySalesChart";
//import Footer from "../../component/Footer/Footer";
import ThemeConfigurator from "../../component/ThemeConfigurator/ThemeConfigurator";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  homepageContainer: {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: theme.spacing(2),
    paddingTop: '64px',
  },
}));

const Home = ({ configOpen, handleConfigClose }) => {
  const classes = useStyles();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  return (
    <div className={classes.homepageContainer}>
      {/* Menu de Navegação */}
      <nav className="navbar navbar-light bg-light d-md-none">
        <Button variant="link" onClick={toggleMenu}>
          <FaBars size={24} />
        </Button>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Menu Lateral (colapsado em mobile) */}
        <div className={`d-md-block ${isMenuCollapsed ? "d-none" : "d-block"}`}>
         {/*<Menu isMenuCollapsed={isMenuCollapsed} toggleMenu={toggleMenu} />*/}
        </div>

        {/* Conteúdo Principal */}
        <main className="flex-grow-1 p-2 pb-5">
          {/* Cartões de Informação */}
          <div className="row" >
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <InfoCard icon={<FaBox />} title="Total de Vendas" value="120" bgColor="primary" />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <InfoCard icon={<FaBox />} title="Produtos no Estoque" value="85" bgColor="success" />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <InfoCard icon={<FaUsers />} title="Clientes" value="45" bgColor="warning" />
            </div>
          </div>

          {/* Gráfico de Vendas e Gráfico de Categorias de Produtos Mais Vendidas */}
          <div className="row">
            <div className="col-12 col-lg-6 mb-3">
              <div className="bg-white shadow-sm rounded p-3" style={{ height: "300px" }}>
                <h5 className="mb-3">Vendas Mensais</h5>
                <SalesChart
                  data={[
                    { name: "Jan", sales: 400 },
                    { name: "Feb", sales: 300 },
                    { name: "Mar", sales: 500 },
                    { name: "Apr", sales: 200 },
                  ]}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
            <div className="col-12 col-lg-6 mb-3">
              <div className="bg-white shadow-sm rounded p-3" style={{ height: "300px" }}>
                <h5 className="mb-3">Categorias de Produtos Mais Vendidas</h5>
                <CategorySalesChart
                  data={[
                    { category: "Eletrônicos", sales: 150 },
                    { category: "Roupas", sales: 100 },
                    { category: "Alimentos", sales: 200 },
                    { category: "Móveis", sales: 80 },
                  ]}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      <ThemeConfigurator open={configOpen} onClose={handleConfigClose} />
      {/* Footer */}
      {/*<Footer />*/}
    </div>
  );
};

export default Home;
