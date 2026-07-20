/* 场景 · the dialogue stage.
   A full-bleed scene: painted backdrop (assets/art/scene-*.webp) with a slow
   drift, a speaker's portrait, a name plate, text typed a character at a
   time, and choices when the moment asks for one. Everything falls back to
   an ink wash when a plate is missing, so scenes always play. */
window.FQ = window.FQ || {};
FQ.Scene = {};

FQ.Scene.cur = null;

/* s = { bg, region, lines:[{who, portrait, text, side}], choices:[{label,fn,dim}], onDone } */
FQ.Scene.play = function (s) {
  FQ.Scene.cur = Object.assign({ i: 0, typing: false }, s);
  document.body.classList.add("in-scene");
  if (s.region && FQ.AU) FQ.AU.scene("ritual", s.region);
  FQ.Scene.render();
};
FQ.Scene.end = function () {
  const s = FQ.Scene.cur;
  FQ.Scene.cur = null;
  document.body.classList.remove("in-scene");
  const host = document.getElementById("scene-layer");
  if (host) host.remove();
  if (s && s.onDone) s.onDone();
};

FQ.Scene.host = function () {
  let el = document.getElementById("scene-layer");
  if (!el) {
    el = document.createElement("div");
    el.id = "scene-layer";
    el.className = "scene-layer";
    document.body.appendChild(el);
    el.addEventListener("click", ev => {
      if (ev.target.closest(".sc-choice") || ev.target.closest(".sc-skip")) return;
      FQ.Scene.advance();
    });
  }
  return el;
};

FQ.Scene.render = function () {
  const s = FQ.Scene.cur;
  if (!s) return;
  const line = s.lines[s.i];
  if (!line) return FQ.Scene.finish();
  const el = FQ.Scene.host();
  const last = s.i >= s.lines.length - 1;
  const bg = line.bg || s.bg;
  el.dataset.region = s.region || "chr";   /* the wash beneath, if no plate exists */
  el.innerHTML = `
    <div class="sc-bg"${bg ? ` style="background-image:url('assets/art/scene-${bg}.webp')"` : ""}></div>
    <div class="sc-vig"></div>
    ${line.portrait ? `
      <div class="sc-portrait ${line.side || "left"}">
        <img src="assets/art/${line.portrait}.webp" alt=""
             onerror="this.parentNode.classList.add('noart');this.remove()">
        <span class="sc-fallback">${line.ic || "✦"}</span>
      </div>` : ""}
    <div class="sc-box">
      ${line.who ? `<div class="sc-name">${FQ.esc(line.who)}</div>` : ""}
      <div class="sc-text" id="sc-text"></div>
      ${last && s.choices ? `<div class="sc-choices">${s.choices.map((c, i) => `
        <button class="sc-choice ${c.dim ? "dim-choice" : ""}" ${c.off ? "disabled" : ""}
          onclick="FQ.Scene.choose(${i})">${c.label}</button>`).join("")}</div>` : ""}
      <div class="sc-next" id="sc-next">${last && s.choices ? "" : "▼"}</div>
    </div>
    <button class="sc-skip" onclick="FQ.Scene.finish()">${FQ.t("scene.skip")}</button>`;
  s.typing = true;
  FQ.typeInto(document.getElementById("sc-text"), line.text, 46).then(() => {
    s.typing = false;
    const n = document.getElementById("sc-next");
    if (n) n.classList.add("ready");
  });
  if (line.sfx && FQ.AU) FQ.AU.play(line.sfx);
};

FQ.Scene.advance = function () {
  const s = FQ.Scene.cur;
  if (!s) return;
  if (s.typing) {                       /* first tap completes the line */
    const el = document.getElementById("sc-text");
    if (el) el.click();
    return;
  }
  const last = s.i >= s.lines.length - 1;
  if (last && s.choices) return;        /* wait for a choice */
  if (last) return FQ.Scene.finish();
  s.i++;
  FQ.AU.play("step");
  FQ.Scene.render();
};
FQ.Scene.choose = function (i) {
  const s = FQ.Scene.cur;
  const c = s.choices[i];
  FQ.AU.play("flip");
  FQ.Scene.cur = null;
  document.body.classList.remove("in-scene");
  const host = document.getElementById("scene-layer");
  if (host) host.remove();
  if (c && c.fn) c.fn();
};
FQ.Scene.finish = function () {
  const s = FQ.Scene.cur;
  if (!s) return;
  if (s.choices) {                      /* skipping still needs a decision */
    s.i = s.lines.length - 1;
    s.typing = false;
    FQ.Scene.render();
    const el = document.getElementById("sc-text");
    if (el) el.textContent = s.lines[s.i].text;
    return;
  }
  FQ.Scene.end();
};
