import { getAllSkinSlots } from './defaultFallbacks.js';

export function validateSkin(skin) {
  const missing = [];

  getAllSkinSlots().forEach(({ category, action }) => {
    if (!skin?.assets?.[category]?.[action]?.src) {
      missing.push({ category, action });
    }
  });

  return {
    isComplete: missing.length === 0,
    missing
  };
}

export function validateSkinCatalog(skins = []) {
  return skins.map((skin) => ({
    ...skin,
    validation: validateSkin(skin)
  }));
}
