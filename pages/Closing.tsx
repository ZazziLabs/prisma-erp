import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { getTodaySales, closeDay, checkIfDayIsClosed } from '../services/api';
import { Sale } from '../types';
import { Lock, AlertTriangle, CheckCircle, Loader2, Clock } from 'lucide-react';

export const Closing: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingLoading, setClosingLoading] = useState(false);
  const [closed, setClosed] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [nextEnableTime, setNextEnableTime] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verifica se o botão deve estar habilitado baseado no horário
  const checkButtonAvailability = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Calcula próximo horário de habilitação (5h AM)
    const next5AM = new Date(now);
    next5AM.setHours(5, 0, 0, 0);
    
    // Se já passou das 5h hoje, o próximo é amanhã às 5h
    if (currentHour >= 5) {
      next5AM.setDate(next5AM.getDate() + 1);
    }
    
    setNextEnableTime(next5AM);
    
    // Habilita se for >= 5h AM
    return currentHour >= 5;
  }, []);

  // Verifica status do dia (se já foi fechado)
  const checkDayStatus = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const isClosed = await checkIfDayIsClosed(today);
      setClosed(isClosed);
      
      // Só habilita botão se não estiver fechado E for após 5h
      const timeCheck = checkButtonAvailability();
      setIsButtonEnabled(!isClosed && timeCheck);
    } catch (error) {
      console.error("Failed to check day status", error);
    }
  }, [checkButtonAvailability]);

  useEffect(() => {
    loadSales();
    checkDayStatus();
    
    // Verifica a cada minuto se deve habilitar o botão
    const interval = setInterval(() => {
      checkDayStatus();
    }, 60000); // 60 segundos
    
    return () => clearInterval(interval);
  }, [checkDayStatus]);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTodaySales();
      setSales(data);
    } catch (error) {
      console.error("Failed to load today's sales", error);
      setErrorMessage("Erro ao carregar vendas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  const totals = useMemo(() => {
    const methods = { total: 0, cash: 0, pix: 0, debit: 0, credit: 0 };
    
    sales.forEach(sale => {
      methods.total += sale.total_amount;
      
      const addPayment = (method: string, value: number) => {
        if (method === 'DINHEIRO') methods.cash += value;
        else if (method === 'PIX') methods.pix += value;
        else if (method === 'DEBITO') methods.debit += value;
        else if (method === 'CREDITO') methods.credit += value;
      };
      
      addPayment(sale.payment_method_1, sale.payment_value_1);
      if (sale.payment_method_2 && sale.payment_value_2) {
        addPayment(sale.payment_method_2, sale.payment_value_2);
      }
    });
    
    return methods;
  }, [sales]);

  const handleClose = useCallback(async () => {
    const confirmed = window.confirm(
      `Confirma o fechamento do caixa?\n\nTotal: R$ ${totals.total.toFixed(2)}\nVendas: ${sales.length}\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmed) return;
    
    setClosingLoading(true);
    setErrorMessage(null);
    
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
      
      // Se chegou aqui, foi sucesso
      setClosed(true);
      setIsButtonEnabled(false);
      
    } catch (e: unknown) {
      console.error('Close day error:', e);
      const errorMsg = e instanceof Error ? e.message : "Erro desconhecido ao fechar o caixa.";
      setErrorMessage(errorMsg);
      alert(`❌ Erro: ${errorMsg}`);
    } finally {
      setClosingLoading(false);
    }
  }, [totals, sales.length]);

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

  if (closed) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold dark:text-white">✅ Caixa Fechado com Sucesso!</h2>
          <p className="text-gray-500 max-w-md">
            O movimento de hoje foi salvo no histórico com segurança.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total fechado: <span className="font-bold text-lg">R$ {totals.total.toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vendas: <span className="font-bold">{sales.length}</span>
            </p>
          </div>
          {nextEnableTime && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Próximo fechamento disponível: {nextEnableTime.toLocaleString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex gap-3">
            <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200 mb-1">Erro ao Fechar Caixa</p>
              <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {!isButtonEnabled && !errorMessage && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl flex gap-3">
            <Clock className="text-amber-500 w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                {closed ? '🔒 Caixa Já Fechado' : '⏰ Fechamento Bloqueado'}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {closed 
                  ? `O caixa de hoje já foi encerrado. Próximo fechamento disponível ${nextEnableTime ? `em ${nextEnableTime.toLocaleDateString('pt-BR')} às ${nextEnableTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'amanhã às 5:00 AM'}.`
                  : `O fechamento de caixa estará disponível ${nextEnableTime ? `em ${nextEnableTime.toLocaleDateString('pt-BR')} às ${nextEnableTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'às 5:00 AM'}.`
                }
              </p>
            </div>
          </div>
        )}

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex gap-3">
          <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-200 mb-1">Atenção!</p>
            <p className="text-sm text-red-800 dark:text-red-300">
              Ao fechar o caixa, você não poderá mais editar ou adicionar vendas para a data de hoje.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white">
            <p className="text-sm font-medium opacity-90 mb-2">Resumo do Dia</p>
            <p className="text-4xl font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>

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

          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Por Método de Pagamento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
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
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
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
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
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
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
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

        <div className="space-y-3">
          <Button 
            fullWidth 
            onClick={handleClose}
            disabled={closingLoading || sales.length === 0 || !isButtonEnabled}
            className="!bg-gray-900 !text-white dark:!bg-white dark:!text-black py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
