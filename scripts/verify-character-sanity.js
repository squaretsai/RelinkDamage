const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");

const characters = process.argv.slice(2);
if (!characters.length) {
  characters.push("蘭斯洛特", "卡莉歐斯托蘿", "尤金", "蘇恩", "夏綠蒂");
}

async function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1720, height: 1000 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file:///${ROOT.replace(/\\/g, "/")}/index.html?sanity=${Date.now()}`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(250);
    const results = await page.evaluate((names) => {
      return names.map((name) => {
        const character = DATA.characters.find((item) => item.nameZh === name || item.id === name);
        if (!character) return { name, found: false };
        state.characterId = character.id;
        state.search = "";
        state.skillFilter = "";
        state.damagePercentMin = "";
        state.damagePercentMax = "";
        state.selectedRowIndex = 0;
        state.build = makeDefaultBuild();
        state.weapon = makeWeaponState();
        state.limitBreak = makeLimitBreakState();
        state.other = makeOtherState();
        state.characterExtras = makeCharacterExtraState();
        syncBaseInputs();
        const rows = character.skillRows.map((row, index) => ({ index, row, result: calculate(row) }));
        const failures = [];
        for (const item of rows) {
          for (const field of ["finalCap", "rawNormalDamage", "rawCritDamage", "damagePercent", "overflow", "total"]) {
            const value = item.result[field];
            if (value !== null && value !== undefined && !Number.isFinite(Number(value))) {
              failures.push({
                index: item.index,
                skill: item.row.skill,
                modifier: item.row.modifier,
                field,
                value: String(value),
              });
            }
          }
        }
        const finiteRows = rows.filter((item) => Number.isFinite(Number(item.result.total))).length;
        return {
          name: character.nameZh,
          id: character.id,
          found: true,
          rowCount: rows.length,
          finiteRows,
          echoRows: rows.filter((item) => Number(item.result.echo) > 0).length,
          overflowRows: rows.filter((item) => Number(item.result.overflow) > 0).length,
          failures,
        };
      });
    }, characters);
    const summary = {
      generatedAt: new Date().toISOString(),
      pageErrors,
      results,
    };
    const reportPath = path.join(REPORT_DIR, "priority-character-sanity.json");
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");
    console.log(JSON.stringify({
      pageErrors: pageErrors.length,
      results: results.map((item) => ({
        name: item.name,
        found: item.found,
        rows: item.rowCount,
        finiteRows: item.finiteRows,
        failures: item.failures?.length ?? null,
      })),
      report: reportPath,
    }, null, 2));
    if (pageErrors.length || results.some((item) => !item.found || item.failures?.length)) process.exitCode = 2;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
