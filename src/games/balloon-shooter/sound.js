export function createGameSound() {
  let audioContext = null;

  function playHit() {
    playTone({ frequency: 660, duration: 0.08, type: 'square' });
    window.setTimeout(() => {
      playTone({ frequency: 880, duration: 0.08, type: 'square' });
    }, 70);
  }

  function playShoot(chargeLevel = 0) {
    playTone({
      frequency: 260 + chargeLevel * 180,
      duration: 0.05,
      type: 'triangle'
    });
  }

  function reset() {
    if (!audioContext) {
      return;
    }

    audioContext.close();
    audioContext = null;
  }

  function playTone({ frequency, duration, type }) {
    const context = getAudioContext();

    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  function getAudioContext() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      return null;
    }

    if (!audioContext) {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextConstructor();
    }

    return audioContext;
  }

  return {
    playHit,
    playShoot,
    reset
  };
}
