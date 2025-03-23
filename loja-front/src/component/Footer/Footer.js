import React from "react";
import { Navbar, Container } from "react-bootstrap";
import "./Footer.css";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  navbar: {
    backgroundColor: 'var(--footer-bg-color)',
    color: 'var(--footer-text-color)',
  },
  text: {
    textAlign: 'center',
  },
}));

const Footer = () => {
  const classes = useStyles();

  return (
    <Navbar fixed="bottom" className={`py-2 shadow-sm ${classes.navbar}`}>
      <Container className="d-flex justify-content-center">
        <Navbar.Text className={`text-center ${classes.text}`}>
          © {new Date().getFullYear()} SistemaVenda |{" "}
          <span className="ideias-inovadoras">Ideias Inovadoras</span>
        </Navbar.Text>
      </Container>
    </Navbar>
  );
};

export default Footer;
