const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");
const DEFAULT_XLSX = path.join(REPORT_DIR, "zeta-stress-recalculated.xlsx");
const PYTHON =
  process.env.RELINK_PYTHON ||
  "C:\\Users\\User\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";

const FIELDS = [
  { key: "multiplierBoost", label: "倍率提升", excel: "multiplierBoost", tolerance: 0.0001, kind: "percent" },
  { key: "critRate", label: "暴擊機率", excel: "critRate", tolerance: 0.0001, kind: "percent" },
  { key: "finalCap", label: "傷害上限", excel: "finalCap", tolerance: 1, kind: "damage" },
  { key: "rawNormalDamage", label: "無暴擊傷害", excel: "normalDamage", tolerance: 1, kind: "damage" },
  { key: "rawCritDamage", label: "暴擊傷害", excel: "critDamage", tolerance: 1, kind: "damage" },
  { key: "damagePercent", label: "傷害百分比", excel: "damagePercent", tolerance: 0.0001, kind: "percent" },
  { key: "overflow", label: "傷害溢出", excel: "overflow", tolerance: 0.0001, kind: "percent" },
  { key: "echo", label: "追擊傷害", excel: "echoDamage", tolerance: 1, kind: "damage" },
  { key: "total", label: "AVG Total DMG", excel: "avgTotalDamage", tolerance: 1, kind: "damage" },
];

function workbookPath() {
  const input = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_XLSX;
  if (!fs.existsSync(input)) {
    throw new Error(`找不到已重算的 Excel 檔：${input}`);
  }
  return input;
}

function extractExcelRows(xlsxPath) {
  const code = `
import json
from openpyxl import load_workbook
path = r'''${xlsxPath}'''
wb = load_workbook(path, data_only=True, read_only=True)
ws = wb["Calculator"]
rows = []
current_skill = None
for r in range(36, 220):
    vals = [ws.cell(r, c).value for c in range(1, 19)]
    if all(v is None for v in vals):
        if rows:
            break
        continue
    skill = vals[0]
    modifier = vals[1]
    multiplier = vals[2]
    damage_cap = vals[3]
    classification = vals[5]
    if skill:
        current_skill = skill
    if modifier is None and multiplier is None and damage_cap is None and classification is None:
        continue
    if not isinstance(multiplier, (int, float)) or not isinstance(damage_cap, (int, float)):
        continue
    rows.append({
        "excelRow": r,
        "skill": current_skill,
        "modifier": modifier,
        "multiplier": multiplier,
        "damageCap": damage_cap,
        "classification": classification,
        "multiplierBoost": vals[7],
        "critRate": vals[8],
        "finalCap": vals[9],
        "normalDamage": vals[11],
        "critDamage": vals[12],
        "damagePercent": vals[13],
        "overflow": vals[14],
        "echoDamage": vals[16],
        "avgTotalDamage": vals[17],
    })
print(json.dumps(rows, ensure_ascii=False))
`;
  return JSON.parse(
    execFileSync(PYTHON, ["-c", code], {
      encoding: "utf8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
      maxBuffer: 10 * 1024 * 1024,
    }),
  );
}

function keyFor(row) {
  return `${row.skill ?? ""}\u0001${row.modifier ?? ""}\u0001${Number(row.multiplier)}\u0001${Number(row.damageCap)}\u0001${row.classification ?? ""}`;
}

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatValue(value, kind) {
  if (value === null || value === undefined || Number.isNaN(value)) return "null";
  if (kind === "percent") return `${(Number(value) * 100).toFixed(4)}%`;
  return Number(value).toLocaleString("zh-TW", { maximumFractionDigits: 4 });
}

async function extractWebRows() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1720, height: 1000 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file:///${ROOT.replace(/\\/g, "/")}/damage/index.html?sheetCompare=${Date.now()}`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(250);
    const rows = await page.evaluate(() => {
      const zeta = DATA.characters.find((item) => item.id === "zeta" || item.nameZh === "瑟塔");
      if (!zeta) throw new Error("找不到瑟塔資料");
      const build = [
        { main: "傷害上限", level: 12, sub: "攻擊力" },
        { main: "暴擊機率", level: 9, sub: "暴擊傷害" },
        { main: "渾身", level: 14, sub: "背水" },
        { main: "暴君", level: 10, sub: "捨身" },
        { main: "技能傷害", level: 8, sub: "連技加成" },
        { main: "連技終擊", level: 11, sub: "蓄力攻擊" },
        { main: "集中砲火", level: 6, sub: "投擲" },
        { main: "弱點攻擊", level: 13, sub: "蓄力加速" },
        { main: "先制", level: 7, sub: "逆襲閃避" },
        { main: "一線之隔", level: 5, sub: "有利屬性轉換" },
        { main: "阿爾法", level: 16, sub: "貝塔" },
        { main: "專屬", level: 15, sub: "戰氣" },
      ];
      const assignExisting = (target, values) => {
        for (const [key, value] of Object.entries(values)) {
          if (Object.prototype.hasOwnProperty.call(target, key)) target[key] = value;
        }
      };
      state.characterId = zeta.id;
      state.search = "";
      state.skillFilter = "";
      state.damagePercentMin = "";
      state.damagePercentMax = "";
      state.build = build;
      state.weapon = {
        traits: [
          { trait: "伽馬", level: 15 },
          { trait: "追擊", level: 7 },
          { trait: "狂戰士", level: 10 },
        ],
        sigilBooster: true,
        terminus: true,
      };
      state.limitBreak = makeLimitBreakState();
      state.other = makeOtherState();
      state.characterExtras = makeCharacterExtraState();
      assignExisting(state.limitBreak, {
        "攻擊力": 777,
        "一般傷害上限": 18,
        "技能傷害上限": 19,
        "奧義傷害上限": 7,
        "技能給予傷害": 11,
        "奧義給予傷害": 13,
        "暴擊機率": 22,
      });
      assignExisting(state.other, {
        "技能數量": 2,
        "攻擊力強化": 12,
        "防禦下降": 8,
        "當前HP": 37,
        "連技加成?": true,
        "背後部位攻擊?": true,
        "弱點部位攻擊?": true,
        "Link Time?": true,
      });
      assignExisting(state.characterExtras, {
        "阿爾貝斯．菲爾瑪雷?": true,
        "戰氣?": true,
      });
      syncBaseInputs();
      return zeta.skillRows.map((row, index) => ({
        index,
        skill: row.skill,
        modifier: row.modifier,
        multiplier: row.multiplier,
        damageCap: row.damageCap,
        classification: row.classification,
        result: calculate(row),
      }));
    });
    return { rows, pageErrors };
  } finally {
    await browser.close();
  }
}

