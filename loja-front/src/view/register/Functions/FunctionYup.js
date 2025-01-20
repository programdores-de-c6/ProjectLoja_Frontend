import * as Yup from "yup";

export const registerSchema = Yup.object().shape({
  nome: Yup.string()
    .required("Nome é obrigatório")
    .min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: Yup.string()
    .required("Email é obrigatório")
    .email("Formato de email inválido"),
});

export const validationSchemaAdmin = Yup.object().shape({
  nome: Yup.string().required("Nome é obrigatório"),
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  dataNascimento: Yup.date().required("Data de nascimento é obrigatória"),
  bi: Yup.string().required("Número de BI é obrigatório"),
  sexo: Yup.string().required("Sexo é obrigatório"),
  distritou: Yup.number().required("Distrito é obrigatório"),
  zonau: Yup.number().required("Zona é obrigatória"),
  contato: Yup.string().required("Contato é obrigatório"),
  code: Yup.string().required("Contato é obrigatório"),
});
