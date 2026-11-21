import {
  BRAND, BRANDS, BY_SLUG, CAT, CATEGORIES, CITIES, MAX_PAY_DAYS, MIN_CASES, PAYID_MAX, PAYPAL_MAX, PRODUCTS, SITE, STATES,
  aud, countByCat, unitText, type Product,
} from "./catalog";
import { esc, label, productRow, productTile, shown, stepper, type Ctx, type Page } from "./html";
import { GUIDE_BY, guidesNewestFirst, renderMd } from "./guides";

const N = PRODUCTS.length;
const fmtN = (n: number) => n.toLocaleString("en-AU");

const org = () => ({
  "@context": "https://schema.org", "@type": "WholesaleStore", name: SITE.name, url: SITE.url, email: SITE.email,
  logo: `${SITE.url}/favicon.svg`, image: `${SITE.url}/og-default.jpg`, areaServed: { "@type": "Country", name: "Australia" },
  currenciesAccepted: "AUD", paymentAccepted: "PayID, PayPal, Bank transfer", ...(SITE.phone ? { telephone: SITE.phone } : {}),
});
const crumbs = (items: [string, string?][]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, ...(path ? { item: SITE.url + path } : {}) })),
});
const faq = (qa: [string, string][]) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

const byBrand = (cat: string, brands: string[]) =>
  brands.map((b) => {
    const all = PRODUCTS.filter((p) => p.cat === cat && p.brand.toLowerCase() === b.toLowerCase());
    return all.find((p) => p.img[0] === "c") ?? all.find((p) => p.img) ?? all[0]; // prefer a clean cut-out photo
  }).filter((p): p is Product => !!p);

const STORY = [
  { kicker: "Imported snacks · Australian stock", title: "The world's snacks, stocked in Australia.", text: `${fmtN(N)} lines of American, Asian and European snacks and drinks, dispatched from ${SITE.warehouse} to shops in every state and territory.`, pick: () => byBrand("lollies", ["Warheads", "Nerds", "Jolly Rancher", "Airheads"]), cta: true },
  { kicker: `01 — ${countByCat("lollies")} lines`, title: "Lollies that sell out at the counter.", text: "Sours, taffy, freeze-dried, 3D gummies and theatre boxes — the lines your customers film for TikTok.", pick: () => byBrand("lollies", ["Trolli", "Taffy Town", "Skittles", "Starburst"]) },
  { kicker: `02 — ${countByCat("drinks")} lines`, title: "Fridge-fillers from the States and beyond.", text: "Arizona, Faygo, Jarritos, A&W, Fanta from Japan and energy drinks — sold by the carton, priced per carton.", pick: () => byBrand("drinks", ["Arizona", "Faygo", "Jarritos", "Dr Pepper"]) },
  { kicker: `03 — ${countByCat("chips") + countByCat("chocolate")} lines`, title: "Hot chips. King-size bars.", text: "Takis, Cheetos, Pringles flavours you can't get here, plus Reese's, Hershey's and Dubai chocolate.", pick: () => [...byBrand("chips", ["Takis", "Cheetos"]), ...byBrand("chocolate", ["Reese's", "Hershey's"])] },
  { kicker: "04 — Five pallets. One truck.", title: "From our dock to your shelf, anywhere in Oz.", text: `Mix any lines up to ${MIN_CASES} cartons (5 pallets). We confirm freight to your door — metro, regional, Tassie or the Top End.`, pick: () => byBrand("novelty", ["Pez", "Kidsfrenzy", "Kidsmania", "Bubble Blast"]), cta: true },
];
const SPOTS = [{ x: 4, y: 6, w: 40 }, { x: 54, y: 0, w: 38 }, { x: 50, y: 48, w: 42 }, { x: 8, y: 52, w: 36 }];

/** Scroll story: the sky turns from dawn to dusk, the sun arcs over the ranges, the road runs to the horizon. */
function story(ctx: Ctx) {
  return `<section class="story" data-story style="--n:${STORY.length}">
<div class="story-stage">
<div class="scene" aria-hidden="true"><div class="sky"></div><div class="sun"></div>
<svg class="range r3" viewBox="0 0 1440 300" preserveAspectRatio="none"><path d="M0 300V170l120-40 140 50 160-90 120 60 190-110 150 90 130-50 170 80 140-60 120 50v140z"/></svg>
<svg class="range r2" viewBox="0 0 1440 300" preserveAspectRatio="none"><path d="M0 300V200l180-50 120 40 200-70 160 70 140-30 220 60 160-50 260 60v70z"/></svg>
<svg class="range r1" viewBox="0 0 1440 300" preserveAspectRatio="none"><path d="M0 300V230c140-20 300-40 480-20s360 40 540 10 300-30 420-10v90z"/></svg>
<div class="road"><i></i></div><div class="truck"><svg viewBox="0 0 120 52"><rect x="2" y="6" width="74" height="34" rx="3" fill="#F4EBDD"/><text x="39" y="28" text-anchor="middle" font-size="11" font-weight="800" fill="#C4501E" font-family="sans-serif">SNACKS</text><path d="M78 16h22l14 14v10H78z" fill="#C4501E"/><path d="M84 19h14l9 10H84z" fill="#9CC6D9"/><circle cx="20" cy="42" r="7" fill="#1D1A16"/><circle cx="60" cy="42" r="7" fill="#1D1A16"/><circle cx="98" cy="42" r="7" fill="#1D1A16"/></svg></div>
</div>
<div class="wrap story-in">
<ol class="story-dots" aria-hidden="true">${STORY.map((_, i) => `<li data-dot>${String(i + 1).padStart(2, "0")}</li>`).join("")}</ol>
<div class="story-text">${STORY.map((c, i) => `<div class="chap" data-chap><p class="kicker">${esc(c.kicker)}</p>${i === 0 ? `<h1 class="h-hero">${esc(c.title)}</h1>` : `<h2 class="h-hero">${esc(c.title)}</h2>`}<p class="lead">${esc(c.text)}</p>
${c.cta ? `<p class="links">${ctx.buyer ? `<a class="btn" href="/shop">Open the order sheet →</a>` : `<a class="btn" href="/signup">Sign up free to see prices →</a>`}<a class="ul" href="/shop">Browse ${fmtN(N)} lines</a></p>` : ""}</div>`).join("")}</div>
<div class="story-visual">${STORY.map((c, i) => c.pick().slice(0, 4).map((p, j) => { const s = SPOTS[j]!; return `<div class="fly-pos" style="left:${s.x}%;top:${s.y}%;width:${s.w}%"><a class="fly" data-fly="${i}" href="/p/${p.slug}" tabindex="-1">${label(p, "l")}</a></div>`; }).join("")).join("")}</div>
</div><p class="story-hint" aria-hidden="true">Scroll ↓</p></div></section>`;
}

