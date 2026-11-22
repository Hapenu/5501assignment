(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);

  function render() {
    const t = C.cartTotals();
    const list = $("[data-cart-list]");
    $("[data-cart-empty]").hidden = t.items.length > 0;
    $("[data-summary]").hidden = t.items.length === 0;
    if (!t.items.length) { list.innerHTML = ""; return; }
    list.innerHTML = t.items.map((p) => `
      <div class="cart-line" data-line="${p.id}">
        <a class="thumb" href="item.html?id=${p.id}"><img src="${p.image}" alt="" loading="eager"></a>
        <div>
          <a href="item.html?id=${p.id}"><h4>${UI.escape(p.name)}</h4></a>
          <div class="meta">${p.type === "virtual" ? "虚拟器物 · 支付后发放" : "实物器物 · 演示物流"}</div>
          <div class="line-actions">
            <div class="qty">
              <button type="button" data-minus="${p.id}" aria-label="减少">−</button>
              <input value="${p.qty}" data-qty-input="${p.id}" aria-label="数量">
              <button type="button" data-plus="${p.id}" aria-label="增加">+</button>
            </div>
            <button class="remove" type="button" data-remove="${p.id}">移除</button>
          </div>
        </div>
        <div class="line-price">${UI.price(p.lineTotal)}</div>
      </div>`).join("");
    $("[data-subtotal]").textContent = UI.money(t.subtotal);
    $("[data-shipping]").textContent = t.shipping ? UI.money(t.shipping) : "免运费";
    $("[data-total]").textContent = UI.money(t.total);
  }

  document.addEventListener("click", (e) => {
    const minus = e.target.closest("[data-minus]");
    if (minus) { const id = minus.dataset.minus; const line = C.state.cart.find((l) => l.id === id); if (line) { C.setCartQty(id, line.qty - 1); render(); } return; }
    const plus = e.target.closest("[data-plus]");
    if (plus) { const id = plus.dataset.plus; const line = C.state.cart.find((l) => l.id === id); if (line) { C.setCartQty(id, line.qty + 1); render(); } return; }
    const rm = e.target.closest("[data-remove]");
    if (rm) { C.removeFromCart(rm.dataset.remove); render(); UI.toast("已移除", "success"); }
  });
  document.addEventListener("change", (e) => {
    const inp = e.target.closest("[data-qty-input]");
    if (inp) { C.setCartQty(inp.dataset.qtyInput, Number(inp.value) || 1); render(); }
  });
  render();
})();
