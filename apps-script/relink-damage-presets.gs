const RELINK_PRESET_FOLDER = "RelinkDamagePresets";
const RELINK_PRESET_SECRET_KEY = "RELINK_PRESET_SECRET";

function setupRelinkPresetStore() {
  const folder = getOrCreateRootFolder_();
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty(RELINK_PRESET_SECRET_KEY);
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, "");
    props.setProperty(RELINK_PRESET_SECRET_KEY, secret);
  }
  Logger.log("RelinkDamagePresets folder: " + folder.getUrl());
  Logger.log("Relink preset secret: " + secret);
  return {
    folderUrl: folder.getUrl(),
    secret,
  };
}

function doPost(e) {
  const requestId = (e.parameter.requestId || "").trim();
  try {
    verifySecret_(e.parameter.secret);
    const action = (e.parameter.action || "").trim();
    const payload = parsePayload_(e.parameter.payload);
    const result = handleAction_(action, payload);
    return htmlResponse_(requestId, {
      ok: true,
      ...result,
    });
  } catch (error) {
    return htmlResponse_(requestId, {
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  }
}

function handleAction_(action, payload) {
  if (action === "ping") {
    const folder = getOrCreateRootFolder_();
    return { folderUrl: folder.getUrl() };
  }

  if (action === "list") {
    return listPresets_(payload);
  }

  if (action === "save") {
    return savePreset_(payload);
  }

  if (action === "load") {
    return loadPreset_(payload);
  }

  if (action === "delete") {
    return deletePreset_(payload);
  }

  throw new Error("未知動作：" + action);
}

function listPresets_(payload) {
  const folder = getCharacterFolder_(payload.characterName || payload.characterId || "未分類", false);
  const presets = [];
  if (folder) {
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (!file.getName().endsWith(".json")) continue;
      presets.push({
        fileId: file.getId(),
        name: file.getName().replace(/\.json$/i, ""),
        updatedAt: file.getLastUpdated().toISOString(),
      });
    }
  }
  presets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return {
    folderUrl: getOrCreateRootFolder_().getUrl(),
    presets,
  };
}

function savePreset_(payload) {
  if (!payload.name) throw new Error("缺少存檔名稱。");
  if (!payload.preset) throw new Error("缺少配置內容。");

  const folder = getCharacterFolder_(payload.characterName || payload.characterId || "未分類", true);
  const fileName = safeName_(payload.name) + ".json";
  const content = JSON.stringify(payload.preset, null, 2);
  const existing = folder.getFilesByName(fileName);
  let file;
  if (existing.hasNext()) {
    file = existing.next();
    file.setContent(content);
  } else {
    file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
  }
  file.setDescription("RelinkDamage preset saved at " + new Date().toISOString());
  return {
    folderUrl: getOrCreateRootFolder_().getUrl(),
    fileId: file.getId(),
    name: payload.name,
  };
}

function loadPreset_(payload) {
  if (!payload.fileId) throw new Error("缺少 fileId。");
  const file = DriveApp.getFileById(payload.fileId);
  return {
    folderUrl: getOrCreateRootFolder_().getUrl(),
    preset: JSON.parse(file.getBlob().getDataAsString("UTF-8")),
  };
}

function deletePreset_(payload) {
  if (!payload.fileId) throw new Error("缺少 fileId。");
  DriveApp.getFileById(payload.fileId).setTrashed(true);
  return {
    folderUrl: getOrCreateRootFolder_().getUrl(),
  };
}

function parsePayload_(raw) {
  if (!raw) return {};
  return JSON.parse(raw);
}

function verifySecret_(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty(RELINK_PRESET_SECRET_KEY);
  if (!expected) throw new Error("請先在 Apps Script 執行 setupRelinkPresetStore。");
  if (!secret || secret !== expected) throw new Error("安全碼不正確。");
}

function getCharacterFolder_(name, create) {
  const root = getOrCreateRootFolder_();
  const folderName = safeName_(name || "未分類");
  const folders = root.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return create ? root.createFolder(folderName) : null;
}

function getOrCreateRootFolder_() {
  const folders = DriveApp.getFoldersByName(RELINK_PRESET_FOLDER);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(RELINK_PRESET_FOLDER);
}

function safeName_(value) {
  const name = String(value || "未命名")
    .replace(/[\\/:*?"<>|#%{}~&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return name.slice(0, 80) || "未命名";
}

function htmlResponse_(requestId, body) {
  const message = {
    source: "relink-presets",
    requestId,
    ...body,
  };
  const json = JSON.stringify(message).replace(/</g, "\\u003c");
  return HtmlService
    .createHtmlOutput("<!doctype html><meta charset=\"utf-8\"><script>parent.postMessage(" + json + ", \"*\");</script>")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
