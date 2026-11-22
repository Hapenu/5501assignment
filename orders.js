(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  let tab = "all";

  const active = ["paid", "accepted", "delivered", "shipped", "received"];
  function match(o) {
    if (tab === "all") return true;
    if (tab === "pending") return o.status === "pending_payment";
    if (tab === "active") return active.includes(o.status);
    if (tab === "done") return ["completed", "refunded"].includes(o.status);
    return true;
  }
  function render() {
    const list = C.state.orders.filter(match);
    $("[data-orders-empty]").hidden = list.length > 0;
    $("[data-orders-list]").innerHTML = list.map(UI.orderCard).join("");
    $$("[data-order-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.orderTab === tab));
  }
  $$("[data-order-tab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.orderTab; render(); }));
  render();
})();
