const { app, BrowserWindow, Notification, ipcMain, Menu, screen } = require('electron');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let mainWindow = null;
let dragState = null;
let normalWindowBounds = null;
let settingsWindowBounds = null;
let petScale = 1;
let jimengWindow = null;
const baseWindowSize = 260;
const bubbleWindowSpace = 132;

const defaultSettings = {
  bubbleDurationMs: 3000,
  longPressDurationMs: 1000,
  idleSleepDelayMs: 60000,
  petScale: 1,
  languageStyle: 'gentle',
  weather: {
    city: '北京',
    refreshIntervalMs: 600000,
    clickIntervalMs: 1800000
  },
  jimeng: {
    statusUrl: 'https://jimeng.jianying.com/ai-tool/home?type=agentic&workspace=13853639902732',
    pollIntervalMs: 30000,
    completionNotification: true
  },
  codex: {
    statusPath: '',
    pollIntervalMs: 15000,
    usageReminder: true,
    usageReminderIntervalMs: 5400000,
    resetReminderDelayMs: 18000000,
    freshEventWindowMs: 600000
  },
  calendar: {
    pollIntervalMs: 60000,
    lookAheadMinutes: 1440,
    notifyBeforeMinutes: 10,
    systemNotification: true
  },
  modules: {
    weather: true,
    codex: true,
    jimeng: true,
    calendar: true,
    local: true
  },
  customMessages: {
    idle: ['我在这里。', '桌面巡逻中。', '今天也陪你。'],
    happy: ['今天也要元气满满。', '嘿，戳到我啦。', '收到一份快乐信号。'],
    thinking: ['你在做什么有趣的事？', '我刚刚好像想到点什么。', '让我凑近看看。'],
    sleepy: ['有点困，但还能陪你。', '如果我打盹了，记得叫我。', '慢一点也没关系。'],
    fallback: ['我在这里。', '要不要和我玩一会儿？', '桌面巡逻中。']
  }
};

function createPetWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;
  const windowBounds = getNormalWindowDimensions();

  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    x: screenWidth - windowBounds.width - 48,
    y: screenHeight - windowBounds.height - 72,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  createPetWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createPetWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('pet-drag:start', (event, point) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (!window) {
    return;
  }

  dragState = {
    window,
    startMouse: point,
    startBounds: window.getBounds()
  };
});

ipcMain.handle('pet-drag:move', (event, point) => {
  if (!dragState || dragState.window !== BrowserWindow.fromWebContents(event.sender)) {
    return;
  }

  const deltaX = point.x - dragState.startMouse.x;
  const deltaY = point.y - dragState.startMouse.y;

  dragState.window.setPosition(
    Math.round(dragState.startBounds.x + deltaX),
    Math.round(dragState.startBounds.y + deltaY)
  );
});

ipcMain.handle('pet-drag:end', () => {
  dragState = null;
});

ipcMain.handle('pet-window:set-mode', (event, modeName) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (!window) {
    return;
  }

  if (modeName === 'game') {
    if (!normalWindowBounds) {
      normalWindowBounds = window.getBounds();
    }
    const display = screen.getDisplayMatching(normalWindowBounds);
    window.setBounds(display.workArea);
    window.setAlwaysOnTop(true, 'floating');
    window.setIgnoreMouseEvents(false);
    return;
  }

  if (modeName === 'normal' && normalWindowBounds) {
    window.setIgnoreMouseEvents(false);
    window.setBounds(normalWindowBounds);
    normalWindowBounds = null;
  }
});

ipcMain.handle('pet-window:set-mouse-ignore', (event, shouldIgnore) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (!window) {
    return;
  }

  window.setIgnoreMouseEvents(Boolean(shouldIgnore), { forward: true });
});

