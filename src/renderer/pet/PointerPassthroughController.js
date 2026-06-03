export function createPointerPassthroughController({
  petView,
  bubbleView,
  settingsPanel,
  pointerApi
}) {
  let isIgnoring = false;

  window.addEventListener('mousemove', (event) => {
    updatePointerMode(event.clientX, event.clientY);
  });

  window.addEventListener('mouseleave', () => {
    setMouseIgnore(true);
  });

  window.addEventListener('blur', () => {
    setMouseIgnore(true);
  });

  window.requestAnimationFrame(() => {
    setMouseIgnore(true);
  });

  function updatePointerMode(x, y) {
    if (document.body.dataset.settingsOpen === 'true') {
      setMouseIgnore(false);
      return;
    }

    setMouseIgnore(!isInteractivePoint(x, y));
  }

  function isInteractivePoint(x, y) {
    return (
      isPointInPetImage(x, y) ||
      isVisibleBubblePoint(x, y)
    );
  }

  function isVisibleBubblePoint(x, y) {
    if (!bubbleView.element.classList.contains('bubble--visible')) {
      return false;
    }

    return isPointInElement(x, y, bubbleView.element, 0);
  }

  function isPointInPetImage(x, y) {
    const rect = petView.element.getBoundingClientRect();
    const shrinkX = rect.width * 0.17;
    const shrinkTop = rect.height * 0.12;
    const shrinkBottom = rect.height * 0.18;

    return (
      x >= rect.left + shrinkX &&
      x <= rect.right - shrinkX &&
      y >= rect.top + shrinkTop &&
      y <= rect.bottom - shrinkBottom
    );
  }

  function isPointInElement(x, y, element, padding) {
    const rect = element.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }

    return (
      x >= rect.left - padding &&
      x <= rect.right + padding &&
      y >= rect.top - padding &&
      y <= rect.bottom + padding
    );
  }

  function setMouseIgnore(shouldIgnore) {
    if (isIgnoring === shouldIgnore) {
      return;
    }

    isIgnoring = shouldIgnore;
    pointerApi.setMouseIgnore(shouldIgnore);
  }

  return {
    refresh() {
      setMouseIgnore(true);
    },
    disable() {
      setMouseIgnore(false);
    }
  };
}
