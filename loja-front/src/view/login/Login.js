import React, { useState } from "react";
import "./index.css";
import { Form, Col, Row, Stack, FloatingLabel, Button } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { ButtonS } from "../../Componente/Buttons.js/CustomButton";
import { FaUserCircle } from "react-icons/fa";
const Login = () => {
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [load, setLoad] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      console.log("Campos obrigatórios não preenchidos");
      return;
    }
    setLoad(true);
    // Simula uma chamada de autenticação
    setTimeout(() => {
      setLoad(false);
      setAuth(true);
    }, 2000);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="bg-white shadow rounded" style={{ width: "35rem" }}>
        {/* Formulário */}
        <Col className="p-4" sm={12}>
          <div className="text-center mb-2  ">
            <FaUserCircle
              size={100}
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
              style={{ marginTop: "3rem" }}
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
