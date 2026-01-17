// 🔹 Importa React e hooks useState/useEffect
import React, { useState, useEffect } from "react";
// 🔹 Importa Form do React-Bootstrap (estrutura base do formulário)
import { Form, Row, Col } from "react-bootstrap";
// 🔹 Importa o componente reutilizável de campo
import FormField from "../../component/Inputs/FormField.js";
// 🔹 Importa Yup para validação de esquemas
import * as Yup from "yup";
// 🔹 Importa o serviço que busca distritos da API
import { useSupplierService } from "./SupplierService.js";
// 🔹 Esquema de validação com Yup
export const ShopSchema = Yup.object().shape({
  nome: Yup.string().required("Nome é obrigatório"),
  contribuinte: Yup.string().required("Contribuinte é obrigatório"),
  email: Yup.string().email("Formato de email inválido").nullable(),
  contactoprincipal: Yup.string().nullable(),
  contactosecudario: Yup.number().nullable(),
  pais: Yup.object().nullable().required("Localidade é obrigatória"),

});

// 🔹 Componente de formulário para Localidade
const ShopForm = ({ data, setData  }) => {
  // Estado local para armazenar lista de pais
  const [pais, setPais] = useState([]);
  // 🔹 Busca pais da API quando o componente monta
  useEffect(() => {
    const fetchPais = async () => {
      const res = await listarPais(); // Chamada API
      // Converte resposta para formato {value, label} (usado no select)
      const options = res.map((d) => ({ value: d.id, label: d.nome }));
      setPais(options); // Atualiza estado
    };
    fetchPais();
  }, []); // Executa apenas uma vez

  const { listarpais: listarPais } = useSupplierService();
  // 🔹 Handler genérico para campos de input (nome, sigla, etc.)
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Handler específico para o select de pais
  const handlepaisChange = (e) => {
    const value = e.target.value; // id selecionado (string)
    const selected = pais.find((d) => String(d.value) === value); // encontra objeto {value, label}

    if (!selected) {
      setData({ ...data, pais: null });
    } else {
      setData({
        ...data,
        pais: { id: selected.value, nome: selected.label }, // aqui criamos o objeto correto
      });
    }
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
            controlId="ContactoPrincipal"
            label="Contacto Principal"
            type="text"
            name="contactoprincipal"
            value={data.contactoprincipal}
            onChange={handleChange}
          />
        </Col>
        <Col md={6}>
          {/* Campo Caixa Postal */}
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
        <Col md={6}>
          {/* Campo pais */}
          <FormField
            controlId="Pais"
            label="País"
            name="pais"
            value={String(data.pais?.id || "")}
            onChange={handlepaisChange}
            options={pais} // Lista de opções
            isSelect={true} // Força renderização como select
          />
        </Col>
      </Row>
      
    
    </Form>
  );
};

// 🔹 Exporta o componente para uso na página Localidade
export default ShopForm;
