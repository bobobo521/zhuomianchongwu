const actionByStatus = {
  idle: 'idle',
  running: 'thinking',
  waiting: 'alert',
  completed: 'confirm',
  failed: 'error',
  paused: 'thinking'
};

const bubbleTypeByStatus = {
  idle: 'normal',
  running: 'normal',
  waiting: 'warning',
  completed: 'success',
  failed: 'error',
  paused: 'warning'
};

function buildCodexMessage(status, reminderKind = 'manual') {
  const normalizedStatus = normalizeStatusName(status?.status);
  const taskName = compactText(status?.taskName || '当前任务', 48);
  const progress = normalizeProgress(status?.progress);
  const message = compactText(status?.message || '', 120);

  if (normalizedStatus === 'running') {
    return `Codex 正在处理：${taskName}\n当前进度：${progress}%${message ? `\n${message}` : ''}`;
  }

  if (normalizedStatus === 'waiting') {
    if (reminderKind === 'waiting-3m') {
      return 'Codex 还在等你，不确认它就不会继续。';
    }

    if (reminderKind === 'waiting-10m' || reminderKind === 'waiting-repeat') {
      return 'Codex 已经等你一会儿了，建议回去处理一下。';
    }

    return 'Codex 在等你确认。';
  }

  if (normalizedStatus === 'completed') {
    return 'Codex 完成啦，可以检查效果了。';
  }

  if (normalizedStatus === 'failed') {
    return message ? `Codex 遇到问题了：${message}` : 'Codex 遇到问题了，需要你看一下。';
  }

  if (normalizedStatus === 'paused') {
    return 'Codex 暂停了，可能需要你安排下一步。';
  }

  return message || 'Codex 当前空闲';
}

function buildCodexStatusSummary(status) {
  const normalizedStatus = normalizeStatusName(status?.status);
  const taskName = compactText(status?.taskName || '暂无任务', 48);
  const progress = normalizeProgress(status?.progress);
  const message = compactText(status?.message || 'Codex 当前空闲', 120);

  return `Codex 状态：${normalizedStatus}\n任务：${taskName}\n进度：${progress}%\n说明：${message}`;
}

function getCodexDisplayMeta(statusName) {
  const normalizedStatus = normalizeStatusName(statusName);

  return {
    action: actionByStatus[normalizedStatus] ?? 'idle',
    type: bubbleTypeByStatus[normalizedStatus] ?? 'normal'
  };
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

module.exports = {
  buildCodexMessage,
  buildCodexStatusSummary,
  getCodexDisplayMeta,
  normalizeStatusName
};
