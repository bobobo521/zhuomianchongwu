import { applyImageAsset, getGameAsset } from '../../assetMap.js';

const arrowSize = {
  width: 46,
  height: 12
};

const physics = {
  baseVelocityX: -760,
  extraVelocityX: -760,
  baseVelocityY: -70,
  extraVelocityY: -35,
  gravity: 560
};

export function createArrowManager({ layer }) {
  const arrows = new Set();

  function shoot(origin, chargeLevel = 0) {
    const charge = Math.max(0, Math.min(chargeLevel, 1));
    const arrow = {
      x: origin.x - 42,
      y: origin.y - 8,
      velocityX: physics.baseVelocityX + physics.extraVelocityX * charge,
      velocityY: physics.baseVelocityY + physics.extraVelocityY * charge,
      width: arrowSize.width,
      height: arrowSize.height,
      element: createArrowElement()
    };

    layer.append(arrow.element);
    setArrowPosition(arrow);
    arrows.add(arrow);

    return arrow;
  }

  function update(delta, bounds) {
    const removedArrows = [];

    arrows.forEach((arrow) => {
      arrow.velocityY += physics.gravity * delta;
      arrow.x += arrow.velocityX * delta;
      arrow.y += arrow.velocityY * delta;

      setArrowPosition(arrow);

      if (isOutOfBounds(arrow, bounds)) {
        remove(arrow);
        removedArrows.push(arrow);
      }
    });

    return removedArrows;
  }

  function remove(arrow) {
    if (!arrows.has(arrow)) {
      return;
    }

    arrow.element.remove();
    arrows.delete(arrow);
  }

  function clear() {
    arrows.forEach((arrow) => arrow.element.remove());
    arrows.clear();
  }

  function getArrows() {
    return Array.from(arrows);
  }

  return {
    shoot,
    update,
    remove,
    clear,
    getArrows
  };
}

function createArrowElement() {
  const element = document.createElement('div');
  element.className = 'game-arrow';
  const image = document.createElement('img');

  image.className = 'game-arrow__image';
  image.alt = '';
  applyImageAsset(image, getGameAsset('arrow'));
  element.append(image);

  return element;
}

function setArrowPosition(arrow) {
  const angle = Math.atan2(arrow.velocityY, arrow.velocityX) + Math.PI;

  arrow.element.style.left = `${arrow.x}px`;
  arrow.element.style.top = `${arrow.y}px`;
  arrow.element.style.rotate = `${angle}rad`;
}

function isOutOfBounds(arrow, bounds) {
  return (
    arrow.x < -arrow.width ||
    arrow.x > bounds.width + arrow.width ||
    arrow.y < -arrow.height ||
    arrow.y > bounds.height + arrow.height
  );
}
