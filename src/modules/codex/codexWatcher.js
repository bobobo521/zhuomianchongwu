const fs = require('fs');
const { createCodexReminderEngine } = require('./codexReminderEngine');

const defaultCodexSettings = {
  codexReminderEnabled: true,
  codexWaitingReminderEnabled: true,
  codexCompletedReminderEnabled: true,
  codexFailedReminderEnabled: true,
  codexPausedReminderEnabled: true,
  codexCheckInterval: 60000,
  codexStatusFilePath: ''
};

function createCodexWatcher({
  reader,
  onReminder
}) {
  const reminderEngine = createCodexReminderEngine();
  let settings = { ...defaultCodexSettings };
  let timer = null;
  let fileWatcher = null;
  let lastReadResult = null;
  let isChecking = false;

  function start(nextSettings = settings) {
    updateSettings(nextSettings);
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (fileWatcher) {
      fileWatcher.close();
      fileWatcher = null;
    }
  }

  function updateSettings(nextSettings = {}) {
    const previousFilePath = getStatusFilePath();

    settings = normalizeCodexSettings(nextSettings);
    reader.ensureStatusFile(settings.codexStatusFilePath);

    const nextFilePath = getStatusFilePath();

    if (previousFilePath !== nextFilePath || !fileWatcher) {
      attachFileWatcher();
    }

    schedule(400);
  }

  async function readNow(options = {}) {
    if (isChecking) {
      return lastReadResult;
    }

    isChecking = true;

    try {
      lastReadResult = reader.readStatus(settings.codexStatusFilePath);

      if (options.evaluate !== false) {
        const reminder = reminderEngine.evaluate(lastReadResult.status, settings);

        if (reminder) {
          onReminder?.(reminder);
        }
      }

      return lastReadResult;
    } finally {
      isChecking = false;
    }
  }

  function schedule(delayMs = settings.codexCheckInterval) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(async () => {
      try {
        await readNow();
      } finally {
        schedule();
      }
    }, delayMs);
  }

  function attachFileWatcher() {
    if (fileWatcher) {
      fileWatcher.close();
      fileWatcher = null;
    }

    try {
      const filePath = getStatusFilePath();

      fileWatcher = fs.watch(filePath, { persistent: false }, () => {
        schedule(150);
      });
    } catch {
      fileWatcher = null;
    }
  }

  function getStatusFilePath() {
    return reader.resolveStatusPath(settings.codexStatusFilePath);
  }

  return {
    start,
    stop,
    updateSettings,
    readNow,
    getStatusFilePath,
    getSnapshot: reminderEngine.getSnapshot
  };
}

function normalizeCodexSettings(settings = {}) {
  return {
    codexReminderEnabled: settings.codexReminderEnabled !== false,
    codexWaitingReminderEnabled: settings.codexWaitingReminderEnabled !== false,
    codexCompletedReminderEnabled: settings.codexCompletedReminderEnabled !== false,
    codexFailedReminderEnabled: settings.codexFailedReminderEnabled !== false,
    codexPausedReminderEnabled: settings.codexPausedReminderEnabled !== false,
    codexCheckInterval: normalizeNumber(settings.codexCheckInterval, defaultCodexSettings.codexCheckInterval, 1000, 1800000),
    codexStatusFilePath: String(settings.codexStatusFilePath || '').trim()
  };
}

function normalizeNumber(value, fallback, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
}

module.exports = {
  createCodexWatcher,
  defaultCodexSettings,
  normalizeCodexSettings
};
