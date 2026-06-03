export const defaultSettings = {
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
    idle: [
      '我在这里。',
      '桌面巡逻中。',
      '今天也陪你。'
    ],
    happy: [
      '今天也要元气满满。',
      '嘿，戳到我啦。',
      '收到一份快乐信号。'
    ],
    thinking: [
      '你在做什么有趣的事？',
      '我刚刚好像想到点什么。',
      '让我凑近看看。'
    ],
    sleepy: [
      '有点困，但还能陪你。',
      '如果我打盹了，记得叫我。',
      '慢一点也没关系。'
    ],
    fallback: [
      '我在这里。',
      '要不要和我玩一会儿？',
      '桌面巡逻中。'
    ]
  },
  messageStyles: {
    gentle: {
      idle: [
        '我在这里，慢慢来。',
        '先呼吸一下也没关系。',
        '今天的节奏，由你说了算。',
        '我会安静陪着你。',
        '不用急，一步一步就好。',
        '桌面这边很平静。',
        '需要我的时候，轻轻点一下就好。',
        '你做你的，我守着这块小地方。'
      ],
      happy: [
        '收到一份快乐信号。',
        '你刚刚把我点亮了。',
        '嘿，今天也有一点好事发生。',
        '这一下很轻，我喜欢。',
        '好耶，我在认真开心。',
        '你的桌面气压升高了一点。',
        '被你发现啦。',
        '今天也陪你元气一点。'
      ],
      thinking: [
        '我在想，这件事也许能拆小一点。',
        '让我凑近看看。',
        '这里好像有个线头。',
        '先抓住最小的一步。',
        '思路在路上，别催它。',
        '也许答案藏在下一次尝试里。',
        '我们把问题放亮一点。',
        '这事值得慢慢想。'
      ],
      sleepy: [
        '我先眯一会儿，你忙完叫我。',
        '有点困，但还在陪你。',
        '桌面进入轻柔省电模式。',
        '如果我打盹了，记得叫我。',
        '慢一点也没关系。',
        '我把声音放低一点。',
        '困意路过，我没有投降。',
        '小睡一下，灵感可能会自己回来。'
      ],
      fallback: [
        '我在这里。',
        '要不要和我玩一会儿？',
        '今天也陪你。'
      ]
    },
    lively: {
      idle: [
        '待命中，随时出发。',
        '桌面巡逻完成，一切正常。',
        '今天也要开工啦。',
        '给我一个任务，我能装作很忙。',
        '能量条正在缓慢上涨。',
        '我准备好了，你呢？',
        '小队集合，虽然现在只有我。',
        '今天适合干点漂亮事。'
      ],
      happy: [
        '好耶，命中快乐按钮。',
        '这一下很有精神。',
        '元气补给到账。',
        '我宣布桌面气氛变好了。',
        '再点一下也不是不行。',
        '收到，开心模式启动。',
        '漂亮，状态上扬。',
        '今天的你，有点厉害。'
      ],
      thinking: [
        '让我运转一下小脑袋。',
        '这个问题值得一个漂亮转身。',
        '我感觉思路快冒头了。',
        '先别慌，拆开看看。',
        '这里可能有隐藏路线。',
        '认真分析中，假装有进度条。',
        '我们换个角度试试。',
        '答案正在加载。'
      ],
      sleepy: [
        '电量低，但斗志还在。',
        '我先打个小盹，马上回血。',
        '困困警报响了。',
        '桌面进入午休频道。',
        '让我暂停一下，醒来继续冲。',
        '眼皮正在申请下班。',
        '我没有偷懒，我在后台整理灵感。',
        '睡一小会儿，醒来继续可爱。'
      ],
      fallback: [
        '来了来了。',
        '我在，直接说。',
        '桌面搭子上线。'
      ]
    },
    focus: {
      idle: [
        '保持专注，先做下一步。',
        '当前节奏稳定。',
        '任务可以拆成更小块。',
        '先完成一个明确动作。',
        '桌面保持安静。',
        '少一点切换，多一点推进。',
        '我会尽量不打扰你。',
        '专注窗口已打开。'
      ],
      happy: [
        '进展不错。',
        '这一步完成得很好。',
        '状态稳定上升。',
        '继续保持。',
        '一次有效推进。',
        '不错，动量有了。',
        '这一点值得记录。',
        '节奏很好，别急着换方向。'
      ],
      thinking: [
        '先确认目标，再看路径。',
        '这个问题可以先列约束。',
        '把不确定的部分标出来。',
        '下一步可以更具体一点。',
        '先找最容易验证的假设。',
        '减少变量，问题会清楚很多。',
        '我们从关键条件开始。',
        '把想法写下来，会更稳。'
      ],
      sleepy: [
        '建议休息一下再继续。',
        '长时间专注后，需要恢复。',
        '现在适合短暂停顿。',
        '保存一下进度也不错。',
        '眼睛休息十秒。',
        '把肩膀放松一点。',
        '暂停不是倒退。',
        '恢复之后再推进。'
      ],
      fallback: [
        '当前状态正常。',
        '继续推进。',
        '我在旁边记录节奏。'
      ]
    },
    playful: {
      idle: [
        '我假装没有盯着你。',
        '桌面很安静，适合突然努力。',
        '今天的待机姿势很专业。',
        '我正在进行严肃的发呆。',
        '你忙，我负责看起来很忙。',
        '这块桌面由我临时托管。',
        '我在等一个合适的被点击时机。',
        '空气里有一点想摸鱼的味道。'
      ],
      happy: [
        '哎呀，被点到了。',
        '这一下算有效互动。',
        '开心，但是要保持形象。',
        '你再点，我就继续开心。',
        '桌面欢乐指数加一。',
        '合理，今天就该这样。',
        '我批准这次摸摸。',
        '好吧，有被哄到。'
      ],
      thinking: [
        '我思考一下，虽然头不大。',
        '这个问题看起来有点会绕。',
        '让我把眉头借来皱一下。',
        '答案可能躲在角落里。',
        '我正在进行高强度可爱分析。',
        '先不要急，急了也没用，挺合理。',
        '这事需要一点桌面智慧。',
        '脑内会议开始。'
      ],
      sleepy: [
        '我先睡，不代表我输了。',
        '困了，但还保持可爱。',
        '进入节能可爱模式。',
        '如果有事，请轻点叫醒。',
        '梦里也许能想出方案。',
        '我只是暂时离线一下下。',
        '眼睛：申请合上。',
        '这不是偷懒，是战略休眠。'
      ],
      fallback: [
        '我在，别戳太用力。',
        '有什么事，先夸我。',
        '桌面客服小小号在线。'
      ]
    }
  }
};

export function normalizeSettings(settings = {}) {
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
    customMessages: normalizeMessages(settings.customMessages ?? settings.messages),
    messageStyles: defaultSettings.messageStyles
  };
}

export function getLanguageStyleOptions() {
  return [
    ['gentle', '温柔陪伴'],
    ['lively', '元气活泼'],
    ['focus', '专注工作'],
    ['playful', '调皮吐槽']
  ];
}

function normalizeLanguageStyle(style) {
  return defaultSettings.messageStyles[style] ? style : defaultSettings.languageStyle;
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