ipcMain.handle('pet-window:set-settings-panel-visible', (event, isVisible) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (!window) {
    return;
  }

  if (isVisible) {
    if (!settingsWindowBounds) {
      settingsWindowBounds = window.getBounds();
    }

    const display = screen.getDisplayMatching(settingsWindowBounds);
    const panelWidth = 460;
    const panelHeight = 620;
    const x = Math.min(
      Math.max(settingsWindowBounds.x, display.workArea.x),
      display.workArea.x + display.workArea.width - panelWidth
    );
    const y = Math.min(
      Math.max(settingsWindowBounds.y, display.workArea.y),
      display.workArea.y + display.workArea.height - panelHeight
    );

    window.setIgnoreMouseEvents(false);
    window.setBounds({ x, y, width: panelWidth, height: panelHeight });
    return;
  }

  if (settingsWindowBounds) {
    window.setIgnoreMouseEvents(false);
    if (normalWindowBounds) {
      const display = screen.getDisplayMatching(normalWindowBounds);

      window.setBounds(display.workArea);
    } else {
      window.setBounds(getScaledBounds(settingsWindowBounds));
    }
    settingsWindowBounds = null;
  }
});

ipcMain.handle('pet-window:set-pet-scale', (event, scale) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  petScale = normalizeNumber(scale, defaultSettings.petScale, 0.5, 1.8);

  if (!window || normalWindowBounds || settingsWindowBounds) {
    return petScale;
  }

  window.setBounds(getScaledBounds(window.getBounds()));

  return petScale;
});

ipcMain.handle('pet-settings:load', () => {
  return readSettings();
});

ipcMain.handle('pet-settings:save', (event, settings) => {
  const nextSettings = normalizeSettings(settings);

  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(nextSettings, null, 2), 'utf8');

  return nextSettings;
});

ipcMain.handle('pet-jimeng:check', async (event, statusUrl) => {
  try {
    return await readJimengStatus(statusUrl);
  } catch {
    return {
      state: 'error',
      progress: null,
      message: '即梦页面暂时读不到，稍后再试。'
    };
  }
});

ipcMain.handle('pet-jimeng:open-page', (event, statusUrl) => {
  openJimengPage(statusUrl, true);
});

ipcMain.handle('pet-codex:check', (event, codexSettings) => {
  return readCodexStatus(codexSettings);
});

ipcMain.handle('pet-calendar:events', (event, options) => {
  return readCalendarEvents(options);
});

ipcMain.handle('pet-notification:jimeng-success', (event, message) => {
  if (!Notification.isSupported()) {
    return false;
  }

  new Notification({
    title: '即梦生成完成',
    body: String(message || '即梦生成好了。')
  }).show();

  return true;
});

ipcMain.handle('pet-notification:calendar-event', (event, payload) => {
  if (!Notification.isSupported()) {
    return false;
  }

  new Notification({
    title: String(payload?.title || '日历提醒'),
    body: String(payload?.body || '有一个带备注的日历事件快到了。')
  }).show();

  return true;
});

ipcMain.handle('pet-menu:show', (event, point) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (!window) {
    return;
  }

  const menu = Menu.buildFromTemplate([
    {
      label: '设置',
      click: () => {
        event.sender.send('pet-menu:command', { command: 'open-settings' });
      }
    },
    { type: 'separator' },
    {
      label: '热气球射箭',
      click: () => {
        event.sender.send('pet-menu:command', { command: 'toggle-balloon-shooter' });
      }
    },
    { type: 'separator' },
    {
      label: '退出桌面宠物',
      click: () => {
        app.quit();
      }
    }
  ]);

  menu.popup({
    window,
    x: Math.round(point?.x ?? 0),
    y: Math.round(point?.y ?? 0)
  });
});

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function readSettings() {
  try {
    const rawSettings = fs.readFileSync(getSettingsPath(), 'utf8');

    return normalizeSettings(JSON.parse(rawSettings));
  } catch {
    return normalizeSettings(defaultSettings);
  }
}

