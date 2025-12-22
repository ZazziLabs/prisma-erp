export interface Tour {
  id: string;
  name: string;
  type: string;
  price_adult: number;
  price_child: number;
  price_native: number;
  icon: string;
  active: boolean;
}

export interface Sale {
  id: string;
  created_at: string;
  total_amount: number;
  payment_method_1: PaymentMethod;
  payment_value_1: number;
  payment_method_2: PaymentMethod | null;
  payment_value_2: number | null;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  tour_id: string;
  qty_adult: number;
  qty_child: number;
  qty_native: number;
  unit_price_adult: number;
  unit_price_child: number;
  unit_price_native: number;
}

export interface DailyClosing {
    id: string;
    created_at: string;
    date: string;
    total_amount: number;
    total_cash: number;
    total_pix: number;
    total_debit: number;
    total_credit: number;
    sale_count: number;
    user_id?: string; // Adicionado
}

export interface CartItem {
  tourId: string;
  tourName: string;
  tourIcon: string;
  qtyAdult: number;
  qtyChild: number;
  qtyNative: number;
  priceAdult: number;
  priceChild: number;
  priceNative: number;
}

export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO';
