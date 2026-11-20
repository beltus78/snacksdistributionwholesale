# SEO log — snacksdistributionwholesale.com

Automated SEO tasks (daily health check, Tue/Fri guide, monthly report) append dated entries here.
Guides already published (don't repeat these topics):
- how-to-buy-imported-snacks-wholesale-australia — ABN signup, cartons/pallets, GST, PayID/PayPal, freight
- imported-snack-range-australian-convenience-store — categories, merchandising, energy drink caffeine rule, reordering

## 2026-11-20 — SEO onboarding
- Added buyer guides: /guides and /guides/<slug> (source src/guides.ts), Article + BreadcrumbList JSON-LD, in the sitemap with real lastmod, "Guides" in the header nav and "Buyer guides" in the footer.
- Fixed: sitemap lastmod was always today's date (Google ignores untrustworthy lastmod) — now CONTENT_UPDATED in src/index.ts (bump it when site-wide content changes) and each guide's own date.
- Fixed: the " | Snacks Distribution Wholesale" suffix (32 chars) pushed most titles past 65 chars — it is now dropped when the title is already long; meta descriptions clipped to 160 chars; how-to-order description written.
- Placeholder company details ("[Company name] Pty Ltd", ABN, address) hidden from the public footer/contact until real ones are set in src/catalog.ts SITE.
- Optional env var BING_SITE_VERIFICATION (GOOGLE_SITE_VERIFICATION already existed).
- IndexNow key file: /2fdb2b6ee3092ca351f4f729bdbb6936.txt.
- Open (needs Beltus): real company name, ABN, warehouse address and phone; terms governing state.

## 2026-11-21 — on-page audit
- Titles: suffix dropped when the full title would pass 65 chars; titles still over 65 are cut at a word boundary.
- Meta descriptions: under 110 chars are padded with the site tagline; over 160 clipped at a word boundary.
- Search Console: property verified (Cloudflare DNS) and sitemap submitted.
