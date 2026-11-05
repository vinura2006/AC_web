# PROJECT BRIEF: FrostNet Technologies Product Catalog Website

## 1. What we are building
A fast, modern, cyber-styled CATALOG website for a small seller. Visitors browse products, see price / discount / stock / specifications, and contact the seller on WhatsApp. There is NO online checkout. The seller/admin manages everything through a separate, login-protected admin panel.
First categories: Air Conditioners (AC) and Access Points (AP). Later: Switches, routers, and more. ADDING A NEW CATEGORY MUST NEVER REQUIRE A CODE CHANGE (see data model: category-defined spec fields).

## 2. Business constants
- Business name: FrostNet Technologies
- Tagline: Cooling and networking solutions, delivered
- WhatsApp number (digits only, international, no +): 94771234567
- Phone (display): +94 77 123 4567
- Email: info@frostnet.lk
- Address: No. 42 Galle Road, Colombo 03, Sri Lanka
- Opening hours: Mon to Sat, 9:00 AM to 6:00 PM
- Currency: code LKR, symbol Rs
- Timezone: Asia/Colombo
All of these live in the database table site_settings (editable in admin). They are only SEEDED from this list.

## 3. Goals, ranked
1. A customer finds any product in 2 clicks or one search.
2. Price, discount and stock are visible WITHOUT hover or extra clicks.
3. One-tap WhatsApp contact from every product and every page.
4. The seller can change a price or stock level in under 30 seconds.
5. Looks modern and cyber WITHOUT hurting readability or speed.

## 4. Tech stack (fixed; ask before adding any dependency and justify it)
- Node.js 20 LTS, Express 4, EJS templates (server-side rendered, good for SEO), express-ejs-layouts
- Tailwind CSS v3.4 via the Tailwind CLI (NOT v4). Vanilla JavaScript in /public/js (no front-end framework)
- Self-hosted fonts via @fontsource: Space Grotesk (headings), Inter (body), JetBrains Mono (numbers/specs)
- PostgreSQL with the `pg` driver. Plain SQL migration files (no ORM). Parameterised queries ONLY
- Validation: zod. Markdown-lite rendering: marked + sanitize-html
- Auth: express-session + connect-pg-simple, bcryptjs (cost 12), csrf-csrf, helmet, express-rate-limit, compression, morgan
- Uploads: multer (memory storage) + sharp (validate, strip EXIF, resize, convert to webp). Storage driver: "local" in dev (/public/uploads), "cloudinary" in production
- Tests: node:test + supertest. Lint: eslint
- Config via environment variables (dotenv in dev). Never hard-code secrets

