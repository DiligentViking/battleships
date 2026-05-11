import { DEV } from "./dev.js";
import { Player } from "./models/player.js";
import { Game } from "./models/game.js";
import { View } from "./ui/view.js";
import { Controller } from "./ui/controller.js";
import { Menu } from "./menu.js";
import { SoundSystem } from "./services/sound.js";

let gameRoot = document.querySelector(".app");
let mainMenu = document.getElementById("mainMenu");

const appTemplate = gameRoot.cloneNode(true);
const menuTemplate = mainMenu.cloneNode(true);

const sound = SoundSystem();

gameRoot.classList.add("game-hidden");

if (DEV.enabled && DEV.startAt !== "menu") {
  startGameFromDev();
} else {
  startGameFromMenu();
}

function startGameFromMenu() {
  const menu = Menu(onGameStart, sound);
  menu.init();
}

function startGameFromDev() {
  mainMenu?.remove();

  onGameStart({
    mode: "ai",
    difficulty: DEV.defaultAI,
    devStartAt: DEV.startAt,
    animatedEntry: false,
  });
}

function restartToMenu() {
  sound.stopAll();

  document.querySelectorAll(".endgame-overlay, .final-hit-focus, .return-to-menu-veil")
    .forEach((el) => el.remove());

  const freshApp = appTemplate.cloneNode(true);
  const freshMenu = menuTemplate.cloneNode(true);

  gameRoot.replaceWith(freshApp);

  if (mainMenu?.isConnected) {
    mainMenu.replaceWith(freshMenu);
  } else {
    document.body.insertBefore(freshMenu, freshApp);
  }

  gameRoot = freshApp;
  mainMenu = freshMenu;

  gameRoot.classList.add("game-hidden");

  startGameFromMenu();
}

function onGameStart(config = {}) {
  gameRoot.classList.remove("game-hidden");

  if (config.animatedEntry !== false) {
    gameRoot.classList.add("game-descent-enter");
  }

  const player1 = Player("one", "real");

  const player2 =
    config.mode === "ai"
      ? Player("two", "computer", config.difficulty)
      : Player("two", "real");

  const game = Game(player1, player2);
  const view = View(gameRoot, sound);

  const controller = Controller(
    player1,
    player2,
    game,
    view,
    {
      ...config,
      onReturnToMenu: restartToMenu,
    },
    sound,
  );

  controller.init();

  if (config.animatedEntry === false) return;

  requestAnimationFrame(() => {
    gameRoot.classList.add("game-descent-active");
  });

  setTimeout(() => {
    gameRoot.classList.remove("game-descent-enter");
    gameRoot.classList.remove("game-descent-active");
  }, 1300);
}