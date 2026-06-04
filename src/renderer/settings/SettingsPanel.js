import { getLanguageStyleOptions } from './defaultSettings.js';
import { recommendedSkinSpecs, skinActionLabels, skinUploadSlots } from '../../skin/defaultFallbacks.js';
import { applyBubbleImageSkin, bubbleSkinPieceNames, getBubbleSkinTone } from '../bubble/BubbleView.js';

const messageFields = [
  ['idle', '待机文案'],
  ['happy', '开心文案'],
  ['thinking', '思考文案'],
  ['sleepy', '睡觉文案']
];

const moduleFields = [
  ['local', '自定义文案'],
  ['weather', '天气'],
  ['jimeng', '即梦进度'],
  ['calendar', '日历提醒'],
  ['codex', 'Codex 状态']
];

export function createSettingsPanel({
  settingsStore,
  informationModuleRegistry,
  bubbleView,
  petView,
  gameController,
  jimengService,
  codexService,
  skinManager,
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
        <div class="settings-panel__grid">
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
      </div>

      <div class="settings-panel__section">
        <h2>天气</h2>
        <div class="settings-panel__grid">
          <label class="settings-panel__field">
            <span>城市</span>
            <input name="weatherCity" type="text" placeholder="北京" />
          </label>
          <label class="settings-panel__field">
            <span>点击天气提醒间隔（分钟）</span>
            <input name="weatherClickInterval" type="number" min="1" max="360" step="1" />
          </label>
        </div>
      </div>

      <div class="settings-panel__section">
        <h2>即梦</h2>
        <div class="settings-panel__grid">
          <label class="settings-panel__field settings-panel__field--wide">
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
        </div>
        <div class="settings-panel__actions">
          <button type="button" data-action="open-jimeng">打开即梦页面</button>
          <button type="button" data-action="check-jimeng">立即检查</button>
        </div>
      </div>

      <div class="settings-panel__section">
        <h2>日历</h2>
        <div class="settings-panel__grid">
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
      </div>

      <div class="settings-panel__section">
        <h2>Codex</h2>
        <div class="settings-panel__grid">
          <label class="settings-panel__field settings-panel__field--wide">
            <span>状态文件路径</span>
            <input name="codexStatusFilePath" type="text" placeholder="留空使用项目根目录 codex-status.json" />
          </label>
          <label class="settings-panel__field">
            <span>检查频率（秒）</span>
            <input name="codexCheckInterval" type="number" min="1" max="1800" step="1" />
          </label>
          <label class="settings-panel__toggle">
            <span>开启 Codex 提醒</span>
            <input name="codexReminderEnabled" type="checkbox" />
          </label>
          <label class="settings-panel__toggle">
            <span>等待确认提醒</span>
            <input name="codexWaitingReminderEnabled" type="checkbox" />
          </label>
          <label class="settings-panel__toggle">
            <span>完成提醒</span>
            <input name="codexCompletedReminderEnabled" type="checkbox" />
          </label>
          <label class="settings-panel__toggle">
            <span>失败提醒</span>
            <input name="codexFailedReminderEnabled" type="checkbox" />
          </label>
          <label class="settings-panel__toggle">
            <span>暂停提醒</span>
            <input name="codexPausedReminderEnabled" type="checkbox" />
          </label>
        </div>
        <div class="settings-panel__actions">
          <button type="button" data-action="check-codex">查看 Codex 状态</button>
        </div>
      </div>

      <div class="settings-panel__section">
        <h2>模块</h2>
        <div class="settings-panel__toggles"></div>
        <div class="settings-panel__actions">
          <button type="button" data-module="local">显示文案</button>
          <button type="button" data-module="weather">天气</button>
          <button type="button" data-module="jimeng">即梦</button>
          <button type="button" data-module="calendar">日历</button>
          <button type="button" data-module="codex">Codex</button>
        </div>
      </div>

      <div class="settings-panel__section">
        <h2>皮肤设置</h2>
        <div class="settings-panel__skin-summary">
          <span>当前皮肤：<strong data-skin-current-name>默认皮肤</strong></span>
          <button type="button" data-action="delete-skin">删除皮肤</button>
        </div>
        <div class="settings-panel__skin-create">
          <input name="skinName" type="text" placeholder="自定义皮肤名称" />
          <button type="button" data-action="create-skin">新建皮肤</button>
        </div>
        <label class="settings-panel__field">
          <span>切换皮肤</span>
          <select name="skinSelect"></select>
        </label>
        <div class="settings-panel__bubble-preview" data-bubble-preview>
          <span class="bubble__skin" data-bubble-preview-skin-layer hidden>
            ${bubbleSkinPieceNames.map((name) => `<img class="bubble__piece bubble__piece--${toKebabCase(name)}" alt="" data-bubble-preview-piece="${name}" />`).join('')}
          </span>
          <span>对话框预览</span>
          <strong data-bubble-preview-name>默认皮肤</strong>
        </div>
        <p class="settings-panel__notice" data-skin-warning hidden>部分动作或对话框切片缺失，将使用默认资源替代</p>
        <p class="settings-panel__hint">${recommendedSkinSpecs.bubble.label}<br />${recommendedSkinSpecs.normal.label}<br />${recommendedSkinSpecs.game.label}</p>
        <div class="settings-panel__skin-slots"></div>
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
  const header = element.querySelector('.settings-panel__header');
  const closeButton = element.querySelector('[data-action="close"]');
  const toggleContainer = element.querySelector('.settings-panel__toggles');
  const messageContainer = element.querySelector('.settings-panel__messages');
  const skinSlotContainer = element.querySelector('.settings-panel__skin-slots');
  const currentSkinNameElement = element.querySelector('[data-skin-current-name]');
  const skinWarningElement = element.querySelector('[data-skin-warning]');
  const deleteSkinButton = element.querySelector('[data-action="delete-skin"]');
  const bubblePreviewElement = element.querySelector('[data-bubble-preview]');
  const bubblePreviewNameElement = element.querySelector('[data-bubble-preview-name]');
  const bubblePreviewSkinLayer = element.querySelector('[data-bubble-preview-skin-layer]');
  const bubblePreviewPieces = Object.fromEntries(
    Array.from(element.querySelectorAll('[data-bubble-preview-piece]')).map((piece) => [
      piece.dataset.bubblePreviewPiece,
      piece
    ])
  );
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
    calendarPollInterval: form.elements.calendarPollInterval,
    calendarNotifyBefore: form.elements.calendarNotifyBefore,
    calendarLookAhead: form.elements.calendarLookAhead,
    calendarSystemNotification: form.elements.calendarSystemNotification,
    codexStatusFilePath: form.elements.codexStatusFilePath,
    codexCheckInterval: form.elements.codexCheckInterval,
    codexReminderEnabled: form.elements.codexReminderEnabled,
    codexWaitingReminderEnabled: form.elements.codexWaitingReminderEnabled,
    codexCompletedReminderEnabled: form.elements.codexCompletedReminderEnabled,
    codexFailedReminderEnabled: form.elements.codexFailedReminderEnabled,
    codexPausedReminderEnabled: form.elements.codexPausedReminderEnabled,
    skinSelect: form.elements.skinSelect,
    skinName: form.elements.skinName
  };

  let currentSettings = settingsStore.getSettings();
  let currentSkinState = skinManager.getState();
  let panelDragState = null;

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

  renderSkinSlotFields();

  settingsStore.subscribe((settings) => {
    currentSettings = settings;
    render(settings);
  });

  skinManager.subscribe((state) => {
    currentSkinState = state;
    renderSkinState(state);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await settingsStore.update(readFormSettings());
    close();
  });

  closeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    close();
  });

  header.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button')) {
      return;
    }

    panelDragState = getDragPoint(event);
    header.setPointerCapture(event.pointerId);
    panelApi?.dragStart(panelDragState);
  });

  header.addEventListener('pointermove', (event) => {
    if (!panelDragState) {
      return;
    }

    panelApi?.dragMove(getDragPoint(event));
  });

  header.addEventListener('pointerup', (event) => {
    if (!panelDragState) {
      return;
    }

    panelDragState = null;
    header.releasePointerCapture(event.pointerId);
    panelApi?.dragEnd();
  });

  header.addEventListener('pointercancel', () => {
    if (!panelDragState) {
      return;
    }

    panelDragState = null;
    panelApi?.dragEnd();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.dataset.settingsOpen === 'true') {
      close();
    }
  });

  element.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const moduleName = event.target.closest('[data-module]')?.dataset.module;
    const uploadButton = event.target.closest('[data-skin-upload]');

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

    if (action === 'check-codex') {
      await persistPanelSettings();
      close();
      await showModuleMessage('codex');
      return;
    }

    if (action === 'create-skin') {
      await createNewSkin();
      return;
    }

    if (action === 'delete-skin') {
      await deleteCurrentSkin();
      return;
    }

    if (uploadButton) {
      uploadButton.parentElement.querySelector('input[type="file"]')?.click();
      return;
    }

    if (moduleName) {
      await showModuleMessage(moduleName);
    }
  });

  inputs.skinSelect.addEventListener('change', async () => {
    await skinManager.switchSkin(inputs.skinSelect.value);
    petView.setPersistentAction('normal', 'idle');
    showSkinChangeFeedback();
  });

  skinSlotContainer.addEventListener('change', async (event) => {
    const input = event.target.closest('[data-skin-file]');

    if (!input || !input.files?.[0]) {
      return;
    }

    await uploadSkinImage(input, input.files[0]);
    input.value = '';
  });

  function open() {
    document.body.dataset.settingsOpen = 'true';
    panelApi?.setMouseIgnore?.(false);
    panelApi?.setSettingsPanelVisible(true);
    render(currentSettings);
  }

  function close() {
    document.body.dataset.settingsOpen = 'false';
    panelApi?.setMouseIgnore?.(false);
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
    inputs.calendarPollInterval.value = String(Math.round(settings.calendar.pollIntervalMs / 1000));
    inputs.calendarNotifyBefore.value = String(Math.round(settings.calendar.notifyBeforeMinutes));
    inputs.calendarLookAhead.value = String(Math.round(settings.calendar.lookAheadMinutes / 60));
    inputs.calendarSystemNotification.checked = Boolean(settings.calendar.systemNotification);
    inputs.codexStatusFilePath.value = settings.codexStatusFilePath;
    inputs.codexCheckInterval.value = String(Math.round(settings.codexCheckInterval / 1000));
    inputs.codexReminderEnabled.checked = Boolean(settings.codexReminderEnabled);
    inputs.codexWaitingReminderEnabled.checked = Boolean(settings.codexWaitingReminderEnabled);
    inputs.codexCompletedReminderEnabled.checked = Boolean(settings.codexCompletedReminderEnabled);
    inputs.codexFailedReminderEnabled.checked = Boolean(settings.codexFailedReminderEnabled);
    inputs.codexPausedReminderEnabled.checked = Boolean(settings.codexPausedReminderEnabled);
    inputs.skinSelect.value = settings.skin.currentSkinId;

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
      calendar: {
        ...currentSettings.calendar,
        pollIntervalMs: Number(inputs.calendarPollInterval.value) * 1000,
        notifyBeforeMinutes: Number(inputs.calendarNotifyBefore.value),
        lookAheadMinutes: Number(inputs.calendarLookAhead.value) * 60,
        systemNotification: inputs.calendarSystemNotification.checked
      },
      codexStatusFilePath: inputs.codexStatusFilePath.value,
      codexCheckInterval: Number(inputs.codexCheckInterval.value) * 1000,
      codexReminderEnabled: inputs.codexReminderEnabled.checked,
      codexWaitingReminderEnabled: inputs.codexWaitingReminderEnabled.checked,
      codexCompletedReminderEnabled: inputs.codexCompletedReminderEnabled.checked,
      codexFailedReminderEnabled: inputs.codexFailedReminderEnabled.checked,
      codexPausedReminderEnabled: inputs.codexPausedReminderEnabled.checked,
      modules: Object.fromEntries(
        moduleFields.map(([name]) => [name, form.elements[`module-${name}`].checked])
      ),
      customMessages: nextMessages
    };
  }

  async function persistPanelSettings() {
    currentSettings = await settingsStore.update(readFormSettings());
  }

  async function createNewSkin() {
    const name = inputs.skinName.value.trim();

    await skinManager.createSkin(name);
    inputs.skinName.value = '';
    petView.setPersistentAction('normal', 'idle');
    showSkinChangeFeedback();
  }

  async function deleteCurrentSkin() {
    const currentSkin = currentSkinState.currentSkin;

    if (!currentSkin || currentSkin.builtIn) {
      return;
    }

    const shouldDelete = window.confirm(`删除皮肤“${currentSkin.name}”？上传到这套皮肤的动作图片也会一起删除。`);

    if (!shouldDelete) {
      return;
    }

    await skinManager.deleteSkin(currentSkin.id);
    petView.setPersistentAction('normal', 'idle');
    showSkinChangeFeedback();
  }

  async function uploadSkinImage(input, file) {
    const category = input.dataset.category;
    const action = input.dataset.action;
    const validation = await validateUploadFile(file, category, action);

    if (!validation.ok) {
      window.alert(validation.message);
      return;
    }

    if (validation.message) {
      window.alert(validation.message);
    }

    await skinManager.uploadActionImage({
      skinId: currentSkinState.currentSkinId,
      category,
      action,
      filePath: file.path
    });
    petView.setPersistentAction('normal', 'idle');
    showSkinChangeFeedback();
  }

  async function showModuleMessage(moduleName) {
    if (!currentSettings.modules[moduleName]) {
      return;
    }

    const message = await informationModuleRegistry.getMessage(moduleName);

    close();
    petView.playAction('normal', moduleName === 'codex' ? 'thinking' : 'talk', { duration: 700 });
    bubbleView.show(message, {
      anchorElement: petView.element
    });
  }

  function renderSkinSlotFields() {
    Object.entries(skinUploadSlots).forEach(([category, actions]) => {
      const group = document.createElement('div');

      group.className = 'settings-panel__skin-group';
      group.innerHTML = `<h3>${getSkinGroupTitle(category)}</h3>`;

      actions.forEach((action) => {
        const slot = document.createElement('div');
        const label = skinActionLabels[category]?.[action] ?? action;

        slot.className = 'settings-panel__skin-slot';
        slot.dataset.category = category;
        slot.dataset.action = action;
        slot.innerHTML = `
          <button class="settings-panel__skin-card" type="button" data-skin-upload aria-label="上传 ${action}">
            <span class="settings-panel__skin-plus" data-skin-plus>+</span>
            <img class="settings-panel__skin-preview" alt="" data-skin-preview="${category}:${action}" />
            <span class="settings-panel__skin-label">${label}</span>
          </button>
          <input data-skin-file data-category="${category}" data-action="${action}" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" hidden />
        `;
        group.append(slot);
      });

      skinSlotContainer.append(group);
    });
  }

  function renderSkinState(state) {
    const currentSkin = state.currentSkin;

    inputs.skinSelect.replaceChildren();
    state.skins.forEach((skin) => {
      const option = document.createElement('option');

      option.value = skin.id;
      option.textContent = skin.name;
      inputs.skinSelect.append(option);
    });
    inputs.skinSelect.value = state.currentSkinId;
    currentSkinNameElement.textContent = currentSkin?.name ?? '默认皮肤';
    renderBubblePreview(currentSkin);
    skinWarningElement.hidden = Boolean(currentSkin?.builtIn || currentSkin?.validation?.isComplete);
    deleteSkinButton.disabled = Boolean(!currentSkin || currentSkin.builtIn);

    Object.entries(skinUploadSlots).forEach(([category, actions]) => {
      actions.forEach((action) => {
        const preview = element.querySelector(`[data-skin-preview="${category}:${action}"]`);
        const slot = element.querySelector(`.settings-panel__skin-slot[data-category="${category}"][data-action="${action}"]`);
        const uploadButton = slot?.querySelector('[data-skin-upload]');
        const plus = slot?.querySelector('[data-skin-plus]');
        const asset = getSkinSlotAsset(currentSkin, category, action);

        if (!preview) {
          return;
        }

        preview.hidden = !asset?.src;
        preview.onerror = () => {
          preview.onerror = null;
          preview.src = asset?.fallbackSrc || '';
        };
        preview.src = asset?.src || '';

        if (plus) {
          plus.hidden = Boolean(asset?.src);
        }

        if (uploadButton) {
          uploadButton.disabled = Boolean(currentSkin?.builtIn);
          uploadButton.title = currentSkin?.builtIn ? '先新建皮肤' : `上传 ${skinActionLabels[category]?.[action] ?? action}`;
        }
      });
    });
  }

  function renderBubblePreview(skin) {
    const tone = getBubbleSkinTone(skin);

    Object.entries(tone).forEach(([name, value]) => {
      bubblePreviewElement.style.setProperty(name, value);
    });
    bubblePreviewNameElement.textContent = skin?.name ?? '默认皮肤';
    applyBubbleImageSkin(bubblePreviewElement, bubblePreviewSkinLayer, bubblePreviewPieces, skin);
  }

  function getSkinSlotAsset(skin, category, action) {
    if (skin?.builtIn && category !== 'bubble') {
      return skinManager.getActionAsset(category, action);
    }

    return skin?.assets?.[category]?.[action];
  }

  function showSkinChangeFeedback() {
    const skin = skinManager.getState().currentSkin;

    renderBubblePreview(skin);
    playBubblePreviewEffect();
    bubbleView.setSkin?.(skin);
    bubbleView.showSkinChange?.(skin, {
      anchorElement: petView.element,
      duration: 1800
    });
  }

  function playBubblePreviewEffect() {
    bubblePreviewElement.classList.remove('settings-panel__bubble-preview--changing');
    void bubblePreviewElement.offsetWidth;
    bubblePreviewElement.classList.add('settings-panel__bubble-preview--changing');
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

async function validateUploadFile(file, category, action) {
  if (!file?.path || !/\.(png|jpe?g|webp)$/i.test(file.name)) {
    return {
      ok: false,
      message: '只允许上传 png、jpg、jpeg、webp 图片。'
    };
  }

  const size = await readImageSize(file);
  const spec = recommendedSkinSpecs[category]?.[action] ?? recommendedSkinSpecs[category];

  if (!size || !spec?.width || !spec?.height || (size.width === spec.width && size.height === spec.height)) {
    return { ok: true, message: '' };
  }

  return {
    ok: true,
    message: `图片尺寸是 ${size.width} x ${size.height} px，推荐规格是 ${spec.width} x ${spec.height} px。仍会继续使用这张图片。`
  };
}

function getSkinGroupTitle(category) {
  const titles = {
    bubble: '对话框切片',
    normal: '普通动作',
    game: '小游戏动作'
  };

  return titles[category] ?? category;
}

function toKebabCase(value) {
  return String(value).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function readImageSize(file) {
  return new Promise((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

function formatSeconds(milliseconds) {
  return String(Math.round(milliseconds / 100) / 10);
}

function getDragPoint(event) {
  return {
    x: Math.round(event.screenX),
    y: Math.round(event.screenY),
    clientX: Math.round(event.clientX),
    clientY: Math.round(event.clientY)
  };
}
