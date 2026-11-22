(function () {
  "use strict";
  const C = window.Codex;
  const UI = window.UI;
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const params = new URLSearchParams(location.search);

  let step = 1;
  let spreadId = params.get("spread") || "three-time";
  let spread = C.spread(spreadId);
  let selected = [];
  let drawn = [];
  let flipped = false;

  const stepEls = qsa("[data-step]");
  const indicators = qsa("[data-step-indicator]");
  function go(n) {
    step = n;
    stepEls.forEach((el) => el.classList.toggle("is-active", Number(el.dataset.step) === n));
    indicators.forEach((el) => {
      const k = Number(el.dataset.stepIndicator);
      el.classList.toggle("is-active", k === n);
      el.classList.toggle("is-done", k < n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------------- step 1 ----------------
  const q = qs("[data-question]");
  const qcount = qs("[data-qcount]");
  if (q) q.addEventListener("input", () => { if (qcount) qcount.textContent = q.value.length; });
  qsa("[data-prompts] .chip").forEach((b) => b.addEventListener("click", () => {
    const map = {
      "一段关系": "我和这个人的关系，最近为什么变得这么安静？",
      "一个选择": "在这两个选项之间，我真正害怕的是什么？",
      "一段时间": "接下来三个月，我最该把注意力放在哪里？",
      "一件卡住的事": "这件事卡住的真正原因是什么？",
    };
    q.value = map[b.textContent.trim()] || b.textContent.trim();
    q.dispatchEvent(new Event("input"));
  }));

  function renderSpreads() {
    const wrap = qs("[data-spread-choices]");
    wrap.innerHTML = window.CODEX.spreads.map((s) => `
      <button class="spread-option ${s.id === spreadId ? "is-active" : ""}" type="button" data-spread="${s.id}">
        <span class="ct">${s.count} 张</span>
        <span class="nm">${UI.escape(s.name)}</span>
        <span class="ds">${UI.escape(s.use)}</span>
      </button>`).join("");
    wrap.querySelectorAll("[data-spread]").forEach((b) => b.addEventListener("click", () => {
      spreadId = b.dataset.spread;
      spread = C.spread(spreadId);
      wrap.querySelectorAll("[data-spread]").forEach((x) => x.classList.toggle("is-active", x === b));
      updateDrawCopy();
    }));
  }
  renderSpreads();

  qs("[data-next-shuffle]").addEventListener("click", () => {
    go(2);
    updateShuffleHint();
  });

  // ---------------- step 2 ----------------
  const stage = qs("[data-shuffle-stage]");
  const cut = qs("[data-cut-stage]");
  const cutStackWrap = qs("[data-cut-stack-wrap]");
  const cutStack = qs("[data-cut-stack]");
  const stackCount = qs("[data-stack-count]");
  const stackHint = qs("[data-stack-hint]");
  const fanOut = qs("[data-fan-out]");
  const doShuffle = qs("[data-do-shuffle]");
  const skip = qs("[data-skip-fan]");
  const deckStack = qs("[data-deck]");
  let shuffled = false;
  let stacked = [];

  function updateShuffleHint() {
    if (!shuffled) {
      qs("[data-shuffle-hint]").textContent = "点牌堆或按钮洗牌。";
    } else if (stacked.length < 3) {
      qs("[data-shuffle-hint]").textContent = "按你的顺序点三叠，叠成一摞。";
    } else {
      qs("[data-shuffle-hint]").textContent = "叠好了，展开扇形。";
    }
  }

  function resetStack() {
    stacked = [];
    cutStackWrap.hidden = true;
    fanOut.hidden = true;
    if (cutStack) cutStack.dataset.count = "0";
    cutStack?.querySelectorAll(".card-back").forEach((el) => el.classList.remove("is-visible"));
    qsa("[data-cut]").forEach((b) => {
      b.classList.remove("is-stacked");
      b.removeAttribute("data-order");
      const badge = b.querySelector("[data-cut-order]");
      if (badge) badge.textContent = "";
    });
    if (stackCount) stackCount.textContent = "已叠 0 / 3";
    if (stackHint) stackHint.textContent = "按你的顺序点三叠，叠成一摞。";
  }

  function stackPile(n) {
    if (!shuffled || stacked.includes(n) || stacked.length >= 3) return;
    stacked.push(n);
    const pile = qs(`[data-cut="${n}"]`);
    if (pile) {
      pile.classList.add("is-stacked");
      pile.dataset.order = String(stacked.length);
      const badge = pile.querySelector("[data-cut-order]");
      if (badge) badge.textContent = String(stacked.length);
    }
    cutStackWrap.hidden = false;
    if (cutStack) cutStack.dataset.count = String(stacked.length);
    cutStack?.querySelectorAll(".card-back").forEach((el, i) => el.classList.toggle("is-visible", i < stacked.length));
    if (stackCount) stackCount.textContent = `已叠 ${stacked.length} / 3`;
    if (stacked.length === 3) {
      fanOut.hidden = false;
      if (stackHint) stackHint.textContent = "三叠已经叠成一摞。现在展开成扇形。";
      fanOut.focus();
    } else {
      if (stackHint) stackHint.textContent = `顺序已记下：${stacked.join(" → ")}。再点一叠。`;
    }
    updateShuffleHint();
  }

  doShuffle.addEventListener("click", () => {
    if (stage.classList.contains("is-shuffling")) return;
    if (!fanBuilt) deck = C.shuffle(window.CODEX.cards).slice(0, FAN_SIZE);
    resetStack();
    stage.classList.remove("is-cut");
    cut.classList.add("is-hidden");
    stage.classList.add("is-shuffling");
    doShuffle.disabled = true;
    setTimeout(() => {
      stage.classList.remove("is-shuffling");
      stage.classList.add("is-cut");
      shuffled = true;
      cut.classList.remove("is-hidden");
      doShuffle.textContent = "再洗一次";
      doShuffle.disabled = false;
      updateShuffleHint();
      qs("[data-cut]")?.focus();
    }, 1150);
  });

  qsa("[data-cut]").forEach((b) => b.addEventListener("click", () => stackPile(Number(b.dataset.cut))));
  fanOut.addEventListener("click", () => { buildFan(); go(3); });
  skip.addEventListener("click", () => { buildFan(); go(3); });
  deckStack?.addEventListener("click", () => doShuffle.click());
  deckStack?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doShuffle.click(); }
  });

  // ---------------- step 3 ----------------
  const FAN_SIZE = 36;
  let deck = C.shuffle(window.CODEX.cards).slice(0, FAN_SIZE);
  let fanBuilt = false;

  function buildFan() {
    if (fanBuilt) return;
    fanBuilt = true;
    const fan = qs("[data-fan]");
    const compact = window.innerWidth < 760;
    fan.classList.toggle("is-compact", compact);
    fan.innerHTML = '<div class="fan-base" aria-hidden="true"><span class="card-back"></span><span class="card-back"></span><span class="card-back"></span></div>' + deck.map((card, i) => {
      const mid = (deck.length - 1) / 2;
      const offset = i - mid;
      const rot = compact ? 0 : (offset * 5.0).toFixed(2) + "deg";
      const lift = compact ? 0 : 0;
      return `<button class="fan-card" type="button" data-card-index="${i}" aria-label="第 ${i + 1} 张牌" style="--i:${i};--rot:${rot};--lift:${lift}px;z-index:${i}"><span class="card-back"></span></button>`;
    }).join("");
    fan.querySelectorAll(".fan-card").forEach((b) => b.addEventListener("click", () => pick(Number(b.dataset.cardIndex), b)));
    updateDrawCopy();
  }

  function updateDrawCopy() {
    const t = qs("[data-draw-title]");
    const s = qs("[data-draw-sub]");
    if (t) t.textContent = `从扇形里抽出 ${spread.count} 张。`;
    if (s) s.textContent = spread.desc;
    qs("[data-draw-hint]").textContent = `已选择 ${selected.length} / ${spread.count}`;
  }

  function pick(index, btn) {
    if (selected.length >= spread.count || selected.includes(index)) return;
    selected.push(index);
    btn.classList.add("is-picked");
    btn.disabled = true;
    const card = deck[index];
    const rev = Math.random() < 0.32;
    drawn.push({ card, rev, pos: selected.length - 1 });
    renderDrawn();
    updateDrawCopy();
    if (selected.length >= spread.count) {
      qs("[data-flip]").hidden = false;
      qs("[data-flip]").classList.add("pulse");
      const t = qs("[data-draw-title]");
      const sub = qs("[data-draw-sub]");
      if (t) t.textContent = "牌已经抽好了。";
      if (sub) sub.textContent = "翻开牌面，看看它们落在什么位置。";
    }
  }

  function renderDrawn() {
    const row = qs("[data-drawn]");
    const step3 = qs('[data-step="3"]');
    if (step3) step3.classList.toggle("has-drawn", drawn.length >= spread.count);
    const caption = drawn.length ? `<div class="drawn-caption">你抽到的牌 · ${UI.escape(spread.name)}</div>` : "";
    row.innerHTML = caption + drawn.map((d, i) => {
      const pos = spread.positions[i] || { label: `位置 ${i + 1}` };
      if (!flipped) {
        return `<div class="drawn-slot"><div class="card-back"></div><div class="slot-label">${UI.escape(pos.label)}</div></div>`;
      }
      return `<div class="drawn-slot">${UI.tarotCard(d.card, { rev: d.rev, showName: false })}<div class="slot-label">${UI.escape(pos.label)}</div></div>`;
    }).join("");
  }

  qs("[data-flip]").addEventListener("click", () => {
    flipped = true;
    renderDrawn();
    qs("[data-flip]").hidden = true;
    qs("[data-to-reading]").hidden = false;
  });

  qs("[data-reset-draw]").addEventListener("click", () => {
    selected = []; drawn = []; flipped = false;
    qs('[data-step="3"]').classList.remove("has-drawn");
    qs("[data-drawn]").innerHTML = "";
    qs("[data-flip]").hidden = true;
    qs("[data-to-reading]").hidden = true;
    qs("[data-fan]").querySelectorAll(".fan-card").forEach((b) => { b.classList.remove("is-picked"); b.disabled = false; });
    updateDrawCopy();
    qs("[data-draw-title]").textContent = `从扇形里抽出 ${spread.count} 张。`;
    qs("[data-draw-sub]").textContent = spread.desc;
  });

  qs("[data-to-reading]").addEventListener("click", () => {
    const draft = {
      id: "r_" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      date: C.todayKey(),
      spreadId,
      question: (q.value || "").trim(),
      cards: drawn.map((d, i) => ({ id: d.card.id, rev: d.rev, pos: i })),
      mood: "", note: "", aiText: "", privacy: "private", shared: false, source: "draw",
    };
    try { sessionStorage.setItem("moonphase.draft", JSON.stringify(draft)); } catch (e) { /* ignore */ }
    location.href = "reading.html";
  });

  updateDrawCopy();
})();
