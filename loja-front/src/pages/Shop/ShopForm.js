// 🔹 Importa React e hooks useState/useEffect
import React, { useState, useEffect } from "react";
// 🔹 Importa Form do React-Bootstrap (estrutura base do formulário)
import { Form, Row, Col } from "react-bootstrap";
// 🔹 Importa o componente reutilizável de campo
import FormField from "../../component/Inputs/FormField.js";
// 🔹 Importa Yup para validação de esquemas
import * as Yup from "yup";
// 🔹 Importa o serviço que busca distritos da API
import { useShopService } from "./ShopService.js"; // 🔹

// 🔹 Esquema de validação com Yup
export const ShopSchema = Yup.object().shape({
  nome: Yup.string().required("Nome é obrigatório"),
  contribuinte: Yup.string().nullable(),
  email: Yup.string().email("Formato de email inválido").nullable(),
  contacto: Yup.string().nullable(),
caixaPostal: Yup.number()
  .transform((value, originalValue) =>
    originalValue === "" ? null : value
  )
  .nullable(),
  localidade: Yup.object().required("Localidade é obrigatória"),
  logo: Yup.mixed().nullable(),
  tipo: Yup.string().oneOf(["LOJA", "ARMAZEM"]).required("Tipo é obrigatório"),

});

// 🔹 Componente de formulário para Localidade
const ShopForm = ({ data, setData, isEditMode }) => {
  // Estado local para armazenar lista de localidade
  const [localidade, setLocalidade] = useState([]);
  // 🔹 Busca localidade da API quando o componente monta
  useEffect(() => {
    const fetchLocalidade = async () => {
      const res = await listarLocalidade(); // Chamada API
      // Converte resposta para formato {value, label} (usado no select)
      const options = res.map((d) => ({ value: d.id, label: d.nome }));
      setLocalidade(options); // Atualiza estado
    };
    fetchLocalidade();
  }, []); // Executa apenas uma vez

  const { listarlocalidade: listarLocalidade } = useShopService();
  // 🔹 Handler genérico para campos de input (nome, sigla, etc.)
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Handler específico para o select de Localidade
  const handleLocalidadeChange = (e) => {
    const value = e.target.value; // id selecionado (string)
    const selected = localidade.find((d) => String(d.value) === value); // encontra objeto {value, label}

    if (!selected) {
      setData({ ...data, localidade: null });
    } else {
      setData({
        ...data,
        localidade: { id: selected.value, nome: selected.label }, // aqui criamos o objeto correto
      });
    }
  };
  // Lista de tipos de loja
  const shopTypes = [
    { value: "LOJA", label: "Loja" },
    { value: "ARMAZEM", label: "Armazém" },
  ];

  // Handler para tipo
  const handleTipoChange = (e) => {
    setData({ ...data, tipo: e.target.value });
  };

  // 🔹 Renderização do formulário
  return (
    <Form>
      <Row>
        <Col md={6}>
          {/* Campo Nome */}
          <FormField
            controlId="Nome"
            label="Nome"
            type="text"
            name="nome"
            value={data.nome}
            onChange={handleChange}
          />
        </Col>
        <Col md={6}>
          {/* Campo Contribuite */}
          <FormField
            controlId="Contribuinte"
            label="Contribuinte"
            type="text"
            name="contribuinte"
            value={data.contribuinte}
            onChange={handleChange}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          {/* Campo contacto */}
          <FormField
            controlId="Contacto"
            label="Contacto"
            type="text"
            name="contacto"
            value={data.contacto}
            onChange={handleChange}
          />
        </Col>
        <Col md={6}>
          {/* Campo Email */}
          <FormField
            controlId="Email"
            label="Email"
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          {/* Campo Caixa Postal */}
          <FormField
            controlId="CaixaPostal"
            label="caixa Postal"
            type="number"
            name="caixaPostal"
            value={data.caixaPostal}
            onChange={handleChange}
          />
        </Col>
        <Col md={6}>
          {/* Campo Rua */}
          <FormField
            controlId="Localidade"
            label="Rua"
            name="localidade"
            value={String(data.localidade?.id || "")}
            onChange={handleLocalidadeChange}
            options={localidade} // Lista de opções
            isSelect={true} // Força renderização como select
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormField
            controlId="Logo"
            label="Logo da Loja"
            type="file"
            name="logo"
            onChange={(e) => {
              const file = e.target.files[0];
              setData({ ...data, logo: file });
            }}
          />
        </Col>

        <Col md={6}>
          {/* Campo Tipo de Loja */}
          <FormField
            controlId="Tipo"
            label="Tipo de Loja"
            name="tipo"
            value={data.tipo || ""}
            onChange={handleTipoChange}
            isSelect={true} // indica que é select
            options={shopTypes} // passa a lista de tipos de loja
          />
        </Col>
      </Row>
    </Form>
  );
};

// 🔹 Exporta o componente para uso na página Localidade
export default ShopForm;
