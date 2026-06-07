const DATA = RELINK_DAMAGE_CALCULATOR;
const NONE = "None";
const PRESET_STORAGE_KEYS = {
  endpoint: "relinkDamagePresetEndpoint",
  secret: "relinkDamagePresetSecret",
};
const ZETA_DEFAULT_VERIFICATION = {
  checked: 49,
  matched: 49,
  skipped: ["千炎 / burn：敵人最大 HP 1.5%，Excel 匯出結果為 #VALUE!"],
};
const CHARACTER_BASE_STATS = {
  "蘇恩": { attack: 10324, critRate: 50, critDamage: 100 },
};
const CHARACTER_EXTRA_DEFAULTS = {
  "團長": [
    ["Class Lv", 0],
  ],
  "瑟塔": [
    ["阿爾貝斯．菲爾瑪雷?", true],
    ["戰氣?", true],
  ],
  "伊歐": [
    ["重力場", true],
  ],
  "蘿賽塔": [
    ["薔薇Lv", 0],
  ],
  "剛特克澤": [
    ["古今無雙劉Lv", 0],
  ],
  "娜魯梅亞": [
    ["蝴蝶數量", 0],
  ],
  "蘇恩": [
    ["觸發專屬?", true],
  ],
  "席耶提": [
    ["劍神召喚?", true],
  ],
};
const VERIFIED_CHARACTERS = new Set([
  "瑟塔",
  "伊歐",
  "蘭斯洛特",
  "卡莉歐斯托蘿",
  "尤金",
  "蘇恩",
  "夏綠蒂",
]);

const sigils = DATA.sigils ?? [];
const DISPLAY_ONLY_TRAITS = new Set([
  "防禦性能",
  "逆襲（防禦）",
  "淨癒再生",
]);
const sigilByName = new Map(sigils.map((sigil) => [sigil.name, sigil]));

function ensureDisplayOnlyTrait(name, maxLevel = 15) {
  if (sigilByName.has(name)) return name;
  const template = sigilByName.get(NONE) ?? {};
  const sigil = {
    name,
    icon: template.icon,
    iconLocal: template.iconLocal,
    color: "Blue",
    secondaryRule: "OrangeGrayCritRedPurpleBlueNone",
    maxLevel,
    displayOnly: true,
  };
  sigils.push(sigil);
  sigilByName.set(name, sigil);
  return name;
}
const mainOnlyTraitNames = new Set(
  [
    ...(DATA.calculator?.damageTraits ?? []),
    ...(DATA.calculator?.supportTraits ?? []),
  ]
    .filter((item) => typeof item.level === "boolean")
    .map((item) => item.trait),
);
const defaultCharacter =
  DATA.characters.find((character) => character.nameZh === DATA.calculator?.character) ??
  DATA.characters[0];

const state = {
  characterId: defaultCharacter?.id ?? "",
  selectedRowIndex: 0,
  search: "",
  skillFilter: "",
  damagePercentMin: "",
  damagePercentMax: "",
  tableMode: "full",
  base: {
    attack: Number(DATA.calculator?.baseStats?.attack) || 12396,
    critRate: Math.round((Number(DATA.calculator?.baseStats?.critRate) || 0.5) * 100),
    critDamage: Math.round((Number(DATA.calculator?.baseStats?.critDamage) || 1) * 100),
    manualDamage: 0,
  },
  build: makeDefaultBuild(),
  weapon: makeWeaponState(),
  limitBreak: makeLimitBreakState(),
  other: makeOtherState(),
  characterExtras: makeCharacterExtraState(),
  presetList: [],
};

const els = {
  search: document.querySelector("#searchInput"),
  characterPickerButton: document.querySelector("#characterPickerButton"),
  characterPickerMenu: document.querySelector("#characterPickerMenu"),
  sourceMeta: document.querySelector("#sourceMeta"),
  characterName: document.querySelector("#characterName"),
  characterMeta: document.querySelector("#characterMeta"),
  characterAvatar: document.querySelector("#characterAvatar"),
  sigilSlots: document.querySelector("#sigilSlots"),
  resetBuildButton: document.querySelector("#resetBuildButton"),
  attack: document.querySelector("#attackInput"),
  critRate: document.querySelector("#critRateInput"),
  critDamage: document.querySelector("#critDamageInput"),
  manualDamage: document.querySelector("#manualDamageInput"),
  weaponGrid: document.querySelector("#weaponGrid"),
  limitBreakGrid: document.querySelector("#limitBreakGrid"),
  otherInputGrid: document.querySelector("#otherInputGrid"),
  characterExtraGrid: document.querySelector("#characterExtraGrid"),
  skillFilterSelect: document.querySelector("#skillFilterSelect"),
  damageMin: document.querySelector("#damageMinInput"),
  damageMax: document.querySelector("#damageMaxInput"),
  fullTableButton: document.querySelector("#fullTableButton"),
  compactTableButton: document.querySelector("#compactTableButton"),
  selectedSkillName: document.querySelector("#selectedSkillName"),
  selectedClass: document.querySelector("#selectedClass"),
  selectedSkillMeta: document.querySelector("#selectedSkillMeta"),
  resultMultiplier: document.querySelector("#resultMultiplier"),
  resultBaseCap: document.querySelector("#resultBaseCap"),
  resultClassification: document.querySelector("#resultClassification"),
  resultMultiplierBoost: document.querySelector("#resultMultiplierBoost"),
  resultCritRate: document.querySelector("#resultCritRate"),
  resultFinalCap: document.querySelector("#resultFinalCap"),
  resultAttack: document.querySelector("#resultAttack"),
  resultNormal: document.querySelector("#resultNormal"),
  resultCrit: document.querySelector("#resultCrit"),
  resultAverage: document.querySelector("#resultAverage"),
  resultEcho: document.querySelector("#resultEcho"),
  resultDamagePercent: document.querySelector("#resultDamagePercent"),
  resultOverflow: document.querySelector("#resultOverflow"),
  resultTotal: document.querySelector("#resultTotal"),
  verificationNote: document.querySelector("#verificationNote"),
  calculatorGrid: document.querySelector("#calculatorGrid"),
  traitCount: document.querySelector("#traitCount"),
  traitSummary: document.querySelector("#traitSummary"),
  rowCount: document.querySelector("#rowCount"),
  skillTable: document.querySelector("#skillTable"),
  presetStatus: document.querySelector("#presetStatus"),
  presetName: document.querySelector("#presetNameInput"),
  presetSelect: document.querySelector("#presetSelect"),
  savePreset: document.querySelector("#savePresetButton"),
  loadPreset: document.querySelector("#loadPresetButton"),
  deletePreset: document.querySelector("#deletePresetButton"),
  refreshPreset: document.querySelector("#refreshPresetButton"),
  presetSettingsButton: document.querySelector("#presetSettingsButton"),
  presetSettings: document.querySelector("#presetSettings"),
  presetDeletePanel: document.querySelector("#presetDeletePanel"),
  presetDeleteList: document.querySelector("#presetDeleteList"),
  presetEndpoint: document.querySelector("#presetEndpointInput"),
  presetSecret: document.querySelector("#presetSecretInput"),
  savePresetSettings: document.querySelector("#savePresetSettingsButton"),
  testPresetSettings: document.querySelector("#testPresetSettingsButton"),
  cancelPresetDelete: document.querySelector("#cancelPresetDeleteButton"),
  confirmPresetDelete: document.querySelector("#confirmPresetDeleteButton"),
  openPresetFolder: document.querySelector("#openPresetFolderLink"),
};

function makeDefaultBuild() {
  const source = DATA.calculator?.sigils?.length ? DATA.calculator.sigils : [];
  const slots = Array.from({ length: 12 }, (_, index) => {
    const sigil = source[index] ?? {};
    return {
      main: sigil.main || NONE,
      level: Number(sigil.level) || 0,
      sub: sigil.sub || NONE,
    };
  });
  return slots;
}

function makeWeaponState() {
  const weapon = DATA.calculator?.weapon ?? {};
  const traits = Array.from({ length: 3 }, (_, index) => {
    const source = weapon.traits?.[index] ?? {};
    return {
      trait: source.trait || NONE,
      level: Number(source.level) || 0,
    };
  });
  return {
    traits,
    sigilBooster: Boolean(weapon.sigilBooster),
    terminus: Boolean(weapon.terminus),
  };
}

function makeLimitBreakState() {
  const result = {};
  for (const item of DATA.calculator?.limitBreak ?? []) {
    if (!item.label) continue;
    const raw = Number(item.value) || 0;
    result[item.label] = item.label === "攻擊力" ? raw : raw * 100;
  }
  return result;
}

function makeOtherState() {
  const result = {};
  for (const item of DATA.calculator?.otherInputs ?? []) {
    if (!item.label || item.label === "Other Inputs") continue;
    if (typeof item.value === "boolean") {
      result[item.label] = item.value;
    } else if (typeof item.value === "number") {
      result[item.label] = item.label === "當前HP" ? item.value * 100 : item.value;
    } else {
      result[item.label] = item.value ?? "";
    }
  }
  return result;
}

function makeCharacterExtraState(character = defaultCharacter) {
  const result = {};
  for (const [label, value] of CHARACTER_EXTRA_DEFAULTS[character?.nameZh] ?? []) {
    result[label] = value;
  }
  return result;
}

function currentPresetPayload(name) {
  const character = getCharacter();
  return {
    version: 1,
    name,
    savedAt: new Date().toISOString(),
    characterId: state.characterId,
    characterName: character?.nameZh ?? "",
    selectedRowIndex: state.selectedRowIndex,
    filters: {
      search: state.search,
      skillFilter: state.skillFilter,
      damagePercentMin: state.damagePercentMin,
      damagePercentMax: state.damagePercentMax,
      tableMode: state.tableMode,
    },
    base: cloneJson(state.base),
    build: cloneJson(state.build),
    weapon: cloneJson(state.weapon),
    limitBreak: cloneJson(state.limitBreak),
    other: cloneJson(state.other),
    characterExtras: cloneJson(state.characterExtras),
  };
}