function normalizeSettings(settings = {}) {
  return {
    ...defaultSettings,
    ...settings,
    bubbleDurationMs: normalizeNumber(settings.bubbleDurationMs, defaultSettings.bubbleDurationMs, 500, 20000),
    longPressDurationMs: normalizeNumber(settings.longPressDurationMs, defaultSettings.longPressDurationMs, 300, 5000),
    idleSleepDelayMs: normalizeNumber(settings.idleSleepDelayMs, defaultSettings.idleSleepDelayMs, 5000, 1800000),
    petScale: normalizeNumber(settings.petScale, defaultSettings.petScale, 0.5, 1.8),
    languageStyle: normalizeLanguageStyle(settings.languageStyle),
    modules: {
      ...defaultSettings.modules,
      ...(settings.modules ?? {})
    },
    weather: normalizeWeatherSettings(settings.weather),
    codex: normalizeCodexSettings(settings.codex),
    jimeng: normalizeJimengSettings(settings.jimeng),
    calendar: normalizeCalendarSettings(settings.calendar),
    customMessages: normalizeMessages(settings.customMessages ?? settings.messages)
  };
}

function normalizeMessages(messages = {}) {
  return Object.fromEntries(
    Object.entries(defaultSettings.customMessages).map(([topic, defaultList]) => {
      const list = Array.isArray(messages[topic]) ? messages[topic] : defaultList;
      const cleanList = list.map((message) => String(message).trim()).filter(Boolean);

      return [topic, cleanList.length > 0 ? cleanList : defaultList];
    })
  );
}

function normalizeLanguageStyle(style) {
  return ['gentle', 'lively', 'focus', 'playful'].includes(style) ? style : defaultSettings.languageStyle;
}

function normalizeWeatherSettings(weather = {}) {
  const city = String(weather.city ?? defaultSettings.weather.city).trim();

  return {
    city: city || defaultSettings.weather.city,
    refreshIntervalMs: normalizeNumber(weather.refreshIntervalMs, defaultSettings.weather.refreshIntervalMs, 60000, 3600000),
    clickIntervalMs: normalizeNumber(weather.clickIntervalMs, defaultSettings.weather.clickIntervalMs, 60000, 21600000)
  };
}

function normalizeJimengSettings(jimeng = {}) {
  const statusUrl = String(jimeng.statusUrl ?? defaultSettings.jimeng.statusUrl).trim();

  return {
    statusUrl: statusUrl || defaultSettings.jimeng.statusUrl,
    pollIntervalMs: normalizeNumber(jimeng.pollIntervalMs, defaultSettings.jimeng.pollIntervalMs, 5000, 600000),
    completionNotification: jimeng.completionNotification !== false
  };
}

function normalizeCodexSettings(codex = {}) {
  return {
    statusPath: String(codex.statusPath ?? defaultSettings.codex.statusPath).trim(),
    pollIntervalMs: normalizeNumber(codex.pollIntervalMs, defaultSettings.codex.pollIntervalMs, 5000, 300000),
    usageReminder: codex.usageReminder !== false,
    usageReminderIntervalMs: normalizeNumber(
      codex.usageReminderIntervalMs,
      defaultSettings.codex.usageReminderIntervalMs,
      60000,
      21600000
    ),
    resetReminderDelayMs: normalizeNumber(
      codex.resetReminderDelayMs,
      defaultSettings.codex.resetReminderDelayMs,
      60000,
      86400000
    ),
    freshEventWindowMs: normalizeNumber(
      codex.freshEventWindowMs,
      defaultSettings.codex.freshEventWindowMs,
      60000,
      3600000
    )
  };
}

function normalizeCalendarSettings(calendar = {}) {
  return {
    pollIntervalMs: normalizeNumber(calendar.pollIntervalMs, defaultSettings.calendar.pollIntervalMs, 15000, 1800000),
    lookAheadMinutes: normalizeNumber(calendar.lookAheadMinutes, defaultSettings.calendar.lookAheadMinutes, 10, 10080),
    notifyBeforeMinutes: normalizeNumber(calendar.notifyBeforeMinutes, defaultSettings.calendar.notifyBeforeMinutes, 0, 1440),
    systemNotification: calendar.systemNotification !== false
  };
}

function normalizeNumber(value, fallback, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
}

