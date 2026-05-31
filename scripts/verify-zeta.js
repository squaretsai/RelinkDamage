const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const WORKSPACE = path.resolve(ROOT, "..");
const EXCEL_PATH = path.join(WORKSPACE, "Relink", "imports", "maygi-damage-calculator.xlsx");
const REPORT_DIR = path.join(ROOT, "reports");
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

function extractExcelRows() {
  const code = `
import json
from openpyxl import load_workbook
path = r'''${EXCEL_PATH}'''
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
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file:///${ROOT.replace(/\\/g, "/")}/index.html?verify=${Date.now()}`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(250);
    const rows = await page.evaluate(() => {
      const character = DATA.characters.find((item) => item.id === "zeta" || item.nameZh === "瑟塔");
      if (!character) throw new Error("找不到瑟塔資料");
      state.characterId = character.id;
      state.search = "";
      state.skillFilter = "";
      state.damagePercentMin = "";
      state.damagePercentMax = "";
      state.build = makeDefaultBuild();
      state.weapon = makeWeaponState();
      state.limitBreak = makeLimitBreakState();
      state.other = makeOtherState();
      state.characterExtras = makeCharacterExtraState();
      syncBaseInputs();
      return character.skillRows.map((row, index) => ({
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
  lines.push("# 瑟塔自動驗證報告");
  lines.push("");
  lines.push(`產生時間：${new Date().toISOString()}`);
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
  lines.push("## 差異明細（前 80 筆）");
  lines.push("");
  if (!summary.comparison.differences.length) {
    lines.push("沒有超過容忍值的差異。");
  } else {
    lines.push("| Excel列 | 技能 | Modifier | 欄位 | Excel | 網頁 | 差異 |");
    lines.push("|---:|---|---|---|---:|---:|---:|");
    for (const diff of summary.comparison.differences.slice(0, 80)) {
      lines.push(
        `| ${diff.excelRow} | ${diff.skill ?? ""} | ${diff.modifier ?? ""} | ${diff.field} | ${formatValue(diff.expected, diff.kind)} | ${formatValue(diff.actual, diff.kind)} | ${formatValue(diff.delta, diff.kind)} |`,
      );
    }
  }
  return lines.join("\n");
}

async function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const excelRows = extractExcelRows();
  const { rows: webRows, pageErrors } = await extractWebRows();
  const comparison = compareRows(excelRows, webRows);
  const summary = {
    generatedAt: new Date().toISOString(),
    tolerances: FIELDS.map(({ label, tolerance, kind }) => ({ label, tolerance, kind })),
    pageErrors,
    excelRows,
    webRows,
    comparison,
  };
  fs.writeFileSync(path.join(REPORT_DIR, "zeta-verification.json"), JSON.stringify(summary, null, 2), "utf8");
  fs.writeFileSync(path.join(REPORT_DIR, "zeta-verification.md"), buildMarkdown(summary), "utf8");
  console.log(
    JSON.stringify(
      {
        excelRows: excelRows.length,
        webRows: webRows.length,
        matchedRows: comparison.matched.length,
        missingInWeb: comparison.missingInWeb.length,
        differences: comparison.differences.length,
        report: path.join(REPORT_DIR, "zeta-verification.md"),
      },
      null,
      2,
    ),
  );
  if (pageErrors.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
