import { createArrowManager } from './arrow.js';
import { hasArrowHitTarget } from './collision.js';
import { createGameSound } from './sound.js';
import { createTargetManager } from './target.js';

const floatSettings = {
  amplitude: 12,
  duration: 3200
};

const chargeSettings = {
  maxDuration: 1200
};

const petSize = {
  width: 188,
  height: 208
};

const pointerSettings = {
  petPadding: 22
};

const hitMessages = ['命中！', '好球！', '再来一发！', '太准了！'];

export function createBalloonGame({ petView, gameView, petStateMachine, bubbleView }) {
  let isActive = false;
  let animationFrame = null;
  let startedAt = 0;
  let lastFrameTime = 0;
  let petPosition = { x: 0, y: 0 };
  let isCharging = false;
  let chargeStartTime = 0;
  let layoutTimer = null;
  let shouldIgnoreMouse = false;
  let petScale = 1;
  const arrowManager = createArrowManager({ layer: gameView.projectileLayer });
  const sound = createGameSound();
  const targetManager = createTargetManager({ layer: gameView.targetLayer });

  petView.element.addEventListener('pet:game-tap', () => {
    if (!isActive || isCharging) {
      return;
    }

    petView.playAction('game', 'balloonShoot', { duration: 360 });
    arrowManager.shoot(getPetCenter());
    sound.playShoot(0);
  });

  petView.element.addEventListener('pet:game-drag', (event) => {
    if (!isActive || isCharging) {
      return;
    }

    movePetTo(event.detail);
    petView.playAction('game', 'balloonAim', { duration: 220 });
  });

  petView.element.addEventListener('pet:long-press', () => {
    if (!isActive) {
      return;
    }

    isCharging = true;
    chargeStartTime = performance.now();
    petView.setPersistentAction('game', 'balloonAim');
    gameView.setCharging(true);
    gameView.setChargeLevel(0);
    updateChargePosition();
  });

  petView.element.addEventListener('pet:long-press-end', () => {
    if (!isActive || !isCharging) {
      return;
    }

    const chargeLevel = getChargeLevel(performance.now());

    isCharging = false;
    gameView.setCharging(false);
    gameView.setChargeLevel(0);
    petView.setPersistentAction('game', 'balloonIdle');
    petView.playAction('game', 'balloonShoot', { duration: 420 });
    arrowManager.shoot(getPetCenter(), chargeLevel);
    sound.playShoot(chargeLevel);
  });

  petView.element.addEventListener('pet:long-press-cancel', () => {
    if (!isActive || !isCharging) {
      return;
    }

    isCharging = false;
    petView.setPersistentAction('game', 'balloonIdle');
    gameView.setCharging(false);
    gameView.setChargeLevel(0);
  });

  function enterGame() {
    if (isActive) {
      return;
    }

    isActive = true;
    startedAt = performance.now();
    petStateMachine.setState('idle', { duration: 0 });
    petView.setPersistentAction('game', 'balloonIdle');
    petView.playAction('game', 'gameEnter', { duration: 700 });
    gameView.clearState();
    scheduleWorldReset();
    startLoop();
    setMouseIgnore(true);
  }

  function exitGame() {
    if (!isActive) {
      return;
    }

    isActive = false;
    stopLoop();
    window.clearTimeout(layoutTimer);
    layoutTimer = null;
    arrowManager.clear();
    targetManager.clear();
    sound.reset();
    isCharging = false;
    petView.playAction('game', 'gameExit', { duration: 260 });
    gameView.setCharging(false);
    gameView.setChargeLevel(0);
    petView.clearImageSkin();
    petView.resetFloatOffset();
    petView.resetGamePosition();
    gameView.clearState();
    petStateMachine.setState('idle', { duration: 0 });
    setMouseIgnore(false);
  }

  window.addEventListener('resize', () => {
    if (!isActive) {
      return;
    }

    scheduleWorldReset();
  });

  window.addEventListener('mousemove', (event) => {
    if (!isActive || isCharging) {
      return;
    }

    updateMousePassThrough({
      x: event.clientX,
      y: event.clientY
    });
  });

  petView.element.addEventListener('pointerdown', () => {
    if (!isActive) {
      return;
    }

    setMouseIgnore(false);
  });

  petView.element.addEventListener('pointerup', (event) => {
    if (!isActive) {
      return;
    }

    updateMousePassThrough({
      x: event.clientX,
      y: event.clientY
    });
  });

  petView.element.addEventListener('pointercancel', (event) => {
    if (!isActive) {
      return;
    }

    updateMousePassThrough({
      x: event.clientX,
      y: event.clientY
    });
  });

  function startLoop() {
    if (animationFrame) {
      return;
    }

    lastFrameTime = performance.now();
    animationFrame = window.requestAnimationFrame(update);
  }

  function stopLoop() {
    if (!animationFrame) {
      return;
    }

    window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    lastFrameTime = 0;
  }

  function update(timestamp) {
    const delta = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    lastFrameTime = timestamp;
    updateFloat(timestamp);
    updateCharge(timestamp);
    const removedArrows = arrowManager.update(delta, getGameBounds());
    if (removedArrows.length > 0) {
      petView.playAction('game', 'balloonMiss', { duration: 420 });
    }
    targetManager.update(delta, getGameBounds());
    checkCollisions();

    if (isActive) {
      animationFrame = window.requestAnimationFrame(update);
    }
  }

  function updateFloat(timestamp) {
    const progress = (timestamp - startedAt) / floatSettings.duration;
    const easedWave = Math.sin(progress * Math.PI * 2);
    const offset = easedWave * floatSettings.amplitude;

    petView.setFloatOffset(offset);
  }

  function updateCharge(timestamp) {
    if (!isCharging) {
      return;
    }

    gameView.setChargeLevel(getChargeLevel(timestamp));
    updateChargePosition();
  }

  function checkCollisions() {
    const target = targetManager.getTarget();

    if (!target) {
      return;
    }

    const hitArrow = arrowManager.getArrows().find((arrow) => hasArrowHitTarget(arrow, target));

    if (!hitArrow) {
      return;
    }

    arrowManager.remove(hitArrow);
    sound.playHit();
    petView.playAction('game', 'balloonHit', { duration: 520 });
    bubbleView.show(getRandomHitMessage(), {
      duration: 900,
      anchorElement: petView.element
    });
    targetManager.hit(getGameBounds(), () => {
      petView.playAction('game', 'balloonCelebrate', { duration: 560 });
    });
  }

  function scheduleWorldReset() {
    window.clearTimeout(layoutTimer);
    layoutTimer = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      arrowManager.clear();
      targetManager.clear();
      placeInitialPet();
      targetManager.spawn(getGameBounds());
    }, 90);
  }

  function placeInitialPet() {
    const bounds = getGameBounds();
    const currentPetSize = getScaledPetSize();

    petPosition = {
      x: Math.max(currentPetSize.width / 2, bounds.width - 150),
      y: bounds.height * 0.54
    };
    petView.setGamePosition(petPosition);
    setMouseIgnore(true);
  }

  function movePetTo(point) {
    const bounds = getGameBounds();
    const currentPetSize = getScaledPetSize();

    petPosition = {
      x: clamp(point.x, bounds.width * 0.55, bounds.width - currentPetSize.width / 2),
      y: clamp(point.y, currentPetSize.height / 2, bounds.height - currentPetSize.height / 2)
    };
    petView.setGamePosition(petPosition);
    updateChargePosition();
  }

  function updateChargePosition() {
    const currentPetSize = getScaledPetSize();

    gameView.setChargePosition({
      x: petPosition.x,
      y: petPosition.y - currentPetSize.height / 2 - 16
    });
  }

  function getChargeLevel(timestamp) {
    return clamp((timestamp - chargeStartTime) / chargeSettings.maxDuration, 0, 1);
  }

  function updateMousePassThrough(point) {
    setMouseIgnore(!isPointNearPet(point));
  }

  function isPointNearPet(point) {
    const petRect = petView.element.getBoundingClientRect();

    return (
      point.x >= petRect.left - pointerSettings.petPadding &&
      point.x <= petRect.right + pointerSettings.petPadding &&
      point.y >= petRect.top - pointerSettings.petPadding &&
      point.y <= petRect.bottom + pointerSettings.petPadding
    );
  }

  function setMouseIgnore(shouldIgnore) {
    if (shouldIgnoreMouse === shouldIgnore) {
      return;
    }

    shouldIgnoreMouse = shouldIgnore;
    window.desktopPet.setMouseIgnore(shouldIgnore);
  }

  function getGameBounds() {
    return {
      width: gameView.element.clientWidth || window.innerWidth,
      height: gameView.element.clientHeight || window.innerHeight
    };
  }

  function getPetCenter() {
    const petRect = petView.element.getBoundingClientRect();
    const gameRect = gameView.element.getBoundingClientRect();

    return {
      x: petRect.left - gameRect.left + petRect.width / 2,
      y: petRect.top - gameRect.top + petRect.height / 2
    };
  }

  function setPetScale(scale) {
    const nextScale = Number(scale);

    petScale = Number.isFinite(nextScale) ? nextScale : 1;

    if (isActive) {
      movePetTo(petPosition);
    }
  }

  function getScaledPetSize() {
    return {
      width: petSize.width * petScale,
      height: petSize.height * petScale
    };
  }

  return {
    id: 'balloon-shooter',
    label: '热气球射箭',
    enter: enterGame,
    exit: exitGame,
    setPetScale
  };
}

function getRandomHitMessage() {
  return hitMessages[Math.floor(Math.random() * hitMessages.length)];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
