import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { DailyClosing } from '../types';
import { getClosings } from '../services/api';
import { Calendar, ChevronRight } from 'lucide-react';

export const History: React.FC = () => {
    const [closings, setClosings] = useState<DailyClosing[]>([]);
    
    useEffect(() => {
        getClosings()
            .then(setClosings)
            .catch(err => console.error("Failed to load history", err));
    }, []);

    return (
        <Layout>
            <div className="space-y-4">
                <h2 className="text-2xl font-bold dark:text-white mb-6">Histórico</h2>
                
                {closings.map(c => (
                    <div key={c.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{new Date(c.date + 'T00:00:00').toLocaleDateString()}</h3>
                                <p className="text-sm text-gray-500">{c.sale_count} vendas</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-gray-900 dark:text-white">R$ {c.total_amount.toFixed(2)}</p>
                             <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                        </div>
                    </div>
                ))}

                {closings.length === 0 && (
                    <p className="text-center text-gray-500 py-10">Nenhum caixa fechado encontrado.</p>
                )}
            </div>
        </Layout>
    );
};
