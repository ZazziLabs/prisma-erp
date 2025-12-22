import React from 'react';
import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data logic for visualization - in prod this would aggregate from DB
const data = [
  { name: 'Seg', total: 4000 },
  { name: 'Ter', total: 3000 },
  { name: 'Qua', total: 2000 },
  { name: 'Qui', total: 2780 },
  { name: 'Sex', total: 1890 },
  { name: 'Sab', total: 2390 },
  { name: 'Dom', total: 3490 },
];

export const Reports: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold dark:text-white">Relatórios</h2>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Vendas da Semana</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="total" fill="#820ad1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-2xl">
                 <p className="text-xs text-green-700 dark:text-green-300 uppercase font-bold">Ticket Médio</p>
                 <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-1">R$ 145,00</p>
             </div>
             <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-2xl">
                 <p className="text-xs text-blue-700 dark:text-blue-300 uppercase font-bold">Melhor Dia</p>
                 <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">Segunda</p>
             </div>
        </div>
      </div>
    </Layout>
  );
};
