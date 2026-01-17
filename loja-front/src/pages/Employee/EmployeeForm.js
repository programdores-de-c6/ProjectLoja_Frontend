// ======================================================
// IMPORTAÇÕES
// ======================================================

import { useState, useEffect, forwardRef,
  useImperativeHandle, } from "react";
// 🔹 Importa Form do React-Bootstrap (estrutura base do formulário)
import {
  Form,
  Row,
  Col,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
  Button,
} from "react-bootstrap";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
// 🔹 Importa o componente reutilizável de campo
import FormField from "../../component/Inputs/FormField.js";
// 🔹 Importa Yup para validação de esquemas
import * as Yup from "yup";
// 🔹 Importa o serviço que busca distritos da API

import { useLocationService } from "../Location/LocationService.js";
import { useShopService } from "../Shop/ShopService.js";
import { useBasesalayService } from "../JobTitle/JobTitleService.js";

// ======================================================
// ESQUEMAS YUP POR ETAPA
// ======================================================

const stepSchemas = [
  
  


  // 🔹 ETAPA 0 – Identificação
  Yup.object({
    nome: Yup.string().required("Nome é obrigatório"),
    bi: Yup.number().required("Nº BI é obrigatório"),
    contribuinte: Yup.string().required("Contribuinte é obrigatório"),
    email: Yup.string().email("Email inválido").nullable(),
  }),

  // 🔹 ETAPA 1 – Contactos
  Yup.object({
    contactoprincipal: Yup.string().required(
      "Contacto principal é obrigatório"
    ),
    contactosecudario: Yup.string().nullable(),
    dataNascimento: Yup.string().required("Data de Nascimento é obrigatória"),
    dataAdmissao: Yup.string().required("Data de Admissão é obrigatória"),
  }),

  // 🔹 ETAPA 2 – Dados profissionais
  Yup.object({
    sexo: Yup.string().oneOf(["M", "F"]).nullable(),
    loja: Yup.object().required("Loja é obrigatória"),
    localidade: Yup.object().required("Localidade é obrigatória"),
    funcao: Yup.object().required("Função é obrigatória"),
  }),

  // 🔹 ETAPA 3 – Acesso ao sistema
  Yup.object({
    username: Yup.string().required("Utilizador é obrigatório"),
    password: Yup.string().required("Senha é obrigatória"),

  }),
];

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

