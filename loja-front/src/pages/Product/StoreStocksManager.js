// 🔹 Classe segura para gerenciar estoque por loja
class StoreStocksManager {
  constructor(initialList = [], onChange) {
    this.list = [...initialList]; // cria cópia imutável
    this.onChange = onChange;
  }

  add(store, stock, stockMin) {
  
 if (!store || stock == null || stockMin == null) {
    alert("Preencha todos os campos antes de adicionar.");
    return;
  }

    const lojaJaExiste = this.list.some((item) => item.storeId === store.id);
    if (lojaJaExiste) {
      alert("Esta loja já tem stock atribuído.");
      return;
    }
    const newItem = {
      storeId: store.id,
      storeName: store.nome,
      stock,
      stockMin,
    };

    this.list = [...this.list, newItem]; // nova lista
    if (this.onChange) this.onChange([...this.list]);
  }

  remove(index) {
    this.list = this.list.filter((_, i) => i !== index); // nova lista sem o item
    if (this.onChange) this.onChange([...this.list]);
  }

  getList() {
    return [...this.list]; // retorna cópia segura
  }

  clear() {
    this.list = [];
    if (this.onChange) this.onChange([]);
  }
}

export default StoreStocksManager;
