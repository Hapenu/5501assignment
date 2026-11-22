(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const m = id ? C.master(id) : null;
  if (!m) { $("[data-master-empty]").hidden = false; return; }
  $("[data-master]").hidden = false;
  let selected = m.packages[0];

  $("[data-master-sigil]").innerHTML = `<img src="${m.sigil}" alt="" style="width:100%;height:100%">`;
  $("[data-master-name]").textContent = m.alias;
  $("[data-master-crumb]").textContent = m.alias;
  $("[data-master-style]").textContent = m.title;
  $("[data-master-tags]").innerHTML = m.style.map((s) => `<span class="tag">${UI.escape(s)}</span>`).join("");
  $("[data-master-bio]").textContent = m.bio;
  $("[data-master-method]").textContent = m.method;
  $("[data-master-rating]").textContent = m.rating;
  $("[data-master-orders]").textContent = m.orders;
  $("[data-master-response]").textContent = m.response;
  $("[data-master-since]").textContent = m.since;
  $("[data-master-specialties]").innerHTML = m.specialties.map((s) => `<span class="badge badge-muted">${UI.escape(s)}</span>`).join("");
  $("[data-master-notfor]").innerHTML = m.notFor.map((s) => `<li>${UI.escape(s)}</li>`).join("");
  $("[data-master-reviews]").innerHTML = m.reviews.map((r) => `
    <div class="review"><div class="review-head"><span>${UI.escape(r.user)} · ${r.date}</span>${UI.stars(r.stars)}</div><p>${UI.escape(r.text)}</p></div>`).join("");

  $("[data-packages]").innerHTML = m.packages.map((p, i) => `
    <label class="package-opt ${i === 0 ? "is-active" : ""}">
      <input type="radio" name="pkg" value="${p.id}" ${i === 0 ? "checked" : ""}>
      <span><span class="nm">${UI.escape(p.name)}</span><span class="ds">${p.cards} 张 · ${p.delivery}</span></span>
      <span class="pr">${UI.money(p.price)}</span>
    </label>`).join("");
  $("[data-book-spread]").innerHTML = window.CODEX.spreads.map((s) => `<option value="${s.id}" ${s.id === "three-time" ? "selected" : ""}>${UI.escape(s.name)}</option>`).join("");
  const q0 = params.get("q");
  if (q0) $("[data-book-question]").value = q0;

  function updatePrice() {
    const fee = +(selected.price * (window.CODEX.commission || 0.15)).toFixed(2);
    $("[data-book-price]").textContent = UI.money(selected.price);
    $("[data-book-fee]").textContent = UI.money(fee);
    $("[data-book-net]").textContent = UI.money(selected.price - fee);
    $("[data-book-total]").textContent = UI.money(selected.price);
  }
  document.querySelectorAll("[data-packages] input").forEach((r) => r.addEventListener("change", () => {
    selected = m.packages.find((p) => p.id === r.value) || selected;
    document.querySelectorAll(".package-opt").forEach((x) => x.classList.toggle("is-active", x.contains(r)));
    updatePrice();
  }));
  updatePrice();

  $("[data-book]").addEventListener("click", () => {
    const question = $("[data-book-question]").value.trim();
    if (!question) { UI.toast("先写一句你想问的问题", "error"); $("[data-book-question]").focus(); return; }
    const pending = {
      masterId: m.id, alias: m.alias, packageId: selected.id, packageName: selected.name,
      price: selected.price, question, spreadId: $("[data-book-spread]").value,
      delivery: selected.delivery, image: m.sigil,
    };
    try { sessionStorage.setItem("moonphase.pendingService", JSON.stringify(pending)); } catch (e) { /* ignore */ }
    location.href = "checkout.html";
  });
})();
