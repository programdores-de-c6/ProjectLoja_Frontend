import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../component/contexts/AuthContext.js";
import api from "../../service/Api.js";

 export const useEmployeeService = () => {
  const { user } = useContext(AuthContext); // ✅ só dentro do hook

 const listar = async () => {
  try {
 

    const res = await axios.get(`${api}/employee/list`, {
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
 
 const res = await axios.get(`${api}/employee/listid/${id}`, {
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

    // Constrói o DTO
    const supplierDto = {
      nome: data.nome,
      numeroBi: data.bi,
      numeroContribuite: data.contribuinte,
      email: data.email,
      contactoPrincipal: data.contactoprincipal,
      contactoSecudario: data.contactosecudario,
      gender: data.sexo,
      dataNascimento: data.dataNascimento,
      dataAdmissao: data.dataAdmissao,
      username: data.username,
      senha: data.password,
      shop: data.loja?.id,       
  location: data.localidade?.id,
  role: data.funcao?.id,
    };
formData.append("employeeDTO", new Blob([JSON.stringify(supplierDto)], { type: "application/json" }));
   
    const res = await axios.post(`${api}/employee/create`, formData, {
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
      numeroBi: data.bi,
      numeroContribuinte: data.contribuinte,
      email: data.email,
      contactoPrincipal: data.contactoprincipal,
      contactoSecudario: data.contactosecudario,
      gender: data.sexo,
      dataNascimento: data.dataNascimento,
      dataAdmissao: data.dataAdmissao,
      shop: data.loja?.id,       
      location: data.localidade?.id,
      role: data.funcao?.id, 
      id:data.id,
    };
alert();
   const res = await axios.put(`${api}/employee/update`, payload, {
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

 const listarPais = async () => {


  try {
    const res = await axios.get(`${api}/country/list`,{
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
 return { listar,listarId, criar, editar, listarlocalidade: listarPais, deletar };
};