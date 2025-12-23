import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { DailyClosing, Sale } from '../types';
import { getClosings, getSalesByDate } from '../services/api';
import { Calendar, ChevronDown, ChevronRight, Loader2, TrendingUp, Users, User, Baby, Mountain } from 'lucide-react';

interface TourSalesSummary {
  name: string;
  icon: string;
  qty_adult: number;
  qty_child: number;
  qty_native: number;
  totalValue: number;
}

interface ClosingDetails {
  sales: Sale[];
  summary: TourSalesSummary[];
}

export const History: React.FC = () => {
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<ClosingDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const loadClosings = useCallback(async () => {
    try {
      const data = await getClosings();
      setClosings(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  }, []);

  useEffect(() => {
    loadClosings();
  }, [loadClosings]);

  const handleToggleDetails = useCallback(async (closing: DailyClosing) => {
    if (selectedId === closing.id) {
      setSelectedId(null);
      setDetails(null);
      return;
    }

    setSelectedId(closing.id);
    setLoadingDetails(true);
    
    try {
      const salesData = await getSalesByDate(closing.date);
      
      const tourSummary: Record<string, TourSalesSummary> = {};
      
      salesData.forEach(sale => {
        sale.sale_items?.forEach(item => {
          const tourId = item.tour_id;
          const tourName = item.tours?.name || 'Produto Desconhecido';
          const tourIcon = item.tours?.icon || '📦';
          
          if (!tourSummary[tourId]) {
            tourSummary[tourId] = { 
              name: tourName, 
              icon: tourIcon, 
              qty_adult: 0,
              qty_child: 0,
              qty_native: 0,
              totalValue: 0 
            };
          }
          
          const value = (item.qty_adult * item.unit_price_adult) + 
                        (item.qty_child * item.unit_price_child) + 
                        (item.qty_native * item.unit_price_native);
          
          tourSummary[tourId].qty_adult += item.qty_adult;
          tourSummary[tourId].qty_child += item.qty_child;
          tourSummary[tourId].qty_native += item.qty_native;
          tourSummary[tourId].totalValue += value;
        });
      });
      
      setDetails({
        sales: salesData,
        summary: Object.values(tourSummary).sort((a,b) => b.totalValue - a.totalValue)
      });
      
    } catch (err) {
      console.error("Failed to get sales details", err);
      setDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, [selectedId]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }, []);

  const isEmpty = useMemo(() => closings.length === 0, [closings]);

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold dark:text-white mb-6">Histórico</h2>
        
        {closings.map(c => (
          <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm transition-all overflow-hidden">
            <div 
              onClick={() => handleToggleDetails(c)}
              className="p-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{formatDate(c.date)}</h3>
                  <p className="text-sm text-gray-500">{c.sale_count} vendas</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-gray-900 dark:text-white text-right">R$ {c.total_amount.toFixed(2)}</p>
                {selectedId === c.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {selectedId === c.id && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in duration-300">
                {loadingDetails && (
                   <div className="flex items-center justify-center gap-2 py-4">
                     <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                     <span className="text-gray-500">Carregando detalhes...</span>
                   </div>
                )}
                {!loadingDetails && details && <ClosingDetailsComponent details={details} />}
              </div>
            )}
          </div>
        ))}

        {isEmpty && (
          <p className="text-center text-gray-500 py-10">Nenhum caixa fechado encontrado.</p>
        )}
      </div>
    </Layout>
  );
};

const ClosingDetailsComponent: React.FC<{ details: ClosingDetails }> = ({ details }) => {
  if (details.sales.length === 0) {
    return <p className="text-center text-gray-500 py-4">Nenhuma venda registrada neste dia.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
        <TrendingUp className="w-4 h-4" />
        <span>Resumo de Produtos Vendidos</span>
      </div>

      <div className="space-y-3">
        {details.summary.map(item => (
          <div key={item.name} className="bg-white dark:bg-gray-700/50 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">{item.icon}</span>
                <div>
                  <p className="font-bold dark:text-white">{item.name}</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">R$ {item.totalValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700/50">
               <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                 <Users className="w-4 h-4" />
                 <span>PÚBLICO ATENDIDO</span>
               </div>
               <div className="grid grid-cols-3 gap-2 text-center">
                  {item.qty_adult > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md">
                      <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{item.qty_adult}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">Adultos</p>
                    </div>
                  )}
                  {item.qty_child > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-md">
                      <p className="text-sm font-bold text-green-800 dark:text-green-200">{item.qty_child}</p>
                      <p className="text-xs text-green-600 dark:text-green-300">Crianças</p>
                    </div>
                  )}
                  {item.qty_native > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md">
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{item.qty_native}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-300">Nativos</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
