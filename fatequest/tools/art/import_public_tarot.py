"""Import one complete Commons RWS deck; preserve per-file provenance.

No cropping, recoloring, or repainting: only lossless WebP format conversion.
Existing Cloud-ridge faces are archived as a separate incomplete deck.
"""
from pathlib import Path
import concurrent.futures, hashlib, io, json, time, urllib.parse, urllib.request
from PIL import Image, features, __version__ as pillow_version
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/decks/tarot'
SOURCE = OUT / '_sources_rws'
UA = 'FateQuestAssetAudit/1.0 (public-domain source traceability)'
MAJORS = [('fool','Fool'),('magician','Magician'),('high-priestess','High_Priestess'),('empress','Empress'),('emperor','Emperor'),('hierophant','Hierophant'),('lovers','Lovers'),('chariot','Chariot'),('strength','Strength'),('hermit','Hermit'),('wheel','Wheel_of_Fortune'),('justice','Justice'),('hanged-man','Hanged_Man'),('death','Death'),('temperance','Temperance'),('devil','Devil'),('tower','Tower'),('star','Star'),('moon','Moon'),('sun','Sun'),('judgement','Judgement'),('world','World')]
RANKS=['ace']+[f'{n:02}' for n in range(2,11)]+['page','knight','queen','king']

def request(url):
    for retry in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA}),timeout=60) as response:
                return response.read()
        except Exception:
            if retry == 3: raise
            time.sleep(10 * (retry + 1))

def specifications():
    cards=[dict(id=f'major-{i}', file=f'tarot-{stem}-full.webp', title=f'File:RWS Tarot {i:02} {title}.jpg') for i,(stem,title) in enumerate(MAJORS)]
    for suit,prefix in [('wands','Wands'),('cups','Cups'),('swords','Swords'),('pentacles','Pents')]:
        cards += [dict(id=f'{suit}-{i}', file=f'tarot-{suit}-{rank}-full.webp',title=f'File:{prefix}{i+1:02}.jpg') for i,rank in enumerate(RANKS)]
    return cards

def main():
    OUT.mkdir(parents=True,exist_ok=True); SOURCE.mkdir(exist_ok=True)
    (SOURCE / ".gdignore").touch()
    cards=specifications(); pages={}
    for start in range(0,len(cards),40):
        query={'action':'query','format':'json','prop':'imageinfo','iiprop':'url|extmetadata|sha1|timestamp','iiurlwidth':960,'titles':'|'.join(c['title'] for c in cards[start:start+40])}
        data=json.loads(request('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(query)))
        for p in data['query']['pages'].values(): pages[p['title']]=p
    # Resolve normalized spaces in Wikimedia titles.
    for card in cards:
        title=card['title'].replace('_',' ')
        info=pages[title]['imageinfo'][0]
        license=info['extmetadata'].get('LicenseShortName',{}).get('value','')
        if license != 'Public domain': raise ValueError((title,license))
        card['imageinfo']=info
    def download(card):
        info=card['imageinfo'];url=info['url'].split('?')[0]
        source=SOURCE/(card['file'].removesuffix('.webp')+'.jpg')
        download_record=source.with_suffix('.download.json')
        if source.exists():
            raw=source.read_bytes()
            if hashlib.sha1(raw).hexdigest() == info['sha1']:
                card['download_url']=url
                card['download_variant']='original'
            else:
                evidence=json.loads(download_record.read_text())
                if evidence['sha256'] != hashlib.sha256(raw).hexdigest() or evidence['url'] != info['thumburl']:
                    raise ValueError('Source hash mismatch '+card['id'])
                card['download_url']=evidence['url']
                card['download_variant']='commons_thumbnail_960'
        else:
            time.sleep(2)
            card['download_url']=info['thumburl']
            card['download_variant']='commons_thumbnail_960'
            raw=request(card['download_url'])
            download_record.write_text(json.dumps({'url':card['download_url'],'sha256':hashlib.sha256(raw).hexdigest(),'commons_original_sha1':info['sha1']},indent=2)+'\n')
        image=Image.open(io.BytesIO(raw));image.load()
        if image.width < 200 or image.height < image.width: raise ValueError('Unexpected dimensions '+card['id'])
        source.write_bytes(raw)
        print("Source verified:", card["id"], flush=True)
        return card, image, source
    downloads=list(concurrent.futures.ThreadPoolExecutor(max_workers=1).map(download,cards))
    # Only mutate runtime files after all source license/hash/decode checks pass.
    archive=OUT/'_legacy_cloud_ridge';archive.mkdir(exist_ok=True)
    (archive / '.gdignore').touch()
    existing_manifest=OUT/'DECK_MANIFEST.json'
    if not existing_manifest.exists() and not any(archive.glob("*.webp")):
        for old in OUT.glob('tarot-*-full.webp'):
            if (archive/old.name).exists():
                continue  # interrupted import must not overwrite the legacy original
            old.rename(archive/old.name)
            sidecar=Path(str(old)+'.import')
            if sidecar.exists(): sidecar.rename(archive/sidecar.name)
    records=[]
    for card,image,source in downloads:
        output=OUT/card['file'];image.save(output,'WEBP',lossless=True,method=6)
        info=card['imageinfo']
        records.append(dict(id=card['id'],path=output.relative_to(ROOT).as_posix(),source_path=source.relative_to(ROOT).as_posix(),source_page=info['descriptionurl'],source_url=card['download_url'],source_variant=card['download_variant'],commons_original_url=info['url'].split('?')[0],commons_original_sha1=info['sha1'],source_sha1=hashlib.sha1(source.read_bytes()).hexdigest(),source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),output_sha256=hashlib.sha256(output.read_bytes()).hexdigest(),dimensions=[image.width,image.height],license_statement='Public domain',license_evidence=info['extmetadata'],commons_revision_timestamp=info['timestamp'],retrieved_date='2026-10-20',transform='Pillow lossless WebP conversion; preserves downloaded dimensions; no crop/recolor/repaint',visual_review='not_visually_reviewed',human_art_history_signoff='pending'))
    manifest=dict(schema_version=1,deck_id='rws_commons_public_domain',runtime_profile='complete_single_source_deck',title='Rider–Waite–Smith original deck (Commons reproductions)',artist='Pamela Colman Smith',designer='Arthur Edward Waite',original_publication='1909–1910',license_scope='Original public-domain artwork and Commons faithful reproductions; not modern commercial recolorings or branding',historical_scope='Modern divination reference, not medieval eyewitness material',conversion={'format':'lossless WebP','method':6,'pillow_version':pillow_version,'libwebp_version':features.version('webp'),'resize':False,'recolor':False,'crop':False},review_scope='Automated license-metadata, hash, decode and ID validation; not human visual or legal signoff',cards=records)
    existing_manifest.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print('Imported',len(records),'complete RWS cards; archived legacy files:',len(list(archive.glob('*.webp'))))
if __name__=='__main__': main()
