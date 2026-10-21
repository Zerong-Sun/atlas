import {computeMobileVedic,type VedicResult} from "@atlas/engines/vedic";
import type {VedicInput} from "@atlas/shared-types";
/** Shared portable ephemeris avoids a broken CommonJS/WASM browser package at runtime.
 * Independently compared to Swiss Ephemeris in engines/astronomy.test.ts.
 */
export async function computeVedicAsync(input:VedicInput={}):Promise<VedicResult>{
 return computeMobileVedic(input);
}
