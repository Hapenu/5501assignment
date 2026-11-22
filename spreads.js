/* lunar Journal · spreads */
(function () {
  "use strict";
  const spreads = [
    {
      id: "one", name: "单牌 · 今日", en: "One Card", count: 1,
      use: "快速校准，适合每天", time: "3 分钟",
      desc: "把今天收束成一个主题。不是预测，而是给今天一个观察的角度。",
      positions: [{ label: "今日主题", meaning: "今天最值得被看见的能量。" }],
      layout: [{ x: 50, y: 50 }],
    },
    {
      id: "three-time", name: "三牌 · 时间", en: "Past / Present / Future", count: 3,
      use: "一段正在发生的事", time: "10 分钟",
      desc: "过去、现在、未来不是命定的三段，而是三种观看的位置。",
      positions: [
        { label: "过去", meaning: "已经发生、仍在影响你的部分。" },
        { label: "现在", meaning: "此刻最真实的处境。" },
        { label: "未来", meaning: "如果保持当前方向，可能展开的趋势。" },
      ],
      layout: [{ x: 22, y: 52 }, { x: 50, y: 52 }, { x: 78, y: 52 }],
    },
    {
      id: "three-choice", name: "三牌 · 选择", en: "The Crossroads", count: 3,
      use: "二选一，或两种态度", time: "10 分钟",
      desc: "不替你选，而是把两个选项和真正需要看见的东西放在同一张桌上。",
      positions: [
        { label: "选项 A", meaning: "选择 A 会带来的能量与代价。" },
        { label: "选项 B", meaning: "选择 B 会带来的能量与代价。" },
        { label: "需要看见的", meaning: "无论选哪边，都不能忽略的那件事。" },
      ],
      layout: [{ x: 25, y: 38 }, { x: 75, y: 38 }, { x: 50, y: 72 }],
    },
    {
      id: "five-cross", name: "五牌 · 十字", en: "Five Card Cross", count: 5,
      use: "复杂处境，需要结构", time: "20 分钟",
      desc: "把处境拆成现状、阻碍、资源、建议与走向，适合一件真正卡住你的事。",
      positions: [
        { label: "现状", meaning: "你此刻实际站立的位置。" },
        { label: "阻碍", meaning: "真正让事情停住的东西。" },
        { label: "资源", meaning: "你已经有、但可能忽略的支持。" },
        { label: "建议", meaning: "下一步最值得尝试的动作。" },
        { label: "走向", meaning: "如果照此行动，可能的方向。" },
      ],
      layout: [{ x: 50, y: 22 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 50, y: 62 }, { x: 50, y: 88 }],
    },
    {
      id: "relationship", name: "关系 · 五牌", en: "Relationship", count: 5,
      use: "关系梳理，不预测对方行为", time: "25 分钟",
      desc: "关系牌阵不读取对方的心思，只整理你能看见的部分与你的边界。",
      positions: [
        { label: "我", meaning: "你在这段关系里的位置与需求。" },
        { label: "对方", meaning: "对方在这段关系里可能呈现的状态。" },
        { label: "关系", meaning: "你们之间正在发生的动力。" },
        { label: "边界", meaning: "需要被说清楚或守住的界线。" },
        { label: "可能", meaning: "如果边界清晰，关系可能走向哪里。" },
      ],
      layout: [{ x: 22, y: 30 }, { x: 78, y: 30 }, { x: 50, y: 50 }, { x: 28, y: 76 }, { x: 72, y: 76 }],
    },
    {
      id: "celtic", name: "凯尔特十字", en: "Celtic Cross", count: 10,
      use: "完整展开；图鉴 + 依次抽牌", time: "45 分钟",
      desc: "最完整的经典牌阵。十张牌，十个位置，适合需要被彻底展开的议题。",
      positions: [
        { label: "现状", meaning: "事情的核心。" },
        { label: "交叉", meaning: "横在核心上的阻碍或助力。" },
        { label: "根基", meaning: "潜意识或更深层的成因。" },
        { label: "过去", meaning: "正在退场的能量。" },
        { label: "目标", meaning: "你意识里想要的东西。" },
        { label: "未来", meaning: "近期可能展开的方向。" },
        { label: "自我", meaning: "你在这件事里的姿态。" },
        { label: "环境", meaning: "他人与外部条件。" },
        { label: "希望与恐惧", meaning: "你既期待又害怕的部分。" },
        { label: "结果", meaning: "综合以上，最可能的结果。" },
      ],
      layout: [
        { x: 50, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 78 }, { x: 22, y: 50 },
        { x: 50, y: 22 }, { x: 78, y: 50 }, { x: 86, y: 80 }, { x: 86, y: 62 },
        { x: 86, y: 44 }, { x: 86, y: 26 },
      ],
    },
  ];
  window.CODEX = window.CODEX || {};
  window.CODEX.spreads = spreads;
  window.CODEX.spreadById = spreads.reduce((a, s) => { a[s.id] = s; return a; }, {});
})();