function readCalendarEvents(options = {}) {
  if (process.platform !== 'darwin') {
    return {
      ok: false,
      events: [],
      message: '日历提醒目前只支持 macOS。'
    };
  }

  const lookAheadMinutes = normalizeNumber(
    options.lookAheadMinutes,
    defaultSettings.calendar.lookAheadMinutes,
    10,
    10080
  );
  const calendarsPath = path.join(app.getPath('home'), 'Library', 'Calendars');

  try {
    const events = readIcsFiles(calendarsPath)
      .flatMap((filePath) => readIcsEvents(filePath, lookAheadMinutes))
      .filter((event) => event.notes)
      .sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt));

    return {
      ok: true,
      events,
      message: events.length === 0
        ? '接下来暂时没有带备注的日历事件。'
        : `找到 ${events.length} 个带备注的日历事件。`
    };
  } catch {
    return {
      ok: false,
      events: [],
      message: '日历暂时读不到。请在系统设置里允许桌宠访问日历，或给应用完整磁盘访问权限。'
    };
  }
}

function readIcsFiles(rootPath) {
  const results = [];
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const entryPath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      results.push(...readIcsFiles(entryPath));
      return;
    }

    if (entry.isFile() && entry.name.endsWith('.ics')) {
      results.push(entryPath);
    }
  });

  return results;
}

function readIcsEvents(filePath, lookAheadMinutes) {
  const content = fs.readFileSync(filePath, 'utf8');
  const events = extractVEvents(unfoldIcs(content));
  const now = Date.now();
  const windowEnd = now + lookAheadMinutes * 60000;

  return events.flatMap((eventText) => {
    const event = parseIcsEvent(eventText, filePath);

    if (!event || !event.notes) {
      return [];
    }

    return expandCalendarEvent(event, now, windowEnd);
  });
}

function unfoldIcs(content) {
  return String(content).replace(/\r?\n[ \t]/g, '');
}

function extractVEvents(content) {
  return Array.from(content.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)\r?\nEND:VEVENT/g)).map((match) => match[1]);
}

function parseIcsEvent(eventText, filePath) {
  const fields = parseIcsFields(eventText);
  const startField = fields.find((field) => field.name === 'DTSTART');
  const endField = fields.find((field) => field.name === 'DTEND');
  const uid = getFirstFieldValue(fields, 'UID');
  const title = getFirstFieldValue(fields, 'SUMMARY') || '未命名事件';
  const notes = getFirstFieldValue(fields, 'DESCRIPTION');

  if (!startField || !notes) {
    return null;
  }

  const startDate = parseIcsDate(startField.value, startField.params);
  const endDate = endField ? parseIcsDate(endField.value, endField.params) : null;

  if (!startDate) {
    return null;
  }

  return {
    id: uid || `${title}-${startField.value}`,
    title,
    notes,
    startDate,
    endDate,
    isAllDay: startField.params.VALUE === 'DATE',
    location: getFirstFieldValue(fields, 'LOCATION'),
    calendar: path.basename(path.dirname(path.dirname(filePath))),
    rrule: parseRRule(getFirstFieldValue(fields, 'RRULE'))
  };
}

function parseIcsFields(eventText) {
  return String(eventText).split(/\r?\n/).map((line) => {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      return null;
    }

    const key = line.slice(0, separatorIndex);
    const value = unescapeIcsText(line.slice(separatorIndex + 1));
    const [name, ...paramParts] = key.split(';');
    const params = Object.fromEntries(paramParts.map((part) => {
      const [paramName, ...paramValueParts] = part.split('=');

      return [paramName.toUpperCase(), paramValueParts.join('=')];
    }));

    return {
      name: name.toUpperCase(),
      params,
      value
    };
  }).filter(Boolean);
}

function getFirstFieldValue(fields, name) {
  return fields.find((field) => field.name === name)?.value?.trim() ?? '';
}

function parseIcsDate(value, params = {}) {
  const rawValue = String(value || '').trim();

  if (!rawValue) {
    return null;
  }

  if (params.VALUE === 'DATE' || /^\d{8}$/.test(rawValue)) {
    return new Date(
      Number(rawValue.slice(0, 4)),
      Number(rawValue.slice(4, 6)) - 1,
      Number(rawValue.slice(6, 8))
    );
  }

  const match = rawValue.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, zone] = match;
  const parts = [year, month, day, hour, minute, second].map(Number);

  if (zone === 'Z') {
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
  }

  return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
}

