import React, {useContext} from "react";
import { Formik } from "formik";
import "./index.css";
import { Row, Col, Form, FloatingLabel, Stack } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { ButtonS } from "../../component/Buttons.js/CustomButton";
import { FaUserCircle } from "react-icons/fa";
import { registerSchema } from "./Functions/FunctionYup";
import { UserDataContext } from "./ContextRegister";

const Register = ({setStep}) => {
    const { setDataUser} = useContext(UserDataContext);
  const initialValues = {
    nome: "",
    email: "",
  };

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Valores enviados:", values);
    setSubmitting(true);

    // Simula uma chamada de autenticação
    setTimeout(() => {
      setSubmitting(false);
      setStep(2)
      setDataUser(values)
      
      console.log("Usuário registrado com sucesso!");
    }, 2000);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="bg-white shadow rounded" style={{ width: "35rem" }}>
        <div className="text-center mb-2">
          <FaUserCircle
            size={80}
            className="mx-auto text-light bg-primary rounded-circle"
          />
        </div>
        <p className="text-center fs-6 fw-bold mb-4 text-primary">
          REGISTO DO UTILIZADOR
        </p>

        <Col className="p-4" sm={12}>
          <ToastContainer />
          <Formik
            initialValues={initialValues}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              isSubmitting,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                {/* Campo Nome */}
                <FloatingLabel
                  controlId="formName"
                  className="mb-4"
                  label="Nome Completo*"
                >
                  <Form.Control
                    type="text"
                    name="nome"
                    placeholder="Digite o seu nome completo"
                    className={`input_left_color ${
                      touched.nome && errors.nome ? "is-invalid" : ""
                    }`}
                    value={values.nome}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.nome && errors.nome && (
                    <div className="invalid-feedback">{errors.nome}</div>
                  )}
                </FloatingLabel>

                {/* Campo Email */}
                <FloatingLabel
                  controlId="formBasicEmail"
                  className="mb-4"
                  label="Email"
                >
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    className={`input_left_color ${
                      touched.email && errors.email ? "is-invalid" : ""
                    }`}
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.email && errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </FloatingLabel>

                {/* Botão de Submissão */}
                <Stack
                  gap={2}
                  className="col-md-8 mx-auto mb-4"
                  style={{ marginTop: "3rem" }}
                >
                  <ButtonS
                    className="fw-bolder"
                    texto="ENVIAR"
                    loadIf={isSubmitting}
                    type="submit"
                  />
                </Stack>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
