import { getLanguageStyleOptions } from './defaultSettings.js';

const messageFields = [
  ['idle', '待机文案'],
  ['happy', '开心文案'],
  ['thinking', '思考文案'],
  ['sleepy', '睡觉文案']
];

const moduleFields = [
  ['local', '自定义文案'],
  ['weather', '天气'],
  ['codex', 'Codex 进度'],
  ['jimeng', '即梦进度'],
  ['calendar', '日历提醒']
];

export function createSettingsPanel({
  settingsStore,
  informationModuleRegistry,
  bubbleView,
  petView,
  gameController,
  jimengService,
  panelApi
}) {
  const element = document.createElement('section');
  element.className = 'settings-panel';
  element.setAttribute('aria-label', '设置');

  element.innerHTML = `
    <form class="settings-panel__form">
      <header class="settings-panel__header">
        <h1>设置</h1>
        <button class="settings-panel__icon-button" type="button" data-action="close" aria-label="关闭">×</button>
      </header>

      <div class="settings-panel__section">
        <h2>交互</h2>
        <label class="settings-panel__field">
          <span>气泡显示时间（秒）</span>
          <input name="bubbleDuration" type="number" min="0.5" max="20" step="0.5" />
        </label>
        <label class="settings-panel__field">
          <span>长按触发时间（秒）</span>
          <input name="longPressDuration" type="number" min="0.3" max="5" step="0.1" />
        </label>
        <label class="settings-panel__field">
          <span>闲置后睡觉（秒）</span>
          <input name="idleSleepDelay" type="number" min="5" max="1800" step="1" />
        </label>
        <label class="settings-panel__field">
          <span>宠物整体尺寸（%）</span>
          <input name="petScale" type="number" min="50" max="180" step="5" />
        </label>
        <label class="settings-panel__field">
          <span>语言风格</span>
          <select name="languageStyle"></select>
        </label>
      </div>

      <div class="settings-panel__section">
        <h2>天气</h2>
        <label class="settings-panel__field">
          <span>城市</span>
          <input name="weatherCity" type="text" placeholder="北京" />
        </label>
        <label class="settings-panel__field">
          <span>点击天气提醒间隔（分钟）</span>
          <input name="weatherClickInterval" type="number" min="1" max="360" step="1" />
        </label>
      </div>

      <div class="settings-panel__section">
        <h2>即梦</h2>
        <label class="settings-panel__field">
          <span>监控页面地址</span>
          <input name="jimengStatusUrl" type="text" placeholder="https://jimeng.jianying.com/..." />
        </label>
        <label class="settings-panel__field">
          <span>检查间隔（秒）</span>
          <input name="jimengPollInterval" type="number" min="5" max="600" step="5" />
        </label>
        <label class="settings-panel__toggle">
          <span>完成后系统通知</span>
          <input name="jimengCompletionNotification" type="checkbox" />
        </label>
        <div class="settings-panel__actions">
          <button type="button" data-action="open-jimeng">打开即梦页面</button>
          <button type="button" data-action="check-jimeng">立即检查</button>
        </div>
      </div>

      <div class="settings-panel__section">
        <h2>Codex</h2>
        <label class="settings-panel__field">
          <span>本地状态文件（可选）</span>
          <input name="codexStatusPath" type="text" placeholder="默认读取 ~/.codex/desktop-pet-codex-status.json" />
        </label>
        <label class="settings-panel__field">
          <span>检查间隔（秒）</span>
          <input name="codexPollInterval" type="number" min="5" max="300" step="5" />
        </label>
        <label class="settings-panel__field">
          <span>额度提醒间隔（分钟）</span>
          <input name="codexUsageReminderInterval" type="number" min="1" max="360" step="1" />
        </label>
        <label class="settings-panel__toggle">
          <span>时不时提醒剩余额度</span>
          <input name="codexUsageReminder" type="checkbox" />
        </label>
      </div>

      <div class="settings-panel__section">
        <h2>日历</h2>
        <label class="settings-panel__field">
          <span>检查间隔（秒）</span>
          <input name="calendarPollInterval" type="number" min="15" max="1800" step="15" />
        </label>
        <label class="settings-panel__field">
          <span>提前提醒（分钟）</span>
          <input name="calendarNotifyBefore" type="number" min="0" max="1440" step="1" />
        </label>
        <label class="settings-panel__field">
          <span>查看未来（小时）</span>
          <input name="calendarLookAhead" type="number" min="1" max="168" step="1" />
        </label>
        <label class="settings-panel__toggle">
          <span>同时发送系统通知</span>
          <input name="calendarSystemNotification" type="checkbox" />
        </label>
      </div>

      <div class="settings-panel__section">
        <h2>模块</h2>
        <div class="settings-panel__toggles"></div>
        <div class="settings-panel__actions">
          <button type="button" data-module="local">显示文案</button>
          <button type="button" data-module="weather">天气</button>
          <button type="button" data-module="codex">Codex</button>
          <button type="button" data-module="jimeng">即梦</button>
          <button type="button" data-module="calendar">日历</button>
        </div>
      </div>

      <div class="settings-panel__section">
        <h2>额外文案</h2>
        <div class="settings-panel__messages"></div>
      </div>

      <footer class="settings-panel__footer">
        <button type="button" data-action="toggle-game">进入/退出热气球射箭</button>
        <button type="submit">保存</button>
      </footer>
    </form>
  `;

  const form = element.querySelector('.settings-panel__form');
  const toggleContainer = element.querySelector('.settings-panel__toggles');
  const messageContainer = element.querySelector('.settings-panel__messages');
  const moduleButtons = Array.from(element.querySelectorAll('[data-module]'));
  const inputs = {
    bubbleDuration: form.elements.bubbleDuration,
    longPressDuration: form.elements.longPressDuration,
    idleSleepDelay: form.elements.idleSleepDelay,
    petScale: form.elements.petScale,
    languageStyle: form.elements.languageStyle,
    weatherCity: form.elements.weatherCity,
    weatherClickInterval: form.elements.weatherClickInterval,
    jimengStatusUrl: form.elements.jimengStatusUrl,
    jimengPollInterval: form.elements.jimengPollInterval,
    jimengCompletionNotification: form.elements.jimengCompletionNotification,
    codexStatusPath: form.elements.codexStatusPath,
    codexPollInterval: form.elements.codexPollInterval,
    codexUsageReminderInterval: form.elements.codexUsageReminderInterval,
    codexUsageReminder: form.elements.codexUsageReminder,
    calendarPollInterval: form.elements.calendarPollInterval,
    calendarNotifyBefore: form.elements.calendarNotifyBefore,
    calendarLookAhead: form.elements.calendarLookAhead,
    calendarSystemNotification: form.elements.calendarSystemNotification
  };

  let currentSettings = settingsStore.getSettings();

  getLanguageStyleOptions().forEach(([value, label]) => {
    const option = document.createElement('option');

    option.value = value;
    option.textContent = label;
    inputs.languageStyle.append(option);
  });

  moduleFields.forEach(([name, label]) => {
    const field = document.createElement('label');

    field.className = 'settings-panel__toggle';
    field.innerHTML = `
      <span>${label}</span>
      <input name="module-${name}" type="checkbox" />
    `;
    toggleContainer.append(field);
  });

  messageFields.forEach(([name, label]) => {
    const field = document.createElement('label');

    field.className = 'settings-panel__field settings-panel__field--textarea';
    field.innerHTML = `
      <span>${label}</span>
      <textarea name="message-${name}" rows="3"></textarea>
    `;
    messageContainer.append(field);
  });

  settingsStore.subscribe((settings) => {
    currentSettings = settings;
    render(settings);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await settingsStore.update(readFormSettings());
    close();
  });

  element.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const moduleName = event.target.closest('[data-module]')?.dataset.module;

    if (action === 'close') {
      close();
      return;
    }

    if (action === 'toggle-game') {
      close();
      gameController.toggleGame('balloon-shooter');
      return;
    }

    if (action === 'open-jimeng') {
      await persistPanelSettings();
      jimengService?.openPage();
      return;
    }

    if (action === 'check-jimeng') {
      await persistPanelSettings();
      close();
      await showModuleMessage('jimeng');
      return;
    }

    if (moduleName) {
      await showModuleMessage(moduleName);
    }
  });

  function open() {
    document.body.dataset.settingsOpen = 'true';
    panelApi?.setSettingsPanelVisible(true);
    render(currentSettings);
  }

  function close() {
    document.body.dataset.settingsOpen = 'false';
    panelApi?.setSettingsPanelVisible(false);
  }

  function render(settings) {
    inputs.bubbleDuration.value = formatSeconds(settings.bubbleDurationMs);
    inputs.longPressDuration.value = formatSeconds(settings.longPressDurationMs);
    inputs.idleSleepDelay.value = formatSeconds(settings.idleSleepDelayMs);
    inputs.petScale.value = String(Math.round(settings.petScale * 100));
    inputs.languageStyle.value = settings.languageStyle;
    inputs.weatherCity.value = settings.weather.city;
    inputs.weatherClickInterval.value = String(Math.round(settings.weather.clickIntervalMs / 60000));
    inputs.jimengStatusUrl.value = settings.jimeng.statusUrl;
    inputs.jimengPollInterval.value = String(Math.round(settings.jimeng.pollIntervalMs / 1000));
    inputs.jimengCompletionNotification.checked = Boolean(settings.jimeng.completionNotification);
    inputs.codexStatusPath.value = settings.codex.statusPath;
    inputs.codexPollInterval.value = String(Math.round(settings.codex.pollIntervalMs / 1000));
    inputs.codexUsageReminderInterval.value = String(Math.round(settings.codex.usageReminderIntervalMs / 60000));
    inputs.codexUsageReminder.checked = Boolean(settings.codex.usageReminder);
    inputs.calendarPollInterval.value = String(Math.round(settings.calendar.pollIntervalMs / 1000));
    inputs.calendarNotifyBefore.value = String(Math.round(settings.calendar.notifyBeforeMinutes));
    inputs.calendarLookAhead.value = String(Math.round(settings.calendar.lookAheadMinutes / 60));
    inputs.calendarSystemNotification.checked = Boolean(settings.calendar.systemNotification);

    moduleFields.forEach(([name]) => {
      form.elements[`module-${name}`].checked = Boolean(settings.modules[name]);
    });

    messageFields.forEach(([name]) => {
      form.elements[`message-${name}`].value = settings.customMessages[name].join('\n');
    });

    moduleButtons.forEach((button) => {
      const moduleName = button.dataset.module;

      button.disabled = !settings.modules[moduleName];
    });
  }

  function readFormSettings() {
    const nextMessages = {
      ...currentSettings.customMessages
    };

    messageFields.forEach(([name]) => {
      nextMessages[name] = parseLines(form.elements[`message-${name}`].value);
    });
    nextMessages.fallback = nextMessages.idle;

    return {
      ...currentSettings,
      bubbleDurationMs: Number(inputs.bubbleDuration.value) * 1000,
      longPressDurationMs: Number(inputs.longPressDuration.value) * 1000,
      idleSleepDelayMs: Number(inputs.idleSleepDelay.value) * 1000,
      petScale: Number(inputs.petScale.value) / 100,
      languageStyle: inputs.languageStyle.value,
      weather: {
        ...currentSettings.weather,
        city: inputs.weatherCity.value,
        clickIntervalMs: Number(inputs.weatherClickInterval.value) * 60000
      },
      jimeng: {
        ...currentSettings.jimeng,
        statusUrl: inputs.jimengStatusUrl.value,
        pollIntervalMs: Number(inputs.jimengPollInterval.value) * 1000,
        completionNotification: inputs.jimengCompletionNotification.checked
      },
      codex: {
        ...currentSettings.codex,
        statusPath: inputs.codexStatusPath.value,
        pollIntervalMs: Number(inputs.codexPollInterval.value) * 1000,
        usageReminderIntervalMs: Number(inputs.codexUsageReminderInterval.value) * 60000,
        usageReminder: inputs.codexUsageReminder.checked
      },
      calendar: {
        ...currentSettings.calendar,
        pollIntervalMs: Number(inputs.calendarPollInterval.value) * 1000,
        notifyBeforeMinutes: Number(inputs.calendarNotifyBefore.value),
        lookAheadMinutes: Number(inputs.calendarLookAhead.value) * 60,
        systemNotification: inputs.calendarSystemNotification.checked
      },
      modules: Object.fromEntries(
        moduleFields.map(([name]) => [name, form.elements[`module-${name}`].checked])
      ),
      customMessages: nextMessages
    };
  }

  async function persistPanelSettings() {
    currentSettings = await settingsStore.update(readFormSettings());
  }

  async function showModuleMessage(moduleName) {
    if (!currentSettings.modules[moduleName]) {
      return;
    }

    const message = await informationModuleRegistry.getMessage(moduleName);

    close();
    petView.playAction('normal', 'talk', { duration: 700 });
    bubbleView.show(message, {
      anchorElement: petView.element
    });
  }

  return {
    element,
    open,
    close
  };
}

function parseLines(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function formatSeconds(milliseconds) {
  return String(Math.round(milliseconds / 100) / 10);
}
