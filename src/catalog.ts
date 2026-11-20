import DATA from "./data-products.json";

// ⚠️ Placeholders — replace with the real company details before launch (used on every page and in emails).
export const SITE = {
  name: "Snacks Distribution Wholesale",
  short: "Snacks Distribution",
  domain: "snacksdistributionwholesale.com",
  url: "https://snacksdistributionwholesale.com",
  company: "[Company name] Pty Ltd",
  abn: "[ABN 00 000 000 000]",
  address1: "[Warehouse street address]",
  address2: "[Suburb STATE Postcode], Australia",
  email: "sales@snacksdistributionwholesale.com",
  phone: "", // e.g. "+61 2 1234 5678" — phone/WhatsApp links appear once filled in
  warehouse: "our Australian warehouse", // e.g. "our Western Sydney warehouse" once the location is final
};

export type Product = {
  slug: string; name: string; cat: CategorySlug; size: string; perCase: number; price: number;
  brand: string; bulk: boolean; energy: boolean; i: number;
  /** Photo: "" none (label card). Otherwise "c" (cut-out) or "p" (square photo) + source: "o" own catalogue, "f:<barcode>" Open Food Facts (CC BY-SA, credited). */
  img: string;
};

export const CATEGORIES = [
  { slug: "lollies", name: "Lollies & Confectionery", short: "Lollies", hue: "ochre", line: "Gummies, sours, taffy, bulk bags and theatre boxes." },
  { slug: "drinks", name: "Drinks", short: "Drinks", hue: "sky", line: "Sodas, iced teas, energy drinks and juices by the carton." },
  { slug: "chips", name: "Chips & Savoury Snacks", short: "Chips", hue: "sun", line: "Hot chips, crisps, popcorn, jerky and ramen snacks." },
  { slug: "chocolate", name: "Chocolate", short: "Chocolate", hue: "cocoa", line: "US bars, king sizes, Dubai chocolate and Turkish delight." },
  { slug: "novelty", name: "Novelty Candy", short: "Novelty", hue: "pink", line: "Pez, toy candy and kids' counter lines." },
  { slug: "gum-mints", name: "Gum & Mints", short: "Gum & Mints", hue: "mint", line: "Bubble gum, mints and lozenges in counter boxes." },
  { slug: "pantry", name: "Breakfast & Pantry", short: "Pantry", hue: "wheat", line: "US cereals, Pop-Tarts, Hostess cakes and spreads." },
  { slug: "biscuits", name: "Biscuits & Cookies", short: "Biscuits", hue: "cream", line: "Oreo, Chips Ahoy, Lotus and Griffin's." },
  { slug: "pickles", name: "Pickles", short: "Pickles", hue: "gum", line: "Van Holten's and Alamo pickles in a pouch." },
] as const;
export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export const CAT = new Map(CATEGORIES.map((c) => [c.slug, c]));

type Row = [string, string, CategorySlug, string, number, number, string, number, number, string?];
export const PRODUCTS: Product[] = (DATA as unknown as Row[]).map((r, i) => ({
  slug: r[0], name: r[1], cat: r[2], size: r[3], perCase: r[4], price: r[5], brand: r[6], bulk: !!r[7], energy: !!r[8], i, img: r[9] ?? "",
}))
  .sort((a, b) => CATEGORIES.findIndex((c) => c.slug === a.cat) - CATEGORIES.findIndex((c) => c.slug === b.cat) || a.name.localeCompare(b.name))
  .map((p, i) => ({ ...p, i }));
export const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));
export const countByCat = (slug: string) => PRODUCTS.filter((p) => p.cat === slug).length;

/** Brands with enough lines for their own page. */
export const brandSlug = (b: string) => b.toLowerCase().replace(/&/g, " and ").replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const BRANDS = (() => {
  const m = new Map<string, { name: string; slug: string; n: number }>();
  for (const p of PRODUCTS) if (p.brand) { const s = brandSlug(p.brand); const e = m.get(s); if (e) e.n++; else m.set(s, { name: p.brand, slug: s, n: 1 }); }
  return [...m.values()].filter((b) => b.n >= 6).sort((a, b) => b.n - a.n);
})();
export const BRAND = new Map(BRANDS.map((b) => [b.slug, b]));

// ---------- order rules (shared with public/app.js) ----------
export const CASES_PER_PALLET = 50;
export const MIN_PALLETS = 5;
export const MIN_CASES = MIN_PALLETS * CASES_PER_PALLET; // 250 mixed cases
export const PAYPAL_MAX = 3000; // AUD ex GST
export const PAYID_MAX = 10000; // AUD ex GST — above this, bank transfer only
export const MAX_PAY_DAYS = 3;
export const PAYMENT_METHODS = ["payid", "paypal", "bank"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAY_NAMES: Record<PaymentMethod, string> = { payid: "PayID / Osko", paypal: "PayPal", bank: "Bank transfer (BSB & account)" };
export const allowedPayments = (subtotal: number): PaymentMethod[] =>
  PAYMENT_METHODS.filter((m) => (m === "paypal" ? subtotal <= PAYPAL_MAX : m === "payid" ? subtotal <= PAYID_MAX : true));

export const STATES = [
  { code: "NSW", slug: "nsw", name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong", "Central Coast"], note: "Sydney metro, the Hunter, the Illawarra and regional NSW" },
  { code: "VIC", slug: "victoria", name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo"], note: "Melbourne metro, Geelong and regional Victoria" },
  { code: "QLD", slug: "queensland", name: "Queensland", cities: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"], note: "South East Queensland and the coastal run to Far North Queensland" },
  { code: "WA", slug: "western-australia", name: "Western Australia", cities: ["Perth", "Bunbury", "Geraldton"], note: "Perth metro and regional WA" },
  { code: "SA", slug: "south-australia", name: "South Australia", cities: ["Adelaide", "Mount Gambier"], note: "Adelaide metro and regional SA" },
  { code: "TAS", slug: "tasmania", name: "Tasmania", cities: ["Hobart", "Launceston", "Devonport"], note: "Hobart, Launceston and the north-west coast via Bass Strait freight" },
  { code: "ACT", slug: "act", name: "Australian Capital Territory", cities: ["Canberra"], note: "Canberra and Queanbeyan" },
  { code: "NT", slug: "northern-territory", name: "Northern Territory", cities: ["Darwin", "Alice Springs"], note: "Darwin, Katherine and Alice Springs" },
] as const;
export const STATE_CODES: string[] = STATES.map((s) => s.code);
export const citySlug = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, "-");
export const CITIES = STATES.flatMap((s) => s.cities.map((c) => ({ name: c, slug: citySlug(c), state: s })));

export const aud = (n: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);
export const unitText = (p: Product) => (p.bulk ? "bulk bag / tub" : p.perCase > 1 ? `carton of ${p.perCase}` : "per unit");