/** Up to n photographed products of a category, spread across brands. */
export function catPhotos(slug: string, n = 4) {
  const seen = new Set<string>(); const out: Product[] = [];
  for (const p of PRODUCTS) if (p.cat === slug && p.img[0] === "c" && !seen.has(p.brand)) { seen.add(p.brand); out.push(p); if (out.length === n) break; }
  return out;
}
const collage = (slug: string, n = 4) => `<span class="collage" aria-hidden="true">${catPhotos(slug, n).map((p) => `<img src="/products/${p.slug}.webp" alt="" loading="lazy" decoding="async" width="120" height="120">`).join("")}</span>`;

function catIndex() {
  return `<ol class="index" data-stagger>${CATEGORIES.map((c, i) => `<li><a href="/c/${c.slug}" class="ix-${c.hue}"><span class="ix-n">${String(i + 1).padStart(2, "0")}</span><span class="ix-t">${esc(c.name)}<small>${esc(c.line)}</small></span>${collage(c.slug, 3)}<span class="ix-c">${countByCat(c.slug)}</span></a></li>`).join("")}</ol>`;
}

function shelf(ctx: Ctx, title: string, items: Product[], more?: [string, string]) {
  if (!items.length) return "";
  return `<section class="sec-shelf"><div class="wrap shelf-head"><h2 class="h-l" data-split>${esc(title)}</h2>${more ? `<a class="more" href="${more[0]}">${esc(more[1])} →</a>` : ""}</div>
<div class="shelf"><div class="shelf-in" data-stagger>${items.map((p) => productTile(ctx, p)).join("")}</div></div></section>`;
}

const steps: [string, string][] = [
  ["Sign up free", "Register your business with its ABN. Prices unlock straight away — no waiting for approval."],
  ["Fill five pallets", "Mix any lines by the carton. The pallet meter in the header counts you up to 250 cartons."],
  ["Send your quote", "Pick PayID, PayPal or bank transfer and the date you'll pay — within 3 days."],
  ["We confirm freight", "We email the final price and the freight cost to your door. Nothing is charged before that."],
  ["Delivered", "Your pallets leave our Australian warehouse — no customs, no import paperwork for you."],
];
function process() {
  return `<section class="wrap sec"><p class="kicker">How ordering works</p><h2 class="h-xl" data-split>Five steps from sign-up to a full shelf.</h2>
<ol class="process" data-stagger>${steps.map(([a, b], i) => `<li><span class="num">${i + 1}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></li>`).join("")}</ol></section>`;
}

function stateStrip() {
  return `<section class="wrap sec states-sec"><p class="kicker">Every state &amp; territory</p><h2 class="h-xl" data-split>Wherever your shop is, the truck gets there.</h2>
<ul class="states" data-stagger>${STATES.map((s) => `<li><a href="/wholesale/${s.slug}"><b>${s.code}</b><span>${esc(s.name)}</span><small>${esc(s.cities.slice(0, 3).join(" · "))}</small></a></li>`).join("")}</ul></section>`;
}

const signupBand = (ctx: Ctx) => ctx.buyer ? "" : `<section class="band"><div class="wrap band-in" data-reveal><div><p class="kicker">Trade prices</p><h2 class="h-xl">See every price in under a minute.</h2><p class="lead">Free account for Australian businesses with an ABN — servos, milk bars, convenience and discount stores, cafés, vending and party shops.</p></div><a class="btn btn-l" href="/signup">Sign up free →</a></div></section>`;

