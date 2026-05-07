import { DEV } from "./dev.js";
import { Player } from "./models/player.js";
import { Game } from "./models/game.js";
import { View } from "./ui/view.js";
import { Controller } from "./ui/controller.js";
import { Menu } from "./menu.js";
import { SoundSystem } from "./services/sound.js";

const gameRoot = document.querySelector(".app");
const mainMenu = document.getElementById("mainMenu");

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
    animatedEntry: !DEV.skipGameDescent,
  });
}

function onGameStart(config = {}) {
  gameRoot.classList.remove("game-hidden");

  if (config.animatedEntry !== false) {
    gameRoot.classList.add("game-descent-enter");
  }

  let player2;

  if (config.mode === "ai") {
    player2 = Player("two", "computer", config.difficulty);
  } else {
    player2 = Player("two", "real");
  }

  const player1 = Player("one", "real");

  const game = Game(player1, player2);
  const view = View(gameRoot, sound);
  const controller = Controller(
    player1,
    player2,
    game,
    view,
    {
      ...config,
      onReturnToMenu: () => window.location.reload(),
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
