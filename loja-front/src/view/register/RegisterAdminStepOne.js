// CadastroData.js
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Form, Col, Row} from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";


import { UserDataContext } from "./ContextRegister";
import { showErrorToast } from "../../component/Toast/ToastMessage";
import FormField from "../../component/Inputs/FormField";
import SelectField from "../../component/Selects/SelectField";
import { ButtonS } from "../../component/Buttons.js/CustomButton";

const CadastroData = ({ setStep }) => {
  const { dataUser,  setDataUser } = useContext(UserDataContext);

  const [morada, setMorada] = useState([]);
  const [zona, setZona] = useState([]);
  const [distrito, setDistrito] = useState([]);
  const [smsErro, setSmsErro] = useState("");

  useEffect(() => {
    buscarZona();
  }, []);

const validationSchema = Yup.object().shape({
   nome: Yup.string().required("Nome é obrigatório"),
   email: Yup.string().email("Email inválido").required("Email é obrigatório"),
   dataNascimento: Yup.date().required("Data de nascimento é obrigatória"),
   bi: Yup.string().required("Número de BI é obrigatório"),
   sexo: Yup.string().required("Sexo é obrigatório"),
   distritou: Yup.number().required("Distrito é obrigatório"),
   zonau: Yup.number().required("Zona é obrigatória"),
   contato: Yup.string().required("Contato é obrigatório"),
   code: Yup.string().required("Codigo de confirmação é obrigatório"),
 });
  const formik = useFormik({
    initialValues: {
      nome: dataUser.nome,
      email: dataUser.email,
      dataNascimento: "",
      bi: "",
      sexo: "",
      distritou: "",
      zonau: "",
      contato: "",
      code: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const response = await axios.post("/utilizador/validar", { email: values.email });
        if (response.status === 201) {
          setStep(2);
          setDataUser(values);
          formik.resetForm();
        }
      } catch (error) {
        if (error.response?.data) {
          const errorMessage = error.response.data.erros?.[0] || error.response.data.mensagem || "Erro desconhecido";
          showErrorToast(errorMessage);
          setSmsErro(errorMessage);
        }
      }
      setSubmitting(false);
    },
  });

  const buscarZona = async () => {
    try {
      const resposta = await axios.get("/distrito/listar");
      setMorada(resposta.data);
      setDistrito(resposta.data);
      const distritosUnicos = [...new Set(resposta.data.flatMap((item) => item.zonaDTOs))];
      setZona(distritosUnicos);
    } catch (error) {
      console.error("Erro ao buscar a zona:", error);
    }
  };

  const buscarZonaArrays = (idDistritoSelecionado) => {
    const zonasDoDistrito = morada.filter((distrito) => distrito.id === idDistritoSelecionado);
    setZona(zonasDoDistrito.flatMap((item) => item.zonaDTOs));
  };

  const buscarDistritoPorZona = (idZonaSelecionado) => {
    const distritoEncontrado = morada.find((distrito) =>
      distrito.zonaDTOs.some((zona) => zona.id === idZonaSelecionado)
    );
    formik.setFieldValue("distritou", distritoEncontrado.id);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
    <Row className="bg-white shadow rounded" style={{ width: "40rem" }}>
      {/* Formulário */}
     

    <Col className="p-4" md={12}>
      <div className="mb-4 border border-primary rounded-3 border-2">
        <h3 className="text-primary font-weight-bold text-center">
          REGISTO DO UTILIZADOR
        </h3>
      </div>

      <ToastContainer />
      <Form noValidate onSubmit={formik.handleSubmit}>
        <FormField
          controlId="formName"
          label="Nome Completo*"
          type="text"
          name="nome"
          placeholder="Digite o seu nome completo"
          value={formik.values.nome}
          onChange={formik.handleChange}
          isInvalid={formik.touched.nome && formik.errors.nome}
          feedback={formik.errors.nome}
        />

        <FormField
          controlId="formBasicEmail"
          label="Email*"
          type="email"
          name="email"
          placeholder="Digite o seu Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          isInvalid={formik.touched.email && formik.errors.email}
          feedback={formik.errors.email}
        />
        <FormField
          controlId="formBasicCode"
          label="Código de Confirmação"
          type="text"
          name="code"
          placeholder="Digite o seu código de autenticação"
          value={formik.values.code}
          onChange={formik.handleChange}
          isInvalid={formik.touched.code && formik.errors.code}
          feedback={formik.errors.code}
        />

        <Row>
          <Col md={6}>
            <FormField
              controlId="formDataN"
              label="Data de Nascimento*"
              type="date"
              name="dataNascimento"
              placeholder="Data de Nascimento"
              value={formik.values.dataNascimento}
              onChange={formik.handleChange}
              isInvalid={formik.touched.dataNascimento && formik.errors.dataNascimento}
              feedback={formik.errors.dataNascimento}
            />
          </Col>
          <Col md={6}>
            <SelectField
              controlId="formSexo"
              label="Sexo*"
              name="sexo"
              value={formik.values.sexo}
              onChange={formik.handleChange}
              options={[
                { id: "M", nome: "Masculino" },
                { id: "F", nome: "Feminino" },
              ]}
              isInvalid={formik.touched.sexo && formik.errors.sexo}
              feedback={formik.errors.sexo}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              controlId="formBi"
              label="BI Nº*"
              type="text"
              name="bi"
              placeholder="Digite o número do BI"
              value={formik.values.bi}
              onChange={formik.handleChange}
              isInvalid={formik.touched.bi && formik.errors.bi}
              feedback={formik.errors.bi}
            />
          </Col>
          <Col md={6}>
            <FormField
              controlId="formContato"
              label="Contato*"
              type="text"
              name="contato"
              placeholder="Digite o seu Contato"
              value={formik.values.contato}
              onChange={formik.handleChange}
              isInvalid={formik.touched.contato && formik.errors.contato}
              feedback={formik.errors.contato}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <SelectField
              controlId="formDistrito"
              label="Distrito*"
              name="distritou"
              value={formik.values.distritou}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                buscarZonaArrays(id);
                formik.setFieldValue("distritou", id);
              }}
              options={distrito}
              isInvalid={formik.touched.distritou && formik.errors.distritou}
              feedback={formik.errors.distritou}
            />
          </Col>
          <Col md={6}>
            <SelectField
              controlId="formZona"
              label="Zona*"
              name="zonau"
              value={formik.values.zonau}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                buscarDistritoPorZona(id);
                formik.setFieldValue("zonau", id);
              }}
              options={zona}
              isInvalid={formik.touched.zonau && formik.errors.zonau}
              feedback={formik.errors.zonau}
            />
          </Col>
        </Row>
        
              <ButtonS
                className="fw-bolder"
                texto="PRÓXIMO"
                loadIf={formik.isSubmitting}
                type="submit"
              />
            
        
      </Form>
    </Col>
    </Row>
    </div>
  );
};

export default CadastroData;
