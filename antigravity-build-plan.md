# Antigravity Build Plan: Product Catalog Website (Air Conditioners + Access Points)

One file, 17 steps (0 to 16). Paste **one step per Antigravity chat**, check the result, commit, move on.

---

## How this works (read first)

Think of it as building a physical shop. Mnemonic: **S.H.O.P.**

| Phase | Steps | Shop analogy | What you get |
|---|---|---|---|
| **S**etup | 0 to 3 | Foundation + wiring | Tools, rules, project skeleton, database |
| **H**ome-front | 4 to 8 | Shop window and shelves | Everything customers see: home, catalog, product page, offers, about, contact |
| **O**ffice | 9 to 12 | Back office with a locked door | Admin/seller panel with its own login |
| **P**ublish | 13 to 16 | Locks, inspection, opening day | Security, QA, deployment, handover |

### Rules of the game (they save your free quota)

1. **One step = one new chat.** The project's memory lives on disk in `PROJECT_BRIEF.md`, `PROGRESS.md` and `.agent/rules/`, not in the chat, so a fresh chat loses nothing.
2. **Planning mode** for big steps (marked below), **Fast mode** for small fixes. In Planning mode, read the Implementation Plan artifact and comment on it *before* approving. Cheap to fix a plan, expensive to fix code.
3. **Verify, then commit.** Each step ends with "Check it yourself" items. Do them. Then:
   `git add -A && git commit -m "<message shown in the step>"`
   The agent is told never to run git, so you always have a clean rollback point.
4. **Free tier is rate-limited.** If you hit the limit mid-step, stop, wait for reset or switch model in the dropdown, then use the **Resume prompt** (Appendix A). Do not start the step over.
5. Do not skip ahead. Every step assumes the earlier ones are done and committed.
6. Everything you must customise is written as `[[LIKE_THIS]]`. Fill the sheet below once, before Step 1.

### Fill-in sheet (do this before Step 1)

| Placeholder | Your value | Notes |
|---|---|---|
| `[[BUSINESS_NAME]]` | | Shown in header, footer, WhatsApp message |
| `[[TAGLINE]]` | | One line, e.g. "Cooling and networking, delivered" |
| `[[WHATSAPP_NUMBER]]` | | Digits only, international format, no `+`, no spaces. Example: `94771234567` |
| `[[PHONE]]` | | Display format, e.g. `+94 77 123 4567` |
| `[[EMAIL]]` | | Optional |
| `[[ADDRESS]]` | | Shown on Contact and footer |
| `[[HOURS]]` | | e.g. `Mon to Sat, 9:00 AM to 6:00 PM` |
| `[[CURRENCY_CODE]]` / `[[CURRENCY_SYMBOL]]` | `LKR` / `Rs` | Change if you sell in another currency |
| `[[TIMEZONE]]` | `Asia/Colombo` | Used for offer countdowns and "last updated" |

---

## Step 0: Install and configure (manual, no prompt)

**Mode:** n/a. **Time:** 20 minutes.

