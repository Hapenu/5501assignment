(function () {
  "use strict";
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  let filter = "all";

  function render() {
    const list = window.CODEX.posts.filter((p) => filter === "all" || p.status === filter);
    $("[data-feed]").innerHTML = list.map(UI.postCard).join("");
    $$("[data-cfilter]").forEach((b) => b.classList.toggle("is-active", b.dataset.cfilter === filter));
  }
  $$("[data-cfilter]").forEach((b) => b.addEventListener("click", () => { filter = b.dataset.cfilter; render(); }));
  $("[data-compose]").addEventListener("click", () => {
    UI.modal({
      kicker: "Demo Only",
      title: "发帖与回应暂不开放",
      body: `<p class="small muted">这是一个展示型社区：帖子与回应都是示例内容。真实上线需要账号、匿名机制、内容审核与举报流程。</p>
             <p class="small muted" style="margin-top:10px">你可以先去秘密圈读几条，或者直接邀请一位解牌师。</p>`,
      actions: [
        { label: "继续看", className: "btn-ghost" },
        { label: "看看解牌师", className: "btn-primary", onClick: () => { location.href = "masters.html"; } },
      ],
    });
  });
  $("[data-side-masters]").innerHTML = window.CODEX.masters.slice(0, 3).map((m) => `
    <a class="side-master" href="master.html?id=${m.id}"><img src="${m.sigil}" alt="" loading="eager"><span><span class="nm">${UI.escape(m.alias)}</span><span class="st">${UI.escape(m.title)} · ★ ${m.rating}</span></span></a>`).join("");
  render();
})();
