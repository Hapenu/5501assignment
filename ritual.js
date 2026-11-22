(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const table = document.querySelector("[data-sanctum]");
  const clothEl = document.querySelector("[data-cloth]");
  const emptyEl = document.querySelector("[data-sanctum-empty]");
  const rail = document.querySelector("[data-rail]");
  if (!table) return;

  const KIND = { cloth: "cloth", candle: "candle", crystal: "crystal", smoke: "smoke", blade: "blade", bowl: "bowl", sound: "bell", pendulum: "pendulum", mirror: "mirror" };
  let cloth = C.state.sanctum.cloth || "#3f4a63";
  let items = (C.state.sanctum.items || []).filter((i) => i.kind !== "cloth");
  const oldCloth = (C.state.sanctum.items || []).find((i) => i.kind === "cloth");
  if (oldCloth && oldCloth.color) cloth = oldCloth.color;
  let selected = null;
  let audio = null;
  let ambientOn = false;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = (k) => k + "_" + Math.random().toString(36).slice(2, 7);

  function objectInner(kind) {
    if (kind === "candle") return '<div class="obj-candle"><span class="holder"></span><span class="wax"></span><span class="flame"></span></div>';
    if (kind === "crystal") return '<div class="obj-crystal"><svg viewBox="0 0 64 80" aria-hidden="true"><path d="M32 6l16 26-7 40H23L16 32z" fill="rgba(232,221,198,.16)" stroke="#c3a05e" stroke-width="1"/><path d="M32 6v66M16 32h32" stroke="#c3a05e" stroke-width=".6" opacity=".55"/></svg></div>';
    if (kind === "blade") return '<div class="obj-blade"></div>';
    if (kind === "smoke") return '<div class="obj-smoke"></div>';
    if (kind === "bowl") return '<div class="obj-bowl"></div>';
    if (kind === "bell") return '<div class="obj-bell"></div>';
    if (kind === "pendulum") return '<div class="obj-pendulum"></div>';
    if (kind === "mirror") return '<div class="obj-mirror"></div>';
    return '<div class="obj-crystal"></div>';
  }

  function itemHTML(item) {
    return `<div class="ritual-item kind-${item.kind} ${selected === item.uid ? "is-selected" : ""}" data-uid="${item.uid}" tabindex="0" role="button" aria-label="${UI.escape(item.name)}"
      style="--x:${item.x}%;--y:${item.y}%;--rot:${item.rot || 0}deg;--scale:${item.scale || 1};--z:${item.z || 2}">
      ${objectInner(item.kind)}
      <span class="obj-label">${UI.escape(item.name)}</span>
      <button class="obj-rotate" type="button" aria-label="旋转">${UI.icon("rotate")}</button>
    </div>`;
  }

  function render() {
    table.querySelectorAll(".ritual-item").forEach((n) => n.remove());
    table.insertAdjacentHTML("beforeend", items.map(itemHTML).join(""));
    table.querySelectorAll(".ritual-item").forEach(bind);
    clothEl.style.setProperty("--cloth", cloth);
    if (emptyEl) emptyEl.hidden = items.length > 0;
    const count = document.querySelector("[data-rail-count]");
    if (count) count.textContent = `${items.length} 件`;
  }

  function save() {
    C.saveSanctum(items.map((i) => ({ ...i })), cloth);
  }

  function select(uid) {
    selected = uid;
    table.querySelectorAll(".ritual-item").forEach((n) => n.classList.toggle("is-selected", n.dataset.uid === uid));
  }

  function bind(el) {
    const item = items.find((i) => i.uid === el.dataset.uid);
    if (!item) return;
    el.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".obj-rotate")) return;
      e.preventDefault();
      select(item.uid);
      const rect = table.getBoundingClientRect();
      const startX = e.clientX, startY = e.clientY, ox = item.x, oy = item.y;
      el.setPointerCapture(e.pointerId);
      const move = (ev) => {
        item.x = clamp(ox + ((ev.clientX - startX) / rect.width) * 100, 3, 97);
        item.y = clamp(oy + ((ev.clientY - startY) / rect.height) * 100, 4, 96);
        el.style.setProperty("--x", item.x + "%");
        el.style.setProperty("--y", item.y + "%");
      };
      const up = () => {
        el.removeEventListener("pointermove", move);
        save();
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up, { once: true });
      el.addEventListener("pointercancel", up, { once: true });
    });
    el.addEventListener("dblclick", () => {
      item.x = 50; item.y = 50; item.rot = 0;
      el.style.setProperty("--x", "50%"); el.style.setProperty("--y", "50%"); el.style.setProperty("--rot", "0deg");
      save();
    });
    const rot = el.querySelector(".obj-rotate");
    if (rot) rot.addEventListener("pointerdown", (e) => {
      e.stopPropagation(); e.preventDefault();
      const rect = table.getBoundingClientRect();
      const cx = rect.left + (item.x / 100) * rect.width;
      const cy = rect.top + (item.y / 100) * rect.height;
      const start = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
      const r0 = item.rot || 0;
      const move = (ev) => {
        const a = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
        item.rot = Math.round(r0 + a - start);
        el.style.setProperty("--rot", item.rot + "deg");
      };
      rot.setPointerCapture(e.pointerId);
      rot.addEventListener("pointermove", move);
      rot.addEventListener("pointerup", () => { rot.removeEventListener("pointermove", move); save(); }, { once: true });
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Delete" || e.key === "Backspace") { remove(item.uid); e.preventDefault(); }
      if (e.key === "ArrowLeft") { item.x = clamp(item.x - 1, 3, 97); }
      if (e.key === "ArrowRight") { item.x = clamp(item.x + 1, 3, 97); }
      if (e.key === "ArrowUp") { item.y = clamp(item.y - 1, 4, 96); }
      if (e.key === "ArrowDown") { item.y = clamp(item.y + 1, 4, 96); }
      if (e.key === "[" || e.key === "]") { item.rot = (item.rot || 0) + (e.key === "]" ? 5 : -5); }
      el.style.setProperty("--x", item.x + "%"); el.style.setProperty("--y", item.y + "%"); el.style.setProperty("--rot", (item.rot || 0) + "deg");
      save();
    });
  }

  function remove(uid) {
    items = items.filter((i) => i.uid !== uid);
    selected = null;
    render(); save();
  }

  function add(kind, name, color, productId) {
    if (kind === "cloth") {
      cloth = color || "#3f4a63";
      clothEl.style.setProperty("--cloth", cloth);
      save();
      UI.toast("桌布已更换", "success");
      return;
    }
    const k = KIND[kind] || kind;
    const item = {
      uid: uid(k), kind: k, productId: productId || null, name,
      color: color || "#c3a05e",
      x: 50 + (Math.random() * 12 - 6), y: 48 + (Math.random() * 12 - 6),
      rot: Math.random() * 10 - 5, scale: 1, z: 4 + items.length,
    };
    items.push(item);
    render();
    select(item.uid);
    save();
    UI.toast(`「${name}」已放到桌面`, "success");
  }

  function renderRail() {
    const free = (window.CODEX.freeItems || []).map((i) => ({ ...i, productId: null, sub: "基础器物" }));
    const bought = C.sanctumInventory().map((p) => ({
      id: p.id, kind: p.slot, name: p.name, color: p.accent, productId: p.id,
      sub: p.type === "virtual" ? "已拥有" : "",
    }));
    const all = [...free, ...bought];
    rail.innerHTML = all.map((i) => `
      <button class="rail-item" type="button" data-add-item data-kind="${i.kind}" data-name="${UI.escape(i.name)}" data-color="${i.color || "#c3a05e"}" data-product="${i.productId || ""}">
        <span class="thumb">${i.kind === "cloth" ? `<span class="rail-swatch" style="background:${i.color}"></span>` : UI.icon(i.kind === "candle" ? "spark" : i.kind === "blade" ? "edit" : i.kind === "mirror" ? "eye" : "moon")}</span>
        <span><span class="nm">${UI.escape(i.name)}</span><span class="sub">${i.sub || "已拥有"}</span></span>
        <span class="plus">+</span>
      </button>`).join("");
    rail.querySelectorAll("[data-add-item]").forEach((b) => b.addEventListener("click", () => {
      add(b.dataset.kind, b.dataset.name, b.dataset.color, b.dataset.product);
    }));
  }

  const PRESETS = {
    A: { cloth: "#3f4a63", items: [
      { kind: "candle", name: "黄铜烛台", color: "#c3a05e", x: 24, y: 38, rot: 0 },
      { kind: "crystal", name: "白水晶", color: "#d9cbb2", x: 72, y: 66, rot: 14 },
      { kind: "bowl", name: "空香炉", color: "#c3a05e", x: 50, y: 76, rot: 0 },
    ]},
    B: { cloth: "#5b2f3a", items: [
      { kind: "mirror", name: "黑曜石镜", color: "#c3a05e", x: 72, y: 34, rot: 0 },
      { kind: "candle", name: "黄铜烛台", color: "#c3a05e", x: 26, y: 44, rot: -2 },
      { kind: "smoke", name: "鼠尾草", color: "#7c8a75", x: 50, y: 68, rot: 0 },
    ]},
    C: { cloth: "#4b523a", items: [
      { kind: "crystal", name: "白水晶", color: "#d9cbb2", x: 30, y: 62, rot: -12 },
      { kind: "bell", name: "银铃", color: "#c3a05e", x: 68, y: 40, rot: 0 },
      { kind: "pendulum", name: "灵摆", color: "#c3a05e", x: 60, y: 70, rot: 8 },
    ]},
  };

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    cloth = p.cloth;
    items = p.items.map((i) => ({ ...i, uid: uid(i.kind), scale: 1, z: 3, productId: null }));
    document.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b.dataset.preset === key));
    render(); save();
    UI.toast(`已载入预设 ${key}`, "success");
  }

  document.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => applyPreset(b.dataset.preset)));
  document.querySelector("[data-save]")?.addEventListener("click", () => { save(); UI.toast("布局已保存到本机", "success"); });
  document.querySelector("[data-clear]")?.addEventListener("click", async () => {
    const ok = await UI.confirm({ title: "清空桌面？", message: "器物会回到器物架，桌布保留。", confirmText: "清空" });
    if (!ok) return;
    items = []; selected = null; render(); save();
  });
  document.querySelector("[data-ambient]")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    if (!ambientOn) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) { const white = Math.random() * 2 - 1; last = (last + 0.02 * white) / 1.02; data[i] = last * 3.5; }
        const src = ctx.createBufferSource(); src.buffer = buffer; src.loop = true;
        const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 420;
        const gain = ctx.createGain(); gain.gain.value = 0.035;
        src.connect(filter).connect(gain).connect(ctx.destination); src.start();
        audio = { ctx, src, gain }; ambientOn = true;
        btn.textContent = "环境音 · 开"; btn.setAttribute("aria-pressed", "true");
      } catch (err) { UI.toast("浏览器没有允许音频", "error"); }
    } else {
      try { audio.src.stop(); audio.ctx.close(); } catch (e) { /* ignore */ }
      audio = null; ambientOn = false; btn.textContent = "环境音 · 关"; btn.setAttribute("aria-pressed", "false");
    }
  });

  renderRail();
  render();
})();
