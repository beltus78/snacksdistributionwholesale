import { CAT, CATEGORIES, MIN_CASES, SITE, STATES, aud, unitText, type Product } from "./catalog";
import type { Buyer } from "./auth";

export const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type Ctx = { buyer: Buyer | null; url: URL; turnstile?: string; beacon?: string; gsc?: string; bing?: string };
export type Page = {
  path: string; title: string; description: string; body: string;
  image?: string; jsonLd?: object[]; noindex?: boolean; scriptData?: Record<string, unknown>; hideBar?: boolean; status?: number;
  ogType?: string; /** Use title as-is (no " | site name" suffix). */ rawTitle?: boolean;
};

/** Hides "[placeholder]" company details on public pages until the real ones are filled in. */
export const shown = (s: string) => (s.includes("[") ? "" : s);

export const LOGO = `<span class="mark"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#C4501E"/><circle cx="20" cy="23" r="9" fill="#F2B33D"/><path d="M1.5 25h37v14h-37z" fill="#23402F"/><path d="M20 25 13 39h14z" fill="#1D1A16"/><path d="M20 27v2.5M20 32v3" stroke="#F4EBDD" stroke-width="1.4" stroke-linecap="round"/></svg><span class="mark-t"><b>Snacks Distribution</b><small>Wholesale · Australia</small></span></span>`;

/** Designed shelf label in place of a product photo — colour by category. */
export function label(p: Product, size: "s" | "m" | "l" = "s") {
  const c = CAT.get(p.cat)!;
  const rest = p.brand && p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name.slice(p.brand.length).trim() : p.name;
  return `<span class="lbl lbl-${c.hue} lbl--${size}" aria-hidden="true"><span class="lbl-top">${esc(c.short)}</span><span class="lbl-b">${esc(p.brand || c.short)}</span><span class="lbl-n">${esc(rest || p.name)}</span>${p.size ? `<span class="lbl-s">${esc(p.size)}</span>` : ""}</span>`;
}

const priceLocked = (path: string) => `<a class="lock" href="/signup?next=${encodeURIComponent(path)}" rel="nofollow"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zm2 0h4V5a2 2 0 0 0-4 0z" fill="currentColor"/></svg>Sign up to see price</a>`;

export const stepper = (p: Product) =>
  `<div class="step" data-slug="${esc(p.slug)}" data-price="${p.price}"><button type="button" data-d="-1" aria-label="One carton less">−</button><input type="number" inputmode="numeric" min="0" max="999" value="0" aria-label="Cartons of ${esc(p.name)}"><button type="button" data-d="1" aria-label="One carton more">+</button></div>`;

export function productRow(ctx: Ctx, p: Product) {
  return `<li class="row"><a class="row-img" href="/p/${p.slug}" tabindex="-1">${label(p)}</a>
<div class="row-main"><a href="/p/${p.slug}">${esc(p.name)}${p.size ? ` <span class="sz">${esc(p.size)}</span>` : ""}</a><span>${p.brand ? `${esc(p.brand)} · ` : ""}${esc(unitText(p))}</span></div>
${ctx.buyer ? `<div class="row-price"><b>${esc(aud(p.price))}</b><span>per carton ex GST</span></div>${stepper(p)}` : `<div class="row-lock">${priceLocked(ctx.url.pathname + ctx.url.search)}</div>`}</li>`;
}

export function productTile(ctx: Ctx, p: Product) {
  return `<a class="tile" href="/p/${p.slug}">${label(p, "m")}<span class="tile-name">${esc(p.name)}</span><span class="tile-meta">${esc(unitText(p))}</span>${ctx.buyer ? `<span class="tile-price">${esc(aud(p.price))} <small>ex GST</small></span>` : `<span class="tile-lock">Price after free signup</span>`}</a>`;
}

