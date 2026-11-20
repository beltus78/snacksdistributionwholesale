import json, urllib.request, urllib.parse, time, collections, sys
d=json.load(open('/home/claude/snacksdistributionwholesale/src/data-products.json'))
brands=collections.Counter(r[6] for r in d if r[6])
UA={'User-Agent':'SnacksDistributionWholesale/1.0 (sales@snacksdistributionwholesale.com)'}
def q(s, page):
    u="https://search.openfoodfacts.org/search?"+urllib.parse.urlencode({'q':s,'page_size':100,'page':page,'fields':'code,product_name,product_name_en,brands,quantity,image_front_url'})
    for attempt in range(4):
        try: return json.loads(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read())
        except Exception as e:
            print('retry',s,page,e,file=sys.stderr); time.sleep(10*(attempt+1))
    return {'hits':[]}
out={}
try: out=json.load(open('off.json'))
except Exception: pass
for b,n in brands.most_common():
    if b in out: continue
    hits=[]; pages=1 if n<15 else 3 if n<60 else 6
    for p in range(1,pages+1):
        r=q(b,p); h=[x for x in r.get('hits',[]) if x.get('image_front_url')]; hits+=h
        time.sleep(0.8)
        if len(r.get('hits',[]))<100: break
    out[b]=hits
    if len(out)%25==0: json.dump(out,open('off.json','w')); print(len(out),'/',len(brands),file=sys.stderr)
json.dump(out,open('off.json','w')); print('done',len(out),sum(len(v) for v in out.values()))
