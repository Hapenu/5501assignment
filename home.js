(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const el = (s) => document.querySelector(s);
  const all = (s) => Array.from(document.querySelectorAll(s));

  const d = new Date();
  const months = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
  const dateEl = el("[data-hero-date]");
  if (dateEl) {
    const full = `lunar Journal · ${months[d.getMonth()]}月 ${d.getDate()}日 · ${UI.weekday(C.todayKey())}`;
    const short = `${months[d.getMonth()]}月 ${d.getDate()}日 · ${UI.weekday(C.todayKey())}`;
    dateEl.textContent = window.innerWidth < 600 ? short : full;
  }

  const stats = C.journalStats();
  all("[data-stat]").forEach((node) => {
    const key = node.dataset.stat;
    node.textContent = key === "readings" ? stats.total : key === "streak" ? stats.streak : "0";
  });

  const todayOracle = window.CODEX.oracle[0];
  if (todayOracle) {
    if (el("[data-oracle-q]")) el("[data-oracle-q]").textContent = todayOracle.question;
    if (el("[data-oracle-note]")) el("[data-oracle-note]").textContent = `${todayOracle.date} · ${todayOracle.weekday} · 每日一次集体仪式`;
    if (el("[data-oracle-cards]")) el("[data-oracle-cards]").innerHTML = todayOracle.cards.map((id) => UI.miniCard(id)).join("");
  }

  if (el("[data-masters]")) {
    el("[data-masters]").innerHTML = window.CODEX.masters.slice(0, 2).map(UI.masterCard).join("");
  }
  if (el("[data-products]")) {
    el("[data-products]").innerHTML = window.CODEX.products.filter((p) => p.featured).slice(0, 3).map(UI.productCard).join("");
  }
})();
