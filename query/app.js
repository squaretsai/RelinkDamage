const state = {
  view: "sigils",
  selectedCharacterId: RELINK_CHARACTER_SIGILS.characters[0]?.id ?? "",
  selectedDamageCharacterId: getDamageData()?.characters[0]?.id ?? "",
  search: "",
  sigilFilter: "all",
  dropSources: new Set(["clear", "chest", "rank", "sub_mission"]),
};

const suggestionState = {
  items: [],
  activeIndex: -1,
};

const els = {
  tabs: document.querySelector("#characterTabs"),
  grid: document.querySelector("#resultGrid"),
  title: document.querySelector("#selectedTitle"),
  meta: document.querySelector("#selectedMeta"),
  search: document.querySelector("#searchInput"),
  suggestions: document.querySelector("#searchSuggestions"),
  sourceNotice: document.querySelector("#sourceNotice"),
  stats: document.querySelector("#stats"),
  viewButtons: [...document.querySelectorAll(".view-button")],
  sigilFilters: document.querySelector("#sigilFilters"),
  sigilFilterButtons: [...document.querySelectorAll("[data-sigil-filter]")],
  dropFilters: document.querySelector("#dropFilters"),
  dropFilterInputs: [...document.querySelectorAll("#dropFilters input")],
};

const QUEST_TARGET_BY_ID = {
  401306: "獸人頭目",
  402302: "沙漠巨像",
  404313: "火山巨像",
  405206: "伽藍薩",
  405207: "瑪姬拉芙莉爾",
  405208: "伊度",
  406337: "伊度",
  406338: "巴哈姆特系",
  407101: "伊度 / 巴哈姆特系",
  407318: "原初巴哈姆特",
  407320: "路西法",
  407321: "路西法 Zero",
  407322: "貝西摩斯",
};

const QUEST_TARGET_RULES = [
  [/伊度|general investigation: id|id bears/i, "伊度"],
  [/伽藍薩|gallanza/i, "伽藍薩"],
  [/瑪姬拉芙|maglielle/i, "瑪姬拉芙莉爾"],
  [/白狼|silver wolf|wolf/i, "白狼兵團"],
  [/刃重|veil/i, "刃重眾"],
  [/神狼/i, "神狼"],
  [/嵐神|furycane|storm/i, "嵐神"],
  [/炎神|fire/i, "炎神"],
  [/雷電|thunder/i, "雷電系目標"],
  [/霧冰|frost|rime|ice/i, "冰霜系目標"],
  [/地絕|earth|grounded/i, "大地系目標"],
  [/紅蓮|conflagration|blazing/i, "火焰系目標"],
  [/巨像|golem/i, "巨像"],
  [/鎧甲|armor/i, "鎧甲"],
  [/哥布林|goblin/i, "哥布林"],
  [/史萊姆|slime/i, "史萊姆"],
  [/獅鷲|griffin/i, "獅鷲獸"],
  [/眼球|eye/i, "眼球"],
  [/骸骨|corpse|bone/i, "骸骨系目標"],
  [/吐息|wings/i, "龍"],
  [/戰艦|automagod|machine/i, "機械系目標"],
  [/魔種|forest|seed/i, "魔物群"],
  [/奈落|abyss/i, "奈落系目標"],
  [/巴哈姆特|bahamut/i, "巴哈姆特系"],
  [/路西法|lucilius|zero|final vision/i, "路西法"],
];

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getDamageData() {
  return typeof RELINK_DAMAGE_CALCULATOR === "undefined" ? null : RELINK_DAMAGE_CALCULATOR;
}

