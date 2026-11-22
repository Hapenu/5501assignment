(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const st = C.state;

  function renderHead() {
    $("[data-user-alias]").textContent = st.user.alias;
    $("[data-avatar]").textContent = st.user.initial;
    const jp = String(st.user.joined || "").split("-"); $("[data-user-joined]").textContent = jp.length >= 2 ? `${jp[0]} 年 ${Number(jp[1])} 月` : st.user.joined;
    $("[data-user-level]").textContent = st.user.level;
    $("[data-user-streak]").textContent = st.user.streak;
    $("[data-user-credits]").textContent = st.user.credits;
    $("[data-level-badge]").textContent = "Lv." + st.user.level;
    $("[data-badges]").innerHTML = `<span class="badge badge-gold">月相 Lv.${st.user.level}</span><span class="badge badge-muted">连续 ${st.user.streak} 天</span><span class="badge badge-sage">记录者</span>`;
    const levels = [0, 100, 220, 360, 520, 700, 920, 1180];
    const next = levels.find((x) => x > st.user.xp) || 1180;
    const prev = levels.filter((x) => x <= st.user.xp).pop() || 0;
    const pct = Math.min(100, Math.round((st.user.xp - prev) / (next - prev) * 100));
    $("[data-xp-bar]").style.width = pct + "%";
    $("[data-xp-next]").textContent = `${Math.max(0, next - st.user.xp)} XP`;
  }

  function renderReadings() {
    const list = st.readings.slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    $("[data-reading-count]").textContent = `${list.length} 条牌记`;
    $("[data-recent-readings]").innerHTML = list.slice(0, 3).map((r) => `
      <a class="entry-row" href="entry.html?id=${r.id}"><div class="entry-date"><strong>${r.date.slice(8)}</strong>${r.date.slice(5, 7)} 月</div><div class="entry-body"><h4>${UI.escape(r.question || "未命名抽牌")}</h4><p>${UI.escape(C.spread(r.spreadId).name)} · ${UI.escape(r.mood || "未标记")}</p></div><div class="entry-side"><span class="badge ${r.shared ? "badge-rose" : "badge-muted"}">${r.shared ? "已分享" : "私密"}</span></div></a>`).join("");
    $("[data-reading-list]").innerHTML = list.map((r) => `
      <a class="entry-row" href="entry.html?id=${r.id}"><div class="entry-date"><strong>${r.date.slice(8)}</strong>${r.date.slice(5, 7)} 月</div><div class="entry-body"><h4>${UI.escape(r.question || "未命名抽牌")}</h4><p>${UI.escape(C.spread(r.spreadId).name)} · ${UI.escape(r.mood || "未标记")}</p></div><div class="entry-side"><span class="badge ${r.shared ? "badge-rose" : "badge-muted"}">${r.shared ? "已分享" : "私密"}</span></div></a>`).join("");
  }

  function renderOrders() {
    $("[data-recent-orders]").innerHTML = st.orders.slice(0, 3).map(UI.orderCard).join("");
  }

  function renderInventory() {
    const items = C.sanctumInventory();
    $("[data-inventory]").innerHTML = items.map((p) => `
      <a class="inventory-card" href="item.html?id=${p.id}"><img src="${p.image}" alt="" loading="eager"><div class="nm">${UI.escape(p.name)}</div><div class="tag">${p.slot || "器物"}</div></a>`).join("");
    $("[data-inventory-empty]").hidden = items.length > 0;
  }

  // tabs
  $$("[data-ptab]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-ptab]").forEach((x) => x.classList.toggle("is-active", x === b));
    $$("[data-ppanel]").forEach((p) => { p.hidden = p.dataset.ppanel !== b.dataset.ptab; });
  }));

  // AI settings
  const providers = C.AI.providers;
  $("[data-ai-provider]").innerHTML = Object.keys(providers).map((k) => `<option value="${k}" ${st.ai.provider === k ? "selected" : ""}>${providers[k].label}</option>`).join("");
  $("[data-ai-base]").value = st.ai.baseUrl || "";
  $("[data-ai-model]").value = st.ai.model || "";
  $("[data-ai-remember]").checked = !!st.ai.remember;
  $("[data-ai-consent]").checked = !!st.ai.consent;
  $("[data-ai-status]").textContent = C.getKey() ? `已有 Key · ${st.ai.model}` : "未接入 · 使用本地注疏";
  $("[data-ai-provider]").addEventListener("change", (e) => {
    const p = providers[e.target.value];
    if (p && p.baseUrl) { $("[data-ai-base]").value = p.baseUrl; $("[data-ai-model]").value = p.model; }
  });
  $("[data-ai-save]").addEventListener("click", () => {
    const key = $("[data-ai-key]").value.trim();
    const remember = $("[data-ai-remember]").checked;
    if (key) C.setKey(key, remember);
    else if (C.getKey()) C.setKey(C.getKey(), remember);
    C.saveAiConfig({ provider: $("[data-ai-provider]").value, baseUrl: $("[data-ai-base]").value.trim(), model: $("[data-ai-model]").value.trim(), remember, consent: $("[data-ai-consent]").checked });
    $("[data-ai-status]").textContent = C.getKey() ? `已保存 · ${st.ai.model}` : "未接入 · 使用本地注疏";
    UI.toast("AI 设置已保存", "success");
  });
  $("[data-ai-test]").addEventListener("click", async () => {
    const btn = $("[data-ai-test]");
    btn.disabled = true; btn.textContent = "测试中…";
    const r = await C.AI.test({ provider: $("[data-ai-provider]").value, baseUrl: $("[data-ai-base]").value.trim(), model: $("[data-ai-model]").value.trim() }, $("[data-ai-key]").value.trim() || C.getKey());
    btn.disabled = false; btn.textContent = "测试连接";
    $("[data-ai-status]").textContent = r.message;
    $("[data-ai-status]").style.color = r.ok ? "var(--sage)" : "var(--danger)";
  });
  $("[data-ai-clear]").addEventListener("click", async () => {
    const ok = await UI.confirm({ title: "清除本机 Key？", message: "清除后，AI 解读会回退到本地注疏。", confirmText: "清除" });
    if (!ok) return;
    C.clearKey(); $("[data-ai-status]").textContent = "Key 已清除 · 使用本地注疏"; UI.toast("Key 已清除", "success");
  });

  // preferences
  $("[data-motion]").checked = st.settings.motion === "reduced";
  $("[data-privacy]").checked = !!st.settings.journalPrivacy;
  $("[data-motion]").addEventListener("change", (e) => {
    st.settings.motion = e.target.checked ? "reduced" : "full";
    document.body.classList.toggle("reduce-motion", e.target.checked);
    C.save();
  });
  $("[data-privacy]").addEventListener("change", (e) => {
    st.settings.journalPrivacy = e.target.checked;
    document.body.classList.toggle("privacy-blur", e.target.checked);
    C.save();
  });
  document.body.classList.toggle("reduce-motion", st.settings.motion === "reduced");

  $("[data-export]").addEventListener("click", () => {
    UI.download("lunar-journal.json", C.exportData());
    UI.toast("已导出 JSON", "success");
  });
  $("[data-import]").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ok = await UI.confirm({ title: "导入并覆盖当前数据？", message: "导入会替换这台设备上的牌记、订单与器物。API Key 不会被覆盖。", confirmText: "导入" });
    if (!ok) return;
    try { C.importData(await f.text()); UI.toast("导入成功", "success"); setTimeout(() => location.reload(), 600); }
    catch (err) { UI.toast("导入失败：文件格式不对", "error"); }
  });
  $("[data-reset]").addEventListener("click", async () => {
    const ok = await UI.confirm({ title: "清空并重新载入示例？", message: "当前牌记、订单与器物会被示例数据替换。这个操作不能撤销。", confirmText: "清空并重置", danger: true });
    if (!ok) return;
    C.reset(true); UI.toast("已重置为示例数据", "success"); setTimeout(() => location.reload(), 500);
  });

  renderHead(); renderReadings(); renderOrders(); renderInventory();
})();
