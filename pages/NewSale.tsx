import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tour, CartItem, PaymentMethod } from '../types';
import { getTours, createSale } from '../services/api';
import { Plus, Minus, Trash2, CheckCircle, Search, Ticket } from 'lucide-react';

export const NewSale: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [paymentStep, setPaymentStep] = useState(false);
  const [loading, setLoading] = useState(false);

  // Payment State
  const [method1, setMethod1] = useState<PaymentMethod>('DINHEIRO');
  const [value1, setValue1] = useState<string>('');
  const [method2, setMethod2] = useState<PaymentMethod | null>(null);
  
  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      const data = await getTours();
      setTours(data);
    } catch (error) {
      console.error('Failed to load tours', error);
    }
  };

  const addToCart = (tour: Tour) => {
    setCart(prev => {
      const existing = prev.find(i => i.tourId === tour.id);
      if (existing) return prev;
      return [...prev, {
        tourId: tour.id,
        tourName: tour.name,
        tourIcon: tour.icon,
        qtyAdult: 1,
        qtyChild: 0,
        qtyNative: 0,
        priceAdult: tour.price_adult,
        priceChild: tour.price_child,
        priceNative: tour.price_native
      }];
    });
    setIsAdding(false);
    setSearch('');
  };

  const updateQty = (index: number, type: 'qtyAdult' | 'qtyChild' | 'qtyNative', delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      const newVal = newCart[index][type] + delta;
      if (newVal >= 0) newCart[index][type] = newVal;
      return newCart;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + (item.qtyAdult * item.priceAdult) + (item.qtyChild * item.priceChild) + (item.qtyNative * item.priceNative);
    }, 0);
  }, [cart]);

  const handleFinishSale = async () => {
    if (cartTotal === 0) return;
    
    // Validate payments
    const v1 = parseFloat(value1) || 0;
    const v2 = method2 ? (cartTotal - v1) : 0; // Auto calc rest if method 2 is active or implicitly split

    if (Math.abs((v1 + v2) - cartTotal) > 0.01) {
      alert("A soma dos pagamentos não bate com o total.");
      return;
    }

    setLoading(true);
    try {
      await createSale(cart, {
        method1,
        value1: v1,
        method2: method2 || null,
        value2: v2 > 0 ? v2 : null
      });
      alert("Venda realizada com sucesso!");
      setCart([]);
      setPaymentStep(false);
      setValue1('');
      setMethod2(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar venda.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentStep) {
    const v1 = parseFloat(value1) || 0;
    const remaining = Math.max(0, cartTotal - v1);

    return (
      <Layout>
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm text-center">
            <p className="text-sm text-gray-500">Total a pagar</p>
            <h2 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mt-2">
              R$ {cartTotal.toFixed(2)}
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Pagamento 1</h3>
            <div className="grid grid-cols-2 gap-4">
               <select 
                value={method1} 
                onChange={e => setMethod1(e.target.value as PaymentMethod)}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-white"
               >
                 <option value="DINHEIRO">Dinheiro</option>
                 <option value="PIX">Pix</option>
                 <option value="DEBITO">Débito</option>
                 <option value="CREDITO">Crédito</option>
               </select>
               <Input 
                type="number" 
                placeholder="0.00" 
                value={value1} 
                onChange={e => setValue1(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {remaining > 0 && (
             <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm space-y-4 border-l-4 border-purple-500">
             <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Pagamento 2 (Restante)</h3>
                <span className="font-bold text-gray-900 dark:text-white">R$ {remaining.toFixed(2)}</span>
             </div>
             <div className="grid grid-cols-1 gap-4">
                <select 
                 value={method2 || 'DINHEIRO'} 
                 onChange={e => setMethod2(e.target.value as PaymentMethod)}
                 className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-white w-full"
                >
                  <option value="">Selecione...</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">Pix</option>
                  <option value="DEBITO">Débito</option>
                  <option value="CREDITO">Crédito</option>
                </select>
             </div>
           </div>
          )}
          
          <div className="pt-4 space-y-3">
             <Button fullWidth onClick={handleFinishSale} disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Venda'}
             </Button>
             <Button fullWidth variant="ghost" onClick={() => setPaymentStep(false)} disabled={loading}>
              Voltar
             </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isAdding) {
    const filteredTours = tours.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <Layout>
        <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
           <div className="flex gap-2">
             <Input 
              placeholder="Buscar passeio..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="flex-1"
              autoFocus
            />
             <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
           </div>
           
           <div className="grid gap-3">
             {filteredTours.map(tour => (
               <button 
                key={tour.id}
                onClick={() => addToCart(tour)}
                className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm hover:ring-2 ring-purple-500 transition-all text-left"
               >
                 <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                   {tour.icon || '🌴'}
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-900 dark:text-white">{tour.name}</h3>
                   <p className="text-sm text-gray-500">{tour.type}</p>
                 </div>
                 <div className="ml-auto">
                   <Plus className="text-purple-600" />
                 </div>
               </button>
             ))}
           </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {cart.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Ticket className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-lg font-medium">Sua sacola está vazia</p>
            <p className="text-sm">Adicione passeios para começar uma venda</p>
          </div>
        ) : (
          <div className="space-y-4 pb-32">
            {cart.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                        {item.tourIcon || '🌴'}
                      </div>
                      <div>
                        <h3 className="font-bold dark:text-white leading-tight">{item.tourName}</h3>
                        <p className="text-xs text-gray-500">Subtotal: R$ {
                          ((item.qtyAdult * item.priceAdult) + (item.qtyChild * item.priceChild) + (item.qtyNative * item.priceNative)).toFixed(2)
                        }</p>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-red-400 p-1">
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>

                 {/* Controls */}
                 <div className="grid grid-cols-1 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                    <div className="flex justify-between items-center">
                       <span className="text-sm dark:text-gray-300 w-16">Adulto</span>
                       <div className="flex items-center gap-3">
                         <button onClick={() => updateQty(idx, 'qtyAdult', -1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                         <span className="w-6 text-center font-medium dark:text-white">{item.qtyAdult}</span>
                         <button onClick={() => updateQty(idx, 'qtyAdult', 1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                       </div>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm dark:text-gray-300 w-16">Criança</span>
                       <div className="flex items-center gap-3">
                         <button onClick={() => updateQty(idx, 'qtyChild', -1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                         <span className="w-6 text-center font-medium dark:text-white">{item.qtyChild}</span>
                         <button onClick={() => updateQty(idx, 'qtyChild', 1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                       </div>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm dark:text-gray-300 w-16">Nativo</span>
                       <div className="flex items-center gap-3">
                         <button onClick={() => updateQty(idx, 'qtyNative', -1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                         <span className="w-6 text-center font-medium dark:text-white">{item.qtyNative}</span>
                         <button onClick={() => updateQty(idx, 'qtyNative', 1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-10 safe-area-bottom">
           <div className="max-w-lg mx-auto flex gap-3">
              <Button onClick={() => setIsAdding(true)} variant="secondary" className="flex-1">
                <Plus className="w-5 h-5" /> Adicionar
              </Button>
              <Button 
                onClick={() => {
                   setValue1(cartTotal.toFixed(2)); // Pre-fill
                   setPaymentStep(true);
                }} 
                className="flex-[2]" 
                disabled={cart.length === 0}
              >
                R$ {cartTotal.toFixed(2)} <CheckCircle className="w-5 h-5 ml-1" />
              </Button>
           </div>
        </div>
      </div>
    </Layout>
  );
};
