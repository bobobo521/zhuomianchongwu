const defaultStatus = {
  ok: true,
  events: [],
  message: '日历提醒已开启，我会留意带备注的事件。'
};

export function createCalendarService({
  settingsStore,
  calendarApi,
  bubbleView,
  petView
}) {
  let settings = settingsStore.getSettings();
  let timer = null;
  let lastStatus = defaultStatus;
  let notifiedKeys = new Set();
  let isChecking = false;

  settingsStore.subscribe((nextSettings) => {
    const previousCalendarSettings = settings.calendar;

    settings = nextSettings;

    if (
      previousCalendarSettings.lookAheadMinutes !== settings.calendar.lookAheadMinutes ||
      previousCalendarSettings.notifyBeforeMinutes !== settings.calendar.notifyBeforeMinutes
    ) {
      notifiedKeys = new Set();
    }

    schedule();
  });

  async function getMessage() {
    const status = await checkNow({ showDueEvent: false });

    if (!status.ok) {
      return status.message;
    }

    const nextEvent = status.events[0];

    if (!nextEvent) {
      return '接下来暂时没有带备注的日历事件。';
    }

    return formatEventMessage(nextEvent, '下一条日历备注');
  }

  async function checkNow(options = {}) {
    if (!settings.modules.calendar) {
      return {
        ...defaultStatus,
        ok: false,
        message: '日历提醒模块已关闭。'
      };
    }

    if (!calendarApi?.getCalendarEvents) {
      return {
        ...defaultStatus,
        ok: false,
        message: '日历读取接口还没准备好。'
      };
    }

    const status = normalizeStatus(await calendarApi.getCalendarEvents({
      lookAheadMinutes: settings.calendar.lookAheadMinutes
    }));

    lastStatus = status;
    forgetMissingEvents(status.events);

    if (options.showDueEvent !== false) {
      maybeShowDueEvents(status.events);
    }

    return status;
  }

  function start() {
    schedule(1000);
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function schedule(delay = settings.calendar.pollIntervalMs) {
    stop();

    if (!settings.modules.calendar) {
      return;
    }

    timer = setTimeout(runScheduledCheck, delay);
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
        ok: false,
        message: '日历暂时读不到，稍后我再看。'
      };
    } finally {
      isChecking = false;
      schedule();
    }
  }

  function maybeShowDueEvents(events) {
    const dueEvents = events.filter((event) => isDue(event) && !notifiedKeys.has(getEventKey(event)));

    if (!dueEvents.length) {
      return;
    }

    dueEvents.forEach((dueEvent, index) => {
      const key = getEventKey(dueEvent);

      notifiedKeys.add(key);
      window.setTimeout(() => {
        showDueEvent(dueEvent);
      }, index * 6800);
    });
  }

  function showDueEvent(dueEvent) {
    const message = formatEventMessage(dueEvent, '日历提醒');

    petView?.playAction('normal', 'surprised', { duration: 900 });
    bubbleView?.show(message, {
      duration: 6200,
      anchorElement: petView?.element
    });

    if (settings.calendar.systemNotification) {
      calendarApi?.notifyCalendarEvent?.({
        title: `日历提醒：${dueEvent.title}`,
        body: compactText(dueEvent.notes, 160)
      });
    }
  }

  function isDue(event) {
    if (event.isAllDay) {
      return isToday(event.startAt);
    }

    const startTime = Date.parse(event.startAt);

    if (!Number.isFinite(startTime)) {
      return false;
    }

    const minutesUntilStart = (startTime - Date.now()) / 60000;

    return minutesUntilStart <= settings.calendar.notifyBeforeMinutes && minutesUntilStart >= -5;
  }

  function forgetMissingEvents(events) {
    const liveKeys = new Set(events.map(getEventKey));

    notifiedKeys = new Set(Array.from(notifiedKeys).filter((key) => liveKeys.has(key)));
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
    ok: status.ok !== false,
    events: Array.isArray(status.events) ? status.events.map(normalizeEvent).filter(Boolean) : []
  };
}

function normalizeEvent(event) {
  if (!event) {
    return null;
  }

  const title = String(event.title || '未命名事件').trim();
  const notes = String(event.notes || '').trim();
  const startAt = String(event.startAt || '').trim();

  if (!notes || !startAt) {
    return null;
  }

  return {
    id: String(event.id || `${title}-${startAt}`),
    title,
    notes,
    startAt,
    endAt: String(event.endAt || ''),
    isAllDay: Boolean(event.isAllDay),
    calendar: String(event.calendar || ''),
    location: String(event.location || '')
  };
}

function getEventKey(event) {
  return `${event.id}:${event.startAt}`;
}

function formatEventMessage(event, label) {
  const timeText = event.isAllDay ? '今天全天' : formatTime(event.startAt);
  const location = event.location ? `\n地点：${compactText(event.location, 30)}` : '';

  return `${label}：${event.title}\n时间：${timeText}${location}\n备注：${compactText(event.notes, 120)}`;
}

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '时间待确认';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function isToday(value) {
  const date = new Date(value);
  const now = new Date();

  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

function compactText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}
