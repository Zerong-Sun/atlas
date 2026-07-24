/* 《远行之书》· art — 缺图不开天窗.
   Every picture is asked for by name. If assets/art/<name>.webp exists it is
   used; if not, a deterministic procedural placeholder is drawn under the same
   name — so dropping the real file in later replaces it with no code change.
   Every name asked for is recorded, which is what scripts/audit_art.mjs reads
   to rebuild ART_TODO.md. */
window.BOF = window.BOF || {};
BOF.ART = {};

BOF.ART.asked = Object.create(null);   /* name → times requested */
BOF.ART.missing = Object.create(null); /* name → true once the load fails */

BOF.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* a stable hue per name, so the same slot always looks the same */
BOF.ART.hash = function (s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
};

/* what family a name belongs to — decides the placeholder's shape */
BOF.ART.kindOf = function (name) {
  const n = String(name || "");
  if (n.startsWith("city-") || n.startsWith("site-")) return "scene";
  if (n.startsWith("mentor-") || n.startsWith("npc-") || n.startsWith("retainer-")) return "face";
  if (n.startsWith("arch-")) return "face";
  if (n.startsWith("tr-")) return "vehicle";
  if (n.startsWith("goods-") || n.startsWith("item-")) return "goods";
  if (n.startsWith("coin-")) return "coin";
  if (n.startsWith("art-")) return "seal";
  return "seal";
};

/* the drawn stand-in — parchment-toned, in the same palette as the map, so a
   missing plate reads as "not painted yet" rather than as breakage */
BOF.ART.placeholder = function (name, cls) {
  const h = BOF.ART.hash(name);
  const hue = h % 360;
  const kind = BOF.ART.kindOf(name);
  const glyph = { scene: "▣", face: "☗", vehicle: "⛵", goods: "◈", coin: "◉", seal: "✦" }[kind];
  const ratio = { scene: "16 / 9", face: "3 / 4", vehicle: "8 / 5", goods: "1", coin: "1", seal: "1" }[kind];
  const label = name.replace(/^[a-z]+-/, "").replace(/-/g, " ");
  return `
    <div class="art-ph ${cls || ""}" data-art="${BOF.esc(name)}"
         style="--ph-h:${hue};aspect-ratio:${ratio}" role="img"
         aria-label="${BOF.esc(label)} (placeholder)">
      <span class="art-ph-g">${glyph}</span>
      <span class="art-ph-n">${BOF.esc(label)}</span>
    </div>`;
};

/* Stand-ins: an existing plate that is close enough until the real one is
   drawn. Loaded from assets/data/art-aliases.json; the real name always wins,
   so deleting a row here is the whole "swap in the finished art" step. */
BOF.ART.alias = {};
BOF.ART.loadAliases = async function () {
  try {
    const res = await fetch("assets/data/art-aliases.json", { cache: "no-cache" });
    if (res.ok) BOF.ART.alias = (await res.json()).aliases || {};
  } catch (e) { /* aliases are optional — placeholders cover the gap */ }
};

/* The one call the rest of the game makes. Tries the real name, then the
   stand-in, then draws a placeholder — so a missing plate never opens a hole. */
BOF.ART.img = function (name, cls) {
  if (!name) return "";
  BOF.ART.asked[name] = (BOF.ART.asked[name] || 0) + 1;
  if (BOF.ART.missing[name]) return BOF.ART.placeholder(name, cls);
  const ph = BOF.ART.placeholder(name, cls).replace(/"/g, "&quot;");
  const alt = BOF.ART.alias[name] || "";
  return `<img class="art ${cls || ""}" src="assets/art/${BOF.esc(name)}.webp"
    alt="" loading="lazy" data-art="${BOF.esc(name)}" data-alt="${BOF.esc(alt)}"
    onerror="BOF.ART.fail(this)" data-ph="${ph}">`;
};

BOF.ART.fail = function (el) {
  const name = el.dataset.art;
  const alt = el.dataset.alt;
  /* first failure: fall back to the stand-in and try once more */
  if (alt && !el.dataset.tried) {
    el.dataset.tried = "1";
    el.classList.add("art-standin");
    el.src = "assets/art/" + alt + ".webp";
    return;
  }
  BOF.ART.missing[name] = true;
  const ph = el.dataset.ph;
  if (ph) el.outerHTML = ph;
  else el.remove();
};

/* the manifest the audit script and the art report read */
BOF.ART.report = function () {
  const rows = Object.keys(BOF.ART.asked).sort().map(n => ({
    name: n, uses: BOF.ART.asked[n], missing: !!BOF.ART.missing[n],
    kind: BOF.ART.kindOf(n)
  }));
  return {
    total: rows.length,
    missing: rows.filter(r => r.missing).length,
    rows
  };
};

/* printable in the console: BOF.ART.list() */
BOF.ART.list = function () {
  const r = BOF.ART.report();
  console.table(r.rows);
  console.log(r.missing + " of " + r.total + " art slots are still placeholders.");
  return r;
};
