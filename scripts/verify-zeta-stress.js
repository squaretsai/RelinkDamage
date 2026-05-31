const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");

const IMPORTANT_FIELDS = [
  "multiplierBoost",
  "critRate",
  "finalCap",
  "attack",
  "rawNormalDamage",
  "rawCritDamage",
  "average",
  "echo",
  "damagePercent",
  "overflow",
  "total",
];

function formatNumber(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "null";
  return Number(value).toLocaleString("zh-TW", { maximumFractionDigits: digits });
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "null";
  return `${formatNumber(Number(value) * 100, 2)}%`;
}

function markdown(summary) {
  const lines = [];
  lines.push("# 瑟塔任意配置壓力驗證報告");
  lines.push("");
  lines.push(`產生時間：${summary.generatedAt}`);
  lines.push("");
  lines.push("## 驗證定位");
  lines.push("");
  lines.push("- 這份報告驗證網頁在一組高覆蓋任意配置下的內部一致性、因子合計、欄位有限值、UI 表格同步與技能列計算穩定性。");
  lines.push("- 目前沒有可用的本機 Excel / Google Sheet 重算引擎，因此這份報告不是 Excel 真值比對。");
  lines.push("- 上一份 Excel 真值比對仍是瑟塔預設配置：49 / 49 可比對技能列，差異 0。");
  lines.push("");
  lines.push("## 壓力配置摘要");
  lines.push("");
  lines.push(`- 角色：${summary.character}`);
  lines.push(`- 因子槽：${summary.scenario.slotCount} 格，主因子 ${summary.scenario.uniqueMainCount} 種，副詞條 ${summary.scenario.uniqueSubCount} 種`);
  lines.push(`- 武器加護：${summary.scenario.weaponTraits.join(" / ")}`);
  lines.push(`- 滿覺醒：${summary.scenario.sigilBooster ? "TRUE" : "FALSE"}；究極武器：${summary.scenario.terminus ? "TRUE" : "FALSE"}`);
  lines.push(`- 啟用條件：${summary.scenario.enabledToggles.join(" / ") || "無"}`);
  lines.push("");
  lines.push("## 結果摘要");
  lines.push("");
  lines.push(`- 技能列總數：${summary.resultStats.rowCount}`);
  lines.push(`- 可估算列數：${summary.resultStats.finiteRows}`);
  lines.push(`- 與預設配置相比有變動的列：${summary.resultStats.changedRows}`);
  lines.push(`- 有追擊傷害列：${summary.resultStats.echoRows}`);
  lines.push(`- 有傷害溢出列：${summary.resultStats.overflowRows}`);
  lines.push(`- 傷害百分比範圍：${formatPercent(summary.resultStats.minDamagePercent)} ~ ${formatPercent(summary.resultStats.maxDamagePercent)}`);
  lines.push("");
  lines.push("## 檢查結果");
  lines.push("");
  lines.push(`- 因子合計：${summary.checks.traitLevels.ok ? "通過" : "失敗"}（差異 ${summary.checks.traitLevels.differences.length} 筆）`);
  lines.push(`- 重要欄位有限值：${summary.checks.finiteImportantFields.ok ? "通過" : "失敗"}（異常 ${summary.checks.finiteImportantFields.failures.length} 筆）`);
  lines.push(`- UI 表格同步：${summary.checks.uiTable.ok ? "通過" : "失敗"}`);
  lines.push(`- JS 錯誤：${summary.pageErrors.length ? summary.pageErrors.join(" / ") : "無"}`);
  lines.push("");
  if (summary.checks.traitLevels.differences.length) {
    lines.push("## 因子合計差異");
    lines.push("");
    lines.push("| 因子 | 預期 Lv | 網頁 Lv |");
    lines.push("|---|---:|---:|");
    for (const diff of summary.checks.traitLevels.differences) {
      lines.push(`| ${diff.name} | ${diff.expected} | ${diff.actual} |`);
    }
    lines.push("");
  }
  if (summary.checks.finiteImportantFields.failures.length) {
    lines.push("## 重要欄位異常");
    lines.push("");
    lines.push("| 技能 | Modifier | 欄位 | 值 |");
    lines.push("|---|---|---|---:|");
    for (const failure of summary.checks.finiteImportantFields.failures.slice(0, 80)) {
      lines.push(`| ${failure.skill} | ${failure.modifier ?? ""} | ${failure.field} | ${failure.value} |`);
    }
    lines.push("");
  }
  lines.push("## 待提升");
  lines.push("");
  lines.push("- 若要把這組任意配置升級成 Excel 真值比對，需要能讓來源 Google Sheet 或 Excel 重新計算同一組輸入。");
  lines.push("- 目前本機沒有 Excel COM / LibreOffice，Chrome 外掛連線也失敗，所以這一步暫時無法自動完成。");
  return lines.join("\n");
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
    await page.goto(`file:///${ROOT.replace(/\\/g, "/")}/index.html?stress=${Date.now()}`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(250);

    const summary = await page.evaluate((importantFields) => {
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
      const weapon = {
        traits: [
          { trait: "伽馬", level: 15 },
          { trait: "追擊", level: 7 },
          { trait: "狂戰士", level: 10 },
        ],
        sigilBooster: true,
        terminus: true,
      };

      function assignExisting(target, values) {
        for (const [key, value] of Object.entries(values)) {
          if (Object.prototype.hasOwnProperty.call(target, key)) target[key] = value;
        }
      }

      function expectedLevels() {
        const mainOnly = new Set([
          ...(DATA.calculator?.damageTraits ?? []),
          ...(DATA.calculator?.supportTraits ?? []),
        ].filter((item) => typeof item.level === "boolean").map((item) => item.trait));
        const raw = {};
        const add = (name, level) => {
          if (!name || name === NONE || name === "N/A") return;
          raw[name] = (raw[name] ?? 0) + Math.max(0, Number(level) || 0);
        };
        for (const slot of build) {
          const boosted = slot.level + (weapon.sigilBooster ? 1 : 0);
          add(slot.main, boosted);
          if (!mainOnly.has(slot.sub)) add(slot.sub, boosted);
        }
        for (const trait of weapon.traits) add(trait.trait, trait.level);
        if (weapon.sigilBooster) add("傷害上限", 5);
        return Object.fromEntries(
          Object.entries(raw).map(([name, level]) => [name, Math.min(level, getTraitLevelCap(name))]),
        );
      }

      state.characterId = zeta.id;
      state.selectedRowIndex = 0;
      state.search = "";
      state.skillFilter = "";
      state.damagePercentMin = "";
      state.damagePercentMax = "";
      state.tableMode = "full";
      state.build = build.map((slot) => ({ ...slot }));
      state.weapon = JSON.parse(JSON.stringify(weapon));
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

      const expected = expectedLevels();
      const actual = getTraitLevels();
      const allTraitNames = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
      const traitDiffs = allTraitNames
        .map((name) => ({ name, expected: expected[name] ?? 0, actual: actual[name] ?? 0 }))
        .filter((item) => item.expected !== item.actual);

      const baselineBuild = makeDefaultBuild();
      const baselineWeapon = makeWeaponState();
      const baselineLimitBreak = makeLimitBreakState();
      const baselineOther = makeOtherState();
      const baselineExtras = makeCharacterExtraState();
      const stressRows = zeta.skillRows.map((row, index) => ({ index, row, result: calculate(row) }));

      state.build = baselineBuild;
      state.weapon = baselineWeapon;
      state.limitBreak = baselineLimitBreak;
      state.other = baselineOther;
      state.characterExtras = baselineExtras;
      syncBaseInputs();
      const baselineRows = zeta.skillRows.map((row) => calculate(row));

      state.build = build.map((slot) => ({ ...slot }));
      state.weapon = JSON.parse(JSON.stringify(weapon));
      state.limitBreak = { ...baselineLimitBreak };
      state.other = { ...baselineOther };
      state.characterExtras = { ...baselineExtras };
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
      render();

      const finiteFailures = [];
      for (const item of stressRows) {
        for (const field of importantFields) {
          const value = item.result[field];
          if (value !== null && value !== undefined && !Number.isFinite(Number(value))) {
            finiteFailures.push({
              skill: item.row.skill,
              modifier: item.row.modifier,
              field,
              value: String(value),
            });
          }
        }
      }

      const finiteRows = stressRows.filter((item) => Number.isFinite(Number(item.result.total))).length;
      const changedRows = stressRows.filter((item, index) => {
        const left = Number(item.result.total);
        const right = Number(baselineRows[index]?.total);
        return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) > 1;
      }).length;
      const damagePercents = stressRows
        .map((item) => item.result.damagePercent)
        .filter((value) => Number.isFinite(Number(value)));
      const tableText = document.querySelector("#skillTable")?.innerText ?? "";
      const firstResult = stressRows[0]?.result;
      const tableHasFirstTotal = firstResult ? tableText.includes(Math.floor(firstResult.total).toLocaleString("zh-TW")) : false;

      return {
        generatedAt: new Date().toISOString(),
        character: zeta.nameZh,
        scenario: {
          slotCount: build.length,
          uniqueMainCount: new Set(build.map((slot) => slot.main)).size,
          uniqueSubCount: new Set(build.map((slot) => slot.sub)).size,
          weaponTraits: weapon.traits.map((item) => `${item.trait} Lv ${item.level}`),
          sigilBooster: weapon.sigilBooster,
          terminus: weapon.terminus,
          enabledToggles: [
            ...Object.entries(state.other).filter(([, value]) => value === true).map(([key]) => key),
            ...Object.entries(state.characterExtras).filter(([, value]) => value === true).map(([key]) => key),
          ],
        },
        resultStats: {
          rowCount: stressRows.length,
          finiteRows,
          changedRows,
          echoRows: stressRows.filter((item) => Number(item.result.echo) > 0).length,
          overflowRows: stressRows.filter((item) => Number(item.result.overflow) > 0).length,
          minDamagePercent: Math.min(...damagePercents),
          maxDamagePercent: Math.max(...damagePercents),
        },
        checks: {
          traitLevels: { ok: traitDiffs.length === 0, differences: traitDiffs },
          finiteImportantFields: { ok: finiteFailures.length === 0, failures: finiteFailures },
          uiTable: {
            ok: Boolean(tableHasFirstTotal),
            firstTotal: firstResult?.total ?? null,
          },
        },
      };
    }, IMPORTANT_FIELDS);

    summary.pageErrors = pageErrors;
    fs.writeFileSync(path.join(REPORT_DIR, "zeta-stress-verification.json"), JSON.stringify(summary, null, 2), "utf8");
    fs.writeFileSync(path.join(REPORT_DIR, "zeta-stress-verification.md"), markdown(summary), "utf8");

    const failed =
      pageErrors.length ||
      !summary.checks.traitLevels.ok ||
      !summary.checks.finiteImportantFields.ok ||
      !summary.checks.uiTable.ok;

    console.log(JSON.stringify({
      rowCount: summary.resultStats.rowCount,
      finiteRows: summary.resultStats.finiteRows,
      changedRows: summary.resultStats.changedRows,
      echoRows: summary.resultStats.echoRows,
      overflowRows: summary.resultStats.overflowRows,
      traitLevelDiffs: summary.checks.traitLevels.differences.length,
      finiteFailures: summary.checks.finiteImportantFields.failures.length,
      uiTable: summary.checks.uiTable.ok,
      pageErrors: pageErrors.length,
      report: path.join(REPORT_DIR, "zeta-stress-verification.md"),
    }, null, 2));
    if (failed) process.exitCode = 2;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
