

import { Form } from "react-bootstrap";
// 🔹 Componente reutilizável para inputs
import FormField from "../../component/Inputs/FormField.js";
// 🔹 Yup para validação
import * as Yup from "yup";

// 🔹 Esquema de validação para Categoria
export const CategorySchema = Yup.object().shape({
  nome: Yup.string().required("O nome da categoria é obrigatório"),
});

  // Estado local para armazenar lista de imposto
const CategoryForm = ({ data, setData }) => {



  // 🔹 Handler genérico para campos de input (nome, sigla, etc.)
 const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
 

  
  return (
    <Form>
      {/* Campo Nome da Categoria */}
      <FormField
        controlId="nome"
        label="Nome da Categoria"
        type="text"
        name="nome"
        value={data.nome || ""}
        onChange={handleChange}
      />

 
    </Form>
  );
};

export default CategoryForm;
