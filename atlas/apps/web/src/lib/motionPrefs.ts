const KEY="atlas.motion.v1";
export function getMotionEnabled(){try{return localStorage.getItem(KEY)!=="off";}catch{return true;}}
export function applyMotionPreference(enabled:boolean){document.documentElement.dataset.atlasMotion=enabled?"on":"off";try{localStorage.setItem(KEY,enabled?"on":"off");}catch{/* Session preference still applies. */}}
