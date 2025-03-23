import React, { useState } from "react";
import "./index.css";
import { Form, Col, Row, Stack, FloatingLabel, Button } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { ButtonS } from "../../component/Buttons.js/CustomButton.js";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import api from "../../service/Api.js";
import { showSuccessToast, showErrorToast } from "../../component/Toast/ToastMessage.js"; // Certifique-se de ter essas funções utilitárias

const Login = () => {
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [load, setLoad] = useState(false);

  const handleLogin = async (loginData) => {
    try {
      const response = await axios.post(`${api}/employee/login`, loginData);
      if (response.status === 200) {
        const tokenData = response.data;
        alert(tokenData);
        const decodedToken = jwtDecode(tokenData);
        localStorage.setItem('id', decodedToken.id);
        localStorage.setItem('NivelAcesso', decodedToken.NivelAcesso);
        localStorage.setItem('token', tokenData);
        localStorage.setItem('nome', decodedToken.nome);
        localStorage.setItem('loja', decodedToken.loja);
        localStorage.setItem('sessionLogId', decodedToken.sessionLogId);
        showSuccessToast('Logado');
        window.location.href = '/home'; // Redireciona para o menu
      }
    } catch (error) {
      showErrorToast(error.response.data.mensagem);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    const loginData = { email, senha: password };
    await handleLogin(loginData);
    setLoad(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="bg-white shadow rounded" style={{ width: "25rem", height: "30rem" }}>
        <Col className="p-4" sm={12}>
          <div className="text-center mb-2">
            <FaUserCircle
              size={80} // Ajuste o tamanho do ícone
              className="logo-top mx-auto text-light bg-primary rounded-circle"
            />
          </div>
          <p className="text-center fs-4 fw-bold mb-4 text-primary">
            INICIAR SESSÃO
          </p>
          <ToastContainer />
          <Form onSubmit={handleSubmit}>
            <FloatingLabel
              controlId="formBasicEmail"
              className="mb-5"
              label="Email"
            >
              <Form.Control
                className="input_left_color"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="formBasicPassword"
              className="mb-4"
              label="Senha"
            >
              <Form.Control
                className="input_left_color"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FloatingLabel>
            <Stack
              gap={2}
              className="col-md-8 mx-auto mb-4"
              style={{ marginTop: "2rem" }}
            >
              <ButtonS
                className="fw-bolder"
                texto="ENTRAR"
                loadIf={load}
                type="submit"
              />
            </Stack>
            <Col className="d-flex align-items-end justify-content-end">
              <Link to="/emailrecuperar">
                <p>Esqueceu a sua senha?</p>
              </Link>
            </Col>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default Login;