function normalizeBuild(build) {
  const rows = Array.isArray(build) ? build : [];
  return Array.from({ length: 12 }, (_, index) => ({
    main: rows[index]?.main || NONE,
    level: Number(rows[index]?.level) || 0,
    sub: rows[index]?.sub || NONE,
  }));
}

function normalizeWeapon(weapon) {
  const fallback = makeWeaponState();
  return {
    traits: Array.from({ length: 3 }, (_, index) => ({
      trait: weapon?.traits?.[index]?.trait || fallback.traits[index]?.trait || NONE,
      level: Number(weapon?.traits?.[index]?.level) || fallback.traits[index]?.level || 0,
    })),
    sigilBooster: Boolean(weapon?.sigilBooster),
    terminus: Boolean(weapon?.terminus),
  };
}

function applyPresetPayload(preset) {
  const character = DATA.characters.find((item) => item.id === preset?.characterId || item.nameZh === preset?.characterName);
  if (character) {
    state.characterId = character.id;
    applyCharacterBaseDefaults();
  }

  const filters = preset?.filters ?? {};
  state.search = filters.search ?? "";
  state.skillFilter = filters.skillFilter ?? "";
  state.damagePercentMin = filters.damagePercentMin ?? "";
  state.damagePercentMax = filters.damagePercentMax ?? "";
  state.tableMode = filters.tableMode === "compact" ? "compact" : "full";
  state.selectedRowIndex = Number(preset?.selectedRowIndex) || 0;

  state.base = { ...state.base, ...(preset?.base ?? {}) };
  state.build = normalizeBuild(preset?.build);
  state.weapon = normalizeWeapon(preset?.weapon);
  state.limitBreak = { ...makeLimitBreakState(), ...(preset?.limitBreak ?? {}) };
  state.other = { ...makeOtherState(), ...(preset?.other ?? {}) };
  state.characterExtras = { ...makeCharacterExtraState(getCharacter()), ...(preset?.characterExtras ?? {}) };

  syncBaseInputs();
  renderShell();
  renderCharacters();
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function jsurlParse(source) {
  const text = String(source ?? "");
  let index = 0;

  function decodeToken(token) {
    return token
      .replace(/!|(\*\*[0-9a-fA-F]{4})|(\*[0-9a-fA-F]{2})/g, (match) => {
        if (match === "!") return "$";
        if (match.startsWith("**")) return String.fromCharCode(Number.parseInt(match.slice(2), 16));
        return String.fromCharCode(Number.parseInt(match.slice(1), 16));
      });
  }

  function readToken() {
    const start = index;
    while (index < text.length && text[index] !== "~" && text[index] !== ")") index += 1;
    return decodeToken(text.slice(start, index));
  }

  function parseValue() {
    if (text[index] !== "~") throw new Error("不是有效的 logsdata");
    index += 1;
    const marker = text[index];
    if (marker === "'") {
      index += 1;
      return readToken();
    }
    if (marker === "(") {
      index += 1;
      if (text[index] === "~") {
        const result = [];
        while (index < text.length && text[index] !== ")") {
          if (text[index] === "~" && text[index + 1] === ")") {
            index += 1;
            break;
          }
          result.push(parseValue());
        }
        if (text[index] === ")") index += 1;
        return result;
      }
      const result = {};
      while (index < text.length && text[index] !== ")") {
        if (text[index] === "~") index += 1;
        const key = readToken();
        if (!key && text[index] === ")") break;
        result[key] = parseValue();
      }
      if (text[index] === ")") index += 1;
      return result;
    }
    const raw = readToken();
    if (raw === "true") return true;
    if (raw === "false") return false;
    if (raw === "null") return null;
    const number = Number(raw);
    return Number.isFinite(number) ? number : raw;
  }

  return parseValue();
}

function hashKey(value) {
  if (value === null || value === undefined || value === "" || value === 2289754288) return "";
  if (typeof value === "number") return (value >>> 0).toString(16).padStart(8, "0");
  const text = String(value).replace(/^0x/i, "").trim().toLowerCase();
  if (/^[0-9a-f]{1,8}$/.test(text)) return text.padStart(8, "0");
  return "";
}

function logsMapText(group, id) {
  const key = hashKey(id);
  return key ? window.GBFR_LOGS_MAP?.[group]?.[key]?.text ?? "" : "";
}

function localTraitName(name) {
  const text = String(name ?? "").trim();
  if (!text || text === "None") return NONE;
  const aliases = {
    爆擊機率: "暴擊機率",
    暈厥: "暈眩",
    昏厥: "暈眩",
    連擊加成: "連技加成",
    連擊終擊: "連技終擊",
    連技終結: "連技終擊",
    連攜攻擊: "聯手攻擊",
    連結攻擊: "聯手攻擊",
    "Alpha": "阿爾法",
    "Beta": "貝塔",
    "Gamma": "伽馬",
    "α": "阿爾法",
    "β": "貝塔",
    "γ": "伽馬",
    Ain: "盡涯",
    Boundary: "盡涯",
  };
  const normalized = aliases[text] ?? text.replace(/\s*[+＋]\s*$/, "");
  if (sigilByName.has(normalized)) return normalized;
  if (/阿爾法.*符碼/.test(normalized)) return "阿爾法";
  if (/貝塔.*符碼/.test(normalized)) return "貝塔";
  if (/伽馬.*符碼|伽瑪.*符碼/.test(normalized)) return "伽馬";
  if (/魔眼的萬箭|萬箭$/.test(normalized)) return "專屬";
  if (/的覺醒$/.test(normalized)) return "專屬";
  if (/戰氣$/.test(normalized)) return "戰氣";
  if (/Ain|Boundary|境界|盡涯|二王$/i.test(normalized)) return "盡涯";
  if (DISPLAY_ONLY_TRAITS.has(normalized)) return ensureDisplayOnlyTrait(normalized);
  return NONE;
}

function localCharacterFromLogs(logsData) {
  const logsName = window.GBFR_LOGS_MAP?.characters?.[logsData?.characterType] ?? "";
  const candidates = [
    logsName,
    logsData?.characterName,
    logsData?.displayName,
    logsData?.characterType === "Pl0000" || logsData?.characterType === "Pl0100" ? "團長" : "",
  ]
    .filter(Boolean)
    .map((name) => (name === "葛蘭" || name === "吉塔" ? "團長" : name));
  return DATA.characters.find((character) => candidates.includes(character.nameZh)) ?? null;
}

function localLimitBreakLabel(name) {
  const aliases = {
    一般攻擊的傷害上限: "一般傷害上限",
    技能的傷害上限: "技能傷害上限",
    奧義的傷害上限: "奧義傷害上限",
    技能的給予傷害: "技能給予傷害",
    奧義的給予傷害: "奧義給予傷害",
    爆擊機率: "暴擊機率",
  };
  const text = aliases[String(name ?? "").trim()] ?? String(name ?? "").trim();
  return Object.prototype.hasOwnProperty.call(makeLimitBreakState(), text) ? text : "";
}

function logsTraitSlot(firstTraitId, secondTraitId, level) {
  return {
    main: localTraitName(logsMapText("traits", firstTraitId)),
    level: Number(level) || 0,
    sub: localTraitName(logsMapText("traits", secondTraitId)),
  };
}

function presetFromLogsData(logsData) {
  const character = localCharacterFromLogs(logsData) ?? getCharacter();
  const weaponInfo = logsData?.weaponInfo ?? {};
  const limitBreak = makeLimitBreakState();
  for (const item of logsData?.overmasteryInfo?.overmasteries ?? []) {
    const label = localLimitBreakLabel(logsMapText("overmasteries", item.id));
    if (!label) continue;
    const raw = Number(item.value) || 0;
    limitBreak[label] = label === "攻擊力" || raw > 1 ? raw : raw * 100;
  }

  return {
    version: 1,
    name: `GBFR Logs ${logsData?.displayName || character?.nameZh || "Build"} ${new Date().toLocaleString("zh-TW", { hour12: false })}`,
    savedAt: new Date().toISOString(),
    characterId: character?.id ?? state.characterId,
    characterName: character?.nameZh ?? "",
    selectedRowIndex: 0,
    filters: {
      search: "",
      skillFilter: "",
      damagePercentMin: "",
      damagePercentMax: "",
      tableMode: state.tableMode,
    },
    build: Array.from({ length: 12 }, (_, index) => {
      const sigil = logsData?.sigils?.[index] ?? {};
      return logsTraitSlot(sigil.firstTraitId, sigil.secondTraitId, sigil.sigilLevel ?? sigil.firstTraitLevel);
    }),
    weapon: {
      traits: [
        { trait: localTraitName(logsMapText("traits", weaponInfo.trait1Id)), level: Number(weaponInfo.trait1Level) || 0 },
        { trait: localTraitName(logsMapText("traits", weaponInfo.trait2Id)), level: Number(weaponInfo.trait2Level) || 0 },
        { trait: localTraitName(logsMapText("traits", weaponInfo.trait3Id)), level: Number(weaponInfo.trait3Level) || 0 },
      ],
      sigilBooster: Number(weaponInfo.awakeningLevel) >= 10,
      terminus: Number(weaponInfo.awakeningLevel) >= 10,
    },
    limitBreak,
  };
}

function importLogsDataFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("logsdata");
  if (!encoded) return;
  try {
    const logsData = jsurlParse(encoded);
    const preset = presetFromLogsData(logsData);
    applyPresetPayload(preset);
    if (els.presetName) els.presetName.value = preset.name;
    setPresetStatus("已匯入 GBFR Logs build，可以按「儲存到雲端」保留。");
  } catch (error) {
    setPresetStatus(`GBFR Logs 匯入失敗：${error.message}`);
  }
}