1. Install: Antigravity (from Google's official site), **Node.js 20 LTS**, **Git**, **PostgreSQL 15+** (local), and Google Chrome (the Antigravity browser agent uses it to test your site).
2. Sign in to Antigravity with a personal Google account. In the setup wizard choose a **review-driven** policy (agent asks before risky terminal commands). You can loosen it later.
3. Create the local database: `createdb catalog_dev` (or use pgAdmin). Note your connection string, e.g. `postgres://postgres:password@localhost:5432/catalog_dev`.
4. Create the project:
   ```
   mkdir catalog-site
   cd catalog-site
   git init
   ```
5. Open the `catalog-site` folder as the workspace in Antigravity.
6. In the chat box set **Planning mode** and pick the strongest model you have quota for.

**Check it yourself:** `node -v` shows v20.x, `git --version` works, `psql -l` lists `catalog_dev`.

---

## Step 1: Project brief + rules (the project's permanent memory)

**Mode:** Fast. **Commit:** `step 1: project brief and agent rules`

Before pasting: replace every `[[PLACEHOLDER]]` in the text with your values from the sheet.

```text
Create exactly these files in the workspace root. Do not create anything else, do not install anything, do not write application code yet. Copy the content EXACTLY as written (after the file markers), except keep any [[PLACEHOLDER]] I have already replaced.

=== FILE: PROJECT_BRIEF.md ===
# PROJECT BRIEF: [[BUSINESS_NAME]] Product Catalog Website

## 1. What we are building
A fast, modern, cyber-styled CATALOG website for a small seller. Visitors browse products, see price / discount / stock / specifications, and contact the seller on WhatsApp. There is NO online checkout. The seller/admin manages everything through a separate, login-protected admin panel.
First categories: Air Conditioners (AC) and Access Points (AP). Later: Switches, routers, and more. ADDING A NEW CATEGORY MUST NEVER REQUIRE A CODE CHANGE (see data model: category-defined spec fields).

## 2. Business constants
- Business name: [[BUSINESS_NAME]]
- Tagline: [[TAGLINE]]
- WhatsApp number (digits only, international, no +): [[WHATSAPP_NUMBER]]
- Phone (display): [[PHONE]]
- Email: [[EMAIL]]
- Address: [[ADDRESS]]
- Opening hours: [[HOURS]]
- Currency: code [[CURRENCY_CODE]], symbol [[CURRENCY_SYMBOL]]
- Timezone: [[TIMEZONE]]
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
- WhatsApp link: https://wa.me/<whatsapp_number>?text=<encodeURIComponent(message)>. Default message template: "Hi [[BUSINESS_NAME]], I'm interested in {product} ({price}). {url}". Tokens {product} {price} {url} are replaced server-side.
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
=== END FILE ===

=== FILE: PROGRESS.md ===
# Progress log
(Append one short entry per completed step: date, step number, what was built, how to run/verify, known issues, next step.)
=== END FILE ===

=== FILE: .agent/rules/project.md ===
# Always-on project rules
1. Before ANY task, read PROJECT_BRIEF.md and PROGRESS.md.
2. Do ONLY the current step I give you. Do not build later steps. Do not add features listed under NON-GOALS.
3. Use only the stack in PROJECT_BRIEF.md. If you believe a new dependency is needed, stop and ask first, with the reason.
4. Security: parameterised SQL only, zod validation on all input, every /admin route behind auth middleware, never log secrets or passwords, never commit .env.
5. Never run destructive commands (rm -rf, DROP DATABASE, git reset --hard, force push) without asking me first.
6. Do NOT run git commit/push. I commit manually after verifying.
7. When finished: run lint and tests, update PROGRESS.md, then give me a short numbered list of how to verify the work myself.
8. Keep code simple and commented where the logic is non-obvious. Prefer small files and reusable partials/helpers over duplication.
9. Mobile-first and accessible by default.
=== END FILE ===

Also create .gitignore (node_modules, .env, public/uploads, public/css/output.css, coverage, .DS_Store, *.log) and .env.example with these keys and NO real values: NODE_ENV, PORT, DATABASE_URL, SESSION_SECRET, STORAGE_DRIVER (local|cloudinary), CLOUDINARY_URL, SITE_URL, TIMEZONE.

When done, list the files you created. Nothing else.
```

**Check it yourself:** the 5 files exist, `PROJECT_BRIEF.md` has your real business details, no `[[` placeholders left (search the project for `[[`).

> Folder note: some Antigravity builds use `.agents/` instead of `.agent/`. If the Customizations/Rules panel shows `.agents/rules/`, move `project.md` there.

---

## Step 2: Scaffold the app

**Mode:** Planning. **Commit:** `step 2: express + ejs + tailwind scaffold`

```text
Follow the always-on rules. Current task: STEP 2, project scaffold only.

1. Initialise npm and install the stack from PROJECT_BRIEF.md section 4 (runtime and dev dependencies). Pin Tailwind to v3.4. Add "engines": {"node": ">=20"}.
2. Create the folder structure from section 5 (empty folders get a .gitkeep).
3. src/config/env.js: load and validate env vars with zod (fail fast with a clear message). src/config/db.js: a pg Pool (ssl enabled only when DATABASE_URL contains sslmode=require or NODE_ENV=production).
4. src/app.js builds the Express app: trust proxy = 1 in production, compression, morgan, static files from /public, EJS with express-ejs-layouts, body parsers with size limits. src/server.js starts it.
5. Routes: GET /healthz (JSON {ok:true, db:true/false} - actually query the database), and GET / returning a simple placeholder page using a layout, so I can see EJS + Tailwind working.
6. Tailwind: tailwind.config.js with content globs for src/views/**/*.ejs and public/js/**/*.js, input file public/css/input.css, output public/css/output.css. Add the colour tokens from PROJECT_BRIEF.md section 10 under theme.extend.colors and the three font families. Import the @fontsource packages' CSS into the build (copy font files into /public/fonts at build time with a small script, so fonts are self-hosted).
7. npm scripts: dev (nodemon + tailwind watch running together), build:css, start, lint, test, migrate, seed:categories, seed:demo, create-admin (the last four can be stubs that print "not implemented yet").
8. A minimal eslint config and one passing test for /healthz (node:test + supertest).
9. Write a short README.md with setup instructions (install, copy .env.example to .env, create the DB, npm run dev).
10. Update PROGRESS.md.
```

**Check it yourself:** `cp .env.example .env` and fill `DATABASE_URL` + a random `SESSION_SECRET` → `npm install` → `npm run dev` → open `http://localhost:3000` (styled placeholder) and `/healthz` (`db: true`). `npm test` passes.

---

## Step 3: Database schema, migrations, seed data

**Mode:** Planning. **Commit:** `step 3: schema, migrations, seeds`

```text
Follow the always-on rules. Current task: STEP 3, database only. No UI work.

1. Write plain SQL migrations in src/db/migrations (numbered 001_, 002_, ...) implementing EXACTLY the data model in PROJECT_BRIEF.md section 6, including constraints (CHECK price >= 0, sale_price < price when not null, stock_qty >= 0, status/role enums via CHECK), foreign keys with sensible ON DELETE behaviour, updated_at trigger for products, the generated tsvector column + GIN indexes, and all listed indexes. Add a thumb_url column to product_images.
2. src/db/migrate.js: a tiny migration runner that tracks applied files in a schema_migrations table, runs each migration in a transaction, is idempotent, and prints what it did. `npm run migrate` runs it.
3. src/db/seed-categories.js (PRODUCTION-SAFE, idempotent, upserts by slug): creates two categories with spec_fields presets.
   - "Air Conditioners" (slug air-conditioners): fields such as type (select: Split, Window, Cassette, Portable), capacity_btu (number, unit BTU, filterable, show_on_card), inverter (boolean, filterable, show_on_card), energy_rating (select), refrigerant (select: R32, R410A, R22), room_size (text), power_consumption_w (number), noise_db (number), wifi_control (boolean), voltage (text).
   - "Access Points" (slug access-points): wifi_standard (select: Wi-Fi 5, Wi-Fi 6, Wi-Fi 6E, Wi-Fi 7; filterable, show_on_card), bands (select: Dual-band, Tri-band), max_speed_mbps (number, unit Mbps, show_on_card), poe (select: None, 802.3af, 802.3at, 802.3bt, Passive; filterable), ethernet_ports (text), mounting (select: Ceiling, Wall, Desk), max_clients (number), management (select: Standalone, Controller, Cloud; filterable), environment (select: Indoor, Outdoor; filterable), antennas (text).
   It also seeds default site_settings rows from the environment-independent defaults in PROJECT_BRIEF.md section 2 (use the real values written there).
4. src/db/seed-demo.js (DEVELOPMENT ONLY - refuse to run if NODE_ENV=production): 6 AC and 6 AP products with CLEARLY FAKE names (e.g. "Demo Inverter Split AC 12000 BTU"), realistic specs matching the spec_fields, a mix of prices, some with sale_price + offer_ends_at in the future (mark 4 as is_weekly_offer), some low stock, one out of stock, one draft. Generate 2 placeholder images per product as local SVG gradient files saved to public/uploads/demo/ (no external downloads) and insert product_images rows.
5. src/lib/pricing.js, src/lib/stock.js, src/lib/format.js, src/lib/whatsapp.js implementing the business rules in section 7, each with unit tests in /tests (edge cases: sale price expired, sale price >= price, qty exactly at threshold, number with and without decimals, message tokens replaced and URL-encoded).
6. src/services/products.js and categories.js with basic read functions (getPublishedProducts with filters stub, getProductBySlug, getCategories). Parameterised SQL only.
7. Update README and PROGRESS.md.
```

**Check it yourself:** run `npm run migrate` twice (second run says nothing to do) → `npm run seed:categories` → `npm run seed:demo` → in psql: `select name, price, sale_price, stock_qty from products;` shows 12 rows. `npm test` passes.

---

## Step 4: Design system + layout (the cyber look lives here)

**Mode:** Planning. **Commit:** `step 4: design system and layout`

```text
Follow the always-on rules. Current task: STEP 4, design system + global layout. No page content yet except a dev-only style guide.

Build the visual foundation using PROJECT_BRIEF.md sections 10 and 11.

1. Tailwind layer (public/css/input.css): CSS variables for the tokens; a body background made of (a) a subtle 40px CSS grid-line pattern at very low opacity and (b) one or two large blurred radial glows (cyan top-left, violet bottom-right), fixed, performant (no heavy filters on scroll). Component classes via @layer components: .btn (primary cyan, secondary outline, ghost, whatsapp green, danger), .card (glass surface), .badge (discount pink, stock green/amber/red, offer, neutral), .chip, .input/.select, .section-title (with a small cyan accent line), .skeleton, .container-page. Hover states with soft glow, focus-visible cyan ring.
2. Layout views: src/views/layouts/public.ejs with SEO-ready head (title, description, canonical, Open Graph, theme-color), the header, main, footer, floating WhatsApp button, and script includes.
3. Header partial: wordmark text logo using business_name with a subtle glow (or logo_url if set in settings), nav links: Home, Products (dropdown or mega-menu listing all active categories, loaded from DB), Weekly Offers (with a pulsing pink dot), About, Contact. Search box in the header (desktop) / full-width under the header (mobile), with a clear button. Sticky header that stays slim on scroll. Mobile: hamburger opens a full-height drawer (focus-trapped, Esc to close) containing the same links, categories, and a big WhatsApp button.
4. Footer partial: business name + tagline, quick links, categories, contact block (WhatsApp, phone, email, address, hours) read from settings, copyright.
5. Floating WhatsApp button: bottom-right, 56px, official #25D366, subtle pulse, aria-label, opens the wa.me link with the default message. Hidden on product pages on mobile (a sticky bar will be used there in a later step) - expose a layout variable to toggle it.
6. src/middleware/settings.js: loads site_settings (cached in memory, 60s TTL + invalidate function) and categories into res.locals for every public request. Include helpers in res.locals: formatPrice, pricing, stockLabel, waLink.
7. Partials: icons.ejs (inline SVG set: search, menu, close, phone, mail, map-pin, clock, tag, bolt, shield, truck, wrench, snowflake, wifi, router, chevron, check, whatsapp, filter, arrow-right), product-card.ejs (props: product; image with lazy loading, discount badge top-left, stock badge, brand, name (2-line clamp), up to 3 spec chips from show_on_card fields, price block with struck-through original, small WhatsApp button + "View details" link; entire card is a link), section-header.ejs, empty-state.ejs, pagination.ejs, breadcrumb.ejs.
8. A dev-only route GET /_styleguide (only when NODE_ENV !== 'production') that renders every component and product-card variants (on offer, normal, low stock, out of stock) using demo data.
9. Small JS in public/js/ui.js: mobile drawer, dropdown, scroll-reveal using IntersectionObserver (disabled under prefers-reduced-motion).

Keep every page crisp at 360px wide. Update PROGRESS.md.
```

**Check it yourself:** open `/_styleguide` on desktop and in Chrome DevTools mobile view (360px). Header, drawer, floating WhatsApp, cards all look right. Tab through with the keyboard: focus rings visible. Click the WhatsApp button: opens a chat link with your number and a prefilled message.

---

## Step 5: Home page

**Mode:** Planning. **Commit:** `step 5: home page`

```text
Follow the always-on rules. Current task: STEP 5, the public home page (GET /). Real data from the database, no hard-coded products.

Sections in this exact order:
1. HERO: headline from settings.hero_title (default: "[[TAGLINE]]"), subtitle, a LARGE search bar (submits to /products?q=), quick category chips (from DB), two CTAs: "View Weekly Offers" (primary, pink-accent) and "Chat on WhatsApp" (green). Cyber feel: subtle animated glow line or grid pulse, CSS only, reduced-motion safe. No hero image needed.
2. WEEKLY OFFERS STRIP directly under the hero: horizontally scrollable row (scroll-snap) of up to 8 offer product cards, a section header with "Ends in 02d 14h 33m" countdown to the soonest offer_ends_at (JS countdown in public/js/countdown.js, server renders the initial text so it works without JS), and a "See all offers" link. Hide the whole section if there are no active offers.
3. SHOP BY CATEGORY: large tiles for each active category (icon, name, product count, short description, hover glow) linking to /category/:slug.
4. FEATURED PRODUCTS: grid of up to 8 products with is_featured = true (fall back to newest published if fewer than 4 featured). Grid: 1 column at 360px? NO - use 2 columns on mobile with compact cards, 3 on tablet, 4 on desktop.
5. WHY BUY FROM US: 4 trust points with icons (Genuine products, Warranty-backed, Expert advice on WhatsApp, Installation support). Static copy, professional, no false claims - keep wording generic and easy for the owner to edit later.
6. CONTACT BAND: big WhatsApp button, phone, address, hours.

Add a services/products.js function getHomeData() that fetches everything in as few queries as possible (no N+1). Include primary image + thumb for each card. Update PROGRESS.md.
```

**Check it yourself:** the offers strip shows the demo offers with struck-through prices and pink % badges; countdown ticks; with all offers removed in psql the strip disappears; page is usable at 360px.

---

## Step 6: Catalog listing, filters, search

**Mode:** Planning. **Commit:** `step 6: catalog listing, filters, search`

```text
Follow the always-on rules. Current task: STEP 6, product listing + filters + search.

Routes: GET /products and GET /category/:slug (same template; category route pre-selects the category and shows its description). All state lives in the query string so pages are shareable.

Query params: q, category, brand (multi), min_price, max_price, in_stock=1, on_offer=1, sort (relevance | newest | price_asc | price_desc | discount), page, plus dynamic spec filters named spec_<key> for every spec field marked filterable in the selected category (select -> multi checkbox, boolean -> Yes/Any toggle, number -> min/max). Validate all with zod; ignore unknown params safely.

Requirements:
1. Search: PostgreSQL full-text (websearch_to_tsquery on search_vector) combined with an ILIKE fallback on name/brand/model so partial words like "inver" and model numbers still match. Relevance sorting uses ts_rank. Sanitise the query.
2. Filtering is done in SQL with parameterised queries. Spec filters use the JSONB specs column. Build the query safely (whitelist column names; never interpolate user input).
3. Desktop: sticky left sidebar of filters. Mobile: a "Filters" button opening a bottom sheet with Apply and Clear all. Show result count and the sort dropdown above the grid.
4. Active filters shown as removable chips above the grid, plus "Clear all".
5. Brand and spec option lists show counts for the current category (cheap, one query).
6. Pagination: 12 per page, SEO-friendly links, rel prev/next.
7. Header search suggestions: GET /api/search-suggest?q= returns up to 6 results (name, slug, price info, thumb) as JSON, rate-limited, debounced 200ms in public/js/search.js, keyboard navigable (arrow keys, Enter, Esc), accessible (combobox roles).
8. Empty state: friendly message + "Can't find it? Ask us on WhatsApp" button with a prefilled message containing the search text.
9. Out-of-stock products are shown (greyed badge) but sorted last unless the user sorts explicitly.
10. Add tests for the filter query builder (several combinations) and for the suggest endpoint.

Update PROGRESS.md.
```

**Check it yourself:** try `q=inverter`, `/category/access-points` with Wi-Fi 6 + PoE filters, price range, sort by discount, an empty search (WhatsApp fallback appears), mobile filter sheet, and copy a filtered URL into a new tab (same results).

---

## Step 7: Product detail page

**Mode:** Planning. **Commit:** `step 7: product detail page`

```text
Follow the always-on rules. Current task: STEP 7, GET /product/:slug.

Layout (desktop): left = image gallery, right = buy panel; below = tabs/sections for Specifications and Description; then Related products.

1. Breadcrumb: Home > Category > Product.
2. Gallery: large main image + thumbnails, click/tap to change, swipe on mobile, click main image to open a simple accessible lightbox (Esc to close, arrow keys). Lazy-load thumbs, eager-load the first image, explicit dimensions.
3. Buy panel: brand + model, H1 name, price block (big sale price, struck-through original, pink "-X%" badge, "You save Rs Y"), offer countdown if offer_ends_at is set, stock badge (per business rules), short description, warranty line, and the primary action: a large green "Ask on WhatsApp" button that opens wa.me with the template message (product name, price, page URL). A secondary "Call us" button (tel: link) and a "Copy link" button.
4. "Price last updated: <date>" taken from price_history (latest row), formatted in the configured timezone. Builds trust.
5. Specifications: table built from the category's spec_fields in order (label, value + unit; booleans as Yes/No with a check icon; skip empty values). Group visually with zebra rows; mono font for values.
6. Description: render markdown-lite through marked + sanitize-html (allow p, ul, ol, li, strong, em, br, h3, h4, a with rel=noopener). Put the rendering helper in src/lib/markdown.js with tests that script tags and event handlers are stripped.
7. Mobile: a sticky bottom bar showing current price + WhatsApp button (the floating WhatsApp button is hidden on this page).
8. Related products: up to 4 from the same category (prefer same brand), using product-card.
9. SEO: <title> "Name | Brand | [[BUSINESS_NAME]]", meta description, canonical, Open Graph with the primary image, JSON-LD Product schema including offers (price, priceCurrency, availability InStock/OutOfStock, priceValidUntil when an offer end exists).
10. Draft/archived/non-existent slugs -> themed 404.
11. Fire-and-forget WhatsApp click tracking: public/js/track.js sends navigator.sendBeacon to POST /api/track/whatsapp with {slug, page} when any WhatsApp button is clicked. Endpoint is rate-limited (30/min/IP), validates input with zod, inserts into whatsapp_clicks.

Update PROGRESS.md.
```

**Check it yourself:** open an on-offer product, a low-stock one, an out-of-stock one (button changes to "Ask availability"), a draft slug (404). Click WhatsApp and verify the message text. View page source: JSON-LD present. Check `whatsapp_clicks` rows appear.

---

## Step 8: Offers, About, Contact, SEO basics

**Mode:** Fast. **Commit:** `step 8: offers, about, contact, seo`

```text
Follow the always-on rules. Current task: STEP 8, four small public pages plus SEO plumbing.

1. GET /offers: page hero "Weekly Offers" with a big countdown to the soonest offer_ends_at, category filter chips, sort by biggest discount by default, grid of weekly-offer products (rules in PROJECT_BRIEF.md section 7). Empty state: "No offers right now, check back soon" with a WhatsApp button asking about upcoming deals.
2. GET /about: title and body from settings.about_title / about_body (markdown-lite rendered safely), plus the 4 trust points, business info card (address, hours, "Open in Google Maps" link built from the address, no embedded map iframe).
3. GET /contact: large WhatsApp card, call card, email card (if set), address and hours. Add a "Send us a message" form (name + message) that does NOT post to a server: JS builds a wa.me link with the typed text and opens WhatsApp. It must work without JS by falling back to a plain link.
4. Themed 404 and 500 pages (views/errors) matching the design, with search box and links to categories and offers. src/middleware/errors.js handles both; never leak stack traces when NODE_ENV=production.
5. SEO plumbing: dynamic /sitemap.xml (home, static pages, categories, published products with lastmod), /robots.txt (allow all, disallow /admin, link the sitemap), per-page unique title + meta description, canonical URLs, a default Open Graph image (generate a simple SVG/PNG in public/img), SITE_URL from env.

Update PROGRESS.md.
```

**Check it yourself:** `/offers`, `/about`, `/contact`, `/sitemap.xml`, `/robots.txt`, and a nonsense URL (themed 404).

---

## Step 9: Admin authentication and roles

**Mode:** Planning. **Commit:** `step 9: admin auth and roles`

```text
Follow the always-on rules. Current task: STEP 9, admin login system and admin shell. No product management yet.

1. Sessions: express-session with connect-pg-simple, cookie name "admin.sid", httpOnly, sameSite lax, secure in production, 8-hour rolling idle timeout. Regenerate the session on login (prevents fixation). SESSION_SECRET from env.
2. CSRF: csrf-csrf double-submit cookie protection on every POST/PUT/PATCH/DELETE in /admin and /api/admin; a helper to put the token into every form and into fetch headers.
3. GET/POST /admin/login: separate minimal layout (dark, cyber, centred card, business wordmark, "Admin sign-in"). Email + password. Generic error ("Invalid email or password") for every failure. bcryptjs verify; constant-time-ish behaviour even when the email does not exist (compare against a dummy hash). Rate limit: 5 attempts / 15 min per IP+email, and 20 / 15 min per IP; show a clear "Too many attempts, try later" message. Update last_login_at. Inactive users cannot log in.
4. Middleware: requireAuth (redirect to login, remembers the target URL safely - only relative /admin paths), requireRole("owner"). must_change_password users are forced to /admin/account until they change it.
5. GET/POST /admin/account: change password (current + new + confirm, min 12 chars, must differ from the current one, zod validated). POST /admin/logout (CSRF-protected).
6. Admin shell layout (views/layouts/admin.ejs): left sidebar (Dashboard, Products, Quick Edit, Offers, and for owners: Categories, Settings, Users), top bar (user name + role badge, "View site" link opens in a new tab, Logout), flash-message component (success/error), responsive (sidebar becomes a drawer on mobile). Same design tokens as the public site but calmer. All admin responses send X-Robots-Tag: noindex, nofollow and Cache-Control: no-store.
7. `npm run create-admin`: interactive CLI (readline) asking name, email, role (default owner) and password (hidden input, min 12 chars). Never reads the password from a file or argument, never prints it.
8. Placeholder /admin dashboard page that just says "Signed in as ...". Stub pages for the other nav items returning "Coming in a later step" (protected by the right role).
9. Tests: unauthenticated requests to every /admin route redirect to login; a seller gets 403 on owner-only routes; login rate limit triggers; CSRF missing -> 403.

Update PROGRESS.md.
```

**Check it yourself:** `npm run create-admin` (make an owner), also make a seller. Log in at `/admin/login` with a wrong password a few times (rate limit message), then correctly. Visit `/admin/users` as the seller (403). Log out; `/admin` redirects to login.

---

## Step 10: Admin product management + image upload

**Mode:** Planning. **Commit:** `step 10: admin products and images`

```text
Follow the always-on rules. Current task: STEP 10, product CRUD and image uploads in the admin panel.

LIST (GET /admin/products): table with thumbnail, name, category, price, sale price, stock, status badge, updated date, actions (Edit, Duplicate, View on site, Archive). Search box, filters (category, status, "low stock", "on offer"), pagination (20/page). "Add product" button.

FORM (new + edit): a single clear page with sections:
 1. Basics: name, slug (auto-generated from the name, editable, unique check), brand, model, category (select).
 2. Pricing: price, sale price (optional), offer end date/time (optional, interpreted in the configured timezone), "Weekly offer" toggle. Live preview of the discount % and "You save" amount. Validation: sale price must be lower than price.
 3. Stock: quantity, low-stock threshold. Live preview of the stock badge.
 4. Content: short description (max 160 chars with counter), description (markdown-lite textarea with a Write/Preview tab using the same sanitiser as the public site), warranty text.
 5. Specifications: dynamic fields rendered from the selected category's spec_fields (text/number with unit/boolean toggle/select). Changing the category re-renders the fields (keep values for matching keys). Server validates specs against the category schema.
 6. Images: drag-and-drop + file picker, multiple files, up to 8 per product, client-side preview and progress, drag to reorder, "Set as main" star, alt text per image, delete. 
 7. Visibility: status (draft/published/archived), featured toggle.
Buttons: Save, Save and publish, Cancel. Unsaved-changes warning. Flash message after saving. All inputs validated with zod; show field-level errors next to the fields.

IMAGE PIPELINE (src/lib/storage/): an interface { save(buffer, opts) -> {url, thumbUrl, publicId}, remove(publicId/url) } with two drivers: local (writes to public/uploads/products/, unique random filenames) and cloudinary (reads CLOUDINARY_URL; upload via the official SDK). Chosen by STORAGE_DRIVER. Process every upload with sharp: reject non-images (verify by decoding, not by extension), max 5 MB, strip EXIF, auto-rotate, convert to webp, create a 1200px-wide large version and a 400px thumb. Never trust the original filename.

BEHAVIOUR: 
- Whenever price or sale_price changes, insert a price_history row (old/new values, admin id) inside the same transaction.
- "Archive" is a soft delete (status = archived). A real "Delete permanently" exists for owners only, with a confirm dialog, and also removes the images from storage.
- "Duplicate" copies the product as a draft with " (copy)" and a new slug, without images.
- Sellers and owners can both manage products. Record created_by.

Tests: price_history is written only on change; spec validation rejects bad values; upload rejects a renamed .txt file.
Update PROGRESS.md.
```

**Check it yourself:** log in, add a real AC with 3 photos, set a sale price and a weekly-offer end date, publish. Open it on the public site (card, offers strip, detail page). Edit the price and confirm "Price last updated" changes. Try uploading a `.txt` renamed to `.jpg` (must be rejected).

---

## Step 11: Quick Edit grid, Offers manager, Dashboard

**Mode:** Planning. **Commit:** `step 11: quick edit, offers manager, dashboard`

```text
Follow the always-on rules. Current task: STEP 11, the fast price/stock tools and the dashboard.

1. QUICK EDIT (GET /admin/quick-edit): a spreadsheet-style table of all non-archived products (filter by category and search by name). Inline-editable cells: price, sale price, stock qty, weekly-offer checkbox, status select. Edited rows are highlighted; a sticky "Save N changes" bar appears; clicking it shows a small diff (old -> new) for confirmation, then saves everything in ONE transaction (writing price_history rows). Keyboard friendly (Tab/Enter moves between cells, numeric inputs). On mobile each row becomes a compact card. Validation errors point to the exact row/cell.
2. OFFERS MANAGER (GET /admin/offers): list of all published products with checkboxes. Bulk actions on selected products: "Apply X% discount" (computes sale_price from price, rounded to a nice number the admin can choose: nearest 1, 10, 100), "Set offer end date/time" (with a quick button "This Sunday 11:59 PM" in the configured timezone), "Mark as weekly offer", "Remove offer" (clears sale_price, offer_ends_at, is_weekly_offer). A header card shows how many offers are active and when the next one ends. A "Clear ALL offers" button with a typed-confirmation dialog. All price changes write price_history.
3. DASHBOARD (GET /admin): stat cards (published products, drafts, out of stock, low stock, active offers), a "Needs attention" list (out of stock + low stock + offers ending within 48 hours), "Recent price changes" (last 10: product, old -> new, who, when), "Most WhatsApp-clicked products (last 30 days)" top 5 from whatsapp_clicks, and big quick-action buttons: Add product, Quick edit prices, Manage offers.
4. Cache invalidation: nothing public should be stale after a save (settings cache untouched here; products are queried live).
5. Tests: bulk % discount math, transaction rollback if one row is invalid (no partial saves), price_history rows created.

Update PROGRESS.md.
```

**Check it yourself:** change 5 prices + 2 stock values in Quick Edit in one go, confirm the diff, save, and check the public site instantly reflects them. Run a 10% weekly discount on 3 products via Offers manager; they appear on `/offers`.

---

## Step 12: Categories builder, Site settings, Users (owner only)

**Mode:** Planning. **Commit:** `step 12: categories, settings, users`

```text
Follow the always-on rules. Current task: STEP 12, the three owner-only admin areas. All routes require role "owner".

1. CATEGORIES (/admin/categories): list with drag or up/down ordering, active toggle, product count. Create/edit form: name, slug, description, icon (choose from the preset icon keys in icons.ejs). SPEC FIELD BUILDER: add / remove / reorder fields; each field has label (key auto-generated from the label, immutable once products use it), type (text, number, boolean, select), unit, options (for select, one per line), and checkboxes filterable / show_on_card / show_in_table. Warn clearly when removing a field that existing products have values for (do not delete the data silently). Cannot delete a category that still has products (offer to deactivate instead). A new category must immediately appear in the public nav, home category tiles, product form, filters, and sitemap WITHOUT any code change.
2. SITE SETTINGS (/admin/settings): sections for Business info (name, tagline, phone, email, address, hours), WhatsApp (number with validation: digits only, 8-15 digits, plus a "Test link" button that opens wa.me; message template editor with {product} {price} {url} tokens and a live preview), Homepage (hero title/subtitle), About page (title + markdown-lite body with Write/Preview), Display (currency code/symbol, show_exact_stock toggle, timezone select), Social links, Logo upload (optional, via the storage layer; falls back to the text wordmark). Saving invalidates the in-memory settings cache immediately.
3. USERS (/admin/users): list (name, email, role, status, last login), add user (name, email, role, temporary password generated and shown ONCE, must_change_password = true), edit role, deactivate/reactivate, reset password (new temp password shown once). Guards: you cannot deactivate or demote yourself, and the last active owner can never be removed/demoted.
4. Tests: removing a spec field with data warns; last-owner protection; settings cache invalidation; seller gets 403 on all three areas.

Update PROGRESS.md.
```

**Check it yourself:** change the WhatsApp number in Settings and watch the floating button + product buttons update immediately. Create a throwaway category "Test" with 2 spec fields, add a product to it, confirm it shows in the nav/filters, then deactivate it.

---

## Step 13: Security hardening

**Mode:** Planning. **Commit:** `step 13: security hardening`

```text
Follow the always-on rules. Current task: STEP 13, a security pass over the whole app. Audit first, then fix, then document.

1. helmet with a strict Content-Security-Policy: default-src 'self'; img-src 'self' data: https://res.cloudinary.com; style-src 'self' (no unsafe-inline unless unavoidable - if inline styles exist, move them to classes); script-src 'self' (no inline scripts - move any inline JS to /public/js, use data-attributes for server-provided values); frame-ancestors 'none'; form-action 'self' plus https://wa.me if needed; object-src 'none'; base-uri 'self'. HSTS, no-referrer-when-downgrade or stricter referrer policy, X-Content-Type-Options, Permissions-Policy (disable camera/mic/geolocation).
2. Rate limits: global 300 req / 15 min / IP; /api/search-suggest 60/min; /api/track/whatsapp 30/min; login limits already exist (verify they work behind the proxy using trust proxy).
3. Audit EVERY route and service: (a) all SQL parameterised - grep for string concatenation or template literals inside queries, fix any; (b) all inputs validated with zod; (c) all EJS output escaped, every <%- %> usage justified and sanitised; (d) every state-changing route has CSRF; (e) every /admin and /api/admin route has auth + correct role.
4. Uploads: verify size/type limits, random filenames, no path traversal, uploads served with correct content type and X-Content-Type-Options: nosniff.
5. Sessions/cookies: flags correct in production mode, secret length enforced (>= 32 chars) at startup, session destroyed on logout.
6. Error handling: no stack traces or SQL errors in production responses; log errors server-side with a request id (no passwords/tokens/cookies in logs).
7. Run `npm audit` and fix or document each finding. Ensure .env is gitignored and no secret exists in the repo history of the current files.
8. Produce docs/SECURITY_CHECKLIST.md: each control, PASS/FAIL, and the file/line evidence. Add automated tests for: unauthenticated admin access, role violations, missing CSRF, malicious markdown stripped, upload of a disguised file rejected, SQL-injection style input in search/filter params returns normal results.

Update PROGRESS.md.
```

**Check it yourself:** open `docs/SECURITY_CHECKLIST.md`, confirm all PASS; use the site normally and check the browser console for CSP errors (there should be none).

---

## Step 14: QA, performance, accessibility (use the browser agent)

**Mode:** Planning. **Commit:** `step 14: qa, performance, a11y`

```text
Follow the always-on rules. Current task: STEP 14, quality pass. Use the browser agent to actually load the running site (npm run dev must be running; start it if needed, with demo data seeded).

1. RESPONSIVE: screenshot and inspect these pages at 360, 390, 768, 1024 and 1440 px wide: /, /products (with filters open), /category/air-conditioners, a product page (on offer), /offers, /contact, /admin/login, and in the admin: dashboard, product form, quick edit. List every visual bug (overflow, overlap, tiny touch targets, text clipping) and FIX them.
2. ACCESSIBILITY: keyboard-only walkthrough of home -> search -> filter -> product -> WhatsApp; fix focus order/visible focus problems; add missing aria labels, landmark roles, alt text, form labels; verify colour contrast meets WCAG AA (fix tokens if not); verify prefers-reduced-motion disables animations.
3. PERFORMANCE: images have width/height + loading="lazy" (except the first/LCP image), responsive sizes; static assets served with long cache headers + compression; Tailwind output minified in production build; no render-blocking scripts (use defer); add missing DB indexes after inspecting slow queries with EXPLAIN ANALYZE on the listing/search queries; check for N+1 queries on the home and listing pages. Run Lighthouse (mobile) on /, /products and a product page and report scores. Targets: Performance >= 85, Accessibility >= 95, Best Practices >= 95, SEO >= 95. Fix what you reasonably can and report what is left.
4. END-TO-END SMOKE TEST in the browser agent, recording what it did: home -> Weekly Offers -> open a product -> verify the WhatsApp link text -> admin login -> add a new AC with 2 images and a sale price -> open it on the public site -> Quick Edit change its price -> reload public page and verify the new price + "Price last updated" -> archive it -> verify it 404s publicly.
5. Make sure `npm test` and `npm run lint` pass. Write docs/QA_REPORT.md with before/after notes, Lighthouse scores, and remaining known issues.

Update PROGRESS.md.
```

**Check it yourself:** read `docs/QA_REPORT.md`, open the site on your real phone via your local network IP, and try to buy... sorry, to *ask about* an AC like a customer would.

---

## Step 15: Deploy (free tier: Render + Neon + Cloudinary)

**Mode:** Planning. **Commit:** `step 15: production config and deploy docs`

### Part A: accounts you create by hand (10 minutes)

1. **GitHub**: create a **private** repo, push your code (`git remote add origin ... && git push -u origin main`).
2. **Neon** (free Postgres): create a project, copy the connection string (it must include `sslmode=require`).
3. **Cloudinary** (free): copy the `CLOUDINARY_URL` from the dashboard.
4. **Render**: sign up with GitHub.

Free-tier terms change often, so check each provider's current limits on its pricing page before relying on them. Known trade-off: free Render web services can go to sleep when idle, so the first visit after a quiet period may take a while to load.

### Part B: prompt for the agent

```text
Follow the always-on rules. Current task: STEP 15, production readiness and deployment documentation for Render (web service) + Neon (PostgreSQL) + Cloudinary (images).

1. Production config: NODE_ENV=production behaviours verified (secure cookies with trust proxy, no demo routes like /_styleguide, strict env validation at startup with clear error messages, STORAGE_DRIVER=cloudinary required in production, SITE_URL required). Add engines, a "build" script (npm ci --include=dev && npm run build:css && copy fonts) and a "start" script that runs `npm run migrate` then `node src/server.js`. Graceful shutdown on SIGTERM (close server, end pg pool). /healthz used as the health check.
2. Add render.yaml (a Render Blueprint) for a Node web service on the free plan with the build/start commands, health check path, and env var KEYS only (values set in the dashboard): NODE_ENV, DATABASE_URL, SESSION_SECRET, STORAGE_DRIVER, CLOUDINARY_URL, SITE_URL, TIMEZONE.
3. Production data bootstrap WITHOUT demo data: document how to run, from my own laptop and pointing at the Neon connection string via a temporary environment variable (never written to a file or committed): `npm run migrate`, `npm run seed:categories`, `npm run create-admin`. Make sure seed:demo refuses to run when NODE_ENV=production OR when DATABASE_URL does not point at localhost unless I pass an explicit --i-know-this-is-not-prod flag.
4. Backup script `npm run backup` (pg_dump to a timestamped file in ./backups, gitignored) and documentation for weekly manual backups + how to restore.
5. Write docs/DEPLOY.md: click-by-click instructions for Neon, Cloudinary, Render (connect repo, set env vars, first deploy, verify /healthz), custom domain + HTTPS, how to rotate SESSION_SECRET, how to redeploy, how to roll back, how to avoid the sleeping-service delay (options: upgrade the plan, or an external uptime ping - state the trade-offs honestly), and a post-deploy smoke-test checklist.
6. Do NOT deploy anything yourself and do not ask me for secrets. Update PROGRESS.md.
```

### Part C: you deploy (follow `docs/DEPLOY.md`)

**Check it yourself:** the live URL loads, `/healthz` is OK, you can sign in at `/admin/login`, upload a product photo (it must persist after a redeploy, proving Cloudinary works), and the WhatsApp button opens the real seller chat.

---

## Step 16: Handover docs + prove it scales to Switches

**Mode:** Planning. **Commit:** `step 16: handover and extensibility proof`

```text
Follow the always-on rules. Current task: STEP 16, final handover. 

1. Write docs/ADMIN_GUIDE.md for a NON-technical seller, with numbered steps and the exact menu names: sign in; add a new product with photos; change a price; update stock after a sale; run a weekly offer (set discount, end date, check it on the site); mark something out of stock; edit About/Contact/WhatsApp number; add another staff member as a seller; reset a forgotten password; what to do if something looks wrong. Short sentences, no jargon.
2. Prove extensibility using ONLY the admin UI through the browser agent (no code changes): create a category "Switches" with spec fields (ports [number], port_speed [select: 100M, 1G, 2.5G, 10G], poe [select: None, PoE, PoE+], poe_budget_w [number, unit W], managed [select: Unmanaged, Smart, Managed; filterable], uplinks [text], rack_mountable [boolean]); add one clearly fake product in it; confirm it appears in the nav, home category tiles, product form, filters and sitemap. Then delete the test product and deactivate the test category. Report any place where code changes WERE needed and fix those places so the claim "new categories need no code" is true.
3. Update README.md with: features, screenshots section placeholder, local setup, scripts table, env var table, project structure, how to run tests, deployment link to docs/DEPLOY.md.
4. Final cleanup: remove dead code, unused dependencies (npm prune / depcheck), console.logs, TODOs; run lint + tests; make sure the demo seed is clearly dev-only.
5. Update PROGRESS.md with a final summary and a "Future ideas (NOT built)" list.
```

**Check it yourself:** run through the **Launch checklist** below.

---

## Launch checklist (tick every box before sharing the link)

- [ ] Real WhatsApp number in Settings; button opens the right chat on phone and desktop
- [ ] Real address, hours, about text, phone
- [ ] At least 6 real products with real photos, honest stock, correct prices
- [ ] One weekly offer running with a real end date
- [ ] Demo data NOT present in production
- [ ] Owner account created with a strong unique password; seller account tested
- [ ] `docs/SECURITY_CHECKLIST.md` all PASS; `npm audit` reviewed
- [ ] HTTPS working on the final domain; `/admin` not in `sitemap.xml`
- [ ] Tested on a real phone (Android + iPhone if possible)
- [ ] A backup taken and a restore tried once
- [ ] Google Search Console: submit `sitemap.xml` (optional, free)

---

## Appendix A: Rescue prompts

**Resume prompt (quota ran out / chat lost / agent stopped mid-step):**

```text
Read PROJECT_BRIEF.md, PROGRESS.md and the always-on rules. We were in the middle of STEP <N>: <step title>. Look at git status and git diff to see what is already done. Tell me in 5 lines what is finished and what is missing, then finish ONLY the missing parts of that step. Do not redo finished work and do not start the next step.
```

**Bug-fix prompt:**

```text
Bug: <what you did>, <what you expected>, <what happened>. Page/URL: <...>. Browser/viewport: <...>. Console or terminal error (paste): <...>
First find the root cause and explain it in 3 lines. Then fix it with the smallest change, add or update a test that would have caught it, and tell me how to verify.
```

**UI polish prompt (Fast mode):**

```text
On <page> at <viewport width>, <describe the problem>. Fix it using the existing design tokens and components only (PROJECT_BRIEF.md section 10). Do not change other pages. Show me before/after screenshots using the browser agent.
```

**"Agent went off-script" prompt:**

```text
Stop. You changed things outside the current step / added something from the NON-GOALS list. List every file you touched, then revert everything that is not required by STEP <N>. Then continue with only STEP <N>.
```

## Appendix B: The 3 traps to avoid

1. **Pasting two steps in one chat.** The agent will "helpfully" blend them and burn quota. One step, one chat.
2. **Approving a plan without reading it.** If the Implementation Plan mentions payments, a cart, user accounts or a new framework, comment on the artifact and tell it to remove them (they are NON-GOALS).
3. **Committing before verifying.** Your commit is your undo button. Only press it after the "Check it yourself" list passes.
