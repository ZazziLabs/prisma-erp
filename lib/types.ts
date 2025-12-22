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
-- 1. Tabela de Passeios (Tours)
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

-- 2. Tabela de Vendas (Sales)
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

-- 3. Tabela de Itens da Venda (Sale Items)
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

-- 4. Tabela de Fechamentos Diários (Daily Closings)
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

-- Habilita Row Level Security e cria políticas de acesso
alter table tours enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table daily_closings enable row level security;

create policy "Allow all for authenticated users" on tours for all to authenticated using (true);
create policy "Allow all for authenticated users" on sales for all to authenticated using (true);
create policy "Allow all for authenticated users" on sale_items for all to authenticated using (true);
create policy "Allow all for authenticated users" on daily_closings for all to authenticated using (true);
*/
