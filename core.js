/* ============================================================
   lunar Journal · core store
   ============================================================ */
(function () {
  "use strict";

  const KEY = "moonphase.v1";
  const VERSION = 1;
  const fmtDateBase = (d) => {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const todayKey = () => fmtDateBase(new Date());
  const fmtDate = (d) => {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const shiftDate = (key, days) => {
    const d = new Date(key + "T12:00:00");
    d.setDate(d.getDate() + days);
    return fmtDate(d);
  };
  const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const money = (n) => "¥" + Number(n || 0).toFixed(2).replace(/\.00$/, "");
  const escape = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const deepMerge = (base, extra) => {
    if (Array.isArray(base)) return Array.isArray(extra) ? extra : base;
    if (base && typeof base === "object") {
      const out = { ...base };
      if (extra && typeof extra === "object") {
        Object.keys(extra).forEach((k) => { out[k] = deepMerge(base[k], extra[k]); });
      }
      return out;
    }
    return extra === undefined ? base : extra;
  };

  const defaults = () => ({
    version: VERSION,
    meta: { seeded: false, createdAt: new Date().toISOString() },
    user: {
      alias: "夜航员 07", initial: "夜", level: 3, xp: 240, streak: 6,
      credits: 128, joined: "2026-09-01", lastReadingDate: "2026-11-16",
    },
    settings: { motion: "full", blurPrivate: false, sound: false, journalPrivacy: false },
    ai: { provider: "openai", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", remember: false, consent: false },
    readings: [],
    annotations: {},
    inventory: [],
    sanctum: {
      preset: "A",
      cloth: "#3f4a63",
      items: [
        { uid: "seed-candle", kind: "candle", productId: null, name: "黄铜烛台", color: "#c3a05e", x: 24, y: 38, rot: 0, scale: 1, z: 2 },
        { uid: "seed-crystal", kind: "crystal", productId: null, name: "白水晶", color: "#d9cbb2", x: 72, y: 66, rot: 14, scale: 1, z: 3 },
      ],
    },
    cart: [],
    orders: [],
    oracle: { lastDate: "", revealed: false, answers: {} },
    reviews: {},
    lastOrder: null,
  });

  const seedReadings = () => ([
    {
      id: "r_demo_01", createdAt: "2026-11-16T23:41:00+08:00", date: "2026-11-16",
      spreadId: "three-time", question: "我要不要接下这个项目？",
      cards: [
        { id: "major-07", rev: false, pos: 0 },
        { id: "major-12", rev: false, pos: 1 },
        { id: "pentacles-08", rev: true, pos: 2 },
      ],
      mood: "犹豫", note: "先问清楚预算和兜底，再决定要不要冲。", shared: true,
      aiText: "", source: "demo",
    },
    {
      id: "r_demo_02", createdAt: "2026-11-14T22:08:00+08:00", date: "2026-11-14",
      spreadId: "one", question: "今天最该被看见的是什么？",
      cards: [{ id: "major-02", rev: false, pos: 0 }],
      mood: "安静", note: "别急着解释。先听自己把话说完。", shared: false,
      aiText: "", source: "demo",
    },
    {
      id: "r_demo_03", createdAt: "2026-11-09T20:12:00+08:00", date: "2026-11-09",
      spreadId: "relationship", question: "这段关系里，我还在等什么？",
      cards: [
        { id: "cups-08", rev: false, pos: 0 },
        { id: "swords-02", rev: true, pos: 1 },
        { id: "major-18", rev: false, pos: 2 },
        { id: "cups-04", rev: false, pos: 3 },
        { id: "major-17", rev: true, pos: 4 },
      ],
      mood: "低落", note: "等一个不会来的答案，本身就是答案。", shared: true,
      aiText: "", source: "demo",
    },
    {
      id: "r_demo_04", createdAt: "2026-11-03T09:20:00+08:00", date: "2026-11-03",
      spreadId: "three-choice", question: "要不要把工作室搬去另一个城市？",
      cards: [
        { id: "major-07", rev: false, pos: 0 },
        { id: "pentacles-06", rev: false, pos: 1 },
        { id: "major-14", rev: true, pos: 2 },
      ],
      mood: "清醒", note: "先试住一个月，不用一次押上全部。", shared: false,
      aiText: "", source: "demo",
    },
  ]);

  const seedOrders = () => ([
    {
      id: "MP26110201", type: "service", status: "completed", createdAt: "2026-11-02T21:18:00+08:00",
      paidAt: "2026-11-02T21:19:00+08:00", payment: "wechat",
      items: [{ id: "pkg-three", name: "三牌详解 · 夜航员 07", price: 69, qty: 1, image: "assets/img/masters/master-1.svg" }],
      service: { masterId: "night-07", alias: "夜航员 07", packageId: "three", packageName: "三牌详解", price: 69, question: "我要不要接下这个项目？", spreadId: "three-time", delivery: "48 小时内", commission: 10.35 },
      subtotal: 69, shipping: 0, total: 69,
      deliveryText: "战车在最左，倒吊人在中间，星币八在最后。你缺的不是能力，是一个允许自己慢下来的位置。可以接，但先把交付拆成两周一个模块，并明确谁兜底。",
      review: { stars: 5, text: "没有替我下结论，但把我绕开的那句话指出来了。", date: "2026-11-05" },
      timeline: [
        { key: "created", label: "预约已提交", date: "2026-11-02T21:18:00+08:00", done: true },
        { key: "paid", label: "支付成功（演示）", date: "2026-11-02T21:19:00+08:00", done: true },
        { key: "accepted", label: "解牌师接单", date: "2026-11-02T22:02:00+08:00", done: true },
        { key: "delivered", label: "解读已交付", date: "2026-11-04T18:30:00+08:00", done: true },
        { key: "completed", label: "已完成", date: "2026-11-05T10:12:00+08:00", done: true },
      ],
    },
    {
      id: "MP26110602", type: "physical", status: "shipped", createdAt: "2026-11-06T14:22:00+08:00",
      paidAt: "2026-11-06T14:23:00+08:00", payment: "alipay",
      items: [
        { id: "deck-codex", name: "月相·韦特塔罗牌", price: 168, qty: 1, image: "assets/img/products/deck.jpg" },
        { id: "cloth-indigo", name: "深靛桌布", price: 128, qty: 1, image: "assets/img/products/cloth-indigo.svg" },
      ],
      subtotal: 296, shipping: 0, total: 296,
      address: { name: "林", phone: "138****0321", province: "浙江省", city: "杭州市", detail: "西湖区 文三路 90 号 3 幢 502" },
      tracking: { carrier: "顺丰速运", no: "SF1432890011223" },
      review: null,
      timeline: [
        { key: "created", label: "订单已提交", date: "2026-11-06T14:22:00+08:00", done: true },
        { key: "paid", label: "支付成功（演示）", date: "2026-11-06T14:23:00+08:00", done: true },
        { key: "shipped", label: "已发货", date: "2026-11-08T09:10:00+08:00", done: true },
        { key: "received", label: "确认收货", date: "", done: false },
        { key: "completed", label: "已完成", date: "", done: false },
      ],
    },
    {
      id: "MP26111003", type: "service", status: "paid", createdAt: "2026-11-10T19:05:00+08:00",
      paidAt: "2026-11-10T19:06:00+08:00", payment: "wechat",
      items: [{ id: "pkg-three", name: "三牌详解 · 灰塔", price: 89, qty: 1, image: "assets/img/masters/master-2.svg" }],
      service: { masterId: "grey-tower", alias: "灰塔", packageId: "three", packageName: "三牌详解", price: 89, question: "现在换工作，是时机还是逃避？", spreadId: "three-choice", delivery: "24 小时内", commission: 13.35 },
      subtotal: 89, shipping: 0, total: 89,
      deliveryText: "",
      review: null,
      timeline: [
        { key: "created", label: "预约已提交", date: "2026-11-10T19:05:00+08:00", done: true },
        { key: "paid", label: "支付成功（演示）", date: "2026-11-10T19:06:00+08:00", done: true },
        { key: "accepted", label: "解牌师接单", date: "", done: false },
        { key: "delivered", label: "解读已交付", date: "", done: false },
        { key: "completed", label: "已完成", date: "", done: false },
      ],
    },
    {
      id: "MP26111204", type: "virtual", status: "completed", createdAt: "2026-11-12T11:40:00+08:00",
      paidAt: "2026-11-12T11:41:00+08:00", payment: "wechat",
      items: [
        { id: "cloth-wine", name: "酒红丝绒桌布", price: 18, qty: 1, image: "assets/img/products/cloth-wine.svg" },
        { id: "mirror-obsidian", name: "黑曜石镜", price: 32, qty: 1, image: "assets/img/products/mirror.svg" },
      ],
      subtotal: 50, shipping: 0, total: 50,
      review: null,
      timeline: [
        { key: "created", label: "订单已提交", date: "2026-11-12T11:40:00+08:00", done: true },
        { key: "paid", label: "支付成功（演示）", date: "2026-11-12T11:41:00+08:00", done: true },
        { key: "completed", label: "器物已发放", date: "2026-11-12T11:41:00+08:00", done: true },
      ],
    },
  ]);

  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { saved = null; }
    let state = deepMerge(defaults(), saved || {});
    if (!state.meta.seeded) {
      state.readings = seedReadings();
      state.orders = seedOrders();
      state.inventory = ["cloth-wine", "mirror-obsidian", "sage-bundle"];
      state.annotations = {
        "major-00": "我的愚者：先迈一步，再修路。",
        "major-02": "女祭司：答案在帘子后面，先别急着解释。",
        "cups-08": "圣杯八：离开不是背叛，是承认自己不属于那里。",
      };
      state.meta.seeded = true;
      state.meta.createdAt = new Date().toISOString();
    }
    return state;
  }

  const state = load();
  const listeners = new Set();
  function emit() {
    document.dispatchEvent(new CustomEvent("codex:change", { detail: state }));
    listeners.forEach((fn) => { try { fn(state); } catch (e) { console.warn(e); } });
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("storage failed", e);
    }
    emit();
  }
  function update(fn) {
    fn(state);
    save();
    return state;
  }

  const Codex = {
    KEY, VERSION, state,
    todayKey, shiftDate, uid, money, escape, deepMerge,
    save, update, emit,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get(sel) { return sel.split(".").reduce((o, k) => (o ? o[k] : undefined), state); },
    set(path, value) { const parts = path.split("."); let o = state; parts.slice(0, -1).forEach((k) => { o = o[k] || (o[k] = {}); }); o[parts[parts.length - 1]] = value; save(); },

    // ---------------- user ----------------
    addCredits(n) { state.user.credits = Math.max(0, (state.user.credits || 0) + n); save(); },
    addXp(n) {
      state.user.xp = Math.max(0, (state.user.xp || 0) + n);
      const levels = [0, 100, 220, 360, 520, 700, 920, 1180];
      let lv = 1;
      levels.forEach((t, i) => { if (state.user.xp >= t) lv = i + 1; });
      state.user.level = lv;
      save();
    },

    // ---------------- readings ----------------
    readingById(id) { return state.readings.find((r) => r.id === id) || null; },
    saveReading(reading) {
      const existing = state.readings.findIndex((r) => r.id === reading.id);
      const isNew = existing < 0;
      if (existing >= 0) state.readings[existing] = reading;
      else state.readings.unshift(reading);
      if (isNew) {
        const today = todayKey();
        if (state.user.lastReadingDate !== today) {
          state.user.streak = state.user.lastReadingDate === shiftDate(today, -1) ? (state.user.streak || 0) + 1 : 1;
          state.user.lastReadingDate = today;
        }
        state.user.credits += 12;
        state.user.xp += 20;
        const levels = [0, 100, 220, 360, 520, 700, 920, 1180];
        let lv = 1;
        levels.forEach((t, i) => { if (state.user.xp >= t) lv = i + 1; });
        state.user.level = lv;
      }
      save();
      return reading;
    },
    deleteReading(id) {
      state.readings = state.readings.filter((r) => r.id !== id);
      if (state.oracle.lastDate === id) { /* noop */ }
      save();
    },
    readingsForCard(id) { return state.readings.filter((r) => r.cards.some((c) => c.id === id)); },
    journalStats() {
      const readings = state.readings;
      const counts = {};
      readings.forEach((r) => r.cards.forEach((c) => { counts[c.id] = (counts[c.id] || 0) + 1; }));
      const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      const elements = { 火: 0, 水: 0, 风: 0, 土: 0 };
      readings.forEach((r) => r.cards.forEach((c) => {
        const card = window.CODEX.cardById[c.id];
        if (card && card.element && elements[card.element] !== undefined) elements[card.element] += 1;
      }));
      return {
        total: readings.length,
        streak: state.user.streak,
        topCard: top ? window.CODEX.cardById[top] : null,
        topCount: top ? counts[top] : 0,
        elements,
      };
    },

    // ---------------- cart / orders ----------------
    cartDetailed() {
      return state.cart.map((line) => {
        const p = window.CODEX.productById[line.id];
        return p ? { ...p, qty: line.qty, lineTotal: p.price * line.qty } : null;
      }).filter(Boolean);
    },
    cartCount() { return state.cart.reduce((n, l) => n + l.qty, 0); },
    addToCart(id, qty = 1) {
      const p = window.CODEX.productById[id];
      if (!p) return;
      const line = state.cart.find((l) => l.id === id);
      if (line) line.qty += qty; else state.cart.push({ id, qty });
      save();
    },
    setCartQty(id, qty) {
      const line = state.cart.find((l) => l.id === id);
      if (!line) return;
      line.qty = Math.max(1, Math.min(99, qty));
      save();
    },
    removeFromCart(id) { state.cart = state.cart.filter((l) => l.id !== id); save(); },
    clearCart() { state.cart = []; save(); },
    cartTotals() {
      const detailed = Codex.cartDetailed();
      const subtotal = detailed.reduce((n, p) => n + p.lineTotal, 0);
      const hasPhysical = detailed.some((p) => p.type === "physical");
      const physicalSubtotal = detailed.filter((p) => p.type === "physical").reduce((n, p) => n + p.lineTotal, 0);
      const shipping = hasPhysical && physicalSubtotal > 0 && physicalSubtotal < 199 ? 12 : 0;
      return { items: detailed, subtotal, shipping, total: subtotal + shipping, hasPhysical };
    },

    orderById(id) { return state.orders.find((o) => o.id === id) || null; },
    createOrder(payload) {
      const id = "MP" + todayKey().replace(/-/g, "").slice(2) + String(Math.floor(Math.random() * 900) + 100);
      const now = new Date().toISOString();
      const order = {
        id, type: payload.type, status: "pending_payment", createdAt: now, paidAt: "",
        payment: payload.payment || "", items: payload.items || [],
        service: payload.service || null,
        subtotal: payload.subtotal || 0, shipping: payload.shipping || 0, total: payload.total || 0,
        address: payload.address || null, tracking: null, review: null,
        timeline: [{ key: "created", label: "订单已提交", date: now, done: true }],
      };
      state.orders.unshift(order);
      state.lastOrder = id;
      save();
      return order;
    },
    payOrder(id, method = "wechat") {
      const o = Codex.orderById(id);
      if (!o) return null;
      o.payment = method;
      o.paidAt = new Date().toISOString();
      o.timeline.push({ key: "paid", label: "支付成功（演示）", date: o.paidAt, done: true });
      if (o.type === "virtual") {
        o.status = "completed";
        o.items.forEach((it) => { if (!state.inventory.includes(it.id)) state.inventory.push(it.id); });
        o.timeline.push({ key: "completed", label: "器物已发放", date: o.paidAt, done: true });
      } else if (o.type === "physical") {
        o.status = "paid";
      } else {
        o.status = "paid";
      }
      save();
      return o;
    },
    advanceOrder(id) {
      const o = Codex.orderById(id);
      if (!o) return null;
      const now = new Date().toISOString();
      const add = (key, label) => { if (!o.timeline.some((t) => t.key === key)) o.timeline.push({ key, label, date: now, done: true }); };
      if (o.status === "pending_payment") return Codex.payOrder(id, o.payment || "wechat");
      if (o.type === "service") {
        if (o.status === "paid") { o.status = "accepted"; add("accepted", "解牌师接单"); }
        else if (o.status === "accepted") {
          o.status = "delivered";
          if (!o.deliveryText) o.deliveryText = o.service ? "牌面已经看完。先说结论：这件事可以推进，但你需要先把“证明自己”的部分拿掉。三张牌里最关键的是中间那张——它不是在阻止你，而是在提醒你换一个位置。具体建议已写在订单备注里。" : "";
          add("delivered", "解读已交付");
        } else if (o.status === "delivered") { o.status = "completed"; add("completed", "已完成"); }
      } else if (o.type === "physical") {
        if (o.status === "paid") { o.status = "shipped"; o.tracking = { carrier: "顺丰速运", no: "SF" + Date.now().toString().slice(-12) }; add("shipped", "已发货"); }
        else if (o.status === "shipped") { o.status = "received"; add("received", "确认收货"); }
        else if (o.status === "received") { o.status = "completed"; add("completed", "已完成"); }
      } else if (o.type === "virtual" && o.status === "pending_payment") {
        Codex.payOrder(id);
      }
      save();
      return o;
    },
    refundOrder(id) {
      const o = Codex.orderById(id);
      if (!o) return null;
      o.status = "refunded";
      o.timeline.push({ key: "refunded", label: "退款已受理（演示）", date: new Date().toISOString(), done: true });
      save();
      return o;
    },
    redeemWithCredits(id) {
      const p = window.CODEX.productById[id];
      if (!p || p.type !== "virtual" || !p.credits) throw new Error("这件器物不支持月华兑换。");
      if (state.user.credits < p.credits) throw new Error("月华不够，再记录几次吧。");
      state.user.credits -= p.credits;
      if (!state.inventory.includes(id)) state.inventory.push(id);
      const now = new Date().toISOString();
      const order = {
        id: "MP" + todayKey().replace(/-/g, "").slice(2) + String(Math.floor(Math.random() * 900) + 100),
        type: "virtual", status: "completed", createdAt: now, paidAt: now, payment: "credits",
        items: [{ id: p.id, name: p.name, price: 0, qty: 1, image: p.image }],
        service: null, subtotal: 0, shipping: 0, total: 0, address: null, tracking: null, review: null,
        timeline: [
          { key: "created", label: "兑换已提交", date: now, done: true },
          { key: "completed", label: "器物已发放", date: now, done: true },
        ],
      };
      state.orders.unshift(order);
      save();
      return order;
    },
    reviewOrder(id, stars, text) {
      const o = Codex.orderById(id);
      if (!o) return null;
      o.review = { stars, text, date: todayKey() };
      state.reviews[id] = o.review;
      state.user.credits += 5;
      state.user.xp += 10;
      save();
      return o;
    },

    // ---------------- sanctum ----------------
    sanctumInventory() {
      const purchased = state.inventory.map((id) => window.CODEX.productById[id]).filter(Boolean);
      return purchased.filter((p) => p.type === "virtual");
    },
    saveSanctum(items, cloth) {
      state.sanctum.items = items;
      if (cloth) state.sanctum.cloth = cloth;
      save();
    },

    // ---------------- oracle ----------------
    oracleAnswer(date, text) {
      state.oracle.answers[date] = text;
      state.oracle.lastDate = date;
      state.oracle.revealed = true;
      state.user.credits += 3;
      save();
    },

    // ---------------- AI settings ----------------
    aiConfig() { return state.ai; },
    saveAiConfig(cfg) { state.ai = { ...state.ai, ...cfg }; save(); },
    getKey() {
      try {
        return state.ai.remember ? (localStorage.getItem("moonphase.key") || "") : (sessionStorage.getItem("moonphase.key") || "");
      } catch (e) { return ""; }
    },
    setKey(key, remember) {
      state.ai.remember = !!remember;
      try {
        if (remember) { localStorage.setItem("moonphase.key", key); sessionStorage.removeItem("moonphase.key"); }
        else { sessionStorage.setItem("moonphase.key", key); localStorage.removeItem("moonphase.key"); }
      } catch (e) { /* ignore */ }
      save();
    },
    clearKey() {
      try { localStorage.removeItem("moonphase.key"); sessionStorage.removeItem("moonphase.key"); } catch (e) { /* ignore */ }
      save();
    },

    // ---------------- data helpers ----------------
    card(id) { return window.CODEX.cardById[id] || null; },
    spread(id) { return window.CODEX.spreadById[id] || window.CODEX.spreads[0]; },
    product(id) { return window.CODEX.productById[id] || null; },
    master(id) { return window.CODEX.masterById[id] || null; },
    post(id) { return window.CODEX.postById[id] || null; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    draw(n, allowRev = true) {
      const deck = Codex.shuffle(window.CODEX.cards).slice(0, n);
      return deck.map((c, i) => ({ id: c.id, rev: allowRev ? Math.random() < 0.32 : false, pos: i }));
    },
    reset(seed = true) {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      const fresh = defaults();
      if (seed) {
        fresh.readings = seedReadings();
        fresh.orders = seedOrders();
        fresh.inventory = ["cloth-wine", "mirror-obsidian", "sage-bundle"];
        fresh.annotations = { "major-00": "我的愚者：先迈一步，再修路。", "major-02": "女祭司：答案在帘子后面，先别急着解释。", "cups-08": "圣杯八：离开不是背叛，是承认自己不属于那里。" };
        fresh.meta.seeded = true;
      }
      Object.keys(state).forEach((k) => { delete state[k]; });
      Object.assign(state, fresh);
      save();
      return state;
    },
    exportData() {
      const { ai, ...rest } = state;
      return JSON.stringify({ ...rest, exportedAt: new Date().toISOString() }, null, 2);
    },
    importData(json) {
      const parsed = JSON.parse(json);
      const merged = deepMerge(defaults(), parsed);
      merged.ai = { ...state.ai, ...(parsed.ai || {}) };
      Object.keys(state).forEach((k) => { delete state[k]; });
      Object.assign(state, merged);
      save();
      return state;
    },
  };

  window.CODEX = window.CODEX || {};
  window.Codex = Codex;
})();
