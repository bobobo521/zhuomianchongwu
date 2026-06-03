export function createGameView() {
  const element = document.createElement('section');
  element.className = 'game-scene';
  element.setAttribute('aria-hidden', 'true');

  const targetLayer = document.createElement('div');
  targetLayer.className = 'game-targets';
  targetLayer.setAttribute('aria-hidden', 'true');

  const projectileLayer = document.createElement('div');
  projectileLayer.className = 'game-projectiles';
  projectileLayer.setAttribute('aria-hidden', 'true');

  const chargeElement = document.createElement('div');
  chargeElement.className = 'game-charge';
  chargeElement.setAttribute('aria-hidden', 'true');
  chargeElement.innerHTML = '<span class="game-charge__fill"></span>';

  const chargeFillElement = chargeElement.querySelector('.game-charge__fill');

  element.append(targetLayer, projectileLayer, chargeElement);

  function setActive(isActive) {
    element.classList.toggle('game-scene--active', isActive);
  }

  function clearState() {
    targetLayer.replaceChildren();
    projectileLayer.replaceChildren();
    setCharging(false);
    setChargeLevel(0);
  }

  function setCharging(isCharging) {
    chargeElement.classList.toggle('game-charge--visible', isCharging);
  }

  function setChargeLevel(level) {
    const safeLevel = Math.max(0, Math.min(level, 1));

    chargeFillElement.style.transform = `scaleX(${safeLevel})`;
  }

  function setChargePosition(position) {
    chargeElement.style.left = `${position.x}px`;
    chargeElement.style.top = `${position.y}px`;
  }

  return {
    element,
    targetLayer,
    projectileLayer,
    setActive,
    clearState,
    setCharging,
    setChargeLevel,
    setChargePosition
  };
}
