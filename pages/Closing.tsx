import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { getTodaySales, closeDay } from '../services/api';
import { Sale } from '../types';
import { Lock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export const Closing: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingLoading, setClosingLoading] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await getTodaySales();
      setSales(data);
    } catch (error) {
      console.error("Failed to load today's sales", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const methods = { total: 0, cash: 0, pix: 0, debit: 0, credit: 0 };
    
    sales.forEach(sale => {
      methods.total += sale.total_amount;
      
      // Adiciona valor do método 1
      if (sale.payment_method_1 === 'DINHEIRO') methods.cash += sale.payment_value_1;
      if (sale.payment_method_1 === 'PIX') methods.pix += sale.payment_value_1;
      if (sale.payment_method_1 === 'DEBITO') methods.debit += sale.payment_value_1;
      if (sale.payment_method_1 === 'CREDITO') methods.credit += sale.payment_value_1;
      
      // Adiciona valor do método 2 (se existir)
      if (sale.payment_method_2 && sale.payment_value_2) {
        if (sale.payment_method_2 === 'DINHEIRO') methods.cash += sale.payment_value_2;
        if (sale.payment_method_2 === 'PIX') methods.pix += sale.payment_value_2;
        if (sale.payment_method_2 === 'DEBITO') methods.debit += sale.payment_value_2;
        if (sale.payment_method_2 === 'CREDITO') methods.credit += sale.payment_value_2;
      }
    });
    
    return methods;
  };

  const totals = calculateTotals();

  const handleClose = async () => {
    const confirmed = window.confirm(
      `Confirma o fechamento do caixa?\n\nTotal: R$ ${totals.total.toFixed(2)}\nVendas: ${sales.length}\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmed) return;
    
    setClosingLoading(true);
    try {
      await closeDay({
        date: new Date().toISOString().split('T')[0],
        total_amount: totals.total,
        total_cash: totals.cash,
        total_pix: totals.pix,
        total_debit: totals.debit,
        total_credit: totals.credit,
        sale_count: sales.length
      });
      setClosed(true);
    } catch (e: any) {
      console.error('Close day error:', e);
      alert(e.message || "Erro ao fechar o caixa. Tente novamente.");
    } finally {
      setClosingLoading(false);
    }
  };

  // Loading inicial
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-500">Carregando vendas de hoje...</p>
        </div>
      </Layout>
    );
  }

  // Sucesso no fechamento
  if (closed) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold dark:text-white">Caixa Fechado!</h2>
          <p className="text-gray-500 max-w-md">
            O movimento de hoje foi salvo no histórico com segurança.
          </p>
          <div className="pt-4">
            <Button onClick={() => window.location.reload()} variant="secondary">
              Voltar
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Alerta */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex gap-3">
          <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-200 mb-1">Atenção!</p>
            <p className="text-sm text-red-800 dark:text-red-300">
              Ao fechar o caixa, você não poderá mais editar ou adicionar vendas para a data de hoje.
            </p>
          </div>
        </div>

        {/* Card de Resumo */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white">
            <p className="text-sm font-medium opacity-90 mb-2">Resumo do Dia</p>
            <p className="text-4xl font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          {/* Total Geral */}
          <div className="p-8 text-center border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Total Geral
            </p>
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              R$ {totals.total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {sales.length} {sales.length === 1 ? 'venda' : 'vendas'} realizada{sales.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Breakdown por Método de Pagamento */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Por Método de Pagamento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Dinheiro
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {totals.cash.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Pix
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {totals.pix.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Débito
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {totals.debit.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Crédito
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {totals.credit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Fechar Caixa */}
        <div className="space-y-3">
          <Button 
            fullWidth 
            onClick={handleClose}
            disabled={closingLoading || sales.length === 0}
            className="!bg-gray-900 !text-white dark:!bg-white dark:!text-black py-4 text-lg font-semibold"
          >
            {closingLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Fechando Caixa...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Encerrar Caixa Agora
              </>
            )}
          </Button>

          {sales.length === 0 && (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma venda registrada hoje.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Adicione vendas antes de fechar o caixa.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
