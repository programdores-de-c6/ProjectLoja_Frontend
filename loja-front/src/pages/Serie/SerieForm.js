// ======================================================
// IMPORTAÇÕES
// ======================================================

// 🔹 Importa React e hooks
import { useState, useEffect,} from "react";
import { Form } from "react-bootstrap";
import * as Yup from "yup";
// 🔹 Componente reutilizável para inputs
import FormField from "../../component/Inputs/FormField.js";
import { useShopService } from "../Shop/ShopService.js";

// ======================================================
// ESQUEMAS YUP
// ======================================================

export const SerieSchema = Yup.object().shape({
  serie: Yup.string().required("A série é obrigatória"),
  numeroautorizacao: Yup.string().required("O número de autorização é obrigatório"),
  ano: Yup.number().required("O ano é obrigatório"),
  shop: Yup.object().required("Selecione a loja"),
});

// ======================================================
// COMPONENTE
// ======================================================
const SerieForm = ({ data, setData, errors = {} }) => {
  const { listar: listarLojas } = useShopService();
  const [lojas, setLojas] = useState([]);


  // ======================================================
  // HANDLER GENÉRICO
  // ======================================================
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
const handleSelectChange = (field, list) => (e) => {
    const selected = list.find((i) => String(i.value) === e.target.value);
    
    setData({
      ...data,
      [field]: selected ? { id: selected.value, nome: selected.label } : null,
    });
  };
// ======================================================
  // 🔹 GERADOR DE ANOS (LOCAL AO FORM)
  // ======================================================
  const generateYearOptions = (start = 2025, range = 40) =>
    Array.from({ length: range + 1 }, (_, i) => {
      const year = start + i;
      return { value: year, label: String(year) };
    });

  const yearOptions = generateYearOptions();

 // ----------------------------
  // Load lojas
  // ----------------------------
  useEffect(() => {
    const fetch = async () => {
      const res = await listarLojas();
      setLojas(
        res.map((l) => ({
          value: l.id,
          label: l.nome,
        }))
      );
    };
    fetch();
  }, []);

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <Form>
      <FormField
        controlId="serie"
        label="Série"
        name="serie"
        value={data.serie || ""}
        onChange={handleChange}
        isInvalid={!!errors.serie}
        feedback={errors.serie}
      />

      <FormField
        controlId="numeroautorizacao"
        label="Número de Autorização"
        name="numeroautorizacao"
        value={data.numeroautorizacao || ""}
        onChange={handleChange}
        isInvalid={!!errors.numeroautorizacao}
        feedback={errors.numeroautorizacao}
      />

      <FormField
        controlId="ano"
        label="Ano"
        name="ano"
        isSelect
        options={yearOptions}
        value={String(data.ano || "")}
        onChange={(e) =>
          setData({ ...data, ano: Number(e.target.value) })
        }
        isInvalid={!!errors.ano}
        feedback={errors.ano}
      />

      <FormField
        controlId="shop"
        label="Loja"
        name="shop"
        isSelect
        options={lojas}
        value={String(data.shop?.id || "")}
        onChange={handleSelectChange("shop", lojas)}
        isInvalid={!!errors.shop}
        feedback={errors.shop}
      />
    </Form>
  );
};

export default SerieForm;