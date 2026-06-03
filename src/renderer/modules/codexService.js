const defaultStatus = {
  state: 'idle',
  progress: null,
  message: 'Codex 进度监控已开启，我会留意需要确认和完成提醒。',
  remainingPercent: null,
  quotaResetAt: null,
  eventId: null
};

export function createCodexService({
  settingsStore,
  codexApi,
  bubbleView,
  petView
}) {
  let settings = settingsStore.getSettings();
  let timer = null;
  let usageTimer = null;
  let resetTimer = null;
  let scheduledResetKey = null;
  let lastStatus = defaultStatus;
  let lastStickyEventId = null;
  let lastResetKey = null;
  let hasSeenInitialStatus = false;
  let isChecking = false;

  settingsStore.subscribe((nextSettings) => {
    settings = nextSettings;
    schedule();
    scheduleUsageReminder();
  });

  async function getMessage() {
    const status = await checkNow();

    return status.message;
  }

  async function checkNow() {
    if (!settings.modules.codex) {
      return {
        ...defaultStatus,
        state: 'disabled',
        message: 'Codex 进度模块已关闭。'
      };
    }

    if (!codexApi?.checkCodexStatus) {
      return {
        ...defaultStatus,
        state: 'error',
        message: 'Codex 本地读取接口还没准备好。'
      };
    }

    const status = normalizeStatus(await codexApi.checkCodexStatus(settings.codex));

    handleStatus(status);

    return status;
  }

  function start() {
    schedule();
    scheduleUsageReminder();
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (usageTimer) {
      clearTimeout(usageTimer);
      usageTimer = null;
    }

    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
      scheduledResetKey = null;
    }
  }

  function schedule() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (!settings.modules.codex) {
      return;
    }

    timer = setTimeout(runScheduledCheck, settings.codex.pollIntervalMs);
  }

  async function runScheduledCheck() {
    if (isChecking) {
      schedule();
      return;
    }

    isChecking = true;

    try {
      await checkNow();
    } catch {
      lastStatus = {
        ...lastStatus,
        state: 'error',
        message: 'Codex 状态暂时读不到，稍后我再看。'
      };
    } finally {
      isChecking = false;
      schedule();
    }
  }

  function handleStatus(status) {
    const previousStatus = lastStatus;

    lastStatus = status;
    maybeShowStickyStatus(status, previousStatus);
    maybeScheduleResetReminder(status);
  }

  function maybeShowStickyStatus(status, previousStatus) {
    const isStickyState = status.state === 'waiting_confirmation' || status.state === 'completed';

    if (!isStickyState || !status.eventId || status.eventId === lastStickyEventId) {
      hasSeenInitialStatus = true;
      return;
    }

    const isFresh = !status.updatedAt || Date.now() - status.updatedAt <= settings.codex.freshEventWindowMs;
    const stateChanged = status.state !== previousStatus.state;

    if (!hasSeenInitialStatus || !isFresh || (!stateChanged && previousStatus.eventId === status.eventId)) {
      lastStickyEventId = status.eventId;
      hasSeenInitialStatus = true;
      return;
    }

    lastStickyEventId = status.eventId;
    hasSeenInitialStatus = true;

    petView?.playAction('normal', status.state === 'completed' ? 'confirm' : 'surprised', { duration: 900 });
    bubbleView?.show(status.message, {
      sticky: true,
      anchorElement: petView?.element
    });
  }

  function scheduleUsageReminder() {
    if (usageTimer) {
      clearTimeout(usageTimer);
      usageTimer = null;
    }

    if (!settings.modules.codex || !settings.codex.usageReminder) {
      return;
    }

    usageTimer = setTimeout(async () => {
      usageTimer = null;
      await showUsageReminder();
      scheduleUsageReminder();
    }, settings.codex.usageReminderIntervalMs);
  }

  async function showUsageReminder() {
    let status = lastStatus;

    try {
      status = await checkNow();
    } catch {
      status = lastStatus;
    }

    if (!settings.modules.codex) {
      return;
    }

    const percent = normalizePercent(status.remainingPercent);
    const message = percent === null
      ? 'Codex 额度情况我还没读到，灵感来了可以先用起来。'
      : `Codex 剩余额度约 ${percent}%，别让灵感闲着，赶紧去用一点。`;

    petView?.playAction('normal', 'talk', { duration: 700 });
    bubbleView?.show(message, {
      anchorElement: petView?.element
    });
  }

  function maybeScheduleResetReminder(status) {
    const resetAt = Date.parse(status.quotaResetAt || '');

    if (!Number.isFinite(resetAt) || resetAt <= Date.now()) {
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
        scheduledResetKey = null;
      }
      return;
    }

    const resetKey = new Date(resetAt).toISOString();

    if (scheduledResetKey === resetKey) {
      return;
    }

    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }

    scheduledResetKey = resetKey;
    const delay = Math.min(resetAt - Date.now(), 2147483647);

    resetTimer = setTimeout(() => {
      resetTimer = null;
      scheduledResetKey = null;

      if (lastResetKey === resetKey || !settings.modules.codex) {
        return;
      }

      lastResetKey = resetKey;
      petView?.playAction('normal', 'confirm', { duration: 900 });
      bubbleView?.show('Codex 额度已重置，可以继续创作了。', {
        anchorElement: petView?.element
      });
    }, delay);
  }

  function getLastMessage() {
    return lastStatus.message || defaultStatus.message;
  }

  return {
    start,
    stop,
    getMessage,
    checkNow,
    getLastMessage
  };
}

function normalizeStatus(status = {}) {
  return {
    ...defaultStatus,
    ...status,
    state: normalizeState(status.state),
    progress: normalizePercent(status.progress),
    remainingPercent: normalizePercent(status.remainingPercent),
    message: String(status.message || defaultStatus.message),
    eventId: status.eventId === null || status.eventId === undefined ? null : String(status.eventId),
    updatedAt: normalizeTimestamp(status.updatedAt)
  };
}

function normalizeState(state) {
  if (['idle', 'running', 'waiting_confirmation', 'completed', 'limited', 'disabled', 'error'].includes(state)) {
    return state;
  }

  return defaultStatus.state;
}

function normalizePercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.round(Math.min(Math.max(number, 0), 100));
}

function normalizeTimestamp(value) {
  const number = Number(value);

  if (Number.isFinite(number)) {
    return number < 100000000000 ? number * 1000 : number;
  }

  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? parsed : null;
}
