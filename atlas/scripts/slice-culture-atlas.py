"""Crop the approved 4x3 sheet without enlargement. Keep text/symbols native in UI."""
from PIL import Image
from pathlib import Path
import sys, json, shutil
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]);dest=root/'packages/method-data/assets/culture';dest.mkdir(parents=True,exist_ok=True)
im=Image.open(source).convert('RGB');w,h=im.size
names=['study','earth','courtyard','western','vedic','cards','runes','sand','ritual','coffee','reflection','spain']
manifest=[]
for i,name in enumerate(names):
 x=i%4;y=i//4;box=(round(x*w/4),round(y*h/3),round((x+1)*w/4),round((y+1)*h/3))
 tile=im.crop(box);p=dest/(name+'.webp');tile.save(p,'WEBP',quality=90,method=6)
 manifest.append({'id':name,'width':tile.width,'height':tile.height,'bytes':p.stat().st_size,'crop':box,'maxDisplayWidthAt2x':tile.width//2})
shutil.copyfile(source,dest/'source-sheet.png')
(dest/'manifest.json').write_text(json.dumps({'sourceSize':[w,h],'artType':'AI-created cultural illustration; not historical evidence','tiles':manifest},ensure_ascii=False,indent=2)+'\n')
print(im.size,'tiles',len(manifest),'total bytes',sum(x['bytes'] for x in manifest))