export function home(ctx: Ctx): Page {
  const featured = [
    ...byBrand("lollies", ["Warheads", "Nerds", "Jolly Rancher", "Airheads", "Trolli", "Jelly Belly", "Taffy Town"]),
    ...byBrand("drinks", ["Arizona", "Faygo", "Jarritos", "Monster", "Bobaba"]),
    ...byBrand("chips", ["Takis", "Cheetos", "Pringles", "Baby Star"]),
    ...byBrand("chocolate", ["Reese's", "Hershey's", "Cadbury"]),
  ];
  const why: [string, string][] = [
    ["Already in Australia", "Stock sits in our Australian warehouse. No import permits, no customs holds, no 6-week container wait."],
    ["Sold by the carton", "Real carton quantities — the way the lines arrive — so you never break open a case to fill a shelf."],
    ["Checked for the Australian market", "Lines we list are ones already traded in Australia. Energy drinks within the FSANZ caffeine limit."],
    ["Freight quoted to your door", "One confirmed price for metro, regional, Tasmania, WA and the NT before you pay a cent."],
  ];
  return {
    path: "/", title: "Imported Snacks & Drinks Wholesale Australia — Lollies, Chips, Soda",
    description: `Wholesale imported snacks for Australian shops: ${fmtN(N)} American, Asian and European lollies, chips, chocolate and drinks by the carton. Dispatched from Australia to every state. Free trade signup with ABN.`,
    jsonLd: [org(), { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, potentialAction: { "@type": "SearchAction", target: `${SITE.url}/shop?q={q}`, "query-input": "required name=q" } }],
    body: `${story(ctx)}
<section class="wrap facts-row" data-stagger><div><b data-count="${N}">${fmtN(N)}</b><span>lines in stock</span></div><div><b data-count="${CATEGORIES.length}">${CATEGORIES.length}</b><span>categories</span></div><div><b data-count="5">5</b><span>pallets minimum, mixed</span></div><div><b data-count="8">8</b><span>states &amp; territories</span></div></section>
<section class="wrap sec two-col"><div><p class="kicker">The range</p><h2 class="h-xl" data-split>Nine aisles of imported snacks.</h2><p class="lead" data-reveal>Every line sold by the carton, every price in Aussie dollars ex GST.</p></div>${catIndex()}</section>
${shelf(ctx, "Counter favourites", featured, ["/shop", "Full order sheet"])}
${process()}
<section class="dark"><div class="wrap sec"><p class="kicker">Why stores order from us</p><h2 class="h-xl" data-split>Imported range. Local stock. Straight answers.</h2><div class="why" data-stagger>${why.map(([a, b], i) => `<div><span class="num">0${i + 1}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join("")}</div></div></section>
${stateStrip()}
${signupBand(ctx)}
${shelf(ctx, "Brands people ask for", BRANDS.slice(0, 18).map((b) => PRODUCTS.find((p) => p.brand === b.name && p.img[0] === "c") ?? PRODUCTS.find((p) => p.brand === b.name && p.img) ?? PRODUCTS.find((p) => p.brand === b.name)!).filter(Boolean), ["/brands", "All brands"])}`,
  };
}

// ---------- listings ----------
const PER_PAGE = 48;
function pager(base: string, page: number, pages: number, q: string) {
  if (pages <= 1) return "";
  const href = (n: number) => `${base}?${new URLSearchParams({ ...(q ? { q } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`.replace(/\?$/, "");
  const nums = [...new Set([1, page - 2, page - 1, page, page + 1, page + 2, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  let out = "", last = 0;
  for (const n of nums) { if (n - last > 1) out += `<span>…</span>`; out += n === page ? `<b aria-current="page">${n}</b>` : `<a href="${href(n)}">${n}</a>`; last = n; }
  return `<nav class="pager" aria-label="Pages">${page > 1 ? `<a href="${href(page - 1)}" rel="prev">← Prev</a>` : ""}${out}${page < pages ? `<a href="${href(page + 1)}" rel="next">Next →</a>` : ""}</nav>`;
}
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ");

function listing(ctx: Ctx, base: string, h1: string, all: Product[], o: { intro?: string; cat?: string; title?: string; desc?: string; jsonLd?: object[]; allowSearch?: boolean } = {}): Page {
  const q = (ctx.url.searchParams.get("q") ?? "").trim().slice(0, 60);
  const words = o.allowSearch && q ? norm(q).split(/\s+/).filter(Boolean) : [];
  const found = words.length ? all.filter((p) => { const h = norm(`${p.name} ${p.brand} ${p.size}`); return words.every((w) => h.includes(w)); }) : all;
  const rank = (p: Product) => (p.img[0] === "c" ? 0 : p.img ? 1 : 2);
  const items = [...found].sort((a, b) => rank(a) - rank(b)); // photographed lines first (stable sort keeps name order)
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, parseInt(ctx.url.searchParams.get("page") ?? "1", 10) || 1));
  const slice = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const path = base + (page > 1 ? `?page=${page}` : "");
  return {
    path, noindex: !!q, title: o.title ?? `${h1}${page > 1 ? ` — page ${page}` : ""}`,
    description: o.desc ?? `${h1}: ${items.length} imported lines by the carton for Australian retailers. Prices in AUD ex GST for registered businesses.`,
    jsonLd: [org(), ...(o.jsonLd ?? []), { "@context": "https://schema.org", "@type": "ItemList", numberOfItems: items.length, itemListElement: slice.map((p, i) => ({ "@type": "ListItem", position: (page - 1) * PER_PAGE + i + 1, url: `${SITE.url}/p/${p.slug}`, name: p.name })) }],
    body: `<section class="wrap sheet">
<aside class="side"><form action="/shop" role="search"><input type="search" name="q" value="${esc(q)}" placeholder="Search ${fmtN(N)} lines…" aria-label="Search products"></form>
<nav class="side-nav"><a href="/shop"${!o.cat && base === "/shop" ? ' aria-current="page"' : ""}>All products <span>${fmtN(N)}</span></a>${CATEGORIES.map((c) => `<a href="/c/${c.slug}"${o.cat === c.slug ? ' aria-current="page"' : ""}><i class="dot dot-${c.hue}"></i>${esc(c.name)} <span>${countByCat(c.slug)}</span></a>`).join("")}<a href="/brands"${base === "/brands" ? ' aria-current="page"' : ""}>Shop by brand <span>${BRANDS.length}</span></a></nav>
<div class="side-note small"><b>Minimum order</b> 5 pallets = ${MIN_CASES} mixed cartons.<br>Prices AUD ex GST. Freight quoted to your door.</div></aside>
<div class="sheet-main"><header class="sheet-head">${o.cat && !q ? `<div class="head-collage">${collage(o.cat, 5)}</div>` : ""}<h1 class="h-xl">${esc(q ? `“${q}”` : h1)}</h1>${o.intro && !q ? `<p class="muted">${esc(o.intro)}</p>` : ""}<p class="small muted">${fmtN(items.length)} products${pages > 1 ? ` · page ${page} of ${pages}` : ""}</p></header>
${ctx.buyer ? "" : `<div class="unlock"><span>Prices are for trade customers.</span><a class="btn btn-s" href="/signup?next=${encodeURIComponent(path)}">Sign up free — instant access</a><a class="ul" href="/login?next=${encodeURIComponent(path)}">Log in</a></div>`}
${slice.length ? `<ul class="rows">${slice.map((p) => productRow(ctx, p)).join("")}</ul>` : `<p class="empty">Nothing matches “${esc(q)}”. Try a brand name like Takis or Arizona.</p>`}
${pager(base, page, pages, q)}</div></section>`,
  };
}

export const shop = (ctx: Ctx) => listing(ctx, "/shop", "Wholesale order sheet", PRODUCTS, {
  intro: "Every line we stock, by the carton. Search by brand, flavour or size.", allowSearch: true,
  title: "Wholesale Snacks Order Sheet — All Imported Lines", desc: `Order sheet for ${fmtN(N)} imported snacks and drinks: lollies, chips, chocolate, soft drinks and more by the carton, for Australian businesses.`,
});

const CAT_COPY: Record<string, { title: string; intro: string }> = {
  lollies: { title: "Wholesale Lollies & Imported Candy Australia", intro: "American and international lollies by the carton — sours, gummies, taffy, freeze-dried, theatre boxes, peg bags and bulk bags for pick-and-mix." },
  drinks: { title: "Wholesale Imported Soft Drinks & Energy Drinks", intro: "US and international sodas, iced teas, bubble tea and energy drinks in full cartons — the fridge lines that pull people into a store." },
  chips: { title: "Wholesale American Chips & Savoury Snacks", intro: "Takis, Cheetos, Pringles flavours, Japanese ramen snacks, popcorn and jerky — imported savoury lines by the carton." },
  chocolate: { title: "Wholesale American Chocolate Bars & Dubai Chocolate", intro: "Reese's, Hershey's, Baby Ruth, 100 Grand, king-size bars, Dubai pistachio chocolate and Turkish delight." },
  novelty: { title: "Wholesale Novelty Candy & Kids' Lollies", intro: "Pez dispensers, candy toys and kids' counter lines that sell at the till." },
  "gum-mints": { title: "Wholesale Gum, Mints & Lozenges", intro: "Bubble gum, Hi-Chew, mints and lozenges in counter display boxes." },
  pantry: { title: "Wholesale American Cereal, Pop-Tarts & Pantry", intro: "US cereals, Pop-Tarts, Hostess cakes, Twinkies, Moon Pies, syrups and spreads." },
  biscuits: { title: "Wholesale Imported Biscuits & Cookies", intro: "Oreo flavours, Chips Ahoy, Lotus Biscoff and Griffin's biscuits from New Zealand." },
  pickles: { title: "Wholesale Pickles in a Pouch", intro: "Van Holten's and Alamo pickles — the viral counter snack." },
};
export function category(ctx: Ctx, slug: string): Page | null {
  const c = CAT.get(slug as never);
  if (!c) return null;
  const cc = CAT_COPY[slug]!;
  return listing(ctx, `/c/${slug}`, c.name, PRODUCTS.filter((p) => p.cat === slug), {
    cat: slug, intro: cc.intro, title: cc.title, desc: `${cc.intro} ${countByCat(slug)} lines for Australian retailers, dispatched from Australia.`.slice(0, 300),
    jsonLd: [crumbs([["Home", "/"], ["Shop", "/shop"], [c.name]])],
  });
}

export function brands(ctx: Ctx): Page {
  return {
    path: "/brands", title: "Imported Snack Brands We Wholesale in Australia", description: `${BRANDS.length} imported snack and drink brands by the carton: ${BRANDS.slice(0, 12).map((b) => b.name).join(", ")} and more.`,
    jsonLd: [org(), crumbs([["Home", "/"], ["Brands"]])],
    body: `<section class="pagehead"><div class="wrap"><p class="kicker">${BRANDS.length} brands</p><h1 data-split>Shop by brand</h1><p class="lead">The names your customers ask for, by the carton.</p></div></section>
<section class="wrap section"><ul class="brands" data-stagger>${BRANDS.map((b) => `<li><a href="/brand/${b.slug}"><b>${esc(b.name)}</b><span>${b.n} lines</span></a></li>`).join("")}</ul></section>`,
  };
}
export function brand(ctx: Ctx, slug: string): Page | null {
  const b = BRAND.get(slug);
  if (!b) return null;
  const items = PRODUCTS.filter((p) => p.brand === b.name);
  const cats = [...new Set(items.map((p) => CAT.get(p.cat)!.name.toLowerCase()))].slice(0, 3).join(", ");
  return listing(ctx, `/brand/${slug}`, `${b.name} wholesale`, items, {
    intro: `${b.n} ${b.name} lines (${cats}) by the carton, stocked in Australia.`,
    title: `${b.name} Wholesale Australia — ${b.n} Lines by the Carton`, desc: `Buy ${b.name} wholesale in Australia: ${b.n} lines by the carton, dispatched from our Australian warehouse to every state. Prices for ABN holders.`,
    jsonLd: [crumbs([["Home", "/"], ["Brands", "/brands"], [b.name]])],
  });
}

// ---------- product ----------
const CAT_USE: Record<string, string> = {
  lollies: "Works at the counter, in pick-and-mix walls and in party-supply aisles.",
  drinks: "A fridge line that draws people in — face it at eye level beside the energy drinks.",
  chips: "Hot imported chips sell fastest near the drinks fridge and at the counter.",
  chocolate: "Imported bars move best in a counter box beside the register.",
  novelty: "Kids' counter lines sell on impulse — keep them at child height near the till.",
  "gum-mints": "Counter boxes earn their space right at the register.",
  pantry: "American breakfast and pantry lines anchor an import aisle and bring repeat visits.",
  biscuits: "A steady seller in convenience and grocery imports aisles.",
  pickles: "A viral counter snack — stock it beside the chips and lollies.",
};
export function product(ctx: Ctx, slug: string): Page | null {
  const p = BY_SLUG.get(slug);
  if (!p) return null;
  const c = CAT.get(p.cat)!;
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.slug !== p.slug && (x.brand === p.brand || Math.abs(x.i - p.i) < 12)).slice(0, 12);
  const pack = p.bulk ? "a bulk bag or tub" : p.perCase > 1 ? `a carton of ${p.perCase}${p.size ? ` × ${p.size}` : ""}` : "single units";
  const desc = [
    `${p.name}${p.size ? ` (${p.size})` : ""} wholesale for Australian retailers, sold as ${pack}${p.brand ? ` from ${p.brand}` : ""}.`,
    `In stock in ${SITE.warehouse} and dispatched to every state and territory — mix it with any other lines to make up your ${MIN_CASES}-carton (5-pallet) order.`,
    CAT_USE[p.cat]!,
    p.energy ? "This is a formulated caffeinated beverage: lines we list are traded in Australia, where energy drinks must contain no more than 320 mg/L of caffeine (FSANZ Standard 2.6.4)." : "",
  ].filter(Boolean);
  const path = `/p/${p.slug}`;
  return {
    path, title: `${p.name}${p.size ? ` ${p.size}` : ""} Wholesale Australia`, image: p.img ? `${SITE.url}/products/${p.slug}.webp` : undefined, description: `${desc[0]} ${desc[1]}`.slice(0, 160),
    jsonLd: [{
      "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.slug, category: c.name, description: desc.join(" "),
      ...(p.img ? { image: `${SITE.url}/products/${p.slug}.webp` } : {}),
      ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}), ...(p.size ? { size: p.size } : {}),
    }, crumbs([["Home", "/"], [c.name, `/c/${c.slug}`], [p.name]])],
    body: `<section class="wrap pdp">
<div class="pdp-media" data-reveal="left">${label(p, "l")}${p.img.slice(1).startsWith("f:") ? `<p class="credit">Photo: <a href="https://world.openfoodfacts.org/product/${esc(p.img.slice(3))}" rel="nofollow">Open Food Facts</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/3.0/" rel="nofollow">CC BY-SA 3.0</a>. Packaging may differ from the photo.</p>` : ""}</div>
<div class="pdp-info" data-reveal="right"><nav class="crumbs"><a href="/shop">Shop</a> / <a href="/c/${c.slug}">${esc(c.name)}</a>${p.brand && BRAND.has(brandSlugOf(p)) ? ` / <a href="/brand/${brandSlugOf(p)}">${esc(p.brand)}</a>` : ""}</nav>
<p class="kicker">${esc(p.brand || c.name)}</p><h1 class="h-xl">${esc(p.name)}${p.size ? ` <span class="sz">${esc(p.size)}</span>` : ""}</h1>
${ctx.buyer ? `<p class="price"><span>From</span> <strong>${esc(aud(p.price))}</strong> <span>per ${p.bulk ? "bag/tub" : "carton"} · ex GST</span></p>
<div class="pdp-buy">${stepper(p)}<a class="btn" href="/cart">Quote cart →</a></div>` : `<div class="pdp-lock"><p><b>Trade price hidden.</b> Free signup for Australian businesses with an ABN — prices unlock instantly.</p><a class="btn" href="/signup?next=${encodeURIComponent(path)}">Sign up free →</a> <a class="ul" href="/login?next=${encodeURIComponent(path)}">Log in</a></div>`}
<dl class="spec"><div><dt>Category</dt><dd><a href="/c/${c.slug}">${esc(c.name)}</a></dd></div>${p.brand ? `<div><dt>Brand</dt><dd>${esc(p.brand)}</dd></div>` : ""}${p.size ? `<div><dt>Unit size</dt><dd>${esc(p.size)}</dd></div>` : ""}
<div><dt>Sold as</dt><dd>${esc(unitText(p))}</dd></div><div><dt>Minimum order</dt><dd>5 pallets (${MIN_CASES} mixed cartons)</dd></div><div><dt>Ships from</dt><dd>Australia — no customs or import fees</dd></div></dl>
<div class="prose">${desc.map((d) => `<p>${esc(d)}</p>`).join("")}</div></div></section>
${shelf(ctx, p.brand ? `More from ${p.brand} & ${c.short.toLowerCase()}` : `More ${c.short.toLowerCase()}`, related, [`/c/${c.slug}`, `All ${c.short.toLowerCase()}`])}`,
  };
}
const brandSlugOf = (p: Product) => p.brand.toLowerCase().replace(/&/g, " and ").replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- accounts ----------
const BUSINESS_TYPES = ["Convenience store / servo", "Milk bar / deli", "Discount or variety store", "Supermarket / grocery", "Lolly / candy shop", "Café / takeaway", "Vending operator", "Party supplies / gifts", "Online store", "Distributor / wholesaler", "Other"];
const safeNext = (n: string | null) => (n && /^\/[a-z0-9/_?=&%.-]*$/i.test(n) && !n.startsWith("//") ? n : "/shop");
const field = (name: string, lbl: string, type = "text", req = true, extra = "") =>
  `<label class="field"><span>${esc(lbl)}${req ? " *" : ""}</span><input name="${name}" type="${type}"${req ? " required" : ""} maxlength="200" ${extra}></label>`;
const turnstile = (ctx: Ctx) => (ctx.turnstile ? `<div class="cf-turnstile field wide" data-sitekey="${esc(ctx.turnstile)}"></div>` : "");

export function signup(ctx: Ctx): Page {
  const next = safeNext(ctx.url.searchParams.get("next"));
  return {
    path: "/signup", title: "Free Trade Account — See Wholesale Prices", description: "Register your Australian business with its ABN to see wholesale prices on imported snacks and drinks instantly.", hideBar: true,
    body: `<section class="wrap auth"><div class="auth-copy" data-reveal="left"><p class="kicker">Free trade account</p><h1 class="h-xl">See every price in under a minute.</h1>
<ul class="ticks"><li>Prices unlock instantly — no approval wait</li><li>For Australian businesses with an ABN</li><li>${fmtN(N)} imported lines by the carton</li><li>No fees, no lock-in, no card needed</li></ul></div>
<form class="order card pad" data-auth="signup" data-next="${esc(next)}"><div class="form-grid">
${field("business", "Business name")}${field("abn", "ABN", "text", true, 'inputmode="numeric" placeholder="11 digits" autocomplete="off"')}
${field("name", "Your name", "text", true, 'autocomplete="name"')}${field("phone", "Mobile / phone", "tel", true, 'autocomplete="tel"')}
${field("email", "Email", "email", true, 'autocomplete="email"')}${field("password", "Password (8+ characters)", "password", true, 'minlength="8" autocomplete="new-password"')}
<label class="field"><span>State *</span><select name="state" required><option value=""></option>${STATES.map((s) => `<option value="${s.code}">${esc(s.name)}</option>`).join("")}</select></label>
<label class="field"><span>Business type *</span><select name="businessType" required><option value=""></option>${BUSINESS_TYPES.map((b) => `<option>${esc(b)}</option>`).join("")}</select></label>
<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">${turnstile(ctx)}
</div><p class="small muted">By signing up you confirm you buy for resale or business use and agree to our <a href="/terms">terms of trade</a> and <a href="/privacy">privacy policy</a>.</p>
<p class="error" data-error role="alert" hidden></p><button class="btn" type="submit">Create account &amp; see prices →</button><p class="small">Already registered? <a href="/login?next=${encodeURIComponent(next)}">Log in</a></p></form></section>`,
  };
}
export function login(ctx: Ctx): Page {
  const next = safeNext(ctx.url.searchParams.get("next"));
  return {
    path: "/login", title: "Log in", description: "Log in to your trade account.", noindex: true, hideBar: true,
    body: `<section class="wrap auth auth-narrow"><form class="order card pad" data-auth="login" data-next="${esc(next)}"><h1 class="h-l">Log in</h1><div class="form-grid one">
${field("email", "Email", "email", true, 'autocomplete="email"')}${field("password", "Password", "password", true, 'autocomplete="current-password"')}</div>
<p class="error" data-error role="alert" hidden></p><button class="btn" type="submit">Log in →</button>
<p class="small">New here? <a href="/signup?next=${encodeURIComponent(next)}">Create a free trade account</a>. Forgot your password? Email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p></form></section>`,
  };
}

// ---------- cart ----------
export function cart(ctx: Ctx): Page {
  const b = ctx.buyer;
  const data: Record<string, [string, number, string]> = {};
  if (b) for (const p of PRODUCTS) data[p.slug] = [p.name + (p.size ? ` ${p.size}` : ""), p.price, unitText(p)];
  const pays = [["payid", "PayID / Osko", `up to ${aud(PAYID_MAX)}`], ["paypal", "PayPal", `up to ${aud(PAYPAL_MAX)}`], ["bank", "Bank transfer", "any amount"]];
  return {
    path: "/cart", title: "Quote cart", description: "Your wholesale quote cart.", noindex: true, hideBar: true, scriptData: b ? { products: data } : undefined,
    body: `<section class="pagehead"><div class="wrap"><h1 data-split>Quote cart</h1><p class="lead">Fill ${MIN_CASES} cartons (5 pallets), send the order, and we email back the confirmed price and freight to your door.</p></div></section>
${b ? `<section class="wrap section cart-grid"><div><div data-cart-lines class="lines"></div>
<form class="order" data-order hidden><h2>Delivery &amp; payment</h2><div class="form-grid">
<div class="field wide acct"><span>Ordering as</span><p><b>${esc(b.business)}</b> · ABN ${esc(b.abn)} · ${esc(b.name)} · ${esc(b.email)} · ${esc(b.phone)}</p></div>
<label class="field wide"><span>Delivery street address *</span><input name="address" required maxlength="300" autocomplete="street-address"></label>
<label class="field"><span>Suburb / town *</span><input name="suburb" required maxlength="80" autocomplete="address-level2"></label>
<label class="field"><span>State *</span><select name="state" required>${STATES.map((s) => `<option value="${s.code}"${s.code === b.state ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
<label class="field"><span>Postcode *</span><input name="postcode" required inputmode="numeric" pattern="\\d{4}" maxlength="4" autocomplete="postal-code"></label>
<label class="field"><span>Phone for the driver *</span><input name="phone" type="tel" required maxlength="40" value="${esc(b.phone)}"></label>
<fieldset class="field wide"><legend>Payment *</legend><div class="pay">${pays.map(([v, n, h]) => `<label data-pay="${v}"><input type="radio" name="payment" value="${v}" required> ${esc(n)} <small>${esc(h!)}</small></label>`).join("")}</div>
<p class="muted small">PayPal up to ${aud(PAYPAL_MAX)}, PayID up to ${aud(PAYID_MAX)}. Larger orders are paid by bank transfer. Payment details come with your confirmation email.</p></fieldset>
<label class="field"><span>I will pay by *</span><input name="payBy" type="date" required data-payby><small class="muted">Today or within the next ${MAX_PAY_DAYS} days.</small></label>
<label class="field wide"><span>Notes (loading dock, forklift, delivery hours…)</span><textarea name="notes" maxlength="2000" rows="3"></textarea></label>
<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">${turnstile(ctx)}
</div><p class="error" data-error role="alert" hidden></p><button class="btn" type="submit">Send order for confirmation →</button><p class="small muted">Nothing is charged now. We reply with the final price and freight.</p></form></div>
<aside class="summary"><h2>Summary</h2><dl><div><dt>Cartons</dt><dd data-total-cases>0</dd></div><div><dt>Pallets</dt><dd data-total-pallets>0</dd></div>
<div class="big"><dt>Subtotal ex GST</dt><dd data-subtotal>—</dd></div><div><dt>GST</dt><dd>Added on invoice</dd></div><div><dt>Freight</dt><dd>Quoted to your door</dd></div></dl>
<div class="prog"><span data-prog></span></div><p class="small" data-min-msg></p></aside></section>`
    : `<section class="wrap section center"><p class="lead">Log in or create a free trade account to see prices and build your order.</p><p><a class="btn" href="/signup?next=/cart">Sign up free →</a> <a class="ul" href="/login?next=/cart">Log in</a></p></section>`}`,
  };
}

export const thanks = (n: string): Page => ({
  path: "/thanks", title: "Order received", description: "Order received", noindex: true,
  body: `<section class="wrap section center thanks"><div class="sunmark" aria-hidden="true"></div><h1 class="h-xl">Order ${esc(n)} received — cheers!</h1><p class="lead">We've emailed you a copy. Within one business day we'll confirm stock, the final price and freight to your door, plus payment details.</p><a class="btn" href="/shop">Back to the order sheet</a></section>`,
});

// ---------- info pages ----------
const textPage = (path: string, h1: string, kicker: string, paras: string[], o: { noindex?: boolean; title?: string; desc?: string; jsonLd?: object[]; after?: string } = {}): Page => ({
  path, title: o.title ?? h1, description: o.desc ?? paras.find((p) => !p.startsWith("## "))!.slice(0, 160), noindex: o.noindex, jsonLd: [org(), ...(o.jsonLd ?? [])],
  body: `<section class="pagehead"><div class="wrap"><p class="kicker">${esc(kicker)}</p><h1 data-split>${esc(h1)}</h1></div></section>
<section class="wrap section prose">${paras.map((p) => (p.startsWith("## ") ? `<h2>${esc(p.slice(3))}</h2>` : `<p>${esc(p)}</p>`)).join("")}</section>${o.after ?? ""}`,
});

const DELIVERY_FAQ: [string, string][] = [
  ["Where do you deliver?", "Every Australian state and territory: NSW, Victoria, Queensland, WA, SA, Tasmania, the ACT and the Northern Territory, metro and regional."],
  ["How is freight priced?", "Freight depends on your postcode, the number of pallets and access at your site. We quote it with your order confirmation, before you pay."],
  ["What is the minimum order?", `5 pallets, which is ${MIN_CASES} cartons. Mix any lines you like.`],
  ["Do I pay customs or import duty?", "No. The stock is already in Australia, so there's no customs clearance or import paperwork on your side."],
  ["Are prices including GST?", "Prices are shown in Australian dollars excluding GST. GST is added on the tax invoice where it applies."],
  ["How do I pay?", `PayID/Osko for orders up to ${aud(PAYID_MAX)}, PayPal up to ${aud(PAYPAL_MAX)}, and bank transfer for any amount. You choose a pay-by date within 3 days.`],
];
export const delivery = () => textPage("/delivery", "Delivery & freight across Australia", "Delivery", [
  `We sell to registered Australian businesses only, from stock held in ${SITE.warehouse}. Orders ship by pallet freight to every state and territory — capital cities, regional towns, Tasmania and the Northern Territory.`,
  "## Minimum order", `5 pallets = ${MIN_CASES} cartons. Mix any lines and categories. The pallet meter at the top of every page shows how close you are.`,
  "## Freight", "Freight is quoted to your door once we have your order: we look at your postcode, the number of pallets and access at your site (forklift, loading dock or tailgate truck). You see the full amount before you pay.",
  "## Timing", "Orders are confirmed within one business day. After payment, pallets are packed and handed to the carrier — metro deliveries are typically quickest, with longer transit times to WA, the NT, Tasmania and remote areas.",
  "## Payment", `PayID/Osko for orders up to ${aud(PAYID_MAX)}, PayPal up to ${aud(PAYPAL_MAX)}, and bank transfer for any amount. You choose a pay-by date — today or within ${MAX_PAY_DAYS} days.`,
  "## Receiving your pallets", "Please check pallets on arrival and note any damage on the carrier's delivery docket, then email us photos within 48 hours.",
], { title: "Wholesale Snack Delivery & Freight Australia-wide", jsonLd: [faq(DELIVERY_FAQ)], after: `<section class="wrap section"><h2 class="h-l">Common questions</h2><dl class="faq">${DELIVERY_FAQ.map(([q, a]) => `<div><dt>${esc(q)}</dt><dd>${esc(a)}</dd></div>`).join("")}</dl></section>` });

export const compliance = () => textPage("/compliance", "Imported food compliance", "Selling imported snacks in Australia", [
  "Imported snacks are a fast-growing category in Australian stores — and the one most often pulled from shelves when labels or ingredients don't meet Australian rules. We build our range to keep that risk off your shelves.",
  "## What we check", "Lines on this site are lines already traded in Australia. Before they go into a quote, we check that the product carries an English label with Australian importer details, an allergen declaration and country-of-origin information.",
  "## Energy drinks", "In Australia, formulated caffeinated beverages must contain between 145 and 320 mg of caffeine per litre (FSANZ Standard 2.6.4). Many US energy drinks are stronger than that and can't be sold here. We only list energy drinks traded within that limit.",
  "## Recalls", "If a product we've supplied is recalled, we contact every buyer of that line using the details on their order and tell them what to do.",
  "## Your shelf", "As the retailer you're still responsible for how products are displayed and priced in your store. If you're unsure about a line, ask us before you order.",
], { title: "Imported Snack Compliance Australia — Labels, Caffeine, Recalls" });

export const about = () => textPage("/about", "About Snacks Distribution Wholesale", "About us", [
  `${SITE.name} supplies imported snacks and drinks to Australian businesses — convenience stores and servos, milk bars, discount and variety stores, lolly shops, cafés, vending operators and online sellers.`,
  `We hold ${fmtN(N)} lines across lollies, chocolate, chips, drinks, gum, biscuits and pantry, sold by the carton and shipped by the pallet from ${SITE.warehouse}.`,
  "We keep things simple: free trade signup with an ABN, prices visible straight away, one confirmed price including freight before you pay, and real people answering email.",
], { title: "About Us — Imported Snack Wholesaler Australia" });

export const howToOrder = () => textPage("/how-to-order", "How to order", "Ordering", [
  ...steps.flatMap(([a, b], i) => [`## ${i + 1}. ${a}`, b]),
], { title: "How to Order Wholesale Snacks — 5 Steps", desc: "How to order imported snacks wholesale in Australia: free ABN signup, fill five mixed pallets, send your quote, confirm freight and pay within 3 days." });

export const contact = (ctx: Ctx): Page => ({
  path: "/contact", title: "Contact", description: `Questions about wholesale imported snacks in Australia? Email ${SITE.email}.`, jsonLd: [org()],
  body: `<section class="pagehead"><div class="wrap"><p class="kicker">Contact</p><h1 data-split>Talk to a real person.</h1><p class="lead">Questions about a line, freight to your postcode or a large order? We reply within one business day.</p></div></section>
<section class="wrap section two"><form class="order" data-contact><div class="form-grid">
${field("name", "Your name")}${field("email", "Email", "email")}${field("business", "Business name", "text", false)}${field("phone", "Phone", "tel", false)}
<label class="field wide"><span>Message *</span><textarea name="message" required maxlength="3000" rows="6"></textarea></label>
<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">${turnstile(ctx)}</div>
<p class="error" data-error role="alert" hidden></p><button class="btn" type="submit">Send message →</button></form>
<div class="card pad"><h3>${SITE.name}</h3>${[SITE.company, SITE.abn, SITE.address1, SITE.address2].map(shown).some(Boolean) ? `<p>${[SITE.company, SITE.abn, SITE.address1, SITE.address2].map(shown).filter(Boolean).map(esc).join("<br>")}</p>` : ""}<p><a href="mailto:${SITE.email}">${SITE.email}</a>${SITE.phone ? `<br><a href="tel:${SITE.phone.replace(/\s/g, "")}">${esc(SITE.phone)}</a>` : ""}</p></div></section>`,
});

export const terms = () => textPage("/terms", "Terms of trade", "Legal", [
  `These terms apply to all orders placed with ${SITE.company} (${SITE.abn}) ("we") through ${SITE.domain}. We sell only to businesses with an Australian Business Number, for resale or business use.`,
  "## Prices and orders", `Prices are "from" prices per carton in Australian dollars, excluding GST and freight. Sending an order through the website is a request for a quote. A contract is formed when we confirm the order, final price and freight by email and you pay. Minimum order: 5 pallets (${MIN_CASES} cartons).`,
  "## Payment", `PayID/Osko for orders up to ${aud(PAYID_MAX)}, PayPal up to ${aud(PAYPAL_MAX)}, bank transfer for any amount. Payment is due by the pay-by date you choose (at most ${MAX_PAY_DAYS} days after the order). Goods remain our property until paid in full.`,
  "## Delivery and risk", "We deliver to business addresses in Australia. Delivery times are estimates. Risk passes to you on delivery. Report damage or shortages on the carrier's docket and to us within 48 hours with photos.",
  "## Australian Consumer Law", "Nothing in these terms excludes rights you have under the Australian Consumer Law that cannot be excluded.",
  "## Governing law", "[State or territory] law applies. [To be completed before launch.]",
], { noindex: true });
export const privacy = () => textPage("/privacy", "Privacy policy", "Legal", [
  `${SITE.company} handles personal information under the Privacy Act 1988 (Cth) and the Australian Privacy Principles.`,
  "We collect what you give us in the signup, order and contact forms — name, business name, ABN, email, phone, delivery address and order details — to run your trade account, answer you and fulfil orders. We keep tax records for as long as the law requires.",
  "Our website runs on Cloudflare and emails are sent through Resend; both may process data outside Australia. We use one login cookie and one local list for your quote cart. We also use Google Ads (Google LLC) to show ads and to measure whether a visit from an ad leads to a trade signup or order; Google may set cookies for this and process the data outside Australia. You can block these cookies in your browser or opt out of personalised ads at adssettings.google.com.",
  `To access or correct your information, or to make a complaint, email ${SITE.email}. If you're not satisfied with our answer you can contact the Office of the Australian Information Commissioner (oaic.gov.au).`,
], { noindex: true });

// ---------- local SEO pages ----------
const topPicks = () => [
  ...byBrand("lollies", ["Warheads", "Nerds", "Jolly Rancher", "Trolli"]), ...byBrand("drinks", ["Arizona", "Faygo", "Jarritos"]),
  ...byBrand("chips", ["Takis", "Cheetos"]), ...byBrand("chocolate", ["Reese's", "Hershey's"]),
];
export function statePage(ctx: Ctx, slug: string): Page | null {
  const s = STATES.find((x) => x.slug === slug);
  const city = s ? null : CITIES.find((c) => c.slug === slug);
  if (!s && !city) return null;
  const st = s ?? city!.state;
  const place = s ? s.name : city!.name;
  const h1 = s ? `Wholesale imported snacks — ${s.name}` : `Wholesale imported snacks in ${city!.name}`;
  const paras = s ? [
    `We supply convenience stores, servos, milk bars, discount stores and lolly shops across ${s.note} with ${fmtN(N)} imported snack and drink lines — from stock already in Australia.`,
    `Orders start at 5 pallets (${MIN_CASES} mixed cartons). We quote freight to your postcode in ${s.name} with your order confirmation, so you see the full landed cost before you pay.`,
    `Popular in ${s.code}: American lollies and sours, Takis and hot chips, Arizona iced teas, Faygo and Jarritos sodas, US chocolate bars and Japanese snacks.`,
  ] : [
    `${city!.name} retailers — convenience stores, servos, milk bars, discount stores, lolly shops and cafés — order imported snacks and drinks from us by the carton, delivered by pallet freight from ${SITE.warehouse}.`,
    `There's no customs or import paperwork: the stock is already in Australia. Mix any of our ${fmtN(N)} lines to reach 5 pallets (${MIN_CASES} cartons) and we'll confirm freight to your ${city!.name} address before you pay.`,
    `Freight to ${city!.name} is quoted on your postcode and site access (forklift, dock or tailgate). Prices are in AUD ex GST for registered businesses.`,
  ];
  const path = `/wholesale/${slug}`;
  return {
    path, title: s ? `Imported Snacks Wholesale ${s.name} (${s.code}) — Lollies, Chips, Drinks` : `Imported Snacks Wholesale ${city!.name} — American Lollies, Chips & Drinks`,
    description: `${h1}: ${fmtN(N)} American, Asian and European lollies, chips, chocolate and drinks by the carton, dispatched from Australia. Free trade signup with ABN.`.slice(0, 160),
    jsonLd: [{ ...org(), areaServed: { "@type": s ? "State" : "City", name: place } }, crumbs([["Home", "/"], ["Delivery", "/delivery"], [place]])],
    body: `<section class="wrap hero-text"><div><p class="kicker">${esc(st.code)} · We deliver here</p><h1 class="h-hero" data-split>${esc(h1)}</h1>
<p class="links"><a class="btn" href="${ctx.buyer ? "/shop" : "/signup"}">${ctx.buyer ? "Open the order sheet" : "Sign up free to see prices"} →</a><a class="ul" href="/delivery">Delivery &amp; freight</a></p></div>
<div class="prose" data-reveal>${paras.map((x) => `<p>${esc(x)}</p>`).join("")}${s ? `<p class="cities">Also serving ${s.cities.map((c) => `<a href="/wholesale/${c.toLowerCase().replace(/[^a-z]+/g, "-")}">${esc(c)}</a>`).join(", ")}.</p>` : `<p class="cities">More in <a href="/wholesale/${st.slug}">${esc(st.name)}</a>.</p>`}</div></section>
<section class="wrap sec two-col"><div><h2 class="h-xl" data-split>Nine aisles of imported snacks.</h2></div>${catIndex()}</section>
${shelf(ctx, `Best sellers for ${place}`, topPicks(), ["/shop", "Full order sheet"])}
${process()}`,
  };
}

export const notFound = (ctx: Ctx): Page => ({
  path: "/404", title: "Page not found", description: "Page not found", noindex: true, status: 404,
  body: `<section class="wrap section center"><div class="sunmark" aria-hidden="true"></div><h1 class="h-xl">This road doesn't go anywhere.</h1><p class="lead">Try the order sheet or search for a brand.</p><form action="/shop" class="search-big"><input type="search" name="q" placeholder="Takis, Arizona, Warheads…" aria-label="Search"><button class="btn">Search</button></form></section>`,
});

// ---------- buyer guides ----------
const fmtDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
export function guides(): Page {
  const list = guidesNewestFirst();
  return {
    path: "/guides", title: "Wholesale Snack Buying Guides for Australian Stores",
    description: "Practical guides for Australian retailers buying imported snacks and drinks wholesale: ordering, GST, freight, compliance and building a range that sells.",
    jsonLd: [org(), crumbs([["Home", "/"], ["Guides"]])],
    body: `<section class="pagehead"><div class="wrap"><p class="kicker">Buyer guides</p><h1 data-split>Wholesale snack buying guides</h1></div></section>
<section class="wrap section prose guide-list">${list.map((g) => `<article class="guide-item"><p class="small">${fmtDate(g.updated ?? g.published)}</p><h2><a href="/guides/${g.slug}">${esc(g.title)}</a></h2><p>${esc(g.excerpt)}</p><p><a href="/guides/${g.slug}">Read the guide →</a></p></article>`).join("")}</section>`,
  };
}
export function guide(slug: string): Page | null {
  const g = GUIDE_BY.get(slug);
  if (!g) return null;
  const url = `${SITE.url}/guides/${g.slug}`;
  const more = guidesNewestFirst().filter((x) => x.slug !== g.slug).slice(0, 3);
  return {
    path: `/guides/${g.slug}`, ogType: "article", rawTitle: !!g.seoTitle, title: g.seoTitle ?? g.title, description: g.description,
    jsonLd: [
      { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, datePublished: g.published, dateModified: g.updated ?? g.published, inLanguage: "en-AU", mainEntityOfPage: url, image: `${SITE.url}/og-default.jpg`, author: { "@type": "Organization", name: SITE.name, url: SITE.url }, publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/favicon.svg` } } },
      crumbs([["Home", "/"], ["Guides", "/guides"], [g.title]]),
    ],
    body: `<section class="pagehead"><div class="wrap"><p class="kicker"><a href="/guides">Buyer guides</a> · ${fmtDate(g.updated ?? g.published)}</p><h1 data-split>${esc(g.title)}</h1></div></section>
<section class="wrap section prose guide"><p class="lead">${esc(g.excerpt)}</p>${renderMd(g.body, (p) => p)}${more.length ? `<h2>More guides</h2><ul>${more.map((x) => `<li><a href="/guides/${x.slug}">${esc(x.title)}</a></li>`).join("")}</ul>` : ""}<p><a class="btn" href="/signup">Sign up free to see trade prices →</a></p></section>`,
  };
}
