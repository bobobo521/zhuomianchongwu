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
  checkJimengStatus(statusUrl) {
    return ipcRenderer.invoke('pet-jimeng:check', statusUrl);
  },
  openJimengPage(statusUrl) {
    return ipcRenderer.invoke('pet-jimeng:open-page', statusUrl);
  },
  getCalendarEvents(options) {
    return ipcRenderer.invoke('pet-calendar:events', options);
  },
  notifyJimengSuccess(message) {
    return ipcRenderer.invoke('pet-notification:jimeng-success', message);
  },
  notifyCalendarEvent(payload) {
    return ipcRenderer.invoke('pet-notification:calendar-event', payload);
  },
  checkCodexStatus(settings) {
    return ipcRenderer.invoke('pet-codex:check', settings);
  },
  onMenuCommand(callback) {
    const listener = (event, payload) => {
      callback(payload);
    };

    ipcRenderer.on('pet-menu:command', listener);

    return () => {
      ipcRenderer.removeListener('pet-menu:command', listener);
    };
  }
});
