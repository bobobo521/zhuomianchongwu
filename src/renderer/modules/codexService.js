const statusActions = {
  idle: 'idle',
  running: 'thinking',
  waiting: 'alert',
  completed: 'confirm',
  failed: 'error',
  paused: 'thinking'
};

const statusBubbleTypes = {
  idle: 'normal',
  running: 'normal',
  waiting: 'warning',
  completed: 'success',
  failed: 'error',
  paused: 'warning'
};

export function createCodexService({
  settingsStore,
  codexApi,
  bubbleView,
  petView
}) {
  let settings = settingsStore.getSettings();
  let lastStatusResult = null;

  settingsStore.subscribe((nextSettings) => {
    settings = nextSettings;
    configureWatcher();
  });

  codexApi?.onCodexReminder?.((reminder) => {
    if (!settings.modules.codex || !settings.codexReminderEnabled) {
      return;
    }

    const statusName = normalizeStatusName(reminder?.status?.status);
    const action = reminder?.action || statusActions[statusName] || 'idle';
    const type = reminder?.type || statusBubbleTypes[statusName] || 'normal';

    petView?.playAction('normal', action, { duration: 900 });
    bubbleView?.show(reminder?.message || 'Codex 状态更新了。', {
      duration: type === 'error' ? 5200 : 4200,
      type,
      anchorElement: petView?.element
    });
  });

  async function getMessage() {
    const result = await checkNow();

    return formatStatusSummary(result.status);
  }

  async function checkNow() {
    if (!codexApi?.readCodexStatus) {
      return {
        ok: false,
        status: {
          status: 'idle',
          progress: 0,
          taskName: '',
          message: 'Codex 状态接口还没准备好。'
        }
      };
    }

    lastStatusResult = await codexApi.readCodexStatus();

    return lastStatusResult;
  }

  async function setReminderEnabled(enabled) {
    const nextSettings = await settingsStore.update({
      ...settings,
      codexReminderEnabled: Boolean(enabled)
    });

    settings = nextSettings;
    await codexApi?.setCodexReminderEnabled?.(Boolean(enabled));

    return settings;
  }

  async function toggleReminderEnabled() {
    return setReminderEnabled(!settings.codexReminderEnabled);
  }

  function configureWatcher() {
    codexApi?.configureCodexReminder?.({
      ...settings,
      codexReminderEnabled: Boolean(settings.modules.codex && settings.codexReminderEnabled)
    });
  }

  function getLastMessage() {
    return lastStatusResult?.status
      ? formatStatusSummary(lastStatusResult.status)
      : 'Codex 状态提醒已开启，我会留意任务进度。';
  }

  return {
    getMessage,
    checkNow,
    setReminderEnabled,
    toggleReminderEnabled,
    getLastMessage
  };
}

function formatStatusSummary(status = {}) {
  const statusName = normalizeStatusName(status.status);
  const taskName = compactText(status.taskName || '暂无任务', 48);
  const progress = normalizeProgress(status.progress);
  const message = compactText(status.message || 'Codex 当前空闲', 120);

  if (statusName === 'running') {
    return `Codex 正在处理：${taskName}\n当前进度：${progress}%\n${message}`;
  }

  return `Codex 状态：${statusName}\n任务：${taskName}\n进度：${progress}%\n说明：${message}`;
}

function normalizeStatusName(statusName) {
  return ['idle', 'running', 'waiting', 'completed', 'failed', 'paused'].includes(statusName)
    ? statusName
    : 'idle';
}

function normalizeProgress(progress) {
  const number = Number(progress);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(Math.min(Math.max(number, 0), 100));
}

function compactText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}
