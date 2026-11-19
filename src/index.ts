import { BRANDS, BY_SLUG, CATEGORIES, CITIES, MAX_PAY_DAYS, MIN_CASES, PAYID_MAX, PAYPAL_MAX, PAY_NAMES, PAYMENT_METHODS, PRODUCTS, SITE, STATES, STATE_CODES, allowedPayments, aud, type PaymentMethod } from "./catalog";
import { checkPassword, clearCookie, createSession, currentBuyer, endSession, formatAbn, hashPassword, validAbn, type Buyer } from "./auth";
import { esc, layout, type Ctx, type Page } from "./html";
import * as P from "./pages";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SALES_EMAIL: string;
  EMAIL_FROM: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET?: string;
  CF_BEACON_TOKEN?: string;
  GOOGLE_SITE_VERIFICATION?: string;
}

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.hostname.startsWith("www.")) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : "/";

    if (req.method === "POST") {
      if (path === "/api/signup") return signupApi(req, env);
      if (path === "/api/login") return loginApi(req, env);
      if (path === "/api/logout") { await endSession(req, env.DB); return new Response(null, { status: 303, headers: { location: "/", "set-cookie": clearCookie } }); }
      if (path === "/api/order") return orderApi(req, env);
      if (path === "/api/contact") return contactApi(req, env);
      return json({ ok: false }, 405);
    }
    if (path === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /cart\nDisallow: /login\nSitemap: ${SITE.url}/sitemap.xml\n`, { headers: { "content-type": "text/plain" } });
    if (path === "/sitemap.xml") return sitemap();
    if (/\.[a-z0-9]+$/i.test(path)) return env.ASSETS.fetch(req);

    const buyer = await currentBuyer(req, env.DB);
    const ctx: Ctx = { buyer, url, turnstile: env.TURNSTILE_SITE_KEY, beacon: env.CF_BEACON_TOKEN, gsc: env.GOOGLE_SITE_VERIFICATION };
    if ((path === "/signup" || path === "/login") && buyer) return Response.redirect(new URL(url.searchParams.get("next")?.startsWith("/") ? url.searchParams.get("next")! : "/shop", url).toString(), 302);
    const page = route(ctx, path) ?? P.notFound(ctx);
    return new Response(layout(ctx, page), {
      status: page.status ?? 200,
      headers: {
        "content-type": "text/html; charset=utf-8", "content-language": "en-AU",
        // Pages differ for logged-in buyers (prices), so they are never cached publicly.
        "cache-control": "private, no-cache", vary: "Cookie",
        "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin",
      },
    });
  },
};

function route(ctx: Ctx, path: string): Page | null {
  switch (path) {
    case "/": return P.home(ctx);
    case "/shop": return P.shop(ctx);
    case "/brands": return P.brands(ctx);
    case "/cart": return P.cart(ctx);
    case "/signup": return P.signup(ctx);
    case "/login": return P.login(ctx);
    case "/contact": return P.contact(ctx);
    case "/delivery": return P.delivery();
    case "/compliance": return P.compliance();
    case "/about": return P.about();
    case "/how-to-order": return P.howToOrder();
    case "/terms": return P.terms();
    case "/privacy": return P.privacy();
    case "/thanks": return P.thanks((ctx.url.searchParams.get("n") ?? "").replace(/[^A-Z0-9-]/g, "").slice(0, 30));
  }
  let m;
  if ((m = path.match(/^\/c\/([a-z0-9-]+)$/))) return P.category(ctx, m[1]!);
  if ((m = path.match(/^\/p\/([a-z0-9-]+)$/))) return P.product(ctx, m[1]!);
  if ((m = path.match(/^\/brand\/([a-z0-9-]+)$/))) return P.brand(ctx, m[1]!);
  if ((m = path.match(/^\/wholesale\/([a-z-]+)$/))) return P.statePage(ctx, m[1]!);
  return null;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const paths = ["/", "/shop", "/brands", "/delivery", "/compliance", "/about", "/how-to-order", "/contact", "/signup",
    ...CATEGORIES.map((c) => `/c/${c.slug}`), ...BRANDS.map((b) => `/brand/${b.slug}`),
    ...STATES.map((s) => `/wholesale/${s.slug}`), ...CITIES.map((c) => `/wholesale/${c.slug}`), ...PRODUCTS.map((p) => `/p/${p.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${SITE.url}${p}</loc><lastmod>${today}</lastmod></url>`).join("")}</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" } });
}

// ---------- form helpers ----------
class UserError extends Error {}
const str = (v: unknown, max: number, required = true) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (required && !s) throw new UserError("Please fill in all required fields.");
  if (s.length > max) throw new UserError("One of the fields is too long.");
  return s;
};
const emailOf = (v: unknown) => {
  const s = str(v, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new UserError("Please enter a valid email address.");
  return s;
};
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const handle = async (fn: () => Promise<Response>) => {
  try { return await fn(); } catch (e) {
    if (e instanceof UserError) return json({ ok: false, error: e.message }, 400);
    console.error(e);
    return json({ ok: false, error: "Something went wrong on our side. Please try again or email " + SITE.email }, 500);
  }
};
async function human(env: Env, req: Request, d: Record<string, unknown>) {
  if (d["website"]) return false; // honeypot
  if (!env.TURNSTILE_SECRET) return true;
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(d["cf-turnstile-response"] ?? ""), remoteip: req.headers.get("cf-connecting-ip") ?? "" }),
  });
  const out = (await r.json()) as { success: boolean };
  if (!out.success) throw new UserError("Please complete the security check and try again.");
  return true;
}

// ---------- accounts ----------
function signupApi(req: Request, env: Env) {
  return handle(async () => {
    const d = (await req.json()) as Record<string, unknown>;
    if (!(await human(env, req, d))) return json({ ok: true });
    const abn = str(d["abn"], 20).replace(/\s/g, "");
    const b = {
      business: str(d["business"], 160), name: str(d["name"], 120), phone: str(d["phone"], 40), email: emailOf(d["email"]),
      state: str(d["state"], 3), business_type: str(d["businessType"], 60), password: str(d["password"], 200),
    };
    if (!validAbn(abn)) throw new UserError("That ABN doesn't look right — please check the 11 digits (you can look it up at abr.business.gov.au).");
    if (!STATE_CODES.includes(b.state)) throw new UserError("Please choose your state.");
    if (b.password.length < 8) throw new UserError("Please choose a password of at least 8 characters.");
    const exists = await env.DB.prepare("SELECT id FROM buyers WHERE email = ?").bind(b.email).first();
    if (exists) throw new UserError("There's already an account with this email — please log in instead.");
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO buyers (id, email, password_hash, business, abn, name, phone, state, business_type) VALUES (?,?,?,?,?,?,?,?,?)")
      .bind(id, b.email, await hashPassword(b.password), b.business, formatAbn(abn), b.name, b.phone, b.state, b.business_type).run();
    const cookie = await createSession(env.DB, id);
    await sendEmail(env, env.SALES_EMAIL, `New trade signup — ${b.business} (${b.state})`, mail("New trade account",
      fields([["Business", b.business], ["ABN", formatAbn(abn)], ["Name", b.name], ["Email", b.email], ["Phone", b.phone], ["State", b.state], ["Business type", b.business_type]])), b.email);
    return json({ ok: true }, 200, { "set-cookie": cookie });
  });
}
function loginApi(req: Request, env: Env) {
  return handle(async () => {
    const d = (await req.json()) as Record<string, unknown>;
    const email = emailOf(d["email"]), pw = str(d["password"], 200);
    const row = await env.DB.prepare("SELECT id, password_hash FROM buyers WHERE email = ?").bind(email).first<{ id: string; password_hash: string }>();
    if (!row || !(await checkPassword(pw, row.password_hash))) throw new UserError("Email or password is not right.");
    return json({ ok: true }, 200, { "set-cookie": await createSession(env.DB, row.id) });
  });
}

// ---------- orders ----------
function validPayBy(s: string) {
  const now = new Date();
  const lo = new Date(now); lo.setUTCDate(lo.getUTCDate() - 1);
  const hi = new Date(now); hi.setUTCDate(hi.getUTCDate() + MAX_PAY_DAYS + 1);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && s >= ymd(lo) && s <= ymd(hi);
}
function orderApi(req: Request, env: Env) {
  return handle(async () => {
    const buyer: Buyer | null = await currentBuyer(req, env.DB);
    if (!buyer) throw new UserError("Please log in again to send your order.");
    const d = (await req.json()) as Record<string, unknown>;
    if (!(await human(env, req, d))) return json({ ok: true, orderNumber: "SDW-OK" });
    const o = {
      address: str(d["address"], 300), suburb: str(d["suburb"], 80), state: str(d["state"], 3), postcode: str(d["postcode"], 4),
      phone: str(d["phone"], 40), payment: str(d["payment"], 10) as PaymentMethod, pay_by: str(d["payBy"], 10), notes: str(d["notes"], 2000, false) || null,
    };
    if (!STATE_CODES.includes(o.state)) throw new UserError("We deliver within Australia only — please choose a state.");
    if (!/^\d{4}$/.test(o.postcode)) throw new UserError("Please enter a 4-digit Australian postcode.");
    if (!(PAYMENT_METHODS as readonly string[]).includes(o.payment)) throw new UserError("Please choose a payment method.");
    if (!validPayBy(o.pay_by)) throw new UserError(`The pay-by date must be today or within the next ${MAX_PAY_DAYS} days.`);
    const raw = Array.isArray(d["items"]) ? (d["items"] as { slug: unknown; qty: unknown }[]) : [];
    if (!raw.length || raw.length > 500) throw new UserError("Your quote cart is empty.");
    const items = raw.map((i) => {
      const p = BY_SLUG.get(String(i.slug)); const qty = Math.floor(Number(i.qty));
      if (!p || !(qty >= 1 && qty <= 999)) throw new UserError("Your cart contains an item we no longer stock — please remove it.");
      return { slug: p.slug, name: p.name + (p.size ? ` ${p.size}` : ""), qty, unit_price: p.price, line_total: +(p.price * qty).toFixed(2) };
    });
    const total_cases = items.reduce((s, l) => s + l.qty, 0);
    const subtotal = +items.reduce((s, l) => s + l.line_total, 0).toFixed(2);
    if (total_cases < MIN_CASES) throw new UserError(`Minimum order is 5 pallets (${MIN_CASES} mixed cartons).`);
    if (!allowedPayments(subtotal).includes(o.payment)) throw new UserError(`PayPal is for orders up to ${aud(PAYPAL_MAX)} and PayID up to ${aud(PAYID_MAX)}. Please choose bank transfer.`);

    const order_number = `SDW-${new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" }).slice(2).replace(/-/g, "")}-${crypto.getRandomValues(new Uint32Array(1))[0]!.toString(36).slice(0, 5).toUpperCase()}`;
    // Saved first, emailed second — a failed email never loses an order.
    await env.DB.prepare(`INSERT INTO orders (id, order_number, buyer_id, business, abn, full_name, email, phone, address, suburb, state, postcode, payment, pay_by, notes, items, total_cases, subtotal)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(), order_number, buyer.id, buyer.business, buyer.abn, buyer.name, buyer.email, o.phone,
      o.address, o.suburb, o.state, o.postcode, o.payment, o.pay_by, o.notes, JSON.stringify(items), total_cases, subtotal).run();

    const rows: [string, unknown][] = [["Order", order_number], ["Business", buyer.business], ["ABN", buyer.abn], ["Name", buyer.name], ["Email", buyer.email], ["Phone", o.phone],
      ["Deliver to", `${o.address}, ${o.suburb} ${o.state} ${o.postcode}`], ["Payment", PAY_NAMES[o.payment]], ["Will pay by", o.pay_by], ["Notes", o.notes]];
    const lines = items.map((l) => `<tr><td style="border-bottom:1px solid #eee">${esc(l.name)}</td><td style="border-bottom:1px solid #eee">${l.qty}</td><td style="border-bottom:1px solid #eee">${esc(aud(l.unit_price))}</td><td style="border-bottom:1px solid #eee">${esc(aud(l.line_total))}</td></tr>`).join("");
    const table = `<table cellpadding="6" style="border-collapse:collapse;font-size:14px"><tr><th align="left">Product</th><th align="left">Cartons</th><th align="left">Per carton</th><th align="left">Line</th></tr>${lines}</table>
<p><b>Cartons:</b> ${total_cases} (${(total_cases / 50).toFixed(1)} pallets)<br><b>Subtotal:</b> ${esc(aud(subtotal))} ex GST. GST and freight are added on confirmation.</p>`;
    const [a, b] = await Promise.all([
      sendEmail(env, env.SALES_EMAIL, `New order ${order_number} — ${buyer.business} (${o.state} ${o.postcode})`, mail("New wholesale order", fields(rows) + table), buyer.email),
      sendEmail(env, buyer.email, `Order ${order_number} received — ${SITE.name}`, mail(`Thanks — order ${order_number} received`,
        `<p>We'll confirm stock, the final price and freight to ${esc(o.suburb)} ${esc(o.state)} ${esc(o.postcode)} within one business day, with ${esc(PAY_NAMES[o.payment])} payment details.</p>${table}`), env.SALES_EMAIL),
    ]);
    if (a && b) await env.DB.prepare("UPDATE orders SET email_sent = 1 WHERE order_number = ?").bind(order_number).run();
    return json({ ok: true, orderNumber: order_number });
  });
}

