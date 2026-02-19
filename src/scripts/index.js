import { Player } from "./models/player.js";
import { View } from "./ui/view.js";
import { Controller } from "./ui/controller.js";

const player1 = Player("real");
const player2 = Player("computer");

const view = View(document.querySelector(".game-area"));

const controller = Controller(player1, player2, view);

controller.init();
