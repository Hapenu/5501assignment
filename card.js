(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const id = new URLSearchParams(location.search).get("id") || "major-00";
  const card = C.card(id) || window.CODEX.cards[0];
  let orientation = "upright";

  function render() {
    const rev = orientation === "reversed";
    $("[data-card-art]").innerHTML = UI.tarotCard(card, { rev, showName: false, eager: true });
    $("[data-card-num]").textContent = card.arcana === "major" ? `Major · ${card.number}` : `${String(card.number).padStart(2, "0")} / ${card.suit.toUpperCase()}`;
    $("[data-card-crumb]").textContent = card.name;
    $("[data-card-name]").textContent = card.name;
    $("[data-card-en]").textContent = card.en;
    $("[data-card-arcana]").textContent = card.arcana === "major" ? "大牌" : "小牌";
    $("[data-card-element]").textContent = card.element || "—";
    $("[data-card-kw]").innerHTML = (rev ? card.keywords.reversed : card.keywords.upright).map((k) => `<span class="tag">${UI.escape(k)}</span>`).join("");
    $("[data-card-meaning]").textContent = rev ? card.meaning.reversed : card.meaning.upright;
    $("[data-card-advice]").innerHTML = `${UI.icon("spark")} ${UI.escape(card.advice)}`;
    const context = $("[data-card-context]");
    if (context) context.innerHTML = `<div class="label">Different Situations / 不同情境</div>${UI.cardLenses(card, rev).map((l) => `<div class="context-item"><h4>${UI.escape(l.label)}</h4><p>${UI.escape(l.text)}</p></div>`).join("")}`;
    const readings = C.readingsForCard(card.id);
    $("[data-appear]").innerHTML = readings.length ? readings.map((r) => `<a class="appear-row" href="entry.html?id=${r.id}"><span>${UI.escape(r.question || "一次抽牌")}</span><span class="mono">${r.date}</span></a>`).join("") : `<div class="tiny muted">它还没有在你的牌记里出现过。</div>`;
    $("[data-annotation]").value = C.state.annotations[card.id] || "";
  }

  document.querySelectorAll("[data-orient]").forEach((b) => b.addEventListener("click", () => {
    orientation = b.dataset.orient;
    document.querySelectorAll("[data-orient]").forEach((x) => x.classList.toggle("is-active", x === b));
    render();
  }));
  $("[data-save-note]").addEventListener("click", () => {
    C.state.annotations[card.id] = $("[data-annotation]").value.trim();
    C.save();
    UI.toast("批注已保存到本机", "success");
  });
  render();
})();
