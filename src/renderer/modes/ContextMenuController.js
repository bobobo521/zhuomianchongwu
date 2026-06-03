const commandModuleMap = {
  'show-local-message': 'local',
  'show-weather': 'weather',
  'show-codex-status': 'codex',
  'show-jimeng-status': 'jimeng'
};

export function createContextMenuController({
  rootElement,
  menuApi,
  bubbleView,
  bubbleAnchorElement,
  petView,
  gameController,
  informationModuleRegistry,
  settingsStore,
  settingsPanel
}) {
  rootElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    menuApi.showContextMenu({
      x: Math.round(event.clientX),
      y: Math.round(event.clientY)
    });
  });

  menuApi.onMenuCommand(async ({ command }) => {
    if (command === 'open-settings') {
      settingsPanel.open();
      return;
    }

    if (command === 'toggle-game-mode' || command === 'toggle-balloon-shooter') {
      gameController.toggleGame('balloon-shooter');
      return;
    }

    const moduleName = commandModuleMap[command];

    if (!moduleName) {
      return;
    }

    if (!settingsStore.getSettings().modules[moduleName]) {
      bubbleView.show('这个模块已在设置里关闭。', {
        anchorElement: bubbleAnchorElement
      });
      return;
    }

    const message = await informationModuleRegistry.getMessage(moduleName);
    petView?.playAction('normal', 'talk', { duration: 700 });
    bubbleView.show(message, {
      duration: 2600,
      anchorElement: bubbleAnchorElement
    });
  });
}
