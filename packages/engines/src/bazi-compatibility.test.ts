import { describe, it } from "node:test";
import assert from "node:assert";
import { computeBazi } from "./bazi.js";
import { computeBaziCompatibility } from "./bazi-compatibility.js";
import { detectBranchRelations } from "./bazi-branch-relations.js";

describe("detectBranchRelations", () => {
  it("detects 六合 between 子 and 丑", () => {
    const rels = detectBranchRelations("子", "丑");
    assert.ok(rels.some((r) => r.kind === "六合"));
  });

  it("detects 六冲 between 子 and 午", () => {
    const rels = detectBranchRelations("子", "午");
    assert.ok(rels.some((r) => r.kind === "六冲"));
  });
});

describe("computeBaziCompatibility", () => {
  it("requires both birth dates", () => {
    const r = computeBaziCompatibility({
      personA: { birthDate: "", gender: "male" },
      personB: { birthDate: "1990-05-15", gender: "female" },
      relationshipType: "romance",
    });
    assert.equal(r.error, "birth_date_required");
  });

  it("golden: 日支六冲 pair produces conflict in dayBranch dimension", () => {
    // Find dates where day branches are 子 and 午
    const candidatesA = ["1984-02-02", "1984-02-14", "1996-03-15", "2008-04-10"];
    const candidatesB = ["1990-06-15", "1990-07-01", "1986-05-20", "2002-08-08"];

    let dayA = "";
    let dayB = "";
    let dateA = "";
    let dateB = "";

    for (const dA of candidatesA) {
      const bA = computeBazi({ birthDate: dA, birthTime: "08:00" });
      if (!bA.pillars) continue;
      const branchA = bA.pillars.day.charAt(1);
      for (const dB of candidatesB) {
        const bB = computeBazi({ birthDate: dB, birthTime: "08:00" });
        if (!bB.pillars) continue;
        const branchB = bB.pillars.day.charAt(1);
        const rels = detectBranchRelations(branchA, branchB);
        if (rels.some((r) => r.kind === "六冲")) {
          dayA = branchA;
          dayB = branchB;
          dateA = dA;
          dateB = dB;
          break;
        }
      }
      if (dateA) break;
    }

    assert.ok(dateA && dateB, "should find a 六冲 day-branch pair in candidates");

    const result = computeBaziCompatibility({
      personA: { name: "甲", birthDate: dateA, birthTime: "08:00", gender: "male" },
      personB: { name: "乙", birthDate: dateB, birthTime: "08:00", gender: "female" },
      relationshipType: "romance",
    });

    assert.equal(result.error, undefined);
    const dayDim = result.dimensions.find((d) => d.key === "dayBranch");
    assert.ok(dayDim);
    assert.ok(dayDim!.evidence.some((e) => e.includes("六冲") || e.includes("冲")));
    assert.ok(result.conflictSources.length > 0);
    assert.ok(result.summary.includes("甲") && result.summary.includes("乙"));
  });

  it("golden: 日支六合 pair produces harmonious dayBranch tone", () => {
    const candidatesA = ["1984-02-02", "1990-05-15", "1996-03-15"];
    const candidatesB = ["1985-06-20", "1991-09-10", "1997-11-05"];

    let dateA = "";
    let dateB = "";

    outer: for (const dA of candidatesA) {
      const bA = computeBazi({ birthDate: dA, birthTime: "08:00" });
      if (!bA.pillars) continue;
      const branchA = bA.pillars.day.charAt(1);
      for (const dB of candidatesB) {
        const bB = computeBazi({ birthDate: dB, birthTime: "08:00" });
        if (!bB.pillars) continue;
        const branchB = bB.pillars.day.charAt(1);
        const rels = detectBranchRelations(branchA, branchB);
        if (rels.some((r) => r.kind === "六合")) {
          dateA = dA;
          dateB = dB;
          break outer;
        }
      }
    }

    assert.ok(dateA && dateB, "should find a 六合 day-branch pair in candidates");

    const result = computeBaziCompatibility({
      personA: { name: "甲", birthDate: dateA, birthTime: "08:00", gender: "male" },
      personB: { name: "乙", birthDate: dateB, birthTime: "08:00", gender: "female" },
      relationshipType: "romance",
    });

    const dayDim = result.dimensions.find((d) => d.key === "dayBranch");
    assert.equal(dayDim?.tone, "harmonious");
    assert.ok(dayDim!.evidence.some((e) => e.includes("六合")));
  });

  it("relationshipType changes summary context label", () => {
    const resultRomance = computeBaziCompatibility({
      personA: { name: "甲", birthDate: "1990-05-15", birthTime: "08:30", gender: "male" },
      personB: { name: "乙", birthDate: "1992-08-20", birthTime: "10:00", gender: "female" },
      relationshipType: "romance",
    });
    const resultBusiness = computeBaziCompatibility({
      personA: { name: "甲", birthDate: "1990-05-15", birthTime: "08:30", gender: "male" },
      personB: { name: "乙", birthDate: "1992-08-20", birthTime: "10:00", gender: "female" },
      relationshipType: "business",
    });

    assert.ok(resultRomance.summary.includes("伴侣"));
    assert.ok(resultBusiness.summary.includes("同事"));
    const tenRomance = resultRomance.dimensions.find((d) => d.key === "tenGod");
    const tenBusiness = resultBusiness.dimensions.find((d) => d.key === "tenGod");
    assert.notEqual(tenRomance?.detail, tenBusiness?.detail);
  });

  it("returns seven dimensions", () => {
    const result = computeBaziCompatibility({
      personA: { birthDate: "1990-05-15", birthTime: "08:30", gender: "male" },
      personB: { birthDate: "1992-08-20", birthTime: "10:00", gender: "female" },
      relationshipType: "general",
    });
    assert.equal(result.dimensions.length, 7);
    const keys = result.dimensions.map((d) => d.key);
    assert.deepEqual(keys, [
      "dayBranch",
      "dayMaster",
      "pillarCross",
      "elementComplement",
      "strengthBalance",
      "tenGod",
      "deityCross",
    ]);
  });
});
