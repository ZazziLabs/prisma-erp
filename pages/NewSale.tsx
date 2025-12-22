import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tour, CartItem, PaymentMethod } from '../types';
import { getTours, createSale } from '../services/api';
import { Plus, Minus, Trash2, CheckCircle, ShoppingCart, Package } from 'lucide-react';

export const NewSale: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentStep, setPaymentStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);

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

  const addToCart = (tour: Tour, audienceType: 'adult' | 'child' | 'native') => {
    setCart(prev => {
      const existing = prev.find(i => i.tourId === tour.id);
      if (existing) {
        // Incrementa a quantidade do público selecionado
        return prev.map(item => {
          if (item.tourId === tour.id) {
            return {
              ...item,
              qtyAdult: audienceType === 'adult' ? item.qtyAdult + 1 : item.qtyAdult,
              qtyChild: audienceType === 'child' ? item.qtyChild + 1 : item.qtyChild,
              qtyNative: audienceType === 'native' ? item.qtyNative + 1 : item.qtyNative,
            };
          }
          return item;
        });
      }
      
      // Adiciona novo item ao carrinho
      return [...prev, {
        tourId: tour.id,
        tourName: tour.name,
        tourIcon: tour.icon,
        qtyAdult: audienceType === 'adult' ? 1 : 0,
        qtyChild: audienceType === 'child' ? 1 : 0,
        qtyNative: audienceType === 'native' ? 1 : 0,
        priceAdult: tour.price_adult,
        priceChild: tour.price_child,
        priceNative: tour.price_native
      }];
    });
  };

  const updateQty = (index: number, type: 'qtyAdult' | 'qtyChild' | 'qtyNative', delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      const newVal = newCart[index][type] + delta;
      if (newVal >= 0) newCart[index][type] = newVal;
      
      // Remove do carrinho se todas as quantidades forem 0
      const item = newCart[index];
      if (item.qtyAdult === 0 && item.qtyChild === 0 && item.qtyNative === 0) {
        return newCart.filter((_, i) => i !== index);
      }
      
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

  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.qtyAdult + item.qtyChild + item.qtyNative, 0);
  }, [cart]);

  const handleFinishSale = async () => {
    if (cartTotal === 0) return;
    
    const v1 = parseFloat(value1) || 0;
    const v2 = method2 ? (cartTotal - v1) : 0;

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
      setShowCart(false);
      setValue1('');
      setMethod2(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar venda.");
    } finally {
      setLoading(false);
    }
  };

  // Tela de Pagamento
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
                  value={method2 || ''} 
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

  // Tela do Carrinho
  if (showCart) {
    return (
      <Layout>
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold dark:text-white">Carrinho</h2>
            <Button variant="ghost" onClick={() => setShowCart(false)}>Voltar</Button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <p className="text-lg font-medium">Carrinho vazio</p>
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

                  <div className="grid grid-cols-1 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                    {item.priceAdult > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm dark:text-gray-300 w-20">Adulto</span>
                        <span className="text-xs text-gray-500">R$ {item.priceAdult.toFixed(2)}</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQty(idx, 'qtyAdult', -1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                          <span className="w-6 text-center font-medium dark:text-white">{item.qtyAdult}</span>
                          <button onClick={() => updateQty(idx, 'qtyAdult', 1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                    {item.priceChild > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm dark:text-gray-300 w-20">Criança</span>
                        <span className="text-xs text-gray-500">R$ {item.priceChild.toFixed(2)}</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQty(idx, 'qtyChild', -1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                          <span className="w-6 text-center font-medium dark:text-white">{item.qtyChild}</span>
                          <button onClick={() => updateQty(idx, 'qtyChild', 1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                    {item.priceNative > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm dark:text-gray-300 w-20">Nativo</span>
                        <span className="text-xs text-gray-500">R$ {item.priceNative.toFixed(2)}</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQty(idx, 'qtyNative', -1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                          <span className="w-6 text-center font-medium dark:text-white">{item.qtyNative}</span>
                          <button onClick={() => updateQty(idx, 'qtyNative', 1)} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-10">
            <div className="max-w-lg mx-auto">
              <Button 
                fullWidth
                onClick={() => {
                  setValue1(cartTotal.toFixed(2));
                  setPaymentStep(true);
                }} 
                disabled={cart.length === 0}
              >
                Finalizar R$ {cartTotal.toFixed(2)} <CheckCircle className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Tela Principal - Grid de Produtos
  return (
    <Layout>
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Produtos</h2>
          {cart.length > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            </button>
          )}
        </div>

        {tours.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-lg font-medium">Nenhum produto cadastrado</p>
            <p className="text-sm">Cadastre produtos na aba Adicionar Pacotes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tours.map(tour => (
              <ProductCard 
                key={tour.id} 
                tour={tour} 
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-10">
          <div className="max-w-lg mx-auto bg-purple-600 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">{cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}</p>
              <p className="text-2xl font-bold">R$ {cartTotal.toFixed(2)}</p>
            </div>
            <Button variant="secondary" onClick={() => setShowCart(true)}>
              Ver Carrinho
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

// Componente do Card de Produto
interface ProductCardProps {
  tour: Tour;
  onAddToCart: (tour: Tour, audienceType: 'adult' | 'child' | 'native') => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ tour, onAddToCart }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4">
      <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-3">
        {/* Div 1: Informações do Produto */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl flex-shrink-0">
            {tour.icon || '🌴'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight truncate">{tour.name}</h3>
            <p className="text-xs text-gray-500 truncate">{tour.type}</p>
          </div>
        </div>
        
        {/* Div 2: Botões de Público */}
        <div className="flex items-center justify-center gap-2 flex-wrap lg:flex-nowrap flex-shrink-0">
          <button
            onClick={() => onAddToCart(tour, 'adult')}
            className="flex items-center gap-1.5 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-sm font-medium text-blue-900 dark:text-blue-300 whitespace-nowrap"
          >
            <span>👨</span>
            <span>Adulto</span>
          </button>
          <button
            onClick={() => onAddToCart(tour, 'child')}
            className="flex items-center gap-1.5 py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-all text-sm font-medium text-green-900 dark:text-green-300 whitespace-nowrap"
          >
            <span>👶</span>
            <span>Criança</span>
          </button>
          <button
            onClick={() => onAddToCart(tour, 'native')}
            className="flex items-center gap-1.5 py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all text-sm font-medium text-amber-900 dark:text-amber-300 whitespace-nowrap"
          >
            <span>🏝️</span>
            <span>Nativo</span>
          </button>
        </div>
      </div>
    </div>
  );
};