function splitSearchTokens(value) {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function characterAvatarPath(character) {
  return `./assets/characters/${character.id}.png`;
}

function sigilIconPath(sigil) {
  return `./assets/sigils/${sigil.type === "warpath" ? "warpath" : "unique"}.png`;
}

function candidateSearchText(parts) {
  return normalizeText(parts.filter(Boolean).join(" "));
}

function questTarget(entry) {
  const explicit = QUEST_TARGET_BY_ID[String(entry.questId ?? "")];
  if (explicit) return explicit;

  const text = [entry.questZh, entry.questEn, ...(entry.questAliases ?? [])].filter(Boolean).join(" ");
  const rule = QUEST_TARGET_RULES.find(([pattern]) => pattern.test(text));
  return rule?.[1] ?? "待補";
}

function scoreSuggestion(candidate, tokens) {
  if (tokens.length === 0) return -1;

  let score = 0;
  const label = normalizeText(candidate.label);
  const value = normalizeText(candidate.value);

  for (const token of tokens) {
    if (!candidate.searchText.includes(token)) return -1;
    if (label === token || value === token) score += 120;
    else if (label.startsWith(token) || value.startsWith(token)) score += 70;
    else score += 15;
  }

  return score + candidate.priority;
}

function buildSigilSuggestions() {
  const candidates = [];

  for (const character of RELINK_CHARACTER_SIGILS.characters) {
    candidates.push({
      type: "角色",
      label: character.nameZh || character.nameEn,
      meta: character.nameEn,
      value: character.nameZh || character.nameEn,
      priority: 25,
      searchText: candidateSearchText([character.nameZh, character.nameEn, character.roleZh]),
    });

    for (const sigil of character.sigils) {
      candidates.push({
        type: "因子",
        label: sigil.nameZh || sigil.nameEn,
        meta: `${character.nameZh || character.nameEn} / ${sigil.nameEn}`,
        value: sigil.nameZh || sigil.nameEn,
        priority: sigil.type === "warpath" ? 18 : 12,
        searchText: candidateSearchText([
          sigil.nameZh,
          sigil.nameEn,
          sigil.typeZh,
          sigil.descriptionZh,
          sigil.notesZh,
          sigil.acquisitionZh,
          character.nameZh,
          character.nameEn,
          ...(sigil.values ?? []),
        ]),
      });
    }
  }

  return candidates;
}

function buildDropSuggestions() {
  const candidates = [];
  const questSeen = new Set();

  for (const item of RELINK_DROP_SEARCH.items) {
    candidates.push({
      type: "物品",
      label: item.nameZh || item.nameEn,
      meta: item.nameZh ? item.nameEn : "英文名稱",
      value: item.nameZh || item.nameEn,
      priority: item.translationSource === "official" ? 28 : 18,
      searchText: candidateSearchText([item.nameZh, item.nameEn, item.id, item.hash, ...(item.aliases ?? [])]),
    });

    for (const entry of item.entries) {
      const questName = entry.questZh || entry.questEn;
      const key = `${entry.questId || ""}:${questName}`;
      if (!questName || questSeen.has(key)) continue;
      questSeen.add(key);

      candidates.push({
        type: "任務",
        label: questName,
        meta: [entry.difficultyZh, questTarget(entry), entry.questEn].filter(Boolean).join(" / "),
        value: questName,
        priority: entry.questZh ? 20 : 8,
        searchText: candidateSearchText([
          entry.questZh,
          entry.questEn,
          entry.questId,
          entry.difficulty,
          questTarget(entry),
          ...(entry.questAliases ?? []),
        ]),
      });
    }
  }

  return candidates;
}

function buildDamageSuggestions() {
  const damageData = getDamageData();
  if (!damageData) return [];

  const candidates = [];

  for (const character of damageData.characters) {
    candidates.push({
      type: "角色",
      label: character.nameZh,
      meta: `${character.skillRows.length} 筆倍率資料`,
      value: character.nameZh,
      priority: 32,
      damageCharacterId: character.id,
      searchText: candidateSearchText([character.nameZh, character.id]),
    });

    for (const row of character.skillRows) {
      const label = [row.skill, row.modifier].filter(Boolean).join(" / ") || "未命名技能";
      candidates.push({
        type: "技能",
        label,
        meta: `${character.nameZh} / ${row.classification || "未分類"}`,
        value: row.skill || row.modifier || character.nameZh,
        priority: 14,
        damageCharacterId: character.id,
        searchText: candidateSearchText([
          character.nameZh,
          character.id,
          row.skill,
          row.modifier,
          row.multiplier,
          row.damageCap,
          row.classification,
          row.notes,
        ]),
      });
    }
  }

  return candidates;
}

function buildSearchSuggestions(query) {
  const tokens = splitSearchTokens(query);
  const candidates =
    state.view === "drops" ? buildDropSuggestions() : state.view === "damage" ? buildDamageSuggestions() : buildSigilSuggestions();

  return candidates
    .map((candidate) => ({ ...candidate, score: scoreSuggestion(candidate, tokens) }))
    .filter((candidate) => candidate.score >= 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "zh-Hant"))
    .slice(0, 12);
}

