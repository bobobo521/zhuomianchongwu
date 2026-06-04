const fallbackMessages = {
  weather: '天气模块已预留，后续会接入真实天气。',
  jimeng: '即梦监控已预留，后续会读取生成进度。',
  calendar: '日历提醒暂时读不到，我会继续留意。',
  codex: 'Codex 状态提醒已预留，我会留意任务状态。'
};

export function createInformationModuleRegistry({
  messageProvider,
  weatherService,
  jimengService,
  calendarService,
  codexService
}) {
  const modules = new Map();

  register('local', {
    getMessage() {
      return messageProvider.getMessage('idle');
    }
  });

  register('weather', {
    getMessage() {
      return weatherService?.getMessage() ?? fallbackMessages.weather;
    }
  });

  register('jimeng', {
    getMessage() {
      return jimengService?.getMessage() ?? fallbackMessages.jimeng;
    }
  });

  register('calendar', {
    getMessage() {
      return calendarService?.getMessage() ?? fallbackMessages.calendar;
    }
  });

  register('codex', {
    getMessage() {
      return codexService?.getMessage() ?? fallbackMessages.codex;
    }
  });

  function register(name, module) {
    modules.set(name, module);
  }

  async function getMessage(name) {
    const module = modules.get(name);

    if (!module) {
      return '这个信息模块还没有注册。';
    }

    try {
      return await module.getMessage();
    } catch {
      return '信息暂时读取失败，但宠物还在。';
    }
  }

  return {
    register,
    getMessage
  };
}
