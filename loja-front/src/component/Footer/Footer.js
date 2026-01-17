import React from "react";
import { Navbar, Container } from "react-bootstrap";

/**
 * COMPONENTE FOOTER
 * ================
 * Rodapé da aplicação com informações de copyright
 * Integrado com o novo layout que posiciona o footer corretamente
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  /**
   * ESTILOS DO FOOTER
   * ================
   * Estilos inline para controle preciso do layout
   */
  const styles = {
    // 🔹 CONTAINER PRINCIPAL DO FOOTER
    // position: relative = integra com o layout flex (não mais fixed)
    // borderTop = linha sutil de separação
    // backgroundColor = cor suave que combina com o tema
    footerContainer: {
      position: 'relative', // MUDANÇA: de 'fixed' para 'relative'
      bottom: 0,
      width: '100%',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.05)', // Sombra superior sutil
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      zIndex: 100,
    },

    // 🔹 TEXTO DO COPYRIGHT
    footerText: {
      fontSize: '14px',
      textAlign: 'center',
      color: '#64748b',
      margin: 0,
      fontWeight: '400',
      lineHeight: '1.4',
    },

    // 🔹 NOME DA EMPRESA DESTACADO
    // Gradiente elegante para destacar a marca
    brandName: {
      background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      fontWeight: '600',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
    }
  };

  return (
    <Navbar style={styles.footerContainer}>
      <Container className="d-flex justify-content-center py-2">
        <span style={styles.footerText}>
          © {currentYear} SistemaVenda |{' '}
          <span 
            style={styles.brandName}
            // 🔹 EFEITO HOVER PARA A MARCA
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            Ideias Inovadoras
          </span>
        </span>
      </Container>
    </Navbar>
  );
};

export default Footer;