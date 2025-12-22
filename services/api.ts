import { supabase, isConfigured } from '../lib/supabaseClient';
import { Tour, Sale, SaleItem, DailyClosing, CartItem, PaymentMethod } from '../types';

// Helper to handle errors uniformly
const handleError = (error: any) => {
  console.error("API Error:", error);
  throw new Error(error.message || "An unknown error occurred");
};

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

export const saveTour = async (tour: Partial<Tour>): Promise<Tour> => {
  if (!isConfigured) throw new Error("Database not configured");

  if (tour.id) {
    const { data, error } = await supabase.from('tours').update(tour).eq('id', tour.id).select().single();
    if (error) handleError(error);
    return data;
  } else {
    const { data, error } = await supabase.from('tours').insert([tour]).select().single();
    if (error) handleError(error);
    return data;
  }
};

export const deleteTour = async (id: string): Promise<void> => {
    if (!isConfigured) throw new Error("Database not configured");
    // Soft delete
    const { error } = await supabase.from('tours').update({ active: false }).eq('id', id);
    if (error) handleError(error);
};

// Sales
export const createSale = async (cart: CartItem[], payments: { method1: PaymentMethod, value1: number, method2: PaymentMethod | null, value2: number | null }): Promise<void> => {
  if (!isConfigured) throw new Error("Database not configured");

  const total = payments.value1 + (payments.value2 || 0);
  
  const { data: saleData, error: saleError } = await supabase.from('sales').insert([{
    total_amount: total,
    payment_method_1: payments.method1,
    payment_value_1: payments.value1,
    payment_method_2: payments.method2,
    payment_value_2: payments.value2
  }]).select().single();

  if (saleError) handleError(saleError);

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
  if (itemsError) handleError(itemsError);
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

  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*, tours(name))')
    .gte('created_at', `${date}T00:00:00`)
    .lte('created_at', `${date}T23:59:59`);
  
  if (error) handleError(error);
  return data || [];
};

// Closing
export const closeDay = async (summary: DailyClosing): Promise<void> => {
   if (!isConfigured) throw new Error("Database not configured");

   // Check if already closed
   const { data: existing } = await supabase.from('daily_closings').select('id').eq('date', summary.date).single();
   if (existing) throw new Error("Dia já fechado.");

   const { error } = await supabase.from('daily_closings').insert([summary]);
   if (error) handleError(error);
};

export const getClosings = async (): Promise<DailyClosing[]> => {
    if (!isConfigured) return [];
    
    const { data, error } = await supabase.from('daily_closings').select('*').order('date', { ascending: false });
    if (error) handleError(error);
    return data || [];
};
