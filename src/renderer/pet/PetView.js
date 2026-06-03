import { applyImageAsset, getPetActionAsset } from '../../assetMap.js';

const stateActionMap = {
  idle: 'idle',
  happy: 'happy',
  thinking: 'thinking',
  sleepy: 'sleep'
};

export function createPetView() {
  const element = document.createElement('button');
  element.className = 'pet pet--idle';
  element.type = 'button';
  element.setAttribute('aria-label', '桌面宠物');

  element.innerHTML = `
    <img class="pet__image" alt="" hidden />
    <span class="pet__ear pet__ear--left"></span>
    <span class="pet__ear pet__ear--right"></span>
    <span class="pet__face">
      <span class="pet__eye pet__eye--left"></span>
      <span class="pet__eye pet__eye--right"></span>
      <span class="pet__mouth"></span>
    </span>
    <span class="pet__body"></span>
    <span class="pet__shadow"></span>
  `;

  const stateClasses = ['pet--idle', 'pet--happy', 'pet--thinking', 'pet--sleepy'];
  const imageElement = element.querySelector('.pet__image');
  let persistentAction = { category: 'normal', action: 'idle' };
  let actionTimer = null;

  function setState(state) {
    element.classList.remove(...stateClasses);
    element.classList.add(`pet--${state.name}`);
    element.dataset.petState = state.name;
    setPersistentAction('normal', stateActionMap[state.name] ?? 'idle');
  }

  function setAction(category, action, options = {}) {
    const asset = getPetActionAsset(category, action);

    imageElement.hidden = false;
    imageElement.alt = `${category}-${action}`;
    applyImageAsset(imageElement, asset);
    element.classList.add('pet--image-skin');
    element.dataset.petAction = action;
    element.dataset.petAssetCategory = category;

    if (options.duration) {
      window.clearTimeout(actionTimer);
      actionTimer = window.setTimeout(() => {
        restorePersistentAction();
      }, options.duration);
    }
  }

  function setPersistentAction(category, action) {
    persistentAction = { category, action };
    window.clearTimeout(actionTimer);
    actionTimer = null;
    setAction(category, action);
  }

  function playAction(category, action, options = {}) {
    setAction(category, action, {
      duration: options.duration ?? 650
    });
  }

  function clearImageSkin() {
    window.clearTimeout(actionTimer);
    actionTimer = null;
    persistentAction = { category: 'normal', action: 'idle' };
    imageElement.hidden = true;
    imageElement.removeAttribute('src');
    imageElement.onerror = null;
    element.classList.remove('pet--image-skin');
  }

  function setFloatOffset(offset) {
    element.style.setProperty('--balloon-float-y', `${offset.toFixed(2)}px`);
  }

  function resetFloatOffset() {
    element.style.removeProperty('--balloon-float-y');
  }

  function setGamePosition(position) {
    element.style.setProperty('--game-pet-x', `${position.x.toFixed(2)}px`);
    element.style.setProperty('--game-pet-y', `${position.y.toFixed(2)}px`);
  }

  function resetGamePosition() {
    element.style.removeProperty('--game-pet-x');
    element.style.removeProperty('--game-pet-y');
  }

  function setScale(scale) {
    const safeScale = Number.isFinite(Number(scale)) ? Number(scale) : 1;

    element.style.setProperty('--pet-scale', `${safeScale}`);
  }

  function restorePersistentAction() {
    actionTimer = null;
    setAction(persistentAction.category, persistentAction.action);
  }

  setPersistentAction('normal', 'idle');

  return {
    element,
    setState,
    setPersistentAction,
    playAction,
    clearImageSkin,
    setFloatOffset,
    resetFloatOffset,
    setGamePosition,
    resetGamePosition,
    setScale
  };
}
