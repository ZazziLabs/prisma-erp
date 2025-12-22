export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO';

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

export interface SaleItem {
  id?: string;
  sale_id: string;
  tour_id: string;
  qty_adult: number;
  qty_child: number;
  qty_native: number;
  unit_price_adult: number;
  unit_price_child: number;
  unit_price_native: number;
}

export interface Sale {
  id: string;
  created_at: string;
  total_amount: number;
  payment_method_1: PaymentMethod;
  payment_value_1: number;
  payment_method_2: PaymentMethod | null;
  payment_value_2: number | null;
  status: 'COMPLETED'; // Simplified for this scope
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
}

// SQL Schema for reference (run this in Supabase SQL Editor):
/*
create table tours (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null,
  price_adult numeric default 0,
  price_child numeric default 0,
  price_native numeric default 0,
  icon text,
  active boolean default true,
  created_at timestamptz default now()
);

create table sales (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  total_amount numeric not null,
  payment_method_1 text not null,
  payment_value_1 numeric not null,
  payment_method_2 text,
  payment_value_2 numeric,
  status text default 'COMPLETED'
);

create table sale_items (
  id uuid default gen_random_uuid() primary key,
  sale_id uuid references sales(id) on delete cascade,
  tour_id uuid references tours(id),
  qty_adult int default 0,
  qty_child int default 0,
  qty_native int default 0,
  unit_price_adult numeric default 0,
  unit_price_child numeric default 0,
  unit_price_native numeric default 0
);

create table daily_closings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  date date not null unique,
  total_amount numeric default 0,
  total_cash numeric default 0,
  total_pix numeric default 0,
  total_debit numeric default 0,
  total_credit numeric default 0,
  sale_count int default 0
);
*/
