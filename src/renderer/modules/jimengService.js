export function createJimengService({
  settingsStore,
  jimengApi,
  bubbleView,
  petView
}) {
  let settings = settingsStore.getSettings();
  let timer = null;
  let lastState = 'idle';
  let lastMessage = '';
  let hasSeenRunningTask = false;
  let isChecking = false;

  settingsStore.subscribe((nextSettings) => {
    const previousUrl = settings.jimeng.statusUrl;

    settings = nextSettings;

    if (settings.jimeng.statusUrl !== previousUrl) {
      lastState = 'idle';
      lastMessage = '';
      hasSeenRunningTask = false;
    }

    schedule();
  });

  async function getMessage() {
    const status = await checkNow();

    return status.message;
  }

  async function checkNow() {
    if (!settings.modules.jimeng) {
      return {
        state: 'disabled',
        progress: null,
        message: '即梦进度模块已关闭。'
      };
    }

    if (!jimengApi?.checkJimengStatus) {
      return {
        state: 'error',
        progress: null,
        message: '即梦监控接口还没准备好。'
      };
    }

    const status = await jimengApi.checkJimengStatus(settings.jimeng.statusUrl);

    handleStatus(status);

    return status;
  }

  function start() {
    schedule(2500);
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function schedule(delayMs = settings.jimeng.pollIntervalMs) {
    stop();

    if (!settings.modules.jimeng) {
      return;
    }

    timer = setTimeout(runScheduledCheck, delayMs);
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
      lastState = 'error';
      lastMessage = '即梦页面暂时读不到，稍后再试。';
    } finally {
      isChecking = false;
      schedule();
    }
  }

  function handleStatus(status) {
    if (!status) {
      return;
    }

    const previousState = lastState;
    const nextStatus = normalizeStatusTransition(status, previousState);

    lastState = nextStatus.state;
    lastMessage = nextStatus.message;

    if (nextStatus.state === 'running') {
      hasSeenRunningTask = true;
      return;
    }

    if (nextStatus.state === 'failed' || nextStatus.state === 'login') {
      hasSeenRunningTask = false;
      return;
    }

    if (nextStatus.state !== 'completed' || previousState === 'completed') {
      return;
    }

    petView?.playAction('normal', 'confirm', { duration: 900 });
    bubbleView?.show(nextStatus.message, {
      duration: 4200,
      anchorElement: petView?.element
    });

    if (settings.jimeng.completionNotification) {
      jimengApi?.notifyJimengSuccess?.(nextStatus.message);
    }

    hasSeenRunningTask = false;
  }

  function normalizeStatusTransition(status, previousState) {
    if (status.state === 'running') {
      return status;
    }

    if (status.state === 'completed') {
      return status;
    }

    if (status.progress === 100) {
      return {
        ...status,
        state: 'completed',
        message: '即梦生成好了，可以去页面查看成品。'
      };
    }

    if ((previousState === 'running' || hasSeenRunningTask) && status.state === 'idle') {
      return {
        ...status,
        state: 'completed',
        progress: 100,
        message: '即梦生成好了，可以去页面查看成品。'
      };
    }

    return status;
  }

  function openPage() {
    return jimengApi?.openJimengPage?.(settings.jimeng.statusUrl);
  }

  function getLastMessage() {
    return lastMessage || '即梦监控已开启，我会定时看生成进度。';
  }

  return {
    start,
    stop,
    getMessage,
    checkNow,
    openPage,
    getLastMessage
  };
}
