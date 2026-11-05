-- 001_initial_schema.sql
-- FrostNet Technologies Data Model (Step 3)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Schema migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100) DEFAULT 'snowflake',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  spec_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'seller' CHECK (role IN ('owner', 'seller')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  sale_price NUMERIC(12,2) CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price < price)),
  offer_ends_at TIMESTAMPTZ,
  is_weekly_offer BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  warranty_text VARCHAR(255),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(model, '') || ' ' || coalesce(short_description, ''))
  ) STORED,
  created_by INT REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for auto updating updated_at on products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Product Images table
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  public_id VARCHAR(255),
  alt_text VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Price History table
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price NUMERIC(12,2) NOT NULL,
  new_price NUMERIC(12,2) NOT NULL,
  old_sale_price NUMERIC(12,2),
  new_sale_price NUMERIC(12,2),
  changed_by INT REFERENCES admin_users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. WhatsApp Clicks Analytics
CREATE TABLE IF NOT EXISTS whatsapp_clicks (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  page VARCHAR(255) NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Connect PG Simple session table
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- 10. Indexes as specified in PROJECT_BRIEF.md
CREATE INDEX IF NOT EXISTS idx_products_status_category ON products(status, category_id);
CREATE INDEX IF NOT EXISTS idx_products_weekly_offers ON products(is_weekly_offer) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_specs ON products USING GIN(specs);
CREATE INDEX IF NOT EXISTS idx_product_images_product_sort ON product_images(product_id, sort_order);

