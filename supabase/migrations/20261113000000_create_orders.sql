-- INIDA orders table.
-- Written ONLY by the create-order Edge Function (service role).
-- The browser's anon/publishable key can neither read nor write this table.

create table if not exists public.orders (
  id                   uuid        primary key default gen_random_uuid(),
  order_code           text        not null unique,             -- public ID, e.g. IND-8492
  payment_reference    text        not null unique,             -- Paystack reference (idempotency key)
  status               text        not null default 'pending'
                                   check (status in ('pending', 'delivered')),
  fulfillment          text        not null check (fulfillment in ('delivery', 'pickup')),

  customer_name        text        not null,
  customer_phone       text        not null,                    -- WhatsApp number

  delivery_zone_id     text,
  delivery_zone_label  text,
  delivery_address     text,
  delivery_landmark    text,

  -- [{productId, name, variantId, variantLabel, sizeId, sizeLabel, unitPrice, quantity, lineTotal}]
  items                jsonb       not null check (jsonb_typeof(items) = 'array'),

  subtotal             integer     not null check (subtotal >= 0),       -- Naira
  delivery_fee         integer     not null default 0 check (delivery_fee >= 0),
  total                integer     not null check (total = subtotal + delivery_fee),
  amount_paid_kobo     bigint      not null check (amount_paid_kobo = total::bigint * 100),
  paid_at              timestamptz,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint delivery_fields_present check (
    fulfillment = 'pickup'
    or (delivery_zone_id is not null and delivery_address is not null and delivery_landmark is not null)
  )
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Keep updated_at fresh on status changes.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Row Level Security ON with NO policies: anon/authenticated get zero access.
-- The service role (Edge Function) bypasses RLS. Admin read/update policies
-- are added in the admin-panel milestone.
alter table public.orders enable row level security;

-- Realtime feed for the admin panel (events still respect RLS).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;
