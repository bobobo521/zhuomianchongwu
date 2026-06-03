export function createWindowDragController({ element, dragApi }) {
  let isDragging = false;
  let startPoint = null;
  let lastPoint = null;
  let longPressTimer = null;
  let longPressTriggered = false;
  let hasDragStarted = false;
  const tapThreshold = 8;
  let longPressDuration = 1000;

  function getPoint(event) {
    return {
      x: Math.round(event.screenX),
      y: Math.round(event.screenY),
      clientX: Math.round(event.clientX),
      clientY: Math.round(event.clientY)
    };
  }

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }

    isDragging = true;
    longPressTriggered = false;
    hasDragStarted = false;
    startPoint = getPoint(event);
    lastPoint = startPoint;
    element.setPointerCapture(event.pointerId);

    if (canDragWindow()) {
      dragApi.dragStart(startPoint);
    }

    longPressTimer = window.setTimeout(() => {
      longPressTriggered = true;
      element.dispatchEvent(new CustomEvent('pet:long-press', {
        bubbles: true,
        detail: startPoint
      }));
    }, longPressDuration);
  });

  element.addEventListener('pointermove', (event) => {
    if (!isDragging) {
      return;
    }

    lastPoint = getPoint(event);

    if (!isTap(startPoint, lastPoint)) {
      clearLongPressTimer();

      if (!hasDragStarted) {
        hasDragStarted = true;
        element.dispatchEvent(new CustomEvent('pet:drag-start', { bubbles: true }));
      }
    }

    if (canDragWindow()) {
      dragApi.dragMove(lastPoint);
      return;
    }

    element.dispatchEvent(new CustomEvent('pet:game-drag', {
      bubbles: true,
      detail: {
        x: lastPoint.clientX,
        y: lastPoint.clientY
      }
    }));
  });

  element.addEventListener('pointerup', (event) => {
    if (!isDragging) {
      return;
    }

    lastPoint = getPoint(event);
    isDragging = false;
    clearLongPressTimer();
    element.releasePointerCapture(event.pointerId);

    if (canDragWindow()) {
      dragApi.dragEnd();
    }

    if (hasDragStarted) {
      element.dispatchEvent(new CustomEvent('pet:drag-end', { bubbles: true }));
    }

    if (longPressTriggered) {
      element.dispatchEvent(new CustomEvent('pet:long-press-end', {
        bubbles: true,
        detail: lastPoint
      }));
    } else if (isTap(startPoint, lastPoint)) {
      element.dispatchEvent(new CustomEvent('pet:tap', { bubbles: true }));
    }

    startPoint = null;
    lastPoint = null;
    longPressTriggered = false;
    hasDragStarted = false;
  });

  element.addEventListener('pointercancel', () => {
    if (!isDragging) {
      return;
    }

    if (longPressTriggered) {
      element.dispatchEvent(new CustomEvent('pet:long-press-cancel', {
        bubbles: true
      }));
    }

    isDragging = false;
    clearLongPressTimer();

    if (canDragWindow()) {
      dragApi.dragEnd();
    }

    if (hasDragStarted) {
      element.dispatchEvent(new CustomEvent('pet:drag-end', { bubbles: true }));
    }

    startPoint = null;
    lastPoint = null;
    longPressTriggered = false;
    hasDragStarted = false;
  });

  function isTap(start, end) {
    if (!start || !end) {
      return false;
    }

    return Math.hypot(end.x - start.x, end.y - start.y) <= tapThreshold;
  }

  function clearLongPressTimer() {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  }

  function canDragWindow() {
    return document.body.dataset.mode !== 'game';
  }

  function setLongPressDuration(duration) {
    const number = Number(duration);

    longPressDuration = Number.isFinite(number) ? number : 1000;
  }

  return {
    setLongPressDuration
  };
}
