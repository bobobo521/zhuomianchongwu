import { createPetView } from './pet/PetView.js';
import { createWindowDragController } from './pet/WindowDragController.js';
import { createPetInteractionController } from './pet/PetInteractionController.js';
import { createPointerPassthroughController } from './pet/PointerPassthroughController.js';
import { createPetStateMachine } from './pet/PetStateMachine.js';
import { createBubbleView } from './bubble/BubbleView.js';
import { createLocalMessageProvider } from './modules/localMessageProvider.js';
import { createInformationModuleRegistry } from './modules/InformationModuleRegistry.js';
import { createWeatherService } from './modules/weatherService.js';
import { createJimengService } from './modules/jimengService.js';
import { createCodexService } from './modules/codexService.js';
import { createCalendarService } from './modules/calendarService.js';
import { createModeController } from './modes/ModeController.js';
import { createContextMenuController } from './modes/ContextMenuController.js';
import { createGameView } from './game/GameView.js';
import { createGameController } from './game/GameController.js';
import { createGameRegistry } from './game/GameRegistry.js';
import { createSettingsStore } from './settings/SettingsStore.js';
import { createSettingsPanel } from './settings/SettingsPanel.js';
import { createBalloonGame } from '../games/balloon-shooter/balloonGame.js';

const app = document.querySelector('#app');
const settingsStore = await createSettingsStore(window.desktopPet);
const petView = createPetView();
const bubbleView = createBubbleView();
const gameView = createGameView();
const petStateMachine = createPetStateMachine();
const modeController = createModeController();
const messageProvider = createLocalMessageProvider();
const weatherService = createWeatherService({ settingsStore });
const codexService = createCodexService({
  settingsStore,
  codexApi: window.desktopPet,
  bubbleView,
  petView
});
const jimengService = createJimengService({
  settingsStore,
  jimengApi: window.desktopPet,
  bubbleView,
  petView
});
const calendarService = createCalendarService({
  settingsStore,
  calendarApi: window.desktopPet,
  bubbleView,
  petView
});
const informationModuleRegistry = createInformationModuleRegistry({
  messageProvider,
  weatherService,
  codexService,
  jimengService,
  calendarService
});
const gameRegistry = createGameRegistry();
const balloonGame = createBalloonGame({
  petView,
  gameView,
  petStateMachine,
  bubbleView
});
gameRegistry.register(balloonGame);
const gameController = createGameController({
  gameRegistry,
  modeController,
  gameView
});
const settingsPanel = createSettingsPanel({
  settingsStore,
  informationModuleRegistry,
  bubbleView,
  petView,
  gameController,
  jimengService,
  panelApi: window.desktopPet
});
const pointerPassthroughController = createPointerPassthroughController({
  petView,
  bubbleView,
  settingsPanel,
  pointerApi: window.desktopPet
});

app.append(bubbleView.element);
app.append(gameView.element);
app.append(petView.element);
app.append(settingsPanel.element);

settingsStore.subscribe((settings) => {
  bubbleView.setDefaultDuration(settings.bubbleDurationMs);
  messageProvider.setSettings(settings);
  petStateMachine.setIdleSleepDelay(settings.idleSleepDelayMs);
  petView.setScale(settings.petScale);
  gameController.setPetScale(settings.petScale);
  window.desktopPet.setPetScale(settings.petScale);
});

petStateMachine.subscribe((state) => {
  petView.setState(state);
});

modeController.subscribe((mode) => {
  document.body.dataset.mode = mode.name;
  window.desktopPet.setWindowMode(mode.name);
  pointerPassthroughController.refresh();
  bubbleView.show(mode.message, {
    duration: 1500,
    anchorElement: petView.element
  });
});

const windowDragController = createWindowDragController({
  element: petView.element,
  dragApi: window.desktopPet
});

settingsStore.subscribe((settings) => {
  windowDragController.setLongPressDuration(settings.longPressDurationMs);
});

createPetInteractionController({
  petView,
  bubbleView,
  messageProvider,
  weatherService,
  petStateMachine,
  modeController,
  settingsStore
});

createContextMenuController({
  rootElement: document,
  menuApi: window.desktopPet,
  bubbleView,
  bubbleAnchorElement: petView.element,
  petView,
  gameController,
  informationModuleRegistry,
  settingsStore,
  settingsPanel
});

jimengService.start();
codexService.start();
calendarService.start();
