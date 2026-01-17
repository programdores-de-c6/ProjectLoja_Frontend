import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../component/contexts/AuthContext.js";
import api from "../../service/Api.js";

 export const useShopService = () => {
  const { user } = useContext(AuthContext); // ✅ só dentro do hook

 const listar = async () => {
  try {
 

    const res = await axios.get(`${api}/shop/list`, {
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
 const listarId = async (id) => {
  try {
 
 const res = await axios.get(`${api}/shop/listid/${id}`, {
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

    // Adiciona o ficheiro (logo)
    if (data.logo) {
      formData.append("file", data.logo);
    }

    // Constrói o DTO
    const shopDto = {
      nome: data.nome,
      numeroContribuite: data.contribuinte,
      email: data.email,
      contacto: data.contacto,
      caixaPostal: data.caixaPostal,
      location: data.localidade
        ? { id: data.localidade.id, nome: data.localidade.nome }
        : null,
      shopType: data.tipo,
    };

    // Adiciona o DTO como JSON correto
    formData.append(
      "shopDto",
      new Blob([JSON.stringify(shopDto)], { type: "application/json" })
    );

    const res = await axios.post(`${api}/shop/create`, formData, {
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
    const payload =  {
      nome: data.nome,
      numeroContribuite: data.contribuinte,
      email: data.email,
      contacto: data.contacto,
      caixaPostal: data.caixaPostal,
      id: data.id,
      location: data.localidade
        ? { id: data.localidade.id, nome: data.localidade.nome }
        : null,
      logo: data.logo || null, // pode ser null se não for atualizado
      shopType: data.tipo,

      
    };
    alert(data.logo.name, "logo name");
   const res = await axios.put(`${api}/shop/update`, payload, {
       headers: {
          Authorization: `Bearer ${user?.accessToken}`, // token do contexto
        },
        withCredentials: true, // se houver refresh token
      });
    return res.data;
  } catch (err) {
    throw err;
  }
};

 const listarlocalidade = async () => {


  try {
    const res = await axios.get(`${api}/location/list`,{
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

 const deletar = async (data) => {


  try {
    const res = await axios.delete(`${api}/shop/delete`,{
       headers: {
          Authorization: `Bearer ${user?.accessToken}`, // token do contexto
        },
        withCredentials: true, // se houver refresh token
        params: { id: data.id }, // 🔹 envia id como query param
      });
    return res.data;
  } catch (err) {
      // 🔹 lança o erro para o frontend capturar
    throw err;
  }
};
 return { listar, criar, editar, listarlocalidade, deletar, listarId };
};