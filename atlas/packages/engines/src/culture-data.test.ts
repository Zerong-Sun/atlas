import {it} from 'node:test';
import assert from 'node:assert/strict';
import {ICHING_CLASSICS} from './data/iching-classics.ts';
import {castMeihua} from './meihua.ts';
import {readFileSync} from 'node:fs';
it('64 original records, 384 lines, revision-pinned source and matching generated data',()=>{
 const records=Object.values(ICHING_CLASSICS);
 assert.equal(records.length,64);
 assert.equal(new Set(records.map(r=>r.name)).size,64);
 assert.equal(records.reduce((n,r)=>n+r.yaoTexts.length,0),384);
 for(const r of records){assert.ok(r.judgment);assert.ok(r.image);assert.equal(r.yaoTexts.length,6);assert.ok(r.sourceRevision);assert.equal(r.sourceSha256.length,64);assert.ok(r.sourceUrl.includes('oldid='));}
 assert.deepEqual(ICHING_CLASSICS,JSON.parse(readFileSync(new URL('./data/iching-classics.json',import.meta.url),'utf8')));
 const corpus=JSON.parse(readFileSync(new URL('../../../corpus/seeds/iching.json',import.meta.url),'utf8')).chunks;
 for(const [num,h] of Object.entries(ICHING_CLASSICS)){
  const pad=num.padStart(2,'0');
  assert.equal(corpus.find(c=>c.slug===`iching-${pad}-guaci`).original_text,h.judgment);
  assert.equal(corpus.find(c=>c.slug===`iching-${pad}-xiang`).original_text,h.image);
  h.yaoTexts.forEach((text,i)=>{const c=corpus.find(c=>c.slug===`iching-yao-${pad}-L${i+1}`);assert.equal(c.original_text,text);assert.equal(c.source_url,h.sourceUrl);});
 }

});
it('Meihua derives mutual lines, body and change from the actual hexagram',()=>{
 const r=castMeihua({numbers:[1,8],seed:'fixed'});
 assert.equal(r.upper.name,'乾');assert.equal(r.lower.name,'坤');assert.equal(r.movingLine,3);
 assert.equal(r.body.name,'乾');assert.equal(r.use.name,'坤');assert.equal(r.mutualLower.name,'艮');assert.equal(r.mutualUpper.name,'巽');assert.equal(r.changedLower.name,'艮');assert.equal(r.changedUpper.name,'乾');
 const upperMoving=castMeihua({numbers:[1,1,6]});assert.equal(upperMoving.body.name,'乾');assert.equal(upperMoving.changedUpper.name,'兑');
 assert.throws(()=>castMeihua({numbers:[1.5,2]}));
});
