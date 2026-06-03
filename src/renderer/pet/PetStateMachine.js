const states = {
  idle: {
    name: 'idle',
    duration: 0
  },
  happy: {
    name: 'happy',
    duration: 1400
  },
  thinking: {
    name: 'thinking',
    duration: 1800
  },
  sleepy: {
    name: 'sleepy',
    duration: 2200
  }
};

const interactionSequence = ['happy', 'thinking', 'sleepy'];

export function createPetStateMachine() {
  let currentState = states.idle;
  let interactionIndex = 0;
  let stateTimer = null;
  let idleSleepTimer = null;
  let idleSleepDelay = 60000;
  const subscribers = new Set();

  function subscribe(callback) {
    subscribers.add(callback);
    callback(currentState);

    return () => {
      subscribers.delete(callback);
    };
  }

  function setState(stateName, options = {}) {
    const nextState = states[stateName] ?? states.idle;

    currentState = nextState;
    notify();
    scheduleIdleReturn(options.duration ?? nextState.duration);
    scheduleIdleSleep();

    return currentState;
  }

  function nextInteractionState() {
    if (currentState.name === 'sleepy') {
      interactionIndex = 0;
      return setState('idle', { duration: 0 });
    }

    const nextStateName = interactionSequence[interactionIndex % interactionSequence.length];
    interactionIndex += 1;

    return setState(nextStateName);
  }

  function getState() {
    return currentState;
  }

  function notify() {
    subscribers.forEach((callback) => callback(currentState));
  }

  function scheduleIdleReturn(duration) {
    window.clearTimeout(stateTimer);

    if (!duration) {
      return;
    }

    stateTimer = window.setTimeout(() => {
      setState('idle', { duration: 0 });
    }, duration);
  }

  function setIdleSleepDelay(duration) {
    const number = Number(duration);

    idleSleepDelay = Number.isFinite(number) ? number : 60000;
    scheduleIdleSleep();
  }

  function wake() {
    if (currentState.name === 'sleepy') {
      setState('idle', { duration: 0 });
    }
  }

  function markActivity() {
    if (currentState.name === 'sleepy') {
      setState('idle', { duration: 0 });
      return;
    }

    if (currentState.name === 'idle') {
      scheduleIdleSleep();
    }
  }

  function scheduleIdleSleep() {
    window.clearTimeout(idleSleepTimer);

    if (currentState.name !== 'idle' || !idleSleepDelay) {
      return;
    }

    idleSleepTimer = window.setTimeout(() => {
      setState('sleepy', { duration: 0 });
    }, idleSleepDelay);
  }

  return {
    subscribe,
    setState,
    nextInteractionState,
    setIdleSleepDelay,
    wake,
    markActivity,
    getState
  };
}
