// 🔹 Importa React e hooks
import React,  { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
// 🔹 Componente reutilizável para inputs
import FormField from "../../component/Inputs/FormField.js";
// 🔹 Yup para validação
import * as Yup from "yup";

// 🔹 Esquema de validação para Categoria
export const CategorySchema = Yup.object().shape({
  imposto: Yup.string().required("O nome do Imposto é obrigatório"),
  taxa: Yup.string().required("A taxa é Obrigatório"),

});

  // Estado local para armazenar lista de imposto
const TaxForm = ({ data, setData }) => {
  const [impostos, setImpostos] = useState([]);
 useEffect(() => {
    const fetchImpostos = async () => {
   //   const res = await listarImpostos(); // Chamada API
      // Converte resposta para formato {value, label} (usado no select)
     // const options = res.map((d) => ({ value: d.id, label: d.nome }));
     // setImpostos(options); // Atualiza estado
    };
    fetchImpostos();
  }, []); // Executa apenas uma vez
// 🔹 Componente de Formulário para Categoria

//const { listarImpostos } = useImpostoService();
  // 🔹 Handler genérico para campos de input (nome, sigla, etc.)
 const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
 // Handler específico para o select de distrito
const handleDistritoChange = (e) => {
  const value = e.target.value; // id selecionado (string)
  const selected = impostos.find(d => String(d.value) === value); // encontra objeto {value, label}

  if (!selected) {
    setData({ ...data, impostos: null });
  } else {
    setData({ 
      ...data, 
      impostos: { id: selected.value, nome: selected.label } // aqui criamos o objeto correto
    });
  }
};
  return (
    <Form>
      {/* Campo Nome da Categoria */}
      <FormField
        controlId="imposto"
        label="imposto"
        type="text"
        name="imposto"
        value={data.imposto || ""}
        onChange={handleChange}
      />
      {/* Campo Distrito (Select) */}
      <FormField
        controlId="taxa"
        label="Taxa"
        type="text"
        name="taxa"
        value={data.taxa || ""}
        onChange={handleChange}
      />
    </Form>
  );
};

export default TaxForm;