// 🔹 Componente de formulário para Funcionario
const EmployeeForm = forwardRef(({ data, setData, isEditMode }, ref) => {
  // ======================================================
  // ESTADOS
  // ======================================================

  const [step, setStep] = useState(0);
  const [stepErrors, setErrors] = useState({});
const hasSystemAccess = Boolean(data.funcao?.accessLevel);
  const [localidade, setLocalidades] = useState([]);
  const [loja, setLojas] = useState([]);
  const [funcao, setFuncoes] = useState([]);

  const totalSteps = hasSystemAccess ? 4 : 3;
 

  // ======================================================
  // SERVIÇOS
  // ======================================================
  const { listar: listarLocalidade } = useLocationService();
  const { listar: listarLoja } = useShopService();
  const { listar: listarFuncao } = useBasesalayService();

  // ======================================================
  // CARREGAMENTO DE DADOS
  // ======================================================

  useEffect(() => {
    const carregarDados = async () => {
      setLocalidades(
        (await listarLocalidade()).map((i) => ({
          value: i.id,
          label: i.nome,
        }))
      );

      setLojas(
        (await listarLoja()).map((i) => ({
          value: i.id,
          label: i.nome,
         
        }))
      );

      setFuncoes(
        (await listarFuncao()).map((i) => ({
          value: i.id,
          label: i.nomecargo,
           accessLevel: i.accessLevel,
        }))
      );
    };

    carregarDados();
  }, []);

  // ======================================================
  // HANDLERS GENÉRICOS
  // ======================================================

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field, list) => (e) => {
    const selected = list.find((i) => String(i.value) === e.target.value);
    
    setData({
      ...data,
      [field]: selected ? { id: selected.value, nome: selected.label, accessLevel: selected.accessLevel ?? null, } : null,
    });
  };



 

  // ======================================================
  // VALIDAÇÃO POR ETAPA
  // ======================================================
  const validateCurrentStep = async () => {
    try {
      setErrors({});
      const schema = stepSchemas[step];
      if (schema) {
        await schema.validate(data, { abortEarly: false });
      }
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => (newErrors[e.path] = e.message));
      setErrors(newErrors);
    
      return false;
    }
  };
  // ======================================================
  // NAVEGAÇÃO DO WIZARD
  // ======================================================
  const handleNext = async () => {
    const isValid = await validateCurrentStep(); // chama a função central de validação
    if (isValid) {
      // Pular etapa de acesso se não houver acesso
      if (step === 2 && !hasSystemAccess) {
        setStep(step + 2);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => setStep(step - 1);
  // ======================================================
// 🔹 EXPÕE FUNÇÃO PARA VALIDAR A ÚLTIMA ETAPA
// ======================================================


const validateLastRequiredStep = async () => {
  const lastStepIndex = hasSystemAccess ? 3 : 2;

  try {
    setErrors({});
    const schema = stepSchemas[lastStepIndex];
    if (schema) {
      await schema.validate(data, { abortEarly: false });
    }
    return true;
  } catch (err) {
    const newErrors = {};
    err.inner.forEach((e) => (newErrors[e.path] = e.message));
    setErrors(newErrors);
    return false;
  }
};

 /**
     * Função exposta ao componente pai.
     * Valida a última etapa relevante, dependendo se o funcionário terá acesso ao sistema.
     */
useImperativeHandle(ref, () => ({
  validateLastStep: validateLastRequiredStep,
}));

 

  // 🔹 Renderização por etapa (mantendo tua lógica)
  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          <Row>
            <Col md={6}>
              <FormField
                controlId="Nome"
                label="Nome"
                type="text"
                name="nome"
                value={data.nome}
                onChange={handleChange}
                isInvalid={!!stepErrors.nome} // liga o estado de erro
                feedback={stepErrors.nome}
              />
            </Col>
            <Col md={3}>
              <FormField
                controlId="bi"
                label="Nº BI"
                type="number"
                name="bi"
                value={data.bi}
                onChange={handleChange}
                isInvalid={!!stepErrors.bi}
                feedback={stepErrors.bi}
              />
            </Col>
            <Col md={3}>
              {!isEditMode && (
                <FormField
                  controlId="fotoProduto"
                  label="Foto do Produto"
                  type="image-box"
                  name="imagem"
                  value={data.imagem}
                  onChange={(e) =>
                    setData({ ...data, imagem: e.target.files[0] })
                  }
                  disabled={isEditMode}
                />
              )}
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormField
                controlId="Contribuinte"
                label="Contribuinte"
                type="text"
                name="contribuinte"
                value={data.contribuinte}
                onChange={handleChange}
                isInvalid={!!stepErrors.contribuinte}
                feedback={stepErrors.contribuinte}
              />
            </Col>
            <Col md={6}>
              <FormField
                controlId="Email"
                label="Email"
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                isInvalid={!!stepErrors.email}
                feedback={stepErrors.email}
              />
            </Col>
          </Row>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Row>
            <Col md={6}>
              <FormField
                controlId="ContactoPrincipal"
                label="Contacto Principal"
                type="text"
                name="contactoprincipal"
                value={data.contactoprincipal}
                onChange={handleChange}
                isInvalid={!!stepErrors.contactoprincipal}
                feedback={stepErrors.contactoprincipal}
              />
            </Col>
            <Col md={6}>
              <FormField
                controlId="ContactoSecudario"
                label="Contacto Secudario"
                type="text"
                name="contactosecudario"
                value={data.contactosecudario}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormField
                controlId="dataNascimento"
                label="Data de Nascimento"
                type="date"
                name="dataNascimento"
                value={data.dataNascimento}
                onChange={handleChange}
                isInvalid={!!stepErrors.dataNascimento}
                feedback={stepErrors.dataNascimento}
                  
              />
            </Col>
            <Col md={6}>
              <FormField
                controlId="dataAdmissao"
                label="Data de Admissão"
                type="date"
                name="dataAdmissao"
                value={data.dataAdmissao}
                onChange={handleChange}
                isInvalid={!!stepErrors.dataAdmissao}
                feedback={stepErrors.dataAdmissao}

              />
            </Col>
          </Row>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          
         
          <Row>
            <Col md={6}>
              <FormField
                controlId="sexo"
                label="Sexo"
                name="sexo"
                value={data.sexo || ""}
                onChange={handleChange}
                isSelect={true}
                options={[
                  { value: "M", label: "Masculino" },
                  { value: "F", label: "Feminino" },
                ]}
                isInvalid={!!stepErrors.sexo}
                feedback={stepErrors.sexo}
              />
            </Col>
            <Col md={6}>
              <FormField
                controlId="loja"
                label="Loja"
                name="loja"
                value={String(data.loja?.id || "")}
                onChange={handleSelectChange("loja", loja)}
                options={loja}
                isSelect={true}
                isInvalid={!!stepErrors.loja}
                feedback={stepErrors.loja}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormField
                controlId="Localidade"
                label="Localidade"
                name="localidade"
                value={String(data.localidade?.id || "")}
                onChange={handleSelectChange("localidade", localidade)}
                options={localidade}
                isSelect={true}
                isInvalid={!!stepErrors.localidade}
                feedback={stepErrors.localidade}
              />
            </Col>
            <Col md={6}>
              <FormField
                controlId="funcao"
                label="Função"
                name="funcao"
                value={String(data.funcao?.id || "")}
                onChange={handleSelectChange("funcao", funcao)}
                options={funcao}
                isSelect={true}
                isInvalid={!!stepErrors.funcao}
                feedback={stepErrors.funcao}
              />
            </Col>
          </Row>
        </>
      );
    }

    if (step === 3 && hasSystemAccess) {
      return (
        <Row>
         
          <Col md={6}>
            <FormField
              controlId="username"
              label="Utilizador"
              type="text"
              name="username"
              value={data.username}
              onChange={handleChange}
               isInvalid={!!stepErrors.username}
              feedback={stepErrors.username}
            />
          </Col>
          {<Col md={4}>
            <FormField
              controlId="password"
              label="Senha"
              type="password"
              name="password"
              value={data.password}
              onChange={handleChange}
              isInvalid={!!stepErrors.password}
              feedback={stepErrors.password}
            />
          </Col>}
        </Row>
      );
    }
  };

  return (
    <Form>
      {renderStep()}
      <div className="d-flex justify-content-end gap-2 mt-3">
        {step > 0 && (
          <OverlayTrigger
            overlay={<Tooltip>Voltar para a etapa anterior</Tooltip>}
          >
            <Button variant="secondary" onClick={handleBack}>
              <FaArrowLeft className="me-1" /> Voltar
            </Button>
          </OverlayTrigger>
        )}
        {step < totalSteps - 1 && (
          <OverlayTrigger overlay={<Tooltip>Ir para a próxima etapa</Tooltip>}>
            <Button variant="primary" onClick={handleNext}>
              Próximo <FaArrowRight className="ms-1" />
            </Button>
          </OverlayTrigger>
        )}
      </div>
      <ProgressBar
        now={((step + 1) / totalSteps) * 100}
        label={`Etapa ${step + 1} de ${totalSteps}`}
        className="mt-3"
      />
    </Form>
  );
});

export default EmployeeForm;
