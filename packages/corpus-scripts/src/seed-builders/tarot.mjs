import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "tarot_78",
  source_type: "self_authored",
  license_note: "自研塔罗牌义与阵位语义，非 Waite-Smith 原文复刻",
  source_url: null,
  verbatim_allowed: false,
};

/** 大阿卡纳 0–21 */
export const MAJOR_ARCANA = [
  { num: 0, name: "愚者", upright: "新开始、信任、冒险精神", reversed: "鲁莽、逃避责任、方向不明" },
  { num: 1, name: "魔术师", upright: "意志、技能、资源就绪", reversed: "操控、才能浪费、欺骗" },
  { num: 2, name: "女祭司", upright: "直觉、潜意识、静观", reversed: "压抑直觉、表面化、秘密泄露" },
  { num: 3, name: "女皇", upright: "丰饶、滋养、感官愉悦", reversed: "依赖、创造力阻塞、过度放纵" },
  { num: 4, name: "皇帝", upright: "结构、权威、稳定领导", reversed: "僵化、专制、控制欲" },
  { num: 5, name: "教皇", upright: "传统、教导、精神指引", reversed: "教条、反叛传统、虚伪道德" },
  { num: 6, name: "恋人", upright: "选择、价值一致、联结", reversed: "失衡、逃避选择、关系裂痕" },
  { num: 7, name: "战车", upright: "意志胜利、前进、自律", reversed: "失控、方向冲突、侵略性" },
  { num: 8, name: "力量", upright: "温柔的力量、勇气、耐心", reversed: "自我怀疑、软弱、情绪失控" },
  { num: 9, name: "隐者", upright: "内省、独处、智慧追寻", reversed: "孤立、拒绝帮助、迷失" },
  { num: 10, name: "命运之轮", upright: "周期转折、机缘、命运流动", reversed: "坏运气感、抗拒变化、停滞" },
  { num: 11, name: "正义", upright: "公平、因果、清晰决定", reversed: "不公、偏见、逃避责任" },
  { num: 12, name: "倒吊人", upright: "换位思考、牺牲、暂停", reversed: "无谓牺牲、停滞、受害者心态" },
  { num: 13, name: "死神", upright: "结束与重生、转化、放下", reversed: "抗拒改变、拖延、恐惧结束" },
  { num: 14, name: "节制", upright: "调和、耐心、适度", reversed: "极端、失衡、急躁" },
  { num: 15, name: "恶魔", upright: "执念、束缚、物质欲望", reversed: "解脱、觉察诱惑、打破枷锁" },
  { num: 16, name: "塔", upright: "突变、真相揭露、结构崩塌", reversed: "灾难被避、压抑改变、余震" },
  { num: 17, name: "星星", upright: "希望、疗愈、灵感", reversed: "失望、信心不足、脱离现实" },
  { num: 18, name: "月亮", upright: "潜意识、迷雾、直觉梦境", reversed: "恐惧消散、真相渐明、混乱减轻" },
  { num: 19, name: "太阳", upright: "成功、活力、清晰快乐", reversed: "暂时阴郁、过度乐观、延迟成功" },
  { num: 20, name: "审判", upright: "觉醒、召唤、复盘重生", reversed: "自我批判、逃避召唤、迟疑" },
  { num: 21, name: "世界", upright: "完成、整合、阶段圆满", reversed: "未完成、差一步、闭环延迟" },
];

export const SPREAD_POSITIONS = [
  { id: "past", name: "过去", meaning: "问题的根源、已发生的影响与背景。" },
  { id: "present", name: "现在", meaning: "当前能量、核心议题与当下态度。" },
  { id: "future", name: "未来", meaning: "趋势走向，非宿命；随行动可调整。" },
  { id: "challenge", name: "挑战", meaning: "内在或外在阻力，需要面对的课题。" },
  { id: "above", name: "意识", meaning: "显意识目标、自我认知与公开意图。" },
  { id: "below", name: "潜意识", meaning: "隐藏动机、恐惧与未觉察因素。" },
  { id: "advice", name: "建议", meaning: "采取的态度或行动方向提示。" },
  { id: "external", name: "环境", meaning: "他人、环境或不可控因素的影响。" },
  { id: "hopes", name: "希望恐惧", meaning: "问卜者期待或担心的焦点。" },
  { id: "outcome", name: "结果", meaning: "若维持当前路径的可能收束。" },
  { id: "self", name: "问卜者", meaning: "问卜者在议题中的角色与状态。" },
  { id: "relationship", name: "关系", meaning: "双方互动模式与关系动力（感情阵）。" },
];

