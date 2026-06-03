const modes = {
  normal: {
    name: 'normal',
    message: '普通模式。',
    gameId: null
  },
  game: {
    name: 'game',
    message: '小游戏模式准备中。',
    gameId: null
  }
};

export function createModeController() {
  let currentMode = modes.normal;
  const subscribers = new Set();

  function subscribe(callback) {
    subscribers.add(callback);
    callback(currentMode);

    return () => {
      subscribers.delete(callback);
    };
  }

  function setMode(modeName, options = {}) {
    const mode = modes[modeName] ?? modes.normal;

    currentMode = {
      ...mode,
      gameId: mode.name === 'game' ? options.gameId ?? mode.gameId : null,
      message: options.message ?? mode.message
    };
    notify();

    return currentMode;
  }

  function enterGame(gameId, options = {}) {
    return setMode('game', {
      ...options,
      gameId
    });
  }

  function exitGame() {
    return setMode('normal');
  }

  function toggleGame(gameId, options = {}) {
    if (currentMode.name === 'game' && currentMode.gameId === gameId) {
      return exitGame();
    }

    return enterGame(gameId, options);
  }

  function toggleMode() {
    return currentMode.name === 'normal' ? enterGame(null) : exitGame();
  }

  function getMode() {
    return currentMode;
  }

  function isGameMode() {
    return currentMode.name === 'game';
  }

  function notify() {
    subscribers.forEach((callback) => callback(currentMode));
  }

  return {
    subscribe,
    setMode,
    enterGame,
    exitGame,
    toggleGame,
    toggleMode,
    getMode,
    isGameMode
  };
}