function numberInput(element, fallback = 0) {
  const value = Number(element.value);
  return Number.isFinite(value) ? value : fallback;
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return Number(value).toLocaleString("zh-TW", { maximumFractionDigits: digits });
}

function formatPercentValue(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${formatNumber(value * 100, 1)}%`;
}

function formatPreciseNumber(value, digits = 4) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return Number(value).toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function formatBoolean(value) {
  return value ? "TRUE" : "FALSE";
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function isDefaultZetaState() {
  return state.characterId === "zeta"
    && sameJson(state.build, makeDefaultBuild())
    && sameJson(state.weapon, makeWeaponState())
    && sameJson(state.limitBreak, makeLimitBreakState())
    && sameJson(state.other, makeOtherState())
    && sameJson(state.characterExtras, makeCharacterExtraState(getCharacter()));
}

function resultCell(value, unsupportedText = "不估算") {
  return value === null || value === undefined || Number.isNaN(value) ? unsupportedText : formatNumber(value, 0);
}

function damageCell(value, unsupportedText = "不估算") {
  if (value === null || value === undefined || Number.isNaN(value)) return unsupportedText;
  return formatNumber(Math.floor(value), 0);
}

function percentCell(value, unsupportedText = "不估算") {
  if (value === null || value === undefined || Number.isNaN(value)) return unsupportedText;
  return `${formatNumber(value * 100, 2)}%`;
}

function damagePercentClass(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "cap-na";
  const percent = value * 100;
  if (percent >= 99.995) return "cap-100";
  if (percent >= 80) return "cap-80";
  if (percent >= 60) return "cap-60";
  if (percent >= 40) return "cap-40";
  return "cap-low";
}

function presetConfig() {
  return {
    endpoint: localStorage.getItem(PRESET_STORAGE_KEYS.endpoint) || "",
    secret: localStorage.getItem(PRESET_STORAGE_KEYS.secret) || "",
  };
}

function setPresetStatus(message, isError = false) {
  if (!els.presetStatus) return;
  els.presetStatus.textContent = message;
  els.presetStatus.dataset.status = isError ? "error" : "ok";
}

function setPresetBusy(busy) {
  for (const button of [
    els.savePreset,
    els.loadPreset,
    els.deletePreset,
    els.refreshPreset,
    els.testPresetSettings,
    els.cancelPresetDelete,
    els.confirmPresetDelete,
  ]) {
    if (button) button.disabled = busy;
  }
}

function initPresetUi() {
  const config = presetConfig();
  els.presetEndpoint.value = config.endpoint;
  els.presetSecret.value = config.secret;
  if (config.endpoint && config.secret) {
    setPresetStatus("Google Drive 存檔已設定。");
    refreshPresetList();
  } else {
    setPresetStatus("尚未設定 Google Drive 存檔。");
  }
}

function cloudPresetRequest(action, payload = {}) {
  const config = presetConfig();
  if (!config.endpoint || !config.secret) {
    return Promise.reject(new Error("請先設定 Apps Script Web App URL 與安全碼。"));
  }

  const requestId = `preset-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    let settled = false;
    const callbackName = `__relinkPreset_${requestId.replace(/[^a-z0-9_]/gi, "_")}`;
    const script = document.createElement("script");
    const url = new URL(config.endpoint);
    url.searchParams.set("action", action);
    url.searchParams.set("secret", config.secret);
    url.searchParams.set("requestId", requestId);
    url.searchParams.set("callback", callbackName);
    url.searchParams.set("payload", JSON.stringify(payload));
    script.src = url.toString();

    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };
    const timer = window.setTimeout(() => finish(reject, new Error("Google Drive 存檔連線逾時。")), 20000);
    window[callbackName] = (data) => {
      window.clearTimeout(timer);
      if (data.ok) finish(resolve, data);
      else finish(reject, new Error(data.error || "Google Drive 存檔失敗。"));
    };
    script.addEventListener("error", () => {
      window.clearTimeout(timer);
      finish(reject, new Error("無法連到 Apps Script。請確認 Web App URL 與部署權限。"));
    });
    document.body.append(script);
  });
}

function updatePresetFolderLink(folderUrl) {
  if (!folderUrl) return;
  els.openPresetFolder.href = folderUrl;
  els.openPresetFolder.hidden = false;
}

function formatPresetUpdatedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderPresetDeleteList() {
  if (!els.presetDeleteList) return;
  const presets = state.presetList ?? [];
  if (!presets.length) {
    els.presetDeleteList.innerHTML = `<p class="preset-delete-empty">此角色目前沒有可刪除的雲端配置。</p>`;
    return;
  }
  els.presetDeleteList.innerHTML = presets
    .map((preset) => {
      const updatedAt = formatPresetUpdatedAt(preset.updatedAt);
      const meta = updatedAt ? `更新：${updatedAt}` : "雲端配置";
      return `
        <label class="preset-delete-item">
          <input type="checkbox" value="${escapeHtml(preset.fileId)}" data-name="${escapeHtml(preset.name)}" />
          <span class="preset-delete-meta">
            <strong>${escapeHtml(preset.name)}</strong>
            <small>${escapeHtml(meta)}</small>
          </span>
        </label>
      `;
    })
    .join("");
}

function openPresetDeletePanel() {
  if (!state.presetList.length) {
    setPresetStatus("目前沒有可刪除的雲端配置。", true);
    return;
  }
  els.presetDeletePanel.hidden = false;
  renderPresetDeleteList();
  setPresetStatus("請勾選要刪除的雲端配置。");
}

async function refreshPresetList() {
  const config = presetConfig();
  if (!config.endpoint || !config.secret) {
    setPresetStatus("尚未設定 Google Drive 存檔。");
    return;
  }
  const character = getCharacter();
  try {
    setPresetBusy(true);
    setPresetStatus("正在讀取雲端配置...");
    const result = await cloudPresetRequest("list", {
      characterId: state.characterId,
      characterName: character?.nameZh ?? "",
    });
    const presets = result.presets ?? [];
    const previousFileId = els.presetSelect.value;
    state.presetList = presets;
    els.presetSelect.innerHTML = presets.length
      ? presets.map((preset) => `<option value="${escapeHtml(preset.fileId)}">${escapeHtml(preset.name)}</option>`).join("")
      : `<option value="">此角色尚無雲端配置</option>`;
    if (previousFileId && presets.some((preset) => preset.fileId === previousFileId)) {
      els.presetSelect.value = previousFileId;
    }
    renderPresetDeleteList();
    updatePresetFolderLink(result.folderUrl);
    setPresetStatus(`已讀取 ${character?.nameZh ?? "目前角色"} 的 ${presets.length} 個雲端配置。`);
  } catch (error) {
    setPresetStatus(error.message, true);
  } finally {
    setPresetBusy(false);
  }
}

async function saveCurrentPreset() {
  const name = els.presetName.value.trim();
  if (!name) {
    setPresetStatus("請先輸入存檔名稱。", true);
    els.presetName.focus();
    return;
  }
  const character = getCharacter();
  try {
    setPresetBusy(true);
    setPresetStatus(`正在儲存「${name}」...`);
    const result = await cloudPresetRequest("save", {
      characterId: state.characterId,
      characterName: character?.nameZh ?? "",
      name,
      preset: currentPresetPayload(name),
    });
    updatePresetFolderLink(result.folderUrl);
    setPresetStatus(`已儲存「${name}」。`);
    await refreshPresetList();
  } catch (error) {
    setPresetStatus(error.message, true);
  } finally {
    setPresetBusy(false);
  }
}

async function loadSelectedPreset() {
  const fileId = els.presetSelect.value;
  if (!fileId) {
    setPresetStatus("目前沒有可讀取的配置。", true);
    return;
  }
  try {
    setPresetBusy(true);
    setPresetStatus("正在讀取雲端配置...");
    const result = await cloudPresetRequest("load", { fileId });
    applyPresetPayload(result.preset);
    els.presetName.value = result.preset?.name ?? "";
    setPresetStatus(`已讀取「${result.preset?.name ?? "配置"}」。`);
    await refreshPresetList();
  } catch (error) {
    setPresetStatus(error.message, true);
  } finally {
    setPresetBusy(false);
  }
}

async function deleteSelectedPreset() {
  openPresetDeletePanel();
}

async function deleteCheckedPresets() {
  const checked = Array.from(els.presetDeleteList?.querySelectorAll("input[type='checkbox']:checked") ?? []);
  if (!checked.length) {
    setPresetStatus("請先勾選要刪除的雲端配置。", true);
    return;
  }
  const names = checked.map((input) => input.dataset.name || "未命名配置");
  const confirmed = window.confirm(`確定刪除 ${checked.length} 個雲端配置？\n\n${names.join("\n")}`);
  if (!confirmed) return;
  try {
    setPresetBusy(true);
    setPresetStatus(`正在刪除 ${checked.length} 個雲端配置...`);
    for (const input of checked) {
      await cloudPresetRequest("delete", { fileId: input.value });
    }
    setPresetStatus(`已刪除 ${checked.length} 個雲端配置。`);
    await refreshPresetList();
    if (!state.presetList.length) {
      els.presetDeletePanel.hidden = true;
    }
  } catch (error) {
    setPresetStatus(error.message, true);
  } finally {
    setPresetBusy(false);
  }
}

async function testPresetConnection() {
  try {
    setPresetBusy(true);
    setPresetStatus("正在測試 Google Drive 存檔連線...");
    const result = await cloudPresetRequest("ping");
    updatePresetFolderLink(result.folderUrl);
    setPresetStatus("Google Drive 存檔連線成功。");
    await refreshPresetList();
  } catch (error) {
    setPresetStatus(error.message, true);
  } finally {
    setPresetBusy(false);
  }
}