## 5. Folder structure
src/
  server.js, app.js
  config/ (env.js, db.js)
  db/ (migrations/*.sql, migrate.js, seed-categories.js, seed-demo.js)
  lib/ (pricing.js, stock.js, whatsapp.js, slug.js, format.js, markdown.js, storage/)
  middleware/ (auth.js, csrf.js, security.js, settings.js, errors.js)
  services/ (products.js, categories.js, settings.js, offers.js, analytics.js)
  routes/public/*.js
  routes/admin/*.js
  views/ (layouts/, partials/, public/, admin/, errors/)
public/ (css/, js/, img/, uploads/ [gitignored])
tests/
docs/

## 6. Data model (PostgreSQL)
- categories: id, name, slug UNIQUE, description, icon (preset key), sort_order, is_active, spec_fields JSONB
  spec_fields = ordered array of { key, label, type: "text"|"number"|"boolean"|"select", unit, options[], filterable, show_on_card, show_in_table }
- products: id, category_id FK, name, slug UNIQUE, brand, model, short_description, description (markdown-lite), price NUMERIC(12,2), sale_price NUMERIC(12,2) NULL, offer_ends_at TIMESTAMPTZ NULL, is_weekly_offer BOOL, is_featured BOOL, stock_qty INT, low_stock_threshold INT DEFAULT 3, status ("draft"|"published"|"archived"), specs JSONB (values keyed by the category's spec field keys), warranty_text, search_vector tsvector (generated from name, brand, model, short_description), created_at, updated_at, created_by FK
- product_images: id, product_id FK, url, thumb_url, public_id (cloud id, nullable), alt_text, sort_order, is_primary
- price_history: id, product_id FK, old_price, new_price, old_sale_price, new_sale_price, changed_by FK, changed_at
- admin_users: id, name, email UNIQUE, password_hash, role ("owner"|"seller"), is_active, must_change_password, last_login_at, created_at
- site_settings: key PRIMARY KEY, value JSONB  (business_name, tagline, whatsapp_number, phone, email, address, hours, about_title, about_body, hero_title, hero_subtitle, currency_code, currency_symbol, timezone, show_exact_stock, whatsapp_message_template, social_links, logo_url)
- whatsapp_clicks: id, product_id (nullable), page, clicked_at
- session: table required by connect-pg-simple
- Indexes: products(status, category_id), products(is_weekly_offer) WHERE status='published', GIN(products.search_vector), GIN(products.specs), product_images(product_id, sort_order)

## 7. Business rules (implement ONCE in src/lib, reuse everywhere)
- Effective price: if sale_price IS NOT NULL AND sale_price < price AND (offer_ends_at IS NULL OR offer_ends_at > now) then the product is "on offer": current = sale_price, original = price, discount_percent = round((price - sale_price) / price * 100), savings = price - sale_price. Otherwise current = price.
- Stock label: qty = 0 -> "Out of stock" (red). qty <= low_stock_threshold -> "Only N left" (amber). Else "In stock" (green) and, if show_exact_stock is true, "In stock (N available)".
- Weekly offers = published products with a valid sale_price AND is_weekly_offer = true.
- Price format: Intl.NumberFormat, thousands separators, no decimals when .00, prefixed with the currency symbol. Example: Rs 189,000
- WhatsApp link: https://wa.me/<whatsapp_number>?text=<encodeURIComponent(message)>. Default message template: "Hi FrostNet Technologies, I'm interested in {product} ({price}). {url}". Tokens {product} {price} {url} are replaced server-side.
- Only status = "published" products are public. Drafts/archived return 404 publicly.

## 8. Public pages
/ (home), /products, /category/:slug, /product/:slug, /offers, /about, /contact, /api/search-suggest?q=, /robots.txt, /sitemap.xml, /healthz, themed 404 and 500.
Public site has NO customer accounts and NO cart.

## 9. Admin panel (separate login, noindex)
/admin/login, /admin (dashboard), /admin/products (+ new, edit), /admin/quick-edit (price/stock grid), /admin/offers, /admin/categories (owner only), /admin/settings (owner only), /admin/users (owner only), /admin/account (change password), /admin/logout.
Roles: owner = everything. seller = products, quick-edit, offers, own account.

## 10. Design system (cyber, but readable)
Colours: bg-base #070B14, surface #0E1626, elevated #141F36, border #1E2D4A, text #E6EDF7, muted #8FA3BF, primary (cyan) #22D3EE, secondary (violet) #8B5CF6, offer/discount (hot pink) #FF3D81, success #22C55E, warning #F59E0B, danger #EF4444, whatsapp #25D366.
Look: dark theme, subtle CSS grid-lines + radial cyan glow background, glass-style cards (translucent surface + 1px border), soft neon glow on hover/focus, small mono-font for spec values and prices. Icons are inline SVG (no emoji icons).
Motion: subtle only (hover glow, fade-up on scroll). Respect prefers-reduced-motion. NO heavy canvas/WebGL, NO autoplaying video.
Accessibility: WCAG AA contrast, visible cyan focus rings, semantic HTML, alt text, keyboard navigable, 44px minimum touch targets.
Mobile first: design at 360px, then scale up.

## 11. Conversion rules (these decide design trade-offs)
1. Discount badge + struck-through original price visible on every card, no hover needed.
2. Stock status always visible on cards and product page.
3. Cards show the top 3 specs (fields with show_on_card) as small chips; the product page shows the full table.
4. WhatsApp button is on every card (small), every product page (large, sticky bar on mobile) and floating on all other pages.
5. "Weekly Offers" is in the main nav with a highlight dot, and has a strip right under the home hero.
6. Filters always show active chips and a "Clear all" button.
7. Images lazy-loaded, webp, explicit width/height (no layout shift).

## 12. Security baseline
Parameterised SQL only. zod validation on every input. EJS escaping by default (<%- %> only for sanitised markdown output). CSRF on every state-changing request. Passwords bcrypt cost 12, min length 12. Session cookie httpOnly + sameSite=lax + secure in production. Login rate limiting. helmet with a strict CSP. Upload validation (type, size <= 5 MB, re-encode with sharp). No secrets in git. No stack traces in production responses.

## 13. NON-GOALS (do NOT build, even if it seems helpful)
Online payments, cart, checkout, order management, customer accounts/login, reviews/ratings, blog, multi-language, live-chat widgets, product comparison tool, email sending, push notifications.

## 14. Definition of done for every step
Runs with `npm run dev`; `npm run lint` and `npm test` pass; mobile (360px) and desktop (1440px) both look right; PROGRESS.md updated; verification steps listed for the human.
