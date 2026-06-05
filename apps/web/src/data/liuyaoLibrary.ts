export const LIUYAO_USEFUL_GOD: Record<string, { god: string; note: string }> = {
  事业申请: { god: "官鬼", note: "看官鬼旺衰与动变，兼看父母（文书）。" },
  合作关系: { god: "世爻", note: "世应关系为核心，兼看妻财。" },
  财务得失: { god: "妻财", note: "妻财旺相则利，空破则迟。" },
  失物寻人: { god: "子孙", note: "子孙发动多可寻回。" },
  健康状态: { god: "子孙", note: "子孙为解药之神，忌官鬼持世。" },
};

export const LIUYAO_STRENGTH: Record<string, string> = {
  旺: "当令有力，事易成。",
  相: "得生扶，有助力。",
  休: "失令，力量平常。",
  囚: "受克，阻力较大。",
  死: "无气，宜静不宜动。",
  空: "空亡，事多虚浮或延迟。",
};

export const LIUYAO_RELATIVES: Record<string, string> = {
  父母: "文书、长辈、保护、合同证件",
  兄弟: "竞争、分利、同辈消耗",
  子孙: "解忧、产出、医药、下属",
  妻财: "财物、机会、女性、资源",
  官鬼: "压力、规则、风险、职位",
};

export const LIUYAO_PALACES: Record<string, string> = {
  乾: "金宫，天、父、首、刚健",
  坤: "土宫，地、母、腹、柔顺",
  震: "木宫，雷、长男、动、启动",
  巽: "木宫，风、长女、入、渗透",
  坎: "水宫，水、中男、陷、险",
  离: "火宫，火、中女、明、附丽",
  艮: "土宫，山、少男、止、守",
  兑: "金宫，泽、少女、悦、口舌",
};
