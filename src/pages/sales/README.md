# 📦 Módulo de Vendas (Sales)

## Visão Geral

O módulo de vendas implementa um **Ponto de Venda (PDV) profissional** com separação clara de responsabilidades. Cada arquivo tem uma função específica e bem definida.

## 🏗️ Arquitetura

```
pages/sales/
├── SalesPage.tsx                 # Página principal (orquestra tudo)
├── useSaleLogic.ts              # Hook com lógica de carrinho
├── SalesService.tsx             # Serviço de API
├── ProductSearch.tsx            # Componente de busca
├── CartTable.tsx                # Tabela do carrinho
├── SaleSummary.tsx              # Resumo financeiro
├── CustomerSelector.tsx         # Seletor de cliente
├── CustomerSelectionModal.tsx   # Modal de seleção
├── CheckoutModal.tsx            # Modal de finalização
├── SalesForm.tsx                # Formulário (placeholder)
└── README.md                    # Este arquivo
```

## 📋 Descrição dos Arquivos

### 1. **SalesPage.tsx** (Página Principal)
**Responsabilidade:** Orquestrar todos os componentes e gerenciar o fluxo de vendas.

**O que faz:**
- Carrega produtos e clientes
- Gerencia estados globais (modais, processamento)
- Coordena callbacks entre componentes
- Trata eventos de teclado (F4 para cliente)
- Finaliza vendas na API

**Não faz:**
- Lógica de carrinho (delegada ao `useSaleLogic`)
- Cálculos financeiros (delegados ao `useSaleLogic`)
- Renderização de tabelas complexas (delegada ao `CartTable`)

---

### 2. **useSaleLogic.ts** (Hook de Lógica)
**Responsabilidade:** Gerenciar todo o estado e lógica de carrinho.

**O que faz:**
- Adiciona/remove/atualiza produtos no carrinho
- Calcula subtotal, impostos e total (memoizado)
- Gerencia cliente, desconto, método de pagamento
- Fornece funções para salvar/finalizar/limpar venda

**Exemplo de uso:**
```typescript
const sale = useSaleLogic();
sale.addProduct({ productId: '1', productName: 'Produto', ... });
sale.updateQty('1', 2);
sale.setDiscount(10);
const { subtotal, total, troco } = sale;
```

---

### 3. **SalesService.tsx** (Serviço de API)
**Responsabilidade:** Abstrair chamadas à API de vendas.

**Funções:**
- `listar()` - Lista todas as vendas
- `criar(data)` - Cria uma nova venda
- `getById(id)` - Obtém detalhes de uma venda
- `cancelar(id)` - Cancela uma venda

**Interfaces:**
- `SaleItem` - Item individual de venda
- `Sale` - Venda completa
- `CreateSaleFormData` - Dados para criar venda

---

### 4. **ProductSearch.tsx** (Busca de Produtos)
**Responsabilidade:** Permitir busca e seleção de produtos.

**Funcionalidades:**
- Busca por nome ou código de barras
- Autocomplete com até 8 resultados
- Navegação com teclado (setas, Enter, Escape)
- Validação de stock
- Sugestões com informações do produto

**Props:**
```typescript
interface ProductSearchProps {
  products: Product[];
  onProductSelected: (product: Product) => void;
  isLoading?: boolean;
}
```

---

### 5. **CartTable.tsx** (Tabela do Carrinho)
**Responsabilidade:** Exibir e gerenciar itens do carrinho.

**Funcionalidades:**
- Tabela com scroll
- Botões +/- para quantidade
- Input direto de quantidade
- Botão de remoção
- Cálculo de subtotal por item

**Props:**
```typescript
interface CartTableProps {
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  isLoading?: boolean;
}
```

---

### 6. **SaleSummary.tsx** (Resumo Financeiro)
**Responsabilidade:** Exibir e gerenciar totais financeiros.

**Seções:**
1. **Totais** - Subtotal, impostos, total
2. **Desconto** - Campo para aplicar desconto
3. **Pagamento** - Select de método de pagamento
4. **Troco** - Valor recebido e troco calculado

**Props:**
```typescript
interface SaleSummaryProps {
  subtotal: number;
  totalTax: number;
  total: number;
  troco: number;
  discount: number;
  onDiscountChange: (discount: number) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  received: number;
  onReceivedChange: (received: number) => void;
  isLoading?: boolean;
}
```

---

### 7. **CustomerSelector.tsx** (Seletor de Cliente)
**Responsabilidade:** Exibir cliente selecionado e permitir alteração.

**Estados:**
- Cliente selecionado: mostra informações
- Sem cliente: mostra botão para selecionar

**Props:**
```typescript
interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: () => void;
  onRemoveCustomer: () => void;
  isLoading?: boolean;
}
```

---

### 8. **CustomerSelectionModal.tsx** (Modal de Seleção)
**Responsabilidade:** Permitir busca e seleção de cliente.

**Funcionalidades:**
- Busca por nome, NIF ou email
- Lista com scroll
- Exibe informações do cliente
- Contador de resultados

