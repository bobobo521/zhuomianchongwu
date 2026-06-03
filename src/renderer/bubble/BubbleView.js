export function createBubbleView() {
  const element = document.createElement('section');
  element.className = 'bubble';
  element.setAttribute('aria-live', 'polite');

  let hideTimer = null;
  let showFrame = null;
  let anchorElement = null;
  let anchorFrame = null;
  let defaultDuration = 3000;
  let isSticky = false;

  element.addEventListener('click', () => {
    if (isSticky) {
      hide();
    }
  });

  function setDefaultDuration(duration) {
    const number = Number(duration);

    defaultDuration = Number.isFinite(number) ? number : 3000;
  }

  function show(message, options = {}) {
    const duration = options.duration ?? defaultDuration;

    window.cancelAnimationFrame(showFrame);
    element.classList.remove('bubble--visible');
    element.classList.toggle('bubble--sticky', Boolean(options.sticky));
    element.textContent = message;
    isSticky = Boolean(options.sticky);
    if (options.anchorElement) {
      anchorElement = options.anchorElement;
    }

    showFrame = window.requestAnimationFrame(() => {
      if (anchorElement) {
        setAnchor(anchorElement);
        startAnchorTracking();
      }
      element.classList.add('bubble--visible');
    });

    window.clearTimeout(hideTimer);
    hideTimer = null;

    if (!isSticky && duration > 0) {
      hideTimer = window.setTimeout(hide, duration);
    }
  }

  function hide() {
    window.cancelAnimationFrame(showFrame);
    window.clearTimeout(hideTimer);
    hideTimer = null;
    isSticky = false;
    element.classList.remove('bubble--visible');
    element.classList.remove('bubble--sticky');
    stopAnchorTracking();
  }

  function dismissSticky() {
    if (!isSticky || !element.classList.contains('bubble--visible')) {
      return false;
    }

    hide();

    return true;
  }

  function startAnchorTracking() {
    if (anchorFrame) {
      return;
    }

    updateAnchor();
  }

  function stopAnchorTracking() {
    if (!anchorFrame) {
      return;
    }

    window.cancelAnimationFrame(anchorFrame);
    anchorFrame = null;
    anchorElement = null;
  }

  function updateAnchor() {
    if (!anchorElement || !element.classList.contains('bubble--visible')) {
      anchorFrame = null;
      return;
    }

    setAnchor(anchorElement);
    anchorFrame = window.requestAnimationFrame(updateAnchor);
  }

  function setAnchor(currentAnchorElement) {
    const anchorRect = currentAnchorElement.getBoundingClientRect();
    const parentRect = element.offsetParent?.getBoundingClientRect() ?? {
      left: 0,
      top: 0
    };
    const x = anchorRect.left - parentRect.left + anchorRect.width / 2;
    const y = anchorRect.top - parentRect.top - 8;
    const bubbleHeight = element.offsetHeight || 54;

    element.style.left = `${x}px`;
    element.style.top = `${Math.max(bubbleHeight + 18, y)}px`;
  }

  return {
    element,
    setDefaultDuration,
    show,
    hide,
    dismissSticky
  };
}
