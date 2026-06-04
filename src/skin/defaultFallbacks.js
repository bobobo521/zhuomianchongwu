export const skinActionSlots = {
  normal: [
    'idle',
    'talk',
    'happy',
    'thinking',
    'sleep',
    'wake',
    'hover',
    'click',
    'drag',
    'surprised',
    'alert',
    'confirm',
    'error',
    'rest',
    'celebrate'
  ],
  game: [
    'gameEnter',
    'balloonIdle',
    'balloonAim',
    'balloonShoot',
    'balloonHit',
    'balloonMiss',
    'balloonCelebrate',
    'gameExit',
    'arrow',
    'target',
    'targetHit',
    'hitEffect'
  ]
};

export const bubbleSkinSlots = [
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

export const skinUploadSlots = {
  bubble: bubbleSkinSlots,
  ...skinActionSlots
};

export const recommendedSkinSpecs = {
  bubble: {
    label: '对话框：九宫格切片 + 尾巴，透明 PNG 最佳',
    topLeft: { width: 48, height: 48 },
    top: { width: 96, height: 48 },
    topRight: { width: 48, height: 48 },
    left: { width: 48, height: 96 },
    center: { width: 96, height: 96 },
    right: { width: 48, height: 96 },
    bottomLeft: { width: 48, height: 48 },
    bottom: { width: 96, height: 48 },
    bottomRight: { width: 48, height: 48 },
    tail: { width: 64, height: 48 }
  },
  normal: {
    width: 512,
    height: 512,
    label: '普通动作：512 x 512 px，透明背景'
  },
  game: {
    width: 768,
    height: 768,
    label: '小游戏动作：768 x 768 px，透明背景'
  }
};

export const skinActionLabels = {
  bubble: {
    topLeft: '左上角',
    top: '上边',
    topRight: '右上角',
    left: '左边',
    center: '中间',
    right: '右边',
    bottomLeft: '左下角',
    bottom: '下边',
    bottomRight: '右下角',
    tail: '尾巴'
  },
  normal: {
    idle: '待机',
    talk: '说话',
    happy: '开心',
    thinking: '思考',
    sleep: '睡觉',
    wake: '醒来',
    hover: '悬停',
    click: '点击',
    drag: '拖拽',
    surprised: '惊讶',
    alert: '提醒',
    confirm: '确认',
    error: '出错',
    rest: '休息',
    celebrate: '庆祝'
  },
  game: {
    gameEnter: '进入游戏',
    balloonIdle: '热气球待机',
    balloonAim: '瞄准',
    balloonShoot: '射箭',
    balloonHit: '命中',
    balloonMiss: '未命中',
    balloonCelebrate: '庆祝',
    gameExit: '退出游戏',
    arrow: '弓箭',
    target: '目标',
    targetHit: '目标命中',
    hitEffect: '命中特效'
  }
};

export const skinFallbackRules = {
  normal: {
    idle: ['idle'],
    talk: ['idle'],
    happy: ['idle'],
    thinking: ['idle'],
    sleep: ['idle'],
    wake: ['idle'],
    hover: ['idle'],
    click: ['happy', 'idle'],
    drag: ['idle'],
    surprised: ['idle'],
    alert: ['surprised', 'idle'],
    confirm: ['happy', 'idle'],
    error: ['surprised', 'idle'],
    rest: ['sleep', 'idle'],
    celebrate: ['happy', 'confirm', 'idle']
  },
  game: {
    gameEnter: ['balloonIdle'],
    balloonIdle: ['gameEnter'],
    balloonAim: ['balloonIdle', 'gameEnter'],
    balloonShoot: ['balloonAim', 'balloonIdle'],
    balloonHit: ['balloonIdle'],
    balloonMiss: ['balloonIdle'],
    balloonCelebrate: ['balloonHit', 'balloonIdle'],
    gameExit: ['balloonIdle', 'gameEnter'],
    arrow: ['arrow'],
    target: ['target'],
    targetHit: ['target'],
    hitEffect: ['hitEffect']
  }
};

export function getAllSkinSlots() {
  return Object.entries(skinUploadSlots).flatMap(([category, actions]) =>
    actions.map((action) => ({ category, action }))
  );
}
