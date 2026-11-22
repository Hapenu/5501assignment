/* ============================================================
   lunar Journal · UI helpers
   ============================================================ */
(function () {
  "use strict";
  const C = window.Codex;
  const esc = C.escape;
  const UI = {};

  UI.icon = (name, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  UI.param = (name, fallback = "") => new URLSearchParams(location.search).get(name) || fallback;
  UI.money = C.money;
  UI.escape = esc;

  /* Three situational lenses for a card. Kept as one shared helper so the
     reading panel and the card detail page always say the same thing. */
  UI.cardLenses = (card, rev = false) => {
    const kw = (rev ? card.keywords.reversed : card.keywords.upright) || [];
    const mine = rev ? card.meaning.reversed : card.meaning.upright;
    const advice = card.advice || "先观察，不急着下结论。";
    const suit = card.arcana === "major" ? "major" : card.suit;
    const L = {
      major: {
        relation: "大牌把这段关系放进一个更长的阶段里看：眼前这件事，可能只是你正在成为什么样的人的一个切面。",
        work: "大牌很少直接回答“这份工作好不好”，它更常问：你愿意用这段时间换取什么，又不想拿什么去换。",
        self: "如果它在你独处时出现，它更像一面镜子：你面对的不是一道待解的题，而是一个正在成形的阶段。",
      },
      wands: {
        relation: "火元素让关系更像行动与回应：热度、推进、谁先迈步，往往比“感觉”更早出现。",
        work: "在工作里，权杖谈的是行动、推进与消耗：力气有没有用在你真正想去的方向。",
        self: "独处时，权杖提醒你别只用“忙”证明自己还存在。",
      },
      cups: {
        relation: "圣杯把关系放回感受与边界：你以为在谈事情，其实在谈“我有没有被看见”。",
        work: "在工作里，圣杯更关心你与人的联结、情绪劳动，以及这份工作是否让你越来越空。",
        self: "独处时，圣杯邀请你分辨：这是你的情绪，还是你替别人接住的那一部分。",
      },
      swords: {
        relation: "宝剑让关系变成语言与判断：一句话怎么被理解，往往比事实本身更早造成伤口。",
        work: "在工作里，宝剑谈的是判断、规则与代价：想清楚不等于做得到，做得到也不等于值得。",
        self: "独处时，宝剑最容易把担心伪装成分析；先分清事实、推测和恐惧。",
      },
      pentacles: {
        relation: "星币把关系落到日常：时间、金钱、家务、谁在承担，这些比誓言更能说明问题。",
        work: "在工作里，星币谈的是资源、积累与可持续：能不能长期做，比这一周做得多漂亮更重要。",
        self: "独处时，星币提醒你先照顾身体和钱包，再谈更远的意义。",
      },
    }[suit] || {};
    const k1 = kw[0] || card.en;
    const k2 = kw[1] || "边界";
    const k3 = kw[2] || k2;
    const edge = rev ? "逆位不是坏牌；它更像是这股能量暂时向内、过度或不足。" : "正位也不是“一定好”，它只是把这股能量放在比较容易看见的位置。";
    return [
      {
        label: "在关系里",
        text: `${L.relation} ${mine} 这张牌在这里的关键词是「${k1}」与「${k2}」；它不是在替你判断对方，而是在提醒你看见自己的位置。${edge}`,
      },
      {
        label: "在工作与选择里",
        text: `${L.work} 把它放进一个具体选择：${advice} ${rev ? "逆位时，先把“我还没准备好”与“这件事本身不适合”分开。" : "先做一个最小的验证，不必一次押上全部。"}`,
      },
      {
        label: "在独处时",
        text: `${L.self} ${mine} 你可以问自己：如果没有人会知道这个选择，我还会怎么选？此刻最值得保留的是「${k3}」，而不是一个漂亮的答案。`,
      },
    ];
  };

  UI.formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso.includes("T") ? iso : iso + "T12:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  };
  UI.shortDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso.includes("T") ? iso : iso + "T12:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" }).replace(/\//g, ".");
  };
  UI.weekday = (iso) => {
    const d = new Date((iso || C.todayKey()) + "T12:00:00");
    return d.toLocaleDateString("zh-CN", { weekday: "long" });
  };
  UI.time = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  UI.toast = (message, type = "") => {
    const stack = document.querySelector("[data-toast-stack]");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = "toast " + (type ? `is-${type}` : "");
    const ic = type === "error" ? "alert" : type === "success" ? "check" : "info";
    el.innerHTML = `${UI.icon(ic)}<span>${esc(message)}</span>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(6px)";
      setTimeout(() => el.remove(), 320);
    }, 3600);
  };

  let lastFocus = null;
  UI.modal = (opts = {}) => {
    const { title = "", kicker = "", body = "", actions = [], wide = false, onOpen = null } = opts;
    lastFocus = document.activeElement;
    const root = document.createElement("div");
    root.className = "modal is-open " + (wide ? "modal-wide" : "");
    root.innerHTML = `
      <div class="modal-overlay" data-close></div>
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(title || "弹窗")}">
        <button class="modal-close" type="button" data-close aria-label="关闭">${UI.icon("close")}</button>
        <div class="modal-head">
          ${kicker ? `<div class="eyebrow">${esc(kicker)}</div>` : ""}
          ${title ? `<h3>${esc(title)}</h3>` : ""}
        </div>
        <div class="modal-body">${body}</div>
        ${actions.length ? `<div class="modal-actions">${actions.map((a, i) => `<button class="btn ${a.className || "btn-ghost"}" type="button" data-action="${i}">${esc(a.label)}</button>`).join("")}</div>` : ""}
      </div>`;
    document.body.appendChild(root);
    document.body.classList.add("no-scroll");
    const close = () => {
      root.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      setTimeout(() => root.remove(), 280);
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    root.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
    root.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", () => {
        const a = actions[Number(el.dataset.action)];
        if (!a) return;
        if (a.onClick) a.onClick(root, close);
        if (a.close !== false) close();
      });
    });
    setTimeout(() => {
      const focusable = root.querySelector("input, textarea, select, button:not(.modal-close)");
      if (focusable) focusable.focus();
      if (onOpen) onOpen(root);
    }, 30);
    return { root, close };
  };

  UI.confirm = (opts = {}) => new Promise((resolve) => {
    let decided = false;
    UI.modal({
      kicker: opts.kicker || "Confirm",
      title: opts.title || "确认",
      body: `<p class="small muted">${esc(opts.message || "")}</p>`,
      actions: [
        { label: opts.cancelText || "取消", className: "btn-ghost", onClick: () => { decided = true; resolve(false); } },
        { label: opts.confirmText || "确认", className: opts.danger ? "btn-primary" : "btn-primary", onClick: () => { decided = true; resolve(true); } },
      ],
      onOpen: (root) => {
        root.addEventListener("click", (e) => {
          if (e.target.closest("[data-close]") && !decided) { decided = true; resolve(false); }
        });
      },
    });
  });

  UI.stars = (n) => {
    const full = Math.round(Number(n) || 0);
    return `<span class="stars" aria-label="${full} 星">${[1, 2, 3, 4, 5].map((i) => `<span class="${i <= full ? "on" : ""}">★</span>`).join("")}</span>`;
  };

  UI.tarotCard = (idOrCard, opts = {}) => {
    const card = typeof idOrCard === "string" ? C.card(idOrCard) : idOrCard;
    if (!card) return "";
    const rev = !!opts.rev;
    const cls = ["tarot-card"];
    if (rev) cls.push("is-reversed");
    if (opts.className) cls.push(opts.className);
    const inner = `<img src="${card.image}" alt="${esc(card.name)}${rev ? "（逆位）" : ""}" loading="${opts.eager ? "eager" : "lazy"}">${rev ? '<span class="rev-badge">逆</span>' : ""}${opts.showName === false ? "" : `<span class="card-name">${esc(card.name)}${rev ? " · 逆" : ""}</span>`}`;
    if (opts.href) return `<a class="${cls.join(" ")}" href="${opts.href}" aria-label="${esc(card.name)}${rev ? " 逆位" : ""}">${inner}</a>`;
    return `<div class="${cls.join(" ")}" ${opts.attrs || ""}>${inner}</div>`;
  };

  UI.miniCard = (idOrCard, rev = false) => {
    const card = typeof idOrCard === "string" ? C.card(idOrCard) : idOrCard;
    if (!card) return "";
    return `<span class="mini-card" data-tone="${card.tone || "gold"}" title="${esc(card.name)}${rev ? " 逆位" : ""}" style="${rev ? "transform:rotate(180deg)" : ""}"><img src="${card.image}" alt="" loading="eager"></span>`;
  };

  UI.price = (p, opts = {}) => {
    if (p == null) return "";
    return `<span class="price ${opts.small ? "price-sm" : ""}"><span class="cur">¥</span><span class="num">${Number(p).toFixed(0)}</span></span>`;
  };

  UI.productCard = (p) => {
    if (!p) return "";
    const soldOut = p.stock === 0;
    const credit = p.credits ? `<span class="tiny muted mono">月华 ${p.credits}</span>` : "";
    const num = String((window.CODEX.products || []).indexOf(p) + 1).padStart(2, "0");
    return `<article class="product-card ${p.type === "virtual" ? "is-virtual" : ""}">
      <a class="product-media" href="item.html?id=${p.id}" aria-label="${esc(p.name)}">
        <span class="product-no">NO. ${num}</span>
        <img src="${p.image}" alt="${esc(p.name)}" loading="eager">
        <span class="badge ${p.type === "virtual" ? "badge-sage" : "badge-gold"}">${p.type === "virtual" ? "虚拟器物" : (p.badge || "实物")}</span>
      </a>
      <div class="product-body">
        <div class="product-kicker">${p.type === "virtual" ? "VIRTUAL OBJECT" : "PHYSICAL OBJECT"} · ${esc(p.badge || "器物志")}</div>
        <a href="item.html?id=${p.id}"><h3 class="product-title">${esc(p.name)}</h3></a>
        <div class="product-sub">${esc(p.sub)}</div>
        <div class="product-foot">
          <span class="cluster" style="gap:8px">${UI.price(p.price)}${credit}</span>
          <button class="btn btn-sm ${soldOut ? "is-disabled" : "btn-ghost"}" type="button" data-add-cart="${p.id}" ${soldOut ? "disabled" : ""}>${soldOut ? "售罄" : "加入"}</button>
        </div>
      </div>
    </article>`;
  };

  UI.masterCard = (m) => {
    if (!m) return "";
    const min = Math.min(...m.packages.map((p) => p.price));
    return `<a class="master-card" href="master.html?id=${m.id}">
      <span class="master-sigil"><img src="${m.sigil}" alt="" loading="eager"></span>
      <span>
        <span class="master-name"><h3>${esc(m.alias)}</h3><span class="badge badge-gold">认证</span></span>
        <span class="master-style">${esc(m.title)}</span>
        <span class="master-meta"><span>★ ${m.rating}</span><span>${m.orders} 单</span><span>${esc(m.response)}</span></span>
        <span class="master-bio">${esc(m.bio.slice(0, 58))}…</span>
        <span class="master-price"><span class="small muted">起 ${UI.price(min).replace(/<[^>]+>/g, "")}</span><span class="link-arrow">查看 ${UI.icon("arrow-r")}</span></span>
      </span>
    </a>`;
  };

  UI.postCard = (p) => {
    const cards = p.cards.map((id) => UI.miniCard(id)).join("");
    const lock = p.locked ? `<span class="badge badge-rose">${UI.icon("lock")} 大师解读 ${UI.price(p.locked.price).replace(/<[^>]+>/g, "")}</span>` : "";
    return `<a class="post-card" href="post.html?id=${p.id}">
      <div class="post-head">
        <span class="post-author"><span class="post-avatar">${esc(p.initial)}</span>${esc(p.alias)}</span>
        <span>${UI.shortDate(p.date)} · ${esc(p.time)}</span>
      </div>
      <div class="post-q">${esc(p.question)}</div>
      <div class="post-excerpt">${esc(p.excerpt)}</div>
      <div class="post-cards">${cards}</div>
      <div class="post-foot"><span>${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join(" ")}</span><span>${lock || `<span class="badge badge-muted">${esc(p.status)}</span>`}</span></div>
    </a>`;
  };

  UI.statusKey = (o) => {
    if (!o) return "";
    if (o.status === "paid") {
      if (o.type === "service") return "待接单";
      if (o.type === "physical") return "待发货";
      if (o.type === "virtual") return "已发放";
    }
    const map = {
      pending_payment: "待支付", accepted: "解读中", delivered: "已交付",
      shipped: "已发货", received: "已收货", completed: "已完成", refunded: "已退款", cancelled: "已取消",
    };
    return map[o.status] || o.status;
  };

  UI.statusBadge = (o) => {
    const label = UI.statusKey(o);
    const cls = ["pending_payment", "paid"].includes(o.status) ? "badge-gold"
      : ["accepted", "delivered", "shipped"].includes(o.status) ? "badge-rose"
      : ["completed", "received"].includes(o.status) ? "badge-sage" : "badge-muted";
    return `<span class="badge ${cls}">${esc(label)}</span>`;
  };

  UI.orderCard = (o) => {
    const items = o.items || [];
    const first = items[0] || {};
    const more = items.length > 1 ? ` 等 ${items.length} 件` : "";
    const typeLabel = { service: "解牌服务", physical: "实物", virtual: "虚拟器物" }[o.type] || "订单";
    return `<a class="order-card panel" href="order.html?id=${o.id}">
      <div class="order-head">
        <span class="mono tiny muted">${o.id}</span>
        ${UI.statusBadge(o)}
      </div>
      <div class="order-main">
        <span class="order-thumb">${first.image ? `<img src="${first.image}" alt="" loading="lazy">` : UI.icon("book")}</span>
        <span class="order-info">
          <strong>${esc(first.name || typeLabel)}${more}</strong>
          <span class="tiny muted">${esc(typeLabel)} · ${UI.formatDate(o.createdAt)}</span>
        </span>
        <span class="order-total">${UI.price(o.total)}</span>
      </div>
    </a>`;
  };

  UI.timeline = (o) => {
    if (!o) return "";
    const defs = o.type === "service"
      ? [["created", "订单已提交"], ["paid", "支付成功（演示）"], ["accepted", "解牌师接单"], ["delivered", "解读已交付"], ["completed", "已完成"]]
      : o.type === "physical"
        ? [["created", "订单已提交"], ["paid", "支付成功（演示）"], ["shipped", "已发货"], ["received", "确认收货"], ["completed", "已完成"]]
        : [["created", "订单已提交"], ["paid", "支付成功（演示）"], ["completed", "器物已发放"]];
    const existing = (o.timeline || []).reduce((a, t) => { a[t.key] = t; return a; }, {});
    if (o.status === "refunded") defs.push(["refunded", "退款已受理（演示）"]);
    return `<div class="timeline">${defs.map(([key, label]) => {
      const t = existing[key] || { label, done: false, date: "" };
      return `<div class="timeline-item ${t.done ? "is-done" : ""}"><h4>${esc(t.label || label)}</h4><p>${t.date ? UI.formatDate(t.date) + " " + UI.time(t.date) : "等待中"}</p></div>`;
    }).join("")}</div>`;
  };

  UI.empty = (icon, title, text, cta) => `<div class="empty-state"><span class="icon">${UI.icon(icon)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${cta || ""}</div>`;

  UI.refreshHeader = () => {
    const st = C.state;
    document.querySelectorAll("[data-credits]").forEach((el) => { el.textContent = st.user.credits; });
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      const n = C.cartCount();
      el.textContent = n;
      el.dataset.empty = n === 0 ? "true" : "false";
    });
    document.querySelectorAll("[data-avatar]").forEach((el) => { el.textContent = st.user.initial || "月"; });
  };

  UI.initHeader = () => {
    UI.refreshHeader();
    const drawer = document.querySelector("[data-nav-drawer]");
    const open = () => { if (!drawer) return; drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); document.body.classList.add("no-scroll"); };
    const close = () => { if (!drawer) return; drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); document.body.classList.remove("no-scroll"); };
    document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", open));
    document.querySelectorAll("[data-menu-close]").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    document.querySelectorAll("[data-drawer-group]").forEach((btn) => {
      const sub = btn.nextElementSibling;
      if (sub) sub.hidden = true;
      btn.addEventListener("click", () => { if (sub) sub.hidden = !sub.hidden; });
    });
    document.addEventListener("codex:change", UI.refreshHeader);
  };

  UI.initTabs = (root = document) => {
    root.querySelectorAll("[data-tabs]").forEach((wrap) => {
      const tabs = wrap.querySelectorAll("[data-tab]");
      tabs.forEach((t) => t.addEventListener("click", () => {
        const key = t.dataset.tab;
        tabs.forEach((x) => x.classList.toggle("is-active", x === t));
        wrap.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = p.dataset.panel !== key; });
        wrap.dispatchEvent(new CustomEvent("tabchange", { detail: { key } }));
      }));
    });
  };

  UI.initAccordion = (root = document) => {
    root.querySelectorAll(".accordion-trigger").forEach((btn) => {
      btn.addEventListener("click", () => btn.closest(".accordion-item").classList.toggle("is-open"));
    });
  };

  UI.initReveal = () => {
    if (!("IntersectionObserver" in window)) return;
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  };

  UI.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); UI.toast("已复制", "success"); }
    catch (e) { UI.toast("复制失败，请手动选择", "error"); }
  };

  UI.download = (filename, text) => {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  UI.initCommerce = () => {
    document.addEventListener("click", async (e) => {
      const add = e.target.closest("[data-add-cart]");
      if (add) {
        e.preventDefault();
        const id = add.dataset.addCart;
        const qtyInput = document.querySelector("[data-qty]");
        const qty = qtyInput ? Math.max(1, Number(qtyInput.value) || 1) : 1;
        C.addToCart(id, qty);
        add.textContent = "已加入";
        setTimeout(() => { add.textContent = "加入"; }, 1100);
        UI.toast("已放入购物袋", "success");
        UI.refreshHeader();
        return;
      }
      const buy = e.target.closest("[data-buy-now]");
      if (buy) {
        e.preventDefault();
        const id = buy.dataset.buyNow;
        const qtyInput = document.querySelector("[data-qty]");
        const qty = qtyInput ? Math.max(1, Number(qtyInput.value) || 1) : 1;
        C.addToCart(id, qty);
        location.href = "checkout.html";
        return;
      }
      const redeem = e.target.closest("[data-redeem]");
      if (redeem) {
        e.preventDefault();
        const id = redeem.dataset.redeem;
        const p = C.product(id);
        if (!p) return;
        const ok = await UI.confirm({
          kicker: "月华兑换",
          title: `用 ${p.credits} 月华兑换「${p.name}」？`,
          message: `当前月华 ${C.state.user.credits}。兑换后器物会进入“我的器物”，可在圣所中使用。月华不可提现。`,
          confirmText: "确认兑换",
        });
        if (!ok) return;
        try {
          C.redeemWithCredits(id);
          UI.toast("兑换成功，已放入我的器物", "success");
          UI.refreshHeader();
        } catch (err) { UI.toast(err.message, "error"); }
      }
    });
  };

  UI.aiSettingsModal = (opts = {}) => {
    const cfg = C.aiConfig();
    const currentKey = C.getKey();
    const providerOpts = Object.keys(C.AI.providers).map((k) => `<option value="${k}" ${cfg.provider === k ? "selected" : ""}>${C.AI.providers[k].label}</option>`).join("");
    const body = `
      <div class="field">
        <label for="ai-provider">服务商</label>
        <select class="select" id="ai-provider" data-ai-provider>${providerOpts}</select>
        <div class="help">任何 OpenAI 兼容的 <code>/chat/completions</code> 接口都可以。先选预设，再改模型。</div>
      </div>
      <div class="form-grid" style="margin-top:12px">
        <div class="field"><label for="ai-base">Base URL</label><input class="input" id="ai-base" data-ai-base value="${esc(cfg.baseUrl || "")}" placeholder="https://api.openai.com/v1"></div>
        <div class="field"><label for="ai-model">模型</label><input class="input" id="ai-model" data-ai-model value="${esc(cfg.model || "")}" placeholder="gpt-4o-mini"></div>
        <div class="field full"><label for="ai-key">API Key</label><input class="input" id="ai-key" data-ai-key type="password" autocomplete="off" placeholder="${currentKey ? "已保存；留空则保持不变" : "粘贴你的 Key，只保存在本机"}"><div class="help">默认只存在 sessionStorage；勾选“记住”才写入 localStorage。不要提交到代码仓库。</div></div>
      </div>
      <div class="stack-sm" style="margin-top:14px">
        <label class="checkbox"><input type="checkbox" data-ai-remember ${cfg.remember ? "checked" : ""}> 记住到本机（关闭浏览器后仍保留）</label>
        <label class="checkbox"><input type="checkbox" data-ai-consent ${cfg.consent ? "checked" : ""}> 我同意在生成时把问题与牌面发送给第三方模型（不发送私人笔记）</label>
      </div>
      <div class="demo-banner" style="margin-top:14px">${UI.icon("shield")}<span>纯前端 Key 对任何能打开网页的人都可见。课程本机演示没问题；公网部署请加一层转发，并使用限额 Key。</span></div>
      <div class="cluster" style="margin-top:14px">
        <button class="btn btn-sm btn-ghost" type="button" data-ai-test>测试连接</button>
        <button class="btn btn-sm btn-quiet" type="button" data-ai-clear>清除本机 Key</button>
        <span class="tiny muted" data-ai-status>${currentKey ? "当前已有 Key" : "当前没有 Key，将使用本地注疏"}</span>
      </div>`;
    const modal = UI.modal({
      kicker: "AI · BYOK",
      title: "接入你自己的 AI",
      body,
      wide: true,
      actions: [
        { label: "取消", className: "btn-ghost" },
        { label: "保存设置", className: "btn-primary", onClick: (root) => {
          const provider = root.querySelector("[data-ai-provider]").value;
          const baseUrl = root.querySelector("[data-ai-base]").value.trim();
          const model = root.querySelector("[data-ai-model]").value.trim();
          const key = root.querySelector("[data-ai-key]").value.trim();
          const remember = root.querySelector("[data-ai-remember]").checked;
          const consent = root.querySelector("[data-ai-consent]").checked;
          if (!baseUrl || !model) { UI.toast("请填写 Base URL 与模型名", "error"); return; }
          if (key) C.setKey(key, remember);
          else if (currentKey) C.setKey(currentKey, remember);
          C.saveAiConfig({ provider, baseUrl, model, remember, consent });
          UI.toast("AI 设置已保存到本机", "success");
          if (opts.onSaved) opts.onSaved();
        } },
      ],
      onOpen: (root) => {
        const provider = root.querySelector("[data-ai-provider]");
        provider.addEventListener("change", () => {
          const p = C.AI.providers[provider.value];
          if (p && p.baseUrl) {
            root.querySelector("[data-ai-base]").value = p.baseUrl;
            root.querySelector("[data-ai-model]").value = p.model;
          }
        });
        root.querySelector("[data-ai-test]").addEventListener("click", async () => {
          const btn = root.querySelector("[data-ai-test]");
          const status = root.querySelector("[data-ai-status]");
          const key = root.querySelector("[data-ai-key]").value.trim() || currentKey;
          const cfg2 = {
            provider: root.querySelector("[data-ai-provider]").value,
            baseUrl: root.querySelector("[data-ai-base]").value.trim(),
            model: root.querySelector("[data-ai-model]").value.trim(),
          };
          btn.disabled = true; btn.textContent = "测试中…"; status.textContent = "正在连接…";
          const r = await C.AI.test(cfg2, key);
          btn.disabled = false; btn.textContent = "测试连接";
          status.textContent = r.message;
          status.style.color = r.ok ? "var(--sage)" : "var(--danger)";
        });
        root.querySelector("[data-ai-clear]").addEventListener("click", async () => {
          const ok = await UI.confirm({ title: "清除本机 Key？", message: "清除后，AI 解读会回退到本地注疏。", confirmText: "清除" });
          if (!ok) return;
          C.clearKey();
          const status = root.querySelector("[data-ai-status]");
          if (status) status.textContent = "Key 已清除，将使用本地注疏";
          UI.toast("Key 已清除", "success");
        });
      },
    });
    return modal;
  };

  UI.init = () => {
    UI.initHeader();
    UI.initCommerce();
    UI.initTabs();
    UI.initAccordion();
    UI.initReveal();
    document.querySelectorAll("[data-copy]").forEach((el) => el.addEventListener("click", () => UI.copy(el.dataset.copy)));
  };

  document.addEventListener("DOMContentLoaded", UI.init);
  window.UI = UI;
})();
