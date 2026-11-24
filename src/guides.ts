// Buyer guides (SEO articles). English only — served at /guides and /guides/<slug> (en-AU).
// The automated SEO task appends new guides to GUIDES.
//
// Body format (simple markdown): "## " / "### " headings, blank line between paragraphs,
// "- " bullet lists, "1. " numbered lists, **bold**, *italic*, [text](/path). Internal paths are
// written as site paths (e.g. /shop, /c/lollies, /wholesale/nsw).
// Every internal link must point to a page that exists (see src/index.ts route()).
// Never invent prices, statistics, reviews or legal guarantees. Regulatory content must cite the
// regulation and stay general ("check with your authority").

export type Guide = {
  slug: string;
  title: string; // H1
  seoTitle?: string; // full <title> used as-is, ≤ 65 chars (otherwise the H1 + " | Snacks Distribution Wholesale")
  description: string; // meta description, 140–160 chars
  excerpt: string; // 1–2 sentences for the guides index
  published: string; // YYYY-MM-DD
  updated?: string; // YYYY-MM-DD
  body: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-buy-imported-snacks-wholesale-australia",
    title: "How to Buy Imported Snacks Wholesale in Australia: ABN, Pallets, GST and Freight",
    seoTitle: "How to Buy Imported Snacks Wholesale in Australia",
    description: "A step-by-step guide for Australian retailers buying imported snacks and drinks wholesale: trade signup with an ABN, mixed pallets, GST, payment and freight.",
    excerpt: "Imported lollies, chips and drinks are some of the best-selling lines in Australian convenience and variety stores. Here is how buying them wholesale works, step by step.",
    published: "2026-11-20",
    body: `Walk into almost any servo, milk bar, variety store or lolly shop in Australia and you will find a wall of imported snacks: American candy, Korean ramen, Japanese chocolate, limited-edition sodas. For many stores they are now a core category, with strong margins and customers who come back for new flavours.

Buying them wholesale is straightforward once you know how it works. This guide covers the process from sign-up to delivered pallets.

## Who can buy wholesale?

Wholesale suppliers sell to registered businesses, not to the public. Typical buyers include:

- Convenience stores, servos and milk bars
- Discount and variety stores, and lolly or "candy" shops
- Cafés, takeaways and gift shops
- Vending and office-snack operators
- Online shops and market stallholders

You will need an active **ABN**. On our site the ABN is checked when you sign up, and prices unlock straight away — there is no waiting for approval. [Sign up free](/signup) to see trade prices.

## Step 1: Understand cartons and pallets

Imported snacks are sold by the **carton** (for example a carton of 12 bars or 24 cans), and orders ship by the **pallet**. Our minimum order is 5 pallets, which is 250 cartons, and you can mix any lines across every category. A mixed order lets one delivery cover your lollies, chocolate, chips, drinks and pantry lines at once.

Tips for building a first order:

- Start with proven sellers in each category, then add a few new or limited lines.
- Balance bulky, light lines like chips with dense ones like drinks.
- Think about turnover: check best-before dates and order quantities you can sell through.

## Step 2: Check prices and GST

Trade prices are shown in Australian dollars **excluding GST**. GST is added on the tax invoice where it applies, and if your business is registered for GST you may be able to claim it back as an input tax credit — your accountant can confirm. Freight is quoted separately once your order is in.

## Step 3: Send your order and choose how to pay

You add cartons to a quote cart and send the order without paying online. Payment options for trade orders typically include:

- **PayID / Osko** — fast bank-to-bank payment, which we accept for orders up to A$10,000.
- **PayPal** — convenient for smaller orders, up to A$3,000.
- **Bank transfer** — for any amount.

You choose a pay-by date within three days. We then email the final price and the freight cost to your door, and nothing is charged before you see it.

## Step 4: Freight to your door

Pallet freight is priced on your postcode, the number of pallets and access at your site. A loading dock or forklift keeps costs down; a tailgate truck can lower pallets to the ground where there is no dock. Delivery covers every state and territory — capital cities, regional towns, [Tasmania](/wholesale/tasmania), the [Northern Territory](/wholesale/northern-territory) and [Western Australia](/wholesale/western-australia) — with longer transit times for remote areas. See [delivery and freight](/delivery) for details.

Because our stock is already held in Australia, there is **no customs clearance or import paperwork** on your side.

## Step 5: Check compliance before you stock

Imported food sold in Australia must meet the Australia New Zealand Food Standards Code — English labelling, allergen declarations, country of origin and, for energy drinks, a legal caffeine range. Products bought from an established Australian wholesaler should already meet these rules, but it is worth understanding them. Read our [imported food compliance](/compliance) page and our guide to [stocking an imported snack range](/guides/imported-snack-range-australian-convenience-store).

## Ready to order?

[Sign up free](/signup) with your ABN, browse the full [order sheet](/shop) or start with [lollies](/c/lollies), [chocolate](/c/chocolate) and [drinks](/c/drinks), and fill five pallets. Read [how to order](/how-to-order) for the full process, or [contact us](/contact) with any question.

*General information only — not tax or legal advice.*`,
  },
  {
    slug: "imported-snack-range-australian-convenience-store",
    title: "How to Build an Imported Snack Range for an Australian Convenience Store",
    seoTitle: "Building an Imported Snack Range for Your Store (Australia)",
    description: "How Australian convenience, variety and lolly stores can plan an imported snack range: best categories, shelf placement, energy drink rules and reordering.",
    excerpt: "Imported snacks can lift basket size and bring customers back — if the range is planned. A practical guide to choosing categories, placing stock and reordering.",
    published: "2026-11-20",
    body: `Imported snacks have become a destination category for many Australian stores. Customers — often teenagers and young adults who discovered the products online — will travel for a flavour they saw on social media. But an imported range only works if it is planned: the wrong mix ties up cash and shelf space, while the right one turns over quickly at good margins.

This guide walks through how to plan a range for a convenience store, servo, milk bar, variety store or lolly shop.

## Start with the categories that move

Most successful imported ranges are built around a handful of core categories:

- **[Lollies and confectionery](/c/lollies)** — gummies, sours, taffy and theatre boxes. Small, colourful and ideal near the counter.
- **[Chocolate](/c/chocolate)** — American bars, king sizes and trend lines such as Dubai-style chocolate.
- **[Chips and savoury snacks](/c/chips)** — hot chips, unusual crisp flavours, popcorn and jerky.
- **[Drinks](/c/drinks)** — sodas, iced teas and energy drinks, the category customers most often buy on impulse.
- **[Novelty candy](/c/novelty)** — toy candy and dispensers that appeal to kids and gift buyers.

Add [gum and mints](/c/gum-mints), [biscuits](/c/biscuits) and [breakfast and pantry](/c/pantry) lines such as US cereals once the core is working.

## Give the range a home

Imported snacks sell best when customers can see them as a range rather than scattered through the store:

- **A dedicated bay or wall** signals "this shop has the imported stuff" and becomes a reason to visit.
- **Counter units** for small lollies and novelty lines drive impulse sales.
- **A fridge door for imported drinks** — chilled stock sells far faster than warm shelf stock.
- **Clear price tickets** — many imported lines are premium-priced, and customers are more comfortable when the price is visible.

## Mix proven sellers with new lines

A good rule of thumb is to keep most of the range in steady sellers and rotate a smaller share of new or limited-edition flavours. The new lines create interest and social-media buzz; the steady lines pay the rent. When a new line sells through quickly, move it into the core.

## Know the energy drink rule

Energy drinks are one of the biggest imported categories, but they are also where most compliance problems happen. In Australia, formulated caffeinated beverages must contain between **145 and 320 mg of caffeine per litre** under Standard 2.6.4 of the Food Standards Code, and their labels carry specific advisory statements. Many US energy drinks are stronger than the Australian limit and cannot legally be sold here.

Buy energy drinks only from suppliers who list lines within the limit. Our [compliance page](/compliance) explains what we check before a product goes on our order sheet.

## Watch labels, allergens and dates

Imported food sold in Australia must carry an English label with an Australian importer or supplier, allergen information and country-of-origin details. When stock arrives, check that labels are intact and best-before dates suit your sales pace. If a product is ever recalled, a good wholesaler will contact you with instructions.

## Plan your reorders

Imported stock is not always replaced instantly, so reorder before you run out of your best sellers:

1. Track what sells each week, even with a simple tally.
2. Reorder your top sellers when you reach about half of your last order.
3. Use each new order to test a few new lines in small quantities.
4. Drop lines that have not moved after a reasonable period.

Because a wholesale order is mixed by the carton, a single 5-pallet order can restock your best sellers and test new lines at the same time.

## Freight and timing

Stores in capital cities usually receive pallets fastest, while regional areas, WA, the NT and Tasmania take longer. Factor that into your reorder timing — see [delivery and freight](/delivery), or the page for your state such as [New South Wales](/wholesale/nsw), [Victoria](/wholesale/victoria) or [Queensland](/wholesale/queensland).

## Get started

[Sign up free](/signup) with your ABN to see trade prices, then build your range from the full [order sheet](/shop). New to wholesale buying? Read [how to buy imported snacks wholesale in Australia](/guides/how-to-buy-imported-snacks-wholesale-australia) or [contact us](/contact).`,
  },
  {
    slug: "christmas-summer-stock-imported-snacks-australian-retailers",
    title: "Christmas and Summer Holiday Stock: An Imported Snacks Buying Guide for Australian Retailers",
    seoTitle: "Christmas Snack Stock for Australian Retailers: Buying Guide",
    description: "Plan Christmas and summer holiday stock of imported lollies, chocolate, chips and drinks: heat-safe ranging, timing, freight over the break and display ideas.",
    excerpt: "An Australian Christmas is a summer Christmas. Here is how servos, milk bars, lolly shops and convenience stores can plan imported snack stock for the busiest — and hottest — stretch of the year.",
    published: "2026-11-24",
    body: `In much of the world, Christmas snacks mean chocolate by the fire. In Australia it means a hot shop, a long run of public holidays and the summer school holidays all landing at once. For servos, milk bars, lolly shops, convenience stores and gift shops, late November to the end of January is one long trading season — and imported snacks are one of the easiest ways to give it a lift.

This guide covers how to plan your range, when to order, how to look after stock in the heat and how to keep shelves full while freight slows down over the break.

## Three peaks, not one

It helps to think of the season as three overlapping peaks:

1. **Gifting (late November to Christmas Eve).** Shoppers want stocking fillers, Secret Santa gifts and treats for teachers, colleagues and visitors. Novelty, colourful and "you can't get this at the supermarket" products do best.
2. **Entertaining (Christmas to New Year).** Bigger packs, chips, lollies to share and drinks for barbecues, cricket and the beach.
3. **Summer holidays (January).** Families on the road and kids at home: cold drinks, chips and grab-and-go lollies through servos, holiday towns and tourist strips.

Plan stock for all three rather than one Christmas order, and your shelves won't empty in the week before Christmas only to sit full of the wrong things in January.

## Ranging for a summer Christmas

### Lollies and novelty

[Lollies](/c/lollies) are the safest bet for summer: most travel well in warm weather and work for both gifting and holiday grazing. Sour, chewy and gummy lines from overseas give stocking fillers and pick-and-mix displays something different. [Novelty](/c/novelty) products — candy toys, dispensers, bright packaging — are made for gifting and sit well at the counter.

### Chocolate: buy it, but plan for heat

Imported [chocolate](/c/chocolate) sells strongly before Christmas, but it is the category most affected by an Australian summer. A few practical rules:

- Order chocolate early in the season and plan to sell most of it before Christmas, rather than holding large amounts into January.
- Store it somewhere cool, away from shopfront windows, fridge exhaust air and hot back rooms.
- Keep chocolate away from the front of the shop on hot days; put lollies and chips in the sunniest spots instead.
- Check every carton on arrival and before it goes on the shelf for bloom or soft packs.

If your shop has no air conditioning, lean your range towards lollies, chips, biscuits and drinks.

### Chips and biscuits

Imported [chips](/c/chips) in flavours not found in Australian supermarkets sell for parties and road trips, and they cope with warm weather better than chocolate. [Biscuits](/c/biscuits) and pantry treats fill gift baskets and hampers.

### Drinks

[Drinks](/c/drinks) carry the summer: imported soft drinks and novelty flavours sell in fridges all through January. Energy drinks are popular too, but caffeine limits and labelling rules apply in Australia — our [compliance page](/compliance) explains how we handle the Food Standards Code, and our guide to the [imported snack range for a convenience store](/guides/imported-snack-range-australian-convenience-store) goes further into ranging drinks.

## Timing your orders

Christmas is not the time to discover that a pallet is still on the road. Work backwards from your peak:

- **Gifting stock** should be on the shelf by early December at the latest.
- **Entertaining and holiday stock** should arrive before Christmas, because many carriers run reduced services between Christmas Day and New Year, and regional and remote deliveries can take longer.
- **January top-ups** are best ordered before the break if you can hold the stock, rather than relying on a delivery in the first week of January.

Delivery times differ between capital cities, regional towns and remote areas such as the Northern Territory, northern Western Australia and Tasmania. Check our [delivery page](/delivery) and plan extra time if you are outside a capital city. State pages such as [Queensland](/wholesale/queensland), [Western Australia](/wholesale/western-australia) and [Northern Territory](/wholesale/northern-territory) have more on delivery to each area.

## Using a full order well

Our minimum order is five pallets of mixed cartons, so it pays to plan one well-balanced order instead of several small ones. A seasonal order might mix:

- lollies and novelty for gifting and the counter;
- chocolate sized to what you can sell before Christmas;
- chips and biscuits for entertaining;
- drinks for the fridge through January.

Smaller shops sometimes split an order with another local business — a servo and a milk bar, or two lolly shops in different towns — so each gets a varied range. Just agree in advance who receives the delivery and how the stock is split.

## Display ideas that sell imported snacks

- **A "from overseas" end cap or table** near the entrance, refreshed weekly.
- **Price-pointed stocking filler bins** near the counter. Set your own prices by margin; shoppers like quick choices.
- **Hamper and gift basket builds** using biscuits, lollies, chocolate and drinks, ready-made for last-minute buyers.
- **Cold-drink fridge facings** for imported drinks at eye level, especially from Boxing Day onwards.
- **Holiday-town range shifts** in January: more drinks and chips, smaller chocolate facings.

## Labels and compliance

Food sold in Australia must meet the Australia New Zealand Food Standards Code, including English labelling and an Australian importer or supplier's details. Lines on our order sheet are lines already traded in Australia, and before they go into a quote we check for an English label with Australian importer details, an allergen declaration and country-of-origin information — the [compliance page](/compliance) has the details. As the retailer, you're still responsible for how products are stored, displayed and priced in your shop. As always, follow storage directions and best-before dates on each product.

## Get your seasonal order in

[Sign up free with your ABN](/signup) to see trade prices, then build your Christmas and summer order from the full [order sheet](/shop). New to ordering with us? Our guide on [how to buy imported snacks wholesale in Australia](/guides/how-to-buy-imported-snacks-wholesale-australia) walks through cartons, pallets, GST and payment.

*General information only — not legal or food-safety advice.*`,
  },
];