function parseRRule(value) {
  if (!value) {
    return null;
  }

  return Object.fromEntries(String(value).split(';').map((part) => {
    const [key, ruleValue] = part.split('=');

    return [key, ruleValue];
  }));
}

function expandCalendarEvent(event, now, windowEnd) {
  if (!event.rrule) {
    return isEventInWindow(event.startDate, now, windowEnd) ? [formatCalendarEvent(event, event.startDate)] : [];
  }

  const occurrences = [];
  const maxOccurrences = Number.isFinite(Number(event.rrule.COUNT)) ? Number(event.rrule.COUNT) : 5000;
  const interval = normalizeNumber(event.rrule.INTERVAL, 1, 1, 365);
  const untilDate = parseIcsDate(event.rrule.UNTIL || '')?.getTime() ?? windowEnd;
  let cursor = new Date(event.startDate);
  let generatedCount = 0;

  while (generatedCount < maxOccurrences && cursor.getTime() < now - 86400000 && cursor.getTime() <= untilDate) {
    cursor = addRecurrenceInterval(cursor, event.rrule.FREQ, interval);
    generatedCount += 1;

    if (!cursor) {
      return occurrences;
    }
  }

  while (generatedCount < maxOccurrences && cursor.getTime() <= windowEnd && cursor.getTime() <= untilDate) {
    if (isEventInWindow(cursor, now, windowEnd)) {
      occurrences.push(formatCalendarEvent(event, cursor));
    }

    cursor = addRecurrenceInterval(cursor, event.rrule.FREQ, interval);
    generatedCount += 1;

    if (!cursor) {
      break;
    }
  }

  return occurrences;
}

function isEventInWindow(date, now, windowEnd) {
  const time = date.getTime();

  return time >= now - 86400000 && time <= windowEnd;
}

function addRecurrenceInterval(date, frequency, interval) {
  const nextDate = new Date(date);

  if (frequency === 'DAILY') {
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate;
  }

  if (frequency === 'WEEKLY') {
    nextDate.setDate(nextDate.getDate() + interval * 7);
    return nextDate;
  }

  if (frequency === 'MONTHLY') {
    nextDate.setMonth(nextDate.getMonth() + interval);
    return nextDate;
  }

  if (frequency === 'YEARLY') {
    nextDate.setFullYear(nextDate.getFullYear() + interval);
    return nextDate;
  }

  return null;
}

function formatCalendarEvent(event, occurrenceStart) {
  const duration = event.endDate ? event.endDate.getTime() - event.startDate.getTime() : 0;
  const occurrenceEnd = duration > 0 ? new Date(occurrenceStart.getTime() + duration) : occurrenceStart;

  return {
    id: event.id,
    title: event.title,
    notes: event.notes,
    startAt: occurrenceStart.toISOString(),
    endAt: occurrenceEnd.toISOString(),
    isAllDay: event.isAllDay,
    calendar: event.calendar,
    location: event.location
  };
}

