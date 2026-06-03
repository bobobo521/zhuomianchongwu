export function createGameRegistry() {
  const games = new Map();

  function register(game) {
    if (!game?.id) {
      throw new Error('Game must provide an id.');
    }

    games.set(game.id, game);

    return game;
  }

  function get(gameId) {
    return games.get(gameId) ?? null;
  }

  function getDefault() {
    return games.values().next().value ?? null;
  }

  function list() {
    return Array.from(games.values());
  }

  return {
    register,
    get,
    getDefault,
    list
  };
}