const ELEMENTS = [
  { suit: "权杖", element: "火", theme: "行动、热情、事业企图" },
  { suit: "圣杯", element: "水", theme: "情感、关系、直觉" },
  { suit: "宝剑", element: "风", theme: "思维、冲突、决策" },
  { suit: "星币", element: "土", theme: "物质、工作、身体资源" },
];

export function buildTarotChunks() {
  const chunks = [];

  for (const card of MAJOR_ARCANA) {
    const pad = String(card.num).padStart(2, "0");
    const chapter = `大阿卡纳·${card.name}`;

    chunks.push(
      makeChunk({
        id: `tarot-major-${pad}-upright`,
        ...SOURCE,
        tradition: "tarot",
        chapter,
        section: "正位",
        original_text: "",
        translation_zh: `${card.name}正位：${card.upright}`,
        annotation_zh: "自研牌义，供三牌阵正位抽取引用。",
        keywords: [card.name, "塔罗", "正位", "大阿卡纳"],
      }),
      makeChunk({
        id: `tarot-major-${pad}-reversed`,
        ...SOURCE,
        tradition: "tarot",
        chapter,
        section: "逆位",
        original_text: "",
        translation_zh: `${card.name}逆位：${card.reversed}`,
        annotation_zh: "自研牌义，逆位多主阻滞、内化或过度。",
        keywords: [card.name, "塔罗", "逆位", "大阿卡纳"],
      }),
      makeChunk({
        id: `tarot-major-${pad}-summary`,
        ...SOURCE,
        tradition: "tarot",
        chapter,
        section: "综合",
        original_text: "",
        translation_zh: `【${card.name}】正位侧重${card.upright}；逆位侧重${card.reversed}。解读须结合阵位语义。`,
        annotation_zh: `牌号 ${card.num}，大阿卡纳原型象征。`,
        keywords: [card.name, "塔罗", "牌义"],
      }),
    );
  }

  for (const pos of SPREAD_POSITIONS) {
    chunks.push(
      makeChunk({
        id: `tarot-position-${pos.id}`,
        ...SOURCE,
        tradition: "tarot",
        chapter: "三牌阵",
        section: pos.name,
        original_text: "",
        translation_zh: `阵位「${pos.name}」：${pos.meaning}`,
        annotation_zh: "三牌阵（过去-现在-未来等变体）位置语义，引擎按 seed 映射阵位。",
        keywords: ["三牌阵", pos.name, "阵位", "塔罗"],
      }),
      makeChunk({
        id: `tarot-position-${pos.id}-apply`,
        ...SOURCE,
        tradition: "tarot",
        chapter: "三牌阵",
        section: `${pos.name}·应用`,
        original_text: "",
        translation_zh: `当牌落在「${pos.name}」位，请将牌义与该位置主题结合，避免脱离位置谈抽象牌意。`,
        annotation_zh: "引用治理：应用句模板，生成时填入具体牌名。",
        keywords: ["阵位", pos.id, "应用", "塔罗"],
      }),
    );
  }

  for (const el of ELEMENTS) {
    for (const topic of ["主题", "逆位倾向", "与问题类型"]) {
      chunks.push(
        makeChunk({
          id: `tarot-suit-${el.suit}-${topic}`,
          ...SOURCE,
          tradition: "tarot",
          chapter: `小阿卡纳·${el.suit}`,
          section: topic,
          original_text: "",
          translation_zh:
            topic === "主题"
              ? `${el.suit}属${el.element}元素：${el.theme}。`
              : topic === "逆位倾向"
                ? `${el.suit}逆位时，${el.element}能量阻滞或过度，宜检视该领域的失衡。`
                : `问事业多参考权杖/星币；问感情多参考圣杯；问决策冲突多参考宝剑。`,
          annotation_zh: "花色元素规则，MVP 以大牌为主、花色为辅。",
          keywords: [el.suit, el.element, "塔罗", topic],
        }),
      );
    }
  }

  return chunks;
}
