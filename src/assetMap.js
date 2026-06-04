const assetPaths = {
  normal: {
    idle: './assets/pet-idle.png',
    talk: './assets/pet-talk.png',
    happy: './assets/pet-happy.png',
    thinking: './assets/pet-thinking.png',
    sleep: './assets/pet-sleep.png',
    wake: './assets/pet-wake.png',
    hover: './assets/pet-hover.png',
    click: './assets/pet-click.png',
    drag: './assets/pet-drag.png',
    surprised: './assets/pet-surprised.png',
    alert: './assets/pet-alert.png',
    confirm: './assets/pet-confirm.png',
    error: './assets/pet-error.png',
    rest: './assets/pet-rest.png',
    celebrate: './assets/pet-celebrate.png'
  },
  game: {
    gameEnter: './assets/game-enter.png',
    balloonIdle: './assets/game-balloon-idle.png',
    balloonAim: './assets/game-balloon-aim.png',
    balloonShoot: './assets/game-balloon-shoot.png',
    balloonHit: './assets/game-balloon-hit.png',
    balloonMiss: './assets/game-balloon-miss.png',
    balloonCelebrate: './assets/game-balloon-celebrate.png',
    gameExit: './assets/game-exit.png',
    arrow: './assets/game-arrow.png',
    target: './assets/game-target.png',
    targetHit: './assets/game-target-hit.png',
    hitEffect: './assets/game-hit-effect.png'
  }
};

const fallbackText = {
  idle: 'IDLE',
  talk: 'TALK',
  happy: 'HAPPY',
  thinking: 'THINK',
  sleep: 'SLEEP',
  wake: 'WAKE',
  hover: 'HOVER',
  click: 'CLICK',
  drag: 'DRAG',
  surprised: '!',
  alert: 'ALERT',
  confirm: 'OK',
  error: 'ERR',
  rest: 'REST',
  celebrate: 'YEAH',
  gameEnter: 'ENTER',
  balloonIdle: 'BALLOON',
  balloonAim: 'AIM',
  balloonShoot: 'SHOOT',
  balloonHit: 'HIT',
  balloonMiss: 'MISS',
  balloonCelebrate: 'YEAH',
  gameExit: 'EXIT',
  arrow: 'ARROW',
  target: 'TARGET',
  targetHit: 'HIT',
  hitEffect: 'POW'
};

export const assetMap = {
  normal: buildCategory(assetPaths.normal),
  game: buildCategory(assetPaths.game)
};

export function getPetActionAsset(categoryName, actionName) {
  const category = assetMap[categoryName] ?? assetMap.normal;
  const action = category[actionName] ?? assetMap.normal.idle;

  return {
    ...action,
    fallbackSrc: action.fallbackSrc || assetMap.normal.idle.fallbackSrc
  };
}

export function getGameAsset(assetName) {
  return getPetActionAsset('game', assetName);
}

export function applyImageAsset(imageElement, asset, options = {}) {
  const fallbackSrc = asset.fallbackSrc || assetMap.normal.idle.fallbackSrc;

  imageElement.onerror = () => {
    imageElement.onerror = null;
    imageElement.src = options.defaultFallbackSrc || fallbackSrc;
  };
  imageElement.src = asset.src;
}

function buildCategory(paths) {
  return Object.fromEntries(
    Object.entries(paths).map(([name, path]) => [
      name,
      {
        name,
        path,
        src: new URL(path, import.meta.url).href,
        fallbackSrc: createFallbackSvg(name)
      }
    ])
  );
}

function createFallbackSvg(name) {
  if (name === 'arrow') {
    return encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 12">
        <path d="M3 6h34" stroke="#3a2d27" stroke-width="3" stroke-linecap="round"/>
        <path d="M37 1l8 5-8 5z" fill="#ef6f66" stroke="#3a2d27" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M2 1l9 5-9 5 3-5z" fill="#4fb3a7" stroke="#3a2d27" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
    `);
  }

  if (name === 'target' || name === 'targetHit') {
    const color = name === 'targetHit' ? '#ef6f66' : '#2f9d73';

    return encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72">
        <rect x="8" y="4" width="48" height="58" rx="12" fill="${color}" stroke="#3a2d27" stroke-width="5"/>
        <circle cx="32" cy="33" r="19" fill="#fff4cf"/>
        <circle cx="32" cy="33" r="8" fill="#ef6f66"/>
        <path d="M32 62v9" stroke="#3a2d27" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `);
  }

  if (name === 'hitEffect') {
    return encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 92">
        <path d="M46 4l9 25 25-12-12 25 20 13-27 4 5 28-20-19-20 19 5-28-27-4 20-13-12-25 25 12z" fill="#ffd166" stroke="#3a2d27" stroke-width="5" stroke-linejoin="round"/>
      </svg>
    `);
  }

  const label = fallbackText[name] ?? name.toUpperCase();
  const isGame = name.startsWith('balloon') || name.startsWith('game');
  const accent = isGame ? '#4fb3a7' : '#f5b45d';
  const secondary = isGame ? '#ffd166' : '#ffe4b8';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188 208">
      <defs>
        <linearGradient id="body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${secondary}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <ellipse cx="94" cy="196" rx="50" ry="8" fill="rgba(0,0,0,0.18)"/>
      <circle cx="64" cy="58" r="26" fill="${accent}" stroke="#3a2d27" stroke-width="6"/>
      <circle cx="124" cy="58" r="26" fill="${accent}" stroke="#3a2d27" stroke-width="6"/>
      <rect x="36" y="50" width="116" height="128" rx="50" fill="url(#body)" stroke="#3a2d27" stroke-width="6"/>
      <circle cx="74" cy="104" r="7" fill="#3a2d27"/>
      <circle cx="114" cy="104" r="7" fill="#3a2d27"/>
      <path d="M76 130q18 16 36 0" fill="none" stroke="#3a2d27" stroke-width="6" stroke-linecap="round"/>
      <rect x="42" y="156" width="104" height="28" rx="14" fill="rgba(255,250,235,0.92)" stroke="#3a2d27" stroke-width="5"/>
      <text x="94" y="176" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#3a2d27">${label}</text>
    </svg>
  `;

  return encodeSvg(svg);
}

function encodeSvg(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
