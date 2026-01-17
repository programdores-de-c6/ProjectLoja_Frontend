import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../component/contexts/AuthContext.js";
import api from "../../service/Api.js";

export const useProductService = () => {
  const { user } = useContext(AuthContext);

  // 🔹 CRUD de Produto
  const listar = async () => {
    try {
      const res = await axios.get(`${api}/product/list`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };
const listarId = async (id) => {
  try {
 
 const res = await axios.get(`${api}/product/listid/${id}`, {
     headers: {
          Authorization: `Bearer ${user?.accessToken}`, // token do contexto
        },
        withCredentials: true, // se houver refresh token
      });
    return res.data;
  } catch (err) {
     // 🔹 lança o erro para o frontend capturar
    throw err;
  }
};
  const criar = async (data) => {
    try {
      const formData = new FormData();

      if (data.imagem) {
        formData.append("file", data.imagem);
      }
    const valorFormatado = parseFloat(
        (data.precoUnitario || "").replace(/\./g, "").replace(",", ".")
      );
      const productDTO = {
        codigobarra: data.codigobarra,
        nome: data.nome,
        descricao: data.descricao,
        precoUnitario: valorFormatado,
        caixaPostal: data.caixaPostal,
        category: data.categoria
          ? { id: data.categoria.id, nome: data.categoria.nome }
          : null,
        supplier: data.fornacedor
          ? { id: data.fornacedor.id, nome: data.fornacedor.nome }
          : null,
        tax: data.imposto
          ? { id: data.imposto.id, imposto: data.imposto.nome }
          : null,
        shopType: data.tipo,
        employee: { id: user?.id },
        stockDTOs: Array.isArray(data.distribuicaoStock)
          ? data.distribuicaoStock.map((item) => ({
              storeId: item.storeId,
              storeName: item.storeName,
              stock: item.stock,
              stockMin: item.stockMin,
              // productId: item.productId
            }))
          : [],
      };

      formData.append(
        "productDTO",
        new Blob([JSON.stringify(productDTO)], { type: "application/json" })
      );

      const res = await axios.post(`${api}/product/create`, formData, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const editar = async (data) => {
    try {
          const valorFormatado = parseFloat(
        (data.precoUnitario || "").replace(/\./g, "").replace(",", ".")
      );
      const payload = {
        codigobarra: data.codigobarra,
        nome: data.nome,
        descricao: data.descricao,
        precoUnitario: valorFormatado,
        caixaPostal: data.caixaPostal,
        category: data.categoria
          ? { id: data.categoria.id, nome: data.categoria.nome }
          : null,
        supplier: data.fornacedor
          ? { id: data.fornacedor.id, nome: data.fornacedor.nome }
          : null,
        tax: data.imposto
          ? { id: data.imposto.id, imposto: data.imposto.imposto }
          : null,
        shopType: data.tipo,
        employee: { id: user?.id },
        imagem: data.imagem || null,
        id: data.id,
      };

      const res = await axios.put(`${api}/product/update`, payload, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const deletar = async (data) => {
    try {
      const res = await axios.delete(`${api}/shop/delete`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
        params: { id: data.id },
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // 🔹 Operações de Stock
  const updateStock = async (data) => {
    try {
      const payload = {
        employee: { id: user?.id },
        acao:data.acao,
        stockDTOs: Array.isArray(data.distribuicaoStock)
          ? data.distribuicaoStock.map((item) => ({
               storeId: item.storeId,
              stock: item.stock,
              product: item.productId
            }))
          : [],
      };

      const res = await axios.put(`${api}/product/updatestock`, payload, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

 
  // 🔹 Listas auxiliares
  const listarCategoria = async () => {
    try {
      const res = await axios.get(`${api}/category/list`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const listarImposto = async () => {
    try {
      const res = await axios.get(`${api}/tax/list`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const listarFornecedor = async () => {
    try {
      const res = await axios.get(`${api}/supplier/list`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const listarShop = async () => {
    try {
      const res = await axios.get(`${api}/shop/lists`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // 🔹 Exporta todos os serviços
  return {
    listar,
    criar,
    editar,
    deletar,
    updateStock,
    listarCategoria,
    listarImposto,
    listarFornecedor,
    listarShop,
    listarId
  };
};
