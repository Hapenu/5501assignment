/* ============================================================
   lunar Journal · AI (BYOK, OpenAI-compatible)
   ============================================================ */
(function () {
  "use strict";
  const providers = {
    openai: { label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
    deepseek: { label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
    openrouter: { label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-4o-mini" },
    custom: { label: "自定义 / 其他兼容接口", baseUrl: "", model: "" },
  };

  const SYS = `你是「月相札记」的塔罗解读助手。你不是算命师，也不做命运断言。
你的工作是：根据用户的问题、牌阵位置、牌面与正逆位，给出有结构、可反思、可执行的解读。
规则：
1. 不提供医疗、法律、投资、心理诊断等专业建议；遇到这类问题，明确建议寻求专业人士。
2. 不使用“必然”“一定会”“命中注定”等绝对化表述；用“可能”“值得注意”“如果你愿意”等措辞。
3. 必须结合牌位解释，不能只复述牌义。
4. 语气安静、具体、克制，不堆砌玄学术语。
5. 输出四段，使用以下标题，不要额外开场白：
【牌面】2-3 句，指出牌阵里最值得注意的结构（元素、重复、正逆位、位置关系）。
【传统】2-3 句，从韦特体系解释核心牌义。
【心理】2-3 句，指出可能的投射、回避或内在冲突，并以一个问题收尾。
【行动】1-2 句，给一个今天能做的具体小动作。
总字数 350-550 字。`;

  function localCompose(reading) {
    const spread = window.CODEX.spreadById[reading.spreadId] || window.CODEX.spreads[0];
    const cards = reading.cards.map((c) => ({ ...c, card: window.CODEX.cardById[c.id] })).filter((c) => c.card);
    if (!cards.length) return "还没有抽牌。先完成一次抽牌，再生成解读。";
    const elements = {};
    cards.forEach((c) => { elements[c.card.element] = (elements[c.card.element] || 0) + 1; });
    const elemLine = Object.keys(elements).map((k) => `${k}${elements[k]}`).join("、");
    const revs = cards.filter((c) => c.rev).length;
    const main = cards[0];
    const mainPos = spread.positions[main.pos] ? spread.positions[main.pos].label : "核心";
    const mainCard = main.card;
    const lines = [];
    lines.push(`【牌面】这组牌里，${elemLine}的能量分布${revs ? `，其中 ${revs} 张逆位` : "，没有逆位"}。最值得先看的是「${mainPos}」位置的${mainCard.name}${main.rev ? "（逆位）" : ""}。`);
    lines.push(`【传统】${mainCard.name}在韦特体系里关于${mainCard.keywords.upright.slice(0, 2).join("、")}。${main.rev ? mainCard.meaning.reversed : mainCard.meaning.upright}`);
    const last = cards[cards.length - 1];
    lines.push(`【心理】${last.rev ? "最后一张牌是逆位，它可能指向一个你还没有完全承认的部分。" : "最后一张牌是正位，它把问题带回了一个可以选择的位置。"}${reading.question ? `你问的是「${reading.question}」，也许真正需要看见的不是答案，而是你在这个问题里反复回避的那个代价。` : "也许真正需要看见的不是答案，而是你反复回避的那个代价。"}如果只记一句话，你会记哪句？`);
    lines.push(`【行动】${mainCard.advice}`);
    return lines.join("\n\n");
  }

  function buildUserPrompt(reading) {
    const spread = window.CODEX.spreadById[reading.spreadId] || window.CODEX.spreads[0];
    const cards = reading.cards.map((c) => {
      const card = window.CODEX.cardById[c.id];
      const pos = spread.positions[c.pos] ? spread.positions[c.pos].label : `位置 ${c.pos + 1}`;
      return `- ${pos}：${card ? card.name : c.id}${c.rev ? "（逆位）" : "（正位）"}；关键词：${card ? (c.rev ? card.keywords.reversed : card.keywords.upright).join("、") : ""}`;
    }).join("\n");
    return `问题：${reading.question || "（未填写）"}\n牌阵：${spread.name}（${spread.count} 张）\n牌面：\n${cards}\n\n请按系统提示的四段格式输出。`;
  }

  async function request(cfg, key, messages, maxTokens = 700) {
    const base = (cfg.baseUrl || "").replace(/\/+$/, "");
    if (!base) throw new Error("还没有填写 Base URL。");
    if (!cfg.model) throw new Error("还没有填写模型名。");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          messages,
          temperature: 0.8,
          max_tokens: maxTokens,
        }),
      });
      if (!res.ok) {
        let detail = "";
        try { const j = await res.json(); detail = j.error && (j.error.message || j.error.code) || ""; } catch (e) { /* ignore */ }
        throw new Error(`接口返回 ${res.status}${detail ? "：" + detail : ""}`);
      }
      const data = await res.json();
      const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!text) throw new Error("接口没有返回文字内容。");
      return text.trim();
    } finally {
      clearTimeout(timer);
    }
  }

  async function generate(reading, opts = {}) {
    const key = window.Codex.getKey();
    const cfg = window.Codex.aiConfig();
    if (!key) {
      return { text: localCompose(reading), source: "local", reason: "no-key" };
    }
    if (!cfg.consent && !opts.skipConsent) {
      const err = new Error("NEED_CONSENT");
      err.code = "NEED_CONSENT";
      throw err;
    }
    try {
      const text = await request(cfg, key, [
        { role: "system", content: SYS },
        { role: "user", content: buildUserPrompt(reading) },
      ]);
      return { text, source: "ai", model: cfg.model };
    } catch (e) {
      const msg = e.name === "AbortError" ? "请求超时" : (e.message || "请求失败");
      return { text: localCompose(reading), source: "local", reason: msg, error: msg };
    }
  }

  async function test(cfg, key) {
    if (!key) return { ok: false, message: "请先填写 API Key。" };
    try {
      const text = await request({ ...cfg, model: cfg.model || providers[cfg.provider]?.model }, key, [
        { role: "system", content: "只回复两个字：可用" },
        { role: "user", content: "测试连接" },
      ], 12);
      return { ok: true, message: `连接成功：${text.slice(0, 20)}` };
    } catch (e) {
      const msg = e.name === "AbortError" ? "连接超时" : (e.message || "连接失败");
      const hint = /Failed to fetch|NetworkError|CORS/i.test(msg)
        ? "（可能是浏览器 CORS 限制；换支持直连的服务，或加一层转发）"
        : "";
      return { ok: false, message: msg + hint };
    }
  }

  window.Codex = window.Codex || {};
  window.Codex.AI = { providers, generate, test, localCompose, buildUserPrompt, SYS };
})();
