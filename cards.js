(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  let filter = "all";
  let query = "";

  function match(c) {
    if (filter === "major" && c.arcana !== "major") return false;
    if (["wands", "cups", "swords", "pentacles"].includes(filter) && c.suit !== filter) return false;
    if (query) {
      const hay = `${c.name} ${c.en} ${(c.keywords.upright || []).join(" ")} ${(c.keywords.reversed || []).join(" ")}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    return true;
  }

  function render() {
    const list = window.CODEX.cards.filter(match);
    $("[data-count]").textContent = `${list.length} 张`;
    $("[data-grid]").innerHTML = list.map((c) => {
      const note = C.state.annotations[c.id] ? '<i class="card-note-dot" title="有批注"></i>' : "";
      return `<div class="card-cell">${UI.tarotCard(c, { href: `card.html?id=${c.id}` })}${note}</div>`;
    }).join("");
  }

  $$("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    filter = b.dataset.filter;
    $$("[data-filter]").forEach((x) => x.classList.toggle("is-active", x === b));
    render();
  }));
  $("[data-search]")?.addEventListener("input", (e) => { query = e.target.value.trim(); render(); });
  $("[data-random]")?.addEventListener("click", () => {
    const c = window.CODEX.cards[Math.floor(Math.random() * window.CODEX.cards.length)];
    location.href = `card.html?id=${c.id}`;
  });
  render();
})();
