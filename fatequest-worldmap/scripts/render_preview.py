#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Static parchment render of all vector layers (verification + README preview)."""
import json, os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patheffects import withStroke
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),".."))
DATA=os.path.join(ROOT,"data")
def L(n):return json.load(open(os.path.join(DATA,n),encoding="utf-8"))
cfg=L("world_config.json");B=cfg["bbox"]
fig,ax=plt.subplots(figsize=(16,8.5),dpi=110)
fig.patch.set_facecolor("#e9d9b0");ax.set_facecolor("#e3d2a6")
ax.set_xlim(B["west"],B["east"]);ax.set_ylim(B["south"],B["north"])
ax.set_aspect(1/0.72)  # rough lat/lon aspect for the mid-latitudes
halo=[withStroke(linewidth=2.2,foreground="#f6ecd0")]
# rivers
for f in L("rivers.geojson")["features"]:
    xs=[c[0] for c in f["geometry"]["coordinates"]];ys=[c[1] for c in f["geometry"]["coordinates"]]
    ax.plot(xs,ys,color="#2b6a9a",lw=1.3,alpha=.85,zorder=2)
# mountains
for f in L("mountains.geojson")["features"]:
    g=f["geometry"]
    if g["type"]=="LineString":
        xs=[c[0] for c in g["coordinates"]];ys=[c[1] for c in g["coordinates"]]
        ax.plot(xs,ys,color="#6b451c",lw=2.6,alpha=.8,dashes=(1,1.6),zorder=3)
        mx,my=xs[len(xs)//2],ys[len(ys)//2]
    else: mx,my=g["coordinates"]
    ax.text(mx,my+0.5,"▲ "+f["properties"]["name_medieval"],fontsize=6,style="italic",
            color="#5b3a1a",ha="center",zorder=6,path_effects=halo)
# seas
for f in L("seas.geojson")["features"]:
    lon,lat=f["geometry"]["coordinates"]
    ax.text(lon,lat,f["properties"]["name_medieval"],fontsize=8,style="italic",
            color="#2b4a63",ha="center",zorder=5,path_effects=halo)
# regions
for f in L("regions.geojson")["features"]:
    lon,lat=f["geometry"]["coordinates"];p=f["properties"]
    if p["kind"]=="part":
        ax.text(lon,lat,p["name_medieval"],fontsize=22,color="#8a6a3a",alpha=.35,
                ha="center",weight="bold",zorder=1,family="serif")
    else:
        ax.text(lon,lat,p["name_medieval"],fontsize=8,color="#7a5a2a",alpha=.6,
                ha="center",zorder=1,family="serif")
# cities
for f in L("cities.geojson")["features"]:
    lon,lat=f["geometry"]["coordinates"];p=f["properties"]
    if p["tier"]==1: s,c,e=42,"#c8a23a","#7a1f1f"
    elif p["tier"]==2: s,c,e=24,"#a8321f","#5a1a10"
    else: s,c,e=10,"#7a4a1a","#4a2d0c"
    ax.scatter([lon],[lat],s=s,c=c,edgecolors=e,linewidths=.7,zorder=7)
    if p["is_center"]:
        ax.scatter([lon],[lat],s=260,facecolors="none",edgecolors="#c8a23a",linewidths=1.4,zorder=6)
    if p["tier"]<=2:
        ax.text(lon+0.6,lat+0.3,p["name_medieval"],fontsize=7 if p["tier"]==2 else 8.5,
                color="#2a1c0c",zorder=8,weight="bold" if p["tier"]==1 else "normal",
                path_effects=halo)
ax.set_title("ORBIS TERRARVM — the world as known to medieval Christendom (fatequest)",
             fontsize=14,family="serif",color="#4a2d0c",pad=10)
ax.set_xlabel("longitude");ax.set_ylabel("latitude")
ax.grid(True,color="#c9b483",lw=.4,alpha=.6)
for s in ax.spines.values(): s.set_color("#5b431f");s.set_linewidth(2)
plt.tight_layout()
out=os.path.join(ROOT,"web","preview_static.png")
plt.savefig(out,facecolor=fig.get_facecolor());print("wrote",out)
