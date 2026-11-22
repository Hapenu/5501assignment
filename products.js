/* lunar Journal · market */
(function () {
  "use strict";
  const products = [
    {
      id: "deck-codex", type: "physical", name: "月相·韦特塔罗牌", sub: "78 张 · RWS 牌面 · 附牌记小册",
      price: 168, credits: 0, image: "assets/img/products/deck.jpg", badge: "器物志",
      stock: 18, shipping: 0, featured: true, accent: "#c3a05e",
      desc: "一套为“记录”而做的牌。采用 1909 年公有领域 RWS 牌面，配原创月相牌背。",
      details: ["78 张，400g 米白卡纸，哑光覆膜", "牌面 70 × 122mm，牌背同心月相", "附 32 页牌记小册与一张圣所桌布卡", "独立包装，可平摊收纳"],
      story: "牌面采用 Pamela Colman Smith 于 1909 年绘制的 Rider-Waite-Smith 图像，属于公有领域。牌背与包装为本作品原创月相线刻；78 张牌义由本作品重写。",
    },
    {
      id: "cloth-indigo", type: "physical", name: "深靛桌布", sub: "棉麻 · 90 × 90cm · 手工锁边",
      price: 128, credits: 0, image: "assets/img/products/cloth-indigo.svg", badge: "现货",
      stock: 26, shipping: 0, featured: true, accent: "#3f4a63",
      desc: "一块足够大的深靛桌布，能把手机、牌、蜡烛和一杯茶都放进去。",
      details: ["棉麻混纺，克重 260g", "90 × 90cm，可平铺 78 张牌", "手工锁边，四角压月相暗纹", "冷水轻柔手洗，阴干"],
      story: "布是圣所的第一层。深靛不会抢走牌面的颜色，也能在夜里把光收住。",
    },
    {
      id: "candle-brass", type: "physical", name: "黄铜烛台与蜂蜡烛", sub: "黄铜 · 蜂蜡 · 约 8 小时",
      price: 98, credits: 0, image: "assets/img/products/candle.svg", badge: "手作",
      stock: 14, shipping: 0, featured: false, accent: "#c3a05e",
      desc: "一支不喧哗的蜡烛。烛火是圣所里唯一会动的光。",
      details: ["黄铜烛台，直径 70mm", "蜂蜡柱烛，高 120mm，燃烧约 8 小时", "无香型，适合对气味敏感的人", "烛芯需修剪至 5mm"],
      story: "我们不建议在无人看管时点烛。仪式感的前提，是安全。",
    },
    {
      id: "journal-moon", type: "physical", name: "月相牌记本", sub: "布面精装 · 192 页 · 100g 米白",
      price: 68, credits: 0, image: "assets/img/products/journal.svg", badge: "补货",
      stock: 0, shipping: 0, featured: true, accent: "#c3a05e",
      desc: "给每一次抽牌留一页。左边贴牌，右边写你自己的话。",
      details: ["A5 布面精装，192 页", "100g 米白道林纸，钢笔不洇", "内页含月相周期表与牌阵格", "附松紧带与书签绳"],
      story: "数字牌记很方便，但手写会慢下来。慢下来的时候，有些话才写得出来。",
    },
    {
      id: "crystal-clear", type: "physical", name: "白水晶簇", sub: "天然白水晶 · 200–300g",
      price: 138, credits: 0, image: "assets/img/products/crystal.svg", badge: "天然",
      stock: 9, shipping: 0, featured: false, accent: "#c3a05e",
      desc: "一块不规则的晶簇。它不需要被赋予太多意义，放在那里就很好。",
      details: ["天然白水晶，每块形态不同", "约 200–300g，高 6–9cm", "附木质底座与养护布", "避免长时间日晒"],
      story: "我们不做水晶功效承诺。它是一块好看的石头，也是一个让桌面安静下来的理由。",
    },
    {
      id: "incense-sandal", type: "physical", name: "檀香与黄铜香插", sub: "线香 40 支 · 黄铜香插",
      price: 48, credits: 0, image: "assets/img/products/incense.svg", badge: "日常",
      stock: 40, shipping: 0, featured: false, accent: "#c3a05e",
      desc: "点一支香，给“开始”一个信号。烟会提醒你：现在可以慢一点。",
      details: ["印度老山檀线香 40 支", "黄铜香插，直径 42mm", "单支燃烧约 25 分钟", "远离易燃物，保持通风"],
      story: "香不是必需品。它只是一个很轻的开关。",
    },
    {
      id: "cloth-wine", type: "virtual", name: "酒红丝绒桌布", sub: "虚拟器物 · 可用于圣所",
      price: 18, credits: 80, image: "assets/img/products/cloth-wine.svg", badge: "圣所器物",
      stock: 999, shipping: 0, featured: true, accent: "#5b2f3a", slot: "cloth",
      desc: "把圣所的桌面换成酒红丝绒。光会变暖，牌面的金会更沉。",
      details: ["购买后永久加入“我的器物”", "在圣所 → 器物架中应用", "可与其他桌布切换", "虚拟物品，不产生物流"],
      story: "酒红适合冬天，也适合那些需要一点勇气开口的夜晚。",
    },
    {
      id: "cloth-olive", type: "virtual", name: "橄榄绿麻布", sub: "虚拟器物 · 可用于圣所",
      price: 15, credits: 60, image: "assets/img/products/cloth-olive.svg", badge: "圣所器物",
      stock: 999, shipping: 0, featured: false, accent: "#4b523a", slot: "cloth",
      desc: "一块像旧书封面的绿。适合白天，也适合不想太戏剧化的占卜。",
      details: ["购买后永久加入“我的器物”", "在圣所 → 器物架中应用", "可与其他桌布切换", "虚拟物品，不产生物流"],
      story: "不是每个夜晚都需要烛光和烟雾。有时一块安静的布就够了。",
    },
    {
      id: "athame-brass", type: "virtual", name: "黄铜裁纸刀", sub: "虚拟器物 · 可用于圣所",
      price: 38, credits: 120, image: "assets/img/products/athame.svg", badge: "圣所器物",
      stock: 999, shipping: 0, featured: false, accent: "#c3a05e", slot: "blade",
      desc: "不是用来切东西的。它只是在桌上，提醒你：你可以划一条界线。",
      details: ["购买后永久加入“我的器物”", "在圣所 → 器物架中应用", "可旋转、缩放、摆放", "虚拟物品，不产生物流"],
      story: "裁纸刀在仪式里代表“切割”：把要留下的和要放下的分开。",
    },
    {
      id: "sage-bundle", type: "virtual", name: "鼠尾草束", sub: "虚拟器物 · 可用于圣所",
      price: 12, credits: 40, image: "assets/img/products/sage.svg", badge: "圣所器物",
      stock: 999, shipping: 0, featured: false, accent: "#7c8a75", slot: "smoke",
      desc: "一缕很轻的烟。不是为了驱赶什么，只是让空气换一个方向。",
      details: ["购买后永久加入“我的器物”", "在圣所 → 器物架中应用", "烟雾为装饰动效，无真实燃烧", "虚拟物品，不产生物流"],
      story: "如果你对烟敏感，可以在设置里关闭圣所的烟雾动效。",
    },
    {
      id: "bowl-brass", type: "virtual", name: "黄铜香炉", sub: "虚拟器物 · 可用于圣所",
      price: 28, credits: 90, image: "assets/img/products/bowl.svg", badge: "圣所器物",
      stock: 999, shipping: 0, featured: false, accent: "#c3a05e", slot: "bowl",
      desc: "一只空的香炉。空不是没有，是还可以放进去。",
      details: ["购买后永久加入“我的器物”", "在圣所 → 器物架中应用", "可与鼠尾草、线香组合", "虚拟物品，不产生物流"],
      story: "空香炉在桌上，本身就是一个问题：你今天想放进去什么？",
    },
    {
      id: "bell-silver", type: "virtual", name: "银铃", sub: "虚拟器物 · 可用于圣所",
      price: 22, credits: 70, image: "assets/img/products/bell.svg", badge: "圣所器物",
      stock: 999, shipping: 0, featured: false, accent: "#c3a05e", slot: "sound",
      desc: "开始和结束各摇一次。声音很短，但它把时间分成了两段。",
      details: ["购买后永久加入“我的器物”", "在圣所 → 器物架中应用", "点击铃身可播放一声轻响", "虚拟物品，不产生物流"],
      story: "铃不是用来填满安静的，是用来标记安静的边界。",
    },
    {
      id: "pendulum-quartz", type: "virtual", name: "白水晶灵摆", sub: "虚拟器物 · 可用于圣所",
      price: 26, credits: 80, image: "assets/img/products/pendulum.svg", badge: "圣所器物",
      stock: 999, shipping: 0, featured: false, accent: "#c3a05e", slot: "pendulum",
      desc: "让它自己晃。你不需要从摆动里读出命运，只需要看自己会不会安静下来。",
      details: ["购买后永久加入“我的器物”", "在圣所 → 器物架中应用", "摆动为装饰动效", "虚拟物品，不产生物流"],
      story: "灵摆最适合被当作一个停顿，而不是一个答案。",
    },
    {
      id: "mirror-obsidian", type: "virtual", name: "黑曜石镜", sub: "虚拟器物 · 可用于圣所",
      price: 32, credits: 100, image: "assets/img/products/mirror.svg", badge: "圣所器物",
      stock: 999, shipping: 0, featured: true, accent: "#c3a05e", slot: "mirror",
      desc: "一面不反射你的镜子。它只反射烛光，和你想看见的东西。",
      details: ["购买后永久加入“我的器物”", "在圣所 → 器物架中应用", "可旋转、缩放、摆放", "虚拟物品，不产生物流"],
      story: "黑镜在传统里用于“看”。我们更愿意把它当作一块深色的留白。",
    },
  ];
  window.CODEX = window.CODEX || {};
  window.CODEX.products = products;
  window.CODEX.productById = products.reduce((a, p) => { a[p.id] = p; return a; }, {});
  window.CODEX.freeItems = [
    { id: "free-cloth", kind: "cloth", name: "深靛桌布", color: "#3f4a63" },
    { id: "free-candle", kind: "candle", name: "黄铜烛台", color: "#c3a05e" },
    { id: "free-crystal", kind: "crystal", name: "白水晶", color: "#d9cbb2" },
    { id: "free-bowl", kind: "bowl", name: "空香炉", color: "#c3a05e" },
  ];
})();
