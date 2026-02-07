import { ComputerStrategy } from "./computer-strategy.js";
import { Player } from "./player.js";
import { View } from "./view.js";
import { Controller } from "./controller.js";

const player1 = Player("real");
const player2 = Player(ComputerStrategy);

const view = View(document.querySelector(".game-area"));

const controller = Controller(player1, player2, view);

controller.init();
