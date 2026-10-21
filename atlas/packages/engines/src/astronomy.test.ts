import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {calculatePosition,calculateHouses,julianDay,CalculationFlag,HouseSystem,Planet} from '@swisseph/node';
import {Astronomy,planetLongitude,ascendantMidheaven,validateBirthInput} from './astronomy.ts';
import {mobileVedicEphemeris} from './vedic/ephemeris.mobile.ts';
import {getVedicEphemerisData} from './vedic/ephemeris.node.ts';
const distance=(a:number,b:number)=>Math.abs(((a-b+540)%360)-180);
const fixtures=[
 {birthDate:'1990-05-15',birthTime:'08:30',birthLat:39.9,birthLng:116.4,timezone:8},
 {birthDate:'2000-01-01',birthTime:'12:00',birthLat:40.4,birthLng:-3.7,timezone:1},
 {birthDate:'2024-02-29',birthTime:'23:45',birthLat:-33.9,birthLng:151.2,timezone:11},
 {birthDate:'1969-07-20',birthTime:'20:17',birthLat:28.6,birthLng:77.2,timezone:5.5}
];
describe('independent Swiss Ephemeris comparison',()=>{
 for(const input of fixtures)it(`ecliptic positions and angles ${input.birthDate}`,()=>{
  const date=validateBirthInput(input.birthDate,input.birthTime,input.birthLat,input.birthLng,input.timezone);
  const jd=date.getTime()/86400000+2440587.5;
  for(const key of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const){
   const actual=planetLongitude(Astronomy.Body[key],date),expected=calculatePosition(jd,Planet[key],CalculationFlag.MoshierEphemeris).longitude;
   assert.ok(distance(actual,expected)<.03,`${key}: ${actual} vs ${expected}`);
  }
  const angles=ascendantMidheaven(date,input.birthLat,input.birthLng),h=calculateHouses(jd,input.birthLat,input.birthLng,HouseSystem.WholeSign);
  assert.ok(distance(angles.asc,h.ascendant)<.01);assert.ok(distance(angles.mc,h.mc)<.01);
 });
 for(const input of fixtures)it(`portable sidereal positions ${input.birthDate}`,()=>{
  const actual=mobileVedicEphemeris(input),expected=getVedicEphemerisData(input);
  for(const key of Object.keys(actual.grahaLongitudes) as (keyof typeof actual.grahaLongitudes)[])assert.ok(distance(actual.grahaLongitudes[key],expected.grahaLongitudes[key])<.05,`${key}`);
  assert.ok(distance(actual.ascendantLongitude,expected.ascendantLongitude)<.01);
 });
 it('rejects invalid dates, coordinates, offsets and times',()=>{
  for(const [date,time,lat,lng,tz] of [['2023-02-29','12:00',0,0,0],['2000-01-01','24:00',0,0,0],['2000-01-01','12:00',90,0,0],['2000-01-01','12:00',0,181,0],['2000-01-01','12:00',0,0,15]] as const)assert.throws(()=>validateBirthInput(date,time,lat,lng,tz));
  assert.equal(validateBirthInput('2024-02-29','23:45',0,0,5.5).toISOString(),'2024-02-29T18:15:00.000Z');
 });
});
