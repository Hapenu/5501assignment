(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const id = new URLSearchParams(location.search).get("id");
  const p = id ? C.product(id) : null;
  if (!p) { $("[data-item-empty]").hidden = false; return; }
  $("[data-item]").hidden = false;
  $("[data-item-media]").innerHTML = `<img src="${p.image}" alt="${UI.escape(p.name)}" loading="eager">`;
  $("[data-item-crumb]").textContent = p.name;
  $("[data-item-type]").textContent = p.type === "virtual" ? "虚拟器物" : "实物器物";
  $("[data-item-badge]").textContent = p.badge || (p.type === "virtual" ? "可用于圣所" : "器物志");
  $("[data-item-name]").textContent = p.name;
  $("[data-item-sub]").textContent = p.sub;
  $("[data-item-price]").textContent = UI.price(p.price).replace(/<[^>]+>/g, "");
  $("[data-item-credits]").textContent = p.credits ? `或 ${p.credits} 月华兑换` : "";
  $("[data-item-desc]").textContent = p.desc;
  $("[data-item-details]").innerHTML = (p.details || []).map((d) => `<div class="item-detail-row"><span>${p.type === "virtual" ? "说明" : "规格"}</span><span>${UI.escape(d)}</span></div>`).join("");
  $("[data-item-story]").textContent = p.story || "";
  $("[data-item-usage]").innerHTML = p.type === "virtual"
    ? `<h4>在圣所里使用</h4><p>购买后会进入“我的器物”。去圣所，把它从器物架拖到桌上；可以旋转、缩放、保存预设。</p><a class="btn btn-sm btn-ghost" href="ritual.html" style="margin-top:12px">去圣所 ${UI.icon("arrow-r")}</a>`
    : `<h4>配送与演示</h4><p>这是一个演示商品：下单后会生成订单与物流状态，但不会产生真实扣款或发货。${p.price >= 199 ? "本单免运费。" : "运费在结算时计算。"}</p>`;
  const add = $("[data-add-cart]"); add.dataset.addCart = p.id;
  const buy = $("[data-buy-now]"); buy.dataset.buyNow = p.id;
  const redeem = $("[data-redeem]");
  if (p.type === "virtual" && p.credits) { redeem.hidden = false; redeem.dataset.redeem = p.id; }
  if (p.stock === 0) { add.disabled = true; buy.disabled = true; add.textContent = "暂时补货中"; }
  $("[data-qminus]").addEventListener("click", () => { const i = $("[data-qty]"); i.value = Math.max(1, Number(i.value) - 1); });
  $("[data-qplus]").addEventListener("click", () => { const i = $("[data-qty]"); i.value = Math.min(99, Number(i.value) + 1); });

  const related = window.CODEX.products.filter((x) => x.id !== p.id && x.type === p.type).slice(0, 3);
  if (related.length) {
    $("[data-related-wrap]").hidden = false;
    $("[data-related]").innerHTML = related.map(UI.productCard).join("");
  }
})();
