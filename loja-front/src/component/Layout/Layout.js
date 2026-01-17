import React, { useState } from 'react';
import Header from '../Header/Header';
import Menu from '../Menu/Menu';
import Footer from '../Footer/Footer';
import { Box } from "@mui/material"; // 🔹 Import MUI v5 Box

/**
 * COMPONENTE LAYOUT PRINCIPAL
 * =========================
 * Este componente é a estrutura base da aplicação que organiza:
 * - Menu lateral (desktop) / overlay (mobile)
 * - Header fixo com botão de toggle
 * - Área de conteúdo principal
 * - Footer fixo
 */
const Layout = ({ children, onConfigOpen }) => {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false); // 🔹 Estado para controlar menu
  const toggleMenu = () => { setIsMenuCollapsed(!isMenuCollapsed); }; // 🔹 Alterna menu

  const SIDEBAR_EXPANDED = 230;
  const SIDEBAR_COLLAPSED = 80;

  // 🔹 ESTILOS INLINE ATUALIZADOS PARA MUI V5
  const styles = {
    appContainer: {
      height: '100vh',                 // 🔹 Ocupa 100% da altura da janela do navegador
      display: 'flex',                 // 🔹 Layout flexível para posicionar menu + conteúdo lado a lado
      overflow: 'hidden',              // 🔹 Evita scroll da página inteira
      backgroundColor: '#f8f9fa',      // 🔹 Cor de fundo suave (quase branco acinzentado)
      margin: 0,                        // 🔹 Remove margens padrão do body
    },
    menuContainer: {
      height: '100vh',                 // 🔹 Ocupa 100% da altura da tela
      overflowY: 'auto',               // 🔹 Permite scroll vertical caso o menu seja maior que a tela
      flexShrink: 0,                   // 🔹 Impede que o menu encolha quando o conteúdo crescer
      transition: 'width 0.3s ease-in-out', // 🔹 Animação suave de expansão/recolhimento
      width: isMenuCollapsed ? '80px' : '230px', // 🔹 Largura dinâmica conforme o estado do menu
      backgroundColor: '#ffffff',      // 🔹 Fundo branco do menu
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)', // 🔹 Sombra sutil para criar profundidade
      zIndex: 1002,                     // 🔹 Garante que fique acima de outros elementos
      borderRight: '1px solid #e2e8f0', // 🔹 Linha fina à direita do menu para separação
    },
    contentWrapper: {
      flex: 1,                         // 🔹 Ocupa todo o espaço horizontal restante
      display: 'flex',                 // 🔹 Flex para organizar verticalmente Header, Main e Footer
      flexDirection: 'column',         // 🔹 Filhos empilhados verticalmente
      overflow: 'hidden',              // 🔹 Impede scroll indesejado dentro do wrapper
      //marginLeft: isMenuCollapsed ? `${SIDEBAR_COLLAPSED}px` : `${SIDEBAR_EXPANDED}px`, // 🔹 Empurra conteúdo para direita do menu
    },
    mainContent: {
      flex: 1,                         // 🔹 Expande para ocupar espaço entre Header e Footer
      overflowY: 'auto',               // 🔹 Scroll vertical apenas na área de conteúdo
      padding: '24px',                 // 🔹 Espaçamento interno
      backgroundColor: '#fafbfc',      // 🔹 Cor de fundo do conteúdo
      paddingTop: '70px',              // 🔹 Espaço para o header fixo
    },
    mobileOverlay: {
      position: 'fixed',               // 🔹 Fixa overlay sobre toda a tela
      top: 0,                          // 🔹 Começa no topo
      left: 0,                         // 🔹 Começa à esquerda
      right: 0,                        // 🔹 Vai até a borda direita
      bottom: 0,                       // 🔹 Vai até a borda inferior
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // 🔹 Fundo semi-transparente escuro
      zIndex: 998,                     // 🔹 Abaixo do menu, mas acima do conteúdo
    },
    mobileMenu: {
      position: 'fixed',               // 🔹 Fixo sobre a tela
      top: 0,                          // 🔹 Posicionado no topo
      left: 0,                         // 🔹 Posicionado à esquerda
      height: '100vh',                 // 🔹 Ocupa altura total
      width: '280px',                  // 🔹 Largura maior no mobile
      backgroundColor: '#ffffff',      // 🔹 Fundo branco
      zIndex: 1000,                    // 🔹 Acima de todos os elementos
      transform: isMenuCollapsed ? 'translateX(-100%)' : 'translateX(0)', // 🔹 Move menu fora da tela se recolhido
      transition: 'transform 0.3s ease-in-out', // 🔹 Animação suave de deslize
      boxShadow: '2px 0 20px rgba(0,0,0,0.3)', // 🔹 Sombra mais intensa no mobile
    },
  };

  return (
    <Box sx={styles.appContainer}> {/* 🔹 Container principal */}

      {/* 🔹 MENU LATERAL DESKTOP */}
      <Box className="d-none d-lg-block" sx={styles.menuContainer}>
        <Menu 
          isMenuCollapsed={isMenuCollapsed} 
        />
      </Box>

      {/* 🔹 OVERLAY MOBILE */}
      {!isMenuCollapsed && (
        <Box 
          className="d-lg-none"
          sx={styles.mobileOverlay}
          onClick={toggleMenu} // 🔹 Clique fecha menu
        />
      )}

      {/* 🔹 MENU MOBILE */}
      <Box className="d-lg-none" sx={styles.mobileMenu}>
        <Menu 
          isMobile={true} 
          onClose={toggleMenu} 
        />
      </Box>

      {/* 🔹 CONTEÚDO (Header + Main + Footer) */}
      <Box sx={styles.contentWrapper}>
        <Header 
          onConfigOpen={onConfigOpen} 
          toggleMenu={toggleMenu} 
          isMenuCollapsed={isMenuCollapsed} 
        />

        <Box component="main" sx={styles.mainContent}>
          {children}
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
