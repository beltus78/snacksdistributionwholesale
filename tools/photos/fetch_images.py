# Download matched photos, cut the product out (rembg, isnet-general-use), save a 600px transparent WebP
# to public/products/<slug>.webp and record the source in tools/images.json. Re-runnable: skips finished slugs.
import json, io, os, sys, urllib.request
from PIL import Image, ImageStat, ImageFilter
from rembg import remove, new_session

REPO = '/home/claude/snacksdistributionwholesale'
OUT = f'{REPO}/public/products'
os.makedirs(OUT, exist_ok=True)
m = json.load(open('matches.json'))
done = json.load(open(f'{REPO}/tools/images.json')) if os.path.exists(f'{REPO}/tools/images.json') else {}
rejected = set(json.load(open('rejected.json'))) if os.path.exists('rejected.json') else set()
UA = {'User-Agent': 'SnacksDistributionWholesale/1.0 (sales@snacksdistributionwholesale.com)'}
session = new_session('isnet-general-use')

def get(url):
    if url.startswith('file://'): return open(url[7:], 'rb').read()
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()

def process(slug, v):
    im = Image.open(io.BytesIO(get(v['url'])))
    im = im.convert('RGBA')
    if min(im.size) < 180: return 'small'
    gray = im.convert('L'); st = ImageStat.Stat(gray)
    if st.mean[0] < 70 or st.stddev[0] < 25: return 'dark'
    if ImageStat.Stat(gray.resize((200, 200)).filter(ImageFilter.FIND_EDGES)).mean[0] < 6: return 'blurry'
    im.thumbnail((900, 900))
    cut = remove(im, session=session, post_process_mask=True)
    a = cut.split()[3]
    bb = a.point(lambda x: 255 if x > 40 else 0).getbbox()
    ok = False
    if bb:
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        c2 = cut.crop(bb)
        fill = sum(1 for p in c2.split()[3].getdata() if p > 128) / (c2.width * c2.height)
        area = w * h / (im.width * im.height)
        ok = area >= 0.18 and fill >= 0.6   # a solid pack shape, not a logo or a torn fragment
    if ok:
        c2.thumbnail((520, 520))
        canvas = Image.new('RGBA', (600, 600), (0, 0, 0, 0))
        canvas.alpha_composite(c2, ((600 - c2.width) // 2, (600 - c2.height) // 2))
        canvas.save(f'{OUT}/{slug}.webp', 'WEBP', quality=80, method=5)
        return 'c'
    # fallback: the original photo, centre-cropped to a square
    rgb = im.convert('RGB'); s = min(rgb.size)
    rgb = rgb.crop(((rgb.width - s) // 2, (rgb.height - s) // 2, (rgb.width + s) // 2, (rgb.height + s) // 2)).resize((600, 600))
    rgb.save(f'{OUT}/{slug}.webp', 'WEBP', quality=78, method=5)
    return 'p'

n = 0
for slug, v in m.items():
    if slug in done or slug in rejected: continue
    try: why = process(slug, v)
    except Exception as e: why = f'error {e}'
    if why in ('c', 'p'): done[slug] = why + ('o' if v['src'] == 'own' else 'f:' + v['src'][4:])
    else: rejected.add(slug); print('skip', slug, why, file=sys.stderr)
    n += 1
    if n % 25 == 0:
        json.dump(done, open(f'{REPO}/tools/images.json', 'w'), indent=0, sort_keys=True); json.dump(sorted(rejected), open('rejected.json', 'w'))
        print(n, len(done), file=sys.stderr)
json.dump(done, open(f'{REPO}/tools/images.json', 'w'), indent=0, sort_keys=True); json.dump(sorted(rejected), open('rejected.json', 'w'))
print('finished', len(done), 'images,', len(rejected), 'rejected')
