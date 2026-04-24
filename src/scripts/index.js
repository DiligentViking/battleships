import { Player } from "./models/player.js";
import { Game } from "./models/game.js";
import { View } from "./ui/view.js";
import { Controller } from "./ui/controller.js";
import { Menu } from "./menu.js";

const gameRoot = document.querySelector(".app");

gameRoot.classList.add("game-hidden");

const menu = Menu((mode) => {
  gameRoot.classList.remove("game-hidden");

  if (mode === "ai") {
    console.log("Starting vs AI");
  }

  const player1 = Player("one", "real");
  const player2 = Player("two", "computer", 2);

  const game = Game(player1, player2);
  const view = View(gameRoot);
  const controller = Controller(player1, player2, game, view);

  controller.init();
});

menu.init();
