import React, { useState, useContext } from "react";
import "../../css/login.css";
import { AuthContext } from "./../../component/contexts/AuthContext.js";
import { Form, Col, Row, FloatingLabel } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // ALTERAÇÃO: usar useNavigate em vez de window.location
import { ButtonS } from "../../component/Buttons.js/CustomButton.js";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import api from "../../service/Api.js";
import {
  showSuccessToast,
  showErrorToast,
} from "../../component/Toast/ToastMessage.js"; // Certifique-se de ter essas funções utilitárias
function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (loginData) => {
    try {
      const response = await axios.post(`${api}/employee/login`, loginData, {
        withCredentials: true, // envia cookie HttpOnly do refresh token
      });

      if (response.status !== 200 || !response.data?.accessToken) {
        throw new Error("Falha ao autenticar");
      }
      const tokenData = response.data.accessToken;

      // Decodifica token para extrair dados do utilizador
      const decodedToken = jwtDecode(tokenData);
     
      // 3️⃣ Busca informações adicionais da loja (logo)
      let shopData = {};
      try {
        const shopDTO = {
          id: decodedToken.lojaid, // ⚠️ chave deve ser exatamente "id"
        };
  
        const shopResponse = await axios.post(`${api}/shop/fetch`, shopDTO, {
          withCredentials: true,
        });

        shopData = shopResponse.data || {};
      } catch (shopError) {
        shopData.logoUrl = null; // fallback
      }

      // Atualiza AuthContext apenas com dados do utilizador
      login({
        id: decodedToken.id,
        nome: decodedToken.nome,
        loja: decodedToken.loja,
        idl:decodedToken.lojaid,
        NivelAcesso: decodedToken.NivelAcesso,
        accessToken: tokenData, // 🔹 guarda em memória
        logo: shopData?.logoUrl || "/default-logo.png", // fallback caso não exista logo
      });

      showSuccessToast("Logado com sucesso!");
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      const mensagem =
        error?.response?.data?.mensagem ||
        error.message ||
        "Erro ao efetuar login.";
      showErrorToast(mensagem);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    await handleLogin({ email, senha: password });
    setLoad(false);
  };
  return (
    <div className="login-background d-flex justify-content-center align-items-center min-vh-100">
      <Row
        className="" //bg-white shadow rounded
        style={{
          width: "100%",
          maxWidth: "400px", // 🔹 largura máxima para não esticar
          minHeight: "28rem", // 🔹 altura mínima
        }}
      >
        <Col className="p-4" sm={12}>
          <div className="login-card p-4 shadow-lg rounded">
            <div className="text-center mb-4">
              <FaUserCircle className="login-icon" />
            </div>
            <p className="text-center fs-7 fw-bold mb-4 text-primary">
              INICIAR SESSÃO
            </p>
            <ToastContainer />
            <Form onSubmit={handleSubmit}>
              <FloatingLabel
                controlId="formBasicEmail"
                label="Email"
                className="mb-4"
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
                label="Senha"
                className="mb-4"
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

              <ButtonS
                className="w-100 fw-bold btn-login mb-3"
                texto="ENTRAR"
                loadIf={load}
                type="submit"
              />

              <div className="text-end">
                <Link to="/emailrecuperar" className="forgot-link">
                  Esqueceu a sua senha?
                </Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Login;
