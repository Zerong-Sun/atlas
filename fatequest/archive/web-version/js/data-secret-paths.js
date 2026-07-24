/* Secret path edges unlocked by outcome fx { op:"path", v:"{nodeId}_secret" }.
   Appended after data-journey + data-journey-extra. */
window.FQ = window.FQ || {};

FQ.SECRET_EDGES = [
  /* Marco · shortcuts (needPath must match gen-outcomes path ids) */
  { from: "baghdad", to: "alamut", kind: "land", days: 4, risk: 2, needPath: "baghdad_secret" },
  { from: "kerman", to: "balkh", kind: "land", days: 4, risk: 2, wx: "sand", needPath: "kerman_secret" },
  { from: "tabriz", to: "cobinan", kind: "land", days: 3, risk: 1, needPath: "tabriz_secret" },
  { from: "balkh", to: "yarkand", kind: "land", days: 5, risk: 2, wx: "sand", needPath: "balkh_secret" },
  { from: "khotan", to: "camul", kind: "land", days: 5, risk: 3, wx: "sand", needPath: "khotan_secret" },
  { from: "campichu", to: "gobi", kind: "land", days: 3, risk: 1, wx: "sand", needPath: "campichu_secret" },
  { from: "gobi", to: "khanbaliq", kind: "land", days: 4, risk: 2, needPath: "gobi_secret" },
  { from: "carajan", to: "bangala", kind: "land", days: 4, risk: 2, needPath: "carajan_secret" },
  { from: "saianfu", to: "quanzhou", kind: "river", days: 5, risk: 1, needPath: "saianfu_secret" },
  { from: "badakhshan", to: "kashgar", kind: "land", days: 4, risk: 2, wx: "snow", needPath: "badakhshan_secret" },
  { from: "shangdu", to: "yangzhou", kind: "land", days: 5, risk: 1, needPath: "shangdu_secret" },
  { from: "yangzhou", to: "quanzhou", kind: "sea", days: 4, risk: 1, needPath: "yangzhou_secret" },
  { from: "pamir", to: "yarkand", kind: "land", days: 4, risk: 2, wx: "snow", needPath: "pamir_secret" },
  { from: "hormuz", to: "sapurgan", kind: "land", days: 5, risk: 2, wx: "sand", needPath: "hormuz_secret" },
  { from: "samarkand", to: "khotan", kind: "land", days: 5, risk: 2, wx: "sand", needPath: "samarkand_secret" },
  { from: "tangut", to: "etzina", kind: "land", days: 2, risk: 1, needPath: "tangut_secret" },
  { from: "karakorum", to: "khanbaliq", kind: "land", days: 4, risk: 1, needPath: "karakorum_secret" },
  { from: "lop", to: "tangut", kind: "land", days: 4, risk: 2, wx: "sand", needPath: "lop_secret" },
  { from: "yarkand", to: "lop", kind: "land", days: 3, risk: 2, wx: "sand", needPath: "yarkand_secret" },
  { from: "cobinan", to: "camadi", kind: "land", days: 2, risk: 1, wx: "sand", needPath: "cobinan_secret" },
  { from: "alamut", to: "yezd", kind: "land", days: 3, risk: 2, needPath: "alamut_secret" },
  { from: "aden", to: "kerman", kind: "sea", days: 5, risk: 2, needPath: "aden_secret" },
  { from: "maabar", to: "hormuz", kind: "sea", days: 6, risk: 2, needPath: "maabar_secret" },
  { from: "seilan", to: "aden", kind: "sea", days: 4, risk: 1, needPath: "seilan_secret" },
  { from: "fuzhou", to: "voyage", kind: "sea", days: 3, risk: 1, wx: "storm", needPath: "fuzhou_secret" },
  { from: "etzina", to: "shangdu", kind: "land", days: 4, risk: 2, needPath: "etzina_secret" },
  { from: "erguiul", to: "gobi", kind: "land", days: 3, risk: 1, wx: "sand", needPath: "erguiul_secret" },
  { from: "camadi", to: "herat", kind: "land", days: 4, risk: 2, wx: "sand", needPath: "camadi_secret" },
  { from: "charchan", to: "camul", kind: "land", days: 4, risk: 3, wx: "sand", needPath: "charchan_secret" },
  { from: "chipangu", to: "java", kind: "sea", days: 5, risk: 3, wx: "storm", needPath: "chipangu_secret" },
  /* Ibn Battuta chapter */
  { from: "ib-tangier", to: "ib-mecca", kind: "land", days: 8, risk: 2, needPath: "ib-tangier_secret" },
  { from: "ib-cairo", to: "ib-calicut", kind: "sea", days: 12, risk: 3, needPath: "ib-cairo_secret" },
  { from: "ib-mecca", to: "ib-calicut", kind: "sea", days: 10, risk: 2, needPath: "ib-mecca_secret" },
  { from: "ib-calicut", to: "maabar", kind: "sea", days: 3, risk: 1, needPath: "ib-calicut_secret" }
];

(function applySecretEdges() {
  const byId = {};
  (FQ.CHAPTERS || []).forEach(ch => {
    (ch.nodes || []).forEach(n => { byId[n.id] = true; });
  });
  (FQ.CHAPTERS || []).forEach(ch => {
    if (!ch.edges) ch.edges = [];
    const have = new Set(ch.edges.map(e => e.from + ">" + e.to + ">" + (e.needPath || "")));
    (FQ.SECRET_EDGES || []).forEach(e => {
      if (!byId[e.from] || !byId[e.to]) return;
      /* only attach to chapters that already own the from-node */
      if (!(ch.nodes || []).some(n => n.id === e.from)) return;
      const k = e.from + ">" + e.to + ">" + (e.needPath || "");
      if (have.has(k)) return;
      ch.edges.push(Object.assign({}, e));
      have.add(k);
    });
  });
})();
