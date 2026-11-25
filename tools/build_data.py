# Builds src/data-products.json from the reviewed catalogue (Include = Yes rows).
# Usage: python3 tools/build_data.py tools/catalogue-review.json
import json, re, sys, collections
src = json.load(open(sys.argv[1]))
rows = [r for r in src if r.get('include') == 'Yes']
CAT = {'Lollies & Confectionery': 'lollies', 'Drinks': 'drinks', 'Chips & Savoury Snacks': 'chips', 'Chocolate': 'chocolate',
       'Biscuits & Cookies': 'biscuits', 'Gum & Mints': 'gum-mints', 'Breakfast & Pantry': 'pantry', 'Pickles': 'pickles', 'Novelty Candy': 'novelty'}
STOP = {'uk', 'eu', 'us', 'usa', 'japan', 'japanese', 'korean', 'korea', 'swedish', 'mini', 'big', 'sour', 'mega', '3d', '4d', 'bulk', 'the', 'new',
        'nz', 'asia', 'mexican', 'dutch', 'german', 'italian', 'thai', 'chinese', 'taiwan', 'giant', 'jumbo', 'american', 'authentic', 'original', 'freeze', 'dried'}
def toks(n): return re.findall(r"[A-Za-z0-9&'!.]+", n)
first = collections.Counter(); two = collections.Counter()
for r in rows:
    t = [w for w in toks(r['name'])]
    i = 0
    while i < len(t) - 1 and t[i].lower() in STOP: i += 1
    r['_t'] = t[i:]
    if r['_t']:
        first[r['_t'][0].lower()] += 1
        if len(r['_t']) > 1: two[(r['_t'][0] + ' ' + r['_t'][1]).lower()] += 1
for r in rows:
    t = r['_t']
    b = t[0] if t else 'Assorted'
    if len(t) > 1:
        k2 = (t[0] + ' ' + t[1]).lower()
        if two[k2] >= 4 and two[k2] >= 0.6 * first[t[0].lower()]: b = t[0] + ' ' + t[1]
        elif t[0] == '&' or (len(t) > 2 and t[1] == '&'): b = ' '.join(t[:3])
    if len(b) <= 2 or first[t[0].lower()] < 2 if t else True: b = b if t and first[t[0].lower()] >= 2 else ''
    if b.endswith('&') and len(t) > 2: b = ' '.join(t[:3])
    if b.lower() in ('ice', 'pop', 'super', 'sweet&sour') and len(t) > 1: b = t[0] + ' ' + t[1]
    r['brand'] = b
# Manual brand corrections (tools/brand-fixes.json): known brands from the name, junk guesses cleared.
import os
FIX = json.load(open('tools/brand-fixes.json')) if os.path.exists('tools/brand-fixes.json') else {'match': [], 'rename': {}, 'rename_prefix': {}}
for r in rows:
    m = next((b for pat, b in FIX['match'] if re.search(pat, r['name'], re.I)), None)
    if m is not None: r['brand'] = m; continue
    b = r['brand']
    if b in FIX['rename']: b = FIX['rename'][b]
    for pre, to in FIX.get('rename_prefix', {}).items():
        if b.startswith(pre): b = to
    r['brand'] = b
def slugify(s): return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', ' and ').replace("'", ''))).strip('-')
import os
IMG = json.load(open('tools/images.json')) if os.path.exists('tools/images.json') else {}
seen = collections.Counter(); out = []
for r in sorted(rows, key=lambda r: (r['cat'], r['name'])):
    size = f"{r['size']}{r['unit']}" if r['size'] else ''
    if size and r['size'] >= 1000 and r['size'] % 100 == 0: size = (f"{r['size']/1000:g}kg" if r['unit'] == 'g' else f"{r['size']/1000:g}L")
    base = slugify(f"{r['name']} {size}")[:90].strip('-')
    seen[base] += 1
    slug = base if seen[base] == 1 else f"{base}-{seen[base]}"
    energy = 1 if r['cat'] == 'Drinks' and re.search(r'ENERGY|MONSTER|RED BULL|\bC4\b|OXY SHRED|EL JEFE|KAMI ?KAZE|\bTNT\b|PRIME|BANG|CELSIUS|GHOST|REIGN', r['raw'], re.I) else 0
    # [slug, name, category, size, units per case, case price AUD ex GST, brand, bulk?, energy?, photo]
    out.append([slug, r['name'], CAT[r['cat']], size, r['case_qty'], r['case_price'], r['brand'], 1 if r['case_note'].startswith('Bulk') else 0, energy, IMG.get(slug, '')])
json.dump(out, open('src/data-products.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(out), collections.Counter(o[2] for o in out))
print(collections.Counter(o[6] for o in out).most_common(40))
print(sum(1 for o in out if not o[6]), 'without brand')
