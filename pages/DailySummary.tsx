import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { Sale } from '../types';
import { getTodaySales } from '../services/api';
import { Clock, CreditCard } from 'lucide-react';

export const DailySummary: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTodaySales();
      setSales(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { total, byMethod } = useMemo(() => {
    const totalAmount = sales.reduce((acc, s) => acc + s.total_amount, 0);
    const methodMap = sales.reduce((acc, s) => {
      acc[s.payment_method_1] = (acc[s.payment_method_1] || 0) + s.payment_value_1;
      if (s.payment_method_2) {
        acc[s.payment_method_2] = (acc[s.payment_method_2] || 0) + (s.payment_value_2 || 0);
      }
      return acc;
    }, {} as Record<string, number>);
    
    return { total: totalAmount, byMethod: methodMap };
  }, [sales]);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold dark:text-white">Resumo do Dia</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-700 text-white p-5 rounded-2xl shadow-lg shadow-purple-900/20">
            <p className="text-purple-200 text-sm mb-1">Total Vendido</p>
            <h3 className="text-2xl font-bold">R$ {total.toFixed(2)}</h3>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 text-sm mb-1">Vendas</p>
            <h3 className="text-2xl font-bold dark:text-white">{sales.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm">
          <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Por Pagamento</h4>
          <div className="space-y-3">
            {Object.entries(byMethod).map(([method, value]) => (
              <div key={method} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="dark:text-gray-300 font-medium">{method}</span>
                </div>
                <span className="font-bold dark:text-white">R$ {value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Últimas Vendas</h4>
          <div className="space-y-3 pb-10">
            {sales.map(sale => (
              <div key={sale.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border-l-4 border-purple-500 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">R$ {sale.total_amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(sale.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                    {sale.payment_method_1} {sale.payment_method_2 && `+ ${sale.payment_method_2}`}
                  </span>
                </div>
              </div>
            ))}
            {sales.length === 0 && !loading && <p className="text-center text-gray-500">Nenhuma venda hoje.</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
};
