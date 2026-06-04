export function createBubbleView() {
  const element = document.createElement('section');
  element.className = 'bubble';
  element.setAttribute('aria-live', 'polite');
  element.innerHTML = `
    <span class="bubble__skin" data-bubble-skin-layer hidden>
      <img class="bubble__piece bubble__piece--top-left" alt="" data-bubble-skin-piece="topLeft" />
      <img class="bubble__piece bubble__piece--top" alt="" data-bubble-skin-piece="top" />
      <img class="bubble__piece bubble__piece--top-right" alt="" data-bubble-skin-piece="topRight" />
      <img class="bubble__piece bubble__piece--left" alt="" data-bubble-skin-piece="left" />
      <img class="bubble__piece bubble__piece--center" alt="" data-bubble-skin-piece="center" />
      <img class="bubble__piece bubble__piece--right" alt="" data-bubble-skin-piece="right" />
      <img class="bubble__piece bubble__piece--bottom-left" alt="" data-bubble-skin-piece="bottomLeft" />
      <img class="bubble__piece bubble__piece--bottom" alt="" data-bubble-skin-piece="bottom" />
      <img class="bubble__piece bubble__piece--bottom-right" alt="" data-bubble-skin-piece="bottomRight" />
      <img class="bubble__piece bubble__piece--tail" alt="" data-bubble-skin-piece="tail" />
    </span>
    <span class="bubble__content" data-bubble-content></span>
  `;

  let hideTimer = null;
  let showFrame = null;
  let anchorElement = null;
  let anchorFrame = null;
  let defaultDuration = 3000;
  let isSticky = false;
  let skinEffectTimer = null;
  const contentElement = element.querySelector('[data-bubble-content]');
  const skinLayerElement = element.querySelector('[data-bubble-skin-layer]');
  const skinPieceElements = Object.fromEntries(
    Array.from(element.querySelectorAll('[data-bubble-skin-piece]')).map((piece) => [
      piece.dataset.bubbleSkinPiece,
      piece
    ])
  );

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
    const bubbleTypes = ['normal', 'success', 'warning', 'error', 'skin'];
    const nextType = bubbleTypes.includes(options.type) ? options.type : 'normal';

    window.cancelAnimationFrame(showFrame);
    element.classList.remove('bubble--visible');
    bubbleTypes.forEach((type) => {
      element.classList.toggle(`bubble--${type}`, type === nextType && type !== 'normal');
    });
    element.classList.toggle('bubble--sticky', Boolean(options.sticky));
    contentElement.textContent = message;
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
    element.classList.remove('bubble--success', 'bubble--warning', 'bubble--error', 'bubble--skin');
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

  function setSkin(skin = {}) {
    const tone = getBubbleSkinTone(skin);

    Object.entries(tone).forEach(([name, value]) => {
      element.style.setProperty(name, value);
    });
    applyBubbleImageSkin(element, skinLayerElement, skinPieceElements, skin);
  }

  function showSkinChange(skin = {}, options = {}) {
    setSkin(skin);
    show(`对话框已换成「${skin.name || '新皮肤'}」`, {
      type: 'skin',
      duration: options.duration ?? 1600,
      anchorElement: options.anchorElement
    });

    window.requestAnimationFrame(playSkinEffect);
  }

  function playSkinEffect() {
    window.clearTimeout(skinEffectTimer);
    element.classList.remove('bubble--skin-changing');
    void element.offsetWidth;
    element.classList.add('bubble--skin-changing');
    skinEffectTimer = window.setTimeout(() => {
      element.classList.remove('bubble--skin-changing');
    }, 760);
  }

  return {
    element,
    setDefaultDuration,
    setSkin,
    show,
    showSkinChange,
    hide,
    dismissSticky
  };
}

export function applyBubbleImageSkin(rootElement, skinLayerElement, skinPieceElements, skin = {}) {
  const bubbleAssets = skin?.assets?.bubble ?? {};
  const hasCompleteBubbleSkin = bubbleSkinPieceNames.every((name) => Boolean(bubbleAssets[name]?.src));

  rootElement.classList.toggle('bubble--image-skin', hasCompleteBubbleSkin);

  if (!skinLayerElement) {
    return;
  }

  skinLayerElement.hidden = !hasCompleteBubbleSkin;

  if (!hasCompleteBubbleSkin) {
    return;
  }

  bubbleSkinPieceNames.forEach((name) => {
    const image = skinPieceElements[name];
    const asset = bubbleAssets[name];

    if (!image || !asset?.src) {
      return;
    }

    image.onerror = () => {
      rootElement.classList.remove('bubble--image-skin');
      skinLayerElement.hidden = true;
    };
    image.src = asset.src;
  });
}

export const bubbleSkinPieceNames = [
  'topLeft',
  'top',
  'topRight',
  'left',
  'center',
  'right',
  'bottomLeft',
  'bottom',
  'bottomRight',
  'tail'
];

export function getBubbleSkinTone(skin = {}) {
  if (!skin || skin.builtIn || skin.id === 'default') {
    return {
      '--bubble-bg': 'rgba(255, 250, 235, 0.96)',
      '--bubble-accent-bg': 'rgba(255, 236, 187, 0.98)',
      '--bubble-line': 'var(--pet-line)',
      '--bubble-glint': 'rgba(255, 255, 255, 0.86)'
    };
  }

  const hue = hashToHue(`${skin.id || ''}:${skin.name || ''}`);

  return {
    '--bubble-bg': `hsl(${hue} 82% 95% / 0.97)`,
    '--bubble-accent-bg': `hsl(${(hue + 28) % 360} 84% 90% / 0.98)`,
    '--bubble-line': `hsl(${hue} 36% 24%)`,
    '--bubble-glint': `hsl(${(hue + 72) % 360} 100% 96% / 0.86)`
  };
}

function hashToHue(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 360;
  }

  return hash;
}
