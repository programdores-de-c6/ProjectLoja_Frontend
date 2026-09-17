/**
 * ====================================================
 * SALES PAGE (PDV) - O CONTENTOR DE INTELIGÊNCIA
 * ====================================================
 * RESPONSABILIDADE: Gerir dados, APIs, Stock e Sessão.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useCaixa } from '@/contexts/CaixaContext'; 
import { useProducts } from '@/contexts/ProductContext';
import { useCustomerService, Customer } from '@/pages/Customer/CustomerService';
import { useSalesService, CreateSaleFormData } from './SalesService';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useSaleLogic, CartItem } from './useSaleLogic';
import { SaleFinalizedResponse } from '@/types/sale-pdf';
import { ReceiptFormat } from '@/utils/saleReceiptPdf';

// Importação dos Modais e do NOVO Form Visual
import SalesForm from './SalesForm';
import CheckoutModal from './CheckoutModal';
import CustomerSelectionModal from './CustomerSelectionModal';
import { CloseCaixaModal } from '@/components/Modal/CaixaModals';

// ✅ EXPORTAMOS esta interface para que o SalesForm.tsx a consiga importar
export interface ProductDisplay {
  id: string;
  nome: string;
  codigobarra: string;
  precoUnitario: number;
  stock: number;
  imagem?: string;
  taxRate: number;
  controlaStock: boolean;
}

const SalesPage: React.FC = () => {
  // --- REFERÊNCIAS E HOOKS ---
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { currentCaixa, isCaixaOpen, isLoadingCaixa } = useCaixa(); 
  const { products: allProducts, loading: productsLoading, updateStock: updateStockLocal } = useProducts();
  const { listar: listCustomers } = useCustomerService();
  const { criar: createSale, obterProForma } = useSalesService();
  const sale = useSaleLogic();
  const loadedProFormaRef = useRef<number | null>(null);

  // --- ESTADOS LOCAIS ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [showCloseCaixaModal, setShowCloseCaixaModal] = useState(false); 
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [printFormat, setPrintFormat] = useState<ReceiptFormat>('A5');
  const [proformaId, setProformaId] = useState<number | null>(null);

  // CARREGAMENTO INICIAL
  useEffect(() => {
    listCustomers().then(setCustomers).catch(console.error);
  }, []);

  // ATALHOS DE TECLADO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4') { e.preventDefault(); setIsCustomerModalOpen(true); }
      if (e.key === 'F8' && sale.items.length > 0 && isCaixaOpen) { 
        e.preventDefault(); 
        setIsCheckoutModalOpen(true); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sale.items.length, isCaixaOpen]);

  // FORMATAÇÃO DE PRODUTOS PARA A BUSCA
 // ✅ CORREÇÃO TÉCNICA: Garantir que precoUnitario nunca seja undefined
  const formattedProducts: ProductDisplay[] = useMemo(() => {
    return allProducts.map((p) => {
      // Lógica robusta para conversão de preço
      let price = 0;
      if (typeof p.precoUnitario === 'string') {
        price = parseFloat(p.precoUnitario.replace('Db', '').replace(/\s/g, '').replace(',', '.')) || 0;
      } else if (typeof p.precoUnitario === 'number') {
        price = p.precoUnitario;
      }

      return {
        id: String(p.id),
        nome: p.nome,
        codigobarra: p.codigobarra,
        precoUnitario: price, // Agora garantidamente um number
        stock: Number(p.stock) || 0,
        taxRate: p.taxa ? Number(p.taxa) / 100 : 0,
        controlaStock: p.controlaStock 
      };
    });
  }, [allProducts]);

  // Carrega uma pro forma na venda quando a rota recebe ?proformaId=123.
  // A pro forma nunca é finalizada aqui: apenas preenche o carrinho editável.
// Carrega uma pro forma na venda quando a rota recebe ?proformaId=123.
// A pro forma não é finalizada aqui; apenas preenche o carrinho editável.
useEffect(() => {
  const rawId = new URLSearchParams(window.location.search).get('proformaId');
  const id = rawId ? Number(rawId) : NaN;

  if (!Number.isInteger(id) || productsLoading) {
    return;
  }

  // Evita carregar a mesma Pro Forma várias vezes.
  if (loadedProFormaRef.current === id) {
    return;
  }

  obterProForma(id)
    .then((proforma) => {

      // Guarda o ID da Pro Forma para enviar posteriormente
      // quando a venda for finalizada.
      setProformaId(id);

      // Converte os itens da Pro Forma para o carrinho.
      const loadedItems: CartItem[] = proforma.items.map((item) => {

        const product = formattedProducts.find(
          (p) => Number(p.id) === Number(item.productId)
        );

        return {
          productId: String(item.productId),
          productName: item.productName,
          unitPrice: Number(item.unitPrice),
          quantity: Number(item.quantity),
          taxRate: Number(item.taxRate || 0),
          stock: product?.stock ?? 0,
          controlaStock: product?.controlaStock ?? true,
        };
      });

      // Limpa o carrinho actual.
      sale.clearSale();

      // Carrega os produtos da Pro Forma.
      sale.loadItems(loadedItems);

      // ====================================================
      // CLIENTE DA PRO FORMA
      // ====================================================

      if (proforma.customerId) {

        // Procura o cliente na lista carregada.
        const customer = customers.find(
          (c) => Number(c.id) === Number(proforma.customerId)
        );

        if (customer) {
          // Cliente existente na base de dados.
          sale.setCliente(customer);
          sale.setNomeInformal('');
        } else if (proforma.customerName) {
          // Caso o cliente ainda não esteja disponível
          // na lista, mantém pelo menos o nome recebido da Pro Forma.
          sale.setNomeInformal(proforma.customerName);
        }

      } else if (proforma.customerName) {

        // Cliente informal.
        sale.setNomeInformal(proforma.customerName);
      }

      // Só marcamos como carregada depois de processar
      // a Pro Forma.
      loadedProFormaRef.current = id;

      showSuccessToast(
        `Pro Forma ${proforma.numeroProforma} carregada para revisão.`
      );
    })
    .catch(() => {

      // Permite nova tentativa caso ocorra erro.
      loadedProFormaRef.current = null;
      setProformaId(null);

      showErrorToast(
        'Não foi possível carregar a pro forma.'
      );
    });

}, [
  productsLoading,
  formattedProducts,
  customers,
  obterProForma,
  sale
]);

  const handleAddProduct = useCallback((product: ProductDisplay) => {
    // MAPEAMENTO: De ProductDisplay para o formato esperado pelo hook sale.addProduct
    sale.addProduct({
      productId: product.id,        // Mapeia 'id' para 'productId'
      productName: product.nome,    // Mapeia 'nome' para 'productName'
      unitPrice: product.precoUnitario, // Mapeia 'precoUnitario' para 'unitPrice'
      taxRate: product.taxRate,     // Mantém 'taxRate'
      stock: product.stock,         // Mantém 'stock'
      controlaStock: product.controlaStock // Mantém 'controlaStock'
    });

    // Foco automático de volta para a busca para o próximo bipe do leitor de código de barras
    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [sale]);

  // FINALIZAÇÃO DA VENDA (Comunicação com o Java)
  const handleFinalizeSale = useCallback(async () => {



  // Log para debug em tempo real (veja no F12)
  console.log("CONDIÇÃO VENDA:", { 
    user_idl: user?.idl, 
    caixa_id: currentCaixa?.id, 
    caixa_aberto: isCaixaOpen 
  });

   // Validação: idl deve existir e não ser "0". Caixa deve ter um ID.
    const idlValido = user?.idl && user.idl !== "0";
  const caixaValido = currentCaixa && currentCaixa.id;

  if (!idlValido || !caixaValido) {
    showErrorToast('Sessão Inválida: Certifique-se de que selecionou uma loja e o caixa está aberto.');
    return;
  }
    setIsProcessingSale(true);

    // 2. Lógica de Decisão do Cliente (Os 4 Cenários)
  let finalCustomerName = "Venda ao Público";
  let finalCustomerNif = "999999999";
  let finalCustomerId: number | undefined = undefined;

  if (sale.cliente) {
    // Cenário A: Cliente selecionado da base ou Registo Rápido (Modal F4)
    finalCustomerName = sale.cliente.nome;
    finalCustomerNif = sale.cliente.numeroContribuinte || "999999999";
    
    // Se o ID for temporário (ex: TEMP_123), o Java recebe null/undefined para não dar erro
    const idStr = String(sale.cliente.id);
    finalCustomerId = idStr.startsWith('TEMP_') ? undefined : Number(sale.cliente.id);
  } 
  else if (sale.nomeInformal && sale.nomeInformal.trim() !== "") {
    // Cenário B: Operador apenas digitou o nome no campo rápido da lateral
    finalCustomerName = sale.nomeInformal;
    finalCustomerNif = "999999999"; // NIF padrão para nome informal
  }
  // Cenário C: Se não cair em nenhum acima, mantém o padrão "Venda ao Público" e "999999999"

    try {
      const saleData: CreateSaleFormData = {
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerNif: finalCustomerNif,
        shopId: Number(user?.idl),
        userId: Number(user?.id),
         caixaId:  currentCaixa?.id ? Number(currentCaixa.id) : 0, 
          proformaId: proformaId ?? undefined,
      discountAmount: sale.discount,       
      discountType: sale.discountType,     
      paymentMethod: sale.paymentMethod,   
      valorRecebido: sale.received,  

        subtotal: sale.subtotal,        
      totalImposto: sale.totalTax,   
      discountValue: sale.discountValue, 
      totalGeral: sale.total,         
      troco: sale.troco, 
      totalAntesDoDesconto: sale.totalAntesDoDesconto, // Adiciona o campo totalAntesDoDesconto     

        items: sale.items.map(item => ({ productId: Number(item.productId), quantity: item.quantity, unitPrice: item.unitPrice, taxRate: item.taxRate }))
      };

      const result = await createSale(saleData) as unknown as SaleFinalizedResponse;
      sale.items.forEach(item => updateStockLocal(item.productId, item.quantity));
      
      const { printSaleReceiptPdf } = await import('@/utils/saleReceiptPdf');
      printSaleReceiptPdf(result, printFormat);
// IMPORTANTE:
// Remove ?proformaId=5 da URL depois
// de a venda ter sido concluída.
window.history.replaceState(
  {},
  '',
  '/sales'
);
      setIsCheckoutModalOpen(false);
      sale.clearSale();
      setTimeout(() => searchInputRef.current?.focus(), 500);
    } catch {
      showErrorToast('Erro ao gravar venda.');
    } finally {
      setIsProcessingSale(false);
    }
  }, [
  user,
  sale,
  createSale,
  updateStockLocal,
  currentCaixa,
  printFormat,
  isCaixaOpen,
  proformaId
]);
  return (
    <>
      {/* ✅ ENVIAMOS TUDO PARA O FORM VISUAL */}
      <SalesForm 
        sale={sale}
        user={user}
        currentCaixa={currentCaixa}
        isCaixaOpen={isCaixaOpen}
        isLoadingCaixa={isLoadingCaixa}
        isProcessingSale={isProcessingSale}
        printFormat={printFormat}
        setPrintFormat={setPrintFormat}
        onOpenCheckout={() => setIsCheckoutModalOpen(true)}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
        onOpenCloseCaixa={() => setShowCloseCaixaModal(true)}
        formattedProducts={formattedProducts}
        onAddProduct={handleAddProduct}
        productsLoading={productsLoading}
        searchInputRef={searchInputRef}
      />

      {/* MODAIS (Ficam aqui por serem elementos globais de diálogo) */}
      <CustomerSelectionModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onSelect={c => { sale.setCliente(c); setIsCustomerModalOpen(false); }} customers={customers} />
      <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} onConfirm={handleFinalizeSale} items={sale.items} total={sale.total} received={sale.received} troco={sale.troco} isProcessing={isProcessingSale} selectedCustomer={sale.cliente} subtotal={sale.subtotal} totalTax={sale.totalTax} discount={sale.discount} paymentMethod={sale.paymentMethod} />      
      <CloseCaixaModal open={showCloseCaixaModal} onClose={() => setShowCloseCaixaModal(false)} />
    </>
  );
};

export default SalesPage;