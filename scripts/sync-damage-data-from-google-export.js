const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_EXPORT = path.join(ROOT, "verification-workbooks", "relink-sheet-export.json");
const DATA_FILE = path.join(ROOT, "damage", "data", "damage-calculator.js");

function loadData() {
  const source = fs.readFileSync(DATA_FILE, "utf8");
  const context = {};
  vm.runInNewContext(`${source}\nthis.DATA = RELINK_DAMAGE_CALCULATOR;`, context);
  return context.DATA;
}

function loadExport(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function value(row, index) {
  return row?.[index]?.value ?? null;
}

function text(input) {
  return String(input ?? "").trim();
}

function numberOrOriginal(input) {
  if (input === null || input === undefined || input === "") return null;
  const n = Number(input);
  return Number.isFinite(n) ? n : input;
}

function numberOrNull(input) {
  if (input === null || input === undefined || input === "") return null;
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}

function round(input, digits = 6) {
  const n = Number(input);
  if (!Number.isFinite(n)) return "";
  return Number(n.toFixed(digits));
}

function rowKey(row) {
  return [
    text(row.skill).replace(/\s+/g, " "),
    text(row.modifier).replace(/\s+/g, " "),
    text(row.classification),
    round(row.multiplier, 6),
    round(row.damageCap, 3),
  ].join("||");
}

function findHeaderRow(sheet) {
  return sheet.cells.findIndex((row) => {
    const values = row.map((cell) => text(cell?.value));
    return values.includes("Skill") && values.includes("Modifier") && values.includes("DMG Cap");
  });
}

function parseCharacterRows(sheet) {
  const headerIndex = findHeaderRow(sheet);
  if (headerIndex < 0) return [];

  const rows = [];
  let currentSkill = "";
  for (let r = headerIndex + 1; r < sheet.cells.length; r += 1) {
    const raw = sheet.cells[r] || [];
    const blank = raw.every((cell) => !text(cell?.value) && !text(cell?.formula));
    if (blank && rows.length > 0) break;

    const skill = text(value(raw, 0));
    if (skill) currentSkill = skill;

    const multiplier = numberOrNull(value(raw, 2));
    const damageCap = numberOrNull(value(raw, 3));
    if (!currentSkill || multiplier === null || damageCap === null) continue;

    rows.push({
      skill: currentSkill,
      modifier: value(raw, 1),
      multiplier,
      damageCap,
      cooldown: numberOrOriginal(value(raw, 4)),
      classification: value(raw, 5),
      baseRatio: numberOrOriginal(value(raw, 6)),
      notes: value(raw, 7),
    });
  }
  return rows;
}

function parseConstants(sheet) {
  const map = new Map();
  for (const row of sheet.cells) {
    const character = text(value(row, 8));
    if (!character || character === "Character") continue;
    map.set(character, {
      warpathBonus: Number(value(row, 15)) || 0,
      warpathCondition: text(value(row, 16)),
    });
  }
  return map;
}

function sync(exportFile) {
  const exported = loadExport(exportFile);
  const data = loadData();
  const sheets = new Map(exported.sheets.map((sheet) => [sheet.name, sheet]));
  const constants = parseConstants(sheets.get("Constants"));
  const changes = [];

  for (const character of data.characters) {
    const sheet = sheets.get(character.nameZh);
    if (!sheet) continue;

    const sourceRows = parseCharacterRows(sheet);
    const existingByKey = new Map((character.skillRows || []).map((row) => [rowKey(row), row]));
    const syncedRows = sourceRows.map((sourceRow) => ({
      ...(existingByKey.get(rowKey(sourceRow)) || {}),
      ...sourceRow,
    }));

    if (syncedRows.length && syncedRows.length !== character.skillRows.length) {
      changes.push(`${character.nameZh}: skillRows ${character.skillRows.length} -> ${syncedRows.length}`);
    }
    character.skillRows = syncedRows;

    const constant = constants.get(character.nameZh);
    if (constant) {
      if ((character.warpathBonus || 0) !== constant.warpathBonus) {
        changes.push(`${character.nameZh}: warpathBonus ${character.warpathBonus || 0} -> ${constant.warpathBonus}`);
        character.warpathBonus = constant.warpathBonus;
      }
      if ((character.warpathCondition || "") !== constant.warpathCondition) {
        changes.push(`${character.nameZh}: warpathCondition "${character.warpathCondition || ""}" -> "${constant.warpathCondition}"`);
        character.warpathCondition = constant.warpathCondition;
      }
    }
  }

  data.meta = {
    ...data.meta,
    googleSheetExportedAt: exported.exportedAt,
    syncedFromGoogleSheetExportAt: new Date().toISOString(),
  };

  const output = `const RELINK_DAMAGE_CALCULATOR = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(DATA_FILE, output, "utf8");
  return changes;
}

const exportFile = path.resolve(process.argv[2] || DEFAULT_EXPORT);
const changes = sync(exportFile);
if (!changes.length) {
  console.log("沒有需要同步的差異。");
} else {
  console.log("已同步 Google Sheet 匯出資料：");
  for (const change of changes) console.log(`- ${change}`);
}
