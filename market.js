(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  let tab = "virtual";

  function render() {
    const list = window.CODEX.products.filter((p) => p.type === tab);
    $("[data-market-grid]").innerHTML = list.map(UI.productCard).join("");
    $("[data-market-count]").textContent = `${list.length} 件`;
    $$("[data-market-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.marketTab === tab));
  }

  $$("[data-market-tab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.marketTab; render(); }));
  render();
})();
