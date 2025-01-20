import React, { useState } from 'react';
import { Container, Navbar, Nav, NavDropdown, Button, Offcanvas } from 'react-bootstrap';

function Homepage() {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSidebarToggle = () => setShowSidebar(!showSidebar);

  return (
    <div>
      {/* Navbar */}
      <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#pricing">Pricing</Nav.Link>
              <NavDropdown title="Dropdown" id="collapsible-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav>
              <Nav.Link href="#deets">More deets</Nav.Link>
              <Nav.Link eventKey={2} href="#memes">Dank memes</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Sidebar for smaller screens */}
      <Button
        variant="primary"
        className="d-lg-none"
        onClick={handleSidebarToggle}
        style={{ position: 'fixed', left: '15px', top: '15px', zIndex: 1000 }}
      >
        ☰
      </Button>

      {/* Sidebar Offcanvas */}
      <Offcanvas show={showSidebar} onHide={handleSidebarToggle} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link href="#dashboard">Dashboard</Nav.Link>
            <Nav.Link href="#perfil">Perfil</Nav.Link>
            <Nav.Link href="#registo">Registo</Nav.Link>
            <Nav.Link href="#configuracoes">Configurações</Nav.Link>
            <Nav.Link href="#sair">Sair</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default Homepage;