**Props:**
```typescript
interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
  customers: Customer[];
  isLoading?: boolean;
}
```

---

### 9. **CheckoutModal.tsx** (Modal de Finalização)
**Responsabilidade:** Revisar venda e confirmar finalização.

**Seções:**
1. **Cliente** - Informações do cliente selecionado
2. **Itens** - Lista de produtos com quantidades
3. **Totais** - Subtotal, desconto, impostos, total
4. **Pagamento** - Método, valor recebido, troco
5. **Validações** - Alertas de problemas

**Props:**
```typescript
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  items: CartItem[];
  selectedCustomer: Customer | null;
  subtotal: number;
  totalTax: number;
  total: number;
  discount: number;
  paymentMethod: string;
  received: number;
  troco: number;
  isProcessing?: boolean;
}
```

---

### 10. **SalesForm.tsx** (Formulário)
**Responsabilidade:** Placeholder para edição de venda.

**Nota:** Este arquivo é um placeholder. No contexto de um PDV, a `SalesPage` atua como o formulário principal. Se no futuro for necessário editar detalhes de uma venda específica, este arquivo pode ser expandido.

---

## 🔄 Fluxo de Dados

```
SalesPage (orquestra)
    ↓
    ├─→ ProductSearch (busca)
    │       ↓
    │   useSaleLogic (adiciona)
    │
    ├─→ CartTable (exibe itens)
    │       ↓
    │   useSaleLogic (atualiza quantidade/remove)
    │
    ├─→ SaleSummary (exibe totais)
    │       ↓
    │   useSaleLogic (atualiza desconto/pagamento/recebido)
    │
    ├─→ CustomerSelector (exibe cliente)
    │       ↓
    │   CustomerSelectionModal (seleciona cliente)
    │       ↓
    │   useSaleLogic (atualiza cliente)
    │
    └─→ CheckoutModal (confirma)
            ↓
        SalesService (cria venda)
```

---

## 🎯 Padrões Utilizados

### 1. **Separação de Responsabilidades**
- Cada componente tem uma única responsabilidade
- Lógica centralizada no hook `useSaleLogic`
- Serviço de API isolado em `SalesService`

### 2. **Composição de Componentes**
- Componentes pequenos e reutilizáveis
- Props bem definidas
- Callbacks para comunicação pai-filho

### 3. **Memoização**
- `useMemo` para cálculos complexos
- `useCallback` para funções estáveis
- Evita re-renders desnecessários

### 4. **Validação**
- Validação no hook (stock, quantidade)
- Validação no modal (valor recebido)
- Mensagens de erro claras

### 5. **Acessibilidade**
- Suporte a teclado (F4, setas, Enter)
- Labels descritivos
- Mensagens de erro visuais

---

## 🚀 Como Usar

### Adicionar um Produto
```typescript
// No componente
const handleAddProduct = (product: ProductDisplay) => {
  sale.addProduct({
    productId: product.id,
    productName: product.nome,
    unitPrice: product.precoUnitario,
    taxRate: product.taxRate,
    stock: product.stock,
  });
};
```

### Atualizar Quantidade
```typescript
sale.updateQty('product-id', 5);
```

### Remover Item
```typescript
sale.removeItem('product-id');
```

### Aplicar Desconto
```typescript
sale.setDiscount(10); // 10 euros
```

### Finalizar Venda
```typescript
const saleData: CreateSaleFormData = {
  customerId: sale.cliente?.id,
  shopId: user.idl,
  userId: user.id,
  items: sale.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxRate: item.taxRate,
  })),
  discountAmount: sale.discount,
  paymentMethod: sale.paymentMethod,
};

await createSale(saleData);
```

---

## 📊 Tipos de Dados

### CartItem
```typescript
interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
  stock: number;
}
```

### Customer
```typescript
interface Customer {
  id: string;
  nome: string;
  nif?: string;
  email?: string;
  telefone?: string;
}
```

### SaleTotals
```typescript
interface SaleTotals {
  subtotal: number;
  totalTax: number;
  total: number;
  troco: number;
}
```

---

## 🔧 Melhorias Futuras

1. **Impressão de Recibos** - Integrar com `genericViewPdf`
2. **Histórico de Vendas** - Página para consultar vendas anteriores
3. **Cancelamento de Venda** - Permitir cancelar venda após finalização
4. **Relatórios** - Gráficos de vendas por período
5. **Sincronização** - Atualizar stock em tempo real
6. **Atalhos de Teclado** - Mais atalhos para operações comuns
7. **Modo Offline** - Cache local de produtos
8. **Múltiplas Lojas** - Suporte a múltiplas pontos de venda

---

## 📝 Notas

- Todos os componentes têm comentários em cada linha
- Usa TypeScript para type-safety
- Componentes Shadcn/UI para UI consistente
- Memoização para performance
- Validação em múltiplos níveis

---

## 👥 Autor

Desenvolvido com base no código antigo de venda, refatorado com separação de responsabilidades e arquitetura moderna.
