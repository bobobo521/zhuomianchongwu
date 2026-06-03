import { defaultSettings } from '../settings/defaultSettings.js';

let currentSettings = defaultSettings;

export function createLocalMessageProvider() {
  const recentMessages = new Map();

  function setSettings(nextSettings = defaultSettings) {
    currentSettings = {
      ...defaultSettings,
      ...nextSettings,
      customMessages: {
        ...defaultSettings.customMessages,
        ...(nextSettings.customMessages ?? nextSettings.messages ?? {})
      }
    };
  }

  return {
    setSettings,
    getMessage(topic = 'fallback') {
      const styleMessages =
        currentSettings.messageStyles?.[currentSettings.languageStyle] ??
        defaultSettings.messageStyles[defaultSettings.languageStyle];
      const stylePool = styleMessages[topic] ?? styleMessages.fallback;
      const customPool = currentSettings.customMessages?.[topic] ?? [];
      const pool = [...stylePool, ...customPool];
      const recentPool = recentMessages.get(topic) ?? [];
      const availablePool = pool.filter((message) => !recentPool.includes(message));
      const candidatePool = availablePool.length > 0 ? availablePool : pool;
      const index = Math.floor(Math.random() * candidatePool.length);
      const message = candidatePool[index];

      recentMessages.set(topic, [message, ...recentPool].slice(0, 4));

      return message;
    }
  };
}
