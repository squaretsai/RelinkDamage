const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_EXPORT = path.join(ROOT, "verification-workbooks", "relink-sheet-export.json");
const DATA_FILE = path.join(ROOT, "damage", "data", "damage-calculator.js");

const IGNORE_SHEETS = new Set([
  "Calculator",
  "Additional Resources",
  "Constants",
  "Sigils",
  "SigilValidation",
  "Version Log",
  "Template",
]);

function loadData() {
  const source = fs.readFileSync(DATA_FILE, "utf8");
  const context = {};
  vm.runInNewContext(`${source}\nthis.DATA = RELINK_DAMAGE_CALCULATOR;`, context);
  return context.DATA;
}

function loadExport(file) {
  if (!fs.existsSync(file)) throw new Error(`找不到 Google Sheet 匯出檔：${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function cellValue(row, index) {
  const cell = row?.[index];
  return cell ? cell.value : null;
}

function cellFormula(row, index) {
  const cell = row?.[index];
  return cell ? cell.formula || "" : "";
}

function text(value) {
  return String(value ?? "").trim();
}

function num(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function almostEqual(a, b, tolerance) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return Math.abs(a - b) <= tolerance;
}

function round(value, digits = 6) {
  const n = num(value);
  if (n === null) return "";
  return Number(n.toFixed(digits));
}

function normalizeClass(value) {
  return text(value);
}

function normalizeSkill(value) {
  return text(value).replace(/\s+/g, " ");
}

function normalizeModifier(value) {
  return text(value).replace(/\s+/g, " ");
}

function rowKey(row) {
  return [
    normalizeSkill(row.skill),
    normalizeModifier(row.modifier),
    normalizeClass(row.classification),
    round(row.multiplier, 6),
    round(row.damageCap, 3),
  ].join("||");
}

function findHeaderRow(sheet) {
  return sheet.cells.findIndex((row) => {
    const values = row.map((cell) => text(cell?.value));
    return values.includes("Skill") && values.includes("Modifier") && values.some((v) => v === "DMG Cap");
  });
}

function parseCharacterSheet(sheet) {
  const headerIndex = findHeaderRow(sheet);
  if (headerIndex < 0) return { headerIndex, rows: [] };

  const rows = [];
  let currentSkill = "";
  for (let r = headerIndex + 1; r < sheet.cells.length; r += 1) {
    const raw = sheet.cells[r] || [];
    const isBlank = raw.every((cell) => !text(cell?.value) && !text(cell?.formula));
    if (isBlank && rows.length > 0) break;

    const skill = text(cellValue(raw, 0));
    if (skill) currentSkill = skill;

    const modifier = cellValue(raw, 1);
    const multiplier = num(cellValue(raw, 2));
    const damageCap = num(cellValue(raw, 3));
    const classification = cellValue(raw, 5);

    if (!currentSkill || multiplier === null || damageCap === null) continue;
    rows.push({
      sheetRow: r + 1,
      skill: currentSkill,
      modifier,
      multiplier,
      damageCap,
      classification,
      baseRatio: num(cellValue(raw, 6)),
      notes: cellValue(raw, 7),
    });
  }

  return { headerIndex, rows };
}

function compareSkillRows(sheetRows, webRows) {
  const sheetByKey = new Map(sheetRows.map((row) => [rowKey(row), row]));
  const webByKey = new Map(webRows.map((row) => [rowKey(row), row]));
  const missingInWeb = [];
  const extraInWeb = [];
  const valueDiffs = [];

  for (const sheetRow of sheetRows) {
    const webRow = webByKey.get(rowKey(sheetRow));
    if (!webRow) {
      missingInWeb.push(sheetRow);
      continue;
    }
    const checks = [
      ["multiplier", 0.000001],
      ["damageCap", 0.001],
    ];
    for (const [key, tolerance] of checks) {
      if (!almostEqual(num(sheetRow[key]), num(webRow[key]), tolerance)) {
        valueDiffs.push({ key, sheetRow, webRow });
      }
    }
  }

  for (const webRow of webRows) {
    if (!sheetByKey.has(rowKey(webRow))) extraInWeb.push(webRow);
  }

  return { missingInWeb, extraInWeb, valueDiffs };
}

function parseConstantsCharacters(sheet) {
  const rows = [];
  for (const row of sheet.cells) {
    const character = text(cellValue(row, 8));
    if (!character || character === "Character") continue;
    rows.push({
      character,
      image: text(cellValue(row, 9)),
      input: text(cellValue(row, 11)),
      inputBoolean: text(cellValue(row, 12)),
      build1: text(cellValue(row, 13)),
      build2: text(cellValue(row, 14)),
      warpathBonus: num(cellValue(row, 15)),
      warpathCondition: text(cellValue(row, 16)),
    });
  }
  return rows;
}

function compareConstants(constantsRows, data) {
  const byCharacter = new Map(constantsRows.map((row) => [row.character, row]));
  const diffs = [];
  for (const character of data.characters) {
    const source = byCharacter.get(character.nameZh);
    if (!source) {
      diffs.push({ character: character.nameZh, issue: "Constants 找不到角色" });
      continue;
    }
    const expectedBonus = source.warpathBonus || 0;
    const actualBonus = character.warpathBonus || 0;
    if (!almostEqual(expectedBonus, actualBonus, 0.000001)) {
      diffs.push({
        character: character.nameZh,
        field: "warpathBonus",
        sheet: expectedBonus,
        web: actualBonus,
      });
    }
    const expectedCondition = source.warpathCondition || "";
    const actualCondition = character.warpathCondition || "";
    if (expectedCondition !== actualCondition) {
      diffs.push({
        character: character.nameZh,
        field: "warpathCondition",
        sheet: expectedCondition,
        web: actualCondition,
      });
    }
  }
  return diffs;
}

function scanCalculatorFormulaBranches(sheet) {
  const branches = new Map();
  const formulas = [];
  const currentCharPattern = /currentChar\s*=\s*"([^"]+)"/g;
  for (const row of sheet.cells) {
    for (const cell of row) {
      const formula = cellFormula([cell], 0);
      if (!formula) continue;
      formulas.push({ a1: cell.a1, formula });
      let match;
      while ((match = currentCharPattern.exec(formula))) {
        const character = match[1];
        if (!branches.has(character)) branches.set(character, []);
        branches.get(character).push(cell.a1);
      }
    }
  }
  return {
    formulas: formulas.length,
    characterBranches: [...branches.entries()]
      .map(([character, cells]) => ({ character, cells: [...new Set(cells)].sort() }))
      .sort((a, b) => a.character.localeCompare(b.character, "zh-Hant")),
  };
}

function audit(exportFile) {
  const exported = loadExport(exportFile);
  const data = loadData();

  const sheetByName = new Map(exported.sheets.map((sheet) => [sheet.name, sheet]));
  const characterReports = [];
  for (const character of data.characters) {
    const sheet = sheetByName.get(character.nameZh);
    if (!sheet) {
      characterReports.push({ character: character.nameZh, status: "missing_sheet" });
      continue;
    }
    const parsed = parseCharacterSheet(sheet);
    const compared = compareSkillRows(parsed.rows, character.skillRows || []);
    characterReports.push({
      character: character.nameZh,
      sheetRows: parsed.rows.length,
      webRows: character.skillRows?.length || 0,
      missingInWeb: compared.missingInWeb.slice(0, 20),
      extraInWeb: compared.extraInWeb.slice(0, 20),
      valueDiffs: compared.valueDiffs.slice(0, 20),
      missingCount: compared.missingInWeb.length,
      extraCount: compared.extraInWeb.length,
      valueDiffCount: compared.valueDiffs.length,
    });
  }

  const orphanSheetNames = exported.sheets
    .map((sheet) => sheet.name)
    .filter((name) => !IGNORE_SHEETS.has(name))
    .filter((name) => !data.characters.some((character) => character.nameZh === name));

  const constants = parseConstantsCharacters(sheetByName.get("Constants"));
  const constantDiffs = compareConstants(constants, data);
  const calculatorScan = scanCalculatorFormulaBranches(sheetByName.get("Calculator"));

  return {
    exportedAt: exported.exportedAt,
    spreadsheet: exported.spreadsheet?.name || exported.spreadsheet || null,
    characterCount: data.characters.length,
    orphanSheetNames,
    characterReports,
    constantDiffs,
    calculatorScan,
  };
}

function printReport(report) {
  console.log(`Google Sheet 匯出：${report.spreadsheet || "(未命名)"}`);
  console.log(`匯出時間：${report.exportedAt || "(未知)"}`);
  console.log(`網站角色數：${report.characterCount}`);
  console.log("");

  const problemCharacters = report.characterReports.filter(
    (item) => item.missingCount || item.extraCount || item.valueDiffCount || item.status,
  );
  console.log(`角色技能表比對：${report.characterReports.length - problemCharacters.length}/${report.characterReports.length} 完全一致`);
  for (const item of problemCharacters) {
    console.log(
      `- ${item.character}: sheet=${item.sheetRows || 0}, web=${item.webRows || 0}, missing=${item.missingCount || 0}, extra=${item.extraCount || 0}, valueDiff=${item.valueDiffCount || 0}`,
    );
    for (const row of item.missingInWeb || []) {
      console.log(`  missing web: ${row.skill} / ${row.modifier} / ${row.classification} / x${row.multiplier} / cap ${row.damageCap}`);
    }
    for (const row of item.extraInWeb || []) {
      console.log(`  extra web: ${row.skill} / ${row.modifier} / ${row.classification} / x${row.multiplier} / cap ${row.damageCap}`);
    }
  }
  if (report.orphanSheetNames.length) {
    console.log(`Google Sheet 有但網站沒有的角色分頁：${report.orphanSheetNames.join(", ")}`);
  }
  console.log("");

  console.log(`Constants 角色特殊條件比對：${report.constantDiffs.length ? "有差異" : "一致"}`);
  for (const diff of report.constantDiffs) {
    console.log(`- ${diff.character}: ${diff.field || diff.issue} sheet=${diff.sheet ?? ""} web=${diff.web ?? ""}`);
  }
  console.log("");

  console.log(`Calculator 公式掃描：${report.calculatorScan.formulas} 個公式`);
  console.log("含 currentChar 分支的角色：");
  for (const branch of report.calculatorScan.characterBranches) {
    const sample = branch.cells.slice(0, 8).join(", ");
    const suffix = branch.cells.length > 8 ? ` ... +${branch.cells.length - 8}` : "";
    console.log(`- ${branch.character}: ${branch.cells.length} 格 (${sample}${suffix})`);
  }
}

const exportFile = path.resolve(process.argv[2] || DEFAULT_EXPORT);
const report = audit(exportFile);
const outDir = path.join(ROOT, "reports");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "google-sheet-audit-report.json");
fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf8");
printReport(report);
console.log("");
console.log(`完整 JSON 報告：${outFile}`);
