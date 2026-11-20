# Match site products to photos: Beltus's own catalogue first (exoticsnackswholesales.com + EU site photos), then Open Food Facts.
# Strict: brand must match and the flavour/variant words must line up, so a product never shows another flavour's photo.
import json, re, sys, os
from rapidfuzz import fuzz

D = json.load(open('/home/claude/snacksdistributionwholesale/src/data-products.json'))
STOP = set("""wholesale case cases of can cans bottle bottles pack packs pk box boxes bag bags tub jar pouch carton x ct count pcs pc piece pieces
the and with a an in for usa us american imported import edition limited new size king share sharing bulk theatre theater peg hangsell
display unit units candy candies lolly lollies bar bars snack snacks ml g kg oz fl l lb lbs gram grams swedish uk eu japan japanese korean korea halal flavour flavor flavoured flavored family hang sell""".split())
SIZE = re.compile(r'(\d+(?:[.,]\d+)?)\s*(kg|g|gr|gm|ml|l|ltr|fl\.?\s?oz|oz|lbs?)\b', re.I)

def size_of(s):
    m = SIZE.search(s or '')
    if not m: return None
    v = float(m.group(1).replace(',', '.')); u = m.group(2).lower().replace(' ', '').replace('.', '')
    return v * {'kg': 1000, 'g': 1, 'gr': 1, 'gm': 1, 'ml': 1, 'l': 1000, 'ltr': 1000, 'floz': 29.57, 'oz': 28.35, 'lb': 453.6, 'lbs': 453.6}[u]

def toks(s, brand=''):
    s = (s or '').lower().replace('&', ' and ').replace("'", '').replace('’', '')
    s = SIZE.sub(' ', s)
    t = re.findall(r'[a-z]+|\d+', s)
    bt = set(re.findall(r'[a-z]+|\d+', brand.lower().replace("'", '')))
    return [w for w in t if w not in STOP and w not in bt and len(w) > 1]

def score(ours, brand, size, theirs_name, theirs_brand, theirs_size):
    b = brand.lower().replace("'", '')
    tb = f"{theirs_brand or ''} {theirs_name or ''}".lower().replace("'", '').replace('’', '')
    if not b or b.split()[0] not in tb: return 0
    a = toks(ours, brand); c = toks(theirs_name, brand)
    if not a or not c: return 0
    sa, sc = set(a), set(c)
    inter = sa & sc
    if len(inter) / len(sa) < (1.0 if len(sa) <= 4 else 0.8): return 0          # our flavour words must be in their name
    if len(sc - sa) > max(2, len(sa) // 2 + 1): return 0       # they mustn't be a different, longer variant
    if len(sa) <= 1 and b.split()[0] not in (theirs_name or '').lower().replace("'", ''): return 0  # too generic: their name must carry our brand
    s = fuzz.token_set_ratio(' '.join(a), ' '.join(c))
    if s < 82: return 0
    if size and theirs_size:
        r = theirs_size / size
        if not (0.8 <= r <= 1.25): s -= 25
    return s

# ---- own catalogue (Woo store + EU site photos taken from it)
own = []
for w in json.load(open('woo.json')):
    if w['imgs']: own.append((w['name'], w['imgs'][0], 'own'))
EU = '/home/claude/tropicalsnackswholesale'
eu = json.load(open(f'{EU}/src/data-products.json'))
for p in eu:
    slug = p.get('slug') or p.get('s') if isinstance(p, dict) else p[0]
    name = p.get('name') if isinstance(p, dict) else p[1]
    f = f'{EU}/public/products/{slug}-0-md.webp'
    if os.path.exists(f): own.append((name, 'file://' + f, 'own'))

off = json.load(open('off.json'))
if os.path.exists('off2.json'):
    for b, hs in json.load(open('off2.json')).items(): off.setdefault(b, []).extend(hs)
res = {}
for r in D:
    slug, name, cat, size_s, per, price, brand = r[:7]
    size = size_of(size_s)
    best = (0, None, None)
    for n, url, src in own:
        if not brand: break
        s = score(name, brand, size, n, '', size_of(n))
        if s > best[0]: best = (s + 3, url, src)
    for h in off.get(brand, []):
        n = h.get('product_name_en') or h.get('product_name') or ''
        s = score(name, brand, size, n, ' '.join(h.get('brands') or []) if isinstance(h.get('brands'), list) else (h.get('brands') or ''), size_of(h.get('quantity') or n))
        if s > best[0]: best = (s, h['image_front_url'].replace('.400.jpg', '.full.jpg') if False else h['image_front_url'], 'off:' + h.get('code', ''))
    if best[1] and best[0] >= 82: res[slug] = {'url': best[1], 'src': best[2], 'score': best[0], 'name': name}
json.dump(res, open('matches.json', 'w'), indent=0)
from collections import Counter
print(len(res), 'of', len(D), Counter(v['src'][:3] for v in res.values()))
