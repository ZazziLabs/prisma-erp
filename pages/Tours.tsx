import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tour } from '../types';
import { getTours, saveTour, deleteTour } from '../services/api';
import { Edit2, Trash2, Plus, Box } from 'lucide-react';

export const Tours: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTour, setCurrentTour] = useState<Partial<Tour>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getTours();
      setTours(data);
    } catch (error) {
      console.error("Failed to load tours", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tour?: Tour) => {
    setCurrentTour(tour || { name: '', type: '', price_adult: 0, price_child: 0, price_native: 0, icon: '🌴', active: true });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await saveTour(currentTour);
      setIsEditing(false);
      loadData();
    } catch (e) {
      alert("Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Desativar este passeio?")) return;
    try {
      await deleteTour(id);
      loadData();
    } catch (e) {
      alert("Erro ao remover");
    }
  };

  if (isEditing) {
    return (
      <Layout>
        <div className="space-y-4 animate-in fade-in duration-300">
          <h2 className="text-xl font-bold dark:text-white mb-4">{currentTour.id ? 'Editar Passeio' : 'Novo Passeio'}</h2>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm space-y-4">
             <Input 
                label="Nome do Passeio" 
                value={currentTour.name} 
                onChange={e => setCurrentTour({...currentTour, name: e.target.value})} 
             />
             <Input 
                label="Tipo (Ex: Lancha, Trilha)" 
                value={currentTour.type} 
                onChange={e => setCurrentTour({...currentTour, type: e.target.value})} 
             />
             <div className="flex gap-4">
               <Input 
                  label="Ícone (Emoji)" 
                  value={currentTour.icon} 
                  onChange={e => setCurrentTour({...currentTour, icon: e.target.value})} 
                  className="text-center text-2xl"
               />
               <div className="flex-1"></div>
             </div>

             <div className="grid grid-cols-3 gap-3">
               <Input 
                  label="Preço Adulto" 
                  type="number" 
                  value={currentTour.price_adult} 
                  onChange={e => setCurrentTour({...currentTour, price_adult: parseFloat(e.target.value)})} 
               />
               <Input 
                  label="Preço Criança" 
                  type="number" 
                  value={currentTour.price_child} 
                  onChange={e => setCurrentTour({...currentTour, price_child: parseFloat(e.target.value)})} 
               />
               <Input 
                  label="Preço Nativo" 
                  type="number" 
                  value={currentTour.price_native} 
                  onChange={e => setCurrentTour({...currentTour, price_native: parseFloat(e.target.value)})} 
               />
             </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button fullWidth onClick={handleSave}>Salvar</Button>
            <Button fullWidth variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Passeios</h2>
        <Button onClick={() => handleEdit()} className="!p-3 !rounded-full">
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <div className="space-y-3 pb-24">
        {tours.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-10">
            <Box className="w-12 h-12 mx-auto mb-2 opacity-50"/>
            <p>Nenhum passeio cadastrado</p>
          </div>
        )}
        {tours.map(tour => (
          <div key={tour.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm flex items-center gap-4">
             <div className="text-3xl w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
               {tour.icon}
             </div>
             <div className="flex-1">
               <h3 className="font-bold dark:text-white">{tour.name}</h3>
               <p className="text-xs text-gray-500 uppercase font-semibold">{tour.type}</p>
               <div className="mt-1 flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                 <span>A: R${tour.price_adult}</span>
                 <span>C: R${tour.price_child}</span>
                 <span>N: R${tour.price_native}</span>
               </div>
             </div>
             <div className="flex flex-col gap-2">
               <button onClick={() => handleEdit(tour)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"><Edit2 className="w-5 h-5" /></button>
               <button onClick={() => handleDelete(tour.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
             </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
