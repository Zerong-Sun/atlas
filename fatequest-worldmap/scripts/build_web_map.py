#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build web/index.html — a self-contained Leaflet mappa-mundi map with the
GeoJSON layers embedded inline (works when opened directly, file://).
Base tiles need internet; overlays + parchment styling do not."""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data"); WEB = os.path.join(ROOT, "web")
os.makedirs(WEB, exist_ok=True)
def L(name): return json.load(open(os.path.join(DATA, name), encoding="utf-8"))
blob = {k: L(f"{k}.geojson") for k in ["cities","mountains","rivers","seas","regions"]}
cfg = L("world_config.json") if os.path.exists(os.path.join(DATA,"world_config.json")) else {}
DATA_JS = "const CFG=%s;\nconst GEO=%s;" % (json.dumps(cfg), json.dumps(blob, ensure_ascii=False))

HTML = r"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>fatequest · Mappa Mundi — the Medieval Known World</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
 @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=EB+Garamond:ital@0;1&display=swap');
 html,body{margin:0;height:100%;background:#241a10;color:#f0e6d2;font-family:'EB Garamond',serif}
 #map{position:absolute;inset:0;background:#d8c39a;transition:transform .6s ease}
 /* parchment cast over the base tiles */
 .leaflet-tile-pane{filter:sepia(.55) saturate(.75) contrast(.92) brightness(1.06)}
 .frame{position:absolute;inset:0;pointer-events:none;z-index:900;
        box-shadow:inset 0 0 22px 10px rgba(60,40,15,.55), inset 0 0 120px 40px rgba(90,60,20,.30);
        border:14px solid #3a2a14;border-image:linear-gradient(135deg,#5b431f,#2c2010,#5b431f) 1}
 .cartouche{position:absolute;top:16px;left:50%;transform:translateX(-50%);z-index:950;
        background:rgba(35,25,12,.86);border:1px solid #7a5a2a;border-radius:6px;padding:6px 18px;text-align:center}
 .cartouche h1{font-family:'Cinzel',serif;font-size:17px;letter-spacing:2px;margin:0;color:#f2d98c}
 .cartouche p{margin:2px 0 0;font-style:italic;font-size:12px;color:#d8c8a6}
 .panel{position:absolute;top:16px;right:16px;z-index:950;background:rgba(35,25,12,.9);
        border:1px solid #7a5a2a;border-radius:6px;padding:10px 12px;max-width:230px;font-size:13px}
 .panel b{font-family:'Cinzel',serif;color:#f2d98c;letter-spacing:1px}
 .panel button{width:100%;margin-top:8px;background:#5b431f;color:#f0e6d2;border:1px solid #8a6a34;
        border-radius:4px;padding:6px;font-family:'EB Garamond',serif;font-size:13px;cursor:pointer}
 .panel button:hover{background:#6d5326}
 .lgd{margin-top:8px;line-height:1.6}
 .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle}
 .lbl-region{font-family:'Cinzel',serif;color:rgba(70,45,15,.55);letter-spacing:4px;
        text-transform:uppercase;font-weight:700;white-space:nowrap;text-shadow:0 1px 0 rgba(255,245,220,.4)}
 .lbl-land{font-family:'Cinzel',serif;color:rgba(70,45,15,.7);letter-spacing:2px;font-size:12px;white-space:nowrap}
 .lbl-sea{font-family:'EB Garamond',serif;font-style:italic;color:#2b4a63;font-size:13px;
        white-space:nowrap;text-shadow:0 1px 0 rgba(255,255,255,.5)}
 .lbl-mtn{font-family:'EB Garamond',serif;font-style:italic;color:#5b3a1a;font-size:11px;white-space:nowrap}
 .lbl-city{font-family:'EB Garamond',serif;color:#2a1c0c;font-size:12px;white-space:nowrap;text-shadow:0 1px 0 rgba(255,248,225,.7)}
 .lbl-city.t1{font-weight:700;font-size:14px}
 .compass{position:absolute;bottom:20px;left:20px;z-index:950;width:88px;height:88px;
        border-radius:50%;background:radial-gradient(circle,#2c2010,#160f07);border:2px solid #7a5a2a;
        color:#f2d98c;font-family:'Cinzel',serif;text-align:center;font-size:12px}
 .compass .e{position:absolute;top:4px;left:50%;transform:translateX(-50%);font-weight:700;color:#f2d98c}
 .compass .n{position:absolute;left:6px;top:50%;transform:translateY(-50%);opacity:.7}
 .compass .s{position:absolute;right:6px;top:50%;transform:translateY(-50%);opacity:.7}
 .compass .w{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);opacity:.7}
 .compass small{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:9px;font-style:italic;opacity:.8}
 .leaflet-popup-content{font-family:'EB Garamond',serif}
 .leaflet-popup-content h3{margin:0 0 3px;font-family:'Cinzel',serif;color:#5b3a1a}
 .leaflet-popup-content em{color:#6a4a20}
</style></head><body>
<div id="map"></div>
<div class="frame"></div>
<div class="cartouche"><h1>ORBIS TERRARVM</h1><p>the world as known to medieval Christendom · fatequest</p></div>
<div class="panel"><b>MAPPA MVNDI</b>
  <div class="lgd">
   <span class="dot" style="background:#c8a23a;border:2px solid #7a1f1f"></span>Sacred / great city<br>
   <span class="dot" style="background:#a8321f"></span>City<br>
   <span class="dot" style="background:#7a4a1a;width:8px;height:8px"></span>Lesser town<br>
   <span class="dot" style="background:#5b3a1a;border-radius:2px"></span>Mountains<br>
   <span class="dot" style="background:#2b6a9a"></span>Rivers
  </div>
  <button id="btnEast">Turn map East-up (Mappa Mundi)</button>
  <button id="btnLabels">Toggle all labels</button>
</div>
<div class="compass"><span class="e">E</span><span class="n">N</span><span class="s">S</span><span class="w">W</span><small>oriens</small></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
__DATA__
const B=CFG.bbox||{west:-20,south:5,east:100,north:66};
const map=L.map('map',{center:[34,32],zoom:4,minZoom:3,maxZoom:8,worldCopyJump:false,
  maxBounds:[[B.south-8,B.west-12],[B.north+8,B.east+12]]});
const physical=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
  {maxZoom:8,attribution:'Tiles © Esri — World Physical Map'});
const positron=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {maxZoom:8,subdomains:'abcd',attribution:'© OpenStreetMap © CARTO'});
physical.addTo(map);

function tip(cls,txt){return L.divIcon({className:'',html:'<div class="'+cls+'">'+txt+'</div>',iconSize:[0,0]});}
const labelLayers=[];

// regions
const regions=L.layerGroup().addTo(map);
GEO.regions.features.forEach(f=>{const[lon,lat]=f.geometry.coordinates,p=f.properties;
  const cls=p.kind==='part'?'lbl-region':'lbl-land';
  const m=L.marker([lat,lon],{icon:tip(cls,p.name_medieval),interactive:false});
  regions.addLayer(m);labelLayers.push(m._icon?m:m);});

// seas
const seas=L.layerGroup().addTo(map);
GEO.seas.features.forEach(f=>{const[lon,lat]=f.geometry.coordinates,p=f.properties;
  seas.addLayer(L.marker([lat,lon],{icon:tip('lbl-sea',p.name_medieval),interactive:false}));});

// rivers
const rivers=L.layerGroup().addTo(map);
GEO.rivers.features.forEach(f=>{const p=f.properties;
  const line=f.geometry.coordinates.map(c=>[c[1],c[0]]);
  const pl=L.polyline(line,{color:'#2b6a9a',weight:1.8,opacity:.85});
  pl.bindTooltip(p.name_medieval+' · '+p.name_modern,{sticky:true,className:'lbl-mtn'});
  rivers.addLayer(pl);
  const mid=line[Math.floor(line.length/2)];
  rivers.addLayer(L.marker(mid,{icon:tip('lbl-mtn',p.name_medieval),interactive:false}));});

// mountains
const mountains=L.layerGroup().addTo(map);
GEO.mountains.features.forEach(f=>{const p=f.properties,g=f.geometry;
  if(g.type==='LineString'){const line=g.coordinates.map(c=>[c[1],c[0]]);
    const pl=L.polyline(line,{color:'#6b451c',weight:3,opacity:.8,dashArray:'2 5',lineCap:'round'});
    pl.bindPopup('<h3>'+p.name_medieval+'</h3><em>'+p.name_modern+'</em><br>peak '+p.peak_m+' m · '+p.trend+'<br>'+p.note);
    mountains.addLayer(pl);
    const mid=line[Math.floor(line.length/2)];
    mountains.addLayer(L.marker(mid,{icon:tip('lbl-mtn','▲ '+p.name_medieval),interactive:false}));
  }else{const[lon,lat]=g.coordinates;
    const mk=L.marker([lat,lon],{icon:tip('lbl-mtn','▲ '+p.name_medieval),interactive:false});
    mountains.addLayer(mk);}
});

// cities
const cities=L.layerGroup().addTo(map);
GEO.cities.features.forEach(f=>{const[lon,lat]=f.geometry.coordinates,p=f.properties;
  let r=4,fill='#7a4a1a',ring='#4a2d0c',rw=1;
  if(p.tier===1){r=6;fill='#c8a23a';ring='#7a1f1f';rw=2;}
  else if(p.tier===2){r=5;fill='#a8321f';ring='#5a1a10';rw=1.5;}
  const cm=L.circleMarker([lat,lon],{radius:r,fillColor:fill,color:ring,weight:rw,fillOpacity:.95});
  cm.bindPopup('<h3>'+p.name_medieval+'</h3><em>'+p.name_modern+'</em><br>'+p.note);
  cities.addLayer(cm);
  if(p.is_center){cities.addLayer(L.circleMarker([lat,lon],{radius:13,color:'#c8a23a',weight:1.5,fill:false,opacity:.9}));}
  if(p.tier<=2){const m=L.marker([lat,lon],{icon:L.divIcon({className:'',
     html:'<div class="lbl-city '+(p.tier===1?'t1':'')+'" style="margin-left:9px">'+p.name_medieval+'</div>',
     iconSize:[0,0],iconAnchor:[-9,8]}),interactive:false});cities.addLayer(m);labelLayers.push(m);}
});

L.control.layers(
 {'Relief (Esri Physical)':physical,'Parchment (light)':positron},
 {'Regions & lands':regions,'Seas':seas,'Rivers':rivers,'Mountains':mountains,'Cities':cities},
 {collapsed:false,position:'bottomright'}).addTo(map);

map.fitBounds([[B.south+2,B.west+2],[B.north-4,B.east-30]]);

// East-up (medieval orientation): rotate whole map 90deg CCW so East is up.
let east=false;
document.getElementById('btnEast').onclick=()=>{east=!east;const el=document.getElementById('map');
 el.style.transform=east?'rotate(-90deg) scale(0.62)':'';
 if(east){map.dragging.disable();} else {map.dragging.enable();}
 document.querySelector('.compass small').textContent=east?'(now East-up)':'oriens';
 document.getElementById('btnEast').textContent=east?'Return to North-up':'Turn map East-up (Mappa Mundi)';};

// label toggle
let labelsOn=true;
document.getElementById('btnLabels').onclick=()=>{labelsOn=!labelsOn;
 document.querySelectorAll('.lbl-region,.lbl-land,.lbl-sea,.lbl-mtn,.lbl-city')
   .forEach(e=>e.style.display=labelsOn?'':'none');};
</script></body></html>"""

html = HTML.replace("__DATA__", DATA_JS)
open(os.path.join(WEB, "index.html"), "w", encoding="utf-8").write(html)
print("wrote web/index.html", os.path.getsize(os.path.join(WEB,"index.html")), "bytes")