function excelPercentCell(value, unsupportedText = "不估算") {
  if (value === null || value === undefined || Number.isNaN(value)) return unsupportedText;
  return `${formatNumber(value * 100, 0)}%`;
}

function calculatorPercentCell(value, unsupportedText = "-") {
  if (value === null || value === undefined || Number.isNaN(value)) return unsupportedText;
  return `${Number(value * 100).toLocaleString("zh-TW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function characterAvatarPath(character) {
  return `./assets/characters/${character.id}.png`;
}

function getCharacter() {
  return DATA.characters.find((character) => character.id === state.characterId) ?? DATA.characters[0];
}

function getSigil(name) {
  return sigilByName.get(name) ?? sigilByName.get(NONE);
}

function sigilIcon(name) {
  const sigil = getSigil(name);
  return sigil?.iconLocal || sigil?.icon || "";
}

function getTraitLevelCap(name) {
  return Number(getSigil(name)?.maxLevel) || 99;
}

function getScalingValue(name, level) {
  const scaling = DATA.traitScaling?.[name]?.values;
  if (!scaling) return null;
  const capped = Math.max(0, Math.min(Math.round(level), getTraitLevelCap(name)));
  return Number(scaling[String(capped)] ?? scaling[String(getTraitLevelCap(name))] ?? 0);
}

function characterBaseStats() {
  return CHARACTER_BASE_STATS[getCharacter()?.nameZh] ?? {
    attack: Number(DATA.calculator?.baseStats?.attack) || 12396,
    critRate: Math.round((Number(DATA.calculator?.baseStats?.critRate) || 0.5) * 100),
    critDamage: Math.round((Number(DATA.calculator?.baseStats?.critDamage) || 1) * 100),
  };
}

function applyCharacterBaseDefaults() {
  const base = characterBaseStats();
  state.base.attack = base.attack;
  state.base.critRate = base.critRate;
  state.base.critDamage = base.critDamage;
  if (els.attack) els.attack.value = base.attack;
  if (els.critRate) els.critRate.value = base.critRate;
  if (els.critDamage) els.critDamage.value = base.critDamage;
}

function isCharacterVerified(character) {
  return VERIFIED_CHARACTERS.has(character?.nameZh);
}

function syncBaseInputs() {
  state.base.attack = Math.max(0, numberInput(els.attack, 0));
  state.base.critRate = Math.max(0, Math.min(100, numberInput(els.critRate, 0)));
  state.base.critDamage = Math.max(0, numberInput(els.critDamage, 0));
  state.base.manualDamage = numberInput(els.manualDamage, 0);
}

function rowSearchText(character, row) {
  return normalizeText([
    character.nameZh,
    character.id,
    row.skill,
    row.modifier,
    row.multiplier,
    row.damageCap,
    row.cooldown,
    row.classification,
    row.notes,
  ].join(" "));
}

function getVisibleRows(character) {
  const query = normalizeText(state.search);
  const skillFilter = state.skillFilter;
  const min = state.damagePercentMin === "" ? null : Number(state.damagePercentMin) / 100;
  const max = state.damagePercentMax === "" ? null : Number(state.damagePercentMax) / 100;
  const tokens = query.split(/\s+/).filter(Boolean);
  return character.skillRows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => {
      if (skillFilter && row.skill !== skillFilter) return false;
      if (tokens.length && !tokens.every((token) => rowSearchText(character, row).includes(token))) return false;
      if (min !== null || max !== null) {
        const percent = calculate(row).damagePercent;
        if (percent === null || percent === undefined || Number.isNaN(percent)) return false;
        if (min !== null && percent < min) return false;
        if (max !== null && percent > max) return false;
      }
      return true;
    });
}

function addTraitLevel(levels, name, level) {
  if (!name || name === NONE || name === "N/A") return;
  const amount = Math.max(0, Number(level) || 0);
  levels[name] = (levels[name] ?? 0) + amount;
}

function slotLevel(slot) {
  return Math.max(0, Number(slot?.level) || 0);
}

function getTraitLevels() {
  const rawLevels = {};
  for (const slot of state.build) {
    const level = slotLevel(slot);
    if (level <= 0) continue;
    const boostedLevel = level + (state.weapon.sigilBooster ? 1 : 0);
    addTraitLevel(rawLevels, slot.main, boostedLevel);
    if (!mainOnlyTraitNames.has(slot.sub)) {
      addTraitLevel(rawLevels, slot.sub, boostedLevel);
    }
  }

  for (const trait of state.weapon.traits) {
    addTraitLevel(rawLevels, trait.trait, trait.level);
  }

  if (state.weapon.sigilBooster) {
    addTraitLevel(rawLevels, "傷害上限", 5);
  }

  if (isEternalCharacter()) {
    addTraitLevel(rawLevels, "攻擊力", 25);
    addTraitLevel(rawLevels, "追擊", 15);
  }

  const capped = {};
  for (const [name, level] of Object.entries(rawLevels)) {
    capped[name] = Math.min(level, getTraitLevelCap(name));
  }
  return capped;
}

function limitPercent(label) {
  return (Number(state.limitBreak[label]) || 0) / 100;
}

function currentHpRate() {
  const hp = Number(state.other["當前HP"]);
  if (!Number.isFinite(hp)) return 1;
  return Math.max(0, Math.min(1, hp / 100));
}

function otherPercent(label) {
  return (Number(state.other[label]) || 0) / 100;
}

function traitPercent(levels, name) {
  return getScalingValue(name, levels[name] ?? 0) ?? 0;
}

function hasTrait(levels, name) {
  return (levels[name] ?? 0) > 0;
}

function hasMainSigil(name) {
  return state.build.some((slot) => slot.main === name && (Number(slot.level) || 0) > 0);
}

function sigilAwakeningActive() {
  return hasMainSigil("專屬");
}

function hasBuildTrait(name) {
  return state.build.some((slot) =>
    slotLevel(slot) > 0 && (slot.main === name || slot.sub === name)
  );
}

function isEternalCharacter() {
  return ["席耶提", "蘇恩"].includes(getCharacter()?.nameZh);
}

function hasBoundarySigil() {
  return hasMainSigil("盡涯");
}

function effectiveTerminusActive() {
  return isEternalCharacter() ? hasBoundarySigil() : state.weapon.terminus;
}

function eternalClassCapActive() {
  return isEternalCharacter() || state.weapon.terminus;
}

function flightActive() {
  return hasMainSigil("捨戰求避");
}

function effectiveAttack(levels) {
  const limitAttack = Number(state.limitBreak["攻擊力"]) || 0;
  const attackBase = state.base.attack + limitAttack + traitPercent(levels, "攻擊力");
  const buildBerserker = hasBuildTrait("狂戰士") ? traitPercent(levels, "狂戰士") : 0;
  const weaponCatastrophe = !buildBerserker && effectiveTerminusActive() ? 0.5 : 0;
  const character = getCharacter();
  const rosettaRoseLevel = Math.min(Number(state.characterExtras["薔薇Lv"]) || 0, 4);
  const rosettaBonus = character?.nameZh === "蘿賽塔"
    ? (sigilAwakeningActive() ? 0.13 : 0.03) + rosettaRoseLevel * 0.03 + (characterWarpathActive() ? 0.15 : 0)
    : 0;
  const seofonBonus = character?.nameZh === "席耶提" && sigilAwakeningActive() && (state.characterExtras["劍神召喚?"] ?? true) ? 0.3 : 0;
  const ghandagozaLevel = Math.min(Number(state.characterExtras["古今無雙劉Lv"]) || 0, 10);
  const ghandagozaFactor = character?.nameZh === "剛特克澤" && ghandagozaLevel >= 1 ? 1 + 0.035 * ghandagozaLevel : 1;
  return Math.max(0, attackBase)
    * (1 + traitPercent(levels, "暴君"))
    * staminaEnmityFactor(levels)
    * (1 + traitPercent(levels, "一線之隔"))
    * (1 + traitPercent(levels, "逆襲閃避"))
    * (1 + buildBerserker + weaponCatastrophe)
    * (1 + traitPercent(levels, "弱化狀態特攻"))
    * (1 + otherPercent("攻擊力強化"))
    * (1 + otherPercent("防禦下降"))
    * (1 + rosettaBonus + seofonBonus)
    * ghandagozaFactor
    * (flightActive() ? 0.5 : 1)
    * (state.other["Link Time?"] ? 1.2 : 1);
}

function characterWarpathActive() {
  return hasBuildTrait("戰氣") && (state.characterExtras["戰氣?"] ?? true);
}

function finalAttackForEcho(levels) {
  const limitAttack = Number(state.limitBreak["攻擊力"]) || 0;
  const attackBase = state.base.attack + limitAttack + traitPercent(levels, "攻擊力");
  return Math.max(0, attackBase)
    * (1 + traitPercent(levels, "暴君"))
    * (1 + traitPercent(levels, "一線之隔"))
    * (effectiveTerminusActive() ? 1.5 : 1)
    * (flightActive() ? 0.5 : 1);
}

function critRateValue(levels) {
  return critRateBreakdown(levels).total;
}

function critRateBreakdown(levels) {
  const parts = [
    ["基礎", state.base.critRate / 100],
    ["因子", traitPercent(levels, "暴擊機率")],
    ["突破", limitPercent("暴擊機率")],
  ];
  if (isEternalCharacter()) parts.push(["十天", 0.1]);
  if (state.other["Link Time?"]) parts.push(["Link", 0.05]);

  const uncappedTotal = parts.reduce((sum, [, value]) => sum + value, 0);
  const total = Math.max(0, Math.min(1, uncappedTotal));
  const text = parts
    .filter(([, value]) => Math.abs(value) > 0.000001)
    .map(([label, value]) => `${label} ${excelPercentCell(value, "0%")}`)
    .join(" + ") || "0%";

  return { total, uncappedTotal, text };
}

function zetaGuaranteedCrit(levels) {
  return getCharacter()?.nameZh === "瑟塔"
    && hasTrait(levels, "戰氣")
    && ((state.characterExtras["阿爾貝斯．菲爾瑪雷?"] ?? false) || (state.characterExtras["戰氣?"] ?? false));
}

function characterWarpathBonus(levels, row) {
  const character = getCharacter();
  if (!hasTrait(levels, "戰氣")) return 0;
  const active = state.characterExtras["戰氣?"] ?? true;
  if (!active) return 0;
  const condition = character?.warpathCondition;
  if (condition && condition.length > 2) {
    const text = `${row?.skill ?? ""} ${row?.modifier ?? ""}`;
    if (!text.includes(condition)) return 0;
  } else if (condition && condition.length === 2) {
    if (!String(row?.classification ?? "").includes(condition)) return 0;
  }
  return Number(character?.warpathBonus) || 0;
}

function classificationCapBonus(row, levels) {
  const type = String(row?.classification ?? "");
  if (type.includes("Fl")) return 0;
  const masteryCap = Number(DATA.globalValues?.masteryCap) || 0;
  let totalDamageCap = traitPercent(levels, "傷害上限");
  totalDamageCap += traitPercent(levels, "一線之隔");
  totalDamageCap += traitPercent(levels, "伽馬");
  if (effectiveTerminusActive()) totalDamageCap += 1;
  let bonus = totalDamageCap;
  if (type.includes("No") || type.includes("Li")) {
    bonus += limitPercent("一般傷害上限") + masteryCap + (eternalClassCapActive() ? 0.2 : 0) + traitPercent(levels, "阿爾法");
  }
  if (type.includes("Sk")) {
    bonus += limitPercent("技能傷害上限") + masteryCap + (eternalClassCapActive() ? 0.2 : 0) + traitPercent(levels, "貝塔");
  }
  if (type.includes("Sb")) {
    bonus += limitPercent("奧義傷害上限") + masteryCap + (eternalClassCapActive() ? 0.2 : 0);
  }
  const characterName = getCharacter()?.nameZh;
  const skill = String(row?.skill ?? "");
  const modifier = String(row?.modifier ?? "");
  if (characterName === "帕西瓦爾" && sigilAwakeningActive() && skill.includes("征戰")) bonus += 0.5;
  if (characterName === "剛特克澤" && sigilAwakeningActive() && skill.includes("正拳擊")) bonus += 0.5;
  if (characterName === "卡塔莉娜" && sigilAwakeningActive() && type.includes("Sp")) bonus += 0.15;
  if (characterName === "菲莉" && sigilAwakeningActive() && skill.includes("猛襲") && modifier.includes("猛襲")) bonus += 0.45;
  if (characterName === "伊度" && sigilAwakeningActive() && type.includes("Sp")) bonus += 0.3;
  if (characterName === "瑟塔" && type.includes("Sp")) bonus += 0.18;
  if (characterName === "齊格菲" && modifier.includes("just")) bonus += 0.2;
  if (characterName === "拉卡姆" && sigilAwakeningActive() && skill.includes("靶心狙擊")) bonus += 0.25;
  if (sigilAwakeningActive() && skill === "星夢之術" && row?.modifier !== "I") bonus += 0.5;
  if (getCharacter()?.nameZh === "范恩" && type.includes("S2") && state.other["Link Time?"]) bonus += 0.8;
  return bonus;
}

function staminaEnmityFactor(levels) {
  const hp = currentHpRate();
  const stamina = traitPercent(levels, "渾身");
  const enmity = traitPercent(levels, "背水");
  const staminaFactor =
    hp < 0.25
      ? 1
      : 1 + stamina / (Math.pow(2, Math.min(1 - hp, 0.5) / 0.25) * (hp < 0.5 ? Math.pow(5 / 3, Math.min(0.5 - hp, 0.25) / 0.25) : 1));
  const enmityRatio = Math.min((1 - hp) / 0.99, 1);
  const enmityFactor = 1 + enmity * ((1 / 3) * (1 + 2 * enmityRatio) * enmityRatio);
  return staminaFactor * enmityFactor;
}

function damageBonus(levels) {
  let bonus = state.base.manualDamage / 100;
  if (state.other["連技加成?"]) bonus += traitPercent(levels, "連技加成");
  bonus += traitPercent(levels, "手無寸鐵") * Math.max(0, 4 - (Number(state.other["技能數量"]) || 0));
  bonus += traitPercent(levels, "捨身");
  bonus += traitPercent(levels, "蓄力加速");
  bonus += traitPercent(levels, "窮鼠");
  bonus += traitPercent(levels, "先制");
  return bonus;
}

function rowMultiplierBonus(row, levels) {
  const type = String(row?.classification ?? "");
  let bonus = 1;
  if (type.includes("Li")) bonus *= 1 + traitPercent(levels, "連結提升");
  if (type.includes("Sb")) bonus *= 1 + (1 + traitPercent(levels, "奧義提升")) * (1 + limitPercent("奧義給予傷害") + 0.2) - 1;
  if (type.includes("Ra")) bonus *= 1 + traitPercent(levels, "集中砲火");
  if (type.includes("Ch")) bonus *= 1 + traitPercent(levels, "蓄力攻擊") + (getCharacter()?.nameZh === "蘇恩" ? 0.2 : 0);
  if (type.includes("Fi")) bonus *= 1 + traitPercent(levels, "連技終擊");
  if (type.includes("Sk")) bonus *= 1 + ((1 + traitPercent(levels, "技能傷害")) * (1 + limitPercent("技能給予傷害") + 0.2) - 1);
  if (type.includes("Th")) bonus *= 1 + traitPercent(levels, "投擲");
  if (getCharacter()?.nameZh === "瑟塔" && state.characterExtras["阿爾貝斯．菲爾瑪雷?"]) {
    bonus *= 1.3 + (sigilAwakeningActive() ? 0.25 : 0);
  }
  if (getCharacter()?.nameZh === "蘭斯洛特" && sigilAwakeningActive()) {
    if (String(row?.skill ?? "").includes("雙劍亂舞")) bonus *= 1.5;
    if (state.other["連技加成?"]) bonus *= 1.5;
  }
  if (getCharacter()?.nameZh === "尤金" && sigilAwakeningActive() && row?.skill === "榴彈") {
    bonus *= 2;
  }
  if (!type.includes("Sb")) bonus *= 1 + (state.other["弱點部位攻擊?"] ? 0.7 + traitPercent(levels, "弱點攻擊") : 0) + (state.other["背後部位攻擊?"] ? 0.2 + traitPercent(levels, "弱點攻擊") : 0);
  return bonus;
}

function estimateEchoPercent(levels) {
  const level = levels["追擊"] ?? 0;
  const supplementary = level > 0 ? Math.min(1, 0.12 + level * 0.02) : 0;
  const finalAttack = finalAttackForEcho(levels);
  const berserkerEcho = (levels["狂戰士"] ?? 0) > 0 && finalAttack > 20000 ? Math.min(1, (finalAttack - 20000) / 5000) : 0;
  return 0.2 * (berserkerEcho + supplementary);
}

function echoDamage(row, levels, rawNormal, rawCrit, finalCap, elementalFactor) {
  const type = String(row?.classification ?? "");
  if (!/(No|Sk)/.test(type) || type.includes("Pe")) return 0;
  const echoPercent = estimateEchoPercent(levels);
  if (!echoPercent) return 0;
  const echoCritRate = Math.max(
    0,
    Math.min(1, critRateValue(levels)),
  );
  const echoNormal = Math.min(rawNormal * elementalFactor, finalCap);
  const echoCrit = Math.min(rawCrit * elementalFactor, finalCap);
  return (echoCrit * echoCritRate + echoNormal * (1 - echoCritRate)) * echoPercent;
}

function yodarhaMultiplierBonus() {
  return getCharacter()?.nameZh === "尤達爾拉哈" && sigilAwakeningActive() && state.other["連技加成?"] ? 0.3 : 0;
}

function characterEnhancedDamage() {
  const characterName = getCharacter()?.nameZh;
  if (characterName === "蘇恩" && sigilAwakeningActive() && (state.characterExtras["觸發專屬?"] ?? true)) return 0.1;
  if (characterName === "團長" && sigilAwakeningActive()) {
    const classLevel = Number(state.characterExtras["Class Lv"]) || 0;
    if (classLevel >= 4) return 0.1;
    if (classLevel === 3) return 0.07;
    if (classLevel === 2) return 0.05;
  }
  return 0;
}

function calculate(row) {
  const levels = getTraitLevels();
  const multiplier = Number(row?.multiplier) || 0;
  const baseCap = Number(row?.damageCap);
  if (!Number.isFinite(baseCap) || baseCap <= 0 || !Number.isFinite(multiplier) || multiplier < 0) {
    return {
      multiplier: Number.isFinite(multiplier) ? multiplier : null,
      baseCap: Number.isFinite(baseCap) ? baseCap : null,
      multiplierBoost: null,
      critRate: null,
      finalCap: null,
      attack: null,
      rawNormalDamage: null,
      rawCritDamage: null,
      average: null,
      echo: null,
      damagePercent: null,
      overflow: null,
      total: null,
    };
  }
  const attack = effectiveAttack(levels);
  const type = String(row?.classification ?? "");
  const critRate = type.includes("Oc") || zetaGuaranteedCrit(levels) ? 1 : critRateValue(levels);
  const critDamage = 1 + state.base.critDamage / 100 + traitPercent(levels, "暴擊傷害");
  const basePower = attack * (1 + damageBonus(levels));
  const effectiveMultiplier = multiplier + yodarhaMultiplierBonus();
  const multiplierBoost = multiplier <= 0 ? 0 : rowMultiplierBonus(row, levels);
  const capBonus = classificationCapBonus(row, levels);
  const elementalFactor = hasTrait(levels, "有利屬性轉換") ? 1.2 : 1;
  const enhancedDamage = characterEnhancedDamage();
  const specialDamage = type.includes("Fl") ? 0 : enhancedDamage + characterWarpathBonus(levels, row);
  const finalCap = type.includes("Fl") ? baseCap : baseCap * (1 + capBonus) * elementalFactor * (1 + specialDamage);
  const rawNormal = basePower * effectiveMultiplier * multiplierBoost;
  const rawCrit = (type.includes("Nc") ? basePower : basePower * critDamage) * effectiveMultiplier * multiplierBoost;
  const uncappedNormal = Math.floor(rawNormal * elementalFactor) * (1 + specialDamage);
  const uncappedCrit = Math.floor(rawCrit * elementalFactor) * (1 + specialDamage);
  const normal = Math.min(uncappedNormal, finalCap);
  const crit = Math.min(uncappedCrit, finalCap);
  const average = normal * (1 - critRate) + crit * critRate;
  const uncappedAverage = uncappedNormal * (1 - critRate) + uncappedCrit * critRate;
  const damagePercent = multiplier > 0 && finalCap > 0 ? average / finalCap : null;
  const overflow = damagePercent !== null && damagePercent >= 1 - 1e-12 && finalCap > 0 ? Math.max(0, uncappedAverage / finalCap - 1) : 0;
  const echo = echoDamage(row, levels, rawNormal, rawCrit, finalCap, elementalFactor);

  return {
    multiplier,
    baseCap,
    multiplierBoost,
    critRate,
    finalCap,
    attack,
    rawNormalDamage: uncappedNormal,
    rawCritDamage: uncappedCrit,
    normal,
    crit,
    average,
    echo,
    damagePercent,
    overflow,
    total: average + echo,
  };
}

function calculatorOverview() {
  const levels = getTraitLevels();
  const attack = effectiveAttack(levels);
  const critRate = critRateBreakdown(levels);
  const critDamage = 1 + state.base.critDamage / 100 + traitPercent(levels, "暴擊傷害");
  const baseDamage = attack * (1 + damageBonus(levels));
  const totalDamageCap = traitPercent(levels, "傷害上限")
    + traitPercent(levels, "一線之隔")
    + traitPercent(levels, "伽馬")
    + (effectiveTerminusActive() ? 1 : 0);
  const masteryCap = Number(DATA.globalValues?.masteryCap) || 0;
  return {
    top: [
      ["傷害上限", calculatorPercentCell(totalDamageCap)],
      ["配裝暴擊率", calculatorPercentCell(critRate.total)],
      ["暴擊組成", critRate.text],
      ["基礎傷害", formatPreciseNumber(baseDamage)],
      ["暴擊傷害", formatPreciseNumber(baseDamage * critDamage)],
      ["Raw Attack", formatPreciseNumber(attack)],
      ["十天?", formatBoolean(["席耶提", "蘇恩"].includes(getCharacter()?.nameZh))],
      ["Echo", formatPreciseNumber(estimateEchoPercent(levels) > 0 ? 1 : 0, 0)],
    ],
    boosts: [
      ["連結提升", calculatorPercentCell(traitPercent(levels, "連結提升"))],
      ["奧義提升", calculatorPercentCell((1 + traitPercent(levels, "奧義提升")) * (1 + limitPercent("奧義給予傷害") + 0.2) - 1)],
      ["遠程提升", calculatorPercentCell(traitPercent(levels, "集中砲火"))],
      ["蓄力提升", calculatorPercentCell(traitPercent(levels, "蓄力攻擊"))],
      ["技能提升", calculatorPercentCell((1 + traitPercent(levels, "技能傷害")) * (1 + limitPercent("技能給予傷害") + 0.2) - 1)],
      ["連技終結提升", calculatorPercentCell(traitPercent(levels, "連技終擊"))],
      ["投擲提升", calculatorPercentCell(traitPercent(levels, "投擲"))],
    ],
    caps: [
      ["渾身", calculatorPercentCell(staminaEnmityFactor(levels))],
      ["一般傷害上限", calculatorPercentCell(limitPercent("一般傷害上限") + masteryCap + (eternalClassCapActive() ? 0.2 : 0) + traitPercent(levels, "阿爾法"))],
      ["技能傷害上限", calculatorPercentCell(limitPercent("技能傷害上限") + masteryCap + (eternalClassCapActive() ? 0.2 : 0) + traitPercent(levels, "貝塔"))],
      ["奧義傷害上限", calculatorPercentCell(limitPercent("奧義傷害上限") + masteryCap + (eternalClassCapActive() ? 0.2 : 0))],
      ["弱點", calculatorPercentCell((state.other["弱點部位攻擊?"] ? 0.7 + traitPercent(levels, "弱點攻擊") : 0) + (state.other["背後部位攻擊?"] ? 0.2 + traitPercent(levels, "弱點攻擊") : 0))],
      ["特殊傷害加成", calculatorPercentCell(characterEnhancedDamage())],
      ["狀態", getCharacter()?.warpathCondition ?? ""],
    ],
  };
}

function renderCalculatorGrid() {
  const overview = calculatorOverview();
  const block = (items) => `
    <div class="calculator-label-row">
      ${items.map(([label]) => `<span>${escapeHtml(label)}</span>`).join("")}
    </div>
    <div class="calculator-value-row">
      ${items.map(([, value]) => `<strong>${escapeHtml(value)}</strong>`).join("")}
    </div>
  `;
  els.calculatorGrid.innerHTML = `
    ${block(overview.top)}
    ${block(overview.boosts)}
    ${block(overview.caps)}
  `;
}

function sigilPicker(selectedName, inputClass, ariaLabel) {
  const safeSelected = selectedName || NONE;
  const options = sigils
    .map((sigil) => {
      const selected = sigil.name === safeSelected ? " selected" : "";
      return `
        <button class="sigil-picker-option${selected}" type="button" role="option" data-value="${escapeHtml(sigil.name)}" aria-selected="${sigil.name === safeSelected}">
          <img src="${escapeHtml(sigilIcon(sigil.name))}" alt="" loading="lazy" />
          <span>${escapeHtml(sigil.name)}</span>
        </button>
      `;
    })
    .join("");
  return `
    <div class="sigil-picker ${inputClass}-picker">
      <input class="${inputClass}" type="hidden" value="${escapeHtml(safeSelected)}" />
      <button class="sigil-picker-toggle" type="button" aria-label="${escapeHtml(ariaLabel)}" aria-expanded="false">
        <span>${escapeHtml(safeSelected)}</span>
      </button>
      <div class="sigil-picker-menu" role="listbox">
        ${options}
      </div>
    </div>
  `;
}

function renderCharacters() {
  const current = getCharacter();
  els.characterPickerButton.innerHTML = `
    <img src="${characterAvatarPath(current)}" alt="" />
    <span>切換角色</span>
  `;
  els.characterPickerMenu.innerHTML = DATA.characters
    .map((character) => {
      const selected = character.id === state.characterId ? " selected" : "";
      const verified = isCharacterVerified(character);
      return `
        <button class="character-option${selected}${verified ? "" : " unverified"}" type="button" data-character-id="${character.id}" role="option" aria-selected="${character.id === state.characterId}">
          <img src="${characterAvatarPath(character)}" alt="" loading="lazy" />
          <span>
            <strong>${escapeHtml(character.nameZh)}</strong>
            <small>${escapeHtml(character.id)}</small>
          </span>
          <span class="${verified ? "skill-count" : "verification-badge"}">${verified ? character.skillRows.length : "尚未驗證"}</span>
        </button>
      `;
    })
    .join("");
}

function renderSkillFilters(character) {
  const skills = [...new Set(character.skillRows.map((row) => row.skill).filter(Boolean))];
  if (state.skillFilter && !skills.includes(state.skillFilter)) {
    state.skillFilter = "";
  }
  els.skillFilterSelect.innerHTML = [
    `<option value="">全部 Skill</option>`,
    ...skills.map((skill) => {
      const selected = skill === state.skillFilter ? " selected" : "";
      return `<option value="${escapeHtml(skill)}"${selected}>${escapeHtml(skill)}</option>`;
    }),
  ].join("");
  els.damageMin.value = state.damagePercentMin;
  els.damageMax.value = state.damagePercentMax;
  els.fullTableButton.classList.toggle("active", state.tableMode === "full");
  els.compactTableButton.classList.toggle("active", state.tableMode === "compact");
  document.querySelector(".data-section")?.classList.toggle("compact-mode", state.tableMode === "compact");
}

function renderSigilSlots() {
  const rows = state.build
    .map((slot, index) => {
      const max = getTraitLevelCap(slot.main);
      return `
        <div class="sigil-slot" data-slot="${index}">
          <span class="slot-number">${index + 1}</span>
          <img class="sigil-icon main-sigil-icon" src="${escapeHtml(sigilIcon(slot.main))}" alt="" loading="lazy" />
          ${sigilPicker(slot.main, "sigil-main", "主因子")}
          <input class="sigil-level" type="number" min="0" max="${max}" step="1" value="${escapeHtml(slot.level)}" aria-label="等級" />
          <img class="sigil-icon sub-sigil-icon" src="${escapeHtml(sigilIcon(slot.sub))}" alt="" loading="lazy" />
          ${sigilPicker(slot.sub, "sigil-sub", "副詞條")}
        </div>
      `;
    })
    .join("");
  els.sigilSlots.innerHTML = `
    <div class="sigil-slot-header" aria-hidden="true">
      <span></span>
      <span></span>
      <span>主因子</span>
      <span>Lvl</span>
      <span></span>
      <span>副因子</span>
    </div>
    ${rows}
  `;
}

function renderWeaponGrid() {
  const eternal = isEternalCharacter();
  els.weaponGrid.innerHTML = `
    ${state.weapon.traits
      .map((trait, index) => `
        <div class="weapon-row" data-weapon-slot="${index}">
          <img class="sigil-icon" src="${escapeHtml(sigilIcon(trait.trait))}" alt="" loading="lazy" />
          ${sigilPicker(trait.trait, "weapon-trait", "武器加護")}
          <input class="weapon-level" type="number" min="0" max="${getTraitLevelCap(trait.trait)}" step="1" value="${escapeHtml(trait.level)}" aria-label="等級" />
        </div>
      `)
      .join("")}
    <label class="toggle">
      <input id="sigilBoosterInput" type="checkbox"${state.weapon.sigilBooster ? " checked" : ""} />
      <span>滿覺醒：因子等級 +1</span>
    </label>
    <label class="toggle">
      <input id="terminusInput" type="checkbox"${eternal || state.weapon.terminus ? " checked" : ""}${eternal ? " disabled" : ""} />
      <span>${eternal ? "十天眾武器：上限 +20%（固定）" : "究極武器：上限 +20%"}</span>
    </label>
  `;
}

function renderLimitBreak() {
  els.limitBreakGrid.innerHTML = Object.entries(state.limitBreak)
    .map(([label, value]) => `
      <label class="field inline-field">
        <span>${escapeHtml(label)}${label === "攻擊力" ? "" : " %"}</span>
        <input class="limit-input" data-label="${escapeHtml(label)}" type="number" step="${label === "攻擊力" ? "1" : "0.1"}" value="${escapeHtml(value)}" />
      </label>
    `)
    .join("");
}

function renderOtherInputs() {
  els.otherInputGrid.innerHTML = Object.entries(state.other)
    .map(([label, value]) => {
      if (typeof value === "boolean") {
        return `
          <label class="toggle">
            <input class="other-input" data-label="${escapeHtml(label)}" type="checkbox"${value ? " checked" : ""} />
            <span>${escapeHtml(label)}</span>
          </label>
        `;
      }
      return `
        <label class="field inline-field">
          <span>${escapeHtml(label)}${label === "當前HP" ? " %" : ""}</span>
          <input class="other-input" data-label="${escapeHtml(label)}" type="number" step="1" value="${escapeHtml(value)}" />
        </label>
      `;
    })
    .join("");
}

function renderCharacterExtras() {
  const entries = Object.entries(state.characterExtras);
  if (!entries.length) {
    els.characterExtraGrid.innerHTML = `<div class="empty-state compact-empty">此角色目前沒有額外條件</div>`;
    return;
  }
  els.characterExtraGrid.innerHTML = entries
    .map(([label, value]) => {
      if (typeof value === "boolean") {
        return `
          <label class="toggle">
            <input class="character-extra-input" data-label="${escapeHtml(label)}" type="checkbox"${value ? " checked" : ""} />
            <span>${escapeHtml(label)}</span>
          </label>
        `;
      }
      return `
        <label class="field inline-field">
          <span>${escapeHtml(label)}</span>
          <input class="character-extra-input" data-label="${escapeHtml(label)}" type="number" step="1" value="${escapeHtml(value)}" />
        </label>
      `;
    })
    .join("");
}

function traitRowClass(name) {
  const color = String(getSigil(name)?.color ?? "").toLowerCase();
  if (color.includes("crit")) return "trait-kind-crit";
  if (color.includes("uniqu")) return "trait-kind-purple";
  if (color.includes("orange")) return "trait-kind-orange";
  if (color.includes("gray")) return "trait-kind-gray";
  if (color.includes("red")) return "trait-kind-red";
  if (color.includes("blue") || color.includes("blu")) return "trait-kind-blue";
  if (color.includes("purple")) return "trait-kind-purple";
  return "trait-kind-none";
}

function liveTraitLevel(name, levels) {
  return levels[name] ?? 0;
}

function renderTraitTable(title, rows, levels) {
  return `
    <div class="trait-table-wrap">
      <div class="trait-table">
        <div class="trait-table-header">
          <span>${escapeHtml(title)}</span>
          <span>Lv</span>
          <span>Max.Lv</span>
        </div>
        ${rows
          .map((item) => {
            const name = item.trait;
            const isToggle = typeof item.level === "boolean";
            const currentLevel = liveTraitLevel(name, levels, item.level);
            const maxLevel = item.maxLevel ?? (isToggle ? "" : getTraitLevelCap(name));
            const levelCell = isToggle
              ? `<span class="trait-check${currentLevel ? " checked" : ""}" aria-label="${currentLevel ? "已啟用" : "未啟用"}"></span>`
              : escapeHtml(formatNumber(currentLevel, 0));
            return `
              <div class="trait-table-row ${traitRowClass(name)}${currentLevel ? " active" : ""}">
                <span class="trait-name">
                  <img src="${escapeHtml(sigilIcon(name))}" alt="" loading="lazy" />
                  <span>${escapeHtml(name)}</span>
                </span>
                <strong>${levelCell}</strong>
                <em>${escapeHtml(maxLevel)}</em>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderTraitSummary() {
  const levels = getTraitLevels();
  const damageTraits = DATA.calculator?.damageTraits ?? [];
  const supportTraits = DATA.calculator?.supportTraits ?? [];
  const activeCount = Object.values(levels).filter((level) => level > 0).length;
  els.traitCount.textContent = `${activeCount} / ${damageTraits.length + supportTraits.length} 項`;
  if (!damageTraits.length && !supportTraits.length) {
    els.traitSummary.innerHTML = `<div class="empty-state">尚未裝備因子</div>`;
    return;
  }
  els.traitSummary.innerHTML = `
    ${renderTraitTable("傷害因子", damageTraits, levels)}
    ${renderTraitTable("輔助因子", supportTraits, levels)}
  `;
}

function renderSkillTable(character, visibleRows) {
  els.rowCount.textContent = `${visibleRows.length} / ${character.skillRows.length} 筆`;

  if (!visibleRows.length) {
    els.skillTable.innerHTML = `<div class="empty-state">找不到符合條件的技能資料</div>`;
    return;
  }

  if (!visibleRows.some(({ index }) => index === state.selectedRowIndex)) {
    state.selectedRowIndex = visibleRows[0].index;
  }

  els.skillTable.innerHTML = visibleRows
    .slice(0, 220)
    .map(({ row, index }) => {
      const active = index === state.selectedRowIndex ? " active" : "";
      const result = calculate(row);
      return `
        <button class="skill-row${active}" type="button" data-row-index="${index}">
          <strong class="col-skill">${escapeHtml(row.skill || "-")}</strong>
          <span class="col-modifier">${escapeHtml(row.modifier || "-")}</span>
          <span class="col-multiplier">${escapeHtml(formatNumber(row.multiplier, 2))}</span>
          <span class="col-base-cap">${escapeHtml(formatNumber(row.damageCap, 0))}</span>
          <span class="col-class">${escapeHtml(row.classification || "-")}</span>
          <span class="col-boost">${escapeHtml(excelPercentCell(result.multiplierBoost))}</span>
          <span class="col-crit-rate">${escapeHtml(excelPercentCell(result.critRate))}</span>
          <span class="col-final-cap metric-cell important-cell">${escapeHtml(resultCell(result.finalCap))}</span>
          <span class="col-normal metric-cell">${escapeHtml(damageCell(result.rawNormalDamage))}</span>
          <span class="col-crit metric-cell important-cell">${escapeHtml(damageCell(result.rawCritDamage))}</span>
          <span class="col-damage-percent metric-cell damage-percent ${damagePercentClass(result.damagePercent)}">${escapeHtml(percentCell(result.damagePercent))}</span>
          <span class="col-overflow metric-cell">${escapeHtml(percentCell(result.overflow, "-"))}</span>
          <span class="col-echo metric-cell">${escapeHtml(resultCell(result.echo, "-"))}</span>
          <span class="col-total metric-cell important-cell">${escapeHtml(resultCell(result.total))}</span>
        </button>
      `;
    })
    .join("");
}

function renderResult(character) {
  const row = character.skillRows[state.selectedRowIndex] ?? character.skillRows[0];
  const result = calculate(row);
  const title = row?.skill || row?.modifier || "未選取技能";
  const subtitle = row?.skill && row?.modifier ? row.modifier : character.nameZh;
  const unsupported = result.total === null;

  els.selectedSkillName.textContent = title;
  els.selectedClass.textContent = row?.classification || "-";
  els.selectedSkillMeta.textContent = unsupported
    ? `${subtitle} / 此列不是一般可估算傷害：倍率或上限不是數值`
    : `${subtitle} / CD ${formatNumber(row?.cooldown, 2)} / ${row?.notes || "無備註"}`;
  els.resultMultiplier.textContent = formatNumber(result.multiplier, 2);
  els.resultBaseCap.textContent = resultCell(result.baseCap, "-");
  els.resultClassification.textContent = row?.classification || "-";
  els.resultMultiplierBoost.textContent = excelPercentCell(result.multiplierBoost, "-");
  els.resultCritRate.textContent = excelPercentCell(result.critRate, "-");
  els.resultFinalCap.textContent = resultCell(result.finalCap, "-");
  els.resultAttack.textContent = resultCell(result.attack, "-");
  els.resultNormal.textContent = damageCell(result.rawNormalDamage, "-");
  els.resultCrit.textContent = damageCell(result.rawCritDamage, "-");
  els.resultAverage.textContent = resultCell(result.average, "-");
  els.resultEcho.textContent = resultCell(result.echo, "-");
  els.resultDamagePercent.textContent = percentCell(result.damagePercent, "-");
  els.resultOverflow.textContent = percentCell(result.overflow, "-");
  els.resultTotal.textContent = resultCell(result.total, "-");
}

function renderVerificationNote() {
  if (!els.verificationNote) return;
  if (isDefaultZetaState()) {
    els.verificationNote.textContent = `瑟塔預設配置已驗證：${ZETA_DEFAULT_VERIFICATION.matched}/${ZETA_DEFAULT_VERIFICATION.checked} 筆可計算列對齊 Excel；非數值列會標示不估算。`;
    els.verificationNote.dataset.status = "verified";
  } else if (state.characterId === "zeta") {
    els.verificationNote.textContent = "瑟塔公式已移植到目前介面；此配置不是 Excel 預設快照，尚未逐筆回歸驗證。";
    els.verificationNote.dataset.status = "partial";
  } else {
    els.verificationNote.textContent = "目前只有瑟塔預設配置完成逐筆驗證；其他角色仍在移植中。";
    els.verificationNote.dataset.status = "pending";
  }
}

function renderShell() {
  renderCharacters();
  renderSigilSlots();
  renderWeaponGrid();
  renderLimitBreak();
  renderOtherInputs();
  renderCharacterExtras();
}

function render() {
  const character = getCharacter();
  const visibleRows = getVisibleRows(character);
  els.sourceMeta.textContent = DATA.meta?.sourceName ?? "Damage Calculator";
  els.characterName.textContent = character.nameZh;
  els.characterMeta.textContent = `${character.skillRows.length} 筆技能倍率資料 / ${sigils.length} 個因子`;
  els.characterAvatar.src = characterAvatarPath(character);
  els.characterAvatar.alt = character.nameZh;
  renderSkillFilters(character);
  renderTraitSummary();
  renderSkillTable(character, visibleRows);
  renderResult(character);
  renderCalculatorGrid();
  renderVerificationNote();
}

function closeSigilPickers(except = null) {
  document.querySelectorAll(".sigil-picker.open").forEach((picker) => {
    if (picker === except) return;
    picker.classList.remove("open");
    picker.querySelector(".sigil-picker-toggle")?.setAttribute("aria-expanded", "false");
  });
}

function syncSigilSlot(slotElement, ensureLevel = false) {
  const index = Number(slotElement.dataset.slot);
  const slot = state.build[index];
  slot.main = slotElement.querySelector(".sigil-main").value || NONE;
  slot.sub = slotElement.querySelector(".sigil-sub").value || NONE;
  slot.level = Math.max(0, Math.min(getTraitLevelCap(slot.main), numberInput(slotElement.querySelector(".sigil-level"), 0)));
  if (ensureLevel && (slot.main !== NONE || slot.sub !== NONE) && slot.level <= 0) {
    slot.level = Math.min(15, getTraitLevelCap(slot.main !== NONE ? slot.main : slot.sub));
  }
}

function syncWeaponRow(weaponRow) {
  const index = Number(weaponRow.dataset.weaponSlot);
  const weaponTrait = state.weapon.traits[index];
  weaponTrait.trait = weaponRow.querySelector(".weapon-trait").value || NONE;
  weaponTrait.level = Math.max(0, Math.min(getTraitLevelCap(weaponTrait.trait), numberInput(weaponRow.querySelector(".weapon-level"), 0)));
}

function commitSigilPickerChoice(option) {
  const picker = option.closest(".sigil-picker");
  const input = picker?.querySelector("input");
  if (!picker || !input) return;
  input.value = option.dataset.value || NONE;
  closeSigilPickers();

  const slotElement = picker.closest(".sigil-slot");
  if (slotElement) {
    syncSigilSlot(slotElement, true);
    renderSigilSlots();
    render();
    return;
  }

  const weaponRow = picker.closest(".weapon-row");
  if (weaponRow) {
    syncWeaponRow(weaponRow);
    renderWeaponGrid();
    render();
  }
}

els.characterPickerButton.addEventListener("click", () => {
  const open = els.characterPickerMenu.classList.toggle("open");
  els.characterPickerButton.setAttribute("aria-expanded", String(open));
});

els.characterPickerMenu.addEventListener("click", (event) => {
  const button = event.target.closest(".character-option");
  if (!button) return;
  state.characterId = button.dataset.characterId;
  state.selectedRowIndex = 0;
  state.skillFilter = "";
  applyCharacterBaseDefaults();
  state.characterExtras = makeCharacterExtraState(getCharacter());
  els.characterPickerMenu.classList.remove("open");
  els.characterPickerButton.setAttribute("aria-expanded", "false");
  renderCharacters();
  renderCharacterExtras();
  render();
  refreshPresetList();
});

document.addEventListener("click", (event) => {
  const toggle = event.target.closest(".sigil-picker-toggle");
  if (toggle) {
    const picker = toggle.closest(".sigil-picker");
    const willOpen = !picker.classList.contains("open");
    closeSigilPickers(picker);
    picker.classList.toggle("open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    return;
  }

  const option = event.target.closest(".sigil-picker-option");
  if (option) {
    commitSigilPickerChoice(option);
    return;
  }

  if (!event.target.closest(".sigil-picker")) {
    closeSigilPickers();
  }

  if (event.target.closest(".character-picker")) return;
  els.characterPickerMenu.classList.remove("open");
  els.characterPickerButton.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSigilPickers();
});

els.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

els.skillFilterSelect.addEventListener("change", (event) => {
  state.skillFilter = event.target.value;
  state.selectedRowIndex = 0;
  render();
});

els.damageMin.addEventListener("input", (event) => {
  state.damagePercentMin = event.target.value;
  render();
});

els.damageMax.addEventListener("input", (event) => {
  state.damagePercentMax = event.target.value;
  render();
});

els.fullTableButton.addEventListener("click", () => {
  state.tableMode = "full";
  render();
});

els.compactTableButton.addEventListener("click", () => {
  state.tableMode = "compact";
  render();
});

for (const input of [els.attack, els.critRate, els.critDamage, els.manualDamage]) {
  input.addEventListener("input", () => {
    syncBaseInputs();
    render();
  });
}

els.sigilSlots.addEventListener("input", (event) => {
  const slotElement = event.target.closest(".sigil-slot");
  if (!slotElement) return;
  syncSigilSlot(slotElement);
  renderSigilSlots();
  render();
});

els.sigilSlots.addEventListener("change", (event) => {
  if (!event.target.matches(".sigil-main, .sigil-sub")) return;
  const slotElement = event.target.closest(".sigil-slot");
  if (!slotElement) return;
  syncSigilSlot(slotElement, true);
  renderSigilSlots();
  render();
});

els.weaponGrid.addEventListener("input", (event) => {
  const weaponRow = event.target.closest(".weapon-row");
  if (weaponRow) {
    syncWeaponRow(weaponRow);
    renderWeaponGrid();
    render();
    return;
  }

  if (event.target.id === "sigilBoosterInput") {
    state.weapon.sigilBooster = event.target.checked;
    render();
  }
  if (event.target.id === "terminusInput") {
    state.weapon.terminus = event.target.checked;
    render();
  }
});

els.limitBreakGrid.addEventListener("input", (event) => {
  const input = event.target.closest(".limit-input");
  if (!input) return;
  state.limitBreak[input.dataset.label] = Number(input.value) || 0;
  render();
});

els.otherInputGrid.addEventListener("input", (event) => {
  const input = event.target.closest(".other-input");
  if (!input) return;
  state.other[input.dataset.label] = input.type === "checkbox" ? input.checked : Number(input.value) || 0;
  render();
});

els.characterExtraGrid.addEventListener("input", (event) => {
  const input = event.target.closest(".character-extra-input");
  if (!input) return;
  state.characterExtras[input.dataset.label] = input.type === "checkbox" ? input.checked : Number(input.value) || 0;
  render();
});

els.skillTable.addEventListener("click", (event) => {
  const button = event.target.closest(".skill-row");
  if (!button) return;
  state.selectedRowIndex = Number(button.dataset.rowIndex);
  render();
});

els.resetBuildButton.addEventListener("click", () => {
  state.build = makeDefaultBuild();
  state.weapon = makeWeaponState();
  state.characterExtras = makeCharacterExtraState(getCharacter());
  renderSigilSlots();
  renderWeaponGrid();
  renderCharacterExtras();
  render();
});

els.presetSettingsButton.addEventListener("click", () => {
  els.presetSettings.hidden = !els.presetSettings.hidden;
});

els.savePresetSettings.addEventListener("click", () => {
  localStorage.setItem(PRESET_STORAGE_KEYS.endpoint, els.presetEndpoint.value.trim());
  localStorage.setItem(PRESET_STORAGE_KEYS.secret, els.presetSecret.value.trim());
  setPresetStatus("已儲存 Google Drive 存檔設定。");
  refreshPresetList();
});

els.testPresetSettings.addEventListener("click", () => {
  localStorage.setItem(PRESET_STORAGE_KEYS.endpoint, els.presetEndpoint.value.trim());
  localStorage.setItem(PRESET_STORAGE_KEYS.secret, els.presetSecret.value.trim());
  testPresetConnection();
});

els.savePreset.addEventListener("click", saveCurrentPreset);
els.loadPreset.addEventListener("click", loadSelectedPreset);
els.deletePreset.addEventListener("click", deleteSelectedPreset);
els.refreshPreset.addEventListener("click", refreshPresetList);
els.cancelPresetDelete.addEventListener("click", () => {
  els.presetDeletePanel.hidden = true;
});
els.confirmPresetDelete.addEventListener("click", deleteCheckedPresets);

syncBaseInputs();
renderShell();
render();
initPresetUi();
importLogsDataFromUrl();
