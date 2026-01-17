import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

/**
 * COMPONENTE ITEM DE MENU
 * ======================
 * Representa um item individual no menu lateral
 * Pode ter subitens (dropdown) ou ser um link direto
 * 
 * Props:
 * - icon: Ícone a ser exibido
 * - title: Texto do item
 * - path: URL para navegação (opcional - se não tiver, é um dropdown)
 * - subItems: Array de subitens (opcional)
 * - isMenuCollapsed: Se o menu está recolhido
 */
const MenuItem = ({ icon, title, path, subItems, isMenuCollapsed }) => {
  // 🔹 ESTADO PARA CONTROLAR DROPDOWN
  // Controla se os subitens estão visíveis ou não
  const [isOpen, setIsOpen] = useState(false);
const location = useLocation(); // pega a rota atual
const isActive = (path) => location.pathname === path;
  // 🔹 FUNÇÃO PARA ALTERNAR SUBITENS
  // Só funciona quando há subitens E o menu não está recolhido
  const toggleSubItems = () => {

      setIsOpen(!isOpen);
    
  };
// 🔹 FUNÇÃO PARA NAVEGAR (quando é um item direto)
  //const handleDirectNavigation = (e) => {
    // Se tem path mas não tem subitens, é um item de navegação direta
    //if (path && !subItems) return;

    // Se não tem path, previne navegação e tenta abrir dropdown
    //if (!path) {
     // e.preventDefault();
     // toggleSubItems();
  //  }
 // };

  /**
   * ESTILOS INLINE
   * =============
   * Estilos específicos para diferentes estados do item
   */
  const itemStyles = {
  // 🔹 ESTILO BASE DO ITEM
  menuItem: {
    padding: '12px 16px',              // Espaçamento interno: 12px em cima/baixo, 16px nas laterais
    margin: '4px 8px',                 // Espaçamento externo: 4px em cima/baixo, 8px nas laterais
    borderRadius: '800px',               // Bordas arredondadas (cantos suaves)
    transition: 'all 0.2s ease-in-out',// Animação suave de 0.2s quando muda cor, tamanho etc.
    cursor: 'pointer',                 // Mostra a "mãozinha" ao passar por cima
    textDecoration: 'none',            // Remove sublinhado (caso seja <a> ou Link)
    color: '#333',                     // Texto a cinzento escuro
    display: 'flex',                   // Layout em linha (ícone + texto lado a lado)
    alignItems: 'center',              // Centraliza verticalmente o conteúdo dentro do item
    fontSize: '17px',                  // Tamanho da fonte
    fontWeight: '500',                 // Peso da fonte (semibold)
    border: 'none',                    // Sem borda padrão (caso fosse <button>)
    backgroundColor: 'transparent',    // Fundo transparente no estado inicial
    width: '100%',                     // Item ocupa toda a largura disponível
  },


    
    // 🔹 ESTILO DOS SUBITENS
subMenuItem: {
  padding: '10px 20px 10px 45px',  // Espaçamento interno
                                   // 10px em cima, 20px à direita, 10px em baixo
                                   // 45px à esquerda → cria "indentação" (afastamento) para mostrar hierarquia

  margin: '2px 16px',              // Espaçamento externo (mais pequeno que o menu principal)
  borderRadius: '6px',             // Bordas arredondadas, mas mais suaves que o item principal
  fontSize: '15px',                // Texto mais pequeno para indicar que é "secundário"
  color: '#555',                   // Texto a cinzento médio (menos destaque que o principal)
  backgroundColor: '#f8f9fa',      // Fundo cinzento claro (destaca-se do branco do fundo)
  borderLeft: '3px solid transparent', // Linha lateral esquerda (usada normalmente para mostrar ativo/selecionado)
  transition: 'all 0.2s ease-in-out',  // Animação suave ao hover/active
  textDecoration: 'none',          // Remove sublinhado (se for <a> ou <Link>)
  display: 'flex',                 // Layout flexível (ícone + texto alinhados)
  alignItems: 'center',            // Centraliza verticalmente os elementos
  
},

// 🔹 ALTERAÇÃO: estilo específico para subitens quando menu está colapsado
   subMenuItemCollapsed: {
  width: '30px',                     // 🔹 Largura do botão do subitem
  height: '30px',                    // 🔹 Altura do botão do subitem
  display: 'flex',                   // 🔹 Layout flexível para centralizar conteúdo
  justifyContent: 'center',          // 🔹 Centraliza horizontalmente o ícone
  alignItems: 'center',              // 🔹 Centraliza verticalmente o ícone
  margintop: '0px ',                   // 🔹 Espaçamento vertical entre ícones (embaixo do item principal)
  cursor: 'pointer',                 // 🔹 Muda o cursor para "mãozinha" ao passar por cima
  borderRadius: '6px',               // 🔹 Bordas arredondadas suaves
  backgroundColor: '#f8f9fa',         // 🔹 Fundo branco (ajustado de cinza para branco)
  color: '#64748b',                  // 🔹 Cor do ícone/texto preta
  transition: 'all 0.2s ease-in-out',// 🔹 Transição suave de alterações visuais (hover)
  fontSize: '14px', 
  
},
    // 🔹 CONTAINER DO ÍCONE
    iconContainer: {
      minWidth: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }
  };

return (
    <>
      {/* 🔹 ITEM PRINCIPAL DO MENU */}
      <Nav.Item>
        {/* 🔹 TOOLTIP PARA MENU RECOLHIDO */}
        <OverlayTrigger
          placement="right"
          overlay={
            isMenuCollapsed ? <Tooltip id={`tooltip-${title}`}>{title}</Tooltip> : <span></span>
          }
        >
          {/* 🔹 LINK OU BOTÃO DO ITEM */}
          {path && !subItems ? (
            // 📍 ITEM COM NAVEGAÇÃO DIRETA
            <Nav.Link
              as={Link}
              to={path}
              className="d-flex align-items-center text-dark menu-item"
              style={itemStyles.menuItem}
            >
              {/* Ícone do item */}
              <div style={itemStyles.iconContainer}>{icon}</div>

              {/* Título (só mostra quando menu expandido) */}
              {!isMenuCollapsed && (
                <span className="ms-3" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {title}
                </span>
              )}
            </Nav.Link>
          ) : (
            // 📂 ITEM COM DROPDOWN
            <button
              onClick={toggleSubItems}
              className={`d-flex align-items-center text-dark menu-item ${isOpen ? "active" : ""}`}
              style={{
                ...itemStyles.menuItem,
                backgroundColor: isOpen ? '#e3f2fd' : 'transparent',
                color: isOpen ? '#1976d2' : '#333',
              }}
            >
              {/* Ícone do item */}
              <div style={itemStyles.iconContainer}>{icon}</div>

              {/* Título e seta (só mostra quando menu expandido) */}
              {!isMenuCollapsed && (
                <>
                  <span className="ms-3" style={{ flex: 1, whiteSpace: 'nowrap', textAlign: 'left' }}>
                    {title}
                  </span>

                  {/* Seta indicativa de dropdown */}
                  {subItems && (
                    <span className="ms-auto">
                      {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </OverlayTrigger>
      </Nav.Item>

      {/* 🔹 SUBMENU */}
      {subItems && isOpen && (
        <>
          {/* 🔹 MENU EXPANDIDO */}
          {!isMenuCollapsed && (
            <Nav className="flex-column submenu">
              {subItems.map((subItem, index) => (
                <Nav.Item key={index}>
                  <Nav.Link
  as={Link}
  to={subItem.path}
  className="d-flex align-items-center text-dark"
  style={{
    ...itemStyles.subMenuItem,
    backgroundColor: isActive(subItem.path) ? '#f0f7ff' : '#f8f9fa',
    borderLeftColor: isActive(subItem.path) ? '#1976d2' : 'transparent',
    color: isActive(subItem.path) ? '#1976d2' : '#555',
  }}
  onMouseEnter={(e) => {
    e.target.style.backgroundColor = '#f0f7ff';
    e.target.style.borderLeftColor = '#1976d2';
    e.target.style.color = '#1976d2';
  }}
  onMouseLeave={(e) => {
    // só volta para o estado normal se não estiver ativo
    if (!isActive(subItem.path)) {
      e.target.style.backgroundColor = '#f8f9fa';
      e.target.style.borderLeftColor = 'transparent';
      e.target.style.color = '#555';
    }
  }}
>
                    <span style={{ minWidth: '16px', marginRight: '8px' }}>{subItem.icon}</span>
                    <span style={{ fontSize: '13px' }}>{subItem.title}</span>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          )}

          {/* 🔹 ALTERAÇÃO: MENU COLAPSADO - mostra apenas ícones dos subitens */}
          {isMenuCollapsed && ( // 🔹 NOVO BLOCO
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '16px' }}>
              {subItems.map((subItem, index) => (

                  <OverlayTrigger
        key={index}
        placement="right"
        overlay={<Tooltip id={`tooltip-${subItem.title}`}>{subItem.title}</Tooltip>}
      >
                <Link key={index} to={subItem.path} style={itemStyles.subMenuItemCollapsed}>
                  {subItem.icon} {/* 🔹 mostra apenas ícone */}
                </Link>
                </OverlayTrigger>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MenuItem;