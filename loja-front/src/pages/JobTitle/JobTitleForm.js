// ======================================================
// IMPORTAÇÕES
// ======================================================

// 🔹 Importa React e hooks

import { Form } from "react-bootstrap";
// 🔹 Componente reutilizável para inputs
import FormField from "../../component/Inputs/FormField.js";
// 🔹 Yup para validação
import * as Yup from "yup";

// ======================================================
// ESQUEMAS YUP
// ======================================================

export const JobTitleSchema = Yup.object().shape({
  nome: Yup.string().required("O nome do cargo é obrigatório"),
  descricao: Yup.string().required("A descrição é obrigatória"),
  valor: Yup.string().required("O valor é obrigatório"),
  accessLevel: Yup.string().required("Selecione o nível de acesso"),
});

// ======================================================
// LISTA FIXA (ENUM DO BACKEND)
// ======================================================
export const ACCESS_LEVELS = [
  { value: null, label: "Sem acesso ao sistema" },
  { value: "ROLE_USER", label: "Operador / Caixa" },
  { value: "ROLE_MANAGER", label: "Gerente" },
  { value: "ROLE_ADMIN", label: "Administrador" },
];

// ======================================================
// COMPONENTE
// ======================================================
const JobTitleForm = ({ data, setData, errors = {} }) => {
  // ======================================================
  // HANDLER GENÉRICO
  // ======================================================
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <Form>
      {/* Campo descrição */}
      <FormField
        controlId="nome"
        label="Cargo"
        type="text"
        name="nome"
        value={data.nome || ""}
        onChange={handleChange}
        isInvalid={!!errors.nome}
        feedback={errors.nome}
      />
      {/* Campo descrição */}
      <FormField
        controlId="descricao"
        label="Descrição"
        type="text"
        name="descricao"
        value={data.descricao || ""}
        onChange={handleChange}
        isInvalid={!!errors.descricao}
        feedback={errors.descricao}
      />
      {/* Campo Distrito (Select) */}
      <FormField
        controlId="valor"
        label="Valor"
        name="valor"
        placeholder="0,00"
        decimalsLimit={2}
        decimalSeparator=","
        groupSeparator="."
        value={data.valor || ""}
        onChange={handleChange}
        isInvalid={!!errors.valor}
        feedback={errors.valor}
        isCurrency={true}
      />
      <FormField
        controlId="accessLevel"
        label="Nível de Acesso"
        name="accessLevel"
         value={data.accessLevel || "Sem acesso ao sistema"}
        onChange={handleChange} // pega o valor direto
        isSelect={true}
        options={ACCESS_LEVELS}
        //isInvalid={!!errors.accessLevel}
        feedback={errors.accessLevel}
      />
    </Form>
  );
};

export default JobTitleForm;
