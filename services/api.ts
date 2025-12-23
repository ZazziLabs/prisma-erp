import { supabase, isConfigured } from '../lib/supabaseClient';
import { Tour, Sale, SaleItem, DailyClosing, CartItem, PaymentMethod } from '../types';
import { handleError } from '../lib/errorHandler';


// Tours
export const getTours = async (): Promise<Tour[]> => {
  if (!isConfigured) return [];
  
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) handleError(error);
  return data || [];
};


export const saveTour = async (tour: Partial<Tour>): Promise<Tour | undefined> => {
  if (!isConfigured) handleError(new Error("Database not configured"));


  const tourData = { ...tour };
  if (!tourData.id) {
    delete tourData.id;
  }
  
  if (tourData.id) {
    const { data, error } = await supabase.from('tours').update(tourData).eq('id', tourData.id).select().single();
    if (error) handleError(error);
    return data;
  } else {
    const { data, error } = await supabase.from('tours').insert([tourData]).select().single();
    if (error) handleError(error);
    return data;
  }
};


export const deleteTour = async (id: string): Promise<void> => {
    if (!isConfigured) handleError(new Error("Database not configured"));
    const { error } = await supabase.from('tours').update({ active: false }).eq('id', id);
    if (error) handleError(error);
};


// Sales
export const createSale = async (cart: CartItem[], payments: { method1: PaymentMethod, value1: number, method2: PaymentMethod | null, value2: number | null }): Promise<Sale | undefined> => {
  if (!isConfigured) handleError(new Error("Database not configured"));
  
  const total = payments.value1 + (payments.value2 || 0);
  
  const { data: saleData, error: saleError } = await supabase.from('sales').insert([{
    total_amount: total,
    payment_method_1: payments.method1,
    payment_value_1: payments.value1,
    payment_method_2: payments.method2,
    payment_value_2: payments.value2,
  }]).select().single();


  if (saleError) handleError(saleError);
  if (!saleData) handleError(new Error("Failed to create sale"));


  const items = cart.map(item => ({
    sale_id: saleData.id,
    tour_id: item.tourId,
    qty_adult: item.qtyAdult,
    qty_child: item.qtyChild,
    qty_native: item.qtyNative,
    unit_price_adult: item.priceAdult,
    unit_price_child: item.priceChild,
    unit_price_native: item.priceNative
  }));


  const { error: itemsError } = await supabase.from('sale_items').insert(items);
  if (itemsError) {
    await supabase.from('sales').delete().eq('id', saleData.id);
    handleError(itemsError);
  }
  
  return saleData;
};


export const getTodaySales = async (): Promise<Sale[]> => {
  if (!isConfigured) return [];


  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: false });
  
  if (error) handleError(error);
  return data || [];
};


export const getSalesByDate = async (date: string): Promise<Sale[]> => {
  if (!isConfigured) return [];

  // Ajusta a data para garantir que a consulta pegue o dia inteiro no fuso horário local
  const startDate = new Date(date);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setUTCHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*, tours(name, icon))') // Adicionado 'icon'
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });
  
  if (error) handleError(error);
  return data || [];
};


// **NOVA FUNÇÃO**: Verifica se o dia já foi fechado
export const checkIfDayIsClosed = async (date: string): Promise<boolean> => {
  if (!isConfigured) return false;
  
  const { data, error } = await supabase
    .from('daily_closings')
    .select('id')
    .eq('date', date)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao verificar fechamento:', error);
    return false;
  }

  return !!data;
};


// Closing
export const closeDay = async (summary: Omit<DailyClosing, 'id' | 'created_at'>): Promise<void> => {
  if (!isConfigured) {
    throw new Error("Banco de dados não configurado");
  }

  // Check if already closed
  const { data: existing, error: existingError } = await supabase
    .from('daily_closings')
    .select('id')
    .eq('date', summary.date)
    .maybeSingle();
  
  if (existingError && existingError.code !== 'PGRST116') {
    console.error('Erro ao verificar fechamento:', existingError);
    throw new Error(`Erro ao verificar fechamento: ${existingError.message}`);
  }
  
  if (existing) {
    throw new Error("O caixa para esta data já foi fechado.");
  }

  // Insere com user_id
  const { data: insertedData, error: insertError } = await supabase
    .from('daily_closings')
    .insert([{
      ...summary
    }])
    .select()
    .single();
  
  if (insertError) {
    console.error('Erro ao inserir fechamento:', insertError);
    throw new Error(`Erro ao fechar caixa: ${insertError.message}`);
  }

  if (!insertedData) {
    throw new Error("Falha ao confirmar fechamento do caixa");
  }

  // Sucesso - não lança erro
  console.log('Caixa fechado com sucesso:', insertedData);
};


export const getClosings = async (): Promise<DailyClosing[]> => {
  if (!isConfigured) return [];
  
  const { data, error } = await supabase.from('daily_closings').select('*').order('date', { ascending: false });
  if (error) handleError(error);
  return data || [];
};
