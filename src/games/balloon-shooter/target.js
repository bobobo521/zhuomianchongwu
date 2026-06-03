import { applyImageAsset, getGameAsset } from '../../assetMap.js';

const targetSize = {
  width: 64,
  height: 72
};

export function createTargetManager({ layer }) {
  let target = null;
  let respawnTimer = null;

  function spawn(bounds) {
    clear();

    const minY = Math.max(44, bounds.height * 0.36);
    const maxY = Math.max(minY, bounds.height * 0.68);

    target = {
      id: `target-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      x: 52,
      y: randomBetween(minY, maxY),
      baseY: randomBetween(minY, maxY),
      phase: Math.random() * Math.PI * 2,
      floatRange: 14,
      moveSpeed: 1.5,
      width: targetSize.width,
      height: targetSize.height,
      element: createTargetElement()
    };

    setTargetPosition(target);
    layer.append(target.element);

    return target;
  }

  function update(delta, bounds) {
    if (!target) {
      return;
    }

    target.phase += target.moveSpeed * delta;
    target.y = clamp(
      target.baseY + Math.sin(target.phase) * target.floatRange,
      target.height / 2 + 10,
      bounds.height - target.height / 2 - 10
    );
    setTargetPosition(target);
  }

  function hit(bounds, onRespawn) {
    if (!target) {
      return;
    }

    const hitTarget = target;
    setTargetImage(hitTarget.element, 'targetHit');
    addHitEffect(hitTarget.element);
    hitTarget.element.classList.add('game-target--hit');
    target = null;

    window.clearTimeout(respawnTimer);
    respawnTimer = window.setTimeout(() => {
      hitTarget.element.remove();
      const nextTarget = spawn(bounds);

      if (onRespawn) {
        onRespawn(nextTarget);
      }
    }, 280);
  }

  function getTarget() {
    return target;
  }

  function clear() {
    window.clearTimeout(respawnTimer);
    respawnTimer = null;
    target = null;
    layer.replaceChildren();
  }

  return {
    spawn,
    update,
    hit,
    getTarget,
    clear
  };
}

function createTargetElement() {
  const element = document.createElement('div');
  element.className = 'game-target';
  const image = document.createElement('img');

  image.className = 'game-target__image';
  image.alt = '';
  applyImageAsset(image, getGameAsset('target'));
  element.append(image);

  return element;
}

function setTargetImage(element, assetName) {
  const image = element.querySelector('.game-target__image');

  if (!image) {
    return;
  }

  applyImageAsset(image, getGameAsset(assetName));
}

function addHitEffect(element) {
  const effect = document.createElement('img');

  effect.className = 'game-hit-effect';
  effect.alt = '';
  applyImageAsset(effect, getGameAsset('hitEffect'));
  element.append(effect);
}

function setTargetPosition(target) {
  target.element.style.left = `${target.x}px`;
  target.element.style.top = `${target.y}px`;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
