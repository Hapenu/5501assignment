(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  let reading = null;
  let isSaved = false;
  let selectedPos = 0;
  let selectedMood = "";
  let aiSource = "local";

  function load() {
    const id = new URLSearchParams(location.search).get("id");
    if (id) {
      const saved = C.readingById(id);
      if (saved) { reading = JSON.parse(JSON.stringify(saved)); isSaved = true; return; }
    }
    try {
      const draft = JSON.parse(sessionStorage.getItem("moonphase.draft") || "null");
      if (draft && draft.cards && draft.cards.length) { reading = draft; isSaved = !!C.readingById(draft.id); return; }
    } catch (e) { /* ignore */ }
  }

  function cardOf(c) { return C.card(c.id); }
  function spread() { return C.spread(reading.spreadId); }

  function render() {
    if (!reading || !reading.cards || !reading.cards.length) {
      qs("[data-reading-empty]").hidden = false;
      qs("[data-reading]").hidden = true;
      const bar = qs("[data-reading-actions]"); if (bar) bar.hidden = true;
      qs("[data-reading-title]").textContent = "解读";
      qs("[data-reading-q]").textContent = "还没有抽牌。";
      return;
    }
    qs("[data-reading-empty]").hidden = true;
    qs("[data-reading]").hidden = false;
    const bar = qs("[data-reading-actions]"); if (bar) bar.hidden = false;
    const sp = spread();
    qs("[data-reading-title]").textContent = sp.name;
    qs("[data-reading-q]").textContent = reading.question ? `「${reading.question}」` : "未填写问题";
    renderBoard();
    renderPanel();
    if (qs("[data-note]")) qs("[data-note]").value = reading.note || "";
    if (qs("[data-ai-text]")) qs("[data-ai-text]").value = reading.aiText || "";
    selectedMood = reading.mood || "";
    qsa("[data-mood]").forEach((b) => b.classList.toggle("is-active", b.dataset.mood === selectedMood));
    qsa("[data-privacy]").forEach((r) => { r.checked = (r.value === "shared") === !!reading.shared; });
    const invite = qs("[data-invite]");
    if (invite) invite.href = `masters.html?from=reading&q=${encodeURIComponent(reading.question || "")}`;
    updateAiStatus();
  }

  function renderBoard() {
    const sp = spread();
    const board = qs("[data-board]");
    const count = reading.cards.length;
    const width = count >= 8 ? 58 : count >= 5 ? 82 : 112;
    board.dataset.count = count;
    board.innerHTML = reading.cards.map((c, i) => {
      const pos = sp.positions[i] || { label: `位置 ${i + 1}` };
      const layout = sp.layout[i] || sp.layout[sp.layout.length - 1];
      const card = cardOf(c);
      if (!card) return "";
      return `<div class="spread-slot ${i === selectedPos ? "is-active" : ""} ${sp.id === "celtic" && i === 1 ? "is-cross" : ""}" data-pos="${i}" style="--x:${layout.x}%;--y:${layout.y}%;width:${width}px">
        ${UI.tarotCard(card, { rev: c.rev, showName: false })}
        <div class="pos-label">${UI.escape(pos.label)}${c.rev ? " · 逆" : ""}</div>
      </div>`;
    }).join("");
    board.querySelectorAll("[data-pos]").forEach((el) => el.addEventListener("click", () => {
      selectedPos = Number(el.dataset.pos);
      board.querySelectorAll("[data-pos]").forEach((x) => x.classList.toggle("is-active", x === el));
      renderPanel();
      switchTab("meaning");
    }));
  }

  function renderPanel() {
    const sp = spread();
    const c = reading.cards[selectedPos];
    const card = c && cardOf(c);
    const pos = sp.positions[selectedPos] || { label: `位置 ${selectedPos + 1}`, meaning: "" };
    const panel = qs('[data-rpanel="meaning"]');
    if (!card) { panel.innerHTML = ""; return; }
    const kw = c.rev ? card.keywords.reversed : card.keywords.upright;
    panel.innerHTML = `
      <div class="meaning-card">
        ${UI.tarotCard(card, { rev: c.rev, showName: false })}
        <div>
          <div class="label">${UI.escape(pos.label)} · ${c.rev ? "逆位" : "正位"}</div>
          <h3>${UI.escape(card.name)}</h3>
          <div class="en">${UI.escape(card.en)} · ${UI.escape(card.element || "")}</div>
          <div class="meaning-kw">${kw.map((k) => `<span class="tag">${UI.escape(k)}</span>`).join("")}</div>
        </div>
      </div>
      <div class="meaning-body">${UI.escape(c.rev ? card.meaning.reversed : card.meaning.upright)}</div>
      <div class="meaning-advice">${UI.icon("spark")} ${UI.escape(card.advice)}</div>
      <div class="meaning-context">
        <div class="label">Different Situations / 不同情境</div>
        ${UI.cardLenses(card, c.rev).map((l) => `<div class="context-item"><h4>${UI.escape(l.label)}</h4><p>${UI.escape(l.text)}</p></div>`).join("")}
      </div>
      <div class="tiny muted" style="margin-top:12px">这个位置在问：${UI.escape(pos.meaning)}</div>
      <div class="cluster" style="margin-top:14px">
        <button class="btn btn-sm btn-ghost" type="button" data-to-note>把这句话变成自己的</button>
        <a class="btn btn-sm btn-quiet" href="card.html?id=${card.id}">看整张牌</a>
      </div>`;
    panel.querySelector("[data-to-note]")?.addEventListener("click", () => {
      const note = qs("[data-note]");
      const line = (c.rev ? card.meaning.reversed : card.meaning.upright);
      note.value = (note.value ? note.value + "\n\n" : "") + line;
      switchTab("note");
      note.focus();
    });
  }

  function switchTab(key) {
    qsa("[data-rtab]").forEach((b) => b.classList.toggle("is-active", b.dataset.rtab === key));
    qsa("[data-rpanel]").forEach((p) => { p.hidden = p.dataset.rpanel !== key; });
  }
  qsa("[data-rtab]").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.rtab)));

  function updateAiStatus() {
    const el = qs("[data-ai-status]");
    if (!el) return;
    const key = C.getKey();
    const cfg = C.aiConfig();
    if (key) el.textContent = `已接入 ${cfg.model || "AI"}；生成的是草稿，可修改。`;
    else el.textContent = "未接入 AI；生成时会使用本地注疏。点“AI 设置”可粘贴自己的 Key。";
  }

  qs("[data-ai-settings]")?.addEventListener("click", () => {
    UI.aiSettingsModal({ onSaved: updateAiStatus });
  });

  async function generate() {
    if (!reading || !reading.cards.length) return;
    const btn = qs("[data-ai-generate]");
    const key = C.getKey();
    const cfg = C.aiConfig();
    if (key && !cfg.consent) {
      const ok = await UI.confirm({
        kicker: "AI · 发送前确认",
        title: "把问题与牌面发送给第三方模型？",
        message: "只会发送问题、牌阵与牌面；不发送你的私人笔记。你可以随时在 AI 设置中关闭或清除 Key。",
        confirmText: "同意并生成",
      });
      if (!ok) return;
      C.saveAiConfig({ consent: true });
    }
    btn.disabled = true; btn.textContent = "生成中…";
    const panel = qs("[data-rpanel='ai']");
    let loading = panel.querySelector(".ai-loading");
    if (!loading) {
      loading = document.createElement("div");
      loading.className = "ai-loading";
      loading.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span> 正在看牌…';
      panel.querySelector(".ai-block").appendChild(loading);
    }
    const result = await C.AI.generate(reading, { skipConsent: true });
    if (loading) loading.remove();
    const ta = qs("[data-ai-text]");
    ta.value = result.text;
    reading.aiText = result.text;
    aiSource = result.source;
    btn.disabled = false; btn.textContent = "重新生成";
    const status = qs("[data-ai-status]");
    if (result.source === "ai") status.textContent = `AI 草稿 · ${result.model || cfg.model} · 可修改`;
    else if (result.reason === "no-key") status.textContent = "本地注疏 · 未接入 AI。可在“AI 设置”里粘贴 Key。";
    else status.textContent = `AI 暂不可用（${result.error || result.reason}），已切换本地注疏。`;
    if (result.error) UI.toast("AI 暂不可用，已切换本地注疏", "error");
  }
  qs("[data-ai-generate]")?.addEventListener("click", generate);
  qs("[data-ai-to-note]")?.addEventListener("click", () => {
    const note = qs("[data-note]");
    const ta = qs("[data-ai-text]");
    note.value = (note.value ? note.value + "\n\n" : "") + ta.value;
    switchTab("note");
    note.focus();
  });

  qsa("[data-mood]").forEach((b) => b.addEventListener("click", () => {
    selectedMood = selectedMood === b.dataset.mood ? "" : b.dataset.mood;
    qsa("[data-mood]").forEach((x) => x.classList.toggle("is-active", x.dataset.mood === selectedMood));
  }));

  function save() {
    if (!reading || !reading.cards.length) return;
    reading.note = qs("[data-note]").value.trim();
    reading.aiText = qs("[data-ai-text]").value.trim();
    reading.mood = selectedMood;
    reading.shared = !!qs('[data-privacy][value="shared"]')?.checked;
    reading.privacy = reading.shared ? "shared" : "private";
    if (!reading.id) reading.id = "r_" + Date.now().toString(36);
    if (!reading.createdAt) reading.createdAt = new Date().toISOString();
    if (!reading.date) reading.date = C.todayKey();
    C.saveReading(reading);
    try { sessionStorage.removeItem("moonphase.draft"); } catch (e) { /* ignore */ }
    const first = !isSaved;
    isSaved = true;
    UI.toast(first ? "已保存，获得 12 月华" : "已更新这条牌记", "success");
    setTimeout(() => { location.href = `entry.html?id=${reading.id}`; }, 500);
  }
  qsa("[data-save]").forEach((b) => b.addEventListener("click", save));
  qs("[data-ai-text]")?.addEventListener("input", () => { if (reading) reading.aiText = qs("[data-ai-text]").value; });

  load();
  render();
})();
