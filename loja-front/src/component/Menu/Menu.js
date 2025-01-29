import React from "react";
import { Button, Nav } from "react-bootstrap";
import {
  FaBars,
  FaHome,
  FaCog,
  FaShoppingCart,
  FaMoneyBillAlt,
  FaChartLine,
  FaBox,
  FaUsers,
  FaMapMarkerAlt,
  FaStore,
  FaTruck,
  FaTags,
  FaUser,
  FaFileInvoiceDollar,
  FaClipboardList,
} from "react-icons/fa";
import MenuItem from "./MenuItem";

const Menu = ({ isMenuCollapsed, toggleMenu }) => {
  return (
    <aside
      className={`menu-container bg-white shadow p-3`}
      style={{
        width: isMenuCollapsed ? "80px" : "250px",
        transition: "width 0.3s",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Cabeçalho do Menu */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {!isMenuCollapsed && <h1 className="h4">SistemaVenda</h1>}
        <Button variant="link" onClick={toggleMenu} className="p-0">
          <FaBars />
        </Button>
      </div>

      {/* Itens do Menu */}
      <Nav className="flex-column">
        <MenuItem
          icon={<FaHome className={`menu-icon ${isMenuCollapsed ? "" : "me-2"}`} />}
          title="Dashboard"
          isMenuCollapsed={isMenuCollapsed}
        />

        <MenuItem
          icon={<FaCog className={`menu-icon ${isMenuCollapsed ? "" : "me-2"}`} />}
          title="Cadastro"
          subItems={[
            { icon: <FaMapMarkerAlt className="me-2" />, title: "Países", path: "/cadastro/paises" },
            { icon: <FaMapMarkerAlt className="me-2" />, title: "Zonas", path: "/cadastro/zonas" },
            { icon: <FaMapMarkerAlt className="me-2" />, title: "Distritos", path: "/cadastro/distritos" },
            { icon: <FaMapMarkerAlt className="me-2" />, title: "Localidades", path: "/cadastro/localidades" },
            { icon: <FaStore className="me-2" />, title: "Lojas", path: "/cadastro/lojas" },
            { icon: <FaTruck className="me-2" />, title: "Fornecedores", path: "/cadastro/fornecedores" },
            { icon: <FaTags className="me-2" />, title: "Categorias", path: "/cadastro/categorias" },
            { icon: <FaBox className="me-2" />, title: "Produtos", path: "/cadastro/produtos" },
            { icon: <FaUser className="me-2" />, title: "Clientes", path: "/cadastro/clientes" },
            { icon: <FaUser className="me-2" />, title: "Funcionários", path: "/cadastro/funcionarios" },
          ]}
          isMenuCollapsed={isMenuCollapsed}
        />

        <MenuItem
          icon={<FaShoppingCart className={`menu-icon ${isMenuCollapsed ? "" : "me-2"}`} />}
          title="Operações Comerciais"
          subItems={[
            { icon: <FaShoppingCart className="me-2" />, title: "Vendas", path: "/operacoes/vendas" },
            { icon: <FaFileInvoiceDollar className="me-2" />, title: "Proformas", path: "/operacoes/proformas" },
            { icon: <FaClipboardList className="me-2" />, title: "Requisições", path: "/operacoes/requisicoes" },
          ]}
          isMenuCollapsed={isMenuCollapsed}
        />

        <MenuItem
          icon={<FaMoneyBillAlt className={`menu-icon ${isMenuCollapsed ? "" : "me-2"}`} />}
          title="Despesas"
          subItems={[
            { icon: <FaMoneyBillAlt className="me-2" />, title: "Registro de Despesas", path: "/despesas/registro" },
            { icon: <FaTags className="me-2" />, title: "Categorias de Despesas", path: "/despesas/categorias" },
          ]}
          isMenuCollapsed={isMenuCollapsed}
        />

        <MenuItem
          icon={<FaChartLine className={`menu-icon ${isMenuCollapsed ? "" : "me-2"}`} />}
          title="Relatórios"
          subItems={[
            { icon: <FaChartLine className="me-2" />, title: "Vendas por Período", path: "/relatorios/vendas" },
            { icon: <FaBox className="me-2" />, title: "Estoque", path: "/relatorios/estoque" },
            { icon: <FaUsers className="me-2" />, title: "Clientes", path: "/relatorios/clientes" },
            { icon: <FaMoneyBillAlt className="me-2" />, title: "Despesas", path: "/relatorios/despesas" },
          ]}
          isMenuCollapsed={isMenuCollapsed}
        />
      </Nav>
    </aside>
  );
};

export default Menu;