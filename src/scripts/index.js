import { Player } from "./models/player.js";
import { Game } from "./models/game.js";
import { View } from "./ui/view.js";
import { Controller } from "./ui/controller.js";

const player1 = Player("one", "real");
const player2 = Player("two", "computer");

const game = Game(player1, player2);

const view = View(document.querySelector(".game-area"));

const controller = Controller(player1, player2, game, view);

controller.init();
