// 🔹 Importa React e hooks useState/useEffect
import React, { useState, useEffect } from "react";
// 🔹 Importa Form do React-Bootstrap (estrutura base do formulário)
import { Form } from "react-bootstrap";
// 🔹 Importa o componente reutilizável de campo
import FormField from "../../component/Inputs/FormField.js";
// 🔹 Importa Yup para validação de esquemas
import * as Yup from "yup";
// 🔹 Importa o serviço que busca distritos da API
import { useLocationService } from "./LocationService.js"; // 🔹


// 🔹 Esquema de validação com Yup
export const locationSchema = Yup.object().shape({
  nome: Yup.string().required("Nome é obrigatório"), // Nome obrigatório
  sigla: Yup.string()                               // Sigla obrigatória
    .required("Sigla é obrigatória")
    .max(10, "Máximo 10 caracteres"),
  distrito: Yup.object()                            // Distrito precisa ser um objeto
    .nullable()
    .required("Distrito é obrigatório"),
});


// 🔹 Componente de formulário para Localidade
const LocalidadeForm = ({ data, setData }) => {
  // Estado local para armazenar lista de distritos
  const [distritos, setDistritos] = useState([]);
  // 🔹 Busca distritos da API quando o componente monta
  useEffect(() => {
    const fetchDistritos = async () => {
      const res = await listarDistrito(); // Chamada API
      // Converte resposta para formato {value, label} (usado no select)
      const options = res.map((d) => ({ value: d.id, label: d.nome }));
      setDistritos(options); // Atualiza estado
    };
    fetchDistritos();
  }, []); // Executa apenas uma vez

const { listarDistrito } = useLocationService();
  // 🔹 Handler genérico para campos de input (nome, sigla, etc.)
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Handler específico para o select de distrito
const handleDistritoChange = (e) => {
  const value = e.target.value; // id selecionado (string)
  const selected = distritos.find(d => String(d.value) === value); // encontra objeto {value, label}

  if (!selected) {
    setData({ ...data, distrito: null });
  } else {
    setData({ 
      ...data, 
      distrito: { id: selected.value, nome: selected.label } // aqui criamos o objeto correto
    });
  }
};

  // 🔹 Renderização do formulário
  return (
    <Form>
      {/* Campo Nome */}
      <FormField
        controlId="Nome"
        label="Nome da Localidade"
        type="text"
        name="nome"
        value={data.nome}
        onChange={handleChange}
      />

      {/* Campo Sigla */}
      <FormField
        controlId="Sigla"
        label="Sigla"
        type="text"
        name="sigla"
        value={data.sigla}
        onChange={handleChange}
      />

      {/* Campo Distrito (Select) */}
      <FormField
        controlId="Distrito"
        label="Distritos"
        name="distrito"
        value={String(data.distrito?.id || "")}
       onChange={handleDistritoChange}
        options={distritos}        // Lista de opções
        isSelect={true}            // Força renderização como select
      />
    </Form>
    
  );
};

// 🔹 Exporta o componente para uso na página Localidade
export default LocalidadeForm;
