import React from "react";
import { Navbar, Container } from "react-bootstrap";
import "./Footer.css";

const Footer = () => {
  return (
    <Navbar bg="dark" variant="dark" fixed="bottom" className="py-2">
      <Container className="d-flex justify-content-center">
        <Navbar.Text className="text-center text-white footer-text">
          © {new Date().getFullYear()} SistemaVenda |{" "}
          <span className="ideias-inovadoras">Ideias Inovadoras</span>
        </Navbar.Text>
      </Container>
    </Navbar>
  );
};

export default Footer;
