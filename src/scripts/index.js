import { Player } from "./models/player.js";
import { Game } from "./models/game.js";
import { View } from "./ui/view.js";
import { Controller } from "./ui/controller.js";
import { Menu } from "./menu.js";
import { SoundSystem } from "./services/sound.js";

const gameRoot = document.querySelector(".app");
const sound = SoundSystem();
const menu = Menu(onGameStart, sound);

gameRoot.classList.add("game-hidden");

menu.init();

function onGameStart(config) {
  gameRoot.classList.remove("game-hidden");

  let player2;

  if (config.mode === "ai") {
    const difficulty = config.difficulty;
    player2 = Player("two", "computer", difficulty);
  } else {
    player2 = Player("two", "real");
  }

  const player1 = Player("one", "real");

  const game = Game(player1, player2);
  const view = View(gameRoot, sound);
  const controller = Controller(player1, player2, game, view);

  controller.init();
}
