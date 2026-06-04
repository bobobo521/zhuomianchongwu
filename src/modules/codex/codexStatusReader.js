const fs = require('fs');
const path = require('path');
const { normalizeStatusName } = require('./codexMessageBuilder');

const defaultCodexStatus = {
  source: 'codex',
  isOpen: false,
  isRunning: false,
  taskId: null,
  taskName: '',
  status: 'idle',
  progress: 0,
  waitingForConfirmation: false,
  updatedAt: null,
  message: 'Codex 当前空闲'
};

function createCodexStatusReader({ defaultFilePath }) {
  const fallbackPath = defaultFilePath;

  function readStatus(filePath = '') {
    const resolvedPath = resolveStatusPath(filePath);

    try {
      ensureStatusFile(resolvedPath);
      const rawStatus = fs.readFileSync(resolvedPath, 'utf8');

      return {
        status: normalizeCodexStatus(JSON.parse(rawStatus)),
        filePath: resolvedPath,
        ok: true,
        error: null
      };
    } catch (error) {
      return {
        status: {
          ...defaultCodexStatus,
          message: error instanceof SyntaxError
            ? 'Codex 状态文件格式有误，已暂时按空闲处理。'
            : 'Codex 状态暂时读不到，已暂时按空闲处理。'
        },
        filePath: resolvedPath,
        ok: false,
        error: error?.message || String(error)
      };
    }
  }

  function ensureStatusFile(filePath = '') {
    const resolvedPath = resolveStatusPath(filePath);

    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }

    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    fs.writeFileSync(resolvedPath, `${JSON.stringify(defaultCodexStatus, null, 2)}\n`, 'utf8');

    return resolvedPath;
  }

  function resolveStatusPath(filePath = '') {
    const customPath = String(filePath || '').trim();

    if (!customPath) {
      return fallbackPath;
    }

    return path.resolve(customPath);
  }

  return {
    readStatus,
    ensureStatusFile,
    resolveStatusPath
  };
}

function normalizeCodexStatus(status = {}) {
  const nextStatus = normalizeStatusName(status.status);
  const progress = Number(status.progress);

  return {
    ...defaultCodexStatus,
    source: 'codex',
    isOpen: Boolean(status.isOpen),
    isRunning: nextStatus === 'running' ? true : Boolean(status.isRunning),
    taskId: status.taskId === null || status.taskId === undefined ? null : String(status.taskId),
    taskName: String(status.taskName || '').trim(),
    status: nextStatus,
    progress: Number.isFinite(progress) ? Math.round(Math.min(Math.max(progress, 0), 100)) : 0,
    waitingForConfirmation: Boolean(status.waitingForConfirmation || nextStatus === 'waiting'),
    updatedAt: status.updatedAt ? String(status.updatedAt) : null,
    message: String(status.message || defaultCodexStatus.message).trim() || defaultCodexStatus.message
  };
}

module.exports = {
  createCodexStatusReader,
  defaultCodexStatus,
  normalizeCodexStatus
};
