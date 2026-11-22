(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const id = new URLSearchParams(location.search).get("id");
  const reading = id ? C.readingById(id) : null;

  if (!reading) {
    $("[data-entry-empty]").hidden = false;
    return;
  }
  $("[data-entry]").hidden = false;
  const sp = C.spread(reading.spreadId);
  const d = new Date((reading.createdAt || reading.date + "T12:00:00"));
  const dateLabel = isNaN(d) ? reading.date : `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")} · ${String(d.getDate()).padStart(2, "0")}`;

  $("[data-entry-date]").textContent = dateLabel;
  $("[data-entry-q]").textContent = reading.question || "一次没有命名的抽牌";
  $("[data-entry-spread]").textContent = sp.name;
  $("[data-entry-mood]").textContent = reading.mood || "未标记心情";
  $("[data-entry-privacy]").textContent = reading.shared ? "已分享" : "私密";
  $("[data-entry-note]").textContent = reading.note || "还没有写下自己的话。";
  $("[data-entry-note]").classList.toggle("is-empty", !reading.note);
  $("[data-fact-spread]").textContent = sp.name;
  $("[data-fact-count]").textContent = `${reading.cards.length} 张`;
  $("[data-fact-mood]").textContent = reading.mood || "—";
  $("[data-fact-privacy]").textContent = reading.shared ? "已分享" : "私密";
  $("[data-fact-date]").textContent = dateLabel;
  $("[data-entry-edit]").href = `reading.html?id=${reading.id}`;
  const q = encodeURIComponent(reading.question || "");
  $("[data-entry-invite]").href = `masters.html?from=reading&q=${q}`;
  $("[data-side-invite]").href = `masters.html?from=reading&q=${q}`;

  $("[data-entry-board]").innerHTML = reading.cards.map((c, i) => {
    const card = C.card(c.id);
    const pos = sp.positions[i] || { label: `位置 ${i + 1}` };
    if (!card) return "";
    return `<a class="entry-card" href="card.html?id=${card.id}">
      ${UI.tarotCard(card, { rev: c.rev, showName: false })}
      <span class="entry-card-pos">${UI.escape(pos.label)}${c.rev ? " · 逆" : ""}</span>
      <span class="entry-card-name">${UI.escape(card.name)}</span>
    </a>`;
  }).join("");

  if (reading.aiText) {
    $("[data-ai-section]").hidden = false;
    $("[data-entry-ai]").textContent = reading.aiText;
  }

  const shareBtn = $("[data-share]");
  function updateShare() {
    shareBtn.textContent = reading.shared ? "已分享 · 取消" : "分享到秘密圈";
    $("[data-entry-privacy]").textContent = reading.shared ? "已分享" : "私密";
    $("[data-fact-privacy]").textContent = reading.shared ? "已分享" : "私密";
  }
  shareBtn.addEventListener("click", () => {
    if (reading.shared) {
      reading.shared = false; reading.privacy = "private"; C.saveReading(reading); updateShare();
      UI.toast("已撤回分享", "success");
      return;
    }
    UI.confirm({
      kicker: "Share",
      title: "分享这条牌记？",
      message: "演示站不会真的发布到社区。分享后，秘密圈里的其他人会看到问题、牌面与你选择公开的笔记。",
      confirmText: "分享",
    }).then((ok) => {
      if (!ok) return;
      reading.shared = true; reading.privacy = "shared"; C.saveReading(reading); updateShare();
      UI.toast("已标记为分享（演示）", "success");
    });
  });

  $("[data-delete]").addEventListener("click", async () => {
    const ok = await UI.confirm({
      kicker: "Delete",
      title: "删除这条牌记？",
      message: "删除后无法恢复。如果只是想隐藏，可以不分享，保持私密。",
      confirmText: "删除",
      danger: true,
    });
    if (!ok) return;
    C.deleteReading(reading.id);
    UI.toast("已删除", "success");
    setTimeout(() => { location.href = "journal.html"; }, 400);
  });
  updateShare();
})();
