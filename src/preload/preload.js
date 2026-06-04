const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopPet', {
  dragStart(point) {
    return ipcRenderer.invoke('pet-drag:start', point);
  },
  dragMove(point) {
    return ipcRenderer.invoke('pet-drag:move', point);
  },
  dragEnd() {
    return ipcRenderer.invoke('pet-drag:end');
  },
  showContextMenu(point) {
    return ipcRenderer.invoke('pet-menu:show', point);
  },
  setWindowMode(modeName) {
    return ipcRenderer.invoke('pet-window:set-mode', modeName);
  },
  setMouseIgnore(shouldIgnore) {
    return ipcRenderer.invoke('pet-window:set-mouse-ignore', shouldIgnore);
  },
  setSettingsPanelVisible(isVisible) {
    return ipcRenderer.invoke('pet-window:set-settings-panel-visible', isVisible);
  },
  setPetScale(scale) {
    return ipcRenderer.invoke('pet-window:set-pet-scale', scale);
  },
  loadSettings() {
    return ipcRenderer.invoke('pet-settings:load');
  },
  saveSettings(settings) {
    return ipcRenderer.invoke('pet-settings:save', settings);
  },
  listSkins() {
    return ipcRenderer.invoke('pet-skins:list');
  },
  createSkin(name) {
    return ipcRenderer.invoke('pet-skins:create', name);
  },
  setCurrentSkin(skinId) {
    return ipcRenderer.invoke('pet-skins:set-current', skinId);
  },
  deleteSkin(skinId) {
    return ipcRenderer.invoke('pet-skins:delete', skinId);
  },
  uploadSkinImage(payload) {
    return ipcRenderer.invoke('pet-skins:upload-image', payload);
  },
  checkJimengStatus(statusUrl) {
    return ipcRenderer.invoke('pet-jimeng:check', statusUrl);
  },
  openJimengPage(statusUrl) {
    return ipcRenderer.invoke('pet-jimeng:open-page', statusUrl);
  },
  getCalendarEvents(options) {
    return ipcRenderer.invoke('pet-calendar:events', options);
  },
  configureCodexReminder(settings) {
    return ipcRenderer.invoke('pet-codex:configure', settings);
  },
  readCodexStatus() {
    return ipcRenderer.invoke('pet-codex:read-status');
  },
  setCodexReminderEnabled(enabled) {
    return ipcRenderer.invoke('pet-codex:set-reminder-enabled', enabled);
  },
  notifyJimengSuccess(message) {
    return ipcRenderer.invoke('pet-notification:jimeng-success', message);
  },
  notifyCalendarEvent(payload) {
    return ipcRenderer.invoke('pet-notification:calendar-event', payload);
  },
  onMenuCommand(callback) {
    const listener = (event, payload) => {
      callback(payload);
    };

    ipcRenderer.on('pet-menu:command', listener);

    return () => {
      ipcRenderer.removeListener('pet-menu:command', listener);
    };
  },
  onCodexReminder(callback) {
    const listener = (event, payload) => {
      callback(payload);
    };

    ipcRenderer.on('pet-codex:reminder', listener);

    return () => {
      ipcRenderer.removeListener('pet-codex:reminder', listener);
    };
  }
});