function contactApi(req: Request, env: Env) {
  return handle(async () => {
    const d = (await req.json()) as Record<string, unknown>;
    if (!(await human(env, req, d))) return json({ ok: true });
    const m = { name: str(d["name"], 120), email: emailOf(d["email"]), business: str(d["business"], 160, false) || null, phone: str(d["phone"], 40, false) || null, message: str(d["message"], 3000) };
    await env.DB.prepare("INSERT INTO contact_messages (id, name, email, business, phone, message) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(), m.name, m.email, m.business, m.phone, m.message).run();
    await sendEmail(env, env.SALES_EMAIL, `Website message from ${m.name}${m.business ? ` (${m.business})` : ""}`, mail("New contact message", fields([["Name", m.name], ["Email", m.email], ["Business", m.business], ["Phone", m.phone], ["Message", m.message]])), m.email);
    return json({ ok: true });
  });
}

// ---------- email ----------
const fields = (rows: [string, unknown][]) => rows.filter(([, v]) => v != null && v !== "").map(([k, v]) => `<p style="margin:0 0 6px"><b>${esc(k)}:</b> ${esc(v)}</p>`).join("");
const mail = (title: string, body: string) => `<!doctype html><html lang="en-AU"><body style="margin:0;background:#F4EBDD;font-family:Arial,sans-serif;color:#1D1A16">
<div style="max-width:620px;margin:0 auto;padding:28px 24px;background:#fff;border-top:6px solid #C4501E"><p style="font-weight:800;font-size:18px;margin:0">Snacks Distribution <span style="color:#C4501E">Wholesale</span></p>
<h1 style="font-size:21px">${esc(title)}</h1>${body}<hr style="border:none;border-top:1px solid #eee;margin:20px 0">
<p style="font-size:12px;color:#6b6358">${esc(SITE.company)} · ${esc(SITE.abn)} · ${esc(SITE.address1)}, ${esc(SITE.address2)} · ${SITE.email}</p></div></body></html>`;

async function sendEmail(env: Env, to: string, subject: string, htmlBody: string, replyTo?: string) {
  if (!env.RESEND_API_KEY) { console.warn(`Email not sent (no RESEND_API_KEY): ${subject}`); return false; }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, html: htmlBody, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!r.ok) console.error(`Resend ${r.status}: ${await r.text()}`);
    return r.ok;
  } catch (e) { console.error(e); return false; }
}
