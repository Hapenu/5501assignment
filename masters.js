(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  let style = "all";
  let sort = "recommend";

  function list() {
    let arr = window.CODEX.masters.slice();
    if (style !== "all") arr = arr.filter((m) => m.style.includes(style));
    if (sort === "price") arr.sort((a, b) => Math.min(...a.packages.map((p) => p.price)) - Math.min(...b.packages.map((p) => p.price)));
    else arr.sort((a, b) => b.rating - a.rating || b.orders - a.orders);
    return arr;
  }
  function render() {
    const arr = list();
    $("[data-masters-list]").innerHTML = arr.map(UI.masterCard).join("");
    $("[data-master-count]").textContent = `${arr.length} 位`;
    $$("[data-style]").forEach((b) => b.classList.toggle("is-active", b.dataset.style === style));
    $$("[data-sort]").forEach((b) => b.classList.toggle("is-active", b.dataset.sort === sort));
  }
  $$("[data-style]").forEach((b) => b.addEventListener("click", () => { style = b.dataset.style; render(); }));
  $$("[data-sort]").forEach((b) => b.addEventListener("click", () => { sort = b.dataset.sort; render(); }));
  $("[data-apply]").addEventListener("click", () => {
    UI.modal({
      kicker: "Apply",
      title: "申请成为解牌师",
      body: `<div class="field"><label>你的社区别名</label><input class="input" data-apply-name placeholder="例如：夜航员 07"></div>
             <div class="field" style="margin-top:12px"><label>你的取向</label><input class="input" data-apply-style placeholder="例如：荣格 / 梦境 / 关系"></div>
             <div class="field" style="margin-top:12px"><label>简单介绍</label><textarea class="textarea" data-apply-bio placeholder="你如何看牌？你擅长什么，不擅长什么？"></textarea></div>
             <div class="demo-banner" style="margin-top:14px">${UI.icon("info")}<span>演示申请：不会真的提交审核。真实的供给审核还需要身份、经验与边界测试。</span></div>`,
      actions: [
        { label: "取消", className: "btn-ghost" },
        { label: "提交申请", className: "btn-primary", onClick: (root) => {
          const n = root.querySelector("[data-apply-name]").value.trim();
          if (!n) { UI.toast("至少写一个别名", "error"); return; }
          UI.toast("申请已提交（演示），通常 3 个工作日内回复", "success");
        } },
      ],
    });
  });
  render();
})();
