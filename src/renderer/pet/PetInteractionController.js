export function createPetInteractionController({
  petView,
  bubbleView,
  messageProvider,
  weatherService,
  petStateMachine,
  modeController,
  settingsStore
}) {
  petView.element.addEventListener('pet:tap', async () => {
    if (bubbleView.dismissSticky?.()) {
      return;
    }

    if (modeController.isGameMode()) {
      petView.element.dispatchEvent(new CustomEvent('pet:game-tap', { bubbles: true }));
      return;
    }

    const wasSleepy = petStateMachine.getState().name === 'sleepy';
    const state = petStateMachine.nextInteractionState();

    petView.playAction('normal', wasSleepy ? 'wake' : 'click', { duration: wasSleepy ? 520 : 280 });

    if (weatherService?.shouldHandleClick()) {
      petView.playAction('normal', 'talk', { duration: 700 });
      bubbleView.show('看天气中...', {
        anchorElement: petView.element
      });
    }

    const weatherMessage = await weatherService?.getClickMessage();

    if (weatherMessage) {
      bubbleView.show(weatherMessage, {
        anchorElement: petView.element
      });
      return;
    }

    if (!settingsStore.getSettings().modules.local) {
      return;
    }

    bubbleView.show(messageProvider.getMessage(state.name), {
      anchorElement: petView.element
    });
  });

  petView.element.addEventListener('pet:drag-start', () => {
    if (modeController.isGameMode()) {
      return;
    }

    petStateMachine.markActivity();
    petView.playAction('normal', 'drag', { duration: 260 });
  });

  petView.element.addEventListener('pointerenter', () => {
    if (modeController.isGameMode()) {
      return;
    }

    petStateMachine.markActivity();
    petView.playAction('normal', 'hover', { duration: 360 });
  });
}