function unescapeIcsText(value) {
  return String(value)
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

async function readJimengStatus(statusUrl) {
  const chromePage = readJimengChromePage(statusUrl);

  if (chromePage?.page) {
    return classifyJimengPage(chromePage.page);
  }

  if (chromePage?.state === 'javascript-disabled') {
    return {
      state: 'error',
      progress: null,
      message: 'Chrome 不允许桌宠读取页面。请在 Chrome 菜单“显示”里打开“开发者”下的“允许来自 Apple 事件的 JavaScript”。'
    };
  }

  return {
    state: 'login',
    progress: null,
    message: 'Chrome 里还没找到即梦页面。需要时请在设置里点“打开即梦页面”，并保持标签页开着。'
  };
}

function readCodexStatus(codexSettings = {}) {
  const settings = normalizeCodexSettings(codexSettings);
  const fileStatus = readCodexStatusFile(settings.statusPath);
  const localStatus = readCodexLocalStatus();
  const mergedStatus = {
    ...localStatus,
    ...fileStatus,
    source: fileStatus ? 'status-file' : localStatus.source
  };

  if (mergedStatus.state === 'limited' && !mergedStatus.quotaResetAt) {
    const resetBase = normalizeOptionalTimestamp(mergedStatus.updatedAt) ?? Date.now();

    mergedStatus.quotaResetAt = new Date(resetBase + settings.resetReminderDelayMs).toISOString();
  }

  return normalizeCodexStatus(mergedStatus);
}

function readCodexStatusFile(statusPath) {
  const resolvedPath = normalizeCodexStatusPath(statusPath);

  try {
    if (!fs.existsSync(resolvedPath)) {
      return null;
    }

    const payload = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    const status = payload.codex && typeof payload.codex === 'object' ? payload.codex : payload;

    return normalizeCodexStatus({
      ...status,
      eventId: status.eventId ?? status.id ?? status.updatedAt ?? fs.statSync(resolvedPath).mtimeMs,
      updatedAt: status.updatedAt ?? fs.statSync(resolvedPath).mtimeMs
    });
  } catch {
    return {
      state: 'error',
      progress: null,
      message: 'Codex 状态文件暂时读不到。',
      remainingPercent: null,
      quotaResetAt: null,
      eventId: null,
      updatedAt: Date.now()
    };
  }
}

function normalizeCodexStatusPath(statusPath) {
  const cleanPath = String(statusPath || '').trim();

  if (cleanPath) {
    return cleanPath.replace(/^~(?=$|\/)/, app.getPath('home'));
  }

  return path.join(app.getPath('home'), '.codex', 'desktop-pet-codex-status.json');
}

function readCodexLocalStatus() {
  const codexDir = path.join(app.getPath('home'), '.codex');
  const statePath = path.join(codexDir, 'state_5.sqlite');
  const latestThread = readLatestCodexThread(statePath);

  if (latestThread && Date.now() - latestThread.updatedAt <= 120000) {
    return {
      state: 'running',
      progress: null,
      message: `Codex 正在处理：${latestThread.title || '当前任务'}。`,
      remainingPercent: null,
      quotaResetAt: null,
      eventId: `thread-${latestThread.id}-${latestThread.updatedAt}`,
      updatedAt: latestThread.updatedAt,
      source: 'threads'
    };
  }

  if (latestThread) {
    return {
      state: 'idle',
      progress: null,
      message: `最近的 Codex 任务是：${latestThread.title || '未命名任务'}。`,
      remainingPercent: null,
      quotaResetAt: null,
      eventId: `thread-${latestThread.id}-${latestThread.updatedAt}`,
      updatedAt: latestThread.updatedAt,
      source: 'threads'
    };
  }

  return {
    state: 'idle',
    progress: null,
    message: 'Codex 状态还没有可读取的本地记录。',
    remainingPercent: null,
    quotaResetAt: null,
    eventId: null,
    updatedAt: Date.now(),
    source: 'fallback'
  };
}

function readLatestCodexLogEvent(databasePath, likePattern, threadId) {
  if (!fs.existsSync(databasePath)) {
    return null;
  }

  try {
    const threadFilter = threadId ? `and thread_id = ${quoteSqlValue(threadId)}` : '';
    const sql = [
      '.mode tabs',
      [
        'select id, ts from logs',
        'where id > coalesce((select max(id) - 50000 from logs), 0)',
        threadFilter,
        `and feedback_log_body like ${quoteSqlValue(likePattern)}`,
        'order by id desc limit 1;'
      ].filter(Boolean).join(' ')
    ].join('\n');
    const output = execFileSync('/usr/bin/sqlite3', [databasePath], {
      input: sql,
      encoding: 'utf8',
      timeout: 1200
    }).trim();

    if (!output) {
      return null;
    }

    const [id, ts] = output.split('\t').map((value) => Number(value));

    if (!Number.isFinite(id) || !Number.isFinite(ts)) {
      return null;
    }

    return { id, ts };
  } catch {
    return null;
  }
}

function readLatestCodexThread(databasePath) {
  if (!fs.existsSync(databasePath)) {
    return null;
  }

  try {
    const projectRoot = path.resolve(__dirname, '../..');
    const sql = [
      '.mode tabs',
      [
        'select id, title, coalesce(updated_at_ms, updated_at * 1000) as updated_ms',
        'from threads',
        `where archived = 0 and cwd = ${quoteSqlValue(projectRoot)}`,
        'order by updated_ms desc limit 1;'
      ].join(' ')
    ].join('\n');
    const output = execFileSync('/usr/bin/sqlite3', [databasePath], {
      input: sql,
      encoding: 'utf8',
      timeout: 1200
    }).trim();

    if (!output) {
      return null;
    }

    const [id, title, updatedAt] = output.split('\t');
    const parsedUpdatedAt = Number(updatedAt);

    if (!id || !Number.isFinite(parsedUpdatedAt)) {
      return null;
    }

    return {
      id,
      title,
      updatedAt: parsedUpdatedAt
    };
  } catch {
    return null;
  }
}

function normalizeCodexStatus(status = {}) {
  return {
    state: normalizeCodexState(status.state),
    progress: normalizeOptionalPercent(status.progress),
    message: String(status.message || 'Codex 进度监控已开启。'),
    remainingPercent: normalizeOptionalPercent(status.remainingPercent ?? status.usageRemainingPercent),
    quotaResetAt: normalizeOptionalIsoDate(status.quotaResetAt ?? status.resetAt),
    eventId: status.eventId === undefined || status.eventId === null ? null : String(status.eventId),
    updatedAt: normalizeOptionalTimestamp(status.updatedAt),
    source: String(status.source || 'unknown')
  };
}

function normalizeCodexState(state) {
  if (['idle', 'running', 'waiting_confirmation', 'completed', 'limited', 'disabled', 'error'].includes(state)) {
    return state;
  }

  if (state === 'waiting' || state === 'needs_confirmation') {
    return 'waiting_confirmation';
  }

  if (state === 'done' || state === 'success') {
    return 'completed';
  }

  return 'idle';
}

function normalizeOptionalPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.round(Math.min(Math.max(number, 0), 100));
}

