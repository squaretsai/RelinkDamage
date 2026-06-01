const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_EXPORT = path.join(ROOT, "verification-workbooks", "relink-sheet-export.json");
const FIELDS = [
  ["multiplierBoost", "H", 7, 0.0001],
  ["critRate", "I", 8, 0.0001],
  ["finalCap", "J", 9, 1],
  ["rawNormalDamage", "L", 11, 1],
  ["rawCritDamage", "M", 12, 1],
  ["damagePercent", "N", 13, 0.0001],
  ["overflow", "O", 14, 0.0001],
  ["echo", "Q", 16, 1],
  ["total", "R", 17, 1],
];

function cellValue(row, index) {
  return row?.[index]?.value ?? null;
}

function text(value) {
  return String(value ?? "").trim();
}

function round(value, digits = 6) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return Number(n.toFixed(digits));
}

function keyFor(row) {
  return [
    text(row.skill),
    text(row.modifier),
    text(row.classification),
    round(row.multiplier, 6),
    round(row.damageCap, 3),
  ].join("||");
}

function fakeElement() {
  return {
    value: "",
    checked: false,
    innerHTML: "",
    textContent: "",
    dataset: {},
    src: "",
    alt: "",
    classList: {
      add() {},
      remove() {},
      toggle() {},
    },
    addEventListener() {},
    setAttribute() {},
    querySelector() {
      return fakeElement();
    },
    closest() {
      return null;
    },
    matches() {
      return false;
    },
  };
}

function parseCalculatorRows(exported) {
  const sheet = exported.sheets.find((item) => item.name === "Calculator");
  const rows = [];
  let currentSkill = "";
  for (let r = 35; r < sheet.cells.length; r += 1) {
    const raw = sheet.cells[r] || [];
    const skill = text(cellValue(raw, 0));
    if (skill) currentSkill = skill;
    const multiplier = Number(cellValue(raw, 2));
    const damageCap = Number(cellValue(raw, 3));
    if (!currentSkill || !Number.isFinite(multiplier) || !Number.isFinite(damageCap)) continue;
    if (multiplier <= 0 && damageCap <= 0 && !text(cellValue(raw, 5))) continue;
    const row = {
      sheetRow: r + 1,
      skill: currentSkill,
      modifier: cellValue(raw, 1),
      multiplier,
      damageCap,
      classification: cellValue(raw, 5),
    };
    for (const [field, , index] of FIELDS) row[field] = cellValue(raw, index);
    rows.push(row);
  }
  return rows;
}

function sheetCell(sheet, a1) {
  for (const row of sheet.cells) {
    for (const cell of row) {
      if (cell?.a1 === a1) return cell.value;
    }
  }
  return null;
}

function applyCalculatorState(app, exported) {
  const sheet = exported.sheets.find((item) => item.name === "Calculator");
  const characterName = sheetCell(sheet, "B5");
  const character = app.RELINK_DAMAGE_CALCULATOR.characters.find((item) => item.nameZh === characterName);
  if (character) app.__state.characterId = character.id;
  app.__applyCharacterBaseDefaults();

  app.__state.build = [];
  for (let row = 7; row <= 18; row += 1) {
    app.__state.build.push({
      main: sheetCell(sheet, `E${row}`) || "None",
      level: Number(sheetCell(sheet, `F${row}`)) || 0,
      sub: sheetCell(sheet, `H${row}`) || "None",
    });
  }

  app.__state.weapon = {
    traits: [21, 22, 23].map((row) => ({
      trait: sheetCell(sheet, `E${row}`) || "None",
      level: Number(sheetCell(sheet, `F${row}`)) || 0,
    })),
    sigilBooster: Boolean(sheetCell(sheet, "H22")),
    terminus: Boolean(sheetCell(sheet, "H24")),
  };

  app.__state.limitBreak = {};
  for (let row = 16; row <= 22; row += 1) {
    const label = sheetCell(sheet, `A${row}`);
    if (!label) continue;
    const raw = Number(sheetCell(sheet, `B${row}`)) || 0;
    app.__state.limitBreak[label] = label === "攻擊力" ? raw : raw * 100;
  }

  app.__state.other = {
    技能數量: Number(sheetCell(sheet, "F26")) || 0,
    攻擊力強化: (Number(sheetCell(sheet, "F27")) || 0) * 100,
    防禦下降: (Number(sheetCell(sheet, "F28")) || 0) * 100,
    "連技加成?": Boolean(sheetCell(sheet, "F29")),
    當前HP: (Number(sheetCell(sheet, "F30")) || 0) * 100,
    "背後部位攻擊?": Boolean(sheetCell(sheet, "F31")),
    "弱點部位攻擊?": Boolean(sheetCell(sheet, "F32")),
    "Link Time?": Boolean(sheetCell(sheet, "F33")),
  };

  app.__state.characterExtras = {};
  for (let row = 25; row <= 28; row += 1) {
    const label = sheetCell(sheet, `A${row}`);
    if (!label || label === "N/A") continue;
    app.__state.characterExtras[label] = sheetCell(sheet, `B${row}`);
  }
}

