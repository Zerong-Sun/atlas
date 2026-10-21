/** Refresh only I Ching retrieval records, preserving unrelated corpora and UUIDs. */
import {readFileSync,writeFileSync} from 'node:fs';
import {buildIchingChunks} from '../packages/corpus-scripts/src/seed-builders/iching.mjs';
import {buildYijingYaoChunks} from '../packages/corpus-scripts/src/seed-builders/yijing-yao.mjs';
import {stableChunkUuid} from '../packages/corpus-scripts/src/lib/stable-uuid.mjs';
const replacements=[...buildIchingChunks(),...buildYijingYaoChunks()].map(c=>({...c,slug:c.slug??c.id,id:stableChunkUuid(c.slug??c.id),corpus_version:'corpus_v0_1'}));
const byId=new Map(replacements.map(c=>[c.id,c]));
for(const name of ['iching','all-chunks']){
 const path=new URL(`../corpus/seeds/${name}.json`,import.meta.url),payload=JSON.parse(readFileSync(path,'utf8'));
 payload.chunks=payload.chunks.map(c=>byId.get(c.id)??c);payload.content_revision='iching-classics-2026-10-20';
 if(payload.concepts)payload.concepts=payload.concepts.map(c=>{const chunk=byId.get(c.chunk_ids?.[0]);return chunk?{...c,label_zh:`${chunk.chapter}·${chunk.section}`,definition_zh:chunk.translation_zh.slice(0,200)}:c;});
 writeFileSync(path,JSON.stringify(payload,null,2));
}
console.log(`Refreshed ${replacements.length} retrieval records; existing UUIDs retained.`);
