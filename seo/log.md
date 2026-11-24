# SEO log — snacksdistributionwholesale.com

Automated SEO tasks (daily health check, Tue/Fri guide, monthly report) append dated entries here.
Guides already published (don't repeat these topics):
- how-to-buy-imported-snacks-wholesale-australia — ABN signup, cartons/pallets, GST, PayID/PayPal, freight
- imported-snack-range-australian-convenience-store — categories, merchandising, energy drink caffeine rule, reordering
- christmas-summer-stock-imported-snacks-australian-retailers — Christmas + summer holidays: three peaks, heat-safe ranging (chocolate), order timing over the break, displays

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

## 2026-11-21 — daily health check
- Local crawl clean (200s, one h1, titles ≤65, descriptions 110–160, canonical/hreflang/og/JSON-LD, internal links and images, robots, sitemaps). No fixes needed.
- IndexNow: full sitemap submitted 2026-11-21 (4099 URLs, HTTP 200).

## 2026-11-24 — Tue guide: Christmas and summer holiday stock
- New guide: /guides/christmas-summer-stock-imported-snacks-australian-retailers — "Christmas and Summer Holiday Stock: An Imported Snacks Buying Guide for Australian Retailers" (seoTitle 60 chars, description 158). Target keyword: "Christmas stock wholesale Australia" / "wholesale Christmas lollies Australia". ~1,000 words, Australian English, no prices.
- Angle: summer Christmas (heat and chocolate, three peaks: gifting / entertaining / January holidays, freight slowdown between Christmas and New Year, regional/remote timing). Compliance wording matches the /compliance page.
- Internal links (all 200 locally): 6 categories, /compliance, /delivery, /wholesale/queensland, /wholesale/western-australia, /wholesale/northern-territory, /signup, /shop + 2 guides. Listed on /guides and in sitemap.xml.
- Search Console: sc-domain:snacksdistributionwholesale.com is not yet available in Windsor.ai — topic chosen from keyword research.
- Next ideas: vending machine snacks guide, lolly shop / pick-and-mix range, school holidays & Easter (order by Feb), FSANZ labelling explainer for imported lollies, Perth/WA freight guide, strengthen /wholesale/nsw copy once Search Console shows demand.