function hideSearchSuggestions() {
  suggestionState.items = [];
  suggestionState.activeIndex = -1;
  els.suggestions.hidden = true;
  els.suggestions.innerHTML = "";
  els.search.setAttribute("aria-expanded", "false");
}

function updateActiveSuggestion(index) {
  suggestionState.activeIndex = index;
  els.suggestions.querySelectorAll(".suggestion-option").forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function selectSuggestion(index) {
  const suggestion = suggestionState.items[index];
  if (!suggestion) return;

  state.search = suggestion.value;
  if (suggestion.damageCharacterId) state.selectedDamageCharacterId = suggestion.damageCharacterId;
  els.search.value = suggestion.value;
  hideSearchSuggestions();
  render();
}

function renderSearchSuggestions() {
  const query = els.search.value.trim();
  if (!query) {
    hideSearchSuggestions();
    return;
  }

  suggestionState.items = buildSearchSuggestions(query);
  suggestionState.activeIndex = suggestionState.items.length ? 0 : -1;

  if (suggestionState.items.length === 0) {
    hideSearchSuggestions();
    return;
  }

  els.suggestions.hidden = false;
  els.search.setAttribute("aria-expanded", "true");
  els.suggestions.innerHTML = suggestionState.items
    .map((suggestion, index) => {
      const active = index === suggestionState.activeIndex ? " active" : "";
      return `
        <button class="suggestion-option${active}" type="button" role="option" aria-selected="${index === suggestionState.activeIndex}" data-index="${index}">
          <span class="suggestion-copy">
            <strong>${escapeHtml(suggestion.label)}</strong>
            <small>${escapeHtml(suggestion.meta)}</small>
          </span>
          <span class="suggestion-type">${escapeHtml(suggestion.type)}</span>
        </button>
      `;
    })
    .join("");

  els.suggestions.querySelectorAll(".suggestion-option").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => selectSuggestion(Number(button.dataset.index)));
  });
}

function moveSearchSuggestion(delta) {
  if (els.suggestions.hidden || suggestionState.items.length === 0) return;
  const nextIndex = (suggestionState.activeIndex + delta + suggestionState.items.length) % suggestionState.items.length;
  updateActiveSuggestion(nextIndex);
}

function sourceLinks(sources) {
  return sources
    .map((source) => {
      if (source.url.startsWith("local:")) return `<span>${escapeHtml(source.label)}</span>`;
      return `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>`;
    })
    .join("、");
}

function getAllSigils() {
  return RELINK_CHARACTER_SIGILS.characters.flatMap((character) =>
    character.sigils.map((sigil) => ({ ...sigil, character }))
  );
}

function matchesSigilFilter(sigil) {
  if (state.sigilFilter === "warpath") return sigil.type === "warpath";
  if (state.sigilFilter === "needs-review") return sigil.translationStatus !== "official";
  return true;
}

function matchesSigilSearch(sigil) {
  const query = normalizeText(state.search);
  if (!query) return true;

  const haystack = normalizeText([
    sigil.nameEn,
    sigil.nameZh,
    sigil.descriptionZh,
    sigil.notesZh,
    sigil.typeZh,
    sigil.values.join(" "),
    sigil.character.nameEn,
    sigil.character.nameZh,
  ].join(" "));

  return haystack.includes(query);
}