function normalizeOptionalTimestamp(value) {
  const number = Number(value);

  if (Number.isFinite(number)) {
    return number < 100000000000 ? number * 1000 : number;
  }

  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOptionalIsoDate(value) {
  const parsed = Date.parse(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString();
}

function quoteSqlValue(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function openJimengPage(statusUrl, visible) {
  const url = normalizeJimengUrl(statusUrl);

  if (!url) {
    return null;
  }

  if (visible) {
    openUrlInChrome(url);
    return true;
  }

  if (jimengWindow && !jimengWindow.isDestroyed()) {
    return jimengWindow;
  }

  jimengWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    show: visible,
    title: '即梦生成监控',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  jimengWindow.on('closed', () => {
    jimengWindow = null;
  });

  jimengWindow.loadURL(url);

  return jimengWindow;
}

async function loadJimengUrl(window, statusUrl) {
  const url = normalizeJimengUrl(statusUrl);

  if (!url) {
    throw new Error('invalid jimeng url');
  }

  if (window.webContents.getURL() !== url) {
    await window.loadURL(url);
  }

  if (window.webContents.isLoading()) {
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 12000);
      window.webContents.once('did-finish-load', () => {
        clearTimeout(timer);
        resolve();
      });
      window.webContents.once('did-fail-load', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 1800));
}

function normalizeJimengUrl(statusUrl) {
  try {
    const url = new URL(String(statusUrl || defaultSettings.jimeng.statusUrl).trim());

    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function openUrlInChrome(url) {
  try {
    execFileSync('/usr/bin/open', ['-a', 'Google Chrome', url], { stdio: 'ignore' });
  } catch {
    execFileSync('/usr/bin/open', [url], { stdio: 'ignore' });
  }
}

function readJimengChromePage(statusUrl) {
  const url = normalizeJimengUrl(statusUrl);

  if (!url || process.platform !== 'darwin') {
    return null;
  }

  try {
    const targetHost = new URL(url).host;
    const output = execFileSync('/usr/bin/osascript', [
      '-e',
      getReadChromeTabScript(),
      targetHost
    ], {
      encoding: 'utf8',
      timeout: 8000,
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();

    if (!output || output === '__NO_CHROME__') {
      return {
        state: 'no-chrome'
      };
    }

    if (output === '__NO_TAB__') {
      return {
        state: 'no-tab'
      };
    }

    const [marker, title = '', pageUrl = '', ...textLines] = output.split('\n');

    if (marker !== '__FOUND__') {
      return {
        state: 'no-tab'
      };
    }

    return {
      state: 'found',
      page: {
        title,
        url: pageUrl,
        text: textLines.join(' ').replace(/\s+/g, ' ').trim().slice(0, 12000)
      }
    };
  } catch (error) {
    const message = String(error?.stderr || error?.message || '');

    if (/JavaScript from Apple Events|execute javascript|not allowed|禁止|不允许/i.test(message)) {
      return {
        state: 'javascript-disabled'
      };
    }

    return null;
  }
}

function getReadChromeTabScript() {
  return `
on run argv
  set targetHost to item 1 of argv
  tell application "Google Chrome"
    if not running then return "__NO_CHROME__"
    repeat with browserWindow in windows
      repeat with browserTab in tabs of browserWindow
        set pageUrl to URL of browserTab
        if pageUrl contains targetHost then
          set pageTitle to title of browserTab
          set pageText to execute browserTab javascript "document.body ? document.body.innerText : ''"
          return "__FOUND__" & linefeed & pageTitle & linefeed & pageUrl & linefeed & pageText
        end if
      end repeat
    end repeat
  end tell
  return "__NO_TAB__"
end run
`;
}

function classifyJimengPage(page) {
  const text = `${page.title} ${page.text}`;

  if (/登录|扫码|手机号|验证码/.test(text) && !/生成中|生成完成|已完成|成功|失败/.test(text)) {
    return {
      state: 'login',
      progress: null,
      message: '即梦需要先登录。打开即梦页面登录后，我再继续看进度。'
    };
  }

  if (/生成失败|失败|出错|异常|审核未通过/.test(text)) {
    return {
      state: 'failed',
      progress: null,
      message: '即梦这次生成可能失败了，去页面看一眼原因。'
    };
  }

  if (/(生成|创作|任务|作品|视频|图片).{0,20}(完成|成功|已完成|已生成|结果)|可下载|去下载|导出|保存到|发布|查看作品/.test(text)) {
    return {
      state: 'completed',
      progress: 100,
      message: '即梦生成好了，可以去页面查看成品。'
    };
  }

  const progress = extractProgress(text);

  if (progress !== null || /生成中|创作中|处理中|排队|队列|等待中|进行中|预计|正在生成|正在创作/.test(text)) {
    return {
      state: 'running',
      progress,
      message: progress === null ? '即梦还在生成中。' : `即梦生成中，约 ${progress}%。`
    };
  }

  return {
    state: 'idle',
    progress: null,
    message: '还没发现正在生成的即梦任务。'
  };
}

function extractProgress(text) {
  const matches = Array.from(String(text).matchAll(/(\d{1,3})\s*%/g))
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 100);

  if (!matches.length) {
    return null;
  }

  return Math.max(...matches);
}

function getNormalWindowSize() {
  return Math.round(baseWindowSize * petScale);
}

function getNormalWindowDimensions() {
  const size = getNormalWindowSize();

  return {
    width: Math.max(baseWindowSize, size),
    height: size + bubbleWindowSpace
  };
}

function getScaledBounds(bounds) {
  const nextBounds = getNormalWindowDimensions();
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  return {
    x: Math.round(centerX - nextBounds.width / 2),
    y: Math.round(centerY - nextBounds.height / 2),
    width: nextBounds.width,
    height: nextBounds.height
  };
}
