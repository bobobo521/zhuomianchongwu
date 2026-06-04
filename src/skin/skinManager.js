import { getPetActionAsset } from '../assetMap.js';
import { skinFallbackRules } from './defaultFallbacks.js';
import { validateSkinCatalog } from './skinValidator.js';

export async function createSkinManager({ skinApi, initialSkinId = 'default' }) {
  let skins = [];
  let currentSkinId = initialSkinId || 'default';
  const subscribers = new Set();

  await refreshSkins(currentSkinId);

  async function refreshSkins(nextSkinId = currentSkinId) {
    const catalog = await skinApi.listSkins();

    skins = validateSkinCatalog(catalog.skins ?? []);
    currentSkinId = skins.some((skin) => skin.id === nextSkinId)
      ? nextSkinId
      : catalog.currentSkinId || 'default';

    notify();

    return getState();
  }

  function subscribe(callback) {
    subscribers.add(callback);
    callback(getState());

    return () => {
      subscribers.delete(callback);
    };
  }

  function getState() {
    return {
      skins,
      currentSkinId,
      currentSkin: getCurrentSkin()
    };
  }

  function getCurrentSkin() {
    return skins.find((skin) => skin.id === currentSkinId) ?? skins[0] ?? null;
  }

  async function createSkin(name) {
    const skin = await skinApi.createSkin(name);

    return refreshSkins(skin.id);
  }

  async function switchSkin(skinId) {
    currentSkinId = skinId;
    await skinApi.setCurrentSkin(skinId);

    return refreshSkins(skinId);
  }

  async function uploadActionImage({ skinId = currentSkinId, category, action, filePath }) {
    await skinApi.uploadSkinImage({
      skinId,
      category,
      action,
      filePath
    });

    return refreshSkins(skinId);
  }

  async function deleteSkin(skinId = currentSkinId) {
    await skinApi.deleteSkin(skinId);

    return refreshSkins('default');
  }

  function getActionAsset(category, action) {
    const skin = getCurrentSkin();
    const skinAsset = resolveSkinAsset(skin, category, action);

    if (skinAsset) {
      return skinAsset;
    }

    return getPetActionAsset(category, action);
  }

  function notify() {
    subscribers.forEach((callback) => callback(getState()));
  }

  return {
    subscribe,
    refreshSkins,
    createSkin,
    switchSkin,
    deleteSkin,
    uploadActionImage,
    getActionAsset,
    getState
  };
}

function resolveSkinAsset(skin, category, action, visited = new Set()) {
  if (!skin) {
    return null;
  }

  const key = `${category}:${action}`;

  if (visited.has(key)) {
    return null;
  }

  visited.add(key);

  const directAsset = skin.assets?.[category]?.[action];

  if (directAsset?.src) {
    const defaultAsset = getPetActionAsset(category, action);

    return {
      ...directAsset,
      name: action,
      skinId: skin.id,
      fallbackSrc: defaultAsset.fallbackSrc
    };
  }

  const fallbackActions = skinFallbackRules[category]?.[action] ?? [];

  for (const fallbackAction of fallbackActions) {
    const fallbackAsset = resolveSkinAsset(skin, category, fallbackAction, visited);

    if (fallbackAsset) {
      return fallbackAsset;
    }
  }

  return null;
}