export function layout(ctx: Ctx, pg: Page) {
  const url = SITE.url + pg.path;
  const title = pg.rawTitle || pg.title.includes(SITE.name) || pg.title.length + SITE.name.length + 3 > 65 ? pg.title : `${pg.title} | ${SITE.name}`;
  const image = pg.image ?? `${SITE.url}/og-default.jpg`;
  // Meta description: max 160 chars, cut at a word boundary.
  pg = { ...pg, description: pg.description.length <= 160 ? pg.description : pg.description.slice(0, 159).replace(/\s+\S*$/, "") + "…" };
  const nav: [string, string][] = [["/shop", "Shop"], ["/brands", "Brands"], ["/delivery", "Delivery"], ["/compliance", "Compliance"], ["/guides", "Guides"], ["/contact", "Contact"]];
  const b = ctx.buyer;
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(pg.description)}">
${pg.noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${url}"><link rel="alternate" hreflang="en-AU" href="${url}"><link rel="alternate" hreflang="x-default" href="${url}">`}
<meta name="geo.region" content="AU"><meta property="og:site_name" content="${SITE.name}"><meta property="og:type" content="${pg.ogType ?? "website"}"><meta property="og:locale" content="en_AU">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(pg.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#F4EBDD"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
${ctx.gsc ? `<meta name="google-site-verification" content="${esc(ctx.gsc)}">` : ""}${ctx.bing ? `<meta name="msvalidate.01" content="${esc(ctx.bing)}">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap">
<link rel="stylesheet" href="/styles.css?v=3">
${(pg.jsonLd ?? []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("")}
</head><body>
<div class="util"><div class="wrap util-in"><span>Trade only · ABN required · Prices in AUD ex GST</span><span class="util-r">Delivering to every state &amp; territory · Min. ${MIN_CASES / 50} pallets</span></div></div>
<header class="hd"><div class="wrap hd-in">
<a href="/" class="hd-logo" aria-label="${SITE.name} home">${LOGO}</a>
<nav class="hd-nav">${nav.map(([p, n]) => `<a href="${p}"${pg.path === p || (p === "/shop" && pg.path.startsWith("/c/")) ? ' aria-current="page"' : ""}>${n}</a>`).join("")}</nav>
<div class="hd-acc">${b ? `<span class="hi">G'day, ${esc(b.name.split(" ")[0])}</span><form method="post" action="/api/logout"><button class="ul" type="submit">Log out</button></form>` : `<a class="ul" href="/login">Log in</a><a class="btn btn-s" href="/signup">Sign up free</a>`}</div>
${b ? `<a class="meter" href="/cart" title="Quote cart"><span class="meter-bar"><i data-meter></i></span><span><b data-cart-count>0</b>/${MIN_CASES}</span></a>` : ""}
</div></header>
<main>${pg.body}</main>
${pg.hideBar || !b ? "" : `<div class="bar" data-bar hidden><div class="wrap bar-in"><span class="bar-txt"><b data-bar-cases>0</b> / ${MIN_CASES} cartons · <b data-bar-pallets>0</b> pallets · <b data-bar-sum>—</b> ex GST</span><a class="btn" href="/cart">Quote cart →</a></div></div>`}
<footer class="ft"><svg class="ft-ridge" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 120V70L90 48 160 66 270 26 360 56 500 10 580 36 700 2 810 46 900 26 1030 56 1150 16 1260 44 1340 32 1440 50V120Z" fill="#1D1A16"/></svg><div class="wrap">
<p class="ft-big" data-split>From the docks to your shelves — imported snacks for Australian stores.</p>
<div class="ft-grid">
<div>${LOGO}<p class="small">${[SITE.company, SITE.abn, SITE.address1, SITE.address2].map(shown).filter(Boolean).map((x) => `${esc(x)}<br>`).join("")}<a href="mailto:${SITE.email}">${SITE.email}</a>${SITE.phone ? `<br><a href="tel:${SITE.phone.replace(/\s/g, "")}">${esc(SITE.phone)}</a>` : ""}</p></div>
<div><h4>Shop</h4>${CATEGORIES.map((c) => `<a href="/c/${c.slug}">${esc(c.name)}</a>`).join("")}</div>
<div><h4>We deliver to</h4>${STATES.map((s) => `<a href="/wholesale/${s.slug}">${esc(s.name)}</a>`).join("")}</div>
<div><h4>Company</h4><a href="/about">About</a><a href="/delivery">Delivery &amp; freight</a><a href="/compliance">Food compliance</a><a href="/how-to-order">How to order</a><a href="/guides">Buyer guides</a><a href="/contact">Contact</a><a href="/terms">Terms of trade</a><a href="/privacy">Privacy</a></div>
</div><p class="small ft-copy">© ${new Date().getUTCFullYear()} ${SITE.name}. Wholesale to registered Australian businesses only. All prices AUD excluding GST.</p></div></footer>
<script>window.__MIN=${MIN_CASES};window.__IN=${b ? 1 : 0};${pg.scriptData ? `window.__D=${JSON.stringify(pg.scriptData).replace(/</g, "\\u003c")};` : ""}</script>
<script src="/app.js?v=1" defer></script><script src="/motion.js?v=1" defer></script>
${ctx.turnstile && /signup|contact|cart/.test(pg.path) ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : ""}
${ctx.beacon ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${esc(ctx.beacon)}"}'></script>` : ""}
</body></html>`;
}
