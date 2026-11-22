(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  let filter = "all";
  let query = "";
  let blur = !!C.state.settings.journalPrivacy;
  document.body.classList.toggle("privacy-blur", blur);

  const readings = () => C.state.readings.slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  function filtered() {
    return readings().filter((r) => {
      if (filter === "shared" && !r.shared) return false;
      if (filter === "private" && r.shared) return false;
      if (query) {
        const names = r.cards.map((c) => (C.card(c.id) || {}).name || "").join(" ");
        const hay = `${r.question} ${r.note} ${names}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }

  function renderStats() {
    const s = C.journalStats();
    $("[data-js='total']").textContent = s.total;
    $("[data-js='streak']").textContent = s.streak;
    $("[data-js='top']").textContent = s.topCard ? s.topCard.name : "—";
    const el = Object.entries(s.elements).sort((a, b) => b[1] - a[1])[0];
    $("[data-js='element']").textContent = el && el[1] ? el[0] : "—";
    $("[data-count-all]").textContent = `(${s.total})`;
    const bars = $("[data-elements]");
    if (bars) {
      const total = Object.values(s.elements).reduce((a, b) => a + b, 0) || 1;
      bars.innerHTML = Object.entries(s.elements).map(([k, v]) => `
        <div class="element-row"><span class="el">${k}</span><span class="bar"><i style="width:${Math.round(v / total * 100)}%"></i></span><span class="mono tiny">${v}</span></div>`).join("");
    }
  }

  function renderHeatmap() {
    const wrap = $("[data-heatmap]");
    const map = {};
    readings().forEach((r) => { map[r.date] = (map[r.date] || 0) + 1; });
    const today = new Date(C.todayKey() + "T12:00:00");
    const cells = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const p = (n) => String(n).padStart(2, "0");
      const key = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      const n = map[key] || 0;
      const level = n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4;
      cells.push(`<span class="heat-cell" data-level="${level}" data-tip="${key}${n ? " · " + n + " 条" : " · 未记录"}"></span>`);
    }
    wrap.innerHTML = cells.join("");
    $("[data-heat-count]").textContent = `${readings().length} 条`;
  }

  function renderList() {
    const list = $("[data-list]");
    const items = filtered();
    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><span class="icon">${UI.icon("book")}</span><h3>这里还没有牌记</h3><p>完成一次抽牌，写下自己的话，它就会留在这里。</p><a class="btn btn-primary btn-sm" href="draw.html">去抽牌</a></div>`;
      return;
    }
    list.innerHTML = items.map((r) => {
      const sp = C.spread(r.spreadId);
      const d = new Date((r.createdAt || r.date + "T12:00:00"));
      const day = isNaN(d) ? "" : String(d.getDate()).padStart(2, "0");
      const month = isNaN(d) ? "" : String(d.getMonth() + 1).padStart(2, "0");
      const cards = r.cards.slice(0, 5).map((c) => UI.miniCard(c.id, c.rev)).join("");
      return `<a class="entry-row" href="entry.html?id=${r.id}">
        <div class="entry-date"><strong>${day}</strong>${month} 月</div>
        <div class="entry-body">
          <h4>${UI.escape(r.question || "未命名的一次抽牌")}</h4>
          <p>${UI.escape(sp.name)} · ${UI.escape(r.mood || "未标记心情")}${r.note ? " · " + UI.escape(r.note.slice(0, 34)) : ""}</p>
          <div class="entry-cards">${cards}</div>
        </div>
        <div class="entry-side">
          <span class="badge ${r.shared ? "badge-rose" : "badge-muted"}">${r.shared ? "已分享" : "私密"}</span>
          <span class="tiny muted mono">${r.cards.length} 张</span>
        </div>
      </a>`;
    }).join("");
  }

  function renderAll() {
    renderStats();
    renderHeatmap();
    renderList();
    document.body.classList.toggle("privacy-blur", blur);
  }

  $$("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    filter = b.dataset.filter;
    $$("[data-filter]").forEach((x) => x.classList.toggle("is-active", x === b));
    renderList();
  }));
  $("[data-search]")?.addEventListener("input", (e) => { query = e.target.value.trim(); renderList(); });
  if (blur) $("[data-blur]")?.classList.add("btn-primary");
  $("[data-blur]")?.addEventListener("click", (e) => {
    blur = !blur;
    e.currentTarget.classList.toggle("btn-ghost", !blur);
    e.currentTarget.classList.toggle("btn-primary", blur);
    document.body.classList.toggle("privacy-blur", blur);
  });
  $$("[data-random]").forEach((b) => b.addEventListener("click", () => {
    const all = readings();
    if (!all.length) return;
    const r = all[Math.floor(Math.random() * all.length)];
    UI.toast("翻到一条旧记录", "success");
    setTimeout(() => { location.href = `entry.html?id=${r.id}`; }, 300);
  }));

  renderAll();
})();
