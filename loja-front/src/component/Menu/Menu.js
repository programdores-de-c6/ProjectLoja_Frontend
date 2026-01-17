import React, { useContext, useState } from "react";
import { Nav } from "react-bootstrap";
import {
  FaHome,
  FaCog,
  FaWarehouse,
  FaShoppingCart,
  FaMoneyBillAlt,
  FaChartLine,
  FaReceipt,
  FaListAlt,
  FaSortNumericUpAlt,
  FaUserShield,
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
import { AuthContext } from "../../component/contexts/AuthContext"; // 🔹 Importa o contexto
import StorefrontIcon from "@mui/icons-material/Storefront"; // 🔹 Importa o ícone
import { Typography, Box, Button, CircularProgress } from "@mui/material"; // 🔹 Typography e Box do MUI v5
import Modal from "@mui/material/Modal";
import api from "../../service/Api.js";
import axios from "axios";
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js";

/**
 * COMPONENTE MENU LATERAL (REFEITO MUI V5)
 * =======================================
 */
const Menu = ({ isMenuCollapsed }) => {
  const { user, initAuth } = useContext(AuthContext); // 🔹 Pega o usuário do contexto
  // Estado do modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
    setSelectedFile(null);
  };

  // Quando selecionar arquivo
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Simulação do upload para backend
  const handleUpload = async () => {
    if (!selectedFile) return alert("Escolha uma imagem");

    const formData = new FormData();
    formData.append(
      "id", // id da loja
      new Blob([JSON.stringify({ id: user?.idl })], {
        type: "application/json",
      })
    );
    formData.append("file", selectedFile); // arquivo logo

    try {
      // 🔹 Chamada API para atualizar logo
      const response = await axios.post(`${api}/shop/upload-logo`, formData, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // envia cookie HttpOnly do refresh token
      });
      showSuccessToast(response?.data?.message || " criada com sucesso!");
      handleClose();
      await initAuth();
    } catch (error) {
      showErrorToast(error?.response?.data?.message || "Erro ao criar ");
    }
  };
  if (!user) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%", // 🔹 Ocupa 100% da largura disponível
        height: "100vh", // 🔹 Ocupa 100% da altura
        backgroundColor: "#ffffff", // 🔹 Fundo branco
        display: "flex", // 🔹 Layout flexível vertical
        flexDirection: "column", // 🔹 Coluna de cima para baixo
        borderRight: "2px solid #1976d2", // 🔹 Borda direita azul
      }}
    >
      {/* 🔹 CABEÇALHO DO MENU */}
      <Box
        sx={{
          display: "flex", // 🔹 Usa layout flex para alinhar logo e nome horizontalmente
          alignItems: "center", // 🔹 Alinha verticalmente os itens ao centro
          padding: isMenuCollapsed ? "8px" : "15px", // 🔹 Padding interno: menor se menu colapsado
          height: 69, // 🔹 Altura fixa do cabeçalho (impede desajuste)
          flexShrink: 0, // 🔹 Impede que o cabeçalho encolha
          transition: "padding 0.3s ease-in-out", // 🔹 Suaviza mudança de padding ao colapsar
          backgroundColor: "#1976d2", // 🔹 Cor de fundo azul
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // 🔹 Sombra discreta para destaque
          gap: 1, // 🔹 Espaço entre logo e texto
          justifyContent: isMenuCollapsed ? "center" : "flex-start", // 🔹 Centraliza logo se menu colapsado
        }}
      >
        {/* 🔹 LOGO CLICÁVEL */}
        {user.logo ? (
          <img
            src={user.logo}
            alt={user.loja?.nome || "Logo"}
            onClick={handleOpen}
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain",
              cursor: "pointer", // mostra que é clicável
            }}
          />
        ) : (
          <StorefrontIcon // 🔹 Se não houver logo, usa ícone padrão
            sx={{
              height: "70%", // 🔹 Altura do ícone proporcional ao cabeçalho
              width: "auto", // 🔹 Largura proporcional
              marginRight: !isMenuCollapsed ? 1 : 0, // 🔹 Espaço à direita se menu expandido
              color: "#fff", // 🔹 Cor branca do ícone
            }}
            fontSize="large" // 🔹 Define tamanho do ícone
          />
        )}

        {/* 🔹 TÍTULO/NOME DA LOJA */}
        {!isMenuCollapsed && (
          <Typography
            variant="h77" // 🔹 Variante de tipografia (MUI)
            sx={{
              fontWeight: 400, // 🔹 Peso da fonte
              color: "#fff", // 🔹 Cor do texto branca
              whiteSpace: "nowrap", // 🔹 Sem quebra de linha
              overflow: "hidden", // 🔹 Esconde excesso de texto
              fontSize: "13px", // 🔹 Tamanho da fonte
            }}
          >
            {user?.loja || "Sistema de Vendas"}
          </Typography>
        )}

        <Modal open={openModal} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
              width: 400,
            }}
          >
            {/* Cabeçalho */}
            <Typography
              variant="h6"
              align="center"
              sx={{
                mb: 3,
                fontWeight: "bold",
                color: "#1976d2",
              }}
            >
              Alterar Logo da Loja
            </Typography>

            {/* Área de upload */}
            <Box
              sx={{
                border: "2px dashed #ccc",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                "&:hover": { borderColor: "#1976d2" },
              }}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <Typography variant="body2" color="textSecondary">
                Clique aqui para selecionar a imagem
              </Typography>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  📂 {selectedFile.name}
                </Typography>
              )}
            </Box>

            {/* Preview */}
            {selectedFile && (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Pré-visualização"
                  style={{
                    maxWidth: "100%",
                    height: "120px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    padding: "4px",
                    background: "#fafafa",
                  }}
                />
              </Box>
            )}

            {/* Botões */}
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button variant="outlined" color="inherit" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#1976d2" }}
                onClick={handleUpload}
              >
                Enviar
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>

      {/* 🔹 ÁREA DE NAVEGAÇÃO COM ITENS */}
      <Box
        sx={{
          flex: 1, // 🔹 Ocupa espaço restante
          overflowY: "auto", // 🔹 Rolagem vertical se necessário
          padding: "8px", // 🔹 Padding interno
        }}
      >
        <Nav className="flex-column">
          <MenuItem
            icon={<FaHome />}
            title="Dashboard"
            path="/"
            isMenuCollapsed={isMenuCollapsed}
          />
          <MenuItem
            icon={<FaWarehouse />}
            title="Gestão de Recursos"
            isMenuCollapsed={isMenuCollapsed}
            subItems={[
          

              { icon: <FaStore />, title: "Lojas", path: "/shop" },
              {
                icon: <FaTruck />,
                title: "Fornecedores",
                path: "/supplier",
              },

              {
                icon: <FaBox />,
                title: "Produtos",
                path: "/prod",
              },
              {
                icon: <FaUsers />,
                title: "Funcionários",
                path: "/employee",
              },
              {
                icon: <FaListAlt />,
                title: "Categorias",
                path: "/category",
              },
              {
                icon: <FaUser />,
                title: "Clientes",
                path: "/client",
              },
            ]}
          />

          <MenuItem
            icon={<FaCog />}
            title="Gestão Avançada"
            isMenuCollapsed={isMenuCollapsed}
            subItems={[
              {
                icon: <FaFileInvoiceDollar />,
                title: "Cargos",
                path: "/jobtitle",
              },
                  {
                icon: <FaMapMarkerAlt />,
                title: "Localidades",
                path: "/localidade",
              },
                {
                icon: <FaReceipt />,
                title: "Impostos",
                path: "/tax",
              },
              {
                icon: <FaSortNumericUpAlt />,
                title: "Serie",
                path: "/serie",
              },
              
            ]}
          />
          <MenuItem
            icon={<FaShoppingCart />}
            title="Operações"
            isMenuCollapsed={isMenuCollapsed}
            subItems={[
              {
                icon: <FaShoppingCart />,
                title: "Vendas",
                path: "/sale",
              },
              {
                icon: <FaFileInvoiceDollar />,
                title: "Proformas",
                path: "/operacoes/proformas",
              },
              {
                icon: <FaClipboardList />,
                title: "Requisições",
                path: "/operacoes/requisicoes",
              },
            ]}
          />
          <MenuItem
            icon={<FaMoneyBillAlt />}
            title="Despesas"
            isMenuCollapsed={isMenuCollapsed}
            subItems={[
              {
                icon: <FaMoneyBillAlt />,
                title: "Despesas",
                path: "/despesas/registro",
              },
              {
                icon: <FaTags />,
                title: "Categorias",
                path: "/despesas/categorias",
              },
            ]}
          />
          <MenuItem
            icon={<FaChartLine />}
            title="Relatórios"
            isMenuCollapsed={isMenuCollapsed}
            subItems={[
              {
                icon: <FaChartLine />,
                title: "Vendas",
                path: "/sale",
              },
              {
                icon: <FaBox />,
                title: "Estoque",
                path: "/relatorios/estoque",
              },
              {
                icon: <FaUsers />,
                title: "Clientes",
                path: "/relatorios/clientes",
              },
              {
                icon: <FaMoneyBillAlt />,
                title: "Despesas",
                path: "/relatorios/despesas",
              },
            ]}
          />
        </Nav>
      </Box>
    </Box>
  );
};

export default Menu;
