(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const id = new URLSearchParams(location.search).get("id");
  let order = id ? C.orderById(id) : null;
  if (!order) { $("[data-order-empty]").hidden = false; return; }
  $("[data-order]").hidden = false;

  function typeLabel(t) { return { service: "解牌服务", physical: "实物器物", virtual: "虚拟器物" }[t] || "订单"; }
  function reload() { location.reload(); }

  function render() {
    const status = UI.statusKey(order);
    $("[data-order-id]").textContent = order.id;
    $("[data-order-type]").textContent = typeLabel(order.type);
    $("[data-order-title]").textContent = order.items[0] ? order.items[0].name : typeLabel(order.type);
    $("[data-order-date]").textContent = `${UI.formatDate(order.createdAt)} · ${order.payment ? "支付方式：" + order.payment : "未支付"}`;
    $("[data-order-status]").innerHTML = `${UI.statusBadge(order)}<div class="tiny muted" style="margin-top:6px">${order.status === "pending_payment" ? "等待支付" : "已支付（演示）"}</div>`;
    $("[data-order-timeline]").innerHTML = UI.timeline(order);
    $("[data-order-items]").innerHTML = order.items.map((it) => `
      <div class="order-item-row"><img src="${it.image}" alt="" loading="eager"><div><div class="nm">${UI.escape(it.name)}</div><div class="tiny muted">${typeLabel(it.type || order.type)}</div></div><div class="qty">× ${it.qty}</div><div class="mono" style="margin-left:20px;color:var(--gold-2)">${UI.money(it.price * it.qty)}</div></div>`).join("");
    $("[data-order-subtotal]").textContent = UI.money(order.subtotal);
    $("[data-order-shipping]").textContent = order.shipping ? UI.money(order.shipping) : "免运费";
    $("[data-order-total]").textContent = UI.money(order.total);

    if (order.type === "service" && order.service) {
      $("[data-service-box]").hidden = false;
      const s = order.service;
      $("[data-service-detail]").innerHTML = `
        <div class="service-row"><span>解牌师</span><strong>${UI.escape(s.alias)}</strong></div>
        <div class="service-row"><span>套餐</span><strong>${UI.escape(s.packageName)} · ${UI.escape(s.delivery)}</strong></div>
        <div class="service-row"><span>问题</span><strong>${UI.escape(s.question || "未填写")}</strong></div>
        <div class="service-row"><span>牌阵</span><strong>${UI.escape(C.spread(s.spreadId).name)}</strong></div>
        <div class="service-row"><span>平台服务费（含）</span><strong>${UI.money(s.commission || s.price * 0.15)}</strong></div>`;
      if (order.deliveryText) {
        $("[data-delivery]").hidden = false;
        $("[data-delivery-text]").textContent = order.deliveryText;
      }
    }
    if (order.type === "physical") {
      $("[data-ship-box]").hidden = false;
      const a = order.address || {};
      $("[data-address-detail]").innerHTML = `
        <div class="service-row"><span>收件人</span><strong>${UI.escape(a.name || "—")} ${UI.escape(a.phone || "")}</strong></div>
        <div class="service-row"><span>地址</span><strong>${UI.escape([a.province, a.district, a.detail].filter(Boolean).join(" "))}</strong></div>`;
      if (order.tracking) {
        $("[data-tracking]").hidden = false;
        $("[data-tracking]").innerHTML = `<span class="badge badge-rose">已发货</span><div class="mono" style="margin-top:8px">${UI.escape(order.tracking.carrier)} · ${UI.escape(order.tracking.no)}</div>`;
      }
    }
    if (order.review) {
      $("[data-review-box]").hidden = false;
      $("[data-review-display]").innerHTML = `<div class="cluster">${UI.stars(order.review.stars)}<span class="tiny muted">${order.review.date}</span></div><p class="small" style="margin-top:8px">${UI.escape(order.review.text)}</p>`;
    }

    const actions = [];
    if (order.status === "pending_payment") actions.push(`<button class="btn btn-primary btn-block" type="button" data-pay>去支付（演示）</button>`);
    if (order.type === "physical" && order.status === "shipped") actions.push(`<button class="btn btn-primary btn-block" type="button" data-receive>确认收货</button>`);
    if (order.status === "completed" && !order.review) actions.push(`<button class="btn btn-primary btn-block" type="button" data-review>写一条评价</button>`);
    if (["pending_payment", "paid", "accepted", "delivered", "shipped", "received"].includes(order.status)) actions.push(`<button class="btn btn-ghost btn-block" type="button" data-refund>申请退款（演示）</button>`);
    actions.push(`<a class="btn btn-quiet btn-block" href="orders.html">回到订单列表</a>`);
    $("[data-order-actions]").innerHTML = actions.join("");

    const demo = [];
    if (!["completed", "refunded", "cancelled"].includes(order.status)) demo.push(`<button class="btn btn-sm btn-quiet" type="button" data-advance>推进状态</button>`);
    if (order.type === "service" && order.status === "delivered" && !order.deliveryText) demo.push(`<button class="btn btn-sm btn-quiet" type="button" data-fill>补一条交付</button>`);
    $("[data-demo-actions]").innerHTML = demo.join("") || `<span class="tiny muted">当前状态已结束。</span>`;
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-pay]")) { C.payOrder(order.id, "wechat"); UI.toast("支付成功（演示）", "success"); setTimeout(reload, 400); }
    if (e.target.closest("[data-receive]")) { C.advanceOrder(order.id); UI.toast("已确认收货", "success"); setTimeout(reload, 400); }
    if (e.target.closest("[data-advance]")) { C.advanceOrder(order.id); UI.toast("状态已推进", "success"); setTimeout(reload, 400); }
    if (e.target.closest("[data-fill]")) {
      order.deliveryText = "牌面已经看完。先说结论：这件事可以推进，但你需要先把“证明自己”的部分拿掉。三张牌里最关键的是中间那张——它不是在阻止你，而是在提醒你换一个位置。";
      C.save(); UI.toast("已补交付内容", "success"); setTimeout(reload, 400);
    }
    if (e.target.closest("[data-refund]")) {
      UI.confirm({ kicker: "Refund", title: "申请退款？", message: "演示订单会直接标记为已退款。真实场景需要解牌师确认或平台介入。", confirmText: "申请退款", danger: true })
        .then((ok) => { if (!ok) return; C.refundOrder(order.id); UI.toast("退款已受理（演示）", "success"); setTimeout(reload, 400); });
    }
    if (e.target.closest("[data-review]")) {
      let stars = 5;
      const m = UI.modal({
        kicker: "Review",
        title: "这次体验怎么样？",
        body: `<div class="review-stars" data-stars>${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="${n <= stars ? "on" : ""}" data-star="${n}">★</button>`).join("")}</div>
               <textarea class="textarea" data-review-text placeholder="写一句具体的感受。可以只写一句。" style="margin-top:14px"></textarea>`,
        actions: [
          { label: "取消", className: "btn-ghost" },
          { label: "提交评价", className: "btn-primary", onClick: (root) => {
            C.reviewOrder(order.id, stars, root.querySelector("[data-review-text]").value.trim() || "只留一个评分。");
            UI.toast("评价已提交，获得 5 月华", "success");
            setTimeout(reload, 400);
          } },
        ],
        onOpen: (root) => {
          root.querySelectorAll("[data-star]").forEach((b) => b.addEventListener("click", () => {
            stars = Number(b.dataset.star);
            root.querySelectorAll("[data-star]").forEach((x) => x.classList.toggle("on", Number(x.dataset.star) <= stars));
          }));
        },
      });
    }
  });
  render();
})();
