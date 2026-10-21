import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { castIChing, castIChingFromLines, hexagramNumber, KING_WEN_BITS, tossThreeCoins } from "./iching.ts";
import { castLiuyao } from "./liuyao.ts";

describe("周易三钱法与文王卦序", () => {
  it("乾坤、既济未济的卦画与通行本一致", () => {
    assert.equal(hexagramNumber([true,true,true,true,true,true]),1);
    assert.equal(hexagramNumber([false,false,false,false,false,false]),2);
    assert.equal(hexagramNumber([true,false,true,false,true,false]),63);
    assert.equal(hexagramNumber([false,true,false,true,false,true]),64);
    assert.equal(hexagramNumber([true,false,false,false,true,false]),3);
    assert.equal(hexagramNumber([true,true,true,false,false,false]),11);
    assert.equal(hexagramNumber([false,false,false,true,true,true]),12);
    assert.equal(new Set(KING_WEN_BITS).size,64);
  });
  it("三枚钱的八种等概率组合对应 6:7:8:9 = 1:3:3:1", () => {
    const counts: Record<number,number> = {};
    for(let bits=0;bits<8;bits++) { let i=0; const v=tossThreeCoins(()=> bits & (1<<i++) ? 0.75 : 0.25); counts[v]=(counts[v]??0)+1; }
    assert.deepEqual(counts,{6:1,7:3,8:3,9:1});
  });
  it("老阳变阴、老阴变阳；全静爻不另抽变卦", () => {
    const r=castIChingFromLines([9,7,7,7,7,7]);
    assert.equal(r.primary.number,1); assert.equal(r.changing.number,44); assert.deepEqual(r.movingLines,[1]);
    const k=castIChingFromLines([6,8,8,8,8,8]); assert.equal(k.primary.number,2);assert.equal(k.changing.number,24);
    const quiet=castIChingFromLines([7,8,7,8,7,8]);assert.equal(quiet.primary.number,quiet.changing.number);
  });
  it("4096 种六爻组合均只改变动爻", () => {
    for(let n=0;n<4096;n++) {
      const v=Array.from({length:6},(_,i)=>6+((n>>(i*2))&3)); const r=castIChingFromLines(v);
      for(let i=0;i<6;i++) assert.equal(r.primary.lines[i]!==r.changing.lines[i], v[i]===6||v[i]===9);
    }
  });
  it("非法输入拒绝；同 seed 复现", () => {
    assert.throws(()=>castIChingFromLines([7])); assert.throws(()=>castIChingFromLines([7,7,7,7,7,10]));
    assert.deepEqual(castIChing("stable"),castIChing("stable"));
  });
});
describe("六爻纳甲", () => {
  const timestamp="2026-10-20T12:00:00+08:00";
  it("乾为天纳甲壬、世六应三", () => {
    const r=castLiuyao({lines:[7,7,7,7,7,7],timestamp});
    assert.equal(r.primaryHex,1);assert.equal(r.palace,"乾");assert.equal(r.worldLine,6);assert.equal(r.responseLine,3);
    assert.deepEqual(r.lines.map(l=>l.stem+l.branch),["甲子","甲寅","甲辰","壬午","壬申","壬戌"]);
  });
  it("64卦世应相隔三位；与周易同爻同卦", () => {
    for(let bits=0;bits<64;bits++) {
      const lines=Array.from({length:6},(_,i)=>bits&(1<<i)?7:8);
      const r=castLiuyao({lines,timestamp});assert.equal(r.primaryHex,castIChingFromLines(lines).primary.number);
      assert.equal(Math.abs(r.worldLine-r.responseLine),3);
    }
    const r=castLiuyao({lines:[7,8,8,8,8,8],timestamp});assert.equal(r.primaryHex,24);assert.equal(r.palace,"坤");assert.equal(r.worldLine,1);assert.equal(r.responseLine,4);
  });
});
