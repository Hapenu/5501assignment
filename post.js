(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const id = new URLSearchParams(location.search).get("id");
  const p = id ? C.post(id) : null;
  if (!p) { $("[data-post-empty]").hidden = false; return; }
  $("[data-post]").hidden = false;
  $("[data-post-crumb]").textContent = p.date;
  $("[data-post-avatar]").textContent = p.initial;
  $("[data-post-author]").textContent = p.alias;
  $("[data-post-date]").textContent = `${p.date} · ${p.time}`;
  $("[data-post-q]").textContent = p.question;
  $("[data-post-tags]").innerHTML = p.tags.map((t) => `<span class="tag">${UI.escape(t)}</span>`).join("") + `<span class="badge ${p.status === "精华" ? "badge-gold" : "badge-muted"}">${UI.escape(p.status)}</span>`;
  $("[data-post-cards]").innerHTML = p.cards.map((id) => UI.miniCard(id)).join("");
  $("[data-post-body]").textContent = p.body;

  if (p.locked) {
    const m = C.master(p.locked.masterId);
    $("[data-locked]").hidden = false;
    $("[data-lock-preview]").textContent = p.locked.preview;
    $("[data-lock-desc]").textContent = `由 ${m ? m.alias : "社区解牌师"} 提供。完整版 ¥${p.locked.price}，也可以按自己的问题重新预约。`;
    const cta = $("[data-lock-cta]");
    cta.href = `master.html?id=${p.locked.masterId}&q=${encodeURIComponent(p.question)}`;
  }

  $("[data-comments]").innerHTML = p.comments.map((c) => `
    <div class="comment"><span class="post-avatar">${UI.escape(c.initial)}</span><div><div class="nm">${UI.escape(c.alias)}</div><div class="tx">${UI.escape(c.text)}</div></div></div>`).join("");

  $("[data-reply]").addEventListener("click", () => {
    UI.modal({
      kicker: "Demo Only",
      title: "回应暂不开放",
      body: `<p class="small muted">这是展示型社区，回应不会真的发布。真实上线需要账号、内容审核与举报流程。</p>`,
      actions: [{ label: "知道了", className: "btn-primary" }],
    });
  });
  $("[data-invite]").href = `masters.html?from=post&q=${encodeURIComponent(p.question)}`;
})();
