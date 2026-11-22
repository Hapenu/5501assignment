(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  let service = null;
  let cart = null;
  let mode = "cart";

  try { service = JSON.parse(sessionStorage.getItem("moonphase.pendingService") || "null"); } catch (e) { service = null; }
  if (service && service.masterId && service.packageId) mode = "service";
  cart = C.cartTotals();

  if (mode === "cart" && !cart.items.length) { $("[data-checkout-empty]").hidden = false; return; }
  $("[data-checkout]").hidden = false;

  let subtotal = 0, shipping = 0, total = 0, type = "virtual", items = [];

  if (mode === "service") {
    const m = C.master(service.masterId);
    const pkg = m && m.packages.find((p) => p.id === service.packageId);
    const price = service.price || (pkg ? pkg.price : 0);
    const commission = +(price * (window.CODEX.commission || 0.15)).toFixed(2);
    subtotal = total = price;
    type = "service";
    items = [{ id: "pkg-" + service.packageId, name: `${pkg ? pkg.name : "解牌服务"} · ${m ? m.alias : ""}`, price, qty: 1, image: m ? m.sigil : "", type: "service" }];
    $("[data-service-section]").hidden = false;
    $("[data-service-title]").textContent = `${m ? m.alias : "解牌师"} · ${pkg ? pkg.name : "服务"}`;
    $("[data-service-summary]").innerHTML = `
      <div class="service-row"><span>问题</span><strong>${UI.escape(service.question || "未填写")}</strong></div>
      <div class="service-row"><span>牌阵</span><strong>${UI.escape(C.spread(service.spreadId).name)}</strong></div>
      <div class="service-row"><span>交付</span><strong>${UI.escape(pkg ? pkg.delivery : "48 小时内")}</strong></div>
      <div class="service-row"><span>服务价</span><strong>${UI.money(price)}</strong></div>
      <div class="service-row"><span>平台服务费（含）</span><strong>${UI.money(commission)}</strong></div>`;
    $("[data-co-note]").textContent = "支付后，解牌师会收到预约；演示中可在订单详情推进状态。";
  } else {
    subtotal = cart.subtotal;
    shipping = cart.shipping;
    total = cart.total;
    type = cart.hasPhysical ? "physical" : "virtual";
    items = cart.items.map((p) => ({ id: p.id, name: p.name, price: p.price, qty: p.qty, image: p.image, type: p.type }));
    if (cart.hasPhysical) $("[data-address-section]").hidden = false;
  }

  $("[data-checkout-items]").innerHTML = items.map((it) => `
    <div class="order-item-row"><img src="${it.image}" alt="" loading="eager"><div><div class="nm">${UI.escape(it.name)}</div><div class="tiny muted">× ${it.qty}</div></div><div class="qty">${UI.money(it.price * it.qty)}</div></div>`).join("");
  $("[data-co-subtotal]").textContent = UI.money(subtotal);
  $("[data-co-shipping]").textContent = shipping ? UI.money(shipping) : (type === "physical" ? "免运费" : "—");
  $("[data-co-total]").textContent = UI.money(total);

  document.querySelectorAll(".pay-method").forEach((el) => el.addEventListener("click", () => {
    document.querySelectorAll(".pay-method").forEach((x) => x.classList.remove("is-active"));
    el.classList.add("is-active");
    el.querySelector("input").checked = true;
  }));

  function address() {
    const get = (k) => (document.querySelector(`[data-addr="${k}"]`) || {}).value?.trim() || "";
    return { name: get("name"), phone: get("phone"), province: get("province"), district: get("district"), detail: get("detail") };
  }

  $("[data-place]").addEventListener("click", () => {
    if (!$("[data-agree]").checked) { UI.toast("请先确认这是演示环境", "error"); return; }
    let addr = null;
    if (type === "physical") {
      addr = address();
      if (!addr.name || !addr.phone || !addr.province || !addr.detail) { UI.toast("请把收货地址填写完整", "error"); return; }
    }
    const method = document.querySelector('input[name="pay"]:checked')?.value || "wechat";
    const payload = { type, items, service: mode === "service" ? service : null, subtotal, shipping, total, address: addr };
    const order = C.createOrder(payload);
    C.payOrder(order.id, method);
    if (mode === "service") sessionStorage.removeItem("moonphase.pendingService");
    else C.clearCart();
    UI.toast("支付成功（演示），订单已生成", "success");
    setTimeout(() => { location.href = `order.html?id=${order.id}`; }, 500);
  });
})();