export const GUIDE_BY = new Map(GUIDES.map((g) => [g.slug, g]));
export const guidesNewestFirst = () => GUIDES.slice().sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title));

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function inline(s: string, href: (p: string) => string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, u: string) => {
      const raw = u.replace(/&amp;/g, "&");
      const ext = /^https?:\/\//.test(raw);
      return `<a href="${esc(ext ? raw : href(raw))}"${ext ? ' rel="noopener" target="_blank"' : ""}>${text}</a>`;
    });
}

/** Tiny markdown renderer for guide bodies (see format notes at the top). */
export function renderMd(src: string, href: (p: string) => string) {
  const out: string[] = [];
  let para: string[] = [];
  let list: { tag: "ul" | "ol"; items: string[] } | null = null;
  const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(" "), href)}</p>`); para = []; } };
  const flushL = () => { if (list) { out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i, href)}</li>`).join("")}</${list.tag}>`); list = null; } };
  for (const raw of src.split("\n")) {
    const l = raw.trim();
    if (!l) { flushP(); flushL(); continue; }
    const h = l.match(/^(#{2,3}) (.+)$/);
    if (h) { flushP(); flushL(); out.push(`<h${h[1]!.length}>${inline(h[2]!, href)}</h${h[1]!.length}>`); continue; }
    const ul = l.match(/^- (.+)$/);
    const ol = l.match(/^\d+\. (.+)$/);
    if (ul || ol) {
      flushP();
      const tag = ul ? "ul" : "ol";
      if (list && list.tag !== tag) flushL();
      list ??= { tag, items: [] };
      list.items.push((ul ?? ol)![1]!);
      continue;
    }
    flushL();
    para.push(l);
  }
  flushP(); flushL();
  return out.join("");
}

/** Internal links used in a guide body (for checks). */
export const linksIn = (body: string) => [...body.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]!);
