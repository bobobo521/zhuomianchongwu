export function createGameController({ gameRegistry, modeController, gameView }) {
  let activeGame = null;

  modeController.subscribe((mode) => {
    if (mode.name !== 'game') {
      stopActiveGame();
      gameView.setActive(false);
      gameView.clearState();
      return;
    }

    const nextGame = gameRegistry.get(mode.gameId) ?? gameRegistry.getDefault();

    if (!nextGame) {
      modeController.exitGame();
      return;
    }

    if (activeGame?.id === nextGame.id) {
      return;
    }

    stopActiveGame();
    activeGame = nextGame;
    gameView.setActive(true);
    gameView.clearState();
    activeGame.enter();
  });

  function stopActiveGame() {
    if (!activeGame) {
      return;
    }

    activeGame.exit();
    activeGame = null;
  }

  function toggleGame(gameId) {
    const game = gameRegistry.get(gameId) ?? gameRegistry.getDefault();

    if (!game) {
      return modeController.exitGame();
    }

    return modeController.toggleGame(game.id, {
      message: `${game.label}准备中。`
    });
  }

  function getActiveGame() {
    return activeGame;
  }

  function setPetScale(scale) {
    gameRegistry.list().forEach((game) => {
      game.setPetScale?.(scale);
    });
  }

  return {
    toggleGame,
    getActiveGame,
    setPetScale
  };
}
