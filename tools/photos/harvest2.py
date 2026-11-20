# Targeted Open Food Facts search for each product still without a photo.
import json, urllib.request, urllib.parse, time, sys
d=json.load(open('/home/claude/snacksdistributionwholesale/src/data-products.json'))
m=json.load(open('matches.json'))
UA={'User-Agent':'SnacksDistributionWholesale/1.0 (sales@snacksdistributionwholesale.com)'}
out={}
try: out=json.load(open('off2.json'))
except Exception: pass
done=set(json.load(open('off2_done.json'))) if __import__('os').path.exists('off2_done.json') else set()
todo=[r for r in d if r[6] and r[0] not in m and r[0] not in done]
print(len(todo),'to search',file=sys.stderr)
import concurrent.futures as cf, threading
lock=threading.Lock()
def work(arg):
    i,r=arg
    u="https://search.openfoodfacts.org/search?"+urllib.parse.urlencode({'q':r[1],'page_size':10,'fields':'code,product_name,product_name_en,brands,quantity,image_front_url'})
    try: hits=[h for h in json.loads(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=40).read()).get('hits',[]) if h.get('image_front_url')]
    except Exception as e: print('err',e,file=sys.stderr); time.sleep(8); return
    with lock:
        out.setdefault(r[6],[]).extend(hits); done.add(r[0])
        if i%100==0:
            json.dump(out,open('off2.json','w')); json.dump(list(done),open('off2_done.json','w')); print(i,file=sys.stderr)
    time.sleep(0.4)
with cf.ThreadPoolExecutor(2) as ex: list(ex.map(work, enumerate(todo)))
json.dump(out,open('off2.json','w')); json.dump(list(done),open('off2_done.json','w')); print('done',file=sys.stderr)
