# Snacks Distribution Wholesale — snacksdistributionwholesale.com

Australia-only wholesale site for imported snacks & drinks (lollies, chips, chocolate, drinks…), 3,876 launch lines.
Runs on Cloudflare: one Worker (server-rendered pages, en-AU) + D1 database (trade accounts, sessions, orders, contact messages) + Resend (emails).
Scroll-story hero + reveal animations: `public/motion.js` (shared with tropicalsnackswholesale.eu), scene in `story()` in `src/pages.ts`.

## Automatic deploys (Cloudflare Workers Builds)
Connect the Worker to `beltus78/snacksdistributionwholesale` in the Cloudflare dashboard (Workers & Pages → Create → Import a repository).
Deploy command: `npx wrangler d1 migrations apply snacksdistributionwholesale --remote && npx wrangler deploy`
D1 database `snacksdistributionwholesale` already exists (`5ee133a8-…`, Oceania region).
Secrets (Worker → Settings → Variables and Secrets): `RESEND_API_KEY` (required for emails). Optional: `TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET` (spam check on signup/contact/order), `CF_BEACON_TOKEN` (Cloudflare Web Analytics), `GOOGLE_SITE_VERIFICATION` (Search Console meta tag).

## Domain (already on Cloudflare)
Worker → Settings → Domains & Routes → Add → Custom domain → `snacksdistributionwholesale.com`, then `www.snacksdistributionwholesale.com` (www redirects to the apex).
Resend → Domains → add the domain, add its DNS records in Cloudflare. Mailbox `sales@snacksdistributionwholesale.com`: Cloudflare Email Routing → forward to Gmail.

## Before launch — replace placeholders
`src/catalog.ts` → `SITE`: company name, ABN, warehouse address, phone (phone links appear once filled), `warehouse` wording once the location is final. Terms: governing state in `src/pages.ts` → `terms`.

## How it works
- Prices hidden until a free trade signup with a valid ABN (checksum-validated); prices unlock instantly. Accounts: D1 `buyers` (PBKDF2 passwords), `sessions` (90-day cookie `sdw_s`).
- URLs: `/`, `/shop` (+ `?q=` search, `?page=`), `/c/{category}`, `/p/{product}`, `/brands`, `/brand/{brand}`, `/wholesale/{state|city}` (8 states/territories + 23 cities for local SEO), `/delivery`, `/compliance`, `/how-to-order`, `/about`, `/contact`, `/signup`, `/login`, `/cart`. `sitemap.xml`, `robots.txt`.
- Order rules (`src/catalog.ts`): min 5 pallets = 250 mixed cartons; PayPal ≤ A$3,000, PayID ≤ A$10,000, bank transfer any amount; pay-by today + max 3 days. Prices AUD ex GST; GST and freight added on confirmation. All states incl. WA, NT, TAS.
- Orders are saved to D1 first, then emailed (`email_sent` = 1 when both emails went out). View: Cloudflare → D1 → snacksdistributionwholesale → Console, e.g. `SELECT * FROM orders ORDER BY created_at DESC`.
- Products: `src/data-products.json` built by `python3 tools/build_data.py tools/catalogue-review.json` from the review sheet (Include = Yes rows). Prices are estimates already cut by 25% — replace with real buy prices. No product photos yet: each product shows a designed label card (`label()` in `src/html.ts`).

Change code, push to `main` (auto-deploy) or run `bash deploy.sh`. Live logs: `npx wrangler tail`.

## SEO (automated tasks run on this repo)
- Deploys from `main` (Cloudflare Workers Builds). There is no `cloudflare` branch here.
- Buyer guides: `src/guides.ts` (format notes at the top), at `/guides/<slug>`. New guides: append to `GUIDES` with `published: "YYYY-MM-DD"`. Australian English, Australian buyers only (every state and territory).
- Real internal URLs: `/`, `/shop`, `/c/<category>` (slugs in `src/catalog.ts` CATEGORIES), `/p/<product>` (slugs in `src/data-products.json`), `/brands`, `/brand/<slug>`, `/wholesale/<state or city slug>` (STATES / CITIES in `src/catalog.ts`), `/delivery`, `/compliance`, `/how-to-order`, `/about`, `/contact`, `/signup`, `/guides`.
- Prices are only visible after free signup — never write prices in guides or meta text. `/cart` and `/login` are noindex/disallowed on purpose.
- Sitemap lastmod: bump `CONTENT_UPDATED` in `src/index.ts` when site-wide content changes.
- Log every SEO change in `seo/log.md`. IndexNow key: `2fdb2b6ee3092ca351f4f729bdbb6936` (file in `public/`).
- Never: change order rules, payment limits, contact/company details or URLs; never invent statistics, reviews or regulatory claims.