function compareRows(excelRows, webRows) {
  const webByKey = new Map(webRows.map((row) => [keyFor(row), row]));
  const matched = [];
  const missingInWeb = [];
  const differences = [];

  for (const excel of excelRows) {
    const web = webByKey.get(keyFor(excel));
    if (!web) {
      missingInWeb.push(excel);
      continue;
    }
    matched.push({ excel, web });
    for (const field of FIELDS) {
      const expected = asNumber(excel[field.excel]);
      const actual = asNumber(web.result[field.key]);
      const delta = expected === null || actual === null ? null : actual - expected;
      const ok =
        expected === null && actual === null
          ? true
          : expected !== null && actual !== null && Math.abs(delta) <= field.tolerance;
      if (!ok) {
        differences.push({
          excelRow: excel.excelRow,
          skill: excel.skill,
          modifier: excel.modifier,
          classification: excel.classification,
          field: field.label,
          expected,
          actual,
          delta,
          tolerance: field.tolerance,
          kind: field.kind,
        });
      }
    }
  }

  return { matched, missingInWeb, differences };
}

function buildMarkdown(summary) {
  const lines = [];
  lines.push("# 瑟塔任意配置 Excel 真值比對");
  lines.push("");
  lines.push(`產生時間：${summary.generatedAt}`);
  lines.push(`基準檔：${summary.xlsxPath}`);
  lines.push("");
  lines.push("## 摘要");
  lines.push("");
  lines.push(`- Excel 可比對列數：${summary.excelRows.length}`);
  lines.push(`- 網頁瑟塔列數：${summary.webRows.length}`);
  lines.push(`- 成功配對列數：${summary.comparison.matched.length}`);
  lines.push(`- 找不到對應列：${summary.comparison.missingInWeb.length}`);
  lines.push(`- 差異筆數：${summary.comparison.differences.length}`);
  if (summary.pageErrors.length) lines.push(`- JS 錯誤：${summary.pageErrors.join(" / ")}`);
  lines.push("");
  lines.push("## 差異明細（前 120 筆）");
  lines.push("");
  if (!summary.comparison.differences.length) {
    lines.push("沒有超過容忍值的差異。");
  } else {
    lines.push("| Excel列 | 技能 | Modifier | 欄位 | Excel | 網頁 | 差異 |");
    lines.push("|---:|---|---|---|---:|---:|---:|");
    for (const diff of summary.comparison.differences.slice(0, 120)) {
      lines.push(
        `| ${diff.excelRow} | ${diff.skill ?? ""} | ${diff.modifier ?? ""} | ${diff.field} | ${formatValue(diff.expected, diff.kind)} | ${formatValue(diff.actual, diff.kind)} | ${formatValue(diff.delta, diff.kind)} |`,
      );
    }
  }
  return lines.join("\n");
}

async function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const xlsxPath = workbookPath();
  const excelRows = extractExcelRows(xlsxPath);
  const { rows: webRows, pageErrors } = await extractWebRows();
  const comparison = compareRows(excelRows, webRows);
  const summary = {
    generatedAt: new Date().toISOString(),
    xlsxPath,
    pageErrors,
    tolerances: FIELDS.map(({ label, tolerance, kind }) => ({ label, tolerance, kind })),
    excelRows,
    webRows,
    comparison,
  };
  fs.writeFileSync(path.join(REPORT_DIR, "zeta-stress-excel-compare.json"), JSON.stringify(summary, null, 2), "utf8");
  fs.writeFileSync(path.join(REPORT_DIR, "zeta-stress-excel-compare.md"), buildMarkdown(summary), "utf8");
  console.log(
    JSON.stringify(
      {
        excelRows: excelRows.length,
        webRows: webRows.length,
        matchedRows: comparison.matched.length,
        missingInWeb: comparison.missingInWeb.length,
        differences: comparison.differences.length,
        report: path.join(REPORT_DIR, "zeta-stress-excel-compare.md"),
      },
      null,
      2,
    ),
  );
  if (!excelRows.length) {
    console.error("Excel 基準檔沒有可讀取的重算快取值；請先用 Google Sheet 或 Excel 開啟、重新計算並另存/下載後再比對。");
    process.exitCode = 2;
  } else if (pageErrors.length || comparison.missingInWeb.length || comparison.differences.length) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
