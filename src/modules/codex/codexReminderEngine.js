const {
  buildCodexMessage,
  getCodexDisplayMeta,
  normalizeStatusName
} = require('./codexMessageBuilder');

const waitingSchedule = [
  { kind: 'waiting-immediate', delayMs: 0 },
  { kind: 'waiting-3m', delayMs: 3 * 60 * 1000 },
  { kind: 'waiting-10m', delayMs: 10 * 60 * 1000 }
];
const completedReminderDelayMs = 8000;

function createCodexReminderEngine() {
  let lastStatus = null;
  let lastTaskId = null;
  let lastNotifiedCompletedTaskId = null;
  let lastNotifiedRunningTaskId = null;
  let lastWaitingReminderAt = 0;
  let waitingFirstDetectedAt = 0;
  let waitingReminderKinds = new Set();
  let lastFailedTaskId = null;
  let lastPausedTaskId = null;

  function evaluate(status, settings = {}, now = Date.now()) {
    const normalizedStatus = {
      ...status,
      status: getEffectiveStatus(status)
    };
    const taskId = getTaskId(normalizedStatus);

    if (taskId !== lastTaskId || normalizedStatus.status !== 'waiting') {
      resetWaitingState();
    }

    if (taskId !== lastTaskId) {
      lastTaskId = taskId;
    }

    lastStatus = normalizedStatus;

    if (!settings.codexReminderEnabled) {
      return null;
    }

    if (normalizedStatus.status === 'waiting') {
      return evaluateWaiting(normalizedStatus, settings, now);
    }

    if (normalizedStatus.status === 'failed') {
      return evaluateTaskOnce({
        enabled: settings.codexFailedReminderEnabled,
        taskId,
        lastTaskId: lastFailedTaskId,
        setLastTaskId: (value) => {
          lastFailedTaskId = value;
        },
        status: normalizedStatus,
        kind: 'failed'
      });
    }

    if (normalizedStatus.status === 'completed') {
      if (!isStatusOlderThan(normalizedStatus, completedReminderDelayMs, now)) {
        return null;
      }

      return evaluateTaskOnce({
        enabled: settings.codexCompletedReminderEnabled,
        taskId,
        lastTaskId: lastNotifiedCompletedTaskId,
        setLastTaskId: (value) => {
          lastNotifiedCompletedTaskId = value;
        },
        status: normalizedStatus,
        kind: 'completed'
      });
    }

    if (normalizedStatus.status === 'paused') {
      return evaluateTaskOnce({
        enabled: settings.codexPausedReminderEnabled,
        taskId,
        lastTaskId: lastPausedTaskId,
        setLastTaskId: (value) => {
          lastPausedTaskId = value;
        },
        status: normalizedStatus,
        kind: 'paused'
      });
    }

    if (normalizedStatus.status === 'running') {
      return evaluateTaskOnce({
        enabled: true,
        taskId,
        lastTaskId: lastNotifiedRunningTaskId,
        setLastTaskId: (value) => {
          lastNotifiedRunningTaskId = value;
        },
        status: normalizedStatus,
        kind: 'running-start'
      });
    }

    return null;
  }

  function evaluateWaiting(status, settings, now) {
    if (!settings.codexWaitingReminderEnabled) {
      return null;
    }

    if (!waitingFirstDetectedAt) {
      waitingFirstDetectedAt = now;
    }

    const elapsedMs = now - waitingFirstDetectedAt;
    const nextSchedule = waitingSchedule.find((entry) => (
      elapsedMs >= entry.delayMs && !waitingReminderKinds.has(entry.kind)
    ));

    if (nextSchedule) {
      waitingReminderKinds.add(nextSchedule.kind);
      lastWaitingReminderAt = now;

      return buildReminder(status, nextSchedule.kind);
    }

    const repeatDelayMs = 15 * 60 * 1000;

    if (elapsedMs >= 10 * 60 * 1000 && now - lastWaitingReminderAt >= repeatDelayMs) {
      lastWaitingReminderAt = now;

      return buildReminder(status, 'waiting-repeat');
    }

    return null;
  }

  function evaluateTaskOnce({
    enabled,
    taskId,
    lastTaskId: previousNotifiedTaskId,
    setLastTaskId,
    status,
    kind
  }) {
    if (!enabled || previousNotifiedTaskId === taskId) {
      return null;
    }

    setLastTaskId(taskId);

    return buildReminder(status, kind);
  }

  function buildReminder(status, kind) {
    const meta = getCodexDisplayMeta(status.status);

    return {
      kind,
      status,
      message: buildCodexMessage(status, kind),
      action: meta.action,
      type: meta.type
    };
  }

  function resetWaitingState() {
    waitingFirstDetectedAt = 0;
    lastWaitingReminderAt = 0;
    waitingReminderKinds = new Set();
  }

  function getSnapshot() {
    return {
      lastStatus,
      lastTaskId,
      lastNotifiedCompletedTaskId,
      lastNotifiedRunningTaskId,
      lastWaitingReminderAt,
      waitingFirstDetectedAt,
      lastFailedTaskId,
      lastPausedTaskId
    };
  }

  return {
    evaluate,
    getSnapshot
  };
}

function getEffectiveStatus(status = {}) {
  if (status.waitingForConfirmation) {
    return 'waiting';
  }

  return normalizeStatusName(status.status);
}

function getTaskId(status = {}) {
  return status.taskId || `${status.status}:${status.taskName || 'untitled'}`;
}

function isStatusOlderThan(status = {}, delayMs, now) {
  const updatedAt = Date.parse(status.updatedAt || '');

  if (!Number.isFinite(updatedAt)) {
    return true;
  }

  return now - updatedAt >= delayMs;
}

module.exports = {
  createCodexReminderEngine
};
