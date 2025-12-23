import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getClosings } from '../services/api';
import { DailyClosing } from '../types';
import { Loader2, TrendingUp, Calendar } from 'lucide-react';

interface WeekData {
  name: string;
  total: number;
  date: string;
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const FULL_DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const Reports: React.FC = () => {
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClosings();
      setClosings(data);
    } catch (error) {
      console.error('Failed to load closings', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const weekData = useMemo((): WeekData[] => {
    const last7 = closings.slice(0, 7).reverse();
    
    return last7.map(closing => {
      const date = new Date(closing.date);
      
      return {
        name: DAY_NAMES[date.getDay()],
        total: closing.total_amount,
        date: closing.date
      };
    });
  }, [closings]);

  const averageTicket = useMemo((): number => {
    if (closings.length === 0) return 0;
    
    const totalSales = closings.reduce((acc, c) => acc + c.sale_count, 0);
    const totalAmount = closings.reduce((acc, c) => acc + c.total_amount, 0);
    
    return totalSales > 0 ? totalAmount / totalSales : 0;
  }, [closings]);

  const bestDay = useMemo((): string => {
    if (closings.length === 0) return '-';
    
    const dayTotals: Record<string, number> = {
      'Domingo': 0,
      'Segunda': 0,
      'Terça': 0,
      'Quarta': 0,
      'Quinta': 0,
      'Sexta': 0,
      'Sábado': 0
    };
    
    closings.forEach(closing => {
      const date = new Date(closing.date);
      const dayName = FULL_DAY_NAMES[date.getDay()];
      dayTotals[dayName] += closing.total_amount;
    });
    
    let bestDay = 'Segunda';
    let bestValue = 0;
    
    Object.entries(dayTotals).forEach(([day, total]) => {
      if (total > bestValue) {
        bestValue = total;
        bestDay = day;
      }
    });
    
    return bestDay;
  }, [closings]);

  const totalRevenue = useMemo(() => 
    closings.reduce((acc, c) => acc + c.total_amount, 0), [closings]
  );

  const totalSales = useMemo(() => 
    closings.reduce((acc, c) => acc + c.sale_count, 0), [closings]
  );

  const paymentTotals = useMemo(() => {
    const last30 = closings.slice(0, 30);
    return {
      cash: last30.reduce((acc, c) => acc + c.total_cash, 0),
      pix: last30.reduce((acc, c) => acc + c.total_pix, 0),
      debit: last30.reduce((acc, c) => acc + c.total_debit, 0),
      credit: last30.reduce((acc, c) => acc + c.total_credit, 0),
    };
  }, [closings]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-500">Carregando relatórios...</p>
        </div>
      </Layout>
    );
  }

  if (closings.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold dark:text-white">Nenhum Relatório Disponível</h2>
          <p className="text-gray-500 max-w-md">
            Você ainda não possui fechamentos de caixa registrados. Realize vendas e feche o caixa para visualizar os relatórios.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Relatórios</h2>
          <button
            onClick={loadData}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
            <p className="text-sm opacity-90 font-medium mb-2">Faturamento Total</p>
            <p className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-2">{closings.length} dias registrados</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                Ticket Médio
              </p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              R$ {averageTicket.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {totalSales} vendas totais
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                Melhor Dia
              </p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {bestDay}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Maior faturamento
            </p>
          </div>
        </div>

        {weekData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Últimos {weekData.length} Dias
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Faturamento por dia
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'white'
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#820ad1" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Métodos de Pagamento (Últimos {Math.min(closings.length, 30)} dias)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-xs text-green-700 dark:text-green-300 uppercase font-bold mb-1">
                Dinheiro
              </p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                R$ {paymentTotals.cash.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-blue-700 dark:text-blue-300 uppercase font-bold mb-1">
                Pix
              </p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                R$ {paymentTotals.pix.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-xs text-purple-700 dark:text-purple-300 uppercase font-bold mb-1">
                Débito
              </p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                R$ {paymentTotals.debit.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <p className="text-xs text-orange-700 dark:text-orange-300 uppercase font-bold mb-1">
                Crédito
              </p>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                R$ {paymentTotals.credit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
