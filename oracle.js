(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const today = C.todayKey();
  let item = params.get("date")
    ? window.CODEX.oracle.find((o) => o.date === params.get("date"))
    : (window.CODEX.oracle.find((o) => o.date === today) || window.CODEX.oracle[0]);
  let revealed = false;

  const positions = ["今天的牌", "暗流", "下一步"];

  function render() {
    $("[data-oracle-date]").textContent = item.date;
    $("[data-oracle-q]").textContent = item.question;
    $("[data-oracle-cards]").innerHTML = item.cards.map((id, i) => {
      const card = C.card(id);
      return `<div class="oracle-card" data-oc="${i}">
        <div class="flip"><div class="face back"></div><div class="face front"><img src="${card.image}" alt="${UI.escape(card.name)}" loading="eager"></div></div>
        <div class="pos">${positions[i] || "牌"}</div>
      </div>`;
    }).join("");
    $("[data-oracle-reading]").innerHTML = item.reading.map((p) => `<p>${UI.escape(p)}</p>`).join("");
    $("[data-oracle-author]").textContent = `撰文 · ${item.author}`;
    const saved = C.state.oracle.answers[item.date];
    $("[data-oracle-answer]").value = saved || "";
    $("[data-answer-state]").textContent = saved ? "已保存" : "只保存在本机";
    if (C.state.oracle.lastDate === item.date && C.state.oracle.revealed) open(false);
  }

  function open(animate = true) {
    if (revealed) return;
    revealed = true;
    const cards = document.querySelectorAll("[data-oc]");
    cards.forEach((el, i) => setTimeout(() => el.classList.add("is-open"), animate ? i * 160 : 0));
    setTimeout(() => {
      $("[data-oracle-reveal]").hidden = false;
      $("[data-reveal]").disabled = true;
      $("[data-reveal]").textContent = "今日已翻开";
      $("[data-oracle-state]").textContent = "每天一次 · 明天再来";
    }, animate ? 900 : 0);
  }

  $("[data-reveal]").addEventListener("click", () => {
    open(true);
    C.state.oracle.lastDate = item.date;
    C.state.oracle.revealed = true;
    C.save();
  });
  $("[data-save-answer]").addEventListener("click", () => {
    const text = $("[data-oracle-answer]").value.trim();
    if (!text) { UI.toast("先写一句你的答案", "error"); return; }
    C.oracleAnswer(item.date, text);
    $("[data-answer-state]").textContent = "已保存 · 获得 3 月华";
    UI.toast("答案已保存，获得 3 月华", "success");
  });

  $("[data-archive]").innerHTML = window.CODEX.oracle.map((o) => `
    <a class="archive-row" href="oracle.html?date=${o.date}">
      <span class="archive-date">${o.date}</span>
      <span class="archive-q">${UI.escape(o.question)}</span>
      <span class="tiny muted">${UI.escape(o.author)} →</span>
    </a>`).join("");

  render();
})();
