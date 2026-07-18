/* Audio framework (GDD §7.2) — all sounds synthesized via Web Audio, zero assets.
   Ritual SFX follow the three beats: 起手 start / 悬念 hush / 揭示 reveal.
   Region drones are soft two-oscillator pads, crossfaded when crossing borders. */
window.FQ = window.FQ || {};

FQ.AU = (function () {
  let ctx = null, master = null, noiseBuf = null;
  let drone = { region: null, nodes: [], gain: null };

  function ensure() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = FQ.state && FQ.state.mute ? 0 : 0.55;
      master.connect(ctx.destination);
    } catch (e) { return false; }
    return true;
  }
  function now() { return ctx.currentTime; }
  function getNoise() {
    if (noiseBuf) return noiseBuf;
    const len = ctx.sampleRate * 1.2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  /* one enveloped oscillator */
  function tone(type, f0, t0, dur, peak, f1, curve) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (curve === "slow" ? dur * 0.4 : 0.012));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  /* filtered noise burst */
  function hiss(t0, dur, peak, fType, freq, q) {
    const s = ctx.createBufferSource(); s.buffer = getNoise(); s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = fType || "bandpass";
    f.frequency.value = freq || 1800; f.Q.value = q || 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t0); s.stop(t0 + dur + 0.05);
  }
  function bell(f, t0, dur, peak) {
    tone("sine", f, t0, dur, peak);
    tone("sine", f * 2.76, t0, dur * 0.6, peak * 0.3);
  }

  const SFX = {
    /* —— ritual beats —— */
    card()  { hiss(now(), 0.16, 0.16, "bandpass", 2600, 0.6); },          /* paper slide */
    flip()  { tone("sine", 620, now(), 0.1, 0.12, 940); },                 /* card turn */
    hush()  { tone("sine", 72, now(), 0.9, 0.05, 58, "slow"); },           /* suspense low pulse */
    chime() { const t = now(); bell(880, t, 0.7, 0.16); bell(1174.7, t + 0.09, 0.8, 0.1); },
    res()   { const t = now(); bell(659.3, t, 1.0, 0.15); bell(987.8, t + 0.07, 1.1, 0.13);
              hiss(t + 0.05, 0.7, 0.03, "highpass", 6000, 0.5); },         /* 文明共鸣 */
    merge() { const t = now(); bell(523.3, t, 0.8, 0.15); bell(523.3, t + 0.12, 1.0, 0.12); },
    bad()   { tone("triangle", 150, now(), 0.5, 0.16, 74); },
    coin()  { const t = now(); [0, 0.1, 0.22].forEach((d, i) =>
                { tone("sine", 2200 + i * 180, t + d, 0.35, 0.08); tone("sine", 3280, t + d, 0.2, 0.03); }); },
    wood()  { const t = now(); [0, 0.13].forEach(d => {                    /* jiaobei clack */
                hiss(t + d, 0.07, 0.2, "lowpass", 900, 1); tone("triangle", 210, t + d, 0.09, 0.14, 150); }); },
    shake() { const t = now(); for (let i = 0; i < 5; i++) hiss(t + i * 0.09, 0.06, 0.1, "highpass", 2800, 1); },
    dice()  { const t = now(); for (let i = 0; i < 3; i++) { hiss(t + i * 0.12, 0.05, 0.14, "lowpass", 1200, 1);
                tone("triangle", 320 + i * 40, t + i * 0.12, 0.06, 0.07); } },
    step()  { tone("sine", 340, now(), 0.05, 0.05); },
    sail()  { hiss(now(), 0.5, 0.06, "lowpass", 500, 0.5); },
    gale()  { hiss(now(), 1.4, 0.12, "bandpass", 700, 0.4); },
    thunder(){ const t = now(); hiss(t, 1.2, 0.2, "lowpass", 220, 0.6); tone("triangle", 60, t, 1.1, 0.12, 34, "slow"); },
    buy()   { const t = now(); tone("sine", 1560, t, 0.12, 0.09); tone("sine", 2080, t + 0.08, 0.16, 0.08); },
    omen()  { const t = now(); tone("sine", 432, t, 0.55, 0.05, 436, "slow"); },
    levelup(){ const t = now(); [523.3, 659.3, 784, 1046.5].forEach((f, i) => bell(f, t + i * 0.11, 0.5, 0.11)); }
  };

  /* —— region pads: same idea, different instrumentation (§7.2 文明变奏) —— */
  const PADS = {
    chr:  { fs: [110, 164.8, 220],  type: "sawtooth", lp: 420, vib: 0.15, g: 0.028 }, /* lute/organ */
    isl:  { fs: [73.4, 110, 146.8], type: "sawtooth", lp: 520, vib: 0.5,  g: 0.026 }, /* oud-like */
    con:  { fs: [130.8, 196, 220],  type: "sine",     lp: 900, vib: 0.08, g: 0.032 }, /* guqin air */
    mazu: { fs: [87.3, 130.8, 174.6], type: "triangle", lp: 380, vib: 0.06, g: 0.03, sea: true }
  };
  function stopDrone(fade) {
    if (!drone.gain) return;
    const g = drone.gain, t = now();
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (fade || 2.5));
    const nodes = drone.nodes;
    setTimeout(() => nodes.forEach(n => { try { n.stop(); } catch (e) {} }), (fade || 2.5) * 1000 + 200);
    drone = { region: null, nodes: [], gain: null };
  }
  function startDrone(region) {
    if (!ensure()) return;
    if (drone.region === region) return;
    stopDrone(4); /* crossfade out the old land while the new fades in */
    const p = PADS[region]; if (!p) return;
    const t = now();
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(p.g, t + 5);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = p.lp;
    lp.connect(g); g.connect(master);
    const nodes = [];
    p.fs.forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = p.type;
      o.frequency.value = f * (1 + (i - 1) * 0.0012);
      /* slow vibrato */
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = p.vib + i * 0.03; lg.gain.value = f * 0.004;
      lfo.connect(lg); lg.connect(o.frequency);
      o.connect(lp); o.start(t); lfo.start(t);
      nodes.push(o, lfo);
    });
    if (p.sea) { /* wave bed */
      const s = ctx.createBufferSource(); s.buffer = getNoise(); s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 240;
      const sg = ctx.createGain(); sg.gain.value = 0.5;
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 0.11; lg.gain.value = 0.35;
      lfo.connect(lg); lg.connect(sg.gain);
      s.connect(f); f.connect(sg); sg.connect(g);
      s.start(t); lfo.start(t);
      nodes.push(s, lfo);
    }
    drone = { region, nodes, gain: g };
  }

  return {
    unlock() { ensure(); },
    play(name) {
      if (FQ.state && FQ.state.mute) return;
      if (!ensure()) return;
      try { SFX[name] && SFX[name](); } catch (e) {}
    },
    drone(region) { if (FQ.state && FQ.state.mute) return; try { startDrone(region); } catch (e) {} },
    stopDrone() { try { stopDrone(); } catch (e) {} },
    setMute(m) {
      FQ.state.mute = m; FQ.save();
      if (m) stopDrone(0.4);
      if (master) master.gain.value = m ? 0 : 0.55;
    }
  };
})();