function loadApp() {
  const elements = new Map();
  const document = {
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, fakeElement());
      return elements.get(selector);
    },
    addEventListener() {},
    createElement() {
      return fakeElement();
    },
    body: {
      append() {},
    },
  };
  const context = {
    console,
    document,
    window: {
      setTimeout() {
        return 0;
      },
      clearTimeout() {},
      addEventListener() {},
      removeEventListener() {},
    },
    localStorage: {
      getItem() {
        return "";
      },
      setItem() {},
    },
    RELINK_DAMAGE_CALCULATOR: null,
  };
  const dataScript = fs.readFileSync(path.join(ROOT, "damage", "data", "damage-calculator.js"), "utf8");
  const appScript = fs.readFileSync(path.join(ROOT, "damage", "app.js"), "utf8");
  vm.runInNewContext(`${dataScript}\nthis.RELINK_DAMAGE_CALCULATOR = RELINK_DAMAGE_CALCULATOR;`, context);
  vm.runInNewContext(`${appScript}\nthis.__state = state; this.__calculate = calculate; this.__getCharacter = getCharacter; this.__applyCharacterBaseDefaults = applyCharacterBaseDefaults;`, context);
  return context;
}

const exportFile = path.resolve(process.argv[2] || DEFAULT_EXPORT);
const exported = JSON.parse(fs.readFileSync(exportFile, "utf8"));
const calculatorRows = parseCalculatorRows(exported);
const app = loadApp();
applyCalculatorState(app, exported);
const character = app.__getCharacter();
const webRows = character.skillRows.map((row) => [keyFor(row), row]);
const webByKey = new Map(webRows);
const diffs = [];

for (const sheetRow of calculatorRows) {
  const webRow = webByKey.get(keyFor(sheetRow));
  if (!webRow) {
    diffs.push({ type: "missing-web-row", sheetRow });
    continue;
  }
  const result = app.__calculate(webRow);
  for (const [field, column, , tolerance] of FIELDS) {
    const expected = Number(sheetRow[field]);
    const actual = Number(result[field]);
    if (!Number.isFinite(expected) && !Number.isFinite(actual)) continue;
    if (!Number.isFinite(expected) || !Number.isFinite(actual) || Math.abs(expected - actual) > tolerance) {
      diffs.push({
        type: "value-diff",
        sheetRow: sheetRow.sheetRow,
        field,
        column,
        skill: sheetRow.skill,
        modifier: sheetRow.modifier,
        expected,
        actual,
      });
    }
  }
}

console.log(`目前 Calculator 角色：${character.nameZh}`);
console.log(`比對列數：${calculatorRows.length}`);
console.log(`差異數：${diffs.length}`);
for (const diff of diffs.slice(0, 40)) {
  console.log(JSON.stringify(diff));
}
