import api from '@/config/api';
import { showErrorToast } from '@/utils/toast';

export interface StockDTO {
  storeId: string | number;
  storeName?: string;
  stock: number;
  stockMin?: number;
  productId?: string | number;
  precoUnitario?: number; 
}

export interface Product {
  id: string | number;
  codigobarra: string;
  controlaStock: boolean;
  nome: string;
  descricao: string | null;
  stock: number;
  stockMin: number;
  datacriacao: string;
  idsupplier?: string | number;
  suppliers?: string;
  idcatgory?: string | number;
  categorys?: string;
  idtax?: string | number;
  taxs?: string;
  taxa?: number;
  logoUrl?: string | null;
  precoUnitario?: string | number; // Adicionado como opcional para compatibilidade
}

export interface ProductFormData {
  id?: string | number;
  nome: string;
  controlaStock: boolean;
  codigobarra: string;
  descricao: string | null;
  precoUnitario: string;
  categoria: { id: string | number; nome: string } | null;
  fornacedor: { id: string | number; nome: string } | null;
  imposto: { id: string | number; nome: string } | null;
  imagem?: File | string | null;
  distribuicaoStock?: StockDTO[];
storeId?: string | number; 
  // Campos temporários para configuração de stock local
  tempStock?: number;
  tempStockMin?: number;
}

export const useProductService = () => {

  const mapToDTO = (data: ProductFormData) => {
    const valorFormatado = typeof data.precoUnitario === 'string' 
      ? parseFloat(data.precoUnitario.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."))
      : data.precoUnitario;

    return {
      id: data.id,
      codigobarra: data.codigobarra,
      nome: data.nome,
      descricao: data.descricao,
      precoUnitario: valorFormatado,
       storeId: data.storeId, 
      controlaStock: data.controlaStock,
      category: data.categoria ? { id: data.categoria.id } : null,
      supplier: data.fornacedor ? { id: data.fornacedor.id } : null,
      tax: data.imposto ? { id: data.imposto.id } : null,
      stockDTOs: data.controlaStock ? (data.distribuicaoStock || []) : []
    };
  };

  const listar = async (): Promise<Product[]> => {
    try {
      const res = await api.get('/product/list');
      return res.data;
    } catch (error) {
      showErrorToast('Erro ao carregar lista de produtos.');
      throw error;
    }
  };

  // ✅ NOVO: listarCatalogoGlobal
  // Permite ao Gerente consultar o catálogo sem o filtro de loja (X-Store-ID)
  const listarCatalogoGlobal = async (): Promise<Product[]> => {
    try {
      const res = await api.get('/product/list', {
        headers: { 'X-Context-Control': 'global' }
      });
      return res.data;
    } catch (error) {
      showErrorToast('Erro ao consultar o catálogo global.');
      throw error;
    }
  };

  const listarId = async (id: string | number): Promise<Product> => {
    try {
      const res = await api.get(`/product/listid/${id}`);
      return res.data;
    } catch (error) {
      showErrorToast('Erro ao carregar detalhes do produto.');
      throw error;
    }
  };

  const criar = async (data: ProductFormData): Promise<Product> => {
    try {
      const formData = new FormData();
      if (data.imagem instanceof File) {
        formData.append('file', data.imagem);
      }
      const dto = mapToDTO(data);
      formData.append(
        'productDTO',
        new Blob([JSON.stringify(dto)], { type: 'application/json' })
      );
      const res = await api.post('/product/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (error) {
      showErrorToast('Erro ao criar novo produto.');
      throw error;
    }
  };

  const editar = async (data: ProductFormData): Promise<Product> => {
    try {
      const dto = mapToDTO(data);
      const res = await api.put('/product/update', dto);
      return res.data;
    } catch (error) {
      showErrorToast('Erro ao atualizar informações.');
      throw error;
    }
  };

  const updateStock = async (payload: { acao: string, distribuicaoStock: StockDTO[] }): Promise<Product> => {
    try {
      const dto = {
        acao: payload.acao,
        stockDTOs: payload.distribuicaoStock.map(item => ({
          storeId: item.storeId,
          stock: item.stock,
          product: item.productId
        }))
      };
      const res = await api.put('/product/updatestock', dto);
      return res.data;
    } catch (error) {
      showErrorToast('Não foi possível ajustar o stock.');
      throw error;
    }
  };
const uploadFoto = async (id: string | number, file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // O seu Backend espera um ProductDTO apenas com o ID para vincular a foto
    const dto = { id };
    formData.append(
      'productDTO',
      new Blob([JSON.stringify(dto)], { type: 'application/json' })
    );

    await api.post('/product/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } catch (error) {
    showErrorToast('Não foi possível atualizar a imagem.');
    throw error;
  }
};

  const deletar = async (id: string | number): Promise<void> => {
    try {
      await api.delete('/product/delete', { params: { id } });
    } catch (error) {
      showErrorToast('Erro ao remover item do catálogo.');
      throw error;
    }
  };

  const listarCategorias = async () => (await api.get('/category/list')).data;
  const listarFornecedores = async () => (await api.get('/supplier/list')).data;
  const listarImpostos = async () => (await api.get('/tax/list')).data;
  const listarLojas = async () => (await api.get('/shop/list')).data;

  const listarLojasPorProduto = async (productId: string | number) => {
    try {
      const res = await api.get('/shop/list-by-product', { params: { productId } });
      return res.data;
    } catch (error) {
      return []; 
    }
  };

  return {
    listar,
    listarCatalogoGlobal,
    listarId,
    criar,
    editar,
    deletar,
    updateStock,
    listarCategorias,
    listarFornecedores,
    listarImpostos,
    listarLojas,
    listarLojasPorProduto,
    uploadFoto
  };
};