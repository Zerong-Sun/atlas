import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {DIVINATION_METHODS} from './divinationMethods.ts';
import {CULTURE_LESSONS} from './cultureLessons.ts';
it('all 24 methods have a complete offline lesson and an existing, bounded illustration',()=>{
 const methods=DIVINATION_METHODS.filter(m=>m.status==='ready');assert.equal(methods.length,24);
 const manifest=JSON.parse(readFileSync(new URL('../assets/culture/manifest.json',import.meta.url),'utf8'));
 for(const m of methods){const l=CULTURE_LESSONS[m.id];assert.ok(l,m.id);assert.equal(l.stages.length,3);assert.ok(l.symbols.length<=9);for(const field of ['observe','understand','practice','distinction','sourceTitle'] as const)assert.ok(l[field].length>6,`${m.id}.${field}`);assert.ok(manifest.tiles.some(t=>t.id===l.scene));}
 let bytes=0;for(const tile of manifest.tiles){assert.ok(tile.width>=3*112);const size=statSync(new URL(`../assets/culture/${tile.id}.webp`,import.meta.url)).size;assert.equal(size,tile.bytes);bytes+=size;}assert.ok(bytes<700000);
});
