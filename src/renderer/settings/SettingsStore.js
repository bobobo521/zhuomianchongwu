import { defaultSettings, normalizeSettings } from './defaultSettings.js';

export async function createSettingsStore(settingsApi) {
  let settings = normalizeSettings(defaultSettings);
  const subscribers = new Set();

  try {
    settings = normalizeSettings(await settingsApi.loadSettings());
  } catch {
    settings = normalizeSettings(defaultSettings);
  }

  function subscribe(callback) {
    subscribers.add(callback);
    callback(settings);

    return () => {
      subscribers.delete(callback);
    };
  }

  async function update(nextSettings) {
    settings = normalizeSettings(nextSettings);
    notify();

    try {
      settings = normalizeSettings(await settingsApi.saveSettings(getPersistedSettings(settings)));
      notify();
    } catch {
      notify();
    }

    return settings;
  }

  function getSettings() {
    return settings;
  }

  function notify() {
    subscribers.forEach((callback) => callback(settings));
  }

  return {
    subscribe,
    update,
    getSettings
  };
}

function getPersistedSettings(settings) {
  const { messageStyles, messages, ...persistedSettings } = settings;

  return persistedSettings;
}