function getVisibleCharacters() {
  return RELINK_CHARACTER_SIGILS.characters
    .map((character) => {
      const sigils = character.sigils
        .map((sigil) => ({ ...sigil, character }))
        .filter(matchesSigilFilter)
        .filter(matchesSigilSearch);

      return { ...character, sigils };
    })
    .filter((character) => character.sigils.length > 0);
}

function ensureSelectedCharacter(characters) {
  if (characters.some((character) => character.id === state.selectedCharacterId)) return;
  state.selectedCharacterId = characters[0]?.id ?? "";
}

function renderSigilTabs(characters) {
  els.tabs.hidden = false;
  els.tabs.innerHTML = characters
    .map((character) => {
      const active = character.id === state.selectedCharacterId ? " active" : "";
      return `
        <button class="tab-button${active}" type="button" data-character-id="${character.id}">
          <img class="tab-avatar" src="${characterAvatarPath(character)}" alt="" loading="lazy" />
          <span class="tab-name">${escapeHtml(character.nameZh)}<br><small>${escapeHtml(character.nameEn)}</small></span>
          <span class="tab-count">${character.sigils.length}</span>
        </button>
      `;
    })
    .join("");

  els.tabs.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCharacterId = button.dataset.characterId;
      render();
    });
  });
}

function renderSigilCards(characters) {
  const selected = characters.find((character) => character.id === state.selectedCharacterId);

  if (!selected) {
    els.title.textContent = "沒有符合條件的資料";
    els.meta.textContent = "調整搜尋或篩選條件";
    els.grid.innerHTML = `<div class="empty-state">目前沒有符合條件的專屬因子。</div>`;
    return;
  }

  els.title.textContent = selected.nameZh;
  els.meta.textContent = `${selected.nameEn} / ${selected.roleZh}`;

  els.grid.className = "sigil-grid";
  els.grid.innerHTML = selected.sigils
    .map((sigil) => {
      const statusText = sigil.translationStatus === "official" ? "官方譯名" : "待官方校正";
      const reviewClass = sigil.translationStatus === "official" ? "" : " review";
      const values = sigil.values.map((value) => `<li class="value-pill">${escapeHtml(value)}</li>`).join("");

      return `
        <article class="sigil-card">
          <div class="sigil-head">
            <div class="sigil-name-row">
              <img class="sigil-icon" src="${sigilIconPath(sigil)}" alt="" loading="lazy" />
              <h3 class="sigil-title">
                ${escapeHtml(sigil.nameZh)}
                <small>${escapeHtml(sigil.nameEn)}</small>
              </h3>
            </div>
            <span class="badge${reviewClass}">${statusText}</span>
          </div>
          <p class="description">${sigil.descriptionZh}</p>
          <ul class="value-list">${values}</ul>
          <div class="meta-list">
            <span>分類：${escapeHtml(sigil.typeZh)}</span>
            <span>最大等級：${escapeHtml(sigil.maxLevel)}</span>
            <span>取得：${escapeHtml(sigil.acquisitionZh)}</span>
            ${sigil.notesZh ? `<span>備註：${escapeHtml(sigil.notesZh)}</span>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSigils() {
  const visibleCharacters = getVisibleCharacters();
  ensureSelectedCharacter(visibleCharacters);
  const allSigils = getAllSigils();

  els.stats.innerHTML = `
    <span><strong>${RELINK_CHARACTER_SIGILS.characters.length}</strong> 角色</span>
    <span><strong>${allSigils.length}</strong> 因子</span>
    <span><strong>${allSigils.filter((sigil) => sigil.type === "warpath").length}</strong> 戰氣</span>
  `;
  els.sourceNotice.innerHTML =
    `資料狀態：${escapeHtml(RELINK_CHARACTER_SIGILS.meta.translationPolicy)} ` +
    `主要參考：${sourceLinks(RELINK_CHARACTER_SIGILS.sources)}。最後整理：${escapeHtml(RELINK_CHARACTER_SIGILS.meta.lastUpdated)}。`;

  renderSigilTabs(visibleCharacters);
  renderSigilCards(visibleCharacters);
}

function dropSearchText(item) {
  return normalizeText([
    item.nameEn,
    item.nameZh,
    item.id,
    item.hash,
    ...(item.aliases ?? []),
    ...item.entries.flatMap((entry) => [
      entry.questEn,
      entry.questZh,
      entry.questId,
      entry.difficulty,
      entry.sourceZh,
      questTarget(entry),
      ...(entry.questAliases ?? []),
    ]),
  ].join(" "));
}

const dropSearchCache = new WeakMap();

function getDropSearchText(item) {
  if (!dropSearchCache.has(item)) dropSearchCache.set(item, dropSearchText(item));
  return dropSearchCache.get(item);
}

function activeDropEntries(item) {
  return item.entries.filter((entry) => state.dropSources.has(entry.source));
}

function scoreDropItem(item, tokens) {
  if (tokens.length === 0) return 0;
  const searchText = getDropSearchText(item);
  const names = [item.nameZh, item.nameEn, ...(item.aliases ?? [])].filter(Boolean).map(normalizeText);
  let score = 0;

  for (const token of tokens) {
    if (!searchText.includes(token)) return -1;
    if (names.some((name) => name === token)) score += 120;
    else if (names.some((name) => name.startsWith(token))) score += 60;
    else score += 10;
  }

  const bestRate = Math.max(...item.entries.map((entry) => entry.rate ?? 0), 0);
  return score + Math.min(bestRate, 100) / 10;
}

function formatRate(entry) {
  if (entry.rate === null || entry.rate === undefined) return "未知";
  return `${entry.rate}%`;
}

function formatQuantity(entry) {
  if (!entry.quantity) return "";
  return `x${entry.quantity}`;
}

function renderDropCard(item, entries) {
  const translationBadge = item.translationSource === "official" ? "官方物品名" : item.translationSource === "imported" ? "匯入翻譯" : "英文暫用";
  const aliases = [...new Set(item.aliases ?? [])].slice(0, 8);

  return `
    <article class="drop-card">
      <div class="sigil-head">
        <h3 class="sigil-title">
          ${escapeHtml(item.nameZh || item.nameEn)}
          <small>${item.nameZh ? escapeHtml(item.nameEn) : "尚無繁中名稱"}</small>
        </h3>
        <span class="badge${item.translationSource === "official" ? "" : " review"}">${translationBadge}</span>
      </div>
      ${aliases.length ? `<div class="alias-row">${aliases.map((alias) => `<span>${escapeHtml(alias)}</span>`).join("")}</div>` : ""}
      <div class="drop-entry-list">
        ${entries.slice(0, 18).map(renderDropEntry).join("")}
        ${entries.length > 18 ? `<div class="entry-note">另有 ${entries.length - 18} 筆結果，可縮小搜尋條件。</div>` : ""}
      </div>
    </article>
  `;
}

function renderDropEntry(entry) {
  const questName = entry.questZh || entry.questEn;
  const questEn = entry.questZh ? entry.questEn : "";
  const target = questTarget(entry);
  const detail = [
    entry.sourceZh,
    entry.rank ? `Rank ${entry.rank}` : "",
    entry.lot ? `Lot #${entry.lot}` : "",
    entry.condition ? `條件：${entry.condition}` : "",
  ].filter(Boolean).join(" / ");

  return `
    <div class="drop-entry">
      <div>
        <div class="quest-name">${escapeHtml(questName)}</div>
        <div class="quest-en">${escapeHtml(questEn)}</div>
      </div>
      <div class="drop-target">
        <span>主要目標</span>
        <strong class="${target === "待補" ? "needs-review" : ""}">${escapeHtml(target)}</strong>
      </div>
      <div class="drop-difficulty">${escapeHtml(entry.difficultyZh)}</div>
      <div class="drop-detail">${escapeHtml(detail)}</div>
      <div class="drop-rate">
        <strong>${escapeHtml(formatRate(entry))}</strong>
        <span>${escapeHtml(formatQuantity(entry))}</span>
      </div>
    </div>
  `;
}

function renderDrops() {
  els.tabs.hidden = true;
  els.tabs.innerHTML = "";
  els.title.textContent = "掉落查詢";
  els.meta.textContent = `Nenkai drop data ${RELINK_DROP_SEARCH.meta.version} / 任務譯名待驗證`;
  els.stats.innerHTML = `
    <span><strong>${RELINK_DROP_SEARCH.meta.itemsCount}</strong> 物品</span>
    <span><strong>${RELINK_DROP_SEARCH.meta.entriesCount}</strong> 掉落</span>
    <span><strong>${RELINK_DROP_SEARCH.meta.questsCount}</strong> 任務</span>
  `;
  els.sourceNotice.innerHTML =
    `資料狀態：附件資料可用，已保留原始匯入檔；物品與任務名稱優先套用官方繁中。` +
    `目前僅有 ${RELINK_DROP_SEARCH.meta.fallbackQuestNames} 筆掉落入口使用未命名任務 ID。來源：` +
    RELINK_DROP_SEARCH.meta.credits.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.name)}</a>`).join("、") +
    "。";

  const tokens = normalizeText(state.search).split(/\s+/).filter(Boolean);
  let matches = RELINK_DROP_SEARCH.items
    .map((item) => ({ item, entries: activeDropEntries(item), score: scoreDropItem(item, tokens) }))
    .filter((row) => row.entries.length > 0 && row.score >= 0);

  if (tokens.length === 0) matches = [];
  else matches.sort((a, b) => b.score - a.score || a.item.nameEn.localeCompare(b.item.nameEn));

  els.grid.className = "drop-grid";
  if (tokens.length === 0) {
    els.grid.innerHTML = `<div class="empty-state">輸入素材、因子或任務名稱開始查詢，例如「銀天」「Damage Cap V+」「巴哈姆特」。</div>`;
    return;
  }

  if (matches.length === 0) {
    els.grid.innerHTML = `<div class="empty-state">沒有符合條件的掉落資料。可以切換左側掉落來源，或改用英文名稱搜尋。</div>`;
    return;
  }

  els.grid.innerHTML = matches.slice(0, 80).map((row) => renderDropCard(row.item, row.entries)).join("");
}

function formatDamageNumber(value, options = {}) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value !== "number") return String(value);
  if (options.percent) return `${(value * 100).toFixed(value < 0.1 ? 2 : 1)}%`;
  return value.toLocaleString("zh-TW", { maximumFractionDigits: options.digits ?? 2 });
}

function getDamageRows() {
  const damageData = getDamageData();
  if (!damageData) return [];

  return damageData.characters.flatMap((character) =>
    character.skillRows.map((row) => ({ ...row, character }))
  );
}

function damageRowSearchText(row) {
  return normalizeText([
    row.character.nameZh,
    row.character.id,
    row.skill,
    row.modifier,
    row.multiplier,
    row.damageCap,
    row.cooldown,
    row.classification,
    row.notes,
  ].join(" "));
}

function renderDamageTabs(characters) {
  els.tabs.hidden = false;
  els.tabs.innerHTML = characters
    .map((character) => {
      const active = character.id === state.selectedDamageCharacterId ? " active" : "";
      return `
        <button class="tab-button${active}" type="button" data-damage-character-id="${character.id}">
          <img class="tab-avatar" src="${characterAvatarPath(character)}" alt="" loading="lazy" />
          <span class="tab-name">${escapeHtml(character.nameZh)}<br><small>${character.skillRows.length} 筆技能資料</small></span>
          <span class="tab-count">${character.skillRows.length}</span>
        </button>
      `;
    })
    .join("");

  els.tabs.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDamageCharacterId = button.dataset.damageCharacterId;
      render();
    });
  });
}

function renderDamageCard(row) {
  const title = row.skill || row.modifier || "未命名技能";
  const subtitle = row.skill && row.modifier ? row.modifier : row.character.nameZh;
  const contribution = typeof row.contribution === "number" ? formatDamageNumber(row.contribution, { percent: true }) : row.contribution;

  return `
    <article class="damage-card">
      <div class="damage-head">
        <img class="damage-avatar" src="${characterAvatarPath(row.character)}" alt="" loading="lazy" />
        <h3 class="sigil-title">
          ${escapeHtml(title)}
          <small>${escapeHtml(`${row.character.nameZh} / ${subtitle}`)}</small>
        </h3>
        <span class="badge">${escapeHtml(row.classification || "未分類")}</span>
      </div>
      <div class="damage-metrics">
        <span>倍率<strong>${escapeHtml(formatDamageNumber(row.multiplier))}</strong></span>
        <span>DMG Cap<strong>${escapeHtml(formatDamageNumber(row.damageCap, { digits: 0 }))}</strong></span>
        <span>CD<strong>${escapeHtml(formatDamageNumber(row.cooldown))}</strong></span>
        <span>占比<strong>${escapeHtml(formatDamageNumber(contribution))}</strong></span>
      </div>
      ${row.notes ? `<p class="damage-note">${escapeHtml(row.notes)}</p>` : ""}
    </article>
  `;
}

function formatSnapshotValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "ON" : "OFF";
  if (typeof value === "number" && value > 0 && value <= 1) return `${Math.round(value * 100)}%`;
  return formatDamageNumber(value, { digits: 0 });
}

function renderSnapshotList(items, options = {}) {
  return items
    .filter((item) => item && item.label !== "Other Inputs")
    .map((item) => {
      const value = options.level
        ? `Lv.${formatSnapshotValue(item.level)}${item.maxLevel ? ` / ${formatSnapshotValue(item.maxLevel)}` : ""}`
        : formatSnapshotValue(item.value);
      return `<li><span>${escapeHtml(item.label || item.trait)}</span><strong>${escapeHtml(value)}</strong></li>`;
    })
    .join("");
}

function renderCalculatorSnapshot() {
  const damageData = getDamageData();
  if (!damageData) return "";

  const snapshot = damageData.calculator;
  const sigils = snapshot.sigils
    .slice(0, 12)
    .map((sigil) => {
      const sub = sigil.sub && sigil.sub !== "None" ? ` / ${sigil.sub}` : "";
      return `<li><span>${escapeHtml(sigil.main || "None")}${escapeHtml(sub)}</span><strong>Lv.${escapeHtml(formatDamageNumber(sigil.level, { digits: 0 }))}</strong></li>`;
    })
    .join("");
  const limitBreak = renderSnapshotList(snapshot.limitBreak);
  const otherInputs = renderSnapshotList(snapshot.otherInputs);
  const damageTraits = renderSnapshotList(snapshot.damageTraits.filter((trait) => trait.level), { level: true });
  const supportTraits = renderSnapshotList(snapshot.supportTraits.filter((trait) => trait.level), { level: true });

  return `
    <section class="calculator-snapshot">
      <div class="snapshot-title">
        <p class="eyebrow">Calculator Snapshot</p>
        <h3>${escapeHtml(snapshot.character || "未指定角色")}</h3>
        <p>來源試算表匯出時的預設配置，先用來查詢與對照。</p>
      </div>
      <div class="snapshot-panel wide">
        <h4>預設因子</h4>
        <ul>${sigils}</ul>
      </div>
      <div class="snapshot-panel">
        <h4>限界突破</h4>
        <ul>${limitBreak}</ul>
      </div>
      <div class="snapshot-panel">
        <h4>其他輸入</h4>
        <ul>${otherInputs}</ul>
      </div>
      <div class="snapshot-panel">
        <h4>已啟用傷害因子</h4>
        <ul>${damageTraits || "<li><span>無</span><strong>—</strong></li>"}</ul>
      </div>
      <div class="snapshot-panel">
        <h4>已啟用輔助因子</h4>
        <ul>${supportTraits || "<li><span>無</span><strong>—</strong></li>"}</ul>
      </div>
    </section>
  `;
}

function renderDamage() {
  const damageData = getDamageData();
  if (!damageData) {
    els.tabs.hidden = true;
    els.tabs.innerHTML = "";
    els.title.textContent = "傷害計算資料";
    els.meta.textContent = "資料尚未載入";
    els.stats.innerHTML = "";
    els.sourceNotice.textContent = "找不到 data/damage-calculator.js，請重新整理頁面或重新產生資料檔。";
    els.grid.className = "damage-grid";
    els.grid.innerHTML = `<div class="empty-state">傷害資料尚未載入，但其他分頁仍可使用。</div>`;
    return;
  }

  const characters = damageData.characters;
  if (!characters.some((character) => character.id === state.selectedDamageCharacterId)) {
    state.selectedDamageCharacterId = characters[0]?.id ?? "";
  }

  renderDamageTabs(characters);
  els.title.textContent = "傷害計算資料";
  els.meta.textContent = `${damageData.meta.sourceName} / ${damageData.meta.characterCount} 位角色`;
  els.stats.innerHTML = `
    <span><strong>${damageData.meta.characterCount}</strong> 角色</span>
    <span><strong>${damageData.meta.skillRowCount}</strong> 技能列</span>
    <span><strong>${damageData.calculator.character || "—"}</strong> 預設快照</span>
  `;
  els.sourceNotice.innerHTML =
    `資料來源：<a href="${damageData.meta.sourceUrl}" target="_blank" rel="noreferrer">${escapeHtml(damageData.meta.sourceName)}</a>。` +
    `目前先匯入角色技能倍率與 DMG Cap，完整公式互動化會分階段處理。`;

  const tokens = splitSearchTokens(state.search);
  let rows;

  if (tokens.length > 0) {
    rows = getDamageRows().filter((row) => tokens.every((token) => damageRowSearchText(row).includes(token)));
  } else {
    const selected = characters.find((character) => character.id === state.selectedDamageCharacterId);
    rows = selected ? selected.skillRows.map((row) => ({ ...row, character: selected })) : [];
  }

  els.grid.className = "damage-grid";
  if (rows.length === 0) {
    els.grid.innerHTML = `<div class="empty-state">沒有符合條件的傷害資料。</div>`;
    return;
  }

  els.grid.innerHTML = `${renderCalculatorSnapshot()}${rows.slice(0, 120).map(renderDamageCard).join("")}`;
}

function syncControls() {
  els.viewButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  els.sigilFilters.hidden = state.view !== "sigils";
  els.dropFilters.hidden = state.view !== "drops";
}

function render() {
  syncControls();
  if (state.view === "drops") renderDrops();
  else if (state.view === "damage") renderDamage();
  else renderSigils();
}

els.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
  renderSearchSuggestions();
});

els.search.addEventListener("focus", renderSearchSuggestions);

els.search.addEventListener("blur", () => {
  window.setTimeout(hideSearchSuggestions, 120);
});

els.search.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (els.suggestions.hidden) renderSearchSuggestions();
    else moveSearchSuggestion(1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveSearchSuggestion(-1);
    return;
  }

  if (event.key === "Enter" && !els.suggestions.hidden && suggestionState.activeIndex >= 0) {
    event.preventDefault();
    selectSuggestion(suggestionState.activeIndex);
    return;
  }

  if (event.key === "Escape") {
    hideSearchSuggestions();
  }
});

els.viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    render();
    if (document.activeElement === els.search) renderSearchSuggestions();
    else hideSearchSuggestions();
  });
});

els.sigilFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.sigilFilter = button.dataset.sigilFilter;
    els.sigilFilterButtons.forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

els.dropFilterInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) state.dropSources.add(input.value);
    else state.dropSources.delete(input.value);
    render();
  });
});

render();
